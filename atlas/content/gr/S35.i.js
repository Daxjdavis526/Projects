// Traversable wormholes — Intuition Mode. Morris & Thorne (1988): design an
// open throat, then read off the matter it needs. Flare-out at the throat
// forces ρc² + p_r < 0 there (null energy condition broken); the radial
// tension at any static throat is c⁴/(8πG r₀²) — 4.8×10⁴² Pa for 1 m. The
// Ellis (Bronnikov) throat, b = r₀²/r: ρ = p_r = −r₀²/(8πr⁴) everywhere,
// −(π/4) r₀c²/G of negative mass per side (0.56 Jupiter masses for 1 m).
// Status: macroscopic traversable wormholes [math: need NEC violation, no
// candidate matter, no evidence]; holographic / quantum constructions [spec;
// not shortcuts]; the 2022 "wormhole on a chip" was a simulation of a toy
// model, and disputed.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, M_JUP, M_EARTH, sci, round, logDots } from './_frontier.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const tension = (r0) => C ** 4 / (8 * Math.PI * G * r0 * r0);   // Pa, at any static Morris–Thorne throat
const negMass = (r0) => (Math.PI / 4) * r0 * C * C / G;          // kg per side, Ellis throat
const NUCLEAR = 2.3e17 * C * C;                                    // energy density of nuclear matter, J/m³

// one slice of space through the throat, embedded so that lengths along the surface are true lengths
// k = 1: the Ellis throat r = r₀ cosh(z/r₀); k = 0: the Einstein–Rosen bridge r = r_s + z²/(4r_s)
const RAD = '(k*cosh(u) + (1 - k)*(1 + u^2/4))';
const throatPic = ({ k = 1, sliders = false, caption } = {}) => ({
  type: 'surface3d',
  params: {
    surface: [`${RAD}*cos(v)`, `${RAD}*sin(v)`, 'u'], domain: [[-2.1, 2.1], [0, 6.2832]], n: 34,
    axes: false, alpha: 0.42, colorBy: false, yaw: 0.55, pitch: 0.32, dist: 13, target: [0, 0, 0],
    ...(sliders ? {
      choices: [{ key: 'k', label: 'Which throat', options: [[1, 'Held open (Ellis)'], [0, 'Einstein–Rosen bridge']], value: k, explain: 'The Ellis throat is static and crossable, held open by exotic matter. The Einstein–Rosen bridge needs no matter, but exists only for an instant.' }],
      sliders: [{ key: 'R', label: 'Throat radius $r_0$', min: 0.01, max: 10000, value: 1, logScale: true, unit: '\\mathrm{m}', explain: 'Circumference of the throat ÷ 2π. It sets the scale and the price; the shape stays the same.' }],
      readouts: [
        { label: 'tension at the throat, Pa', expr: `k*${round(tension(1), 6)}/R^2` },
        { label: 'negative mass per side, kg', expr: `k*${round(negMass(1), 6)}*R` },
        { label: 'in Jupiter masses', expr: `k*${round(negMass(1) / M_JUP, 6)}*R` },
      ],
    } : { constants: { k } }),
    curves: [
      { param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 3.2 },
      { param: [`k*cosh(0.6)*cos(t)`, `k*cosh(0.6)*sin(t)`, '0.6'], t: [0, 6.2832], color: 'violet', width: 1.6 },
      { param: [`k*cosh(0.6)*cos(t)`, `k*cosh(0.6)*sin(t)`, '-0.6'], t: [0, 6.2832], color: 'violet', width: 1.6 },
    ],
  },
  caption: caption ?? 'One slice of space at one moment, bent into an imaginary extra dimension so that distances along the surface are true distances. The height means nothing, and nothing rolls on it. Gold: the throat; violet: the region where the needed negative energy is densest. Mathematically allowed; no evidence that such a throat exists.',
});

const masses = logDots([['Earth', M_EARTH, 'teal'], ['Jupiter', M_JUP, 'gold'], ['the Sun', M_SUN, 'gold']], { xlabel: 'mass in kg (powers of ten)', range: [20, 36], every: 2, caption: 'Masses for scale, in powers of ten.' });

export default lesson({
  id: 'gr.S35.i',
  title: 'Wormholes: what the mathematics allows and what it demands',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['math', 'spec'],
  intro: t`A **wormhole** is a geometry with a **throat**: a tunnel joining two regions of space, or two distant parts of one. The Einstein–Rosen bridge of the complete Schwarzschild solution is one, but it pinches off before anything can cross. In 1988 Michael Morris and Kip Thorne turned the question round: design a throat that stays open and can be crossed, then let Einstein's equations say what matter it needs. The answer is decisive. Light rays that converge on their way into a throat spread apart on the way out, and Einstein's equations turn that **flare-out** into a demand on the matter at the throat:

$$\rho c^2 + p_r < 0$$

The **null energy condition must fail**: the throat must be held open by a tension larger than its energy density. For a throat of radius $r_0$, that tension is:`,
  equation: t`-p_r = \frac{c^4}{8\pi G\,r_0^2}`,
  symbols: [
    { tex: 'p_r', text: 'the pressure along the throat, in Pa; negative means tension, like a stretched cable' },
    { tex: 'r_0', text: 'the throat’s radius: its circumference divided by 2π, in m' },
    { tex: '\\rho', text: 'the energy density of the matter there, divided by $c^2$, in kg/m³' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\,\\text{s}^{-2}$' },
    { tex: 'c', text: 'the speed of light; $c^4/(8\\pi G) = 4.8\\times10^{42}$ N is the enormous force scale of general relativity' },
  ],
  why: 'Wormholes are the cleanest case of how energy conditions police geometry: the mathematics allows the tunnel, and the same mathematics prices it in matter nobody knows how to make.',
  visual: {
    ...throatPic({ sliders: true }),
    title: 'Two throats, one slice of space',
    lead: t`A slice of space through a wormhole throat (gold). Drag to rotate. Switch between a throat **held open** by exotic matter and the **Einstein–Rosen bridge** inside a black hole, and slide the throat radius to see the price.`,
    tasks: ['At r₀ = 1 m the throat needs a tension of 4.8 × 10⁴² Pa — about 10⁸ times the energy density of an atomic nucleus.', 'Make the throat 100 times wider: the tension falls 10 000 times, but the negative mass needed grows 100 times, to tens of Jupiter masses.', 'Switch to the Einstein–Rosen bridge: no matter needed — but it pinches off faster than light could cross.'],
  },
  example: {
    prompt: t`The simplest crossable wormhole (Ellis's, 1973) has a throat of radius $r_0 = 1$ m. Find the tension at the throat, check the null energy condition, and find how much negative mass it needs on each side, $(\pi/4)\,r_0c^2/G$.`,
    steps: [
      { label: 'Tension', text: t`$-p_r = c^4/(8\pi G r_0^2) = (2.998\times10^{8})^4/(8\pi\times6.674\times10^{-11}\times1^2) = ${sci(tension(1))}$ Pa — about $${sci(tension(1) / NUCLEAR, 1)}$ times the energy density of an atomic nucleus.` },
      { label: 'Energy density', text: t`For this throat the energy density at the throat equals the radial pressure: $\rho c^2 = -${sci(tension(1))}$ J/m³. It is **negative**, and it stays negative all the way out, falling as $1/r^4$.` },
      { label: 'Null condition', text: t`$\rho c^2 + p_r = -2\times${sci(tension(1))} < 0$: broken, as it must be at any throat that flares out.` },
      { label: 'How much', text: t`Adding up the negative energy on one side gives $(\pi/4)r_0c^2/G = ${sci(negMass(1))}$ kg — $${sci(negMass(1) / M_JUP, 2)}$ Jupiter masses — of negative mass, for a tunnel two metres across.` },
      { label: 'Against what we have', text: t`The Casimir effect, the best laboratory source of negative energy, gives about $4\times10^{4}$ J/m³ between plates 10 nm apart — $10^{38}$ times too little, confined to a nanometre gap, and limited in duration by quantum inequalities.` },
    ],
    answer: t`Tension $${sci(tension(1))}$ Pa; $\rho c^2 + p_r < 0$, so the null condition is broken; $${sci(negMass(1))}$ kg ($${sci(negMass(1) / M_JUP, 2)}\,M_\text{Jupiter}$) of negative mass on each side.`,
  },
  practice: [
    mcq({
      id: 'predicts', difficulty: 1,
      prompt: 'Does general relativity predict that traversable wormholes exist?',
      choices: [
        'No: it allows wormhole geometries, but keeping one open needs matter that breaks the null energy condition in amounts no known physics supplies — and there is no evidence any exist',
        'Yes: they are a prediction of the theory, just like black holes',
        'Yes: every black hole is a traversable wormhole',
        'No: Einstein’s equations forbid wormholes outright',
      ],
      answer: 0,
      why: {
        1: 'Black holes form from ordinary matter collapsing and are observed. Wormholes need exotic matter and have never been seen.',
        2: 'A black hole’s interior leads to a singularity, not to another place; even the Einstein–Rosen bridge of the eternal solution pinches off.',
        3: 'The equations allow them, given exotic matter. The obstacle is the matter, not the mathematics.',
      },
      hints: ['What is the difference between “the equations have a solution” and “nature makes it”?'],
      teach: 'Traversable wormholes are mathematically allowed but demand matter that breaks the null energy condition; none is known to exist.',
      explain: 'Morris and Thorne showed that any static, crossable throat needs ρc² + p < 0 at the throat. Ordinary matter never does this; quantum effects do it only in tiny, brief amounts. Status: mathematically allowed, requiring exotic matter, with no observational evidence.',
      visual: throatPic({ caption: 'A slice of space through a throat held open by exotic matter (embedding: distances along the surface are true distances; the height means nothing). Mathematically allowed; never observed.' }),
    }),
    num({
      id: 'tension', difficulty: 2,
      gen(r) {
        const [r0, txt] = r.pick([[1, '1 m'], [10, '10 m'], [1000, '1 km'], [0.01, '1 cm']]);
        const x = tension(r0);
        return {
          prompt: t`What tension must hold open a wormhole throat of radius ${txt}? Use $-p_r = c^4/(8\pi G r_0^2)$ with $c = 2.998\times10^{8}$ m/s and $G = 6.674\times10^{-11}$ SI.`,
          answer: x, units: 'Pa', tol: { rel: 0.01 },
          errors: [...(r0 !== 1 ? [{ value: x * r0, feedback: 'The radius enters squared: divide by r₀².' }] : []), { value: (C ** 2) / (8 * Math.PI * G * r0 * r0), feedback: 'Use c⁴, not c².' }],
          hints: [t`$c^4/(8\pi G) = ${sci(tension(1))}$ N.`, t`Divide by $r_0^2 = ${sci(r0 * r0)}\ \text{m}^2$.`],
          teach: 'The tension at a wormhole throat, c⁴/(8πG r₀²), dwarfs every material and even nuclear matter.',
          explain: t`$-p_r = ${sci(x)}$ Pa — ${x > NUCLEAR ? `$${sci(x / NUCLEAR, 2)}$ times the energy density of nuclear matter` : `still $${sci(x / 1e9, 2)}$ times the strength of the strongest steel`}. Smaller throats are worse: the tension grows as $1/r_0^2$.`,
          visual: logDots([['strong steel breaks (~10⁹ Pa)', 1e9, 'ink2'], ['nuclear matter’s energy density', NUCLEAR, 'teal']], { xlabel: 'pressure in Pa (powers of ten)', range: [6, 60], every: 6, caption: 'Pressures for scale, in powers of ten (nuclear matter: 2.3×10¹⁷ kg/m³ × c²).' }),
        };
      },
    }),
    num({
      id: 'negative-mass', difficulty: 2,
      gen(r) {
        const [r0, txt] = r.pick([[0.01, '1 cm'], [1, '1 m'], [1000, '1 km']]);
        const x = negMass(r0);
        return {
          prompt: t`An Ellis wormhole with throat radius ${txt} needs negative mass $(\pi/4)\,r_0c^2/G$ on each side. How much is that, in kg? (Give its size.)`,
          answer: x, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: r0 * C * C / G, feedback: 'Multiply by π/4.' }, { value: (Math.PI / 4) * r0 * C / G, feedback: 'Use c², not c.' }],
          hints: [t`$c^2/G = (2.998\times10^{8})^2/6.674\times10^{-11} = ${sci((C * C) / G)}$ kg/m.`, t`Multiply by $(\pi/4)\times${sci(r0)}$ m.`],
          teach: 'The negative mass a wormhole needs grows in proportion to its throat: about half a Jupiter per metre.',
          explain: t`$${sci(x)}$ kg — ${x > M_SUN / 10 ? `$${sci(x / M_SUN, 2)}$ solar masses` : x > M_JUP / 10 ? `$${sci(x / M_JUP, 2)}$ Jupiter masses` : `$${sci(x / M_EARTH, 2)}$ Earth masses`}, of **negative** mass, for a throat ${txt} across.`,
          visual: masses,
        };
      },
    }),
    mcq({
      id: 'bridge', difficulty: 2,
      prompt: 'The Einstein–Rosen bridge needs no exotic matter at all. Why can nothing travel through it?',
      choices: [
        'It is dynamical: it opens and pinches off again faster than light could cross from one side to the other',
        'It is blocked by a wall of matter at the throat',
        'It leads into a white hole, which nothing can enter',
        'It is too small for anything but light',
      ],
      answer: 0,
      why: {
        1: 'There is no matter in it at all: it is empty space, a vacuum solution.',
        2: 'Entering it from either outside means crossing a black-hole horizon; the trouble is that the throat closes before you get through, leaving only the singularity ahead.',
        3: 'Even light cannot cross: the bridge pinches off first (Fuller & Wheeler, 1962).',
      },
      hints: ['Does the bridge stay the same size over time?'],
      teach: 'The Einstein–Rosen bridge pinches off before anything, even light, can cross it.',
      explain: 'At one instant the slice through the eternal Schwarzschild spacetime is a bridge with a throat of radius 2GM/c²; at later times the throat shrinks to zero in πGM/c³. Any traveller from one outside reaches the singularity instead. Keeping a throat open is exactly what requires exotic matter.',
      visual: throatPic({ k: 0, caption: 'The Einstein–Rosen bridge at its widest instant: two copies of the space around a black hole, joined at a throat of radius 2GM/c² (gold). Embedding diagram: distances along the surface are true; the height means nothing.' }),
    }),
    mcq({
      id: 'flare-out', difficulty: 3,
      prompt: 'Why must the matter at the throat of a crossable wormhole break the null energy condition?',
      choices: [
        'A bundle of light rays entering the throat converges and then spreads out again. Ordinary matter can only focus light; spreading it needs ρc² + p < 0',
        'Because the throat is very small, and small things need negative energy',
        'Because the wormhole rotates',
        'Because the throat is a black hole’s horizon',
      ],
      answer: 0,
      why: {
        1: 'The requirement holds for a throat of any size; size changes only how much exotic matter is needed.',
        2: 'Static, non-rotating throats need it too.',
        3: 'A crossable throat must have no horizon; if it did, you could not come back out.',
      },
      hints: ['Gravity of ordinary matter focuses light (think of lensing). What does a throat do to a bundle of light rays passing through?', 'In Einstein’s equations, the focusing of light rays is controlled by ρc² + p.'],
      teach: 'A throat defocuses light; Einstein’s equations allow that only where ρc² + p < 0.',
      explain: 'The Raychaudhuri equation says light rays are focused wherever ρc² + p ≥ 0 — the null energy condition. A throat does the opposite on its far side: rays that converged spread apart. So the null condition must fail there, whatever the throat’s size or shape (Morris & Thorne 1988; Friedman, Schleich & Witt’s topological censorship theorem says the same for averaged conditions).',
      visual: {
        type: 'graph',
        params: {
          x: [-2.4, 2.4], y: [-2.2, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { fn: 'cosh(x)', domain: [-1.45, 1.45], color: 'ink2', width: 2.4 },
            { fn: '-cosh(x)', domain: [-1.45, 1.45], color: 'ink2', width: 2.4 },
            ...[-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((s) => ({ fn: `${s}*cosh(x)`, domain: [-1.45, 1.45], color: 'gold', width: 1.4 })),
            { param: ['0', 't'], t: [-1, 1], color: 'violet', width: 3 },
          ],
          points: [{ x: 0.06, y: 1.2, r: 0.5, color: 'violet', label: 'throat: needs ρc² + p < 0' }, { x: -2.3, y: 1.75, r: 0.5, color: 'gold', label: 'light rays in…' }, { x: 1.05, y: 1.75, r: 0.5, color: 'gold', label: '…and out' }],
        },
        caption: 'Schematic: a profile of a throat, with a bundle of light rays (gold) squeezed together on the way in and spreading on the way out. Spreading on the far side is what ordinary matter can never do.',
      },
    }),
    mcq({
      id: 'quantum-chip', difficulty: 2,
      prompt: 'In 2022 a quantum-computer experiment was widely reported as “creating a wormhole”. What did it actually do?',
      choices: [
        'It ran a simulation of a highly simplified quantum model on a few qubits, chosen because in a theoretical “dual” description its behaviour resembles a tiny traversable wormhole. No wormhole in space was made, and critics argued even the resemblance was weak',
        'It made a microscopic wormhole in the laboratory and sent a qubit through it',
        'It detected a natural wormhole in space with a quantum sensor',
        'It showed that ordinary matter can hold a wormhole open',
      ],
      answer: 0,
      why: {
        1: 'No spacetime was curved or connected: a quantum processor computed how a small model system evolves.',
        2: 'Nothing was observed in space; the experiment was a computation on a chip.',
        3: 'The model says nothing about ordinary matter holding real throats open; the energy-condition requirements are unchanged.',
      },
      hints: ['Separate what was computed on the chip from what the computation was said to resemble.'],
      teach: '“Wormhole on a chip” meant a simulation of a toy model with a theoretical wormhole analogy — not a wormhole, and the analogy itself was disputed.',
      explain: 'Jafferis et al. (Nature, 2022) simulated a machine-learning-simplified model on Google’s Sycamore processor. Kobrin, Schuster and Yao (2023) argued that the learned model does not behave like the gravity it was meant to mimic; the authors replied. Either way, it is a model (badge: teaching model / speculative), not a wormhole.',
    }),
    mcq({
      id: 'no-shortcut', difficulty: 3,
      prompt: 'Maldacena, Milekhin and Popov (2018) found traversable wormhole solutions using fields like those of known particle physics. Could such a wormhole serve as a shortcut across space?',
      choices: [
        'No: crossing through takes longer than travelling between the two mouths through ordinary space, so it never beats light — and it needs very special conditions',
        'Yes: it allows faster-than-light travel with ordinary matter',
        'Yes, but only for light, not for spacecraft',
        'No, because it leads to another universe rather than another place in ours',
      ],
      answer: 0,
      why: {
        1: 'The negative energy comes from subtle quantum effects in a special set-up, and the resulting wormhole is not a shortcut.',
        2: 'Light, too, gets through more slowly than it would outside.',
        3: 'In their construction the two mouths lie in one universe; the point is that the route through is the longer one.',
      },
      hints: ['Compare the two routes between the mouths: through the throat, or around through ordinary space. Which is faster in their solution?', 'Theorems with averaged energy conditions suggest that quantum-supported wormholes cannot be shortcuts.'],
      teach: 'The best-founded traversable wormholes are slower than going around: no shortcut, no faster-than-light travel.',
      explain: 'Their wormhole is held open by quantum effects of fields in a carefully arranged setting (magnetically charged black holes as the mouths). It is consistent with causality precisely because the trip through takes longer than the trip outside. Status: speculative, and not a route to faster travel.',
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-0.9, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { param: ['-2.4 + 4.8t', '0'], t: [0, 1], color: 'accent', width: 2.4 },
            { param: ['-2.4 + 4.8t', '2.1*sin(pi*t)^0.7'], t: [0, 1], color: 'violet', width: 2.4, dash: true },
          ],
          points: [{ x: -2.4, y: 0, color: 'gold', label: 'mouth A' }, { x: 2.4, y: 0, color: 'gold', label: 'mouth B' }, { x: -0.9, y: -0.35, r: 0.5, color: 'accent', label: 'through ordinary space' }, { x: -0.9, y: 2.25, r: 0.5, color: 'violet', label: 'through the wormhole: longer' }],
        },
        caption: 'Schematic of the result: in the 2018 construction the route through the wormhole takes longer than the route outside, so no signal outruns light.',
      },
    }),
    mcq({
      id: 'time-machine', difficulty: 3,
      prompt: 'Morris, Thorne and Yurtsever (1988) showed that if one mouth of a traversable wormhole were taken on a fast round trip — like the travelling twin — the wormhole would become a time machine. What follows?',
      choices: [
        'That crossable wormholes and time machines come together: anything that allows one invites causality paradoxes — one reason many physicists suspect physics forbids both. It proves neither exists',
        'That time machines have been built in this way',
        'That wormholes are proven impossible',
        'That faster-than-light travel would be safe after all',
      ],
      answer: 0,
      why: {
        1: 'No wormhole is known, let alone one with a mouth flown about.',
        2: 'Nothing is proven: the argument shows only that wormholes would bring time-machine problems with them.',
        3: 'Quite the opposite: the link to time travel is why faster-than-light routes raise paradoxes.',
      },
      hints: ['The moving mouth ages less, like the travelling twin. If the two mouths are joined “at equal ages”, what happens when you go in one and out the other?', 'Hawking’s chronology-protection conjecture says something always prevents this. Is it proven?'],
      teach: 'A crossable wormhole could be turned into a time machine — a strong hint that something forbids at least one of them.',
      explain: 'The twin effect leaves the travelling mouth younger; the throat joins the mouths at equal times on their own clocks, so stepping through lets you arrive before you left. Hawking’s chronology-protection conjecture — that quantum effects always destroy such a configuration — is unproven: an open question.',
      visual: spacetimeSketch({
        segments: [[0, 0, 10, 0, 'accent'], [0, 0, 5, 4, 'gold'], [5, 4, 10, 0, 'gold']],
        events: [[0, 0, 'mouths together'], [10, 0, 'reunion: mouth B younger', 'gold']],
        range: 7.5, xlabel: 'distance (light-years)', ylabel: 'time (years)',
        caption: 'Spacetime diagram (c = 1): mouth A stays home (blue); mouth B flies out at 0.8c and back (gold). On its own clock B ages 6 years to A’s 10, exactly like the twin paradox; a throat joining the mouths at equal ages links A’s year 10 to B’s year 6 — a time machine.',
      }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tension', difficulty: 2,
      gen(r) {
        const [r0, txt] = r.pick([[100, '100 m'], [0.1, '10 cm'], [1e4, '10 km']]);
        const x = tension(r0);
        return {
          prompt: t`What tension, in pascals, holds open a wormhole throat of radius ${txt}? ($-p_r = c^4/(8\pi G r_0^2)$, $c^4/(8\pi G) = ${sci(tension(1))}$ N)`,
          answer: x, units: 'Pa', tol: { rel: 0.01 },
          hints: ['Divide c⁴/(8πG) by r₀².'],
          teach: 'Throat tension falls as 1/r₀² — but stays far beyond any material.',
          explain: t`$${sci(tension(1))}/${sci(r0 * r0)} = ${sci(x)}$ Pa.`,
          visual: logDots([['strong steel breaks (~10⁹ Pa)', 1e9, 'ink2'], ['nuclear matter’s energy density', NUCLEAR, 'teal']], { xlabel: 'pressure in Pa (powers of ten)', range: [6, 60], every: 6, caption: 'Pressures for scale, in powers of ten.' }),
        };
      },
    }),
    mcq({
      id: 'cp-status', difficulty: 2,
      prompt: 'Which is the accurate status of wormholes large enough to cross?',
      choices: [
        'Mathematically allowed geometries that need matter breaking the null energy condition, in amounts no known physics supplies; there is no observational evidence for any',
        'Established: LIGO has detected wormholes merging',
        'Refuted: Einstein’s equations rule them out',
        'Nearly confirmed by the 2022 quantum-computer experiment',
      ],
      answer: 0,
      why: {
        1: 'LIGO’s signals match merging black holes; searches for wormhole-like “echoes” after mergers have found nothing.',
        2: 'The equations allow them; the obstacle is the matter.',
        3: 'That experiment simulated a toy model on a chip; it made no wormhole and confirmed nothing about real ones.',
      },
      hints: ['Three questions: allowed by the equations? matter available? anything observed?'],
      teach: 'Macroscopic traversable wormholes: mathematically allowed, exotic matter required, no evidence.',
      explain: 'That three-part status — allowed, demanding, unobserved — is the honest summary, and it is the same for warp drives in the next lesson.',
      visual: throatPic({ caption: 'A wormhole throat held open by exotic matter: a solution on paper. Embedding diagram; the height means nothing.' }),
    }),
    num({
      id: 'cp-ship', difficulty: 3, transfer: true,
      gen(r) {
        const r0 = r.pick([5, 10, 50]);
        const x = negMass(r0) / M_SUN;
        return {
          prompt: t`A spacecraft ${2 * r0} m across would need a throat of radius at least ${r0} m. For the Ellis shape, how much negative mass does that take on each side, in solar masses? ($(\pi/4)\,r_0c^2/G$; 1 solar mass $= 1.989\times10^{30}$ kg)`,
          answer: x, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: (negMass(r0) / M_SUN) * 2, feedback: 'Per side, not for both sides together.' }],
          hints: [t`$(\pi/4)\,c^2/G = ${sci(negMass(1))}$ kg per metre of throat radius.`, t`Multiply by ${r0} m, then divide by $1.989\times10^{30}$ kg.`],
          teach: 'A ship-sized wormhole would need several Jupiter masses of negative mass on each side.',
          explain: t`$${sci(negMass(r0))}$ kg $= ${sci(x)}$ solar masses — $${sci(negMass(r0) / M_JUP, 2)}$ Jupiter masses — of **negative** mass per side, against none at all available. Shapes that concentrate the exotic matter in a thin band near the throat can reduce the total, but never to zero, and quantum inequalities then demand that band be absurdly thin.`,
          visual: masses,
        };
      },
    }),
  ],
  sources: [
    { label: 'Morris & Thorne, “Wormholes in spacetime and their use for interstellar travel”, Am. J. Phys. 56, 395 (1988)', url: 'https://doi.org/10.1119/1.15620' },
    { label: 'Morris, Thorne & Yurtsever, wormholes and time machines, Phys. Rev. Lett. 61, 1446 (1988)', url: 'https://doi.org/10.1103/PhysRevLett.61.1446' },
    { label: 'Maldacena, Milekhin & Popov, traversable wormholes in four dimensions (2018)', url: 'https://arxiv.org/abs/1807.04726' },
    { label: 'Jafferis et al., traversable wormhole dynamics on a quantum processor, Nature (2022)', url: 'https://doi.org/10.1038/s41586-022-05424-3' },
    { label: 'Kobrin, Schuster & Yao, comment on the 2022 experiment (2023)', url: 'https://arxiv.org/abs/2302.07897' },
  ],
});
