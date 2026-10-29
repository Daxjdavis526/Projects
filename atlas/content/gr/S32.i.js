// Numerical relativity — Intuition Mode. Spacetime sliced into 3D spaces
// (3+1): constraint equations on each slice, evolution equations between
// them, free lapse α and shift β. Stable binary-black-hole evolutions came in
// 2005 (Pretorius; Campanelli et al.; Baker et al.). Ringdown of a
// non-spinning remnant: Mω = 0.37367 − 0.08896i (195 Hz, 3.4 ms for 62 M☉).
// Painlevé–Gullstrand slicing: lapse 1, shift √(r_s/r) c ("river" language
// badged as a teaching model). Numbers from model/gr-waves.js.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { sci, round, T_SUN } from './_frontier.js';
import { ringdown, QNM22 } from '../../src/viz/model/gr-waves.js';

const t = String.raw;

const RD62 = ringdown(62), TM62 = 62 * T_SUN;

// a sketch of slicing: six slices, each drawn at the proper time its normal observers have lived; the lapse
// dips to A near a black hole at x = 0; gold dashed lines follow coordinate labels, which slide by B per step
const lapse = (x) => `(1 - (1 - A)*exp(-(${x})^2/1.5))`;
const slicing = ({ A = 0.25, B = 0, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [0, 6.6], xlabel: 'space', ylabel: 'proper time (schematic)', grid: false,
    ...(sliders ? {
      sliders: [
        { key: 'A', label: 'Lapse at the black hole $\\alpha$', min: 0.05, max: 1, step: 0.01, value: A, explain: 'Proper time that passes there per step, as a fraction of the time far away.' },
        { key: 'B', label: 'Shift $\\beta$', min: -0.5, max: 0.5, step: 0.01, value: B, explain: 'How far the coordinate labels slide sideways per step (grid units).' },
      ],
      readouts: [{ label: 'proper time per step, at the hole', expr: 'A', digits: 3 }, { label: 'far away', expr: '1', digits: 1 }],
    } : { constants: { A, B } }),
    curves: [
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ fn: `${n}*${lapse('x')}`, color: 'accent', width: 2.2 })),
      ...[-4, -2, 0, 2, 4].map((x0) => ({ param: [`${x0} - B*t`, `t*${lapse(`${x0} - B*t`)}`], t: [0, 6], color: 'gold', dash: true, width: 1.3 })),
    ],
    points: [{ x: 0, y: 0.12, color: 'bad', r: 5, label: 'black hole' }],
  },
  caption: caption ?? 'A teaching sketch in one space dimension, not a simulation. Blue: six slices of spacetime — six moments — each drawn at the proper time its local observers have lived. Gold dashed: where each coordinate label goes from slice to slice. Real codes do this in three dimensions, with a 3×3 metric on every slice.',
});

// a damped ringing, in units of GM/c³ (shape only)
const ringPic = {
  type: 'graph',
  params: {
    x: [0, 80], y: [-1.15, 1.15], xlabel: 'time after the peak (units of GM/c³)', ylabel: 'strain (arbitrary units)',
    curves: [
      { fn: `exp(-${QNM22[1]}x)*cos(${QNM22[0]}x)`, color: 'violet', width: 2.2 },
      { fn: `exp(-${QNM22[1]}x)`, color: 'ink3', dash: true, width: 1.2 },
      { fn: `-exp(-${QNM22[1]}x)`, color: 'ink3', dash: true, width: 1.2 },
    ],
  },
  caption: 'The fundamental ringing of a non-spinning black hole: a sine wave dying away exponentially (dashed envelope). Time in units of GM/c³, so the same curve fits every mass; spin changes both numbers.',
};

const chirp = (caption) => ({ type: 'gr-chirp', params: { m1: 36, m2: 29, sliders: false, play: false, readout: false, ring: false, p: 1 }, caption });

export default lesson({
  id: 'gr.S32.i',
  title: 'Colliding black holes on a computer',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`No formula describes two black holes in their last orbits: Einstein's equations must be solved step by step on a computer — **numerical relativity**. Spacetime is sliced into a stack of three-dimensional spaces, like the frames of a film. The first slice must obey four **constraint equations**, much as an electric field must obey Gauss's law; then the **evolution equations** carry the slice forward in time. Two choices are free and decide how: the **lapse** $\alpha$, how much proper time passes between slices at each place, and the **shift** $\beta$, how the coordinate grid slides along. In one space dimension:

$$ds^2 = -\alpha^2 c^2\,dt^2 + \left(dx + \beta\,dt\right)^2$$

For decades the codes crashed. In 2005 Frans Pretorius, and independently two groups using "moving punctures", made black-hole collisions run stably. Thousands of simulated mergers now shape the waveform models LIGO, Virgo and KAGRA compare with their data.`,
  equation: t`ds^2 = -\alpha^2 c^2\,dt^2 + \left(dx + \beta\,dt\right)^2`,
  symbols: [
    { tex: 'ds^2', text: 'the spacetime interval between two nearby events' },
    { tex: 't', text: 'the slice label: coordinate time, one value per slice' },
    { tex: 'x', text: 'the coordinate label of a point within a slice' },
    { tex: '\\alpha', text: 'the **lapse**: proper time between neighbouring slices per tick of $t$, measured by observers moving straight across the slices. No units; chosen near 0 close to a black hole' },
    { tex: '\\beta', text: 'the **shift**: how fast the coordinate labels slide through space from slice to slice, in m/s' },
    { tex: 'c', text: 'the speed of light. In three dimensions $dx^2$ becomes a 3×3 spatial metric — the distances within each slice — whose 6 components, with their rates of change, are what the computer evolves' },
  ],
  why: 'Every detection of merging black holes leans on simulations — directly, or through waveform models calibrated to them — both to find the signal and to read off the masses and spins.',
  visual: {
    ...slicing({ A: 0.3, B: 0, sliders: true }),
    title: 'Slicing spacetime',
    lead: t`Each blue curve is one **slice** — one moment, everywhere at once — drawn at the proper time that observers there have lived. The gold dashed lines follow coordinate labels from slice to slice. A black hole sits at the centre.`,
    tasks: ['Lower the lapse at the black hole: the slices bunch up there — little proper time passes near the hole on each step, so the slices never reach its singularity, while far away time runs on.', 'Add a shift: the gold coordinate lines tilt — the grid slides through space. This is how “moving punctures” let black holes travel across a fixed computer grid.', 'Set the lapse to 1 and the shift to 0: flat, evenly spaced slices with upright coordinate lines — empty spacetime in the simplest slicing.'],
  },
  example: {
    prompt: t`After merging, GW150914's black holes became one of about 62 solar masses, which rang like a struck bell before settling. Treating the final hole as non-spinning, its fundamental ringing has $GM\omega/c^3 = ${QNM22[0]} - ${QNM22[1]}\,i$ — computed once and for all by solving the wave equation around a black hole. Find the ringing frequency and how fast it dies away.`,
    visual: ringPic,
    steps: [
      { label: 'Why it rings', text: t`Just after merger the single black hole is distorted. It sheds the distortion as gravitational waves at fixed "quasinormal" frequencies, set only by its mass and spin — no other "hair".` },
      { label: 'Time unit', text: t`$GM/c^3 = 62\times4.926\ \mu\text{s} = ${sci(TM62 * 1e6)}\ \mu\text{s}$.` },
      { label: 'Frequency', text: t`The real part gives the angular frequency, $\omega = ${QNM22[0]}/(GM/c^3)$, so $f = \omega/2\pi = ${QNM22[0]}/(2\pi\times${sci(TM62 * 1e6)}\ \mu\text{s}) = ${sci(RD62.f)}$ Hz.` },
      { label: 'Damping', text: t`The imaginary part sets the decay: the amplitude falls by a factor $e$ every $\tau = (GM/c^3)/${QNM22[1]} = ${sci(RD62.tau * 1e3, 2)}$ ms — only $f\tau = ${sci(RD62.f * RD62.tau, 2)}$ of a cycle. A black hole is a bell that barely rings.` },
      { label: 'Honest caveat', text: t`The real remnant spins, which raises the frequency; the measured signal peaked near 250 Hz. In 2025 GW250114 was loud enough to resolve two ringing tones, both consistent with the Kerr prediction — a test of the "no-hair" result.` },
    ],
    answer: t`About ${sci(RD62.f)} Hz, dying away by a factor $e$ every ${sci(RD62.tau * 1e3, 2)} ms (for a non-spinning remnant; spin raises the frequency).`,
  },
  practice: [
    mcq({
      id: 'why-numerical', difficulty: 1,
      prompt: 'Why must the last orbits and merger of two black holes be computed numerically, rather than written down as a formula?',
      choices: [
        'General relativity has no exact solution for two orbiting bodies, and near merger the holes move too fast and too close for approximations to work',
        'Einstein’s equations are linear, so the answer is just two Kerr solutions added together — a computer only speeds up the arithmetic',
        'It could be done with pencil and paper; computers are used only to save time',
        'Only because the black holes spin: two non-spinning holes have a simple exact solution',
      ],
      answer: 0,
      why: {
        1: 'Einstein’s equations are nonlinear: gravity itself gravitates, so solutions cannot simply be added.',
        2: 'No closed-form solution for two bodies is known in general relativity; the merger is computed numerically or not at all.',
        3: 'Even two non-spinning black holes have no exact merger solution.',
      },
      hints: ['Can two solutions of a nonlinear equation be added to give another solution?'],
      teach: 'Because Einstein’s equations are nonlinear and no two-body solution exists, mergers are computed numerically.',
      explain: 'Far apart, the orbit is well described by post-Newtonian approximations (expansions in v/c). In the last orbits the holes move at a large fraction of c, a few horizon sizes apart, and the expansions fail. Only solving the full equations on a computer gives the merger.',
      visual: chirp('The leading-order chirp of GW150914’s pair. The approximation is fine early on and only rough at the end; the merger, shaded, needs the full equations.'),
    }),
    order({
      id: 'steps', difficulty: 2,
      prompt: 'Put the steps of a binary-black-hole simulation in order.',
      items: [
        'Choose the first slice and solve the constraint equations, so that it holds two orbiting black holes',
        'Choose the lapse and shift for the next step',
        'Use the evolution equations to advance to the next slice',
        'Repeat thousands of times, tracking the horizons, until the merged hole has settled',
        'Measure the waves far from the holes, and compare them with detector data through waveform models',
      ],
      hints: ['Nothing can be evolved before a valid starting slice exists.', 'The lapse and shift must be chosen before each step; the waves are read off at the end.'],
      teach: 'A simulation solves the constraints once, then repeatedly chooses a gauge (lapse and shift) and evolves.',
      explain: 'Initial data first (constraints), then the loop of gauge choice and evolution, with horizons tracked along the way; finally the waveform is extracted far away and used to build or test the models that search the data.',
      visual: slicing({ A: 0.35, caption: 'Six slices of a sketched simulation: the first is built to satisfy the constraints; each later one comes from evolving the one before. Teaching model in one space dimension.' }),
    }),
    num({
      id: 'river', difficulty: 2,
      gen(r) {
        const k = r.pick([4, 9, 2.25, 1]), x = 1 / Math.sqrt(k);
        return {
          prompt: t`One exact way to slice the spacetime of a non-spinning black hole (Painlevé–Gullstrand slices) has lapse $\alpha = 1$ and shift $\beta = c\sqrt{r_s/r}$ — the Newtonian escape speed. In the "river" picture, a teaching model, space flows inward at this speed. What fraction of $c$ is it at $r = ${k}\,r_s$?`,
          answer: x, tol: { rel: 0.005 },
          errors: k === 1 ? [] : [{ value: 1 / k, feedback: 'Take the square root: β = c√(rₛ/r).' }, { value: Math.sqrt(k), feedback: 'Upside down: rₛ/r, not r/rₛ.' }],
          hints: [t`$\beta/c = \sqrt{r_s/r} = \sqrt{1/${k}}$.`],
          teach: 'In Painlevé–Gullstrand slicing the shift equals the escape speed, and it reaches c at the horizon.',
          explain: t`$\sqrt{1/${k}} = ${sci(x, 3)}$${k === 1 ? ': at the horizon space "flows" inward at c, so light aimed straight outward stands still — and inside, it is carried in' : ''}. The slicing and its numbers are exact; the flowing-river language is only a picture.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 10], y: [0, 1.6], xlabel: 'r / rₛ', ylabel: 'shift β / c',
              curves: [{ fn: 'sqrt(1/x)', domain: [0.4, 10], color: 'accent' }],
              vlines: [{ x: 1, label: 'horizon', color: 'bad' }],
              hlines: [{ y: 1, label: 'speed of light' }],
            },
            caption: 'The shift of Painlevé–Gullstrand slices, √(rₛ/r), against r in units of the Schwarzschild radius.',
          },
        };
      },
    }),
    num({
      id: 'qnm-f', difficulty: 2,
      gen(r) {
        const m = r.pick([10, 30, 62, 150]), x = ringdown(m).f;
        return {
          prompt: t`A merger leaves a black hole of ${m} solar masses. Treating it as non-spinning, its fundamental ringing has angular frequency $\omega = ${QNM22[0]}\,c^3/(GM)$. What is the ringing frequency $f$, in hertz? ($GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s)`,
          answer: x, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: x * 2 * Math.PI, feedback: 'That is ω in rad/s. Divide by 2π to get cycles per second.' }],
          hints: [t`$GM/c^3 = ${m}\times${sci(T_SUN, 4)}$ s $= ${sci(m * T_SUN)}$ s.`, t`$f = ${QNM22[0]}/(2\pi\times${sci(m * T_SUN)}\ \text{s})$.`],
          teach: 'A black hole rings at a frequency inversely proportional to its mass: heavier holes ring lower.',
          explain: t`$f = ${QNM22[0]}/(2\pi\times${sci(m * T_SUN)}) = ${sci(x)}$ Hz. ${m <= 62 ? 'Right in LIGO’s band.' : 'Heavier holes ring lower, toward the bottom of LIGO’s band.'} A spinning remnant rings higher.`,
          visual: ringPic,
        };
      },
    }),
    num({
      id: 'qnm-tau', difficulty: 2,
      gen(r) {
        const m = r.pick([10, 30, 62, 150]), x = ringdown(m).tau;
        return {
          prompt: t`The ringing of a ${m}-solar-mass non-spinning black hole dies away as $e^{-t/\tau}$ with $\tau = (GM/c^3)/${QNM22[1]}$. What is $\tau$? ($GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s)`,
          answer: x, units: 's', tol: { rel: 0.01 },
          errors: [{ value: m * T_SUN * QNM22[1], feedback: `Divide by ${QNM22[1]}; do not multiply.` }],
          hints: [t`$GM/c^3 = ${sci(m * T_SUN)}$ s; divide by ${QNM22[1]}.`],
          teach: 'Black-hole ringing dies within a cycle or so: τ ≈ 11 GM/c³.',
          explain: t`$\tau = ${sci(m * T_SUN)}/${QNM22[1]} = ${sci(x)}$ s — ${sci(x * 1e3, 2)} ms. Measuring both the frequency and the damping of a ringdown weighs the final black hole and tests whether it is a Kerr black hole.`,
          visual: ringPic,
        };
      },
    }),
    mcq({
      id: 'constraints', difficulty: 2,
      prompt: 'What are the constraint equations of numerical relativity?',
      choices: [
        'Conditions that the data on every slice must satisfy, like Gauss’s law for an electric field; numerical error makes them drift, and codes must keep that drift small',
        'Optional extra equations that make a simulation more accurate',
        'The equations that move each slice forward in time',
        'Limits on how large the computer grid may be',
      ],
      answer: 0,
      why: {
        1: 'They are not optional: data that violate them do not describe any spacetime that obeys Einstein’s equations.',
        2: 'Those are the evolution equations; the constraints contain no time derivatives.',
        3: 'They are part of Einstein’s equations, not of the computer.',
      },
      hints: ['In electromagnetism, Gauss’s law ∇·E = ρ/ε₀ must hold at every instant. Which of Einstein’s equations play that role?'],
      teach: 'Four of Einstein’s ten equations are constraints on each slice; the other six evolve it.',
      explain: 'Of the ten field equations, four contain no second time derivatives: they constrain what a slice may look like (the Hamiltonian and momentum constraints). The other six evolve it. Exact evolution would keep the constraints satisfied; numerical error does not, and a violation that grows looks like physics but is not — monitoring it is how simulations are checked.',
      visual: slicing({ A: 0.5, caption: 'A sketch of slices of spacetime. Each slice must satisfy the constraints; the evolution equations take one slice to the next. Teaching model in one space dimension.' }),
    }),
    mcq({
      id: 'year-2005', difficulty: 2,
      prompt: 'Binary-black-hole simulations crashed for decades. What changed in 2005?',
      choices: [
        'New formulations and gauge choices: Pretorius (special coordinates, damping of constraint errors, cutting out the holes’ interiors) and two groups with “moving punctures” evolved orbiting black holes stably through merger',
        'Gravitational waves were detected for the first time, showing what the simulations should produce',
        'Roy Kerr found the exact solution for a spinning black hole',
        'Computers became fast enough; the equations themselves needed no new tricks',
      ],
      answer: 0,
      why: {
        1: 'The first detection, GW150914, came in 2015 — and it was compared with simulations that already existed.',
        2: 'That was 1963, and it describes a single settled black hole, not a merger.',
        3: 'Faster computers helped, but the codes crashed because of how the equations and coordinates were written — and that is what was fixed.',
      },
      hints: ['Look at the timeline: what came first, the simulations or the detection?'],
      teach: 'The 2005 breakthroughs were in how the equations and coordinates are written, not only in computing power.',
      explain: 'Pretorius’s generalized-harmonic code and the moving-puncture codes of Campanelli et al. and Baker et al. (both using the BSSN formulation) solved the stability problems. Ten years later, simulated waveforms were ready when GW150914 arrived.',
      visual: {
        type: 'graph',
        params: {
          x: [1905, 2062], y: [-1.9, 1.5], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['1910 + 120t', '0'], t: [0, 1], color: 'ink3', width: 1.6 }],
          points: [[1916, 'waves predicted', 0.7], [1963, 'Kerr’s solution', -0.7], [1974, 'Hulse–Taylor pulsar', 0.7], [2005, 'stable merger simulations', -0.7], [2015, 'GW150914 detected', 0.7], [2025, 'GW250114', -1.4]]
            .flatMap(([yr, label, y]) => [{ x: yr, y: 0, color: yr === 2005 ? 'gold' : 'accent', r: 5 }, { x: yr - 3, y, r: 0.5, color: yr === 2005 ? 'gold' : 'ink2', label: `${yr} ${label}` }]),
        },
        caption: 'A timeline of gravitational waves and black-hole simulations.',
      },
    }),
    mcq({
      id: 'templates', difficulty: 2,
      prompt: 'How do LIGO, Virgo and KAGRA use numerical relativity?',
      choices: [
        'Simulated waveforms calibrate fast analytic waveform models and train “surrogate” models; those are compared with the data to find signals and measure masses and spins',
        'A full simulation is run for every candidate event before it is accepted as real',
        'Not at all: post-Newtonian formulas describe the whole signal, merger included',
        'Only to make animations for the public',
      ],
      answer: 0,
      why: {
        1: 'Each simulation takes weeks to months of supercomputer time — far too slow to run per event. That is why fast models are built from them.',
        2: 'Post-Newtonian formulas fail near merger; the merger part of every model comes from simulations, directly or through calibration.',
        3: 'The animations are a by-product; the waveforms are the science.',
      },
      hints: ['How long would a full simulation take, compared with how often candidate signals arrive?'],
      teach: 'Detectors compare data with fast waveform models whose merger part is calibrated to, or trained on, numerical-relativity simulations.',
      explain: 'Searches match the data against large banks of model waveforms, and parameter estimation compares millions of them with each event. Those models are analytic families calibrated to simulations, or surrogates trained directly on simulation catalogues (the SXS catalogue held 3756 simulations in 2025).',
      visual: chirp('The inspiral is well described by formulas; the merger and ringdown (shaded) come from simulations.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-qnm', difficulty: 2,
      gen(r) {
        const m = r.pick([20, 45, 80]), x = ringdown(m).f;
        return {
          prompt: t`What is the fundamental ringing frequency $f = ${QNM22[0]}\,c^3/(2\pi GM)$ of a ${m}-solar-mass non-spinning black hole? ($GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s)`,
          answer: x, units: 'Hz', tol: { rel: 0.01 },
          hints: ['Find GM/c³ for this mass first.'],
          teach: 'Ringdown frequency scales as 1/M.',
          explain: t`$f = ${QNM22[0]}/(2\pi\times${sci(m * T_SUN)}\ \text{s}) = ${sci(x)}$ Hz.`,
          visual: ringPic,
        };
      },
    }),
    mcq({
      id: 'cp-lapse', difficulty: 2,
      prompt: 'Simulations drive the lapse toward zero near each black hole. Why?',
      choices: [
        'So that almost no proper time passes there between successive slices: the slices stop short of the singularity while the rest of spacetime keeps evolving',
        'To hold the black holes still on the grid',
        'Because time really stops at the horizon',
        'To save computer memory',
      ],
      answer: 0,
      why: {
        1: 'Moving or holding the holes is the shift’s job; with “moving punctures” they travel across the grid.',
        2: 'An infalling observer’s clock runs normally at the horizon. The small lapse is a choice of slicing, not a fact about time there.',
        3: 'The lapse is about which slices are computed, not about storage.',
      },
      hints: ['What would happen to a simulation whose slices reached the singularity?'],
      teach: 'A collapsing lapse keeps the slices away from singularities — a choice of coordinates, not physics.',
      explain: 'Reaching the singularity would give infinite values and crash the code. With the lapse near zero inside, the slices there hardly advance (“singularity avoidance”), while outside they march on and carry the waves away. A different slicing would show the same spacetime.',
      visual: slicing({ A: 0.08, caption: 'Slices with the lapse driven nearly to zero at the black hole: they pile up there. Teaching model in one space dimension.' }),
    }),
    num({
      id: 'cp-lisa', difficulty: 3, transfer: true,
      gen(r) {
        const [m, txt] = r.pick([[1e6, t`10^{6}`], [4.3e6, t`4.3\times10^{6}`], [1e5, t`10^{5}`]]);
        const x = ringdown(m).f;
        return {
          prompt: t`The space detector LISA, planned for launch around 2035, will listen at much lower frequencies than LIGO. When two supermassive black holes merge into one of $${txt}$ solar masses (treated as non-spinning), at what frequency does it ring? Use $f = ${QNM22[0]}\,c^3/(2\pi GM)$ and $GM_\odot/c^3 = ${sci(T_SUN, 4)}$ s.`,
          answer: x, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: x * 2 * Math.PI, feedback: 'Divide by 2π: that is the angular frequency.' }],
          hints: [t`$GM/c^3 = ${txt}\times${sci(T_SUN, 4)}$ s $= ${sci(m * T_SUN)}$ s.`, t`$f = ${QNM22[0]}/(2\pi\times${sci(m * T_SUN)})$; millihertz are thousandths of a hertz.`],
          teach: 'Ringdown frequency falls as 1/M: supermassive mergers ring in millihertz, LISA’s band.',
          explain: t`$f = ${sci(x)}$ Hz $= ${sci(x * 1e3)}$ mHz — far below LIGO’s band, which starts at about 10 Hz, and squarely in LISA’s (roughly 0.1 mHz to 0.1 Hz). Those waveforms, too, will come from numerical relativity.`,
          visual: ringPic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Pretorius, “Evolution of binary black-hole spacetimes”, Phys. Rev. Lett. 95, 121101 (2005)', url: 'https://arxiv.org/abs/gr-qc/0507014' },
    { label: 'Campanelli, Lousto, Marronetti & Zlochower, moving punctures (2006)', url: 'https://arxiv.org/abs/gr-qc/0511048' },
    { label: 'Baker, Centrella, Choi, Koppitz & van Meter, gravitational waves from merging black holes (2006)', url: 'https://arxiv.org/abs/gr-qc/0511103' },
    { label: 'Centrella, Baker, Kelly & van Meter, review in Rev. Mod. Phys. (2010)', url: 'https://arxiv.org/abs/1010.5260' },
    { label: 'SXS collaboration, third binary-black-hole catalog (2025)', url: 'https://arxiv.org/abs/2505.13378' },
  ],
});
