// The M0 boss, "The Foundations Gauntlet": Kestrel, an imagined small lunar
// orbiter, flown from the pad to lunar orbit with nothing but precalculus.
// On the pad: the radio delay to the Moon in scientific notation, the parking
// orbit's altitude from Kepler's third law solved for a, and a pad-abort
// test's quadratic. Ascent: reading a sounding rocket's altitude graph, the
// rocket equation's logarithm, and a velocity's components. Parking orbit:
// the horizon dip angle from a right triangle and a ground station's slant
// range from the law of cosines. Transfer: the transfer ellipse's
// eccentricity and a star image rotated by multiplying by e^{iθ}. Lunar orbit:
// a geometric series of apoapsis-lowering burns, a fall time by dimensional
// analysis, and a flight rule read by its contrapositive.
// Every number a learner reads comes from its generator; the case functions
// are exported so a script can recompute every key another way.
import { boss, mcq, num } from '../../src/core/content.js';
import { nice, sig, tex } from '../../src/core/format.js';
import { N, bars } from './_m0kit.js';
import { seg, ell, plane, dot, note } from './_m0geo.js';
import { euler, dimBars } from './_m0reason.js';

const t = String.raw;
const NB = ' ';
const PI = Math.PI, D2R = PI / 180;

// ---- constants as the prompts print them
export const MU = 398600.4;    // km³/s², Earth's GM
export const RE = 6371;        // km, Earth's mean radius
export const C_KMS = 2.998e5;  // km/s
export const G0 = 9.81;        // m/s²

/** Keep only the slips that are finite and clearly apart from the key and from each other. */
function apart(errors, key, rel = 0.02) {
  const kept = [], far = (u, v) => Math.abs(u - v) > rel * Math.max(Math.abs(u), Math.abs(v), 1e-9);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key) && kept.every((k) => far(e.value, k.value))) kept.push(e);
  return kept;
}

// ── round 1: on the pad ─────────────────────────────────────────────────────
/** Radio round trip to the Moon: distance d (km). */
export function lightCase(r) {
  const d = r.int(3633, 4055) * 100;
  return { d, key: (2 * d) / C_KMS };
}
/** Parking orbit from its period T (min): radius a and altitude h (km). */
export function keplerCase(r) {
  const T = r.pick([88.5, 89.5, 90, 91, 92.5, 94, 96]);
  const a = Math.cbrt((MU * (T * 60) ** 2) / (4 * PI * PI));
  return { T, a, key: a - RE };
}
/** Pad-abort test: launch speed v0 (m/s) and height H (m); the time it first passes H. */
export function abortCase(r) {
  const v0 = r.pick([60, 70, 80, 90]);
  const H = r.pick([80, 100, 120, 150, 180, 200, 250].filter((h) => 2 * G0 * h < 0.8 * v0 * v0));
  const disc = Math.sqrt(v0 * v0 - 2 * G0 * H);
  return { v0, H, key: (v0 - disc) / G0, late: (v0 + disc) / G0 };
}

// ── round 2: ascent ─────────────────────────────────────────────────────────
const GRAPH_Q = [
  { ask: 'Where is its vertical velocity zero?', key: 1 },
  { ask: 'Where is it falling fastest?', key: 3 },
  { ask: 'Where is it rising fastest?', key: 0 },
];
/** A payload coasting after burnout, h = v0 t − ½ g t²: launch speed v0 (m/s) and which question. */
export function graphCase(r) {
  const v0 = r.pick([300, 400, 500, 600]), q = r.int(0, GRAPH_Q.length - 1);
  const T = (2 * v0) / G0, ts = [0.12, 0.5, 0.72, 0.94].map((f) => f * T);
  return { v0, T, ts, q, key: GRAPH_Q[q].key, hs: ts.map((x) => v0 * x - 0.5 * G0 * x * x) };
}
/** Trans-lunar injection: Δv (km/s) and exhaust speed v_e (km/s); propellant share of the stack, in %. */
export function rocketCase(r) {
  const dv = r.pick([3.1, 3.15, 3.2]), ve = r.pick([2.9, 3.1, 3.4, 4.4]);
  return { dv, ve, key: 100 * (1 - Math.exp(-dv / ve)) };
}
/** Velocity v (m/s) at flight-path angle γ (degrees above the horizontal): its vertical component. */
export function compCase(r) {
  const v = r.pick([1800, 2100, 2400, 2700]), g = r.pick([22, 25, 30, 35, 40]);
  return { v, g, key: v * Math.sin(g * D2R) };
}

// ── round 3: parking orbit ──────────────────────────────────────────────────
/** Horizon dip from altitude h (km): the angle below the local horizontal, in degrees. */
export function dipCase(r) {
  const h = r.pick([300, 400, 550, 700, 900]);
  return { h, key: Math.acos(RE / (RE + h)) / D2R };
}
/** Slant range from a ground station to a satellite at altitude h, central angle φ (degrees). */
export function rangeCase(r) {
  const h = r.pick([400, 600, 800, 1000]), phi = r.pick([5, 8, 10, 12]), R2 = RE + h;
  return { h, phi, R2, key: Math.sqrt(RE * RE + R2 * R2 - 2 * RE * R2 * Math.cos(phi * D2R)) };
}

// ── round 4: transfer ───────────────────────────────────────────────────────
/** Transfer ellipse: perigee altitude hp (km) and apogee radius ra (km, from Earth's centre). */
export function eccCase(r) {
  const hp = r.pick([185, 200, 250, 300]), ra = r.pick([370000, 384400, 395000, 405000]), rp = RE + hp;
  return { hp, ra, rp, key: (ra - rp) / (ra + rp) };
}
/** A star image at z = a + bi pixels rotated by θ degrees counterclockwise: the new real part. */
export function rotCase(r) {
  let a, b, th, x;
  do {
    a = r.intExcept(-300, 300, [0]); b = r.intExcept(-300, 300, [0]); th = r.pick([30, 45, 60, 120, 135, 150]);
    x = a * Math.cos(th * D2R) - b * Math.sin(th * D2R);
  } while (Math.abs(x) < 40 || Math.abs(a) < 60 || Math.abs(b) < 60);
  return { a, b, th, key: x };
}

// ── round 5: lunar orbit ────────────────────────────────────────────────────
/** N apoapsis-lowering burns: the first lowers it by D km, each later one by f of the one before. */
export function burnsCase(r) {
  const D = r.pick([1200, 1500, 1800, 2000]), f = r.pick([0.5, 0.6, 0.7]), n = r.int(4, 6);
  return { D, f, n, key: (D * (1 - f ** n)) / (1 - f) };
}
/** Free-fall time t ∝ r^p (GM)^q, so k times farther out takes k^{3/2} times longer. */
export function fallCase(r) {
  const k = r.pick([2, 3, 4, 1.5, 9]);
  return { k, key: k ** 1.5 };
}
/** A flight rule P ⇒ Q with a threshold X (%): "below X%" ⇒ "transmitter off". */
export function ruleCase(r) {
  const X = r.pick([15, 20, 25, 30, 35]);
  return { X, key: 0 };
}

// ── pictures ────────────────────────────────────────────────────────────────
const earthMoon = (d) => ({
  type: 'graph',
  params: {
    x: [-16000, +N(d + 16000)], y: [+N(-(d + 32000) / 4), +N((d + 32000) / 4)], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
    shade: [{ fn: `sqrt(max(0, ${RE * RE} - x^2))`, lower: `-sqrt(max(0, ${RE * RE} - x^2))`, from: -RE, to: RE, color: 'teal', alpha: 0.6 }, { fn: `sqrt(max(0, ${N(1737.4 ** 2)} - (x - ${d})^2))`, lower: `-sqrt(max(0, ${N(1737.4 ** 2)} - (x - ${d})^2))`, from: N(d - 1737.4), to: N(d + 1737.4), color: 'ink3', alpha: 0.7 }],
    arrows: [{ from: [RE + 3000, 9000], to: [N(d - 4000), 9000], color: 'gold', width: 1.8 }, { from: [N(d - 4000), -9000], to: [RE + 3000, -9000], color: 'gold', width: 1.8, dash: true }],
    points: [note([0, -22000], 'Earth', { color: 'teal' }), note([d, -22000], 'Moon', { color: 'ink2' })],
    alt: 'The Earth and the Moon to scale, with a radio signal going out and coming back',
  },
  caption: t`The Earth and the Moon to scale, with a command going out and the reply coming back (gold). Radio travels at the speed of light.`,
});
const orbitPic = (a, caption) => plane({
  x: [-2.1 * a, 2.1 * a], y: [-1.05 * a, 1.05 * a], ticks: false, xlabel: '', ylabel: '', grid: false,
  curves: [{ param: [`${RE}*cos(t)`, `${RE}*sin(t)`], t: [0, 6.2832], color: 'teal', width: 2 }, { param: [`${N(a)}*cos(t)`, `${N(a)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.6, dash: true }],
  points: [dot([0, a], '', { r: 5 }), note([0, 0], 'Earth', { color: 'teal' })],
  extra: { axes: false, shade: [{ fn: `sqrt(max(0, ${RE * RE} - x^2))`, lower: `-sqrt(max(0, ${RE * RE} - x^2))`, from: -RE, to: RE, color: 'teal', alpha: 0.25 }], alt: 'A circular parking orbit drawn to scale around the Earth' },
  caption,
});
function abortPic(C) {
  const T = (2 * C.v0) / G0, top = (C.v0 * C.v0) / (2 * G0);
  return {
    type: 'graph',
    params: { x: [0, +N(T * 1.04)], y: [0, +N(top * 1.15)], aspect: 'wide', xlabel: 't (s)', ylabel: 'height (m)', curves: [{ fn: `${C.v0}*x - ${G0 / 2}*x^2`, domain: [0, N(T)], color: 'accent' }], hlines: [{ y: C.H, color: 'gold', label: `${C.H} m` }] },
    caption: t`The test capsule’s height after its motor burns out (no air resistance; the short burn itself is ignored). The gold line is the height the camera tower watches.`,
  };
}
function graphPic(C) {
  return {
    type: 'graph',
    params: {
      x: [0, +N(C.T * 1.03)], y: [0, +N(((C.v0 * C.v0) / (2 * G0)) * 1.18e-3)], aspect: 'wide', xlabel: 't (s)', ylabel: 'altitude (km)',
      curves: [{ fn: `(${C.v0}*x - ${G0 / 2}*x^2)/1000`, domain: [0, N(C.T)], color: 'accent' }],
      points: C.ts.map((x, i) => ({ x: N(x), y: N(C.hs[i] / 1000), color: 'gold', r: 5, label: 'PQRS'[i], labelDx: 8, labelDy: i === 1 ? -10 : 12 })),
    },
    caption: t`Altitude against time for a payload coasting after burnout, with four marked moments. No air resistance.`,
  };
}
const rocketPic = (ve) => ({
  type: 'graph',
  params: { x: [0, 5], y: [0, 100], aspect: 'wide', xlabel: 'Δv (km/s)', ylabel: 'propellant (% of mass)', curves: [{ fn: `100*(1 - exp(-x/${ve}))`, color: 'accent' }] },
  caption: t`The share of a stage’s starting mass that must be propellant, against the $\Delta v$ it delivers, for an exhaust speed of $${ve}$ km/s (rocket equation, no gravity or drag losses).`,
});
function compPic(C) {
  const L = 1, th = C.g * D2R, tip = [L * Math.cos(th), L * Math.sin(th)];
  return plane({
    x: [-0.25, 1.75], y: [-0.2, 0.8], ticks: false, xlabel: '', ylabel: '', grid: false,
    curves: [seg([0, 0], [1.2, 0], { color: 'ink4', width: 1.2, dash: true }), seg([tip[0], 0], tip, { color: 'warn', width: 2, dash: true }), seg([0, 0], [tip[0], 0], { color: 'accent2', width: 2, dash: true }), { param: [`0.28*cos(t)`, `0.28*sin(t)`], t: [0, N(th)], color: 'gold', width: 1.6 }],
    arrows: [{ from: [0, 0], to: [N(tip[0]), N(tip[1])], color: 'accent', width: 2.6, label: 'v' }],
    points: [note([0.42 * Math.cos(th / 2), 0.42 * Math.sin(th / 2)], 'γ', { color: 'gold' }), note([1.35, 0], 'horizontal', { color: 'ink3' })],
    caption: t`The velocity at flight-path angle $\gamma$ above the local horizontal, with its horizontal and vertical components dashed. Not to scale.`,
  });
}
function dipPic(C) {
  const Rd = 0.69, th = Math.acos(Rd);   // drawn with the altitude exaggerated: spacecraft at 1, Earth's radius 0.69
  const P = [0, 1], Tg = [Rd * Math.sin(th), Rd * Math.cos(th)];
  return plane({
    x: [-1.3, 1.3], y: [-0.05, 1.25], ticks: false, xlabel: '', ylabel: '', grid: false,
    curves: [{ param: [`${Rd}*cos(t)`, `${Rd}*sin(t)`], t: [0.35, 2.8], color: 'teal', width: 2.4 }, seg(P, Tg, { color: 'gold', width: 2 }), seg([-0.6, 1], [0.6, 1], { color: 'ink3', width: 1.4, dash: true }), seg([0, 0], P, { color: 'ink4', width: 1.2, dash: true }), seg([0, 0], Tg, { color: 'ink4', width: 1.2, dash: true })],
    points: [dot(P, 'Kestrel', { labelDy: -10 }), dot(Tg, 'horizon', { color: 'teal', r: 4, labelDx: 8, labelDy: 12 }), note([-0.75, 1.07], 'local horizontal', { color: 'ink3' }), dot([0, 0], 'Earth’s centre', { color: 'teal', r: 3, labelDx: 8, labelDy: -8 })],
    caption: t`The line of sight from the spacecraft to the horizon (gold) just grazes the Earth, so it meets the radius there at a right angle. Not to scale: the altitude is hugely exaggerated.`,
  });
}
function rangePic(C) {
  const Rd = 0.72, ph = C.phi * D2R * 3;   // altitude exaggerated and the angle widened ×3, for legibility
  const S = [0, 1], G = [Rd * Math.sin(ph), Rd * Math.cos(ph)];
  return plane({
    x: [-1.25, 1.25], y: [-0.05, 1.2], ticks: false, xlabel: '', ylabel: '', grid: false,
    curves: [{ param: [`${Rd}*cos(t)`, `${Rd}*sin(t)`], t: [0.5, 2.6], color: 'teal', width: 2.2 }, seg([0, 0], S, { color: 'ink3', width: 1.6 }), seg([0, 0], G, { color: 'ink3', width: 1.6 }), seg(G, S, { color: 'gold', width: 2.2 }), { param: [`0.18*sin(t)`, `0.18*cos(t)`], t: [0, N(ph)], color: 'accent', width: 1.6 }],
    points: [dot([0, 0], 'Earth’s centre', { color: 'teal', r: 4, labelDx: 8, labelDy: 14 }), dot(S, 'Kestrel', { labelDy: -10 }), dot(G, 'station', { color: 'warn', r: 4, labelDx: 8, labelDy: 6 }), note([0.07, 0.27], 'φ', { color: 'accent' })],
    caption: t`Earth’s centre, the ground station and the spacecraft; the gold side is the slant range. Not to scale: the altitude and the angle are exaggerated for clarity.`,
  });
}
function eccPic(C) {
  const a = (C.ra + C.rp) / 2, c = a - C.rp, b = Math.sqrt(C.ra * C.rp), sc = 1 / a;
  return plane({
    x: [-1.25, 2.6], y: [-0.66, 0.66], ticks: false, xlabel: '', ylabel: '', grid: false,
    curves: [ell([0, 0], 1, b * sc, { width: 2.2 })],
    points: [dot([-c * sc, 0], 'Earth', { color: 'teal', r: 5, labelDx: -14, labelDy: 14 }), dot([1, 0], 'apogee', { r: 4, labelDx: 8, labelDy: 12 }), dot([-1, 0], 'perigee', { r: 4, labelDx: -50, labelDy: -10 }), note([1.75, 0.45], 'transfer ellipse', { color: 'accent' })],
    caption: t`The transfer ellipse to scale, with the Earth at a focus (the Earth itself would be a dot far smaller than drawn). Two-body model: the Moon’s pull is ignored until arrival.`,
  });
}
function rotPic(C) {
  const m = Math.hypot(C.a, C.b), s = 1 / m, ang = Math.atan2(C.b, C.a);
  return plane({
    x: [-2.2, 2.2], y: [-1.15, 1.15], xlabel: 'Re (pixels)', ylabel: 'Im', ticks: false,
    curves: [{ param: [`0.45*cos(t)`, `0.45*sin(t)`], t: [N(ang), N(ang + C.th * D2R)], color: 'gold', width: 1.8 }],
    arrows: [{ from: [0, 0], to: [N(C.a * s), N(C.b * s)], color: 'accent', width: 2.4, label: 'z' }, { from: [N(0.45 * Math.cos(ang + C.th * D2R - 0.25)), N(0.45 * Math.sin(ang + C.th * D2R - 0.25))], to: [N(0.45 * Math.cos(ang + C.th * D2R)), N(0.45 * Math.sin(ang + C.th * D2R))], color: 'gold', width: 1.8 }],
    caption: t`The star’s position as a complex number $z$ (scaled to unit length here) and the rotation by $${C.th}^\circ$ counterclockwise (gold), which it is about to undergo.`,
  });
}

// ── the battle ──────────────────────────────────────────────────────────────
export default boss({
  title: 'The Foundations Gauntlet',
  intro: t`*Kestrel* is an imagined small lunar orbiter, the size of a washing machine, riding to orbit as a rideshare and then pushing itself to the Moon. You are the trainee on its flight-dynamics team, and before anyone signs off a number, you check it: radio delays and parking orbits on the pad, logarithms and vectors on the way up, triangles in the parking orbit, an ellipse and a complex number on the way out, and series, dimensions and flight rules in lunar orbit. Five rounds, thirteen problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'On the pad',
      story: t`Kestrel sits on its launch adapter. Before launch the team rehearses the radio link to the Moon, picks the parking orbit, and replays the test of the launcher’s abort system.`,
      items: [
        num({
          id: 'r1-light', skill: 'm0.M0-1.4', difficulty: 2,
          gen(r) {
            const C = lightCase(r);
            return {
              prompt: t`During the mission rehearsal the Moon is $${tex(C.d * 1000, 4)}$ m from Earth. A command is sent to Kestrel there, and its reply comes straight back. Radio travels at $c = 2.998\times10^{8}$ m/s. How many seconds after sending does the reply arrive (ignoring processing time)?`,
              answer: C.key, units: 's', tol: { rel: 0.005 },
              errors: apart([
                { value: C.key / 2, feedback: t`That is one way. The reply has to come back too: the round trip is $2d/c$.` },
                { value: C.key * 1000, feedback: t`Check the powers of ten: $\dfrac{10^{8}}{10^{8}}$ leaves no factor of $1000$.` },
              ], C.key),
              hints: [t`Time $=$ distance $\div$ speed, and the signal covers the distance twice.`],
              teach: 'Light-time is distance over c; a round trip doubles it.',
              explain: t`$t = \dfrac{2 \times ${tex(C.d * 1000, 4)}}{2.998\times10^{8}} = ${nice(sig(C.key, 3))}$ s. That delay is why lunar landers fly their own descent: by the time a warning reached Earth and a correction came back, ${nice(sig(C.key, 2))} seconds would have passed.`,
              visual: earthMoon(C.d),
            };
          },
        }),
        num({
          id: 'r1-kepler', skill: 'm0.M0-2.3', difficulty: 3,
          gen(r) {
            const C = keplerCase(r);
            return {
              prompt: t`Kestrel’s launcher drops it in a circular parking orbit with period $T = ${C.T}$ min. Kepler’s third law for a circular orbit is $T = 2\pi\sqrt{a^3/\mu}$, with $a$ the orbit radius and $\mu = 398\,600.4\ \text{km}^3/\text{s}^2$ for Earth. Earth’s mean radius is $6371$ km. What is the orbit’s altitude above the surface, in km?`,
              answer: C.key, units: 'km', tol: { rel: 0.01 },
              errors: apart([
                { value: C.a, feedback: t`That is the radius $a$, measured from Earth’s *centre*. Subtract Earth’s radius for the altitude.` },
                { value: Math.sqrt((MU * (C.T * 60) ** 2) / (4 * PI * PI)) - RE, feedback: t`$a$ is cubed in the law, so undo it with a *cube* root: $a = \left(\mu T^2/4\pi^2\right)^{1/3}$.` },
                { value: Math.cbrt((MU * C.T ** 2) / (4 * PI * PI)) - RE, feedback: t`$\mu$ is in km³/s², so $T$ must be in seconds: $${C.T}$ min $= ${C.T * 60}$ s.` },
              ], C.key),
              hints: [t`Square both sides and solve: $a^3 = \dfrac{\mu T^2}{4\pi^2}$.`, t`Use $T$ in seconds; the altitude is $a - 6371$ km.`],
              teach: 'Solve for the variable step by step: square, multiply, then take the cube root.',
              explain: t`$a = \left(\dfrac{398\,600.4 \times ${C.T * 60}^2}{4\pi^2}\right)^{1/3} = ${nice(sig(C.a, 5))}$ km, so the altitude is $${nice(sig(C.a, 5))} - 6371 = ${Math.round(C.key)}$ km. Low parking orbits like this one are typical: high enough to stay up for days or weeks, low enough to save the launcher’s performance.`,
              visual: orbitPic(C.a, t`The parking orbit (dashed) drawn to scale around the Earth: a low orbit hugs the planet.`),
            };
          },
        }),
        num({
          id: 'r1-abort', skill: 'm0.M0-3.1', difficulty: 3,
          gen(r) {
            const C = abortCase(r);
            return {
              prompt: t`In the launcher’s pad-abort test, the escape motor flings a test capsule straight up at $${C.v0}$ m/s and burns out almost at once, so its height is $h(t) = ${C.v0}t - \tfrac12(${G0})t^2$ (metres, seconds). A camera tower watches the height $${C.H}$ m. When does the capsule first pass it?`,
              answer: C.key, units: 's', tol: { rel: 0.01 },
              errors: apart([
                { value: C.late, feedback: t`That is the *second* time, on the way back down. The question asks for the first.` },
                { value: C.H / C.v0, feedback: t`That ignores gravity, as if the capsule kept its launch speed. Solve the full quadratic.` },
                { value: C.v0 / G0, feedback: t`That is the time of the highest point, where the speed is zero.` },
              ], C.key),
              hints: [t`Set $h(t) = ${C.H}$: $\ ${G0 / 2}t^2 - ${C.v0}t + ${C.H} = 0$.`, t`The quadratic formula gives two times; take the smaller.`],
              teach: 'A height reached twice gives two roots: the smaller on the way up, the larger on the way down.',
              explain: t`$t = \dfrac{${C.v0} \pm \sqrt{${C.v0}^2 - 2(${G0})(${C.H})}}{${G0}}$, so $t = ${nice(sig(C.key, 3))}$ s on the way up (and $${nice(sig(C.late, 3))}$ s on the way down). Real abort tests need air drag and the motor’s burn, which a detailed model adds.`,
              visual: abortPic(C),
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Ascent',
      story: t`Launch. A sounding rocket flown on the same range last month left a tidy graph to read; then the numbers that matter for Kestrel: how much of the kick stage must be propellant, and where the launcher’s velocity is pointing.`,
      items: [
        mcq({
          id: 'r2-graph', skill: 'm0.M0-4.4', difficulty: 2,
          gen(r) {
            const C = graphCase(r), Q = GRAPH_Q[C.q];
            const why = {
              1: { 0: t`The graph is steep here: rising fast, not still.`, 2: t`The graph slopes down here: it is already falling.`, 3: t`The graph is steepest here, heading down: falling fast.` },
              3: { 0: t`The graph rises here: moving up, not falling.`, 1: t`At the top the slope is zero: not moving vertically at all.`, 2: t`It is falling here, but the graph gets steeper later.` },
              0: { 1: t`At the top the slope is zero: not rising at all.`, 2: t`The graph slopes down here: it is falling.`, 3: t`The graph is steepest here, but heading down: falling fastest.` },
            }[C.key];
            return {
              prompt: t`A sounding rocket’s payload coasts after burnout, starting upward at $${C.v0}$ m/s. The graph shows its altitude against time, with four marked moments. ${Q.ask}`,
              choices: ['at P', 'at Q', 'at R', 'at S'], fixedOrder: true,
              answer: C.key,
              why,
              hints: [t`Vertical velocity is the slope of the altitude–time graph.`],
              teach: 'On a position–time graph the slope is the velocity: steep is fast, flat is momentarily still, downhill is falling.',
              explain: t`The slope of $h(t)$ is the vertical velocity. It starts at $${C.v0}$ m/s, falls steadily (gravity takes $9.81$ m/s each second), passes zero at the top, $t = ${nice(sig(C.v0 / G0, 3))}$ s, and is most negative just before landing.`,
              visual: graphPic(C),
            };
          },
        }),
        num({
          id: 'r2-rocket', skill: 'm0.M0-6.4', difficulty: 3,
          gen(r) {
            const C = rocketCase(r);
            return {
              prompt: t`From the parking orbit, Kestrel’s kick stage must add $\Delta v = ${C.dv}$ km/s to head for the Moon. Its engine’s exhaust leaves at $v_e = ${C.ve}$ km/s. The rocket equation is $\Delta v = v_e \ln(m_0/m_f)$, with $m_0$ the mass before the burn and $m_f$ after. What percentage of $m_0$ must be propellant?`,
              answer: C.key, units: '%', tol: { rel: 0.01 },
              errors: apart([
                { value: 100 * Math.exp(-C.dv / C.ve), feedback: t`$e^{-\Delta v/v_e} = m_f/m_0$ is the share *left* after the burn. The propellant is the rest.` },
                { value: (100 * C.dv) / C.ve, feedback: t`The rocket equation is logarithmic, not linear: undo the $\ln$ with $e^{x}$.` },
                { value: 100 * (1 - 1 / (1 + C.dv / C.ve)), feedback: t`$m_0/m_f = e^{\Delta v/v_e}$, not $1 + \Delta v/v_e$.` },
              ], C.key),
              hints: [t`Solve for the mass ratio: $\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$.`, t`The propellant share is $1 - \dfrac{m_f}{m_0} = 1 - e^{-\Delta v/v_e}$.`],
              teach: t`The natural log in the rocket equation is undone by e: the mass ratio is $e^{\Delta v/v_e}$.`,
              explain: t`$\dfrac{m_0}{m_f} = e^{${C.dv}/${C.ve}} = ${nice(sig(Math.exp(C.dv / C.ve), 4))}$, so the propellant is $1 - e^{-${C.dv}/${C.ve}} = ${nice(sig(C.key, 3))}\%$ of the stack. A faster exhaust (hydrogen–oxygen engines reach about $4.4$ km/s) makes a big difference, because $v_e$ sits in the exponent.`,
              visual: rocketPic(C.ve),
            };
          },
        }),
        num({
          id: 'r2-components', skill: 'm0.M0-9.4', difficulty: 2,
          gen(r) {
            const C = compCase(r);
            return {
              prompt: t`At first-stage burnout the launcher moves at $${C.v}$ m/s, climbing at a flight-path angle $\gamma = ${C.g}^\circ$ above the local horizontal. What is the vertical component of its velocity?`,
              answer: C.key, units: 'm/s', tol: { rel: 0.005 },
              errors: apart([{ value: C.v * Math.cos(C.g * D2R), feedback: t`That is the horizontal component. The vertical side is opposite the angle: $v\sin\gamma$.` }, { value: C.v * Math.tan(C.g * D2R), feedback: t`The velocity is the hypotenuse: use $\sin\gamma$, not $\tan\gamma$.` }], C.key),
              hints: [t`The vertical component is the side opposite $\gamma$ in the velocity triangle.`],
              teach: 'Resolve a vector: the side opposite the angle is the magnitude times the sine.',
              explain: t`$v_{\text{vert}} = ${C.v}\sin ${C.g}^\circ = ${Math.round(C.key)}$ m/s; the horizontal component, the part that counts toward orbital speed, is $${Math.round(C.v * Math.cos(C.g * D2R))}$ m/s. The gravity turn bends $\gamma$ toward zero as orbit nears.`,
              visual: compPic(C),
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Parking orbit',
      story: t`Kestrel is in orbit. Its Earth-horizon sensor needs to know where the horizon will appear, and the ground station needs to know how far its antenna must reach.`,
      items: [
        num({
          id: 'r3-dip', skill: 'm0.M0-7.2', difficulty: 3,
          gen(r) {
            const C = dipCase(r);
            return {
              prompt: t`Kestrel orbits $${C.h}$ km above the Earth (radius $6371$ km). Its horizon sensor looks for the edge of the Earth, which lies below the local horizontal by an angle $\theta$. The line of sight to the horizon touches the Earth at a right angle to its radius. Find $\theta$ in degrees.`,
              answer: C.key, units: 'deg', tol: { rel: 0.01 },
              errors: apart([
                { value: Math.asin(RE / (RE + C.h)) / D2R, feedback: t`That is the angle between the line of sight and the straight-down direction, $90^\circ - \theta$. The dip below the *horizontal* is its complement: $\cos\theta = R/(R + h)$.` },
                { value: Math.atan(C.h / RE) / D2R, feedback: t`$h/R$ is not a side ratio of this triangle. The hypotenuse runs from Earth’s centre to the spacecraft: $R + h$.` },
              ], C.key),
              hints: [t`The triangle has a right angle at the horizon point, hypotenuse $R + h$ and one leg $R$.`, t`The angle $\theta$ below the horizontal equals the angle at Earth’s centre, so $\cos\theta = \dfrac{R}{R + h}$.`],
              teach: 'Find the right angle first; then pick the trig ratio from the sides you know.',
              explain: t`$\cos\theta = \dfrac{6371}{${RE + C.h}} = ${nice(sig(RE / (RE + C.h), 5))}$, so $\theta = ${nice(sig(C.key, 3))}^\circ$. The angle at the spacecraft between the vertical and the line of sight is $90^\circ - \theta$; the dip $\theta$ matches the angle at Earth’s centre because both are complements of the same angle.`,
              visual: dipPic(C),
            };
          },
        }),
        num({
          id: 'r3-range', skill: 'm0.M0-8.5', difficulty: 3,
          gen(r) {
            const C = rangeCase(r);
            return {
              prompt: t`A ground station on the equator tracks Kestrel, $${C.h}$ km up (so $${C.R2}$ km from Earth’s centre). Seen from Earth’s centre, the station and the spacecraft are $\varphi = ${C.phi}^\circ$ apart. Earth’s radius is $6371$ km. How far is the spacecraft from the station?`,
              answer: C.key, units: 'km', tol: { rel: 0.01 },
              errors: apart([
                { value: Math.sqrt(RE * RE + C.R2 * C.R2), feedback: t`The triangle has no right angle at Earth’s centre: keep the $-2ab\cos\varphi$ term.` },
                { value: C.h, feedback: t`The spacecraft is not straight overhead: the station is $${C.phi}^\circ$ around the Earth.` },
                { value: Math.sqrt(RE * RE + C.R2 * C.R2 + 2 * RE * C.R2 * Math.cos(C.phi * D2R)), feedback: t`The law of cosines *subtracts* $2ab\cos\varphi$.` },
              ], C.key),
              hints: [t`The triangle has sides $6371$ and $${C.R2}$ km meeting at angle $\varphi$ at Earth’s centre.`, t`$d^2 = a^2 + b^2 - 2ab\cos\varphi$.`],
              teach: 'Two sides and the angle between them: the law of cosines gives the third side.',
              explain: t`$d^2 = 6371^2 + ${C.R2}^2 - 2(6371)(${C.R2})\cos ${C.phi}^\circ$, so $d = ${Math.round(C.key)}$ km — about $${nice(sig(C.key / C.h, 2))}$ times the altitude, which is why low satellites are only in view for a few minutes per pass.`,
              visual: rangePic(C),
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Toward the Moon',
      story: t`The kick stage fires and Kestrel climbs onto a long ellipse reaching out to the Moon’s distance. On the way, its star tracker keeps it pointed.`,
      items: [
        num({
          id: 'r4-ecc', skill: 'm0.M0-11.3', difficulty: 3,
          gen(r) {
            const C = eccCase(r);
            return {
              prompt: t`After the burn, Kestrel’s orbit around the Earth has its perigee $${C.hp}$ km above the surface and its apogee $${tex(C.ra, 4)}$ km from Earth’s centre. Earth’s radius is $6371$ km. What is the orbit’s eccentricity? (Give $4$ significant figures.)`,
              answer: C.key, tol: { rel: 0.0005 },
              errors: apart([
                { value: (C.ra - C.hp) / (C.ra + C.hp), feedback: t`Orbit distances are measured from Earth’s centre, the focus: $r_p = 6371 + ${C.hp}$ km.` },
                { value: (C.ra - C.rp) / C.ra, feedback: t`$e = \dfrac{r_a - r_p}{r_a + r_p}$: divide by the *sum*, which is $2a$.` },
                { value: C.rp / C.ra, feedback: t`That ratio is not the eccentricity: use $e = (r_a - r_p)/(r_a + r_p)$.` },
              ], C.key, 0.001),
              hints: [t`$r_p = 6371 + ${C.hp}$ km, from Earth’s centre.`, t`$e = \dfrac{r_a - r_p}{r_a + r_p}$.`],
              teach: 'Eccentricity from the closest and farthest distances, both measured from the focus.',
              explain: t`$r_p = ${C.rp}$ km, so $e = \dfrac{${C.ra} - ${C.rp}}{${C.ra} + ${C.rp}} = ${nice(sig(C.key, 4))}$: a very long, thin ellipse, just short of the parabola ($e = 1$) that would escape. The real trajectory is bent by the Moon’s gravity near arrival.`,
              visual: eccPic(C),
            };
          },
        }),
        num({
          id: 'r4-rotate', skill: 'm0.M0-10.3', difficulty: 3,
          gen(r) {
            const C = rotCase(r);
            const zt = t`${C.a} ${C.b < 0 ? '-' : '+'} ${Math.abs(C.b)}i`;
            return {
              prompt: t`Kestrel’s star tracker sees its guide star at $z = ${zt}$ pixels from the centre of the image (real part across, imaginary part up). During a slow roll the image turns by $${C.th}^\circ$ counterclockwise about the centre, which multiplies $z$ by $e^{i\cdot${C.th}^\circ}$. What is the real part of the star’s new position?`,
              answer: C.key, tol: { rel: 0.01 },
              errors: apart([
                { value: C.a * Math.cos(C.th * D2R) + C.b * Math.sin(C.th * D2R), feedback: t`That rotates the wrong way (by $-${C.th}^\circ$). Expand $(a + bi)(\cos\theta + i\sin\theta)$: the real part is $a\cos\theta - b\sin\theta$, because $i^2 = -1$.` },
                { value: C.a * Math.cos(C.th * D2R), feedback: t`The imaginary part feeds into the real part too: $bi \cdot i\sin\theta = -b\sin\theta$.` },
                { value: Math.hypot(C.a, C.b) * Math.cos(C.th * D2R), feedback: t`$|z|\cos\theta$ forgets $z$’s own angle: the new angle is $\arg z + ${C.th}^\circ$.` },
              ], C.key),
              hints: [t`$e^{i\theta} = \cos\theta + i\sin\theta$. Multiply out $(a + bi)(\cos\theta + i\sin\theta)$.`, t`The real part is $a\cos\theta - b\sin\theta$.`],
              teach: t`Multiplying by $e^{i\theta}$ rotates a point by θ about the origin.`,
              explain: t`$\mathrm{Re}\bigl[(${zt})(\cos ${C.th}^\circ + i\sin ${C.th}^\circ)\bigr] = ${C.a}\cos ${C.th}^\circ - (${C.b})\sin ${C.th}^\circ = ${nice(sig(C.key, 4))}$ pixels. The star tracker compares such positions with its catalogue to work out how the spacecraft has turned.`,
              visual: rotPic(C),
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Lunar orbit',
      story: t`Kestrel is captured into a loose orbit around the Moon. A series of short burns tightens it; a thought experiment checks a teammate’s formula; and a flight rule decides what the telemetry means.`,
      items: [
        num({
          id: 'r5-burns', skill: 'm0.M0-12.2', difficulty: 3,
          gen(r) {
            const C = burnsCase(r);
            return {
              prompt: t`To tighten its lunar orbit, Kestrel makes ${C.n} burns at periapsis. The first lowers the apoapsis by $${C.D}$ km; each later burn, made with less propellant, lowers it by $${Math.round(C.f * 100)}\%$ of the drop before. How far has the apoapsis come down after all ${C.n} burns?`,
              answer: C.key, units: 'km', tol: { rel: 0.005 },
              errors: apart([
                { value: C.D * C.n, feedback: t`The drops shrink each time; they are not all $${C.D}$ km. Sum the geometric series.` },
                { value: C.D / (1 - C.f), feedback: t`That is the limit of infinitely many burns. Only ${C.n} are made: $S_n = a\dfrac{1 - r^n}{1 - r}$.` },
                { value: (C.D * (1 - C.f ** (C.n + 1))) / (1 - C.f), feedback: t`That sums ${C.n + 1} burns.` },
                { value: C.D * C.f ** (C.n - 1), feedback: t`That is the last burn’s drop alone.` },
              ], C.key),
              hints: [t`The drops are $${C.D},\ ${C.D}(${C.f}),\ ${C.D}(${C.f})^2, \ldots$: ${C.n} terms of a geometric series.`, t`$S_n = a\dfrac{1 - r^n}{1 - r}$.`],
              teach: 'A finite geometric series sums to a(1 − rⁿ)/(1 − r).',
              explain: t`$S_{${C.n}} = ${C.D}\,\dfrac{1 - ${C.f}^{${C.n}}}{1 - ${C.f}} = ${Math.round(C.key)}$ km — already $${Math.round((100 * C.key * (1 - C.f)) / C.D)}\%$ of the $${nice(C.D / (1 - C.f))}$ km that infinitely many such burns could ever achieve. (Real burn sizes are chosen by the flight team; the fixed ratio is a model.)`,
              visual: bars({ values: Array.from({ length: C.n }, (_, i) => C.D * C.f ** i), xlabel: 'burn', ylabel: 'apoapsis drop (km)', caption: t`The apoapsis drop from each burn in the model.` }),
            };
          },
        }),
        num({
          id: 'r5-fall', skill: 'm0.M0-13.1', difficulty: 3,
          gen(r) {
            const C = fallCase(r);
            return {
              prompt: t`A teammate asks: if Kestrel stopped dead at distance $r$ from the Moon’s centre, how long would it take to fall in? The time can depend only on $r$ ($\mathsf{L}$) and the Moon’s $GM$ ($\mathsf{L^3T^{-2}}$), so $t = C\,r^{p}(GM)^{q}$ with $C$ a pure number. Using dimensional analysis, how many times longer would the fall take from $${C.k}$ times as far out?`,
              answer: C.key, tol: { rel: 0.005 },
              errors: apart([
                { value: C.k, feedback: t`Find the powers first: $\mathsf{T}$ forces $q = -\tfrac12$, then $\mathsf{L}$ forces $p + 3q = 0$, so $p = \tfrac32$.` },
                { value: C.k ** 2, feedback: t`Match the length powers: $p + 3q = 0$ with $q = -\tfrac12$ gives $p = \tfrac32$, not $2$.` },
                { value: Math.sqrt(C.k), feedback: t`The power of $r$ is $\tfrac32$, not $\tfrac12$: the length in $GM$ is cubed.` },
              ], C.key),
              hints: [t`Time: $-2q = 1$. Length: $p + 3q = 0$.`, t`So $t \propto r^{3/2}$; the ratio is $${C.k}^{3/2}$.`],
              teach: 'Dimensional analysis fixes the power law; a ratio then needs no constant.',
              explain: t`$q = -\tfrac12$, $p = \tfrac32$: $t = C\sqrt{r^3/GM}$ (the full answer has $C = \pi/(2\sqrt2)$). So ${C.k} times farther takes $${C.k}^{3/2} = ${nice(sig(C.key, 4))}$ times longer — the same $r^{3/2}$ as Kepler’s third law, for the same dimensional reason.`,
              visual: dimBars({ groups: [{ label: 'r', e: [0, 1, 0] }, { label: 'GM', e: [0, 3, -2] }, { label: 'time', e: [0, 0, 1] }], caption: t`The dimensions of $r$, of $GM$, and of the time to be built from them.` }),
            };
          },
        }),
        mcq({
          id: 'r5-rule', skill: 'm0.M0-14.1', difficulty: 2,
          gen(r) {
            const C = ruleCase(r);
            return {
              prompt: t`A flight rule protects Kestrel’s battery: “If the battery charge is below $${C.X}\%$, the transmitter is switched off.” Fresh telemetry is arriving from Kestrel right now, so its transmitter is on. Assuming the rule is obeyed, what can you conclude about the battery?`,
              choices: [t`Its charge is at least $${C.X}\%$`, t`Its charge is below $${C.X}\%$`, 'Nothing about the charge', 'The battery is full'],
              answer: 0,
              why: {
                1: t`If it were below $${C.X}\%$ the transmitter would be off — but it is on.`,
                2: t`Something does follow: the contrapositive, “transmitter on ⇒ charge not below $${C.X}\%$”.`,
                3: t`The rule only rules out low charge; “at least $${C.X}\%$” is all you know.`,
              },
              hints: [t`Write the rule as $P \Rightarrow Q$. Here $Q$ is false. What does the contrapositive say?`],
              teach: 'From P ⇒ Q and not Q, conclude not P.',
              explain: t`$P$: charge below $${C.X}\%$; $Q$: transmitter off. The contrapositive $\neg Q \Rightarrow \neg P$ says: transmitter on ⇒ charge at least $${C.X}\%$. Note what it does *not* say: a transmitter switched off could have other causes.`,
              visual: euler({ inner: `below ${C.X}%`, outer: 'transmitter off', points: [{ x: 3.4, y: -1.2, color: 'gold', r: 5, label: 'Kestrel now', labelAlign: 'right', labelDx: -10, labelDy: 14 }], caption: t`The rule draws “charge below ${C.X}%” inside “transmitter off”. Kestrel is transmitting, so it sits outside both.` }),
            };
          },
        }),
      ],
    },
  ],
});
