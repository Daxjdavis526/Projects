// The PHYS 3600 boss, "The Boundary-Value Gauntlet": Kestrel, an imagined
// small spacecraft built on paper from real numbers — a Hall thruster for
// propulsion, an electric-field instrument and a magnetometer on a boom —
// bound for the solar wind upstream of Earth, and you its electromagnetic-
// cleanliness engineer. In the cleanroom: a delta-function integral in the
// charging code, deep dielectric charging by Gauss's law, and the energy on
// the charged hull (a conducting sphere's capacitance). Then the method the
// geometry demands: which one for which job, the image force that holds a
// charged dust grain to a grounded deck, and the series for a slot's field.
// Spheres and far fields: σ on a conducting sphere in a uniform field, a
// quadrupole calibration source far away, and a propellant droplet in a
// capacitance gauge. On the boom: a magnetorquer coil and a latch-valve
// magnet against the magnetometer. At first light: the Hall thruster's
// magnetic circuit and the self-field of the ion beam. Every number a learner
// reads comes from its generator; the case functions are exported so an
// independent script can recompute every key another way.
import { boss, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, MU0, QE, AMU, PI, DEG, sf, circle, polygon, bare } from './_mag.js';
import { images, relaxPic, field } from './_bvp.js';
import { magPic } from './_matter.js';

const t = String.raw;
const KC = 1 / (4 * PI * EPS0);
const G_MOON = 1.62;            // m/s², lunar surface gravity
const RHO_DUST = 3000;          // kg/m³, lunar regolith grains (approximate)
const M_XE = 131.293;           // u, xenon
const M_NDFEB = 1.0e6;          // A/m, a sintered NdFeB magnet (approximate)
// relative permittivities of cryogenic and storable propellants near their boiling points (approximate)
const PROPELLANTS = [
  { name: 'liquid hydrogen', eps: 1.23 },
  { name: 'liquid oxygen', eps: 1.5 },
  { name: 'RP-1 kerosene', eps: 2.0 },
];

/** Keep only the slips whose values are finite and clearly apart from the key. */
function apart(errors, key, rel = 0.03) {
  const kept = [];
  for (const e of errors) {
    const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-12);
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, 0.01))) kept.push(e);
  }
  return kept;
}

// ── round 1: the cleanroom ─────────────────────────────────────────────────────
/** ∫(r² + r·a)δ³(r − b)dτ over a sphere of radius R about the origin. */
export function deltaCase(r) {
  const R = r.pick([2, 3]);
  const b = r.pick([[1, 1, 0], [1, -1, 1], [0, 2, 1], [2, 2, 2], [3, 1, 1], [-1, 0, 1], [2, -1, 1]]);   // |b|² = 2, 3, 5, 12, 11, 2, 6: never on the sphere
  const a = [r.intExcept(-3, 3, [0]), r.int(-2, 2), r.intExcept(-3, 3, [0])];
  const b2 = b[0] ** 2 + b[1] ** 2 + b[2] ** 2, ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const inside = b2 < R * R;
  return { R, a, b, b2, ab, inside, key: inside ? b2 + ab : 0 };
}

/** Deep dielectric charging: ρ = kr inside an insulating sphere; E at radius r. */
export function gaussCase(r) {
  const k = r.pick([2, 5, 10]), rc = r.pick([2, 4, 6]);
  const E = (k * 1e-3 * (rc / 100) ** 2) / (4 * EPS0);
  return { k, rc, E };
}

/** The hull as a conducting sphere charged to −V: the energy stored, ½CV² with C = 4πε₀R. */
export function chargeCase(r) {
  const R = r.pick([0.6, 1, 1.5]), V = r.pick([2, 5, 10, 15]);
  const C = 4 * PI * EPS0 * R, W = 0.5 * C * (V * 1e3) ** 2;
  return { R, V, C, W };
}

// ── round 2: pick the method ───────────────────────────────────────────────────
const METHODS = ['The method of images', 'Separation of variables in Cartesian coordinates', 'Separation of variables in spherical coordinates, with Legendre polynomials', 'The multipole expansion'];
const SCENES = [
  {
    method: 0,
    text: t`the force pulling an electron back toward Kestrel’s large, flat, grounded aluminium deck when it is emitted 1 mm above it`,
    visual: images({ geometry: 'plane', q: -3, pos: [0, 2.5], lines: 7 }, 'A charge above a grounded conducting plane, with its field lines. The surface charge it induces is shaded.'),
    why: { 1: 'There is no box here: one surface, infinite in extent, and a point charge in front of it.', 2: 'Nothing is spherical; the conductor is a flat plane.', 3: 'You need the field 1 mm from the plane, not far away — and the induced charge is spread out, not compact.' },
  },
  {
    method: 1,
    text: t`the potential inside the long rectangular entrance channel of a plasma analyser, one wall held at $+V_0$ and the other three grounded`,
    visual: relaxPic({ n: 24, aspect: 0.6, walls: { left: 0, right: 0, bottom: 0, top: 100 }, probe: false, labels: false, levels: 7 }, 'The channel in cross-section: one wall held at a voltage, the others grounded, with equipotentials (computed by relaxation). Long in the third direction.'),
    why: { 0: 'An image system for a box of four walls would need infinitely many images, and the boundary is not a point charge’s.', 2: 'The walls are flat and meet at right angles: Cartesian, not spherical.', 3: 'The question is the potential inside the channel, among its walls — not far from a compact source.' },
  },
  {
    method: 2,
    text: t`the charge induced on Kestrel’s spherical, conducting Langmuir-probe sensor by a uniform electric field`,
    visual: field({ x: [-9, 9], y: [-5, 5], conductor: { x: 0, y: 0, R: 2.5 }, uniform: [20000, 0], fieldLines: true, density: 14 }, 'A conducting sphere in a uniform field: the field lines bend to meet it at right angles. Exact.'),
    why: { 0: 'A single image does not make a sphere an equipotential in a uniform field (it takes a dipole at the centre — which is what the Legendre series finds).', 1: 'The boundary is a sphere, so the coordinates must be spherical.', 3: 'The answer is wanted on the sphere itself, not far away.' },
  },
  {
    method: 3,
    text: t`the potential 50 m from a cluster of charged solar-panel segments a metre across, for a model of the surrounding plasma`,
    visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { points: [[-1.9, 0.1, 'warn'], [-1.6, -0.2, 'accent'], [-1.75, 0.35, 'warn'], [-1.45, 0.15, 'accent'], [-1.95, -0.3, 'warn']].map(([x, y, c]) => ({ x, y, r: 5, color: c })).concat([{ x: 2.2, y: 0.5, r: 5, color: 'good', label: 'P, far away', labelDx: -60, labelDy: -14 }]), arrows: [{ from: [-1.4, 0.05], to: [2.1, 0.47], color: 'ink4', width: 1, dash: [4, 4] }] }), caption: 'A compact cluster of charges (orange +, blue −) and a point far away. Not to scale: P is fifty times farther than drawn.' },
    why: { 0: 'There is no conductor to mirror in; the charges are simply given.', 1: 'There is no boundary at all, just a compact source and a distant point.', 2: 'Spherical harmonics do appear — the multipole expansion is a Legendre series in 1/r — but there is no boundary condition on a sphere to fit: expand 1/𝓇 instead.' },
  },
];
export function methodCase(r) { return SCENES[r.int(0, SCENES.length - 1)]; }

/** A charged lunar dust grain above a grounded conducting deck: the height where the image force equals its weight. */
export function imageCase(r) {
  const a = r.pick([5, 10, 20]), Vs = r.pick([5, 10, 20]);
  const m = RHO_DUST * (4 / 3) * PI * (a * 1e-6) ** 3, q = 4 * PI * EPS0 * a * 1e-6 * Vs;
  const d = q / (4 * Math.sqrt(PI * EPS0 * m * G_MOON));
  return { a, Vs, m, q, d };
}

/** A semi-infinite slot (width a, end at V₀): V on the centre line at depth x = f·a, from the full Fourier series. */
export function slotCase(r) {
  const V0 = r.pick([100, 300, 1000]), f = r.pick([0.25, 0.4, 0.5, 1]);
  let s = 0;
  for (let n = 1; n < 400; n += 2) s += (Math.exp(-n * PI * f) * Math.sin((n * PI) / 2)) / n;
  return { V0, f, key: ((4 * V0) / PI) * s, one: ((4 * V0) / PI) * Math.exp(-PI * f) };
}

// ── round 3: spheres and far fields ────────────────────────────────────────────
/** σ on a conducting sphere in a uniform field E₀, at polar angle θ from the field. */
export function sphereCase(r) {
  const E0 = r.pick([50, 100, 200]), th = r.pick([0, 30, 45, 60, 120, 150]);
  return { E0, th, sigma: 3 * EPS0 * E0 * 1e3 * Math.cos(th * DEG) };
}

/** A linear quadrupole +q, −2q, +q (spacing d) on the z-axis: V on the axis at distance k·d. */
export function multipoleCase(r) {
  const q = r.pick([1, 2, 5]), d = r.pick([1, 2]), k = r.pick([15, 20, 30]);
  const z = k * d * 1e-2, dd = d * 1e-2, Q = q * 1e-9;
  const V = KC * Q * (1 / (z - dd) + 1 / (z + dd) - 2 / z);
  return { q, d, k, z, V, quad: (2 * KC * Q * dd * dd) / z ** 3 };
}

/** A propellant droplet (a linear dielectric sphere) in a uniform field: E inside. */
export function loxCase(r) {
  const P = r.pick(PROPELLANTS), E0 = r.pick([50, 100, 200]);
  return { P, E0, E: (3 * E0) / (P.eps + 2) };
}

// ── round 4: the boom ──────────────────────────────────────────────────────────
/** A square air-core magnetorquer (N turns, current I, side s) seen from the boom tip, across its axis, at distance d. */
export function torquerCase(r) {
  const N = r.pick([100, 200, 400]), I = r.pick([0.05, 0.1, 0.2]), s = r.pick([0.2, 0.3]), d = r.pick([2, 3, 5]);
  const m = N * I * s * s, B = (MU0 * m) / (4 * PI * d ** 3);
  return { N, I, s, d, m, B };
}

/** A latch-valve NdFeB disk: the shortest boom keeping its on-axis field below B_max. */
export function valveCase(r) {
  const D = r.pick([4, 6, 8]), L = r.pick([2, 3]), Bmax = r.pick([0.2, 0.5, 1]);
  const V = PI * (D * 5e-4) ** 2 * L * 1e-3, m = M_NDFEB * V;
  return { D, L, Bmax, V, m, rmin: Math.cbrt((MU0 * m) / (2 * PI * Bmax * 1e-9)) };
}

// ── round 5: first light ───────────────────────────────────────────────────────
/** The Hall thruster's magnetic circuit: ampere-turns for B across the channel gap. */
export function hallCase(r) {
  const B = r.pick([15, 20, 25]), g = r.pick([8, 12, 16]), l = r.pick([0.25, 0.35]), mur = r.pick([1000, 2500]);
  return { B, g, l, mur, NI: ((B * 1e-3) / MU0) * (g * 1e-3 + l / mur) };
}

/** An unneutralized xenon ion beam: its self electric field at radius s. */
export function beamCase(r) {
  const I = r.pick([1, 2, 5]), V = r.pick([300, 1100, 1800]), s = r.pick([1, 2, 5]);
  const v = Math.sqrt((2 * QE * V) / (M_XE * AMU)), lam = (I * 1e-3) / v, E = lam / (2 * PI * EPS0 * s * 1e-2);
  return { I, V, s, v, lam, E };
}

// ── pictures ───────────────────────────────────────────────────────────────────
const deltaPic = (C) => {
  const bl = Math.sqrt(C.b2), sc = 1.1 / C.R;
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.25, 1.25], {
      shade: [{ fn: `sqrt(max(${(C.R * sc) ** 2} - x^2, 0))`, lower: `-sqrt(max(${(C.R * sc) ** 2} - x^2, 0))`, from: -C.R * sc, to: C.R * sc, color: 'accent', alpha: 0.12 }],
      curves: [circle(C.R * sc, 'accent')],
      arrows: [{ from: [0, 0], to: [+(0.7 * bl * sc).toFixed(4), +(0.7 * bl * sc).toFixed(4)], color: 'ink3', width: 1.4, dash: [4, 4] }],
      points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, { x: +(0.7 * bl * sc).toFixed(4), y: +(0.7 * bl * sc).toFixed(4), r: 5, color: 'warn', label: 'the grain, at b', labelDx: 8, labelDy: -8 }, { x: -C.R * sc * 0.7, y: -C.R * sc * 0.7, r: 0, label: `sphere of radius ${C.R}`, labelDx: -8, labelDy: 14, labelAlign: 'right', color: 'accent' }],
    }),
    caption: 'The integration volume (blue) and the grain’s position, drawn in the plane that contains it, to scale.',
  };
};

const gaussPic = (C) => {
  const g = 0.25 + C.rc * 0.12;
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.25, 1.25], {
      shade: [0.95, 0.75, 0.55, 0.35].map((rr, i) => ({ fn: `sqrt(max(${rr * rr} - x^2, 0))`, lower: `-sqrt(max(${rr * rr} - x^2, 0))`, from: -rr, to: rr, color: 'violet', alpha: 0.12 + 0.02 * i })),
      curves: [circle(1, 'ink2'), circle(g, 'gold', { dash: [5, 4] })],
      points: [{ x: 1.05, y: 0.6, r: 0, label: 'ρ = kr: densest at the edge', color: 'violet' }, { x: g * 0.71, y: -g * 0.71, r: 0, label: `Gaussian sphere, r = ${C.rc} cm`, labelDx: 8, labelDy: 12, color: 'gold' }],
    }),
    caption: 'The block modelled as a sphere of radius 10 cm with trapped charge growing toward its surface (shading), and a Gaussian sphere (gold, dashed). Not to scale.',
  };
};

const chargePic = (C) => field({ x: [-9, 9], y: [-5, 5], balls: [{ x: 0, y: 0, R: 2.4, Q: -5, shell: true }], fieldLines: true, density: 14 }, `Kestrel’s hull modelled as a conducting sphere of radius ${C.R} m carrying negative charge on its surface; its field lines run inward. Not to scale.`);

const slotPic = (C) => relaxPic({ n: 24, aspect: 2, walls: { left: 0, right: 0, bottom: C.V0, top: 0 }, probe: false, labels: false, levels: 7 }, 'The slot’s cross-section: its end (bottom) held at V₀, its long sides grounded. The box is cut off at twice the width; the real slot runs on, so this relaxation picture is close but not exact.');

const quadPic = (C) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    curves: [{ fn: '0', domain: [-2.5, 2.5], color: 'ink4', width: 1, dash: [3, 5] }],
    points: [{ x: -2, y: 0, r: 6, color: 'warn', label: '+q', labelDx: -6, labelDy: -14, labelAlign: 'center' }, { x: -1.6, y: 0, r: 7, color: 'accent', label: '−2q', labelDx: 0, labelDy: -14, labelAlign: 'center' }, { x: -1.2, y: 0, r: 6, color: 'warn', label: '+q', labelDx: 6, labelDy: -14, labelAlign: 'center' }, { x: 2.2, y: 0, r: 5, color: 'good', label: `${C.k}d away`, labelDx: 0, labelDy: -14, labelAlign: 'center' }],
  }),
  caption: 'The calibration source on its axis (dashed): three charges a distance d apart, and the field point. Not to scale.',
});

/** Flux-function contours of a uniform field bent by a linear sphere (axis along x), β = (ε_r − 1)/(ε_r + 2). */
const dielPic = (beta, caption) => ({
  type: 'c3-contour',
  params: { f: `step(1 - (x^2 + y^2))*${+(1 + 2 * beta).toFixed(4)}*y^2/2 + step((x^2 + y^2) - 1)*y^2*(0.5 + ${+beta.toFixed(4)}/(x^2 + y^2)^1.5)`, x: [-3.2, 3.2], y: [-1.6, 1.6], levels: [0.02, 0.08, 0.18, 0.32, 0.5, 0.72, 0.98, 1.28], labels: false, fill: false, aspect: 'wide', xlabel: '', ylabel: '', n: 160, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'teal', width: 2 }] },
  caption,
});

const boomPic = (C, what) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '0.45', lower: '-0.45', from: -2.4, to: -1.5, color: 'ink3', alpha: 0.35 }],
    curves: [{ fn: '0', domain: [-1.5, 2.1], color: 'ink2', width: 2 }, ...(what === 'coil' ? polygon([[-2.25, -0.3], [-1.65, -0.3], [-1.65, 0.3], [-2.25, 0.3]], 'warn') : [])],
    arrows: what === 'coil' ? [{ from: [-1.95, -0.05], to: [-1.95, 0.42], color: 'gold', width: 2.4, label: 'm', labelDx: 6 }] : [{ from: [-1.95, -0.2], to: [-1.6, -0.2], color: 'gold', width: 2.4, label: 'm', labelDx: 4, labelDy: 10 }],
    points: [{ x: 2.15, y: 0, r: 6, color: 'good', label: 'magnetometer', labelDx: 0, labelDy: -14, labelAlign: 'center' }, { x: 0.3, y: 0, r: 0, label: what === 'coil' ? `boom, ${C.d} m` : 'boom', labelDx: 0, labelDy: 14, labelAlign: 'center', color: 'ink2' }, { x: -1.95, y: -0.62, r: 0, label: what === 'coil' ? 'torquer coil' : 'valve magnet', labelAlign: 'center', labelDx: 0, labelDy: 0, color: what === 'coil' ? 'warn' : 'gold' }],
  }),
  caption: what === 'coil' ? 'Kestrel’s body (grey) with the torquer coil (orange, seen edge-on, its moment across the boom) and the magnetometer at the end of the boom. Not to scale.' : 'Kestrel’s body with the valve magnet’s moment pointing along the boom — the worst case — and the magnetometer at its tip. Not to scale.',
});

const yokePic = (caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [
      { fn: '1.1', lower: '0.75', from: -1.6, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '-0.75', lower: '-1.1', from: -1.6, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '0.75', lower: '-0.75', from: -1.6, to: -1.25, color: 'ink3', alpha: 0.45 },
      { fn: '0.75', lower: '0.12', from: 1.05, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '-0.12', lower: '-0.75', from: 1.05, to: 1.4, color: 'ink3', alpha: 0.45 },
    ],
    curves: [...[-0.55, -0.35, -0.15, 0.05, 0.25, 0.45].map((y) => ({ param: ['-1.43 + 0.3*cos(t)', `${y} + 0.06*sin(t)`], t: [0, 2 * PI], color: 'warn', width: 1.6 })),
      ...polygon([[-1.425, -0.925], [1.225, -0.925], [1.225, 0.925], [-1.425, 0.925]], 'violet', { width: 1.3, dash: [5, 4] })],
    arrows: [{ from: [1.22, -0.1], to: [1.22, 0.1], color: 'accent', width: 2 }],
    points: [{ x: 1.45, y: 0, r: 0, label: 'channel', labelDx: 8, labelDy: 0, color: 'accent' }, { x: -1.75, y: 0.55, r: 0, label: 'coils', labelAlign: 'right', labelDx: 0, labelDy: 0, color: 'warn' }],
  }),
  caption,
});

const beamPic = (caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: 'sqrt(max(0.09 - x^2, 0))', lower: '-sqrt(max(0.09 - x^2, 0))', from: -0.3, to: 0.3, color: 'violet', alpha: 0.5 }],
    curves: [circle(0.9, 'warn', { width: 1.5, dash: [5, 4] })],
    arrows: [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * PI) / 3 + 0.3; return { from: [0.9 * Math.cos(a), 0.9 * Math.sin(a)], to: [1.25 * Math.cos(a), 1.25 * Math.sin(a)], color: 'warn', width: 2 }; }),
    points: [{ x: 0.32, y: -0.28, r: 0, label: 'beam (out of page)', labelDx: 4, labelDy: 8, color: 'violet' }, { x: 1.3, y: 0.9, r: 0, label: 'E', color: 'warn' }, { x: -0.9, y: -0.9, r: 0, label: 'radius s (dashed)', labelAlign: 'right', color: 'warn' }],
  }),
  caption,
});

export default boss({
  title: 'The Boundary-Value Gauntlet',
  intro: t`*Kestrel* is an imagined small spacecraft, built on paper from real numbers: a Hall thruster to push it out to the solar wind upstream of Earth, an electric-field instrument, and a magnetometer on a boom that must hear fields of a few nanotesla over the spacecraft’s own electrical noise. You are its **electromagnetic-cleanliness engineer**, and every problem on your desk is a static field. Some yield to symmetry and Gauss’s law; most need the method the geometry demands — images, separation of variables, a Legendre series or a multipole expansion — and the last ones need the fields in matter. Five rounds, thirteen problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The cleanroom',
      story: t`Before anything flies, the charging team checks its code and its hardware. Electrons from Earth’s radiation belts bury themselves in thick insulators and stay there; in eclipse the whole hull can charge to kilovolts. The equations are the first ones of the course.`,
      items: [
        num({
          id: 'r1-delta', skill: 'phys3600.M0.4', difficulty: 3,
          gen(r) {
            const C = deltaCase(r), { R, a, b } = C;
            const bt = `(${b.join(', ')})`, at = `(${a.join(', ')})`;
            return {
              prompt: t`Kestrel’s charging code stores a charged dust grain as a density $q\,\delta^3(\vec r - \vec b)$. A unit test evaluates $$I = \int_V\left(r^2 + \vec r\cdot\vec a\right)\delta^3(\vec r - \vec b)\,d\tau$$ over the ball $V$ of radius $R = ${R}$ m centred at the origin, with $\vec b = ${bt}$ m and $\vec a = ${at}$ m. What should it return, in m²?`,
              visual: deltaPic(C),
              answer: C.key, units: 'm^2', tol: { rel: 0.001, abs: 0.01 },
              errors: apart(C.inside
                ? [{ value: C.b2, feedback: t`The $\vec r\cdot\vec a$ term is sifted too: it becomes $\vec b\cdot\vec a$.` }, { value: C.ab, feedback: t`The $r^2$ term becomes $b^2$; keep it.` }, { value: 0, feedback: t`$|\vec b| = ${nice(sf(Math.sqrt(C.b2), 3))}$ m is less than $R = ${R}$ m: the spike is inside the ball, so it counts.` }]
                : [{ value: C.b2 + C.ab, feedback: t`$|\vec b| = ${nice(sf(Math.sqrt(C.b2), 3))}$ m is more than $R = ${R}$ m: the spike lies outside the ball, so the integral over the ball is zero.` }], C.key),
              hints: [t`$\int_V f(\vec r)\,\delta^3(\vec r - \vec b)\,d\tau = f(\vec b)$ if $\vec b$ is inside $V$, and 0 if it is not.`, t`Compare $|\vec b|$ with $R$ first.`],
              teach: 'The delta function picks out the integrand at its spike — but only if the spike lies inside the region of integration.',
              explain: C.inside
                ? t`$|\vec b| = ${nice(sf(Math.sqrt(C.b2), 3))}$ m $< R$, so $I = b^2 + \vec b\cdot\vec a = ${C.b2} + (${C.ab}) = ${C.key}\ \text{m}^2$.`
                : t`$|\vec b| = ${nice(sf(Math.sqrt(C.b2), 3))}$ m $> R$: the spike is outside the ball, and $I = 0$. Forgetting to check is a documented slip — and exactly the bug a unit test should catch.`,
            };
          },
        }),
        num({
          id: 'r1-gauss', skill: 'phys3600.M1.3', difficulty: 3,
          gen(r) {
            const C = gaussCase(r);
            return {
              prompt: t`Belt electrons bury themselves in a thick insulating block on Kestrel, and the trapped charge piles up toward its surface. Model the block as a sphere of radius 10 cm with $\rho = kr$, $k = ${C.k}\ \text{mC/m}^4$, and ignore the material’s permittivity. How strong is the field ${C.rc} cm from the centre?`,
              visual: gaussPic(C),
              answer: C.E / 1e3, units: 'kV/m', tol: { rel: 0.01 },
              errors: apart([
                { value: (C.k * 1e-3 * (C.rc / 100) ** 2) / (3 * EPS0) / 1e3, feedback: t`$\rho r/3\varepsilon_0$ is the uniform-density result. With $\rho = kr$ the enclosed charge is $\int_0^r kr'\,4\pi r'^2\,dr' = \pi kr^4$.` },
                { value: (C.k * 1e-3 * 0.1 ** 4 * PI) / (4 * PI * EPS0 * (C.rc / 100) ** 2) / 1e3, feedback: 'That counts all the charge in the block. Gauss’s law encloses only the charge inside your sphere.' },
              ], C.E / 1e3),
              hints: [t`Spherical symmetry: $E\cdot4\pi r^2 = Q_{\text{enc}}/\varepsilon_0$.`, t`$Q_{\text{enc}} = \int_0^r kr'\cdot4\pi r'^2\,dr' = \pi kr^4$, so $E = \dfrac{kr^2}{4\varepsilon_0}$.`],
              teach: 'With spherical symmetry, Gauss’s law needs only the charge enclosed — an integral of ρ over the Gaussian sphere.',
              explain: t`$Q_{\text{enc}} = \pi kr^4$ and $E = \dfrac{kr^2}{4\varepsilon_0} \approx ${nice(sf(C.E / 1e3, 3))}$ kV/m, pointing outward if the charge were positive (belt electrons make it point inward). Real deep-dielectric charging builds fields of $10^7$ V/m and more inside cable insulation and circuit boards, until a discharge — one of the commonest causes of spacecraft anomalies.`,
            };
          },
        }),
        num({
          id: 'r1-charge', skill: 'phys3600.M3.2', difficulty: 2,
          gen(r) {
            const C = chargeCase(r);
            return {
              prompt: t`In eclipse, hot plasma can charge a spacecraft’s whole conducting hull to kilovolts negative. Model Kestrel’s hull as an isolated conducting sphere of radius ${C.R} m at $-${C.V}$ kV relative to the distant plasma. How much electrostatic energy is stored in its field?`,
              visual: chargePic(C),
              answer: C.W * 1e3, units: 'mJ', tol: { rel: 0.01 },
              errors: apart([
                { value: 2 * C.W * 1e3, feedback: t`$CV^2$ double-counts: the energy is $\tfrac12QV = \tfrac12CV^2$, because the charge was brought in against a potential that grew from zero.` },
                { value: 0.5 * EPS0 * C.R * (C.V * 1e3) ** 2 * 1e3, feedback: t`An isolated sphere’s capacitance is $4\pi\varepsilon_0R$, not $\varepsilon_0R$.` },
              ], C.W * 1e3),
              hints: [t`An isolated sphere has $C = 4\pi\varepsilon_0R$.`, t`$W = \tfrac12CV^2$.`],
              teach: 'A conductor’s stored energy is ½CV² — the same as ½∫ε₀E² dτ over its field.',
              explain: t`$C = 4\pi\varepsilon_0R \approx ${nice(sf(C.C * 1e12, 3))}$ pF and $W = \tfrac12CV^2 \approx ${nice(sf(C.W * 1e3, 3))}$ mJ. Small as energy goes — but released in a nanosecond arc between surfaces charged to different voltages, it is enough to damage electronics, which is why spacecraft surfaces are made conductive and bonded together.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Pick the method',
      story: t`The uniqueness theorem is the engineer’s licence: find **any** potential that satisfies Laplace’s equation and the boundary conditions, and it is **the** potential. The trick is choosing how to find it. The geometry decides.`,
      items: [
        mcq({
          id: 'r2-method', skill: 'phys3600.M4.1', difficulty: 2,
          gen(r) {
            const S = methodCase(r);
            return {
              prompt: t`Which method does this job demand: ${S.text}?`,
              visual: S.visual,
              choices: METHODS, answer: S.method, why: S.why,
              hints: ['Look at the boundaries: a plane, a box, a sphere — or none at all, and a distant point?', 'A point charge before one flat conductor: images. Flat walls meeting at right angles: Cartesian separation. A sphere: Legendre. Far from a compact source: multipoles.'],
              teach: 'The boundary’s shape picks the method: a plane for images, a box for Cartesian separation, a sphere for Legendre, no boundary and a far point for multipoles.',
              explain: t`${METHODS[S.method]}. Uniqueness guarantees that whatever method satisfies Laplace’s equation and these boundary conditions has found the one answer; the geometry only decides which method gets there with the least work.`,
            };
          },
        }),
        num({
          id: 'r2-image', skill: 'phys3600.M4.2', difficulty: 3,
          gen(r) {
            const C = imageCase(r);
            return {
              prompt: t`On the Moon, sunlight charges dust grains positive. A grain of radius ${C.a} μm and density $${RHO_DUST}\ \text{kg/m}^3$, charged to ${C.Vs} V (so $q = 4\pi\varepsilon_0aV$), sits above a lander’s large grounded metal deck. Below what height does the image force pulling it down exceed its weight ($g = ${G_MOON}\ \text{m/s}^2$)?`,
              visual: images({ geometry: 'plane', q: 4, pos: [0, 2.5], lines: 7, force: true }, 'A charged grain above a grounded plane: its field lines end on the induced charge, and the force (gold) pulls it toward the plane. Grain hugely enlarged.'),
              answer: C.d * 1e6, units: 'um', tol: { rel: 0.01 },
              errors: apart([{ value: 2 * C.d * 1e6, feedback: t`The image is a distance $2d$ from the grain, not $d$: $F = \dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$.` }], C.d * 1e6),
              hints: [t`The image is $-q$ at depth $d$ below the plane, so $F = \dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$.`, t`Set $F = mg$: $d = \dfrac{q}{4\sqrt{\pi\varepsilon_0mg}}$.`],
              teach: 'A charge before a grounded plane feels its image −q at twice its distance: F = q²/4πε₀(2d)².',
              explain: t`$m \approx ${tex(C.m, 3)}$ kg and $q \approx ${tex(C.q, 3)}$ C, so $d = \dfrac{q}{4\sqrt{\pi\varepsilon_0mg}} \approx ${nice(sf(C.d * 1e6, 3))}\ \mu\text{m}$. Closer than that, the grain’s own image holds it down harder than lunar gravity — one reason Apollo crews found dust clinging to every metal surface (contact adhesion helps too).`,
            };
          },
        }),
        num({
          id: 'r2-slot', skill: 'phys3600.M4.3', difficulty: 3,
          gen(r) {
            const C = slotCase(r);
            return {
              prompt: t`An ion analyser’s entrance is a long slot of width $a$: two grounded parallel plates, closed at one end by an electrode at $V_0 = ${C.V0}$ V. Separation of variables gives $$V(x, y) = \frac{4V_0}{\pi}\sum_{n\ \text{odd}}\frac1n e^{-n\pi x/a}\sin\frac{n\pi y}{a}.$$ What is the potential on the slot’s centre line ($y = a/2$) a depth $x = ${C.f}a$ in from the electrode?`,
              visual: slotPic(C),
              answer: C.key, units: 'V', tol: { rel: 0.01 },
              errors: apart([
                { value: C.one, feedback: t`One term is not enough this close to the electrode: add $n = 3$ (with $\sin(3\pi/2) = -1$) and more until they stop mattering.` },
                { value: C.V0 * Math.exp(-PI * C.f), feedback: t`Keep the Fourier coefficient $4V_0/n\pi$: the first term is $\tfrac{4V_0}{\pi}e^{-\pi x/a}$.` },
              ], C.key),
              hints: [t`At $y = a/2$, $\sin(n\pi/2) = +1, -1, +1, \dots$ for $n = 1, 3, 5, \dots$`, t`Sum $\tfrac{4V_0}{\pi}\left(e^{-\pi x/a} - \tfrac13e^{-3\pi x/a} + \tfrac15e^{-5\pi x/a} - \dots\right)$ until the terms are negligible.`],
              teach: t`Each Fourier mode of a slot dies as $e^{-n\pi x/a}$: near the electrode several terms matter, deeper in only the first.`,
              explain: t`The series gives $V \approx ${nice(sf(C.key, 4))}$ V (the first term alone gives $${nice(sf(C.one, 4))}$ V). Its terms die as $e^{-n\pi x/a}$, so ${C.f >= 0.5 ? 'here the first term is almost all of it' : 'this close to the electrode the higher modes still count'}. The series sums in closed form, $V = \tfrac{2V_0}{\pi}\arctan\dfrac{\sin(\pi y/a)}{\sinh(\pi x/a)}$ — a check worth making.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Spheres and far fields',
      story: t`Kestrel’s sensors are not all flat. A spherical probe sits in a uniform field during ground test; a calibration source is seen only from far away; and the propellant gauges sense droplets of liquid in an electric field. Legendre polynomials and the multipole expansion take over.`,
      items: [
        num({
          id: 'r3-sphere', skill: 'phys3600.M4.4', difficulty: 2,
          gen(r) {
            const C = sphereCase(r);
            return {
              prompt: t`In a ground-test chamber, Kestrel’s uncharged spherical conducting probe sits in a uniform field $E_0 = ${C.E0}$ kV/m. Solving Laplace’s equation with Legendre polynomials gives the induced charge as a function of the angle $\theta$ from the field. What is the surface charge density at $\theta = ${C.th}°$?`,
              visual: field({ x: [-9, 9], y: [-5, 5], conductor: { x: 0, y: 0, R: 2.5 }, uniform: [20000, 0], fieldLines: true, density: 14 }, 'The probe in the chamber’s field (along +x): the field lines bend to meet the conductor at right angles. Exact.'),
              answer: C.sigma * 1e9, units: 'nC/m^2', tol: { rel: 0.01 },
              errors: apart([
                { value: EPS0 * C.E0 * 1e3 * Math.cos(C.th * DEG) * 1e9, feedback: t`The sphere concentrates the field: $\sigma = 3\varepsilon_0E_0\cos\theta$, not $\varepsilon_0E_0\cos\theta$.` },
                { value: 3 * EPS0 * C.E0 * 1e3 * 1e9, feedback: t`That is the value at the pole. Away from it, multiply by $\cos\theta$.` },
              ], C.sigma * 1e9),
              hints: [t`Outside, $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$.`, t`$\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r = R$: $3\varepsilon_0E_0\cos\theta$.`],
              teach: 'A conducting sphere in a uniform field carries σ = 3ε₀E₀ cos θ: the field at its poles is tripled.',
              explain: t`$\sigma = 3\varepsilon_0E_0\cos ${C.th}° \approx ${nice(sf(C.sigma * 1e9, 3))}\ \text{nC/m}^2$${C.th > 90 ? ', negative on the side the field comes from' : ''}. The surface field there is $\sigma/\varepsilon_0$ — up to three times $E_0$ at the poles — which is why test engineers keep probes well below the field at which air breaks down.`,
            };
          },
        }),
        num({
          id: 'r3-multipole', skill: 'phys3600.M4.5', difficulty: 3,
          gen(r) {
            const C = multipoleCase(r);
            return {
              prompt: t`The electric-field instrument is calibrated against a source of three charges in a line, $+${C.q}$ nC, $-${2 * C.q}$ nC and $+${C.q}$ nC, ${C.d} cm apart. What potential does it produce on its axis, ${C.k} spacings ($${C.k}d$) from the middle charge?`,
              visual: quadPic(C),
              answer: C.V * 1e3, units: 'mV', tol: { rel: 0.01 },
              errors: apart([
                { value: KC * C.q * 1e-9 / C.z * 1e3, feedback: t`The total charge is zero: there is no monopole term. The leading term is the quadrupole, $\dfrac{2qd^2}{4\pi\varepsilon_0r^3}$ on the axis.` },
                { value: (KC * C.q * 1e-9 * 2 * C.d * 1e-2) / C.z ** 2 * 1e3, feedback: t`The dipole moment is zero too: $\sum q_iz_i = q d - 0 - q d = 0$. The quadrupole term leads.` },
              ], C.V * 1e3),
              hints: [t`Monopole: $\sum q_i = 0$. Dipole: $\sum q_iz_i = 0$. So the quadrupole term leads, falling as $1/r^3$.`, t`On the axis, $V \approx \dfrac{1}{4\pi\varepsilon_0}\dfrac{2qd^2}{r^3}$ — or sum the three Coulomb potentials exactly.`],
              teach: 'Far away, the lowest non-vanishing multipole wins: a neutral source with no dipole moment looks like a quadrupole, falling as 1/r³.',
              explain: t`Exactly, $V = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac{1}{r - d} + \dfrac{1}{r + d} - \dfrac2r\right) \approx ${nice(sf(C.V * 1e3, 3))}$ mV; the quadrupole term alone gives $${nice(sf(C.quad * 1e3, 3))}$ mV, within $(d/r)^2$. Compare $${nice(sf((KC * C.q * 1e-9) / C.z, 3))}$ V for a single ${C.q} nC charge at that distance: cancelling the monopole and dipole costs a factor of several hundred.`,
            };
          },
        }),
        num({
          id: 'r3-lox', skill: 'phys3600.M5.3', difficulty: 3,
          gen(r) {
            const C = loxCase(r), beta = (C.P.eps - 1) / (C.P.eps + 2);
            return {
              prompt: t`A capacitance gauge senses propellant by its permittivity. A spherical droplet of ${C.P.name} ($\varepsilon_r \approx ${C.P.eps}$) floats in the gauge’s uniform field $E_0 = ${C.E0}$ kV/m. How strong is the field inside the droplet?`,
              visual: dielPic(beta, t`The droplet (teal) in the uniform field: the lines drawn are those of $\vec D$, which crowd into it, while $\vec E$ inside is weaker than outside. From the exact solution; $\varepsilon_r$ as in the problem.`),
              answer: C.E, units: 'kV/m', tol: { rel: 0.01 },
              errors: apart([
                { value: C.E0 / C.P.eps, feedback: t`$E_0/\varepsilon_r$ is a slab’s field across its faces. A sphere’s own bound charge reduces it less: $3E_0/(\varepsilon_r + 2)$.` },
                { value: (3 * C.P.eps * C.E0) / (C.P.eps + 2), feedback: t`That is $D/\varepsilon_0$ inside; $E$ is smaller by $\varepsilon_r$.` },
              ], C.E),
              hints: [t`Inside $V = Ar\cos\theta$, outside $V = -E_0r\cos\theta + \dfrac{B\cos\theta}{r^2}$: match $V$ and $\varepsilon_rE_r$ at the surface.`, t`The result: $E_{\text{in}} = \dfrac{3E_0}{\varepsilon_r + 2}$, uniform.`],
              teach: t`A linear dielectric sphere has a uniform field inside, $3E_0/(\varepsilon_r + 2)$: weaker than outside, but less so than in a slab.`,
              explain: t`$E_{\text{in}} = \dfrac{3(${C.E0})}{${C.P.eps} + 2} \approx ${nice(sf(C.E, 3))}$ kV/m, uniform and along $E_0$. Cryogenic propellants have permittivities so close to 1 that a gauge must resolve a few per cent change in capacitance between liquid and vapour — which is why such gauges need careful calibration in both phases.`,
            };
          },
        }),
      ],
    },
    {
      title: 'The boom',
      story: t`The magnetometer must measure the interplanetary field, about 5 nT, to a fraction of a nanotesla. Every magnetic moment on Kestrel is a dipole whose field falls as $1/r^3$ along the boom.`,
      items: [
        num({
          id: 'r4-torquer', skill: 'phys3600.M6.6', difficulty: 3,
          gen(r) {
            const C = torquerCase(r);
            return {
              prompt: t`Kestrel’s magnetorquer is a square air-core coil of ${C.N} turns, ${C.s * 100} cm on a side, carrying ${C.I} A. Its axis is at right angles to the boom, and the magnetometer sits ${C.d} m away. Treating the coil as a point dipole, what field does it add at the magnetometer?`,
              visual: boomPic(C, 'coil'),
              answer: C.B * 1e9, units: 'nT', tol: { rel: 0.01 },
              errors: apart([
                { value: 2 * C.B * 1e9, feedback: t`$\mu_0m/2\pi r^3$ is the field **on** the dipole’s axis; across it, it is half that, $\mu_0m/4\pi r^3$.` },
                { value: (MU0 * C.I * C.s * C.s) / (4 * PI * C.d ** 3) * 1e9, feedback: t`Each of the ${C.N} turns adds its moment: $m = NIA$.` },
              ], C.B * 1e9),
              hints: [t`$m = NIA = NIs^2$.`, t`Across the dipole’s axis (θ = 90°), $B = \dfrac{\mu_0m}{4\pi r^3}$.`],
              teach: 'A coil’s moment is NIA, and its far field at 90° to the axis is μ₀m/4πr³.',
              explain: t`$m = NIs^2 = ${nice(sf(C.m, 3))}\ \text{A·m}^2$ and $B = \dfrac{\mu_0m}{4\pi d^3} \approx ${nice(sf(C.B * 1e9, 3))}$ nT — ${C.B * 1e9 > 5 ? 'more than the field Kestrel came to measure' : 'a large share of the field Kestrel came to measure'}. Torquers are therefore switched off, or their known fields subtracted, while the magnetometer takes science data.`,
            };
          },
        }),
        num({
          id: 'r4-valve', skill: 'phys3600.M7.1', difficulty: 3,
          gen(r) {
            const C = valveCase(r);
            return {
              prompt: t`A propellant latch valve holds itself shut with an NdFeB disk ${C.D} mm across and ${C.L} mm thick, magnetized along its axis with $M \approx ${tex(M_NDFEB, 2)}\ \text{A/m}$. In the worst case its axis points along the boom. How far from it must the magnetometer be for the magnet’s field there to stay below ${C.Bmax} nT?`,
              visual: boomPic(C, 'valve'),
              answer: C.rmin, units: 'm', tol: { rel: 0.01 },
              errors: apart([
                { value: Math.cbrt((MU0 * C.m) / (4 * PI * C.Bmax * 1e-9)), feedback: t`Along the dipole’s axis the field is $\mu_0m/2\pi r^3$ — twice the side-on value — and the worst case is along the axis.` },
                { value: (MU0 * C.m) / (2 * PI * C.Bmax * 1e-9), feedback: t`Solve for $r$: take the cube root of $\mu_0m/2\pi B$.` },
              ], C.rmin),
              hints: [t`The magnet’s moment is $m = MV$, with $V = \pi(D/2)^2L$.`, t`On the axis $B = \dfrac{\mu_0m}{2\pi r^3}$, so $r = \left(\dfrac{\mu_0m}{2\pi B}\right)^{1/3}$.`],
              teach: 'A magnet is a dipole of moment M × volume; because its field falls as 1/r³, the boom length needed grows only as the cube root of the moment.',
              explain: t`$m = MV \approx ${tex(C.m, 3)}\ \text{A·m}^2$, and $r = (\mu_0m/2\pi B)^{1/3} \approx ${nice(sf(C.rmin, 3))}$ m. A real cleanliness programme measures every part’s moment, fits compensating magnets beside the strongest, and uses two magnetometers on one boom to separate the spacecraft’s $1/r^3$ field from the uniform field outside.`,
            };
          },
        }),
      ],
    },
    {
      title: 'First light',
      story: t`Kestrel’s Hall thruster lights. Its coils and iron set the radial field that traps electrons across the channel, and the xenon ions it accelerates would blow the beam apart with their own charge if electrons were not added to neutralize it.`,
      items: [
        num({
          id: 'r5-hall', skill: 'phys3600.M7.3', difficulty: 3,
          gen(r) {
            const C = hallCase(r);
            return {
              prompt: t`Model the thruster’s magnetic circuit as soft iron (a ${C.l * 100} cm path, $\mu_r \approx ${C.mur}$ at the working field) closing across the ${C.g} mm channel, both of the same cross-section. How many ampere-turns must its coils carry for ${C.B} mT across the channel?`,
              visual: yokePic('The circuit simplified to one iron path (grey) with one gap, the channel; the dashed loop is the path for ∮H·dl. Real thrusters shape inner and outer poles; fringing ignored; not to scale.'),
              answer: C.NI, units: 'A', tol: { rel: 0.01 },
              errors: apart([
                { value: ((C.B * 1e-3) / MU0) * (C.l / C.mur), feedback: 'That is only the iron’s share. In the gap H = B/μ₀ — the gap takes nearly all the ampere-turns.' },
                { value: C.B * 1e-3 * (C.g * 1e-3 + C.l / C.mur), feedback: t`$\oint\vec H\cdot d\vec l = NI$, and $H = B/\mu_0$ in the gap: divide by $\mu_0$.` },
              ], C.NI),
              hints: [t`$\oint\vec H\cdot d\vec l = H_gg + H_{\text{Fe}}\ell = NI$, with the same $B$ throughout.`, t`$NI = \dfrac{B}{\mu_0}\left(g + \dfrac{\ell}{\mu_r}\right)$.`],
              teach: 'In a magnetic circuit Ampère’s law for H splits the ampere-turns between iron and gap as ℓ/μ_r to g.',
              explain: t`$NI = \dfrac{${C.B}\times10^{-3}}{\mu_0}\left(${C.g / 1000} + \dfrac{${C.l}}{${C.mur}}\right) \approx ${nice(sf(C.NI, 3))}$ A: the channel takes ${nice(sf((100 * C.g * 1e-3) / (C.g * 1e-3 + C.l / C.mur), 3))}% of it. The iron’s $\mu_r$ hardly matters — unless it saturates.`,
            };
          },
        }),
        num({
          id: 'r5-beam', skill: 'phys3600.M8.1', difficulty: 3,
          gen(r) {
            const C = beamCase(r);
            return {
              prompt: t`Suppose the neutralizer failed. Singly charged xenon ions (about ${M_XE} u) accelerated through ${C.V} V form a long, thin beam carrying ${C.I} mA. Treating it as a line charge, how strong is its own electric field ${C.s} cm from its axis?`,
              visual: beamPic('The beam end-on (violet) and its radial field (orange) through a Gaussian cylinder of radius s (dashed). Its current also makes a circling magnetic field, not drawn. Not to scale.'),
              answer: C.E / 1e3, units: 'kV/m', tol: { rel: 0.01 },
              errors: apart([
                { value: (C.I * 1e-3) / (2 * PI * EPS0 * C.s * 1e-2) / 1e3, feedback: t`A current is not a line charge: $\lambda = I/v$, so first find the ions’ speed from $\tfrac12mv^2 = eV$.` },
                { value: (C.lam / (4 * PI * EPS0 * C.s * 1e-2)) / 1e3, feedback: t`A line charge’s field is $\lambda/2\pi\varepsilon_0s$ (Gauss’s law on a cylinder), not $\lambda/4\pi\varepsilon_0s$.` },
              ], C.E / 1e3),
              hints: [t`$v = \sqrt{2eV/m}$ with $m = ${M_XE}\times${tex(AMU, 6)}$ kg; then $\lambda = I/v$.`, t`Gauss on a cylinder: $E = \dfrac{\lambda}{2\pi\varepsilon_0s}$.`],
              teach: 'A beam is a line charge λ = I/v and a line current I at once — Gauss and Ampère side by side, with the magnetic force v²/c² of the electric one.',
              explain: t`$v \approx ${nice(sf(C.v / 1e3, 3))}$ km/s, $\lambda = I/v \approx ${tex(C.lam, 3)}$ C/m, and $E = \dfrac{\lambda}{2\pi\varepsilon_0s} \approx ${nice(sf(C.E / 1e3, 3))}$ kV/m. Its magnetic field, $\mu_0I/2\pi s$, pinches the beam by only $(v/c)^2 \approx ${tex((C.v / 299792458) ** 2, 2)}$ of the electric push, so without the neutralizer the beam would spread and Kestrel would charge up. With it, the course’s two halves have met in one problem.`,
            };
          },
        }),
      ],
    },
  ],
});
