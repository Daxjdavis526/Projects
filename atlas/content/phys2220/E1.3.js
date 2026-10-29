// Coulomb's law: F = k|q₁q₂|/r², along the line joining two point charges,
// repulsive for like charges and attractive for unlike — and always an equal
// and opposite pair, however different the charges.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, K, QE, ME, MP, G, pairPic, chargesPic } from './_charges.js';

const t = String.raw;
const signed = (q) => `${q > 0 ? '+' : '-'}${Math.abs(q)}`;

export default lesson({
  id: 'phys2220.E1.3',
  title: 'Coulomb’s law',
  minutes: 12, difficulty: 2,
  intro: t`Two small charged objects push or pull on each other along the line joining them — apart for like charges, together for unlike — with a force proportional to each charge and inversely proportional to the square of the distance between them. This is **Coulomb’s law**:

$$F = k\,\frac{|q_1 q_2|}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} = 8.99\times10^{9}\ \text{N·m}^2/\text{C}^2$$

The force on $q_1$ from $q_2$ and the force on $q_2$ from $q_1$ form a Newton’s-third-law pair: **equal in size and opposite in direction, however different the two charges are.** In vector form the force on charge 2 is $\vec F_{12} = k\,\dfrac{q_1 q_2}{r^2}\,\hat r_{12}$, where $\hat r_{12}$ points from charge 1 to charge 2: with the charges’ signs included, a positive product pushes 2 away from 1 and a negative product pulls it closer.`,
  symbols: [
    { tex: 'F', text: 'the size of the electric force each charge exerts on the other, in N' },
    { tex: 'q_1,\\ q_2', text: 'the two charges, in C — treated as points (or as uniformly charged spheres, which act as if all their charge sat at their centres)' },
    { tex: 'r', text: 'the distance between the charges (centre to centre), in m' },
    { tex: 'k', text: 'Coulomb’s constant, $8.99\\times10^9$ N·m²/C²: the force between two 1 C charges 1 m apart — enormous, which is why a coulomb is so large a charge' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.85\\times10^{-12}$ C²/(N·m²); $k$ is written as $1/4\\pi\\varepsilon_0$ because it makes later laws (Gauss’s law) simpler. In air the force is within 0.06% of its value in vacuum' },
    { tex: '\\hat r_{12}', text: 'the unit vector (length 1) pointing from charge 1 toward charge 2' },
  ],
  why: 'Coulomb’s law holds atoms and molecules together and sets every chemical bond; between two protons it beats gravity by a factor of 10³⁶, which is why gravity matters only for huge, neutral lumps of matter like planets and stars.',
  visual: {
    type: 'em-coulomb',
    title: 'Equal and opposite, always',
    lead: t`Two point charges on a line. The gold arrows are the forces on each one, drawn to the same scale. Change the charges and the distance between them.`,
    tasks: [
      'Make q₁ five times bigger than q₂: the two arrows stay exactly equal — each charge pulls on the other just as hard.',
      'Double the separation, from 10 cm to 20 cm: both forces drop to a quarter.',
      'Flip the sign of one charge: the attraction turns into a repulsion of the same size.',
    ],
    params: { mode: 'pair', q1: 3, q2: -2, r: 10 },
  },
  example: {
    prompt: t`In a hydrogen atom the electron and the proton are, on average, about $5.29\times10^{-11}$ m apart. Find the electric force between them and compare it with their gravitational attraction. Then find the acceleration each would have from the electric force alone. ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg, $m_p = 1.673\times10^{-27}$ kg, $G = 6.674\times10^{-11}$ N·m²/kg²)`,
    visual: pairPic({ q1: 1, q2: -1, r: 10, ask: true, values: false }, 'A proton and an electron (drawn as small balls, far larger than real): equal and opposite forces. Not to scale.'),
    steps: [
      { label: 'Electric force', text: t`$F_e = k\,\dfrac{e^2}{r^2} = \dfrac{(8.99\times10^9)(1.602\times10^{-19})^2}{(5.29\times10^{-11})^2} = 8.24\times10^{-8}$ N, attractive.` },
      { label: 'Gravity', text: t`$F_g = G\,\dfrac{m_p m_e}{r^2} = \dfrac{(6.674\times10^{-11})(1.673\times10^{-27})(9.109\times10^{-31})}{(5.29\times10^{-11})^2} = 3.63\times10^{-47}$ N.` },
      { label: 'Compare', text: t`$F_e/F_g = 2.27\times10^{39}$. Both fall as $1/r^2$, so this ratio is the same at any distance: inside atoms, gravity is utterly negligible.` },
      { label: 'Accelerations', text: t`The two forces are equal, but the masses are not: $a_e = F/m_e = 9.1\times10^{22}$ m/s² and $a_p = F/m_p = 4.9\times10^{19}$ m/s² — the electron accelerates 1836 times more.` },
    ],
    answer: t`$F_e = 8.2\times10^{-8}$ N, $2.3\times10^{39}$ times their gravitational attraction; equal forces give $a_e = 9.1\times10^{22}$ m/s² and $a_p = 4.9\times10^{19}$ m/s².`,
  },
  practice: [
    num({
      id: 'force', difficulty: 1,
      gen(r) {
        const q1 = r.pick([2, 3, 5, -4]), q2 = r.pick([-6, 1.5, 4, 8]), rc = r.pick([5, 10, 12, 25]);
        const F = (K * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / (rc / 100) ** 2;
        return {
          prompt: t`Two small charged spheres, $q_1 = ${signed(q1)}$ µC and $q_2 = ${signed(q2)}$ µC, are ${rc} cm apart. How large is the force between them? ($k = 8.99\times10^9$ N·m²/C²)`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (K * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / (rc / 100), feedback: t`Square the distance: $F \propto 1/r^2$.` },
            { value: (K * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / rc ** 2, feedback: 'Convert the distance to metres before squaring.' },
          ],
          hints: ['Convert to SI: µC to C, cm to m.', t`$F = k|q_1q_2|/r^2$.`],
          teach: 'Coulomb’s law: F = k|q₁q₂|/r², with charges in coulombs and distance in metres.',
          explain: t`$F = \dfrac{(8.99\times10^9)(${Math.abs(q1)}\times10^{-6})(${Math.abs(q2)}\times10^{-6})}{(${rc / 100})^2} = ${tn(F)}$ N, ${q1 * q2 > 0 ? 'repulsive (like charges)' : 'attractive (unlike charges)'}.`,
          visual: pairPic({ q1: Math.max(-10, Math.min(10, q1)), q2: Math.max(-10, Math.min(10, q2)), r: Math.min(20, Math.max(2, rc > 20 ? 20 : rc)), ask: true, values: false }, 'The two charges and the forces on them (one scale for both). Not to scale with the numbers.'),
        };
      },
    }),
    num({
      id: 'distance-scaling', difficulty: 1,
      gen(r) {
        const F1 = r.pick([0.9, 2.4, 16]), [k, words] = r.pick([[2, 'twice'], [3, 'three times'], [0.5, 'half']]);
        const F2 = F1 / (k * k);
        return {
          prompt: t`Two charges ${k === 0.5 ? 'are' : 'start'} a distance $r$ apart and attract each other with a force of ${F1} N. What is the force when they are ${words} as far apart?`,
          answer: F2, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: F1 / k, feedback: t`The force goes as $1/r^2$: ${k} times the distance changes it by $1/${k}^2$, not $1/${k}$.` }, { value: F1 * k * k, feedback: k > 1 ? 'Farther apart means a weaker force.' : 'Closer together means a stronger force.' }].filter((e) => Math.abs(e.value - F2) > 1e-9),
          hints: [t`$F \propto 1/r^2$: $F_2/F_1 = (r_1/r_2)^2$.`],
          teach: 'Coulomb’s force is an inverse-square law: double the distance, a quarter the force.',
          explain: t`$F_2 = F_1/(${k})^2 = ${F1}/${k * k} = ${tn(F2)}$ N.`,
          visual: pairPic({ q1: 4, q2: -3, r: 8, ask: true, values: false }, 'Two charges attracting (forces drawn to scale at the starting distance).'),
        };
      },
    }),
    mcq({
      id: 'bigger-charge', difficulty: 1,
      prompt: t`A $+4$ µC charge and a $+1$ µC charge sit 10 cm apart. Which feels the larger electric force?`,
      choices: ['Neither: the forces on the two are equal in size', t`The $+1$ µC charge, because the bigger charge pushes harder`, t`The $+4$ µC charge, because it has more charge to be pushed`, 'It depends on their masses'],
      answer: 0,
      why: {
        1: 'Each charge pushes the other. Coulomb’s law gives one number, k|q₁q₂|/r², for the size of both forces.',
        2: 'More charge does mean a bigger force — on both of them equally: the product q₁q₂ appears in each.',
        3: 'Mass decides how much each accelerates, not how big the forces are.',
      },
      hints: ['Newton’s third law: if A pushes B, B pushes A back just as hard.', t`Does $k|q_1q_2|/r^2$ change if you swap $q_1$ and $q_2$?`],
      teach: 'The electric forces between two charges are always equal and opposite, whatever their sizes.',
      explain: t`Both feel $F = k(4\times10^{-6})(1\times10^{-6})/0.10^2 = 3.6$ N, in opposite directions. In tests of electricity concepts, many students pick the bigger charge — the third law still holds for electric forces.`,
      visual: pairPic({ q1: 4, q2: 1, r: 10, ask: true, values: false, forces: false }, 'A +4 µC and a +1 µC charge, 10 cm apart. Which feels the larger force?'),
    }),
    num({
      id: 'find-distance', difficulty: 2,
      gen(r) {
        const q1 = r.pick([20, 35, 50]), q2 = r.pick([-15, 40, -60]), F = r.pick([0.01, 0.025, 0.08]);
        const dist = Math.sqrt((K * Math.abs(q1 * 1e-9 * q2 * 1e-9)) / F);
        return {
          prompt: t`At what distance do charges of $${signed(q1)}$ nC and $${signed(q2)}$ nC exert a force of ${F} N on each other? Give the answer in cm.`,
          answer: dist * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((K * Math.abs(q1 * 1e-9 * q2 * 1e-9)) / F) * 100, feedback: t`Take the square root: $r = \sqrt{k|q_1q_2|/F}$.` }],
          hints: [t`Rearrange: $r^2 = k|q_1q_2|/F$.`, 'Charges in coulombs (1 nC = 10⁻⁹ C); the answer comes out in metres.'],
          teach: 'Solve Coulomb’s law for the distance: r = √(k|q₁q₂|/F).',
          explain: t`$r = \sqrt{\dfrac{(8.99\times10^9)(${q1}\times10^{-9})(${Math.abs(q2)}\times10^{-9})}{${F}}} = ${tn(dist)}$ m $= ${tn(dist * 100)}$ cm.`,
          visual: pairPic({ q1: q1 / 10, q2: q2 / 10, r: 12, qunit: 'nC', ask: true, values: false }, 'The two charges and their forces (separation not to scale).'),
        };
      },
    }),
    num({
      id: 'equal-charges', difficulty: 2,
      gen(r) {
        const F = r.pick([0.05, 0.2, 0.9]), rc = r.pick([4, 6, 10]);
        const q = (rc / 100) * Math.sqrt(F / K);
        return {
          prompt: t`Two identical small conducting balls carry equal charges and repel each other with a force of ${F} N when they are ${rc} cm apart. What is the charge on each, in nC?`,
          answer: q * 1e9, units: 'nC', tol: { rel: 0.01 },
          errors: [{ value: ((rc / 100) ** 2 * F / K) * 1e9, feedback: t`$F = kq^2/r^2$ gives $q^2$; take the square root.` }, { value: (rc / 100) * Math.sqrt(F / K) * 1e9 * Math.SQRT2, feedback: t`Both balls carry $q$: $F = kq\cdot q/r^2$, so $q = r\sqrt{F/k}$.` }],
          hints: [t`With equal charges, $F = kq^2/r^2$.`, t`$q = r\sqrt{F/k}$, with $r$ in metres.`],
          teach: 'For equal charges, Coulomb’s law gives q = r√(F/k).',
          explain: t`$q = (${rc / 100})\sqrt{${F}/8.99\times10^9} = ${tn(q)}$ C $= ${tn(q * 1e9)}$ nC each (both positive or both negative — repulsion cannot tell which).`,
          visual: pairPic({ q1: 5, q2: 5, r: 12, qunit: 'nC', ask: true, values: false }, 'Two equal charges repelling (sizes not shown).'),
        };
      },
    }),
    num({
      id: 'vs-gravity', difficulty: 2,
      gen(r) {
        const [pair, m1, m2] = r.pick([['two protons', MP, MP], ['two electrons', ME, ME], ['a proton and an electron', MP, ME]]);
        const ratio = (K * QE * QE) / (G * m1 * m2);
        return {
          prompt: t`For ${pair}, how many times stronger is the electric force between them than their gravitational attraction? ($k = 8.99\times10^9$ N·m²/C², $e = 1.602\times10^{-19}$ C, $G = 6.674\times10^{-11}$ N·m²/kg², $m_p = 1.673\times10^{-27}$ kg, $m_e = 9.109\times10^{-31}$ kg)`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: ratio * 1e-9 * 1e-9, feedback: 'Use the charge in coulombs, not nanocoulombs.' }],
          hints: ['You do not need a distance: both forces fall as 1/r², so it cancels.', t`$\dfrac{F_e}{F_g} = \dfrac{ke^2}{G m_1 m_2}$.`],
          teach: 'Electric and gravitational forces both fall as 1/r², so their ratio does not depend on distance — and for particles it is enormous.',
          explain: t`$\dfrac{F_e}{F_g} = \dfrac{(8.99\times10^9)(1.602\times10^{-19})^2}{(6.674\times10^{-11})(${tn(m1, 4)})(${tn(m2, 4)})} = ${tn(ratio)}$. Gravity dominates the universe at large only because big bodies are almost perfectly neutral.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-15, -9], y: [-50, 6], xlabel: 'log₁₀(distance / 1 m)', ylabel: 'log₁₀(force / 1 N)',
              curves: [{ fn: '-27.637 - 2*x', color: 'accent', width: 2.4, label: 'electric (two protons)', labelAt: -14.6, labelDy: 14 }, { fn: '-63.729 - 2*x', color: 'violet', width: 2.4, label: 'gravitational (two protons)', labelAt: -14.6, labelDy: -12 }],
            },
            caption: 'Electric and gravitational forces between two protons against distance, on logarithmic scales: two parallel lines, about 36 powers of ten apart at every distance.',
          },
        };
      },
    }),
    mcq({
      id: 'direction', difficulty: 2,
      prompt: t`A charge $q_1 = +2$ µC sits at the origin and $q_2 = -3$ µC sits at $(0, 4\ \text{cm})$. Which way does the force on $q_1$ point?`,
      choices: [t`Along $+y$, toward $q_2$`, t`Along $-y$, away from $q_2$`, t`Along $+x$, at right angles to the line between them`, t`There is no force on $q_1$: only the larger charge, $q_2$, is pushed`],
      answer: 0,
      why: {
        1: 'Unlike charges attract: each is pulled toward the other.',
        2: 'Coulomb forces act along the line joining the two charges, never across it.',
        3: 'Both charges feel forces, equal in size (Newton’s third law).',
      },
      hints: ['Like or unlike charges?', 'The force acts along the line joining them.'],
      teach: 'The Coulomb force acts along the line joining the charges: toward each other for unlike charges, apart for like.',
      explain: t`The charges are unlike, so $q_1$ is pulled toward $q_2$: along $+y$. In vector form $\vec F_{21} = k\dfrac{q_2 q_1}{r^2}\hat r_{21}$ with $\hat r_{21} = -\hat y$ (from $q_2$ to $q_1$): the negative product $q_1q_2$ flips it to $+\hat y$. ✓`,
      visual: chargesPic({ unit: 'cm', x: [-5, 5], y: [-1.5, 5.5], charges: [{ x: 0, y: 0, q: 2, label: 'q₁' }, { x: 0, y: 4, q: -3, label: 'q₂' }], forces: false }, 'The two charges (positions in cm). Force arrows not drawn.'),
    }),
    num({
      id: 'accelerations', difficulty: 2,
      gen(r) {
        const rn = r.pick([0.5, 1, 2]);
        const F = (K * QE * QE) / (rn * 1e-9) ** 2;
        return {
          prompt: t`An electron and a proton are released from rest ${rn} nm apart. How many times larger is the electron’s acceleration than the proton’s, at that moment? ($m_p = 1.673\times10^{-27}$ kg, $m_e = 9.109\times10^{-31}$ kg)`,
          answer: MP / ME, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: 'The forces are equal, but the accelerations are F/m: the electron is far lighter.' }, { value: ME / MP, feedback: 'Upside down: the lighter electron accelerates more.' }],
          hints: ['The two forces are equal and opposite.', t`$a = F/m$, so $a_e/a_p = m_p/m_e$.`],
          teach: 'Equal forces, unequal masses: the lighter particle accelerates more, by the ratio of the masses.',
          explain: t`Each feels $F = ${tn(F)}$ N, so $a_e/a_p = m_p/m_e = ${tn(MP / ME, 4)}$ — independent of the distance. The proton barely moves while the electron rushes toward it.`,
          visual: pairPic({ q1: 1, q2: -1, r: 10, ask: true, values: false }, 'A proton and an electron attracting each other (drawn the same size; really the electron is far lighter).'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-force', difficulty: 2,
      gen(r) {
        const q1 = r.pick([-12, 25, 40]), q2 = r.pick([18, -30]), rc = r.pick([3, 7.5, 15]);
        const F = (K * Math.abs(q1 * 1e-9 * q2 * 1e-9)) / (rc / 100) ** 2;
        return {
          prompt: t`What is the size of the electric force between charges of $${signed(q1)}$ nC and $${signed(q2)}$ nC that are ${rc} cm apart, and is it attractive or repulsive? (Enter the size; $k = 8.99\times10^9$ N·m²/C²)`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (K * Math.abs(q1 * 1e-9 * q2 * 1e-9)) / (rc / 100), feedback: 'Square the distance.' }],
          hints: [t`$F = k|q_1q_2|/r^2$.`],
          teach: 'Coulomb’s law for the size; the signs for the direction.',
          explain: t`$F = ${tn(F)}$ N, ${q1 * q2 > 0 ? 'repulsive' : 'attractive'}.`,
          visual: pairPic({ q1: q1 / 5, q2: q2 / 5, r: 10, qunit: 'nC', ask: true, values: false, forces: false }, 'The two charges (separation not to scale).'),
        };
      },
    }),
    num({
      id: 'cp-formation', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([2, 3, 5]), d = r.pick([10, 15, 20]);
        const F = (K * (q * 1e-6) ** 2) / (d * d);
        return {
          prompt: t`Engineers have studied flying spacecraft in formation using electric forces instead of thrusters. Two craft in geostationary orbit, ${d} m apart, are each charged to $+${q}$ µC. What is the repulsive force between them, in millinewtons? Treat them as point charges.`,
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: ((K * (q * 1e-6) ** 2) / d) * 1e3, feedback: 'Square the distance.' }, { value: ((K * q * q) / (d * d)) * 1e3, feedback: 'Convert microcoulombs to coulombs: 1 µC = 10⁻⁶ C.' }],
          hints: [t`$F = kq^2/d^2$ with $q$ in C and $d$ in m.`, 'Then convert newtons to millinewtons.'],
          teach: 'Coulomb’s law sets the size of the push between charged spacecraft.',
          explain: t`$F = \dfrac{(8.99\times10^9)(${q}\times10^{-6})^2}{${d}^2} = ${tn(F)}$ N $= ${tn(F * 1e3)}$ mN — tiny, but continuous and needing no propellant. It works at geostationary altitude because the plasma there is so thin that it screens the charges only beyond a few hundred metres; in low orbit the denser plasma screens them within millimetres. The same idea, an “electrostatic tractor”, has been proposed for nudging dead satellites.`,
          visual: pairPic({ q1: q, q2: q, r: 16, ask: true, values: false }, 'Two charged spacecraft (drawn as points) pushing each other apart. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-dust-grain', difficulty: 2,
      prompt: t`A dust grain carrying $-1$ nC drifts near a large probe charged to $+500$ nC. Which statement about the electric forces between them is true?`,
      choices: ['The grain pulls on the probe exactly as hard as the probe pulls on the grain', 'The probe pulls on the grain 500 times harder than the grain pulls on the probe', 'Only the probe exerts a force, because its charge is so much larger', 'The grain pulls harder, because its charge is negative'],
      answer: 0,
      why: {
        1: 'The 500 is in the product q₁q₂, which is the same for both forces.',
        2: 'Every charge exerts a force on every other: the grain’s pull on the probe is real, just not noticeable on a heavy probe.',
        3: 'The sign of a charge sets direction (attract or repel), not size.',
      },
      hints: ['Newton’s third law applies to electric forces.'],
      teach: 'Electric forces between two charges are always an equal and opposite pair.',
      explain: t`Both forces have size $k(1\times10^{-9})(500\times10^{-9})/r^2$ and point toward each other. The grain’s *acceleration* is huge and the probe’s negligible, because the masses differ — not the forces.`,
      visual: pairPic({ q1: -1, q2: 10, r: 12, qunit: 'nC', ask: true, values: false, forces: false }, 'The grain (left) and the probe (right), drawn as points. The probe’s charge is really 500 times the grain’s.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.3 Coulomb’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law' },
    { label: 'D. P. Maloney et al., “Surveying students’ conceptual knowledge of electricity and magnetism”, Am. J. Phys. 69, S12 (2001)', url: 'https://doi.org/10.1119/1.1371296' },
  ],
});
