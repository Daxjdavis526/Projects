// The equivalence principle — Intuition Mode. Einstein's elevator: a freely
// falling box hides gravity; an accelerating rocket imitates it. From that,
// light must fall and clocks low down must run slow (gh/c², Pound–Rebka).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, g0, GM_EARTH, R_EARTH, DAY, YEAR, R_SUN, M_SUN, G, ARCSEC, sci, round } from './_fasttrack.js';

const t = String.raw;

// numbers quoted in the text, computed once
const shift = (h) => (g0 * h) / (C * C);                 // fractional frequency shift over height h
const drop = (L, a = g0) => 0.5 * a * (L / C) ** 2;      // how far light falls crossing width L
const PR_H = 22.5;
const PR_T = PR_H / C, PR_V = g0 * PR_T, PR_SHIFT = shift(PR_H);
const LIMB = (4 * G * M_SUN) / (C * C * R_SUN) / ARCSEC;  // full GR deflection at the solar limb, arcsec
const gAt = (alt) => GM_EARTH / (R_EARTH + alt * 1e3) ** 2;
const gSurf = GM_EARTH / R_EARTH ** 2;

// the four balls in a big falling box, with Earth's (exaggerated) pull on each
const tidesPicture = (() => {
  const centre = [0, -10], k = 1.2 * 100;   // arrow length 1.2 at the box centre, ∝ 1/d²
  const balls = [[-1.2, 0], [1.2, 0], [0, 1.2], [0, -1.2]];
  const arrows = balls.map(([x, y]) => {
    const dx = centre[0] - x, dy = centre[1] - y, d = Math.hypot(dx, dy), len = k / (d * d);
    return { from: [x, y], to: [round(x + (len * dx) / d, 4), round(y + (len * dy) / d, 4)], color: 'bad' };
  });
  return {
    type: 'graph',
    params: {
      x: [-3.4, 3.4], y: [-3.3, 2.6], equal: true, xlabel: ' ', ylabel: ' ',
      curves: [
        { fn: '2.2', domain: [-2.2, 2.2], color: 'ink2', width: 2 }, { fn: '-2.2', domain: [-2.2, 2.2], color: 'ink2', width: 2 },
        { param: ['-2.2', 't'], t: [-2.2, 2.2], color: 'ink2', width: 2 }, { param: ['2.2', 't'], t: [-2.2, 2.2], color: 'ink2', width: 2 },
      ],
      arrows,
      points: balls.map(([x, y], i) => ({ x, y, color: ['accent', 'teal', 'violet', 'good'][i], r: 7 })).concat([{ x: 0, y: -3.05, color: 'ink3', r: 2, label: 'Earth’s centre: far below' }]),
    },
    caption: 'Seen from the ground: Earth’s pull on each ball (red) points at Earth’s centre and is stronger closer to it. The differences between the arrows are exaggerated enormously — across a 3 m box they are about a millionth of g.',
  };
})();

export default lesson({
  id: 'gr.S05.i',
  title: 'Falling elevators: gravity you cannot feel',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Stand in a lift whose cable has just snapped. You, the lift and the phone you let go of all fall together, so inside nothing seems to fall at all: **in a small, freely falling box, gravity cannot be felt or detected**. It works because everything falls with the same acceleration, whatever it is made of — measured to a few parts in $10^{15}$. Turned around, a box accelerating at $g$ in deep space feels exactly like one standing on Earth. Followed carefully, this **equivalence principle** predicts that light bends in gravity and that clocks low down run slow, by the fraction

$$\frac{\Delta f}{f} = \frac{gh}{c^2}$$`,
  equation: t`a = \frac{m_\text{g}}{m_\text{i}}\,g = g`,
  symbols: [
    { tex: 'a', text: 'the acceleration of a freely falling object, in m/s²' },
    { tex: 'm_\\text{g}', text: 'gravitational mass: how strongly gravity pulls on the object (its “gravitational charge”), in kg' },
    { tex: 'm_\\text{i}', text: 'inertial mass: how hard the object is to accelerate — the $m$ in $F = ma$ — in kg' },
    { tex: 'g', text: 'the strength of gravity where the object is: 9.81 m/s² (pointing down) at Earth’s surface' },
    { tex: '\\Delta f / f', text: 'the fractional change in the frequency of light — or in the tick rate of a clock — between two heights' },
    { tex: 'h', text: 'the height difference, in metres' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
  ],
  why: 'If falling switches gravity off, gravity is not a force acting on things but a property of spacetime itself — and the next lesson shows which property: the rate at which time passes.',
  visual: {
    type: 'gr-elevator',
    title: 'Four boxes, two pairs',
    lead: t`Pick a box and press **Release**: two balls are let go and a light pulse is fired across the box. The left panel is what the passengers see; the right shows the same events from outside.`,
    tasks: ['Compare **Rocket** with **Earth**: the left panels are identical.', 'Compare **Fall** with **Float**: identical again — the balls float and the light goes straight.', 'Turn on tides in the falling box: the side balls drift together, the top and bottom ones apart. No small box can hide that.'],
    params: { mode: 'rocket' },
  },
  example: {
    prompt: t`A rocket accelerates at $g = 9.81\ \text{m/s}^2$ far from any star. A light signal of frequency $f$ goes from the floor to a detector on the ceiling, $h = ${PR_H}$ m higher. What frequency arrives — and what does that predict for light climbing a ${PR_H} m tower on Earth?`,
    steps: [
      { label: 'Travel time', text: t`The light takes $t = h/c = ${PR_H}/(2.998\times10^{8}) = ${sci(PR_T)}$ s to reach the ceiling.` },
      { label: 'The ceiling speeds up', text: t`During that time the ceiling gains speed $v = gt = gh/c = ${sci(PR_V)}$ m/s compared with the floor when it emitted. The detector is moving away from the light.` },
      { label: 'Doppler shift', text: t`A receiver moving away at $v \ll c$ sees the frequency lowered by the fraction $v/c$: $\Delta f/f = v/c = gh/c^2 = ${sci(PR_SHIFT)}$. The ceiling receives **redshifted** light.` },
      { label: 'Equivalence', text: t`A tower on Earth is indistinguishable from the rocket, so light climbing ${PR_H} m must arrive redshifted by the same $${sci(PR_SHIFT)}$ — and light going down blueshifted.` },
      { label: 'Clocks', text: t`Every crest that leaves the floor arrives at the ceiling, and the set-up never changes, so if the ceiling counts fewer crests per second, the floor's clock **really does tick slower**: by $${sci(PR_SHIFT)}$, or $${sci(PR_SHIFT * DAY * 1e9, 2)}$ ns a day.` },
      { label: 'Measured', text: t`Pound and Rebka sent gamma rays up and down Harvard's ${PR_H} m tower in 1960 and found the shift — comparing up with down doubles it to $${sci(2 * PR_SHIFT, 2)}$ — at 1.05 ± 0.10 times the prediction. By 1965 the agreement was 1%.` },
    ],
    answer: t`The ceiling receives $f\,(1 - ${sci(PR_SHIFT)})$. By the equivalence principle, light climbing a ${PR_H} m tower is redshifted by $gh/c^2 = ${sci(PR_SHIFT)}$ — observed by Pound and Rebka in 1960.`,
  },
  practice: [
    mcq({
      id: 'which-box', difficulty: 1,
      prompt: 'You wake up inside a small, windowless box. A ball you let go of falls to the floor at 9.81 m/s². What can you conclude?',
      choices: [
        'You are on Earth, or in a rocket accelerating at 9.81 m/s² far from any star — nothing inside a small box can tell which',
        'You are on Earth: far from any star nothing pulls on the ball, so it could not fall',
        'You are falling freely near Earth',
        'You are on Earth: a bathroom scale would show your weight, and in a rocket it would read zero',
      ],
      answer: 0,
      why: {
        1: 'In the rocket the ball does just hang there — but the floor accelerates up into it. From inside, that is exactly what falling looks like.',
        2: 'In a freely falling box a released ball floats beside you.',
        3: 'The scale reads the same in the rocket: the floor has to push you upward to accelerate you at g.',
      },
      hints: ['What would the same experiment look like in a rocket accelerating at 9.81 m/s², far from any star?'],
      teach: 'A uniform gravitational field and a uniform acceleration are indistinguishable from inside a small box.',
      explain: 'In a rocket accelerating at g, the released ball floats while the floor rushes up to meet it; inside, that looks exactly like falling at g. Only a look outside — or tides, in a large box — could tell the two apart.',
    }),
    num({
      id: 'orbit-g', difficulty: 2,
      gen(r) {
        const [alt, what] = r.pick([[400, 'The International Space Station'], [540, 'The Hubble Space Telescope'], [2000, 'A satellite at the top of low Earth orbit'], [20200, 'A GPS satellite']]);
        const g = gAt(alt), rr = R_EARTH + alt * 1e3, pct = Math.round((100 * g) / gSurf);
        return {
          prompt: t`${what} orbits ${alt.toLocaleString('en-US')} km above the ground. Using $GM_\oplus = ${sci(GM_EARTH, 4)}\ \text{m}^3/\text{s}^2$ and Earth's radius 6371 km, how strong is gravity there?`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: GM_EARTH / (alt * 1e3) ** 2, feedback: 'Measure from Earth’s centre, not from the ground: r = 6371 km + altitude.' },
            { value: gSurf, feedback: 'That is the value at the ground. Up there, r = 6371 km + altitude.' },
            { value: 0, feedback: 'Gravity does not switch off in orbit — it is what keeps the satellite going round.' },
          ],
          hints: [t`Gravity weakens with distance from Earth's **centre**: $g = GM/r^2$.`, t`Here $r = 6371 + ${alt} = ${6371 + alt}$ km $= ${sci(rr, 4)}$ m. Square it, then divide.`],
          teach: 'Astronauts float because they and their station fall together, not because gravity has vanished.',
          explain: t`$g = GM/r^2 = ${sci(GM_EARTH, 4)}/(${sci(rr, 4)})^2 = ${sci(g)}\ \text{m/s}^2$ — ${pct}% of the ${sci(gSurf)} m/s² at the ground. The craft and everything in it fall together around Earth, so nothing inside presses on anything: they float.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, alt > 3000 ? 24000 : 2400], y: [0, 10.5], xlabel: 'altitude (km)', ylabel: 'g (m/s²)',
              curves: [{ fn: `${GM_EARTH}/(6.371e6 + 1000x)^2`, color: 'accent' }],
              points: [{ x: alt, y: round(g, 4), color: 'gold', label: `${alt} km` }],
            },
            caption: 'Gravity against altitude, from g = GM/r². It fades slowly: low orbits are still deep in Earth’s field.',
          },
        };
      },
    }),
    num({
      id: 'light-drop', difficulty: 2,
      gen(r) {
        const L = r.pick([2, 3, 5, 10, 25]);
        const tt = L / C, d = drop(L);
        const yMax = (d / 1e-16) * 1.25;
        return {
          prompt: t`A laser beam is fired straight across a cabin ${L} m wide that accelerates upward at $g = 9.81\ \text{m/s}^2$ — or, equivalently, stands on Earth. How far below its starting height does the beam hit the far wall?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: g0 * tt * tt, feedback: 'You dropped the ½: something that starts with no vertical speed falls ½gt².' },
            { value: 0.5 * g0 * tt, feedback: 'Square the travel time: the drop is ½gt² with t = L/c.' },
          ],
          hints: [t`The beam takes $t = L/c$ to cross. Relative to the cabin it falls like a dropped ball: $\tfrac12 g t^2$.`, t`$t = ${L}/(2.998\times10^{8}) = ${sci(tt)}$ s.`],
          teach: 'Light falls in a gravitational field by the same ½gt² as everything else — but it crosses a room so fast that the drop is about 10⁻¹⁶ m.',
          explain: t`$t = L/c = ${sci(tt)}$ s, so the drop is $\tfrac12(9.81)(${sci(tt)})^2 = ${sci(d)}$ m — smaller than an atomic nucleus. To see light fall you need the Sun.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, L * 1.08], y: [-yMax, yMax * 0.15], xlabel: 'distance across the cabin (m)', ylabel: 'height (10⁻¹⁶ m)',
              curves: [{ fn: '-0.5*9.81*(x/2.998e8)^2/1e-16', domain: [0, L], color: 'gold' }],
              points: [{ x: L, y: round(-d / 1e-16, 4), color: 'gold', label: 'far wall' }],
            },
            caption: 'The beam’s path relative to the cabin. Note the vertical scale: one unit is 10⁻¹⁶ m.',
          },
        };
      },
    }),
    mcq({
      id: 'tides', difficulty: 2,
      prompt: 'A very large box falls freely toward Earth. Four balls float at rest inside it: one on each side of the centre, one above it and one below it. Seen from inside the box, how do they drift?',
      choices: [
        'The side balls drift together; the top and bottom balls drift apart',
        'They all stay exactly where they are',
        'The side balls drift apart; the top and bottom balls drift together',
        'They all drift toward the floor together',
      ],
      answer: 0,
      why: {
        1: 'That holds for a small box over a short time. Across a large box, Earth’s pull differs in direction and strength from ball to ball.',
        2: 'Reversed: the pulls all point at Earth’s centre, so balls side by side converge — and the lower ball is pulled harder than the upper one.',
        3: 'The box falls with them at the average rate; inside, only the differences from that average show up.',
      },
      hints: ['Inside the falling box, only the *differences* between each ball’s pull and the pull at the centre show up.', 'Both side arrows point slightly inward, toward Earth’s centre. The bottom ball is closer to Earth than the top one.'],
      teach: 'Tides — differences in gravity across a region — stretch along the line to the mass and squeeze across it, and no falling frame removes them.',
      explain: 'Each ball falls toward Earth’s centre. The side balls’ paths converge, so they drift together; the bottom ball is pulled a little harder than the centre and the top ball a little less, so they drift apart. These tidal drifts are what remains of gravity in a falling box — the part that is real spacetime curvature.',
      visual: tidesPicture,
    }),
    num({
      id: 'up-shift', difficulty: 2,
      gen(r) {
        const [h, where] = r.pick([[22.5, 'the Harvard tower used by Pound and Rebka'], [45, 'a water tower'], [100, 'a radio mast'], [8.5, 'a three-storey building']]);
        const s = shift(h);
        return {
          prompt: t`Light climbs ${h} m up ${where}. By what fraction $\Delta f/f$ is its frequency lowered? Use $g = 9.81\ \text{m/s}^2$.`,
          answer: s, tol: { rel: 0.01 },
          errors: [
            { value: 2 * s, feedback: 'That is the difference between light sent up and light sent down. One way is gh/c².' },
            { value: (g0 * h) / C, feedback: 'Divide by c twice: the shift is gh/c².' },
          ],
          hints: [t`$\Delta f/f = gh/c^2$, with $c^2 = (2.998\times10^{8})^2 \approx 8.99\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'Light climbing a height h in a field g is redshifted by the fraction gh/c², whatever its frequency.',
          explain: t`$\Delta f/f = (9.81)(${h})/(2.998\times10^{8})^2 = ${sci(s)}$. Gamma rays, radio waves and the ticks of a clock are all shifted by the same fraction.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.5, 3.5], y: [-17.5, -12.5], xlabel: 'log₁₀(height in m)', ylabel: 'log₁₀(Δf/f)',
              curves: [{ fn: 'log(9.81*10^x/(2.998e8)^2)', color: 'accent' }],
              points: [
                { x: round(Math.log10(0.33), 4), y: round(Math.log10(shift(0.33)), 4), color: 'good', label: 'optical clocks 33 cm apart (2010)' },
                { x: round(Math.log10(22.5), 4), y: round(Math.log10(shift(22.5)), 4), color: 'gold', label: 'Pound–Rebka (1960)' },
                ...(h === 22.5 ? [] : [{ x: round(Math.log10(h), 4), y: round(Math.log10(s), 4), color: 'violet', label: 'this one' }]),
              ],
            },
            caption: 'Both axes count powers of ten. The shift grows in proportion to the height, so the line has slope 1.',
          },
        };
      },
    }),
    num({
      id: 'tower-ns', difficulty: 3,
      gen(r) {
        const [h, where] = r.pick([[330, 'the Eiffel Tower (330 m)'], [553, 'Toronto’s CN Tower (553 m)'], [828, 'the Burj Khalifa (828 m)'], [1609, 'a mile-high city (1609 m), compared with one at sea level']]);
        const f = shift(h), sec = f * DAY, ns = sec * 1e9;
        return {
          prompt: t`One clock sits at the top of ${where}, an identical one at the bottom. How many nanoseconds per day does the higher clock gain?`,
          answer: ns, units: 'ns', tol: { rel: 0.01 },
          errors: [
            { value: sec, feedback: 'That number is in seconds. Convert to nanoseconds: 1 ns = 10⁻⁹ s.' },
            { value: f * 3600 * 1e9, feedback: 'That is per hour. A day has 86 400 seconds.' },
          ],
          hints: [t`The higher clock runs fast by the fraction $gh/c^2$.`, t`Multiply that fraction by the 86 400 seconds in a day, then convert to ns ($1\ \text{ns} = 10^{-9}$ s).`],
          teach: 'A higher clock runs fast by the fraction gh/c², which adds up to nanoseconds per day for a tall building.',
          explain: t`$gh/c^2 = ${sci(f)}$; times 86 400 s that is $${sci(sec)}$ s $= ${sci(ns)}$ ns per day. Today’s best optical clocks can sense the difference across a single millimetre.`,
        };
      },
    }),
    mcq({
      id: 'half-bending', difficulty: 3,
      prompt: t`The equivalence principle alone predicts that starlight grazing the Sun is bent by about $${sci(LIMB / 2)}''$ (Einstein’s 1911 estimate was $0.83''$). Full general relativity (1915) predicts $${sci(LIMB)}''$, and measurements agree with the larger value. Why is the full answer twice the equivalence-principle one?`,
      choices: [
        'The equivalence principle captures only the slowing of time near the Sun; light moving at c also feels the curvature of space, which bends it by an equal amount',
        'Einstein made an arithmetic slip in 1911',
        'Light has a tiny mass, and that mass doubles the pull',
        'The Sun’s rotation drags the light and supplies the second half',
      ],
      answer: 0,
      why: {
        1: 'The 1911 value is the correct consequence of the equivalence principle alone; the factor 2 is new physics, not a correction of arithmetic.',
        2: 'Light carries no mass, and the equivalence-principle bending does not depend on mass anyway.',
        3: 'The Sun’s rotational frame dragging changes the deflection by about a millionth of an arcsecond.',
      },
      hints: ['A falling box (the equivalence principle) knows about acceleration — which is tied to how clock rates change with height.', 'Something moving as fast as light also crosses distances that are themselves altered near the Sun.'],
      teach: 'The equivalence principle gives half of light bending; the other half comes from the curvature of space, which matters only for things moving near light speed.',
      explain: t`The equivalence principle predicts the bending caused by the slowing of time near the Sun — the same effect that makes apples fall. For slow objects that is essentially all of gravity, but light also travels through curved space, which adds an equal bending. The 1919 eclipse expeditions favoured $1.75''$; radio measurements now confirm it to about 1 part in 10 000.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.8, 6], y: [0, 2.2], xlabel: 'closest approach to the Sun’s centre (solar radii)', ylabel: 'bending (arcsec)',
          curves: [
            { fn: `${round(LIMB, 5)}/x`, color: 'gold', label: 'general relativity', labelAt: 2.4 },
            { fn: `${round(LIMB / 2, 5)}/x`, color: 'accent', dash: true, label: 'equivalence principle alone', labelAt: 3.2 },
          ],
          points: [{ x: 1, y: round(LIMB, 4), color: 'gold' }, { x: 1, y: round(LIMB / 2, 4), color: 'accent' }],
          vlines: [{ x: 1, label: 'Sun’s edge' }],
        },
        caption: 'Bending of starlight passing the Sun, in the weak-field formula: it falls off as 1/(closest distance).',
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-no-experiment', difficulty: 2,
      prompt: 'A sealed box is either falling freely near Earth or floating far out in space. Which experiment, done entirely inside it within a few seconds, can tell which?',
      choices: [
        'None, if the box is small enough: only tides could tell, and they shrink as the box shrinks',
        'Let go of a ball: near Earth it falls to the floor',
        'Fire a laser across: near Earth the beam bends downward',
        'Stand on a bathroom scale: near Earth it shows your weight',
      ],
      answer: 0,
      why: {
        1: 'In the falling box the floor falls exactly as fast as the ball, so the ball floats in both cases.',
        2: 'In the falling box the light falls along with the box, so relative to the box the beam goes straight in both cases.',
        3: 'In free fall the scale falls with you and reads zero — in both cases.',
      },
      hints: ['In free fall, the box, the ball, the scale and the light all fall together.'],
      teach: 'A freely falling box is locally indistinguishable from one floating far from all masses; only tides, which grow with the size of the box, betray gravity.',
      explain: 'Everything inside the falling box — balls, scale, light — falls at the same rate as the box, so every experiment comes out as it would in deep space. Only tidal drifts could tell, and they vanish for a small enough box and a short enough time.',
    }),
    num({
      id: 'cp-optical', difficulty: 2,
      gen(r) {
        const cm = r.pick([10, 20, 33, 50, 75]);
        const s = shift(cm / 100);
        return {
          prompt: t`Two optical clocks are compared in a laboratory; one sits ${cm} cm higher than the other. By what fraction does the higher clock run fast? (In 2010 NIST resolved this effect for a 33 cm rise.)`,
          answer: s, tol: { rel: 0.01 },
          hints: ['Convert the height to metres first.', t`$gh/c^2$ with $g = 9.81\ \text{m/s}^2$.`],
          teach: 'Clocks a height h apart differ in rate by gh/c² — about 10⁻¹⁶ per metre at Earth’s surface.',
          explain: t`$gh/c^2 = (9.81)(${cm / 100})/(2.998\times10^{8})^2 = ${sci(s)}$ — a gain of one second every $${sci(1 / s / YEAR, 2)}$ years.`,
        };
      },
    }),
    num({
      id: 'cp-starship', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([30, 60, 90, 120]);
        const ns = shift(h) * YEAR * 1e9;
        return {
          prompt: t`A starship accelerates at a steady $9.81\ \text{m/s}^2$ for a year. Its nose is ${h} m ahead of its tail, in the direction of the acceleration. By how many nanoseconds does the nose clock get ahead of the tail clock? (A year is $3.156\times10^{7}$ s.)`,
          answer: ns, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: -ns, feedback: 'The nose is “upstairs” in the accelerating ship, so its clock runs fast, not slow.' }],
          hints: [t`By the equivalence principle the accelerating ship is like a tower on Earth with the nose at the top: the nose runs fast by $gh/c^2$.`, 'Multiply that fraction by 3.156×10⁷ s, then convert to ns.'],
          teach: 'In an accelerating rocket the front clock runs fast by ah/c², exactly like a higher clock in a gravitational field.',
          explain: t`$gh/c^2 = ${sci(shift(h))}$; over $3.156\times10^{7}$ s the nose gains $${sci(ns)}$ ns. Light signals between the two ends would show it: the tail’s ticks arrive at the nose redshifted.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Pound & Rebka, Phys. Rev. Lett. 4, 337 (1960)', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Touboul et al. (MICROSCOPE), Phys. Rev. Lett. 129, 121102 (2022)', url: 'https://arxiv.org/abs/2209.15487' },
    { label: 'Chou et al., “Optical clocks and relativity”, Science 329, 1630 (2010)', url: 'https://doi.org/10.1126/science.1192720' },
  ],
});
