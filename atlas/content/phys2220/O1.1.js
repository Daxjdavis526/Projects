// Reflection and refraction: the law of reflection, the refractive index
// n = c/v, Snell's law, what changes (speed, wavelength, direction) and what
// does not (frequency) at a boundary, apparent depth. Pictures from the
// optics-rays simulation (model/optics-rays.js, tested).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, apart, sind, asind, iface, surfacePic, bars, label, seg } from './_optics.js';

const t = String.raw;

/** A flat mirror seen edge-on, with a ray arriving at `a` degrees to its surface (the reflected ray not drawn). */
function mirrorEdge(a, caption) {
  const r = 2.4, c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
  const arc = { param: ['0.62*cos(t)', '0.62*sin(t)'], t: [+(Math.PI - (a * Math.PI) / 180).toFixed(5), +Math.PI.toFixed(5)], color: 'ink2', width: 1.4 };
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-3.2, 3.2], y: [-0.7, 2.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg([-3, 0], [3, 0], { color: 'ink', width: 4 }), ...Array.from({ length: 12 }, (_, i) => seg([-2.9 + i * 0.5, 0], [-3.1 + i * 0.5, -0.3], { color: 'ink3', width: 1 })),
        seg([0, -0.1], [0, 2.3], { color: 'ink3', width: 1.2, dash: true }), seg([-r * c, r * s], [0, 0], { color: 'gold', width: 2.6 }), arc],
      arrows: [{ from: [-r * c, r * s], to: [-r * c * 0.45, r * s * 0.45], color: 'gold' }],
      points: [label(-0.95, 0.22, `${a}°`, 'ink2'), label(0.08, 2.2, 'normal', 'ink3'), label(1.6, -0.48, 'mirror', 'ink2')],
    },
    caption,
  };
}

/** A wave crossing from air (left) into water (right) at one instant: same crests per second, shorter wavelength. */
function waveCross(n, caption) {
  const l1 = 1.6, l2 = +(1.6 / n).toFixed(4);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.2, 4.2], y: [-1.7, 1.9], axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '1.6', lower: '-1.45', from: 0, to: 4.2, color: 'accent', alpha: 0.18 }],
      curves: [{ fn: `sin(2*pi*x/${l1})`, domain: [-4.2, 0], color: 'bad', width: 2.4 }, { fn: `sin(2*pi*x/${l2})`, domain: [0, 4.2], color: 'bad', width: 2.4 }, seg([0, -1.45], [0, 1.6], { color: 'ink3', width: 1.4 })],
      points: [label(-3.9, 1.5, 'air', 'ink2'), label(0.25, 1.5, 'water', 'ink2')],
      arrows: [{ from: [-3.6, -1.3], to: [-2.4, -1.3], color: 'ink3', label: 'travelling →', labelDx: 6, labelDy: 0 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O1.1',
  title: 'Reflection and refraction',
  minutes: 12, difficulty: 2,
  intro: t`When light reaches the boundary between two transparent materials, part of it bounces back — **reflection**, leaving at the same angle it arrived at — and part crosses and changes direction: **refraction**. It bends because light travels more slowly in matter, at $v = c/n$, where $n$ is the material's **refractive index**. The angles obey Snell's law:

$$n_1\sin\theta_1 = n_2\sin\theta_2$$

Every lens, prism, optical fibre and camera in this module is designed with this one rule.`,
  symbols: [
    { tex: 'n_1,\\ n_2', text: 'the refractive indices on each side of the boundary, light coming from side 1. No units: 1.00 for air, 1.33 water, about 1.5 glass, 2.42 diamond' },
    { tex: '\\theta_1', text: 'the angle of incidence, measured from the **normal** — the line perpendicular to the surface — not from the surface itself' },
    { tex: '\\theta_2', text: 'the angle of refraction, also measured from the normal. The reflected ray leaves at $\\theta_1$ on the other side of the normal' },
    { tex: 'n = c/v', text: 'what the index means: how many times slower light travels in the material than in vacuum' },
    { tex: 'c', text: 'the speed of light in vacuum, $2.998\\times10^{8}$ m/s ($3.00\\times10^{8}$ m/s in these problems)' },
    { tex: 'v', text: 'the speed of light in the material, in m/s' },
  ],
  why: t`Snell's law sets how every lens focuses and why fibres guide light. It even reaches general relativity: in a weak gravitational field, the [bending of starlight](#/lesson/gr.S24.i) by the Sun can be pictured as refraction by an effective index $n \approx 1 + 2GM/(rc^2)$ — $M$ the Sun's mass, $r$ the distance from its centre, $G$ the gravitational constant — that grows near the mass.`,
  visual: {
    type: 'optics-rays',
    title: 'Light crossing a boundary',
    lead: t`A ray comes down from the upper left onto the boundary between two materials. Read the angles from the dashed **normal**. Drag the start of the ray (or use the slider), change the materials, and press **Play** to set the wavefronts moving.`,
    tasks: [
      t`Slide $\theta_1$ from 0° to 80°: $\theta_2$ grows too but stays smaller — light entering water bends toward the normal.`,
      t`Press **Play**: the end of each crest that reaches the water first slows down first, so the crest pivots. That pivot is refraction — no force acts on the light.`,
      t`Set $n_2 = 1.00$: the boundary vanishes — no bending, no reflection. Then try $n_2 = 2.42$ (diamond): the reflection gets brighter.`,
    ],
    params: { mode: 'interface', n1: 1, n2: 1.33, angle: 40, waves: true },
  },
  example: {
    prompt: t`A red laser beam (wavelength 633 nm in air) strikes still water at $40.0°$ from the normal. Find the angle of refraction, the beam's speed in the water, and its wavelength there. (Water: $n = 1.33$.)`,
    visual: iface({ n1: 1, n2: 1.33, angle: 40 }, 'The beam meeting the water: reflected (faint, about 2%) and refracted rays, angles from the normal.'),
    steps: [
      { label: 'Snell’s law', text: t`$\sin\theta_2 = \dfrac{n_1}{n_2}\sin\theta_1 = \dfrac{1.00}{1.33}\sin 40.0° = \dfrac{0.643}{1.33} = 0.483$, so $\theta_2 = 28.9°$.` },
      { label: 'Speed', text: t`$v = \dfrac{c}{n} = \dfrac{3.00\times10^{8}\ \text{m/s}}{1.33} = 2.26\times10^{8}$ m/s.` },
      { label: 'Wavelength', text: t`The frequency is set by the laser and cannot change at the boundary — crests cannot pile up or vanish there. With $v = f\lambda$, a lower speed means a shorter wavelength: $\lambda_\text{water} = \lambda/n = 633/1.33 = 476$ nm.` },
      { label: 'Sense check', text: t`Going into the slower medium ($n_2 > n_1$), the ray bends toward the normal: $28.9° < 40.0°$. ✓ A swimmer underwater still sees the beam red: colour goes with frequency, not wavelength.` },
    ],
    answer: t`$\theta_2 = 28.9°$, $v = 2.26\times10^{8}$ m/s, $\lambda = 476$ nm (the frequency is unchanged).`,
  },
  practice: [
    num({
      id: 'reflect-angle', difficulty: 1,
      gen(r) {
        const a = r.pick([20, 25, 35, 40, 55, 65]);
        return {
          prompt: t`A ray of light strikes a flat mirror at $${a}°$ to the mirror's **surface**. What is the angle of reflection, measured (as always) from the normal?`,
          answer: 90 - a, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: a, feedback: t`That is the angle to the surface. Optics measures angles from the normal, the line perpendicular to the surface: $90° - ${a}°$.` }],
          hints: ['First turn the angle into an angle from the normal: the normal is perpendicular to the mirror.', 'The law of reflection: the angle of reflection equals the angle of incidence, both measured from the normal.'],
          teach: 'The law of reflection: angle of reflection = angle of incidence, both measured from the normal.',
          explain: t`The angle of incidence is $90° - ${a}° = ${90 - a}°$ from the normal, so the ray leaves at $${90 - a}°$ from the normal on the other side — again $${a}°$ to the surface.`,
          visual: mirrorEdge(a, `A ray arriving at ${a}° to a flat mirror (seen edge-on). The reflected ray is what you are finding.`),
        };
      },
    }),
    num({
      id: 'snell-in', difficulty: 1,
      gen(r) {
        const [mat, n] = r.pick([['water', 1.33], ['glass', 1.5], ['fused silica', 1.46], ['diamond', 2.42]]);
        const th = r.pick([20, 30, 45, 60, 70]);
        const t2 = asind(sind(th) / n);
        return {
          prompt: t`Light in air strikes a flat surface of ${mat} ($n = ${n.toFixed(2)}$) at $${th}°$ from the normal. At what angle from the normal does it travel inside the ${mat}?`,
          answer: t2, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: th / n, feedback: t`Snell's law relates the *sines* of the angles: $\sin\theta_2 = \sin\theta_1/n$, then take the inverse sine.` }, { value: th, feedback: 'The ray bends at the boundary; only a ray along the normal goes straight on.' }], t2),
          hints: [t`Snell's law with $n_1 = 1.00$: $\sin\theta_2 = \sin\theta_1 / n_2$.`, t`$\sin ${th}° = ${tn(sind(th), 4)}$; divide by $${n.toFixed(2)}$ and take the inverse sine.`],
          teach: t`Snell's law, $n_1\sin\theta_1 = n_2\sin\theta_2$, gives the new direction; both angles are measured from the normal.`,
          explain: t`$\sin\theta_2 = ${tn(sind(th), 4)}/${n.toFixed(2)} = ${tn(sind(th) / n, 4)}$, so $\theta_2 = ${tn(t2)}°$ — bent toward the normal, as light always is on entering a slower medium.`,
          visual: iface({ n1: 1, n2: n, angle: th, hide: ['refracted', 'theta2'] }, `Light meeting the ${mat}, angles measured from the dashed normal. The refracted ray is what you are finding.`),
        };
      },
    }),
    num({
      id: 'n-from-speed', difficulty: 1,
      gen(r) {
        const [mat, n] = r.pick([['ice', 1.31], ['ethanol', 1.36], ['crown glass', 1.52], ['flint glass', 1.62], ['sapphire', 1.77], ['diamond', 2.42]]);
        const v = +(3.0e8 / n).toPrecision(3), key = 3.0e8 / v;
        return {
          prompt: t`Light travels through ${mat} at $${tn(v)}$ m/s. What is the refractive index of ${mat}? (Take $c = 3.00\times10^{8}$ m/s.)`,
          answer: key, tol: { rel: 0.005 },
          errors: [{ value: v / 3.0e8, feedback: t`Upside down: $n = c/v$ is always at least 1, because light in matter is never faster than in vacuum.` }],
          hints: [t`The index compares the two speeds: $n = c/v$.`],
          teach: t`The refractive index says how many times slower light is in a material: $n = c/v$.`,
          explain: t`$n = c/v = (3.00\times10^{8})/(${tn(v)}) = ${tn(key)}$.`,
          visual: bars([['in vacuum: 3.00×10⁸ m/s', 3, 'gold'], [`in ${mat}: ${s3(v)} m/s`, v / 1e8, 'accent']], { caption: 'The two speeds, drawn to scale.' }),
        };
      },
    }),
    mcq({
      id: 'why-bend', difficulty: 2,
      prompt: 'Light slows down as it enters water, and bends toward the normal. What makes it change direction?',
      choices: [
        'The edge of each wavefront that reaches the water first slows down first, so the wavefront pivots — like a row of marchers wheeling as one end steps onto mud',
        'The water attracts the light with a force that pulls it toward the normal',
        'Light always takes the shortest path in distance, and the bent path is shorter',
        'Light speeds up when it enters water, and the extra speed turns it',
      ],
      answer: 0,
      why: {
        1: 'No force acts on the light at the surface. The bend is a wave effect: for a moment, neighbouring parts of one wavefront travel at different speeds.',
        2: 'The bent path is longer in distance. It is the path of least *time* (Fermat’s principle): it spends less of its length in the slow water.',
        3: t`Light is slower in water: $v = c/n = c/1.33$.`,
      },
      hints: ['Think of the wavefronts — the crests — not a single ray.', 'One end of a slanted crest enters the water before the other end does.'],
      teach: 'Refraction is a wave effect: the part of a wavefront that enters the slower medium first falls behind, so the front turns.',
      explain: 'A slanted crest reaches the boundary one end first. That end slows while the other end, still in air, keeps going fast, so the crest swings round until it is fully in the water. The ray, which is just the direction perpendicular to the crests, turns with it. Press Play in the Explore picture to watch it.',
      visual: iface({ n1: 1, n2: 1.33, angle: 50, waves: true, hide: ['reflected'] }, 'Crests of a light wave (yellow lines, spacing hugely exaggerated) crossing from air into water.'),
    }),
    mcq({
      id: 'what-stays', difficulty: 2,
      prompt: 'A red laser beam (633 nm in air) passes from air into water. Which of these stays the same?',
      choices: ['Its frequency', 'Its wavelength', 'Its speed', 'Its direction, whatever the angle of incidence'],
      answer: 0,
      why: {
        1: t`The wavelength shrinks to $633/1.33 = 476$ nm: the crests bunch up because they travel more slowly.`,
        2: t`The speed drops to $c/1.33 = 2.26\times10^{8}$ m/s.`,
        3: 'The direction changes unless the beam arrives exactly along the normal.',
      },
      hints: ['What would happen at the boundary if crests arrived faster than they left?', t`Use $v = f\lambda$: if $v$ falls and $f$ is fixed by the source, what must happen to $\lambda$?`],
      teach: 'At a boundary the frequency stays fixed; the speed and the wavelength both fall by the factor n.',
      explain: t`Every crest that arrives at the boundary must leave it — they cannot pile up or vanish — so as many crests per second go out as come in: the frequency is fixed. Then $v = f\lambda$ means the wavelength shrinks in proportion to the speed, $\lambda/n$.`,
      visual: waveCross(1.33, 'A light wave crossing from air into water, drawn at one instant (wavelength hugely exaggerated). The crests bunch up; each still passes the boundary at the same rate.'),
    }),
    num({
      id: 'wavelength-in', difficulty: 2,
      gen(r) {
        const [what, l0] = r.pick([['a red helium–neon laser (633 nm in air)', 633], ['a green laser pointer (532 nm in air)', 532], ['a violet Blu-ray laser (405 nm in air)', 405]]);
        const [mat, n] = r.pick([['water', 1.33], ['glass', 1.5], ['diamond', 2.42]]);
        return {
          prompt: t`The light from ${what} enters ${mat} ($n = ${n.toFixed(2)}$). What is its wavelength inside the ${mat}, in nm?`,
          answer: l0 / n, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: l0 * n, feedback: t`The wavelength gets *shorter* in the slower medium: divide by $n$.` }, { value: l0, feedback: 'The frequency is unchanged, but the wavelength shrinks along with the speed.' }],
          hints: [t`The frequency stays fixed and $v = f\lambda$, so the wavelength shrinks by the same factor as the speed.`, t`$\lambda_\text{medium} = \lambda_\text{air}/n$.`],
          teach: t`Inside a material of index $n$, light's wavelength is $\lambda/n$; its frequency is unchanged.`,
          explain: t`$\lambda = ${l0}\ \text{nm}/${n.toFixed(2)} = ${tn(l0 / n)}$ nm. The light is no different in colour: an eye or a detector responds to the frequency.`,
          visual: iface({ n1: 1, n2: n, angle: 30, waves: true, hide: ['reflected', 'theta2'] }, `Crests crossing into ${mat}: their spacing shrinks by the factor n. (The drawn wavelength is hugely exaggerated.)`),
        };
      },
    }),
    num({
      id: 'pool-depth', difficulty: 2,
      gen(r) {
        const d = r.pick([1.2, 1.5, 2.0, 2.4, 3.0]);
        return {
          prompt: t`A coin lies on the bottom of a swimming pool ${d} m deep. Looking straight down at it from above, how deep does it **appear** to be? (Water: $n = 1.33$.)`,
          answer: d / 1.33, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d * 1.33, feedback: 'Things under water look shallower, not deeper: divide by n.' }, { value: d, feedback: 'The rays bend as they leave the water, so their backward extensions meet above the coin.' }],
          hints: ['The rays from the coin bend away from the normal as they leave the water; your eye traces them back in straight lines.', t`Looking straight down, the apparent depth is $d' = d/n$ (from Snell's law with small angles).`],
          teach: 'Looking straight down into water, things appear at d/n: about three-quarters of their true depth.',
          explain: t`$d' = d/n = ${d}/1.33 = ${tn(d / 1.33)}$ m. For small angles $\sin\theta \approx \tan\theta$, and Snell's law makes every ray from the coin seem to come from the same shallower point. Looking at a slant, the bottom seems shallower still — which is why pools are deeper than they look.`,
          visual: surfacePic({ dO: d, look: 0, hide: ['image'] }, `A coin ${d} m down and rays from it reaching an eye above, traced exactly with Snell’s law. Where the coin appears is what you are finding.`),
        };
      },
    }),
    num({
      id: 'measure-n', difficulty: 3,
      gen(r) {
        const [liquid, n0] = r.pick([['water', 1.333], ['ethanol', 1.361], ['glycerol', 1.473], ['a sugar solution', 1.42]]);
        const th1 = r.pick([40, 50, 60]);
        const th2 = Math.round(asind(sind(th1) / n0) * 10) / 10;
        const key = sind(th1) / sind(th2);
        return {
          prompt: t`In the optics lab, a laser beam in air enters a tank of ${liquid} at $${th1}.0°$ from the normal, and you measure the refracted beam at $${th2.toFixed(1)}°$ from the normal. What is the liquid's refractive index?`,
          answer: key, tol: { rel: 0.004 },
          errors: apart([{ value: th1 / th2, feedback: t`Divide the *sines*, not the angles: $n_2 = \sin\theta_1/\sin\theta_2$.` }, { value: sind(th2) / sind(th1), feedback: 'Upside down: the liquid is slower than air, so its index must be above 1.' }], key),
          hints: [t`Snell's law with $n_1 = 1.00$: $\sin\theta_1 = n_2\sin\theta_2$.`, t`Solve for $n_2$: $n_2 = \dfrac{\sin\theta_1}{\sin\theta_2}$.`, t`$\sin ${th1}° = ${tn(sind(th1), 4)}$ and $\sin ${th2.toFixed(1)}° = ${tn(sind(th2), 4)}$.`],
          teach: 'Measuring the two angles and dividing their sines gives the index: the standard lab measurement of n.',
          explain: t`$n = \dfrac{\sin ${th1}°}{\sin ${th2.toFixed(1)}°} = \dfrac{${tn(sind(th1), 4)}}{${tn(sind(th2), 4)}} = ${tn(key)}$ — ${liquid} has $n \approx ${n0.toFixed(2)}$. A 0.1° error in the angle changes the third figure, so labs repeat the measurement at several angles and fit a line to $\sin\theta_1$ against $\sin\theta_2$.`,
          visual: iface({ n1: 1, n2: n0, angle: th1, labels: false }, 'The measured beams (no labels): incident at the upper left, refracted below. The index of the liquid is what you are finding.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-glass-water', difficulty: 2,
      gen(r) {
        const th = r.pick([25, 30, 35, 40]);
        const t2 = asind((1.52 * sind(th)) / 1.33);
        return {
          prompt: t`Light inside a glass block ($n = 1.52$) reaches the block's flat face, which is under water ($n = 1.33$), at $${th}°$ from the normal. At what angle from the normal does it travel in the water?`,
          answer: t2, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: asind((1.33 * sind(th)) / 1.52), feedback: t`The indices are the wrong way round: $n_1$ is the glass, where the light starts.` }], t2),
          hints: [t`$n_1\sin\theta_1 = n_2\sin\theta_2$ with $n_1 = 1.52$ (glass) and $n_2 = 1.33$ (water).`, t`$\sin\theta_2 = 1.52\sin ${th}°/1.33$.`],
          teach: 'Going into a slower medium bends light toward the normal; going into a faster one bends it away.',
          explain: t`$\sin\theta_2 = 1.52 \times ${tn(sind(th), 4)}/1.33 = ${tn((1.52 * sind(th)) / 1.33, 4)}$, so $\theta_2 = ${tn(t2)}°$ — bent *away* from the normal, because water is the faster medium.`,
          visual: iface({ n1: 1.52, n2: 1.33, angle: th, hide: ['refracted', 'theta2', 'critical'] }, 'Light in glass (top) meeting water (bottom). The refracted ray is what you are finding.'),
        };
      },
    }),
    mcq({
      id: 'cp-schlieren', difficulty: 3, transfer: true,
      prompt: t`**Schlieren** photography makes a rocket's exhaust and shock waves visible by recording how much each ray of light is bent as it crosses the gas. For air, $n - 1 = K\rho$ (the Gladstone–Dale relation, $K = 2.26\times10^{-4}\ \text{m}^3/\text{kg}$), so denser gas has the higher index: $n = 1.000\,277$ at sea level. A ray passes off-centre through a hot plume whose gas gets hotter — and less dense — toward the middle. Which way does the ray bend?`,
      choices: [
        'Away from the hot centre, toward the cooler, denser gas',
        'Toward the hot centre, where the gas is less dense',
        'Not at all: every gas has n = 1 exactly',
        'Toward the centre, because the hot gas there is moving fastest',
      ],
      answer: 0,
      why: {
        1: 'Light turns toward the side where it is slower — the higher index — and that is the denser, cooler gas.',
        2: t`$n - 1$ for air is small, $2.8\times10^{-4}$, but not zero — and Schlieren systems detect deflections of a few arcseconds.`,
        3: 'The flow speed of the gas does not set the bending; its density sets the index.',
      },
      hints: ['Which side of the ray has the higher index: toward the hot centre or away from it?', 'As in the wavefront picture, the part of a crest in the slower (higher-n) gas falls behind, so the crest turns toward that side.'],
      teach: 'Light bends toward the region of higher refractive index — in a gas, the denser region.',
      explain: t`Across the ray, the gas on the outer side is denser, so it has the higher index and the light there is slower. Each crest's outer end lags, so the ray curves outward, away from the hot core. The deflections are tiny — the index of 1000 K exhaust differs from that of the air around it in the fifth decimal place — so a Schlieren system brings the light to a focus and blocks part of it with a knife edge: a ray bent by a few arcseconds then shows up as a brighter or darker spot.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-3.4, 3.4], y: [-1.7, 1.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [1.5, 1.05, 0.6].map((R) => ({ fn: `sqrt(max(0, ${R * R} - (x - 0.6)^2))`, lower: `-sqrt(max(0, ${R * R} - (x - 0.6)^2))`, from: 0.6 - R, to: 0.6 + R, color: 'warn', alpha: 0.16 })),
          arrows: [{ from: [-3.2, 0.75], to: [-1.0, 0.75], color: 'gold', label: 'light', labelDx: -36, labelDy: -12 }],
          points: [label(0.32, 0.0, 'hottest', 'warn'), label(1.75, -1.35, 'exhaust plume, cut across', 'ink3'), label(-3.2, -1.35, 'cool, denser air', 'ink3')],
        },
        caption: 'A hot exhaust plume seen end-on (schematic): the shading marks the temperature, highest at the centre. A ray of light approaches off-centre; what it does next is the question.',
      },
    }),
    num({
      id: 'cp-fibre-delay', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([3000, 4500, 6000, 8000]);
        const tt = (1.468 * L * 1e3) / 3.0e8;
        return {
          prompt: t`An undersea cable carries data as light through ${L.toLocaleString('en-US').replace(',', ' ')} km of glass fibre with $n = 1.468$. How long does the light take to cross? (Take $c = 3.00\times10^{8}$ m/s.)`,
          answer: tt * 1e3, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: ((L * 1e3) / 3.0e8) * 1e3, feedback: t`That is the time at $c$. In the glass the light travels at $c/n$.` }, { value: ((L * 1e3) / (1.468 * 3.0e8)) * 1e3, feedback: t`Light is *slower* in glass: $v = c/n$, so $t = L/v = nL/c$.` }],
          hints: [t`Speed in the fibre: $v = c/n$.`, t`Time $= L/v = nL/c$, with $L$ in metres.`],
          teach: 'Light in glass is about a third slower than in vacuum, which sets a hard floor on how fast a signal can cross a cable.',
          explain: t`$t = nL/c = 1.468 \times ${tn(L * 1e3)}\ \text{m} / 3.00\times10^{8}\ \text{m/s} = ${tn(tt * 1e3)}$ ms, against $${tn(((L * 1e3) / 3.0e8) * 1e3)}$ ms for light in vacuum. That gap is why some trading firms pay for microwave links between exchanges, and why hollow-core fibres, which guide light through air, are being developed.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 10], y: [-1.5, 1.5], axes: false, grid: false, xlabel: '', ylabel: '',
              shade: [{ fn: '0.9', lower: '-0.75', from: 1.4, to: 8.6, color: 'accent', alpha: 0.22 }, { fn: '-0.75', lower: '-1.5', from: 0, to: 10, color: 'ink4', alpha: 0.5 },
                { fn: '0.9', lower: '-1.5', from: 0, to: 1.4, color: 'good', alpha: 0.2 }, { fn: '0.9', lower: '-1.5', from: 8.6, to: 10, color: 'good', alpha: 0.2 }],
              curves: [{ param: ['1 + 0.4*t', '0.9 - 1.62*t'], t: [0, 1], color: 'accent2', width: 3 }, { fn: '-0.72 + 0.04*sin(3*x)', domain: [1.4, 8.6], color: 'accent2', width: 3 }, { param: ['8.6 + 0.4*t', '-0.72 + 1.62*t'], t: [0, 1], color: 'accent2', width: 3 }],
              points: [{ x: 1, y: 0.9, color: 'good', r: 6, label: 'shore station', labelDx: -10, labelDy: -14 }, { x: 9, y: 0.9, color: 'good', r: 6, label: 'shore station', labelDx: -60, labelDy: -14 },
                label(2.4, 0.35, `ocean: ${L.toLocaleString('en-US').replace(',', ' ')} km of fibre on the sea floor, n = 1.468`, 'accent2'), label(4.2, -1.15, 'sea floor (depths not to scale)', 'ink3')],
            },
            caption: 'An undersea fibre-optic cable between two shore stations (schematic, not to scale).',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §1.2 The Law of Reflection', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-2-the-law-of-reflection' },
    { label: 'OpenStax University Physics Vol. 3, §1.3 Refraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction' },
    { label: 'Settles, Schlieren and Shadowgraph Techniques (Springer, 2001)', url: 'https://doi.org/10.1007/978-3-642-56640-0' },
  ],
});

