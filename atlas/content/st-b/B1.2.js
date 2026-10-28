// Conservation laws in differential form: an integral balance on any interval
// shrinks to ρ_t + q_x = 0; a constitutive law for the flux q then closes it —
// q = cρ gives transport, q = −Dρ_x gives diffusion (Fick, Fourier).
import { lesson, mcq, num, match, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, MATERIALS, LI900, SRC } from './_pde.js';

const t = String.raw;
const minutes = (L) => (L * L) / LI900.alpha / 60;

export default lesson({
  id: 'st-b.B1.2',
  title: 'Conservation laws in differential form',
  minutes: 12, difficulty: 2,
  intro: t`Most PDEs of physics are **bookkeeping**. Take any stretch $a < x < b$ of a pipe, a road or a heat-shield tile. The amount of stuff inside, $\int_a^b \rho\,dx$, changes only because of what flows in at $a$ and out at $b$: $\frac{d}{dt}\int_a^b\rho\,dx = q(a, t) - q(b, t) = -\int_a^b q_x\,dx$. That holds for **every** interval, so the integrands must agree at every point:

$$\rho_t + q_x = 0$$

This conservation law has two unknowns, so it needs a second, physical statement — a **constitutive law** saying what the flux is. Stuff carried by a flow at speed $c$ has $q = c\rho$: the result is transport, $\rho_t + c\rho_x = 0$. Stuff that seeps from crowded to sparse regions has $q = -D\rho_x$ (Fick’s law; Fourier’s law for heat): the result is diffusion, $\rho_t = D\rho_{xx}$.`,
  symbols: [
    { tex: t`\rho(x, t)`, text: 'a density: amount per unit length (cars per km, kg per m, joules per m)' },
    { tex: t`q(x, t)`, text: 'the flux: amount crossing the point $x$ per second, positive toward $+x$' },
    { tex: t`\rho_t`, text: 'how fast the density at a point grows (amount per metre per second)' },
    { tex: t`q_x`, text: 'how fast the flux grows along $x$: positive means more leaves a small piece than enters it' },
    { tex: t`c,\ D`, text: 'a carrying speed (m/s) and a diffusivity (m²/s), the constants of the two constitutive laws' },
  ],
  why: t`Every field equation from fluids to electromagnetism has this skeleton, and in relativity $\nabla_\mu T^{\mu\nu} = 0$ is the same bookkeeping for energy and momentum in curved spacetime.`,
  visual: {
    type: 'pde-player',
    title: 'Flux in, flux out',
    lead: t`The teal arrows along the bottom are the flux $q$ at that moment — to scale with one another. Where neighbouring arrows **shrink in the direction they point** (flux converging), the density rises; where they grow, it falls. Watch a square pulse under both laws.`,
    tasks: [
      'Heat (q = −D uₓ): the arrows point away from the pulse, biggest at its edges — the corners lose fastest and round off at once.',
      'Transport (q = c u): the flux is the profile itself, carried along; it converges at the front edge and diverges at the back, so the pulse moves.',
      'Raise D and play again: the arrows grow and the pulse spreads faster.',
    ],
    params: { mode: 'heat', modes: ['heat', 'transport'], profile: 'box', w: 1.5, D: 0.5, c: 1, flux: true, tmax: 4, x: [-8, 8], t: 0.4 },
    caption: t`Exact solutions on an infinite line; arrow lengths are scaled to the largest flux in the window at each moment, so compare them with each other, not between moments.`,
  },
  example: {
    prompt: t`Heat soaks into a Shuttle-type silica tile (LI-900: density $\rho = ${LI900.rho}\ \text{kg/m}^3$, specific heat $c_p = ${LI900.c}\ \text{J/(kg K)}$, conductivity $k = ${LI900.k}\ \text{W/(m K)}$). Derive the equation for the temperature $T(x, t)$ through its thickness, and estimate how long heat takes to cross a 5.0 cm tile.`,
    visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.05], aspect: 'wide', xlabel: 'depth into the tile (cm)', ylabel: 'temperature rise (fraction)', curves: [300, 1200, 4750].map((s, i) => ({ fn: `1 - erf(x/100/sqrt(4*${LI900.alpha}*${s}))`, color: ['accent', 'violet', 'teal'][i], label: `${s} s`, labelAt: [0.6, 1.4, 2.6][i], labelDx: 8, labelDy: -4 })),
      vlines: [{ x: 5, label: 'bond line', color: 'gold' }] }, caption: t`Temperature rise through a tile whose hot face is held at a fixed temperature, at three times (constant properties, as if the tile were very thick). By $t = L^2/\alpha \approx 4750$ s the far face has felt about a fifth of the rise.` },
    steps: [
      { label: 'Energy in a slice', text: t`Per square metre of tile, the slice $a < x < b$ holds thermal energy $\int_a^b \rho c_p T\,dx$ (relative to a reference temperature).` },
      { label: 'Balance', text: t`It changes only by the heat flux $q$ (W/m²) through its faces: $\frac{d}{dt}\int_a^b \rho c_p T\,dx = q(a) - q(b) = -\int_a^b q_x\,dx$.` },
      { label: 'Every slice', text: t`Since $\int_a^b (\rho c_p T_t + q_x)\,dx = 0$ for every $a$ and $b$, the continuous integrand is zero: $\rho c_p T_t + q_x = 0$.` },
      { label: 'Fourier', text: t`Heat flows downhill in temperature: $q = -k\,T_x$. Substituting, $\rho c_p T_t = k\,T_{xx}$, so $T_t = \alpha\,T_{xx}$ with $\alpha = \dfrac{k}{\rho c_p}$.` },
      { label: 'Numbers', text: t`$\alpha = \dfrac{${LI900.k}}{(${LI900.rho})(${LI900.c})} = ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$ — about 140 times smaller than aluminium’s.` },
      { label: 'Time scale', text: t`$\alpha$ has units m²/s, so the only time a slab of thickness $L$ offers is $L^2/\alpha = \dfrac{(0.050)^2}{${tex(LI900.alpha)}} \approx ${tex(0.0025 / LI900.alpha)}$ s, about ${Math.round(minutes(0.05))} minutes. The hottest part of an entry lasts roughly 15–20 minutes, so the structure behind the tile barely warms before it is over — the point of the design.` },
      { label: 'Honesty', text: t`The tile’s conductivity rises severalfold at 1000 °C and more, so the real soak is faster than this room-temperature estimate; designers integrate the equation with $k(T)$.` },
    ],
    answer: t`$T_t = \alpha T_{xx}$ with $\alpha = k/(\rho c_p) \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$; crossing a 5 cm tile takes of order $L^2/\alpha \approx ${Math.round(minutes(0.05))}$ minutes.`,
  },
  practice: [
    mcq({
      id: 'where-rises', difficulty: 1,
      prompt: t`The graph shows the flux $q(x)$ of a gas along a pipe at one instant (positive toward $+x$). At which marked point is the density rising fastest?`,
      visual: { type: 'graph', params: { x: [0, 6.6], y: [0, 3.4], aspect: 'wide', xlabel: 'x (m)', ylabel: 'q', curves: [{ fn: '2 + sin(x)', color: 'teal', width: 2.4 }],
        points: [{ x: Math.PI / 2, y: 3, label: 'P' }, { x: Math.PI, y: 2, label: 'Q' }, { x: 1.5 * Math.PI, y: 1, label: 'R' }, { x: 2 * Math.PI, y: 2, label: 'S' }] },
        caption: 'The flux along the pipe at one instant: positive everywhere, so the gas flows toward +x throughout.' },
      choices: ['at Q, where q falls most steeply', 'at P, where the flux is largest', 'at R, where the flux is smallest', 'at S, where q rises most steeply'],
      answer: 0,
      why: {
        1: t`A large flux passes stuff through; only a **difference** between inflow and outflow changes the density. At P, $q_x = 0$.`,
        2: t`At R, $q_x = 0$ too: as much leaves each small piece as enters it.`,
        3: t`Rising $q$ means more leaves than enters: $\rho_t = -q_x < 0$ there — the density falls fastest at S.`,
      },
      hints: [t`$\rho_t = -q_x$. Where is $q_x$ most negative?`],
      teach: 'Density rises where the flux decreases along the flow — where it converges.',
      explain: t`$\rho_t = -q_x$, largest where $q$ falls most steeply: at Q, where $q_x = \cos\pi = -1$. More gas arrives from the left than leaves to the right.`,
    }),
    num({
      id: 'traffic-box', difficulty: 2,
      gen(r) {
        const Qa = r.pick([1600, 1800, 2000]), Qb = r.pick([1200, 1400, 1500]), L = r.pick([1.5, 2, 2.5]);
        const rate = (Qa - Qb) / L;
        return {
          prompt: t`On a ${L} km stretch of a one-lane road, ${Qa} cars per hour enter at the upstream end and ${Qb} per hour leave at the downstream end. At what rate is the average density of cars on the stretch increasing, in cars per km per hour?`,
          visual: { type: 'graph', params: { x: [-0.8, L + 0.8], y: [0, 1], aspect: 'wide', xlabel: 'x (km)', ylabel: '', yticks: 0,
            shade: [{ fn: '0.7', lower: '0.3', from: 0, to: L, color: 'accent', alpha: 0.15 }],
            vlines: [{ x: 0, color: 'ink3' }, { x: L, color: 'ink3' }],
            arrows: [{ from: [-0.7, 0.5], to: [-0.05, 0.5], color: 'teal', width: 3, label: `${Qa}/h in`, labelDx: -40, labelDy: -14 }, { from: [L + 0.05, 0.5], to: [L + 0.7, 0.5], color: 'teal', width: 2.2, label: `${Qb}/h out`, labelDx: -40, labelDy: -14 }] },
            caption: 'The stretch as a box: cars counted in at one end and out at the other. Nothing enters or leaves in between.' },
          answer: rate, tol: { rel: 0.005 },
          errors: [{ value: Qa - Qb, feedback: t`That is the rate of change of the **number** of cars. Divide by the length to get the density.` }, { value: -rate, feedback: 'More cars enter than leave, so the density grows.' }],
          hints: [t`The number of cars $N$ on the stretch changes at $dN/dt = q_{\text{in}} - q_{\text{out}}$.`, t`The average density is $N/L$, so it changes at $(q_{\text{in}} - q_{\text{out}})/L$.`],
          teach: 'Integral balance: the amount in a box changes at inflow minus outflow.',
          explain: t`$\dfrac{d}{dt}\left(\dfrac{N}{L}\right) = \dfrac{${Qa} - ${Qb}}{${L}} = ${tex(rate)}$ cars per km per hour. Shrinking the box to a point gives $\rho_t + q_x = 0$.`,
        };
      },
    }),
    match({
      id: 'closures', difficulty: 2,
      prompt: t`Put each constitutive law into $\rho_t + q_x = 0$. Which PDE results? ($c$, $D$, $v_{\max}$ and $\rho_{\max}$ are constants.)`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.9, 1.25], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [
        { fn: 'e^(-x^2)', color: 'accent', width: 2.4, label: 'ρ', labelAt: -1.1, labelDx: -16 },
        { fn: '0.8*e^(-x^2)', color: 'violet', dash: [5, 4], label: 'q = cρ', labelAt: -0.5, labelDx: -78, labelDy: 6 },
        { fn: '2*0.8*x*e^(-x^2)', color: 'teal', dash: [3, 3], label: 'q = −Dρₓ', labelAt: 1.6, labelDx: 12, labelDy: -2 },
      ] }, caption: t`One density profile and the flux each simple law gives it ($c = 0.8$, $D = 0.8$): carried flux has the profile’s own shape; diffusive flux points away from the peak, toward $+x$ on the right and $-x$ on the left.` },
      left: [t`$q = c\rho$`, t`$q = -D\rho_x$`, t`$q = c\rho - D\rho_x$`, t`$q = v_{\max}\,\rho\,(1 - \rho/\rho_{\max})$`],
      right: ['ρₜ + c ρₓ = 0 (transport)', 'ρₜ = D ρₓₓ (diffusion)', 'ρₜ + c ρₓ = D ρₓₓ (advection–diffusion)', 'ρₜ + v(1 − 2ρ/ρmax) ρₓ = 0 (nonlinear traffic)', 'ρₜₜ = c² ρₓₓ (waves)'],
      answer: [0, 1, 2, 3],
      hints: [t`Differentiate each flux with respect to $x$, using the chain rule where $q$ depends on $\rho$.`, t`For traffic, $q_x = q'(\rho)\,\rho_x$ with $q'(\rho) = v_{\max}(1 - 2\rho/\rho_{\max})$.`],
      teach: 'The conservation law is always the same; the constitutive law decides which PDE you get.',
      explain: t`$q_x$ is $c\rho_x$, $-D\rho_{xx}$, $c\rho_x - D\rho_{xx}$ and $v_{\max}(1 - 2\rho/\rho_{\max})\rho_x$ in turn. None gives a wave equation: that needs a second time derivative, which comes from momentum (Newton), not from a flux law alone. The traffic law is nonlinear — its information speed depends on $\rho$ (module B11).`,
    }),
    mcq({
      id: 'fourier-sign', difficulty: 1,
      prompt: t`Why does Fourier’s law carry a minus sign, $q = -k\,T_x$?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [250, 420], aspect: 'wide', xlabel: 'x (cm)', ylabel: 'T (K)', curves: [{ fn: '400 - 12*x', color: 'warn', width: 2.4, label: 'T(x)', labelAt: 2, labelDy: -12 }],
        arrows: [{ from: [3.5, 290], to: [7.5, 290], color: 'teal', width: 3, label: 'heat flows', labelDx: -60, labelDy: 16 }] },
        caption: 'A temperature that falls toward +x, and the direction heat actually flows.' },
      choices: ['Heat flows from hot to cold, opposite to the direction in which T increases', 'Conductivities of insulators are negative', 'To make the units come out in watts per square metre', 'By convention, fluxes are counted positive toward −x'],
      answer: 0,
      why: {
        1: t`$k$ is always positive; the second law of thermodynamics would fail otherwise.`,
        2: t`Units come from $k$ (W/(m K)) times $T_x$ (K/m); the sign does not affect them.`,
        3: t`In this course a flux is positive toward $+x$; here $T_x < 0$, and $q = -kT_x > 0$ correctly points toward $+x$.`,
      },
      hints: [t`In the picture $T_x < 0$. Which way does heat flow?`],
      teach: 'Diffusive fluxes run down the gradient, hence the minus sign.',
      explain: t`Here $T_x = -12$ K/cm and heat flows toward $+x$, so $q > 0$: the flux must be $-k\,T_x$. The same sign makes Fick’s law push material from crowded to sparse.`,
    }),
    num({
      id: 'tank-wall', difficulty: 2,
      gen(r) {
        const m = r.pick(MATERIALS.filter((x) => x.short !== 'copper')), Lmm = r.pick([2, 3, 4, 6]);
        const L = Lmm / 1000, time = (L * L) / m.alpha;
        return {
          prompt: t`A cryogenic propellant tank has a ${Lmm} mm wall of ${m.name} ($\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$ at room temperature). When liquid nitrogen first wets the inside, estimate the time scale $L^2/\alpha$ for the cold to diffuse through the wall, in seconds.`,
          visual: { type: 'graph', params: { x: [-0.7, 1.3], y: [-3, 3.5], xlog: true, ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'wall thickness (mm)', ylabel: 'L²/α (s)', curves: MATERIALS.map((q, i) => ({ fn: `2*x - 6 - log10(${q.alpha})`, color: ['accent', 'warn', 'teal', 'violet'][i], width: q === m ? 3 : 1.4, label: q.short, labelAt: [1.0, -0.45, 0.45, 0.15][i], labelDy: [14, -10, 14, -10][i] })) },
            caption: t`Diffusion time against thickness on log scales: every material gives a line of slope 2, because the time grows as $L^2$. Room-temperature properties (Incropera, Table A.1).` },
          answer: time, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Lmm * Lmm / m.alpha, feedback: 'Convert millimetres to metres before squaring: α is in m²/s.' }, { value: L / m.alpha, feedback: t`The time scale is $L^2/\alpha$ — the thickness squared.` }],
          hints: [t`$\alpha$ is in m²/s, so put $L$ in metres: $L = ${tex(L)}$ m.`, t`$t \sim L^2/\alpha = (${tex(L)})^2/${tex(m.alpha)}$.`],
          teach: 'A diffusion time grows as the square of the distance: t ~ L²/α.',
          explain: t`$L^2/\alpha = (${tex(L)}\ \text{m})^2 / ${tex(m.alpha)}\ \text{m}^2/\text{s} \approx ${tex(time)}$ s. The wall equilibrates through its thickness ${time < 1 ? 'almost at once' : 'within seconds'}; the chill-down of a tank takes minutes because of how slowly heat leaves through the boiling liquid and along the tank. At cryogenic temperatures the specific heat of metals drops steeply, so $\alpha$ rises and the real time is shorter still.`,
        };
      },
    }),
    order({
      id: 'derive-order', difficulty: 2,
      prompt: t`Put the steps of the derivation of $\rho_t + q_x = 0$ in order.`,
      items: [
        t`The amount in $a < x < b$ is $\int_a^b \rho\,dx$.`,
        t`It changes at the rate inflow minus outflow: $q(a, t) - q(b, t)$.`,
        t`By the fundamental theorem of calculus, $q(a, t) - q(b, t) = -\int_a^b q_x\,dx$.`,
        t`So $\int_a^b (\rho_t + q_x)\,dx = 0$ for every interval.`,
        t`A continuous function whose integral over every interval is zero is zero: $\rho_t + q_x = 0$.`,
      ],
      hints: ['Start from the amount in a box, end with a statement at a single point.', 'The step that turns a boundary difference into an integral comes just before combining the two integrals.'],
      teach: 'A balance that holds on every interval becomes a PDE that holds at every point.',
      explain: 'Amount, balance, turn the boundary terms into an integral, combine, then shrink: the integral form is the physics; the PDE is its pointwise version, valid where ρ and q are smooth. Where they jump (shocks, module B11) only the integral form survives.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tile', difficulty: 2, transfer: true,
      gen(r) {
        const [Lcm, inch] = r.pick([[2.5, 1], [3.8, 1.5], [5.1, 2], [7.6, 3]]);
        const L = Lcm / 100, mins = minutes(L);
        return {
          prompt: t`Shuttle tiles were about 2.5 to 12.7 cm thick. For a ${Lcm} cm (${inch} inch) LI-900 tile ($\alpha \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$), estimate the diffusion time scale $L^2/\alpha$ in minutes.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.05], aspect: 'wide', xlabel: 'depth (cm)', ylabel: 'temperature rise (fraction)',
            curves: [600, 1200].map((s, i) => ({ fn: `1 - erf(x/100/sqrt(4*${LI900.alpha}*${s}))`, color: ['accent', 'violet'][i], label: `${s / 60} min`, labelAt: [0.9, 1.9][i], labelDx: 8, labelDy: -4 })),
            vlines: [{ x: Lcm, label: 'this tile', color: 'gold' }] }, caption: t`Temperature rise through a thick LI-900 slab whose face is suddenly held hot, after 10 and 20 minutes (constant room-temperature properties — the hot tile conducts better than this).` },
          answer: mins, units: 'min', tol: { rel: 0.02 },
          errors: [{ value: mins * 60, feedback: 'That is in seconds; convert to minutes.' }, { value: (Lcm * Lcm) / LI900.alpha / 60, feedback: 'Put the thickness in metres before squaring.' }],
          hints: [t`$t \sim L^2/\alpha$ with $L$ in metres.`, t`$(${tex(L)})^2 / ${tex(LI900.alpha)}$ s, then divide by 60.`],
          teach: 'Diffusion time scale: L²/α.',
          explain: t`$L^2/\alpha = (${tex(L)})^2/${tex(LI900.alpha)} \approx ${tex(mins * 60)}$ s $\approx ${tex(mins)}$ min. ${mins > 20 ? 'Longer than the peak-heating phase of an entry: the bond line stays cool while it matters.' : 'Comparable to the peak-heating phase, so a tile this thin is used only where heating is mild.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-source', difficulty: 2,
      prompt: t`A wire carries current, generating heat at $s$ watts per cubic metre throughout. How does the energy balance $\rho c_p T_t + q_x = 0$ change?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.3], aspect: 'wide', xlabel: 'x (across the wire, mm)', ylabel: 'T (scaled)', curves: [{ fn: '1 - 0.08*x^2', color: 'warn', width: 2.4, domain: [-2.5, 2.5] }],
        arrows: [{ from: [0.6, 0.55], to: [2.2, 0.55], color: 'teal', width: 2 }, { from: [-0.6, 0.55], to: [-2.2, 0.55], color: 'teal', width: 2 }], points: [{ x: 0, y: 0.35, label: 'heat made here', r: 0, color: 'gold', labelDx: -46 }] },
        caption: 'Heat generated inside the wire flows outward, down the temperature gradient. Scales are illustrative.' },
      choices: [t`$\rho c_p T_t + q_x = s$`, t`$\rho c_p T_t + q_x = -s$`, t`$\rho c_p T_t - q_x = s$`, t`$\rho c_p T_t + q_x = s\,T$`],
      answer: 0,
      why: {
        1: t`A source adds energy: it must raise $T$, so it appears with a plus sign on the side opposite $T_t$.`,
        2: t`The flux term keeps its sign: $\rho c_p T_t = -q_x + s$.`,
        3: t`The source is a fixed heating rate per volume, independent of $T$; $sT$ would not even have the right units.`,
      },
      hints: [t`Redo the balance on $a < x < b$: the energy changes by inflow minus outflow **plus** what is made inside, $\int_a^b s\,dx$.`],
      teach: t`Sources add to the rate of change: $\rho_t + q_x = s$.`,
      explain: t`$\frac{d}{dt}\int_a^b \rho c_p T\,dx = q(a) - q(b) + \int_a^b s\,dx$, so $\rho c_p T_t + q_x = s$. With Fourier’s law, $\rho c_p T_t = kT_{xx} + s$ — an inhomogeneous heat equation (module B0’s term for a source).`,
    }),
    mcq({
      id: 'cp-curvature', difficulty: 3,
      prompt: t`A vapour spreads by Fick’s law, $q = -D\rho_x$, so $\rho_t = D\rho_{xx}$. At which marked point of its profile is the density **increasing**?`,
      visual: { type: 'graph', params: { x: [-3.5, 3.5], y: [-0.08, 1.2], aspect: 'wide', xlabel: 'x (m)', ylabel: 'ρ', curves: [{ fn: 'e^(-x^2)', color: 'accent', width: 2.4 }],
        points: [{ x: 0, y: 1, label: 'P' }, { x: Math.SQRT1_2, y: Math.exp(-0.5), label: 'Q' }, { x: 1.6, y: Math.exp(-2.56), label: 'R' }] },
        caption: 'The density profile of the vapour at one instant.' },
      choices: ['R, in the foot, where the profile curves upward', 'P, at the peak, where the most vapour is', 'Q, where the slope is steepest', 'none of them: diffusion only moves vapour, so it never raises the density'],
      answer: 0,
      why: {
        1: t`At the peak the profile curves downward, $\rho_{xx} < 0$: it is losing vapour to both sides.`,
        2: t`At the inflection point $\rho_{xx} = 0$: inflow and outflow balance, so the density there is momentarily steady.`,
        3: 'Moving vapour from the peak to the tails is exactly what raises the density in the tails.',
      },
      hints: [t`$\rho_t = D\rho_{xx}$: the sign of the curvature decides.`, t`Concave up ($\rho_{xx} > 0$) means the neighbours average higher than the point itself.`],
      teach: t`Diffusion raises a point that lies below the average of its neighbours: $\rho_t$ has the sign of $\rho_{xx}$.`,
      explain: t`$\rho_t = D\rho_{xx}$. For $e^{-x^2}$, $\rho_{xx} = (4x^2 - 2)e^{-x^2}$: negative at P, zero at Q ($x = 1/\sqrt2$), positive at R. The tails fill as the peak drains.`,
    }),
  ],
  sources: [SRC.strauss, SRC.incropera, SRC.tpsx],
});
