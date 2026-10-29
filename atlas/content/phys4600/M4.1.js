// Scalar and vector potentials (Griffiths §10.1.1). ∇·B = 0 lets B = ∇×A;
// Faraday's law then says ∇×(E + ∂A/∂t) = 0, so E + ∂A/∂t = −∇V. With
// E = −∇V − ∂A/∂t and B = ∇×A, the two homogeneous Maxwell equations hold
// automatically and the other two become two equations for four functions
// (Griffiths 10.4–10.5). The term −∂A/∂t is the induced, circulating part of
// E that no V can give (M0.1); −∇V is the part from charges. Example: a long
// solenoid with rising current (its A from PHYS 3600 M6.4) — E outside is
// −∂A/∂t, agreeing with Faraday. A charge beside a solenoid whose current is
// switched off gets a kick Δp = qA (a first look at canonical momentum
// p + qA, the minimal coupling of quantum mechanics). Transfers: the
// betatron, where p = eΦ/2πR accelerates electrons with no electrodes;
// the E field inside a pulsed solenoid. Uses field2d for A and −∂A/∂t.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, QE, ME, C, PI, sf } from './_em4b.js';

const t = String.raw;

// the worked example: a solenoid of radius 1.5 cm, 1500 turns/m, current rising at 200 A/s, seen 4 cm from the axis
const EX = { R: 0.015, n: 1500, dIdt: 200, s: 0.04 };
EX.dBdt = MU0 * EX.n * EX.dIdt;
EX.E = (EX.dBdt * EX.R ** 2) / (2 * EX.s);
EX.emf = EX.dBdt * PI * EX.R ** 2;

// the solenoid's A (radius 1, field 1 inside): A_φ = s/2 inside, 1/2s outside — as plane expressions
const RR = 'sqrt(x^2 + y^2)';
const G = `(0.5*step(1 - ${RR}) + 0.5*step(${RR} - 1)/(x^2 + y^2))`;

/** The solenoid's vector potential (or −∂A/∂t, scaled by k) as a field2d picture without readouts. */
const solPic = (caption, { E = false, probe = false } = {}) => ({
  type: 'field2d',
  params: { P: `${E ? '' : '-'}y*${G}`, Q: `${E ? '-' : ''}x*${G}`, x: [-3, 3], y: [-3, 3], density: 13, particles: false, readout: false, probe, loop: { r: 1 } },
  caption,
});

export default lesson({
  id: 'phys4600.M4.1',
  title: 'Scalar and vector potentials',
  minutes: 14, difficulty: 3,
  equation: t`\vec E = -\nabla V - \frac{\partial\vec A}{\partial t},\qquad \vec B = \nabla\times\vec A`,
  intro: t`In statics $\vec E = -\nabla V$, because $\nabla\times\vec E = 0$. Once fields change, Faraday’s law makes $\nabla\times\vec E = -\partial\vec B/\partial t$, and no scalar potential can produce the circulating electric field around a changing flux ([M0.1](#/lesson/phys4600.M0.1)). The repair is the vector potential of [PHYS 3600 M6.4](#/lesson/phys3600.M6.4). Since $\nabla\cdot\vec B = 0$ always, $\vec B = \nabla\times\vec A$. Put that into Faraday’s law: $\nabla\times(\vec E + \partial\vec A/\partial t) = 0$, so $\vec E + \partial\vec A/\partial t$ **is** the gradient of something, $-\nabla V$. Written this way, two of Maxwell’s four equations hold automatically, whatever $V$ and $\vec A$ are. The other two become equations for four functions, $V$ and the three components of $\vec A$, instead of six. The electric field now has two sources: charges, through $-\nabla V$, and changing currents, through $-\partial\vec A/\partial t$.`,
  symbols: [
    { tex: '\\vec E', text: 'the electric field, in V/m' },
    { tex: 'V', text: 'the scalar potential, in volts' },
    { tex: '\\vec A', text: t`the vector potential, in T·m (= V·s/m); $-\partial\vec A/\partial t$ is in V/m` },
    { tex: '\\vec B', text: 'the magnetic field, in tesla' },
    { tex: 't', text: 'time, in seconds' },
  ],
  why: t`Potentials turn Maxwell’s equations into wave equations with sources — the road to radiation, to the four-potential of relativity, and to the way a charge couples to a field in quantum mechanics.`,
  visual: {
    type: 'field2d',
    title: 'The vector potential of a solenoid, and the electric field it makes',
    lead: t`A long solenoid of radius 1 (the gold circle is its winding) seen end-on, with field $B = 1$ inside. Its vector potential circles the axis, growing as $s/2$ inside and falling as $1/2s$ outside — not zero outside, though $\vec B$ is. Switch to the electric field of a changing current: $\vec E = -\partial\vec A/\partial t$. Drag the probe and read its curl.`,
    tasks: [
      t`Showing $\vec A$: the curl at the probe is 1 inside (that is $\vec B$) and 0 outside, although $\vec A$ is not zero there.`,
      t`Showing $\vec E$ with the current rising ($dB/dt > 0$): $\vec E$ circles the opposite way to $\vec A$, and its curl is $-dB/dt$ inside — Faraday’s law.`,
      t`Reverse the rate: $\vec E$ reverses. No charges are anywhere, so $V = 0$ and the whole of $\vec E$ comes from $\vec A$.`,
    ],
    params: {
      P: `-y*${G}*(step(1.5 - w) - k*step(w - 1.5))`, Q: `x*${G}*(step(1.5 - w) - k*step(w - 1.5))`,
      x: [-3, 3], y: [-3, 3], density: 15, probe: [0.5, 0.3],
      choices: [{ key: 'w', label: 'Show', options: [[1, t`the vector potential $\vec A$`], [2, t`the electric field $-\partial\vec A/\partial t$`]], value: 1, explain: t`The same arrows up to a factor: $\vec E = -\partial\vec A/\partial t$ where there are no charges.` }],
      sliders: [{ key: 'k', label: t`Rate of change $dB/dt$`, min: -1, max: 1, step: 0.1, value: 1, explain: t`In units of the field per unit time. It scales $\vec A$’s rate of change, so it matters only when $\vec E$ is shown.` }],
      loop: { r: 1 },
    },
    caption: t`An ideal infinite solenoid of radius 1 (units: $B = 1$ inside), seen end-on; quasistatic. Arrow lengths are compressed; the probe’s divergence and curl and the gold loop’s circulation are computed numerically. The circulation round the gold circle equals the flux inside it, as Stokes’s theorem demands (the numerical flux integral is slightly off because the field’s curl jumps at the winding).`,
  },
  example: {
    prompt: t`A long solenoid of radius ${EX.R * 100} cm with ${EX.n} turns per metre has its current rising at ${EX.dIdt} A/s. Using the vector potential, find the induced electric field ${EX.s * 100} cm from its axis, and check it against Faraday’s law.`,
    visual: solPic(t`The solenoid end-on (gold circle) and the induced $\vec E = -\partial\vec A/\partial t$ while the current rises. Arrow lengths compressed.`, { E: true }),
    steps: [
      { label: 'The potential', text: t`Outside a long solenoid (Coulomb gauge, [PHYS 3600 M6.4](#/lesson/phys3600.M6.4)) $\vec A$ circles the axis with $A = \dfrac{\mu_0nIR^2}{2s}$ — set by the flux inside, $\Phi = \mu_0nI\pi R^2$, through $2\pi sA = \Phi$.` },
      { label: 'No charges', text: t`The solenoid is neutral, so $V = 0$ and $\vec E = -\partial\vec A/\partial t$: the electric field circles the axis, **against** the current while the current grows.` },
      { label: 'Numbers', text: t`$\dfrac{\partial A}{\partial t} = \dfrac{\mu_0n\,(dI/dt)\,R^2}{2s}$. With $\mu_0n\,dI/dt = ${nice(sf(EX.dBdt, 3))}$ T/s, $E = ${nice(sf(EX.dBdt, 3))} \times \dfrac{(${EX.R})^2}{2(${EX.s})} \approx ${nice(sf(EX.E * 1e3, 3))}$ mV/m.` },
      { label: 'Check', text: t`Faraday: $E\cdot 2\pi s = d\Phi/dt = ${tex(EX.emf, 3)}$ V, so $E = ${nice(sf((EX.emf / (2 * PI * EX.s)) * 1e3, 3))}$ mV/m ✓. The vector potential did the same job in one line, and it says something Faraday’s law does not: the field is $-\partial\vec A/\partial t$ **at each point**, with no loop needed.` },
    ],
    answer: t`$E \approx ${nice(sf(EX.E * 1e3, 3))}$ mV/m, circling the axis opposite to the current; $\oint\vec E\cdot d\vec l = -d\Phi/dt$ ✓.`,
  },
  practice: [
    mcq({
      id: 'automatic', difficulty: 2,
      prompt: t`If you write $\vec E = -\nabla V - \partial\vec A/\partial t$ and $\vec B = \nabla\times\vec A$ for any functions $V$ and $\vec A$, which of Maxwell’s equations hold automatically?`,
      visual: solPic(t`The vector potential of a solenoid, end-on: whatever $\vec A$ is, $\nabla\cdot(\nabla\times\vec A) = 0$.`),
      choices: [
        t`$\nabla\cdot\vec B = 0$ and Faraday’s law $\nabla\times\vec E = -\partial\vec B/\partial t$`,
        t`Gauss’s law $\nabla\cdot\vec E = \rho/\varepsilon_0$ and $\nabla\cdot\vec B = 0$`,
        'All four',
        t`The Ampère–Maxwell law and Gauss’s law`,
      ],
      answer: 0,
      why: {
        1: t`Gauss’s law involves the charges; it becomes an equation for $V$ and $\vec A$, $\nabla^2V + \partial(\nabla\cdot\vec A)/\partial t = -\rho/\varepsilon_0$, which constrains them.`,
        2: 'The two equations with sources (ρ and J) still have to be imposed: they become the equations for the potentials.',
        3: 'Those are exactly the two that still need solving — they contain ρ and J.',
      },
      hints: [t`$\nabla\cdot(\nabla\times\vec A) = 0$ and $\nabla\times\nabla V = 0$ for any functions.`, t`Take the curl of $\vec E = -\nabla V - \partial\vec A/\partial t$.`],
      teach: 'Potentials build the source-free Maxwell equations in; the two with sources become equations for V and A.',
      explain: t`$\nabla\cdot\vec B = \nabla\cdot(\nabla\times\vec A) = 0$, and $\nabla\times\vec E = -\nabla\times\nabla V - \partial(\nabla\times\vec A)/\partial t = -\partial\vec B/\partial t$. That is why we chose these forms: they are the general solution of the two homogeneous equations.`,
    }),
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put in order the argument that gives $\vec E = -\nabla V - \partial\vec A/\partial t$.`,
      visual: solPic(t`Around a changing solenoid $\vec E$ circles: no scalar potential alone can make it.`, { E: true }),
      items: [
        t`$\nabla\cdot\vec B = 0$ always, so $\vec B = \nabla\times\vec A$ for some $\vec A$.`,
        t`Faraday’s law becomes $\nabla\times\vec E = -\partial(\nabla\times\vec A)/\partial t$.`,
        t`Rearranged: $\nabla\times(\vec E + \partial\vec A/\partial t) = 0$.`,
        t`A curl-free field is a gradient: $\vec E + \partial\vec A/\partial t = -\nabla V$.`,
      ],
      hints: ['Start from the equation that lets you introduce A at all.', 'In statics the step “curl-free, so a gradient” gave E = −∇V; here it is applied to a different combination.'],
      teach: 'E + ∂A/∂t, not E, is the curl-free field once things change in time.',
      explain: t`The divergence-free $\vec B$ gives $\vec A$; Faraday’s law then makes $\vec E + \partial\vec A/\partial t$ curl-free, hence a gradient. In statics $\partial\vec A/\partial t = 0$ and this reduces to $\vec E = -\nabla V$.`,
    }),
    num({
      id: 'e-solenoid', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), n = r.pick([500, 1000, 2000]), dIdt = r.pick([50, 100, 400]), s = R * r.pick([1.5, 2, 3]);
        const E = (MU0 * n * dIdt * (R / 100) ** 2) / (2 * (s / 100));
        return {
          prompt: t`A long solenoid (radius ${R} cm, ${n} turns per metre) has its current rising at ${dIdt} A/s. Outside it, $A = \mu_0nIR^2/2s$. What is the size of the electric field ${nice(s)} cm from the axis, in mV/m?`,
          visual: solPic(t`The induced $\vec E = -\partial\vec A/\partial t$ around a solenoid with rising current. Arrow lengths compressed.`, { E: true }),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * n * dIdt * (R / 100)) / 2 * 1e3, feedback: t`Outside the solenoid $A \propto R^2/s$, not $s$: use $\dfrac{\mu_0n(dI/dt)R^2}{2s}$.` }, { value: (MU0 * n * dIdt * (R / 100) ** 2) / (s / 100) * 1e3, feedback: t`There is a 2 in the denominator: $2\pi sA = \pi R^2B$.` }],
          hints: [t`No charges, so $\vec E = -\partial\vec A/\partial t$.`, t`$E = \dfrac{\mu_0n\,(dI/dt)\,R^2}{2s}$, everything in SI units.`],
          teach: 'Where there are no charges, E = −∂A/∂t: the induced field follows the vector potential point by point.',
          explain: t`$E = \mu_0n\dfrac{dI}{dt}\dfrac{R^2}{2s} \approx ${nice(sf(E * 1e3, 3))}$ mV/m, circling the axis against the growing current.`,
        };
      },
    }),
    expr({
      id: 'e-from-pot', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), b = r.int(2, 5), sgn = r.sign();
        const V = `${a}x^2 t`, Ax = `${sgn > 0 ? '' : '-'}${b}t^2`;
        return {
          prompt: t`In some region $V = ${a}x^2t$ and $\vec A = ${sgn > 0 ? '' : '-'}${b}t^2\,\hat x$ (SI units). Find $E_x(x, t)$.`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1, 9], xlabel: 'x', ylabel: 'V', curves: [{ fn: `${a}*x^2`, color: 'accent', width: 2.4, label: 'V at t = 1', labelAt: 1.2, labelDx: 8 }] }, caption: t`The scalar potential at $t = 1$; $\vec A$ is uniform in space but grows in time.` },
          answer: `-${2 * a}*x*t ${sgn > 0 ? '-' : '+'} ${2 * b}t`,
          answerTeX: t`-${2 * a}xt ${sgn > 0 ? '-' : '+'} ${2 * b}t`,
          vars: { x: [-2, 2], t: [0.2, 3] },
          errors: [
            { answer: `-${2 * a}*x*t`, feedback: t`That is $-\partial V/\partial x$ only. A changing $\vec A$ adds $-\partial A_x/\partial t$.` },
            { answer: `-${2 * a}*x*t ${sgn > 0 ? '+' : '-'} ${2 * b}t`, feedback: t`Sign: $\vec E$ contains **minus** $\partial\vec A/\partial t$.` },
            { answer: `${2 * a}*x*t ${sgn > 0 ? '-' : '+'} ${2 * b}t`, feedback: t`Sign: $\vec E = -\nabla V - \dots$, so the gradient enters with a minus.` },
          ],
          hints: [t`$E_x = -\dfrac{\partial V}{\partial x} - \dfrac{\partial A_x}{\partial t}$.`, t`$\partial V/\partial x = ${2 * a}xt$ and $\partial A_x/\partial t = ${sgn > 0 ? '' : '-'}${2 * b}t$.`],
          teach: 'E has two parts: minus the gradient of V and minus the rate of change of A.',
          explain: t`$E_x = -${2 * a}xt ${sgn > 0 ? '-' : '+'} ${2 * b}t$. The two parts look alike here, but they are different physics: one is set by charges, the other by changing currents.`,
        };
      },
    }),
    num({
      id: 'kick', difficulty: 3,
      gen(r) {
        const R = r.pick([0.5, 1, 2]), n = r.pick([1000, 2000, 4000]), I = r.pick([1, 2, 5]), s = R * r.pick([2, 3, 4]);
        const A = (MU0 * n * I * (R / 100) ** 2) / (2 * (s / 100)), v = (QE * A) / ME;
        return {
          prompt: t`An electron sits at rest ${nice(s)} cm from the axis of a long solenoid (radius ${R} cm, ${n} turns per metre, carrying ${I} A), outside it, where $\vec B = 0$. The current is switched off. The electron hardly moves while it falls, and the magnetic force on it is negligible. How fast is the electron moving afterwards, in km/s?`,
          visual: solPic(t`The vector potential round the solenoid before the switch-off. Arrow lengths compressed.`),
          answer: v / 1e3, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: (QE * A) / ME / 1e3 / 2, feedback: t`The kick is $q\Delta A$ with the full $A = \mu_0nIR^2/2s$ — no further factor ½.` }],
          hints: [t`While $I$ falls, $\vec E = -\partial\vec A/\partial t$, so $d\vec p/dt = q\vec E = -q\,\partial\vec A/\partial t$.`, t`Integrate over the switch-off: $\Delta\vec p = -q\Delta\vec A = q\vec A_{\text{before}}$, with $A = \mu_0nIR^2/2s$.`],
          teach: 'A charge that sits still while A changes gains momentum −qΔA: p + qA is conserved.',
          explain: t`$A = \mu_0nIR^2/2s \approx ${tex(A, 3)}$ T·m, so $p = eA$ and $v = eA/m_e \approx ${nice(sf(v / 1e3, 3))}$ km/s, along the line of $\vec A$ (opposite to it, for a negative charge). However fast or slowly the current is switched off, the impulse is the same: the electron keeps the momentum $p + qA$ it had. That combination, the **canonical momentum**, is how a charge enters quantum mechanics.`,
        };
      },
    }),
    expr({
      id: 'b-from-a', difficulty: 3,
      gen(r) {
        const A0 = r.int(2, 5), k = r.int(2, 4), w = r.intExcept(3, 9, [k]);
        return {
          prompt: t`In empty space $V = 0$ and $\vec A = ${A0}\cos(${k}x - ${w}t)\,\hat y$ (SI units). Find $B_z(x, t)$.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-6, 6], xlabel: 'x', ylabel: 'Aᵧ', curves: [{ fn: `${A0}*cos(${k}*x)`, color: 'accent', width: 2.4, label: 'A (y) at t = 0', labelAt: 0.1, labelDy: -6 }] }, caption: t`The vector potential at $t = 0$: a wave travelling along $+x$.` },
          answer: `-${A0 * k} sin(${k}x - ${w}t)`,
          answerTeX: t`-${A0 * k}\sin(${k}x - ${w}t)`,
          vars: { x: [-2, 2], t: [0, 2] },
          errors: [
            { answer: `${A0 * k} sin(${k}x - ${w}t)`, feedback: t`$(\nabla\times\vec A)_z = \partial A_y/\partial x - \partial A_x/\partial y$, and $\partial\cos u/\partial x = -k\sin u$.` },
            { answer: `-${A0 * w} sin(${k}x - ${w}t)`, feedback: t`That is $E_y = -\partial A_y/\partial t$. The magnetic field is the curl: differentiate with respect to $x$.` },
          ],
          hints: [t`$B_z = \dfrac{\partial A_y}{\partial x} - \dfrac{\partial A_x}{\partial y}$, and $A_x = 0$.`, t`$\dfrac{\partial}{\partial x}\cos(${k}x - ${w}t) = -${k}\sin(${k}x - ${w}t)$.`],
          teach: 'B is the curl of A; for a wave in A, B and E = −∂A/∂t come out in step, with E/B = ω/k.',
          explain: t`$B_z = -${A0 * k}\sin(${k}x - ${w}t)$, while $E_y = -\partial A_y/\partial t = -${A0 * w}\sin(${k}x - ${w}t)$: in phase, with $E/B = \omega/k = ${nice(w / k)}$ — a plane wave written as one potential. (In vacuum $\omega/k$ must be $c$; these toy numbers are for practice.)`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-betatron', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.19, 0.5, 0.84]), Phi = r.pick([0.05, 0.2, 0.5]);
        const pc = (C * Phi) / (2 * PI * R);               // in eV (p = eA, A = Φ/2πR)
        const mc2 = (ME * C * C) / QE, K = (Math.sqrt(pc * pc + mc2 * mc2) - mc2) / 1e6;
        return {
          prompt: t`In a betatron, electrons circle at a fixed radius $R = ${R}$ m inside a doughnut-shaped vacuum tube while the magnetic flux through their orbit rises from zero to $\Phi = ${Phi}$ Wb. By symmetry the vector potential on the orbit is tangential, with $2\pi RA = \Phi$. What kinetic energy does an electron that started at rest reach, in MeV? (It is relativistic: use $E^2 = p^2c^2 + m^2c^4$.)`,
          visual: solPic(t`The vector potential round a growing flux (end-on). In a betatron the electrons ride round a circle in this field, pushed along by $-\partial\vec A/\partial t$.`, { E: true }),
          answer: K, units: 'MeV', tol: { rel: 0.01 },
          errors: [{ value: pc / 1e6, feedback: t`That is $pc$. The kinetic energy is $\sqrt{p^2c^2 + m^2c^4} - mc^2$.` }, { value: (pc * pc) / (2 * mc2) / 1e6, feedback: t`At these energies $p^2/2m$ is badly wrong; use the relativistic $\sqrt{p^2c^2 + m^2c^4} - mc^2$.` }].filter((e) => Math.abs(e.value - K) > 0.03 * K),
          hints: [t`The tangential force is $-e\,\partial A/\partial t$, so the electron’s momentum ends at $p = eA = e\Phi/2\pi R$.`, t`$pc$ in electronvolts is $c\Phi/2\pi R$; then $K = \sqrt{(pc)^2 + (0.511\ \text{MeV})^2} - 0.511$ MeV.`],
          teach: 'A betatron is p = eA made into a machine: the rising flux’s −∂A/∂t pushes electrons round with no electrodes at all.',
          explain: t`$A = \Phi/2\pi R$, so $pc = c\Phi/2\pi R \approx ${nice(sf(pc / 1e6, 3))}$ MeV and $K \approx ${nice(sf(K, 3))}$ MeV. Kerst’s first betatron (1940) reached 2.3 MeV; General Electric’s of 1945 reached 100 MeV. To keep the radius fixed the guide field at the orbit must be half the average field inside it — Wideröe’s 2-to-1 rule, which is $p = eA$ and $p = eB_{\text{orbit}}R$ together.`,
        };
      },
    }),
    num({
      id: 'cp-inside', difficulty: 2,
      gen(r) {
        const dB = r.pick([10, 100, 2000]), s = r.pick([0.5, 1, 2]);
        const E = (dB * s * 1e-2) / 2;
        return {
          prompt: t`Inside a pulsed solenoid the field rises uniformly at ${dB} T/s. There the vector potential circles the axis with $A = Bs/2$. What is the induced electric field ${s} cm from the axis, in V/m?`,
          visual: solPic(t`The induced field $-\partial\vec A/\partial t$ while the field rises: it grows in proportion to $s$ inside, falls as $1/s$ outside. Arrow lengths compressed.`, { E: true }),
          answer: E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: dB * s * 1e-2, feedback: t`$A = Bs/2$: keep the ½.` }],
          hints: [t`$E = |\partial A/\partial t|$ with no charges present.`, t`$E = \dfrac{s}{2}\dfrac{dB}{dt}$.`],
          teach: 'Inside a uniform changing field the induced E grows linearly with distance from the axis: E = (s/2) dB/dt.',
          explain: t`$E = \dfrac{s}{2}\dfrac{dB}{dt} = ${nice(sf(E, 3))}$ V/m, circling against the change. Faraday’s law agrees: $E\cdot2\pi s = \pi s^2\,dB/dt$.`,
        };
      },
    }),
    mcq({
      id: 'cp-two-parts', difficulty: 2,
      prompt: t`A small charged sphere sits beside a solenoid whose current is rising. The electric field nearby has a part pointing away from the sphere and a part circling the solenoid. Which potential gives which?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['-1.2 + 0.7*cos(t)', '0.7*sin(t)'], t: [0, 2 * PI], color: 'ink2', width: 2 }], points: [{ x: 1.4, y: 0, r: 9, color: 'bad', label: '+q', labelDx: 14 }, { x: -1.2, y: 0, r: 0, label: 'solenoid', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }], arrows: [{ from: [-1.2, 1.0], to: [-1.8, 0.85], color: 'violet', width: 2 }, { from: [-1.2, -1.0], to: [-0.6, -0.85], color: 'violet', width: 2 }, { from: [1.8, 0.3], to: [2.4, 0.6], color: 'warn', width: 2 }, { from: [1.8, -0.3], to: [2.4, -0.6], color: 'warn', width: 2 }] }, caption: t`Schematic: the solenoid end-on (grey circle) and the charged sphere; arrows show directions only.` },
      choices: [
        t`The outward part is $-\nabla V$ from the charge; the circling part is $-\partial\vec A/\partial t$ from the changing current`,
        t`Both come from $-\nabla V$, which includes every source`,
        t`The outward part is $-\partial\vec A/\partial t$; the circling part is $-\nabla V$`,
        t`Both come from $-\partial\vec A/\partial t$, since the fields are changing`,
      ],
      answer: 0,
      why: {
        1: t`A gradient has zero curl, and the circling field has a curl. $V$ cannot make it.`,
        2: t`Swapped: the circling field has a curl and cannot be a gradient; the charge’s field is the static Coulomb field.`,
        3: t`The sphere’s charge does not change, so it contributes nothing to $\partial\vec A/\partial t$; its field is $-\nabla V$.`,
      },
      hints: ['Which field has a nonzero curl?', t`$\nabla\times(-\nabla V) = 0$ always.`],
      teach: 'Charges make E through −∇V; changing currents make E through −∂A/∂t.',
      explain: t`In a gauge where $\nabla\cdot\vec A = 0$ (next lesson), $V$ comes from the charge — here the sphere’s Coulomb potential — and $\vec A$ from the current. The circling field, with its curl, is $-\partial\vec A/\partial t$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §10.1.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Kerst, The acceleration of electrons by magnetic induction, Phys. Rev. 60, 47 (1941)', url: 'https://doi.org/10.1103/PhysRev.60.47' },
  ],
});
