// Conductors, insulators and charging: free charges in conductors shift to
// induce charge; bound charges in insulators polarize; either way a neutral
// object is attracted to a charged one. Grounding plus induction charges a
// conductor without touching it — and for a sphere the induced charge is exact.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tn, s3, r6, QE, ballNear } from './_charges.js';

const t = String.raw;

export default lesson({
  id: 'phys2220.E1.2',
  title: 'Conductors, insulators and charging',
  minutes: 12, difficulty: 2,
  intro: t`In a **conductor** — a metal, salt water, a plasma — some charges are free to move through the material: in a metal, about one electron per atom roams freely. In an **insulator** — glass, plastic, rubber, dry air — every charge stays bound to its own molecule and can only shift a tiny distance. Bring a charged object near a neutral one and the charges inside respond. In a conductor, free electrons flow until the near side carries the opposite charge and the far side the same charge (**induction**); in an insulator, each molecule stretches into a tiny dipole (**polarization**). Either way the opposite charge ends up nearer, and because electric forces weaken with distance, **a neutral object is attracted to a charged one, whatever its sign.**

Ground a conductor while a charged object is near, then break the connection, and it keeps a net charge of the opposite sign: **charging by induction**. For a metal sphere of radius $a$, grounded with a point charge $Q$ a distance $d$ from its centre, the charge it takes up is exactly

$$q = -\frac{a}{d}\,Q$$`,
  symbols: [
    { tex: 'q', text: 'the net charge the grounded sphere takes up from the ground, in C — always opposite in sign to $Q$' },
    { tex: 'Q', text: 'the nearby point charge (a small charged ball), in C' },
    { tex: 'a', text: 'the radius of the metal sphere, in m' },
    { tex: 'd', text: 'the distance from the sphere’s centre to the point charge, in m ($d > a$). Since $a/d < 1$, the induced charge is always smaller than $Q$. (This exact result comes from the “method of images” of advanced electrostatics.)' },
  ],
  why: 'Induction and polarization explain why dust clings to screens, suits and solar panels, how photocopiers and electrostatic dust filters work, and why fuel hoses and spacecraft are carefully grounded before anything flammable flows.',
  visual: {
    type: 'em-induction',
    title: 'Neutral, yet attracted',
    lead: t`A small charged ball on an insulating handle beside a neutral sphere. Switch between a metal and a plastic sphere, flip the ball’s sign, and move it closer. Then charge the metal sphere by induction: ground it, unground it, then take the ball away.`,
    tasks: [
      'Flip the ball between positive and negative: the metal sphere’s surface charges swap sides, but the sphere is pulled toward the ball either way.',
      'Switch to plastic: its molecules can only stretch into tiny dipoles, and the pull is weaker (about 0.4 times as strong for κ = 3).',
      'Charge by induction: tick the ground (the sphere takes up −Qa/d), untick it, then take the ball away — the charge stays. Now reset and try taking the ball away before unticking the ground.',
    ],
    params: { scene: 'ball', material: 'conductor', Q: 30, d: 14 },
  },
  example: {
    prompt: t`A small ball with $Q = +30$ nC is held 15 cm from the centre of a neutral metal sphere of radius 5.0 cm. Describe what happens, step by step, as the sphere is charged by induction: (1) the ball is brought near; (2) the sphere is connected to the ground; (3) the ground wire is removed; (4) the ball is taken away. What is the final charge on the sphere, and how many electrons came up from the ground?`,
    visual: ballNear({ Q: 30, d: 15, ground: true }, 'Step 2: the sphere grounded with the +30 nC ball 15 cm from its centre. The marks show the exact surface charge (bigger where denser); the arrow’s length uses a compressed scale.'),
    steps: [
      { label: '1. Ball near', text: t`Free electrons in the metal are drawn toward the positive ball: the near side becomes negative and the far side positive. The sphere is still neutral overall, but it is attracted, because its negative side is nearer the ball.` },
      { label: '2. Grounded', text: t`The ground is an enormous reservoir of charge. Electrons flow up the wire until the sphere’s net charge is $q = -\dfrac{a}{d}Q = -\dfrac{5.0}{15}(30\ \text{nC}) = -10$ nC.` },
      { label: '3. Wire removed', text: t`With the path cut, those electrons cannot leave: the sphere keeps $-10$ nC.` },
      { label: '4. Ball away', text: t`The $-10$ nC spreads evenly over the sphere’s surface. It came up as $n = 10\times10^{-9}/1.602\times10^{-19} = 6.2\times10^{10}$ electrons.` },
      { label: 'Sense check', text: t`The sphere ends opposite in sign to the ball, as induction requires, and smaller than $Q$ because $a/d = 1/3 < 1$. The ball never touched it and lost none of its own charge.` },
    ],
    answer: t`The sphere ends with $-10$ nC, spread evenly over its surface: $6.2\times10^{10}$ electrons came up from the ground.`,
  },
  practice: [
    mcq({
      id: 'paper-bits', difficulty: 1,
      prompt: 'A charged balloon held over some small bits of neutral paper makes them jump up and cling to it. Why?',
      choices: [
        'The balloon polarizes the paper: the side of each bit nearest the balloon becomes slightly opposite in charge, and that nearer charge is pulled harder than the farther charge is pushed',
        'Neutral objects feel no electric force, so the paper must have been charged already',
        'The paper picks up charge of the same sign as the balloon through the air, and like charges attract',
        'The balloon’s gravity, made stronger by its charge, pulls the paper up',
      ],
      answer: 0,
      why: {
        1: 'Neutral objects do feel electric forces when they are near a charge: their charges rearrange so that the attraction wins.',
        2: 'Like charges repel. And if the paper had picked up charge of the balloon’s sign, it would be pushed away — which does happen once the bits touch the balloon and share its charge.',
        3: 'Charge does not change gravity, and the balloon’s gravity is far too weak to lift paper.',
      },
      hints: ['Paper is an insulator, but its molecules can still stretch slightly. Which way?', 'Compare the distances to the balloon of the near charges and the far charges.'],
      teach: 'A charged object polarizes a neutral one, and since the nearer, opposite charge feels the stronger force, the neutral object is attracted.',
      explain: t`In each molecule of paper the electrons shift slightly toward a positive balloon (or away from a negative one), so the paper’s near surface carries a little charge opposite to the balloon’s and its far surface the same charge. The force falls with distance, so the attraction on the near side beats the repulsion on the far side.`,
      visual: ballNear({ material: 'insulator', Q: 30, d: 11 }, 'A charged ball near a neutral insulating sphere (standing in for a bit of paper): each molecule stretches into a tiny dipole, enormously exaggerated here.'),
    }),
    mcq({
      id: 'either-sign', difficulty: 1,
      prompt: 'A positively charged rod attracts a neutral metal can. It is replaced by a negatively charged rod with the same size of charge, at the same distance. The can is now:',
      choices: ['Attracted just as strongly', 'Repelled', 'Not affected at all', 'Attracted only if it is connected to the ground'],
      answer: 0,
      why: {
        1: 'The can is neutral, so it has no charge of its own for the rod to repel. Its electrons simply shift the other way.',
        2: 'Induction rearranges charge whatever the rod’s sign; the attraction does not need a net charge on the can.',
        3: 'Grounding changes the can’s net charge and makes the pull stronger, but a neutral, isolated can is attracted too.',
      },
      hints: ['With a negative rod, which way do the can’s free electrons move?'],
      teach: 'A neutral conductor is attracted to a charge of either sign: the induced charge is always arranged opposite-side-nearer.',
      explain: t`With the negative rod, electrons are pushed to the far side of the can, leaving the near side positive. The picture is the mirror image of before, and the force has the same size: it depends on $Q^2$, not on the sign of $Q$.`,
      visual: ballNear({ Q: -30, d: 12 }, 'A negatively charged ball near a neutral metal sphere: electrons pushed to the far side leave the near side positive.'),
    }),
    num({
      id: 'induced-charge', difficulty: 2,
      gen(r) {
        const Q = r.pick([20, -30, 45, -15]), a = r.pick([3, 5, 6]), d = r.pick([12, 15, 20]);
        const q = (-a / d) * Q;
        return {
          prompt: t`A metal sphere of radius ${a} cm is connected to the ground while a small ball carrying $${Q > 0 ? '+' : '-'}${Math.abs(Q)}$ nC is held ${d} cm from its centre. What charge does the sphere take up from the ground? (Give the sign, in nC.)`,
          answer: q, units: 'nC', tol: { rel: 0.005 },
          errors: [{ value: -q, feedback: 'The induced charge is opposite in sign to the nearby charge: the ground supplies whatever cancels its effect.' }, { value: -Q, feedback: t`Not all of $Q$: the sphere takes up $-Qa/d$, a fraction $a/d$ of it.` }, { value: (-a * a / (d * d)) * Q, feedback: t`The fraction is $a/d$, not $(a/d)^2$.` }],
          hints: [t`$q = -\dfrac{a}{d}Q$.`, 'Both lengths in the same unit: the ratio a/d has no units.'],
          teach: t`A grounded metal sphere near a point charge $Q$ takes up exactly $-Qa/d$: opposite in sign, smaller in size.`,
          explain: t`$q = -\dfrac{${a}}{${d}}\times(${Q}\ \text{nC}) = ${tn(q)}$ nC: about $${tn((Math.abs(q) * 1e-9) / QE)}$ electrons ${q < 0 ? 'drawn up from' : 'driven down into'} the ground.`,
          visual: ballNear({ Q, d, a, ground: true, ask: true }, 'The grounded metal sphere and the charged ball. The marks show where the surface charge sits (bigger where denser), not how much.'),
        };
      },
    }),
    order({
      id: 'induction-steps', difficulty: 2,
      prompt: 'Put the steps in order to give a neutral metal sphere a **positive** charge, using a negatively charged rod that never touches it.',
      items: [
        'Bring the negative rod near the sphere, without touching',
        'Connect the sphere to the ground with a wire: electrons are pushed down into the ground',
        'Remove the ground wire, keeping the rod where it is',
        'Take the rod away: the sphere’s positive charge spreads over its surface',
      ],
      hints: ['The ground must be connected while the rod pushes electrons away.', 'Cut the ground connection before the rod leaves — otherwise the electrons come back.'],
      teach: 'Charging by induction: near, ground, unground, remove — and the object ends opposite in sign to the rod.',
      explain: t`The rod repels electrons; with the wire connected, some escape to the ground. Cutting the wire traps the deficit, and once the rod is gone the sphere is left positive — opposite to the rod, which has not lost any charge of its own.`,
      visual: ballNear({ Q: -30, d: 13, ground: true, ask: true }, 'A negative ball near a grounded metal sphere (one moment in the procedure).'),
    }),
    mcq({
      id: 'wrong-order', difficulty: 3,
      prompt: 'A student grounds a metal sphere while a positive ball is near, but then takes the ball away **before** removing the ground wire, and removes the wire last. What charge does the sphere end with?',
      choices: ['None: once the ball has gone, the electrons that came up from the ground drain back down', 'Negative, as in ordinary charging by induction', 'Positive, the same sign as the ball', 'It depends on how long the ground wire is'],
      answer: 0,
      why: {
        1: 'That needs the wire to be cut while the ball is still near; here the sphere stayed connected to the ground after the ball left.',
        2: 'Nothing ever pushed electrons out of the sphere to make it positive — and the ground simply restores neutrality.',
        3: 'A conducting wire of any ordinary length equalizes the charge in a tiny fraction of a second.',
      },
      hints: ['While the sphere is grounded, what decides its charge?', 'With the ball gone, nothing holds extra electrons on the sphere.'],
      teach: 'In charging by induction, the ground must be disconnected before the inducing charge is removed.',
      explain: t`While grounded, the sphere’s charge is whatever the nearby charges dictate: $-Qa/d$ with the ball present, zero without it. Taking the ball away first lets the extra electrons flow back to the ground; cutting the wire afterwards traps nothing. (Try it in the Explore.)`,
      visual: ballNear({ Q: 30, d: 14, ground: true, ask: true }, 'The grounded sphere with the ball still near — the moment before the student takes the ball away.'),
    }),
    num({
      id: 'tiny-fraction', difficulty: 2,
      gen(r) {
        const qn = r.pick([5, 10, 50]);
        const frac = (qn * 1e-9) / QE / (8.5e28 * 1e-6);
        return {
          prompt: t`Copper has about $8.5\times10^{28}$ free electrons per cubic metre — one per atom. A 1.0 cm³ copper cube is given a charge of $+${qn}$ nC. What fraction of its free electrons has it lost? ($e = 1.602\times10^{-19}$ C)`,
          answer: frac, tol: { rel: 0.01 },
          errors: [{ value: (qn * 1e-9) / QE / 8.5e28, feedback: 'Convert the volume: 1.0 cm³ is 1.0 × 10⁻⁶ m³.' }, { value: (qn * 1e-9) / QE, feedback: 'That is the number of electrons lost. Divide by the number of free electrons in the cube.' }],
          hints: ['Electrons lost: n = q/e.', t`Free electrons in the cube: $8.5\times10^{28}\ \text{m}^{-3} \times 1.0\times10^{-6}\ \text{m}^3$.`],
          teach: 'Charging a conductor moves a vanishingly small fraction of its free electrons.',
          explain: t`Lost: $${qn}\times10^{-9}/1.602\times10^{-19} = ${tn((qn * 1e-9) / QE)}$ electrons, out of $8.5\times10^{22}$: a fraction $${tn(frac)}$. Induction and charging rearrange a tiny skin of charge on an enormous sea of mobile electrons — which is why a conductor can respond to any nearby charge.`,
          visual: ballNear({ Q: 30, d: 12, ask: true }, 'Induced surface charge on a metal sphere (the marks are exaggerated: the real imbalance is far less than one free electron in a billion).'),
        };
      },
    }),
    mcq({
      id: 'which-conducts', difficulty: 1,
      prompt: 'Which of these conducts electricity well?',
      choices: ['Salt water', 'Dry glass', 'Rubber', 'Dry air at normal pressure'],
      answer: 0,
      why: {
        1: 'Glass holds its electrons tightly in its bonds: an insulator (when dry and clean).',
        2: 'Rubber is a classic insulator — that is why it coats wires.',
        3: 'Dry air insulates until the field reaches about 3 million volts per metre; then it breaks down and a spark jumps.',
      },
      hints: ['A conductor needs charges that are free to move. In salt water, what can move?'],
      teach: 'Conductors contain mobile charges — electrons in metals, ions in salt water; insulators hold their charges in place.',
      explain: t`Dissolved salt splits into $\text{Na}^+$ and $\text{Cl}^-$ ions that drift through the water, carrying charge. That is why touching a live wire with wet hands is so dangerous.`,
    }),
    num({
      id: 'steep-falloff', difficulty: 3,
      gen(r) {
        const F1 = r.pick([1.5, 2.0, 4.8]), d1 = r.pick([20, 30]), k = r.pick([2, 3]);
        const F2 = F1 / k ** 5;
        return {
          prompt: t`Far from a small charged ball, a neutral metal sphere is attracted with a force proportional to $1/d^5$ — not $1/d^2$, because the ball must first induce the charge it then pulls on. If the force is ${F1} µN at ${d1} cm, what is it at ${d1 * k} cm?`,
          answer: F2, units: 'µN', tol: { rel: 0.01 },
          errors: [{ value: F1 / (k * k), feedback: t`That is the inverse-square law for two charged objects. Here the force goes as $1/d^5$.` }, { value: F1 / k, feedback: t`Raise the distance ratio to the fifth power: $F_2 = F_1/${k}^5$.` }],
          hints: [t`$F_2/F_1 = (d_1/d_2)^5$.`, t`${k} times the distance divides the force by $${k}^5 = ${k ** 5}$.`],
          teach: 'The attraction of a neutral object falls off much faster than the force between two charges.',
          explain: t`$F_2 = ${F1}\ \mu\text{N}/${k}^5 = ${F1} /${k ** 5} = ${tn(F2)}\ \mu$N. Why the fifth power: the induced charge separation grows as $1/d^2$ (the ball’s field), and the difference between the pulls on its near and far sides shrinks as $1/d^3$. A neutral speck feels a charged object strongly only close up.`,
          visual: ballNear({ Q: 30, d: Math.min(30, d1), ask: true }, 'A charged ball and a neutral metal sphere far apart (the force arrow uses a compressed scale).'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-induced', difficulty: 2,
      gen(r) {
        const Q = r.pick([-24, 36, -50]), a = r.pick([4, 8]), d = r.pick([16, 20, 25]);
        const q = (-a / d) * Q;
        return {
          prompt: t`A small ball carrying $${Q > 0 ? '+' : '-'}${Math.abs(Q)}$ nC is held ${d} cm from the centre of a grounded metal sphere of radius ${a} cm. The ground wire is then removed and the ball taken away. What charge is left on the sphere, in nC?`,
          answer: q, units: 'nC', tol: { rel: 0.005 },
          errors: [{ value: -q, feedback: 'Charging by induction leaves the sphere opposite in sign to the ball.' }, { value: 0, feedback: 'The wire was removed while the ball was still near, so the induced charge is trapped.' }],
          hints: [t`While grounded, the sphere holds $-Qa/d$; cutting the wire traps it.`],
          teach: 'Ground, unground, remove: the trapped induced charge −Qa/d stays on the sphere.',
          explain: t`$q = -\dfrac{${a}}{${d}}\times(${Q}) = ${tn(q)}$ nC, trapped when the wire was cut and spread evenly once the ball left.`,
          visual: ballNear({ Q, d, a, ground: true, ask: true }, 'The grounded sphere with the ball near, before the wire is removed.'),
        };
      },
    }),
    mcq({
      id: 'cp-fuelling', difficulty: 2, transfer: true,
      prompt: 'Before an aircraft is refuelled — or a rocket stage loaded with propellant — a bonding cable is clamped between the vehicle, the fuel truck or line, and the ground. What is it for?',
      choices: [
        'Charge built up by friction — fuel flowing through hoses, wind on the airframe — can flow away and even out, instead of building a voltage that could spark through fuel vapour',
        'To polarize the fuel so that it sticks to the inside of the tank',
        'To give the vehicle a positive charge that repels flammable vapour',
        'To let the metal tanks conduct, since metal is an insulator when cold',
      ],
      answer: 0,
      why: {
        1: 'Polarization does not hold fuel in a tank, and nobody wants charge in the fuel system.',
        2: 'Any net charge is a hazard near vapour; the aim is to keep everything at the same potential as the ground.',
        3: 'Metals conduct at any temperature; the cable joins separate metal objects into one conductor.',
      },
      hints: ['What could make a spark near the fuel? How does a conducting path to the ground prevent it?'],
      teach: 'Grounding and bonding let separated charge flow back, so no voltage builds up to make a spark.',
      explain: t`Flowing fuel and moving air separate charge by friction, just like rubbing a balloon. Connected conductors share charge freely, so bonding the vehicle, the fuel line and the ground keeps them all at one potential: no voltage difference, no spark. The same precaution protects rocket propellant loading and the handling of explosives.`,
      visual: ballNear({ Q: 30, d: 12, ground: true, ask: true }, 'A grounded conductor: charge can flow to or from the ground freely (here, near a charged object).'),
    }),
    mcq({
      id: 'cp-moon-dust', difficulty: 3, transfer: true,
      prompt: 'On the Moon, sunlight and the solar wind charge the fine grains of lunar dust. Apollo astronauts found the dust clinging stubbornly to their suits and equipment — including surfaces that carried no net charge. Why can a charged grain stick to a neutral surface?',
      choices: [
        'The grain’s charge induces (or polarizes) opposite charge in the surface just beneath it, and the grain is attracted to that nearby opposite charge',
        'It cannot: a neutral surface exerts no electric force, so the dust must have been held by moisture',
        'The surface charges up with the same sign as the grain, and like charges attract',
        'Lunar gravity is too weak to pull the dust away, so it floats onto surfaces and stays there',
      ],
      answer: 0,
      why: {
        1: 'There is no moisture on the Moon, and a charged grain does pull on a neutral surface by inducing charge in it.',
        2: 'Like charges repel, so that would push the dust off.',
        3: 'Weak gravity does not make anything stick; an attractive force is needed to hold the grain on.',
      },
      hints: ['This is the balloon-on-the-wall effect, with the roles reversed: the small object is the charged one.', 'What does a charge do to the charges in a nearby conductor or insulator?'],
      teach: 'A charged particle is attracted to any nearby neutral surface, because it induces opposite charge in it.',
      explain: t`The grain polarizes the material beneath it (or, in metal, induces opposite charge there), and the attraction between the grain and that nearby induced charge holds it fast. Lunar dust is also sharp and jagged, which helps it cling. Future missions plan electrostatic and other dust-removal systems for suits, seals and solar panels.`,
      visual: ballNear({ Q: 30, d: 7.5, material: 'insulator', ask: true }, 'A charged particle (the ball) close to a neutral insulating surface (the sphere), polarizing it. Scales enormously exaggerated.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.2 Conductors, Insulators, and Charging by Induction', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-2-conductors-insulators-and-charging-by-induction' },
  ],
});
