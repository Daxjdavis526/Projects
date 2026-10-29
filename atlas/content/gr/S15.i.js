// Ricci curvature: how a ball of dust changes volume — Intuition Mode
// concept lesson. Baez & Bunn's reading of Einstein's equation: a small ball
// of freely falling test particles, released at rest, starts to change volume
// at V̈/V = −4πG(ρ + 3p/c²). That volume-changing part of curvature is the
// Ricci curvature; it is zero in vacuum (where tides, the shape-changing Weyl
// part, survive) and is fixed point by point by the matter there — pressure
// included. Inside a uniform body the ball shrinks without changing shape.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, sci, round, ball } from './_curvature.js';

const t = String.raw;

const vdd = (rho, p = 0) => -4 * Math.PI * G * (rho + (3 * p) / C ** 2);   // V̈/V at release, s⁻²
const omega = (rho) => Math.sqrt((4 * Math.PI * G * rho) / 3);               // per-axis rate inside uniform matter, s⁻¹
const RHO_E = 5514;                                                          // Earth's mean density, kg/m³
const W_E = omega(RHO_E), QUARTER_E = Math.PI / 2 / W_E;

// a ball of test grains shrinking inside uniform matter: radius against ωt (no numbers that give answers away)
const cosineGraph = {
  type: 'graph',
  params: {
    x: [0, 3.3], y: [-1.15, 1.15], xlabel: 'ωt', ylabel: 'radius ÷ starting radius', xticks: 6,
    curves: [{ fn: 'cos(x)', color: 'accent', width: 2.6, domain: [0, 1.5708] }, { fn: 'cos(x)', color: 'accent', width: 1.4, dash: true, domain: [1.5708, 3.3] }],
    hlines: [{ y: 0, color: 'ink3' }],
  },
  caption: t`Inside uniform matter every axis of the ball follows $\cos(\omega t)$, with $\omega = \sqrt{4\pi G\rho/3}$; the grains meet at the centre and pass through (dashed).`,
};

// the vacuum around the Sun: planets orbit, so gravity is there — and Ricci curvature is zero
const sunVacuum = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['0.25 + 1.75cos(t)', '1.3sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }],
    points: [
      { x: 0, y: 0, color: 'gold', r: 13 }, { x: 0.1, y: -0.32, color: 'gold', r: 0.5, label: 'Sun' },
      { x: 2.0, y: 0, color: 'accent', r: 5, label: 'planet' },
      { x: -0.9, y: 0.95, color: 'accent2', r: 4, label: 'a ball of dust here' },
    ],
  },
  caption: 'Empty space around the Sun, where planets orbit (not to scale). What does a zero Ricci curvature say about a small ball of dust released there?',
};

export default lesson({
  id: 'gr.S15.i',
  kind: 'concept',
  title: 'Ricci curvature: how a ball of dust changes volume',
  minutes: 7, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`Release a small ball of dust at rest and watch only its **volume**. In empty space — even right beside a planet or a black hole — the volume starts out unchanged: the tidal stretch and the two squeezes cancel (step 14). With **matter** inside the ball, it starts to shrink, and Einstein's equation, as Baez and Bunn read it, says exactly how fast — the equation above.

The part of curvature that changes volumes is the **Ricci curvature**. It is fixed, point by point, by the matter and energy at that point: zero in vacuum, where the shape-changing part (tides, gravitational waves) can still be large. And look at the pressure term: **pressure gravitates**, not only mass.`,
  equation: t`\left.\frac{\ddot V}{V}\right|_{t=0} = -4\pi G\left(\rho + \frac{3p}{c^2}\right)`,
  symbols: [
    { tex: 'V', text: 'the volume of a small ball of test particles, all at rest relative to one another at the start and then falling freely, in m³' },
    { tex: '\\ddot V', text: 'its second time derivative, in m³/s²: how fast its rate of change of volume grows. Negative means it starts to shrink' },
    { tex: 't = 0', text: 'the moment of release: the equation fixes how the ball *starts* to change' },
    { tex: '\\rho', text: 'the density of mass–energy at the ball, in kg/m³ (energy counts as $E/c^2$)' },
    { tex: 'p', text: 'the pressure there, in Pa, taken the same in every direction (in general, the sum of the three pressures replaces $3p$)' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s; $-\\ddot V/(Vc^2)$ is the Ricci curvature in the ball’s own frame, in m⁻²' },
  ],
  why: 'This one line is Einstein’s equation in disguise: demanded of every small ball, moving in every way, it is the whole set of field equations (step 18) — and for slow matter it is Newton’s law of gravity (step 19).',
  visual: {
    type: 'gr-dustball',
    title: 'Shape change or volume change?',
    lead: t`Switch between the two places, press **Play**, and watch the end-on view and the volume graph.`,
    tasks: [
      'Empty space: the ball changes shape, and the volume graph starts out perfectly flat.',
      'Inside matter: the ball shrinks the same way in every direction — no change of shape — and the volume graph bends down from the very start.',
      'Inside matter, raise the density from water (1000 kg/m³) to a neutron star’s core: the time scale falls from half an hour to under a tenth of a millisecond.',
    ],
    params: { modes: ['tides', 'matter'], mode: 'matter', body: 'earth', rho: 1000, t: 0.6 },
  },
  example: {
    prompt: t`Imagine ghostly test grains that feel only gravity and pass freely through rock. A small ball of them is released at rest deep inside a planet of uniform density ${RHO_E} kg/m³ (Earth’s mean density). At what rate does its volume start to change? Does its shape change? How long until it has shrunk to a point?`,
    visual: ball({ mode: 'matter', rho: RHO_E, t: 0.6 }, 'Inside uniform matter the ball shrinks the same way in every direction: no change of shape (side and end-on views agree), and the volume falls from the start.'),
    steps: [
      { label: 'The volume', text: t`The grains are dust ($p = 0$; the rock’s own pressure adds less than a part in a billion here), so $\ddot V/V = -4\pi G\rho = -4\pi\times6.674\times10^{-11}\times${RHO_E} = ${sci(vdd(RHO_E))}\ \text{s}^{-2}$.` },
      { label: 'The shape', text: t`Inside a uniform body there are no tides: gravity grows in proportion to the distance from the centre, the same way in every direction. So each of the three axes gets one third of the rate, $\ddot\xi/\xi = -4\pi G\rho/3$, and the ball stays round.` },
      { label: 'Each axis', text: t`$\ddot\xi = -\omega^2\xi$ is simple harmonic motion with $\omega = \sqrt{4\pi G\rho/3} = ${sci(W_E)}\ \text{s}^{-1}$: every grain swings through the ball’s centre.` },
      { label: 'Shrunk to a point', text: t`A quarter period: $\dfrac{\pi}{2\omega} = ${sci(QUARTER_E)}$ s $\approx ${round(QUARTER_E / 60, 3)}$ minutes, when all the grains meet at once.` },
      { label: 'Sense check', text: t`The full period, $2\pi/\omega = ${round((2 * Math.PI) / W_E / 60, 3)}$ min, is the period of a satellite skimming a uniform Earth’s surface, and of the famous “gravity train” dropped through a tunnel: the same physics. (The real Earth is denser toward its core, so this is a model.)` },
    ],
    answer: t`$\ddot V/V = ${sci(vdd(RHO_E))}\ \text{s}^{-2}$; the ball keeps its shape and shrinks to a point after about ${Math.round(QUARTER_E / 60)} minutes.`,
  },
  practice: [
    mcq({
      id: 'vacuum', difficulty: 1,
      prompt: 'A small ball of dust is released at rest in empty space 1000 km from a 10-solar-mass black hole, where gravity is ferocious. What is its volume doing at the moment of release?',
      visual: ball({ mode: 'tides', body: 'bh', r: 34, t: 0.5, views: 'side' }, 'The ball near the black hole (left), shortly after release: stretched and squeezed.'),
      choices: [
        'Not changing: there is no matter inside the ball, so V̈/V = 0 — only its shape changes',
        'Shrinking fast, because the black hole’s gravity is so strong there',
        'Growing, because the stretch toward the hole is so large',
        'Shrinking at a rate set by the black hole’s average density',
      ],
      answer: 0,
      why: {
        1: 'Strong gravity shows up as strong tides — a change of shape. The volume responds only to matter at the ball itself.',
        2: 'The stretch along the line is exactly matched by the two squeezes across it, however strong they are.',
        3: 'The black hole’s mass is not at the ball. Only the matter where the ball is enters V̈/V; distant matter acts through tides.',
      },
      hints: ['Which quantities appear on the right of the equation, and where are they measured?'],
      teach: 'In vacuum the Ricci curvature is zero: however strong the tides, a small falling ball changes shape but not, at first, volume.',
      explain: t`The right side, $-4\pi G(\rho + 3p/c^2)$, uses the density and pressure *at the ball*, and there is none: $\ddot V/V = 0$. The black hole’s gravity is still there, as tides: the ball is stretched along the line by $2GM/r^3$ and squeezed across by $GM/r^3$ each way.`,
    }),
    num({
      id: 'rate', difficulty: 2,
      gen(r) {
        const [what, rho] = r.pick([['water (1000 kg/m³)', 1000], ['granite (2700 kg/m³)', 2700], ['iron (7870 kg/m³)', 7870], ['lead (11 340 kg/m³)', 11340]]);
        const v = vdd(rho);
        return {
          prompt: t`A small ball of ghostly test grains — they feel only gravity — is released at rest inside a large body of ${what}. Pressure is negligible. What is $\ddot V/V$ at the moment of release? Give it with its sign, in s⁻².`,
          answer: v, units: 's^-2', tol: { rel: 0.01 },
          errors: [
            { value: v / 3, feedback: 'That is the rate for one axis, −4πGρ/3. The volume collects all three axes: −4πGρ.' },
            { value: -G * rho, feedback: 'Keep the 4π: V̈/V = −4πGρ.' },
          ],
          hints: [t`Use $\ddot V/V = -4\pi G\rho$ with $p = 0$.`, t`$-4\pi\times6.674\times10^{-11}\times${rho}$.`],
          teach: 'Inside matter a falling ball starts to shrink at V̈/V = −4πGρ: matter at a point fixes the Ricci curvature there.',
          explain: t`$\ddot V/V = -4\pi G\rho = -4\pi\times6.674\times10^{-11}\times${rho} = ${sci(v)}\ \text{s}^{-2}$. As curvature, $-\ddot V/(Vc^2) = ${sci(-v / C ** 2)}\ \text{m}^{-2}$ — tiny, because $c^2$ is huge.`,
          visual: ball({ mode: 'matter', rho, t: 0.55 }, 'A ball of test grains inside uniform matter: the same shrink in every direction.'),
        };
      },
    }),
    num({
      id: 'collapse', difficulty: 3,
      gen(r) {
        const [what, rho] = r.pick([['the Moon', 3344], ['Mars', 3934], ['Jupiter', 1326], ['Mercury', 5427]]);
        const w = omega(rho), tq = Math.PI / 2 / w;
        return {
          prompt: t`Treat ${what} as a ball of uniform density ${rho} kg/m³ (its mean density). A small ball of ghostly test grains is released at rest inside it. Each axis of the ball obeys $\ddot\xi = -(4\pi G\rho/3)\,\xi$. How many minutes until the ball has shrunk to a point?`,
          answer: tq / 60, units: 'min', tol: { rel: 0.01 },
          errors: [
            { value: Math.PI / 2 / Math.sqrt(4 * Math.PI * G * rho) / 60, feedback: 'Each axis gets one third of 4πGρ: ω = √(4πGρ/3).' },
            { value: (2 * Math.PI) / w / 60, feedback: 'That is a full oscillation. The grains first meet at the centre after a quarter of it.' },
            { value: Math.PI / w / 60, feedback: 'That is half an oscillation, when the ball is back to full size on the other side. A point is reached after a quarter.' },
          ],
          hints: [t`$\ddot\xi = -\omega^2\xi$ with $\omega = \sqrt{4\pi G\rho/3}$: simple harmonic motion, $\xi = \xi_0\cos(\omega t)$.`, t`$\xi$ first reaches zero when $\omega t = \pi/2$.`, t`$\omega = \sqrt{4\pi\times6.674\times10^{-11}\times${rho}/3} = ${sci(w)}\ \text{s}^{-1}$; then $t = \pi/(2\omega)$.`],
          teach: 'Inside uniform matter every axis of a falling ball swings at ω = √(4πGρ/3), so it shrinks to a point after a quarter period, π/(2ω).',
          explain: t`$\omega = ${sci(w)}\ \text{s}^{-1}$, so $t = \pi/(2\omega) = ${sci(tq)}$ s $= ${sci(tq / 60)}$ min. The time depends only on the density — the mark of a volume change fixed by the local matter.`,
          visual: cosineGraph,
        };
      },
    }),
    mcq({
      id: 'ricci-zero', difficulty: 2,
      prompt: 'Outside the Sun, in the empty space where the planets orbit, the Ricci curvature is zero. Which statement follows?',
      visual: sunVacuum,
      choices: [
        'A small ball of dust released there changes shape but not, at first, volume — gravity is still present, as tides',
        'There is no gravity there: zero curvature means no gravity',
        'Spacetime there is flat',
        'The planets there move in straight lines at constant speed',
      ],
      answer: 0,
      why: {
        1: 'Zero Ricci curvature is not zero curvature. The planets’ orbits and the ocean tides show gravity is very much there.',
        2: 'Flat means every part of the curvature is zero. Outside the Sun the tidal (shape-changing) part is not — light bends and Mercury’s orbit precesses there.',
        3: 'They orbit the Sun. Their free fall follows the curved spacetime, whose curvature there is all of the shape-changing kind.',
      },
      hints: ['Ricci curvature is only the volume-changing part of curvature.', 'What does a falling ball of dust do in empty space near a mass (step 14)?'],
      teach: 'Ricci = 0 means a falling ball keeps its volume, not that there is no gravity: in vacuum the curvature that remains is tidal.',
      explain: 'The Ricci curvature measures only the volume change of a falling ball, and Einstein’s equation sets it to zero wherever there is no matter. The rest of the curvature — tides, which stretch and squeeze but keep the volume — is untouched, and that is what bends the planets’ paths.',
    }),
    mcq({
      id: 'pressure', difficulty: 2,
      prompt: t`Two balls of test grains are released at rest: one inside a gas of light (radiation, whose pressure is $p = \rho c^2/3$), the other inside dust ($p = 0$) of the same energy density $\rho$. How do their starting shrink rates compare?`,
      visual: ball({ mode: 'matter', rho: 1000, w: 1 / 3, t: 0.55 }, 'A ball of test grains inside a gas of light. Compare it with one inside dust of the same energy density.'),
      choices: [
        'The ball in light shrinks twice as fast: ρ + 3p/c² = ρ + ρ = 2ρ',
        'The same: only energy density gravitates',
        'The ball in dust shrinks faster: the light’s pressure pushes outward and resists the shrinking',
        'The ball in light shrinks 4/3 as fast: ρ + p/c²',
      ],
      answer: 0,
      why: {
        1: 'Pressure gravitates too: it enters as 3p/c², once for each of the three directions.',
        2: 'The test grains feel only gravity, and a uniform pressure pushes on nothing. Pressure *differences* push matter; pressure itself adds to the source of gravity.',
        3: 'Each of the three pressures counts: 3p/c², not p/c².',
      },
      hints: [t`Put $p = \rho c^2/3$ into $\rho + 3p/c^2$.`],
      teach: 'Pressure gravitates: the source of volume shrinking is ρ + 3p/c², so a gas of light focuses twice as strongly as dust of the same energy density.',
      explain: t`$\rho + 3p/c^2 = \rho + 3(\rho c^2/3)/c^2 = 2\rho$. In the early universe, when light dominated, this is why it slowed the expansion twice as hard as matter would have.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sun', difficulty: 2, transfer: true,
      gen(r) {
        const rho = r.pick([1.5e5, 1.6e5, 1.4e5]);
        const v = vdd(rho);
        return {
          prompt: t`At the centre of the Sun the density is about $${sci(rho, 2)}$ kg/m³; there the pressure term $3p/c^2$ adds only about 6 parts per million to $\rho$. For a small ball of ghostly test grains released at rest there, what is $\ddot V/V$, in s⁻², with its sign?`,
          answer: v, units: 's^-2', tol: { rel: 0.01 },
          errors: [{ value: v / 3, feedback: 'That is one axis. The volume collects all three: −4πGρ.' }],
          hints: ['V̈/V = −4πG(ρ + 3p/c²), with the pressure negligible.'],
          teach: 'The rate at which a ball’s volume starts to change is fixed by the matter at the ball alone: −4πG(ρ + 3p/c²).',
          explain: t`$\ddot V/V = -4\pi\times6.674\times10^{-11}\times${sci(rho, 2)} = ${sci(v)}\ \text{s}^{-2}$: a time scale of $1/\sqrt{|\ddot V/V|} = ${sci(1 / Math.sqrt(-v), 2)}$ s. (The Sun’s real plasma does not fall: pressure *differences* hold it up — but they do nothing to grains that feel only gravity.)`,
          visual: ball({ mode: 'matter', rho, t: 0.55 }, 'Test grains at the centre of the Sun, drawn as at the centre of uniform matter.'),
        };
      },
    }),
    multi({
      id: 'cp-where', difficulty: 2,
      prompt: 'In which of these places is the Ricci curvature zero? Select every one that applies.',
      choices: [
        'In the empty space between the Earth and the Moon',
        'In a LIGO arm’s vacuum as a gravitational wave passes',
        'Just outside a black hole’s horizon',
        'Inside the Sun',
        'Inside a cloud of interstellar gas',
      ],
      answer: [0, 1, 2],
      why: { 3: 'There is matter there, so a falling ball would start to shrink: the Ricci curvature is not zero.', 4: 'Even thin gas has density; the Ricci curvature is tiny there, but not zero.' },
      hints: ['Ricci curvature is fixed by the matter and energy at the point itself.', 'Strong gravity and waves are tidal; they need no matter where they are felt.'],
      teach: 'The Ricci curvature is zero wherever there is no matter or energy, however strong the tides there.',
      explain: 'Einstein’s equation ties the Ricci curvature at a point to the matter and energy at that point. In vacuum — between Earth and Moon, in LIGO’s arms, outside a horizon — it vanishes, while tides and gravitational waves (the other part of curvature) carry on. Inside the Sun or a gas cloud there is matter, so it does not.',
    }),
    mcq({
      id: 'cp-neutron', difficulty: 3,
      prompt: t`In a neutron star’s core, suppose the pressure is $p = 0.2\,\rho c^2$. Compared with dust of the same density, how much faster does a ball of test grains there start to shrink?`,
      visual: ball({ mode: 'matter', rho: 8e17, w: 0.2, t: 0.55 }, 'A ball of test grains in a neutron star’s core, drawn as at the centre of uniform matter.'),
      choices: ['1.6 times as fast', '1.2 times as fast', 'The same: pressure holds the star up instead', '0.4 times as fast'],
      answer: 0,
      why: {
        1: 'Each of the three directions contributes its pressure: 3p/c², not p/c².',
        2: 'Pressure differences hold the star up; pressure itself still adds to the source of gravity.',
        3: 'Pressure adds to the source; it does not subtract from it (only negative pressure would).',
      },
      hints: [t`Source: $\rho + 3p/c^2 = \rho(1 + 3\times0.2)$.`, 'The shrink rate is proportional to the source.'],
      teach: 'In a neutron star pressure adds a large share to the source of gravity, ρ + 3p/c² — one reason heavy neutron stars collapse.',
      explain: t`$\rho + 3(0.2\rho c^2)/c^2 = 1.6\rho$, so $\ddot V/V$ is 1.6 times larger. The harder a neutron star’s matter pushes back, the more its pressure adds to its own gravity — a feedback that caps neutron-star masses at a little over two solar masses.`,
    }),
  ],
  sources: [
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 3–4', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
