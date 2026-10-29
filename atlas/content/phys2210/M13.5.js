// Tidal forces: gravity that differs across a body. Relative to its centre, a
// body is stretched along the line to the mass by 2GMd/r³ and squeezed across
// it — two ocean bulges, the Moon beating the Sun, Io heated, a comet torn
// apart, and the one effect of gravity that falling cannot remove.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GM_EARTH, GM_MOON, GM_SUN, R_EARTH, R_MOON, D_MOON, AU, C, tidalArrows } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);
const tide = (GM, size, r) => (2 * GM * size) / r ** 3;      // stretch along the line, m/s²

// the Explore: arrows at 12 points round the Earth, as expressions of d (Earth radii) and v (view)
const EXPLORE_ARROWS = Array.from({ length: 12 }, (_, k) => {
  const th = (2 * Math.PI * k) / 12, c = r4(Math.cos(th)), s = r4(Math.sin(th)), q = `((d - ${c})^2 + ${r4(s * s)})^1.5`;
  return {
    from: [c, s],
    to: [`${c} + 0.6*((1 - v)*d^2*(d - ${c})/${q} + v*15*(d^2*(d - ${c})/${q} - 1))`, `${s} + 0.6*((1 - v) + v*15)*d^2*(${-s})/${q}`],
    color: 'bad',
  };
});

const EX = { moon: tide(GM_MOON, R_EARTH, D_MOON), sun: tide(GM_SUN, R_EARTH, AU) };
EX.pulls = (GM_SUN / AU ** 2) / (GM_MOON / D_MOON ** 2);

// a ring of dust grains falling toward a planet (the GR seed): drift apart along the line, together across it
const fallingRing = {
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-1.7, 1.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    curves: [{ param: ['1.4 + 0.7cos(t)', '0.7sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }, { param: ['1.4 + 0.95cos(t)', '0.55sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 }, { param: ['-2.6 + 0.5cos(t)', '0.5sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.6 }],
    arrows: [{ from: [2.1, 0], to: [2.55, 0], color: 'bad' }, { from: [0.7, 0], to: [0.25, 0], color: 'bad' }, { from: [1.4, 0.7], to: [1.4, 0.45], color: 'bad' }, { from: [1.4, -0.7], to: [1.4, -0.45], color: 'bad' }],
    points: [{ x: -2.6, y: 0, r: 0.01, color: 'teal', label: 'planet', labelDx: -20, labelDy: 0 }, { x: 1.4, y: 0, color: 'ink2', r: 3 }],
  },
  caption: 'Seen from inside a falling spacecraft: a ring of floating grains (dashed: as released) slowly drifts into an oval, stretched along the line to the planet and squeezed across it. Hugely exaggerated.',
};

export default lesson({
  id: 'phys2210.M13.5',
  title: 'Tidal forces',
  minutes: 11, difficulty: 3,
  intro: t`Gravity weakens with distance, so it is not the same across an extended body. Relative to the body's centre, the near side is pulled a little more and the far side a little less: the body is **stretched** along the line to the attracting mass, and squeezed across it. For two points a distance $d$ apart along that line, at distance $r$ from a mass $M$ (with $d \ll r$):

$$\Delta a \approx \frac{2GM\,d}{r^3}$$

That $1/r^3$ is why the Moon raises bigger tides on Earth than the Sun does, though the Sun pulls Earth 180 times harder. And unlike gravity's average pull, which disappears for anything falling freely, **tides cannot be removed by falling** — the clue that leads Einstein to curved spacetime.`,
  symbols: [
    { tex: '\\Delta a', text: 'the difference in gravitational acceleration between the two points: the tidal stretch, in m/s². Across the line, the squeeze is half as big, $GMd/r^3$' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$' },
    { tex: 'M', text: 'the mass raising the tide, in kg' },
    { tex: 'd', text: 'the distance between the two points (for a whole planet, its radius gives the stretch from centre to surface), in m' },
    { tex: 'r', text: 'the distance from the mass’s centre to the body’s centre, in m' },
  ],
  why: 'Tides lock moons to their planets, heat Io into the most volcanic world in the Solar System, tear apart comets and stars — and in general relativity they are the curvature of spacetime itself.',
  visual: {
    type: 'graph',
    title: 'The pull, and what is left when you fall with it',
    lead: t`Red arrows: the Moon's pull on twelve points round the Earth, in units of its pull at Earth's centre. Then switch to *minus the pull at the centre* — what the Earth, falling toward the Moon as a whole, actually feels.`,
    tasks: [
      'In the total-pull view the arrows look almost identical: at the Moon’s real distance they differ by only about 3%.',
      'Switch to “minus the centre”: two bulges appear — outward toward the Moon and outward away from it — with a squeeze in between.',
      'Bring the Moon closer: the pull on the centre grows as 1/r², but the stretch (readout) grows faster, as 1/r³.',
    ],
    params: {
      x: [-2.6, 5.2], y: [-1.9, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'Arrows round the Earth showing the Moon’s pull, or the tidal stretch that remains after the pull on the centre is subtracted',
      sliders: [{ key: 'd', label: 'Moon’s distance', min: 8, max: 64, step: 0.1, value: 60.3, unit: 'R_\\oplus', explain: 'From Earth’s centre, in Earth radii. The real Moon is 56–64 Earth radii away.' }],
      choices: [{ key: 'v', label: 'Arrows show', options: [[0, 'Total pull'], [1, 'Minus the pull at the centre (×15)']], value: 0, explain: 'The second is the tidal part: what is felt by a body falling freely toward the Moon.' }],
      shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.35 }],
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.6 },
        { param: ['(1 + (2/d)*(3*cos(t)^2 - 1))*cos(t)', '(1 + (2/d)*(3*cos(t)^2 - 1))*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6, dash: true, when: 'v' },
      ],
      arrows: EXPLORE_ARROWS,
      points: [{ x: 4.6, y: 0, color: 'ink2', r: 6, label: 'toward the Moon →', labelDx: -120, labelDy: -16 }],
      readouts: [
        { label: 'Moon’s pull on Earth’s centre', expr: `${GM_MOON}/(d*${R_EARTH})^2`, unit: '\\mathrm{m/s^2}', digits: 3 },
        { label: 'tidal stretch, $2GMR/r^3$', expr: `2*${GM_MOON}*${R_EARTH}/(d*${R_EARTH})^3`, unit: '\\mathrm{m/s^2}', digits: 3 },
        { label: 'stretch ÷ pull', expr: '2/d', digits: 3 },
      ],
    },
    caption: 'Distances not to scale (the Moon is far off to the right). Arrows to scale in units of the pull at Earth’s centre; the tidal ones ×15. The dashed ocean outline is exaggerated about a million times.',
  },
  example: {
    prompt: t`How big are the Moon's and the Sun's tidal stretches across the Earth — from Earth's centre to the surface point nearest each? Compare them, and compare their total pulls on the Earth. ($GM_\text{Moon} = 4.905\times10^{12}$, $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$; distances $3.844\times10^{8}$ m and $1.496\times10^{11}$ m; $R_\oplus = 6.371\times10^{6}$ m.)`,
    visual: tidalArrows({ view: 'tidal' }),
    steps: [
      { label: 'Where 2GMd/r³ comes from', text: t`The pull at distance $r - d$ minus the pull at $r$: $\dfrac{GM}{(r-d)^2} - \dfrac{GM}{r^2} = \dfrac{GM}{r^2}\left[\left(1 - \dfrac dr\right)^{-2} - 1\right] \approx \dfrac{GM}{r^2}\cdot\dfrac{2d}{r}$, using $(1-x)^{-2} \approx 1 + 2x$ for small $x$.` },
      { label: 'The Moon', text: t`$\Delta a = \dfrac{2(4.905\times10^{12})(6.371\times10^{6})}{(3.844\times10^{8})^3} = ${tex(EX.moon)}\ \text{m/s}^2$.` },
      { label: 'The Sun', text: t`$\Delta a = \dfrac{2(1.327\times10^{20})(6.371\times10^{6})}{(1.496\times10^{11})^3} = ${tex(EX.sun)}\ \text{m/s}^2$.` },
      { label: 'Compare', text: t`The Moon's tide is ${s3(EX.moon / EX.sun)} times the Sun's — although the Sun's total pull on Earth, $GM/r^2$, is ${Math.round(EX.pulls)} times the Moon's. The extra power of $r$ in $1/r^3$ favours the near body.` },
      { label: 'Sense check', text: t`$${tex(EX.moon, 2)}\ \text{m/s}^2$ is about a ten-millionth of $g$, yet acting on whole oceans it raises tides about half a metre high in the open sea — more where coastlines funnel the water.` },
    ],
    answer: t`Moon: $${tex(EX.moon)}\ \text{m/s}^2$; Sun: $${tex(EX.sun)}\ \text{m/s}^2$ — the Moon's tide is about ${s3(EX.moon / EX.sun)} times stronger.`,
  },
  practice: [
    num({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const [what, GM, size, dist] = r.pick([
          ['the Moon’s stretch across the Earth (centre to near surface, 6371 km; Moon 384 400 km away, $GM = 4.905\\times10^{12}$)', GM_MOON, R_EARTH, D_MOON],
          ['the Earth’s stretch across the Moon (centre to near surface, 1737 km; Earth 384 400 km away, $GM = 3.986\\times10^{14}$)', GM_EARTH, R_MOON, D_MOON],
          ['Jupiter’s stretch across its moon Io (centre to near surface, 1822 km; Jupiter 421 700 km away, $GM = 1.267\\times10^{17}$)', 1.26687e17, 1.8216e6, 4.217e8],
        ]);
        const a = tide(GM, size, dist);
        return {
          prompt: t`Using $\Delta a = 2GMd/r^3$, find ${what} — in m/s², with $GM$ in $\text{m}^3/\text{s}^2$.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Keep the factor 2: along the line to the mass, the stretch is 2GMd/r³.' }, { value: GM / dist ** 2, feedback: 'That is the whole pull, GM/r². The tide is the difference in pull across the body.' }],
          hints: [t`Put every distance in metres: $d$ is the radius, $r$ the centre-to-centre distance.`, t`$\Delta a = 2GMd/r^3$.`],
          teach: 'The tidal stretch is the difference in gravity across a body, 2GMd/r³ — far smaller than the pull itself.',
          explain: t`$\Delta a = \dfrac{2(${tex(GM, 4)})(${tex(size, 4)})}{(${tex(dist, 4)})^3} = ${tex(a)}\ \text{m/s}^2$.${GM > 1e17 ? ' That is a third of a percent of Io’s own surface gravity — and as Io’s slightly eccentric orbit makes it flex, the friction heats its interior, driving hundreds of active volcanoes.' : GM === GM_EARTH ? ' Earth’s tides on the Moon long ago slowed its spin until it kept one face toward us.' : ''}`,
          visual: tidalArrows({ view: 'tidal', moonLabel: GM > 1e17 ? 'Jupiter' : GM === GM_EARTH ? 'Earth' : 'Moon', caption: 'The tidal pattern on the near body, relative to its centre (exaggerated): a stretch along the line, a squeeze across it.' }),
        };
      },
    }),
    mcq({
      id: 'far-bulge', difficulty: 2,
      prompt: 'The Moon raises a tidal bulge on the side of the Earth facing it. Why is there also a bulge on the side facing away?',
      choices: [
        'The far side is pulled less than Earth’s centre, so relative to the centre it is left behind — pushed outward, away from the Moon',
        'Earth’s spin flings the far-side water outward',
        'The Sun pulls on the far side',
        'The near bulge pushes the water through to the other side',
      ],
      answer: 0,
      why: {
        1: 'Earth’s spin does flatten it slightly at the poles, but evenly all round — it makes no bulge that follows the Moon.',
        2: 'The Sun raises its own, smaller pair of bulges; the far-side lunar bulge is there even when the Sun lines up elsewhere.',
        3: 'Water is not pushed through the planet: each side responds to the difference between its pull and the pull on the centre.',
      },
      hints: ['Compare the Moon’s pull on the near side, the centre and the far side. Which is largest, which smallest?', 'The whole Earth accelerates toward the Moon at the centre’s rate. Relative to that, which way does each side move?'],
      teach: 'Tides come from differences in gravity: relative to the centre, both the near and the far side are pulled outward along the line to the Moon.',
      explain: 'The Earth falls toward the Moon (round their common centre of mass) at the acceleration its centre feels. The near side is pulled harder, so it pulls ahead; the far side is pulled less, so it lags behind. Both move outward relative to the centre — two bulges, and two high tides a day as the Earth turns under them.',
      visual: tidalArrows({ view: 'lab', caption: 'The Moon’s pull on each part of the Earth (to scale, in units of the pull at the centre; the Moon is far off to the right). The differences are only a few per cent.' }),
    }),
    num({
      id: 'sun-vs-moon', difficulty: 2,
      prompt: t`The Sun is $2.71\times10^{7}$ times as massive as the Moon and 389 times as far from the Earth. How many times bigger is the Moon's tidal effect on Earth than the Sun's?`,
      answer: 389 ** 3 / 2.71e7, tol: { rel: 0.01 },
      errors: [{ value: 389 ** 2 / 2.71e7, feedback: 'That compares their total pulls (1/r²): the Sun pulls far harder. Tides go as M/r³.' }],
      hints: [t`Tides scale as $M/r^3$: the ratio is $\dfrac{M_\text{Moon}}{M_\odot}\left(\dfrac{r_\odot}{r_\text{Moon}}\right)^3$.`],
      teach: 'Tides depend on M/r³, so a nearby small mass can beat a distant huge one.',
      explain: t`$\dfrac{389^3}{2.71\times10^{7}} = ${s3(389 ** 3 / 2.71e7)}$. The Sun's total pull on Earth is $2.71\times10^{7}/389^2 \approx ${Math.round(2.71e7 / 389 ** 2)}$ times the Moon's, but its tide is less than half the Moon's.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.2], y: [-0.6, 2.6], xlabel: '', ylabel: '', xticks: 0.001, yticks: 0.001, aspect: 'wide',
          shade: [{ fn: '2.15', lower: '1.65', from: 0, to: 2.9, color: 'gold', alpha: 0.6 }, { fn: '1.35', lower: '0.85', from: 0, to: 0.0162, color: 'ink2', alpha: 0.9 }],
          points: [{ x: 0.05, y: 2.35, r: 0.01, color: 'gold', label: 'the Sun’s pull on Earth' }, { x: 0.05, y: 1.55, r: 0.01, color: 'ink2', label: 'the Moon’s pull on Earth (a sliver)' }, { x: 0.05, y: 0.4, r: 0.01, color: 'ink3', label: 'Tides? Compute them.' }],
        },
        caption: 'The two bodies’ total pulls on the Earth, to scale. The tides come from differences, which scale differently.',
      },
    }),
    mcq({
      id: 'spring-neap', difficulty: 1,
      prompt: 'Spring tides — the largest tidal range of the month — happen at new moon and full moon. Why?',
      choices: ['The Sun and the Moon then lie on one line with the Earth, so their tidal bulges add', 'The Moon is then closest to the Earth', 'The Moon is then farthest from the Sun', 'The Sun’s and the Moon’s pulls then cancel, letting the water slosh freely'],
      answer: 0,
      why: {
        1: 'Lunar distance varies with a different, 27.6-day rhythm; its effect (perigee tides) is separate.',
        2: 'The Moon’s distance from the Sun barely changes over a month.',
        3: 'At full moon the pulls are opposite, but tidal stretches along a line point outward both ways — they add.',
      },
      hints: ['Each body raises a pair of bulges along the line joining it to the Earth. When do the two lines coincide?'],
      teach: 'Solar and lunar tides add when the Sun, the Earth and the Moon are in line (spring tides), and partly cancel at quarter moons (neap tides).',
      explain: 'At new moon the Sun and Moon are on the same side; at full moon on opposite sides. Either way their bulges line up and add. At first and last quarter the Sun’s bulges sit across the Moon’s, and the range is smallest — neap tides.',
      visual: {
        type: 'graph',
        params: {
          x: [-3.8, 3.8], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          shade: [{ fn: 'sqrt(max(0, 0.36 - x^2))', lower: '-sqrt(max(0, 0.36 - x^2))', from: -0.6, to: 0.6, color: 'teal', alpha: 0.5 }],
          curves: [{ param: ['(0.6 + 0.12*(3*cos(t)^2 - 1))*cos(t)', '(0.6 + 0.12*(3*cos(t)^2 - 1))*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6, dash: true }],
          points: [{ x: -3.3, y: 0, color: 'gold', r: 12, label: 'Sun (far away)', labelDy: -20, labelDx: -30 }, { x: 2.2, y: 0, color: 'ink2', r: 6, label: 'full moon', labelDy: -16, labelDx: -24 }],
        },
        caption: 'The Sun, the Earth with its exaggerated ocean bulges (dashed) and the Moon, lined up at full moon. Not to scale.',
      },
    }),
    num({
      id: 'microgravity', difficulty: 2,
      gen(r) {
        const d = r.pick([10, 20, 50]);
        const rr = 6.791e6, a = tide(GM_EARTH, d, rr);
        return {
          prompt: t`An experiment floats ${d} m from the ISS's centre of mass, on the side facing Earth. The station orbits $6.791\times10^{6}$ m from Earth's centre. Relative to the station, what acceleration does the experiment have? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Along the line to Earth the tidal stretch is 2GMd/r³.' }, { value: 0, feedback: 'Free fall removes the uniform part of gravity, not its variation: a small tidal acceleration remains.' }],
          hints: [t`The station falls as its centre of mass does. A point $d$ closer to Earth is pulled a little harder: $\Delta a = 2GMd/r^3$.`],
          teach: 'Even in orbit, gravity’s variation across a spacecraft remains: “microgravity” is small, not zero.',
          explain: t`$\Delta a = \dfrac{2(3.986\times10^{14})(${d})}{(6.791\times10^{6})^3} = ${tex(a)}\ \text{m/s}^2$ — about ${s3(a / 9.81 * 1e6)} millionths of $g$, pointing toward Earth. Over a few minutes it moves a loose object noticeably: experiments that need the cleanest free fall sit near the station's centre of mass.`,
          visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', r: 1.07, rSlider: false, play: false, readout: false, arrows: true }, caption: 'A ball of free-floating grains near the Earth, released at rest relative to their centre: it starts to stretch toward and away from the Earth and squeeze across. The deformation is drawn hugely exaggerated.' },
        };
      },
    }),
    num({
      id: 'spaghetti', difficulty: 3,
      gen(r) {
        const n = r.pick([5, 10, 20]), k = r.pick([10, 30]);
        const GM = n * GM_SUN, da = k * 9.81, L = 2;
        const rr = Math.cbrt((2 * GM * L) / da), rs = (2 * GM) / C ** 2;
        const GMs = 4.3e6 * GM_SUN, rrS = Math.cbrt((2 * GMs * L) / da), rsS = (2 * GMs) / C ** 2;   // the same for Sagittarius A*
        return {
          prompt: t`An astronaut 2 m tall falls feet first toward a black hole of ${n} solar masses ($GM = ${n}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$). At what distance from its centre does the head-to-feet stretch reach ${k}g ($${s3(da)}\ \text{m/s}^2$)? Give it in km.`,
          answer: rr / 1000, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: Math.cbrt((GM * L) / da) / 1000, feedback: 'Keep the factor 2 in 2GMd/r³.' }, { value: Math.sqrt((2 * GM * L) / da) / 1000, feedback: 'The stretch goes as 1/r³: take a cube root, not a square root.' }],
          hints: [t`Set $\dfrac{2GML}{r^3} = ${s3(da)}\ \text{m/s}^2$ and solve for $r$.`, t`$r = \left(\dfrac{2GML}{\Delta a}\right)^{1/3}$, with $L = 2$ m.`],
          teach: 'Near a stellar-mass black hole tides become deadly thousands of kilometres out — “spaghettification”.',
          explain: t`$r = \left(\dfrac{2(${tex(GM, 4)})(2)}{${s3(da)}}\right)^{1/3} = ${s3(rr / 1000)}$ km — far outside the event horizon, at $2GM/c^2 = ${s3(rs / 1000)}$ km. Around Sagittarius A* (4.3 million solar masses) the same stretch would be reached only ${(Math.round(rrS / 1e7) * 10000).toLocaleString('en-US')} km from the centre — deep inside its ${s3(rsS / 1e9)}-million-km horizon. Big black holes have gentle tides at their edge.`,
          visual: {
            type: 'graph',
            params: {
              x: [1, 5], y: [-2, 10], xlabel: 'log₁₀(distance in km)', ylabel: 'log₁₀(stretch in m/s²)', aspect: 'wide',
              curves: [{ fn: `${r4(Math.log10(2 * GM * L))} - 3*(x + 3)`, domain: [r4(Math.log10(rs / 1000)), 5], color: 'accent' }],
              vlines: [{ x: r4(Math.log10(rs / 1000)), label: 'horizon' }],
            },
            caption: `The head-to-feet stretch on a 2 m body against distance from a ${n}-solar-mass black hole, both in powers of ten: a straight line of slope −3.`,
          },
        };
      },
    }),
    mcq({
      id: 'comet-breakup', difficulty: 2,
      prompt: 'In July 1992 comet Shoemaker–Levy 9 passed very close to Jupiter, and astronomers later saw it broken into about 21 pieces, which hit Jupiter in 1994. What broke it apart?',
      choices: [
        'Jupiter’s tides: the difference in Jupiter’s pull across the comet exceeded the weak gravity holding its loose rubble together',
        'Jupiter’s heat boiled it apart',
        'It collided with one of Jupiter’s moons',
        'Jupiter’s strong pull on the comet as a whole crushed it',
      ],
      answer: 0,
      why: {
        1: 'Jupiter radiates little heat at that distance; comets survive far closer passes by the Sun intact, unless tides break them.',
        2: 'No collision was seen, and the pieces lined up in a row along the orbit — the signature of tidal stretching.',
        3: 'A uniform pull accelerates every part of the comet equally and cannot pull it apart; only the difference in pull can.',
      },
      hints: ['What matters for pulling something apart: the total pull on it, or the difference in pull between its parts?'],
      teach: 'Inside a planet’s Roche limit, tides overcome a loosely bound body’s self-gravity and tear it apart — what gave Saturn its rings, by one hypothesis.',
      explain: 'The comet came within about 40 000 km of Jupiter’s cloud tops, well inside the zone where Jupiter’s tidal stretch beats the comet’s own feeble gravity. Its pieces then followed the orbit as a “string of pearls” — an observed, and spectacular, demonstration of tidal disruption.',
      visual: tidalArrows({ d: 3.5, view: 'tidal', X: 1.5, moonLabel: 'Jupiter', caption: 'The tidal pattern across a small body close to a big one (not to scale): stretched along the line, squeezed across it.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-perigee', difficulty: 2,
      prompt: t`The Moon's distance from Earth varies between about $363\,300$ km (perigee) and $405\,500$ km (apogee). How many times stronger is its tidal stretch on Earth at perigee than at apogee?`,
      answer: (405500 / 363300) ** 3, tol: { rel: 0.005 },
      errors: [{ value: (405500 / 363300) ** 2, feedback: 'That is the ratio of total pulls (1/r²). Tides go as 1/r³.' }],
      hints: [t`$\Delta a \propto 1/r^3$, so the ratio is $(r_\text{apogee}/r_\text{perigee})^3$.`],
      teach: 'Because tides go as 1/r³, a 10% change in distance changes them by about 30%.',
      explain: t`$\left(\dfrac{405\,500}{363\,300}\right)^3 = ${s3((405500 / 363300) ** 3)}$: about ${Math.round(((405500 / 363300) ** 3 - 1) * 100)}% stronger. Perigee at new or full moon gives the year's largest tides.`,
      visual: tidalArrows({ d: 57, view: 'tidal', caption: 'The Moon’s tidal pattern on the Earth (exaggerated): it grows as 1/r³ when the Moon comes closer.' }),
    }),
    mcq({
      id: 'cp-falling-lab', difficulty: 2, transfer: true,
      prompt: 'You are sealed in a windowless spacecraft falling freely toward a planet. Which experiment could tell you that a planet is near?',
      choices: [
        'Release a ring of floating beads and watch: it slowly stretches along one line and squeezes across it',
        'Stand on a bathroom scale: it reads your weight',
        'Drop a ball and see it fall to the floor',
        'None: in free fall every effect of gravity disappears',
      ],
      answer: 0,
      why: {
        1: 'In free fall the scale and you fall together: it reads zero, near a planet or far from one.',
        2: 'The ball falls exactly as the cabin does; it floats beside your hand.',
        3: 'Free fall removes the uniform part of gravity, but not its differences across your cabin — the tides.',
      },
      hints: ['In free fall, which part of gravity can you not feel — and which part survives?'],
      teach: 'Falling cancels gravity’s average pull, but not its variation from place to place: tides are the part of gravity no falling frame can remove.',
      explain: 'Beads nearer the planet are pulled slightly harder, those farther slightly less, and those to the sides are pulled slightly inward (toward the planet’s centre). Relative to the cabin they drift into an oval. Einstein took this seriously: in general relativity tides are the curvature of spacetime — see [Gravity is mostly time running at different rates](#/lesson/gr.S06.i).',
      visual: fallingRing,
    }),
    num({
      id: 'cp-horizon', difficulty: 3, transfer: true,
      gen(r) {
        const [what, n] = r.pick([['Sagittarius A*, the 4.3-million-solar-mass black hole at the centre of our galaxy', 4.3e6], ['a 10-solar-mass black hole', 10], ['M87*, a black hole of 6.5 billion solar masses', 6.5e9]]);
        const GM = n * GM_SUN, rs = (2 * GM) / C ** 2, a = tide(GM, 2, rs);
        return {
          prompt: t`How strong is the head-to-feet stretch on a 2 m astronaut as they reach the event horizon of ${what}? Use $\Delta a = 2GML/r^3$ at $r = 2GM/c^2$, with $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $c = 2.998\times10^{8}$ m/s. (Newton's formula happens to give the same result as general relativity here.)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Keep the factor 2.' }],
          hints: [t`First the horizon radius: $r = 2GM/c^2$ with $GM = ${n}\times1.327\times10^{20}$.`, t`Then $\Delta a = 2GM(2\ \text{m})/r^3$.`],
          teach: 'At the horizon the tide goes as 1/M²: deadly at a small black hole, imperceptible at a giant one.',
          explain: t`$r = ${tex(rs / 1000)}$ km, so $\Delta a = ${tex(a)}\ \text{m/s}^2$ — ${a > 1000 ? 'millions of times g: anyone would be torn apart long before reaching the horizon' : 'far less than g: you would cross the horizon of a supermassive black hole without feeling anything special — and still never come back out'}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 10.5], y: [-12, 11], xlabel: 'log₁₀(mass in solar masses)', ylabel: 'log₁₀(stretch at the horizon, m/s²)', aspect: 'wide',
              curves: [{ fn: `${r4(Math.log10((2 * GM_SUN * 2) / ((2 * GM_SUN) / C ** 2) ** 3))} - 2x`, color: 'accent' }],
              hlines: [{ y: r4(Math.log10(9.81)), label: 'g on Earth', color: 'bad' }],
            },
            caption: 'The stretch on a 2 m body at the event horizon against the black hole’s mass, both in powers of ten: it falls as 1/M².',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.6 Tidal Forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-6-tidal-forces' },
    { label: 'NASA, Comet Shoemaker–Levy 9 (discovery, breakup and Jupiter impacts)', url: 'https://science.nasa.gov/solar-system/comets/shoemaker-levy-9/' },
  ],
});
