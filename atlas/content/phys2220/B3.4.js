// Induced electric fields: a changing magnetic field makes an electric field,
// wire or no wire. Its lines close on themselves round the changing flux, so
// ∮E·dl = −dΦ/dt is not zero and it has no potential. Round a long solenoid,
// E = (r/2) dB/dt inside and (R²/2r) dB/dt outside, where B itself is zero.
import { lesson, mcq, num } from '../../src/core/content.js';
import { COL, QE, tn, r6, lab, circ2, fieldMarks, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
/** A solenoid's field ramping up (end on), with a circular path or ring of radius r (m). A still mid-ramp unless told. */
const solPic = ({ Rf = 0.05, r = 0.03, B0 = 0.5, tr = 1, ring = false, arrows = ['E'], graphs = ['B'], at = null, caption, extra = {} }) => ({
  type: 'em-faraday',
  params: { mode: 'ramp', Rf, r, B0, tr, ring, ...(at === null ? {} : { t: at }), play: false, arrows, graphs, readouts: [], ...extra },
  caption,
});

// the worked example: R = 4 cm, dB/dt = 0.50 T/s, E at 3 cm and 10 cm
const EX = { R: 0.04, dB: 0.5, r1: 0.03, r2: 0.1 };
EX.E1 = (EX.r1 / 2) * EX.dB; EX.E2 = ((EX.R * EX.R) / (2 * EX.r2)) * EX.dB; EX.lap = PI * EX.R ** 2 * EX.dB;

export default lesson({
  id: 'phys2220.B3.4',
  title: 'Induced electric fields',
  minutes: 14, difficulty: 3,
  intro: t`What pushes the charges round a loop when the flux through it changes? Not a magnetic force — the charges in a still loop are not moving. It is an **electric field**, made by the changing magnetic field itself, and it is there whether or not any wire is. Faraday’s law is really a statement about that field: round any closed path,

$$\oint \vec E\cdot d\vec l = -\frac{d\Phi_B}{dt}$$

where $\Phi_B$ is the flux through the path. This induced field is not like the field of charges. Its lines have no start or end: they close on themselves, curling round the changing flux, so taking a charge once round does net work on it. There is no potential for such a field, and “the voltage between two points” stops meaning one thing.

For a long solenoid of radius $R$ whose field changes, symmetry makes E circle the axis, the same size all round each circle. Taking a circle of radius $r$ as the path: inside, $E(2\pi r) = \pi r^2\,dB/dt$, so $E = \tfrac{r}{2}\,dB/dt$; outside, the flux stops growing at $R$, so $E = \tfrac{R^2}{2r}\,dB/dt$ — not zero, though B is zero there.`,
  symbols: [
    { tex: '\\vec E', text: 'the induced electric field, in V/m (the same as N/C)' },
    { tex: 'd\\vec l', text: 'a short step along the closed path; the integral adds up $\\vec E\\cdot d\\vec l$ all the way round' },
    { tex: '\\Phi_B', text: 'the magnetic flux through the surface the path encloses, in Wb' },
    { tex: 'R', text: 'the radius of the solenoid, in m' },
    { tex: 'r', text: 'the distance from the solenoid’s axis, in m' },
    { tex: 'dB/dt', text: 'how fast the solenoid’s field changes, in T/s' },
  ],
  why: 'Induced electric fields accelerate electrons to tens of MeV in a betatron, heat the pan on an induction hob, drive the current in every transformer’s secondary — and they are half of what light is: a changing B making an E, and a changing E making a B.',
  visual: {
    type: 'em-faraday',
    title: 'E without wires',
    lead: t`A long solenoid seen end on, its field ramped up, held, and ramped down. Gold arrows: the induced electric field. Take the ring away, move it in and out, and watch what E does.`,
    tasks: [
      'While the field ramps up, E circles the axis — even far outside the solenoid, where B is zero.',
      'Take the ring away: E does not change at all. The ring only gives charges a path to follow.',
      'Slide the ring from the middle outward: E grows in proportion to r up to the wall, then falls as 1/r. The emf round the ring stops growing once the ring is outside.',
      'While the field holds steady, every E arrow vanishes; ramping down, they all reverse.',
    ],
    params: {
      mode: 'ramp', Rf: 0.04, r: 0.03, B0: 0.5, tr: 1.5, ring: true, R: 0.02, ringToggle: true,
      sliders: ['r', 'tr'],
      graphs: ['B', 'emf'], readouts: ['dB', 'E', 'emf', 'I'], arrows: ['E', 'I'],
    },
  },
  example: {
    prompt: t`A long solenoid of radius 4.0 cm has a field that increases at 0.50 T/s. Find the induced electric field (a) 3.0 cm from its axis and (b) 10 cm from its axis. (c) How much energy does an electron gain going once round a circle of radius 10 cm?`,
    visual: solPic({ Rf: EX.R, r: EX.r1, B0: 0.75, tr: 1.5, caption: 'The solenoid end on: its field (teal) fills the dashed circle, rising steadily (graph). The grey dashed circle is the 3.0 cm path — just a path, no wire. Gold: the induced E, inside and outside.' }),
    steps: [
      { label: 'Symmetry', text: t`The set-up looks the same from every angle round the axis, so E circles the axis with the same size all round any circle centred on it. Then $\oint\vec E\cdot d\vec l = E(2\pi r)$.` },
      { label: '(a) Inside', text: t`A circle of radius $r = 0.030$ m encloses flux $\pi r^2 B$: $E(2\pi r) = \pi r^2\,\dfrac{dB}{dt}$, so $E = \dfrac{r}{2}\dfrac{dB}{dt} = \dfrac{0.030}{2}(0.50) = ${tn(EX.E1)}$ V/m.` },
      { label: '(b) Outside', text: t`A circle of radius 0.10 m encloses all the flux, $\pi R^2 B$, and no more: $E(2\pi r) = \pi R^2\,\dfrac{dB}{dt}$, so $E = \dfrac{R^2}{2r}\dfrac{dB}{dt} = \dfrac{(0.040)^2}{2(0.10)}(0.50) = ${tn(EX.E2)}$ V/m. B is zero out here; E is not.` },
      { label: '(c) One lap', text: t`The emf round the 10 cm circle is $\pi R^2\,dB/dt = ${tn(EX.lap)}$ V, so an electron gains $${tn(EX.lap * 1e3)}$ meV each time round — and more on the next lap. In an electrostatic field, a closed lap always gains exactly nothing.` },
      { label: 'Sense check', text: 'The field is tiny — millivolts per metre — because 0.5 T/s is a gentle ramp. A betatron makes its field change thousands of times faster, and sends electrons round hundreds of thousands of laps.' },
    ],
    answer: t`(a) $${tn(EX.E1 * 1e3)}$ mV/m; (b) $${tn(EX.E2 * 1e3)}$ mV/m; (c) $${tn(EX.lap * 1e3)}$ meV per lap.`,
  },
  practice: [
    num({
      id: 'inside', difficulty: 2,
      gen(r) {
        const Rc = r.pick([3, 5, 8]), f = r.pick([0.3, 0.6, 0.9]), dB = r.pick([0.2, 0.8, 2.5]);
        const rc = r6(f * Rc), E = (rc / 100 / 2) * dB;
        return {
          prompt: t`The field inside a long solenoid of radius ${Rc} cm rises at ${dB} T/s. What is the induced electric field ${rc} cm from its axis?`,
          visual: solPic({ Rf: Rc / 100, r: rc / 100, caption: `The solenoid end on, its field (teal) rising. The grey dashed circle marks the points ${rc} cm from the axis.` }),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [
            { value: (rc / 100) * dB * 1e3, feedback: t`$E(2\pi r) = \pi r^2\,dB/dt$ gives $E = \tfrac{r}{2}\,dB/dt$: keep the half.` },
            { value: (Rc / 100 / 2) * dB * 1e3, feedback: 'Use the distance of the point from the axis, not the solenoid’s radius: inside, E grows with r.' },
            { value: (rc / 2) * dB * 1e3, feedback: 'Convert the distance to metres.' },
          ],
          hints: [t`Take a circle of radius $r$ round the axis: $E(2\pi r) = \pi r^2\,\dfrac{dB}{dt}$.`, t`So $E = \dfrac{r}{2}\,\dfrac{dB}{dt}$, with $r = ${rc / 100}$ m.`],
          teach: 'Inside a long solenoid whose field changes, the induced E circles the axis with E = (r/2) dB/dt.',
          explain: t`$E = \dfrac{r}{2}\dfrac{dB}{dt} = \dfrac{${rc / 100}}{2}(${dB}) = ${tn(E)}$ V/m $= ${tn(E * 1e3)}$ mV/m, circling the axis.`,
        };
      },
    }),
    num({
      id: 'outside', difficulty: 2,
      gen(r) {
        const Rc = r.pick([2, 3, 4]), k = r.pick([1.5, 2, 2.4]), dB = r.pick([0.5, 1.5, 4]);
        const rc = r6(k * Rc), E = ((Rc / 100) ** 2 / (2 * (rc / 100))) * dB;
        return {
          prompt: t`A long solenoid of radius ${Rc} cm has a field rising at ${dB} T/s. What is the induced electric field ${rc} cm from its axis — outside the solenoid, where its magnetic field is zero?`,
          visual: solPic({ Rf: Rc / 100, r: rc / 100, caption: `The solenoid end on, its field (teal) rising. The grey dashed circle marks the points ${rc} cm from the axis, outside the solenoid.` }),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [
            { value: (rc / 100 / 2) * dB * 1e3, feedback: t`That is the inside formula. Outside, the circle encloses only the solenoid’s flux, $\pi R^2B$: $E = \dfrac{R^2}{2r}\dfrac{dB}{dt}$.` },
            { value: ((Rc / 100) ** 2 / (rc / 100)) * dB * 1e3, feedback: t`Keep the 2: $E(2\pi r) = \pi R^2\,dB/dt$.` },
          ],
          hints: [t`A circle of radius $r$ outside encloses the solenoid’s whole flux, $\pi R^2B$, and no more.`, t`$E(2\pi r) = \pi R^2\,\dfrac{dB}{dt}$.`],
          teach: 'Outside a long solenoid E = (R²/2r) dB/dt: the induced field reaches where the magnetic field does not.',
          explain: t`$E = \dfrac{R^2}{2r}\dfrac{dB}{dt} = \dfrac{(${Rc / 100})^2}{2(${rc / 100})}(${dB}) = ${tn(E)}$ V/m $= ${tn(E * 1e3)}$ mV/m. B is zero here; the changing flux inside the solenoid still drives E round every circle that encloses it.`,
        };
      },
    }),
    mcq({
      id: 'outside-zero', difficulty: 1,
      prompt: 'Outside a long solenoid the magnetic field is (very nearly) zero. While the current in it — and so the field inside — is increasing, is there an electric field outside?',
      visual: solPic({ arrows: [], caption: 'The solenoid end on: its field (teal) fills the dashed circle and rises steadily, as graphed. Outside the circle, B = 0.', extra: { path: false } }),
      choices: [
        'Yes: it circles the solenoid, getting weaker as 1/r',
        'No: B is zero out there, so nothing is induced',
        'Only where a wire loop is placed round the solenoid',
        'Yes, pointing straight out from the axis',
      ],
      answer: 0,
      why: {
        1: 'What matters is the changing flux enclosed by a path, not the field at the path. Any circle round the solenoid encloses its changing flux.',
        2: 'A loop would let a current flow, but the field is there with or without it.',
        3: 'The induced field curls round the changing flux; it has no reason to point outward, and symmetry forbids it.',
      },
      hints: [t`Apply $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$ to a circle drawn outside the solenoid. What flux does it enclose?`],
      teach: 'An induced E reaches beyond the changing field: a circle round a solenoid encloses its changing flux, wherever the circle is.',
      explain: t`A circle of radius $r > R$ encloses the solenoid’s flux $\pi R^2B$, which is changing, so $E(2\pi r) = \pi R^2\,dB/dt$: $E = \dfrac{R^2}{2r}\dfrac{dB}{dt}$, circling the axis. The same thing in a transformer: the secondary winding can sit where the core’s field barely reaches.`,
    }),
    mcq({
      id: 'gap', difficulty: 2,
      prompt: 'A metal ring sits round a long solenoid whose field is increasing, but the ring has been cut, leaving a narrow gap. What happens?',
      visual: page({
        x: [-2.6, 2.6], y: [-1.5, 1.5],
        curves: [circ2(0, 0, 0.75, { color: COL.B, width: 1.4, dash: true }), circ2(0, 0, 1.25, { color: 'ink2', width: 4, a0: 0.12, a1: 2 * PI - 0.12 })],
        points: [...fieldMarks(-0.5, 0.5, -0.5, 0.5, 3, 3, 'in'), lab(1.42, 0, 'gap', 'ink2', 0, 0, 'left'), lab(-0.8, 1.32, 'B into the page, growing', COL.B, 0, 0, 'right')],
        caption: 'The solenoid end on (teal: its field, into the page and growing), with the cut ring round it. The gap is at the right.',
      }),
      choices: [
        'E still circles the solenoid, so charge piles up on the two faces of the gap and a voltage appears across it',
        'Nothing at all: the circuit is broken, so there is no induced field',
        'A current flows round the ring anyway',
        'An electric field appears only inside the gap',
      ],
      answer: 0,
      why: {
        1: 'The changing flux makes E whether or not there is a complete circuit — or any wire at all.',
        2: 'A current needs a closed path; across the gap it cannot flow (beyond a brief rush that charges the gap’s faces).',
        3: 'E is everywhere round the solenoid. In the metal, the charge that piles up at the gap cancels it; across the gap, the two add.',
      },
      hints: ['Does the induced E depend on whether the ring is complete?'],
      teach: 'The induced E exists without a closed wire; a gap stops the current but leaves an emf across the gap.',
      explain: 'The induced E circles the solenoid regardless. In the ring it pushes charge round until the charge piled on the gap’s two faces makes a field that cancels it inside the metal; then the current stops, and the full emf, −dΦ/dt, appears as a voltage across the gap. That is how a transformer’s secondary has a voltage across it even with nothing connected.',
    }),
    mcq({
      id: 'no-potential', difficulty: 3,
      prompt: 'Why can the induced electric field round a changing solenoid not be described by an electric potential, as the field of static charges can?',
      visual: solPic({ caption: 'The solenoid end on, its field rising; the induced E (gold) circles the axis, its lines closing on themselves.' }),
      choices: [
        'Taking a charge once round a closed loop, it does net work: a potential would have to return to its starting value',
        'It is far too weak for a potential to be measured',
        'Only fields that point in straight lines can have a potential',
        'It can: V = Er, as for any field',
      ],
      answer: 0,
      why: {
        1: 'Weak or strong, the problem is the same: the work round a closed path is not zero.',
        2: 'The field of a point charge points radially and has a potential; what matters is whether the work round every closed path vanishes.',
        3: 'A potential needs ∮E·dl = 0 round every closed path; here it equals −dΦ/dt, which is not zero.',
      },
      hints: [t`For a potential, the work done round any closed path must be zero. What is $\oint\vec E\cdot d\vec l$ here?`, 'Imagine walking once round the solenoid, adding up the change in “potential” as you go.'],
      teach: 'An induced E is non-conservative: ∮E·dl = −dΦ/dt ≠ 0, so it has no potential.',
      explain: t`If a potential existed, going once round a closed loop would bring you back to the same value: $\oint\vec E\cdot d\vec l = 0$. For the induced field, $\oint\vec E\cdot d\vec l = -d\Phi_B/dt \neq 0$: a charge gains energy every lap. Voltmeters still read something, but what they read depends on the path their leads take round the changing flux.`,
    }),
    {
      type: 'slider', id: 'set-r', difficulty: 2, param: 'r',
      instruction: 'Drag the radius slider to the right value, then check.',
      gen(r) {
        const dB = r.pick([0.4, 1.0, 2.0]), rc = r.pick([6, 7, 8, 9, 10]);
        const R = 0.05, E = ((R * R) / (2 * (rc / 100))) * dB, Em = +(E * 1e3).toPrecision(3);
        return {
          prompt: t`A long solenoid of radius 5.0 cm has a field rising at ${dB} T/s. Set the radius of the circle so that, outside the solenoid, the induced field there is ${Em} mV/m.`,
          answer: [r6(rc - 0.3), r6(rc + 0.3)],
          hints: [t`Outside, $E = \dfrac{R^2}{2r}\dfrac{dB}{dt}$. Solve for $r$.`],
          teach: 'Outside a solenoid the induced field falls as 1/r: halve E and the radius doubles.',
          explain: t`$r = \dfrac{R^2}{2E}\dfrac{dB}{dt} = \dfrac{(0.050)^2(${dB})}{2(${tn(Em / 1000)})} = ${rc / 100}$ m $= ${rc}$ cm.`,
          visual: solPic({ Rf: R, r: 0.01, B0: dB, tr: 1, caption: 'The solenoid end on, its field rising; the grey dashed circle is the path whose radius you set. Gold: the induced E.', extra: { sliders: ['r'] } }),
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-betatron', difficulty: 3, transfer: true,
      gen(r) {
        const rm = r.pick([0.2, 0.3, 0.4]), dB = r.pick([200, 400, 600]), MeV = r.pick([10, 20, 30]);
        const perLap = PI * rm * rm * dB, laps = (MeV * 1e6) / perLap, time = (laps * 2 * PI * rm) / 2.998e8;
        return {
          prompt: t`In a betatron, electrons circle in a vacuum ring of radius ${rm} m while the average magnetic field through their orbit rises at ${dB} T/s (a guide field keeps them on the circle). Roughly how many laps does an electron need to reach ${MeV} MeV?`,
          visual: solPic({ Rf: 0.05, r: 0.035, B0: 0.6, tr: 1, ring: false, caption: 'Schematic, not to scale: the flux through the electrons’ circular orbit (grey dashed) rising; the induced E (gold) runs along the orbit and pushes them round it, lap after lap.' }),
          answer: laps, units: '', tol: { rel: 0.02 },
          errors: [
            { value: laps * 2, feedback: t`The emf per lap is $d\Phi_B/dt = \pi r^2\,dB/dt$, with the area — not $\pi r^2/2$ or half the field.` },
            { value: (MeV * 1e6) / (2 * PI * rm * dB), feedback: t`The energy per lap comes from the flux through the orbit, $\pi r^2\,dB/dt$, not the circumference.` },
          ],
          hints: [t`Each lap, the electron gains $e$ times the emf round its orbit: $|\mathcal{E}| = \pi r^2\,dB/dt$.`, t`An emf of ${tn(perLap)} V gives ${tn(perLap)} eV per lap.`],
          teach: 'A betatron accelerates electrons with an induced E: each lap they gain e times the emf πr² dB/dt round their orbit.',
          explain: t`The emf round the orbit is $\pi r^2\,dB/dt = \pi(${rm})^2(${dB}) = ${tn(perLap)}$ V, so each lap gives ${tn(perLap)} eV. Reaching ${MeV} MeV takes $\dfrac{${MeV}\times10^{6}}{${tn(perLap)}} \approx ${tn(laps)}$ laps — at nearly the speed of light, only about $${tn(time * 1e3, 2)}$ ms, over while the field is still rising. No electrodes, no voltage anywhere above a few hundred volts: the induced field does it all.`,
        };
      },
    }),
    mcq({
      id: 'cp-strongest', difficulty: 2,
      prompt: 'Round a long solenoid whose field is increasing, where is the induced electric field strongest?',
      visual: solPic({ arrows: [], caption: 'The solenoid end on, its field rising (graph).', extra: { path: false } }),
      choices: ['At the solenoid’s wall', 'On its axis, where the flux is concentrated', 'Everywhere inside equally, since B is uniform there', 'Far outside, where nothing else cancels it'],
      answer: 0,
      why: {
        1: 'On the axis a circle of zero size encloses no flux: E is zero there, and grows with r.',
        2: 'B is uniform inside, but E = (r/2) dB/dt grows with the distance from the axis.',
        3: 'Outside, E = (R²/2r) dB/dt falls away as 1/r.',
      },
      hints: ['Write E inside and outside: which way does each change with r?'],
      teach: 'E grows as r inside a changing solenoid and falls as 1/r outside, so it peaks at the wall: E = (R/2) dB/dt.',
      explain: t`Inside, $E = \tfrac{r}{2}\,dB/dt$ grows from zero on the axis; outside, $E = \tfrac{R^2}{2r}\,dB/dt$ falls. The two meet at the wall, $r = R$, where $E = \tfrac{R}{2}\,dB/dt$ is greatest.`,
    }),
    mcq({
      id: 'cp-ring-size', difficulty: 3,
      prompt: 'A wire ring encircles a long solenoid whose field is rising, well outside it. The ring is replaced by one of twice the radius. The emf round the ring:',
      visual: solPic({ Rf: 0.03, r: 0.055, ring: true, arrows: ['E'], caption: 'The solenoid end on (field rising), with a ring well outside it. Gold: the induced E, weaker farther out.' }),
      choices: ['Stays the same', 'Doubles: the ring is twice as long', 'Quadruples: the ring’s area is four times as big', 'Halves: E is half as strong out there'],
      answer: 0,
      why: {
        1: 'The ring is twice as long, but E there is half as strong: the product is unchanged.',
        2: 'The emf is set by the changing flux the ring encloses, and outside the solenoid there is none to add: the extra area has no field in it.',
        3: 'E is half as strong, but it acts along twice the length.',
      },
      hints: [t`The emf is $-d\Phi_B/dt$. How much changing flux does each ring enclose?`, 'Or: E falls as 1/r while the ring’s length grows as r.'],
      teach: 'Any loop round a solenoid has the same emf, πR² dB/dt: only the flux inside the solenoid is changing.',
      explain: t`Both rings enclose the same changing flux, $\pi R^2B$: the emf, $\pi R^2\,dB/dt$, is the same. Seen through E: twice the radius, half the field ($E \propto 1/r$), twice the length — the same $\oint\vec E\cdot d\vec l$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.4', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-4-induced-electric-fields' },
    { label: 'D. W. Kerst, The acceleration of electrons by magnetic induction, Phys. Rev. 60, 47 (1941)', url: 'https://doi.org/10.1103/PhysRev.60.47' },
  ],
});
