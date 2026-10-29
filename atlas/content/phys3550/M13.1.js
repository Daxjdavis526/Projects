// From particles to fields: the vibrating string (Goldstein ch. 13; Taylor
// ch. 16; MIT 8.09 "continuous systems"). N beads of mass m, spacing a, on a
// string of tension T: L = Σ½mẏᵢ² − Σ(T/2a)(yᵢ₊₁ − yᵢ)². With m = μa and
// a → 0 the sum becomes an integral of a Lagrangian density ℒ = ½μẏ² − ½Ty′²
// (the potential term is T times the extra length, √(1 + y′²) − 1 ≈ ½y′²).
// Hamilton's principle over x and t gives the field Euler–Lagrange equation
// ∂ₜ(∂ℒ/∂ẏ) + ∂ₓ(∂ℒ/∂y′) − ∂ℒ/∂y = 0, here μÿ = Ty″: waves at v = √(T/μ).
// Extra terms: an elastic foundation −½κy² (Klein–Gordon form, a cutoff
// frequency √(κ/μ)) and a beam's −½EIy″² (μÿ + EIy⁗ = 0). Explored in
// wv-chain (the chain's modes approaching the string's). Transfer: a space
// tether, a guitar string, a launch vehicle's bending. Links phys3750.W4,
// st-e.E11 (functional derivatives) and M8.3.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { sci, gpic, seg, lab, distinct } from './_cm5.js';

const t = String.raw;
const PI = Math.PI;

const EX = (() => {
  const L = 0.648, mu = 4.0e-4, f = 329.63;
  const v = 2 * L * f, T = mu * v * v;
  return { L, mu, f, v, T };
})();

/** A string's standing wave n at a moment, as a graph picture (x in units of L). */
function stringPic(n, caption, { amp = 0.6, beads = 0, phase = 0.8 } = {}) {
  const curves = [{ fn: `${amp * Math.cos(phase)}*sin(${n}*pi*x)`, domain: [0, 1], color: 'accent', width: 2.4 }, { fn: `${amp}*sin(${n}*pi*x)`, domain: [0, 1], color: 'ink4', width: 1, dash: true }, { fn: `-${amp}*sin(${n}*pi*x)`, domain: [0, 1], color: 'ink4', width: 1, dash: true }];
  const points = beads ? Array.from({ length: beads }, (_, i) => { const x = (i + 1) / (beads + 1); return { x: +x.toFixed(4), y: +(amp * Math.cos(phase) * Math.sin(n * PI * x)).toFixed(4), color: 'warn', r: 5 }; }) : [];
  return gpic({ x: [-0.05, 1.05], y: [-1, 1], axes: false, grid: false, xlabel: '', ylabel: '', curves: [...curves, seg([-0.012, -0.9], [-0.012, 0.9], 'ink2', 4), seg([1.012, -0.9], [1.012, 0.9], 'ink2', 4)], points }, caption, 'A string fixed at both ends vibrating in a standing wave');
}

export default lesson({
  id: 'phys3550.M13.1',
  title: 'From particles to fields: the vibrating string',
  minutes: 16, difficulty: 4,
  intro: t`A chain of beads on a string is ordinary mechanics: one coordinate $y_i$ per bead, one Lagrange equation each ([M8.3](#/lesson/phys3550.M8.3)). Now let the beads crowd together, keeping the mass per length $\mu$ fixed. The label $i$ becomes a continuous position $x$, the coordinates $y_i(t)$ become a **field** $y(x, t)$, and the sum over beads in the Lagrangian becomes an integral of a **Lagrangian density** $\mathcal L$ — kinetic energy per length minus stretch energy per length. Hamilton's principle, now an integral over both $x$ and $t$, gives a **field equation**, and for the string it is the wave equation. This is the template for all of field theory: Maxwell's equations, the Klein–Gordon equation and Einstein's equations all come from a Lagrangian density in exactly this way.`,
  equation: t`\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12T\,y'^2, \qquad \frac{\partial}{\partial t}\frac{\partial\mathcal L}{\partial\dot y} + \frac{\partial}{\partial x}\frac{\partial\mathcal L}{\partial y'} - \frac{\partial\mathcal L}{\partial y} = 0 \;\Longrightarrow\; \mu\ddot y = T\,y''`,
  symbols: [
    { tex: 'y(x, t)', text: 'the field: the string’s sideways displacement at position $x$ and time $t$, in m' },
    { tex: '\\mathcal L', text: 'the **Lagrangian density**: Lagrangian per unit length, in J/m; $L = \\int\\mathcal L\\,dx$' },
    { tex: '\\mu', text: 'mass per unit length, in kg/m' },
    { tex: 'T', text: 'the tension, in N' },
    { tex: '\\dot y,\\ y\'', text: '$\\partial y/\\partial t$ (the velocity of the bit of string at $x$) and $\\partial y/\\partial x$ (its slope)' },
    { tex: "y''", text: '$\\partial^2y/\\partial x^2$, the curvature of the string; $\\ddot y = \\partial^2y/\\partial t^2$' },
  ],
  why: t`Every modern theory of nature — electromagnetism, the Standard Model, general relativity — is written as a Lagrangian density and its field equations; the vibrating string is where the method is simplest to see.`,
  visual: {
    type: 'wv-chain',
    title: 'Beads become a string',
    lead: t`$N$ beads on a light string with fixed ends, oscillating in one normal mode. The dashed curve is the continuous string's mode that the beads sample; beside it, the chain's dispersion curve $\omega = 2\sqrt{k/m}\,|\sin(qa/2)|$ with the string's straight line $\omega = vq$ dashed.`,
    tasks: [
      t`With $N = 8$, step the mode $n$ from 1 to 8: low modes sit on the straight line (string-like), high ones bend away below it.`,
      t`Raise $N$ to 40 and watch mode 3: its frequency approaches the string's value — the readout ratio $\omega_n/vq_n$ goes to 1.`,
    ],
    params: { N: 8, n: 3, bc: 'fixed', controls: ['N', 'n'], maxN: 40, panels: ['chain', 'disp'], readouts: ['N', 'n', 'omega', 'vq', 'ratio'] },
    caption: t`Equal beads on a light string under tension, moving sideways by small amounts: the same mathematics as masses on springs with $k = T/a$. Displacements exaggerated; no damping. The motion is the exact sum of the chain's normal modes. To compare with a string, the chain is kept at fixed spacing, so a larger $N$ is a longer chain.`,
  },
  example: {
    prompt: t`Start from $N$ beads of mass $m$, spacing $a$, on a string under tension $T$. Take the continuum limit of the Lagrangian, derive the field equation, and use it to find the tension that tunes a guitar's top string (vibrating length $${EX.L}$ m, $\mu = ${sci(EX.mu * 1e4, 2)}\times10^{-4}$ kg/m) to E4, $${EX.f}$ Hz.`,
    visual: stringPic(1, t`The fundamental of a string fixed at both ends (displacement exaggerated), with eight beads (orange) sampling it — the chain this lesson starts from.`, { beads: 8 }),
    steps: [
      { label: 'Beads', text: t`Kinetic energy $\sum_i\tfrac12m\dot y_i^2$. Each segment, length $a$ at rest, is stretched to $\sqrt{a^2 + (y_{i+1} - y_i)^2} \approx a + \dfrac{(y_{i+1} - y_i)^2}{2a}$; the tension does work $T$ times the extra length, so $U = \sum_i\dfrac{T}{2a}(y_{i+1} - y_i)^2$.` },
      { label: 'Continuum', text: t`Write $m = \mu a$ and $(y_{i+1} - y_i)/a \to \partial y/\partial x$: $L = \sum_i a\bigl[\tfrac12\mu\dot y_i^2 - \tfrac12T\bigl(\tfrac{y_{i+1} - y_i}{a}\bigr)^2\bigr] \to \displaystyle\int_0^\ell\bigl[\tfrac12\mu\dot y^2 - \tfrac12Ty'^2\bigr]dx$.` },
      { label: 'Vary', text: t`$\delta S = \iint\bigl[\mu\dot y\,\delta\dot y - Ty'\,\delta y'\bigr]dx\,dt$. Integrate by parts in $t$ and in $x$ (the variation vanishes at the ends and at the start and finish): $\delta S = \iint\bigl[-\mu\ddot y + Ty''\bigr]\delta y\,dx\,dt$ — a [functional derivative](#/lesson/st-e.E11.1).` },
      { label: 'Field equation', text: t`For every $\delta y(x, t)$: $\mu\ddot y = Ty''$, the wave equation $\ddot y = v^2y''$ with $v = \sqrt{T/\mu}$ ([W4.2](#/lesson/phys3750.W4.2)). It is the general rule $\partial_t(\partial\mathcal L/\partial\dot y) + \partial_x(\partial\mathcal L/\partial y') - \partial\mathcal L/\partial y = 0$ with $\partial\mathcal L/\partial\dot y = \mu\dot y$, $\partial\mathcal L/\partial y' = -Ty'$.` },
      { label: 'Guitar', text: t`Fixed ends allow $y = A\sin(n\pi x/\ell)\cos\omega t$ with $\omega = vn\pi/\ell$, so $f_1 = v/2\ell$. For E4: $v = 2\ell f_1 = ${sci(EX.v, 4)}$ m/s and $T = \mu v^2 = ${sci(EX.T, 3)}$ N.` },
      { label: 'Sense check', text: t`About $${sci(EX.T / 9.8, 2)}$ kg-weight — guitar strings do carry tensions of 50–100 N each. And as $a \to 0$ the chain's dispersion $\omega = 2\sqrt{T/ma}\sin(qa/2) \to vq$: the bead model and the field agree for long waves.` },
    ],
    answer: t`$\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12Ty'^2$ gives $\mu\ddot y = Ty''$, waves at $v = \sqrt{T/\mu}$; the E4 string needs $T = \mu(2\ell f)^2 = ${sci(EX.T, 3)}$ N.`,
  },
  practice: [
    num({
      id: 'speed', difficulty: 1,
      gen(r) {
        const T = r.pick([40, 80, 150, 600]), mu = r.pick([2e-3, 5e-3, 1.2e-2]);
        const key = Math.sqrt(T / mu);
        return {
          prompt: t`A string with $\mu = ${sci(mu, 2)}$ kg/m is under a tension of ${T} N. Its Lagrangian density $\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12Ty'^2$ gives the wave equation. How fast do waves travel along it?`,
          answer: key, units: 'm/s', tol: { rel: 0.005 },
          errors: distinct([{ value: T / mu, feedback: t`That is $v^2$: the field equation is $\ddot y = (T/\mu)y''$, so $v = \sqrt{T/\mu}$.` }, { value: Math.sqrt(mu / T), feedback: t`Upside down: more tension makes waves faster.` }], key),
          hints: [t`$\mu\ddot y = Ty''$ is $\ddot y = v^2y''$ with $v^2 = T/\mu$.`],
          teach: t`The ratio of the two coefficients in $\mathcal L$ sets the wave speed: $v = \sqrt{T/\mu}$.`,
          explain: t`$v = \sqrt{${T}/${sci(mu, 2)}} = ${sci(key, 3)}$ m/s.`,
          visual: stringPic(2, t`A string fixed at both ends in its second mode (exaggerated).`),
        };
      },
    }),
    mcq({
      id: 'foundation', difficulty: 3,
      prompt: t`A string lies on an elastic bed that pulls every bit of it back toward $y = 0$: $\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12Ty'^2 - \tfrac12\kappa y^2$. Which field equation follows?`,
      visual: gpic({ x: [-0.05, 1.05], y: [-1, 1], axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0.5*sin(2*pi*x)', domain: [0, 1], color: 'accent', width: 2.4 }, ...Array.from({ length: 11 }, (_, i) => { const x = +(0.05 + 0.09 * i).toFixed(3); return seg([x, -0.95], [x, +(0.5 * Math.sin(2 * PI * x)).toFixed(4)], 'ink4', 1, true); }), seg([-0.05, -0.95], [1.05, -0.95], 'ink3', 3)], points: [lab(0.5, -0.85, 'elastic bed', 'ink3', 0, 0)] }, t`A string on an elastic bed (springs dashed), schematic.`, 'A wavy string supported by many little springs from a base'),
      choices: [t`$\mu\ddot y = Ty'' - \kappa y$`, t`$\mu\ddot y = Ty'' + \kappa y$`, t`$\mu\ddot y = -Ty'' - \kappa y$`, t`$\mu\ddot y = Ty''$: the extra term has no derivatives, so it drops out`],
      answer: 0,
      why: { 1: t`That has the bed pushing the string *away* from $y = 0$. With $\partial\mathcal L/\partial y = -\kappa y$, the rule's $-\partial\mathcal L/\partial y$ puts $+\kappa y$ on the left: $\mu\ddot y - Ty'' + \kappa y = 0$.`, 2: t`Check the tension term: $\partial_x(\partial\mathcal L/\partial y') = \partial_x(-Ty') = -Ty''$ on the left, which is $+Ty''$ on the right.`, 3: t`A term with no derivatives still contributes through $-\partial\mathcal L/\partial y$, as a potential energy does in particle mechanics.` },
      hints: [t`Compute the three pieces: $\partial\mathcal L/\partial\dot y = \mu\dot y$, $\partial\mathcal L/\partial y' = -Ty'$, $\partial\mathcal L/\partial y = -\kappa y$.`, t`$\partial_t(\mu\dot y) + \partial_x(-Ty') - (-\kappa y) = 0$.`],
      teach: t`A term in $\mathcal L$ with no derivatives acts like a potential energy, adding a restoring force to the field equation.`,
      explain: t`$\mu\ddot y - Ty'' + \kappa y = 0$. Trying $y = e^{i(kx - \omega t)}$ gives $\omega^2 = (T/\mu)k^2 + \kappa/\mu$: no wave can oscillate slower than $\sqrt{\kappa/\mu}$. In relativistic field theory this is the Klein–Gordon equation, and that minimum frequency is a particle's mass ($\hbar\omega_{\min} = mc^2$).`,
    }),
    num({
      id: 'cutoff', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.01, 0.02, 0.05]), kappa = r.pick([50, 200, 800]), T = r.pick([20, 50]), lam = r.pick([0.5, 1, 2]);
        const k = (2 * PI) / lam, w = Math.sqrt((T / mu) * k * k + kappa / mu), key = w / (2 * PI);
        return {
          prompt: t`For the string on an elastic bed, $\mu\ddot y = Ty'' - \kappa y$, with $\mu = ${mu}$ kg/m, $T = ${T}$ N and $\kappa = ${kappa}\ \text{N/m}^2$, what is the frequency (in Hz) of a travelling wave of wavelength ${lam} m?`,
          answer: key, units: 'Hz', tol: { rel: 0.005 },
          errors: distinct([{ value: (Math.sqrt(T / mu) * k) / (2 * PI), feedback: t`That ignores the bed. Substituting $\cos(kx - \omega t)$ gives $\omega^2 = (T/\mu)k^2 + \kappa/\mu$.` }, { value: w, feedback: t`That is $\omega$ in rad/s; divide by $2\pi$.` }, { value: Math.sqrt((T / mu) * k * k - kappa / mu) / (2 * PI), feedback: t`The bed *adds* stiffness: $+\kappa/\mu$.` }].filter((e) => Number.isFinite(e.value)), key),
          hints: [t`Put $y = A\cos(kx - \omega t)$ into the equation: $-\mu\omega^2 = -Tk^2 - \kappa$.`, t`$\omega = \sqrt{(T/\mu)k^2 + \kappa/\mu}$, $k = 2\pi/\lambda$, $f = \omega/2\pi$.`],
          teach: t`Adding $-\tfrac12\kappa y^2$ to $\mathcal L$ makes waves dispersive, with a lowest frequency $\sqrt{\kappa/\mu}$.`,
          explain: t`$k = ${sci(k, 3)}\ \text{m}^{-1}$, $\omega^2 = ${sci((T / mu) * k * k, 3)} + ${sci(kappa / mu, 3)}$, so $\omega = ${sci(w, 3)}$ rad/s and $f = ${sci(key, 3)}$ Hz. However long the wave, $f \ge \sqrt{\kappa/\mu}/2\pi = ${sci(Math.sqrt(kappa / mu) / (2 * PI), 3)}$ Hz.`,
          visual: gpic({ x: [0, 20], y: [0, 300], axesAt: 'edge', xlabel: 'k (rad/m)', ylabel: 'ω (rad/s)', curves: [{ fn: `sqrt(${T / mu}*x^2 + ${kappa / mu})`, domain: [0, 20], color: 'accent', width: 2.4 }, { fn: `${+Math.sqrt(T / mu).toFixed(4)}*x`, domain: [0, 20], color: 'ink3', width: 1.4, dash: true }] }, t`The dispersion relation with the bed (blue) and without it (dashed): the bed lifts the low-$k$ end to a minimum frequency.`, 'A dispersion curve that starts above zero and approaches a straight line'),
        };
      },
    }),
    num({
      id: 'mode-energy', difficulty: 3,
      gen(r) {
        const mu = r.pick([5e-3, 1e-2]), T = r.pick([50, 100]), ell = r.pick([0.5, 1]), n = r.pick([1, 2, 3]), A = r.pick([2, 5]) * 1e-3;
        const v = Math.sqrt(T / mu), w = (v * n * PI) / ell, key = 0.25 * mu * w * w * A * A * ell;
        return {
          prompt: t`A string ($\mu = ${sci(mu, 2)}$ kg/m, $T = ${T}$ N, length ${ell} m, fixed ends) vibrates in mode ${n}: $y = A\sin(${n}\pi x/\ell)\cos\omega t$ with $A = ${A * 1e3}$ mm. Integrating the energy density $\tfrac12\mu\dot y^2 + \tfrac12Ty'^2$ along the string at an instant when it is straight, what is its total energy?`,
          answer: key, units: 'J', tol: { rel: 0.01 },
          errors: distinct([{ value: 2 * key, feedback: t`$\int_0^\ell\sin^2(n\pi x/\ell)\,dx = \ell/2$: you may have used $\ell$.` }, { value: 0.5 * key, feedback: t`At that instant all the energy is kinetic: $\tfrac12\mu\omega^2A^2\times\ell/2 = \tfrac14\mu\omega^2A^2\ell$.` }], key),
          hints: [t`When the string is straight, $y' = 0$ and $|\dot y| = \omega A\sin(n\pi x/\ell)$: the energy is all kinetic.`, t`$E = \int_0^\ell\tfrac12\mu\omega^2A^2\sin^2(n\pi x/\ell)\,dx = \tfrac14\mu\omega^2A^2\ell$, with $\omega = n\pi v/\ell$, $v = \sqrt{T/\mu}$.`],
          teach: t`A field's energy is the integral of its energy density, here $\tfrac12\mu\dot y^2 + \tfrac12Ty'^2$ — kinetic plus stretch, with a plus sign.`,
          explain: t`$v = ${sci(v, 3)}$ m/s, $\omega = ${n}\pi v/\ell = ${sci(w, 4)}$ rad/s, $E = \tfrac14(${sci(mu, 2)})(${sci(w, 4)})^2(${sci(A, 2)})^2(${ell}) = ${sci(key, 3)}$ J. A quarter-period later the string is still and the same energy is all in the stretch, $\int\tfrac12Ty'^2dx$. (The energy density is the Hamiltonian density, $\mathcal H = \pi\dot y - \mathcal L$ with $\pi = \mu\dot y$.)`,
          visual: stringPic(n, t`Mode ${n} at its widest (dashed) and at an intermediate moment (exaggerated).`),
        };
      },
    }),
    mcq({
      id: 'why-minus', difficulty: 2,
      prompt: t`Why does the stretch term enter $\mathcal L$ as $-\tfrac12Ty'^2$?`,
      visual: gpic({ x: [0, 2], y: [0, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([0.3, 0.3], [1.5, 0.3], 'ink3', 1.4, true), seg([0.3, 0.3], [1.5, 0.9], 'accent', 2.4), seg([1.5, 0.3], [1.5, 0.9], 'ink3', 1.4, true)], points: [lab(0.9, 0.18, 'dx', 'ink3', 0, 0), lab(1.62, 0.6, 'dy', 'ink3', 0, 0), lab(0.75, 0.75, 'ds', 'accent', 0, 0)] }, t`A bit of string tilted by its slope: its length is $ds = \sqrt{dx^2 + dy^2}$.`, 'A small right triangle: a tilted segment of string over its horizontal run'),
      choices: [t`It is minus the potential energy: the tension does work $T(ds - dx) \approx \tfrac12Ty'^2dx$ stretching a tilted bit of string, and $\mathcal L$ is kinetic minus potential`, t`It is the kinetic energy of the string's slope`, t`The minus sign is a convention; $+\tfrac12Ty'^2$ gives the same physics`, t`It is the tension force, which points backwards`],
      answer: 0,
      why: { 1: t`$y'$ is a shape, not a motion; the kinetic term is $\tfrac12\mu\dot y^2$.`, 2: t`With $+$, the field equation would be $\mu\ddot y = -Ty''$: disturbances would grow exponentially instead of travelling — an unstable string.`, 3: t`$\mathcal L$ has units of energy per length, not force.` },
      hints: [t`$ds = \sqrt{1 + y'^2}\,dx \approx (1 + \tfrac12y'^2)\,dx$.`],
      teach: t`$\mathcal L$ is kinetic minus potential energy per length; the string's potential is tension times its extra length, $\tfrac12Ty'^2$ per unit length.`,
      explain: t`A tilted bit of string is longer by $ds - dx \approx \tfrac12y'^2dx$; stretching it against tension $T$ stores $\tfrac12Ty'^2dx$. So $\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12Ty'^2$, exactly as $L = T - U$ for particles.`,
    }),
    order({
      id: 'steps', difficulty: 2,
      prompt: t`Put the steps from beads to field equation in order.`,
      visual: stringPic(2, t`Beads on a string, sampling a smooth shape (exaggerated).`, { beads: 10 }),
      items: [t`Write $L$ for $N$ beads: $\sum\tfrac12m\dot y_i^2 - \sum\tfrac{T}{2a}(y_{i+1} - y_i)^2$`, t`Set $m = \mu a$ and let $a \to 0$: $L = \int\mathcal L\,dx$`, t`Vary $S = \iint\mathcal L\,dx\,dt$ and integrate by parts in $x$ and $t$`, t`Read off $\mu\ddot y = Ty''$`],
      hints: [t`Discrete first, then the limit, then the variation.`],
      teach: t`A field theory is the continuum limit of many coupled oscillators, with Hamilton's principle taken over space and time.`,
      explain: t`The bead Lagrangian, its continuum limit, Hamilton's principle with $\delta y(x, t)$ vanishing on the boundary, and the field equation. One can also take the limit after varying: the beads' Lagrange equations $m\ddot y_i = (T/a)(y_{i+1} - 2y_i + y_{i-1})$ become $\mu\ddot y = Ty''$ ([W4.1](#/lesson/phys3750.W4.1)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const len = r.pick([10, 20, 30]), d = r.pick([1, 2]), rho = 1440, T = r.pick([200, 500, 1000]);
        const mu = rho * PI * (d * 1e-3 / 2) ** 2, v = Math.sqrt(T / mu), key = (len * 1e3) / v;
        return {
          prompt: t`A space tether — a ${len} km Kevlar line (density 1440 kg/m³, diameter ${d} mm) — is held straight under ${T} N of tension by the gravity gradient. A thruster firing at one end sends a sideways kink along it. How long does the kink take to reach the far end?`,
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: (len * 1e3) / Math.sqrt(T / (rho * PI * (d * 1e-3) ** 2)), feedback: t`The cross-sectional area is $\pi(d/2)^2$, using the radius.` }, { value: (len * 1e3) / (T / mu), feedback: t`$v = \sqrt{T/\mu}$, not $T/\mu$.` }, { value: len / v, feedback: t`Convert the length to metres.` }], key),
          hints: [t`$\mu = \rho\,\pi(d/2)^2$ per metre of line.`, t`$v = \sqrt{T/\mu}$; time $= $ length $/v$.`],
          teach: t`The same Lagrangian density describes any taut line, from a guitar string to a space tether: kinks travel at $\sqrt{T/\mu}$.`,
          explain: t`$\mu = 1440\times\pi(${sci((d * 1e-3) / 2, 2)})^2 = ${sci(mu, 3)}$ kg/m, $v = \sqrt{${T}/${sci(mu, 3)}} = ${sci(v, 3)}$ m/s, so the kink takes $${sci(key, 3)}$ s. Tether dynamics missions (such as NASA's TSS-1R in 1996) had to model exactly these waves; the tension really varies along a gravity-gradient tether, so this is an estimate.`,
          visual: gpic({ x: [-1, 11], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([0, 0], [10, 0], 'ink2', 1.6), { fn: '0.5*exp(-((x - 3)^2)/0.3)', domain: [1.5, 4.5], color: 'warn', width: 2.4 }], shade: [{ fn: '0.35', lower: '-0.35', from: -0.6, to: 0, color: 'accent', alpha: 0.7 }, { fn: '0.2', lower: '-0.2', from: 10, to: 10.4, color: 'accent', alpha: 0.7 }], arrows: [{ from: [3.6, 0.8], to: [5.2, 0.8], color: 'warn' }], points: [lab(-0.3, -0.7, 'spacecraft', 'accent', 0, 0), lab(10.2, -0.5, 'end mass', 'accent', 0, 0), lab(3, 1.05, 'kink', 'warn', 0, 0)] }, t`A tether with a sideways kink travelling along it, schematic and not to scale.`, 'A long line between two masses with a bump travelling along it'),
        };
      },
    }),
    mcq({
      id: 'cp-beam', difficulty: 4, transfer: true,
      prompt: t`A launch vehicle bends like a beam, whose stiffness resists **curvature**: $\mathcal L = \tfrac12\mu\dot y^2 - \tfrac12EI\,y''^2$ (bending stiffness $EI$). When $\mathcal L$ depends on $y''$, the field equation $\partial_t\frac{\partial\mathcal L}{\partial\dot y} + \partial_x\frac{\partial\mathcal L}{\partial y'} - \frac{\partial\mathcal L}{\partial y} = 0$ gains a term $-\dfrac{\partial^2}{\partial x^2}\dfrac{\partial\mathcal L}{\partial y''}$. Which equation of motion results?`,
      visual: gpic({ x: [-0.1, 1.1], y: [-0.6, 0.6], axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0.15*(cosh(4.73*x) + cos(4.73*x) - 0.9825*(sinh(4.73*x) + sin(4.73*x)))', domain: [0, 1], color: 'accent', width: 6 }, seg([-0.05, 0], [1.05, 0], 'ink4', 1, true)], points: [lab(0.5, -0.45, 'first free–free bending mode (schematic)', 'ink3', 0, 0)] }, t`A slender vehicle flexing in its first bending mode, free at both ends; displacement greatly exaggerated.`, 'A long body bent into a gentle bow, its ends and middle moving opposite ways'),
      choices: [t`$\mu\ddot y + EI\,y'''' = 0$`, t`$\mu\ddot y - EI\,y'''' = 0$`, t`$\mu\ddot y = EI\,y''$`, t`$\mu\ddot y + EI\,y''' = 0$`],
      answer: 0,
      why: { 1: t`A sign slip: $-\partial_x^2(\partial\mathcal L/\partial y'') = -\partial_x^2(-EIy'') = +EIy''''$. With the minus sign, short waves would grow exponentially — a beam that buckles by itself.`, 2: t`That is the string's equation with tension $EI$; a beam resists curvature, so two more derivatives appear.`, 3: t`$\partial_x^2$ acts on $-EIy''$, giving a fourth derivative, not a third.` },
      hints: [t`$\partial\mathcal L/\partial\dot y = \mu\dot y$ and $\partial\mathcal L/\partial y'' = -EIy''$.`, t`$\partial_t(\mu\dot y) - \partial_x^2(-EIy'') = 0$.`],
      teach: t`Higher derivatives in $\mathcal L$ give higher derivatives in the field equation: a beam's bending stiffness gives the fourth-order Euler–Bernoulli equation.`,
      explain: t`For $\mathcal L(y, \dot y, y', y'')$ the rule is $\partial_t\frac{\partial\mathcal L}{\partial\dot y} + \partial_x\frac{\partial\mathcal L}{\partial y'} - \partial_x^2\frac{\partial\mathcal L}{\partial y''} - \frac{\partial\mathcal L}{\partial y} = 0$ (each integration by parts flips a sign). Here: $\mu\ddot y + EIy'''' = 0$, the Euler–Bernoulli beam. Its waves are dispersive, $\omega = \sqrt{EI/\mu}\,k^2$, and its lowest modes are what a rocket's guidance system must not excite.`,
    }),
    num({
      id: 'cp-harmonic', difficulty: 2,
      gen(r) {
        const T = r.pick([60, 90, 120]), mu = r.pick([1e-3, 3e-3, 6e-3]), ell = r.pick([0.4, 0.65, 1]), n = r.pick([1, 2, 3]);
        const key = (n * Math.sqrt(T / mu)) / (2 * ell);
        return {
          prompt: t`A string of length ${ell} m fixed at both ends has $T = ${T}$ N and $\mu = ${sci(mu, 2)}$ kg/m. What is the frequency of its mode ${n}?`,
          answer: key, units: 'Hz', tol: { rel: 0.005 },
          errors: distinct([{ value: (n * Math.sqrt(T / mu)) / ell, feedback: t`Mode $n$ fits $n$ half-wavelengths: $\lambda = 2\ell/n$, so $f = nv/2\ell$.` }, { value: (n * T / mu) / (2 * ell), feedback: t`$v = \sqrt{T/\mu}$.` }], key),
          hints: [t`$y = A\sin(n\pi x/\ell)\cos\omega t$ solves $\mu\ddot y = Ty''$ when $\omega = n\pi v/\ell$.`],
          teach: t`Fixed ends turn the field equation's continuous family of waves into a discrete ladder, $f_n = nv/2\ell$.`,
          explain: t`$v = ${sci(Math.sqrt(T / mu), 3)}$ m/s, $f_${n} = ${n}v/2\ell = ${sci(key, 3)}$ Hz.`,
          visual: stringPic(n, t`Mode ${n} of a string fixed at both ends (exaggerated).`),
        };
      },
    }),
  ],
  sources: [
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), ch. 13: classical field theory', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 16: continuum mechanics', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.09 Classical Mechanics III (Fall 2014): continuous systems and fields', url: 'https://ocw.mit.edu/courses/8-09-classical-mechanics-iii-fall-2014/' },
  ],
});
