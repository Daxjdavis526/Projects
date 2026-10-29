// Gravity near Earth's surface: g(r) = GM/r² outside a round body (the shell
// theorem), g ≈ g₀(1 − 2h/R) close to the ground, no gravity inside a shell,
// and the small correction from Earth's spin. Orbiting is falling.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GM_EARTH, R_EARTH, gN, g0, gProfile } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);
const RK = R_EARTH / 1000;                                   // km
const gAt = (h) => GM_EARTH / (R_EARTH + h) ** 2;           // h in m

// marks on the g(r) profile
const MARKS = [
  { x: r4(1 + 420 / RK), y: r4(gAt(420e3)), color: 'gold', label: 'ISS', labelDx: 8 },
  { x: r4(26560 / RK), y: r4(GM_EARTH / 26560e3 ** 2), color: 'gold', label: 'GPS', labelDy: -12 },
  { x: r4(42164 / RK), y: r4(GM_EARTH / 42164e3 ** 2), color: 'gold', label: 'geostationary', labelDy: -12, labelDx: -40 },
];

// a uniform spherical shell with a point inside it, and the two cones of shell it "sees"
const shellPicture = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.35, 1.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 5 },
      { param: ['0.45 + t*(cos(2.6) - 0.45)', 't*sin(2.6)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
      { param: ['0.45 + t*(cos(3.68) - 0.45)', 't*sin(3.68)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
      { param: ['0.45 + t*(cos(0.98) - 0.45)', 't*sin(0.98)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
      { param: ['0.45 + t*(cos(-0.98) - 0.45)', 't*sin(-0.98)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
      { param: ['cos(t)', 'sin(t)'], t: [2.6, 3.68], color: 'gold', width: 7 },
      { param: ['cos(t)', 'sin(t)'], t: [-0.98, 0.98], color: 'teal', width: 7 },
    ],
    points: [{ x: 0.45, y: 0, color: 'ink', r: 5, label: 'P', labelDy: 14 }, { x: -1.15, y: 0.75, r: 0.01, color: 'gold', label: 'far: more mass', labelDx: -60 }, { x: 1.05, y: 0.75, r: 0.01, color: 'teal', label: 'near: less mass, closer' }],
  },
  caption: 'A thin, uniform spherical shell (blue) and a point P inside it. Through any narrow double cone from P, the far patch of shell is bigger but farther away. Not a proof — just the shape of the argument.',
};

const EX = { h1: 8849, h2: 420e3 };

export default lesson({
  id: 'phys2210.M13.2',
  title: 'Gravity near Earth’s surface',
  minutes: 10, difficulty: 2,
  intro: t`Newton proved that a spherical body pulls on anything **outside** it as if all its mass sat at its centre — the shell theorem. So at a distance $r$ from Earth's centre, the gravitational acceleration is $g = GM/r^2$; a height $h$ above the ground, $r = R + h$, and when $h$ is small compared with $R$:

$$g(r) = \frac{GM}{r^2}, \qquad g(R + h) \approx g_0\left(1 - \frac{2h}{R}\right)$$

Gravity at the height of the International Space Station is still nearly 90% of its value on the ground; the crew float because they are falling around the Earth with their station. Inside a hollow shell, by the same theorem, there is no gravity at all.`,
  symbols: [
    { tex: 'g', text: 'the gravitational acceleration (the pull per kilogram), in m/s²' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$' },
    { tex: 'M', text: 'Earth’s mass, $5.972\\times10^{24}$ kg; together, $GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$' },
    { tex: 'r', text: 'the distance from Earth’s centre, in m — not from the ground' },
    { tex: 'R', text: 'Earth’s mean radius, 6371 km' },
    { tex: 'h', text: 'the height above the surface, in m' },
    { tex: 'g_0', text: 'the value at the surface, $GM/R^2 = 9.82\\ \\text{m/s}^2$ for a round Earth that did not spin' },
  ],
  why: 'Every spacecraft trajectory starts from g(r) = GM/r²; and the shell theorem is what lets you treat planets and stars as points — the first step toward black-hole spacetimes, which share the same outside-only-depends-on-mass property.',
  visual: {
    type: 'graph',
    title: 'Gravity from Earth’s centre to beyond geostationary orbit',
    lead: t`The blue curve is $g = GM/r^2$ outside the Earth; the dashed line inside is a uniform-density Earth. Move the probe outward with the slider and compare the exact value with the straight-line estimate near the ground.`,
    tasks: [
      'Move to the ISS (1.07 Earth radii): g is still 8.6 m/s², about 88% of the surface value.',
      'Go to 2 Earth radii, then 4: g falls to a quarter, then a sixteenth — distance from the centre is what counts.',
      'Compare the gold estimate g₀(1 − 2h/R) with the exact value: superb near the ground, badly wrong by 1.5 radii.',
    ],
    params: {
      ...gProfile({ marks: MARKS }).params,
      sliders: [{ key: 'q', label: 'Distance from Earth’s centre, $r$', min: 0, max: 7, step: 0.01, value: 1.2, unit: 'R', explain: 'In Earth radii; 1 is the surface, 6371 km from the centre.' }],
      curves: [
        { fn: `${r4(gN)}*x`, domain: [0, 1], color: 'ink3', width: 2, dash: true },
        { fn: `${r4(gN)}/x^2`, domain: [1, 7], color: 'accent', width: 2.4 },
        { fn: `${r4(gN)}*(1 - 2*(x - 1))`, domain: [1, 1.5], color: 'gold', width: 1.4, dash: true },
      ],
      points: [...MARKS, { x: 'q', y: `${r4(gN)}*min(q, 1/q^2)`, color: 'bad', r: 6 }],
      readouts: [
        { label: '$g$ here', expr: `${r4(gN)}*min(q, 1/q^2)`, unit: '\\mathrm{m/s^2}', digits: 3 },
        { label: 'compared with the surface', expr: 'min(q, 1/q^2)', digits: 3 },
        { label: 'height above the ground', expr: `(q - 1)*${RK}`, unit: '\\mathrm{km}', digits: 4 },
        { label: 'estimate $g_0(1 - 2h/R)$', expr: `${r4(gN)}*(1 - 2*(q - 1))`, unit: '\\mathrm{m/s^2}', digits: 3 },
      ],
    },
    caption: 'A round, non-spinning Earth. Outside: GM/r² (exact for a spherical body). Inside: the uniform-density model, g ∝ r — a teaching model only: the real Earth’s dense core makes g rise slightly with depth, to about 10.7 m/s² at the core–mantle boundary, before falling to zero at the centre.',
  },
  example: {
    prompt: t`How strong is Earth's gravity on the summit of Mount Everest (${EX.h1.toLocaleString('en-US')} m) and at the height of the International Space Station (420 km)? Compute each exactly from $g = GM/r^2$, and with the shortcut $g_0(1 - 2h/R)$. ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km.)`,
    visual: gProfile({ xmax: 1.4, marks: [{ x: r4(1 + 8.849 / RK), y: r4(gAt(EX.h1)), color: 'gold', label: 'Everest', labelDy: 14 }, { x: r4(1 + 420 / RK), y: r4(gAt(EX.h2)), color: 'gold', label: 'ISS', labelDx: 8 }], caption: 'Earth’s gravity just above the surface; the dashed line inside is the uniform-density model.' }),
    steps: [
      { label: 'At the surface', text: t`$g_0 = \dfrac{GM}{R^2} = \dfrac{3.986\times10^{14}}{(6.371\times10^{6})^2} = ${s3(gN)}\ \text{m/s}^2$ — slightly more than the measured 9.81, which includes the effect of Earth's spin.` },
      { label: 'Everest, exactly', text: t`$r = 6.379849\times10^{6}$ m: $g = ${fmt(gAt(EX.h1), 4)}\ \text{m/s}^2$ — just ${s3((1 - gAt(EX.h1) / gN) * 100)}% less than at sea level.` },
      { label: 'Everest, shortcut', text: t`$2h/R = 2(8849)/(6.371\times10^{6}) = ${tex((2 * EX.h1) / R_EARTH)}$, so $g \approx ${s3(gN)}(1 - ${tex((2 * EX.h1) / R_EARTH)}) = ${fmt(gN * (1 - (2 * EX.h1) / R_EARTH), 4)}\ \text{m/s}^2$. Essentially perfect.` },
      { label: 'The ISS', text: t`Exactly: $r = 6.791\times10^{6}$ m, $g = ${s3(gAt(EX.h2))}\ \text{m/s}^2$, ${Math.round((100 * gAt(EX.h2)) / gN)}% of the surface value. The shortcut gives $${s3(gN * (1 - (2 * EX.h2) / R_EARTH))}\ \text{m/s}^2$ — already ${s3(Math.abs(1 - (gN * (1 - (2 * EX.h2) / R_EARTH)) / gAt(EX.h2)) * 100)}% off, because $h/R = 0.066$ is no longer tiny.` },
      { label: 'Sense check', text: t`Gravity is still strong where the ISS flies. Astronauts float because they and the station fall together, at that same $${s3(gAt(EX.h2))}\ \text{m/s}^2$ — moving sideways so fast (7.7 km/s) that they keep missing the Earth.` },
    ],
    answer: t`Everest: $${fmt(gAt(EX.h1), 4)}\ \text{m/s}^2$ (shortcut: the same). ISS: $${s3(gAt(EX.h2))}\ \text{m/s}^2$ (shortcut: $${s3(gN * (1 - (2 * EX.h2) / R_EARTH))}$).`,
  },
  practice: [
    num({
      id: 'g-height', difficulty: 1,
      gen(r) {
        const [what, h] = r.pick([['the Kármán line, the usual edge of space, at 100 km', 100], ['the Hubble Space Telescope, 535 km up', 535], ['China’s Tiangong space station, 390 km up', 390], ['a Starlink satellite, 550 km up', 550]]);
        const g = gAt(h * 1000);
        return {
          prompt: t`What is the gravitational acceleration at ${what}? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: GM_EARTH / (h * 1000) ** 2, feedback: 'r is measured from Earth’s centre: R + h, not h.' }, { value: gN, feedback: 'That is the surface value. Gravity weakens with height: use r = R + h.' }],
          hints: [t`$r = R + h = (6371 + ${h})$ km, in metres.`, t`$g = GM/r^2$.`],
          teach: 'Gravity at height h is GM/(R + h)², with the distance from Earth’s centre.',
          explain: t`$r = ${(RK + h).toLocaleString('en-US').replace(/,/g, '{,}')}$ km, so $g = \dfrac{3.986\times10^{14}}{(${tex((RK + h) * 1000, 5)})^2} = ${s3(g)}\ \text{m/s}^2$ — ${Math.round((100 * g) / gN)}% of the surface value.`,
          visual: gProfile({ xmax: 1.3, marks: [{ x: r4(1 + h / RK), y: r4(g), color: 'gold', label: '?', labelDx: 8 }], inside: false, caption: 'Earth’s gravity just above the surface (outside only).' }),
        };
      },
    }),
    mcq({
      id: 'why-float', difficulty: 2,
      prompt: 'Astronauts on the ISS float, although Earth’s gravity there is nearly 90% as strong as on the ground. Why?',
      choices: [
        'They and the station are in free fall together: both accelerate toward Earth at the same rate, so nothing presses them against the floor',
        'At that height they are beyond the reach of Earth’s gravity',
        'The station’s speed creates an outward force that cancels gravity exactly',
        'There is no air up there, and gravity needs air to act',
      ],
      answer: 0,
      why: {
        1: 'Gravity reaches the Moon and beyond; at 420 km it is 8.6 m/s².',
        2: 'Seen from the ground there is no outward force on the station: gravity is the only force, and it bends the path into a circle. (An outward “centrifugal” force appears only in a rotating frame.)',
        3: 'Gravity acts through empty space — that is how the Sun holds the Earth.',
      },
      hints: ['What else is accelerating toward Earth, at the same rate as the astronauts?', 'Feeling weight means something — a floor, a seat — is pushing on you. Is anything pushing on them?'],
      teach: 'Weightlessness in orbit is free fall: the crew and the station fall together, so nothing pushes on them.',
      explain: 'Fired sideways fast enough, anything keeps falling toward Earth while the curved ground drops away beneath it — Newton’s cannon. The station and its crew fall together, so the floor never pushes on anyone. A scale would read zero, though gravity is nearly full strength.',
      visual: { type: 'mech-kepler', params: { launch: { body: 'earth', h: 1500e3, v: 7.12, vRange: [3, 12], ghosts: [4.5, 5.5, 6.4] }, sectors: 0, controls: false, readout: false }, caption: 'Newton’s cannon, to scale, fired sideways from 1500 km up (higher than the ISS, so the paths show): at 4.5, 5.5 and 6.4 km/s (grey) it falls back; at 7.12 km/s (blue) it falls all the way round. Newtonian gravity, no air.' },
    }),
    num({
      id: 'shortcut', difficulty: 2,
      gen(r) {
        const [what, h] = r.pick([['the top of the Burj Khalifa, 828 m up', 828], ['the summit of K2, 8611 m up', 8611], ['an airliner cruising at 12 km', 12000], ['the 2012 Red Bull Stratos balloon, at 39 km', 39000]]);
        const pct = (200 * h) / R_EARTH;
        return {
          prompt: t`Using $g \approx g_0(1 - 2h/R)$, by what percentage is gravity weaker at ${what} than at sea level? ($R = 6371$ km)`,
          answer: pct, units: '%', tol: { rel: 0.01 },
          errors: [{ value: pct / 2, feedback: t`The factor is $2h/R$: gravity goes as $1/r^2$, and the square doubles the fractional change.` }],
          hints: [t`The fractional decrease is $2h/R$; multiply by 100 for a percentage.`],
          teach: 'Close to the ground gravity weakens by a fraction 2h/R: about 0.03% per kilometre.',
          explain: t`$2h/R = 2(${h})/(6.371\times10^{6}) = ${tex(pct / 100)}$, i.e. ${s3(pct)}%. (The exact value, $1 - R^2/(R+h)^2$, is ${s3((1 - (R_EARTH / (R_EARTH + h)) ** 2) * 100)}% — the shortcut is excellent while $h \ll R$.)`,
          visual: gProfile({ xmax: 1.12, marks: [{ x: r4(1 + h / R_EARTH), y: r4(gAt(h)), color: 'gold', r: 5 }], inside: false, extra: { x: [0.999, 1.0075], y: [9.68, 9.84], xlabel: 'distance from Earth’s centre (Earth radii)', curves: [{ fn: `${r4(gN)}/x^2`, domain: [1, 1.0075], color: 'accent', width: 2.4 }, { fn: `${r4(gN)}*(1 - 2*(x - 1))`, domain: [1, 1.0075], color: 'gold', width: 1.4, dash: true }], vlines: [{ x: 1, label: 'sea level', color: 'ink4' }] }, caption: 'Very close to the ground, GM/r² (blue) and the straight-line shortcut (gold, dashed) can hardly be told apart.' }),
        };
      },
    }),
    mcq({
      id: 'shell', difficulty: 2,
      prompt: 'An astronaut floats somewhere inside a huge, uniform, hollow spherical shell of rock, off-centre. What net gravitational force does the shell exert on her?',
      choices: ['None, wherever she is inside', 'A pull toward the nearest part of the shell', 'A pull toward the centre of the shell', 'A pull toward the farthest, larger part of the shell'],
      answer: 0,
      why: {
        1: 'The near patch is closer, but smaller: the inverse-square law balances the two exactly.',
        2: 'By symmetry the pulls from all round cancel — there is nothing at the centre to pull her.',
        3: 'The far side has more mass in any cone she looks through, but it is farther away by exactly the right amount.',
      },
      hints: ['Look along any narrow cone through her, in both directions. How do the two patches of shell compare in mass and in distance?'],
      teach: 'Inside a uniform spherical shell the gravitational pulls cancel everywhere — Newton’s shell theorem.',
      explain: t`Along any double cone through her, the patch of shell at distance $r$ has area (and mass) proportional to $r^2$, while its pull per unit mass goes as $1/r^2$: the two patches pull equally, in opposite directions. So she feels no net force — and, together with the outside result, this is why only the mass **inside** radius $r$ pulls on you deep within a planet.`,
      visual: shellPicture,
    }),
    num({
      id: 'inside', difficulty: 2,
      gen(r) {
        const d = r.pick([1000, 2000, 3185, 5000]);
        const g = gN * (1 - d / RK);
        return {
          prompt: t`**A teaching model.** If the Earth had the same density everywhere, how strong would gravity be ${d.toLocaleString('en-US')} km below the surface? ($g_0 = ${s3(gN)}\ \text{m/s}^2$, $R = 6371$ km.)`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: gN * (RK / (RK - d)) ** 2, feedback: 'GM/r² applies outside. Inside, the shell above you pulls nothing, and the mass below you shrinks as r³: g ∝ r.' }],
          hints: [t`The shell above you exerts no net pull. The ball below has mass $M(r/R)^3$.`, t`So $g = G\,M(r/R)^3/r^2 = g_0\,r/R$, with $r = R - d$.`],
          teach: 'Inside a uniform ball, only the mass below you pulls, so g grows in proportion to the distance from the centre.',
          explain: t`$r = ${(RK - d).toLocaleString('en-US').replace(/,/g, '{,}')}$ km, so $g = ${s3(gN)}\times\dfrac{${(RK - d).toLocaleString('en-US').replace(/,/g, '{,}')}}{6371} = ${s3(g)}\ \text{m/s}^2$. The real Earth is not uniform: its iron core is so dense that g actually *rises* a little going down through the mantle, to about 10.7 m/s² at the core–mantle boundary 2890 km down, before falling to zero at the centre.`,
          visual: gProfile({ xmax: 2.2, marks: [{ x: r4(1 - d / RK), y: r4(g), color: 'gold', label: '?', labelDx: 8 }], caption: 'The uniform-density model: g ∝ r inside (dashed), GM/r² outside.' }),
        };
      },
    }),
    num({
      id: 'spin', difficulty: 3,
      gen(r) {
        const m = r.pick([60, 70, 80, 90]);
        const w = (2 * Math.PI) / 86164, a = w * w * 6.378e6;
        return {
          prompt: t`Earth turns once every 86 164 s, and its equatorial radius is 6378 km. By how many newtons does a bathroom scale read less for a ${m} kg person standing on the equator than it would if the Earth did not spin?`,
          answer: m * a, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: m * w * 6.378e6, feedback: t`That is $m\omega R$. The centripetal acceleration is $\omega^2 R$.` }, { value: m * ((2 * Math.PI) / 86400) ** 2 * 6.378e3, feedback: 'Put the radius in metres.' }],
          hints: [
            t`Standing on the equator, you move in a circle of radius $R$ once per rotation; the net force on you must supply the centripetal acceleration $\omega^2 R$.`,
            t`So $mg - N = m\omega^2 R$: the scale's push $N$ is less than $mg$ by $m\omega^2R$.`,
            t`$\omega = 2\pi/86\,164\ \text{s}$.`,
          ],
          teach: 'On a spinning planet the scale reads less at the equator, because part of the pull of gravity goes into keeping you moving in a circle.',
          explain: t`$\omega = ${tex(w)}$ rad/s, so $\omega^2R = ${s3(a)}\ \text{m/s}^2$ and the reading drops by $m\omega^2R = ${s3(m * a)}$ N — about 0.35% of the weight. Together with Earth's slightly flattened shape, this makes the measured g 9.780 m/s² at the equator and 9.832 at the poles.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.2, 2.2], y: [-1.3, 1.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.35 }],
              curves: [{ param: ['t', '0'], t: [-1, 1], color: 'ink3', width: 1, dash: true }, { param: ['0', 't'], t: [-1.25, 1.25], color: 'ink3', width: 1.4 }, { param: ['0.25cos(t)', '1.18 + 0.08sin(t)'], t: [0.3, 5.6], color: 'warn', width: 1.6 }],
              arrows: [{ from: [1.0, 0], to: [0.35, 0], color: 'bad', label: 'mg', labelDy: -12 }, { from: [1.0, 0.02], to: [1.55, 0.02], color: 'teal', label: 'N', labelDy: -12 }],
              points: [{ x: 1, y: 0, color: 'gold', r: 5, label: 'person on the equator', labelDx: 10, labelDy: 18 }],
            },
            caption: 'Earth seen from the side, spinning about its axis. On the equator the person moves in a circle, so N (teal) must be a little less than mg (red). Lengths not to scale.',
          },
        };
      },
    }),
    num({
      id: 'half-g', difficulty: 2,
      prompt: t`How high above the ground does Earth's gravity fall to half its surface value? ($R = 6371$ km)`,
      answer: (Math.SQRT2 - 1) * RK, units: 'km', tol: { rel: 0.01 },
      errors: [{ value: RK, feedback: 'At one radius up (2R from the centre) gravity is a quarter, not a half: it goes as 1/r².' }, { value: Math.SQRT2 * RK, feedback: 'That is the distance from the centre. Subtract R for the height above the ground.' }],
      hints: [t`$g \propto 1/r^2$, so half the surface value needs $r^2 = 2R^2$.`, t`$r = \sqrt2\,R$; the height is $r - R$.`],
      teach: 'Because gravity goes as 1/r², halving it takes a distance √2 times larger — measured from the centre.',
      explain: t`$r = \sqrt2 R = ${s3(Math.SQRT2 * RK)}$ km from the centre, which is $${s3((Math.SQRT2 - 1) * RK)}$ km above the ground.`,
      visual: gProfile({ xmax: 3, marks: [{ x: 1, y: r4(gN), color: 'gold', label: 'surface', labelDx: 8 }], extra: { hlines: [{ y: r4(gN / 2), label: 'half the surface value', color: 'gold' }] }, caption: 'Earth’s gravity against distance from its centre, with half its surface value marked.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-high-orbit', difficulty: 2, transfer: true,
      gen(r) {
        const [what, rk] = r.pick([['a GPS satellite, 26 560 km', 26560], ['a geostationary satellite, 42 164 km', 42164], ['the Moon, 384 400 km', 384400]]);
        const g = GM_EARTH / (rk * 1000) ** 2;
        return {
          prompt: t`How strong is Earth's gravity at the orbit of ${what} from Earth's centre? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$)`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          hints: [t`$g = GM/r^2$ with $r$ in metres.`],
          teach: 'g = GM/r², with r from Earth’s centre, holds all the way out to the Moon and beyond.',
          explain: t`$g = \dfrac{3.986\times10^{14}}{(${tex(rk * 1000, 5)})^2} = ${tex(g)}\ \text{m/s}^2$ — ${s3((100 * g) / gN)}% of the surface value. That is exactly the centripetal acceleration of a circular orbit there.`,
          visual: gProfile({ xmax: rk > 50000 ? 62 : 7.5, inside: false, caption: 'Earth’s gravity against distance from its centre (outside only).' }),
        };
      },
    }),
    mcq({
      id: 'cp-tower', difficulty: 2,
      prompt: 'Imagine a tower 400 km tall, standing still on the equator. You ride a lift to the top and stand on a scale there. Roughly what does it read, compared with your weight on the ground?',
      choices: ['About 88% of it', 'Zero: at that height you are weightless, like the ISS crew', 'Exactly the same: weight does not depend on height', 'About half'],
      answer: 0,
      why: {
        1: 'The ISS crew float because they are in free fall at 7.7 km/s. Standing still on a tower, you are not falling: the scale holds you up against nearly full gravity.',
        2: 'Gravity weakens as 1/r², and 400 km up is about 6% farther from Earth’s centre.',
        3: t`Half would need $r = \sqrt2\,R$, about 2600 km up.`,
      },
      hints: ['At 400 km, how much farther from Earth’s centre are you?', 'Is anything about you falling, the way the ISS is?'],
      teach: 'Weightlessness comes from free fall, not from height: at ISS altitude, gravity is still about 88% of its surface value.',
      explain: t`$\left(\dfrac{6371}{6771}\right)^2 = ${s3((6371 / 6771) ** 2)}$, so the scale reads about 88% (a fraction of a percent less still, from the tower top's faster circle round the axis). Weightlessness needs free fall, not altitude.`,
      visual: gProfile({ xmax: 1.25, inside: false, marks: [{ x: r4(6771 / 6371), y: r4(GM_EARTH / 6.771e6 ** 2), color: 'gold', label: 'tower top', labelDx: 8 }], caption: 'Earth’s gravity just above the surface, with the top of the imaginary tower marked.' }),
    }),
    num({
      id: 'cp-everest', difficulty: 2,
      prompt: t`A 70 kg climber stands on the summit of Mount Everest, 8849 m above sea level. Using $g \approx g_0(1 - 2h/R)$ with $g_0 = 9.81\ \text{m/s}^2$ and $R = 6371$ km, by how many newtons is her weight less than at sea level?`,
      answer: 70 * g0 * ((2 * 8849) / 6.371e6), units: 'N', tol: { rel: 0.01 },
      errors: [{ value: 70 * g0 * (8849 / 6.371e6), feedback: 'The fractional decrease is 2h/R, not h/R.' }],
      hints: [t`The weight falls by the fraction $2h/R$: multiply $mg_0$ by it.`],
      teach: 'Near the surface, weight falls by the fraction 2h/R with height.',
      explain: t`$\Delta W = mg_0\cdot\dfrac{2h}{R} = (70)(9.81)\dfrac{2(8849)}{6.371\times10^{6}} = ${s3(70 * g0 * ((2 * 8849) / 6.371e6))}$ N — about the weight of a 200 g apple.`,
      visual: gProfile({ xmax: 1.05, inside: false, extra: { x: [0.9995, 1.0025], y: [9.76, 9.84], vlines: [{ x: 1, label: 'sea level', color: 'ink4' }] }, marks: [{ x: 1, y: r4(gN), color: 'gold', label: 'sea level', labelDx: 8 }, { x: r4(1 + 8.849 / RK), y: r4(gAt(8849)), color: 'gold', label: 'Everest', labelDy: 14, labelDx: 6 }], caption: 'Earth’s gravity just above the surface; both axes are zoomed in (g from 9.76 to 9.84 m/s²).' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.2 Gravitation Near Earth’s Surface', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-2-gravitation-near-earths-surface' },
    { label: 'Dziewonski & Anderson (1981), Preliminary Reference Earth Model (PREM)', url: 'https://doi.org/10.1016/0031-9201(81)90046-7' },
  ],
});
