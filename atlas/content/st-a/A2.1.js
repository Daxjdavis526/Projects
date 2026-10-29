// A vector is not its components: any basis of non-parallel arrows will do,
// components come from the parallelogram rule (not from perpendicular
// projections), and shrinking a basis arrow makes its component grow.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { still, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const unitAt = (deg) => [r6(Math.cos(deg * DEG)), r6(Math.sin(deg * DEG))];
const SKEW60 = [[1, 0], unitAt(60)];

export default lesson({
  id: 'st-a.A2.1',
  title: 'A vector is not its components',
  minutes: 10, difficulty: 2,
  intro: t`Lesson A1.1 only turned a basis rigidly. Nothing requires basis arrows to be perpendicular or one unit long: **any** two non-parallel arrows in a plane (three in space) will do. The components are still defined by

$$\mathbf V = V^i\,\mathbf e_i = V^1\mathbf e_1 + V^2\mathbf e_2$$

— how many of each basis arrow you add, tip to tail, to land on the arrow’s tip. Geometrically that is the **parallelogram rule**: through the tip, draw lines parallel to the basis arrows. It is *not* dropping perpendiculars: in a skewed basis, perpendicular projections give a different set of numbers (you will meet them again as the arrow’s lower-index components).

Two consequences carry through the whole course. Shrink a basis arrow and its component grows to compensate — the piece $V^1\mathbf e_1$ of the arrow does not change. And Pythagoras on the components, $\sqrt{(V^1)^2 + (V^2)^2}$, is the arrow’s length only for a perpendicular, unit basis.`,
  symbols: [
    { tex: t`\mathbf V`, text: 'the arrow: the object, the same whatever basis describes it' },
    { tex: t`\mathbf e_i`, text: t`the basis: any $n$ arrows, none a combination of the others ($n$ = 2 on a plane, 3 in space). Their lengths and angles are your choice` },
    { tex: t`V^i`, text: t`the components: the unique numbers with $V^i\mathbf e_i = \mathbf V$. Pure numbers if the basis arrows carry the units (a 2 m basis arrow), or in the arrow’s units if they are pure directions` },
    { tex: t`V^i\mathbf e_i`, text: t`summed over $i$ (summation convention): the arrow rebuilt tip to tail from its pieces $V^1\mathbf e_1$, $V^2\mathbf e_2$` },
  ],
  why: 'In general relativity the natural basis at each point is set by the coordinates, and it is almost never perpendicular and unit; every formula has to work in a basis like this one.',
  visual: {
    type: 'ten-basis',
    title: 'Drag the basis; the arrow stays put',
    lead: t`The gold arrow is fixed. Drag the tips of the basis arrows $\mathbf e_1$ (blue) and $\mathbf e_2$ (violet) to any lengths and angles. The dashed parallelogram builds the arrow from its pieces $V^1\mathbf e_1$ and $V^2\mathbf e_2$; the readout compares the true length with Pythagoras applied to the components.`,
    tasks: [
      t`Make $\mathbf e_2$ perpendicular to $\mathbf e_1$ and one grid square long: Pythagoras on the components now gives the true length. Skew it again and the two numbers part company.`,
      t`Halve the length of $\mathbf e_1$: $V^1$ doubles, and the dashed piece $V^1\mathbf e_1$ does not move.`,
      t`Drag $\mathbf e_2$ almost parallel to $\mathbf e_1$: the components grow huge with opposite signs — nearly parallel arrows must be added in large, nearly cancelling amounts.`,
    ],
    params: { mode: 'vector', basis: SKEW60, dragBasis: true, vector: [2.2, 1.6], dragVector: true, readout: ['V', 'len'], view: 2.4 },
    caption: t`Positions are drawn on a plane whose only marks are the basis you choose; the faint lines are where $V^1$ or $V^2$ is a whole number. “True length” is measured with the screen’s own ruler. Tips snap to a 0.1 grid.`,
  },
  example: {
    prompt: t`The basis arrows are both 1 m long, 60° apart: in a reference grid used only for drawing, $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (\tfrac12, \tfrac{\sqrt3}{2})$. The arrow is $\mathbf V = (1, 1)$ m in the same grid. Find $V^1$ and $V^2$, compare them with the perpendicular projections, and check the length.`,
    visual: still({ basis: SKEW60, vector: [1, 1], construction: true }, t`The basis 60° apart and the arrow $(1, 1)$ m. The dashed parallelogram is the construction of $V^1$ and $V^2$.`),
    steps: [
      { label: 'Set up', text: t`$V^1\mathbf e_1 + V^2\mathbf e_2 = \mathbf V$ in grid terms reads $V^1(1, 0) + V^2(\tfrac12, \tfrac{\sqrt3}{2}) = (1, 1)$: two equations for two unknowns.` },
      { label: 'Solve', text: t`The second entry gives $V^2\tfrac{\sqrt3}{2} = 1$, so $V^2 = \tfrac{2}{\sqrt3} = 1.1547$. The first gives $V^1 + \tfrac12V^2 = 1$, so $V^1 = 1 - \tfrac{1}{\sqrt3} = 0.4226$.` },
      { label: 'Not the projections', text: t`Dropping perpendiculars instead gives $\mathbf V\cdot\mathbf e_1 = 1$ and $\mathbf V\cdot\mathbf e_2 = \tfrac{1 + \sqrt3}{2} = 1.366$ — different numbers, describing the same arrow in another way. Only in a perpendicular unit basis do the two sets agree.` },
      { label: 'Length', text: t`$|\mathbf V| = \sqrt2 = 1.414$ m, but $\sqrt{0.4226^2 + 1.1547^2} = 1.230$. With the angle between the basis arrows it works: $(V^1)^2 + (V^2)^2 + 2V^1V^2\cos60^\circ = 0.1786 + 1.3333 + 0.4880 = 2.000$. ✓ That angle term is the first glimpse of the metric (lesson A6).` },
    ],
    answer: t`$(V^1, V^2) = (1 - \tfrac1{\sqrt3},\ \tfrac2{\sqrt3}) = (0.423, 1.155)$; the projections $(1, 1.366)$ are different numbers; $|\mathbf V|^2 = (V^1)^2 + (V^2)^2 + 2V^1V^2\cos60^\circ = 2$.`,
  },
  practice: [
    num({
      id: 'stretched', difficulty: 1,
      gen(r) {
        const a = r.pick([0.5, 2, 3]), b = r.pick([0.5, 2, 4]), p = r.pick([3, 4, 6]), q = r.pick([-2, 1, 2]);
        const which = r.pick([1, 2]);
        const ans = which === 1 ? p / a : q / b;
        return {
          prompt: t`On a survey map, $\mathbf e_1$ is an arrow ${a} km long pointing east and $\mathbf e_2$ is ${b} km long pointing north. A displacement is ${p} km east and ${Math.abs(q)} km ${q > 0 ? 'north' : 'south'}. What is its component $V^${which}$ in this basis?`,
          visual: still({ basis: [[a, 0], [0, b]], vector: [p, q], construction: false, grid: 'basis' }, t`The basis (${a} km east, ${b} km north) and the displacement. The faint lines are where $V^1$ or $V^2$ is a whole number.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: which === 1 ? p : q, feedback: t`That is the distance in km. The component counts how many basis arrows fit: divide by the arrow’s length, ${which === 1 ? a : b} km.` }, { value: which === 1 ? p * a : q * b, feedback: 'Multiplying goes the wrong way: a longer basis arrow means fewer of them, so a smaller component.' }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`$V^${which}\mathbf e_${which}$ must be the ${which === 1 ? 'east' : 'north'} part of the displacement.`],
          teach: 'A component counts basis arrows: double a basis arrow and its component halves.',
          explain: t`The ${which === 1 ? 'east' : 'north'} part is ${which === 1 ? p : q} km and each $\mathbf e_${which}$ is ${which === 1 ? a : b} km, so $V^${which} = ${which === 1 ? p : q}/${which === 1 ? a : b} = ${nice(ans)}$.`,
        };
      },
    }),
    num({
      id: 'skew', difficulty: 2,
      gen(r) {
        const al = r.pick([45, 60, 120, 135]), x = r.pick([1, 2, 3]), y = r.pick([1, 2, -1]);
        const s = Math.sin(al * DEG), c = Math.cos(al * DEG);
        const V2 = y / s, V1 = x - V2 * c;
        const which = r.pick([1, 2]);
        const ans = which === 1 ? V1 : V2;
        const proj = which === 1 ? x : x * c + y * s;
        return {
          prompt: t`The basis arrows are unit length, $${al}^\circ$ apart: $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (\cos${al}^\circ, \sin${al}^\circ)$ in a drawing grid. The arrow is $\mathbf V = (${x}, ${y})$ in the same grid. Find $V^${which}$.`,
          visual: still({ basis: [[1, 0], unitAt(al)], vector: [x, y], construction: false }, t`The two basis arrows, $${al}^\circ$ apart, and the arrow. Find its components by the parallelogram rule.`),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          errors: Math.abs(proj - ans) > 0.01 ? [{ value: r6(proj), feedback: t`That is the perpendicular projection $\mathbf V\cdot\mathbf e_${which}$. Components come from the parallelogram rule: solve $V^1\mathbf e_1 + V^2\mathbf e_2 = \mathbf V$.` }] : [],
          hints: [t`Write $V^1(1, 0) + V^2(\cos${al}^\circ, \sin${al}^\circ) = (${x}, ${y})$ entry by entry.`, t`The second entry involves only $V^2$: $V^2\sin${al}^\circ = ${y}$. Then the first gives $V^1$.`],
          teach: t`In a skewed basis, find components by solving $V^i\mathbf e_i = \mathbf V$, not by projecting.`,
          explain: t`$V^2 = ${y}/\sin${al}^\circ = ${nice(V2)}$ and $V^1 = ${x} - V^2\cos${al}^\circ = ${nice(V1)}$.`,
        };
      },
    }),
    mcq({
      id: 'construction', difficulty: 2,
      prompt: t`In a skewed basis, which construction gives the component $V^1$ of an arrow?`,
      visual: still({ basis: [[1.2, 0], [0.5, 1]], vector: [2.3, 1.4], construction: false }, 'A skewed basis and an arrow, with no construction drawn.'),
      choices: [
        t`Through the arrow’s tip, draw a line parallel to $\mathbf e_2$; where it meets the line of $\mathbf e_1$, count how many $\mathbf e_1$’s you have come`,
        t`Drop a perpendicular from the tip onto the line of $\mathbf e_1$ and count the $\mathbf e_1$’s to its foot`,
        t`Through the tip, draw a line parallel to $\mathbf e_1$ and see where it meets the line of $\mathbf e_2$`,
        t`Divide the arrow’s length by the length of $\mathbf e_1$`,
      ],
      answer: 0,
      why: {
        1: 'That is the perpendicular projection. It agrees with the component only when the basis arrows are perpendicular.',
        2: t`That line meets the $\mathbf e_2$ axis at $V^2\mathbf e_2$: it gives the other component.`,
        3: t`That ignores the direction of the arrow: it would be right only if $\mathbf V$ pointed along $\mathbf e_1$.`,
      },
      hints: [t`$\mathbf V = V^1\mathbf e_1 + V^2\mathbf e_2$: after the first piece, you must reach the tip by moving parallel to $\mathbf e_2$.`],
      teach: 'Components come from the parallelogram rule: lines through the tip parallel to the other basis arrows.',
      explain: t`Going from the tip back along $\mathbf e_2$ removes the piece $V^2\mathbf e_2$ and lands on the line of $\mathbf e_1$ at $V^1\mathbf e_1$. The perpendicular foot is somewhere else unless $\mathbf e_2 \perp \mathbf e_1$.`,
    }),
    {
      type: 'point', id: 'build', difficulty: 2,
      gen(r) {
        const B = r.pick([[[1, 0], [0.5, 0.9]], [[1.2, 0.3], [-0.3, 1]], [[0.8, 0], [0.6, 0.8]]]);
        const [c1, c2] = r.pick([[2, -1], [1, 2], [-1, 1.5], [2.5, 1]]);
        const tip = [c1 * B[0][0] + c2 * B[1][0], c1 * B[0][1] + c2 * B[1][1]];
        return {
          prompt: t`Drag the tip of the gold arrow so that its components in this basis are $(V^1, V^2) = (${c1}, ${c2})$.`,
          visual: { type: 'ten-basis', params: { mode: 'vector', basis: B, vector: [0.6, 0.6], dragVector: true, readout: false, view: 2.2, center: [0.4, 0.5] }, caption: t`Drag the gold tip. The dashed parallelogram shows the pieces $V^1\mathbf e_1$ and $V^2\mathbf e_2$ as you go; the faint lines are where a component is a whole number.` },
          answer: { x: r6(tip[0]), y: r6(tip[1]) }, tol: { x: 0.16, y: 0.16 },
          instruction: 'Drag the gold tip, then check.',
          hints: [t`Walk ${Math.abs(c1)} length${Math.abs(c1) === 1 ? '' : 's'} of $\mathbf e_1$ ${c1 < 0 ? 'backwards' : 'forwards'}, then ${Math.abs(c2)} length${Math.abs(c2) === 1 ? '' : 's'} of $\mathbf e_2$ ${c2 < 0 ? 'backwards' : 'forwards'}.`, t`The faint lines through the tip should be the line $V^1 = ${c1}$ and the line $V^2 = ${c2}$.`],
          teach: t`Components are instructions: so many of $\mathbf e_1$, then so many of $\mathbf e_2$, tip to tail.`,
          explain: t`$${c1}\,\mathbf e_1 + ${c2 < 0 ? `(${c2})` : c2}\,\mathbf e_2$ lands at $(${nice(tip[0], 3)}, ${nice(tip[1], 3)})$ in the drawing grid.`,
        };
      },
    },
    multi({
      id: 'what-changes', difficulty: 1,
      prompt: 'You replace one basis by another and describe the same arrow again. Which of these change? Select every one.',
      visual: still({ basis: [[0.9, 0.4], [-0.2, 1.1]], ghost: [[1, 0], [0, 1]], vector: [2.1, 1.3], construction: true, grid: 'none' }, 'One arrow; the old basis faint and the new one bold, with the new parallelogram.'),
      choices: ['The components', 'The arrow’s length', 'The arrow’s direction', t`The sum $V^i\mathbf e_i$`, 'The number of components'],
      answer: [0],
      why: {
        1: 'The arrow is untouched; only its description changes.',
        2: 'Direction belongs to the arrow, not to the basis.',
        3: t`$V^i\mathbf e_i$ is the arrow itself: new components times new basis arrows rebuild the same thing.`,
        4: 'The number of components is the dimension of the space, not a property of the basis.',
      },
      hints: [t`Which items mention the basis at all?`],
      teach: t`Only the components change with the basis; the arrow $V^i\mathbf e_i$ does not.`,
      explain: t`New basis arrows need new numbers to rebuild the same arrow. The arrow — its length, direction, and the sum $V^i\mathbf e_i$ that is the arrow — stays the same, and so does the count of components.`,
    }),
    num({
      id: 'length-skew', difficulty: 3,
      gen(r) {
        const al = r.pick([45, 60, 120]), V1 = r.pick([1, 2, 3]), V2 = r.pick([1, 2, -1]);
        const L = Math.sqrt(V1 * V1 + V2 * V2 + 2 * V1 * V2 * Math.cos(al * DEG));
        const naive = Math.hypot(V1, V2);
        const tip = [V1 + V2 * Math.cos(al * DEG), V2 * Math.sin(al * DEG)];
        return {
          prompt: t`In a basis of two 1 m arrows $${al}^\circ$ apart, an arrow has components $(V^1, V^2) = (${V1}, ${V2})$. How long is it?`,
          visual: still({ basis: [[1, 0], unitAt(al)], vector: tip.map(r6), construction: true }, t`The basis ($${al}^\circ$ apart) and the arrow built from its two pieces. The pieces are not at right angles.`),
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`Pythagoras assumes the pieces are perpendicular. Here they meet at $${al}^\circ$: add $2V^1V^2\cos${al}^\circ$ under the root (law of cosines).` }],
          hints: [t`The arrow is the sum of a piece of length $|V^1|$ along $\mathbf e_1$ and one of length $|V^2|$ along $\mathbf e_2$, at $${al}^\circ$ to each other.`, t`$|\mathbf V|^2 = (V^1)^2 + (V^2)^2 + 2V^1V^2\cos${al}^\circ$.`],
          teach: 'Lengths from components need the angles between the basis arrows; plain Pythagoras works only for perpendicular unit bases.',
          explain: t`$|\mathbf V|^2 = ${V1}^2 + (${V2})^2 + 2(${V1})(${V2})\cos${al}^\circ = ${nice(L * L)}$, so $|\mathbf V| = ${nice(L)}$ m — not $\sqrt{${V1 * V1 + V2 * V2}} = ${nice(naive)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'near-parallel', difficulty: 2,
      prompt: t`Keep the arrow fixed and turn $\mathbf e_2$ until it is almost parallel to $\mathbf e_1$. What happens to the components?`,
      visual: still({ basis: [[1, 0], [0.97, 0.24]], vector: [1.6, 1.2], construction: true }, t`$\mathbf e_2$ only $14^\circ$ from $\mathbf e_1$: the parallelogram stretches far out to reach the tip.`),
      choices: ['They grow very large, with opposite signs', 'They both shrink toward zero', 'They stay the same, since the arrow is fixed', 'They become equal'],
      answer: 0,
      why: {
        1: 'Nearly parallel arrows are poor at reaching sideways: you need many of them.',
        2: 'The arrow is fixed, but its components depend on the basis — that is the point.',
        3: 'Nothing forces them to be equal; their sizes grow and their signs differ.',
      },
      hints: ['Look at the dashed parallelogram: how far out along each basis arrow must it go?'],
      teach: 'As basis arrows become nearly parallel, components blow up: the basis is close to failing.',
      explain: t`To reach a tip off their common line, you must go far along one and nearly as far back along the other: large components of opposite sign. When the arrows are exactly parallel, they are no longer a basis at all.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-skew', difficulty: 2,
      gen(r) {
        const al = r.pick([50, 70, 110]), x = r.pick([2, 3]), y = r.pick([1, 2]);
        const V2 = y / Math.sin(al * DEG), V1 = x - V2 * Math.cos(al * DEG);
        const which = r.pick([1, 2]);
        return {
          prompt: t`With unit basis arrows $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (\cos${al}^\circ, \sin${al}^\circ)$ in a drawing grid, find $V^${which}$ for the arrow $\mathbf V = (${x}, ${y})$.`,
          visual: still({ basis: [[1, 0], unitAt(al)], vector: [x, y], construction: false }, t`The skewed basis ($${al}^\circ$) and the arrow.`),
          answer: r6(which === 1 ? V1 : V2), tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$V^2\sin${al}^\circ = ${y}$; then $V^1 = ${x} - V^2\cos${al}^\circ$.`],
          teach: t`Solve $V^1\mathbf e_1 + V^2\mathbf e_2 = \mathbf V$ entry by entry.`,
          explain: t`$V^2 = ${y}/\sin${al}^\circ = ${nice(V2)}$, $V^1 = ${x} - (${nice(V2)})\cos${al}^\circ = ${nice(V1)}$.`,
        };
      },
    }),
    num({
      id: 'cp-thrusters', difficulty: 3, transfer: true,
      gen(r) {
        const al = r.pick([45, 60, 75]), dvx = r.pick([1.2, 1.5, 2.0]), dvy = r.pick([0.4, 0.6, 0.8]);
        const s = Math.sin(al * DEG), c = Math.cos(al * DEG);
        const T2 = dvy / s, T1 = dvx - T2 * c;
        const which = r.pick([1, 2]);
        const ans = which === 1 ? T1 : T2;
        const proj = which === 1 ? dvx : dvx * c + dvy * s;
        return {
          prompt: t`A small spacecraft has two thrusters that push along unit directions $${al}^\circ$ apart: $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (\cos${al}^\circ, \sin${al}^\circ)$ in the flight team’s axes. A manoeuvre needs $\Delta\mathbf v = (${dvx},\ ${dvy})$ m/s. Each thruster changes the velocity only along its own direction. What velocity change must thruster ${which} deliver?`,
          visual: still({ basis: [[1, 0], unitAt(al)], vector: [dvx, dvy], vname: 'Δv', names: ['thruster 1', 'thruster 2'], construction: true }, t`The two thrust directions and the required $\Delta\mathbf v$; the parallelogram splits it into what each thruster supplies. Arrows to scale in m/s.`),
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: Math.abs(proj - ans) > 0.01 ? [{ value: proj, feedback: t`That is the projection of $\Delta\mathbf v$ onto thruster ${which}’s direction. The two burns add as arrows: split $\Delta\mathbf v$ by the parallelogram rule.` }] : [],
          hints: [t`$\Delta\mathbf v = \Delta v^1\mathbf e_1 + \Delta v^2\mathbf e_2$: the burns are the components in the thrusters’ basis.`, t`$\Delta v^2\sin${al}^\circ = ${dvy}$, then $\Delta v^1 = ${dvx} - \Delta v^2\cos${al}^\circ$.`],
          teach: t`A pair of non-perpendicular thrusters is a skewed basis, and the burns are the components of $\Delta\mathbf v$ in it.`,
          explain: t`$\Delta v^2 = ${dvy}/\sin${al}^\circ = ${nice(T2)}$ m/s and $\Delta v^1 = ${dvx} - ${nice(T2)}\cos${al}^\circ = ${nice(T1)}$ m/s. Thruster ${which} must deliver ${nice(ans)} m/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-same', difficulty: 2,
      prompt: t`Two engineers describe a displacement. One lists components $(3, 1)$, the other $(1, 2)$. Without more information, can you tell whether they mean the same displacement?`,
      visual: still({ basis: [[0.6, 0.6], [-0.2, 0.9]], ghost: [[1, 0], [0, 1]], vector: [1.6, 1.6], construction: false, grid: 'none' }, 'Two bases (faint and bold) and one arrow — but the numbers alone do not say which basis each engineer used.'),
      choices: [
        'No: you need each engineer’s basis arrows, then you can rebuild both arrows and compare',
        'Yes: different components mean different displacements',
        'Yes: compare the lengths √10 and √5 — they differ, so the arrows differ',
        'No: components never determine an arrow, even with the basis known',
      ],
      answer: 0,
      why: {
        1: 'Different components can describe the same arrow in different bases.',
        2: 'Pythagoras on components gives the length only for a perpendicular unit basis — which you have not been told.',
        3: t`Given the basis, $V^i\mathbf e_i$ rebuilds the arrow exactly.`,
      },
      hints: ['What else do components need before they mean an arrow?'],
      teach: 'Components mean nothing without their basis; together they rebuild the arrow.',
      explain: t`$(3, 1)$ and $(1, 2)$ are instructions for two different sets of basis arrows. Rebuild $V^i\mathbf e_i$ from each and compare the arrows — or compare scalars, such as lengths, computed correctly for each basis.`,
    }),
  ],
  sources: [
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §2.2–2.3 (vectors and bases)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Fleisch, A Student’s Guide to Vectors and Tensors, ch. 4 (non-orthogonal bases)', url: 'https://www.cambridge.org/9780521171908' },
    { label: 'Covariance and contravariance of vectors (parallelogram versus projection components)', url: 'https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors' },
  ],
});
