// Scalars, vectors and arrays of numbers — the first lesson of the
// Mathematics of Spacetime track. Objects before components: an arrow is the
// same arrow in every basis; only its components change.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { still, turned, arrow3, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const SQ = [[1, 0], [0, 1]];

// components in a perpendicular unit basis turned anticlockwise by φ
const turnedComps = ([a, b], phi) => [a * Math.cos(phi * DEG) + b * Math.sin(phi * DEG), -a * Math.sin(phi * DEG) + b * Math.cos(phi * DEG)];
// one arrow, an old basis (faint) and a turned one (bold)
const twoBases = (v, phi, caption, o = {}) => still({ basis: turned(phi), ghost: SQ, vector: v.map(r6), view: Math.max(2.2, Math.max(...v.map(Math.abs)) + 0.9), construction: false, grid: 'none', ...o }, caption);

export default lesson({
  id: 'st-a.A1.1',
  title: 'Scalars, vectors and arrays of numbers',
  minutes: 9, difficulty: 1,
  intro: t`Physics is written in quantities of different **kinds**, and the kind decides what happens to a quantity when you change your point of view. A **scalar** is a single number that everyone computes the same way at a point: a mass, a temperature, the length of an arrow, the time a clock records. A **vector** is an arrow at a point: a displacement, a velocity, a force.

To write an arrow as numbers you must first choose **basis** arrows $\mathbf e_1, \mathbf e_2, \mathbf e_3$. Its **components** are the numbers that rebuild it from them:

$$\mathbf V = V^1\mathbf e_1 + V^2\mathbf e_2 + V^3\mathbf e_3$$

Turn the basis and the components change while the arrow stays put. So **a component is not a scalar** — “the $x$-component of the wind” depends on where you point $x$ — and a list of numbers is not automatically a vector.`,
  symbols: [
    { tex: t`\mathbf V`, text: 'the vector itself: an arrow at a point, with a length and a direction, in the units of what it describes (m, m/s, N). Bold marks the object, not a number' },
    { tex: t`\mathbf e_1,\ \mathbf e_2,\ \mathbf e_3`, text: 'the **basis**: three reference arrows that you choose. In this lesson they are perpendicular and one unit long; later they need not be' },
    { tex: t`V^1,\ V^2,\ V^3`, text: t`the **components**: how many of each basis arrow it takes to build $\mathbf V$. They carry the units of $\mathbf V$ when the basis arrows are pure directions` },
    { tex: t`V^i`, text: t`a component with an **index** $i$, a label that runs over 1, 2, 3. The raised 2 in $V^2$ means “component number 2”, not a square; its square is written $(V^2)^2$` },
  ],
  why: 'General relativity’s laws must hold in every coordinate system, and the only way to guarantee that is to write them in terms of objects — scalars, vectors and the tensors built from them — rather than one observer’s numbers.',
  visual: {
    type: 'ten-basis',
    title: 'One arrow, many sets of components',
    lead: t`The gold arrow is fixed. The blue and violet arrows are a basis, one unit long and at right angles; turn it with the slider. The dashed parallelogram splits the arrow along the basis, and the readout shows the components and the arrow’s true length.`,
    tasks: [
      t`Turn the basis until $V^2 = 0$: then $\mathbf e_1$ points along the arrow and $V^1$ equals its length.`,
      t`Turn it by $90^\circ$: the two components swap places and one of them changes sign.`,
      t`Drag the arrow’s tip anywhere and turn again: $\sqrt{(V^1)^2 + (V^2)^2}$ always matches the true length — for a basis like this one.`,
    ],
    params: { mode: 'vector', basis: SQ, rotate: true, rotateRange: [-180, 180], vector: [2.4, 1.3], readout: ['V', 'len'], view: 3 },
    caption: t`A plane with no axes of its own: the only reference arrows are the basis you choose, turned rigidly by $\varphi$. The faint lines are where $V^1$ or $V^2$ is a whole number. Lengths are in the arrow’s own units (say metres).`,
  },
  example: {
    prompt: t`A drone’s displacement is 3.0 m east and 4.0 m north. A second observer uses runway axes: $\mathbf e'_1$ along a runway pointing $30^\circ$ north of east, and $\mathbf e'_2$ at right angles to it, $30^\circ$ west of north. Find the components in both bases, and the length.`,
    visual: twoBases([3, 4].map((x) => x * 0.6), 30, t`The displacement (drawn at 0.6 of scale) with the compass basis faint and the runway basis bold. Same arrow, two bases.`),
    steps: [
      { label: 'First basis', text: t`With $\mathbf e_1$ east and $\mathbf e_2$ north, the components are read off directly: $(V^1, V^2) = (3.0, 4.0)$ m.` },
      { label: 'Turned basis', text: t`Because these basis arrows are perpendicular and one unit long, each component is the arrow’s projection onto one of them. The runway basis is the compass basis turned $30^\circ$ anticlockwise, so
$$V'^1 = V^1\cos30^\circ + V^2\sin30^\circ = 2.598 + 2.000 = 4.598\ \text{m},$$
$$V'^2 = -V^1\sin30^\circ + V^2\cos30^\circ = -1.500 + 3.464 = 1.964\ \text{m}.$$` },
      { label: 'Same arrow?', text: t`Rebuild it: $4.598\,\mathbf e'_1 + 1.964\,\mathbf e'_2$, with $\mathbf e'_1 = (\cos30^\circ, \sin30^\circ)$ and $\mathbf e'_2 = (-\sin30^\circ, \cos30^\circ)$ in compass terms, gives $(3.982 - 0.982,\ 2.299 + 1.701) = (3.000, 4.000)$ m. ✓` },
      { label: 'What did not change', text: t`The length: $\sqrt{3^2 + 4^2} = 5.000$ m and $\sqrt{4.598^2 + 1.964^2} = \sqrt{25.00} = 5.000$ m. The length is a scalar. “The first component” is not: it is 3.0 m for one observer and 4.6 m for the other.` },
    ],
    answer: t`$(V^1, V^2) = (3.0, 4.0)$ m; $(V'^1, V'^2) = (4.60, 1.96)$ m; the length is 5.00 m in both.`,
  },
  practice: [
    multi({
      id: 'which-scalar', difficulty: 1,
      prompt: 'Which of these are scalars — a single number that every observer computes the same way, whatever axes they use? Select every one.',
      visual: twoBases([2.2, 1.1], 35, 'One arrow and two bases: the faint one and the bold one, turned by 35°. Its length and direction are shared by both; its components are not.'),
      choices: [
        'The mass of a satellite',
        'The temperature at one point in a combustion chamber',
        'The length of a displacement',
        t`The $x$-component of a velocity`,
        'The angle between two arrows',
        'The list (pressure, temperature, density) of the air in a wind tunnel',
      ],
      answer: [0, 1, 2, 4],
      why: {
        3: t`Turn the axes and the $x$-component changes, though the velocity does not.`,
        5: 'That is three scalars written side by side — a list, not one number (and not a vector either: no entry changes when you turn your axes).',
      },
      hints: ['For each one ask: if I turned my axes, would this number change?'],
      teach: 'A scalar is one number that does not change when the basis does; components do change.',
      explain: 'Mass, temperature, the length of an arrow and the angle between two arrows are facts about the objects, so every basis gives the same number. An $x$-component depends on where you point the $x$ axis.',
    }),
    mcq({
      id: 'superscript', difficulty: 1,
      prompt: t`In index notation, what does $V^2$ mean?`,
      visual: arrow3([2, 2.5, 1.5], { caption: t`An arrow with components $(V^1, V^2, V^3) = (2, 2.5, 1.5)$: the grey path runs $V^1$ along $\mathbf e_1$, then $V^2$ along $\mathbf e_2$, then $V^3$ along $\mathbf e_3$.` }),
      choices: [t`The second component of $\mathbf V$`, t`$\mathbf V$ times itself, the square of its length`, t`The square of the first component, $(V^1)^2$`, t`The vector $\mathbf V$ in a two-dimensional space`],
      answer: 0,
      why: {
        1: t`Superscripts on components are labels, not powers. The squared length is written $|\mathbf V|^2$.`,
        2: t`A square of a component is written with brackets, $(V^1)^2$; the raised 2 alone names component number 2.`,
        3: 'The index says which component, not how many dimensions the space has.',
      },
      hints: ['In index notation a raised number on a component is a label.'],
      teach: t`$V^i$ is component number $i$; a square is written $(V^i)^2$.`,
      explain: t`$V^2$ is the second component: in the picture, $2.5$. Relativity writes vector components with raised indices, so get used to reading them as labels now.`,
    }),
    num({
      id: 'turned-comp', difficulty: 2,
      gen(r) {
        const phi = r.pick([20, 25, 30, 40, 50, 60]);
        const a = r.pick([1, 2, 3, 4]) * r.sign(), b = r.pick([1, 2, 3]) * r.sign();
        const which = r.pick([1, 2]);
        const [p, q] = turnedComps([a, b], phi);
        const ans = which === 1 ? p : q;
        const wrong = which === 1 ? turnedComps([a, b], -phi)[0] : turnedComps([a, b], -phi)[1];
        return {
          prompt: t`An arrow has components $(V^1, V^2) = (${a}, ${b})$ m in a perpendicular unit basis. The basis is turned anticlockwise by $${phi}^\circ$. What is the new component $V'^{${which}}$?`,
          visual: twoBases([a, b], phi, t`The arrow, the old basis (faint) and the basis turned by $${phi}^\circ$ (bold).`),
          answer: r6(ans), units: 'm', tol: { rel: 0.01, abs: 0.01 },
          errors: Math.abs(wrong - ans) > 0.05 ? [{ value: r6(wrong), feedback: 'That is the basis turned the other way. Turning the basis anticlockwise turns the components clockwise.' }] : [],
          hints: [
            t`For a perpendicular unit basis, a component is the projection of the arrow onto that basis arrow.`,
            t`$V'^1 = V^1\cos\varphi + V^2\sin\varphi$ and $V'^2 = -V^1\sin\varphi + V^2\cos\varphi$.`,
          ],
          teach: 'Components in a turned basis are new numbers describing the same arrow.',
          explain: t`$V'^1 = ${a}\cos${phi}^\circ + (${b})\sin${phi}^\circ = ${nice(p)}$ m and $V'^2 = -(${a})\sin${phi}^\circ + (${b})\cos${phi}^\circ = ${nice(q)}$ m. Check: $(${nice(p)})^2 + (${nice(q)})^2 = ${nice(p * p + q * q)} = (${a})^2 + (${b})^2$.`,
        };
      },
    }),
    num({
      id: 'third-comp', difficulty: 2,
      gen(r) {
        const [T, a, b, ans] = r.pick([[[2, 3, 6], -3, 6, 2], [[2, 3, 6], 6, -2, 3], [[4, 4, 7], 1, -8, 4], [[1, 4, 8], 4, 7, 4], [[2, 6, 9], 6, -7, 6], [[6, 6, 7], 2, 9, 6], [[3, 4, 12], 12, 3, 4]]);
        const L = Math.hypot(...T);
        return {
          prompt: t`Mission control lists a probe’s velocity in Earth-centred axes as $(v^1, v^2, v^3) = (${T.join(', ')})$ km/s. The probe’s navigation computer uses its own perpendicular unit axes and reports $v'^1 = ${a}$ km/s and $v'^2 = ${b}$ km/s. How large is $v'^3$ (ignore its sign)?`,
          visual: arrow3(T.map((x) => x / 3), { label: t`\mathbf v`, caption: t`The velocity in mission control’s axes (drawn at one third of scale, km/s), with its component path.` }),
          answer: ans, units: 'km/s', tol: { rel: 0.005 },
          errors: [
            { value: T[2], feedback: 'The third component changes too: the computer’s axes are not mission control’s. Only the length is shared.' },
            { value: L - Math.abs(a) - Math.abs(b), feedback: 'Lengths add in squares, not directly: |v|² = (v′¹)² + (v′²)² + (v′³)².' },
          ],
          hints: [t`The speed $|\mathbf v|$ is a scalar: work it out from mission control’s numbers.`, t`$|\mathbf v|^2 = ${T.map((x) => `${x}^2`).join(' + ')} = ${L * L}$, and the same speed must come from the computer’s components.`],
          teach: 'The length of a vector is the same in every perpendicular unit basis, even though every component changes.',
          explain: t`$|\mathbf v| = \sqrt{${L * L}} = ${L}$ km/s, so $(v'^3)^2 = ${L * L} - (${a})^2 - (${b})^2 = ${ans * ans}$ and $|v'^3| = ${ans}$ km/s.`,
        };
      },
    }),
    mcq({
      id: 'list-not-vector', difficulty: 2,
      prompt: t`A wind-tunnel log stores each test as the list $(p, T, \rho) = (101.3\ \text{kPa},\ 288\ \text{K},\ 1.225\ \text{kg/m}^3)$. Is this list a vector?`,
      choices: [
        'No: turning your axes changes none of the entries, so they are not the components of an arrow',
        'Yes: any list of three numbers is a vector in three dimensions',
        'Yes, because lists like this can be added and multiplied by numbers',
        'No, but only because the entries have different units',
      ],
      answer: 0,
      why: {
        1: 'A vector’s components must change in a definite way when the basis turns. Pressure, temperature and density are scalars; listing three of them makes a table, not an arrow.',
        2: 'You can add tables, but that is not what makes components: they must describe one arrow, and change together when the basis does.',
        3: 'Units matter, but they are not the whole story: the temperatures at three different points share one unit and still make no vector.',
      },
      hints: ['What would happen to each entry if the experimenter turned her axes by 90°?'],
      teach: 'An array of numbers is a vector’s components only if it changes like an arrow’s components when the basis changes.',
      explain: 'Each entry is a scalar, unchanged by any turn of the axes. The three numbers of a velocity, by contrast, mix into one another when the axes turn — that behaviour, not the count of entries, is what makes them components.',
    }),
    {
      type: 'slider', id: 'align', difficulty: 2,
      gen(r) {
        const [x, y] = r.pick([[2.4, 1.3], [1.5, 2.2], [2.6, 0.7], [1.2, 1.9], [2.0, 2.0]]);
        const th = Math.atan2(y, x) / DEG;
        return {
          prompt: t`Turn the basis until $\mathbf e_1$ points along the gold arrow, so that $V^2 = 0$.`,
          visual: { type: 'ten-basis', params: { mode: 'vector', basis: SQ, rotate: true, rotateRange: [-90, 90], vector: [x, y], dragVector: false, readout: false, view: 2.8 }, caption: 'The arrow is fixed; only the basis turns. The dashed parallelogram shows the two components.' },
          param: 'phi', answer: [Math.floor(th - 2.5), Math.ceil(th + 2.5)],
          instruction: 'Turn the basis with the slider, then check.',
          hints: [t`When $V^2 = 0$, the parallelogram collapses onto the line of $\mathbf e_1$.`, t`You need $\tan\varphi = ${y}/${x}$.`],
          teach: t`Choosing a basis arrow along a vector makes every other component zero — a choice of description, not a change to the arrow.`,
          explain: t`$\varphi = \arctan(${y}/${x}) = ${nice(th, 3)}^\circ$. Then $V^1 = \sqrt{${x}^2 + ${y}^2} = ${nice(Math.hypot(x, y), 3)}$, the arrow’s whole length, and $V^2 = 0$.`,
        };
      },
    },
    mcq({
      id: 'two-pilots', difficulty: 2,
      prompt: 'Two observers describe the same crosswind at an airfield. One, using runway axes, says its component along the runway is 8 m/s. The other, using compass axes, says its east component is 11 m/s. A student concludes that one of them must have measured badly. What is wrong with that conclusion?',
      visual: twoBases([2.6, 0.9], 40, 'One wind arrow. Faint: the compass basis (east, north). Bold: runway axes turned 40°. Each basis gives the arrow its own components.', { names: ['along runway', 'across'], ghostNames: ['east', 'north'], vname: 'wind' }),
      choices: [
        'Components depend on the basis: different numbers can describe the same wind, so both can be right',
        'Nothing: a vector has only one correct set of components',
        'The compass reading must be the right one, because compass axes are the true axes',
        'The two numbers can only be compared if both are converted to knots',
      ],
      answer: 0,
      why: {
        1: 'An arrow has one length and one direction, but a different set of components for every basis.',
        2: 'Nature has no preferred axes: compass directions are a convenient human choice, like runway axes.',
        3: 'Both are in m/s already; units are not the issue.',
      },
      hints: ['Are the two observers using the same basis arrows?', 'Check what both would agree on: the wind’s speed.'],
      teach: 'Disagreeing components are no evidence of error; disagreeing scalars, such as the wind speed, would be.',
      explain: 'Along-runway and east are different directions, so the components differ. The test of consistency is the scalar both can compute: the wind speed, from each observer’s full set of components, must agree.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turned', difficulty: 2,
      gen(r) {
        const phi = r.pick([15, 35, 45, 70]);
        const a = r.pick([2, 3, 5]) * r.sign(), b = r.pick([1, 2, 4]) * r.sign();
        const [, q] = turnedComps([a, b], phi);
        return {
          prompt: t`In a perpendicular unit basis a force has components $(F^1, F^2) = (${a}, ${b})$ N. Find $F'^2$ in a basis turned anticlockwise by $${phi}^\circ$.`,
          visual: twoBases([a, b], phi, t`The force, the old basis (faint) and the basis turned by $${phi}^\circ$ (bold).`, { vname: 'F' }),
          answer: r6(q), units: 'N', tol: { rel: 0.01, abs: 0.01 },
          hints: [t`$F'^2 = -F^1\sin\varphi + F^2\cos\varphi$.`],
          teach: 'Turning the basis changes the components but not the force.',
          explain: t`$F'^2 = -(${a})\sin${phi}^\circ + (${b})\cos${phi}^\circ = ${nice(q)}$ N.`,
        };
      },
    }),
    num({
      id: 'cp-thrust', difficulty: 3, transfer: true,
      gen(r) {
        const pitch = r.pick([10, 15, 20, 25]), gim = r.pick([2, 3, 4]), T = 7.6;
        const up = T * Math.cos((pitch + gim) * DEG);
        const body = [T * Math.cos(gim * DEG), T * Math.sin(gim * DEG)];
        // launch-site basis: up, downrange (drawn as x = downrange, y = up); body axes tilted by the pitch angle
        const e1 = [Math.sin(pitch * DEG), Math.cos(pitch * DEG)], e2 = [Math.cos(pitch * DEG), -Math.sin(pitch * DEG)];
        const s = 2.6 / T;
        const draw = [s * (body[0] * e1[0] + body[1] * e2[0]), s * (body[0] * e1[1] + body[1] * e2[1])];
        return {
          prompt: t`A rocket climbs with its long axis tilted $${pitch}^\circ$ from vertical toward downrange. In its body axes — $\mathbf e_1$ along the long axis, $\mathbf e_2$ at right angles to it, pointing down-and-downrange — the gimballed engine’s thrust has components $(T^1, T^2) = (${nice(body[0], 4)}, ${nice(body[1], 3)})$ MN. What is the thrust’s vertical component in launch-site axes?`,
          visual: still({ basis: [e1.map(r6), e2.map(r6)], ghost: [[0, 1], [1, 0]], ghostNames: ['up', 'downrange'], names: ['e₁ (long axis)', 'e₂'], vector: draw.map(r6), vname: 'thrust', view: 3, center: [0.6, 1.2], construction: true, grid: 'none' }, t`Body axes (bold) and launch-site axes (faint), at the problem’s angles. The thrust arrow shows its direction; its length is not to scale.`),
          answer: up, units: 'MN', tol: { rel: 0.005 },
          errors: [
            { value: T * Math.cos(pitch * DEG), feedback: t`That ignores the gimbal: $T^2$ contributes to the vertical component too.` },
            { value: T * Math.cos((pitch - gim) * DEG), feedback: t`$\mathbf e_2$ points down-and-downrange, so $T^2$ *reduces* the vertical part: subtract $T^2\sin${pitch}^\circ$.` },
            { value: body[0], feedback: 'That is the component along the long axis, which is tilted — not the vertical component.' },
          ],
          hints: [
            t`Write the body arrows in launch-site terms: $\mathbf e_1 = \cos${pitch}^\circ\,(\text{up}) + \sin${pitch}^\circ\,(\text{downrange})$ and $\mathbf e_2 = -\sin${pitch}^\circ\,(\text{up}) + \cos${pitch}^\circ\,(\text{downrange})$.`,
            t`Vertical component $= T^1\cos${pitch}^\circ - T^2\sin${pitch}^\circ$.`,
          ],
          teach: 'The same thrust arrow has body components and launch-site components; the second follow from the first through the basis arrows.',
          explain: t`$T_\text{up} = ${nice(body[0], 4)}\cos${pitch}^\circ - ${nice(body[1], 3)}\sin${pitch}^\circ = ${nice(up, 4)}$ MN — which is $7.6\cos${pitch + gim}^\circ$: the thrust points $${pitch + gim}^\circ$ from vertical. Its magnitude, 7.6 MN, is the same in both bases.`,
        };
      },
    }),
    mcq({
      id: 'cp-which', difficulty: 2,
      prompt: 'A spacecraft’s velocity is described by two navigation teams using different perpendicular unit axes. Which quantity must they agree on?',
      visual: twoBases([1.9, 1.6], -25, 'One velocity arrow in two bases: the faint one, and the bold one turned 25° clockwise.', { vname: 'v' }),
      choices: [
        'The spacecraft’s speed, the length of its velocity arrow',
        'The velocity’s first component',
        'The list of its three velocity components',
        'The angle between the velocity and their first basis arrow',
      ],
      answer: 0,
      why: {
        1: 'Each team’s first basis arrow points somewhere different, so their first components differ.',
        2: 'All three components change together when the basis changes.',
        3: 'That angle involves each team’s own basis arrow, so it differs from team to team.',
      },
      hints: ['Which of these is a property of the arrow alone, with no basis in it?'],
      teach: 'Only quantities that refer to the objects alone, not to a basis, are scalars.',
      explain: 'The speed is the arrow’s length: a scalar. Components, and angles to a chosen basis arrow, describe the arrow relative to a basis, so each team gets its own.',
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (vectors in flat space)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 2', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Fleisch, A Student’s Guide to Vectors and Tensors, ch. 1', url: 'https://www.cambridge.org/9780521171908' },
  ],
});
