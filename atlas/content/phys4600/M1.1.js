// Ohm's law and emf (Griffiths §7.1): J = σf, usually J = σE; resistance
// from the field by symmetry (coaxial electrodes, R = ln(b/a)/2πσL; a
// hemispherical ground electrode, R = 1/2πσa); why the steady field in a
// wire follows its bends (surface charge); the emf ℰ = ∮f·dl as the
// circulation of the *source* force, against the electrostatic E whose
// circulation is zero; the ideal battery, where f_s cancels E inside; motional
// emf and the flux rule, with the magnetic force doing no work (the hand on
// the bar does); the Faraday disk, ℰ = ½ωBa². Transfers: an electrodynamic
// tether in low Earth orbit, a launch-pad ground electrode.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { PI, SIGMA, sf, circle, polygon, bare, outOf, into, tag } from './_em4.js';

const t = String.raw;
const SIG_CU = SIGMA.copper.sigma, SIG_SEA = SIGMA.seawater.sigma;

// the worked example: a seawater conductivity cell, coaxial electrodes
const EX = { a: 2e-3, b: 10e-3, L: 0.05, sigma: SIG_SEA };
EX.R = Math.log(EX.b / EX.a) / (2 * PI * EX.sigma * EX.L);

/** Two coaxial electrodes end-on, with radial current arrows between them. */
const coaxPic = (caption, ra = 0.45, rb = 1.45) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.6, 1.6], {
    shade: [{ fn: `sqrt(max(${rb * rb} - x^2, 0))`, lower: `-sqrt(max(${rb * rb} - x^2, 0))`, from: -rb, to: rb, color: 'teal', alpha: 0.16 },
      { fn: `sqrt(max(${ra * ra} - x^2, 0))`, lower: `-sqrt(max(${ra * ra} - x^2, 0))`, from: -ra, to: ra, color: 'ink3', alpha: 0.7 }],
    curves: [circle(ra, 'ink2'), circle(rb, 'ink2', { width: 3 })],
    arrows: [0, 1, 2, 3, 4, 5].map((k) => { const a = 0.5 + (k * PI) / 3; return { from: [(ra + 0.12) * Math.cos(a), (ra + 0.12) * Math.sin(a)], to: [(rb - 0.15) * Math.cos(a), (rb - 0.15) * Math.sin(a)], color: 'warn', width: 2 }; }),
    points: [tag(0, 0, 'a', 'ink', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(rb * 0.72, -rb * 0.72, 'b', 'ink2', { labelDx: 8, labelDy: 8 }), tag(rb + 0.15, 0.9, 'J, E radial', 'warn')],
  }),
  caption,
});

/** A straight wire side-on with the field inside it. */
const wirePic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1, 1], {
    shade: [{ fn: '0.3', lower: '-0.3', from: -2.7, to: 2.7, color: 'gold', alpha: 0.3 }],
    curves: [{ fn: '0.3', domain: [-2.7, 2.7], color: 'gold', width: 1.5 }, { fn: '-0.3', domain: [-2.7, 2.7], color: 'gold', width: 1.5 }],
    arrows: [-1.8, -0.6, 0.6, 1.8].map((x) => ({ from: [x - 0.4, 0], to: [x + 0.4, 0], color: 'warn', width: 2.2 })),
    points: [tag(0, 0.55, 'E and J along the wire', 'warn', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(0, -0.6, 'I', 'ink2', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
  }),
  caption,
});

/** A Faraday disk: a conducting disk spinning in a uniform field into the page, brushes at the axle and the rim. */
const diskPic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.6, 1.6], {
    shade: [{ fn: 'sqrt(max(1.69 - x^2, 0))', lower: '-sqrt(max(1.69 - x^2, 0))', from: -1.3, to: 1.3, color: 'ink3', alpha: 0.35 }],
    curves: [circle(1.3, 'ink2'), { param: ['1.55*cos(t)', '1.55*sin(t)'], t: [0.3, 1.3], color: 'good', width: 2 }],
    arrows: [{ from: [0.12, 0], to: [1.2, 0], color: 'warn', width: 2.4, label: 'I', labelDx: -30, labelDy: -12 }, { from: [1.55 * Math.cos(0.45), 1.55 * Math.sin(0.45)], to: [1.55 * Math.cos(0.3), 1.55 * Math.sin(0.3)], color: 'good', width: 2 }],
    points: [...into(-0.65, 0.6, 'accent'), ...into(-0.65, -0.6, 'accent'), ...into(0.4, 0.75, 'accent'), ...into(0.4, -0.75, 'accent'),
      { x: 0, y: 0, r: 5, color: 'ink' }, { x: 1.3, y: 0, r: 5, color: 'ink' }, tag(1.3, 0, 'brush', 'ink2', { labelDx: 10, labelDy: 0 }), tag(0, 0, 'axle', 'ink2', { labelDx: -10, labelDy: 14, labelAlign: 'right' }), tag(1.1, 1.3, 'ω', 'good'), tag(-1.95, -1.3, 'B into page', 'accent')],
  }),
  caption,
});

/** A hemispherical electrode flush with the ground, current spreading radially into the soil. */
const groundPic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.7, 0.6], {
    shade: [{ fn: '0', lower: '-1.7', from: -3, to: 3, color: 'gold', alpha: 0.15 }, { fn: '0', lower: '-sqrt(max(0.16 - x^2, 0))', from: -0.4, to: 0.4, color: 'ink2', alpha: 0.8 }],
    curves: [{ fn: '0', domain: [-3, 3], color: 'ink3', width: 1.5 }],
    arrows: [-150, -120, -90, -60, -30].map((d) => { const a = (d * PI) / 180; return { from: [0.5 * Math.cos(a), 0.5 * Math.sin(a)], to: [1.45 * Math.cos(a), 1.45 * Math.sin(a)], color: 'warn', width: 2 }; }),
    points: [tag(0, 0.25, 'electrode, radius a', 'ink', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(1.6, -1.25, 'soil, σ', 'gold'), tag(-1.6, -0.5, 'J', 'warn', { labelAlign: 'right' })],
  }),
  caption,
});

/** A battery driving a resistor. */
const circuitPic = (caption, extra = {}) => ({ type: 'em-circuit', params: { circuit: 'single', values: { E: 9, R1: 30 }, flow: false, ...extra }, caption });

/** The bar on rails, pushed at a steady speed. */
const railsPic = (caption, extra = {}) => ({ type: 'em-faraday', params: { mode: 'rails', motion: 'push', B: 0.5, L: 0.2, R: 0.5, v: 0.5, play: false, graphs: [], readouts: [], arrows: ['v', 'I', 'F', 'Fapp'], ...extra }, caption });

export default lesson({
  id: 'phys4600.M1.1',
  title: 'Ohm’s law and emf',
  minutes: 15, difficulty: 2,
  equation: t`\vec J = \sigma\vec f, \qquad \mathcal E \equiv \oint\vec f\cdot d\vec l`,
  intro: t`To make charge flow you must push it. If $\vec f$ is the force per unit charge, then in most materials the current density is proportional to it: $\vec J = \sigma\vec f$, with $\sigma$ the **conductivity**. Usually the push is electromagnetic, $\vec f = \vec E + \vec v\times\vec B$, and the drift speed is so small that $\vec J = \sigma\vec E$ — **Ohm’s law**. But a steady electrostatic $\vec E$ has $\oint\vec E\cdot d\vec l = 0$: round a closed circuit it pushes as much against the current as with it, and cannot keep current flowing alone. Something else must drive the circuit: a **source** force $\vec f_s$ — chemical in a battery, magnetic in a generator. Its circulation is the **emf**, $\mathcal E = \oint\vec f\cdot d\vec l = \oint\vec f_s\cdot d\vec l$, a number of volts that is not a potential difference at all. The electrostatic field’s job is quieter: surface charges on the wires shape it so the current follows every bend.`,
  symbols: [
    { tex: '\\vec J', text: t`current density, in $\text{A/m}^2$: current per unit area across the flow` },
    { tex: '\\sigma', text: t`conductivity, in S/m (siemens per metre); its reciprocal $\rho = 1/\sigma$ is the resistivity, in Ω·m` },
    { tex: '\\vec f', text: t`the total force per unit charge on the carriers, in N/C = V/m: the source force $\vec f_s$ plus the electrostatic $\vec E$` },
    { tex: '\\mathcal E', text: 'the electromotive force (emf), in volts: the work done per unit charge by the driving force once round the circuit' },
    { tex: 'd\\vec l', text: 'a step along the circuit, in metres' },
  ],
  why: t`Every source of electrical power — battery, solar cell, generator, the tether a spacecraft drags through Earth’s field — is an emf, and telling it apart from the electrostatic field is the first step to Faraday’s law.`,
  visual: {
    type: 'em-faraday',
    title: 'Who does the work?',
    lead: t`A bar slides on rails through a field into the page, closing a circuit through a resistor. The magnetic force on the moving charges, $q\vec v\times\vec B$, is the **source** of the emf: $\mathcal E = vBL$. Yet a magnetic force does no work. Watch the power: what you push in, $F_{\text{app}}v$, is exactly what the resistor heats, $I^2R$.`,
    tasks: [
      t`Double the speed: the emf doubles, the current doubles, and the power you must supply goes up four times.`,
      t`Let the bar coast: with nobody pushing, the current’s magnetic force (Lenz) slows it to a stop — the field passed your work on to the resistor, it supplied none.`,
      t`Raise $R$: the current, the drag and the power all fall, but the emf $vBL$ is unchanged — emf is set by the source, not the load.`,
    ],
    params: { mode: 'rails', B: 0.5, L: 0.2, R: 0.5, mass: 0.05, motion: 'push', v: 0.5, motionChoice: true, motions: ['push', 'coast'], sliders: ['B', 'v', 'R'], readouts: ['emf', 'I', 'F', 'P'], graphs: ['v', 'I'] },
    caption: t`Frictionless rails of negligible resistance in a uniform field; the bar’s own resistance and inductance are ignored. Arrows show directions; their lengths are not to scale.`,
  },
  example: {
    prompt: t`An ocean buoy measures the conductivity of seawater with two coaxial electrodes: a rod of radius ${EX.a * 1e3} mm inside a tube of radius ${EX.b * 1e3} mm, both ${EX.L * 100} cm long, with seawater ($\sigma \approx ${SIG_SEA}\ \text{S/m}$) between them. What resistance does the cell present?`,
    visual: coaxPic(t`The cell end-on: the inner rod (radius $a$), the outer tube (radius $b$), and the current flowing radially through the seawater between (orange). Not to scale.`),
    steps: [
      { label: 'Symmetry', text: t`By symmetry the current flows straight outward, and a total current $I$ crosses every cylinder of radius $s$ between the electrodes: $I = J\cdot2\pi sL$, so $J = \dfrac{I}{2\pi sL}$.` },
      { label: 'Ohm locally', text: t`$\vec J = \sigma\vec E$ point by point, so $E = \dfrac{J}{\sigma} = \dfrac{I}{2\pi\sigma Ls}$, radial. The field is strongest at the inner rod, where the same current squeezes through the least area.` },
      { label: 'Voltage', text: t`$V = \displaystyle\int_a^b E\,ds = \frac{I}{2\pi\sigma L}\ln\frac{b}{a}$. The current is proportional to $V$ — Ohm’s law for the whole cell.` },
      { label: 'Resistance', text: t`$R = \dfrac{V}{I} = \dfrac{\ln(b/a)}{2\pi\sigma L} = \dfrac{\ln ${EX.b / EX.a}}{2\pi(${SIG_SEA})(${EX.L})} \approx ${nice(sf(EX.R, 3))}\ \Omega$.` },
      { label: 'Sense check', text: t`If the gap $d = b - a$ were thin, $\ln(b/a) \approx d/a$ and $R \approx \dfrac{d}{\sigma\,2\pi aL}$: length over (conductivity × area), the familiar $R = \rho\ell/A$ ✓. A cell like this, read at a known frequency to dodge electrode polarization, is how oceanographers measure salinity.` },
    ],
    answer: t`$R = \ln(b/a)/2\pi\sigma L \approx ${nice(sf(EX.R, 3))}\ \Omega$.`,
  },
  practice: [
    num({
      id: 'e-in-wire', difficulty: 1,
      gen(r) {
        const I = r.pick([2, 5, 10, 20]), d = r.pick([1, 1.5, 2, 2.5]);
        const A = (PI * (d * 1e-3) ** 2) / 4, E = I / (SIG_CU * A);
        return {
          prompt: t`A copper wire ${d} mm in diameter carries a steady ${I} A. How strong is the electric field inside it? (Copper: $\sigma = ${tex(SIG_CU, 3)}$ S/m.)`,
          visual: wirePic(t`A length of the wire side-on: inside, $\vec E$ and $\vec J$ point along it. Not to scale.`),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [
            { value: (I / (SIG_CU * PI * (d * 1e-3) ** 2)) * 1e3, feedback: t`The area is $\pi r^2$ with the **radius**, half the diameter.` },
            { value: (I * SIG_CU * A) * 1e3, feedback: t`$E = J/\sigma$: divide by the conductivity, do not multiply.` },
          ],
          hints: [t`$J = I/A$ with $A = \pi(d/2)^2$.`, t`Ohm’s law point by point: $E = J/\sigma$.`],
          teach: 'Inside a conductor carrying current, the field is J/σ: small for a good conductor, but not zero.',
          explain: t`$J = I/A \approx ${tex(I / A, 3)}\ \text{A/m}^2$, so $E = J/\sigma \approx ${nice(sf(E * 1e3, 3))}$ mV/m. A wire carrying current is **not** an equipotential: tens of millivolts per metre drive the current along it, which is why a long, thin supply cable drops voltage.`,
        };
      },
    }),
    num({
      id: 'coax-leak', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), b = r.pick([4, 6, 8]), L = r.pick([0.5, 1, 2]), sigma = r.pick([1e-4, 5e-4, 2e-3]);
        const R = Math.log(b / a) / (2 * PI * sigma * L);
        return {
          prompt: t`A coaxial cable ${L} m long has an inner conductor of radius ${a} mm and an outer one of radius ${b} mm. Its insulation has been soaked and now conducts slightly, with $\sigma = ${tex(sigma, 1)}$ S/m. What is the leakage resistance between the conductors?`,
          visual: coaxPic(t`The cable end-on: inner and outer conductors, with leakage current crossing the insulation radially (orange). Not to scale.`, 0.35, 1.45),
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: [
            { value: (b - a) * 1e-3 / (sigma * 2 * PI * a * 1e-3 * L), feedback: t`That treats the gap as thin, $R = d/\sigma A$ with the inner area. The area grows with radius: integrate, $R = \ln(b/a)/2\pi\sigma L$.` },
            { value: Math.log10(b / a) / (2 * PI * sigma * L), feedback: t`Use the natural logarithm: $\int ds/s = \ln$.` },
          ],
          hints: [t`A current $I$ crosses every cylinder of radius $s$: $J = I/2\pi sL$, and $E = J/\sigma$.`, t`$V = \int_a^b E\,ds = \dfrac{I}{2\pi\sigma L}\ln\dfrac{b}{a}$; divide by $I$.`],
          teach: 'For a resistor of awkward shape, find J by symmetry, E = J/σ, then V = ∫E·dl: R = V/I.',
          explain: t`$R = \dfrac{\ln(${b}/${a})}{2\pi(${tex(sigma, 1)})(${L})} \approx ${tex(R, 3)}\ \Omega$. A healthy cable’s insulation has $\sigma$ below $10^{-14}$ S/m — leakage resistances of teraohms; a test meter reading kiloohms tells you the cable is wet.`,
        };
      },
    }),
    mcq({
      id: 'loop-e', difficulty: 2,
      prompt: t`A battery drives a steady current through a resistor. Going once round the whole circuit, what is $\oint\vec E\cdot d\vec l$ for the electric field (through the battery too)?`,
      visual: circuitPic('A battery and a resistor; wire colour shows potential. Ideal wires.'),
      choices: [t`Zero`, t`The emf $\mathcal E$`, t`$IR$, the drop across the resistor`, t`$-\mathcal E$`],
      answer: 0,
      why: {
        1: t`$\mathcal E$ is the circulation of the **source** force $\vec f_s$, not of $\vec E$. A steady electric field is electrostatic, and its circulation vanishes.`,
        2: t`$\int\vec E\cdot d\vec l$ through the resistor is $IR$, but inside the battery $\vec E$ runs the other way and gives back $-IR$.`,
        3: t`Inside the battery $\vec E$ contributes $-\mathcal E$ (for an ideal one), but the resistor contributes $+\mathcal E$: the total is zero.`,
      },
      hints: [t`Is the electric field here changing in time? If not, what is its curl?`, t`A steady $\vec E$ is a gradient, and every gradient has zero circulation.`],
      teach: 'A steady E is electrostatic, so its circulation is zero: the emf comes from a different force, the source force, whose circulation is not.',
      explain: t`In steady state $\nabla\times\vec E = 0$, so $\oint\vec E\cdot d\vec l = 0$: across the resistor $\vec E$ points along the current, inside the battery it points against it, and the two cancel. The current keeps flowing because the battery’s chemical force $\vec f_s$ pushes charge *against* $\vec E$ inside the battery; $\mathcal E = \oint\vec f_s\cdot d\vec l$.`,
    }),
    mcq({
      id: 'surface-charge', difficulty: 2,
      prompt: t`A steady current flows round a right-angle bend in a wire. Inside the wire $\vec E$ turns the corner with the current. What makes the field follow the wire?`,
      visual: {
        type: 'graph',
        params: bare([-3, 3], [-1.6, 1.6], {
          shade: [{ fn: '0.25', lower: '-0.25', from: -2.6, to: 0.25, color: 'gold', alpha: 0.3 }, { fn: '1.5', lower: '-0.25', from: -0.25, to: 0.25, color: 'gold', alpha: 0.3 }],
          arrows: [{ from: [-2.2, 0], to: [-1.2, 0], color: 'warn', width: 2.2 }, { from: [0, 0.5], to: [0, 1.35], color: 'warn', width: 2.2 }],
          points: [tag(0.45, -0.45, '+ + +', 'bad', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(-0.6, 0.55, '− −', 'accent', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(-1.7, -0.55, 'I', 'ink2', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
        }),
        caption: t`A bend in a wire (gold) with the field inside it (orange) and a schematic of the surface charge at the corner. Not to scale: the charges are minute.`,
      },
      choices: [
        t`A thin layer of charge on the wire’s surface, built up in the first instant until the field inside points along the wire everywhere`,
        'The battery’s field, which naturally follows wires',
        'The magnetic field of the current, which bends the electrons round',
        'Nothing: the electrons simply follow the metal',
      ],
      answer: 0,
      why: {
        1: t`The battery’s own charges make a field that spreads through space in every direction; it knows nothing about where the wire goes.`,
        2: t`The current’s magnetic force on its own carriers is minute (and pinches them inward, the Hall effect of the wire on itself). It does not steer them round corners.`,
        3: t`Something must push the carriers round the bend: a force on charge is a field. If $\vec E$ pointed out of the wire, charge would pile up on the surface until it did not.`,
      },
      hints: [t`If at some point $\vec E$ pointed out through the wire’s side, where would the current carry charge?`, t`Charge piling up on the surface makes a field of its own — and it piles up until no current crosses the surface.`],
      teach: 'Surface charges on a circuit’s wires, set up in nanoseconds, shape the steady E so that it follows the wire everywhere.',
      explain: t`When the circuit is switched on, any field component across the wire drives charge onto its surface; that charge makes a field which cancels the cross-wire component. Within nanoseconds a thin, uneven layer of surface charge holds $\vec E$ along the wire at every point — and, outside, gives the field components that will matter in M2.2, when energy flows into the wire through its sides.`,
    }),
    num({
      id: 'faraday-disk', difficulty: 3,
      gen(r) {
        const a = r.pick([0.1, 0.15, 0.25]), B = r.pick([0.5, 1, 1.5]), rpm = r.pick([1200, 1800, 3000]);
        const w = (rpm * 2 * PI) / 60, emf = 0.5 * w * B * a * a;
        return {
          prompt: t`A Faraday disk — a copper disk of radius ${a * 100} cm spinning at ${rpm} rpm in a uniform ${B} T field along its axle — has brushes at the axle and the rim. What emf does it produce?`,
          visual: diskPic(t`The disk face-on, spinning clockwise in a field into the page, with brushes at the axle and rim; current flows along a radius (orange). Not to scale.`),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: w * B * a * a, feedback: t`A point at radius $s$ moves at $\omega s$, not $\omega a$: integrate $\int_0^a\omega sB\,ds = \tfrac12\omega Ba^2$.` },
            { value: (0.5 * rpm * B * a * a), feedback: t`Convert rpm to rad/s: $\omega = 2\pi\times\text{rpm}/60$.` },
          ],
          hints: [t`Along a radius the charges move at $v = \omega s$, so the magnetic force per charge is $vB = \omega sB$, outward along the radius.`, t`$\mathcal E = \int_0^a\omega sB\,ds = \tfrac12\omega Ba^2$, with $\omega$ in rad/s.`],
          teach: 'A Faraday disk’s emf is the circulation of v × B along a radius, ½ωBa² — a case where the flux through “the circuit” is hard to define but the force law never fails.',
          explain: t`$\omega = ${nice(sf(w, 4))}$ rad/s, so $\mathcal E = \tfrac12\omega Ba^2 \approx ${nice(sf(emf, 3))}$ V. Homopolar generators give low voltage at enormous current — they have powered railgun experiments. Here the flux rule needs care (which surface does the spinning disk’s “circuit” bound?), but $\mathcal E = \oint(\vec v\times\vec B)\cdot d\vec l$ always works.`,
        };
      },
    }),
    mcq({
      id: 'no-work', difficulty: 3,
      prompt: t`The bar on the rails is pushed at a steady speed, and the resistor warms up. The emf comes from the magnetic force on the bar’s charges, yet magnetic forces do no work. Where does the resistor’s energy come from?`,
      visual: railsPic(t`The bar pushed along the rails at a steady speed: the applied force (you), the current, and the magnetic drag on the bar. Arrow lengths not to scale.`),
      choices: [
        t`From whoever pushes the bar: the magnetic force on each charge has a component that resists the motion, and the push does the work against it`,
        'From the magnetic field, which loses energy as the resistor heats',
        'From the magnetic force along the bar, which does positive work on the charges',
        'From the battery that made the field',
      ],
      answer: 0,
      why: {
        1: t`A steady field’s energy does not change here; it only redirects the work.`,
        2: t`The charges move along the bar **and** with it, so their velocity is tilted and $q\vec v\times\vec B$ is perpendicular to it: the component along the bar does positive work, the component against the motion does exactly as much negative work.`,
        3: t`The field may come from a permanent magnet with no battery at all — and a steady field passes on no energy.`,
      },
      hints: [t`A charge in the bar moves sideways with the bar ($v$) and along it ($u$). Which way does $q(\vec v + \vec u)\times\vec B$ point?`, t`The part of the force from $\vec u\times\vec B$ opposes the bar’s motion: someone must push against it.`],
      teach: 'Magnetic forces do no work: in motional emf the work comes from whatever pushes the conductor, and B only redirects it.',
      explain: t`Each charge’s velocity is $\vec v + \vec u$ (with the bar, and along it); $q(\vec v + \vec u)\times\vec B$ is perpendicular to that, so its total work is zero. Its $\vec v\times\vec B$ part pushes the charge along the bar — the emf, $vBL$ — while its $\vec u\times\vec B$ part drags the bar back, the force $ILB$ you must push against. Your power $ILBv = I\mathcal E = I^2R$ is what heats the resistor.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([2, 5, 10, 20]), B = r.pick([20, 25, 30, 35]), v = r.pick([7.5, 7.6, 7.7]);
        const emf = v * 1e3 * B * 1e-6 * L * 1e3;
        return {
          prompt: t`A spacecraft in low Earth orbit at ${v} km/s trails a straight conducting tether ${L} km long, hanging vertically. Earth’s field there has a component of ${B} μT perpendicular to both the tether and the velocity. What emf appears along the tether?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.7, 1.7], {
            curves: [{ param: ['0', 't'], t: [-1.3, 1.1], color: 'gold', width: 2.5 }],
            arrows: [{ from: [0.2, 1.3], to: [1.5, 1.3], color: 'good', width: 2.2, label: 'v', labelDx: 6, labelDy: 0 }, { from: [0.35, 0.2], to: [0.35, -0.8], color: 'warn', width: 2, label: 'v × B', labelDx: 8, labelDy: 6 }],
            points: [{ x: 0, y: 1.3, r: 8, color: 'ink2' }, tag(0, 1.3, 'spacecraft', 'ink2', { labelDx: -12, labelDy: -14, labelAlign: 'right' }), tag(-0.15, -0.2, 'tether', 'gold', { labelAlign: 'right', labelDx: -6, labelDy: 0 }), ...outOf(-1.8, 0.6, 'accent'), ...outOf(-1.8, -0.6, 'accent'), ...outOf(1.8, -0.9, 'accent'), tag(-1.8, 0, 'B', 'accent', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
          }), caption: t`A tether moving through Earth’s field (drawn out of the page); the magnetic force per unit charge, $\vec v\times\vec B$, points along it. Not to scale.` },
          answer: emf / 1e3, units: 'kV', tol: { rel: 0.01 },
          hints: [t`Along the tether the force per unit charge is $vB$, the same everywhere.`, t`$\mathcal E = vBL$ in SI units.`],
          teach: 'A conductor moving through a field carries an emf vBL along it, the circulation of v × B.',
          explain: t`$\mathcal E = vBL = (${v}\times10^3)(${B}\times10^{-6})(${L}\times10^3) \approx ${nice(sf(emf / 1e3, 3))}$ kV. To draw current the tether must close its circuit through the ionosphere’s plasma; then the current’s drag ($ILB$) lowers the orbit and turns orbital energy into electrical power — or, driven backward by a power supply, raises it with no propellant. NASA and the Italian Space Agency’s TSS-1R tether, 19.7 km long, measured kilovolts in 1996.`,
        };
      },
    }),
    num({
      id: 'cp-ground', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.3, 0.5, 1]), sigma = r.pick([0.005, 0.01, 0.02]);
        const R = 1 / (2 * PI * sigma * a);
        return {
          prompt: t`A launch pad’s lightning protection runs into a hemispherical metal electrode of radius ${a} m, buried flush with the surface in soil of conductivity ${sigma} S/m. Treating the soil as uniform and infinitely deep, what is the electrode’s resistance to distant ground?`,
          visual: groundPic(t`The hemispherical electrode (grey) flush with the ground, current spreading radially through the soil (orange). Not to scale.`),
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: [
            { value: 1 / (4 * PI * sigma * a), feedback: t`The current spreads through a **hemisphere**, area $2\pi s^2$, not a full sphere.` },
            { value: a / (sigma * 2 * PI * a * a), feedback: t`$R = \text{length}/(\sigma\times\text{area})$ does not apply when the area grows with distance; integrate $E$ from $a$ to infinity.` },
          ].filter((e) => Math.abs(e.value - R) > 0.02 * R),
          hints: [t`A current $I$ crosses every hemisphere of radius $s$: $J = I/2\pi s^2$, and $E = J/\sigma$.`, t`$V = \int_a^\infty\dfrac{I}{2\pi\sigma s^2}\,ds = \dfrac{I}{2\pi\sigma a}$.`],
          teach: 'An electrode in the ground has a resistance set by its size and the soil: R = 1/2πσa for a hemisphere — most of it in the soil close to the electrode.',
          explain: t`$J = \dfrac{I}{2\pi s^2}$, $E = \dfrac{J}{\sigma}$, $V = \dfrac{I}{2\pi\sigma a}$, so $R = \dfrac{1}{2\pi\sigma a} \approx ${nice(sf(R, 3))}\ \Omega$. Half of that resistance lies within $2a$ of the electrode, which is why ground rods are surrounded by conductive backfill, and why a lightning strike makes a dangerous voltage gradient — a “step potential” — across the soil near it.`,
        };
      },
    }),
    mcq({
      id: 'cp-battery', difficulty: 2,
      prompt: t`An ideal battery (no internal resistance) sits on a shelf, connected to nothing. Inside it, how do the electrostatic field $\vec E$ and the chemical source force per unit charge $\vec f_s$ compare?`,
      visual: circuitPic('A battery like the one asked about, here driving a resistor. Ideal elements.', { flow: false, potential: true }),
      choices: [
        t`They are equal and opposite, so no current flows; $\mathcal E = \int\vec f_s\cdot d\vec l$ equals the potential difference across the terminals`,
        t`Both are zero, since no current flows`,
        t`$\vec E$ is zero and $\vec f_s$ points from $-$ to $+$`,
        t`They point the same way, from $+$ to $-$`,
      ],
      answer: 0,
      why: {
        1: t`The terminals are charged, so there is a field between them — inside the battery as well as outside.`,
        2: t`If $\vec E$ were zero inside, $\vec f_s$ would drive current inside the battery with nothing to stop it. The charge it piles on the terminals builds exactly the opposing $\vec E$.`,
        3: t`Then the net force $\vec f_s + \vec E$ would be large and current would flow; on the shelf the net force on the carriers must vanish.`,
      },
      hints: [t`In an ideal conductor with no current, the net force per unit charge, $\vec f_s + \vec E$, must be zero.`, t`So $\vec E = -\vec f_s$ inside, and $V = -\int_-^+\vec E\cdot d\vec l = \int_-^+\vec f_s\cdot d\vec l$.`],
      teach: 'Inside an idle ideal battery the chemical force and the electrostatic field cancel, so the terminal voltage equals the emf.',
      explain: t`With no current, the net force on the carriers inside is zero: $\vec f_s + \vec E = 0$. So $V = -\int_-^+\vec E\cdot d\vec l = \int_-^+\vec f_s\cdot d\vec l = \mathcal E$. Connect a load and current flows; with internal resistance $r$, the terminal voltage drops to $\mathcal E - Ir$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §7.1 and Table 7.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
  ],
});
