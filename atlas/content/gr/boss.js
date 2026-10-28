// The Road's boss: a thought-experiment expedition to Gaia BH1, the nearest
// black hole known, that climbs the Road step by step — the equivalence
// principle (a falling cabin, a spinning habitat), clocks read from the metric
// (a lunar navigation satellite, an orbit at the black hole), geodesics and
// light (two clocks, one orbit; an Einstein ring seen from close by), the
// Gaia binaries' periastron advance and gravitational-wave lifetimes, a
// neutron star's last orbit as LIGO would see it, and an honest sorting of
// what is measured, derived, speculative, a teaching model, refuted or open.
// Real data: the three Gaia black-hole binaries (El-Badry et al. 2023a, b;
// Gaia Collaboration, Panuzzo et al. 2024). Every number comes from a generator.
import { boss, mcq, multi, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { sci } from './_fasttrack.js';
import { chirpMass } from '../../src/viz/model/gr-waves.js';

const t = String.raw;
// the constants as the prompts print them, so a key always matches its prompt
const C = 2.998e8;                // m/s
const GM_SUN_C2 = 1477;           // m, GM☉/c²
const GM_SUN_C3 = 4.925e-6;       // s, GM☉/c³
const AU = 1.496e11;              // m
const MPC = 3.086e22;             // m
const YEAR = 3.156e7;             // s
const DAY = 86400;                // s
const RAD = 206265;               // arcseconds per radian
const G_E = 9.81;                 // m/s²
const M_BH1 = 9.62;               // Gaia BH1, solar masses (El-Badry et al. 2023)
const GM_MOON = 4.905e12;         // m³/s²
const R_MOON = 1737e3;            // m
const PROTON_D = 1.68e-15;        // m, a proton's diameter (charge radius 0.84 fm)
const r4 = (v) => +(+v).toFixed(4);
const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');   // thousands inside math

// the three dormant black holes found by Gaia, with their companion stars
const GAIA = {
  BH1: { name: 'Gaia BH1', m1: 9.62, m2: 0.93, P: 185.59, e: 0.451 },
  BH2: { name: 'Gaia BH2', m1: 8.94, m2: 1.07, P: 1276.7, e: 0.518 },
  BH3: { name: 'Gaia BH3', m1: 32.70, m2: 0.76, P: 4253, e: 0.729 },
};
const binary = (S) => {
  const M = S.m1 + S.m2, Py = S.P / 365.25, aAU = Math.cbrt(M * Py * Py);
  return { M, Py, aAU, a: aAU * AU };
};

// ── picture pieces ───────────────────────────────────────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label, labelDx: dx, labelDy: dy });
const ring = (cx, cy, R, color = 'ink2', width = 1.6, dash = false, t0 = 0, t1 = 6.2832) => ({ param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [r4(t0), r4(t1)], color, width, ...(dash ? { dash: true } : {}) });
const disk = (cx, cy, R, color = 'void', alpha = 1) => ({ fn: `${r4(cy)} + sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, lower: `${r4(cy)} - sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, from: r4(cx - R), to: r4(cx + R), color, alpha });
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', ...params }, caption });

function cabinPicture() {
  const masses = [[0, 3.4], [0, 1.6], [0, 5.2], [-0.75, 3.4], [0.75, 3.4]];
  return picture({
    aspect: '', x: [-5.5, 5.5], y: [-3.6, 6.6],
    shade: [disk(0, -2.4, 1.1), { fn: '6', lower: '0.8', from: -1.2, to: 1.2, color: 'accent', alpha: 0.12 }],
    curves: [seg([-1.2, 0.8], [1.2, 0.8], 'accent', 2), seg([1.2, 0.8], [1.2, 6], 'accent', 2), seg([1.2, 6], [-1.2, 6], 'accent', 2), seg([-1.2, 6], [-1.2, 0.8], 'accent', 2), ring(0, -2.4, 1.6, 'ink4', 1, true)],
    arrows: [{ from: [3, 4.6], to: [3, 1.6], color: 'ink3', label: 'falling freely', labelDx: 8, labelDy: 10 }],
    points: [...masses.map(([x, y]) => ({ x, y, r: 4, color: 'gold' })), tag(1.2, 6, 'cabin, 10 m', 'accent', 8, 4), tag(0.75, 3.4, 'test masses', 'gold', 10, 4), tag(1.6, -2.4, 'Gaia BH1', 'ink2', 10, 4)],
    alt: 'A cabin with free-floating test masses, falling freely toward a black hole',
  }, 'The cabin falling toward the black hole, its long axis pointing at it — far from scale, and showing nothing of what the crew sees: that is the question.');
}

function habitatPicture() {
  return picture({
    x: [-3.4, 3.4], y: [-1.6, 1.7],
    shade: [disk(0, 0, 1.3, 'ink2', 0.12)],
    curves: [ring(0, 0, 1.3, 'ink2', 3), seg([-1.3, 0], [1.3, 0], 'ink3', 1.4), seg([0, -1.3], [0, 1.3], 'ink3', 1.4), ring(0, 0, 0.45, 'warn', 1.5, false, 0.4, 2.6)],
    arrows: [{ from: [r4(0.45 * Math.cos(2.4)), r4(0.45 * Math.sin(2.4))], to: [r4(0.45 * Math.cos(2.65)), r4(0.45 * Math.sin(2.65))], color: 'warn' }, { from: [0, -1.3], to: [1.1, -1.3], color: 'good', label: 'v', labelDx: 4, labelDy: 4 }],
    points: [{ x: 0, y: 0, r: 5, color: 'gold' }, { x: 0, y: -1.3, r: 5, color: 'gold' }, tag(0, 0, 'hub clock', 'gold', 8, 18), tag(0, -1.3, 'rim clock', 'gold', -64, 16), tag(0.3, 0.55, 'spin', 'warn', 4, -6)],
    alt: 'A spinning ring habitat with a clock at its hub and another at its rim',
  }, 'The habitat seen along its spin axis, not to scale. The crew stands on the rim, feet outward.');
}

function moonPicture(r) {
  const R = R_MOON / 1e6, ro = r / 1e6;   // thousands of km
  const ext = ro * 1.15;
  return picture({
    aspect: '', x: [-ext, ext], y: [-ext, ext],
    shade: [disk(0, 0, R, 'ink3', 0.45)],
    curves: [ring(0, 0, ro, 'accent', 1.6, true)],
    points: [{ x: r4(-R), y: 0, r: 5, color: 'gold' }, { x: r4(ro * Math.cos(0.6)), y: r4(ro * Math.sin(0.6)), r: 5, color: 'accent' }, tag(-R, 0, 'ground clock', 'gold', 10, 4), tag(ro * Math.cos(0.6), ro * Math.sin(0.6), 'satellite', 'accent', 10, 4), tag(0, -R * 0.45, 'Moon', 'ink', -14, 4)],
    alt: 'The Moon and a satellite on a circular orbit around it',
  }, 'The Moon and the satellite’s orbit, to scale, seen from above the pole. Earth’s pull, the same on both clocks in the Moon’s freely falling frame apart from tiny tidal terms, is left out.');
}

function bhOrbitPicture(k) {
  const ext = k * 1.2;
  return picture({
    x: [-ext * 1.6, ext * 1.6], y: [-ext, ext],
    shade: [disk(0, 0, 2)],
    curves: [ring(0, 0, 2, 'ink3', 1.2), ring(0, 0, 3, 'bad', 1.2, true), ring(0, 0, 6, 'gold', 1.2, true), ring(0, 0, k, 'accent', 2)],
    points: [{ x: r4(k * Math.cos(0.8)), y: r4(k * Math.sin(0.8)), r: 5, color: 'accent', label: 'ship', labelDx: 8, labelDy: -6 }, tag(-3, 0, '3', 'bad', -12, 4), tag(-6, 0, '6', 'gold', -12, 4), tag(-k, 0, String(k), 'accent', -18, 4),
      tag(k * 1.08, k * 0.45, 'horizon 2', 'ink2', 0, 4), tag(k * 1.08, k * 0.2, 'photon sphere 3', 'bad', 0, 4), tag(k * 1.08, -k * 0.05, 'ISCO 6', 'gold', 0, 4), tag(k * 1.08, -k * 0.3, `ship ${k}`, 'accent', 0, 4)],
    alt: 'A black hole with its photon sphere, innermost stable orbit and the ship’s circular orbit',
  }, `To scale, in units of GM/c² (${fmt(M_BH1 * GM_SUN_C2 / 1000, 3)} km for this black hole): the horizon at 2, the photon sphere at 3, the innermost stable circular orbit (ISCO) at 6, and the ship’s orbit.`);
}

function worldlinePicture() {
  // spacetime cut along the orbit and unrolled: angle round the orbit across, time up;
  // the left and right edges are the same place, where the shuttle hovers
  const W = 6.2832, H = 4;
  return picture({
    aspect: '', x: [-1.6, W + 1.8], y: [-0.7, H + 0.8],
    shade: [{ fn: String(H), lower: '0', from: 0, to: W, color: 'ink2', alpha: 0.08 }],
    curves: [seg([0, 0], [0, H], 'warn', 3), seg([W, 0], [W, H], 'warn', 2, true), seg([0, 0], [W, H], 'accent', 2.6), seg([0, 0], [W, 0], 'ink3', 1)],
    arrows: [{ from: [-1.1, 0.4], to: [-1.1, 2.2], color: 'ink3', label: 'time', labelDx: -12, labelDy: -10 }, { from: [1.2, -0.45], to: [3.6, -0.45], color: 'ink3', label: 'once round the orbit', labelDx: -4, labelDy: 14 }],
    points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'start', labelDx: 8, labelDy: 14 }, { x: 0, y: H, r: 5, color: 'gold', label: 'meet', labelDx: 8, labelDy: -6 }, { x: W, y: H, r: 5, color: 'gold' },
      tag(0, H * 0.62, 'hovering', 'warn', 8, 4), tag(W * 0.55, H * 0.5, 'orbiting', 'accent', 10, 10), tag(W, H * 0.15, 'same place', 'warn', -72, 4)],
    alt: 'An unrolled spacetime diagram: the hovering clock’s worldline runs straight up, the orbiting clock’s runs diagonally once round the orbit, and they meet again',
  }, 'Spacetime unrolled around the orbit: angle round the orbit across, time up. The left and right edges are the same place, where the shuttle hovers, so the diagonal orbit meets the hovering clock again at the top. Schematic, not to scale.');
}

function chirpPicture() {
  // a schematic leading-order chirp: amplitude ∝ τ^(-1/4), phase ∝ τ^(5/8); no strain scale, on purpose
  return picture({
    x: [-0.05, 1.2], y: [-0.85, 0.85], equal: false,
    curves: [{ fn: '0.22*(1.03 - x)^(-0.25)*sin(70*(1 - (1.03 - x)^0.625))', domain: [0, 1], color: 'accent', width: 1.6 }, seg([0, 0], [1.08, 0], 'ink4', 1)],
    vlines: [{ x: 1, label: 'ISCO' }],
    arrows: [{ from: [0.05, -0.72], to: [0.4, -0.72], color: 'ink3', label: 'time', labelDx: 4, labelDy: 4 }],
    alt: 'A schematic gravitational-wave chirp: oscillations growing faster and stronger until the innermost stable orbit',
  }, 'A sketch of the inspiral’s strain against time, with no scale on purpose: the waves grow faster and stronger until the innermost stable circular orbit (ISCO), where this estimate stops.');
}

function lensPicture() {
  const D = 4, b = 1.1, tip = [-D, 0];
  const rays = [1, -1].flatMap((s) => [seg([5, s * b], [0, s * b], 'gold', 1.8), seg([0, s * b], tip, 'gold', 1.8)]);
  return picture({
    x: [-5, 5.4], y: [-2, 2.2],
    shade: [disk(0, 0, 0.28)],
    curves: [...rays, seg([-D, 0], [5, 0], 'ink4', 1, true), seg([-D + 1.1, 0], [-D + 1.1, 0.3], 'ink3', 1), seg([0, 0], [0, b], 'ink3', 1, true)],
    arrows: [{ from: [4.9, 1.6], to: [3.6, 1.6], color: 'ink3', label: 'from the star', labelDx: -30, labelDy: -10 }],
    points: [{ x: -D, y: 0, r: 5, color: 'accent', label: 'crew', labelDx: -12, labelDy: 18 }, tag(0, -0.3, 'black hole', 'ink2', -28, 18), tag(0, b / 2, 'b', 'ink2', 6, 4), tag(-D + 1.4, 0.14, 'θ', 'accent', 0, 4)],
    alt: 'Two parallel light rays bent around a black hole so that they meet at the crew',
  }, 'Side view with every angle hugely exaggerated. Rays from the far star pass the black hole at b, bend, and meet at the crew; seen head-on, that circle of rays is the ring.');
}

function precessPicture(e) {
  const p = 1 - e * e;
  return picture({
    x: [-2.2, 1.2], y: [-1.15, 1.15],
    curves: [{ polar: `${r4(p)}/(1 + ${e}*cos(theta))`, theta: [0, 6.2832], color: 'accent', width: 2 }, { polar: `${r4(p)}/(1 + ${e}*cos(theta - 0.45))`, theta: [0, 6.2832], color: 'accent', width: 1.4, dash: true }],
    arrows: [{ from: [r4(p / (1 + e) * 1.15), -0.05], to: [r4(p / (1 + e) * 1.15 * Math.cos(0.45)), r4(p / (1 + e) * 1.15 * Math.sin(0.45))], color: 'warn' }],
    points: [{ x: 0, y: 0, r: 6, color: 'ink' }, tag(0, 0, 'black hole', 'ink2', -64, 20), tag(p / (1 + e), 0, 'periastron', 'accent', 12, 18)],
    alt: 'An elliptical orbit around a black hole and the same orbit turned slightly, showing periastron advance',
  }, 'The star’s orbit around the black hole (the black hole’s own small orbit not drawn), and the same orbit later, dashed, with the turning of its long axis exaggerated hundreds of thousands of times.');
}

function binaryPicture(S) {
  const { aAU } = binary(S), e = S.e, p = aAU * (1 - e * e), rmax = aAU * (1 + e);
  const ext = Math.max(1.4, rmax * 1.1);
  return picture({
    x: [-ext * 1.15, ext * 0.6], y: [-ext * 0.62, ext * 0.62],
    curves: [{ polar: `${r4(p)}/(1 + ${e}*cos(theta))`, theta: [0, 6.2832], color: 'accent', width: 2 }, ring(0, 0, 1, 'ink3', 1.2, true)],
    points: [{ x: 0, y: 0, r: 5, color: 'ink' }, tag(0, 0, 'black hole', 'ink2', 8, 16), tag(-aAU * (1 + e), 0, 'star', 'accent', 8, 4), tag(0, 1, '1 AU', 'ink3', -10, -8)],
    alt: 'The companion star’s elliptical orbit around the black hole, with a 1 AU circle for scale',
  }, `${S.name}’s relative orbit to scale, with a dashed circle of radius 1 AU — Earth’s orbit round the Sun — for comparison.`);
}

function ratesPicture() {
  return {
    type: 'graph',
    params: {
      x: [0.9, 8], y: [0, 1.08], xlabel: 'r / rₛ', ylabel: 'clock rate', aspect: 'wide',
      curves: [{ fn: 'sqrt(max(0, 1 - 1/x))', domain: [1, 8], color: 'warn', label: 'hovering', labelAt: 1.45, labelDx: 10, labelDy: 6 }, { fn: 'sqrt(1 - 1.5/x)', domain: [3, 8], color: 'accent', label: 'stable orbits', labelAt: 6.4, labelDy: 20 }],
      hlines: [{ y: 1, label: 'far away' }],
      points: [{ x: 3, y: 0.7071, r: 5, color: 'accent', label: 'ISCO', labelDx: 8, labelDy: 16 }, { x: 1, y: 0, r: 5, color: 'ink', label: 'horizon', labelDx: 8, labelDy: -8 }],
      alt: 'Clock rate against distance for hovering clocks and for clocks on stable circular orbits',
    },
    caption: 'Clock rates compared with far-away clocks, for clocks hovering on rockets and for clocks on stable circular orbits, from the innermost one (ISCO, at 3 rₛ = 6GM/c²) outward. Distance in units of the horizon radius rₛ.',
  };
}

export default boss({
  title: 'Einstein’s Field Equations Challenge',
  intro: t`A thought experiment, set centuries from now: an expedition to **Gaia BH1**, the nearest black hole known — ${M_BH1} times the Sun's mass, about 1560 light-years away, found in 2022 by the wobble of the Sun-like star that orbits it. No such ship exists; every effect it meets is real physics. Five rounds climb the Road: the equivalence principle, clocks read from the metric, geodesics and light, the Gaia binaries and their gravitational waves, and what physics can honestly claim. Eleven problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The equivalence principle',
      story: t`On the way, the crew runs two experiments about what gravity is — and is not: one in their cabin as it falls freely, one in the spinning ring where they live.`,
      items: [
        multi({
          id: 'g1-cabin', skill: 'gr.S05.i', difficulty: 3,
          prompt: t`Engines off, the ship falls freely toward Gaia BH1, still thousands of kilometres out. Its sealed cabin is 10 m long, pointing at the black hole, and holds clocks, an accelerometer fixed to the wall, a laser and a few free-floating test masses. Which of these would the crew observe, using only measurements made inside the cabin?`,
          choices: [
            'Test masses spaced along the cabin’s length slowly drift apart, while masses spaced across it drift together',
            'A small cloud of free test masses changes shape but, at first, not its volume',
            t`The accelerometer reads about $GM/r^2$, the black hole's pull`,
            t`Light from a laser on the floor reaches the ceiling redshifted by about $gh/c^2$`,
            'Their own clocks visibly running slow',
            'A ball let go at the cabin’s centre falls toward the end nearest the black hole',
          ],
          answer: [0, 1],
          why: {
            2: t`The accelerometer falls along with everything else, so it reads zero, apart from tiny tidal terms. It would read about $GM/r^2$ only if rockets held the cabin still.`,
            3: t`That shift belongs to a cabin held still by rockets. Falling freely, the cabin is locally an inertial frame — the equivalence principle — and the light arrives unshifted, apart from tidal effects far too small to see across a few metres.`,
            4: 'Every clock ticks one second per second of its owner’s time. “Slow” means slow compared with clocks far away, which takes a signal from outside the cabin.',
            5: 'The ball and the cabin fall together. At the centre there is not even a tidal drift: the ball floats.',
          },
          hints: ['Which effects can a freely falling frame remove, and which can it not?', 'Free fall removes gravity’s uniform part. What remains in a small falling cabin is the difference in gravity from place to place — the tides — and in empty space those squeeze as much as they stretch.'],
          teach: 'A freely falling cabin removes gravity’s uniform part; the tides that remain are spacetime curvature, and in empty space they change a cloud’s shape but not its volume.',
          explain: t`Free fall makes the cabin a local inertial frame: the accelerometer reads zero, balls float and light crosses unshifted — the equivalence principle. What free fall cannot remove is the difference in gravity across the cabin: masses along the line to the hole drift apart, masses across it drift together. In empty space Einstein's equations make the Ricci curvature zero, so to first order the stretch and the two squeezes cancel in volume: the cloud becomes a cigar of the same volume. That is curvature measured from the inside.`,
          visual: cabinPicture(),
        }),
        num({
          id: 'g2-habitat', skill: 'gr.S06.i', difficulty: 3,
          gen(r) {
            const R = r.pick([100, 150, 225]), n = r.pick([0.4, 0.7, 1]);
            const v2 = n * G_E * R, frac = v2 / (2 * C * C), ns = frac * YEAR * 1e9;
            const nTeX = n === 1 ? '' : String(n);
            return {
              prompt: t`For the long cruise the crew lives in a ring ${R} m in radius, spinning so that the floor at the rim presses on them with $${nTeX}g$ of artificial gravity ($g = 9.81\ \text{m/s}^2$). A clock at the rim is compared with an identical clock at the hub, on the spin axis. Over one year ($3.156\times10^7$ s), by how many nanoseconds does the rim clock fall behind? ($c = 2.998\times10^8$ m/s)`,
              answer: ns, units: 'ns', tol: { rel: 0.01 },
              errors: [
                { value: 2 * ns, feedback: t`That is twice the loss. The artificial gravity grows from zero at the hub to $${nTeX}g$ at the rim, so the potential difference is only $\tfrac12(${nTeX}g)R$ — or, seen from outside, the rim's speed slows its clock by $v^2/2c^2$, with the ½.` },
                ...(n !== 1 ? [{ value: ns / n, feedback: t`The rim's artificial gravity is $${nTeX}g$, not a full $g$: the centripetal acceleration is $\omega^2R = ${nTeX}g$.` }] : []),
              ],
              hints: [
                t`The floor supplies the centripetal acceleration: $\omega^2R = ${nTeX}g$, so the rim moves at $v = \omega R = \sqrt{${nTeX}gR}$.`,
                t`Seen from outside, the rim clock moves at $v$ and runs slow by the fraction $v^2/2c^2$; the hub clock does not move.`,
                t`The fraction is $${nTeX}gR/(2c^2)$; multiply it by the seconds in a year.`,
              ],
              teach: 'In a spinning habitat the rim clock runs slow — by its speed, seen from outside, or by sitting lower in the artificial gravity, seen from inside; the equivalence principle says the two accounts agree, and they do.',
              explain: t`$v^2 = ${nTeX}gR = ${sci(v2, 4)}\ \text{m}^2/\text{s}^2$, so the rim clock runs slow by $v^2/2c^2 = ${sci(frac)}$ and loses ${sci(ns)} ns in a year. Riding the ring, the crew tells the story differently: the rim sits "lower" in an artificial gravity that grows from zero at the hub to $${nTeX}g$ at the rim, a potential difference of $\tfrac12(${nTeX}g)R$ — the same $${nTeX}gR/2c^2$. Speed seen from outside, gravity seen from inside: one effect, two descriptions, as the equivalence principle demands.`,
              visual: habitatPicture(),
            };
          },
        }),
      ],
    },
    {
      title: 'Clocks and the metric',
      story: t`An expedition navigates by its clocks. Before leaving, it tests a navigation satellite around the Moon; at the black hole, it reads its own clocks straight from the metric.`,
      items: [
        num({
          id: 'g3-moon', skill: 'gr.S23.i', difficulty: 3,
          gen(r) {
            const alt = r.pick([300, 500, 2000, 3000, 5000]), rr = R_MOON + alt * 1e3, K = GM_MOON / (C * C);
            const grav = K * (1 / R_MOON - 1 / rr), speed = K / (2 * rr), net = grav - speed, us = net * DAY * 1e6;
            return {
              prompt: t`Before departure, a navigation satellite is tested on a circular orbit ${alt.toLocaleString('en-US')} km above the Moon's surface. Its clock is compared with one on the ground (Moon: $GM = 4.905\times10^{12}\ \text{m}^3/\text{s}^2$, radius 1737 km; $c = 2.998\times10^8$ m/s). Counting both gravity and the satellite's speed, by how many microseconds per day does the orbiting clock run fast? (Give a negative number if it runs slow. Treat the ground clock as at rest.)`,
              answer: us, units: 'μs', tol: { rel: 0.02 },
              errors: [
                { value: grav * DAY * 1e6, feedback: t`You left out the satellite's speed. On a circular orbit $v^2 = GM/r$, and a moving clock loses $v^2/2c^2$.` },
                { value: -speed * DAY * 1e6, feedback: t`You left out gravity: the orbiting clock sits higher in the Moon's potential and gains $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac1r\right)$.` },
                { value: (grav - 2 * speed) * DAY * 1e6, feedback: t`A moving clock loses $v^2/2c^2$ — keep the ½.` },
              ],
              hints: [
                t`From height, the satellite clock gains the fraction $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac1r\right)$, with $r = R + ${grp(alt)}$ km.`,
                t`From speed it loses $\dfrac{v^2}{2c^2} = \dfrac{GM}{2rc^2}$, since $v^2 = GM/r$ on a circular orbit.`,
                t`Net: $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac{3}{2r}\right)$; multiply by $86\,400$ s and convert to μs. It can come out negative.`,
              ],
              teach: 'An orbiting clock gains from height and loses from speed; around a small, light body like the Moon, a low orbit loses more than it gains.',
              explain: t`$GM/c^2 = ${sci(K * 1e3, 4)}$ mm. Height: $+${sci(grav)}$; speed: $-${sci(speed)}$; net $${sci(net)}$, or $${sci(us)}$ μs per day — the satellite clock runs ${us > 0 ? 'fast' : 'slow'}. The two effects cancel at $r = \tfrac32R$, 869 km up: below that an orbiting clock runs slow, above it fast. (For GPS the crossover is 3200 km above the Earth, far below its orbits.) Left uncorrected, ${sci(Math.abs(us))} μs a day is ${Math.round(Math.abs(net) * DAY * C)} m of ranging error a day.`,
              visual: moonPicture(rr),
            };
          },
        }),
        num({
          id: 'g4-orbit', skill: 'gr.S21.i', difficulty: 3,
          gen(r) {
            const k = r.pick([7, 8, 9, 10, 12]), T = M_BH1 * GM_SUN_C3, Tfar = 2 * Math.PI * k ** 1.5 * T, rate = Math.sqrt(1 - 3 / k), tau = Tfar * rate;
            return {
              prompt: t`At Gaia BH1 (${M_BH1} solar masses) the ship settles, engines off, onto a circular orbit at $r = ${k}\,GM/c^2$. In the plane of the orbit the Schwarzschild metric is $$ds^2 = -\left(1 - \frac{2GM}{rc^2}\right)c^2dt^2 + \frac{dr^2}{1 - 2GM/rc^2} + r^2d\phi^2,$$ a clock's proper time obeys $c^2d\tau^2 = -ds^2$, and on a circular orbit Kepler's law holds exactly in far-away time: $(d\phi/dt)^2 = GM/r^3$. How long does one orbit take on the crew's own clocks? ($GM_\odot/c^3 = 4.925\ \mu\text{s}$)`,
              answer: tau * 1e3, units: 'ms', tol: { rel: 0.01 },
              errors: [
                { value: Tfar * 1e3, feedback: t`That is the period on far-away clocks. Put $dr = 0$ and $d\phi = \Omega\,dt$ into the metric: the crew's clocks run at $\sqrt{1 - 3GM/(rc^2)}$ of that rate.` },
                { value: Tfar * Math.sqrt(1 - 2 / k) * 1e3, feedback: t`That rate, $\sqrt{1 - 2GM/(rc^2)}$, belongs to a clock hovering at $r$. The orbiting clock also moves: the $r^2d\phi^2$ term takes away another $GM/(rc^2)$.` },
                { value: (Tfar / rate) * 1e3, feedback: t`Upside down: the crew's clocks record less time than far-away ones, so multiply by $\sqrt{1 - 3GM/(rc^2)}$.` },
              ],
              hints: [
                t`Far-away period: $T = 2\pi\sqrt{r^3/GM} = 2\pi\,(${k})^{3/2}\,GM/c^3$.`,
                t`With $dr = 0$ and $d\phi/dt = \Omega$: $\left(\dfrac{d\tau}{dt}\right)^2 = 1 - \dfrac{2GM}{rc^2} - \dfrac{r^2\Omega^2}{c^2} = 1 - \dfrac{3GM}{rc^2}$.`,
                t`The crew's period is $T\sqrt{1 - 3/${k}}$.`,
              ],
              teach: 'On a circular orbit the metric gives dτ/dt = √(1 − 3GM/rc²): two parts gravity, one part motion.',
              explain: t`$GM/c^3 = ${M_BH1}\times4.925\ \mu\text{s} = ${sci(T * 1e6, 4)}\ \mu\text{s}$, so far away one orbit takes $2\pi(${k})^{3/2}\times${sci(T * 1e6, 4)}\ \mu\text{s} = ${sci(Tfar * 1e3, 4)}$ ms. The metric gives $d\tau/dt = \sqrt{1 - 3/${k}} = ${sci(rate, 4)}$, so the crew counts ${sci(tau * 1e3)} ms per orbit — ${Math.round(1 / tau)} orbits in each second of their own time. At the innermost stable orbit, $6GM/c^2$, the factor is $1/\sqrt2$: no stable orbit round a non-spinning black hole slows clocks more.`,
              visual: bhOrbitPicture(k),
            };
          },
        }),
      ],
    },
    {
      title: 'Geodesics and light',
      story: t`Orbiting the black hole, the crew tests the principle the Road is built on — free fall is the path of greatest aging — and watches what the hole does to light.`,
      items: [
        mcq({
          id: 'g5-twoclocks', skill: 'gr.S12.i', difficulty: 3,
          gen(r) {
            const k = r.pick([7, 8, 10, 12]), f = Math.sqrt((1 - 2 / k) / (1 - 3 / k)), fT = sci(f, 4);
            return {
              prompt: t`Two identical clocks are together at one point of the ship's circular orbit, $r = ${k}\,GM/c^2$. One stays aboard the orbiting ship. A shuttle carries the other and fires its rockets to hover at that point until the ship comes round again and picks it up. When the two clocks meet again, which has recorded more time — and what does that say about "free fall is the path of greatest aging"?`,
              choices: [
                t`The hovering clock, by a factor of $${fT}$ — free fall beats only nearby paths, and the hovering worldline is not a nearby path`,
                t`The orbiting clock, by a factor of $${fT}$ — a free-fall worldline records more time than any other path between two events`,
                t`Neither — both clocks stay at the same $r$ from the black hole, so they tick at the same rate all along`,
                t`The hovering clock, by a factor of $${fT}$ — which shows that a circular orbit is not really a geodesic after all`,
              ],
              answer: 0,
              why: {
                1: t`Compare the rates: hovering, $\sqrt{1 - 2GM/rc^2}$; orbiting, $\sqrt{1 - 3GM/rc^2}$ — slower, because the ship also moves. "Most time" holds only against nearby paths.`,
                2: t`The orbiting clock also moves, and speed costs time: its rate is $\sqrt{1 - 3GM/rc^2}$, the hovering clock's $\sqrt{1 - 2GM/rc^2}$.`,
                3: 'The orbit is a geodesic: the crew is weightless. What fails is the idea that a geodesic beats every other path. It beats only paths close to it, and the hovering worldline is not close.',
              },
              hints: [t`Against far-away time, a hovering clock runs at $\sqrt{1 - 2GM/rc^2}$ and an orbiting one at $\sqrt{1 - 3GM/rc^2}$. Both spend the same far-away time between the meetings.`, 'A geodesic is a stationary path: any small change to it loses time. Is the hovering worldline a small change to the orbit?'],
              teach: 'Free fall gives the greatest proper time only among nearby worldlines; two events can be joined by several geodesics, and by accelerated paths that beat some of them.',
              explain: t`Between the meetings both clocks spend the same far-away time. The hovering clock ticks at $\sqrt{1 - 2/${k}}$ of far-away clocks and the orbiting one at $\sqrt{1 - 3/${k}}$, so the hovering clock records $\sqrt{\dfrac{1 - 2GM/rc^2}{1 - 3GM/rc^2}} = ${fT}$ times as much. No contradiction: the geodesic principle says a free worldline records more time than any *nearby* path, and the hovering worldline, pinned by rockets while the orbit swings round the hole, is not nearby. A clock thrown straight up from that point, timed to fall back just as the ship returns, follows a third geodesic between the same two events and beats them both.`,
              visual: worldlinePicture(),
            };
          },
        }),
        num({
          id: 'g6-ring', skill: 'gr.S24.i', difficulty: 3,
          gen(r) {
            const D = r.pick([0.5, 1, 2, 4]), GMc2 = M_BH1 * GM_SUN_C2, th = Math.sqrt((4 * GMc2) / (D * AU)), b = th * D * AU;
            return {
              prompt: t`From ${D} AU away, the crew sees a distant star almost exactly behind Gaia BH1 (${M_BH1} solar masses), its light drawn into a thin ring around the black hole. A ray passing a mass at impact parameter $b$ is bent by $\alpha = \dfrac{4GM}{c^2b}$, and the star is so far behind the black hole that its rays arrive parallel. What is the ring's angular radius as the crew sees it, in arcseconds? ($GM_\odot/c^2 = 1477$ m, 1 AU $= 1.496\times10^{11}$ m, 1 rad $= 206\,265''$)`,
              answer: th * RAD, units: 'arcsec', tol: { rel: 0.01 },
              errors: [
                { value: (th / Math.SQRT2) * RAD, feedback: t`That uses half the bending, $2GM/(c^2b)$ — what Newton's gravity, or the equivalence principle alone, would give. General relativity doubles it, because space is curved as well as time.` },
                { value: ((4 * GMc2) / (D * AU)) * RAD, feedback: t`That is the bending of a ray passing at your own distance, $b = D$. The ring's rays pass much closer: arriving at angle $\theta$, they passed at $b = \theta D$, and to come from straight behind they must have been bent by exactly $\theta$.` },
              ],
              hints: [
                t`A ray reaching the crew at angle $\theta$ from the black hole passed it at $b = \theta D$.`,
                t`Coming from a source straight behind, it must have been bent by exactly $\theta$: $\theta = \dfrac{4GM}{c^2\,\theta D}$.`,
                t`So $\theta = \sqrt{\dfrac{4GM}{c^2D}}$ in radians; convert to arcseconds.`,
              ],
              teach: 'An Einstein ring forms where the bending 4GM/(c²b) turns a ray from straight behind the lens into your eye; for a far source that gives θ = √(4GM/(c²D)).',
              explain: t`With $\alpha = \theta$ and $b = \theta D$: $\theta^2 = \dfrac{4GM}{c^2D} = \dfrac{4(${sci(GMc2, 4)}\ \text{m})}{${sci(D * AU, 4)}\ \text{m}}$, so $\theta = ${sci(th)}$ rad $= ${sci(th * RAD)}''$ — about ${fmt((th * RAD) / 60, 2)} arcminutes. Those rays pass the hole at $b = \theta D \approx ${Math.round(b / 1e3).toLocaleString('en-US').replace(/,/g, '{,}')}$ km, some ${Math.round(b / (2 * GMc2)).toLocaleString('en-US')} horizon radii out — weak bending, so the formula holds.`,
              visual: lensPicture(),
            };
          },
        }),
      ],
    },
    {
      title: 'The companions and their ripples',
      story: t`The expedition's astronomers time the stars that orbit the three dormant black holes Gaia has found — then hear, from far away, a neutron star's last orbit.`,
      items: [
        num({
          id: 'g7-precess', skill: 'gr.S25.i', difficulty: 3,
          gen(r) {
            const S = GAIA[r.pick(['BH1', 'BH2', 'BH3'])], { M, Py, aAU, a } = binary(S), e = S.e;
            const dphi = (6 * Math.PI * M * GM_SUN_C2) / (a * (1 - e * e)), N = 100 / Py, perC = dphi * N * RAD;
            const onlyBH = (6 * Math.PI * S.m1 * GM_SUN_C2) / (Math.cbrt(S.m1 * Py * Py) * AU * (1 - e * e)) * N * RAD;
            return {
              prompt: t`${S.name} is a ${S.m1}-solar-mass black hole and a ${S.m2}-solar-mass star, with an orbital period of ${S.P.toLocaleString('en-US')} days and an eccentricity of ${e}. General relativity turns the orbit's long axis forward by $\Delta\phi = \dfrac{6\pi G(m_1 + m_2)}{c^2a(1 - e^2)}$ each orbit, with $a$ the semi-major axis of the relative orbit. How many arcseconds is that per century? (Kepler's third law in solar units: $a^3 = (m_1 + m_2)P^2$, with $a$ in AU and $P$ in years; $GM_\odot/c^2 = 1477$ m; 1 AU $= 1.496\times10^{11}$ m; 1 rad $= 206\,265''$.)`,
              answer: perC, units: 'arcsec', tol: { rel: 0.015 },
              errors: [
                { value: dphi * RAD, feedback: t`That is the advance in one orbit. The star goes round $100/P = ${fmt(N, 3)}$ times a century.` },
                { value: perC * (1 - e * e), feedback: t`Keep the factor $1 - e^2$: the advance depends on $a(1 - e^2)$, not on $a$ alone.` },
                ...(Math.abs(onlyBH - perC) > 0.04 * perC ? [{ value: onlyBH, feedback: t`Both bodies count: the advance and Kepler's law use the total mass, $m_1 + m_2$.` }] : []),
              ],
              hints: [
                t`$P = ${fmt(Py, 4)}$ yr, so $a = \left[(${fmt(M, 4)})(${fmt(Py, 4)})^2\right]^{1/3}$ AU; convert to metres.`,
                t`Per orbit, $\Delta\phi = \dfrac{6\pi(${fmt(M, 4)})(1477\ \text{m})}{a\,(1 - ${e}^2)}$ radians.`,
                t`Multiply by the orbits per century, $100/P$, and by $206\,265''$ per radian.`,
              ],
              teach: 'The relativistic periastron advance per orbit, 6πGM/(c²a(1 − e²)), is largest for tight, eccentric orbits round big masses; per century it also counts how often the star goes round.',
              explain: t`$a = ${fmt(aAU, 4)}$ AU $= ${sci(a, 4)}$ m. Per orbit, $\Delta\phi = ${sci(dphi)}$ rad $= ${sci(dphi * RAD)}''$; with $${fmt(N, 3)}$ orbits a century that is $${sci(perC)}''$ per century${perC > 43 ? ' — more than Mercury’s 43″, because the mass is ten times the Sun’s' : ', against Mercury’s 43″: this orbit is far wider'}. The prediction is firm, but a fraction of an arcsecond per orbit is far below what has been measured in these systems so far.`,
              visual: precessPicture(e),
            };
          },
        }),
        num({
          id: 'g8-lifetime', skill: 'gr.S27.i', difficulty: 4,
          gen(r) {
            const S = GAIA[r.pick(['BH1', 'BH2', 'BH3'])], { M, aAU } = binary(S), e = S.e;
            const Mc = chirpMass(S.m1, S.m2), f = 2 / (S.P * DAY), T = Mc * GM_SUN_C3;
            const tau = (5 / 256) * T ** (-5 / 3) * (Math.PI * f) ** (-8 / 3), yr = tau / YEAR;
            const ecc = 1 / ((1 + 0.27 * e ** 10 + 0.33 * e ** 20) * (1 - e * e) ** 3.5);   // Mandel (2021) fit to Peters' eccentric decay
            return {
              prompt: t`Could ${S.name} ever become a source for LIGO? Its ${S.m1}- and ${S.m2}-solar-mass bodies go round each other every ${S.P.toLocaleString('en-US')} days. At leading order, a circular binary whose gravitational waves have frequency $f$ merges after $$\tau = \frac{5}{256}\left(\frac{G\mathcal{M}}{c^3}\right)^{-5/3}(\pi f)^{-8/3}, \qquad \mathcal{M} = \frac{(m_1m_2)^{3/5}}{(m_1 + m_2)^{1/5}}.$$ Treating the orbit as circular, how many years would gravitational waves take to bring the two together? ($G\mathcal{M}/c^3$ is 4.925 μs per solar mass; a year is $3.156\times10^7$ s.)`,
              answer: yr, units: 'yr', tol: { rel: 0.03 },
              errors: [
                { value: yr * 2 ** (8 / 3), feedback: t`A binary's gravitational waves come at twice its orbital frequency: $f = 2/P$.` },
                { value: yr * (M / Mc) ** (-5 / 3), feedback: t`The sweep is set by the chirp mass $\mathcal{M}$, not the total mass.` },
                { value: tau, feedback: t`That is in seconds; a year is $3.156\times10^7$ s.` },
              ],
              hints: [
                t`$\mathcal{M} = \dfrac{(${S.m1}\times${S.m2})^{3/5}}{(${fmt(M, 4)})^{1/5}} = ${fmt(Mc, 4)}$ solar masses, so $G\mathcal{M}/c^3 = ${fmt(Mc, 4)}\times4.925\ \mu\text{s}$.`,
                t`The waves come at twice the orbital frequency: $f = 2/P$, with $P$ in seconds.`,
                t`Evaluate $\tau$ in seconds, then divide by $3.156\times10^7$.`,
              ],
              teach: 'Gravitational waves come at twice the orbital frequency, and the time left to merge grows as f^(−8/3): wide binaries outlast the universe many times over.',
              explain: t`$\mathcal{M} = ${fmt(Mc, 4)}\,M_\odot$ and $f = 2/P = ${sci(f)}$ Hz, so $\tau = ${sci(tau)}$ s $= ${sci(yr)}$ years — about $${sci(yr / 13.8e9, 2)}$ times the age of the universe. The orbit's real eccentricity, ${e}, shortens this roughly ${Math.round(ecc)}-fold, nowhere near enough to matter. The two are ${fmt(aAU, 3)} AU apart; the binaries LIGO hears are a few hundred kilometres apart in their last second.`,
              visual: binaryPicture(S),
            };
          },
        }),
        num({
          id: 'g9-ligo', skill: 'gr.EQ.13', difficulty: 4,
          gen(r) {
            const m1 = r.pick([5, 6, 8]), m2 = r.pick([1.3, 1.4, 1.6]), D = r.pick([150, 250, 400]);
            const M = m1 + m2, Mc = chirpMass(m1, m2), f = 1 / (6 ** 1.5 * Math.PI * M * GM_SUN_C3);
            const hOf = (mc, ff) => (4 / (D * MPC)) * (mc * GM_SUN_C2) ** (5 / 3) * ((Math.PI * ff) / C) ** (2 / 3);
            const h = hOf(Mc, f), dL = (h * 4000) / 2;
            return {
              prompt: t`Far from the expedition, LIGO records a ${m1}-solar-mass black hole swallowing a ${m2}-solar-mass neutron star ${D} Mpc away. Take the inspiral to end at the innermost stable orbit of the total mass, $r = 6GM/c^2$, where Kepler's law gives the orbital frequency. Seen face-on from directly overhead, the waves' strain at frequency $f$ is $$h = \frac{4}{D}\left(\frac{G\mathcal{M}}{c^2}\right)^{5/3}\left(\frac{\pi f}{c}\right)^{2/3},$$ with $\mathcal{M}$ the chirp mass. By how much does each of LIGO's 4 km arms change length at that moment? ($GM_\odot/c^2 = 1477$ m, $GM_\odot/c^3 = 4.925\ \mu\text{s}$, 1 Mpc $= 3.086\times10^{22}$ m)`,
              answer: dL, units: 'm', tol: { rel: 0.03 },
              errors: [
                { value: 2 * dL, feedback: t`That is $hL$, the change in the difference between the two arms; each arm changes by half of it, $\tfrac12hL$.` },
                { value: (hOf(Mc, f / 2) * 4000) / 2, feedback: t`Kepler gives the orbital frequency; the waves come at twice it.` },
                { value: (hOf(M, f) * 4000) / 2, feedback: t`The strain uses the chirp mass, $\mathcal{M} = (m_1m_2)^{3/5}/(m_1 + m_2)^{1/5}$, not the total mass.` },
              ],
              hints: [
                t`At $r = 6GM/c^2$: $f_\text{orb} = \dfrac{1}{2\pi}\sqrt{\dfrac{GM}{r^3}} = \dfrac{1}{2\pi\,6^{3/2}\,GM/c^3}$, and the waves have $f = 2f_\text{orb}$.`,
                t`$\mathcal{M} = ${fmt(Mc, 4)}$ solar masses, so $G\mathcal{M}/c^2 = ${fmt(Mc, 4)}\times1477$ m.`,
                t`Each arm changes by $\tfrac12hL$ with $L = 4000$ m.`,
              ],
              teach: 'Chain the pieces: the innermost stable orbit sets the last frequency, chirp mass and distance set the strain, and each arm changes by half the strain times its length.',
              explain: t`$M = ${fmt(M, 3)}$ solar masses, so $f = \dfrac{1}{6^{3/2}\pi\,GM/c^3} = ${fmt(f, 3)}$ Hz. With $\mathcal{M} = ${fmt(Mc, 4)}$ and $D = ${sci(D * MPC, 4)}$ m, $h = ${sci(h)}$, and each arm changes by $\tfrac12hL = ${sci(dL)}$ m — about $1/${Math.round(PROTON_D / dL).toLocaleString('en-US').replace(/,/g, '{,}')}$ of a proton's diameter. That is the best case, face-on and overhead; a real source at a random angle gives less.`,
              visual: chirpPicture(),
            };
          },
        }),
      ],
    },
    {
      title: 'What we can honestly claim',
      story: t`Before the report goes home, the crew checks two claims against the physics.`,
      items: [
        mcq({
          id: 'g10-documentary', skill: 'gr.S20.i', difficulty: 3,
          gen(r) {
            const [crew, earth, N] = r.pick([['a day', 'a year', 365.25], ['a day', 'ten years', 3652.5], ['an hour', 'seven years', (7 * 365.25 * 24)]]);
            const rs = 2 * M_BH1 * GM_SUN_C2, dr = rs / (N * N - 1), rr = rs + dr, a = (M_BH1 * GM_SUN_C2 * C * C) / (rr * rr * Math.sqrt(1 - rs / rr));
            const drText = dr >= 0.01 ? `${fmt(dr * 100, 2)} cm` : dr >= 1e-4 ? `${fmt(dr * 1000, 2)} mm` : `${fmt(dr * 1e6, 2)} micrometres`;
            return {
              prompt: t`A documentary claims: “Near a black hole, ${crew} for the crew could be ${earth} on Earth.” Around non-spinning Gaia BH1 (horizon radius $r_s = ${fmt(rs / 1e3, 3)}$ km), clocks on stable circular orbits run at no less than $\sqrt{1 - 3/6} \approx 0.71$ of the far-away rate, at the innermost stable orbit. A clock hovering on rockets at radius $r$ runs at $\sqrt{1 - r_s/r}$, and hovering takes a proper acceleration $a = \dfrac{GM}{r^2\sqrt{1 - r_s/r}}$. Which statement is accurate?`,
              choices: [
                t`It needs hovering ${drText} above the horizon (in $r$) on rockets giving about $${sci(a / G_E, 1)}\,g$ — allowed on paper, beyond any machine`,
                'A stable circular orbit just outside the innermost one gives it, with the ship’s engines switched off',
                'General relativity forbids it outright: no clock can ever run more than about twice as slow as a far-away one',
                'Diving through the horizon and then climbing back out again before the trip home would give it',
              ],
              answer: 0,
              why: {
                1: t`On stable orbits clocks run at no less than $0.71$ of the far-away rate — a factor of 1.4, nowhere near ${Math.round(N).toLocaleString('en-US')}.`,
                2: t`The hovering rate $\sqrt{1 - r_s/r}$ goes to zero at the horizon: the theory allows any factor. What forbids it in practice is the rocket.`,
                3: 'Nothing that crosses the horizon comes back out — that is what a horizon is.',
              },
              hints: [t`For the hovering clock, $\sqrt{1 - r_s/r} = 1/${Math.round(N)}$: solve for $r - r_s$.`, t`So near the horizon $a \approx \dfrac{c^2}{2r_s}\times${Math.round(N)}$; compare with $g = 9.81\ \text{m/s}^2$.`],
              teach: 'General relativity allows unlimited slowing for clocks held just above a horizon, but stable orbits give at most a factor of about 1.4 round a non-spinning hole, and hovering lower needs impossible rockets.',
              explain: t`Slowing by ${Math.round(N).toLocaleString('en-US')} needs $1 - r_s/r = 1/${Math.round(N)}^2$: a hover ${drText} above the horizon in $r$, where holding still takes $a = ${sci(a)}\ \text{m/s}^2$, about $${sci(a / G_E, 2)}$ times Earth's gravity. Free orbits cannot help: the innermost stable one slows clocks only by $1/\sqrt2$. The claim is mathematically allowed and physically out of reach. (The film *Interstellar* gave its slow-clock planet a black hole spinning within a whisker of the maximum, where stable orbits reach far closer in.)`,
              visual: ratesPicture(),
            };
          },
        }),
        match({
          id: 'g11-status', skill: 'gr.S37.i', difficulty: 2,
          prompt: t`Sort each claim in the crew's report by its status in physics today.`,
          left: [
            'Clocks on GPS satellites run fast by about 38 microseconds a day, and the system corrects for it',
            'Inside a black hole’s horizon, every path into the future reaches the centre within a finite time on the traveller’s own clock',
            'A traversable wormhole could carry the crew home in days',
            'A heavy ball denting a stretched rubber sheet shows how gravity works',
            'In 2021 engineers created the first real warp bubble in a laboratory',
            'Whether information escapes from a black hole as it evaporates',
          ],
          right: ['observed and measured', 'derived, but untestable', 'speculative, on paper only', 'a teaching model', 'a refuted claim', 'an open question'],
          answer: [0, 1, 2, 3, 4, 5],
          hints: ['For each claim ask: has it been measured, derived, only allowed on paper, used to teach, shown false, or not yet settled?'],
          teach: 'Every claim in gravitation has a status — measured, derived, allowed on paper, a teaching model, refuted or open — and honest reporting keeps them apart.',
          explain: t`GPS's relativity correction is engineering that works every day. The fate of anything inside a horizon is a firm consequence of general relativity that no signal can carry out to test. Traversable wormholes solve Einstein's equations only with negative energy that nobody knows how to produce in bulk. The rubber sheet uses gravity to explain gravity and shows only curved space, though everyday gravity is mostly curved time. The 2021 "warp bubble" was a computed energy pattern in a microscopic cavity, not a warp drive, as its own authors said. And whether information survives a black hole's evaporation is still argued.`,
        }),
      ],
    },
  ],
});
