// Noether's theorem (Taylor §7.8 and problems; Goldstein §2.7, §13.7): every
// continuous symmetry of the Lagrangian brings a conserved quantity. If L is
// unchanged to first order by q → q + εK(q), then Q = Σ (∂L/∂q̇ᵢ) Kᵢ is
// constant: translation → momentum, rotation → angular momentum (derived in
// Cartesian coordinates), screw symmetry → a mix. Time translation (∂L/∂t = 0)
// conserves the energy function h = Σ q̇ᵢ ∂L/∂q̇ᵢ − L, which equals T + U only
// for fixed constraints: on the spinning hoop h is conserved and E is not —
// the motor's work ΔE = mR²ω²Δ(sin²θ). L and L + dF/dt give the same motion.
// Explore: cm2-noether, each broken symmetry spoiling exactly its own charge.
// Transfer: Killing symmetries in GR — a static black hole conserves E and L;
// an expanding universe does not conserve a photon's energy (redshift).
import { lesson, mcq, multi, num, expr, match } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';
import { hoopPic } from './_cm2.js';

const t = String.raw;
const DEG = Math.PI / 180;

const noe = (params, caption) => ({ type: 'cm2-noether', params: { sliders: [], play: false, readout: false, ...params }, caption });

const EX = (() => {
  // the spinning hoop: m = 50 g, R = 0.2 m, ω = 10 rad/s; released (relative to the hoop) just off the bottom
  const m = 0.05, R = 0.2, w = 10, c0 = G / (R * w * w), s2 = 1 - c0 * c0;
  const W = m * R * R * w * w * s2;                                   // motor's work by the time the bead reaches θ₀
  const thd = Math.sqrt(2 * (G / R) * (c0 - 1) + w * w * s2);       // from h: ½R²θ̇² − ½R²ω²sin²θ − gR cos θ = −gR
  return { m, R, w, th0: Math.acos(c0) / DEG, W, thd };
})();

export default lesson({
  id: 'phys3550.M4.5',
  title: 'Noether’s theorem: symmetry and conservation',
  minutes: 18, difficulty: 4,
  intro: t`Why is momentum conserved? Because the laws of physics are the same here as over there. Emmy Noether proved in 1918 that **every continuous symmetry of the Lagrangian brings a conserved quantity**. If shifting the coordinates by a small amount $\epsilon K_i(q)$ leaves $L$ unchanged, then the combination $Q$ below never changes. A cyclic coordinate ([M4.4](#/lesson/phys3550.M4.4)) is the simplest case — the symmetry is shifting that coordinate — but Noether's theorem works in any coordinates. Shifting in space gives momentum; rotating gives angular momentum; shifting the clock (when $L$ has no explicit $t$) gives the **energy function** $h$, which is the energy $T + U$ only when the constraints are fixed. Break a symmetry and its quantity stops being conserved — but only that one.`,
  equation: t`L(q + \epsilon K,\ \dot q + \epsilon\dot K) = L \;\Longrightarrow\; Q = \sum_i\frac{\partial L}{\partial\dot q_i}K_i = \text{const};\qquad \frac{\partial L}{\partial t} = 0 \;\Longrightarrow\; h = \sum_i\dot q_i\frac{\partial L}{\partial\dot q_i} - L = \text{const}`,
  symbols: [
    { tex: '\\epsilon', text: 'a small number: the size of the symmetry transformation' },
    { tex: 'K_i(q)', text: 'how much each coordinate moves per unit $\\epsilon$ (for a shift along $x$, $K_x = 1$; for a rotation by $\\epsilon$, $K_x = -y$ and $K_y = x$)' },
    { tex: 'Q', text: 'the **Noether charge**, the conserved quantity: a momentum, an angular momentum or a mixture, in their own units' },
    { tex: '\\partial L/\\partial\\dot q_i', text: 'the generalized momenta $p_i$' },
    { tex: 'h', text: 'the energy function (J), conserved when $L$ has no explicit $t$; equal to $T + U$ if the constraints do not move' },
  ],
  why: t`Noether's theorem is how physics finds its conservation laws: in field theory a symmetry gives a conserved current, charge conservation comes from a phase symmetry, and in general relativity a spacetime symmetry (a Killing vector) gives the conserved energy and angular momentum of an orbit — while an expanding universe, lacking time symmetry, does not conserve a photon's energy.`,
  visual: {
    type: 'cm2-noether',
    title: 'A symmetry and its conserved quantity, side by side',
    lead: t`Top: a puck moving over the contours of its potential. Bottom: candidate conserved quantities, each as a fraction of its starting value. Pick a symmetry and break it with $\varepsilon$; press Play to watch it happen.`,
    tasks: [
      t`**Rotation**, $\varepsilon = 0$: circular contours, and $L$ and $E$ both flat. Raise $\varepsilon$: the contours become ellipses and $L$ wanders — but $E$ stays flat, because time symmetry is untouched.`,
      t`**Translation**: a straight valley conserves $p_x$. Tilt it ($\varepsilon > 0$): $p_x$ falls in a straight line (a steady force), $E$ still flat.`,
      t`**Time**: a bowl that breathes, $U \propto 1 + \varepsilon\sin 2t$. Now $E$ is pumped up and down, while $L$ stays perfectly flat — the bowl is still round.`,
    ],
    params: { kind: 'rotation', kinds: true, eps: 0.15, sliders: ['eps'] },
    caption: t`A 1 kg point puck, no friction, integrated numerically (RK4). Rotation: $U = \tfrac12(x^2 + (1 + \varepsilon)y^2)$; translation: $U = \tfrac12y^2 + \varepsilon(x + 3)$; time: $U = \tfrac12(1 + \varepsilon\sin 2t)(x^2 + y^2)$ — in J, with $x, y$ in m.`,
  },
  example: {
    prompt: t`(a) Use Noether's theorem in Cartesian coordinates to find the quantity conserved by a particle in a potential $U(\sqrt{x^2 + y^2})$. (b) A ${EX.m * 1000} g bead on a hoop of radius ${EX.R} m spun at ${EX.w} rad/s is released just off the bottom. Its $L$ has no explicit $t$; find the conserved $h$, and the work the motor has done by the time the bead passes $\theta_0 = ${sci(EX.th0, 3)}^\circ$.`,
    visual: noe({ kind: 'rotation', eps: 0, panels: ['plane', 'Q'] }, t`(a) A round potential: angular momentum (blue) and energy (gold) both stay at their starting values.`),
    steps: [
      { label: 'Symmetry', text: t`Rotate by a small angle $\epsilon$: $x \to x - \epsilon y$, $y \to y + \epsilon x$, so $K_x = -y$, $K_y = x$. Then $x^2 + y^2$ is unchanged to first order, and so is $\dot x^2 + \dot y^2$: $L = \tfrac12m(\dot x^2 + \dot y^2) - U$ is symmetric.` },
      { label: 'Charge', text: t`$Q = p_xK_x + p_yK_y = m\dot x(-y) + m\dot y(x) = m(x\dot y - y\dot x) = L_z$: the angular momentum, found with no polar coordinates and no cyclic variable in sight.` },
      { label: 'Why it works', text: t`Along a true motion, $\frac{dQ}{dt} = \sum\big(\dot p_iK_i + p_i\dot K_i\big) = \sum\Big(\frac{\partial L}{\partial q_i}K_i + \frac{\partial L}{\partial\dot q_i}\dot K_i\Big)$ by Lagrange's equations — and that is exactly the first-order change of $L$ under the symmetry, which is zero.` },
      { label: 'Hoop: h', text: t`$L = \tfrac12mR^2(\dot\theta^2 + \omega^2\sin^2\theta) + mgR\cos\theta$, so $h = \dot\theta\,\partial L/\partial\dot\theta - L = \tfrac12mR^2\dot\theta^2 - \tfrac12mR^2\omega^2\sin^2\theta - mgR\cos\theta$. Not $T + U$: the spin term has the wrong sign. ($h$ is [M4.3](#/lesson/phys3550.M4.3)'s $\tfrac12mR^2\dot\theta^2 + U_{\text{eff}}$, up to a constant.)` },
      { label: 'Energy is not h', text: t`$E = T + U = h + mR^2\omega^2\sin^2\theta$. With $h$ fixed, $E$ grows as the bead climbs outward: the motor, pushing the bead round, does work $\Delta E = mR^2\omega^2\,\Delta(\sin^2\theta)$.` },
      { label: 'Numbers', text: t`From $\sin^2\theta \approx 0$ to $\sin^2\theta_0 = ${sci(1 - (G / (EX.R * EX.w * EX.w)) ** 2, 3)}$: $W = ${EX.m}\times${EX.R}^2\times${EX.w}^2\times${sci(1 - (G / (EX.R * EX.w * EX.w)) ** 2, 3)} = ${sci(EX.W, 3)}$ J. And $h$ conservation gives the bead's speed round the hoop there: $\dot\theta = ${sci(EX.thd, 3)}$ rad/s.` },
    ],
    answer: t`(a) Rotational symmetry gives $Q = m(x\dot y - y\dot x) = L_z$. (b) $h = \tfrac12mR^2\dot\theta^2 - \tfrac12mR^2\omega^2\sin^2\theta - mgR\cos\theta$ is conserved; $E$ is not — the motor has done $${sci(EX.W, 3)}$ J by $\theta_0$.`,
  },
  practice: [
    match({
      id: 'pairs', difficulty: 2,
      prompt: t`Match each symmetry of a Lagrangian with the quantity it conserves.`,
      visual: noe({ kind: 'translation', eps: 0, panels: ['plane'] }, t`A straight valley: sliding everything along $x$ changes nothing.`),
      left: [t`$L$ unchanged when every $x_\alpha \to x_\alpha + \epsilon$`, t`$L$ unchanged by a rotation about the $z$-axis`, t`$L$ has no explicit dependence on $t$`, t`$L$ unchanged by $\phi \to \phi + \epsilon$, $z \to z + \epsilon/k$ together`],
      right: ['total momentum along x', 'angular momentum about z', 'the energy function h', 'angular momentum about z plus (momentum along z) ÷ k', 'kinetic energy', 'nothing'],
      answer: [0, 1, 2, 3],
      hints: [t`Use $Q = \sum p_iK_i$: what is $K$ for each transformation? For time, use $h = \sum\dot q_ip_i - L$.`, t`For the screw: $K_\phi = 1$ and $K_z = 1/k$, so $Q = p_\phi + p_z/k$.`],
      teach: t`Each continuous symmetry has its own charge $Q = \sum p_iK_i$: shift → momentum, rotation → angular momentum, time → energy function.`,
      explain: t`Translations give $\sum p_x$, rotations $L_z$, time translation $h$. A screw symmetry (like a particle in a twisted, helical potential) conserves neither $L_z$ nor $p_z$ alone, but the combination $L_z + p_z/k$. Kinetic energy alone is not the charge of any symmetry here.`,
    }),
    num({
      id: 'hoop-work', difficulty: 3,
      gen(r) {
        const m = r.pick([0.02, 0.05, 0.1]), R = r.pick([0.15, 0.2, 0.25]), f = r.pick([1.4, 1.8, 2.5]);
        const w = Math.round(f * Math.sqrt(G / R) * 10) / 10, c = G / (R * w * w), W = m * R * R * w * w * (1 - c * c);
        return {
          prompt: t`A ${m * 1000} g bead sits just off the bottom of a hoop of radius ${R} m spinning at ${w} rad/s (faster than $\sqrt{g/R}$, so the bottom is unstable). It slides out toward its off-axis equilibrium, $\cos\theta_0 = g/(R\omega^2)$. Using the conserved $h$, how much work has the motor done on the bead when it passes $\theta_0$?`,
          answer: W * 1000, units: 'mJ', tol: { rel: 0.005 },
          errors: distinct([{ value: 0, feedback: t`The hoop's push is perpendicular to the hoop, but the hoop moves: the push has a component along the bead's velocity. $E = h + mR^2\omega^2\sin^2\theta$ grows.` }, { value: 0.5 * W * 1000, feedback: t`$E - h = mR^2\omega^2\sin^2\theta$, with no $\tfrac12$: the spin term enters $T$ with $+\tfrac12$ and $h$ with $-\tfrac12$.` }], W * 1000),
          hints: [t`$h = \tfrac12mR^2\dot\theta^2 - \tfrac12mR^2\omega^2\sin^2\theta - mgR\cos\theta$ is constant; $E = T + U$ is $h + mR^2\omega^2\sin^2\theta$.`, t`The work is $\Delta E = mR^2\omega^2\big(\sin^2\theta_0 - 0\big)$, with $\sin^2\theta_0 = 1 - \cos^2\theta_0$.`],
          teach: t`On a driven constraint $h$ is conserved, not $E$; their difference is the work the driver has done.`,
          explain: t`$\cos\theta_0 = ${sci(c, 3)}$, so $\sin^2\theta_0 = ${sci(1 - c * c, 3)}$ and $W = mR^2\omega^2\sin^2\theta_0 = ${sci(W * 1000, 3)}$ mJ. Half of it went into the bead's kinetic energy of being carried round, half — as $h$ conservation shows — into sliding round the hoop and climbing.`,
          visual: hoopPic({ th: Math.acos(c), caption: t`The bead passing its off-axis equilibrium. Not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'breathing-bowl', difficulty: 2,
      prompt: t`A puck moves in a round bowl whose stiffness is pumped up and down in time: $U = \tfrac12k(1 + \varepsilon\sin\Omega t)(x^2 + y^2)$. Which quantities are conserved?`,
      visual: noe({ kind: 'time', eps: 0.2, panels: ['plane'] }, t`The bowl's contours at one instant (they breathe in and out) and the puck's path.`),
      choices: [
        t`Angular momentum $L_z$ only: the bowl is still round, but $L$ depends on $t$, so energy is not conserved`,
        t`Energy only: a round bowl conserves energy, and pumping it changes the angular momentum`,
        t`Both: the bowl is round and the puck is not touched`,
        t`Neither: any time dependence spoils every conservation law`,
      ],
      answer: 0,
      why: {
        1: t`Backwards. Pumping the stiffness is a time dependence, which breaks time-translation symmetry, so the energy is what goes; at every instant the bowl is still round, so $L_z$ survives.`,
        2: t`Pumping makes $L$ depend on $t$ explicitly, so $h$ (here $T + U$) changes — the Explore shows $E$ pumped up and down.`,
        3: t`Each symmetry acts independently. Rotational symmetry survives the time dependence, so $L_z$ is conserved.`,
      },
      hints: [t`Check each symmetry separately: is $L$ unchanged by a rotation? Is it free of explicit $t$?`],
      teach: t`Each conserved quantity tracks its own symmetry: break one, keep the others.`,
      explain: t`Rotational symmetry survives, so $L_z$ is constant; time symmetry is broken, so the energy changes — at $\Omega = 2\sqrt{k/m}$ it can grow, as on a playground swing pumped by standing and squatting.`,
    }),
    expr({
      id: 'two-body', difficulty: 2,
      prompt: t`Two carts on a frictionless track are joined by a spring: $L = \tfrac12m_1\dot x_1^2 + \tfrac12m_2\dot x_2^2 - \tfrac12k(x_1 - x_2 - \ell)^2$. Shifting both carts by the same $\epsilon$ leaves $L$ unchanged. Write the Noether charge. Type $\dot x_1$ as \`v_1\` and $\dot x_2$ as \`v_2\`.`,
      answer: 'm_1*v_1 + m_2*v_2', answerTeX: t`m_1\dot x_1 + m_2\dot x_2`,
      lhs: 'Q', vars: { m_1: [0.5, 3], m_2: [0.5, 3], v_1: [-2, 2], v_2: [-2, 2] },
      errors: [{ answer: 'm_1*v_1 - m_2*v_2', feedback: t`Both carts shift the same way, $K_1 = K_2 = 1$, so the momenta add.` }, { answer: 'm_1*v_1', feedback: t`$x_1$ alone is not cyclic (it is in the spring term), so $m_1\dot x_1$ is not conserved. The symmetry moves both carts.` }],
      hints: [t`$K_1 = 1$ and $K_2 = 1$. $Q = p_1K_1 + p_2K_2$.`],
      teach: t`Translating the whole system gives the total momentum, even when no single coordinate is cyclic.`,
      explain: t`$Q = m_1\dot x_1 + m_2\dot x_2$, the total momentum. Neither $x_1$ nor $x_2$ is cyclic; the symmetry is a combination, and Noether finds its charge anyway. Rewriting in centre-of-mass and relative coordinates would make the CM coordinate cyclic — the same result.`,
      visual: gpic({ x: [-0.5, 5.5], y: [-0.6, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.7', lower: '0.05', from: 0.5, to: 1.5, color: 'accent', alpha: 0.4 }, { fn: '0.7', lower: '0.05', from: 3.5, to: 4.8, color: 'warn', alpha: 0.4 }], curves: [seg([-0.4, 0], [5.4, 0], 'ink3', 2), { param: ['1.5 + 2*t', '0.38 + 0.12*sin(12*pi*t)'], t: [0, 1], color: 'ink2', width: 1.6 }], points: [lab(1, 0.95, 'm₁', 'accent'), lab(4.15, 0.95, 'm₂', 'warn')] }, t`Two carts joined by a spring on a level, frictionless track.`, 'Two carts joined by a spring'),
    }),
    mcq({
      id: 'screw', difficulty: 4,
      prompt: t`A charged particle moves in the field of a long helical wire, so that its potential depends on position only through $\rho$ and $\phi - kz$ (cylindrical coordinates): $L = \tfrac12m(\dot\rho^2 + \rho^2\dot\phi^2 + \dot z^2) - U(\rho, \phi - kz)$. What does Noether's theorem conserve?`,
      visual: gpic({ x: [-0.3, 6.6], y: [-1.4, 1.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['t', 'cos(2*t)'], t: [0, 6.3], color: 'accent', width: 2.4 }, { param: ['t', '-cos(2*t)'], t: [0, 6.3], color: 'accent', width: 1, dash: true }, seg([0, 0], [6.4, 0], 'ink4', 1, true)], points: [lab(6.45, 0.12, 'z', 'ink3')] }, t`A helix seen side-on: turning by an angle and sliding along the axis by that angle over $k$ carries it onto itself.`, 'A helix seen from the side'),
      choices: [
        t`$p_\phi + p_z/k = m\rho^2\dot\phi + m\dot z/k$, the charge of the screw motion $\phi \to \phi + \epsilon$, $z \to z + \epsilon/k$`,
        t`$p_\phi = m\rho^2\dot\phi$, because the wire is round`,
        t`$p_z = m\dot z$, because the wire is infinitely long`,
        t`$p_\phi$ and $p_z$ separately`,
      ],
      answer: 0,
      why: {
        1: t`Rotating alone changes $\phi - kz$: $U$ changes. The wire is helical, not round.`,
        2: t`Sliding alone changes $\phi - kz$ too. Infinite length is not enough; the helix's twist ties the two motions together.`,
        3: t`Neither shift on its own is a symmetry, so neither momentum on its own is conserved — only their combination.`,
      },
      hints: [t`Find a transformation of $\phi$ and $z$ together that leaves $\phi - kz$ unchanged.`, t`$\delta\phi = \epsilon$, $\delta z = \epsilon/k$: then $Q = p_\phi\cdot1 + p_z\cdot\tfrac1k$.`],
      teach: t`Noether's charge belongs to the symmetry, which may mix coordinates: a screw symmetry conserves a mix of angular and linear momentum.`,
      explain: t`$\phi - kz$ is unchanged by $\phi \to \phi + \epsilon$, $z \to z + \epsilon/k$, so $Q = m\rho^2\dot\phi + m\dot z/k$ is conserved. No coordinate is cyclic here — until you change to $\psi = \phi - kz$ and $z$, when $z$ becomes cyclic and its new momentum is exactly this $Q$ (times $k$).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hoop-speed', difficulty: 3,
      gen(r) {
        const R = 0.2, w = r.pick([3, 4, 5, 6]), th1 = r.pick([50, 60, 70]);
        const s2 = Math.sin(th1 * DEG) ** 2, c = Math.cos(th1 * DEG);
        const thd = Math.sqrt(2 * (G / R) * (1 - c) - w * w * s2);
        return {
          prompt: t`A hoop of radius 0.2 m spins at ${w} rad/s (below its critical rate of 7 rad/s). A bead is released from rest **relative to the hoop** at $${th1}^\circ$ from the bottom. Using the conserved $h = \tfrac12mR^2\dot\theta^2 - \tfrac12mR^2\omega^2\sin^2\theta - mgR\cos\theta$, how fast is it sliding round the hoop ($\dot\theta$) as it passes the bottom?`,
          answer: thd, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(2 * (G / R) * (1 - c) + w * w * s2), feedback: t`That conserves $E = T + U$. The motor does work on the bead, so $E$ is not conserved; $h$, with the spin term's sign reversed, is.` }, { value: Math.sqrt(2 * (G / R) * (1 - c)), feedback: t`That ignores the spin altogether — a hoop at rest. Spinning, the bead is flung outward, which slows its fall to the bottom.` }], thd),
          hints: [t`At release $\dot\theta = 0$: $h = -\tfrac12mR^2\omega^2\sin^2\theta_1 - mgR\cos\theta_1$. At the bottom $h = \tfrac12mR^2\dot\theta^2 - mgR$.`, t`$\dot\theta^2 = 2(g/R)(1 - \cos\theta_1) - \omega^2\sin^2\theta_1$.`],
          teach: t`When a constraint is driven, use the conserved $h$, not the energy.`,
          explain: t`$\dot\theta^2 = 2(49)(1 - \cos${th1}^\circ) - ${w * w}\sin^2${th1}^\circ = ${sci(thd * thd, 4)}$, so $\dot\theta = ${sci(thd, 3)}$ rad/s. On its way down the bead moves closer to the axis and the hoop takes energy $mR^2\omega^2\sin^2\theta_1$ back from it, absorbed by the motor — so the bead arrives slower than on a hoop at rest.`,
          visual: hoopPic({ th: th1 * DEG, caption: t`The bead at its release point on the spinning hoop. Not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'cp-killing', difficulty: 3, transfer: true,
      prompt: t`In general relativity a free particle's Lagrangian is $\tfrac12g_{\mu\nu}\dot x^\mu\dot x^\nu$, so Noether's theorem applies to the symmetries of the metric. Around a non-rotating star the metric does not change with $t$ or $\phi$. In an expanding universe, $ds^2 = -dt^2 + a(t)^2\,(dx^2 + dy^2 + dz^2)$ with $a(t)$ growing. What follows?`,
      visual: gpic({ x: [0, 14], y: [0, 1.6], xlabel: 'time (Gyr)', ylabel: 'scale factor a', curves: [{ fn: '(x/13.8)^(2/3)', domain: [0.05, 14], color: 'accent', width: 2.4 }], hlines: [{ y: 1, label: 'today', color: 'ink3' }] }, t`A scale factor growing with time (matter-dominated form, $a \propto t^{2/3}$, for illustration only; the real universe now accelerates).`, 'The scale factor of the universe growing with time'),
      choices: [
        t`Orbits around the star conserve energy and angular momentum; in the expanding universe space-translation symmetry still conserves momentum ($a^2\dot x$), but a photon's energy is not conserved — it is redshifted`,
        t`Energy is conserved in both, because energy is always conserved`,
        t`Neither conserves anything, because spacetime is curved in both`,
        t`The expanding universe conserves energy but not momentum, because it expands in space`,
      ],
      answer: 0,
      why: {
        1: t`Energy conservation is the charge of time-translation symmetry. A metric that depends on $t$ has none, so there is no conserved energy to appeal to: light from distant galaxies arrives with less energy, stretched by the expansion.`,
        2: t`Curvature is not the issue; symmetry is. The star's spacetime is curved yet symmetric under $t$ and $\phi$ shifts: $E$ and $L$ are conserved, which is how black-hole orbits are solved.`,
        3: t`Backwards: the expanding metric is the same at every place ($x$ is cyclic, so $a^2\dot x$ is conserved) but changes in time.`,
      },
      hints: [t`For each spacetime, list the coordinates the metric does not depend on.`, t`No $t$-symmetry, no conserved energy.`],
      teach: t`In GR, conserved quantities come from symmetries of the metric (Killing vectors): no time symmetry, no energy conservation.`,
      explain: t`Static, round star: $t$ and $\phi$ cyclic, so $E$ and $L$ are conserved ([M4.4](#/lesson/phys3550.M4.4)). Expanding universe: $x, y, z$ cyclic, so $a^2\dot x$ is conserved — which for light means its momentum, and so its energy, falls as $1/a$: the cosmological redshift. See [the geodesic equation from the action](#/lesson/gr.S12.d) and [the expanding universe](#/lesson/gr.S30.i); the field-theory version of Noether's theorem belongs to [variational principles for fields](#/lesson/st-g.G5.1).`,
    }),
    multi({
      id: 'cp-same-motion', difficulty: 3,
      prompt: t`Which changes to a Lagrangian $L(q, \dot q, t)$ leave the equations of motion — and so every motion — unchanged?`,
      visual: { type: 'cm2-vary', params: { preset: 'ball', alpha: 1.5, sliders: [], modes: false, readouts: [], panels: ['F'] }, caption: t`The action of a family of motions: adding a constant to every value would move the curve up but not its flat point.` },
      choices: [t`Adding a constant: $L + c$`, t`Multiplying by a nonzero constant: $cL$`, t`Adding a total time derivative: $L + \frac{d}{dt}F(q, t)$`, t`Adding a potential: $L - \tfrac12kq^2$`],
      answer: [0, 1, 2],
      why: { 3: t`That adds a real spring force: Lagrange's equation gains $-kq$, and the motion changes.` },
      hints: [t`Think of the action: which changes alter $S$ by the same amount for every path with the given ends, or scale it?`, t`$\int\frac{dF}{dt}dt = F(q_2, t_2) - F(q_1, t_1)$, fixed by the end points.`],
      teach: t`Only the stationary points of $S$ matter, so any change that shifts or scales $S$ equally for all paths with fixed ends leaves the motion alone.`,
      explain: t`A constant adds $c(t_2 - t_1)$ to $S$; a factor scales $S$; a total derivative adds $F(q_2, t_2) - F(q_1, t_1)$ — the same for every path with these ends. None moves the stationary path. This freedom is why the Lagrangian of a charge in a field is unique only up to a gauge transformation, and why Noether's theorem is allowed to require only $\delta L = dF/dt$.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §7.8 and problems 7.48–7.51: conservation laws and symmetry', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'E. Noether, Invariante Variationsprobleme (1918), English translation by M. A. Tavel, arXiv physics/0503066', url: 'https://arxiv.org/abs/physics/0503066' },
    { label: 'S. M. Carroll, Spacetime and Geometry (2004), §3.8: symmetries and Killing vectors', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
