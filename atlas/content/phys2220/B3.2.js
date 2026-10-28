// Lenz's law: the induced current flows so that its own field opposes the
// CHANGE in flux that drives it — against the field when the flux grows,
// along it when the flux falls. It is the minus sign in Faraday's law, and
// energy conservation: an induced current always resists what makes it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { COL, tn, r6, lab, seg2, circ2, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
/** The field ramping in a circular region with a ring inside: a still at time t (s). */
const rampPic = ({ dir = 'in', B0 = 0.5, tr = 1, r = 0.03, Rf = 0.05, t: at, arrows = [], graphs = ['B'], caption }) => ({
  type: 'em-faraday',
  params: { mode: 'ramp', dir, B0, tr, r, Rf, t: at, play: false, arrows, graphs, readouts: [] },
  caption,
});
/** The magnet pushed in and pulled out of a coil: a still at time t (push-in peaks near 0.27 s, pull-out near 1.34 s). */
const magnetPic = ({ pole = 'N', t: at, poles = false, arrows = ['v'], graphs = [], caption, extra = {} }) => ({
  type: 'em-faraday',
  params: { mode: 'magnet', motion: 'inout', pole, t: at, play: false, poles, arrows, graphs, readouts: [], ...extra },
  caption,
});
const T_IN = 0.27, T_OUT = 1.34;     // when the push-in and the pull-out drive their biggest currents

// the worked example: a ring in a field falling steadily to zero
const EX = { B0: 0.8, tr: 0.4, r: 0.05, R: 0.5 };
EX.rate = EX.B0 / EX.tr; EX.emf = PI * EX.r ** 2 * EX.rate; EX.I = EX.emf / EX.R;

export default lesson({
  id: 'phys2220.B3.2',
  title: 'Lenz’s law',
  minutes: 13, difficulty: 2,
  intro: t`Faraday’s law says how big an induced emf is; its minus sign says which way it pushes. **Lenz’s law**: the induced current flows so that its own magnetic field opposes the *change* in flux that produced it.

$$\mathcal{E} = -N\frac{d\Phi_B}{dt}$$

If the flux through a loop is growing, the induced field inside the loop points against the outside field; if the flux is falling, the induced field points *along* it, trying to keep the flux up. It opposes the change, not the field. To find a current’s direction: decide which way the flux points and whether it grows or falls; point your right thumb along the induced field that opposes that change; your fingers curl the way the current flows.

This is energy conservation at work. A magnet pushed toward a coil is pushed back, and one pulled away is held back, so moving it always takes work — the energy the induced current carries off as heat. If the induced current helped the change instead, a nudge would be enough to send the magnet in ever faster, for nothing.`,
  symbols: [
    { tex: '\\mathcal{E}', text: 'the induced emf, in V; its sign gives its direction round the loop' },
    { tex: 'N', text: 'the number of turns' },
    { tex: '\\Phi_B', text: 'the flux through one turn, in Wb' },
    { tex: '\\vec B_{\\text{ind}}', text: 'the field made by the induced current itself: inside the loop it points against $d\\Phi_B/dt$' },
  ],
  why: 'Lenz’s law is why eddy-current brakes stop trains and roller coasters without touching them, why a magnet falls slowly down a copper pipe, and why a generator gets harder to turn the more current you draw from it.',
  visual: {
    type: 'em-faraday',
    title: 'The coil pushes back',
    lead: t`A magnet is pushed into a coil and pulled out again. While a current flows, the coil is itself a magnet: its own north and south poles are marked at its ends, and the meter reads the current.`,
    tasks: [
      'Push the north pole in: the coil’s near end becomes a north pole too, pushing back on the magnet.',
      'Watch the pull-out: the current reverses, and the near end turns south — now the coil pulls the magnet back, opposing its leaving.',
      'Turn the magnet round, south pole first: every current reverses, and the coil still opposes whatever the magnet does.',
      'While the magnet is held still there is no current and no pole: Lenz’s law opposes change, not the field itself.',
    ],
    params: {
      mode: 'magnet', motion: 'inout', motionChoice: true, motions: ['inout', 'const'], poleChoice: true, poles: true, v: 1,
      graphs: ['flux'], readouts: ['I'], arrows: ['v', 'I'],
    },
  },
  example: {
    prompt: t`A wire ring of radius 5.0 cm and resistance 0.50 Ω lies flat in a uniform field that points into the page. The field falls steadily from 0.80 T to zero in 0.40 s. What current flows round the ring, and which way?`,
    visual: {
      type: 'em-faraday',
      params: { mode: 'ramp', dir: 'in', B0: EX.B0, tr: EX.tr, r: EX.r, Rf: 0.08, R: EX.R, t: 3 * EX.tr, play: false, arrows: ['E', 'I'], graphs: ['B'], readouts: [] },
      caption: 'The ring (grey) in the falling field (teal ×: into the page; it fills the dashed circle). Blue arrows: the induced current; gold: the induced electric field that drives it. The graph is the field against time; the picture is at the dashed line.',
    },
    steps: [
      { label: 'The change', text: t`The flux points into the page and is falling: $\dfrac{d\Phi_B}{dt} = \pi r^2\,\dfrac{dB}{dt}$, with $dB/dt = 0.80/0.40 = ${tn(EX.rate)}$ T/s in size.` },
      { label: 'The emf', text: t`$|\mathcal{E}| = \pi(0.050)^2(${tn(EX.rate)}) = ${tn(EX.emf)}$ V.` },
      { label: 'The current', text: t`$I = |\mathcal{E}|/R = ${tn(EX.emf)}/0.50 = ${tn(EX.I)}$ A $= ${tn(EX.I * 1e3)}$ mA.` },
      { label: 'Its direction', text: 'The induced field must oppose the fall of an into-the-page flux, so inside the ring it points into the page too — propping the flux up. Thumb into the page: your fingers curl clockwise. The current flows clockwise.' },
      { label: 'Sense check', text: 'Had the field been growing, the current would run anticlockwise, its field pointing out of the page against the growth. The direction depends on whether the flux rises or falls, not just on which way B points.' },
    ],
    answer: t`$${tn(EX.I * 1e3)}$ mA, clockwise.`,
  },
  practice: [
    mcq({
      id: 'dir', difficulty: 1,
      gen(r) {
        const dir = r.pick(['in', 'out']), up = r.bool();
        const ccw = (dir === 'in') === up;   // growing into-page flux, or falling out-of-page flux: anticlockwise
        const dirW = dir === 'in' ? 'into' : 'out of', other = dir === 'in' ? 'out of' : 'into';
        return {
          prompt: t`A ring lies flat in a field that points ${dirW} the page. The field is ${up ? 'growing' : 'falling'}, as the graph shows. Which way does the induced current flow round the ring, as you see it?`,
          visual: rampPic({ dir, t: up ? 1 : 3, caption: `The ring in a field ${dirW} the page (${dir === 'in' ? '×' : '•'}), which fills the dashed circle. The graph: the field’s strength against time; the picture is at the dashed line.` }),
          choices: [ccw ? 'Anticlockwise' : 'Clockwise', ccw ? 'Clockwise' : 'Anticlockwise', 'No current: the ring is not moving', 'No current: the field goes through the ring, not round it'],
          answer: 0,
          why: {
            1: up
              ? `That current’s own field would point ${dirW} the page inside the ring — adding to the growing flux. The induced field must oppose the growth.`
              : `That current’s field would point ${other} the page — against B. But the flux is falling, so the induced field points ${dirW} the page, along B, to oppose the fall. It opposes the change, not the field.`,
            2: 'Nothing needs to move: a changing field changes the flux just as well, and Faraday’s law cares only about the flux.',
            3: 'It is exactly the flux through the ring — the field passing through it — that matters. Changing it drives a current round the ring.',
          },
          hints: ['Which way does the induced field have to point inside the ring to oppose the change? Then use the right-hand rule.'],
          teach: 'The induced field points against B while the flux grows and along B while it falls; the right-hand rule then turns that into the current’s direction.',
          explain: t`The flux ${dirW} the page is ${up ? 'growing' : 'falling'}, so the induced field inside the ring points ${up ? other : dirW} the page. With your thumb ${up ? other : dirW} the page, your fingers curl ${ccw ? 'anticlockwise' : 'clockwise'}.`,
        };
      },
    }),
    mcq({
      id: 'pole', difficulty: 1,
      gen(r) {
        const pole = r.pick(['N', 'S']), toward = r.bool(), same = toward, other = pole === 'N' ? 'S' : 'N';
        const name = (p) => (p === 'N' ? 'north' : 'south');
        const ansPole = same ? pole : other;
        return {
          prompt: t`The ${name(pole)} pole of a bar magnet is being ${toward ? 'pushed toward' : 'pulled away from'} the end of a coil, whose two ends are joined through a meter. While it moves, what does the coil’s near end become?`,
          visual: magnetPic({ pole, t: toward ? T_IN : T_OUT, caption: `The magnet (its ${name(pole)} pole facing the coil) ${toward ? 'moving in' : 'moving away'}, as the green arrow shows.` }),
          choices: [`A ${name(ansPole)} pole`, `A ${name(ansPole === 'N' ? 'S' : 'N')} pole`, 'Neither: the current only runs along the wire, so the coil is no magnet', 'Neither, until the magnet stops moving'],
          answer: 0,
          why: {
            1: toward ? `A ${name(other)} pole would attract the magnet in — helping the change, and making energy from nothing.` : `A ${name(pole)} pole would push the magnet away — helping it leave, and making energy from nothing.`,
            2: 'A current in a coil makes a field just like a bar magnet’s, with a north and a south end.',
            3: 'Once the magnet stops, the flux stops changing and the current — and the coil’s poles — vanish. It is while it moves that the coil acts.',
          },
          hints: [toward ? 'Does the coil push back on an approaching magnet, or pull it in?' : 'Does the coil push a leaving magnet away, or hold it back?'],
          teach: 'An approaching pole meets a like pole (it is repelled); a receding pole leaves an unlike pole behind it (it is held back).',
          explain: `The coil opposes the motion: ${toward ? `it repels the approaching ${name(pole)} pole, so its near end becomes ${name(pole)}` : `it attracts the leaving ${name(pole)} pole, so its near end becomes ${name(other)}`}. Either way, moving the magnet takes work, which becomes the energy of the current.`,
        };
      },
    }),
    mcq({
      id: 'not-field', difficulty: 2,
      prompt: 'The north pole of a magnet is pulled away from a coil, to the right. Inside the coil, which way does the field of the induced current point?',
      visual: magnetPic({ t: T_OUT, caption: 'The magnet, its north pole facing the coil, moving away to the right. Its own field at the coil points away from its north pole: to the left.' }),
      choices: ['To the left, the same way as the magnet’s field there', 'To the right, against the magnet’s field', 'There is no induced field: the magnet is leaving', 'It depends on how fast the magnet moves'],
      answer: 0,
      why: {
        1: 'An induced field opposes the change in flux, not the field. Here the flux is falling, so the induced field points along the magnet’s field, propping it up.',
        2: 'As long as the flux changes there is an induced current, and with it an induced field — whichever way the magnet moves.',
        3: 'Speed sets how big the induced current is, not its direction. The direction depends only on whether the flux rises or falls.',
      },
      hints: ['Is the leftward flux through the coil growing or falling?'],
      teach: 'Lenz’s law opposes the change in flux, so a falling flux gets an induced field along the original field.',
      explain: 'The magnet’s leftward flux through the coil is falling as it leaves. Opposing that fall, the induced field points left too — along the magnet’s field. The coil’s near end is a south pole, attracting the leaving north pole.',
    }),
    num({
      id: 'current', difficulty: 2,
      gen(r) {
        const rc = r.pick([2, 3, 4]), B0 = r.pick([0.3, 0.5, 0.9]), tr = r.pick([0.2, 0.5, 1.5]), R = r.pick([0.05, 0.1, 0.2]);
        const emf = (PI * (rc / 100) ** 2 * B0) / tr, I = emf / R;
        return {
          prompt: t`A copper ring of radius ${rc} cm and resistance ${R} Ω sits inside a long solenoid, facing along its axis. The solenoid’s field rises steadily from zero to ${B0} T in ${tr} s. What current flows round the ring while the field rises?`,
          visual: rampPic({ B0, tr, r: rc / 100, t: tr, arrows: ['E'], caption: 'The solenoid end on: its field (teal) fills the dashed circle; the ring sits inside. Gold: the induced electric field. The graph is the field against time.' }),
          answer: I * 1e3, units: 'mA', tol: { rel: 0.01 },
          errors: [
            { value: emf * 1e3, feedback: 'That is the emf in millivolts. Divide by the resistance for the current.' },
            { value: ((2 * PI * (rc / 100) * B0) / tr / R) * 1e3, feedback: t`The flux is the field times the ring’s area, $\pi r^2$ — not its circumference.` },
            { value: (PI * rc ** 2 * B0) / tr / R * 1e3, feedback: 'Convert the radius to metres before squaring.' },
          ],
          hints: [t`$|\mathcal{E}| = \pi r^2\,\dfrac{\Delta B}{\Delta t}$, then $I = |\mathcal{E}|/R$.`, t`$|\mathcal{E}| = \pi(${rc / 100})^2(${B0}/${tr})$ V.`],
          teach: 'Induced current = (rate of change of flux)/(resistance): I = πr²(dB/dt)/R for a ring in a uniform field.',
          explain: t`$|\mathcal{E}| = \pi(${rc / 100})^2\,\dfrac{${B0}}{${tr}} = ${tn(emf)}$ V, so $I = \dfrac{${tn(emf)}}{${R}} = ${tn(I)}$ A $= ${tn(I * 1e3)}$ mA — anticlockwise, its own field out of the page against the growing into-the-page flux.`,
        };
      },
    }),
    mcq({
      id: 'energy', difficulty: 2,
      prompt: 'Suppose induced currents flowed the other way — helping the change in flux instead of opposing it. What would happen when you nudged a magnet toward a coil?',
      visual: magnetPic({ t: T_IN, poles: true, arrows: ['v', 'I'], caption: 'What really happens: the approaching north pole meets a north pole at the coil’s near end (the coil’s own poles are marked above it), and is pushed back.' }),
      choices: [
        'The coil would pull it in ever faster: energy from nothing, which cannot happen',
        'Nothing different: Lenz’s law is only a convention for signs',
        'The current would be smaller, but flow the same way',
        'The magnet would stop dead at the coil',
      ],
      answer: 0,
      why: {
        1: 'The direction is physical, not a convention: you can feel the push as you move the magnet, and do work against it.',
        2: 'The question is about the opposite direction, and with it the opposite force on the magnet.',
        3: 'Helping the change would mean pulling the magnet on, not stopping it.',
      },
      hints: ['Which way would the force on the magnet point? And where would the energy of the current come from?'],
      teach: 'Lenz’s law is energy conservation: because the induced current opposes the change, making it takes work.',
      explain: 'A coil that helped would attract the approaching magnet, speeding it up, which would raise the flux faster, driving a bigger current, pulling harder still — kinetic energy and heat from nothing. Because the induced current opposes the change instead, you must push the magnet in, and the work you do becomes the energy the current dissipates.',
    }),
    mcq({
      id: 'pipe', difficulty: 2,
      prompt: 'A strong magnet dropped down a vertical copper pipe takes several seconds to fall out of the bottom, while an unmagnetised piece of iron falls straight through. Why?',
      visual: page({
        x: [-2.4, 2.4], y: [-1.9, 1.9],
        curves: [
          seg2([-0.55, -1.8], [-0.55, 1.8], { color: 'warn', width: 5 }), seg2([0.55, -1.8], [0.55, 1.8], { color: 'warn', width: 5 }),
          seg2([0, -0.5], [0, 0], { color: 'bad', width: 30 }), seg2([0, 0], [0, 0.5], { color: 'accent', width: 30 }),
        ],
        points: [lab(0.24, -0.25, 'N', 'bad', 0, 0, 'left'), lab(0.24, 0.25, 'S', 'accent', 0, 0, 'left'), lab(0.85, 1.45, 'copper pipe, cut lengthways', 'warn', 0, 0, 'left'), lab(0.85, 0, 'falling magnet', 'ink2', 0, 0, 'left')],
        arrows: [{ from: [-1.1, 0.5], to: [-1.1, -0.5], color: COL.v, label: 'v', labelDx: -12, labelDy: 0 }],
        caption: 'The pipe cut lengthways, the magnet (N below, S above) falling inside it. Copper is not attracted by a magnet.',
      }),
      choices: [
        'The changing flux drives currents round the pipe that oppose the change, and their fields push up on the magnet',
        'Copper is weakly magnetic and attracts the magnet to its walls',
        'Air trapped below the magnet cushions it',
        'The currents in the pipe pull the magnet down, but friction with the walls slows it more',
      ],
      answer: 0,
      why: {
        1: 'Copper is not attracted by a magnet — hold one to a copper pipe and nothing sticks. Only a moving magnet is slowed.',
        2: 'The piece of iron falls straight through the same pipe, air and all.',
        3: 'The induced currents oppose the motion that makes them: they push up, against the fall.',
      },
      hints: ['Think of the pipe as a stack of rings. What happens to the flux through the rings just below the falling magnet, and just above it?'],
      teach: 'Eddy currents — induced currents swirling in a solid conductor — oppose the motion that drives them, so they brake it.',
      explain: 'The pipe is a stack of rings. Below the magnet, the flux through each ring grows, and its induced current repels the magnet; above it, the flux falls, and that current attracts the magnet back. Both push up. The faster it falls, the bigger these eddy currents, so it soon reaches a slow, steady speed — its loss of gravitational energy all going into heating the pipe.',
    }),
    {
      type: 'slider', id: 'set-pull', difficulty: 2, param: 't',
      instruction: 'Drag the time slider to a moment that fits, then check.',
      prompt: t`The magnet is pushed into the coil, held, and pulled out again. Set the time to a moment when the coil is pulling the magnet back toward itself.`,
      answer: [1.26, 1.44],
      hints: ['The coil always opposes what the magnet is doing. When would it pull the magnet toward itself?'],
      teach: 'A coil attracts a magnet that is leaving it, and repels one that is arriving.',
      explain: 'The coil pulls the magnet back while it is being pulled out (from about 1.26 s to 1.44 s here, when the current is large): it opposes the magnet’s leaving. While the magnet goes in, the coil pushes it away; while it is held still, there is no current and no force.',
      visual: magnetPic({ t: 0, arrows: ['v'], graphs: ['flux'], caption: 'The magnet’s north pole faces the coil. Scrub through the run: the graph shows the flux linkage through the coil, the meter the current.', extra: { sliders: ['t'] } }),
    },
  ],
  checkpoint: [
    mcq({
      id: 'cp-brake', difficulty: 3, transfer: true,
      prompt: 'Some roller coasters stop with eddy-current brakes: copper fins on the cars pass between rows of strong permanent magnets beside the track, with nothing touching. Which is true of such a brake?',
      visual: {
        type: 'em-faraday',
        params: { mode: 'slide', w: 0.05, h: 0.03, Lf: 0.1, v: 0.1, t: 0.4, play: false, arrows: ['v', 'I', 'F'], graphs: [], readouts: [] },
        caption: 'A model of one fin entering the magnets’ field, seen from above: blue, the induced current; violet, the magnetic force on the fin. Real fins are solid plates, in which the currents swirl as eddies.',
      },
      choices: [
        'Its force grows with the car’s speed, and fades away as the car slows to a stop',
        'Its force is the same at every speed, like friction',
        'It can hold a stopped car still on a slope',
        'It works only if the fins are made of iron',
      ],
      answer: 0,
      why: {
        1: 'The emf, and so the current and the force, are proportional to how fast the flux changes — to the speed. Friction does not work that way.',
        2: 'A stopped fin has no changing flux, so no current and no force. Coasters still need a mechanical brake to hold a car still.',
        3: 'Iron would be attracted, and grab. Copper or aluminium works because it conducts well, not because it is magnetic.',
      },
      hints: ['What sets the size of the emf in a fin — the field, or how fast the flux through it changes?', 'Follow it through: emf, then current, then the force IL × B on the current.'],
      teach: 'An eddy-current brake’s force is proportional to speed: strong when fast, gentle as the car slows, zero at rest.',
      explain: 'Faraday’s law makes the emf in the fin proportional to its speed; the current, and the force IL × B on it, follow. So the brake is fierce at speed and gentle near the end — and it never wears out, because nothing touches. The car’s kinetic energy ends up as heat in the fins.',
    }),
    mcq({
      id: 'cp-leave', difficulty: 2,
      prompt: 'A square loop is pulled steadily out of a region of field that points out of the page. While it leaves, which way does the induced current flow round the loop, as you see it?',
      visual: {
        type: 'em-faraday',
        params: { mode: 'slide', dir: 'out', w: 0.04, h: 0.04, Lf: 0.1, v: 0.05, t: 2.9, play: false, arrows: ['v'], graphs: [], readouts: [] },
        caption: 'Top view: the field (teal •: out of the page) fills the shaded region only. The loop is moving to the right, out of it.',
      },
      choices: ['Anticlockwise', 'Clockwise', 'No current: the loop is moving at a steady speed', 'No current until the loop is wholly outside'],
      answer: 0,
      why: {
        1: 'That current’s field would point into the page, against B — but the flux is falling, so the induced field points out of the page, along B, to prop it up.',
        2: 'Steady speed still changes the flux while an edge is crossing: the loop has less of the field in it every moment.',
        3: 'Once the loop is wholly outside, the flux is zero and steady: no current then. It flows while the loop is leaving.',
      },
      hints: ['Is the out-of-the-page flux through the loop growing or falling as it leaves?'],
      teach: 'Leaving a field, the flux falls, so the induced field points along the field; entering, it points against it.',
      explain: 'The out-of-the-page flux through the loop is falling. The induced field opposes the fall, so it points out of the page inside the loop, and the right-hand rule (thumb out of the page) gives an anticlockwise current.',
    }),
    num({
      id: 'cp-charge', difficulty: 3,
      gen(r) {
        const N = r.pick([50, 100, 200]), dPhi = r.pick([0.4, 0.8, 1.5]), R = r.pick([2, 5, 10]), dt = r.pick([0.05, 0.2, 0.5]);
        const Q = (N * dPhi * 1e-3) / R;
        return {
          prompt: t`A magnet is pulled out of a ${N}-turn coil in ${dt} s, and the flux through each turn falls by ${dPhi} mWb. The coil and its meter have a total resistance of ${R} Ω. How much charge flows round the circuit?`,
          visual: magnetPic({ t: T_OUT, arrows: ['v', 'I'], graphs: ['flux'], caption: 'The magnet being pulled out; the graph is the flux linkage through the coil.' }),
          answer: Q * 1e3, units: 'mC', tol: { rel: 0.01 },
          errors: [
            { value: (Q / dt) * 1e3, feedback: 'That is the average current (in mA), not the charge. Charge is current times time.' },
            { value: (Q / N) * 1e3, feedback: 'Every turn contributes: multiply by N.' },
            { value: Q * dt * 1e3, feedback: 'The charge is I Δt with I = NΔΦ/(RΔt): the time cancels rather than multiplying in twice.' },
          ],
          hints: [t`$I = \dfrac{|\mathcal{E}|}{R} = \dfrac{N\,\Delta\Phi_B}{R\,\Delta t}$, and the charge is $Q = I\,\Delta t$.`, 'Notice what happens to Δt.'],
          teach: 'The charge driven round a circuit is NΔΦ/R — it depends on the change in flux, not on how fast it happens.',
          explain: t`$Q = I\,\Delta t = \dfrac{N\,\Delta\Phi_B}{R\,\Delta t}\,\Delta t = \dfrac{N\,\Delta\Phi_B}{R} = \dfrac{(${N})(${dPhi}\times10^{-3})}{${R}} = ${tn(Q)}$ C $= ${tn(Q * 1e3)}$ mC. Pull it out ten times faster and the current is ten times bigger for a tenth of the time: the same charge. That is how a fluxmeter measures a change of flux.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.2', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-2-lenzs-law' },
    { label: 'OpenStax University Physics Vol. 2, §13.6 (eddy currents)', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-6-eddy-currents' },
  ],
});
