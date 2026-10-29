// Displacement current: Ampère's law gives two answers for one loop around a
// charging capacitor's wire, depending on the surface. Maxwell's fix — a
// changing electric flux counts as a current, I_d = ε₀ dΦ_E/dt — restores one
// answer, and says a changing electric field makes a magnetic field even in
// empty space. Between the plates B grows linearly with r inside, 1/r outside.
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, EPS0, tn, sf, r6, apart, COL } from './_maxwell.js';

const t = String.raw;

/** an em-gap picture for a problem: no controls, no readout, a still part-way through the charging */
const gapPic = (params, caption) => ({ type: 'em-gap', params: { controls: [], readout: false, t: 4, ...params }, ...(caption ? { caption } : {}) });

/** B against distance from the axis, between the plates (solid) and around the wire (dashed), for current I (A) and plate radius R (cm) */
function bProfile({ I, R, rmax = 3 * R, numbers = true, vl = [], caption }) {
  const k = (2e-7 * I) * 1e6;          // μ₀I/2π in µT·m
  const Rm = R / 100;
  return {
    type: 'graph',
    params: {
      x: [0, rmax], y: [0, r6((k / (0.35 * Rm)) * 1.1)], aspect: 'wide', axesAt: 'edge', xlabel: 'r (cm)', ylabel: 'B (µT)',
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      curves: [
        { fn: `${r6(k / (Rm * Rm))}*x/100`, domain: [0, R], color: COL.B, width: 2.6, label: 'between the plates', labelAt: R * 0.55, labelDx: 8, labelDy: 14 },
        { fn: `${r6(k)}/(x/100)`, domain: [R, rmax], color: COL.B, width: 2.6 },
        { fn: `${r6(k)}/(x/100)`, domain: [0.35 * R, R], color: 'ink3', width: 1.6, dash: true, label: 'round the wire', labelAt: 0.5 * R, labelDx: 8, labelDy: -8 },
      ],
      vlines: [{ x: R, color: 'ink3', label: 'plate edge' }, ...vl],
    },
    caption: caption ?? 'The magnetic field against distance from the axis: between the plates (solid) it grows in proportion to r out to the plate edge, then falls as 1/r — exactly as round the wire (dashed).',
  };
}

// the worked example: plates of radius 5.0 cm charged by 2.0 A
const EX = (() => {
  const I = 2, R = 0.05, A = Math.PI * R * R, dEdt = I / (EPS0 * A);
  return { I, R, A, dEdt, Id: EPS0 * A * dEdt, B3: (MU0 * I * 0.03) / (2 * Math.PI * R * R), B8: (MU0 * I) / (2 * Math.PI * 0.08) };
})();

export default lesson({
  id: 'phys2220.B6.1',
  title: 'Displacement current',
  minutes: 12, difficulty: 3,
  intro: t`Ampère’s law says that the magnetic field’s circulation around a loop is $\mu_0$ times the current through **any** surface whose edge is that loop. Around a charging capacitor that fails: a flat surface crossed by the wire catches the current $I$, while a surface that bulges between the plates catches no moving charge at all — one loop, two answers. Maxwell’s repair: a **changing electric flux counts as a current**, the displacement current $I_d = \varepsilon_0\,d\Phi_E/dt$. Between the plates it equals the conduction current exactly, so every surface gives the same total:

$$\oint\vec B\cdot d\vec l = \mu_0\left(I_c + \varepsilon_0\frac{d\Phi_E}{dt}\right)$$

The new term also says that a changing electric field makes a magnetic field, even in empty space where no charge moves. Paired with Faraday’s law, that is what lets light exist.`,
  symbols: [
    { tex: t`\oint\vec B\cdot d\vec l`, text: 'the circulation of the magnetic field: $\\vec B$ along the loop, added all the way round, in T·m' },
    { tex: t`\mu_0`, text: t`the permeability of free space, $4\pi\times10^{-7}$ T·m/A` },
    { tex: 'I_c', text: 'the conduction current — moving charge — through the chosen surface, in amperes' },
    { tex: t`\varepsilon_0`, text: t`the permittivity of free space, $8.854\times10^{-12}$ F/m` },
    { tex: t`\Phi_E`, text: t`the electric flux through the surface, $\int\vec E\cdot d\vec A$, in V·m; between plates of area $A$, $\Phi_E = EA$` },
    { tex: t`I_d = \varepsilon_0\frac{d\Phi_E}{dt}`, text: 'the displacement current: not charge moving, but electric flux changing — measured in amperes all the same' },
  ],
  why: 'This one term turns electricity and magnetism into a theory of light: changing E makes B, changing B makes E, and the pair can travel on their own at the speed of light.',
  visual: {
    type: 'em-gap',
    title: 'One loop, two surfaces, one answer',
    lead: t`A capacitor charging through straight wires, seen from the side. The gold loop is an Amperian loop around the axis; the shaded gold shape is the surface you have chosen to span it. The readout counts what crosses that surface — moving charge, or changing electric flux — and compares the total with the loop’s $\oint\vec B\cdot d\vec l/\mu_0$.`,
    tasks: [
      'Round the wire, switch between the flat disc and the bag: the conduction current turns into displacement current, and the total stays the same.',
      'Move the loop between the plates and shrink it: it encloses only part of the changing flux, and B on it falls in proportion.',
      'Compare the B markers between the plates with those round the wire: inside the plate edge they are weaker, outside they match.',
    ],
    params: { I: 2, R: 5, at: 'wire', r: 3, surface: 'flat' },
  },
  example: {
    prompt: t`A capacitor with circular plates of radius 5.0 cm is charged by a steady 2.0 A. Ignoring fringing, find (a) how fast the field between the plates grows, (b) the displacement current between the plates, and (c) the magnetic field between the plates 3.0 cm and 8.0 cm from the axis.`,
    visual: bProfile({ I: 2, R: 5, rmax: 10, vl: [{ x: 3, color: 'violet', label: '3 cm' }, { x: 8, color: 'violet', label: '8 cm' }] }),
    steps: [
      { label: 'Field between the plates', text: t`$E = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0A}$, so $\dfrac{dE}{dt} = \dfrac{I}{\varepsilon_0A} = \dfrac{2.0}{(8.854\times10^{-12})\,\pi(0.050)^2} = ${tn(EX.dEdt)}$ V/(m·s).` },
      { label: 'Displacement current', text: t`$I_d = \varepsilon_0\dfrac{d\Phi_E}{dt} = \varepsilon_0A\dfrac{dE}{dt} = I = 2.0$ A: exactly the conduction current in the wires. Charge piles up at $I$, and the flux grows in step.` },
      { label: 'Inside, r = 3.0 cm', text: t`A loop of radius $r < R$ encloses the fraction $r^2/R^2$ of the flux: $I_d(r) = I\,r^2/R^2$. Ampère–Maxwell with $B$ the same all round: $B\cdot2\pi r = \mu_0 I r^2/R^2$, so $B = \dfrac{\mu_0Ir}{2\pi R^2} = ${tn(EX.B3 * 1e6)}\ \mu$T.` },
      { label: 'Outside, r = 8.0 cm', text: t`Now the loop encloses all of it: $B = \dfrac{\mu_0I}{2\pi r} = ${tn(EX.B8 * 1e6)}\ \mu$T — the same as 8.0 cm from the wire.` },
      { label: 'Sense check', text: t`Microtesla fields — a tenth of Earth’s — from a couple of amperes: reasonable. Maxwell’s term was too small to see in 1860s laboratories; its proof came with Hertz’s radio waves in 1887.` },
    ],
    answer: t`(a) $${tn(EX.dEdt)}$ V/(m·s); (b) $I_d = 2.0$ A; (c) $${tn(EX.B3 * 1e6)}\ \mu$T at 3.0 cm, $${tn(EX.B8 * 1e6)}\ \mu$T at 8.0 cm.`,
  },
  practice: [
    mcq({
      id: 'which-surface', difficulty: 2,
      prompt: t`A loop surrounds the wire leading to a charging capacitor. Surface 1 is a flat disc on the loop, pierced by the wire. Surface 2 has the same edge but bulges between the plates, so no wire pierces it. What does the Ampère–Maxwell law give for each?`,
      visual: gapPic({ surface: 'bag' }, 'The loop round the wire (gold) and surface 2, the bag that slips between the plates. Surface 1 would be the flat disc on the loop.'),
      choices: [
        t`Both give $\mu_0I$: surface 1 through the conduction current, surface 2 through the displacement current`,
        t`Surface 1 gives $\mu_0I$ and surface 2 gives zero, so Ampère’s law is simply wrong here`,
        'Only surface 1 is allowed, because a surface must be flat',
        t`Surface 2 gives $2\mu_0I$: it catches the field from both plates`,
      ],
      answer: 0,
      why: {
        1: t`That is the paradox Maxwell resolved: without the displacement term the law gives two answers. With it, surface 2 catches $\varepsilon_0\,d\Phi_E/dt = I$.`,
        2: 'Any surface bounded by the loop is allowed — that freedom is what exposed the problem.',
        3: 'The field lines run from one plate to the other: surface 2 is crossed by each of them once, giving one I, not two.',
      },
      hints: ['What crosses surface 2: moving charge, or a changing electric field?', t`Between the plates $\varepsilon_0\,d\Phi_E/dt = \varepsilon_0A\,dE/dt = dQ/dt = I$.`],
      teach: 'With Maxwell’s displacement current, every surface bounded by the loop gives the same total current.',
      explain: t`Surface 1: $I_c = I$, $I_d = 0$. Surface 2: $I_c = 0$, but the electric flux through it grows at $d\Phi_E/dt = I/\varepsilon_0$, so $I_d = I$. Both give $\oint\vec B\cdot d\vec l = \mu_0I$, as one loop must.`,
    }),
    num({
      id: 'dEdt', difficulty: 2,
      gen(r) {
        const I = r.pick([0.5, 1.5, 3.0]), Rcm = r.pick([2, 4, 10]);
        const A = Math.PI * (Rcm / 100) ** 2, dEdt = I / (EPS0 * A);
        return {
          prompt: t`Circular plates of radius ${Rcm} cm are charged by a steady current of ${I} A. How fast does the electric field between them grow? Ignore fringing. ($\varepsilon_0 = 8.854\times10^{-12}$ F/m)`,
          visual: gapPic({ I, R: Math.min(Rcm, 6), at: 'gap', r: 3, labels: true }, 'The charging capacitor; the field between the plates (violet) grows as charge piles up. Not to scale.'),
          answer: dEdt, units: 'V/(m s)', tol: { rel: 0.01 },
          errors: apart([{ value: I / (EPS0 * Math.PI * Rcm / 100), feedback: t`The area is $\pi R^2$ — square the radius.` }, { value: I / EPS0, feedback: t`Divide by the plate area too: $E = Q/\varepsilon_0A$, so $dE/dt = I/\varepsilon_0A$.` }], dEdt),
          hints: [t`$E = Q/(\varepsilon_0A)$ between the plates, and $dQ/dt = I$.`, t`$A = \pi(${Rcm / 100}\ \text{m})^2 = ${tn(A)}$ m².`],
          teach: t`Between charging plates the field grows at $dE/dt = I/(\varepsilon_0A)$.`,
          explain: t`$\dfrac{dE}{dt} = \dfrac{I}{\varepsilon_0A} = \dfrac{${I}}{(8.854\times10^{-12})(${tn(A)})} = ${tn(dEdt)}$ V/(m·s). Enormous — because $\varepsilon_0$ is so small — yet it carries only ${I} A of displacement current.`,
        };
      },
    }),
    num({
      id: 'Id-from-dEdt', difficulty: 2,
      gen(r) {
        const Acm2 = r.pick([20, 50, 120]), m = r.pick([2.0, 4.5, 8.0]), e = r.pick([10, 11, 12]);
        const dEdt = m * 10 ** e, Id = EPS0 * Acm2 * 1e-4 * dEdt;
        return {
          prompt: t`The electric field between two parallel plates of area ${Acm2} cm² is changing at $${m}\times10^{${e}}$ V/(m·s). What displacement current flows between them?`,
          visual: gapPic({ at: 'gap', r: 7, I: 2 }, 'A flat surface between the plates catching all of the changing flux. Not to scale.'),
          answer: Id, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: EPS0 * Acm2 * dEdt, feedback: t`Convert the area to m²: 1 cm² $= 10^{-4}$ m².` }, { value: (Acm2 * 1e-4 * dEdt) / EPS0, feedback: t`Multiply by $\varepsilon_0$, do not divide: $I_d = \varepsilon_0A\,dE/dt$.` }], Id),
          hints: [t`$I_d = \varepsilon_0\,d\Phi_E/dt = \varepsilon_0A\,dE/dt$ for a uniform field over area $A$.`],
          teach: t`Displacement current is $\varepsilon_0$ times the rate of change of electric flux: $I_d = \varepsilon_0A\,dE/dt$.`,
          explain: t`$I_d = (8.854\times10^{-12})(${Acm2}\times10^{-4})(${m}\times10^{${e}}) = ${tn(Id)}$ A.`,
        };
      },
    }),
    mcq({
      id: 'is-it-charge', difficulty: 2,
      prompt: t`Is the displacement current between the plates of a charging capacitor a flow of charge across the gap?`,
      visual: gapPic({ at: 'gap', r: 3 }, 'The gap between the plates: field lines (violet) and the magnetic field they make (teal markers). Not to scale.'),
      choices: [
        'No: no charge crosses the gap; it is the electric field there changing, which makes a magnetic field just as a current does',
        'Yes: a few electrons leak across the gap, carrying the current',
        'Yes: the charges on one plate repel those on the other, pushing them through',
        'No — and it makes no magnetic field, because nothing moves',
      ],
      answer: 0,
      why: {
        1: 'An ideal capacitor’s gap is an insulator — vacuum, here. Charge piles up on one plate and leaves the other through the wires.',
        2: 'The plates’ charges stay on the plates; that is what makes the field between them.',
        3: 'It does make a magnetic field — the teal markers between the plates — exactly as Maxwell’s term says.',
      },
      hints: [t`Look at what $I_d = \varepsilon_0\,d\Phi_E/dt$ is built from.`],
      teach: 'Displacement current is a changing electric field, not moving charge — but it makes a magnetic field just as a current does.',
      explain: t`$I_d = \varepsilon_0\,d\Phi_E/dt$ involves only the field. Maxwell named it by analogy with charges “displaced” in a material, but in a vacuum gap nothing moves at all; the growing field alone sources $\vec B$.`,
    }),
    num({
      id: 'B-inside', difficulty: 3,
      gen(r) {
        const I = r.pick([1.0, 2.5, 4.0]), Rcm = r.pick([4, 6, 8]), f = r.pick([0.25, 0.5, 0.75]);
        const rcm = Rcm * f, B = (MU0 * I * (rcm / 100)) / (2 * Math.PI * (Rcm / 100) ** 2);
        return {
          prompt: t`Circular plates of radius ${Rcm} cm are charged by ${I} A. What is the magnetic field between the plates, ${sf(rcm, 3)} cm from the axis? Ignore fringing. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: bProfile({ I, R: Rcm, numbers: false, vl: [{ x: rcm, color: 'violet', label: `${sf(rcm, 3)} cm` }], caption: 'The shape of B against distance from the axis (axis numbers hidden); the violet line marks the distance asked about.' }),
          answer: B * 1e6, units: 'µT', tol: { rel: 0.01 },
          errors: apart([{ value: ((MU0 * I) / (2 * Math.PI * (rcm / 100))) * 1e6, feedback: t`That is the field of the whole current. Inside the plate edge a loop of radius $r$ encloses only $I r^2/R^2$ of displacement current.` }, { value: ((MU0 * I * (rcm / 100) ** 2) / (2 * Math.PI * (Rcm / 100) ** 2)) * 1e6, feedback: t`Divide by the loop’s circumference: $B\cdot2\pi r = \mu_0Ir^2/R^2$ gives $B = \mu_0Ir/(2\pi R^2)$.` }], B * 1e6),
          hints: [t`Take a circular loop of radius $r$ between the plates. It encloses displacement current $I\,r^2/R^2$.`, t`$B\cdot2\pi r = \mu_0I\dfrac{r^2}{R^2}$, so $B = \dfrac{\mu_0Ir}{2\pi R^2}$.`],
          teach: 'Between charging plates B grows in proportion to r out to the plate edge, because a loop encloses displacement current in proportion to its area.',
          explain: t`$B = \dfrac{\mu_0Ir}{2\pi R^2} = \dfrac{(4\pi\times10^{-7})(${I})(${sf(rcm / 100, 3)})}{2\pi(${Rcm / 100})^2} = ${tn(B * 1e6)}\ \mu$T.`,
        };
      },
    }),
    mcq({
      id: 'B-at-edge', difficulty: 2,
      prompt: t`Compare the magnetic field at the edge of the charging plates (distance $R$ from the axis, between them) with the field at the same distance $R$ from the wire that feeds them.`,
      visual: bProfile({ I: 2, R: 5, rmax: 10, numbers: false, caption: 'B against distance from the axis, between the plates (solid) and round the wire (dashed) — axis numbers hidden.' }),
      choices: ['They are equal', 'The field between the plates is zero, since no current flows there', 'The field between the plates is half as large', 'The field between the plates is larger, since the plates are wide'],
      answer: 0,
      why: {
        1: 'Between the plates the displacement current sources B just as the conduction current does in the wire.',
        2: t`At $r = R$ the loop encloses all of the displacement current, $I$ — the same as round the wire.`,
        3: 'Wide plates spread the displacement current out; that weakens B inside the edge, but at and beyond the edge the total enclosed is just I.',
      },
      hints: [t`How much displacement current does a loop of radius $R$ between the plates enclose?`],
      teach: 'At and beyond the plate edge, a loop encloses the whole displacement current I, so B matches the field round the wire.',
      explain: t`Both loops enclose a total current $I$ — conduction in one case, displacement in the other — so $B = \mu_0I/2\pi R$ for both. Inside the edge the fields differ: round the wire $B$ keeps growing toward the axis; between the plates it falls to zero there.`,
    }),
    num({
      id: 'Id-from-voltage', difficulty: 2,
      gen(r) {
        const CuF = r.pick([0.1, 1, 10]), m = r.pick([2, 5, 8]), e = r.pick([3, 4, 5]);
        const dVdt = m * 10 ** e, Id = CuF * 1e-6 * dVdt;
        return {
          prompt: t`The voltage across a ${CuF} µF parallel-plate capacitor is rising at $${m}\times10^{${e}}$ V/s. What is the displacement current between its plates?`,
          visual: gapPic({ at: 'gap', r: 7 }, 'A flat surface between the plates, wider than them, catching all the changing flux. Not to scale.'),
          answer: Id, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: (CuF * dVdt), feedback: 'Convert the capacitance: 1 µF = 10⁻⁶ F.' }], Id),
          hints: [t`$\Phi_E = EA = (V/d)A$ and $C = \varepsilon_0A/d$.`, t`So $I_d = \varepsilon_0\,\dfrac{d\Phi_E}{dt} = \dfrac{\varepsilon_0A}{d}\dfrac{dV}{dt} = C\,\dfrac{dV}{dt}$.`],
          teach: t`For a capacitor the displacement current is $C\,dV/dt$ — exactly the current $dQ/dt$ in its leads.`,
          explain: t`$I_d = C\,dV/dt = (${CuF}\times10^{-6})(${m}\times10^{${e}}) = ${tn(Id)}$ A — the same as the current flowing in the wires, $dQ/dt$.`,
        };
      },
    }),
    mcq({
      id: 'consequence', difficulty: 3,
      prompt: t`Why was Maxwell’s displacement current essential for light to be explained as an electromagnetic wave?`,
      visual: { type: 'em-wave', params: { phase: 40, controls: [], readout: false }, caption: 'An electromagnetic wave: electric field violet, magnetic field teal, travelling along the gold arrow. Not to scale.' },
      choices: [
        'A changing electric field now makes a magnetic field, and Faraday’s law already made a changing magnetic field make an electric one — so each can keep the other going in empty space',
        'It gives light a medium of moving charges to travel through',
        'It makes magnetic fields stronger, so light can be bright enough to see',
        'It explains why light carries electric charge',
      ],
      answer: 0,
      why: {
        1: 'No medium is needed: the displacement current is a changing field, not moving charge, so it exists in vacuum.',
        2: 'Brightness is about the wave’s amplitude; the point is that the wave can exist at all.',
        3: 'Light carries no charge. It carries energy and momentum in its fields.',
      },
      hints: ['What does a changing B make, by Faraday’s law? And what, by Maxwell’s term, does a changing E make?', 'Where there are no charges and no currents, which terms of the equations are left?'],
      teach: 'Changing E makes B (Maxwell) and changing B makes E (Faraday): together they let fields sustain each other as a travelling wave.',
      explain: t`In empty space $I_c = 0$, yet $\oint\vec B\cdot d\vec l = \mu_0\varepsilon_0\,d\Phi_E/dt$ survives, alongside $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$. Each changing field regenerates the other, and the equations then predict waves moving at $1/\sqrt{\mu_0\varepsilon_0} = 3.00\times10^8$ m/s — the measured speed of light.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-B-edge', difficulty: 2,
      gen(r) {
        const I = r.pick([0.8, 1.5, 3.0]), Rcm = r.pick([3, 5, 7.5]);
        const B = (MU0 * I) / (2 * Math.PI * (Rcm / 100));
        return {
          prompt: t`A parallel-plate capacitor with circular plates of radius ${Rcm} cm is charged by ${I} A. What is the magnetic field between the plates, at their rim? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: gapPic({ I: Math.min(I, 5), R: Math.min(Rcm, 7), at: 'gap', r: Math.min(Rcm, 7) }, 'A loop between the plates as wide as the plates themselves. Not to scale.'),
          answer: B * 1e6, units: 'µT', tol: { rel: 0.01 },
          hints: [t`A loop of radius $R$ between the plates encloses the whole displacement current, $I$.`, t`$B\cdot2\pi R = \mu_0I$.`],
          teach: 'At the plate edge the loop encloses all of the displacement current: B = μ₀I/(2πR).',
          explain: t`$B = \dfrac{\mu_0I}{2\pi R} = \dfrac{(4\pi\times10^{-7})(${I})}{2\pi(${Rcm / 100})} = ${tn(B * 1e6)}\ \mu$T.`,
        };
      },
    }),
    mcq({
      id: 'cp-steady', difficulty: 2,
      prompt: t`A capacitor has been fully charged and disconnected; its charge no longer changes. What magnetic field is there between its plates?`,
      visual: gapPic({ at: 'gap', r: 3, steady: true }, 'The plates holding their charge, with the steady field between them, and a loop between the plates. Not to scale.'),
      choices: ['None: the electric field is steady, so there is no displacement current', 'The same as while it was charging, since the field is still there', 'A field that grows with the stored charge', 'Twice the charging value, since all the current has now arrived'],
      answer: 0,
      why: {
        1: t`What sources $\vec B$ is the rate of change of the flux, $d\Phi_E/dt$, not the flux itself.`,
        2: 'A large steady electric field makes no magnetic field at all.',
        3: 'With no current and no changing flux, nothing on the right of the Ampère–Maxwell law is left.',
      },
      hints: [t`$I_d = \varepsilon_0\,d\Phi_E/dt$. What is $d\Phi_E/dt$ now?`],
      teach: 'Only a changing electric flux acts as a current; a steady field, however strong, makes no magnetic field.',
      explain: t`With $Q$ constant, $E$ and $\Phi_E$ are constant: $I_d = 0$ and $I_c = 0$, so $\oint\vec B\cdot d\vec l = 0$ for every loop — no magnetic field.`,
    }),
    num({
      id: 'cp-ppt', difficulty: 3, transfer: true,
      gen(r) {
        const CuF = r.pick([2, 10, 20]), m = r.pick([1.0, 1.5, 3.0]);
        const dVdt = m * 1e8, Id = CuF * 1e-6 * dVdt;
        return {
          prompt: t`A pulsed plasma thruster fires a small spacecraft by dumping a capacitor’s energy through a puff of plasma in microseconds. During one discharge, the voltage on a ${CuF} µF capacitor falls at $${m}\times10^{8}$ V/s. What displacement current flows between its plates at that moment?`,
          visual: gapPic({ at: 'gap', r: 7, I: 5 }, 'The capacitor drawn as two plates (not to scale). During the discharge the field between them collapses, so the displacement current runs the other way — it is the size that matters here.'),
          answer: Id, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: CuF * dVdt, feedback: 'Convert the capacitance to farads: 1 µF = 10⁻⁶ F.' }], Id),
          hints: [t`$I_d = \varepsilon_0\,d\Phi_E/dt = C\,dV/dt$ for a parallel-plate capacitor.`, t`$C = ${CuF}\times10^{-6}$ F.`],
          teach: 'A capacitor discharging fast carries an equally fast displacement current between its plates, matching the current in its leads.',
          explain: t`$|I_d| = C\,|dV/dt| = (${CuF}\times10^{-6})(${m}\times10^8) = ${tn(Id)}$ A — kiloamperes, matching the arc current through the thruster’s plasma. The field between the plates collapses as fast as the charge leaves.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §16.1 Maxwell’s equations and electromagnetic waves', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves' },
  ],
});
