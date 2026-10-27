// Gravitational and elastic potential energy: U_g = mgy (with a zero you
// choose) and U_s = ½kx², and the rule that connects them to work, ΔU = −W.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, sci, thou, springPic } from './_energy.js';

const t = String.raw;

// the worked example: a tool bag on a scaffold, measured from two different zeros
const EX = { m: 2.0, scaf: 6.0, base: 2.5 };
EX.U1 = EX.m * G * EX.scaf;                       // zero at the street: 117.6 J
EX.U2 = EX.m * G * (EX.scaf + EX.base);           // zero at the basement floor: 166.6 J
EX.Us1 = 0, EX.Us2 = EX.m * G * EX.base;          // at the street, with each zero

// a ground profile with two marked points, for climbs and descents
const profile = ({ fn, x, y, pts, caption, zero = true, extra = {} }) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide', xlabel: 'distance (m)', ylabel: 'height y (m)',
    curves: [{ fn, color: 'ink2', width: 2.6 }],
    shade: [{ fn, lower: String(y[0]), from: x[0], to: x[1], color: 'ink4', alpha: 0.3 }],
    points: pts,
    hlines: zero ? [{ y: 0, label: 'y = 0', color: 'gold' }] : [],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys2210.M8.1',
  title: 'Gravitational and elastic potential energy',
  minutes: 10, difficulty: 2,
  intro: t`Lift a box and the work you do is not lost: let go, and gravity gives it back as kinetic energy. Energy stored in the **arrangement** of a system — how high, how stretched — is **potential energy**:

$$U_g = mgy, \qquad U_s = \tfrac12 kx^2$$

$U_g$ belongs to the object–Earth system and is measured from a level $y = 0$ that you choose; only its changes, $\Delta U_g = mg\,\Delta y$, have physical meaning. $U_s$ is stored in a spring stretched or compressed by $x$. In both cases the change in potential energy is minus the work the force does: $\Delta U = -W$.`,
  symbols: [
    { tex: 'U_g = mgy', text: 'gravitational potential energy of the object–Earth system, in joules (J). Valid near Earth’s surface, where $g$ is constant' },
    { tex: 'y', text: 'height above the reference level $y = 0$ you chose, in metres; negative below it' },
    { tex: 'm,\\ g', text: 'the object’s mass (kg) and the free-fall acceleration, 9.8 m/s²' },
    { tex: 'U_s = \\tfrac12 kx^2', text: 'elastic potential energy stored in a spring, in J — the same for a stretch as for a compression' },
    { tex: 'k,\\ x', text: 'the spring constant (N/m) and the stretch or compression measured from the spring’s natural length (m)' },
    { tex: '\\Delta U = -W', text: 'the change in potential energy equals minus the work done by the force it belongs to (gravity, or the spring)' },
  ],
  why: 'Potential energy turns force problems into bookkeeping: height or compression stores energy that can be spent later — which is all a spring launcher, a pumped-storage dam or a climbing aircraft does.',
  visual: {
    type: 'graph',
    title: 'Choose your zero',
    lead: t`A hiker climbs from point A to point B. The gold line is the level where you have chosen $y = 0$, so $U_g = 0$ there. Move it and watch the potential energies change — and watch what does **not** change.`,
    tasks: [
      'Drag the zero level above A: U at A turns negative. Nothing physical happened — you only moved your reference.',
      t`Watch $\Delta U = U_B - U_A$ while you move the zero: it never changes. Only differences in potential energy matter.`,
      'Double the mass: every U, and ΔU, doubles.',
    ],
    params: {
      x: [0, 12], y: [-6, 21], xlabel: 'distance (m)', ylabel: 'height (m)', aspect: 'wide',
      sliders: [
        { key: 'y0', label: 'Zero level $y = 0$ at', min: -5, max: 20, step: 0.5, value: 0, unit: '\\mathrm{m}', explain: t`The height, on the ground’s scale, where you choose $U_g = 0$.` },
        { key: 'm', label: 'Hiker’s mass $m$', min: 40, max: 100, step: 1, value: 70, unit: '\\mathrm{kg}', explain: 'Including the backpack.' },
      ],
      curves: [{ fn: 'min(max(3 + 1.5*(x - 2), 3), 15)', color: 'ink2', width: 2.6 }],
      shade: [{ fn: 'min(max(3 + 1.5*(x - 2), 3), 15)', lower: '-6', from: 0, to: 12, color: 'ink4', alpha: 0.3 }],
      hlines: [{ y: 'y0', label: 'U = 0 here', color: 'gold' }],
      points: [{ x: 2, y: 3, color: 'accent', label: 'A', labelDy: -14 }, { x: 10, y: 15, color: 'accent', label: 'B', labelDy: -14 }],
      readouts: [
        { label: '$U_A = mg(y_A - y_0)$', expr: 'm*9.8*(3 - y0)', unit: '\\mathrm{J}', digits: 4 },
        { label: '$U_B$', expr: 'm*9.8*(15 - y0)', unit: '\\mathrm{J}', digits: 4 },
        { label: '$\\Delta U = U_B - U_A$', expr: 'm*9.8*12', unit: '\\mathrm{J}', digits: 4 },
      ],
    },
    caption: t`A is 3 m and B 15 m above the bottom of the valley. Near Earth’s surface $g$ is constant, so $U_g$ grows in proportion to height; the hiker is treated as a point.`,
  },
  example: {
    prompt: t`A ${EX.m.toFixed(1)} kg bag of tools sits on a scaffold ${EX.scaf.toFixed(1)} m above the street; the street is ${EX.base} m above the floor of the building’s basement. (a) Find the gravitational potential energy of the bag–Earth system with $y = 0$ at the street, and again with $y = 0$ at the basement floor. (b) The bag is lowered to the street. Find $\Delta U_g$ with each choice. (c) How much work does gravity do on the bag?`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 10], y: [-3.4, 7.6], aspect: 'wide', xlabel: '', ylabel: 'height (m)', xticks: 0.001,
        alt: 'A tool bag on a scaffold above a street, with a basement below',
        shade: [{ fn: '0', lower: '-3.4', from: 0, to: 10, color: 'ink4', alpha: 0.25 }, { fn: '6', lower: '5.8', from: 3, to: 6.5, color: 'ink3', alpha: 0.7 }, { fn: '0', lower: '-2.5', from: 6.8, to: 9.6, color: 'panel', alpha: 1 }],
        curves: [{ param: ['3.2', 't'], t: [0, 5.8], color: 'ink3', width: 2 }, { param: ['6.3', 't'], t: [0, 5.8], color: 'ink3', width: 2 }],
        points: [{ x: 4.6, y: 6.3, r: 7, color: 'warn', label: 'bag', labelDx: 10 }, { x: 7.2, y: -1.6, r: 0.01, color: 'ink3', label: 'basement' }],
        hlines: [{ y: 0, label: 'street', color: 'gold' }, { y: -2.5, label: 'basement floor', color: 'violet' }],
      },
      caption: 'Side view, to scale vertically. The gold and violet lines are the two choices of y = 0.',
    },
    steps: [
      { label: 'Zero at the street', text: t`$y = ${EX.scaf.toFixed(1)}$ m, so $U_g = mgy = (${EX.m.toFixed(1)})(9.8)(${EX.scaf.toFixed(1)}) = ${s3(EX.U1)}$ J.` },
      { label: 'Zero at the basement floor', text: t`Now $y = ${EX.scaf.toFixed(1)} + ${EX.base} = ${EX.scaf + EX.base}$ m, so $U_g = (${EX.m.toFixed(1)})(9.8)(${EX.scaf + EX.base}) = ${s3(EX.U2)}$ J. A different number for the same bag in the same place — because it is measured from a different zero.` },
      { label: 'The change is the same', text: t`Lowered to the street: with the street as zero, $\Delta U_g = 0 - ${s3(EX.U1)} = -${s3(EX.U1)}$ J. With the basement as zero, $\Delta U_g = ${s3(EX.Us2)} - ${s3(EX.U2)} = -${s3(EX.U1)}$ J. Identical: only differences have physical meaning.` },
      { label: 'Work done by gravity', text: t`$W_g = -\Delta U_g = +${s3(EX.U1)}$ J. Positive, as it should be: gravity points down and the bag moved down.` },
    ],
    answer: t`(a) ${s3(EX.U1)} J (zero at the street) or ${s3(EX.U2)} J (zero at the basement floor); (b) $\Delta U_g = -${s3(EX.U1)}$ J either way; (c) $W_g = +${s3(EX.U1)}$ J.`,
  },
  practice: [
    num({
      id: 'u-grav', difficulty: 1,
      gen(r) {
        const m = r.pick([2, 5, 12, 25, 60]), h = r.pick([1.5, 2.5, 4, 8, 12]);
        const U = m * G * h;
        return {
          prompt: t`A ${m} kg box sits on a shelf ${h} m above the floor. Taking $y = 0$ at the floor, what is the gravitational potential energy of the box–Earth system?`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: m * h, feedback: t`$U_g = mgy$: include $g = 9.8\ \text{m/s}^2$.` }, { value: 0.5 * m * G * h, feedback: 'There is no ½ in mgy — that belongs to kinetic and spring energy.' }],
          hints: [t`$U_g = mgy$ with $y$ measured up from your zero.`],
          teach: t`Near Earth’s surface, $U_g = mgy$, with $y$ measured from the level you chose as zero.`,
          explain: t`$U_g = (${m})(9.8)(${h}) = ${s3(U)}$ J.`,
          visual: profile({ fn: `${h}*max(0, min(1, min((x - 2)*40, (5 - x)*40)))`, x: [0, 7], y: [-0.5, h * 1.5], pts: [{ x: 3.5, y: h * 1.04, r: 7, color: 'warn', label: `${m} kg`, labelDy: -14 }], caption: 'The shelf unit and the box, side view. The gold line is the chosen zero, at the floor.' }),
        };
      },
    }),
    num({
      id: 'u-spring', difficulty: 1,
      gen(r) {
        const k = r.pick([200, 450, 800, 1200, 2500]), x = r.pick([0.02, 0.04, 0.05, 0.08, 0.1, 0.12]);
        const U = 0.5 * k * x * x;
        return {
          prompt: t`A spring with $k = ${thou(k)}$ N/m is compressed ${Math.round(x * 100)} cm. How much elastic potential energy does it store?`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: k * x * x, feedback: t`$U_s = \tfrac12 kx^2$ — include the ½.` },
            { value: 0.5 * k * x, feedback: 'The compression is squared.' },
            { value: 0.5 * k * (x * 100) ** 2, feedback: 'Convert the compression to metres first: cm² is not m².' },
          ],
          hints: [t`$U_s = \tfrac12 kx^2$, with $x$ in metres.`],
          teach: t`A spring compressed or stretched by $x$ stores $U_s = \tfrac12 kx^2$ — the work it took to deform it.`,
          explain: t`$U_s = \tfrac12(${thou(k)})(${x})^2 = ${s3(U)}$ J.`,
          visual: springPic({ c: -0.32, label: `${Math.round(x * 100)} cm`, caption: 'The compressed spring, not to scale. The dashed line marks the natural length.' }),
        };
      },
    }),
    mcq({
      id: 'zero-choice', difficulty: 2,
      prompt: 'A 1.0 kg book lies on a table 1.0 m high. Ana says the book–Earth system’s gravitational potential energy is 9.8 J. Ben says it is 0. Cy says it is −19.6 J. Who is right?',
      choices: ['All three, if they chose different zero levels', 'Only Ana: heights are measured from the floor', 'Only Ben: the book is not moving, so it has no energy', 'Nobody who gives a negative value: potential energy cannot be negative'],
      answer: 0,
      why: {
        1: 'The floor is a convenient zero, but not a law of nature. Any level works, as long as you keep it for the whole problem.',
        2: 'Being at rest means no kinetic energy. Potential energy depends on position, not on motion.',
        3: t`Below the chosen zero, $y$ is negative and so is $U_g = mgy$. Cy put the zero on a shelf 3.0 m above the floor.`,
      },
      hints: ['What reference level would give each answer?'],
      teach: 'The zero of potential energy is a choice; only changes in potential energy are physical.',
      explain: 'Ana measured from the floor (U = 9.8 J), Ben from the table top (U = 0), Cy from a shelf 3.0 m up (U = −19.6 J). Lift the book 0.5 m and all three agree that U rises by 4.9 J.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-0.3, 3.6], aspect: 'wide', xlabel: '', ylabel: 'height (m)', xticks: 0.001,
          alt: 'A book on a table with three possible zero levels',
          shade: [{ fn: '1', lower: '0.92', from: 2, to: 6.5, color: 'ink3', alpha: 0.8 }, { fn: '1.12', lower: '1', from: 3.6, to: 4.6, color: 'warn', alpha: 0.9 }],
          curves: [{ param: ['2.3', 't'], t: [0, 0.92], color: 'ink3', width: 3 }, { param: ['6.2', 't'], t: [0, 0.92], color: 'ink3', width: 3 }, { fn: '3', domain: [7, 10], color: 'ink3', width: 3 }],
          hlines: [{ y: 0, label: 'Ana’s zero (floor)', color: 'accent' }, { y: 1, label: 'Ben’s zero (table top)', color: 'good' }, { y: 3, label: 'Cy’s zero (shelf)', color: 'violet' }],
          points: [{ x: 4.1, y: 1.3, r: 0.01, color: 'warn', label: 'book', labelDx: -12 }],
        },
        caption: 'Side view, to scale vertically: the book on the table and three choices of y = 0.',
      },
    }),
    mcq({
      id: 'whose-energy', difficulty: 2,
      prompt: 'You lift a book from the floor onto a shelf. Where is the gravitational potential energy you gave it stored?',
      choices: ['In the book–Earth system: it belongs to the gravitational interaction between them', 'Inside the book', 'In your arm muscles', 'In the air under the book'],
      answer: 0,
      why: {
        1: 'Nothing about the book itself changed — same temperature, same atoms. What changed is how far apart the book and Earth are.',
        2: 'Your muscles *spent* chemical energy doing the work; the potential energy is in the new arrangement of book and Earth.',
        3: 'Air plays no part: the same energy is stored in a vacuum.',
      },
      hints: ['Potential energy is energy of arrangement. Which objects changed their arrangement?'],
      teach: 'Potential energy belongs to a system of interacting objects, not to one object on its own.',
      explain: 'Gravitational potential energy is energy of the configuration of two objects that attract each other. Saying “the book has U = mgy” is a convenient shorthand: Earth is so massive that it hardly moves, so all the kinetic energy goes to the book when it falls.',
      visual: {
        type: 'graph',
        params: {
          x: [-4, 4], y: [-2.2, 2.4], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
          alt: 'A book above Earth’s surface; each pulls on the other',
          curves: [{ param: ['9*sin(t)', '-9.6 + 9*cos(t)'], t: [-0.5, 0.5], color: 'accent', width: 3 }],
          shade: [{ fn: '1.45', lower: '1.15', from: -0.45, to: 0.45, color: 'warn', alpha: 0.9 }],
          arrows: [{ from: [-0.22, 1.15], to: [-0.22, 0.25], color: 'bad', label: 'Earth pulls the book', labelDx: -150, labelDy: 2 }, { from: [0.22, -0.6], to: [0.22, 0.3], color: 'violet', label: 'the book pulls Earth', labelDx: 10, labelDy: 2 }],
          points: [{ x: -2.6, y: -1.5, r: 0.01, color: 'accent', label: 'Earth' }],
        },
        caption: 'Book and Earth attract each other with equal and opposite forces. Not to scale: the arrows are equal in size, but the force on Earth hardly moves it.',
      },
    }),
    num({
      id: 'climb', difficulty: 2,
      gen(r) {
        const m = r.pick([60, 70, 80, 90]), yA = r.pick([800, 1200, 1500]), yB = yA + r.pick([350, 450, 600, 750]);
        const dU = m * G * (yB - yA);
        return {
          prompt: t`A ${m} kg hiker walks from a hut at $${thou(yA)}$ m above sea level to a summit at $${thou(yB)}$ m. By how much does the gravitational potential energy of the hiker–Earth system increase? Give the answer in kJ.`,
          answer: dU / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: (m * G * yB) / 1000, feedback: 'That is U at the summit measured from sea level. The question asks for the change from the hut to the summit.' }],
          hints: [t`$\Delta U_g = mg\,\Delta y$, with $\Delta y$ the gain in height.`],
          teach: 'The change in gravitational potential energy depends only on the change in height: ΔU = mgΔy.',
          explain: t`$\Delta y = ${thou(yB)} - ${thou(yA)} = ${yB - yA}$ m, so $\Delta U_g = (${m})(9.8)(${yB - yA}) = ${thou(Math.round(dU))}$ J $\approx ${fmt(dU / 1000, 3)}$ kJ. The path the hiker takes makes no difference.`,
          visual: profile({ fn: `${yA} + ${yB - yA}*(1 - cos(pi*min(max(x, 0), 10)/10))/2`, x: [-1, 11], y: [yA - 150, yB + 200], zero: false, pts: [{ x: 0, y: yA, color: 'accent', label: 'hut', labelDy: -14 }, { x: 10, y: yB, color: 'accent', label: 'summit', labelDy: -14, labelDx: -50 }], caption: 'The route in profile; heights above sea level. Horizontal distance not to scale.' }),
        };
      },
    }),
    num({
      id: 'store-energy', difficulty: 2,
      gen(r) {
        const k = r.pick([300, 500, 800, 2000]), x = r.pick([0.05, 0.06, 0.08, 0.1, 0.15]);
        const U = 0.5 * k * x * x;
        return {
          prompt: t`How far must you compress a spring with $k = ${thou(k)}$ N/m so that it stores ${fmt(U, 3)} J? Give the answer in cm.`,
          answer: x * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((2 * U) / k) * 100, feedback: t`That is $x^2$ (in some unit): take the square root.` }, { value: Math.sqrt(U / k) * 100, feedback: t`$U = \tfrac12 kx^2$, so $x = \sqrt{2U/k}$ — the 2 is missing.` }],
          hints: [t`Solve $U = \tfrac12 kx^2$ for $x$: $x = \sqrt{2U/k}$.`],
          teach: t`Because $U_s$ grows as $x^2$, the compression needed grows only as the square root of the energy.`,
          explain: t`$x = \sqrt{2(${fmt(U, 3)})/${thou(k)}} = ${x}$ m $= ${fmt(x * 100, 3)}$ cm.`,
          visual: springPic({ c: -0.3, label: 'x = ?', caption: 'The spring compressed by the unknown distance x. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cave', difficulty: 3,
      gen(r) {
        const m = r.pick([60, 70, 80]), d = r.pick([25, 40, 55, 70]);
        const U = -m * G * d;
        return {
          prompt: t`A ${m} kg caver climbs down to a chamber ${d} m below the cave entrance. Taking $y = 0$ at the entrance, what is the gravitational potential energy of the caver–Earth system in the chamber? Give the answer in kJ.`,
          answer: U / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: (m * G * d) / 1000, feedback: t`Below the zero level, $y$ is negative — and so is $U_g = mgy$.` }],
          hints: ['Where is the caver relative to the zero level: above or below?', t`$y = -${d}$ m, so $U_g = mgy$ is negative.`],
          teach: 'Below the zero level, gravitational potential energy is negative.',
          explain: t`$U_g = mgy = (${m})(9.8)(-${d}) = -${thou(Math.round(m * G * d))}$ J $\approx ${fmt(U / 1000, 3)}$ kJ. Negative just means “less than at the entrance”: climbing back out takes ${fmt(-U / 1000, 3)} kJ of work.`,
          visual: profile({ fn: `-${d}*exp(-((x - 6)/1.6)^2)`, x: [0, 12], y: [-d * 1.3, d * 0.35], pts: [{ x: 1, y: 0, color: 'accent', label: 'entrance', labelDy: -14 }, { x: 6, y: -d, color: 'warn', r: 6, label: 'chamber', labelDy: 14 }], caption: 'The cave in profile, with y = 0 at the entrance (gold). Horizontal distance not to scale.' }),
        };
      },
    }),
    num({
      id: 'gravity-work', difficulty: 2,
      gen(r) {
        const m = r.pick([0.15, 0.25, 0.45, 0.6]), h = r.pick([5, 8, 12, 15]);
        const W = -m * G * h;
        return {
          prompt: t`A ${m} kg ball is thrown straight up and rises ${h} m. How much work does gravity do on the ball during the rise?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: -W, feedback: t`That is $\Delta U_g$. Gravity’s work is minus the change in potential energy: $W_g = -\Delta U_g$.` }],
          hints: [t`The potential energy rises by $mgh$.`, t`$W_g = -\Delta U_g$.`],
          teach: t`A rise in gravitational potential energy means gravity did negative work: $W_g = -\Delta U_g$.`,
          explain: t`$\Delta U_g = mgh = (${m})(9.8)(${h}) = ${s3(m * G * h)}$ J, so $W_g = -${s3(m * G * h)}$ J: gravity points down while the ball moves up.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'ball', v: [0, 1], forces: [{ label: 'mg', mag: +(m * G).toFixed(2), dir: 270, kind: 'weight' }] }, caption: 'The rising ball: its only force is its weight, opposite to the motion. Air resistance ignored.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cubesat', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([600, 800, 1000, 1200]), x = r.pick([0.06, 0.08, 0.1, 0.12]);
        const U = 0.5 * k * x * x;
        return {
          prompt: t`A spring in a CubeSat deployer is compressed ${Math.round(x * 100)} cm when the satellite is loaded; its spring constant is $${thou(k)}$ N/m. How much energy does the spring store, ready to push the satellite out?`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: k * x * x, feedback: 'Include the ½.' }, { value: 0.5 * k * (x * 100) ** 2, feedback: 'Convert centimetres to metres before squaring.' }],
          hints: [t`$U_s = \tfrac12 kx^2$ with $x$ in metres.`],
          teach: t`A compressed spring stores $U_s = \tfrac12 kx^2$.`,
          explain: t`$U_s = \tfrac12(${thou(k)})(${x})^2 = ${s3(U)}$ J.`,
          visual: springPic({ c: -0.35, label: `${Math.round(x * 100)} cm`, blockLabel: 'sat', caption: 'The deployer spring compressed behind the satellite. Not to scale; real deployers use a long spring and a pusher plate.' }),
        };
      },
    }),
    num({
      id: 'cp-moon', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([12000, 15000, 16000]), h = r.pick([30, 50, 80, 100]);
        const U = m * 1.62 * h;
        return {
          prompt: t`A $${thou(m)}$ kg lunar lander hovers ${h} m above the Moon’s surface, where $g = 1.62\ \text{m/s}^2$. Taking $y = 0$ at the surface, what is the gravitational potential energy of the lander–Moon system?`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: m * G * h, feedback: 'On the Moon, use the Moon’s g, 1.62 m/s², not Earth’s.' }],
          hints: [t`$U_g = mgy$ with the Moon’s $g$.`],
          teach: t`$U_g = mgy$ holds near any body’s surface, with that body’s $g$.`,
          explain: t`$U_g = (${thou(m)})(1.62)(${h}) = ${sci(U, 3)}$ J — about a sixth of what the same height would give on Earth.`,
          visual: profile({ fn: `0.6*sin(x/2) + 0.3*sin(1.3*x)`, x: [0, 20], y: [-h * 0.15, h * 1.4], pts: [{ x: 10, y: h, r: 7, color: 'warn', label: 'lander', labelDy: -14 }], caption: 'The lander above the lunar surface; y = 0 at the surface (gold). Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-same-change', difficulty: 2,
      prompt: t`A 500 kg satellite is hoisted 30 m inside an assembly building. One engineer puts $y = 0$ at the floor; another puts it at the roof, 40 m up. How do their values of $\Delta U_g$ for the lift compare?`,
      choices: ['They are equal: +147 kJ for both', t`The roof engineer gets a negative $\Delta U_g$`, t`The floor engineer gets the larger $\Delta U_g$`, 'They cannot be compared, because the zero levels differ'],
      answer: 0,
      why: {
        1: t`The roof engineer’s values of $U_g$ are negative, but they still *increase* by the same amount: from $-mg(40)$ to $-mg(10)$.`,
        2: 'Changing the zero adds the same constant to every U, so it cancels from every difference.',
        3: 'The comparison is easy exactly because the constant cancels: ΔU = mgΔy for any zero.',
      },
      hints: ['ΔU = mgΔy. Does Δy depend on where you put y = 0?'],
      teach: 'The zero level shifts every potential energy by the same constant, so changes are the same for every choice.',
      explain: t`$\Delta U_g = mg\,\Delta y = (500)(9.8)(30) = 147$ kJ for both. The roof engineer goes from $-196$ kJ to $-49$ kJ: up by the same 147 kJ.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-2, 44], aspect: 'wide', xlabel: '', ylabel: 'height (m)', xticks: 0.001,
          alt: 'A satellite hoisted inside a tall building, with two zero levels',
          shade: [{ fn: '2.4', lower: '0', from: 4, to: 6, color: 'ink3', alpha: 0.6 }, { fn: '32.4', lower: '30', from: 4, to: 6, color: 'accent', alpha: 0.7 }],
          curves: [{ param: ['5', 't'], t: [32.4, 40], color: 'ink2', width: 1.6 }],
          arrows: [{ from: [7.2, 2], to: [7.2, 30], color: 'gold', label: '30 m', labelDy: 30 }],
          hlines: [{ y: 0, label: 'floor: y = 0 (first engineer)', color: 'good' }, { y: 40, label: 'roof: y = 0 (second engineer)', color: 'violet' }],
          points: [{ x: 1.2, y: 1.2, r: 0.01, color: 'ink3', label: 'start' }, { x: 1.2, y: 31.2, r: 0.01, color: 'accent', label: 'end' }],
        },
        caption: 'Side view of the hoist, to scale vertically.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §8.1 Potential energy of a system', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system' },
  ],
});
