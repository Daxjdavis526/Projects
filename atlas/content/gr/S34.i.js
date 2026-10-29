// Exotic spacetime geometries — Intuition Mode. A gallery of exact solutions,
// each with its status: the eternal Schwarzschild spacetime's white hole and
// second exterior [math: not formed by collapse]; Einstein–Rosen bridge
// (pinches off, Fuller & Wheeler 1962); Reissner–Nordström r± = M ± √(M² −
// Q²); Kerr interior beyond r₋ [math, expected unstable]; Gödel's rotating
// universe with closed timelike curves [math, wrong cosmology]; cosmic strings,
// deficit δ = 8πGμ/c² [spec: unobserved]; chronology protection [open].
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, M_SUN, LY, sci, round, T_SUN } from './_frontier.js';

const t = String.raw;
const ARCSEC = 180 * 3600 / Math.PI;    // arcseconds per radian

// Penrose diagram of the complete ("eternal") Schwarzschild spacetime
const penrose = ({ bridge = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-2.3, 2.3], y: [-1.35, 1.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-2 + t', 't'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: ['1 + t', '1 - t'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: ['2 - t', '-t'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: ['-1 - t', '-1 + t'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: ['-1 + 2t', '1 + 0.03sin(60t)'], t: [0, 1], color: 'bad', width: 2.4 },
      { param: ['-1 + 2t', '-1 + 0.03sin(60t)'], t: [0, 1], color: 'bad', width: 2.4 },
      { param: ['-1 + 2t', '-1 + 2t'], t: [0, 1], color: 'gold', width: 1.8 },
      { param: ['-1 + 2t', '1 - 2t'], t: [0, 1], color: 'gold', width: 1.8 },
      ...(bridge ? [{ param: ['-2 + 4t', '0'], t: [0, 1], color: 'accent', width: 3 }] : []),
    ],
    points: [
      { x: 0.95, y: 0.18, r: 0.5, color: 'ink', label: 'I: our outside' },
      { x: -0.42, y: 0.62, r: 0.5, color: 'ink', label: 'II: black hole' },
      { x: -0.42, y: -0.62, r: 0.5, color: 'ink2', label: 'III: white hole' },
      { x: -1.75, y: 0.18, r: 0.5, color: 'ink2', label: 'IV: another outside' },
      ...(bridge ? [{ x: -0.3, y: -0.12, r: 0.5, color: 'accent', label: 'the bridge' }] : []),
    ],
  },
  caption: caption ?? 'Penrose diagram of the complete (“eternal”) Schwarzschild spacetime: time runs up, light moves at 45°, and infinity is squeezed onto the edges. Gold: horizons; red: singularities. Regions III and IV are mathematically allowed, but a star that collapses makes only I and II.',
});

// a straight cosmic string seen end-on: a wedge of angle D (degrees) is missing; the edges are glued,
// so a quasar a distance L behind appears twice, once on each side
const H = 'D*pi/360';
const cone = ({ D = 20, L = 4, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-6, 6], y: [-3, 3], equal: true, grid: false, axes: false, xlabel: '', ylabel: '', ...(sliders ? { aspect: 'wide' } : {}),
    ...(sliders ? {
      sliders: [
        { key: 'D', label: 'Missing wedge $\\delta$', min: 0, max: 40, step: 0.5, value: D, unit: '^\\circ', explain: 'The deficit angle, hugely exaggerated: a real string with $G\\mu/c^2 = 10^{-7}$ removes half an arcsecond.' },
        { key: 'L', label: 'Quasar behind the string', min: 1.5, max: 5.5, step: 0.1, value: L, explain: 'Its distance from the string, in the units of the picture; the telescope is 5 units in front.' },
      ],
      readouts: [
        { label: 'image separation', expr: `2*atan(L*sin(${H})/(5 + L*cos(${H})))*180/pi`, unit: '^\\circ', digits: 3 },
        { label: '$G\\mu/c^2$ such a string would need', expr: 'D*pi/180/(8*pi)', digits: 3 },
      ],
    } : { constants: { D, L } }),
    shade: [{ fn: `-x*tan(${H})`, lower: `x*tan(${H})`, from: -6, to: 0, color: 'ink4', alpha: 0.5 }],
    curves: [
      { param: [`-t*cos(${H})`, `t*sin(${H})`], t: [0, 6.2], color: 'ink3', dash: true, width: 1.2 },
      { param: [`-t*cos(${H})`, `-t*sin(${H})`], t: [0, 6.2], color: 'ink3', dash: true, width: 1.2 },
      { param: [`-L*cos(${H}) + t*(5 + L*cos(${H}))`, `L*sin(${H})*(1 - t)`], t: [0, 1], color: 'gold', width: 2 },
      { param: [`-L*cos(${H}) + t*(5 + L*cos(${H}))`, `-L*sin(${H})*(1 - t)`], t: [0, 1], color: 'gold', width: 2 },
    ],
    points: [
      { x: 0, y: 0, color: 'bad', r: 5, label: 'string (end-on)' },
      { x: `-L*cos(${H})`, y: `L*sin(${H})`, color: 'gold', label: 'quasar' },
      { x: `-L*cos(${H})`, y: `-L*sin(${H})`, color: 'gold' },
      { x: 5, y: 0, color: 'accent', label: 'telescope' },
    ],
  },
  caption: caption ?? 'Space around a straight cosmic string, seen end-on — a teaching model. The grey wedge is missing and its two edges are the same place, so the quasar sits on both. Space is flat everywhere except at the string itself, yet two straight paths, one on each side, join quasar and telescope. Angles hugely exaggerated.',
});

// horizons of a charged (Reissner–Nordström) black hole against charge
const rnGraph = (q) => ({
  type: 'graph',
  params: {
    x: [0, 1.05], y: [0, 2.25], xlabel: 'charge Q/M', ylabel: 'radius / M',
    curves: [
      { fn: '1 + sqrt(1 - x^2)', domain: [0, 1], color: 'ink', width: 2.6, label: 'outer horizon r₊', labelAt: 0.25 },
      { fn: '1 - sqrt(1 - x^2)', domain: [0, 1], color: 'ink3', dash: true, label: 'inner horizon r₋', labelAt: 0.62 },
    ],
    vlines: [{ x: q, label: `Q = ${q}M`, color: 'accent' }],
  },
  caption: 'Horizons of a charged black hole (Reissner–Nordström), in units of M = GM/c², against its charge written as a length. The same shape as for spin. Real black holes are expected to be almost exactly neutral.',
});

export default lesson({
  id: 'gr.S34.i',
  title: 'Solutions that exist on paper',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['math', 'spec'],
  intro: t`Einstein's equations have thousands of exact solutions. A solution existing is not the same as nature making it: it may need matter nobody has found, it may be unstable, or it may describe a universe unlike ours. In this gallery each piece carries its status:

- the **complete Schwarzschild** spacetime, with a white hole and a second outside joined by an **Einstein–Rosen bridge** — mathematically allowed, but not what a collapsing star makes;
- **charged black holes** and the **inside of spinning ones**, whose inner horizons hide regions expected to be unstable;
- **Gödel's universe** (1949), in which time loops back through every event — a valid solution, but one that rotates and does not expand, unlike ours;
- **cosmic strings**: thin tubes of trapped energy predicted by some theories and never found. One would cut a wedge of angle $\delta$ out of the space around it:`,
  equation: t`\delta = \frac{8\pi G\mu}{c^2}`,
  symbols: [
    { tex: '\\delta', text: 'the deficit angle: the wedge missing from space around the string, in radians' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\,\\text{s}^{-2}$' },
    { tex: '\\mu', text: 'the string’s mass per unit length, in kg/m — for a string formed in the early universe, a staggering $10^{20}$ kg per metre' },
    { tex: 'c', text: 'the speed of light' },
    { tex: 'G\\mu/c^2', text: 'the dimensionless "tension": searches in the cosmic microwave background and with pulsar timing have found no strings and set tight upper limits on it' },
  ],
  why: 'Learning to ask "what would have to be true?" of a solution — what matter, what stability, what origin — is the tool the next two lessons apply to wormholes and warp drives.',
  visual: {
    ...cone({ D: 20, L: 4, sliders: true }),
    title: 'A cosmic string doubles the sky',
    lead: t`A straight cosmic string seen end-on, with a quasar behind it. The grey wedge is **missing** from space, and its two edges are the same place. Light travels in straight lines on either side.`,
    tasks: ['Set the wedge to 0: one straight path, one image.', 'Open the wedge: two straight paths, one on each side of the string, reach the telescope — two images of one quasar, with nothing visible between them.', 'Move the quasar closer to the string: the separation shrinks, roughly as δ × (distance behind) ÷ (total distance).'],
  },
  example: {
    prompt: t`A cosmic string has $G\mu/c^2 = 10^{-7}$. What is its mass per metre, how much does a light-year of it weigh, and how big a wedge does it cut out of space?`,
    steps: [
      { label: 'Mass per length', text: t`$\mu = 10^{-7}\,c^2/G = 10^{-7}\times(2.998\times10^{8})^2/6.674\times10^{-11} = ${sci((1e-7 * C * C) / G)}$ kg/m.` },
      { label: 'A light-year of it', text: t`$${sci((1e-7 * C * C) / G)}\ \text{kg/m}\times9.461\times10^{15}\ \text{m} = ${sci(((1e-7 * C * C) / G) * LY)}$ kg — about $${sci((((1e-7 * C * C) / G) * LY) / M_SUN, 2)}$ solar masses, in a line thinner than an atomic nucleus.` },
      { label: 'The wedge', text: t`$\delta = 8\pi G\mu/c^2 = 8\pi\times10^{-7} = ${sci(8 * Math.PI * 1e-7)}$ rad $= ${sci(8 * Math.PI * 1e-7 * ARCSEC)}''$.` },
      { label: 'What it would look like', text: t`A quasar behind the string would appear twice, the images up to about half an arcsecond apart, with no lensing galaxy between them — and a long string would make a whole line of such pairs.` },
      { label: 'Status', text: t`Speculative: such strings appear in some theories of the early universe, but none has been found, and the cosmic microwave background and pulsar timing limit how heavy they could be.` },
    ],
    answer: t`$\mu = ${sci((1e-7 * C * C) / G)}$ kg/m — $${sci((((1e-7 * C * C) / G) * LY) / M_SUN, 2)}$ solar masses per light-year — and a missing wedge of $${sci(8 * Math.PI * 1e-7 * ARCSEC)}''$.`,
  },
  practice: [
    mcq({
      id: 'exists', difficulty: 1,
      prompt: 'If a spacetime is an exact solution of Einstein’s equations, must it exist somewhere in nature?',
      choices: [
        'No: almost any spacetime solves the equations for some matter. To be real it also needs matter that exists, a way to form, and stability',
        'Yes: every solution of Einstein’s equations describes something real',
        'Yes, in some other universe',
        'No, because Einstein’s equations are only approximately right',
      ],
      answer: 0,
      why: {
        1: 'The white hole of the eternal Schwarzschild solution is a clean counterexample: a valid solution that collapsing stars do not make.',
        2: 'That cannot be tested, so it says nothing about our universe.',
        3: 'The equations have passed every test so far. The issue is not their accuracy but whether nature supplies the right matter and conditions.',
      },
      hints: ['Write down any geometry and compute its curvature: Einstein’s equations then tell you what matter it would take. Must that matter exist?'],
      teach: 'An exact solution is a possibility on paper; nature also demands real matter, a way to form, and stability.',
      explain: 'Given any metric, Einstein’s equations define the matter it needs. Whether a solution is physical then depends on that matter (does it obey the energy conditions?), on whether something could form it, and on whether small disturbances destroy it.',
      visual: penrose({ caption: 'A valid solution with more than nature makes: the eternal Schwarzschild spacetime. Regions III (a white hole) and IV (a second outside) are mathematically allowed; a collapsing star makes only I and II.' }),
    }),
    num({
      id: 'rn', difficulty: 2,
      gen(r) {
        const q = r.pick([0.6, 0.8, 0.5, 0.9]), which = r.pick(['outer', 'inner']);
        const s = Math.sqrt(1 - q * q), x = which === 'outer' ? 1 + s : 1 - s;
        return {
          prompt: t`A black hole with charge $Q$ (written as a length, with $G = c = 1$) has horizons at $r_\pm = M \pm \sqrt{M^2 - Q^2}$. For $Q = ${q}M$, where is the **${which}** horizon, in units of $M$?`,
          answer: x, tol: { rel: 0.005 },
          errors: [{ value: which === 'outer' ? 1 - s : 1 + s, feedback: `That is the ${which === 'outer' ? 'inner' : 'outer'} horizon. Take the ${which === 'outer' ? '+' : '−'} sign.` }, { value: which === 'outer' ? 2 - q * q : q * q, feedback: 'Take the square root of 1 − (Q/M)².' }],
          hints: [t`$\sqrt{1 - ${q}^2} = ${sci(s, 4)}$.`],
          teach: 'Charge, like spin, splits the horizon into an outer and an inner one.',
          explain: t`$r_${which === 'outer' ? '+' : '-'} = 1 ${which === 'outer' ? '+' : '-'} ${sci(s, 4)} = ${sci(x, 4)}\,M$. Inside the inner horizon the exact solution continues into regions expected to be unstable; and real black holes are expected to be almost neutral, because any charge quickly attracts opposite charges from surrounding gas.`,
          visual: rnGraph(q),
        };
      },
    }),
    mcq({
      id: 'penrose', difficulty: 2,
      prompt: 'The diagram shows the complete Schwarzschild solution. Which regions does a black hole formed by a collapsing star actually have?',
      choices: [
        'Only I and II: the outside and the black-hole interior. The white hole and the other outside appear only in the idealised eternal solution',
        'All four: every black hole contains a white hole and a second universe',
        'Only I: nothing is inside a black hole',
        'I, II and III: the white hole is where the star’s matter comes back out',
      ],
      answer: 0,
      why: {
        1: 'In a collapse, the star’s surface replaces the left half of the diagram; regions III and IV are never formed. They belong to a black hole that has existed forever.',
        2: 'The interior, region II, is real: infalling matter crosses the horizon in finite time on its own clock.',
        3: 'No white hole has ever been observed, and none is formed by collapse; time-reversed black holes would also be wildly unstable.',
      },
      hints: ['The complete solution describes a black hole that has always existed. What changes if the black hole forms at some moment from a star?'],
      teach: 'Collapse makes only the outside and the black-hole interior; white holes and second outsides are mathematical extensions.',
      explain: 'The eternal Schwarzschild spacetime is the maximal extension of the solution — valid mathematics. A real black hole has a past: before the collapse, a star filled the place where regions III and IV would be. White holes remain mathematically allowed and unobserved.',
      visual: penrose(),
    }),
    num({
      id: 'deficit', difficulty: 2,
      gen(r) {
        const [mu, txt] = r.pick([[1e-7, t`10^{-7}`], [3e-7, t`3\times10^{-7}`], [1e-6, t`10^{-6}`]]);
        const x = 8 * Math.PI * mu * ARCSEC;
        return {
          prompt: t`How big a wedge, in arcseconds, does a cosmic string with $G\mu/c^2 = ${txt}$ remove from space? Use $\delta = 8\pi G\mu/c^2$ (1 rad = 206 265″).`,
          answer: x, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: 8 * Math.PI * mu, feedback: 'That is in radians. Multiply by 206 265 to get arcseconds.' }, { value: 8 * mu * ARCSEC, feedback: 'Keep the π: δ = 8πGμ/c².' }],
          hints: [t`$\delta = 8\pi\times${txt}$ rad, then convert.`],
          teach: 'A cosmic string’s deficit angle is tiny: arcseconds for the heaviest strings allowed.',
          explain: t`$\delta = ${sci(8 * Math.PI * mu)}$ rad $= ${sci(x)}''$. Double images of distant galaxies about this far apart, all along a line on the sky, would betray a string; searches have found none.`,
          visual: cone({ D: 16, L: 4 }),
        };
      },
    }),
    mcq({
      id: 'godel', difficulty: 2,
      prompt: 'In 1949 Kurt Gödel found an exact solution in which a traveller could loop back in time to their own past. Does it show that time travel is possible?',
      choices: [
        'No: Gödel’s universe rotates and does not expand — it is not ours. Solutions with time loops need conditions nobody has found, and whether physics forbids them in general is an open question',
        'Yes: every exact solution can in principle be built',
        'Yes, but only near black holes',
        'No, because Gödel made a mathematical error',
      ],
      answer: 0,
      why: {
        1: 'Building a solution needs its matter and conditions; for time loops these include a whole rotating universe, exotic matter or infinite structures.',
        2: 'Gödel’s solution has nothing to do with black holes: its time loops run through every event of a rotating universe.',
        3: 'The solution is correct; it simply describes a universe unlike ours.',
      },
      hints: ['Does our universe rotate like Gödel’s? What do observations of the cosmic microwave background say?'],
      teach: 'Closed timelike curves appear in valid solutions, but every known example needs conditions not found in nature.',
      explain: 'The cosmic microwave background shows no sign of a rotating universe, and ours expands. Other solutions with time loops (rotating cylinders, wormholes moved about) need exotic matter or infinite structures. Hawking’s chronology-protection conjecture — that quantum effects always prevent time loops — is unproven: an open question.',
    }),
    num({
      id: 'bridge', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass', 10], ['a 30-solar-mass', 30], ['a 4.30-million-solar-mass', 4.3e6]]);
        const x = Math.PI * m * T_SUN;
        return {
          prompt: t`In the eternal Schwarzschild spacetime of ${name} black hole, the Einstein–Rosen bridge is widest (throat radius $2GM/c^2$) for one instant, and then pinches off: on a clock sitting at the throat, it closes in $\pi GM/c^3$. How long is that? ($GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s)`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: m * T_SUN, feedback: 'Multiply GM/c³ by π.' }],
          hints: [t`$GM/c^3 = ${sci(m, 3)}\times${sci(T_SUN, 4)}$ s.`],
          teach: 'The Einstein–Rosen bridge pinches off faster than anything — even light — can cross it.',
          explain: t`$\pi GM/c^3 = ${sci(x)}$ s. In that time no signal can get from one outside to the other: the bridge is not a passage (Fuller & Wheeler 1962). To keep a throat open takes matter of a very different kind — the subject of the next lesson.`,
          visual: penrose({ bridge: true, caption: 'Penrose diagram of the eternal Schwarzschild spacetime with one slice through it (blue): at that instant, space is a bridge joining two outsides. Later slices hit the singularity in the middle: the bridge has pinched off. Every path from IV to I would have to go faster than light.' }),
        };
      },
    }),
    mcq({
      id: 'kerr-inside', difficulty: 3,
      prompt: 'The exact Kerr solution contains, beyond its inner horizon, a ring singularity you could pass through into a region with time loops. Why is this not considered a real route anywhere?',
      choices: [
        'The inner horizon is expected to be unstable: anything falling in, and any realistic collapse, should turn it into a singularity, so the idealised interior does not survive in real black holes',
        'Because that region lies outside the event horizon, and telescopes have ruled it out',
        'Because the Kerr solution is wrong for spinning black holes',
        'Because the ring singularity has been seen to be absent in images of M87*',
      ],
      answer: 0,
      why: {
        1: 'The inner horizon and everything beyond it lie inside the event horizon, hidden from every telescope.',
        2: 'Outside its horizon, the Kerr solution matches everything measured — ringdowns, shadows, disks.',
        3: 'The Event Horizon Telescope images show light from gas outside the horizon; nothing from inside can be seen.',
      },
      hints: ['Where is the inner horizon — inside or outside the event horizon? Could any telescope check it?', 'What happens to radiation falling toward an inner horizon? It piles up, blueshifted more and more.'],
      teach: 'The interiors of exact rotating and charged black holes are mathematical idealisations, expected to be destroyed by instabilities.',
      explain: 'Calculations of perturbed black holes show radiation piling up at the inner horizon, infinitely blueshifted (“mass inflation”), turning it into a singularity. Exactly what replaces it is an open mathematical question tied to cosmic censorship; the smooth passage through the ring belongs to the idealised solution only.',
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-2.2, 2.2], equal: true, xlabel: 'units of GM/c²', ylabel: '',
          constants: { a: 0.9 },
          curves: [
            { polar: '1 + sqrt(1 - a^2 sin(theta)^2)', theta: [0, 6.2832], color: 'bad', width: 2.2, label: 'ergosphere', labelAt: 0.6 },
            { polar: '1 + sqrt(1 - a^2)', theta: [0, 6.2832], color: 'ink', width: 2.6, label: 'event horizon', labelAt: 2.5 },
            { polar: '1 - sqrt(1 - a^2)', theta: [0, 6.2832], color: 'violet', width: 2, dash: true, label: 'inner horizon', labelAt: 5.6, labelDy: 18 },
          ],
        },
        caption: 'A slice through a black hole spinning at a = 0.9M (Boyer–Lindquist r drawn as distance from the centre). Everything inside the dashed inner horizon — the ring singularity, the time loops — is mathematically allowed and expected to be unstable.',
      },
    }),
    multi({
      id: 'which-observed', difficulty: 2,
      prompt: 'Which of these are established by observation? Select every one.',
      choices: [
        'The Schwarzschild spacetime outside the Sun and around black holes',
        'An expansion of the universe that is speeding up, as a cosmological constant causes',
        'White holes',
        'Cosmic strings',
        'Gödel’s rotating universe',
        'Closed timelike curves (time loops)',
      ],
      answer: [0, 1],
      why: {
        2: 'Mathematically allowed, never observed, and not formed by collapse.',
        3: 'Speculative: predicted by some theories, searched for, not found.',
        4: 'A valid solution, but our universe does not rotate measurably — and it expands.',
        5: 'They appear in some solutions; none is known in nature, and whether physics forbids them is open.',
      },
      hints: ['Ask of each: has it been measured, or does it only exist as a solution or a prediction?'],
      teach: 'Sort every solution by status: observed, mathematically allowed, speculative — and say which.',
      explain: 'Solar-system tests, orbits near black holes and gravitational waves test the Schwarzschild and Kerr exteriors; supernovae, the cosmic microwave background and galaxy surveys show the accelerating expansion. White holes, Gödel’s universe and time loops are mathematically allowed but unobserved; cosmic strings are speculative.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rn', difficulty: 2,
      gen(r) {
        const q = r.pick([0.3, 0.7, 0.95]);
        const x = 1 + Math.sqrt(1 - q * q);
        return {
          prompt: t`Where is the outer horizon $r_+ = M + \sqrt{M^2 - Q^2}$ of a black hole with charge $Q = ${q}M$ (units with $G = c = 1$), in units of $M$?`,
          answer: x, tol: { rel: 0.005 },
          hints: ['Take the + sign.'],
          teach: 'More charge, smaller outer horizon — down to M at Q = M.',
          explain: t`$r_+ = 1 + \sqrt{1 - ${q}^2} = ${sci(x, 4)}\,M$.`,
          visual: rnGraph(q),
        };
      },
    }),
    mcq({
      id: 'cp-headline', difficulty: 2,
      prompt: 'A headline says: “Physicists prove time travel is possible — Einstein’s equations allow it.” What is accurate?',
      choices: [
        'Some exact solutions contain time loops, but each needs conditions not known in nature; whether physics forbids time loops altogether is an open question',
        'Time travel to the past has been demonstrated with atomic clocks',
        'Einstein’s equations forbid time loops, so the headline is simply false',
        'Time travel is possible inside every black hole',
      ],
      answer: 0,
      why: {
        1: 'Atomic clocks show time dilation — clocks running at different rates — never a trip into the past.',
        2: 'They do not forbid them: Gödel’s solution and others contain them. The question is whether real matter and real histories can produce them.',
        3: 'The time loops of the exact Kerr interior lie beyond an inner horizon expected to be unstable.',
      },
      hints: ['Separate three things: what the equations allow, what nature has been seen to do, and what is still unknown.'],
      teach: '“Allowed by the equations” is not “possible”: a solution also needs real matter, a way to form, and stability.',
      explain: 'Accurate wording: valid solutions with time loops exist (mathematically allowed); none is known to be physically realisable; Hawking’s chronology-protection conjecture says quantum effects always prevent them, but that is unproven (open).',
      visual: penrose({ caption: 'A reminder from this lesson: valid solutions often contain more than nature makes — here a white hole and a second outside that collapse never forms.' }),
    }),
    num({
      id: 'cp-lens', difficulty: 3, transfer: true,
      gen(r) {
        const [mu, txt] = r.pick([[3e-7, t`3\times10^{-7}`], [1e-6, t`10^{-6}`]]);
        const f = r.pick([0.5, 0.8]);
        const x = 8 * Math.PI * mu * f * ARCSEC;
        return {
          prompt: t`A sky survey finds two identical quasar images with no galaxy between them. If a straight cosmic string with $G\mu/c^2 = ${txt}$ lay across the line of sight, the images would be separated by $\delta\times(D_{LS}/D_S)$, where $D_{LS}/D_S = ${f}$ is the string-to-quasar distance as a fraction of ours to the quasar. What separation, in arcseconds, would the string produce?`,
          answer: x, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: 8 * Math.PI * mu * ARCSEC, feedback: t`Multiply the deficit by $D_{LS}/D_S = ${f}$.` }, { value: 8 * Math.PI * mu * f, feedback: 'That is in radians. Multiply by 206 265.' }],
          hints: [t`$\delta = 8\pi G\mu/c^2 = ${sci(8 * Math.PI * mu)}$ rad.`, t`Multiply by ${f}, then by 206 265″ per radian.`],
          teach: 'A cosmic string would make pairs of identical images about δ apart — a signature telescopes search for.',
          explain: t`$${sci(8 * Math.PI * mu)}\times${f}\times206\,265 = ${sci(x)}''$. Such a pair alone would not prove a string — an ordinary but faint lensing galaxy could do it — but a whole line of pairs would. None has been confirmed.`,
          visual: cone({ D: 22, L: 4.5, caption: 'Teaching model, angles hugely exaggerated: a string between a quasar and a telescope gives two straight light paths, one on each side.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Gödel, “An example of a new type of cosmological solutions…”, Rev. Mod. Phys. 21, 447 (1949)', url: 'https://doi.org/10.1103/RevModPhys.21.447' },
    { label: 'Fuller & Wheeler, “Causality and multiply connected space-time”, Phys. Rev. 128, 919 (1962)', url: 'https://doi.org/10.1103/PhysRev.128.919' },
    { label: 'Hawking, “Chronology protection conjecture”, Phys. Rev. D 46, 603 (1992)', url: 'https://doi.org/10.1103/PhysRevD.46.603' },
    { label: 'Carroll, Lecture Notes on GR, ch. 7 (Penrose diagrams, charged and rotating black holes)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
