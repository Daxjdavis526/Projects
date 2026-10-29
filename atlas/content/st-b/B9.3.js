// Retarded Green's functions for the wave equation: the response to a flash
// at one point and one instant. In 3D it lives on the future light cone only,
// δ(t − r/c)/(4πr) — a sharp, 1/r-weakened echo of the source at the retarded
// time (Huygens' principle). In 1D it fills the cone (the wake of B3.3); in 2D
// it leaves a tail. Retarded potentials, the oscillator's causal kernel,
// why retarded and not advanced, the 1/r of gravitational waves, and the
// GW170817 bound on the speed of gravity.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const C = 2.99792458e8, MPC = 3.0857e22, AU = 1.495978707e11;
const SOUND = 343;          // m/s in air at 20 °C
// what a listener at distance r0 = 3 hears after a flash at t = 0 (c = 1), in d dimensions
const hear = {
  1: { curves: [{ fn: '0.5*step(x - 3)', color: 'accent', width: 2.6 }], arrows: [] },
  2: { curves: [{ fn: 'step(x - 3.0001)*min(1.2, 4/(2*pi*sqrt(max(x^2 - 9, 1e-9))))', color: 'accent', width: 2.6 }], arrows: [] },
  3: { curves: [{ fn: '0*x', color: 'accent', width: 2.6 }], arrows: [{ from: [3, 0], to: [3, 1.05], color: 'accent', width: 3 }] },
};
const hearVis = (d, caption) => ({ type: 'graph', params: { x: [0, 10], y: [-0.08, 1.25], aspect: 'wide', xlabel: 't', ylabel: 'response', axesAt: 'edge', yticks: 0, ...hear[d], vlines: [{ x: 3, label: 'r/c', color: 'gold' }] }, caption });

export default lesson({
  id: 'st-b.B9.3',
  title: 'Retarded Green’s functions for the wave equation',
  minutes: 15, difficulty: 3,
  intro: t`Set off a flash at one point and one instant: a source $\delta^3(\mathbf x - \mathbf x')\,\delta(t - t')$ for the wave equation $\frac{1}{c^2}u_{tt} - \nabla^2u = f$. The solution that is zero before the flash — the **retarded Green’s function** — is

$$G_{\text{ret}} = \frac{\delta\big(t - t' - |\mathbf x - \mathbf x'|/c\big)}{4\pi\,|\mathbf x - \mathbf x'|} :$$

a thin spherical shell expanding at speed $c$, weakening as $1/r$, and **zero everywhere else** — on the future light cone of the flash and only there. Adding up flashes gives every solution: $u(\mathbf x, t) = \displaystyle\int\frac{f(\mathbf x', t_r)}{4\pi|\mathbf x - \mathbf x'|}\,d^3x'$, where each source point is read at its **retarded time** $t_r = t - |\mathbf x - \mathbf x'|/c$, when the signal that arrives now set out.`,
  symbols: [
    { tex: t`G_{\text{ret}}`, text: 'the retarded Green’s function: the response at $(\\mathbf x, t)$ to a unit flash at $(\\mathbf x\', t\')$ (units 1/(m s))' },
    { tex: t`\delta(t - t' - |\mathbf x - \mathbf x'|/c)`, text: 'nonzero only when the time since the flash equals the light-travel time from it: the light cone' },
    { tex: t`|\mathbf x - \mathbf x'|`, text: 'the distance from the source point to the field point (m), often written $r$' },
    { tex: 'c', text: 'the wave speed (m/s): of light for electromagnetism and gravity, of sound for acoustics' },
    { tex: 't_r', text: 'the retarded time $t - |\\mathbf x - \\mathbf x\'|/c$: when the source did what you see now' },
    { tex: 'f', text: 'the source density (units of $u$ per m²)' },
  ],
  why: t`Linearized gravity is $\Box\bar h_{\mu\nu} = -16\pi G\,T_{\mu\nu}/c^4$; its retarded solution, read far from a slow source, is the quadrupole formula that predicts every gravitational-wave signal LIGO has caught ([GR step 28](#/lesson/gr.S28.d), [step 27](#/lesson/gr.S27.d)).`,
  visual: {
    type: 'graph',
    title: 'One flash, three dimensions',
    lead: t`A snapshot, at a time $T$ after a flash at $r = 0$, of the response against the distance $r$ (with $c = 1$). Choose the number of space dimensions and move $T$.`,
    tasks: [
      '3D: the whole response is a spike on the sphere r = T — behind it, nothing at all. Its weight falls as 1/(4πr).',
      '1D: a flat-topped plateau fills the whole cone |x| < T: the wake of a struck string (lesson B3.3).',
      '2D: the front is sharp, but a tail 1/(2π√(T² − r²)) lingers inside it — ripples on a pond do not stop cleanly.',
    ],
    params: {
      x: [0, 6], y: [-0.06, 1.3], aspect: 'wide', xlabel: 'r (distance from the flash)', ylabel: 'response', axesAt: 'edge',
      choices: [{ key: 'D', label: 'Space dimensions', options: [[1, 'one (a string)'], [2, 'two (a membrane)'], [3, 'three (space)']], value: 3, explain: 'The same flash in a line, a plane or space: only the number of dimensions changes.' }],
      sliders: [{ key: 'T', label: 'Time since the flash $T$', min: 0.3, max: 5, step: 0.05, value: 2, explain: 'With $c = 1$, the front has reached $r = T$.' }],
      curves: [
        { fn: '0.5*step(T - x)', color: 'accent', width: 2.6, when: 'step(0.5 - abs(D - 1))' },
        { fn: 'step(T - x - 0.0001)*min(1.25, 1/(2*pi*sqrt(max(T^2 - x^2, 1e-9))))', color: 'accent', width: 2.6, when: 'step(0.5 - abs(D - 2))' },
        { fn: '0*x', color: 'accent', width: 2.6, when: 'step(0.5 - abs(D - 3))' },
      ],
      arrows: [{ from: ['T', 0], to: ['T', 'min(1.2, 4/(4*pi*T))'], color: 'accent', width: 3, when: 'step(0.5 - abs(D - 3))', label: 'δ-shell', labelDx: 8, labelDy: -2 }],
      vlines: [{ x: 'T', label: 'front r = T', color: 'gold' }],
      readouts: [{ label: '3D shell weight 1/(4πT)', expr: '1/(4*pi*T)', digits: 3 }],
    },
    caption: t`Exact retarded Green’s functions of $\frac{1}{c^2}u_{tt} - \nabla^2u = \delta$ with $c = 1$: $\frac12\theta(T - |x|)$ in 1D, $\frac{1}{2\pi}\theta(T - r)/\sqrt{T^2 - r^2}$ in 2D (clipped where it climbs off the top), $\delta(T - r)/(4\pi r)$ in 3D. The 3D spike is drawn as an arrow whose height is four times its weight; a true δ has no height.`,
  },
  example: {
    prompt: t`A small loudspeaker at the origin emits a click: its source strength $q(t)$ is nonzero only for $0 \le t \le 5$ ms. Using $u = q(t - r/c)/(4\pi r)$ for a point source $q(t)\,\delta^3(\mathbf x)$, what does a listener $r = 343$ m away hear, and when? Compare a listener 343 m down a long, narrow pipe, where the sound is one-dimensional.`,
    visual: hearVis(3, t`What a listener at distance $r$ registers after an instantaneous flash at $t = 0$ in 3D (with $c = 1$, so $r/c = 3$): one sharp event, then silence.`),
    steps: [
      { label: 'Superpose flashes', text: t`The source $q(t)\delta^3(\mathbf x)$ is a string of flashes at the origin, one at each moment $t'$ with weight $q(t')$. Each arrives at distance $r$ exactly $r/c$ later, weakened by $1/(4\pi r)$: $u(r, t) = \int q(t')\,\dfrac{\delta(t - t' - r/c)}{4\pi r}\,dt' = \dfrac{q(t - r/c)}{4\pi r}$.` },
      { label: 'Check it solves the equation', text: t`Away from $r = 0$, $ru = q(t - r/c)/4\pi$ is a function of $t - r/c$ alone, so $(ru)_{tt} = c^2(ru)_{rr}$ — the radial wave equation. If $q$ is constant, $u = q/(4\pi r)$: the Poisson solution of the last lesson. ✓` },
      { label: 'Timing in 3D', text: t`$r/c = 343/${SOUND} = 1$ s. The listener hears an exact, weakened copy of the click from $t = 1.000$ s to $1.005$ s — **and then silence**. Sharp sounds stay sharp in three dimensions: Huygens’ principle.` },
      { label: 'The pipe', text: t`In 1D the Green’s function is $\tfrac{c}{2}\theta(ct - |x|)$: each flash leaves a plateau behind its front. The pipe listener’s signal starts at the same 1 s, but afterwards settles at $\tfrac{c}{2}\int q\,dt'$ instead of returning to zero — unless $\int q\,dt' = 0$, as for a loudspeaker cone that pushes and then pulls back.` },
    ],
    answer: t`In open air: an exact copy of the click, $1/(4\pi r)$ as strong, from 1.000 s to 1.005 s, then silence. In the pipe: the click arrives at 1 s too, but leaves a level of $\tfrac{c}{2}\int q\,dt$ behind it.`,
  },
  practice: [
    num({
      id: 'retarded-time', difficulty: 1,
      gen(r) {
        const s = r.pick([
          { what: 'Voyager 1', d: 2.5e13, unit: 'h', f: 3600 },
          { what: 'the New Horizons probe', d: 9.0e12, unit: 'h', f: 3600 },
          { what: 'a rover on Mars, at its farthest from Earth', d: 2.5 * AU, unit: 'min', f: 60 },
          { what: 'the Sun’s surface', d: AU, unit: 'min', f: 60 },
        ]);
        const T = s.d / C / s.f;
        return {
          prompt: t`A signal from ${s.what}, $${tex(s.d)}$ m away, arrives now. How long ago did it leave — that is, what is $t - t_r$? Give it in ${s.unit === 'h' ? 'hours' : 'minutes'}.`,
          visual: { type: 'graph', params: { x: [-0.2, 1.2], y: [0, 1.25], aspect: 'wide', xlabel: 'distance (scaled)', ylabel: 'time', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '1 - x', color: 'gold', width: 2.4, domain: [0, 1] }], points: [{ x: 0, y: 1, label: 'reception (now)', color: 'accent' }, { x: 1, y: 0, label: 'emission', color: 'warn', labelDx: -60, labelDy: -12 }], vlines: [{ x: 1, color: 'ink3' }] }, caption: 'The past light cone of the reception event (gold): it picks out the emission event on the source’s worldline (grey). Not to scale.' },
          answer: T, units: s.unit, tol: { rel: 0.005 },
          errors: [{ value: T * s.f, feedback: `That is in seconds; convert to ${s.unit === 'h' ? 'hours' : 'minutes'}.` }],
          hints: [t`$t - t_r = r/c$.`],
          teach: 'What you receive now was emitted at the retarded time t − r/c.',
          explain: t`$r/c = ${tex(s.d)}/${tex(C)} = ${tex(s.d / C)}$ s $= ${r3(T)}$ ${s.unit === 'h' ? 'h' : 'min'}. Every field you measure reports its source’s state at the retarded time, never its present one.`,
        };
      },
    }),
    mcq({
      id: 'which-dimension', difficulty: 2,
      prompt: t`A sensor at distance $r$ records the response to a single instantaneous flash at $t = 0$. The record shows a sharp onset at $t = r/c$, then a signal that decays slowly but never quite returns to zero. How many space dimensions does the wave live in?`,
      visual: hearVis(2, t`The record at distance $r$ (with $c = 1$, $r/c = 3$). The vertical scale is arbitrary, and the true onset spike is infinitely tall (but integrable).`),
      choices: ['two', 'three', 'one', 'it cannot be a wave equation: waves never linger'],
      answer: 0,
      why: {
        1: 'In 3D the response is the shell δ(t − r/c)/(4πr): one sharp event and silence afterwards.',
        2: t`In 1D the record would jump to a constant, $c/2$, and stay there — flat, not decaying.`,
        3: 'The wave equation in 2D does linger: its Green’s function fills the inside of the cone with a tail.',
      },
      hints: ['Compare the three snapshots in the Explore step, and turn each into “what one sensor records over time”.'],
      teach: 'The dimension decides the echo: 3D gives a sharp shell (Huygens), 1D a permanent plateau, 2D a decaying tail.',
      explain: t`In 2D, $G = \dfrac{c}{2\pi}\,\dfrac{\theta(ct - r)}{\sqrt{c^2t^2 - r^2}}$, which decays as $1/t$ but never ends. A membrane or a pond surface rings on after the front; air does not. (Odd dimensions from 3 up are sharp; even ones have tails.)`,
    }),
    num({
      id: 'strain-falloff', difficulty: 2,
      gen(r) {
        const D2 = r.pick([40, 100, 1000, 2000]);
        const h = (1.0e-21 * 410) / D2;
        return {
          prompt: t`The gravitational wave GW150914 reached LIGO with a peak strain of about $1.0\times10^{-21}$ from a distance of about 410 Mpc. Far from a source, the retarded solution of linearized gravity falls off as $1/r$. What peak strain would the same merger produce at ${D2} Mpc? Give it in units of $10^{-21}$.`,
          visual: { type: 'graph', params: { x: [0, 2100], y: [0, 3], aspect: 'wide', xlabel: 'distance (Mpc)', ylabel: 'strain (10⁻²¹)', axesAt: 'edge', curves: [{ fn: '410/max(x, 1)', color: 'accent', width: 2.4, domain: [100, 2100] }], points: [{ x: 410, y: 1, label: 'GW150914', color: 'gold' }] }, caption: 'Peak strain against distance for the same source, h ∝ 1/r. Cosmological redshift, which matters at these distances, is ignored.' },
          answer: h / 1e-21, units: '', tol: { rel: 0.01 },
          errors: [{ value: (1.0 * 410 * 410) / (D2 * D2), feedback: t`The *energy flux* falls as $1/r^2$; the strain, an amplitude, falls as $1/r$.` }],
          hints: [t`$h \propto 1/r$: $h_2 = h_1\,r_1/r_2$.`],
          teach: 'Radiation amplitudes fall as 1/r, the 1/(4πr) of the retarded Green’s function; energy flux, the square, as 1/r².',
          explain: t`$h = 1.0\times10^{-21}\times 410/${D2} = ${r3(h / 1e-21)}\times10^{-21}$. Because detectors measure amplitude, not energy, doubling a detector’s sensitivity doubles the distance it can see — and multiplies the volume of universe, and the event rate, by eight.`,
        };
      },
    }),
    expr({
      id: 'oscillating-source', difficulty: 2,
      prompt: t`A point source at the origin oscillates: $f = q_0\sin(\omega t)\,\delta^3(\mathbf x)$ in $\frac{1}{c^2}u_{tt} - \nabla^2u = f$. Write the retarded solution $u(r, t)$.`,
      visual: { type: 'graph', params: { x: [0, 12], y: [-0.6, 0.6], aspect: 'wide', xlabel: 'r', ylabel: 'u', axesAt: 'edge', yticks: 0, curves: [{ fn: 'sin(2*(5 - x))/(4*pi*max(x, 0.15))', color: 'accent', width: 2.4, domain: [0.3, 12] }] }, caption: t`A snapshot of a spherical wave from an oscillating point source ($\omega = 2$, $c = 1$, $t = 5$): crests travel outward, shrinking as $1/r$.` },
      answer: 'q_0*sin(omega*(t - r/c))/(4*pi*r)',
      answerTeX: t`\frac{q_0\sin\big(\omega(t - r/c)\big)}{4\pi r}`,
      lhs: 'u(r, t)',
      vars: { q_0: [0.5, 2], omega: [0.5, 3], t: [0, 5], r: [0.5, 5], c: [1, 3] },
      keys: [['ω', 'omega'], ['q₀', 'q_0']],
      errors: [{ answer: 'q_0*sin(omega*t)/(4*pi*r)', feedback: t`Evaluate the source at the retarded time $t - r/c$, not at $t$.` }, { answer: 'q_0*sin(omega*(t + r/c))/(4*pi*r)', feedback: t`$t + r/c$ is the **advanced** time: that wave would arrive before it was sent.` }, { answer: 'q_0*sin(omega*(t - r/c))/(4*pi*r^2)', feedback: 'The amplitude falls as 1/r; 1/r² is the falloff of the energy flux.' }],
      hints: [t`For a point source $q(t)\delta^3(\mathbf x)$, $u = q(t - r/c)/(4\pi r)$.`, t`Here $q(t) = q_0\sin\omega t$, so replace $t$ by $t - r/c$ inside it.`],
      teach: 'The retarded solution reads each source at the retarded time and divides by 4πr.',
      explain: t`$u = \dfrac{q_0\sin\big(\omega(t - r/c)\big)}{4\pi r}$: an outgoing spherical wave of wavenumber $\omega/c$ whose amplitude falls as $1/r$. Antennas, loudspeakers and orbiting binaries all radiate this way far from the source.`,
    }),
    num({
      id: 'kick', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 5]), k = r.pick([800, 1800, 3200]), J = r.pick([0.1, 0.2, 0.5]), tt = r.pick([0.02, 0.05]);
        const w = Math.sqrt(k / m), x = ((J / m) * Math.sin(w * tt)) / w;
        return {
          prompt: t`A sensor of mass $m = ${m}$ kg on a spring mount ($k = ${k}$ N/m, no damping) sits at rest when a separation bolt fires, giving it an impulse $J = ${J}$ N s at $t = 0$. The oscillator’s retarded Green’s function is $G(t) = \theta(t)\,\sin(\omega_0t)/\omega_0$ with $\omega_0 = \sqrt{k/m}$, so $x(t) = (J/m)\,G(t)$. Find $x$ at $t = ${tt}$ s, in millimetres.`,
          visual: { type: 'graph', params: { x: [-0.02, 0.3], y: [-1.2, 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'x (scaled)', axesAt: 'edge', yticks: 0, curves: [{ fn: `step(x)*sin(${w.toFixed(5)}*x)`, color: 'accent', width: 2.4 }], vlines: [{ x: 0, label: 'kick', color: 'warn' }, { x: tt, color: 'gold' }] }, caption: 'The response to the kick: zero before it, a sine after it (scaled). Damping, which every real mount has, is left out.' },
          answer: x * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (J / m) * Math.sin(w * tt) * 1000, feedback: t`Divide by $\omega_0$: $G = \sin(\omega_0t)/\omega_0$.` }, { value: ((J / m) * Math.sin((w * tt * 180) / Math.PI)) / w * 1000, feedback: 'The angle ω₀t is in radians.' }].filter((e) => Math.abs(e.value - x * 1000) > 0.02 * Math.abs(x * 1000)),
          hints: [t`$\omega_0 = \sqrt{${k}/${m}} = ${r3(w)}$ rad/s.`, t`$x = \dfrac{J}{m}\,\dfrac{\sin(\omega_0t)}{\omega_0}$, with the angle in radians.`],
          teach: 'An oscillator’s retarded Green’s function θ(t) sin(ω₀t)/ω₀ is its response to a unit impulse: zero before, ringing after.',
          explain: t`$\omega_0 = ${r3(w)}$ rad/s, $\omega_0t = ${r3(w * tt)}$ rad, so $x = \dfrac{${J}}{${m}}\cdot\dfrac{\sin(${r3(w * tt)})}{${r3(w)}} = ${r3(x * 1000)}$ mm. It is the zero-dimensional cousin of the wave equation’s $G_{\text{ret}}$: one degree of freedom, one causal kernel ([variation of parameters](#/lesson/math2280.DE-3.4)).`,
        };
      },
    }),
    mcq({
      id: 'why-retarded', difficulty: 2,
      prompt: t`The **advanced** Green’s function $\delta(t - t' + |\mathbf x - \mathbf x'|/c)/(4\pi|\mathbf x - \mathbf x'|)$ — a shell converging onto the source and arriving exactly at the flash — also solves the wave equation with a point source. Why does physics use the retarded one?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2.2, 2.2], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, shade: [{ fn: '2.2', lower: 'abs(x)', from: -2.2, to: 2.2, color: 'accent', alpha: 0.15 }, { fn: '-abs(x)', lower: '-2.2', from: -2.2, to: 2.2, color: 'violet', alpha: 0.15 }], curves: [{ fn: 'abs(x)', color: 'accent', width: 2, domain: [-2.2, 2.2] }, { fn: '-abs(x)', color: 'violet', width: 2, domain: [-2.2, 2.2] }], points: [{ x: 0, y: 0, label: 'flash', color: 'gold' }, { x: 1.1, y: 1.75, label: 'retarded (future cone)', r: 0, color: 'accent' }, { x: 1.1, y: -1.75, label: 'advanced (past cone)', r: 0, color: 'violet' }] }, caption: 'The two light cones of the flash event (one space dimension shown, c = 1).' },
      choices: ['Both solve the equation; the retarded one is the solution that is zero before the source acts — the condition of no incoming radiation, which is what experiments see', 'The advanced one fails to satisfy the wave equation away from the source', 'The advanced one is the retarded one with a sign error, so they are the same solution', 'The advanced one grows without bound at large distances'],
      answer: 0,
      why: {
        1: 'It satisfies the equation everywhere off the cone, just as the retarded one does; the equation is symmetric in time.',
        2: 'They differ: one lives on the future light cone, the other on the past light cone. Their difference solves the source-free equation.',
        3: 'Both fall off as 1/r; the difference is when, not how big.',
      },
      hints: ['The wave equation has only second time derivatives: it cannot tell past from future. Something else must.'],
      teach: 'The wave equation is time-symmetric; causality — no incoming radiation from the past — is a boundary condition that selects the retarded solution.',
      explain: t`Any solution of the source-free equation can be added to a particular solution, and the advanced minus the retarded Green’s function is one. Choosing the retarded one means: before the source acts, the field is zero. That is an initial condition about the universe, not a property of the equation — and it is the one every antenna, loudspeaker and gravitational-wave source obeys.`,
    }),
    num({
      id: 'string-wake', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.003, 0.005, 0.008]), T = r.pick([60, 100, 150]), J = r.pick([0.001, 0.002, 0.004]);
        const c = Math.sqrt(T / mu), h = J / (2 * mu * c);
        return {
          prompt: t`A long string (linear density $\mu = ${mu}$ kg/m, tension $T = ${T}$ N) is struck at one point by a hammer that delivers an impulse $J = ${J}$ N s. Dividing $\mu u_{tt} - Tu_{xx} = J\,\delta(x)\delta(t)$ by $T$ puts it in the form $\frac{1}{c^2}u_{tt} - u_{xx} = (J/T)\,\delta(x)\delta(t)$, whose 1D retarded Green’s function is $\frac{c}{2}\,\theta(ct - |x|)$. How high is the plateau the string is left at, in millimetres?`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-0.2, 1.3], aspect: 'wide', xlabel: 'x', ylabel: 'u (scaled)', axesAt: 'edge', yticks: 0, curves: [{ fn: 'step(3 - abs(x))', color: 'accent', width: 2.6 }], vlines: [{ x: -3, color: 'gold' }, { x: 3, color: 'gold', label: 'fronts at ±ct' }] }, caption: 'The struck string a short time later (scaled): a plateau between two fronts moving out at c. An ideal, infinitely thin hammer and no stiffness are assumed.' },
          answer: h * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (J * c) / T * 1000, feedback: t`The Green’s function is $\frac{c}{2}$, not $c$: half the kick goes each way.` }, { value: J / (2 * mu) * 1000, feedback: t`That has units of velocity: divide by $c$ as well — the plateau is $\frac{J}{T}\cdot\frac{c}{2} = \frac{J}{2\mu c}$.` }],
          hints: [t`$u = \dfrac{J}{T}\cdot\dfrac{c}{2}$ inside the cone, with $c = \sqrt{T/\mu}$.`, t`Equivalently $u = \dfrac{J}{2\mu c}$, since $T = \mu c^2$.`],
          teach: 'In 1D the retarded Green’s function fills the light cone: a kick leaves a permanent plateau of height (J/T)(c/2).',
          explain: t`$c = \sqrt{${T}/${mu}} = ${r3(c)}$ m/s, and the plateau is $\dfrac{J}{2\mu c} = \dfrac{${J}}{2(${mu})(${r3(c)})} = ${r3(h * 1000)}$ mm — the wake of lesson B3.3, now read off a Green’s function. On a real, finite string the ends reflect it back.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gw170817', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([26, 40]), dt = 1.74;
        const bound = (C * dt) / (D * MPC);
        return {
          prompt: t`On 17 August 2017 the gravitational waves from a neutron-star merger (GW170817) reached Earth, and gamma rays from the same event arrived $1.74$ s later. The source was about ${D} Mpc away (1 Mpc $= 3.086\times10^{22}$ m). Suppose both signals left at the same moment and the whole delay came from a difference in speed. How large is $|v_{\text{gw}} - c|/c$? Give it in units of $10^{-16}$.`,
          visual: { type: 'graph', params: { x: [0, 1.15], y: [0, 1.25], aspect: 'wide', xlabel: 'distance (fraction of the way to Earth)', ylabel: 'time', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: 'x', color: 'gold', width: 2.4, domain: [0, 1] }, { fn: 'x*1.06', color: 'violet', width: 2, dash: [5, 4], domain: [0, 1] }], points: [{ x: 1, y: 1, label: 'gravitational waves', color: 'gold', labelDx: -150, labelDy: -14 }, { x: 1, y: 1.06, label: 'gamma rays', color: 'violet', labelDx: 8 }, { x: 0, y: 0, label: 'merger', color: 'warn' }] }, caption: `Both signals on a distance–time diagram. The gap is hugely exaggerated: 1.74 s after a journey of about ${Math.round(D * 3.2616)} million years.` },
          answer: bound / 1e-16, units: '', tol: { rel: 0.01 },
          errors: [{ value: dt / (D * MPC) / 1e-16, feedback: t`The travel time is $D/c$: compare $\Delta t$ with $D/c$, i.e. compute $c\,\Delta t/D$.` }],
          hints: [t`If the speeds differ by $\Delta v$, the arrival times differ by about $\dfrac{D}{c}\cdot\dfrac{\Delta v}{c}$.`, t`So $\dfrac{\Delta v}{c} \approx \dfrac{c\,\Delta t}{D}$.`],
          teach: 'Retarded times from a distant source turn a tiny speed difference into a measurable delay: Δv/c ≈ cΔt/D.',
          explain: t`$\dfrac{(${tex(C)})(1.74)}{${D}\times3.086\times10^{22}} = ${tex(bound)}$, i.e. about $${r3(bound / 1e-16)}\times10^{-16}$. The LIGO–Virgo–Fermi analysis, using the conservative 26 Mpc and allowing the gamma rays to have left up to 10 s late, found $-3\times10^{-15} \le \Delta v/c \le 7\times10^{-16}$: gravity travels at the speed of light, so the retarded Green’s function of linearized gravity has the same light cone as electromagnetism.`,
        };
      },
    }),
    num({
      id: 'cp-click', difficulty: 2,
      gen(r) {
        const d = r.pick([170, 500, 1029]), tau = r.pick([2, 5, 10]);
        const tEnd = d / SOUND + tau / 1000;
        return {
          prompt: t`A firecracker’s bang lasts ${tau} ms. A listener in open air is ${d} m away ($c = ${SOUND}$ m/s; no echoes). Counting from the start of the bang, at what time does the listener’s air fall silent again? Give it in seconds, to the nearest millisecond.`,
          visual: hearVis(3, t`The listener’s record of an instantaneous flash in 3D ($c = 1$, $r/c = 3$): sharp, and silent afterwards. A bang of finite length is a short string of such flashes.`),
          answer: tEnd, units: 's', tol: { rel: 0, abs: 0.0006 },
          errors: [{ value: d / SOUND, feedback: 'That is when the sound starts; it lasts as long as the bang did.' }],
          hints: [t`In 3D, $u = q(t - r/c)/(4\pi r)$: a delayed copy of the source, lasting exactly as long.`],
          teach: 'In three dimensions a signal arrives as a delayed, weakened but undistorted copy — Huygens’ principle.',
          explain: t`The copy starts at $r/c = ${r3(d / SOUND)}$ s and ends ${tau} ms later, at $${tEnd.toFixed(3)}$ s; after that the air is still. In a long pipe (1D) or on a drumhead (2D) it would not be. Real air absorbs high frequencies a little and buildings add echoes — neither is in the ideal wave equation.`,
        };
      },
    }),
    mcq({
      id: 'cp-drum', difficulty: 2,
      prompt: t`A large drumhead is tapped sharply at its centre. Long before any wave reaches the rim, the circular front passes a point halfway out. What does that point do after the front has passed?`,
      visual: hearVis(2, t`What a point of the membrane does after an instantaneous tap (scaled; $c = 1$, the front passes at $t = 3$).`),
      choices: ['it keeps moving, with a displacement that fades slowly — a tail inside the cone', 'it returns to rest at once, as sound in air does', 'it stays displaced at a constant height for ever', 'it starts to move before the front arrives'],
      answer: 0,
      why: {
        1: 'Sharp, clean passage is special to three (and higher odd) dimensions.',
        2: 'A constant plateau is the 1D behaviour — a struck string. In 2D the tail decays.',
        3: 'Nothing moves before the front: the retarded Green’s function is zero outside the light cone in every dimension.',
      },
      hints: ['A membrane is two-dimensional. Which kernel has a tail?'],
      teach: 'In 2D the retarded Green’s function fills its cone with a decaying tail, 1/√(c²t² − r²).',
      explain: t`$G_{2\text{D}} \propto \theta(ct - r)/\sqrt{c^2t^2 - r^2}$: after the front the point keeps moving, its response decaying roughly as $1/t$. That lingering tail is why a drum or a pond does not reproduce a sharp signal cleanly — and why we are lucky to talk in three dimensions.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'J. D. Jackson, Classical Electrodynamics, 3rd ed. (Wiley, 1999), §6.4–6.6 (retarded Green’s function and potentials)', url: 'https://openlibrary.org/isbn/9780471309321' }, { label: 'LIGO Scientific and Virgo Collaborations, Observation of gravitational waves from a binary black hole merger, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' }, { label: 'LIGO, Virgo, Fermi-GBM and INTEGRAL, Gravitational waves and gamma-rays from a binary neutron star merger: GW170817 and GRB 170817A, ApJL 848, L13 (2017)', url: 'https://doi.org/10.3847/2041-8213/aa920c' }],
});
