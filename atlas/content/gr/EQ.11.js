// The Friedmann, acceleration and continuity equations, dissected. They are
// what Einstein's equations become for the FLRW metric filled with a perfect
// fluid (verified with sympy, convention a = 1 today, k in m⁻²):
//   (ȧ/a)² = (8πG/3)ρ − kc²/a² + Λc²/3,
//   ä/a = −(4πG/3)(ρ + 3p/c²) + Λc²/3,
//   ρ̇ = −3(ȧ/a)(ρ + p/c²).
// Planck 2018 numbers; the H₀ tension is flagged open. Uses the tested
// model/gr-cosmology.js and the gr-friedmann simulation. Avoids repeating
// gr.S31.i (dilution factors, ρ_c, q₀, z of acceleration, Λ and orbits).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, sci, round, hubble, H0, OM, OL, MPC, dustBall } from './_eq.js';
import { rhoCrit } from '../../src/viz/model/gr-cosmology.js';

const t = String.raw;
const log = Math.log10;
const RHO_C = rhoCrit(H0);                       // kg/m³ for H₀ = 67.4

const FRIED = t`\left(\frac{\dot a}{a}\right)^2 = \frac{8\pi G}{3}\rho - \frac{kc^2}{a^2} + \frac{\Lambda c^2}{3}`;
const ACCEL = t`\frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right) + \frac{\Lambda c^2}{3}`;

// gr-friedmann pictures with no controls and no numbers
const fried = (models, caption, extra = {}) => ({
  type: 'gr-friedmann',
  params: { sliders: false, readout: false, models, t: [-15, 15], a: [0, 2], ...extra },
  caption,
});

// how each ingredient dilutes, both axes in powers of ten
const scaling = (caption) => ({
  type: 'graph',
  params: {
    x: [-3.2, 0.6], y: [-1.5, 13], xlabel: 'log₁₀ a (0 = today)', ylabel: 'log₁₀(ρ / ρ today)',
    curves: [
      { fn: '-4*x', color: 'gold', label: 'radiation, w = ⅓', labelAt: -2.6, labelDx: 10 },
      { fn: '-3*x', color: 'accent', label: 'matter, w = 0', labelAt: -2.2, labelDx: 12, labelDy: 10 },
      { fn: '0', color: 'violet', label: 'Λ, w = −1', labelAt: -2.9, labelDy: -10 },
    ],
    vlines: [{ x: 0, label: 'today' }],
  },
  caption: caption ?? t`How the density of each ingredient changes as the universe grows, from the continuity equation with $p = w\rho c^2$: $\rho \propto a^{-3(1+w)}$. Both axes in powers of ten.`,
});

// a ladder of densities, in powers of ten
const ladder = {
  type: 'graph',
  params: {
    x: [-28, 5], y: [0, 5], xlabel: 'log₁₀(density in kg/m³)', ylabel: '', yticks: 0,
    points: [
      { x: round(log(1000), 4), y: 4, color: 'accent', label: 'water', labelDx: -40 },
      { x: round(log(1.2), 4), y: 3, color: 'accent', label: 'air', labelDx: -24 },
      { x: round(log(1.67e-21), 4), y: 2, color: 'teal', label: 'interstellar gas, 1 atom/cm³' },
      { x: round(log(RHO_C), 4), y: 1, color: 'gold', label: 'critical density' },
    ],
  },
  caption: 'Densities in powers of ten, from water to the critical density of the universe — about five proton masses per cubic metre.',
};

// a ball of the universe with a galaxy on its edge (Newtonian picture)
const escapeBall = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }],
    arrows: [{ from: [0, 0], to: [0.98, 0], color: 'ink3', label: 'd', labelDx: -30, labelDy: -12 }, { from: [1, 0], to: [1.75, 0], color: 'accent', label: 'receding', labelDx: -20, labelDy: -14 }],
    points: [{ x: 0, y: 0, color: 'ink2', label: 'you' }, { x: 1, y: 0, color: 'accent', r: 6, label: 'galaxy', labelDx: 6, labelDy: 14 }],
  },
  caption: 'Teaching model (exact for pressure-free matter): a galaxy on the edge of a ball of the universe, receding with the Hubble flow. Only the matter inside the ball pulls it back.',
};

export default lesson({
  id: 'gr.EQ.11',
  kind: 'dissection',
  title: 'The Friedmann, acceleration and continuity equations',
  minutes: 9, difficulty: 3,
  badges: ['est-obs', 'open'],
  equation: t`\begin{aligned}\part{1}{\left(\frac{\dot a}{a}\right)^2} &= \part{2}{\frac{8\pi G}{3}\,\rho} \part{3}{- \frac{kc^2}{a^2}} \part{4}{+ \frac{\Lambda c^2}{3}} \\[4pt] \part{5}{\frac{\ddot a}{a}} &= \part{6}{-\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right)} \part{4}{+ \frac{\Lambda c^2}{3}} \\[4pt] \part{7}{\dot\rho} &= \part{8}{-3\,\frac{\dot a}{a}\left(\rho + \frac{p}{c^2}\right)}\end{aligned}`,
  intro: t`Put the FLRW metric and a perfect fluid into Einstein's equations, and all ten collapse into these three. The first — the time–time component — ties the expansion rate to what the universe contains: it is a **constraint** on each moment. The second, from the space–space components, is the **acceleration**. The third is **energy conservation**; it follows from the other two.

Conventions: $a$ is the scale factor, 1 today; dots are rates of change with respect to cosmic time $t$; $\rho$ is the total mass density (energy density over $c^2$) of everything except $\Lambda$, and $p$ its pressure; $k$ and $\Lambda$ are in $\text{m}^{-2}$. Each term below gets its own card.`,
  parts: [
    {
      tex: t`\left(\frac{\dot a}{a}\right)^2`, name: 'the expansion rate, squared', badge: 'est-obs', units: t`$\text{s}^{-2}$`,
      text: t`$H = \dot a/a$ is the **Hubble parameter**: the fractional rate at which every distance grows. Today it is $H_0$ — 67.4 km/s/Mpc from the cosmic background read through the standard model, 73.0 from nearby stars and supernovae. That disagreement, the Hubble tension, is an **open question**.

Because only $H^2$ appears, this equation fixes the size of the expansion rate, not its direction: an expanding and a contracting universe with the same contents satisfy it equally.`,
    },
    {
      tex: t`\frac{8\pi G}{3}\,\rho`, name: 'the density term', badge: 'est-obs', units: t`$\text{s}^{-2}$`,
      text: t`Everything with energy, except $\Lambda$: ordinary matter, dark matter, radiation. ($G$ is Newton's constant; $\rho$ includes every form of energy, divided by $c^2$.)

For a flat universe with no $\Lambda$ it alone sets $H$; turned around, it defines the **critical density** $\rho_c = 3H^2/(8\pi G)$ — $8.5\times10^{-27}$ kg/m³ today, about five proton masses per cubic metre. Densities are quoted as fractions of it: $\Omega_m = 0.315$ for matter (Planck 2018).`,
    },
    {
      tex: t`-\frac{kc^2}{a^2}`, name: 'the curvature term', badge: 'est-obs', units: t`$\text{s}^{-2}$`,
      text: t`The spatial curvature $k$ of the FLRW metric, diluted as $1/a^2$. If $k > 0$ (closed space) it lowers $H^2$ for a given density: a closed universe needs **more** than the critical density to expand at a given rate. Written as $\Omega_k = -kc^2/H_0^2$ it is measured to be $0.001 \pm 0.002$: flat, to within the errors.`,
    },
    {
      tex: t`\frac{\Lambda c^2}{3}`, name: 'the cosmological constant', badge: 'open', units: t`$\text{s}^{-2}$`,
      text: t`The same term appears in both of the first two equations, unchanged as the universe grows ($\Lambda \approx 1.1\times10^{-52}\ \text{m}^{-2}$). As matter thins out, it takes over: today it is $\Omega_\Lambda = 0.685$ of the total, and in the acceleration equation it is the positive term that makes the expansion **speed up**.

That the expansion accelerates is observed (supernovae, 2011 Nobel prize). Whether $\Lambda$ is truly a constant — or an evolving dark energy, which some 2025 survey results hint at below the usual 5σ standard of discovery — is an open question.`,
    },
    {
      tex: t`\frac{\ddot a}{a}`, name: 'the acceleration of the expansion', badge: 'est-obs', units: t`$\text{s}^{-2}$`,
      text: t`The second derivative of the scale factor: positive when the expansion speeds up, negative when it slows. For most of cosmic history it was negative; since about 6 billion years ago (redshift 0.63) it has been **positive**. Unlike the first equation, this one contains $\ddot a$: it is the equation that evolves $a(t)$ forward in time.`,
    },
    {
      tex: t`-\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^2}\right)`, name: 'gravity of the contents', badge: 'est-der', units: t`$\text{s}^{-2}$`,
      text: t`Ordinary contents **decelerate** the expansion, and the source is $\rho + 3p/c^2$: pressure gravitates. For dust it is $\rho$; for radiation, with $p = \rho c^2/3$, it is $2\rho$ — light decelerates the expansion twice as hard as dust of the same density.

In a uniform universe pressure pushes nothing, because it is the same everywhere: there is no pressure gradient. Only its gravity is left. A fluid with $p < -\rho c^2/3$ would make this term positive — which is what $\Lambda$, with $p = -\rho c^2$, does.`,
    },
    {
      tex: t`\dot\rho`, name: 'the rate of change of density', badge: 'est-der', units: t`$\text{kg m}^{-3}\,\text{s}^{-1}$`,
      text: t`How fast the density changes with cosmic time at every place at once — the same everywhere, since the universe is uniform. In an expanding universe it is negative for every ordinary ingredient.`,
    },
    {
      tex: t`-3\,\frac{\dot a}{a}\left(\rho + \frac{p}{c^2}\right)`, name: 'dilution and the work of pressure', badge: 'est-der', units: t`$\text{kg m}^{-3}\,\text{s}^{-1}$`,
      text: t`Volumes grow as $a^3$, so their fractional rate of growth is $3\dot a/a$: the $\rho$ part is plain **dilution**. The $p/c^2$ part is the **work** the pressure does as the volume grows, $dE = -p\,dV$ — energy conservation for an expanding fluid.

With $p = w\rho c^2$ the solution is $\rho \propto a^{-3(1+w)}$: matter as $a^{-3}$, radiation as $a^{-4}$ (diluted and redshifted), $\Lambda$ ($w = -1$) not at all. This equation is not independent: it is $\nabla_\mu T^{\mu\nu} = 0$, guaranteed by the Bianchi identity.`,
    },
  ],
  readAloud: t`The expansion rate squared is set by the density, minus the curvature, plus the cosmological constant; the expansion decelerates in proportion to density plus three times pressure over c², and accelerates with Λ; and as space grows, density falls by dilution and by the work pressure does.`,
  why: t`These three equations turn what the universe contains into its history — its age, the switch from slowing down to speeding up, and its fate.`,
  visual: {
    type: 'gr-friedmann',
    title: 'What the contents do to a(t)',
    lead: t`Every curve passes through today with the same slope, the measured $H_0$ — that is the first equation at work. The contents decide the rest: the matter term bends the curve down, $\Lambda$ bends it up (the second equation). Move the sliders; the dashed curve is Planck 2018.`,
    tasks: [
      'Press “Matter only”: no Λ, so the curve bends down everywhere and the age is only 2/(3H₀) ≈ 9.7 billion years.',
      t`Raise $\Omega_\Lambda$: the curve bends upward today — accelerating — and the universe is older.`,
      t`Raise $\Omega_m$ well above 1 with no $\Lambda$: the first equation’s curvature term turns the expansion round into a Big Crunch.`,
    ],
    params: { Om: OM, OL, H0 },
  },
  practice: [
    mcq({
      id: 'constraint', difficulty: 2,
      prompt: t`$$${FRIED}$$ This equation contains $\dot a$ but not $\ddot a$. What role does that give it?`,
      choices: [
        t`A constraint: at each moment it ties the expansion rate to the contents, like Gauss's law; the acceleration equation, with $\ddot a$, moves $a(t)$ forward`,
        'An evolution equation that predicts a(t) on its own, without knowing the contents',
        'A definition of the Hubble parameter, with no physics in it',
        'An approximation valid only today',
      ],
      answer: 0,
      why: {
        1: t`It needs the contents: $\rho$, $k$ and $\Lambda$ are on its right-hand side.`,
        2: t`It is the time–time part of Einstein's equations; $H = \dot a/a$ is the definition, this equation is the law that fixes $H$.`,
        3: t`It holds at every moment; with $\rho \propto a^{-3}$ and so on, it gives $H$ at any time.`,
      },
      hints: ['In electromagnetism, Gauss’s law ∇·E = ρ/ε₀ has no time derivative. What does it do?', 'Which of the two first equations could step a(t) forward from one moment to the next?'],
      teach: 'The Friedmann equation is a constraint relating the expansion rate to the contents at each moment; the acceleration equation is the evolution equation.',
      explain: t`With only $\dot a$, it restricts the state at each instant — the expansion rate allowed by the contents. The acceleration equation evolves it; and if the continuity equation holds, the constraint stays satisfied — the cosmic version of the Bianchi identity.`,
      visual: fried(null, 'Our universe’s scale factor (Planck 2018). The straight line through today has slope H₀ — the expansion rate the first equation ties to the contents; how the curve bends is the second equation’s job.', { tangent: true, reference: false }),
    }),
    mcq({
      id: 'pressure', difficulty: 2,
      prompt: t`$$${ACCEL}$$ Positive pressure makes the expansion slow down **faster**. But pressure pushes outward — why doesn't it help the expansion along?`,
      choices: [
        t`In a uniform universe the pressure is the same everywhere, so there is no pressure gradient to push anything; what is left is that pressure gravitates, adding $3p/c^2$ to the source`,
        'It does help; the equation’s sign is a convention',
        'Pressure matters only inside stars, never in cosmology',
        t`The $3p/c^2$ term is negligible in every era of the universe`,
      ],
      answer: 0,
      why: {
        1: t`The sign is fixed by Einstein's equations, not chosen: with $\rho + 3p/c^2 > 0$ the expansion decelerates.`,
        2: 'In the first hundred thousand years radiation dominated, and its pressure was a third of its energy density — not negligible at all.',
        3: t`For radiation $3p/c^2 = \rho$: it doubles the source. It is negligible only for cold matter.`,
      },
      hints: ['Forces from pressure come from differences in pressure. Is there any difference from place to place in a uniform universe?'],
      teach: 'In cosmology pressure never pushes — it is uniform — but it gravitates, so positive pressure decelerates the expansion.',
      explain: t`A uniform pressure exerts no net force on anything, just as the air pressing on you from all sides does not move you. Its gravity remains: the source is $\rho + 3p/c^2$, which for radiation is $2\rho$. Only a negative enough pressure ($p < -\rho c^2/3$, like $\Lambda$'s) reverses the sign.`,
      visual: dustBall({ mode: 'matter', rho: 1000, w: 1 / 3, t: 0.6 }, 'A ball of test grains inside a uniform gas of light (p = ρc²/3): it shrinks faster than in dust of the same density — the pressure adds to the gravity.'),
    }),
    num({
      id: 'exponent', difficulty: 2,
      gen(r) {
        const w = r.pick([1, -1 / 3, 0.2, -0.8]);
        const wTeX = { 1: '1', [-1 / 3]: '-\\tfrac13', 0.2: '0.2', [-0.8]: '-0.8' }[w];
        const n = 3 * (1 + w);
        return {
          prompt: t`With $p = w\rho c^2$, the continuity equation becomes $\dot\rho = -3\,\dfrac{\dot a}{a}\,(1 + w)\,\rho$, whose solution is $\rho \propto a^{-n}$. Find $n$ for a fluid with $w = ${wTeX}$.`,
          answer: n, tol: { rel: 0.001, abs: 0.001 },
          errors: [...(w !== 0 ? [{ value: 3 * w, feedback: 'Keep the 1: n = 3(1 + w), so dust (w = 0) gives 3.' }] : []), { value: 3 + w, feedback: 'Multiply out: 3(1 + w) = 3 + 3w.' }],
          hints: [t`$\dot\rho/\rho = -3(1 + w)\,\dot a/a$, i.e. $d\ln\rho = -3(1 + w)\,d\ln a$.`, t`So $\rho \propto a^{-3(1+w)}$.`],
          teach: 'A fluid with p = wρc² dilutes as a^(−3(1+w)): the pressure term adds to or subtracts from plain volume dilution.',
          explain: t`$n = 3(1 + ${wTeX}) = ${fmt(n, 3)}$. ${w > 0 ? 'Positive pressure does work as the volume grows, so the density falls faster than for dust.' : 'Negative pressure means the expansion does work on the fluid, so its density falls more slowly than dust’s — at $w = -1$ not at all.'}`,
          visual: scaling(),
        };
      },
    }),
    num({
      id: 'critical-mass', difficulty: 2,
      gen(r) {
        const [what, R, rTeX] = r.pick([['the Earth', 6.371e6, t`6.371\times10^{6}`], ['the Sun', 6.957e8, t`6.957\times10^{8}`], ['a sphere 1 AU in radius', 1.496e11, t`1.496\times10^{11}`]]);
        const m = RHO_C * (4 / 3) * Math.PI * R ** 3;
        return {
          prompt: t`The density term defines the critical density, $\rho_c = 3H_0^2/(8\pi G) = ${sci(RHO_C)}\ \text{kg/m}^3$ for $H_0 = ${H0}$ km/s/Mpc. How much mass would a ball the size of ${what} (radius $${rTeX}$ m) hold at that density, in kg?`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: RHO_C * Math.PI * R ** 3, feedback: 'The volume of a ball is (4/3)πR³.' }, { value: RHO_C * 4 * Math.PI * R ** 2, feedback: 'That is density times surface area. Use the volume, (4/3)πR³.' }],
          hints: [t`$V = \tfrac43\pi R^3 = ${sci((4 / 3) * Math.PI * R ** 3, 4)}\ \text{m}^3$.`, t`$m = \rho_c V$.`],
          teach: 'The critical density is minute: a ball the size of the Earth holds only milligrams of it.',
          explain: t`$m = ${sci(RHO_C)}\times${sci((4 / 3) * Math.PI * R ** 3, 4)} = ${sci(m)}$ kg. ${R < 1e7 ? 'About nine milligrams — the whole Earth-sized ball.' : R < 1e9 ? 'About the mass of a bag of shopping.' : 'A modest ship’s worth of mass in a volume the size of Earth’s orbit.'} The universe's matter averages a third of this, and most of that is dark.`,
          visual: ladder,
        };
      },
    }),
    mcq({
      id: 'matter-only', difficulty: 3,
      prompt: t`Drop $\Lambda$ and $k$ and keep only matter, $\rho \propto a^{-3}$. The Friedmann equation then gives $a \propto t^{2/3}$ and an age of $2/(3H_0)$. Why did that worry cosmologists before 1998?`,
      choices: [
        t`With $H_0 \approx 70$ km/s/Mpc it gives about 9.3 billion years — younger than the oldest stars. A positive $\Lambda$ makes the universe older`,
        'It predicts that the universe is infinitely old',
        'It predicts that the expansion is speeding up',
        t`It contradicts $a = 1$ today`,
      ],
      answer: 0,
      why: {
        1: t`$a \propto t^{2/3}$ starts at $a = 0$ at a finite time: the age is finite, $2/(3H_0)$.`,
        2: t`With matter alone $\ddot a/a = -(4\pi G/3)\rho < 0$: it can only slow down.`,
        3: t`Any power law can be normalised to $a = 1$ today; the trouble is the age.`,
      },
      hints: [t`$1/H_0 \approx 14$ billion years for $H_0 \approx 70$ km/s/Mpc. What is two-thirds of it?`, 'Globular-cluster stars were dated at 12 billion years or more.'],
      teach: 'A matter-only universe would be younger than its oldest stars; the cosmological constant both accelerates the expansion and makes the universe older.',
      explain: t`$\tfrac23\times14.0\ \text{Gyr} \approx 9.3$ Gyr, but the oldest stars are at least 12 billion years old. With $\Lambda$ the expansion has been speeding up, so in the past it was slower than in a matter-only universe with the same $H_0$ today — and growing to today's size took longer: 13.8 Gyr for Planck's $\Omega_\Lambda = 0.685$.`,
      visual: fried([[1, 0, 'matter only', 'accent'], [OM, OL, 'Planck 2018', 'gold']], 'Two universes with the same expansion rate today: matter only (blue) and Planck 2018 with Λ (gold). Where each curve reaches a = 0 is its Big Bang.', { tangent: false, reference: false }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-escape', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([10, 100, 1000]);
        const dm = d * MPC, M = RHO_C * (4 / 3) * Math.PI * dm ** 3;
        const v = Math.sqrt((2 * G * M) / dm) / 1e3;
        return {
          prompt: t`A rocket-science view of the Friedmann equation: a galaxy ${d} Mpc from us sits on the edge of a ball of the universe at the critical density, $${sci(RHO_C)}\ \text{kg/m}^3$. What is the escape speed from that ball, $\sqrt{2GM/d}$ with $M = \tfrac43\pi d^3\rho_c$, in km/s? (1 Mpc $= 3.086\times10^{22}$ m)`,
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: v / Math.SQRT2, feedback: 'That is the circular-orbit speed √(GM/d). Escape needs √(2GM/d).' }],
          hints: [t`$M = \tfrac43\pi d^3\rho_c$, so $2GM/d = \tfrac{8\pi G\rho_c}{3}\,d^2$.`, t`With $\rho_c = 3H_0^2/(8\pi G)$ that is $H_0^2d^2$: the escape speed is $H_0 d$.`],
          teach: 'At the critical density every galaxy recedes at exactly its escape speed: the flat (k = 0) universe is the marginal case between recollapse and escaping for ever.',
          explain: t`$\sqrt{2GM/d} = ${fmt(v, 4)}$ km/s $= H_0 d = ${H0}\times${d}$ km/s — exactly the Hubble recession speed. The Friedmann equation is this energy balance: $\tfrac12\dot d^2 - GM/d = -\tfrac12 kc^2\chi^2$, so $k = 0$ means "exactly escape speed". (Newton's picture matches general relativity exactly for pressure-free matter; with $\Lambda$ the fate changes.)`,
          visual: escapeBall,
        };
      },
    }),
    mcq({
      id: 'cp-conservation', difficulty: 2,
      prompt: t`What is the status of the third equation, $\dot\rho = -3\dfrac{\dot a}{a}\left(\rho + \dfrac{p}{c^2}\right)$?`,
      choices: [
        t`It follows from the first two: it is energy conservation, $\nabla_\mu T^{\mu\nu} = 0$, which the Bianchi identity guarantees — dilution plus the work done by pressure`,
        'It is independent: without it the first two say nothing',
        'It shows that energy is not conserved in cosmology',
        'It holds only for pressure-free dust',
      ],
      answer: 0,
      why: {
        1: 'Differentiate the Friedmann equation in time and use the acceleration equation: the continuity equation drops out.',
        2: t`It is a local energy balance, $d(\rho c^2V) = -p\,dV$, which holds exactly. (Radiation's energy in a comoving volume does fall as $1/a$ — but because its pressure does work, as the equation says.)`,
        3: t`The $p/c^2$ term is there precisely for fluids with pressure: for radiation it makes $\rho \propto a^{-4}$ rather than $a^{-3}$.`,
      },
      hints: ['Differentiate the first equation with respect to time. Which other equation do you need to tidy the result?'],
      teach: 'The continuity equation is not new information: it is ∇·T = 0, which Einstein’s equations already imply.',
      explain: t`Differentiating $H^2 = \tfrac{8\pi G}{3}\rho - kc^2/a^2 + \Lambda c^2/3$ and using the acceleration equation leaves exactly $\dot\rho = -3H(\rho + p/c^2)$. Its two parts — dilution and the work of pressure — give each ingredient its own law, as in the picture.`,
      visual: scaling(),
    }),
    num({
      id: 'cp-hz', difficulty: 3,
      gen(r) {
        const z = r.pick([1, 2, 3]);
        const E = Math.sqrt(OM * (1 + z) ** 3 + OL);
        return {
          prompt: t`For a flat universe ($k = 0$) of matter and $\Lambda$, the Friedmann equation reads $H^2 = H_0^2\left[\Omega_m a^{-3} + \Omega_\Lambda\right]$ with $a = 1/(1+z)$. With $H_0 = ${H0}$ km/s/Mpc, $\Omega_m = ${OM}$ and $\Omega_\Lambda = ${OL}$, what was the expansion rate $H$ when the light we see from $z = ${z}$ set out, in km/s/Mpc?`,
          answer: H0 * E, units: 'km/s/Mpc', tol: { rel: 0.01 },
          errors: [{ value: H0 * (OM * (1 + z) ** 3 + OL), feedback: 'Take the square root: the equation gives H², not H.' }, { value: H0 * Math.sqrt(OM * (1 + z) ** 3), feedback: t`Keep the $\Lambda$ term, $\Omega_\Lambda$, inside the square root.` }],
          hints: [t`$a^{-3} = (1 + ${z})^3 = ${(1 + z) ** 3}$.`, t`$H = ${H0}\sqrt{${OM}\times${(1 + z) ** 3} + ${OL}}$.`],
          teach: 'Each term of the Friedmann equation scales with its own power of a, so the expansion rate in the past follows from today’s numbers.',
          explain: t`$H = ${H0}\times\sqrt{${fmt(OM * (1 + z) ** 3 + OL, 4)}} = ${fmt(H0 * E, 4)}$ km/s/Mpc. Then matter's term was $${fmt((OM * (1 + z) ** 3) / (OM * (1 + z) ** 3 + OL) * 100, 3)}\%$ of the total; today it is 31.5%.`,
          visual: fried(null, 'Our universe’s scale factor (Planck 2018): it grew faster in the past, relative to its size then, than it does today.', { tangent: false, reference: false }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §8.3 (the Friedmann equations)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
    { label: 'DESI DR2 results (2025): dark energy and BAO', url: 'https://arxiv.org/abs/2503.14738' },
  ],
});
