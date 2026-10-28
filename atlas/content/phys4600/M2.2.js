// Poynting's theorem (Griffiths §8.1.2): the work-energy theorem of
// electrodynamics, dW/dt = −d/dt∫u dτ − ∮S·da with u = ½(ε₀E² + B²/μ₀) and
// S = E×B/μ₀, derived from the work done on charges using Ampère–Maxwell,
// Faraday and a product rule; locally ∂u/∂t + ∇·S = −J·E. Beyond PHYS 3750
// W12.1's heating wire: the three showcases of the em4-poynting sim — a
// resistor taking in I²R through its sides, a charging capacitor taking in
// d/dt(½CV²) through the rim of its gap (and S growing ∝ s inside), a coaxial
// line carrying VI in the dielectric, crowded toward the inner conductor —
// plus the static case (a charge beside a magnet) where S circulates with
// zero divergence. Transfers: a Hall thruster's power cable, a pulsed-power
// capacitor dumping its energy out through its rim.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, PI, sf } from './_em4.js';

const t = String.raw;

// the worked example: plates of radius 5 cm, 2 mm apart, at 100 V and charging with 0.5 A
const EX = { R: 0.05, d: 2e-3, V: 100, I: 0.5 };
EX.E = EX.V / EX.d;
EX.B = (MU0 * EX.I) / (2 * PI * EX.R);
EX.S = (EX.E * EX.B) / MU0;
EX.A = 2 * PI * EX.R * EX.d;
EX.P = EX.S * EX.A;
EX.C = (EPS0 * PI * EX.R ** 2) / EX.d;

/** An em4-poynting still with no controls or readouts. */
const pic = (params, caption) => ({ type: 'em4-poynting', params: { controls: false, readout: false, ...params }, caption });

export default lesson({
  id: 'phys4600.M2.2',
  title: 'Poynting’s theorem',
  minutes: 17, difficulty: 3,
  equation: t`\begin{gathered}\frac{dW}{dt} = -\frac{d}{dt}\int_{\mathcal V}u\,d\tau - \oint_{\mathcal S}\vec S\cdot d\vec a, \\ u = \tfrac12\left(\varepsilon_0E^2 + \frac{B^2}{\mu_0}\right), \\ \vec S = \frac{1}{\mu_0}\vec E\times\vec B\end{gathered}`,
  intro: t`The fields do work on charges at the rate $\int\vec E\cdot\vec J\,d\tau$ — the magnetic force does none. Replace $\vec J$ using the Ampère–Maxwell law, use Faraday’s law and the product rule for $\nabla\cdot(\vec E\times\vec B)$, and the work rate splits into two pieces: the fall of the field energy inside the volume, with density $u$, and the flow of energy out through its surface, with flux density $\vec S$ — the **Poynting vector**, in watts per square metre. Locally, $\partial u/\partial t + \nabla\cdot\vec S = -\vec J\cdot\vec E$: the continuity equation of [M2.1](#/lesson/phys4600.M2.1) with a source. PHYS 3750 used it on a heating wire; here it overturns the circuit picture completely. Energy does not ride along inside wires with the electrons: it travels through the **space around** them, and enters a resistor, a capacitor or a load through its surface.`,
  symbols: [
    { tex: 'W', text: 'the work done by the fields on the charges in the volume, in joules' },
    { tex: 'u', text: t`the energy density of the field, in $\text{J/m}^3$` },
    { tex: '\\vec S', text: t`the Poynting vector, the energy flux density of the field, in $\text{W/m}^2$` },
    { tex: '\\mathcal V,\\ \\mathcal S', text: 'a fixed volume and the closed surface bounding it' },
    { tex: 'd\\vec a', text: 'an element of that surface, pointing outward, in m²' },
    { tex: '\\vec E,\\ \\vec B', text: 'the electric and magnetic fields, in V/m and T' },
  ],
  why: t`Poynting’s theorem is how sunlight’s power reaches a solar array and how a thruster’s power gets down its cable — and $u$ and $\vec S$ are two rows of the electromagnetic stress–energy tensor that sources gravity in general relativity.`,
  visual: {
    type: 'em4-poynting',
    title: 'Where the energy goes',
    lead: t`Three circuits seen side-on, with the electric field (orange), the magnetic field (blue) and the Poynting vector $\vec S = \vec E\times\vec B/\mu_0$ (gold). Choose the set-up and compare the total flow of $\vec S$ through a surface with the power it must account for.`,
    tasks: [
      t`**Resistor**: $\vec S$ points straight **in** through the side, and $\oint\vec S\cdot d\vec a$ equals $VI = I^2R$ exactly — the heat arrives from outside the wire.`,
      t`**Capacitor**: the energy enters through the rim of the gap, not along the wires. Make $I$ negative (discharging): $\vec S$ reverses and the energy leaves the same way.`,
      t`**Coax**: the flow runs between the conductors, crowded toward the inner one; its total is $VI$, the power the load receives.`,
    ],
    params: { mode: 'wire', modes: ['wire', 'capacitor', 'coax'], V: 12, I: 2, controls: ['V', 'I'] },
    caption: t`Quasistatic and idealized: perfect leads, fringing ignored, and outside the resistor only the surface value of $\vec E$ along it (the surface charges that also give $\vec E$ a radial part are left out). Directions are exact; arrow lengths only roughly to scale.`,
  },
  example: {
    prompt: t`Circular plates of radius ${EX.R * 100} cm, ${EX.d * 1e3} mm apart, are at ${EX.V} V and charging with ${EX.I} A. Find the Poynting vector at the rim of the gap, the total power flowing in through the rim, and check it against the rate of change of the stored energy.`,
    visual: pic({ mode: 'capacitor', V: EX.V, I: EX.I }, t`The charging capacitor side-on: $\vec E$ across the gap, $\vec B$ circling (out of the page above the axis), $\vec S$ pointing in through the rim. Not to scale.`),
    steps: [
      { label: 'The fields', text: t`Between the plates $E = V/d = ${tex(EX.E, 3)}$ V/m. At the rim the displacement current enclosed is all of $I$, so $B = \dfrac{\mu_0I}{2\pi R} \approx ${nice(sf(EX.B * 1e6, 3))}$ μT ([M1.4](#/lesson/phys4600.M1.4)).` },
      { label: 'Direction', text: t`$\vec E$ runs from the $+$ plate to the $-$ plate, $\vec B$ circles the axis, and $\vec E\times\vec B$ points **toward the axis**: energy flows in through the rim.` },
      { label: 'Size', text: t`$S = \dfrac{EB}{\mu_0} \approx ${tex(EX.S, 3)}\ \text{W/m}^2$. The rim is a band of area $2\pi Rd \approx ${tex(EX.A, 3)}$ m², so the inflow is $S\cdot2\pi Rd \approx ${nice(sf(EX.P, 3))}$ W.` },
      { label: 'Check', text: t`Stored energy $U = \tfrac12CV^2$ with $dV/dt = I/C$: $dU/dt = CV\,dV/dt = VI = ${nice(EX.V * EX.I)}$ W ✓. Algebraically, $\dfrac{V}{d}\dfrac{I}{2\pi R}\cdot2\pi Rd = VI$, for any plate size.` },
      { label: 'Inside', text: t`Within the gap $B \propto s$, so $S \propto s$ too: energy flows in from the rim and is deposited evenly as it goes, $-\nabla\cdot\vec S = \partial u/\partial t$ at every point.` },
    ],
    answer: t`$S \approx ${tex(EX.S, 3)}\ \text{W/m}^2$ inward at the rim; $${nice(sf(EX.P, 3))}$ W flows in, equal to $d(\tfrac12CV^2)/dt = VI$.`,
  },
  practice: [
    mcq({
      id: 'direction', difficulty: 1,
      prompt: t`A steady current flows to the right through a resistor. Which way does the Poynting vector point at the resistor’s surface?`,
      visual: pic({ mode: 'wire', hide: ['S'] }, t`The resistor side-on with $\vec E$ along it and $\vec B$ circling it (out of the page above, into it below). $\vec S$ is the question.`),
      choices: ['Radially inward, into the resistor', 'Along the resistor, with the current', 'Radially outward, away from the resistor', 'Along the resistor, against the current'],
      answer: 0,
      why: {
        1: t`$\vec E$ points along the wire and $\vec B$ round it, so $\vec E\times\vec B$ is perpendicular to both: radial.`,
        2: t`Outward would mean the resistor supplies energy. Check $\vec E\times\vec B$ above the wire: right × out of the page = down, into it.`,
        3: t`$\vec S$ has no component along a uniform resistor’s surface when $\vec E$ is along it and $\vec B$ round it.`,
      },
      hints: [t`Above the wire: $\vec E$ points right, $\vec B$ points out of the page.`, t`Right × out of the page = down (use $\hat x\times\hat z = -\hat y$).`],
      teach: 'At a resistor’s surface S = E × B/μ₀ points straight in: the heat arrives through the sides.',
      explain: t`Above the wire, $\hat x\times\hat z = -\hat y$: down, into it. Below, $\hat x\times(-\hat z) = +\hat y$: up, into it. The resistor absorbs energy through its whole side; none flows along its inside.`,
    }),
    num({
      id: 'wire-S', difficulty: 2,
      gen(r) {
        const I = r.pick([1, 2, 5, 10]), Rr = r.pick([2, 5, 10, 20]), a = r.pick([0.25, 0.5, 1]), L = r.pick([5, 10, 20]);
        const S = (I * I * Rr) / (2 * PI * a * 1e-3 * L * 1e-2);
        return {
          prompt: t`A cylindrical resistor of ${Rr} Ω, ${L} cm long and ${a} mm in radius, carries a steady ${I} A. How large is the Poynting vector at its surface?`,
          visual: pic({ mode: 'wire', I, V: I * Rr }, t`The resistor side-on, with $\vec S$ (gold) pointing in through its side. Not to scale.`),
          answer: S / 1e3, units: 'kW/m^2', tol: { rel: 0.01 },
          errors: [{ value: (I * I * Rr) / (PI * (a * 1e-3) ** 2) / 1e3, feedback: t`The energy enters through the **side**, area $2\pi aL$, not through the end, $\pi a^2$.` }],
          hints: [t`At the surface $E = V/L = IR/L$ and $B = \mu_0I/2\pi a$.`, t`$S = \dfrac{EB}{\mu_0} = \dfrac{I^2R}{2\pi aL}$ — the power over the side area.`],
          teach: 'The Poynting flux into a resistor is its power I²R spread over its side area 2πaL.',
          explain: t`$S = \dfrac{EB}{\mu_0} = \dfrac{I^2R}{2\pi aL} \approx ${nice(sf(S / 1e3, 3))}$ kW/m², and multiplied by the side area that is $I^2R = ${I * I * Rr}$ W exactly.`,
        };
      },
    }),
    num({
      id: 'cap-rim', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 8]), d = r.pick([0.5, 1, 3]), V = r.pick([10, 50, 200]), I = r.pick([0.1, 0.5, 2]);
        const S = ((V / (d * 1e-3)) * ((MU0 * I) / (2 * PI * R * 1e-2))) / MU0;
        return {
          prompt: t`Circular plates of radius ${R} cm and gap ${d} mm are at ${V} V and charging with ${I} A. What is the size of the Poynting vector at the rim of the gap?`,
          visual: pic({ mode: 'capacitor', V, I }, t`The charging capacitor side-on with $\vec S$ (gold) flowing in through the rim. Not to scale.`),
          answer: S / 1e3, units: 'kW/m^2', tol: { rel: 0.01 },
          errors: [{ value: (V / (d * 1e-3)) * ((MU0 * I) / (2 * PI * R * 1e-2)) / 1e3, feedback: t`Divide by $\mu_0$: $S = EB/\mu_0$.` }],
          hints: [t`$E = V/d$; at the rim $B = \mu_0I/2\pi R$.`, t`$S = EB/\mu_0 = \dfrac{VI}{2\pi Rd}$.`],
          teach: 'A charging capacitor takes its energy in through the rim of its gap: S = VI/(2πRd) there.',
          explain: t`$S = \dfrac{V}{d}\cdot\dfrac{I}{2\pi R} = \dfrac{VI}{2\pi Rd} \approx ${nice(sf(S / 1e3, 3))}$ kW/m², and times the rim’s area $2\pi Rd$ that is $VI = ${nice(sf(V * I, 3))}$ W, the rate the stored energy grows.`,
        };
      },
    }),
    num({
      id: 'coax-S', difficulty: 3,
      gen(r) {
        const V = r.pick([50, 100, 300]), I = r.pick([1, 2, 5]), a = r.pick([0.5, 1]), b = r.pick([3, 4, 6]), s = r.pick([1.5, 2, 2.5]);
        const S = (V * I) / (2 * PI * (s * 1e-3) ** 2 * Math.log(b / a));
        return {
          prompt: t`A coaxial cable (inner radius ${a} mm, outer ${b} mm) delivers ${I} A to a load at ${V} V. What is the Poynting vector ${s} mm from the axis, in the insulation?`,
          visual: pic({ mode: 'coax', V, I, ca: a, cb: b }, t`The coax side-on: $\vec E$ radial, $\vec B$ circling, $\vec S$ (gold) along the gap toward the load, strongest near the inner conductor. Not to scale.`),
          answer: S / 1e6, units: 'MW/m^2', tol: { rel: 0.01 },
          errors: [
            { value: (V * I) / (PI * ((b * 1e-3) ** 2 - (a * 1e-3) ** 2)) / 1e6, feedback: t`That spreads $VI$ evenly over the gap. $S \propto 1/s^2$: it crowds toward the inner conductor.` },
            { value: (V * I) / (2 * PI * (s * 1e-3) ** 2 * Math.log10(b / a)) / 1e6, feedback: t`Use the natural logarithm in $E = V/(s\ln(b/a))$.` },
          ],
          hints: [t`Between the conductors $E = \dfrac{V}{s\ln(b/a)}$ and $B = \dfrac{\mu_0I}{2\pi s}$.`, t`$S = \dfrac{EB}{\mu_0} = \dfrac{VI}{2\pi s^2\ln(b/a)}$.`],
          teach: 'In a coax the energy flows along the dielectric with S ∝ 1/s², and its integral over the gap is exactly VI.',
          explain: t`$S = \dfrac{VI}{2\pi s^2\ln(b/a)} \approx ${nice(sf(S / 1e6, 3))}$ MW/m². Integrating over the annulus, $\int_a^b S\,2\pi s\,ds = VI$: the cable’s whole power travels in its insulation.`,
        };
      },
    }),
    mcq({
      id: 'coax-where', difficulty: 2,
      prompt: t`A coaxial cable carries power from a transmitter to an antenna. Where does that power travel?`,
      visual: pic({ mode: 'coax' }, t`A coax side-on with its fields and the Poynting flow. Not to scale.`),
      choices: [
        'In the insulation between the conductors, carried by the fields',
        'Inside the copper, carried by the moving electrons',
        'Outside the cable, in the air around it',
        'Half in the inner conductor and half in the outer one',
      ],
      answer: 0,
      why: {
        1: t`The electrons drift at millimetres per second; their kinetic energy is negligible. Inside a good conductor $\vec E$ is tiny, so $\vec S$ there is tiny too.`,
        2: t`Outside the shield the net current is zero, so $\vec B = 0$ and $\vec S = 0$.`,
        3: t`The conductors guide the flow and take a little of it as heat, but $\vec E\times\vec B$ is large only between them.`,
      },
      hints: [t`Where are both $\vec E$ and $\vec B$ large?`, t`$\vec S = \vec E\times\vec B/\mu_0$ with $E$ radial and $B$ circling: along the cable.`],
      teach: 'Electrical power travels in the fields between conductors; the wires guide it and absorb a little.',
      explain: t`Between the conductors $\vec E$ is radial and $\vec B$ circles, so $\vec S$ runs along the cable and integrates to $VI$. The copper takes in a small inward flux — its own $I^2R$ loss — and this is why the dielectric, not the copper, sets a cable’s speed ($v = c/\sqrt{\varepsilon_r}$).`,
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Put the derivation of Poynting’s theorem in order.`,
      visual: pic({ mode: 'wire' }, t`A resistor taking in energy through its side. Not to scale.`),
      items: [
        t`The fields do work on charges at the rate $\int\vec E\cdot\vec J\,d\tau$.`,
        t`Use Ampère–Maxwell: $\vec J = \nabla\times\vec B/\mu_0 - \varepsilon_0\,\partial\vec E/\partial t$.`,
        t`Use $\vec E\cdot(\nabla\times\vec B) = \vec B\cdot(\nabla\times\vec E) - \nabla\cdot(\vec E\times\vec B)$.`,
        t`Use Faraday: $\nabla\times\vec E = -\partial\vec B/\partial t$.`,
        t`Collect: $\vec E\cdot\vec J = -\partial u/\partial t - \nabla\cdot\vec S$.`,
        t`Integrate over the volume and apply the divergence theorem.`,
      ],
      hints: ['Start from the work done on the charges; eliminate the current.', 'A product rule turns E·(∇×B) into a divergence plus a term Faraday can rewrite.'],
      teach: 'Poynting’s theorem comes from the work done on charges, with J replaced by the fields and one product rule.',
      explain: t`$\vec E\cdot\vec J = \tfrac{1}{\mu_0}\vec E\cdot(\nabla\times\vec B) - \varepsilon_0\vec E\cdot\partial_t\vec E$; the product rule and Faraday turn the first term into $-\tfrac{1}{\mu_0}\vec B\cdot\partial_t\vec B - \tfrac{1}{\mu_0}\nabla\cdot(\vec E\times\vec B)$. Together, $\vec E\cdot\vec J = -\partial_tu - \nabla\cdot\vec S$; the divergence theorem gives the integral form.`,
    }),
    mcq({
      id: 'static-S', difficulty: 3,
      prompt: t`A point charge sits at rest beside a permanent magnet. Nothing changes. What does Poynting’s theorem say about $\vec S = \vec E\times\vec B/\mu_0$ there?`,
      visual: { type: 'em3h-magnet', params: { ratio: 1.2, show: 'B', controls: false, readout: false, probe: false, inset: false }, caption: t`A permanent magnet’s $\vec B$ lines. Place a charge beside it and $\vec E\times\vec B$ is non-zero almost everywhere. Exact field of a uniformly magnetized cylinder.` },
      choices: [
        t`$\vec S$ is non-zero but has zero divergence: energy circulates in closed loops and nowhere gains or loses any`,
        t`$\vec S$ must be zero, because nothing changes`,
        t`$\vec S$ is non-zero, so the field energy steadily drains away`,
        t`Poynting’s theorem does not apply to static fields`,
      ],
      answer: 0,
      why: {
        1: t`$\vec E\times\vec B$ is plainly non-zero where both fields are; the theorem requires only $\nabla\cdot\vec S = 0$ when $u$ is steady and $\vec J\cdot\vec E = 0$.`,
        2: t`Then $\partial u/\partial t \ne 0$; but nothing changes. $\nabla\cdot\vec S = -\partial u/\partial t = 0$.`,
        3: 'It applies to all fields; for static ones it says the flux of S through any closed surface is zero.',
      },
      hints: [t`With nothing changing and no current, what are $\partial u/\partial t$ and $\vec J\cdot\vec E$?`, t`Then $\nabla\cdot\vec S = 0$. Does that force $\vec S = 0$?`],
      teach: 'S can circulate in static fields with zero divergence: no energy builds up anywhere — but it carries momentum and angular momentum (M2.4).',
      explain: t`With $\partial_tu = 0$ and $\vec J = 0$, Poynting’s theorem gives $\nabla\cdot\vec S = 0$: $\vec S$ circulates round the magnet without piling energy up anywhere. Is that circulation “real”? It cannot be detected as energy, but $\vec S/c^2$ is momentum density, and the angular momentum it carries is measurable — the subject of M2.4.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cable', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([1350, 4500, 6000]), V = r.pick([300, 400]), a = r.pick([1, 1.5]), b = r.pick([4, 5]);
        const I = P / V, S = (V * I) / (2 * PI * (a * 1e-3) ** 2 * Math.log(b / a));
        return {
          prompt: t`A Hall thruster draws ${P} W at ${V} V through a coaxial power cable with inner radius ${a} mm and outer radius ${b} mm. What is the Poynting vector in the insulation just outside the inner conductor?`,
          visual: pic({ mode: 'coax', V: 30, I: 3, ca: a, cb: b }, t`The cable side-on with its fields and the flow of energy toward the thruster. Not to scale.`),
          answer: S / 1e6, units: 'MW/m^2', tol: { rel: 0.01 },
          errors: [{ value: P / (PI * ((b * 1e-3) ** 2 - (a * 1e-3) ** 2)) / 1e6, feedback: t`$S$ is not uniform across the gap: it falls as $1/s^2$, so at the inner conductor it is well above the average.` }],
          hints: [t`$S(s) = \dfrac{VI}{2\pi s^2\ln(b/a)}$ with $VI = P$.`, t`Evaluate at $s = a$.`],
          teach: 'A cable’s power density peaks at the inner conductor’s surface, where E is strongest — which is also where its insulation is most stressed.',
          explain: t`$S(a) = \dfrac{P}{2\pi a^2\ln(b/a)} \approx ${nice(sf(S / 1e6, 3))}$ MW/m² — about $${tex(S / 1361, 2)}$ times the solar constant, flowing through millimetres of insulation toward the thruster.`,
        };
      },
    }),
    num({
      id: 'cp-dump', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([5, 10]), d = r.pick([1, 2]), V = r.pick([1, 2, 5]), I = r.pick([1, 5, 10]);
        const S = (V * 1e3 * I * 1e3) / (2 * PI * R * 1e-2 * d * 1e-3);
        return {
          prompt: t`A pulsed-power capacitor (circular plates of radius ${R} cm, gap ${d} mm) is at ${V} kV and discharging with ${I} kA. How large is the Poynting vector at the rim of its gap, and which way does it point?`,
          visual: pic({ mode: 'capacitor', V: 20, I: -2, hide: ['S'] }, t`The capacitor side-on while discharging: $\vec E$ still points across the gap, but $\vec B$ has reversed. Not to scale.`),
          answer: S / 1e9, units: 'GW/m^2', tol: { rel: 0.01 },
          errors: [{ value: (V * 1e3 * I * 1e3) / (PI * (R * 1e-2) ** 2) / 1e9, feedback: t`The energy leaves through the rim of the gap, area $2\pi Rd$, not through the plates’ face.` }],
          hints: [t`$S = \dfrac{EB}{\mu_0}$ with $E = V/d$ and $B = \mu_0I/2\pi R$ at the rim.`, t`So $S = \dfrac{VI}{2\pi Rd}$, now pointing **outward**, since $\vec B$ reverses with the current.`],
          teach: 'A discharging capacitor sends its energy out through the rim of its gap: S = VI/(2πRd), outward.',
          explain: t`$S = \dfrac{VI}{2\pi Rd} \approx ${nice(sf(S / 1e9, 3))}$ GW/m², pointing **outward** through the rim: with the current reversed, $\vec B$ reverses and so does $\vec E\times\vec B$. The energy streams out of the gap and along the leads’ fields to the load.`,
        };
      },
    }),
    mcq({
      id: 'cp-battery', difficulty: 2,
      prompt: t`A battery lights a bulb at the end of two long, parallel wires. How does the energy get from the battery to the bulb?`,
      visual: pic({ mode: 'wire' }, t`The bulb’s filament is a resistor: the energy enters it through its side. Not to scale.`),
      choices: [
        'Through the space around and between the wires, as a Poynting flow the wires guide, entering the filament through its surface',
        'Inside the wires, carried by electrons that drift from the battery to the bulb',
        'As kinetic energy of the electrons, which slow down in the filament',
        'Along the outer surface of the wires only',
      ],
      answer: 0,
      why: {
        1: t`The electrons drift at about a millimetre per second; the lamp lights almost at once. Energy does not wait for them.`,
        2: 'The drift kinetic energy is minute, and it is the same on both sides of the filament (the current is the same).',
        3: t`$\vec S$ fills the space between and around the wires, wherever both $\vec E$ (from surface charges) and $\vec B$ are.`,
      },
      hints: ['How fast do the electrons actually drift in a wire?', t`Where are $\vec E$ (from the wires’ surface charges) and $\vec B$ (from the currents) both non-zero?`],
      teach: 'Circuits move energy through the fields around the wires; the electrons only steer it.',
      explain: t`The wires’ surface charges make an $\vec E$ in the space between them, the currents make a $\vec B$, and $\vec S = \vec E\times\vec B/\mu_0$ carries the power from the battery’s surface to the filament’s, entering it from the side. The current only sets up and guides the fields.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §8.1.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Feynman, Leighton and Sands, The Feynman Lectures on Physics, vol. II, ch. 27: field energy and field momentum', url: 'https://www.feynmanlectures.caltech.edu/II_27.html' },
  ],
});
