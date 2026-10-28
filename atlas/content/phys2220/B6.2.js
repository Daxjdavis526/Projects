// Maxwell's equations together, in integral form, dissected symbol by symbol:
// Gauss's law for E, Gauss's law for B (no monopoles), Faraday's law and the
// Ampère–Maxwell law. Each sets a flux through a closed surface, or a
// circulation round a loop, equal to its source; in empty space the two
// time-derivative terms still couple E and B, and μ₀ε₀ = 1/c².
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { MU0, EPS0, C_LIGHT, tn, r6, apart, acPic, COL } from './_maxwell.js';
import { page, barMagnetParts, circ2, fieldMarks, lab } from './_magnet.js';

const t = String.raw;

const MAXWELL = t`\begin{aligned} \oint\vec E\cdot d\vec A &= \frac{Q_\text{enc}}{\varepsilon_0} \\ \oint\vec B\cdot d\vec A &= 0 \\ \oint\vec E\cdot d\vec l &= -\frac{d\Phi_B}{dt} \\ \oint\vec B\cdot d\vec l &= \mu_0I_\text{enc} + \mu_0\varepsilon_0\frac{d\Phi_E}{dt} \end{aligned}`;

/** a Gaussian sphere around charges (em-field), still, no readouts */
const gaussPic = (charges, r, caption) => ({ type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], charges, gauss: { shape: 'sphere', x: 0, y: 0, r, move: false, resize: false }, fieldLines: true, density: 10, arrows: false, labels: true, static: true, readouts: [] }, caption });

export default lesson({
  id: 'phys2220.B6.2',
  kind: 'dissection',
  title: 'Maxwell’s equations together',
  minutes: 12, difficulty: 3,
  equation: t`\begin{aligned} \part{1}{\oint\vec E\cdot d\vec A} &= \part{2}{\frac{Q_\text{enc}}{\varepsilon_0}} \\[2pt] \part{3}{\oint\vec B\cdot d\vec A} &= 0 \\[2pt] \part{4}{\oint\vec E\cdot d\vec l} &= \part{5}{-\frac{d\Phi_B}{dt}} \\[2pt] \part{6}{\oint\vec B\cdot d\vec l} &= \part{7}{\mu_0I_\text{enc}} + \part{8}{\mu_0\varepsilon_0\frac{d\Phi_E}{dt}} \end{aligned}`,
  intro: t`These four equations hold all of classical electromagnetism — every circuit, motor, radio and rainbow in this course. Each one puts an integral of a field on the left and its source on the right. The first two add up the field **through a closed surface** (a balloon of any shape, $d\vec A$ pointing outward); the last two add up the field **around a closed loop** ($d\vec l$ along it).

You have met each of them separately: Gauss’s law, the absence of magnetic charge, Faraday’s law, and Ampère’s law with Maxwell’s repair. Seen together they are almost symmetric between $\vec E$ and $\vec B$ — and the places where they are not are physics: there are electric charges but no magnetic ones. Step through the eight parts.`,
  parts: [
    {
      tex: t`\oint\vec E\cdot d\vec A`, name: 'the electric flux out of a closed surface', units: t`$\text{N·m}^2/\text{C} = \text{V·m}$`,
      text: t`Take any closed surface and add up $\vec E\cdot d\vec A$ over all of it: field leaving counts positive, field entering negative. It measures how much field springs out of the region inside.

The surface is imaginary — you choose it. With symmetry (a sphere round a point charge, a cylinder round a wire) this one equation gives the field in a line.`,
      more: t`In differential form this is $\nabla\cdot\vec E = \rho/\varepsilon_0$: the divergence of $\vec E$ at a point is set by the charge density there. Newton’s gravity has exactly the same law with mass for charge — the equation general relativity must reduce to for weak fields.`,
    },
    {
      tex: t`\frac{Q_\text{enc}}{\varepsilon_0}`, name: 'the charge enclosed', units: t`$Q$ in coulombs; $\varepsilon_0 = 8.854\times10^{-12}$ F/m`,
      text: t`Only charge **inside** the surface counts. A charge outside sends as much field in as out, so it adds nothing. Electric field lines begin on positive charges and end on negative ones — this is the bookkeeping that says so.

$\varepsilon_0$ is the permittivity of free space: it sets how much field a coulomb makes ($k = 1/4\pi\varepsilon_0$ in Coulomb’s law).`,
    },
    {
      tex: t`\oint\vec B\cdot d\vec A = 0`, name: 'no magnetic monopoles',
      text: t`The same count for the magnetic field always gives **zero**: every field line that enters a closed surface leaves it again. There is no magnetic “charge” for a field line to start or end on — cut a magnet in half and you get two magnets, each with N and S.

This is an experimental statement. Physicists have searched for magnetic monopoles in cosmic rays, in moon rock and at particle colliders; none has been found.`,
      more: t`If monopoles existed, the right side would be $\mu_0Q_m$ and Faraday’s law would gain a magnetic current — making the equations perfectly symmetric. Some unified theories predict monopoles too heavy or too rare to have been seen; their existence is an open question.`,
    },
    {
      tex: t`\oint\vec E\cdot d\vec l`, name: 'the circulation of E — the emf round a loop', units: 'volts',
      text: t`Walk once round a closed loop adding up $\vec E\cdot d\vec l$: the work the electric field does on each coulomb carried round. That is the **emf** of the loop.

For the field of charges at rest it is always zero — static electric fields are conservative, which is why a voltage (potential) can be defined at all.`,
    },
    {
      tex: t`-\frac{d\Phi_B}{dt}`, name: 'the changing magnetic flux (Faraday’s law)', units: t`$\Phi_B$ in webers ($\text{T·m}^2$); its rate in V`,
      text: t`If the magnetic flux through the loop changes, the electric field **circulates**: a changing $\vec B$ creates an electric field whose lines close on themselves, with no charges at all. This is Faraday’s law — generators, transformers, induction hobs and the self-inductance of every coil.

The **minus sign** is Lenz’s law: the emf drives current the way that opposes the change in flux.`,
      more: t`With a changing flux, $\oint\vec E\cdot d\vec l \neq 0$, so this induced field is not conservative: “voltage” stops being a single-valued potential. Differential form: $\nabla\times\vec E = -\partial\vec B/\partial t$.`,
    },
    {
      tex: t`\oint\vec B\cdot d\vec l`, name: 'the circulation of B', units: 'T·m',
      text: t`Walk round a loop adding up $\vec B\cdot d\vec l$. Magnetic field lines curl around what makes them; this measures how much curling the loop encloses.

With symmetry it gives fields directly: $B = \mu_0I/2\pi r$ round a wire, $\mu_0nI$ inside a solenoid.`,
    },
    {
      tex: t`\mu_0I_\text{enc}`, name: 'the current through the loop (Ampère)', units: t`$I$ in amperes; $\mu_0 = 4\pi\times10^{-7}$ T·m/A`,
      text: t`Moving charge through any surface bounded by the loop makes the magnetic field circulate: currents are the sources of magnetic fields, as charges are of electric ones.

$\mu_0$, the permeability of free space, sets how much field an ampere makes.`,
    },
    {
      tex: t`\mu_0\varepsilon_0\frac{d\Phi_E}{dt}`, name: 'Maxwell’s displacement current', units: t`$\mu_0\varepsilon_0 = 1/c^2$, in s²/m²`,
      text: t`Maxwell’s addition: a **changing electric flux** makes the magnetic field circulate exactly as a current does. It mends Ampère’s law for charging capacitors — and it mirrors Faraday’s term, so now a changing $\vec E$ makes $\vec B$ and a changing $\vec B$ makes $\vec E$.

The constant in front is $\mu_0\varepsilon_0 = 1/c^2$. Where there is no charge and no current, the two changing-field terms still feed each other, and the equations predict waves travelling at $c = 1/\sqrt{\mu_0\varepsilon_0} = 3.00\times10^8$ m/s: light.`,
      more: t`That $c$ is fixed by two constants of the vacuum, with no reference to anyone’s motion, is the puzzle Einstein resolved in 1905: if Maxwell’s equations hold in every inertial frame, light has the same speed in all of them.`,
    },
  ],
  readAloud: t`Electric field lines start and end on charges; magnetic field lines never start or end; a changing magnetic field drives a circulating electric field; and a current, or a changing electric field, drives a circulating magnetic field.`,
  why: 'With these four equations and the Lorentz force you can, in principle, explain every electrical and magnetic phenomenon — and they were the first laws of physics found to be consistent with special relativity.',
  visual: {
    type: 'em-field',
    title: 'The first equation, live',
    lead: t`A Gaussian surface (dashed) among three charges, cut by the page. The readout integrates $\vec E\cdot d\vec A$ over the whole closed surface and sets it beside $Q_\text{enc}/\varepsilon_0$ — parts 1 and 2. Drag the surface and the charges.`,
    tasks: [
      'Reshape and resize the surface without crossing a charge: the flux does not change.',
      'Drag the outside charge in, then out: the flux jumps by its charge over ε₀, then back.',
      'Imagine the same count for a magnet’s field: every line that goes in comes out, so it is always zero — part 3.',
    ],
    params: {
      unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6],
      charges: [{ x: -1.2, y: 0.6, q: 2, drag: true }, { x: 1.4, y: -0.9, q: -1, drag: true }, { x: 6, y: 2, q: 3, drag: true }],
      gauss: { shape: 'sphere', x: 0, y: 0, r: 3.5 }, shapes: ['sphere', 'cube', 'lumpy'],
      readouts: ['flux', 'Qenc', 'Qeps'], fieldLines: true, density: 10, arrows: false, labels: true,
    },
    caption: 'Field lines are drawn in the plane of the page only; the flux is integrated numerically over the whole closed surface in 3D.',
  },
  practice: [
    mcq({
      id: 'which-monopoles', difficulty: 1,
      prompt: t`$$${MAXWELL}$$ Which of the four equations says that there are no magnetic monopoles?`,
      visual: (() => { const m = barMagnetParts({}); return page({ x: [-3.4, 3.4], y: [-1.8, 1.8], ...m, caption: 'A bar magnet’s field lines (teal): each one closes on itself, running from S back to N inside the magnet.' }); })(),
      choices: [t`$\oint\vec B\cdot d\vec A = 0$`, t`$\oint\vec E\cdot d\vec A = Q_\text{enc}/\varepsilon_0$`, t`$\oint\vec E\cdot d\vec l = -d\Phi_B/dt$`, t`$\oint\vec B\cdot d\vec l = \mu_0I_\text{enc} + \mu_0\varepsilon_0\,d\Phi_E/dt$`],
      answer: 0,
      why: {
        1: 'This counts electric field through a closed surface, sourced by electric charge — which certainly exists.',
        2: 'This is Faraday’s law: a changing magnetic flux makes a circulating electric field.',
        3: 'This is the Ampère–Maxwell law: currents and changing electric flux make circulating magnetic fields.',
      },
      hints: ['A monopole would be a “magnetic charge” — a place where magnetic field lines begin or end.', 'Which equation counts magnetic field lines through a closed surface?'],
      teach: 'The net magnetic flux out of any closed surface is zero: magnetic field lines never begin or end.',
      explain: t`$\oint\vec B\cdot d\vec A = 0$: every magnetic field line entering a closed surface leaves it. Its electric twin has $Q_\text{enc}/\varepsilon_0$ on the right; this one has nothing, because there is no magnetic charge.`,
    }),
    mcq({
      id: 'pole-flux', difficulty: 2,
      prompt: t`A closed surface (dashed) surrounds only the north pole of a bar magnet. What is the net magnetic flux out of it?`,
      visual: (() => {
        const m = barMagnetParts({});
        return page({ x: [-3.4, 3.4], y: [-1.8, 1.8], ...m, curves: [...m.curves, circ2(0.95, 0, 0.75, { color: 'gold', dash: true, width: 2 })], caption: 'A closed surface (gold, dashed — a sphere cut by the page) round the magnet’s north end. Field lines leave it outside the magnet and enter it inside the magnet.' });
      })(),
      choices: ['Zero', 'Positive: field lines come out of the north pole', 'Negative: the lines inside the magnet point inward', 'It depends on how strong the magnet is'],
      answer: 0,
      why: {
        1: 'Lines do leave through the outer part of the surface — but the same lines come back in through the part inside the magnet, where B runs from S to N.',
        2: 'Field enters through the part inside the magnet, but exactly as much leaves outside.',
        3: 'A stronger magnet has more lines in and more out; the net is still zero.',
      },
      hints: ['Follow the field lines through the dashed surface: where do they come out, and where do they go in?', t`$\oint\vec B\cdot d\vec A = 0$ for any closed surface — even one round a pole.`],
      teach: 'A “pole” is not a source of field: the flux out of any closed surface, even one round a pole, is zero.',
      explain: t`Every line that leaves the surface outside the magnet re-enters it through the inside of the magnet, so $\oint\vec B\cdot d\vec A = 0$. Unlike charge, a pole cannot be isolated inside a surface.`,
    }),
    num({
      id: 'gauss-flux', difficulty: 2,
      gen(r) {
        const qa = r.pick([2, 3, 5]), qb = r.pick([-1, -4, -6]), qc = r.pick([4, 7]);
        const Q = (qa + qb) * 1e-9, flux = Q / EPS0;
        return {
          prompt: t`A closed surface contains charges of $+${qa}$ nC and $${qb}$ nC; a charge of $+${qc}$ nC sits outside it. What is the net electric flux out of the surface? ($\varepsilon_0 = 8.854\times10^{-12}$ F/m; give the sign)`,
          visual: gaussPic([{ x: -1.3, y: 0.7, q: qa }, { x: 1.4, y: -0.9, q: qb }, { x: 6.5, y: 2, q: qc }], 3.4, 'The surface (a sphere cut by the page) with two charges inside and one outside. Field lines in the plane of the page only.'),
          answer: flux, units: 'V m', tol: { rel: 0.01 },
          errors: apart([{ value: ((qa + qb + qc) * 1e-9) / EPS0, feedback: 'The charge outside sends in as much field as it takes out: leave it out.' }, { value: Q * EPS0, feedback: t`Divide by $\varepsilon_0$: $\Phi_E = Q_\text{enc}/\varepsilon_0$.` }], flux),
          hints: [t`Only the enclosed charge counts: $Q_\text{enc} = ${qa} + (${qb})$ nC.`, t`$\Phi_E = Q_\text{enc}/\varepsilon_0$.`],
          teach: t`The electric flux out of a closed surface is $Q_\text{enc}/\varepsilon_0$, whatever its shape and whatever lies outside.`,
          explain: t`$Q_\text{enc} = ${qa + qb}$ nC, so $\Phi_E = \dfrac{${qa + qb}\times10^{-9}}{8.854\times10^{-12}} = ${tn(flux)}$ V·m${qa + qb < 0 ? ' — negative: more field goes in than comes out' : ''}.`,
        };
      },
    }),
    num({
      id: 'faraday', difficulty: 2,
      gen(r) {
        const Acm2 = r.pick([50, 100, 200]), dBdt = r.pick([0.02, 0.15, 0.6]);
        const emf = Acm2 * 1e-4 * dBdt;
        return {
          prompt: t`A single circular loop of area ${Acm2} cm² lies flat in a uniform magnetic field perpendicular to it. The field grows at a steady ${dBdt} T/s. What emf, $\oint\vec E\cdot d\vec l$, is induced round the loop (in size)?`,
          visual: page({
            x: [-3.2, 3.2], y: [-1.75, 1.75],
            curves: [circ2(0, 0, 1.15, { color: 'gold', width: 2.6 })],
            points: [...fieldMarks(-2.8, 2.8, -1.45, 1.45, 8, 5, 'out', { skip: (x, y) => Math.abs(Math.hypot(x, y) - 1.15) < 0.22 }), lab(0, 1.48, 'B out of the page, growing', COL.B, 0, -2)],
            caption: 'The loop (gold) in a uniform field pointing out of the page (teal dots) that is growing stronger. The induced electric field circulates round the loop.',
          }),
          answer: emf * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: apart([{ value: Acm2 * dBdt, feedback: 'Convert the area: 1 cm² = 10⁻⁴ m².' }], emf * 1e3),
          hints: [t`$\Phi_B = BA$, so $\left|\dfrac{d\Phi_B}{dt}\right| = A\,\dfrac{dB}{dt}$.`],
          teach: t`Faraday’s law: the emf round a loop is the rate of change of the magnetic flux through it, $|\mathcal{E}| = |d\Phi_B/dt|$.`,
          explain: t`$|\mathcal{E}| = A\,\dfrac{dB}{dt} = (${Acm2}\times10^{-4}\ \text{m}^2)(${dBdt}\ \text{T/s}) = ${tn(emf * 1e3)}$ mV, circulating so as to oppose the growth of the flux.`,
        };
      },
    }),
    match({
      id: 'statements', difficulty: 2,
      prompt: t`Match each equation with what it says.`,
      left: [t`$\oint\vec E\cdot d\vec A = Q_\text{enc}/\varepsilon_0$`, t`$\oint\vec B\cdot d\vec A = 0$`, t`$\oint\vec E\cdot d\vec l = -d\Phi_B/dt$`, t`$\oint\vec B\cdot d\vec l = \mu_0I_\text{enc} + \mu_0\varepsilon_0\,d\Phi_E/dt$`],
      right: ['A changing magnetic flux drives a circulating electric field', 'Magnetic field lines begin on north poles and end on south poles', 'Electric field lines begin and end on charges', 'Currents and changing electric flux drive a circulating magnetic field', 'Magnetic field lines never begin or end'],
      answer: [2, 4, 0, 3],
      visual: { type: 'em-wave', params: { phase: 20, controls: [], readout: false }, caption: 'The four together allow this: electric (violet) and magnetic (teal) fields regenerating each other as they travel. Not to scale.' },
      hints: ['Two equations count field through closed surfaces (dA); two add it up round loops (dl).', 'Only one of the surface equations has a source on its right.'],
      teach: 'Each equation pairs a field integral with its source: charges for E through a surface, nothing for B, a changing B for E round a loop, and currents or a changing E for B round a loop.',
      explain: t`The odd one out — field lines “beginning on north poles” — is the monopole picture that $\oint\vec B\cdot d\vec A = 0$ rules out.`,
    }),
    mcq({
      id: 'empty-space', difficulty: 3,
      prompt: t`$$${MAXWELL}$$ Far out in empty space there is no charge and no current. Which terms can still be nonzero there?`,
      visual: { type: 'em-wave', params: { phase: 70, controls: [], readout: false, probe: 0.5 }, caption: 'A wave far from any charge or current. Electric field violet, magnetic teal; the wave travels along the gold arrow. Not to scale.' },
      choices: [
        t`$-d\Phi_B/dt$ and $\mu_0\varepsilon_0\,d\Phi_E/dt$, so the circulations of $\vec E$ and $\vec B$ can still be nonzero`,
        t`Only $Q_\text{enc}/\varepsilon_0$ — space always contains some charge`,
        'None: without charges or currents all four equations give zero fields',
        t`Only $\mu_0I_\text{enc}$, carried by the light itself`,
      ],
      answer: 0,
      why: {
        1: 'Empty space has none; the flux out of every closed surface there is zero.',
        2: 'The two changing-flux terms do not need charge or current: fields that change can source each other.',
        3: 'Light carries no current; what it carries is changing fields.',
      },
      hints: ['Cross out every term with Q or I in it. What is left on the right-hand sides?', 'A changing B gives a circulating E, and a changing E gives a circulating B.'],
      teach: 'In empty space only the two changing-flux terms survive — enough for electric and magnetic fields to sustain each other as a wave.',
      explain: t`With $Q_\text{enc} = 0$ and $I_\text{enc} = 0$: $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$ and $\oint\vec B\cdot d\vec l = \mu_0\varepsilon_0\,d\Phi_E/dt$. Each changing field makes the other — and solving these gives waves at $c = 1/\sqrt{\mu_0\varepsilon_0}$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-maxwell-term', difficulty: 2,
      prompt: t`$$${MAXWELL}$$ Which single term did Maxwell add to the laws already known in his time?`,
      visual: { type: 'em-gap', params: { controls: [], readout: false, surface: 'bag', t: 4 }, caption: 'A charging capacitor with a loop round its wire and a surface that slips between the plates: the case that showed a term was missing.' },
      choices: [t`$\mu_0\varepsilon_0\,d\Phi_E/dt$`, t`$-d\Phi_B/dt$`, t`$Q_\text{enc}/\varepsilon_0$`, t`$\mu_0I_\text{enc}$`],
      answer: 0,
      why: { 1: 'That is Faraday’s experimental law of induction (1831).', 2: 'That is Gauss’s law, the flux form of Coulomb’s law.', 3: 'That is Ampère’s original law (1820s).' },
      hints: ['Which term would be needed between the plates of a charging capacitor, where no current flows?'],
      teach: t`Maxwell added the displacement-current term, $\mu_0\varepsilon_0\,d\Phi_E/dt$, to Ampère’s law.`,
      explain: t`The displacement-current term $\mu_0\varepsilon_0\,d\Phi_E/dt$ made Ampère’s law consistent for changing fields (the charging capacitor) and, with Faraday’s law, predicted electromagnetic waves.`,
    }),
    num({
      id: 'cp-flux', difficulty: 2,
      gen(r) {
        const q = r.pick([-8, -3, 5, 12]);
        const flux = (q * 1e-9) / EPS0;
        return {
          prompt: t`What is the electric flux out of a closed surface, of any shape, that encloses a net charge of $${q}$ nC? (Give the sign.)`,
          visual: gaussPic([{ x: 0.4, y: 0.3, q }], 3.6, 'A closed surface (cut by the page) around a charge. Field lines in the plane of the page only.'),
          answer: flux, units: 'V m', tol: { rel: 0.01 },
          hints: [t`$\Phi_E = Q_\text{enc}/\varepsilon_0$, with $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`],
          teach: t`$\oint\vec E\cdot d\vec A = Q_\text{enc}/\varepsilon_0$, for any closed surface.`,
          explain: t`$\Phi_E = \dfrac{${q}\times10^{-9}}{8.854\times10^{-12}} = ${tn(flux)}$ V·m.`,
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([0.78, 2.25, 3.75]);
        const c = 1 / Math.sqrt(MU0 * EPS0), tmin = (d * 1e11) / c / 60;
        return {
          prompt: t`The last term of Maxwell’s equations hides the speed of light: $c = 1/\sqrt{\mu_0\varepsilon_0}$. Compute $c$ from $\mu_0 = 4\pi\times10^{-7}$ T·m/A and $\varepsilon_0 = 8.854\times10^{-12}$ F/m, then find how many minutes a radio command takes to reach a rover on Mars when Mars is $${d}\times10^{11}$ m from Earth.`,
          visual: { type: 'em-wave', params: { phase: 0, controls: [], readout: false, f: 8.4e9 }, caption: 'A radio wave is the same kind of wave as light, at a lower frequency. Not to scale.' },
          answer: tmin, units: 'min', tol: { rel: 0.01 },
          errors: apart([{ value: (d * 1e11) / c, feedback: 'That is in seconds; the question asks for minutes.' }], tmin),
          hints: [t`$c = 1/\sqrt{(4\pi\times10^{-7})(8.854\times10^{-12})} \approx ${tn(c)}$ m/s.`, t`Then $t = d/c$; divide seconds by 60.`],
          teach: 'Two constants measured with charges and currents on a bench fix the speed of light — and so the delay of every deep-space radio link.',
          explain: t`$c = ${tn(c, 4)}$ m/s, so $t = \dfrac{${d}\times10^{11}}{${tn(c, 4)}} = ${tn((d * 1e11) / c)}$ s $= ${tn(tmin)}$ min. Mars varies between about 0.55 and 4.0 × 10¹¹ m from Earth, so commands take between roughly 3 and 22 minutes — no one can steer a rover in real time.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §16.1 Maxwell’s equations and electromagnetic waves', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves' },
    { label: 'Particle Data Group: searches for magnetic monopoles', url: 'https://pdg.lbl.gov/' },
  ],
});
