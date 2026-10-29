// Flow and the continuity equation: what goes in must come out — Q = Av is
// the same at every section of a liquid's steady flow; ρAv for a gas.
import { lesson, mcq, num } from '../../src/core/content.js';
import { RHO, s3, tn, flow, seg, box, label } from './_fluids.js';

const t = String.raw;
const r3 = (v) => +(+v).toFixed(3);
const area = (D) => (Math.PI * D * D) / 4;

// a straight pipe seen from the side, with the slab of liquid that passes a section in one second
function slab(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.6, 7.2], y: [-1.9, 1.9], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
      shade: [box(-0.6, 7.2, -1, 1, 'accent', 0.16), box(1, 4.6, -1, 1, 'gold', 0.3)],
      curves: [seg([-0.6, 1], [7.2, 1]), seg([-0.6, -1], [7.2, -1]), { param: ['1 + 0.28*cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }, seg([1, -1.35], [4.6, -1.35], { color: 'gold', width: 1.4 })],
      arrows: [{ from: [5.3, 0], to: [6.7, 0], color: 'ink2' }],
      points: [label(0.55, 1.35, 'area A', 'gold'), label(2.05, -1.65, 'v × 1 s', 'gold'), label(5.25, 0.3, 'flow', 'ink2')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M14.4',
  title: 'Flow and the continuity equation',
  minutes: 10, difficulty: 2,
  intro: t`In a steady flow nothing piles up between two cross-sections of a pipe, so whatever enters one end each second must leave the other. For a liquid, whose density does not change, that means the **volume flow rate** is the same at every section:

$$Q = A v, \qquad A_1 v_1 = A_2 v_2$$

Where the pipe narrows, the liquid must speed up; where it widens, it slows down. For a gas, whose density can change, it is the **mass flow rate** $\dot m = \rho A v$ that stays the same — the key to how a rocket nozzle works.`,
  symbols: [
    { tex: 'Q', text: 'the volume flow rate: the volume passing a section each second, in m³/s ($1\\ \\text{L/s} = 10^{-3}\\ \\text{m}^3/\\text{s}$)' },
    { tex: 'A', text: 'the cross-section’s area, in m²; for a round pipe of diameter $D$, $A = \\pi D^2/4$' },
    { tex: 'v', text: 'the flow speed, in m/s — the average across the section' },
    { tex: '\\dot m = \\rho A v', text: 'the mass flow rate, in kg/s: what a pump or an engine is rated by' },
    { tex: '1,\\ 2', text: 'labels for two sections of the same pipe, upstream and downstream' },
  ],
  why: 'Continuity sizes every feed line, valve and injector — a turbopump’s flow rate fixes the speed in each pipe it feeds — and, with density allowed to change, explains why a supersonic nozzle must widen.',
  visual: {
    title: 'What goes in must come out',
    lead: t`Liquid flows through a pipe that narrows to a throat and widens again. Each dot moves with the liquid; the gold slabs mark equal volumes.`,
    tasks: ['Set the throat area to 0.25: the throat speed becomes four times the inlet speed.', 'Watch the dots: as many cross each section every second, so they spread out and race through the throat.', 'Set the area ratio to 1: a straight pipe, the same speed everywhere.'],
    ...flow({ scene: 'venturi', v1: 1.5, ratio: 0.4, slugs: true, tubes: false, budget: false, sliders: ['v1', 'ratio'] },
    'Liquid flowing through a pipe that narrows and widens again. The gold slabs hold equal volumes: the pipe is round, so a slab half as wide (a quarter of the area) is four times as long. Incompressible, steady flow, uniform across each section; particles slowed for viewing, in proportion.'),
  },
  example: {
    prompt: t`A feed line $15$ cm in diameter carries $180$ kg/s of liquid oxygen ($1141\ \text{kg/m}^3$), then narrows to $10$ cm at a valve. Find the volume flow rate and the speed in each section.`,
    visual: flow({ scene: 'venturi', v1: 8.93, ratio: (10 / 15) ** 2, fluid: 'lox', tubes: false, budget: false, values: false }, 'The line narrowing at the valve (drawn as a smooth contraction). Particles slowed for viewing, in proportion.'),
    steps: [
      { label: 'Volume flow', text: t`$Q = \dfrac{\dot m}{\rho} = \dfrac{180\ \text{kg/s}}{1141\ \text{kg/m}^3} = 0.158\ \text{m}^3/\text{s}$ — 158 litres every second.` },
      { label: 'Wide section', text: t`$A_1 = \pi(0.075\ \text{m})^2 = 0.0177\ \text{m}^2$, so $v_1 = Q/A_1 = 8.93\ \text{m/s}$.` },
      { label: 'Narrow section', text: t`$A_2 = \pi(0.050\ \text{m})^2 = 0.00785\ \text{m}^2$, so $v_2 = Q/A_2 = 20.1\ \text{m/s}$.` },
      { label: 'Sense check', text: t`The speeds go inversely as the areas, which go as the square of the diameters: $v_2/v_1 = (15/10)^2 = 2.25$, and $8.93\times2.25 = 20.1$. ✓ Shrinking the diameter by a third more than doubles the speed.` },
    ],
    answer: t`$Q = 0.158\ \text{m}^3/\text{s}$; $v_1 = 8.9$ m/s, $v_2 = 20$ m/s.`,
  },
  practice: [
    num({
      id: 'q-from-av', difficulty: 1,
      gen(r) {
        const D = r.pick([1.6, 2.0, 2.5]), v = r.pick([1.5, 2.0, 3.0]);
        const Q = area(D / 100) * v * 1000;
        return {
          prompt: t`Water flows at ${v.toFixed(1)} m/s through a pipe ${D.toFixed(1)} cm in diameter. What is the volume flow rate, in litres per second?`,
          answer: Q, units: 'L/s', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * (D / 100) ** 2 * v * 1000, feedback: t`The radius is half the diameter: $A = \pi (D/2)^2$.` }],
          hints: [t`$Q = Av$ with $A = \pi(D/2)^2$ in m².`, t`$D/2 = ${tn(D / 200)}\ \text{m}$; multiply $Q$ in m³/s by 1000 for L/s.`],
          teach: 'Volume flow rate is cross-section area times speed: Q = Av.',
          explain: t`$A = \pi(${tn(D / 200)})^2 = ${tn(area(D / 100))}\ \text{m}^2$, so $Q = ${tn(area(D / 100))}\times${v.toFixed(1)} = ${tn(Q / 1000)}\ \text{m}^3/\text{s} = ${tn(Q)}\ \text{L/s}$.`,
          visual: slab('Each second, a slab of water of length v × (1 s) and area A passes any section: Q = Av. Not to scale.'),
        };
      },
    }),
    num({
      id: 'narrow', difficulty: 1,
      gen(r) {
        const D1 = r.pick([8, 10, 12]), D2 = r.pick([4, 5, 6]), v1 = r.pick([1.0, 1.5, 2.0]);
        const v2 = v1 * (D1 / D2) ** 2;
        return {
          prompt: t`Water moving at ${v1.toFixed(1)} m/s in a ${D1} cm pipe passes into a section ${D2} cm across. How fast does it move there?`,
          answer: v2, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: v1 * (D1 / D2), feedback: 'The area goes as the square of the diameter: square the ratio of the diameters.' }, { value: v1 * (D2 / D1) ** 2, feedback: 'The narrower section must carry the same flow through less area, so the water speeds up, not slows down.' }],
          hints: [t`$A_1 v_1 = A_2 v_2$, so $v_2 = v_1 \dfrac{A_1}{A_2}$.`, t`$\dfrac{A_1}{A_2} = \left(\dfrac{D_1}{D_2}\right)^2 = \left(\dfrac{${D1}}{${D2}}\right)^2$.`],
          teach: 'Continuity: where a pipe narrows, a liquid speeds up in inverse proportion to the area.',
          explain: t`$v_2 = ${v1.toFixed(1)}\times\left(\tfrac{${D1}}{${D2}}\right)^2 = ${v1.toFixed(1)}\times${tn((D1 / D2) ** 2)} = ${tn(v2)}\ \text{m/s}$.`,
          visual: flow({ scene: 'venturi', v1, ratio: (D2 / D1) ** 2, tubes: false, budget: false, values: false, play: false }, 'The pipe narrowing (and widening again). Arrows show the speed at three sections; not to scale.'),
        };
      },
    }),
    mcq({
      id: 'river', difficulty: 1,
      prompt: t`A river flows steadily through a narrow, deep gorge (Q) and then a wide, shallow stretch (P) where its cross-section area is three times larger. Where does the water move faster?`,
      choices: ['In the gorge, at Q', 'In the wide stretch, at P', 'The same at both: water is incompressible', 'It cannot be said without the river’s slope'],
      answer: 0,
      why: {
        1: 'The wide stretch carries the same flow through three times the area — so the water there is slower.',
        2: 'Because water is incompressible the *flow rate* is the same at both; the speed must then change with the area.',
        3: 'The slope drives the flow, but in steady flow continuity alone fixes the speed ratio: v = Q/A.',
      },
      hints: ['The same volume passes both sections every second.'],
      teach: 'In steady flow, Q = Av is the same at every section, so the speed is largest where the area is smallest.',
      explain: t`$v = Q/A$ with the same $Q$: the gorge, with a third of the area, has three times the speed. Rapids form in narrows for this reason.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 10], y: [-2.6, 2.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [{ fn: '2 - 1.4*exp(-((x - 3)/1.2)^2)', lower: '-2 + 1.4*exp(-((x - 3)/1.2)^2)', from: -6, to: 16, color: 'accent', alpha: 0.3 }],
          curves: [{ fn: '2 - 1.4*exp(-((x - 3)/1.2)^2)', color: 'good', width: 2.4 }, { fn: '-2 + 1.4*exp(-((x - 3)/1.2)^2)', color: 'good', width: 2.4 }],
          arrows: [{ from: [0.4, 0], to: [1.4, 0], color: 'ink2' }],
          points: [{ x: 3, y: 0, color: 'gold', label: 'Q' }, { x: 7.5, y: 0, color: 'gold', label: 'P' }],
        },
        caption: 'The river seen from above (depths not shown). Flow from left to right.',
      },
    }),
    num({
      id: 'pump-line', difficulty: 2,
      gen(r) {
        const md = r.pick([40, 70, 110]), D = r.pick([8, 10, 12]);
        const v = md / (RHO.rp1 * area(D / 100));
        return {
          prompt: t`A turbopump delivers ${md} kg/s of RP-1 kerosene ($810\ \text{kg/m}^3$) into a line ${D} cm in diameter. How fast does the fuel move in the line?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: md / area(D / 100), feedback: t`A mass flow is $\rho A v$: divide by the density too.` }, { value: md / (RHO.rp1 * Math.PI * (D / 100) ** 2), feedback: t`The radius is half the diameter: $A = \pi(D/2)^2$.` }],
          hints: [t`$\dot m = \rho A v$, so $v = \dfrac{\dot m}{\rho A}$.`, t`$A = \pi(${tn(D / 200)}\ \text{m})^2$.`],
          teach: 'Mass flow rate is ρAv; divide by ρ and A to get the speed.',
          explain: t`$A = ${tn(area(D / 100))}\ \text{m}^2$, so $v = \dfrac{${md}}{810\times${tn(area(D / 100))}} = ${tn(v)}\ \text{m/s}$.`,
          visual: flow({ scene: 'venturi', v1: 2, ratio: 1, fluid: 'rp1', tubes: false, budget: false, values: false, arrows: false, play: false }, 'The feed line, uniform: the same speed at every section. Not to scale.'),
        };
      },
    }),
    num({
      id: 'branch', difficulty: 2,
      gen(r) {
        const D = r.pick([10, 12, 16]), d = r.pick([5, 6, 8]), v = r.pick([1.5, 2.0, 2.5]);
        const vb = (v * (D / d) ** 2) / 2;
        return {
          prompt: t`Water flows at ${v.toFixed(1)} m/s in a main ${D} cm across, which splits into two identical branches ${d} cm across. How fast does it flow in each branch?`,
          answer: vb, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: v * (D / d) ** 2, feedback: 'The flow divides between two branches: each carries half of it.' }, { value: (v * (D / d)) / 2, feedback: 'Areas go as the square of the diameter.' }],
          hints: [t`What enters must leave: $A_\text{main} v = 2 A_\text{branch} v_b$.`, t`$v_b = \dfrac{v}{2}\left(\dfrac{D}{d}\right)^2$.`],
          teach: 'At a junction the flow divides, but the total Q leaving equals the Q arriving.',
          explain: t`$v_b = \dfrac{${v.toFixed(1)}}{2}\left(\dfrac{${D}}{${d}}\right)^2 = ${tn(vb)}\ \text{m/s}$.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 9], y: [-2.6, 2.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 3.4, -0.8, 0.8, 'accent', 0.3)],
              curves: [seg([0, 0.8], [3.4, 0.8]), seg([0, -0.8], [3.4, -0.8]), seg([3.4, 0.8], [7.5, 2.3]), seg([3.9, 0.15], [7.5, 1.5]), seg([3.4, -0.8], [7.5, -2.3]), seg([3.9, -0.15], [7.5, -1.5]), seg([3.4, 0.8], [3.9, 0.15], { color: 'ink4', dash: true }), seg([3.4, -0.8], [3.9, -0.15], { color: 'ink4', dash: true })],
              arrows: [{ from: [0.6, 0], to: [2.2, 0], color: 'gold' }, { from: [5.2, 1.27], to: [6.7, 1.82], color: 'gold' }, { from: [5.2, -1.27], to: [6.7, -1.82], color: 'gold' }],
              points: [label(0.4, 1.15, `main, ${D} cm`, 'ink2'), label(7.0, 2.45, `${d} cm`, 'ink2'), label(7.0, -2.5, `${d} cm`, 'ink2')],
            },
            caption: 'A main splitting into two equal branches, seen from above. Not to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'nozzle', difficulty: 3,
      prompt: t`Hot gas flows steadily through a rocket nozzle. Its density falls by a large factor between the combustion chamber and the exit. Which quantity has the same value at every cross-section of the nozzle?`,
      choices: [t`The mass flow rate $\rho A v$`, t`The volume flow rate $A v$`, t`The speed $v$`, t`The product $\rho v$`],
      answer: 0,
      why: {
        1: t`$Av$ is conserved only when the density is constant — a liquid. Here the expanding gas takes up ever more volume each second.`,
        2: 'The gas accelerates through the nozzle: that is what makes the thrust.',
        3: t`$\rho v$ is the mass flow per unit area; it changes wherever the area does.`,
      },
      hints: ['What cannot pile up or vanish between two sections in a steady flow?', 'Mass is conserved; volume is not, for a gas.'],
      teach: 'In steady flow the mass flow rate ρAv is the same at every section; Av alone only for an incompressible fluid.',
      explain: t`Mass is conserved, so $\rho_1 A_1 v_1 = \rho_2 A_2 v_2$. In a supersonic nozzle the density falls faster than the speed rises, so beyond the throat the area must **grow** to carry the same mass flow — the bell shape of every rocket nozzle.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.3, 5.6], y: [-1.8, 1.8], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [{ fn: '0.35 + 0.65*((2 - x)/2)^2', lower: '-0.35 - 0.65*((2 - x)/2)^2', from: 0, to: 2, color: 'warn', alpha: 0.3 }, { fn: '0.35 + 1.05*(x - 2)/3', lower: '-0.35 - 1.05*(x - 2)/3', from: 2, to: 5, color: 'warn', alpha: 0.15 }],
          curves: [
            { fn: '0.35 + 0.65*((2 - x)/2)^2', domain: [0, 2], color: 'ink2' }, { fn: '-0.35 - 0.65*((2 - x)/2)^2', domain: [0, 2], color: 'ink2' },
            { fn: '0.35 + 1.05*(x - 2)/3', domain: [2, 5], color: 'ink2' }, { fn: '-0.35 - 1.05*(x - 2)/3', domain: [2, 5], color: 'ink2' },
          ],
          points: [label(0.05, 1.3, 'chamber: dense, slow', 'ink2'), label(1.55, -0.75, 'throat', 'ink2'), label(3.6, 1.62, 'exit: thin, fast', 'ink2')],
        },
        caption: 'A converging–diverging rocket nozzle in cross-section. Shading fades as the gas thins. Not to scale.',
      },
    }),
    num({
      id: 'injector', difficulty: 3,
      gen(r) {
        const md = r.pick([8, 12, 20]), N = r.pick([60, 90, 120]), d = r.pick([1.5, 2.0, 2.5]);
        const Ah = area(d / 1000), v = md / (RHO.lox * N * Ah);
        const dots = [];
        for (let k = 0; k < 24; k++) { const th = (2 * Math.PI * k) / 24; dots.push({ x: r3(0.75 * Math.cos(th)), y: r3(0.75 * Math.sin(th)), color: 'ink', r: 2.5 }); }
        for (let k = 0; k < 12; k++) { const th = (2 * Math.PI * k) / 12 + 0.2; dots.push({ x: r3(0.42 * Math.cos(th)), y: r3(0.42 * Math.sin(th)), color: 'ink', r: 2.5 }); }
        return {
          prompt: t`An injector plate sprays ${md} kg/s of liquid oxygen ($1141\ \text{kg/m}^3$) through ${N} identical holes, each ${d.toFixed(1)} mm in diameter. How fast does the oxygen leave each hole?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: md / (RHO.lox * Ah), feedback: 'The flow is shared by all the holes: the total area is N times one hole’s.' },
            { value: md / (RHO.lox * N * Math.PI * (d / 1000) ** 2), feedback: t`The radius is half the diameter: $A = \pi(d/2)^2$.` },
          ],
          hints: [t`Total open area: $A = N\pi(d/2)^2$, with $d$ in metres.`, t`$v = \dfrac{\dot m}{\rho A}$.`],
          teach: 'Several outlets in parallel share the flow: use their total area in Q = Av.',
          explain: t`$A = ${N}\times\pi(${tn(d / 2000)})^2 = ${tn(N * Ah)}\ \text{m}^2$, so $v = \dfrac{${md}}{1141\times${tn(N * Ah)}} = ${tn(v)}\ \text{m/s}$. Real injectors are sized for speeds of roughly 10–50 m/s: fast enough to break the jets into droplets, not so fast that the pressure drop wastes the pump’s work.${v > 50 ? ' This plate, with too little open area, would be a poor design.' : ''}`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-2, 2], y: [-1.05, 1.05], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.4 }],
              shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'ink3', alpha: 0.35 }],
              points: [...dots, label(1.08, 0.7, `${N} holes,`, 'ink2'), label(1.08, 0.45, `each ${d.toFixed(1)} mm`, 'ink2')],
            },
            caption: 'An injector face, seen from the combustion chamber (holes drawn fewer and larger than real).',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tunnel', difficulty: 2, transfer: true,
      gen(r) {
        const s1 = r.pick([2.4, 3.0, 3.6]), s2 = r.pick([1.0, 1.2]), v1 = r.pick([4, 5, 6]);
        const v2 = v1 * (s1 / s2) ** 2;
        return {
          prompt: t`A low-speed wind tunnel draws air through a settling chamber ${s1.toFixed(1)} m × ${s1.toFixed(1)} m at ${v1} m/s, then squeezes it into a test section ${s2.toFixed(1)} m × ${s2.toFixed(1)} m. At these speeds the air’s density barely changes. How fast is the air in the test section?`,
          answer: v2, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: v1 * (s1 / s2), feedback: 'The areas are squares: their ratio is the square of the ratio of the sides.' }, { value: v1 * (s2 / s1) ** 2, feedback: 'The test section is smaller, so the air must move faster there.' }],
          hints: [t`$A_1 v_1 = A_2 v_2$ with square sections.`],
          teach: 'A contraction speeds a flow up by the ratio of the areas.',
          explain: t`$v_2 = ${v1}\times\dfrac{${s1.toFixed(1)}^2}{${s2.toFixed(1)}^2} = ${v1}\times${tn((s1 / s2) ** 2)} = ${tn(v2)}\ \text{m/s}$ — still well below a third of the speed of sound, so treating the air as incompressible is fair.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.3, 9.6], y: [-2.5, 2.5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 2.5, -2, 2, 'accent', 0.15), { fn: '0.7 + 1.3*(1 - (x - 2.5)/2.5)^2', lower: '-0.7 - 1.3*(1 - (x - 2.5)/2.5)^2', from: 2.5, to: 5, color: 'accent', alpha: 0.15 }, box(5, 9, -0.7, 0.7, 'accent', 0.25)],
              curves: [seg([0, 2], [2.5, 2]), seg([0, -2], [2.5, -2]), { fn: '0.7 + 1.3*(1 - (x - 2.5)/2.5)^2', domain: [2.5, 5], color: 'ink2' }, { fn: '-0.7 - 1.3*(1 - (x - 2.5)/2.5)^2', domain: [2.5, 5], color: 'ink2' }, seg([5, 0.7], [9, 0.7]), seg([5, -0.7], [9, -0.7])],
              arrows: [{ from: [0.4, 0], to: [1.6, 0], color: 'gold' }],
              points: [label(0.1, 2.3, `${s1.toFixed(1)} m × ${s1.toFixed(1)} m`, 'ink2'), label(5.6, 1.0, `test section, ${s2.toFixed(1)} m × ${s2.toFixed(1)} m`, 'ink2'), label(0.4, -0.35, `${v1} m/s`, 'gold')],
            },
            caption: 'The tunnel seen from the side: settling chamber, contraction, test section. Not to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-third', difficulty: 2,
      prompt: t`Water flows steadily through a pipe whose area narrows from $A$ to $A/3$. In the narrow part, compared with the wide part, the speed is ___ and the volume flow rate is ___.`,
      choices: ['3 times as large; the same', '3 times as large; 3 times as large', 'the same; a third as large', 'a third as large; the same'],
      answer: 0,
      why: {
        1: 'The volume flow rate cannot change along the pipe: nothing piles up or leaks out.',
        2: 'Water is incompressible, so it is the flow rate that stays fixed and the speed that adjusts.',
        3: 'Less area must be made up for by more speed, not less.',
      },
      hints: ['Which of the two must be the same everywhere in a steady flow?'],
      teach: 'Q = Av is fixed along a pipe; v grows as A shrinks.',
      explain: t`$Q$ is the same at every section, and $v = Q/A$, so a third of the area means three times the speed.`,
      visual: flow({ scene: 'venturi', v1: 1.5, ratio: 1 / 3, tubes: false, budget: false, values: false, arrows: false, play: false }, 'A pipe narrowing to a third of its area (and widening again). Not to scale.'),
    }),
    num({
      id: 'cp-lox-line', difficulty: 3,
      gen(r) {
        const md = r.pick([150, 250, 400]), vmax = r.pick([8, 10, 12]);
        const D = Math.sqrt((4 * md) / (Math.PI * RHO.lox * vmax));
        return {
          prompt: t`An engine needs ${md} kg/s of liquid oxygen ($1141\ \text{kg/m}^3$). To keep friction losses down, the speed in its feed line must not exceed ${vmax} m/s. What is the smallest diameter the line can have, in cm?`,
          answer: D * 100, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(md / (Math.PI * RHO.lox * vmax)) * 100, feedback: 'That is the radius. The diameter is twice it.' }, { value: Math.sqrt((4 * md) / (Math.PI * vmax)) * 100, feedback: 'Divide the mass flow by the density to get the volume flow first.' }],
          hints: [t`$A = \dfrac{\dot m}{\rho v_\text{max}}$, then $D = \sqrt{4A/\pi}$.`, t`$A = \dfrac{${md}}{1141\times${vmax}}\ \text{m}^2$.`],
          teach: 'The required area is the volume flow divided by the allowed speed.',
          explain: t`$A = \dfrac{${md}}{1141\times${vmax}} = ${tn(md / (RHO.lox * vmax))}\ \text{m}^2$, so $D = \sqrt{4A/\pi} = ${tn(D)}\ \text{m} = ${tn(D * 100)}\ \text{cm}$. Any narrower and the oxygen would have to move faster than ${vmax} m/s.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 0.5], y: [0, 30], xticks: 0.001, xlabel: 'line diameter D', ylabel: 'speed v (m/s)',
              curves: [{ fn: `${(4 * md) / (Math.PI * RHO.lox)}/x^2`, domain: [0.03, 0.5], color: 'accent', label: 'v = ṁ/(ρA)', labelAt: 0.32, labelDy: -14 }],
              hlines: [{ y: vmax, label: `limit, ${vmax} m/s`, color: 'gold' }],
            },
            caption: 'Speed in the line against its diameter for this mass flow (no numbers on the diameter axis): halving D quadruples v.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §14.5 Fluid Dynamics', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-5-fluid-dynamics' }],
});
