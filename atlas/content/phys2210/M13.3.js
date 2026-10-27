// Gravitational potential energy and escape speed: U = −GMm/r with zero at
// infinity, bound (E < 0) and unbound (E ≥ 0) motion, and v_esc = √(2GM/R).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GM_EARTH, R_EARTH, gN, uWell } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);
const vEsc = (GM, R) => Math.sqrt((2 * GM) / R);
const VE = vEsc(GM_EARTH, R_EARTH);                          // 11.19 km/s

// escape speed against launch distance, for a body with surface escape speed ve (in `unit`)
const escapeCurve = (ve, mark, unit = 'km/s') => ({
  type: 'graph',
  params: {
    x: [0, 6], y: [0, r4(ve * 1.25)], xlabel: 'launch distance from the centre, r / R', ylabel: `escape speed (${unit})`, aspect: 'wide',
    curves: [{ fn: `${r4(ve)}*sqrt(1/x)`, domain: [1, 6], color: 'accent' }],
    points: mark ? [mark] : [],
  },
  caption: 'Escape speed √(2GM/r) against the distance you start from: it falls slowly with height.',
});

// known escape speeds (km/s) as horizontal bars, with the one asked about marked '?'
const KNOWN = [['Earth', 11.19], ['Mars', 5.03], ['the Moon', 2.38], ['Mercury', 4.25]];
const escapeBars = (asked) => {
  const rows = [...KNOWN.map(([n, v]) => ({ n, v })), { n: asked, v: null }];
  return {
    type: 'graph',
    params: {
      x: [0, 12.5], y: [-0.6, rows.length - 0.3], xlabel: 'escape speed from the surface (km/s)', ylabel: '', yticks: 0.001, aspect: 'wide',
      shade: rows.filter((q) => q.v).map((q, i) => ({ fn: String(rows.length - 1 - i + 0.3), lower: String(rows.length - 1 - i - 0.3), from: 0, to: q.v, color: 'accent', alpha: 0.55 })),
      points: rows.map((q, i) => ({ x: q.v ?? 0.2, y: rows.length - 1 - i, r: 0.01, color: q.v ? 'ink2' : 'gold', label: q.v ? `${q.n}: ${q.v} km/s` : `${q.n}: ?`, labelDx: 8, labelDy: 0 })),
    },
    caption: 'Escape speeds from the surfaces of some familiar worlds, for comparison.',
  };
};

// asteroid Bennu to scale, with an (enlarged) astronaut on top
const bennuPicture = {
  type: 'graph',
  params: {
    x: [-420, 420], y: [-290, 340], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    shade: [{ fn: 'sqrt(max(0, 60025 - x^2))', lower: '-sqrt(max(0, 60025 - x^2))', from: -245, to: 245, color: 'ink2', alpha: 0.6 }],
    curves: [{ param: ['245cos(t)', '245sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 }, { param: ['t', '-270'], t: [-245, 245], color: 'gold', width: 1.4 }],
    arrows: [{ from: [0, 262], to: [0, 330], color: 'good', label: 'a gentle hop?', labelDx: 8, labelDy: 4 }],
    points: [{ x: 0, y: 255, color: 'accent', r: 5, label: 'astronaut (enlarged)', labelDx: 10, labelDy: -2 }, { x: -60, y: -270, r: 0.01, color: 'gold', label: '490 m', labelDy: 14 }],
  },
  caption: 'Bennu to scale, about 490 m across (it is really a lumpy spinning top, not a sphere). The astronaut is drawn far larger than life.',
};

// the Earth example
const EX = { m: 1000 };
EX.U = (-GM_EARTH * EX.m) / R_EARTH;

export default lesson({
  id: 'phys2210.M13.3',
  title: 'Gravitational potential energy and escape speed',
  minutes: 11, difficulty: 3,
  intro: t`Near the ground, lifting a mass $m$ by $h$ costs $mgh$. Far from the ground $g$ itself weakens, and the honest answer comes from adding up $F\,dr$ with $F = GMm/r^2$: climbing from $r$ all the way to infinity takes $GMm/r$. Choosing zero at infinity,

$$U(r) = -\frac{GMm}{r},\qquad v_\text{esc} = \sqrt{\frac{2GM}{R}}$$

$U$ is negative everywhere: anything near a planet sits in a well it must climb out of. If the total energy $E = \tfrac12 mv^2 - GMm/r$ is negative, the body is **bound** and must fall back or orbit; at $E = 0$ it just escapes. The escape speed does not depend on the escaping mass — nor, ignoring air, on the direction of launch.`,
  symbols: [
    { tex: 'U', text: 'gravitational potential energy, in joules (J), with $U = 0$ when the masses are infinitely far apart' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$' },
    { tex: 'M', text: 'the mass of the planet, star or moon, in kg ($GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$ for Earth)' },
    { tex: 'm', text: 'the mass of the small body, in kg — it cancels out of the escape speed' },
    { tex: 'r', text: 'the distance between the centres, in m' },
    { tex: 'v_\\text{esc}', text: 'the escape speed: the smallest launch speed from distance $R$ that lets an unpowered body coast away forever, in m/s' },
    { tex: 'R', text: 'the distance you launch from, measured from the centre — the radius, for a launch from the surface' },
  ],
  why: 'Every interplanetary mission is an energy budget in this well; and setting the escape speed equal to the speed of light gives 2GM/c², the size of a black hole — a coincidence the Road to Einstein explains.',
  visual: {
    type: 'mech-kepler',
    title: 'Fire faster and faster',
    lead: t`Newton's cannon: a projectile fired sideways from a height $h$ above a round, airless Earth. Raise the speed and watch the path — and the energy readout, $\tfrac12 v^2 - GM/r$ per kilogram.`,
    tasks: [
      'Raise the speed until the path closes into a circle: the circular speed √(GM/r). The energy is negative: the orbit is bound.',
      'Keep going: the orbit stretches into a longer and longer ellipse, until at √2 times the circular speed the energy reaches zero and the path opens out — escape.',
      'Change the launch height: the circular and escape speeds both fall, but their ratio stays √2.',
    ],
    params: { launch: { body: 'earth', h: 1000e3, v: 6.5, vRange: [3, 12], hSlider: true, view: 2.7 }, sectors: 0, sweep: false, readout: ['fate', 'E', 'vc', 'vesc'], autoplay: true },
  },
  example: {
    prompt: t`How fast must something leave Earth's surface to escape, if air resistance is ignored? How much energy would a ${EX.m} kg probe need, and how does that compare with the energy to lift it 1 km? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
    visual: uWell({ energies: [{ E: 0, label: 'E = 0: just escapes' }, { E: -0.5, label: 'E < 0: falls back', color: 'warn' }], points: [{ x: 1, y: -1, color: 'gold', label: 'at the surface', labelDx: 10 }], caption: 'The well U = −GMm/r, in units of GMm/R. A body launched from the surface with total energy E < 0 turns back where the line meets the curve; with E ≥ 0 it never does.' }),
    steps: [
      { label: 'Energy at the start', text: t`At the surface, $E = \tfrac12 mv^2 - \dfrac{GMm}{R}$.` },
      { label: 'Just escaping', text: t`To coast away forever it must still have $K \ge 0$ when $U$ has risen to $0$, so it needs $E \ge 0$: $\tfrac12 mv^2 = \dfrac{GMm}{R}$. The mass $m$ cancels: $v_\text{esc} = \sqrt{\dfrac{2GM}{R}}$.` },
      { label: 'Numbers', text: t`$v_\text{esc} = \sqrt{\dfrac{2(3.986\times10^{14})}{6.371\times10^{6}}} = ${s3(VE / 1000)}$ km/s.` },
      { label: 'The energy bill', text: t`The probe starts at $U = -GMm/R = ${tex(EX.U)}$ J, so it needs $${tex(-EX.U)}$ J — ${s3(-EX.U / EX.m / 1e6)} MJ per kilogram. Lifting it 1 km takes $mgh = ${tex(EX.m * gN * 1000)}$ J, so escaping costs as much as climbing ${grpKm(-EX.U / (EX.m * gN * 1000))} km at full surface gravity — exactly one Earth radius, since $\dfrac{GM/R}{g_0} = \dfrac{GM/R}{GM/R^2} = R$.` },
      { label: 'Sense check', text: t`$v_\text{esc} = \sqrt2\times$ the speed of a circular orbit just above the ground (${s3(VE / Math.SQRT2 / 1000)} km/s). Real launches go east to borrow Earth's 0.46 km/s spin, and lose extra speed to air drag and to gravity during the climb.` },
    ],
    answer: t`$v_\text{esc} = ${s3(VE / 1000)}$ km/s; the probe needs $${tex(-EX.U)}$ J — the energy of a climb of one Earth radius in uniform surface gravity.`,
  },
  practice: [
    num({
      id: 'u-negative', difficulty: 1,
      gen(r) {
        const m = r.pick([500, 1000, 2000]), [what, h] = r.pick([['the ISS’s height, 420 km', 420], ['800 km up', 800], ['GPS height, 20 200 km up', 20200]]);
        const rr = R_EARTH + h * 1000, U = (-GM_EARTH * m) / rr;
        return {
          prompt: t`What is the gravitational potential energy of a ${m} kg satellite at ${what}, taking $U = 0$ infinitely far away? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: -U, feedback: 'With zero at infinity, every finite distance has U < 0: the satellite is in a well.' }, { value: m * gN * h * 1000, feedback: t`$mgh$ measures from the ground with $g$ constant; here $U = -GMm/r$, with $r$ from Earth's centre.` }],
          hints: [t`$U = -GMm/r$ with $r = R + h$ in metres.`],
          teach: 'With its zero at infinity, gravitational potential energy is negative everywhere: −GMm/r.',
          explain: t`$U = -\dfrac{(3.986\times10^{14})(${m})}{${tex(rr, 5)}} = ${tex(U)}$ J.`,
          visual: uWell({ points: [{ x: r4(rr / R_EARTH), y: r4(-R_EARTH / rr), color: 'gold', label: 'the satellite', labelDx: 8, labelDy: 14 }] }),
        };
      },
    }),
    num({
      id: 'lift-to-geo', difficulty: 2,
      gen(r) {
        const m = r.pick([500, 1000, 3000]), rg = 42164e3;
        const dU = GM_EARTH * m * (1 / R_EARTH - 1 / rg), mgh = m * gN * (rg - R_EARTH);
        return {
          prompt: t`How much does the potential energy of a ${m} kg satellite rise when it goes from Earth's surface to geostationary distance, $4.2164\times10^{7}$ m from Earth's centre? Give the answer in gigajoules. ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6.371\times10^{6}$ m)`,
          answer: dU / 1e9, units: 'GJ', tol: { rel: 0.01 },
          errors: [{ value: mgh / 1e9, feedback: t`$mgh$ assumes $g$ stays at 9.8 m/s² all the way up. It falls to 0.22 m/s² by geostationary height, so $mgh$ overestimates ${s3(mgh / dU)}-fold.` }],
          hints: [t`$\Delta U = U_\text{final} - U_\text{initial} = -\dfrac{GMm}{r} + \dfrac{GMm}{R} = GMm\left(\dfrac1R - \dfrac1r\right)$.`],
          teach: 'For large heights, use ΔU = GMm(1/R − 1/r); mgh assumes a constant g and badly overestimates.',
          explain: t`$\Delta U = (3.986\times10^{14})(${m})\left(\dfrac{1}{6.371\times10^{6}} - \dfrac{1}{4.2164\times10^{7}}\right) = ${tex(dU)}$ J $= ${s3(dU / 1e9)}$ GJ. (The orbit also needs kinetic energy; that comes in the next lesson.)`,
          visual: uWell({ points: [{ x: 1, y: -1, color: 'gold', label: 'surface', labelDx: 8 }, { x: r4(rg / R_EARTH), y: r4(-R_EARTH / rg), color: 'gold', label: 'geostationary', labelDy: -14, labelDx: -40 }] }),
        };
      },
    }),
    num({
      id: 'escape-moons', difficulty: 2,
      gen(r) {
        const [name, GM, R] = r.pick([['the dwarf planet Ceres', 6.263e10, 4.697e5], ['Jupiter’s moon Europa', 3.2027e12, 1.5608e6], ['Saturn’s moon Titan', 8.9781e12, 2.5747e6], ['Pluto', 8.696e11, 1.1883e6]]);
        const v = vEsc(GM, R);
        return {
          prompt: t`What is the escape speed from the surface of ${name} ($GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$, radius ${(R / 1000).toLocaleString('en-US')} km)? Give it in m/s.`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(GM / R), feedback: 'That is the circular-orbit speed at the surface. Escape needs √2 times more: √(2GM/R).' }, { value: (2 * GM) / R, feedback: 'Take the square root.' }],
          hints: [t`$v_\text{esc} = \sqrt{2GM/R}$, with $R$ in metres.`],
          teach: 'Small worlds have small escape speeds: v = √(2GM/R).',
          explain: t`$v_\text{esc} = \sqrt{\dfrac{2(${tex(GM, 4)})}{${tex(R, 5)}}} = ${s3(v)}$ m/s${v < 1000 ? ' — slower than a rifle bullet' : ''}.`,
          visual: escapeBars(name.replace(/^the dwarf planet |^Jupiter’s moon |^Saturn’s moon /, '')),
        };
      },
    }),
    mcq({
      id: 'any-mass', difficulty: 2,
      prompt: 'A 10-tonne spacecraft and a 1 kg instrument are launched from the same place on Earth. Ignoring air, which needs the higher launch speed to escape?',
      choices: ['Neither: both need the same 11.2 km/s', 'The spacecraft: it is 10 000 times heavier', 'The instrument: lighter things are held less tightly, but also pushed less', 'The spacecraft needs √10 000 = 100 times the speed'],
      answer: 0,
      why: {
        1: 'It needs 10 000 times more energy — but its kinetic energy at a given speed is also 10 000 times larger. The mass cancels.',
        2: 'Both the energy needed and the energy supplied scale with mass, so the speed needed is the same.',
        3: t`The escape speed is $\sqrt{2GM/R}$ — it contains the planet's mass, not the spacecraft's.`,
      },
      hints: [t`Set $\tfrac12 mv^2 = GMm/R$ and look at what happens to $m$.`],
      teach: 'Escape speed depends on the planet (M and R), not on the escaping body; the energy needed does grow with its mass.',
      explain: t`$\tfrac12 mv^2 = GMm/R$ gives $v = \sqrt{2GM/R}$, the same for every mass. The *energy*, $GMm/R$, is proportional to the mass — which is what makes heavy launches expensive.`,
      visual: escapeCurve(VE / 1000, { x: 1, y: r4(VE / 1000), color: 'gold', label: 'Earth’s surface', labelDx: 8 }),
    }),
    num({
      id: 'v-infinity', difficulty: 2,
      gen(r) {
        const v = r.pick([12, 13, 14, 16]);
        const vinf = Math.sqrt(v * v - (VE / 1000) ** 2);
        return {
          prompt: t`A probe leaves Earth's surface at ${v} km/s (ignore air and Earth's spin). How fast is it still moving once it is far from Earth? Earth's escape speed is ${s3(VE / 1000)} km/s.`,
          answer: vinf, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: v - VE / 1000, feedback: t`Energies add, not speeds: $\tfrac12 v_\infty^2 = \tfrac12 v^2 - \tfrac12 v_\text{esc}^2$.` }],
          hints: [t`Energy per kg: $\tfrac12 v^2 - \dfrac{GM}{R} = \tfrac12 v_\infty^2 - 0$, and $\dfrac{GM}{R} = \tfrac12 v_\text{esc}^2$.`],
          teach: 'Leaving faster than the escape speed, a body keeps v∞ = √(v² − v_esc²) far away: the well takes its toll in energy.',
          explain: t`$v_\infty = \sqrt{${v}^2 - ${s3(VE / 1000)}^2} = ${s3(vinf)}$ km/s. A little extra launch speed buys a lot of speed at infinity — the reason upper stages are so valuable.`,
          visual: { type: 'mech-kepler', params: { launch: { body: 'earth', h: 0, v, vRange: [3, 20], view: 3 }, sectors: 0, controls: false, readout: false }, caption: 'The probe’s path, seen from above, if it left Earth sideways (the speed it keeps far away does not depend on the direction). To scale.' },
        };
      },
    }),
    num({
      id: 'max-height', difficulty: 3,
      gen(r) {
        const v = r.pick([3, 4, 5, 6, 7]) * 1000;
        const rmax = 1 / (1 / R_EARTH - (v * v) / (2 * GM_EARTH)), h = rmax - R_EARTH;
        return {
          prompt: t`A rocket burns out at ground level moving straight up at ${v / 1000} km/s. Ignoring air, how high does it coast before it stops and falls back? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: h / 1000, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (v * v) / (2 * gN) / 1000, feedback: t`$v^2/2g$ assumes $g$ stays 9.8 m/s² all the way up. It weakens with height, so the rocket goes higher: use $U = -GMm/r$.` }],
          hints: [
            t`Conserve energy per kg between burnout and the top: $\tfrac12 v^2 - \dfrac{GM}{R} = 0 - \dfrac{GM}{r_\text{max}}$.`,
            t`So $\dfrac{1}{r_\text{max}} = \dfrac1R - \dfrac{v^2}{2GM}$.`,
            t`Then the height is $r_\text{max} - R$.`,
          ],
          teach: 'For large heights, energy conservation must use U = −GMm/r; v²/2g underestimates how high a fast rocket coasts.',
          explain: t`$\dfrac{1}{r_\text{max}} = \dfrac{1}{6.371\times10^{6}} - \dfrac{(${v})^2}{2(3.986\times10^{14})}$, so $r_\text{max} = ${tex(rmax, 4)}$ m and $h = ${s3(h / 1000)}$ km — ${s3(((h / 1000) / ((v * v) / (2 * gN) / 1000) - 1) * 100)}% higher than the constant-$g$ estimate.`,
          visual: uWell({ xmax: 3, energies: [{ E: r4(-R_EARTH / rmax), label: 'E at burnout' }], points: [{ x: 1, y: -1, color: 'gold', label: 'burnout', labelDx: 8 }] }),
        };
      },
    }),
    mcq({
      id: 'bound', difficulty: 2,
      prompt: 'A satellite’s total energy, E = ½mv² − GMm/r, is negative. What does that tell you?',
      choices: ['It is bound: it can never reach an infinite distance, so it must orbit or fall back', 'It is falling toward the planet right now', 'It has negative kinetic energy', 'It is moving faster than the escape speed'],
      answer: 0,
      why: {
        1: 'A circular orbit has E < 0 too, and never falls in. Negative E only caps how far away it can get.',
        2: 'Kinetic energy is never negative; it is the potential energy that is negative.',
        3: 'Faster than escape speed means ½mv² > GMm/r, which makes E positive.',
      },
      hints: ['Far away, U → 0. Could the kinetic energy there be negative?'],
      teach: 'Negative total energy means bound motion: the body cannot reach infinity, because there it would need K = E < 0.',
      explain: t`At infinity $U = 0$, so $K$ would equal $E$ — impossible when $E < 0$. The body turns back at $r_\text{max} = GMm/|E|$: an ellipse or a circle, or a fall. $E = 0$ is the border: the parabolic escape.`,
      visual: uWell({ energies: [{ E: -0.35, label: 'E < 0', color: 'warn' }], caption: 'The well U = −GMm/r and a negative total energy (orange): the body is confined to where the line lies above the curve.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bennu', difficulty: 2, transfer: true,
      prompt: t`NASA's OSIRIS-REx spacecraft found that the asteroid Bennu has a mass of $7.33\times10^{10}$ kg and a mean radius of 245 m. What is the escape speed from its surface? Could an astronaut jump off it? ($G = 6.674\times10^{-11}\ \text{N·m}^2/\text{kg}^2$)`,
      answer: Math.sqrt((2 * 6.674e-11 * 7.33e10) / 245), units: 'm/s', tol: { rel: 0.01 },
      errors: [{ value: Math.sqrt((6.674e-11 * 7.33e10) / 245), feedback: 'That is the circular-orbit speed at the surface; escape needs √2 times more.' }],
      hints: [t`$v_\text{esc} = \sqrt{2GM/R}$.`],
      teach: 'Escape speed scales as √(M/R): a small asteroid can be escaped at walking pace.',
      explain: t`$v_\text{esc} = \sqrt{\dfrac{2(6.674\times10^{-11})(7.33\times10^{10})}{245}} = ${s3(Math.sqrt((2 * 6.674e-11 * 7.33e10) / 245))}$ m/s — about 20 cm/s. A gentle hop, around 1 m/s, would leave Bennu for good, which is why its loose surface pebbles are sometimes seen flung into space.`,
      visual: bennuPicture,
    }),
    num({
      id: 'cp-escape-burn', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([300, 400, 500]) * 1000;
        const rr = R_EARTH + h, vc = Math.sqrt(GM_EARTH / rr), dv = (Math.SQRT2 - 1) * vc;
        return {
          prompt: t`A spacecraft is in a circular orbit ${h / 1000} km above the Earth. By how much must its engine raise its speed, in one short burn, for it to escape Earth altogether? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
          answer: dv / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((2 * GM_EARTH) / rr) / 1000, feedback: 'That is the escape speed itself. The spacecraft already moves at the circular speed: it needs only the difference.' }, { value: (vEsc(GM_EARTH, R_EARTH) - vc) / 1000, feedback: 'Use the escape speed from the orbit’s radius, not from the ground.' }],
          hints: [
            t`In a circular orbit, $v_c = \sqrt{GM/r}$.`,
            t`Escape from the same $r$ needs $v_\text{esc} = \sqrt{2GM/r} = \sqrt2\,v_c$.`,
            t`The burn must add $v_\text{esc} - v_c = (\sqrt2 - 1)\,v_c$.`,
          ],
          teach: 'From a circular orbit, escape needs a speed boost of (√2 − 1) times the orbital speed — about 3.2 km/s from low Earth orbit.',
          explain: t`$v_c = \sqrt{\dfrac{3.986\times10^{14}}{${tex(rr, 4)}}} = ${s3(vc / 1000)}$ km/s, so $\Delta v = 0.414\times${s3(vc / 1000)} = ${s3(dv / 1000)}$ km/s. That is the "trans-lunar injection"-sized burn of every Moon and Mars mission.`,
          visual: uWell({ xmax: 4, energies: [{ E: r4(-R_EARTH / rr / 2), label: 'circular orbit: E = −GMm/2r', color: 'warn' }, { E: 0, label: 'escape: E = 0' }], points: [{ x: r4(rr / R_EARTH), y: r4(-R_EARTH / rr), color: 'gold', label: 'orbit radius', labelDx: 8 }] }),
        };
      },
    }),
    mcq({
      id: 'cp-direction', difficulty: 2,
      prompt: 'Ignoring air and Earth’s spin, does the escape speed depend on the direction you launch in — straight up, sideways, or at 45°?',
      choices: ['No: energy has no direction, and any direction that does not hit the planet escapes at the same speed', 'Yes: straight up is easiest, because you fight gravity directly', 'Yes: sideways is easiest, because you are not working against gravity at all', 'Yes: 45° is best, as for the range of a projectile'],
      answer: 0,
      why: {
        1: 'Straight up does not save energy: the climb out of the well costs GMm/R whichever way you go.',
        2: 'Gravity slows a sideways launch too, as the path curves away from the planet and climbs.',
        3: 'The 45° rule is for range on flat ground in uniform gravity; escaping is about energy, not range.',
      },
      hints: [t`The escape condition is $\tfrac12 mv^2 - GMm/R \ge 0$. Does that contain a direction?`],
      teach: 'Escape is an energy condition, so the escape speed is the same in every direction (in practice launches go east, to use Earth’s spin, and steeply at first, to get out of the air).',
      explain: 'The condition ½mv² ≥ GMm/R involves only speeds and distances. Every launch direction that misses the planet escapes at the same speed; the paths differ in shape but all reach infinity.',
      visual: { type: 'mech-kepler', params: { launch: { body: 'earth', h: 0, v: 11.3, vRange: [3, 14], view: 3 }, sectors: 0, controls: false, readout: false }, caption: 'A sideways launch just faster than the escape speed: the path opens out and never returns. To scale, no air.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.3 Gravitational Potential Energy and Total Energy', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-3-gravitational-potential-energy-and-total-energy' },
    { label: 'Lauretta et al. (2019), The unexpected surface of asteroid (101955) Bennu, Nature 568, 55', url: 'https://doi.org/10.1038/s41586-019-1033-6' },
    { label: 'NASA/JPL Solar System Dynamics: physical parameters of planets and satellites', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html' },
  ],
});

// a large number of km as plain text
function grpKm(x) { return Math.round(x).toLocaleString('en-US'); }
