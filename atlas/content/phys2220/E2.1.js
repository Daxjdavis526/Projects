// The electric field: the force per unit charge that a small positive test
// charge would feel at a point. It belongs to the place, not to the test
// charge; once known, it gives the force on any charge there, F = qE.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, QE, ME, MP, G0, tn, s3, field } from './_efield.js';

const t = String.raw;
const M_ALPHA = 6.645e-27;

// a source charge on the left and the point P, with a test charge there
const probePic = (q0, caption, extra = {}) => field({
  charges: [{ x: -5, y: -1, q: 4, label: 'Q' }], probe: { x: 3, y: 1.5, label: 'P' }, test: q0, fieldLines: true, density: 10, ...extra,
}, caption);

export default lesson({
  id: 'phys2220.E2.1',
  title: 'The electric field',
  minutes: 10, difficulty: 2,
  intro: t`A charge changes the space around it. At every point it sets up an **electric field** $\vec E$: the force that a small positive **test charge** $q_0$ would feel there, divided by that charge,

$$\vec E = \frac{\vec F}{q_0}$$

The field belongs to the **place**, not to the test charge: double $q_0$ and the force doubles, but $\vec E$ stays the same. Once you know $\vec E$, the force on *any* charge $q$ put there is $\vec F = q\vec E$ — along $\vec E$ for a positive charge, against it for a negative one. The unit is the newton per coulomb (N/C), which you will also meet as the volt per metre (V/m).`,
  symbols: [
    { tex: '\\vec E', text: 'the electric field at a point, in N/C: a vector that points the way a positive charge there would be pushed' },
    { tex: '\\vec F', text: 'the electric force on the test charge, in newtons (N), from all the other charges around it' },
    { tex: 'q_0', text: 'the test charge, in coulombs (C): positive by convention, and small enough not to push the other charges out of place' },
    { tex: '\\vec F = q\\vec E', text: 'the same definition turned round: the force on any charge $q$ (with its sign) placed where the field is $\\vec E$' },
  ],
  why: 'The field turns action at a distance into something local: charges make fields, and fields push charges. Later in the course the field carries energy, and light turns out to be a wave of it.',
  visual: {
    type: 'em-field',
    title: 'A test charge explores the field',
    lead: t`A source charge $Q$ sits on the left. The probe carries a small test charge $q_0$: drag it anywhere. The gold arrow is the field $\vec E$ at that point; the red (or blue) arrow is the force $\vec F$ on the test charge. The readout gives both sizes.`,
    tasks: [
      'Double q₀ from 1 nC to 2 nC: the force doubles, but |E| does not change.',
      'Make q₀ negative: the force flips to point at Q, while E still points away from it.',
      'Drag the probe twice as far from Q: |E| falls to a quarter — Coulomb’s inverse-square law again.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      charges: [{ x: -4, y: 0, q: 'Q', label: 'Q' }],
      sliders: [
        { key: 'Q', label: 'Source charge $Q$', min: 1, max: 8, step: 0.5, value: 4, unit: '\\mathrm{nC}', explain: 'The charge that makes the field.' },
        { key: 'q0', label: 'Test charge $q_0$', min: -3, max: 3, step: 0.5, value: 1, unit: '\\mathrm{nC}', explain: 'A small charge that feels the field. Its size and sign change the force on it, not the field.' },
      ],
      probe: { x: 2, y: 2 }, test: 'q0', readouts: ['E', 'F'], arrows: true, fieldLines: true, density: 12,
    },
    caption: 'The test charge is treated as too small to move Q. Field arrows are compressed so that weak and strong regions both show; the force arrow’s length is in proportion to q₀, and the readout gives the true sizes.',
  },
  example: {
    prompt: t`A test charge $q_0 = +2.0$ nC placed at point P feels an electric force of $3.0\times10^{-5}$ N pointing east. (a) What is the electric field at P? (b) What force would an electron feel at P? (c) What would its acceleration be? ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg)`,
    visual: field({ uniform: [15000, 0], probe: { x: 0, y: 0, label: 'P' }, test: 2, fieldLines: true, density: 8 }, 'The field at P points east, and so does the force (red) on the positive test charge. Arrow lengths are not to scale.'),
    steps: [
      { label: 'Field', text: t`Divide the force by the test charge: $E = \dfrac{F}{q_0} = \dfrac{3.0\times10^{-5}\ \text{N}}{2.0\times10^{-9}\ \text{C}} = 1.5\times10^{4}$ N/C. The test charge is positive, so $\vec E$ points the same way as $\vec F$: east.` },
      { label: 'Force on an electron', text: t`$\vec F = q\vec E$ with $q = -e$: $F = (1.602\times10^{-19})(1.5\times10^{4}) = ${tn(QE * 1.5e4)}$ N. The minus sign turns it round: the force points **west**.` },
      { label: 'Acceleration', text: t`$a = \dfrac{F}{m_e} = \dfrac{${tn(QE * 1.5e4)}}{9.109\times10^{-31}} = ${tn((QE * 1.5e4) / ME)}\ \text{m/s}^2$.` },
      { label: 'Sense check', text: t`That is about $${tn((QE * 1.5e4) / ME / G0, 2)}$ times $g$. Gravity's pull on the electron, $m_e g \approx 9\times10^{-30}$ N, is smaller than the electric force by a factor of about $10^{14}$ — which is why gravity is ignored for charged particles in fields.` },
    ],
    answer: t`(a) $1.5\times10^{4}$ N/C east; (b) $${tn(QE * 1.5e4)}$ N west; (c) $${tn((QE * 1.5e4) / ME)}\ \text{m/s}^2$ west.`,
  },
  practice: [
    num({
      id: 'e-from-f', difficulty: 1,
      gen(r) {
        const q0 = r.pick([1.0, 2.0, 2.5, 4.0, 5.0]), F = r.pick([1.2, 1.8, 2.4, 3.0, 4.5, 6.0]) * 1e-5, E = F / (q0 * 1e-9);
        return {
          prompt: t`A ${q0.toFixed(1)} nC test charge placed at point P feels an electric force of $${tn(F)}$ N. How strong is the electric field at P?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (q0 * 1e-9) / F, feedback: t`That is $q_0/F$, upside down: the field is force per unit charge, $F/q_0$.` }, { value: F * q0 * 1e-9, feedback: 'Divide the force by the test charge, do not multiply.' }],
          hints: [t`The field is the force per unit charge: $E = F/q_0$.`, t`Use coulombs: ${q0.toFixed(1)} nC $= ${q0.toFixed(1)}\times10^{-9}$ C.`],
          teach: 'The electric field at a point is the force on a test charge there divided by that charge.',
          explain: t`$E = \dfrac{F}{q_0} = \dfrac{${tn(F)}\ \text{N}}{${q0.toFixed(1)}\times10^{-9}\ \text{C}} = ${tn(E)}$ N/C, pointing the same way as the force, because the test charge is positive.`,
          visual: probePic(q0, 'The source charge Q, the point P and the test charge there, with the field (gold) and the force on the test charge (red). Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'double-test', difficulty: 1,
      prompt: t`At point P a 1.0 nC test charge feels a force of $2.0\times10^{-5}$ N. It is replaced by a 3.0 nC test charge at the same point. What happens to the electric field at P?`,
      choices: [
        t`It stays $2.0\times10^{4}$ N/C: the force triples, and so does $q_0$`,
        t`It triples to $6.0\times10^{4}$ N/C, because the force triples`,
        t`It falls to a third, because $E = F/q_0$ and $q_0$ tripled`,
        'It cannot be found without knowing the source charges',
      ],
      answer: 0,
      why: {
        1: 'The force does triple — but the field is the force per unit charge, and the charge tripled too.',
        2: 'That would be so only if the force stayed the same. It does not: the force is proportional to the test charge.',
        3: t`$E = F/q_0$ needs only the force on the test charge and its size — both given.`,
      },
      hints: ['How does the force on the test charge change when the test charge triples?'],
      teach: 'The field at a point is set by the source charges, not by the test charge used to measure it.',
      explain: t`With 1.0 nC, $E = 2.0\times10^{-5}/1.0\times10^{-9} = 2.0\times10^{4}$ N/C. With 3.0 nC the force is three times as large, $6.0\times10^{-5}$ N, and $E = 6.0\times10^{-5}/3.0\times10^{-9} = 2.0\times10^{4}$ N/C again.`,
      visual: probePic(3, 'The point P with the larger, 3.0 nC test charge on it. The source charges are unchanged. Not to scale.'),
    }),
    mcq({
      id: 'electron-direction', difficulty: 1,
      prompt: 'At a point P the electric field points north (up the page). Which way does the electric force on an electron at P point?',
      choices: [
        t`South: an electron is negative, so $\vec F = q\vec E$ points against $\vec E$`,
        'North: the force always points along the field',
        'There is none: a field pushes only positive charges',
        'East, at right angles to the field',
      ],
      answer: 0,
      why: {
        1: 'Along the field only for a positive charge. With q negative, qE points the other way.',
        2: 'The field pushes every charge: positive charges along it, negative charges against it.',
        3: 'An electric force always lies along the field, forward or backward — never sideways. (Magnetic forces push sideways; they come later in the course.)',
      },
      hints: [t`Write $\vec F = q\vec E$ with $q = -e$.`],
      teach: 'F = qE: a positive charge is pushed along the field, a negative charge against it.',
      explain: t`$\vec F = q\vec E$ with $q = -e$: the force has size $e|\vec E|$ and points opposite to $\vec E$ — south.`,
      visual: field({ uniform: [0, 2000], probe: { x: 0, y: 0, label: 'P' }, fieldLines: true, density: 9 }, 'A uniform field pointing north (up the page), and the point P.'),
    }),
    num({
      id: 'accel', difficulty: 2,
      gen(r) {
        const [name, m, n, sg] = r.pick([['a proton', MP, 1, '+e'], ['an electron', ME, 1, '−e'], ['an alpha particle', M_ALPHA, 2, '+2e']]);
        const E = r.pick([2.0e3, 5.0e3, 1.2e4, 3.0e4]), F = n * QE * E, a = F / m;
        return {
          prompt: t`How large is the acceleration of ${name} (charge ${sg}, mass $${tn(m, 4)}$ kg) in a uniform electric field of $${tn(E)}$ N/C? Ignore gravity. ($e = 1.602\times10^{-19}$ C)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: F, feedback: t`That is the force $|q|E$. Divide by the mass for the acceleration.` }, ...(n === 2 ? [{ value: (QE * E) / m, feedback: 'An alpha particle carries two elementary charges: |q| = 2e.' }] : [])],
          hints: [t`The force is $F = |q|E$; then $a = F/m$.`, t`$F = ${n === 2 ? '2' : ''}(1.602\times10^{-19})(${tn(E)}) = ${tn(F)}$ N.`],
          teach: 'In a field the force is qE, so the acceleration is qE/m: tiny masses get enormous accelerations.',
          explain: t`$F = |q|E = ${tn(F)}$ N and $a = F/m = ${tn(F)}/${tn(m, 4)} = ${tn(a)}\ \text{m/s}^2$ — about $${tn(a / G0, 2)}$ times $g$. Gravity is utterly negligible here.`,
          visual: field({ uniform: [E, 0], fieldLines: true, density: 9, particle: { kind: n === 2 ? 'alpha' : m === ME ? 'electron' : 'proton', x: 0, y: 0, speed: 0, path: false } }, `A uniform field pointing to the right, and the ${name.replace(/^an? /, '')} in it (drawn hugely enlarged).`),
        };
      },
    }),
    num({
      id: 'millikan', difficulty: 3,
      gen(r) {
        const rad = r.pick([0.8, 1.0, 1.2]), n = r.int(3, 9), rho = 920;
        const m = rho * (4 / 3) * Math.PI * (rad * 1e-6) ** 3, E = (m * G0) / (n * QE);
        return {
          prompt: t`In Millikan's oil-drop experiment a tiny drop of oil (radius ${rad} μm, density 920 kg/m³) carrying ${n} extra electrons hangs perfectly still between two horizontal metal plates. How strong is the electric field between the plates? ($g = 9.81\ \text{m/s}^2$, $e = 1.602\times10^{-19}$ C)`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (m * G0) / QE, feedback: `That holds up a drop with one extra electron. This one has ${n}: |q| = ${n}e.` }, { value: (rho * Math.PI * (rad * 1e-6) ** 3 * G0) / (n * QE), feedback: t`The volume of a sphere is $\tfrac43\pi r^3$ — the $\tfrac43$ is missing.` }],
          hints: ['Hanging still means the electric force upward balances the weight.', t`$|q|E = mg$ with $|q| = ${n}e$, so $E = mg/(${n}e)$. First find the mass: $m = \rho\cdot\tfrac43\pi r^3$.`, t`$m = 920\times\tfrac43\pi(${rad}\times10^{-6})^3 = ${tn(m)}$ kg.`],
          teach: 'A charge held still in a field has its weight balanced by the electric force: |q|E = mg.',
          explain: t`$m = \rho\cdot\tfrac43\pi r^3 = ${tn(m)}$ kg, so $E = \dfrac{mg}{${n}e} = \dfrac{(${tn(m)})(9.81)}{${n}(1.602\times10^{-19})} = ${tn(E)}$ N/C. The drop is negative, so the field must point **down** for the force on it to point up. Millikan found that the charges on his drops always came in whole multiples of one value, $e$: charge is quantized.`,
          visual: field({ unit: 'mm', x: [-10, 10], y: [-6, 6], sheets: [{ x: 0, y: 4, angle: 0, sigma: 40, width: 18 }, { x: 0, y: -4, angle: 0, sigma: -40, width: 18 }], fieldLines: true, density: 14, particle: { q: -n, m, x: 0, y: 0.6, speed: 0, path: false }, notes: { arrows: [{ from: [0.9, 0.9], to: [0.9, 3.2], label: 'qE', color: 'accent' }, { from: [0.9, 0.3], to: [0.9, -2.0], label: 'mg', color: 'ink2' }] } }, 'The oil drop (blue: negatively charged) between the plates, with the electric force on it (up) and its weight (down). The field points from the + plate down to the − plate. Not to scale: the drop is about a micrometre across.'),
        };
      },
    }),
    mcq({
      id: 'empty-point', difficulty: 2,
      prompt: 'Point P is empty: no charge sits there. Is there an electric field at P?',
      choices: [
        'Yes: the charges set up a field at every point around them, whether or not anything is there to feel it',
        'No: a field exists only where there is a charge',
        'Only while a test charge sits at P to feel it',
        'Only if P lies exactly on one of the field lines drawn',
      ],
      answer: 0,
      why: {
        1: 'The source charges make the field everywhere around them. A charge at P is needed only to feel a force.',
        2: 'A test charge reveals the field through the force on it; the field was there before it arrived and stays after it leaves.',
        3: 'Field lines are a sample drawn through a few points. The field is there between them too.',
      },
      hints: ['What does a test charge do: create the field at P, or detect it?'],
      teach: 'Charges fill the space around them with a field; a test charge only reveals it.',
      explain: 'The two charges make a field at every point near them, including P. Put any charge q at P and it feels F = qE at once — the field was already there.',
      visual: field({ charges: [{ x: -4, y: -1, q: 3 }, { x: 4, y: -1.5, q: -2 }], probe: { x: 1.2, y: 3.2, label: 'P' }, probeArrow: false, fieldLines: true, density: 10 }, 'Two charges, some of their field lines, and the empty point P.'),
    }),
    num({
      id: 'slope', difficulty: 2,
      gen(r) {
        const E = r.pick([1.5e4, 2.0e4, 2.5e4, 3.5e4]), k = E * 1e-3;     // μN per nC
        return {
          prompt: 'A student puts test charges of different sizes at the same point P, measures the force on each, and plots the force against the test charge. What is the electric field at P?',
          answer: E, units: 'N/C', tol: { rel: 0.02 },
          errors: [{ value: k, feedback: t`The slope is in μN per nC. Convert: $1\ \mu\text{N/nC} = 10^{-6}\ \text{N}/10^{-9}\ \text{C} = 1000$ N/C.` }],
          hints: [t`$F = q_0E$: a straight line through the origin whose slope is $E$.`, t`Read the slope in μN per nC, then convert: $1\ \mu\text{N/nC} = 1000$ N/C.`],
          teach: 'Force is proportional to test charge, F = q₀E, so the graph of F against q₀ is a straight line whose slope is the field.',
          explain: t`The line rises by $${s3(4 * k, 3)}$ μN over 4 nC: a slope of $${s3(k, 3)}$ μN/nC $= ${s3(k, 3)}\times10^{3}$ N/C, so $E = ${tn(E)}$ N/C.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4.6], y: [0, Math.ceil((4.6 * k) / 10) * 10], aspect: 'wide', xlabel: 'test charge q₀ (nC)', ylabel: 'force F (μN)',
              curves: [{ fn: `${k}*x`, color: 'ink3', width: 1.5, dash: true }],
              points: [1, 2, 3, 4].map((q) => ({ x: q, y: k * q, color: 'accent', r: 5 })),
            },
            caption: 'The measured force on each test charge, all at the same point P. The dashed line runs through the origin.',
          },
        };
      },
    }),
    mcq({
      id: 'source-charge', difficulty: 3, kind: 'error',
      prompt: t`A charge $Q = 5.0$ nC sits at the origin. A 1.0 nC test charge at point P, 6.0 cm away, feels a force of $1.25\times10^{-5}$ N. A student writes: “The field at P is $E = F/Q = 1.25\times10^{-5}/5.0\times10^{-9} = 2.5\times10^{3}$ N/C.” What is wrong?`,
      choices: [
        t`They divided by the source charge. The field is force per unit *test* charge: $1.25\times10^{-5}/1.0\times10^{-9} = 1.25\times10^{4}$ N/C`,
        t`They should have multiplied: $E = FQ$`,
        'Nothing: the field is the force divided by the charge that makes it',
        t`A field cannot be found from a measured force; it needs $E = kQ/r^2$`,
      ],
      answer: 0,
      why: {
        1: t`Multiplying gives N·C, not N/C. The field is a force *per* unit charge.`,
        2: 'The force is felt by the test charge, so the field divides by the test charge, whatever made the field.',
        3: t`Both routes work and agree: $kQ/r^2 = (8.988\times10^{9})(5.0\times10^{-9})/0.060^2 = ${tn((K * 5e-9) / 0.0036)}$ N/C, the same as $F/q_0$. The slip is dividing by $Q$.`,
      },
      hints: ['Which charge feels the 1.25 × 10⁻⁵ N force?', t`$E = F/q_0$: divide by the charge that feels the force.`],
      teach: 'E = F/q₀ divides by the test charge that feels the force — never by the source charge.',
      explain: t`The force acts on the 1.0 nC test charge, so $E = F/q_0 = 1.25\times10^{4}$ N/C. Check with Coulomb's law: $kQ/r^2 = ${tn((K * 5e-9) / 0.0036)}$ N/C. ✓`,
      visual: field({ charges: [{ x: -3, y: 0, q: 5, label: 'Q = 5.0 nC' }], probe: { x: 3, y: 0, label: 'P' }, test: 1, fieldLines: true, density: 10 }, 'The 5.0 nC charge Q and the 1.0 nC test charge at P, 6.0 cm away, with the force on it (red). Not to scale.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fair-weather', difficulty: 2, transfer: true,
      gen(r) {
        const E = r.pick([100, 120, 150]), mug = r.pick([0.2, 0.5, 1.0]), m = mug * 1e-9;
        const n = (m * G0) / (QE * E);
        return {
          prompt: t`In fair weather the air near the ground carries an electric field of about ${E} N/C pointing straight down: Earth's surface is negatively charged. A speck of dust of mass ${mug} μg ($${mug}\times10^{-9}$ kg) floats motionless in it. How many extra electrons does it carry? ($g = 9.81\ \text{m/s}^2$, $e = 1.602\times10^{-19}$ C)`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: (m * G0) / E, feedback: 'That is the charge in coulombs. Divide by e = 1.602 × 10⁻¹⁹ C to count the electrons.' }],
          hints: ['Floating: the upward electric force balances the weight, |q|E = mg.'],
          teach: 'A charge floats in a field when |q|E = mg; a negative charge is pushed against a downward field, so upward.',
          explain: t`$|q| = \dfrac{mg}{E} = \dfrac{(${mug}\times10^{-9})(9.81)}{${E}} = ${tn((m * G0) / E)}$ C, which is $${tn(n)}$ electrons. Negative charge is pushed against the field, so up — as it must be to float. Real dust is also lifted by air currents; this is the electric part alone.`,
          visual: field({ uniform: [0, -E], fieldLines: true, density: 9, particle: { q: -1, m: 1e-12, x: 0, y: 0, speed: 0, path: false }, notes: { arrows: [{ from: [1.2, 0.4], to: [1.2, 3], label: 'qE', color: 'accent' }, { from: [1.2, -0.4], to: [1.2, -3], label: 'mg', color: 'ink2' }] } }, 'The fair-weather field near the ground, pointing down, and the dust speck (blue: negative), hugely enlarged, with the electric force on it and its weight.'),
        };
      },
    }),
    num({
      id: 'cp-from-accel', difficulty: 2,
      gen(r) {
        const a = r.pick([2.4, 3.6, 4.8, 9.6]) * 1e11, E = (MP * a) / QE;
        return {
          prompt: t`A proton released at point P accelerates at $${tn(a)}\ \text{m/s}^2$ toward the east. What is the electric field at P? Give its size. ($m_p = 1.673\times10^{-27}$ kg, $e = 1.602\times10^{-19}$ C)`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: MP * a, feedback: t`That is the force $m_pa$. The field is the force per unit charge: divide by $e$.` }],
          hints: [t`$F = m_pa$, and $E = F/q$ with $q = e$.`],
          teach: 'Turn F = qE round: the field is E = F/q, and here the force comes from F = ma.',
          explain: t`$F = m_pa = (1.673\times10^{-27})(${tn(a)}) = ${tn(MP * a)}$ N, so $E = F/e = ${tn(E)}$ N/C, pointing east like the proton's acceleration (a proton is positive).`,
          visual: field({ uniform: [E, 0], fieldLines: true, density: 9, particle: { kind: 'proton', x: 0, y: 0, speed: 0, path: false } }, 'The proton at P, in a field pointing east. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-small', difficulty: 2,
      prompt: 'Why must a test charge be small?',
      choices: [
        'A large test charge would push and pull the other charges, changing the very field it is there to measure',
        'A large test charge would feel a smaller force',
        'A charge feels its own field, which would add to the field it measures',
        t`$E = F/q_0$ holds only for $q_0$ less than 1 C`,
      ],
      answer: 0,
      why: {
        1: 'A larger test charge feels a larger force, F = q₀E — that by itself is no problem.',
        2: 'A charge exerts no net force on itself; its own field never pushes it. The trouble is what it does to the other charges.',
        3: 'The definition holds for any size of charge; it is the other charges moving that spoils the measurement.',
      },
      hints: ['The source charges are pushed by the test charge too — Newton’s third law.'],
      teach: 'A test charge must be small so that it does not move the charges whose field it measures.',
      explain: 'The test charge pushes on the source charges as hard as they push on it. If those charges can move — free charges on a metal, say — a large test charge rearranges them and measures a field of its own making. In the limit of a tiny test charge, E = F/q₀ gives the undisturbed field.',
      visual: probePic(1, 'A source charge Q and a small test charge at P, with the field at P (gold) and the force on the test charge (red). Not to scale.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.4 Electric Field', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field' },
    { label: 'CODATA 2022 (NIST): e, mₑ, mₚ', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
