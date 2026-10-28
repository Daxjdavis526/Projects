// The PHYS 2210 boss: one small launcher, from the pad to orbit and home
// again. Each problem mixes two or three of the course's skills the way a
// flight engineer meets them — wind loads as drag plus statics, propellant
// feed as hydrostatics plus Bernoulli in an accelerating vehicle, a payload
// mount as a spring under the thrust's load, staging as momentum, energy and
// the rocket equation, the orbit as Kepler plus angular momentum, the cryogenic
// upper stage as heat transfer, latent heat and the second law, and the
// capsule's return as energy and drag. Every item names the lesson whose
// skill it measures; every number comes from its generator.
import { boss, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { tn, s3 } from './_fluids.js';
import { scene } from './_statics.js';
import { flowPic } from './_pv.js';
import { vesselPic } from './_thermal.js';

const t = String.raw;
const G = 9.8;                    // m/s², the course's g
const G0 = 9.81;                  // m/s², g₀ in v_e = I_sp g₀, as the rocket lesson uses it
const GM = 3.986e14;              // m³/s², Earth
const RE = 6371e3;                // m, Earth's mean radius
const RHO_LOX = 1141;             // kg/m³
const SIGMA = 5.67e-8;            // W/(m² K⁴)
const LV_LOX = 213e3;             // J/kg, latent heat of vaporization of oxygen at 90 K
const DAY_S = 86400;
const r4 = (v) => +(+v).toFixed(4);

// ── picture pieces (graph curves, fills and labels) ──────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label, labelDx: dx, labelDy: dy });
const ring = (cx, cy, R, color = 'ink2', width = 1.6, dash = false, t0 = 0, t1 = 6.2832) => ({ param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [t0, t1], color, width, ...(dash ? { dash: true } : {}) });
const disk = (cx, cy, R, color = 'teal', alpha = 0.35) => ({ fn: `${r4(cy)} + sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, lower: `${r4(cy)} - sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, from: r4(cx - R), to: r4(cx + R), color, alpha });
const rect = (x0, y0, x1, y1, color = 'ink2', width = 1.6, dash = false) => [seg([x0, y0], [x1, y0], color, width, dash), seg([x1, y0], [x1, y1], color, width, dash), seg([x1, y1], [x0, y1], color, width, dash), seg([x0, y1], [x0, y0], color, width, dash)];
const fill = (x0, y0, x1, y1, color = 'accent', alpha = 0.3) => ({ fn: String(r4(y1)), lower: String(r4(y0)), from: r4(x0), to: r4(x1), color, alpha });
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', ...params }, caption });

// a zigzag spring between two heights at x = 0 (vertical), or between x0 and x1 at height y (horizontal)
function spring(y0, y1, w = 0.35, n = 10, color = 'ink2') {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([i === 0 || i === n ? 0 : (i % 2 ? w : -w), y0 + ((y1 - y0) * i) / n]);
  return pts.slice(1).map((p, i) => seg(pts[i], p, color, 1.8));
}
function hspring(x0, x1, y, w = 0.22, n = 10, color = 'ink2') {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y + (i === 0 || i === n ? 0 : (i % 2 ? w : -w))]);
  return pts.slice(1).map((p, i) => seg(pts[i], p, color, 1.8));
}

// ── round 1 pictures ─────────────────────────────────────────────────────────
function padPicture(b) {
  // drawn 2.6 wide and 10 tall for a vehicle 1.8 m across and 30 m tall: not to scale
  const S = scene({ perN: 1, aspect: '' });
  S.surface([-8, 0], [5, 0], 'below')
    .box([-1.3, 0], [1.3, 10], { color: 'ink2', alpha: 0.25 })
    .line([-1.3, 10], [0, 11.8], { color: 'ink2' }).line([0, 11.8], [1.3, 10], { color: 'ink2' })
    .line([-4, 5], [1.3, 5], { color: 'warn', dash: true })
    .force([-7.8, 5], 3.8, { deg: 0, color: 'warn', label: 'wind’s push F', labelDx: -108, labelDy: -14 })
    .force([0, 5], 2.6, { deg: -90, color: 'ink', label: 'W' })
    .dot([-1.3, 0], 'upwind clamp', { color: 'bad', r: 5, dx: -86, dy: 16 })
    .dot([1.3, 0], 'downwind clamp', { color: 'good', r: 5, dx: 6, dy: 16 })
    .dim([1.3, 0], [1.3, 5], 'h = 15 m', { off: [1.4, 0], dx: 6, dy: 0 })
    .dim([-1.3, 0], [1.3, 0], `b = ${b} m`, { off: [0, -2.4] });
  for (const y of [1.8, 8.2]) S.force([-7.8, y], 2.6, { deg: 0, color: 'teal' });
  return S.spec('Side view, far from scale: the real vehicle is about 17 times taller than it is wide. A two-clamp model of the pad; real pads have four or more clamps around the base.', { alt: 'A rocket on its pad, wind blowing from the left, with clamps at the two edges of its base' });
}

function feedPicture(H) {
  const curves = [...rect(-1.6, 3, 1.6, 9.2), seg([-0.2, 0.55], [-0.2, 3], 'ink2', 1.8), seg([0.2, 0.55], [0.2, 3], 'ink2', 1.8), ring(0, 0, 0.55, 'ink2', 2)];
  curves.push(seg([2.3, 7], [2.3, 0.55], 'ink2', 1.1), seg([2.15, 7], [2.45, 7], 'ink2', 1.1), seg([2.15, 0.55], [2.45, 0.55], 'ink2', 1.1), seg([1.6, 7], [2.15, 7], 'ink4', 1, true), seg([0.55, 0.55], [2.15, 0.55], 'ink4', 1, true));
  return picture({
    aspect: '', x: [-5, 5.4], y: [-1, 10.2],
    shade: [fill(-1.6, 3, 1.6, 7, 'accent', 0.35), fill(-0.2, 0.55, 0.2, 3, 'accent', 0.35)],
    curves,
    arrows: [{ from: [0.75, 2.75], to: [0.75, 1.05], color: 'gold' }, { from: [-3.6, 5.6], to: [-3.6, 8.9], color: 'good', label: 'accelerating', labelDx: -36, labelDy: -12 }],
    points: [tag(0, 8.1, 'ullage gas', 'ink2', -28, 0), tag(0, 5, 'liquid oxygen', 'ink', -40, 0), tag(0.85, 1.9, 'flow', 'gold', 8, 4), tag(0.55, 0, 'pump', 'ink2', 8, 4), tag(2.3, 3.8, `H = ${H} m`, 'ink2', 8, 4), { x: 0, y: 0.55, r: 4, color: 'bad', label: 'inlet', labelDx: -40, labelDy: 2 }],
    alt: 'A tank of liquid oxygen with gas above it, draining down a feed line to a pump below',
  }, 'The oxygen tank and its feed line, side view, not to scale.');
}

function mountPicture() {
  const curves = [seg([-2.4, 0], [2.4, 0], 'ink2', 3), ...spring(0, 2.1), ...rect(-1.1, 2.1, 1.1, 3.9, 'accent', 2.2),
    seg([-1.1, 4.4], [1.1, 4.4], 'ink3', 1.2, true), seg([-1.1, 3.9], [-1.1, 4.4], 'ink3', 1.2, true), seg([1.1, 3.9], [1.1, 4.4], 'ink3', 1.2, true)];
  for (let k = 0; k <= 8; k++) curves.push(seg([-2.4 + 0.6 * k, 0], [-2.55 + 0.6 * k, -0.25], 'ink3', 1));
  return picture({
    aspect: '', x: [-4.4, 5.6], y: [-0.9, 5.2],
    shade: [fill(-1.1, 2.1, 1.1, 3.9, 'accent', 0.25)],
    curves,
    arrows: [{ from: [3.6, 0.6], to: [3.6, 3.6], color: 'good', label: 'vehicle accelerates', labelDx: -52, labelDy: -12 }],
    points: [tag(0, 3, 'satellite', 'accent', -26, 4), tag(0.45, 1.05, 'mount', 'ink2', 8, 4), tag(0, -0.5, 'top of the upper stage', 'ink3', -60, 6), tag(-1.1, 4.4, 'unloaded', 'ink3', -60, 0)],
    alt: 'A satellite standing on a springy mount on top of a rocket stage',
  }, 'The satellite on its mount, which behaves like a spring. The dashed outline is where it sits with no load; the compression is drawn hugely exaggerated.');
}

// ── round 2 pictures ─────────────────────────────────────────────────────────
function separationPicture() {
  const curves = [...rect(-7, -1, -1.4, 1, 'ink2', 2), ...rect(1.4, -1.2, 7.4, 1.2, 'accent', 2), ...hspring(-1.4, 1.4, 0.55), ...hspring(-1.4, 1.4, -0.55)];
  return picture({
    x: [-7.6, 8], y: [-2.6, 2.6],
    shade: [fill(-7, -1, -1.4, 1, 'ink2', 0.2), fill(1.4, -1.2, 7.4, 1.2, 'accent', 0.22)],
    curves,
    arrows: [{ from: [-2.2, 1.7], to: [-4.6, 1.7], color: 'warn' }, { from: [2.2, 1.7], to: [4.6, 1.7], color: 'warn' }],
    points: [tag(-4.2, 0, 'stage 1', 'ink2', -22, 4), tag(4.4, 0, 'stage 2', 'accent', -22, 4), tag(0, -1.25, 'springs', 'ink2', -22, 6), tag(0, 1.7, 'apart', 'warn', -16, -2)],
    alt: 'Two rocket stages side by side with compressed springs between them',
  }, 'The empty first stage and the upper stage with its payloads, just before the springs release — drawn side by side, not to scale. Arrows show directions only.');
}

function settlePicture(H) {
  const top = 6, bot = 0.8, w = 1.8;
  const curves = [seg([-w, bot + 0.6], [-w, top - 0.6], 'ink2', 2.2), seg([w, bot + 0.6], [w, top - 0.6], 'ink2', 2.2),
    { param: [`${w}*cos(t)`, `${top - 0.6} + 0.6*sin(t)`], t: [0, 3.1416], color: 'ink2', width: 2.2 },
    { param: [`${w}*cos(t)`, `${bot + 0.6} + 0.6*sin(t)`], t: [3.1416, 6.2832], color: 'ink2', width: 2.2 },
    seg([-0.18, -0.2], [-0.18, bot], 'ink2', 1.8), seg([0.18, -0.2], [0.18, bot], 'ink2', 1.8),
    seg([-2.5, top - 0.75], [-2.5, bot], 'ink2', 1.1), seg([-2.65, top - 0.75], [-2.35, top - 0.75], 'ink2', 1.1), seg([-2.65, bot], [-2.35, bot], 'ink2', 1.1)];
  return picture({
    aspect: '', x: [-6, 6.4], y: [-1.6, 7.2],
    shade: [{ fn: `${top - 0.75} + 0.55*sqrt(max(0, 1 - x^2/1.69))`, lower: `${top - 0.75} - 0.45*sqrt(max(0, 1 - x^2/1.69))`, from: -1.3, to: 1.3, color: 'accent', alpha: 0.55 }],
    curves,
    arrows: [{ from: [-4.4, -1], to: [-4.4, 1.6], color: 'good' }, { from: [4.4, -1], to: [4.4, 1.6], color: 'good' }],
    points: [tag(w, top - 0.75, 'floating oxygen', 'ink', 10, 4), tag(0.2, -0.1, 'outlet', 'ink2', 8, 4), tag(-2.5, (top + bot) / 2, `${H} m`, 'ink2', -40, 4), tag(0, 6.95, 'toward the nose', 'ink3', -46, 0),
      tag(-4.4, -1, 'thrust', 'good', -18, 16), tag(4.4, -1, 'thrust', 'good', -18, 16)],
    alt: 'A propellant tank in orbit with the liquid floating at the top, far from the outlet at the bottom',
  }, 'The oxygen tank during the coast, not to scale. Until the thrusters fire, nothing in it has any weight relative to the tank.');
}

function stackPicture(mp, md) {
  const X = -2.2;   // the stack's centre line, left of centre to leave room for the labels
  const curves = [...rect(X - 1.4, 0.6, X + 1.4, 2.4, 'ink2'), ...rect(X - 1.4, 2.4, X + 1.4, 6, 'accent'), ...rect(X - 1.1, 6, X + 1.1, 7.6, 'gold', 1.8, true),
    seg([X - 0.5, 0.6], [X - 0.9, -0.6], 'ink2', 1.8), seg([X + 0.5, 0.6], [X + 0.9, -0.6], 'ink2', 1.8), seg([X - 0.9, -0.6], [X + 0.9, -0.6], 'ink2', 1.8),
    seg([X - 1.1, 7.6], [X, 8.6], 'gold', 1.8, true), seg([X + 1.1, 7.6], [X, 8.6], 'gold', 1.8, true)];
  return picture({
    aspect: '', x: [-6, 6], y: [-1.2, 9.2],
    shade: [fill(X - 1.4, 2.4, X + 1.4, 6, 'accent', 0.25), fill(X - 1.4, 0.6, X + 1.4, 2.4, 'ink2', 0.2)],
    curves,
    points: [tag(X + 1.6, 6.8, 'payloads: ?', 'gold', 6, 4), tag(X + 1.6, 4.2, `propellant, ${mp} kg`, 'accent', 6, 4), tag(X + 1.6, 1.5, `empty stage, ${md} kg`, 'ink2', 6, 4), tag(X, -0.6, 'engine', 'ink3', -20, 14)],
    alt: 'The upper stage: engine, empty structure, propellant tanks and the payloads on top',
  }, 'The upper stage and its mass budget, schematic: box sizes do not show the masses.');
}

// ── round 3 pictures ─────────────────────────────────────────────────────────
function ellipsePicture() {
  // schematic: perigee radius 1.15, apogee radius 2.25 Earth radii (the real one is nearly round)
  const rp = 1.15, ra = 2.25, a = (rp + ra) / 2, c = (ra - rp) / 2, b = Math.sqrt(a * a - c * c);
  return picture({
    x: [-3.2, 2.6], y: [-1.9, 1.9],
    shade: [disk(0, 0, 1, 'teal', 0.4)],
    curves: [{ param: [`${r4(-c)} + ${r4(a)}*cos(t)`, `${r4(b)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.8, dash: true }, seg([0, 0], [rp, 0], 'ink3', 1, true)],
    arrows: [{ from: [rp, 0], to: [rp, 0.85], color: 'gold', label: 'v', labelDx: 6, labelDy: 0 }],
    points: [{ x: rp, y: 0, r: 5, color: 'gold', label: 'cutoff', labelDx: 8, labelDy: 14 }, { x: -ra, y: 0, r: 5, color: 'bad', label: 'apogee?', labelDx: -54, labelDy: 4 }, tag(0, -0.35, 'Earth', 'ink', -14, 4)],
    alt: 'Earth with an elliptical orbit around it, the engine cutoff at the closest point',
  }, 'Not to scale: the real ellipse is far rounder, a few hundred kilometres above the ground at both ends.');
}

function boomPicture(L, R) {
  const s = 1 / R;                 // body radius drawn as 1
  const Ld = Math.min(4.2, L * s * 0.55);
  return picture({
    x: [-6.2, 6.2], y: [-2.3, 2.3],
    shade: [disk(0, 0, 1, 'ink2', 0.25)],
    curves: [ring(0, 0, 1, 'ink2', 2), seg([1, 0], [1 + Ld, 0], 'accent', 5), seg([-1, 0], [-1 - Ld, 0], 'accent', 5), ring(0, 0, 1.55, 'warn', 1.6, false, 0.6, 2.4)],
    arrows: [{ from: [r4(1.55 * Math.cos(2.25)), r4(1.55 * Math.sin(2.25))], to: [r4(1.55 * Math.cos(2.45)), r4(1.55 * Math.sin(2.45))], color: 'warn' }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink' }, { x: 1, y: 0, r: 5, color: 'gold' }, { x: -1, y: 0, r: 5, color: 'gold' }, tag(1 + Ld, 0, 'boom, swung out', 'accent', -40, -14), tag(1, 0, 'hinge', 'gold', -10, 18), tag(0, 1.55, 'spin', 'warn', -10, -10)],
    alt: 'A spinning satellite seen along its spin axis, with two booms swung out from hinges on its rim',
  }, 'Seen along the spin axis, not to scale. Folded, each boom lies along the body’s side, parallel to the axis at the hinge radius, so from here it would show only as its hinge dot.');
}

// ── round 4 picture ──────────────────────────────────────────────────────────
function tankPicture() {
  const LEAK = 'heat in';
  const V = vesselPic({ kind: 'tank', liquid: 'LOX, 90 K', level: 0.7, leak: true, leakLabel: LEAK, vent: 'O₂ gas vented', caption: 'Cross-section of the oxygen tank, not to scale. Heat conducted through the foam boils the oxygen at its boiling point; the gas is vented.' });
  // right-align the leak label so it ends where the heat arrows begin, clear of the tank
  V.params.points = V.params.points.map((p) => (p.label === LEAK ? { ...p, labelDx: -6.4 * LEAK.length, labelDy: -2 } : p));
  return V;
}

// ── round 5 pictures ─────────────────────────────────────────────────────────
function energyBars(KperKg, UperKg) {
  // drawn without the graph's own axes: a hand-made vertical scale in MJ/kg
  const bars = [[KperKg, 'kinetic', 'accent'], [UperKg, 'potential', 'good'], [30, 'shield', 'warn']];
  const shade = [], points = [], curves = [seg([0.4, 0], [7.6, 0], 'ink3', 1.2), seg([0.4, 0], [0.4, 32], 'ink3', 1.2)];
  for (const y of [0, 10, 20, 30]) { curves.push(seg([0.25, y], [0.4, y], 'ink3', 1.2)); points.push(tag(0.25, y, String(y), 'ink3', -18, 4)); }
  points.push(tag(0.4, 34.5, 'MJ per kg', 'ink2', -20, 0));
  bars.forEach(([v, name, color], k) => {
    const x0 = 1.0 + 2.25 * k;
    shade.push(fill(x0, 0, x0 + 1.5, v, color, 0.55));
    points.push(tag(x0 + 0.75, v, `${s3(v)}`, color, -12, -8), tag(x0 + 0.75, 0, name, 'ink2', -3.1 * name.length, 16));
  });
  return picture({ x: [-0.6, 7.9], y: [-5, 37], equal: false, shade, curves, points, alt: 'Three bars: energy per kilogram' }, 'Energy per kilogram of capsule, to scale: its kinetic energy at entry, the potential energy it releases falling from 120 km to the ground, and — for comparison — the energy to heat and vaporize 1 kg of a typical ablative shield material.');
}

export default boss({
  title: 'Mission to Orbit',
  intro: t`A small two-stage launcher stands on a coastal pad. In its nose ride two payloads: a spinning science satellite and a capsule that will come home with experiments grown in orbit. You are the flight engineer, and every number on the flight plan is yours to check — from the wind on the pad to the parachute over the landing zone. Forces, fluids, vibration, momentum, orbits, spin, heat and energy all come into it. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Pad and liftoff',
      story: t`Fuelling has not started, and the wind is rising. Then the count reaches zero: ignition, liftoff, and the hardest-pushing moment of the first-stage burn.`,
      items: [
        num({
          id: 'r1-clamps', skill: 'phys2210.M12.2', difficulty: 3,
          gen(r) {
            const M = r.pick([5, 6, 7]), v = r.pick([18, 20, 22]), b = r.pick([1.8, 2.0]);
            const F = 0.5 * 1.2 * v * v * 0.7 * (30 * 1.8), W = M * 1000 * G, h = 15;
            const T = (F * h) / b - W / 2;
            const noWeight = (F * h) / b, noCd = ((F / 0.7) * h) / b - W / 2;
            return {
              prompt: t`Before fuelling, the empty launcher — ${M} t, 30 m tall and 1.8 m across — stands on its pad, held by two hold-down clamps ${b} m apart at the edges of its base. A ground wind of ${v} m/s blows side-on. Take the air's density as 1.2 kg/m³ and the drag coefficient of the side-on cylinder as 0.7, with the wind's total push acting at mid-height. The weight acts along the centre line. How hard must the upwind clamp pull down on the vehicle to keep it from tipping?`,
              answer: T / 1000, units: 'kN', tol: { rel: 0.01 },
              errors: [
                { value: noWeight / 1000, feedback: t`You left out the weight. About the downwind clamp, the weight's torque $W\,b/2$ resists tipping, so the clamp supplies only the rest.` },
                { value: ((2 * F * h) / b - W / 2) / 1000, feedback: t`That doubles the wind's torque. The dynamic pressure is $\tfrac12\rho v^2$, and the push acts at mid-height, $h = 15$ m.` },
                // (left out when it would land on the no-weight slip)
                ...(Math.abs(noCd - noWeight) > 0.03 * noWeight ? [{ value: noCd / 1000, feedback: t`Include the drag coefficient: the push is $F = \tfrac12\rho v^2 C_D A$, with $C_D = 0.7$.` }] : []),
              ],
              hints: [
                t`The wind's push is a drag force on the side area $A = 30\ \text{m}\times1.8\ \text{m}$: $F = \tfrac12\rho v^2 C_D A$.`,
                t`Take torques about the downwind clamp. The wind's $Fh$ tips the vehicle over it; the weight's $W\,b/2$ and the upwind clamp's pull $T$ (lever arm $b$) hold it back.`,
                t`$T\,b + W\tfrac{b}{2} = Fh$.`,
              ],
              teach: 'For a body held at two points, take torques about one support: the other support’s force is then the only unknown — and it can come out as a pull.',
              explain: t`$F = \tfrac12(1.2)(${v})^2(0.7)(54) = ${tn(F)}$ N, acting 15 m up. About the downwind clamp: $T(${b}) = (${tn(F)})(15) - (${tn(W)})(${b / 2})$, so $T = ${tn(T / 1000)}$ kN — a pull. Fuelled to about 50 t, the weight's torque would win comfortably and both clamps would push: the empty vehicle is the delicate one in a gale.`,
              visual: padPicture(b),
            };
          },
        }),
        num({
          id: 'r1-feed', skill: 'phys2210.M14.5', difficulty: 4,
          gen(r) {
            const T = r.pick([600, 650, 700]), M = r.pick([45, 50, 55]), mdot = r.pick([140, 160, 180]);
            const D = r.pick([14, 15, 16]), H = r.pick([6, 8, 10]), pu = r.pick([200, 250, 300]);
            const ge = T / M, A = (Math.PI * (D / 100) ** 2) / 4, v = mdot / (RHO_LOX * A);
            const hyd = (RHO_LOX * ge * H) / 1000, q = (0.5 * RHO_LOX * v * v) / 1000, p = pu + hyd - q;
            return {
              prompt: t`At liftoff the first stage's engines give ${T} kN of thrust to a vehicle of ${M} t. Liquid oxygen ($1141\ \text{kg/m}^3$) flows at ${mdot} kg/s down a feed line ${D} cm across to the oxygen pump. The liquid's surface in the tank stands ${H} m above the pump inlet, under ullage gas at ${pu} kPa. Ignoring friction in the line, what pressure does the pump inlet see?`,
              answer: p, units: 'kPa', tol: { rel: 0.01 },
              errors: [
                { value: pu + hyd, feedback: t`That is the pressure in still liquid. Flowing at $v = ${tn(v)}$ m/s, the oxygen has traded $\tfrac12\rho v^2 = ${tn(q)}$ kPa of its pressure for speed.` },
                { value: pu + (RHO_LOX * G * H) / 1000 - q, feedback: t`That is the hydrostatic part on the pad. Accelerating upward, the liquid presses as if gravity were $g + a = T/M = ${tn(ge)}\ \text{m/s}^2$.` },
                { value: pu + (RHO_LOX * (ge - G) * H) / 1000 - q, feedback: t`Gravity has not switched off: the liquid feels $g + a = T/M$, not the acceleration $a$ alone.` },
                { value: pu + hyd + q, feedback: t`Speeding up costs pressure: subtract $\tfrac12\rho v^2$, do not add it.` },
                { value: hyd - q, feedback: 'Add the ullage pressure that presses on the liquid’s surface.' },
              ],
              hints: [
                t`In a vehicle accelerating upward at $a$, a liquid presses as if gravity were $g + a$ — and at liftoff, with no drag yet, $M(g + a) = T$.`,
                t`Continuity gives the speed in the line: $v = \dot m/(\rho A)$ with $A = \pi D^2/4$.`,
                t`Bernoulli from the liquid's surface (nearly at rest) to the inlet: $p_\text{in} = p_\text{ullage} + \rho\,\dfrac{T}{M}\,H - \tfrac12\rho v^2$.`,
              ],
              teach: 'Inside an accelerating vehicle, hydrostatics and Bernoulli work unchanged with g replaced by the felt acceleration g + a.',
              explain: t`$g + a = \dfrac{T}{M} = \dfrac{${T}\ \text{kN}}{${M}\ \text{t}} = ${tn(ge)}\ \text{m/s}^2$. In the line $v = \dfrac{${mdot}}{1141\times\pi(${D / 100})^2/4} = ${tn(v)}$ m/s. Then $p_\text{in} = ${pu} + ${tn(hyd)} - ${tn(q)} = ${tn(p)}$ kPa. The pump needs this to stay well above the oxygen's vapour pressure, or it cavitates — one reason tanks are pressurized at all.`,
              visual: feedPicture(H),
            };
          },
        }),
        num({
          id: 'r1-mount', skill: 'phys2210.M15.1', difficulty: 3,
          gen(r) {
            const m = r.pick([150, 220, 300]), f0 = r.pick([30, 35, 40, 45]), T = r.pick([650, 700, 750]), Mb = r.pick([13, 14, 15]);
            const w = 2 * Math.PI * f0, k = m * w * w, aF = T / Mb, d = (aF / (w * w)) * 1000;
            return {
              prompt: t`In a shaker-table test on the ground, the ${m} kg science satellite on its flexible mount resonated at ${f0} Hz; treat it as a mass on a spring. Late in the first-stage burn the engines give ${T} kN of thrust, the vehicle's mass has fallen to ${Mb} t, and the air is too thin to matter. By how much is the mount compressed then?`,
              answer: d, units: 'mm', tol: { rel: 0.01 },
              errors: [
                { value: (((aF - G) / (w * w)) * 1000), feedback: t`That uses the vehicle's acceleration $a = T/M - g$. The mount must push the satellite with $m(g + a) = mT/M$: the load it feels is the thrust per unit mass.` },
                { value: (G / (w * w)) * 1000, feedback: 'That is the compression standing on the pad, under the satellite’s weight alone.' },
                { value: (aF / (f0 * f0)) * 1000, feedback: t`The spring constant uses the angular frequency: $k = m\omega^2$ with $\omega = 2\pi f$.` },
              ],
              hints: [
                t`From the test: $k = m\omega^2$ with $\omega = 2\pi f$.`,
                t`With no drag, only thrust and gravity act, and gravity pulls equally on every kilogram. So the mount must supply the satellite's share of the thrust, $mT/M$ — which is $m(g + a)$ in vertical flight.`,
                t`$\delta = \dfrac{mT/M}{k} = \dfrac{T/M}{(2\pi f)^2}$: the satellite's mass cancels.`,
              ],
              teach: 'A mount that resonates at f compresses by (felt acceleration)/(2πf)² under a steady load — the mass cancels.',
              explain: t`$k = m(2\pi f)^2 = ${m}(2\pi\times${f0})^2 = ${tn(k)}$ N/m. The mount pushes with $mT/M = ${m}\times${tn(aF)} = ${tn(m * aF)}$ N, about ${fmt(aF / G, 2)} times the satellite's weight, so $\delta = ${tn(m * aF)}/(${tn(k)}) = ${tn(d)}$ mm. Launch providers set a minimum payload frequency, typically some tens of hertz, so that a stiff mount barely moves and its resonance stays clear of the vehicle's own vibrations.`,
              visual: mountPicture(),
            };
          },
        }),
      ],
    },
    {
      title: 'Staging',
      story: t`The first stage burns out and falls away. For a few quiet seconds the upper stage coasts — its propellant floating — before its own engine can light.`,
      items: [
        num({
          id: 'r2-separate', skill: 'phys2210.M9.2', difficulty: 3,
          gen(r) {
            const m1 = r.pick([3.5, 4, 4.5]), m2 = r.pick([8, 9, 10]), k = r.pick([80, 100, 120]), x = r.pick([6, 8, 10]);
            const E = 4 * 0.5 * k * 1000 * (x / 100) ** 2, M1 = m1 * 1000, M2 = m2 * 1000;
            const mu = (M1 * M2) / (M1 + M2), vr = Math.sqrt((2 * E) / mu), v1 = (M2 * vr) / (M1 + M2), v2 = (M1 * vr) / (M1 + M2);
            return {
              prompt: t`At staging, the empty first stage (${m1} t) and the upper stage with its payloads (${m2} t) are pushed apart by four springs, each of stiffness ${k} kN/m and compressed ${x} cm. High above the air, at what speed do the two pieces move apart? (All the springs' energy goes into their motion.)`,
              answer: vr, units: 'm/s', tol: { rel: 0.01 },
              errors: [
                { value: Math.sqrt((2 * E) / M2), feedback: 'You gave all the springs’ energy to the upper stage. Momentum must balance, so the first stage moves too — and, being lighter, takes the larger share.' },
                { value: Math.sqrt((2 * E) / (M1 + M2)), feedback: t`That treats the pair as one body. Use momentum ($m_1v_1 = m_2v_2$ in the stack's own frame) and energy together.` },
                { value: v2, feedback: 'That is how much the upper stage alone speeds up. The question asks for the speed of separation: how fast the two pieces move apart.' },
              ],
              hints: [
                t`In the stack's own frame the total momentum stays zero: $m_1v_1 = m_2v_2$, in opposite directions.`,
                t`Energy: $\tfrac12m_1v_1^2 + \tfrac12m_2v_2^2 = 4\times\tfrac12kx^2$.`,
                t`Together these give $v_1 + v_2 = \sqrt{2E\,\dfrac{m_1 + m_2}{m_1m_2}}$.`,
              ],
              teach: 'When springs push two bodies apart, momentum fixes how the speed is shared and energy fixes how much there is.',
              explain: t`$E = 4\times\tfrac12(${k * 1000})(${x / 100})^2 = ${tn(E)}$ J. With $\mu = \dfrac{m_1m_2}{m_1 + m_2} = ${tn(mu)}$ kg, $v_\text{rel} = \sqrt{2E/\mu} = ${tn(vr)}$ m/s: the first stage drops back at ${s3(v1)} m/s and the upper stage gains ${s3(v2)} m/s, each in inverse proportion to its mass.`,
              visual: separationPicture(),
            };
          },
        }),
        num({
          id: 'r2-settle', skill: 'phys2210.M5.5', difficulty: 3,
          gen(r) {
            const F = r.pick([200, 300, 400]), M = r.pick([8, 9, 10]), H = r.pick([2, 2.5, 3]);
            const a = (2 * F) / (M * 1000), tt = Math.sqrt((2 * H) / a);
            return {
              prompt: t`Now the upper stage coasts, and everything aboard — tank walls and oxygen alike — falls freely together. The liquid oxygen has drifted into a floating blob at the top of its tank, ${H} m from the outlet at the bottom. Before the engine can start, two small settling thrusters of ${F} N each push the ${M} t stage forward, toward its nose. How long does the oxygen take to reach the outlet? (Treat the blob as free until it arrives.)`,
              answer: tt, units: 's', tol: { rel: 0.01 },
              errors: [
                { value: Math.sqrt((2 * H) / G), feedback: 'Gravity does not settle it: the tank and the oxygen fall together, so relative to the tank the oxygen has no weight. Only the thrusters’ push makes it “fall” toward the outlet.' },
                { value: Math.sqrt((2 * H) / (a / 2)), feedback: t`Two thrusters push: the stage accelerates at $2F/M$.` },
                { value: Math.sqrt(H / a), feedback: t`Starting from rest with constant acceleration, $H = \tfrac12at^2$.` },
              ],
              hints: [
                t`In free fall nothing presses the oxygen against the tank. When the thrusters push the stage forward at $a = 2F/M$, the floating oxygen is left behind: relative to the tank it moves toward the outlet with acceleration $a$.`,
                t`$a = \dfrac{2\times${F}\ \text{N}}{${M * 1000}\ \text{kg}}$; then $H = \tfrac12at^2$.`,
              ],
              teach: 'In free fall, things in a tank have no weight relative to it; a small thrust gives them an apparent gravity equal to the tank’s acceleration.',
              explain: t`$a = \dfrac{2F}{M} = ${tn(a)}\ \text{m/s}^2$, about ${s3((a / G) * 1000)} thousandths of $g$. Then $t = \sqrt{2H/a} = \sqrt{2(${H})/${tn(a)}} = ${tn(tt)}$ s. Real upper stages do exactly this: small ullage thrusters settle the propellant before every restart in orbit.`,
              visual: settlePicture(H),
            };
          },
        }),
        num({
          id: 'r2-payload', skill: 'phys2210.M9.6', difficulty: 3,
          gen(r) {
            const mp = r.pick([6500, 7000, 7500]), md = r.pick([700, 800, 900]), Isp = r.pick([340, 350, 360]), dv = r.pick([5.8, 6.0, 6.2]);
            const ve = Isp * G0, R = Math.exp((dv * 1000) / ve), P = mp / (R - 1) - md;
            return {
              prompt: t`The upper stage carries ${mp} kg of propellant and has an empty mass of ${md} kg. Its engine has $I_\text{sp} = ${Isp}$ s in vacuum ($v_e = I_\text{sp}\,g_0$, with $g_0 = 9.81\ \text{m/s}^2$). To place both payloads in the planned orbit it must add ${dv.toFixed(1)} km/s. What is the largest total payload mass it can carry?`,
              answer: P, units: 'kg', tol: { rel: 0.01 },
              errors: [
                { value: (md + mp) / R - md, feedback: t`The payload rides through the whole burn: it belongs in $m_0$ as well as in $m_f$.` },
                { value: mp / R - md, feedback: t`From $m_\text{empty} + m_\text{prop} + P = R\,(m_\text{empty} + P)$, the propellant equals $(R - 1)$ times the final mass: $P = m_\text{prop}/(R - 1) - m_\text{empty}$.` },
              ],
              hints: [
                t`The rocket equation: $\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$, with $m_0 = m_\text{empty} + m_\text{prop} + P$ and $m_f = m_\text{empty} + P$.`,
                t`$v_e = ${Isp}\times9.81 = ${tn(ve, 4)}$ m/s, so $R = e^{${dv * 1000}/${tn(ve, 4)}} = ${tn(R)}$.`,
                t`Solve $m_\text{empty} + m_\text{prop} + P = R\,(m_\text{empty} + P)$ for $P$.`,
              ],
              teach: 'To find a payload, put it into both masses of the rocket equation and solve for it.',
              explain: t`$v_e = ${tn(ve, 4)}$ m/s and $R = e^{\Delta v/v_e} = ${tn(R)}$. From $${md} + ${mp} + P = ${tn(R)}\,(${md} + P)$: $P = \dfrac{${mp}}{${tn(R - 1)}} - ${md} = ${tn(P)}$ kg — ${Math.round((100 * P) / (md + mp + P))}% of the stage's starting mass, and every kilogram of payload is a kilogram the stage must still accelerate at burnout.`,
              visual: stackPicture(mp, md),
            };
          },
        }),
      ],
    },
    {
      title: 'Orbit',
      story: t`Second-stage cutoff. The stack is in orbit — not yet the final one — and the science satellite is released to spin up its instruments.`,
      items: [
        num({
          id: 'r3-apogee', skill: 'phys2210.M13.3', difficulty: 3,
          gen(r) {
            const hp = r.pick([180, 200, 220]), vp = r.pick([7.9, 7.95, 8.0, 8.05]);
            const rp = RE + hp * 1e3, V = vp * 1e3, X = (2 * GM) / (rp * V * V), ra = rp / (X - 1), ha = (ra - RE) / 1e3;
            const rVert = 1 / (1 / rp - (V * V) / (2 * GM)), va = (V * rp) / ra / 1e3;
            return {
              prompt: t`The upper stage shuts down ${hp} km above the ground, moving horizontally at ${vp.toFixed(2)} km/s — faster than a circular orbit there needs — and coasts up an ellipse. How high above the ground is the ellipse's highest point? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km)`,
              answer: ha, units: 'km', tol: { rel: 0.03 },
              errors: [
                { value: ra / 1e3, feedback: 'That is the distance from Earth’s centre. Subtract R = 6371 km for the height above the ground.' },
                { value: (rVert - RE) / 1e3, feedback: t`At its highest point the stage is still moving sideways: angular momentum, $mrv$, does not change, so $v$ cannot drop to zero. Use energy and angular momentum together.` },
              ],
              hints: [
                t`At both ends of the ellipse the velocity is perpendicular to the radius, so angular momentum gives $r_pv_p = r_av_a$; energy gives $\tfrac12v_p^2 - \dfrac{GM}{r_p} = \tfrac12v_a^2 - \dfrac{GM}{r_a}$.`,
                t`Eliminating $v_a$ leaves $r_a = \dfrac{r_p}{2GM/(r_pv_p^2) - 1}$, with $r_p = R + ${hp}$ km.`,
              ],
              teach: 'Energy and angular momentum together fix both ends of an orbit: at the apsides the velocity is perpendicular to the radius, so L = mrv there.',
              explain: t`$r_p = ${tn(rp / 1e3, 4)}$ km and $\dfrac{2GM}{r_pv_p^2} = ${tn(X, 4)}$, so $r_a = \dfrac{${tn(rp / 1e3, 4)}}{${tn(X - 1, 4)}} = ${tn(ra / 1e3, 4)}$ km: the apogee is ${tn(ha)} km up. The stage passes it at $v_a = v_pr_p/r_a = ${tn(va)}$ km/s — slower, but far from zero.`,
              visual: ellipsePicture(),
            };
          },
        }),
        num({
          id: 'r3-booms', skill: 'phys2210.M11.3', difficulty: 3,
          gen(r) {
            const w1 = r.pick([20, 30, 40]), Ib = r.pick([8, 10, 12]), mb = r.pick([1, 1.5, 2]), L = r.pick([1.5, 2, 2.5]), R = r.pick([0.4, 0.5, 0.6]);
            const Ii = Ib + 2 * mb * R * R, Irod = mb * (L * L / 12 + (R + L / 2) ** 2), If = Ib + 2 * Irod, w2 = (w1 * Ii) / If;
            const tips = Ib + 2 * mb * (R + L) ** 2, noPA = Ib + 2 * mb * (L * L / 12);
            return {
              prompt: t`The science satellite is released spinning at ${w1} rpm. Its body has a moment of inertia of ${Ib} kg·m² about the spin axis. Two magnetometer booms, each a uniform ${mb} kg rod ${L} m long, lie folded flat along the body's side, parallel to the spin axis, at ${R} m from it. Hinges at that radius then swing them out until each points straight away from the axis. What is the spin rate afterwards? (Ignore the hinges' own mass.)`,
              answer: w2, units: 'rpm', tol: { rel: 0.01 },
              errors: [
                { value: (w1 * Ii) / tips, feedback: t`A boom is not a point mass at its tip: its mass is spread from $R$ to $R + L$. About the axis it has $m\left(\tfrac{1}{12}L^2 + (R + \tfrac{L}{2})^2\right)$.` },
                { value: (w1 * Ii) / noPA, feedback: t`$\tfrac{1}{12}mL^2$ is about the boom's own centre. Its centre is $R + L/2$ from the spin axis: add $m(R + L/2)^2$ (the parallel-axis theorem).` },
                { value: w1 * Math.sqrt(Ii / If), feedback: t`Kinetic energy is not conserved here — the hinges' latches absorb some. With no outside torque, angular momentum is: $I_1\omega_1 = I_2\omega_2$.` },
                { value: (w1 * Ib) / If, feedback: t`Folded, the booms already turn at radius $R$: include their $2m_bR^2$ in the starting moment of inertia.` },
              ],
              hints: [
                t`No outside torque acts, so $I_1\omega_1 = I_2\omega_2$.`,
                t`Folded at radius $R$, every bit of a boom is a distance $R$ from the axis: $I = m_bR^2$. Swung out, a boom runs from $R$ to $R + L$: by the parallel-axis theorem $I = m_b\left(\tfrac{1}{12}L^2 + (R + \tfrac{L}{2})^2\right)$.`,
                t`$\omega_2 = \omega_1\,\dfrac{I_\text{body} + 2m_bR^2}{I_\text{body} + 2m_b\left(\tfrac{1}{12}L^2 + (R + L/2)^2\right)}$.`,
              ],
              teach: 'With no outside torque, swinging mass outward raises I and slows the spin in proportion; the parallel-axis theorem gives each rod’s share.',
              explain: t`Before: $I_1 = ${Ib} + 2(${mb})(${R})^2 = ${tn(Ii, 4)}\ \text{kg·m}^2$. After, each boom has $${mb}\left(\tfrac{${L}^2}{12} + ${tn(R + L / 2)}^2\right) = ${tn(Irod, 4)}\ \text{kg·m}^2$, so $I_2 = ${tn(If, 4)}\ \text{kg·m}^2$. Then $\omega_2 = ${w1}\times\dfrac{${tn(Ii, 4)}}{${tn(If, 4)}} = ${tn(w2)}$ rpm. The spin energy falls by the fraction $1 - I_1/I_2 = ${Math.round(100 * (1 - Ii / If))}\%$, absorbed in the hinges as the booms lock.`,
              visual: boomPicture(L, R),
            };
          },
        }),
      ],
    },
    {
      title: 'The cold stage',
      story: t`To raise its orbit, the upper stage must relight at apogee, half an orbit away. Until then its liquid oxygen, at 90 K, rides in sunlight.`,
      items: [
        num({
          id: 'r4-boiloff', skill: 'phys2210.M16.5', difficulty: 4,
          gen(r) {
            const hp = r.pick([200, 250]), ha = r.pick([600, 800, 1000]), A = r.pick([14, 16, 18]), d = r.pick([20, 25, 30]), To = r.pick([240, 260, 280]);
            const a = RE + ((hp + ha) / 2) * 1e3, T = 2 * Math.PI * Math.sqrt(a ** 3 / GM), tc = T / 2;
            const P = (0.02 * A * (To - 90)) / (d / 1000), m = (P * tc) / LV_LOX;
            const tPer = Math.PI * Math.sqrt((RE + hp * 1e3) ** 3 / GM);
            return {
              prompt: t`The stage coasts from perigee, ${hp} km up, to apogee, ${ha} km up — half of one orbit — before it relights. Its oxygen tank has an area of ${A} m² and is covered only by ${d} mm of foam, with $k = 0.020$ W/(m·K), whose outer surface stays near ${To} K while the oxygen inside is at 90 K. How much oxygen boils away during the coast? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6371$ km, $L_v = 213$ kJ/kg; treat the foam as a flat wall.)`,
              answer: m, units: 'kg', tol: { rel: 0.015 },
              errors: [
                { value: 2 * m, feedback: 'From perigee to apogee is half an orbit, not a whole one.' },
                { value: (P * tPer) / LV_LOX, feedback: t`The coast follows the ellipse: Kepler's third law needs its semi-major axis, $a = R + (h_p + h_a)/2$, not the perigee radius.` },
                { value: (0.02 * A * To * tc) / (d / 1000) / LV_LOX, feedback: t`Heat flows because of the temperature difference across the foam, $\Delta T = ${To} - 90$ K.` },
              ],
              hints: [
                t`Kepler's third law gives the ellipse's period, $T = 2\pi\sqrt{a^3/GM}$ with $a = R + (h_p + h_a)/2$. The coast lasts $T/2$.`,
                t`Conduction through the foam: $P = kA\,\Delta T/d$.`,
                t`Boil-off: $m = Pt/L_v$.`,
              ],
              teach: 'Kepler’s third law gives a coast’s duration; the heat leak times that duration, divided by the latent heat, is the boil-off.',
              explain: t`$a = ${tn(a / 1e3, 4)}$ km gives $T = ${tn(T, 4)}$ s, so the coast lasts ${tn(tc, 4)} s, about ${Math.round(tc / 60)} minutes. Through the foam, $P = \dfrac{(0.020)(${A})(${To - 90})}{${d / 1000}} = ${tn(P)}$ W. Then $m = \dfrac{(${tn(P)})(${tn(tc, 4)})}{213\,000} = ${tn(m)}$ kg. Wrapped in a multilayer blanket instead, the same tank would leak roughly a hundred times less — but a blanket only works in vacuum, which is why tanks wear foam for the pad.`,
              visual: tankPicture(),
            };
          },
        }),
        num({
          id: 'r4-cooler', skill: 'phys2210.M19.3', difficulty: 4,
          gen(r) {
            const Qc = r.pick([8, 12, 16]), Tr = r.pick([270, 290, 310]), f = r.pick([0.15, 0.2]);
            const Kc = 90 / (Tr - 90), K = f * Kc, W = Qc / K, Qh = Qc + W, flux = 0.9 * SIGMA * Tr ** 4, A = Qh / flux;
            const Wbad = Qc / (f * (90 / Tr));
            return {
              prompt: t`A later customer needs the stage to wait in orbit for weeks, so its tank gets a multilayer blanket and a cryocooler. ${Qc} W still leaks in at 90 K. The cooler reaches ${Math.round(f * 100)}% of the Carnot limit and dumps its heat through a radiator at ${Tr} K, with emissivity 0.90, facing deep space. What radiator area does it need? ($\sigma = 5.67\times10^{-8}$ W/(m²·K⁴); ignore sunlight on the radiator.)`,
              answer: A, units: 'm^2', tol: { rel: 0.01 },
              errors: [
                { value: Qc / flux, feedback: t`The radiator must reject everything the cooler takes in: the heat lifted from the tank plus the work that drove it, $Q_h = Q_c + W$.` },
                { value: (Qc + Qc / Kc) / flux, feedback: t`That is a perfect Carnot cooler. This one manages ${Math.round(f * 100)}% of the Carnot coefficient, so it needs $1/${f}$ times the Carnot work.` },
                { value: W / flux, feedback: 'The radiator also dumps the heat lifted out of the tank, not only the electrical work.' },
                { value: (Qc + Wbad) / flux, feedback: t`For a refrigerator the Carnot limit is $K = \dfrac{T_c}{T_h - T_c}$, not $T_c/T_h$.` },
              ],
              hints: [
                t`Carnot limit for a refrigerator: $K_\text{Carnot} = \dfrac{T_c}{T_h - T_c}$; this cooler achieves ${Math.round(f * 100)}% of it.`,
                t`Work $W = Q_c/K$; the first law gives the heat dumped, $Q_h = Q_c + W$.`,
                t`A radiator facing deep space emits $\varepsilon\sigma T^4$ per square metre: $A = Q_h/(\varepsilon\sigma T_h^4)$.`,
              ],
              teach: t`A cooler’s radiator rejects the heat it lifts plus the work it uses, $Q_h = Q_c + W$ — and a very cold source makes that work large.`,
              explain: t`$K_\text{Carnot} = \dfrac{90}{${Tr - 90}} = ${tn(Kc)}$, so $K = ${f}\times${tn(Kc)} = ${tn(K)}$ and $W = ${Qc}/${tn(K)} = ${tn(W)}$ W. The radiator rejects $Q_h = ${Qc} + ${tn(W)} = ${tn(Qh)}$ W at $\varepsilon\sigma T^4 = ${tn(flux)}$ W/m², so $A = ${tn(A)}$ m². Most of what it rejects is the cooler's own work: lifting heat out of 90 K is expensive, which is why the blanket comes first.`,
              visual: flowPic({ device: 'fridge', Qh: 3, Qc: 1, W: 2, labels: { Qc: `${Qc} W from the tank`, W: 'work = ?', Qh: 'heat dumped = ?', hot: `radiator, ${Tr} K`, cold: 'oxygen tank, 90 K', device: 'cryocooler' }, caption: 'Energy flowing through the cryocooler. Here the arrow widths are schematic, not to scale.' }),
            };
          },
        }),
      ],
    },
    {
      title: 'Coming home',
      story: t`Weeks later the capsule fires its de-orbit motor. Re-entry, then parachutes, then the last metre.`,
      items: [
        mcq({
          id: 'r5-reentry', skill: 'phys2210.M8.4', difficulty: 3, kind: 'error',
          gen(r) {
            const m = r.pick([280, 300, 320]), v = r.pick([7.5, 7.6, 7.7]), vc = r.pick([140, 160, 180]), hc = r.pick([8, 9, 10]);
            const dK = 0.5 * m * ((v * 1e3) ** 2 - vc * vc), dU = GM * m * (1 / (RE + hc * 1e3) - 1 / (RE + 120e3)), shield = dK / 30e6;
            const vRot = 465, cutK = 1 - ((v * 1e3 - vRot) / (v * 1e3)) ** 2;
            return {
              prompt: t`The ${m} kg capsule meets the top of the atmosphere, 120 km up, at ${v.toFixed(1)} km/s; its parachute opens ${hc} km up at ${vc} m/s. A student writes: “In between, the capsule loses $\tfrac12m(v_1^2 - v_2^2) = ${tn(dK / 1e9)}$ GJ of kinetic energy. Heating and vaporizing heat-shield material takes about 30 MJ/kg, so that energy would vaporize ${Math.round(shield)} kg of shield — about the capsule's whole mass. Without braking rockets it cannot survive.” What is wrong?`,
              choices: [
                'The energy is about right, but nearly all of it heats the air in the shock wave ahead of the shield and is carried away; only about a per cent reaches the capsule',
                'She left out the gravitational potential energy, which is larger than the kinetic energy and makes the heating far worse than she says',
                'At these speeds the kinetic energy must be computed relativistically, and the relativistic value is far smaller than ½mv²',
                t`The atmosphere turns with Earth, so relative to the air the capsule moves much slower than ${v.toFixed(1)} km/s and carries far less energy`,
              ],
              answer: 0,
              why: {
                1: t`Falling from 120 km to ${hc} km releases only $\Delta U = ${tn(dU / 1e9)}$ GJ — about ${Math.round((100 * dU) / dK)}% of the kinetic energy, and it adds to the problem rather than removing it.`,
                2: t`$v/c$ is about $${tn((v * 1e3) / 2.998e8, 2)}$; the relativistic correction to $\tfrac12mv^2$ is of order $v^2/c^2$, less than a part in a billion.`,
                3: t`The air moves with Earth's surface, at most 0.47 km/s at the equator. Even entering eastward along the equator, that trims the kinetic energy by only about ${Math.round(100 * cutK)}%.`,
              },
              hints: ['Her energy bookkeeping is fine. Follow the energy: where does it end up?', 'Think of the glowing plasma around a returning capsule. Is that the capsule, or the air?'],
              teach: 'Drag turns a returning capsule’s kinetic energy into thermal energy — mostly the air’s, not the capsule’s, because a blunt shield holds the hot shock layer off its surface.',
              explain: t`Her numbers stand: $${tn(dK / 1e9)}$ GJ of kinetic energy plus $${tn(dU / 1e9)}$ GJ of potential energy are dissipated by drag. The error is assuming it all goes into the capsule. A blunt shield stands the shock wave off its face; the air there is heated to thousands of kelvin and streams away behind, so only a small fraction of the energy — of order one per cent — reaches the shield. That is why a shield of a few tens of kilograms suffices.`,
              visual: energyBars((0.5 * (v * 1e3) ** 2) / 1e6, (GM * (1 / RE - 1 / (RE + 120e3))) / 1e6),
            };
          },
        }),
        num({
          id: 'r5-landing', skill: 'phys2210.M6.5', difficulty: 3,
          gen(r) {
            const m = r.pick([280, 300, 320]), CdA = r.pick([40, 50, 60]), d = r.pick([0.8, 1.0, 1.2]), vf = r.pick([2, 2.5, 3]);
            const vt = Math.sqrt((2 * m * G) / (1.2 * CdA)), Fr = m * G + (m * (vt * vt - vf * vf)) / (2 * d);
            const vtBad = Math.sqrt((m * G) / (1.2 * CdA));
            return {
              prompt: t`Under its main parachute the ${m} kg capsule falls at its terminal speed. The canopy's drag area is $C_DA = ${CdA}$ m², and the air near the ground has density 1.2 kg/m³. ${d.toFixed(1)} m above the ground, a ring of soft-landing rockets fires and slows the capsule to ${vf} m/s at touchdown. Ignoring the parachute's pull during that short burn, what average thrust must the rockets give?`,
              answer: Fr / 1000, units: 'kN', tol: { rel: 0.01 },
              errors: [
                { value: (m * (vt * vt - vf * vf)) / (2 * d) / 1000, feedback: t`Gravity keeps pulling during the burn: the rockets must also hold up the weight, $F = mg + \dfrac{m(v_t^2 - v_f^2)}{2d}$.` },
                { value: (m * G + (m * (vtBad * vtBad - vf * vf)) / (2 * d)) / 1000, feedback: t`At terminal speed $mg = \tfrac12\rho C_DA\,v_t^2$, so $v_t = \sqrt{2mg/(\rho C_DA)}$ — keep the 2.` },
                { value: (m * G + (m * vt * vt) / (2 * d)) / 1000, feedback: t`It still touches down at ${vf} m/s: the rockets remove only $\tfrac12m(v_t^2 - v_f^2)$ of kinetic energy.` },
              ],
              hints: [
                t`Terminal speed: drag balances weight, $\tfrac12\rho C_DA\,v_t^2 = mg$.`,
                t`Work–energy over the last ${d.toFixed(1)} m: $(F - mg)\,d = \tfrac12m(v_t^2 - v_f^2)$.`,
              ],
              teach: 'The work–energy theorem uses the net force: a braking rocket must supply the weight as well as the deceleration.',
              explain: t`$v_t = \sqrt{\dfrac{2(${m})(9.8)}{(1.2)(${CdA})}} = ${tn(vt)}$ m/s. Then $F = mg + \dfrac{m(v_t^2 - v_f^2)}{2d} = ${tn(m * G)} + ${tn((m * (vt * vt - vf * vf)) / (2 * d))} = ${tn(Fr)}$ N, about ${fmt(Fr / (m * G), 2)} times the capsule's weight, for a fraction of a second. A real canopy keeps pulling during the burn, so the rockets can be a little smaller than this.`,
              visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'capsule', chute: true, show: 'both', accel: false, forces: [{ label: 'drag', mag: Math.round(m * G), dir: 90, kind: 'drag' }, { label: 'mg', mag: Math.round(m * G), dir: 270, kind: 'weight' }], names: ['Forces on the capsule'] }, caption: 'Descending at terminal speed under the main canopy: drag balances the weight (arrows to scale). The rockets fire only in the last metre.' },
            };
          },
        }),
      ],
    },
  ],
});
