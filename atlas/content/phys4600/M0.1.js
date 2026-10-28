// Bridge from PHYS 3600 (Griffiths ch. 7 overview): what changes when the
// fields depend on time. Of the static table only the two curls change —
// Faraday's −∂B/∂t and Maxwell's μ₀ε₀∂E/∂t — and with them three habits of
// statics: E = −∇V alone (now E = −∇V − ∂A/∂t, so a "voltage between two
// points" depends on the path: Lewin's two voltmeters on a ring round a
// changing flux), ∇·J = 0 (now the continuity equation), and fields that
// follow their sources instantly (the quasistatic approximation, valid when
// the system is small compared with c times the time over which its sources
// change: L ≪ λ). Transfer: wireless charging pads are near-field devices.
// Uses em-faraday (ramp) and em-gap.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { C, PI, sf, circle, polygon, bare } from './_em4.js';
import { outOf, tag } from './_em4.js';

const t = String.raw;

// the worked example: three devices, size L (m) and frequency f (Hz)
const DEV = [
  { what: 'a grid transformer', L: 2, f: 50 },
  { what: 'a Hall-thruster power unit’s 2 m harness', L: 2, f: 1e5 },
  { what: 'an S-band transmitter board', L: 0.1, f: 2.2e9 },
].map((d) => ({ ...d, lam: C / d.f, ratio: d.L / (C / d.f) }));

/** A ring of two resistors round a long solenoid (field out of the page), with points P and Q between them. */
function ringPic(caption, { labels = true } = {}) {
  const res = (x) => polygon([[x - 0.16, -0.42], [x + 0.16, -0.42], [x + 0.16, 0.42], [x - 0.16, 0.42]], 'gold', { width: 2.2 });
  return {
    type: 'graph',
    params: bare([-3.2, 3.2], [-2.05, 2.05], {
      shade: [{ fn: 'sqrt(max(0.36 - x^2, 0))', lower: '-sqrt(max(0.36 - x^2, 0))', from: -0.6, to: 0.6, color: 'accent', alpha: 0.18 }],
      curves: [circle(0.6, 'accent', { width: 1.5 }),
        { param: ['1.6*cos(t)', '1.6*sin(t)'], t: [0.27, PI - 0.27], color: 'ink2', width: 2 },
        { param: ['1.6*cos(t)', '1.6*sin(t)'], t: [PI + 0.27, 2 * PI - 0.27], color: 'ink2', width: 2 },
        ...res(-1.6), ...res(1.6)],
      points: [...outOf(-0.25, 0.2), ...outOf(0.25, -0.2), ...outOf(0.25, 0.25), ...outOf(-0.25, -0.25),
        { x: 0, y: 1.6, r: 4.5, color: 'ink' }, { x: 0, y: -1.6, r: 4.5, color: 'ink' },
        tag(0, 1.6, 'P', 'ink', { labelDx: 0, labelDy: -14, labelAlign: 'center' }), tag(0, -1.6, 'Q', 'ink', { labelDx: 0, labelDy: 14, labelAlign: 'center' }),
        ...(labels ? [tag(-1.6, 0, 'R₁', 'gold', { labelDx: -16, labelDy: 0, labelAlign: 'right' }), tag(1.6, 0, 'R₂', 'gold', { labelDx: 16, labelDy: 0 }), tag(0, -0.75, 'changing B', 'accent', { labelAlign: 'center', labelDx: 0, labelDy: 6 })] : [])],
    }),
    caption,
  };
}

/** The ramp set-up of em-faraday as a still: a field region seen end-on with no ring, and a dashed circle. */
const rampStill = (r, caption, extra = {}) => ({ type: 'em-faraday', params: { mode: 'ramp', ring: false, path: true, Rf: 0.04, r, B0: 0.5, tr: 1, play: false, graphs: [], readouts: [], arrows: ['E'], ...extra }, caption });

/** A sketch of a wave with a device length marked on it (not to scale). */
const waveSketch = (caption) => ({
  type: 'graph',
  params: { x: [0, 4.2], y: [-1.6, 1.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ fn: 'sin(2*pi*x/2)', color: 'accent', width: 2.2, domain: [0, 4.2] }],
    arrows: [{ from: [0.5, -1.35], to: [2.5, -1.35], color: 'ink2', width: 1.5, label: 'λ = c/f', labelDx: -60, labelDy: 14 }],
    shade: [{ fn: '1.2', lower: '-1.2', from: 0.5, to: 0.8, color: 'gold', alpha: 0.35 }],
    points: [tag(0.65, 1.32, 'device, L', 'gold', { labelAlign: 'center', labelDx: 0, labelDy: 0 })] },
  caption,
});

export default lesson({
  id: 'phys4600.M0.1',
  title: 'What changes when fields depend on time',
  minutes: 14, difficulty: 2,
  equation: t`\begin{gathered}\nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}, \qquad \nabla\cdot\vec B = 0, \\ \nabla\times\vec E = -\frac{\partial\vec B}{\partial t}, \\ \nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\frac{\partial\vec E}{\partial t}\end{gathered}`,
  intro: t`PHYS 3600 ended on a table of static laws ([M8.1](#/lesson/phys3600.M8.1)): two divergences, two curls. Let the charges and currents change in time and **only the curls change**. Faraday’s law says a changing $\vec B$ makes $\vec E$ circulate; Maxwell’s correction says a changing $\vec E$ makes $\vec B$ circulate. The divergences — charge is the source of $\vec E$, nothing is the source of $\vec B$ — survive untouched. Three habits of statics do not: $\vec E$ is no longer the gradient of a potential alone, so a “voltage between two points” can depend on the path; current need not be divergence-free, because charge may pile up; and fields no longer follow their sources instantly. The last is often harmless: when a circuit is much smaller than the distance light travels while its currents change, the static formulas still hold moment by moment. That is the **quasistatic** regime of most of M1.`,
  symbols: [
    { tex: '\\vec E,\\ \\vec B', text: 'the electric field (V/m) and the magnetic field (T), now functions of position and time' },
    { tex: '\\rho,\\ \\vec J', text: t`charge density ($\text{C/m}^3$) and current density ($\text{A/m}^2$)` },
    { tex: '\\partial/\\partial t', text: 'the rate of change at a fixed point in space' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}$ F/m` },
    { tex: '\\mu_0', text: t`the vacuum permeability, $1.257\times10^{-6}\ \text{N/A}^2$; $1/\sqrt{\mu_0\varepsilon_0} = c$` },
  ],
  why: t`Every motor, transformer, antenna and beam of light lives in the two new terms — and this course ends by writing all four equations as two tensor equations, the pattern Einstein’s field equations follow.`,
  visual: {
    type: 'em-faraday',
    title: 'An electric field with no charge',
    lead: t`A long solenoid seen end-on: its field $\vec B$ fills the shaded disc and is ramped up and down. Watch the orange arrows: an **electric** field circles the changing flux — with no charge anywhere and no wire to push current through. Its circulation round the dashed circle is the emf, $-d\Phi_B/dt$.`,
    tasks: [
      t`While $B$ holds steady, the electric field vanishes: only a **changing** $\vec B$ makes $\vec E$ circulate.`,
      t`Slide the circle’s radius past the field region: $\vec B$ is zero there, yet $\vec E$ is not, and the emf round the circle stays the full $-d\Phi_B/dt$.`,
      t`Shorten the ramp time: $d\vec B/dt$ grows, and so does $\vec E$. A static field of the same size makes nothing.`,
    ],
    params: { mode: 'ramp', ring: false, path: true, Rf: 0.04, r: 0.06, B0: 0.5, tr: 1, sliders: ['B0', 'tr', 'r'], graphs: ['B', 'emf'], readouts: ['dB', 'E', 'emf'], arrows: ['E'] },
    caption: t`An ideal, infinitely long solenoid seen end-on, ramped slowly enough to be quasistatic: the field is uniform inside and zero outside, and $\vec E$ is exact for that field. Arrows show direction; their lengths are not to scale.`,
  },
  example: {
    prompt: t`When are the static formulas still good? Compare the light-crossing time $L/c$ of a device of size $L$ with the period $1/f$ of its currents, for ${DEV[0].what} (${DEV[0].L} m, ${DEV[0].f} Hz), ${DEV[1].what} (switching at ${DEV[1].f / 1e3} kHz) and ${DEV[2].what} (${DEV[2].L * 100} cm, ${DEV[2].f / 1e9} GHz).`,
    visual: waveSketch(t`A wave of wavelength $\lambda$ and a device of size $L$ (gold). The device is quasistatic when it spans a tiny fraction of a wavelength. Not to scale.`),
    steps: [
      { label: 'The criterion', text: t`A change at one end of a device is felt at the other a time $L/c$ later. If that delay is tiny compared with the period $T = 1/f$, every part of the device sees the same instant, and the fields are the static fields of the present charges and currents. The ratio is $\dfrac{L/c}{1/f} = \dfrac{L}{c/f} = \dfrac{L}{\lambda}$.` },
      { label: 'The transformer', text: t`$\lambda = c/f = ${nice(sf(DEV[0].lam / 1e3, 3))}$ km, so $L/\lambda \approx ${tex(DEV[0].ratio, 2)}$. Quasistatic to many decimal places: Biot–Savart with $I(t)$ is exact for all practical purposes.` },
      { label: 'The harness', text: t`$\lambda = ${nice(sf(DEV[1].lam / 1e3, 3))}$ km and $L/\lambda \approx ${tex(DEV[1].ratio, 2)}$: still quasistatic. Lumped circuit elements — $R$, $L$, $C$ — describe it.` },
      { label: 'The radio board', text: t`$\lambda = ${nice(sf(DEV[2].lam * 100, 3))}$ cm and $L/\lambda \approx ${nice(sf(DEV[2].ratio, 2))}$: the board is most of a wavelength across. The phase changes by about $${Math.round(360 * DEV[2].ratio)}^\circ$ from one edge to the other, traces act as transmission lines and antennas, and the full equations — with retardation — are needed.` },
      { label: 'Sense check', text: t`The criterion is size against wavelength, not field strength or current. A megawatt transformer is quasistatic; a milliwatt radio chip is not.` },
    ],
    answer: t`$L/\lambda \approx ${tex(DEV[0].ratio, 2)}$, $${tex(DEV[1].ratio, 2)}$ and $${nice(sf(DEV[2].ratio, 2))}$: the first two are quasistatic, the radio board is not.`,
  },
  practice: [
    mcq({
      id: 'which-fails', difficulty: 1,
      prompt: t`The field inside a long solenoid is rising. Outside the solenoid $\vec B$ is still zero. Which statement from statics **fails** there?`,
      visual: rampStill(0.06, t`The solenoid end-on (shaded, field rising) and a circle outside it. Arrows show the direction of the induced $\vec E$, not its size.`),
      choices: [
        t`$\oint\vec E\cdot d\vec l = 0$ round every closed loop`,
        t`$\nabla\cdot\vec B = 0$`,
        t`$\nabla\cdot\vec E = \rho/\varepsilon_0$`,
        t`$\vec B = 0$ outside an ideal long solenoid`,
      ],
      answer: 0,
      why: {
        1: t`No magnetic charge has ever been found: $\nabla\cdot\vec B = 0$ holds at every instant.`,
        2: t`Gauss’s law survives unchanged — and here there is no charge, so $\nabla\cdot\vec E = 0$ even though $\vec E$ is not zero.`,
        3: t`In the quasistatic regime the outside field of an ideal solenoid is still zero; what changes is $\vec E$.`,
      },
      hints: [t`Which of the four static laws is a curl law for $\vec E$?`, t`Faraday: $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$, and the flux through the circle is changing.`],
      teach: 'Of the static laws only the two curl equations change when fields vary in time.',
      explain: t`Round the circle, $\oint\vec E\cdot d\vec l = -d\Phi_B/dt \ne 0$ — a circulating electric field, outside the solenoid where $\vec B = 0$. The divergences, and the quasistatic $\vec B$ of the solenoid itself, are unchanged.`,
    }),
    multi({
      id: 'which-change', difficulty: 2,
      prompt: t`Which statements of statics must be **replaced** once fields and sources change in time? (Select all that apply.)`,
      visual: { type: 'em-gap', params: { at: 'wire', surface: 'bag', r: 3, controls: false, readout: false, t: 3 }, caption: t`A capacitor charging: current flows in the wire but not across the gap, so charge piles up on the plates. Fringing ignored.` },
      choices: [t`$\nabla\times\vec E = 0$`, t`$\nabla\times\vec B = \mu_0\vec J$`, t`$\nabla\cdot\vec J = 0$`, t`$\vec E = -\nabla V$`, t`$\nabla\cdot\vec E = \rho/\varepsilon_0$`, t`$\nabla\cdot\vec B = 0$`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`Gauss’s law holds at every instant, static or not.`,
        5: t`No monopoles, ever: $\nabla\cdot\vec B = 0$ is unchanged — which is why $\vec B = \nabla\times\vec A$ survives too.`,
      },
      hints: ['Both curl laws gain a time derivative. What follows from each of them in statics?', t`$\nabla\times\vec E = 0$ was what allowed $\vec E = -\nabla V$; and $\nabla\cdot(\nabla\times\vec B) = 0$ forced $\nabla\cdot\vec J = 0$.`],
      teach: 'The two curls gain time derivatives; with them go E = −∇V and ∇·J = 0, while the two divergence laws stand.',
      explain: t`Faraday’s law replaces $\nabla\times\vec E = 0$, and with it $\vec E = -\nabla V$ (now $\vec E = -\nabla V - \partial\vec A/\partial t$). Maxwell’s term replaces $\nabla\times\vec B = \mu_0\vec J$, and $\nabla\cdot\vec J = 0$ becomes the continuity equation $\nabla\cdot\vec J = -\partial\rho/\partial t$ — exactly what the charging plate in the picture needs. The divergence laws stay.`,
    }),
    num({
      id: 'phase-lag', difficulty: 2,
      gen(r) {
        const [what, L, f] = r.pick([['a 15 m launch-pad umbilical cable carrying a 1 MHz data signal', 15, 1e6], ['a 30 cm avionics board clocked at 100 MHz', 0.3, 1e8], ['a 4 m solar-array harness switching at 200 kHz', 4, 2e5], ['a 5 cm GPS receiver board at 1.575 GHz', 0.05, 1.57542e9], ['a 60 m test-stand cable carrying 60 Hz power', 60, 60]]);
        const deg = (360 * L * f) / C;
        return {
          prompt: t`Consider ${what}. By how many degrees of phase does the signal at the far end lag the near end, if the signal travels at $c$? (A device is quasistatic when this is a small fraction of $360^\circ$.)`,
          visual: waveSketch(t`A wave of wavelength $\lambda = c/f$ and a device of length $L$ (gold). Not to scale.`),
          answer: deg, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: (2 * PI * L * f) / C, feedback: t`That is the lag in radians, $2\pi L/\lambda$. Convert: multiply by $180/\pi$.` }],
          hints: [t`The light-crossing time is $L/c$; as a fraction of a period that is $Lf/c = L/\lambda$.`, t`Lag $= 360^\circ\times L/\lambda = 360^\circ\times Lf/c$.`],
          teach: 'A device is quasistatic when it is a small fraction of a wavelength across: the phase lag 360° × L/λ is tiny.',
          explain: t`$\lambda = c/f \approx ${tex(C / f, 3)}$ m, so the lag is $360^\circ\times${tex(L * f / C, 3)} \approx ${tex(deg, 3)}^\circ$. ${deg < 5 ? 'Small: the static formulas apply moment by moment.' : 'Not small: retardation matters, and the cable or board must be treated as a transmission line or antenna.'}`,
        };
      },
    }),
    mcq({
      id: 'no-potential', difficulty: 2,
      prompt: t`The induced electric field round a solenoid whose flux is changing circles it, as drawn. Why can it **not** be written as $-\nabla V$ for any potential $V$?`,
      visual: { type: 'field2d', params: { P: '-y*min(1, 1/(x^2 + y^2))', Q: 'x*min(1, 1/(x^2 + y^2))', x: [-3, 3], y: [-3, 3], probe: false, readout: false, particles: true, density: 13 }, caption: t`A circulating field like the induced $\vec E$ outside a solenoid (radius 1): growing linearly inside, falling as $1/s$ outside. Arrow colour shows strength.` },
      choices: [
        t`Its circulation round a loop enclosing the flux is not zero, but every gradient has zero circulation`,
        t`There is no charge, so $V$ would have to be zero everywhere`,
        t`It is too weak for a potential to be defined`,
        t`It changes in time, and potentials must be static`,
      ],
      answer: 0,
      why: {
        1: t`No charge does not force $V = 0$ — it forces $\nabla^2V = 0$, which many potentials obey. The real obstruction is the circulation.`,
        2: 'Size has nothing to do with it: a gradient field of any size has zero circulation.',
        3: t`Potentials may depend on time — $V(\vec r, t)$ is fine. A circulating field is still never a gradient.`,
      },
      hints: [t`What is $\oint(-\nabla V)\cdot d\vec l$ round any closed loop?`, t`And what is $\oint\vec E\cdot d\vec l$ for this $\vec E$?`],
      teach: 'A field with circulation is not a gradient: once ∇×E ≠ 0, E = −∇V − ∂A/∂t needs the vector potential too.',
      explain: t`$\oint(-\nabla V)\cdot d\vec l = 0$ for any single-valued $V$ (the fundamental theorem for gradients), but here $\oint\vec E\cdot d\vec l = -d\Phi_B/dt \ne 0$. In electrodynamics $\vec E = -\nabla V - \partial\vec A/\partial t$; the second term carries the circulation. Griffiths ch. 10 (this course’s M4) builds on it.`,
    }),
    num({
      id: 'lewin', difficulty: 3,
      gen(r) {
        const R1 = r.pick([100, 220, 470]), R2 = r.pick([680, 1000, 1500]), emf = r.pick([0.5, 1, 2]);
        const I = emf / (R1 + R2), V1 = I * R1;
        return {
          prompt: t`A ring made of two resistors, $R_1 = ${R1}\ \Omega$ and $R_2 = ${R2}\ \Omega$, joined at points P and Q, encircles a long solenoid whose changing flux induces an emf of ${emf} V round the ring. A voltmeter is clipped to P and Q with its leads running round the outside of $R_1$, so that its leads and $R_1$ enclose no flux. What does it read (in size)?`,
          visual: ringPic(t`The ring of $R_1$ and $R_2$ round the solenoid (blue, field out of the page and changing). Not to scale.`),
          answer: V1, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: emf / 2, feedback: t`The two resistors are not equal: the current $\mathcal E/(R_1 + R_2)$ drops $IR_1$ across $R_1$.` },
            { value: emf, feedback: t`The full emf is the circulation round the whole ring. The meter’s loop with $R_1$ encloses no flux, so it reads only the drop $IR_1$.` },
            { value: I * R2, feedback: t`That is the drop across $R_2$ — what a meter on the other side would read.` },
          ].filter((e) => Math.abs(e.value - V1) > 0.03 * V1),
          hints: [t`The current is $I = \mathcal E/(R_1 + R_2)$, the same in both resistors.`, t`The loop made by the meter, its leads and $R_1$ encloses no changing flux, so Kirchhoff’s loop rule holds for it: the meter reads $IR_1$.`],
          teach: 'With changing flux, the “voltage between two points” depends on the path: each meter reads the drop on its own side of the flux.',
          explain: t`$I = ${emf}/${R1 + R2} \approx ${tex(I, 3)}$ A, so the meter reads $IR_1 \approx ${nice(sf(V1, 3))}$ V. A second meter clipped to the same P and Q but running round $R_2$ reads $IR_2 \approx ${nice(sf(I * R2, 3))}$ V — with the opposite sign, going from P to Q. Both are right: their difference is the emf, because the two paths together enclose the changing flux. Walter Lewin’s famous lecture demonstration is exactly this.`,
        };
      },
    }),
    match({
      id: 'new-terms', difficulty: 2,
      prompt: 'Match each piece of electrodynamics to what it does.',
      visual: rampStill(0.03, t`A field region seen end-on, ramping, with the induced $\vec E$ circling inside it. Arrow lengths not to scale.`, { r: 0.03 }),
      left: [t`$-\partial\vec B/\partial t$ in Faraday’s law`, t`$\mu_0\varepsilon_0\,\partial\vec E/\partial t$ in Ampère’s law`, t`$\nabla\cdot\vec J = -\partial\rho/\partial t$`, t`$-\partial\vec A/\partial t$ in $\vec E$`],
      right: ['a changing magnetic field drives an electric field round it: transformers and generators', 'a changing electric field makes a magnetic field: light can exist', 'charge piles up wherever current converges', 'the part of E with circulation, so voltages depend on the path', 'magnetic charge can flow'],
      answer: [0, 1, 2, 3],
      hints: ['Two of these are the new curl terms; one is charge conservation; one is the new piece of the electric field.', 'No experiment has found magnetic charge.'],
      teach: 'Faraday’s term drives induction, Maxwell’s term makes light possible, continuity lets charge pile up, and −∂A/∂t is the part of E that circulates.',
      explain: t`Faraday’s $-\partial\vec B/\partial t$ is induction; Maxwell’s $\mu_0\varepsilon_0\partial\vec E/\partial t$ lets a changing $\vec E$ make $\vec B$, and the two together make waves; the continuity equation says charge is conserved locally; and $-\partial\vec A/\partial t$ is the piece of $\vec E$ that circulates. There is no magnetic charge in Maxwell’s equations as observed.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pad', difficulty: 2, transfer: true,
      gen(r) {
        const [std, f] = r.pick([['a Qi phone charger at 140 kHz', 1.4e5], ['an AirFuel resonant pad at 6.78 MHz', 6.78e6], ['an electric-car charging pad at 85 kHz', 8.5e4]]);
        const L = r.pick([0.1, 0.3, 0.6]), ratio = C / f / L;
        return {
          prompt: t`Wireless power is sent between two coils by ${std}; the pad is ${L * 100} cm across. How many pad-widths fit into one wavelength, $\lambda/L$?`,
          visual: waveSketch(t`A wavelength $\lambda$ and a device of size $L$ (gold). Not to scale.`),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: (f * L) / C, feedback: t`That is $L/\lambda$, the reciprocal. The question asks how many pads fit in a wavelength.` }],
          hints: [t`$\lambda = c/f$.`, t`Divide by the pad’s width $L$.`],
          teach: 'A charging pad is a tiny fraction of a wavelength across: it couples through the quasistatic near field (mutual inductance), not by radiation.',
          explain: t`$\lambda = c/f \approx ${tex(C / f, 3)}$ m, so $\lambda/L \approx ${tex(ratio, 3)}$. The pad is deep in the quasistatic regime: the coils are coupled by their mutual inductance (M1.3), the magnetic flux of one threading the other at the same instant — not by a radiated wave.`,
        };
      },
    }),
    num({
      id: 'cp-lewin', difficulty: 3,
      gen(r) {
        const R1 = r.pick([150, 330, 560]), R2 = r.pick([820, 1200, 2200]), V1 = r.pick([0.12, 0.25, 0.4]);
        const emf = (V1 * (R1 + R2)) / R1;
        return {
          prompt: t`In the ring of the picture, $R_1 = ${R1}\ \Omega$ and $R_2 = ${R2}\ \Omega$ encircle a changing flux. A voltmeter whose leads run round the outside of $R_1$ reads ${V1} V. What emf does the changing flux induce round the ring?`,
          visual: ringPic(t`The ring of $R_1$ and $R_2$ round the solenoid (blue). Not to scale.`),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: V1, feedback: t`The meter reads only the drop across $R_1$, not the whole circulation.` },
            { value: (V1 * R2) / R1, feedback: t`That is the drop across $R_2$. The emf is the sum of both drops: $I(R_1 + R_2)$.` },
          ],
          hints: [t`The meter reads $IR_1$, so $I = V_1/R_1$.`, t`The emf drives that current round the whole ring: $\mathcal E = I(R_1 + R_2)$.`],
          teach: 'Round a loop enclosing changing flux the drops add up to the emf, not to zero.',
          explain: t`$I = ${V1}/${R1} \approx ${tex(V1 / R1, 3)}$ A, and $\mathcal E = I(R_1 + R_2) \approx ${nice(sf(emf, 3))}$ V. A meter on the $R_2$ side would read $${nice(sf(emf - V1, 3))}$ V the other way: no single “voltage between P and Q” exists.`,
        };
      },
    }),
    mcq({
      id: 'cp-quasi', difficulty: 2,
      prompt: 'Which statement describes the quasistatic approximation correctly?',
      visual: waveSketch(t`A wavelength $\lambda$ and a device of size $L$ (gold). Not to scale.`),
      choices: [
        t`At each instant the fields are the static fields of the charges and currents at that instant; it holds when the system is much smaller than $c$ times the time over which its sources change`,
        'The fields do not change in time at all',
        'It holds whenever the currents are small enough',
        t`Faraday’s law is dropped, so $\vec E$ is electrostatic`,
      ],
      answer: 0,
      why: {
        1: 'Then it would be statics. Quasistatic fields change — slowly enough that they keep up with their sources.',
        2: t`The size of the current is irrelevant; what matters is the size of the system compared with the wavelength, $L \ll \lambda$.`,
        3: t`Faraday’s law is kept — a transformer is quasistatic. What is dropped is retardation (and usually the displacement current outside capacitors).`,
      },
      hints: [t`What has to be small for every part of a circuit to “see” the same instant?`, t`Compare the light-crossing time $L/c$ with the time over which the currents change.`],
      teach: 'Quasistatic means no retardation: fields follow their sources instantly, valid when L ≪ cT = λ.',
      explain: t`Quasistatic fields are computed from the present charges and currents with the static laws (Coulomb, Biot–Savart), plus Faraday’s law for the induced $\vec E$. That is exact enough when light crosses the system in a small fraction of the time its sources take to change — $L \ll \lambda$ — which covers motors, transformers and nearly every lab circuit, but not antennas or microwave boards.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), ch. 7 (§7.1–7.3) and §10.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Wireless Power Consortium, the Qi standard', url: 'https://www.wirelesspowerconsortium.com/' },
  ],
});
