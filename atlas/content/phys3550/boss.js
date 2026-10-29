// The PHYS 3550 boss, "Mission to Mercury": Kestrel, an imagined solar-sail
// probe built on paper from real physics, flies from Earth to Mercury. In
// departure, a Hohmann transfer's first burn (M5.4) and a turning point read
// off the effective potential (M5.2). Then the Lagrangian you build yourself:
// the sail's outward push folded into the potential and the radial equation
// (M4.3), the cyclic angle and its conserved momentum (M4.4), and which
// symmetries survive which thrust laws (M4.5). At Mercury's orbit: the speed
// at a given true anomaly (M5.3) and the general-relativistic advance of the
// probe's own perihelion (M5.5). In orbit: the tennis-racket theorem for a
// spinning probe (M7.4) and the length of a solar day on a rotating planet
// (M6.2). Arrival and the long view: the gravitationally focused capture
// cross section (M11.1 with M5's conservation laws), a forecast horizon from
// a Lyapunov time (M10.2) and the probe clock's rate against Earth's (M12.1).
// Every number a learner reads comes from its generator; the case functions
// are exported so a script can recompute every key another way.
import { boss, mcq, num, expr } from '../../src/core/content.js';
import { sci, gpic, seg, lab, r6 } from './_cm.js';
import { conic, ring, disc, orb, hohmannPic } from './_cm3.js';
import { rigidPic } from './_cm4.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ARCSEC = 206264.806;

// ---- constants as the prompts print them, so a key always matches its prompt
export const GMS = 1.327e20;        // m³/s², the Sun
export const AU = 1.496e11;         // m
export const CL = 2.998e8;          // m/s
export const GMM = 2.203e13;        // m³/s², Mercury
export const RM = 2.44e6;           // m, Mercury's radius
export const RP_M = 4.600e10, RA_M = 6.982e10;   // m, Mercury's perihelion and aphelion distances
export const DAY = 86400;
const MERC_P = (2 * RP_M * RA_M) / (RP_M + RA_M);   // m, Mercury's semi-latus rectum a(1 − e²)

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}
const visviva = (mu, r, a) => Math.sqrt(mu * (2 / r - 1 / a));

// ── round 1 ──────────────────────────────────────────────────────────────────
const TARGETS = [
  { name: 'Mercury’s mean distance from the Sun', r2: 0.387 },
  { name: 'Mercury’s aphelion distance', r2: 0.467 },
  { name: 'Mercury’s perihelion distance', r2: 0.3075 },
];
/** A Hohmann transfer from Earth's orbit (1 AU) down to r₂: the departure burn. */
export function hohmannCase(r) {
  const T = r.pick(TARGETS);
  const r1 = AU, r2 = T.r2 * AU, at = (r1 + r2) / 2;
  const vc1 = Math.sqrt(GMS / r1), va = visviva(GMS, r1, at), vp = visviva(GMS, r2, at), vc2 = Math.sqrt(GMS / r2);
  return { T, r1, r2, at, vc1, va, vp, vc2, dv1: vc1 - va, dv2: vp - vc2, tof: Math.PI * Math.sqrt(at ** 3 / GMS) };
}

/** Tangential speed v₀ at 1 AU: the other turning point of the orbit, from E = U_eff(r). */
export function ueffCase(r) {
  const v0 = r.pick([21.5, 22.3, 23.0, 24.0, 25.2]) * 1e3, r0 = AU;
  const x = (2 * GMS) / (r0 * v0 * v0);
  return { v0, r0, x, rOther: r0 / (x - 1), L: r0 * v0, E: (v0 * v0) / 2 - GMS / r0 };
}

// ── round 2 ──────────────────────────────────────────────────────────────────
/** The sail's lightness number β: the radial equation from L = ½m(ṙ² + r²φ̇²) + (1 − β)GMm/r. */
export function sailCase(r) {
  const beta = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]);
  return { beta, k: +(1 - beta).toFixed(2) };
}

/** Apsis to apsis on a sail orbit: φ is cyclic, so r²φ̇ (and r v at an apsis) is conserved. */
export function cyclicCase(r) {
  const rp = r.pick([0.3, 0.35, 0.4]), ra = r.pick([0.6, 0.75, 0.9]), beta = r.pick([0.1, 0.2]);
  const mu = (1 - beta) * GMS, a = ((rp + ra) / 2) * AU;
  const vp = +(visviva(mu, rp * AU, a) / 1e3).toFixed(2);
  return { rp, ra, beta, vp, va: (vp * rp) / ra };
}

const THRUST = [
  { key: 'sun', what: t`its sail always faces the Sun, so sunlight pushes it straight outward with a force $\beta GMm/r^2$`, E: true, L: true,
    whyE: t`The sail's push depends on $r$ only and points along $\hat r$: it is $-\nabla(-\beta GMm/r)$, a potential with no $t$ in it, so energy survives.`,
    whyL: t`The push is radial, so it exerts no torque about the Sun; equivalently $L$ has no $\phi$ in it.` },
  { key: 'tilt', what: t`its sail is tilted so that sunlight pushes it partly forward along its orbit, with components $\propto 1/r^2$ along both $\hat r$ and $\hat\phi$`, E: false, L: false,
    whyE: t`The forward ($\hat\phi$) push does net work around every orbit, so it has no potential: energy grows. (Its curl is not zero.)`,
    whyL: t`A $\hat\phi$ component is a torque about the Sun: angular momentum grows. That is how a sail spirals outward — or, tilted the other way, inward to Mercury.` },
  { key: 'pulse', what: t`its sail faces the Sun but is opened and closed on a timer, so the outward push $\beta(t)GMm/r^2$ switches on and off with time`, E: false, L: true,
    whyE: t`The Lagrangian now contains $t$ explicitly (through $\beta(t)$): time-translation symmetry is broken and energy is not conserved.`,
    whyL: t`Whenever it acts the push is radial, so $L$ still has no $\phi$: angular momentum is conserved.` },
  { key: 'fixed', what: t`an ion thruster pushes it with a small, steady force $\vec F$ in one fixed direction in space`, E: true, L: false,
    whyE: t`A constant force is conservative, $U = -\vec F\cdot\vec r$, and has no $t$ in it: energy is conserved.`,
    whyL: t`$U = -\vec F\cdot\vec r$ depends on $\phi$ (the angle between $\vec r$ and $\vec F$): rotation symmetry is broken, and angular momentum about the Sun is not conserved.` },
];
const KINDS = [t`Both energy and angular momentum about the Sun`, t`Angular momentum about the Sun, but not energy`, t`Energy, but not angular momentum about the Sun`, t`Neither`];
const kindOf = (S) => (S.E && S.L ? 0 : S.L ? 1 : S.E ? 2 : 3);
/** Which conserved quantities survive a given extra force (Noether). */
export function noetherCase(r) {
  const S = r.pick(THRUST);
  return { S, answer: kindOf(S) };
}

// ── round 3 ──────────────────────────────────────────────────────────────────
/** Mercury's speed at true anomaly φ, from its printed perihelion and aphelion distances. */
export function keplerCase(r) {
  const phi = r.pick([45, 60, 90, 120, 135]);
  const a = (RP_M + RA_M) / 2, e = (RA_M - RP_M) / (RA_M + RP_M), p = a * (1 - e * e);
  const rr = p / (1 + e * Math.cos(phi * DEG));
  return { phi, a, e, p, r: rr, v: visviva(GMS, rr, a), vp: visviva(GMS, RP_M, a), vcirc: Math.sqrt(GMS / rr) };
}

/** The relativistic perihelion advance of the probe's own solar orbit. */
export function precessionCase(r) {
  const rp = r.pick([0.2, 0.25, 0.3]), ra = r.pick([0.4, 0.5, 0.7]);
  const a = ((rp + ra) / 2) * AU, p = (2 * rp * ra * AU) / (rp + ra);
  const dphi = (6 * Math.PI * GMS) / (CL * CL * p);
  return { rp, ra, a, p, e: (ra - rp) / (ra + rp), dphi, arcsec: dphi * ARCSEC };
}

// ── round 4 ──────────────────────────────────────────────────────────────────
/** A spinning probe's principal moments, in a shuffled order; which axis is unstable, or which a flexing probe ends up on. */
export function spinCase(r) {
  const base = r.pick([[180, 240, 310], [150, 210, 260], [200, 230, 330], [120, 260, 290]]);
  const order = r.shuffle([0, 1, 2]);
  const I = order.map((k) => base[k]);
  const ask = r.pick(['unstable', 'flex']);
  const mid = I.indexOf(base[1]), big = I.indexOf(base[2]);
  return { I, ask, answer: ask === 'unstable' ? mid : big, mid, big };
}

const BODIES = [
  { name: 'Mercury', rot: 58.646, orb: 87.969 },
  { name: 'Venus', rot: -243.025, orb: 224.701 },
  { name: 'Mars', rot: 1.02596, orb: 686.98 },
  { name: 'Earth', rot: 0.997270, orb: 365.256 },
];
/** The length of a solar day from the sidereal rotation and the orbital period (both prograde unless rot < 0). */
export function dayCase(r) {
  const B = r.pick(BODIES);
  const sol = 1 / Math.abs(1 / B.rot - 1 / B.orb);
  return { B, sol, wrong: 1 / Math.abs(1 / B.rot + 1 / B.orb) };
}

// ── round 5 ──────────────────────────────────────────────────────────────────
/** The gravitationally focused cross section for hitting Mercury from v∞. */
export function captureCase(r) {
  const vinf = r.pick([2, 3, 4, 6, 8]) * 1e3;
  const vesc2 = (2 * GMM) / RM, ratio = 1 + vesc2 / (vinf * vinf);
  return { vinf, vesc: Math.sqrt(vesc2), ratio, sigma: Math.PI * RM * RM * ratio };
}

/** A forecast horizon from a Lyapunov time. */
export function lyapCase(r) {
  const TL = r.pick([4, 6, 10]), d0 = r.pick([0.1, 0.5, 2]), tol = r.pick([10, 100, 1000]);
  return { TL, d0, tol, days: TL * Math.log(tol / d0) };
}

/** A clock on a circular solar orbit at r against one at 1 AU (Sun's field only): microseconds gained per day. */
export function clockCase(r) {
  const R0 = r.pick([{ name: 'Mercury’s mean distance', au: 0.387 }, { name: 'Venus’s distance', au: 0.723 }, { name: 'Mercury’s perihelion distance', au: 0.3075 }]);
  const m = GMS / (CL * CL), rr = R0.au * AU;
  const rate = (r_) => -1.5 * m / r_;                  // Φ/c² − v²/2c² on a circular orbit
  const per = rate(rr) - rate(AU);
  return { R0, m, rr, gain: per * DAY * 1e6, gravOnly: (-m / rr + m / AU) * DAY * 1e6 };
}

// ── pictures ────────────────────────────────────────────────────────────────
/** The Sun, an orbit (or two) and a marked point, in AU. */
function solarPic({ rings = [], ellipse = null, point = null, caption, alt, extra = {} }) {
  const R = Math.max(...rings.map((x) => x[0] * 1.12), ellipse ? ellipse[1] * 1.2 : 0) || 1.1;
  return gpic({
    x: [-R * 1.05, R * 1.05], y: [-R, R], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [disc(0.045 * R, 'gold', 0.9)],
    curves: [...rings.map(([rr, col, dash]) => ring(rr, col, 1.6, dash)), ...(ellipse ? [conic(ellipse[0], ellipse[1], { color: 'accent', width: 2.2 })] : [])],
    points: [...(point ? [point] : [])],
    ...extra,
  }, caption, alt || 'The Sun with orbits around it');
}

export default boss({
  title: 'Mission to Mercury',
  intro: t`*Kestrel* is an imagined probe, built on paper from real physics: a small spacecraft with a solar sail, bound for Mercury, the planet whose orbit precesses by 43 arcseconds a century more than Newton allows. Getting there is hard — Mercury sits deep in the Sun's gravity well, and a probe from Earth must *shed* speed to fall in. You are Kestrel's flight dynamicist. Every leg is a problem from this course: effective potentials and transfers, a Lagrangian you build yourself, Kepler's ellipses and their relativistic precession, a spinning body, and, at the end, cross sections, chaos and clocks.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Leaving Earth',
      story: t`Kestrel leaves Earth's neighbourhood on a heliocentric orbit. To fall toward the Sun it must slow down relative to Earth's orbital motion — and then the shape of its new orbit is set by its energy and angular momentum alone.`,
      items: [
        num({
          id: 'r1-hohmann', skill: 'phys3550.M5.4', difficulty: 3,
          gen(r) {
            const C = hohmannCase(r);
            const { T, r1, r2, at, vc1, va, dv1, dv2, tof } = C;
            return {
              prompt: t`Kestrel starts on Earth's circular orbit around the Sun, $r_1 = 1$ AU, and makes a Hohmann transfer down to a circular orbit at ${T.name}, $r_2 = ${T.r2}$ AU. How much must its heliocentric speed **drop** at the first burn, in km/s? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $1\ \text{AU} = 1.496\times10^{11}$ m.)`,
              answer: dv1 / 1e3, units: 'km/s', tol: { rel: 0.01 },
              errors: apart([
                { value: (dv1 + dv2) / 1e3, feedback: t`That is both burns together. The first burn alone takes Kestrel from Earth's circular speed to the transfer ellipse's aphelion speed.` },
                { value: (Math.sqrt(GMS / r2) - vc1) / 1e3, feedback: t`The difference of the two circular speeds is not a burn: the transfer ellipse's speeds lie between them, and Kestrel *gains* speed as it falls.` },
                { value: (vc1 - Math.sqrt(GMS / at)) / 1e3, feedback: t`Vis-viva uses the distance $r$ where the burn happens: $v = \sqrt{GM(2/r - 1/a)}$ at $r = r_1$, not the circular speed at $a$.` },
              ], dv1 / 1e3),
              hints: [
                t`The transfer ellipse has $a = (r_1 + r_2)/2$ and its aphelion at $r_1$.`,
                t`Vis-viva: $v_a = \sqrt{GM_\odot(2/r_1 - 1/a)}$; Earth's circular speed is $\sqrt{GM_\odot/r_1}$.`,
                t`$\Delta v_1 = \sqrt{GM_\odot/r_1} - v_a$.`,
              ],
              teach: 'To fall toward the Sun a probe must slow down: the departure burn is the gap between the circular speed and the transfer ellipse’s aphelion speed.',
              explain: t`$a = ${sci(at / AU, 4)}$ AU. Earth's circular speed is $${sci(vc1 / 1e3, 4)}$ km/s; the transfer's aphelion speed is $v_a = ${sci(va / 1e3, 4)}$ km/s, so the burn is $${sci(dv1 / 1e3, 3)}$ km/s — retrograde. The trip takes half the transfer period, $${sci(tof / DAY, 3)}$ days, and arriving needs a second retrograde burn of $${sci(dv2 / 1e3, 3)}$ km/s. Real Mercury missions (MESSENGER, BepiColombo) use flybys of Earth, Venus and Mercury itself to shed much of this.`,
              visual: hohmannPic({ r1: 1, r2: T.r2, body: 0.05, bodyColor: 'gold', burns: false, labels: false, extra: {
                points: [{ x: -1, y: 0, color: 'warn', r: 5, label: 'burn 1', labelDx: -8, labelDy: 12, labelAlign: 'right' }, { x: r6(T.r2), y: 0, color: 'warn', r: 5, label: 'burn 2', labelDx: 8, labelDy: 12 }],
                arrows: [{ from: [-1, 0], to: [-1, 0.32], color: 'warn' }, { from: [r6(T.r2), 0], to: [r6(T.r2), -0.32], color: 'warn' }] },
                caption: t`Earth's orbit (outer), the target orbit and the transfer half-ellipse (solid, travelled anticlockwise), to scale in AU; the Sun enlarged. The arrows show the thrust at each burn: against the motion, both times.` }),
            };
          },
        }),
        num({
          id: 'r1-ueff', skill: 'phys3550.M5.2', difficulty: 3,
          gen(r) {
            const C = ueffCase(r);
            const { v0, x, rOther } = C;
            const vc = Math.sqrt(GMS / AU), s = v0 / vc;
            return {
              prompt: t`A different plan: at 1 AU, Kestrel is left moving perpendicular to the Sun–probe line at $${sci(v0 / 1e3, 3)}$ km/s (heliocentric). Its energy and angular momentum per unit mass fix the effective potential $U_{\text{eff}}(r) = \dfrac{\ell^2}{2r^2} - \dfrac{GM_\odot}{r}$. How close to the Sun does it get, in AU? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $1\ \text{AU} = 1.496\times10^{11}$ m.)`,
              answer: rOther / AU, units: 'AU', tol: { rel: 0.01 },
              errors: apart([
                { value: 2 / x, feedback: t`That is $\ell^2/GM_\odot$, the radius of the circular orbit with this angular momentum — the bottom of the $U_{\text{eff}}$ well, not where the energy line meets the curve.` },
                { value: (1 + rOther / AU) / 2, feedback: t`That is the semi-major axis, the average of the two turning points. Solve $E = U_{\text{eff}}(r)$ for the second one.` },
              ], rOther / AU),
              hints: [
                t`$\ell = r_0v_0$ and $E = \tfrac12v_0^2 - GM_\odot/r_0$ (per unit mass). Turning points are where $E = U_{\text{eff}}(r)$.`,
                t`$E r^2 + GMr - \ell^2/2 = 0$ has roots $r_0$ and $r_0/(2GM/r_0v_0^2 - 1)$.`,
                t`Here $2GM_\odot/r_0v_0^2 = ${sci(x, 4)}$.`,
              ],
              teach: 'The turning points of an orbit are where the energy line meets the effective-potential curve.',
              explain: t`$2GM_\odot/(r_0v_0^2) = ${sci(x, 4)}$, so the other turning point is $r = 1\ \text{AU}/${sci(x - 1, 4)} = ${sci(rOther / AU, 3)}$ AU. At $r_0$ the radial speed is zero, so $r_0$ is itself a turning point (here the aphelion); the energy line crosses the $U_{\text{eff}}$ curve at both.`,
              visual: gpic({ x: [0, 1.6], y: [-1.6, 1.2], axesAt: 'edge', xlabel: 'r (units of r₀ = 1 AU)', ylabel: 'effective potential (GM/r₀)', curves: [{ fn: `${r6(s * s / 2)}/x^2 - 1/x`, domain: [0.12, 1.6], color: 'accent', width: 2.4 }, { fn: '-1/x', domain: [0.6, 1.6], color: 'ink3', width: 1.2, dash: true }], points: [{ x: 1, y: r6(s * s / 2 - 1), color: 'gold', r: 5, label: 'start: r₀', labelDx: 8, labelDy: -10 }] }, t`Kestrel's effective potential per unit mass (blue; dashed: gravity's $-GM/r$ alone), in units of $r_0$ and $GM_\odot/r_0$, with the starting point marked. The energy line through it is for you to draw.`, 'An effective potential curve with a well, and the starting point marked on it'),
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'A Lagrangian you build yourself',
      story: t`Kestrel's sail is a thin reflecting film. Facing the Sun, it feels sunlight's push straight outward, falling off as $1/r^2$ exactly as gravity does — so the push is a fraction $\beta$, the sail's *lightness number*, of the Sun's pull. Build the Lagrangian, and let it tell you what is conserved.`,
      items: [
        expr({
          id: 'r2-lagrangian', skill: 'phys3550.M4.3', difficulty: 3,
          gen(r) {
            const C = sailCase(r);
            const k = C.k;
            return {
              prompt: t`With its sail facing the Sun, Kestrel moves in the plane under gravity and an outward push $\beta GMm/r^2$ with $\beta = ${C.beta}$. In polar coordinates its Lagrangian is $$L = \tfrac12m(\dot r^2 + r^2\dot\phi^2) + ${k}\frac{GMm}{r}.$$ Use Lagrange's equation for $r$ to find $\ddot r$. Write $GM$ as mu and $\dot\phi$ as phidot.`,
              answer: `r*phidot^2 - ${k}*mu/r^2`, answerTeX: t`r\dot\phi^2 - ${k}\frac{GM}{r^2}`,
              lhs: '\\ddot r', vars: { r: [0.5, 2], phidot: [0.2, 2], mu: [0.5, 3] }, keys: [['φ̇', 'phidot'], ['μ', 'mu']],
              errors: [
                { answer: `r*phidot^2 - mu/r^2`, feedback: t`The sail's push reduces the Sun's effective pull to ${k} of it: keep the factor ${k}.` },
                { answer: `-r*phidot^2 - ${k}*mu/r^2`, feedback: t`$\partial L/\partial r$ contains $+mr\dot\phi^2$ from the kinetic energy: the centrifugal term pushes outward.` },
                { answer: `r*phidot^2 + ${k}*mu/r^2`, feedback: t`$\partial(${k}GMm/r)/\partial r = -${k}GMm/r^2$: gravity still pulls inward.` },
                { answer: `-${k}*mu/r^2`, feedback: t`You dropped the $r\dot\phi^2$ term: $\tfrac12mr^2\dot\phi^2$ depends on $r$.` },
              ],
              hints: [
                t`$\dfrac{\partial L}{\partial\dot r} = m\dot r$ and $\dfrac{\partial L}{\partial r} = mr\dot\phi^2 - ${k}\dfrac{GMm}{r^2}$.`,
                t`$\dfrac{d}{dt}(m\dot r) = mr\dot\phi^2 - ${k}GMm/r^2$; divide by $m$.`,
              ],
              teach: 'A force that varies as 1/r² along r̂ just rescales GM in the Lagrangian: a sun-facing sail feels a weaker Sun.',
              explain: t`$m\ddot r = mr\dot\phi^2 - ${k}GMm/r^2$, so $\ddot r = r\dot\phi^2 - ${k}GM/r^2$. Kestrel moves on a Kepler orbit around a Sun of effective mass ${k} of the real one: slower orbits at every distance. Tilting the sail breaks this simple form — see the next problems.`,
              visual: gpic({ x: [-1.5, 2.6], y: [-0.4, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.18, 'gold', 0.9)], curves: [seg([0, 0], [1.6, 1], 'ink3', 1.2, true), seg([1.42, 1.29], [1.78, 0.71], 'accent', 3.2), { param: ['0.5*cos(t)', '0.5*sin(t)'], t: [0, 0.5586], color: 'ink3', width: 1.2 }], arrows: [{ from: [1.6, 1], to: [2.2, 1.375], color: 'warn' }, { from: [1.6, 1], to: [1.15, 0.72], color: 'ink2' }], points: [lab(0.62, 0.15, 'φ', 'ink2'), lab(0.62, 0.62, 'r', 'ink3'), { x: 2.1, y: 1.1, r: 0, color: 'warn', label: 'light', labelDx: 0, labelDy: 0 }, { x: 1.25, y: 0.55, r: 0, color: 'ink2', label: 'gravity', labelDx: 0, labelDy: 0 }] }, t`Kestrel's sail facing the Sun, with the two radial forces (schematic; arrows not to scale).`, 'A sail facing the Sun, with an outward light-pressure arrow and an inward gravity arrow'),
            };
          },
        }),
        num({
          id: 'r2-cyclic', skill: 'phys3550.M4.4', difficulty: 2,
          gen(r) {
            const C = cyclicCase(r);
            const { rp, ra, vp, va } = C;
            return {
              prompt: t`On its sail orbit Kestrel passes perihelion at ${rp} AU moving at ${vp} km/s. Its Lagrangian does not contain $\phi$. How fast is it moving at aphelion, ${ra} AU from the Sun?`,
              answer: va, units: 'km/s', tol: { rel: 0.01 },
              errors: apart([
                { value: vp * (rp / ra) ** 2, feedback: t`The conserved momentum is $p_\phi = mr^2\dot\phi = mrv_\phi$: one power of $r$ goes into $v = r\dot\phi$.` },
                { value: vp * Math.sqrt(rp / ra), feedback: t`$\sqrt{r}$ scaling is for circular orbits of different sizes. On one orbit, at the apsides, $r_pv_p = r_av_a$.` },
                { value: vp * (ra / rp), feedback: t`Upside down: the probe is slowest far from the Sun.` },
              ], va),
              hints: [t`$\phi$ is cyclic, so $p_\phi = \partial L/\partial\dot\phi = mr^2\dot\phi$ is conserved.`, t`At an apsis the velocity is all sideways: $v = r\dot\phi$, so $r_pv_p = r_av_a$.`],
              teach: 'A coordinate missing from the Lagrangian has a conserved momentum: for the orbital angle, angular momentum.',
              explain: t`$v_a = v_p r_p/r_a = ${vp}\times${rp}/${ra} = ${sci(va, 3)}$ km/s. The sail's radial push does not change this: it exerts no torque.`,
              visual: solarPic({ ellipse: [rp, ra], point: { x: r6(rp), y: 0, color: 'warn', r: 5, label: 'perihelion', labelDx: 8, labelDy: 12 }, caption: t`Kestrel's sail orbit, to scale in AU (the Sun enlarged).` }),
            };
          },
        }),
        mcq({
          id: 'r2-noether', skill: 'phys3550.M4.5', difficulty: 3,
          gen(r) {
            const C = noetherCase(r);
            const { S, answer } = C;
            const why = {};
            KINDS.forEach((_, i) => {
              if (i === answer) return;
              const claimsE = i === 0 || i === 2, claimsL = i === 0 || i === 1;
              const parts = [];
              if (claimsE !== S.E) parts.push(S.whyE);
              if (claimsL !== S.L) parts.push(S.whyL);
              why[i] = parts.join(' ');
            });
            return {
              prompt: t`Suppose that, besides the Sun's gravity, ${S.what}. Which quantities are conserved?`,
              choices: KINDS, answer, fixedOrder: true, why,
              hints: [t`Noether: energy is conserved if $L$ has no explicit $t$; angular momentum about the Sun if $L$ is unchanged by rotating about the Sun.`, t`Can this extra force be written as $-\nabla U$ with $U$ independent of $t$? Does it exert a torque about the Sun?`],
              teach: 'Each symmetry of the Lagrangian buys one conserved quantity: no t, energy; no rotation angle, angular momentum.',
              explain: t`${S.E ? 'Energy is conserved' : 'Energy is not conserved'}: ${S.whyE} ${S.L ? 'Angular momentum is conserved' : 'Angular momentum is not conserved'}: ${S.whyL}`,
              visual: gpic({ x: [-1.6, 1.6], y: [-1.1, 1.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.12, 'gold', 0.9)], curves: [ring(0.9, 'ink3', 1.4, true)], points: [{ x: 0.636, y: 0.636, color: 'accent', r: 6 }], arrows: S.key === 'fixed' ? [{ from: [0.636, 0.636], to: [1.236, 0.636], color: 'warn', label: 'F', labelDx: 6, labelDy: -6 }] : S.key === 'tilt' ? [{ from: [0.636, 0.636], to: [0.85, 1.15], color: 'warn' }] : [{ from: [0.636, 0.636], to: [1.03, 1.03], color: 'warn' }] }, t`The extra force on Kestrel (orange), schematic; the Sun at the centre.`, 'A probe on an orbit around the Sun with an extra force arrow'),
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Mercury’s orbit',
      story: t`To rendezvous, Kestrel must match Mercury's orbit — the most eccentric of the planets, and the one whose slow perihelion advance was the first evidence for general relativity. Its perihelion is $4.600\times10^{10}$ m from the Sun and its aphelion $6.982\times10^{10}$ m.`,
      items: [
        num({
          id: 'r3-kepler', skill: 'phys3550.M5.3', difficulty: 3,
          gen(r) {
            const C = keplerCase(r);
            const { phi, a, e, p, r: rr, v, vp, vcirc } = C;
            return {
              prompt: t`Mercury's orbit has perihelion $r_p = 4.600\times10^{10}$ m and aphelion $r_a = 6.982\times10^{10}$ m. How fast is Mercury moving when it is $${phi}^\circ$ past perihelion (true anomaly $\phi = ${phi}^\circ$)? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
              answer: v / 1e3, units: 'km/s', tol: { rel: 0.01 },
              errors: apart([
                { value: vp / 1e3, feedback: t`That is the speed at perihelion; at $\phi = ${phi}^\circ$ Mercury is further out and slower.` },
                { value: vcirc / 1e3, feedback: t`$\sqrt{GM/r}$ is a *circular* orbit's speed at that distance. On an ellipse use vis-viva, $v^2 = GM(2/r - 1/a)$.` },
                { value: visviva(GMS, p / (1 - e * Math.cos(phi * DEG)), a) / 1e3, feedback: t`With $\phi$ from perihelion the orbit is $r = p/(1 + e\cos\phi)$ — a plus sign.` },
              ], v / 1e3),
              hints: [
                t`$a = (r_p + r_a)/2$, $e = (r_a - r_p)/(r_a + r_p)$, and $p = a(1 - e^2)$.`,
                t`$r = p/(1 + e\cos\phi)$, then $v = \sqrt{GM_\odot(2/r - 1/a)}$.`,
              ],
              teach: 'An orbit’s shape gives r at any angle; vis-viva then gives the speed there.',
              explain: t`$a = ${sci(a, 4)}$ m, $e = ${sci(e, 4)}$, $p = ${sci(p, 4)}$ m, so at $\phi = ${phi}^\circ$, $r = ${sci(rr, 4)}$ m and $v = \sqrt{GM_\odot(2/r - 1/a)} = ${sci(v / 1e3, 4)}$ km/s (between the perihelion $${sci(vp / 1e3, 4)}$ and aphelion $${sci(visviva(GMS, RA_M, a) / 1e3, 4)}$ km/s).`,
              visual: solarPic({ ellipse: [RP_M / AU, RA_M / AU], point: { x: r6((rr / AU) * Math.cos(phi * DEG)), y: r6((rr / AU) * Math.sin(phi * DEG)), color: 'warn', r: 6, label: 'Mercury', labelDx: 8, labelDy: -10 }, caption: t`Mercury's orbit to scale (AU), with the planet ${phi}° past perihelion (on the right); the Sun enlarged.`, extra: { curves: [conic(RP_M / AU, RA_M / AU, { color: 'accent', width: 2.2 }), seg([0, 0], [r6((rr / AU) * Math.cos(phi * DEG)), r6((rr / AU) * Math.sin(phi * DEG))], 'ink3', 1.2, true), seg([0, 0], [r6(RP_M / AU), 0], 'ink3', 1.2, true)] } }),
            };
          },
        }),
        num({
          id: 'r3-precession', skill: 'phys3550.M5.5', difficulty: 3,
          gen(r) {
            const C = precessionCase(r);
            const { rp, ra, a, p, arcsec } = C;
            return {
              prompt: t`Kestrel's science orbit around the Sun has perihelion ${rp} AU and aphelion ${ra} AU. General relativity advances a perihelion by $\Delta\phi = \dfrac{6\pi GM_\odot}{c^2a(1 - e^2)}$ per orbit. How many arcseconds is that for Kestrel? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^{8}$ m/s, $1\ \text{AU} = 1.496\times10^{11}$ m.)`,
              answer: arcsec, units: 'arcsec', tol: { rel: 0.01 },
              errors: apart([
                { value: arcsec * (p / a), feedback: t`Divide by $a(1 - e^2)$ — the semi-latus rectum $2r_pr_a/(r_p + r_a)$ — not by $a$ alone.` },
                { value: arcsec / 3, feedback: t`The advance is $6\pi GM/c^2a(1 - e^2)$: three times $2\pi GM/c^2p$.` },
                { value: C.dphi * 180 / Math.PI, feedback: t`That is the angle in degrees. One degree is $3600''$: $1\ \text{rad} = 206\,265''$.` },
              ], arcsec),
              hints: [
                t`$a(1 - e^2) = 2r_pr_a/(r_p + r_a)$.`,
                t`$GM_\odot/c^2 = ${sci(GMS / (CL * CL), 4)}$ m; convert the angle with $1\ \text{rad} = 206\,265''$.`,
              ],
              teach: 'General relativity’s perihelion advance per orbit grows as the orbit gets smaller and more eccentric: 6πGM/c²a(1 − e²).',
              explain: t`$a(1 - e^2) = ${sci(p, 4)}$ m, so $\Delta\phi = 6\pi(${sci(GMS / (CL * CL), 4)})/${sci(p, 4)} = ${sci(arcsec / ARCSEC, 3)}$ rad $= ${sci(arcsec, 3)}''$ per orbit — ${Math.abs(p / MERC_P - 1) < 0.03 ? t`about the same as Mercury's $0.104''$, because its $a(1 - e^2) = ${sci(p / AU, 3)}$ AU is close to Mercury's $0.371$ AU` : p < MERC_P ? t`more than Mercury's $0.104''$, because its $a(1 - e^2) = ${sci(p / AU, 3)}$ AU is smaller than Mercury's $0.371$ AU` : t`less than Mercury's $0.104''$, because its $a(1 - e^2) = ${sci(p / AU, 3)}$ AU is larger than Mercury's $0.371$ AU`}. Where the formula comes from: [precession of nearly circular orbits](#/lesson/phys3550.M5.5) and [Mercury's 43 arcseconds](#/lesson/gr.S25.i).`,
              visual: orb({ force: 'gr', delta: 0.004, L: 1, E: -0.38, turns: 6, view: 2.6, r: [0, 2.6], y: [-0.6, 0.1], panels: ['orbit'], apsides: false }, t`A precessing orbit, with the relativistic term exaggerated about $10^5$ times (units with $GM = 1$).`),
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'In orbit at Mercury',
      story: t`Kestrel arrives and settles into orbit. It is spin-stabilized, with long flexible antennas, and it must schedule its imaging by Mercury's strange calendar.`,
      items: [
        mcq({
          id: 'r4-spin', skill: 'phys3550.M7.4', difficulty: 3,
          gen(r) {
            const C = spinCase(r);
            const { I, ask, answer, mid, big } = C;
            const small = [0, 1, 2].find((k) => k !== mid && k !== big);
            const choices = [0, 1, 2].map((k) => t`Axis ${k + 1} ($I_${k + 1} = ${I[k]}\ \text{kg m}^2$)`).concat([t`Any of the three: torque-free spin about a principal axis is always steady`]);
            const why = {};
            for (const k of [0, 1, 2, 3]) {
              if (k === answer) continue;
              if (k === 3) why[k] = ask === 'unstable' ? t`Every principal axis is an equilibrium, but spin about the intermediate one is unstable: a tiny wobble grows into a flip (the tennis-racket theorem).` : t`With energy draining at fixed angular momentum, the only spin that can last is the one with the least energy, about the largest moment.`;
              else if (k === big) why[k] = ask === 'unstable' ? t`The largest moment ($${I[k]}$) is a stable axis: small wobbles stay small.` : '';
              else if (k === mid) why[k] = t`The intermediate moment ($${I[k]}$) is the unstable axis: spin there flips over and back.`;
              else why[k] = ask === 'unstable' ? t`The smallest moment ($${I[k]}$) is stable for a rigid body.` : t`Spin about the smallest moment ($${I[k]}$) has the *most* energy for a given angular momentum, $L^2/2I$: flexing drains energy and the probe tumbles away from it — Explorer 1's fate.`;
            }
            return {
              prompt: ask === 'unstable'
                ? t`Kestrel's principal moments of inertia are $I_1 = ${I[0]}$, $I_2 = ${I[1]}$ and $I_3 = ${I[2]}\ \text{kg m}^2$. Treated as a rigid body with no torques, about which axis is a steady spin **unstable**?`
                : t`Kestrel's principal moments of inertia are $I_1 = ${I[0]}$, $I_2 = ${I[1]}$ and $I_3 = ${I[2]}\ \text{kg m}^2$. Its long antennas flex, slowly turning rotational energy into heat while angular momentum stays fixed. About which axis does it end up spinning, whatever it started with?`,
              choices, answer, fixedOrder: true,
              why: Object.fromEntries(Object.entries(why).filter(([, v]) => v)),
              hints: ask === 'unstable'
                ? [t`Euler's equations, linearized about a spin about each axis, give oscillation for the largest and smallest moments.`, t`The unstable one is the intermediate moment.`]
                : [t`At fixed $L$ the rotational energy is $L^2/2I$ about a principal axis.`, t`Dissipation lowers the energy: which axis has the least $L^2/2I$?`],
              teach: 'Spin about the largest and smallest principal axes is stable for a rigid body; with dissipation only the largest-moment axis survives.',
              explain: ask === 'unstable'
                ? t`The intermediate moment is $I_${mid + 1} = ${I[mid]}\ \text{kg m}^2$: spin about axis ${mid + 1} is unstable (the tennis-racket theorem), while axes ${big + 1} and ${small + 1} are stable for a rigid body.`
                : t`At fixed $L$, $E = L^2/2I$ is least for the largest moment, $I_${big + 1} = ${I[big]}\ \text{kg m}^2$. Energy loss drives the spin there — the "major-axis rule" learned when Explorer 1, spinning about its long minor axis, began to tumble in 1958.`,
              visual: rigidPic({ I: I.map(r6), axis: 1, tilt: 0, panels: ['body'], vectors: [], trail: false, at: 0, family: false }, t`Kestrel modelled as a uniform box with these principal moments, axes numbered as in the question.`),
            };
          },
        }),
        num({
          id: 'r4-day', skill: 'phys3550.M6.2', difficulty: 3,
          gen(r) {
            const C = dayCase(r);
            const { B, sol, wrong } = C;
            const retro = B.rot < 0;
            // the sidereal period lies within 0.5% of the solar day for Mars and Earth: tighten the tolerance so it is not accepted
            const rel = Math.min(0.005, (0.3 * Math.abs(Math.abs(B.rot) - sol)) / sol);
            return {
              prompt: t`${B.name} turns once relative to the stars every ${Math.abs(B.rot)} days${retro ? ' — **backwards** (retrograde) compared with its orbital motion' : ''}, and goes round the Sun every ${B.orb} days. How long is its **solar day**, from one noon to the next at a fixed spot on the surface?`,
              answer: sol, units: 'd', tol: { rel },
              errors: apart([
                { value: Math.abs(B.rot), feedback: t`That is the sidereal rotation period, relative to the stars. Relative to the Sun the planet must turn a little further (or less) because it has moved along its orbit.` },
                { value: wrong, feedback: retro ? t`For a backward spin the rates add: $1/T_{\text{sol}} = 1/|T_{\text{rot}}| + 1/T_{\text{orb}}$ — check which sign you used.` : t`The planet turns the same way it orbits, so the Sun's direction itself turns forward: the solar rate is the *difference*, $1/T_{\text{rot}} - 1/T_{\text{orb}}$.` },
              ], sol, rel),
              hints: [
                t`In a frame rotating with the planet's orbit (so the Sun stays put), the planet spins at $\omega_{\text{rot}} - \omega_{\text{orb}}$.`,
                t`$1/T_{\text{sol}} = |1/T_{\text{rot}} - 1/T_{\text{orb}}|$, with $T_{\text{rot}}$ negative for a retrograde spin.`,
              ],
              teach: 'A day relative to the Sun is the spin seen from a frame rotating with the orbit: subtract the angular velocities.',
              explain: t`$1/T_{\text{sol}} = |1/(${B.rot}) - 1/${B.orb}|$ per day, so $T_{\text{sol}} = ${sci(sol, 4)}$ days.${B.name === 'Mercury' ? ' Mercury spins exactly three times for every two orbits (a 3:2 resonance), so its solar day is two of its years long: Kestrel waits 88 days between sunrise and sunset at any spot.' : B.name === 'Venus' ? ' Its backward spin makes a Venus solar day shorter than its sidereal one.' : ''}`,
              visual: gpic({ x: [-1.6, 1.6], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.14, 'gold', 0.9)], curves: [ring(1, 'ink3', 1.4, true), { param: ['1 + 0.13*cos(t)', '0.13*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['0.7071 + 0.13*cos(t)', '0.7071 + 0.13*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, seg([1, 0], [1.13, 0], 'warn', 2.4), seg([0.7071, 0.7071], [0.7071 + 0.13 * Math.cos(retro ? -0.5 : 1.2), 0.7071 + 0.13 * Math.sin(retro ? -0.5 : 1.2)], 'warn', 2.4)], points: [lab(1.18, -0.25, 'noon here', 'warn', 0, 0)] }, t`A planet at two points of its orbit (schematic, not to scale), with a marked meridian (orange): after one turn relative to the stars it does not yet face the Sun again.`, 'A planet drawn at two places on its orbit with a marked line on its surface'),
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Arrival and the long view',
      story: t`Kestrel's final campaign: a lander drops toward Mercury, the orbit predictions run out, and the probe's clock is compared with Earth's.`,
      items: [
        num({
          id: 'r5-capture', skill: 'phys3550.M11.1', difficulty: 3,
          gen(r) {
            const C = captureCase(r);
            const { vinf, vesc, ratio, sigma } = C;
            return {
              prompt: t`A lander approaches Mercury from far away at $v_\infty = ${vinf / 1e3}$ km/s relative to the planet. Mercury's gravity bends paths inward, so the lander hits the surface for impact parameters out to $b_{\max}$, beyond Mercury's radius $R = 2440$ km. Using conservation of energy and angular momentum for a path that just grazes the surface, find the impact cross section $\sigma = \pi b_{\max}^2$, in $\text{km}^2$. ($GM = 2.203\times10^{13}\ \text{m}^3/\text{s}^2$.)`,
              answer: sigma / 1e6, units: 'km^2', tol: { rel: 0.01 },
              errors: apart([
                { value: (Math.PI * RM * RM) / 1e6, feedback: t`That is Mercury's geometric disc. Gravity pulls in paths aimed outside it: $b_{\max} = R\sqrt{1 + v_{\text{esc}}^2/v_\infty^2}$.` },
                { value: (Math.PI * RM * RM * (1 + vesc / vinf)) / 1e6, feedback: t`Energy conservation squares the speeds: $v_R^2 = v_\infty^2 + v_{\text{esc}}^2$, so $\sigma = \pi R^2(1 + v_{\text{esc}}^2/v_\infty^2)$.` },
                { value: (Math.PI * RM * RM * (1 + GMM / (RM * vinf * vinf))) / 1e6, feedback: t`$v_{\text{esc}}^2 = 2GM/R$: keep the factor 2.` },
              ], sigma / 1e6),
              hints: [
                t`Grazing: angular momentum $bv_\infty = Rv_R$ (velocity tangential at the surface); energy $\tfrac12v_\infty^2 = \tfrac12v_R^2 - GM/R$.`,
                t`So $b_{\max}^2 = R^2(1 + 2GM/Rv_\infty^2) = R^2(1 + v_{\text{esc}}^2/v_\infty^2)$.`,
              ],
              teach: t`Gravity focuses incoming paths: a planet's capture cross section is $\pi R^2(1 + v_{\text{esc}}^2/v_\infty^2)$, larger than its disc.`,
              explain: t`$v_{\text{esc}} = \sqrt{2GM/R} = ${sci(vesc / 1e3, 3)}$ km/s, so $\sigma = \pi R^2(1 + v_{\text{esc}}^2/v_\infty^2) = ${sci(ratio, 3)}\times\pi R^2 = ${sci(sigma / 1e6, 3)}\ \text{km}^2$. Slow arrivals are focused most: this is why small bodies sweep up slow debris efficiently, and why a probe can target a planet with a generous aiming circle.`,
              visual: gpic({ x: [-4, 3], y: [-1.8, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(1, 'ink3', 0.55)], curves: [seg([-4, 2.0], [3, 2.0], 'accent', 1.6), { param: ['-4 + t*3.4', '1.5 - 0.7*t^2'], t: [0, 1], color: 'warn', width: 2 }, seg([-4, 0], [3, 0], 'ink4', 1, true), seg([-3.7, 0], [-3.7, 1.5], 'ink3', 1.2)], points: [lab(1.4, 2.25, 'misses', 'accent', 0, 0), lab(-3.45, 0.75, 'b', 'ink3', 0, 0), lab(-1.6, 1.55, 'hits', 'warn', 0, 0), lab(0, -1.3, 'Mercury', 'ink2', 0, 0)] }, t`Two incoming paths, schematic: one aimed outside Mercury's disc is bent in and hits; one further out misses. Not to scale.`, 'A planet with an incoming path bending into it and another passing by'),
            };
          },
        }),
        num({
          id: 'r5-lyapunov', skill: 'phys3550.M10.2', difficulty: 3,
          gen(r) {
            const C = lyapCase(r);
            const { TL, d0, tol, days } = C;
            return {
              prompt: t`Low orbits around Mercury are strongly perturbed by the Sun and by Mercury's lumpy gravity; suppose (a hypothetical figure) that Kestrel's orbit predictions diverge with a Lyapunov time of ${TL} days. Tracking pins its position to ${d0} km. For how many days can its position be predicted to within ${tol} km?`,
              answer: days, units: 'd', tol: { rel: 0.01 },
              errors: apart([
                { value: (TL * Math.log(tol / d0)) / Math.LN10, feedback: t`The error grows as $e^{t/T_L}$: use the natural logarithm.` },
                { value: (TL * tol) / d0, feedback: t`Exponential growth: the time goes as the *logarithm* of how much the error may grow.` },
                { value: TL, feedback: t`One Lyapunov time multiplies the error by $e$ only.` },
              ], days),
              hints: [t`$\delta(t) = \delta_0e^{t/T_L}$.`, t`$t = T_L\ln(\text{tolerance}/\delta_0)$.`],
              teach: 'A forecast horizon is the Lyapunov time times the log of the allowed error growth.',
              explain: t`$t = ${TL}\ln(${tol}/${d0}) = ${TL}\times${sci(Math.log(tol / d0), 3)} = ${sci(days, 3)}$ days. A tenfold better fix adds only $${TL}\ln 10 = ${sci(TL * Math.LN10, 3)}$ days, which is why such orbits are re-measured and corrected regularly.`,
              visual: gpic({ x: [0, Math.ceil(days * 1.3)], y: [Math.floor(Math.log(d0) - 1), Math.ceil(Math.log(tol) + 1)], axesAt: 'edge', xlabel: 't (days)', ylabel: 'ln (error ÷ 1 km)', curves: [{ fn: `${r6(Math.log(d0))} + x/${TL}`, color: 'accent', width: 2.4 }], hlines: [{ y: r6(Math.log(tol)), label: 'tolerance', color: 'ink3' }] }, t`The log of the position error growing at the rate $1/T_L$ (idealized straight line); the forecast fails where it crosses the tolerance.`, 'A rising straight line of log error crossing a horizontal tolerance line'),
            };
          },
        }),
        num({
          id: 'r5-clock', skill: 'phys3550.M12.1', difficulty: 4,
          gen(r) {
            const C = clockCase(r);
            const { R0, m, rr, gain, gravOnly } = C;
            return {
              prompt: t`Kestrel's clock rides a circular solar orbit at ${R0.name}, ${R0.au} AU. In the Sun's weak field a clock's rate is $\dfrac{d\tau}{dt} = 1 + \dfrac{\Phi}{c^2} - \dfrac{v^2}{2c^2}$ with $\Phi = -GM_\odot/r$, and on a circular orbit $v^2 = GM_\odot/r$. Compared with an identical clock on a circular orbit at 1 AU (ignore the planets' own fields), how many microseconds per day does Kestrel's clock **gain**? (Negative if it loses. $GM_\odot/c^2 = ${sci(m, 4)}$ m, $1\ \text{AU} = 1.496\times10^{11}$ m.)`,
              answer: gain, units: 'μs', tol: { rel: 0.01 },
              errors: apart([
                { value: gravOnly, feedback: t`That is the potential's part only. On a circular orbit the speed term adds half as much again: $d\tau/dt = 1 - \tfrac32GM/rc^2$.` },
                { value: -gain, feedback: t`Deeper in the Sun's well and moving faster, Kestrel's clock runs *slow*: the answer is negative.` },
                { value: gain / 3, feedback: t`Combine both terms: $-GM/rc^2 - GM/2rc^2 = -\tfrac32GM/rc^2$.` },
              ], gain),
              hints: [
                t`On a circular orbit, $\Phi/c^2 - v^2/2c^2 = -\dfrac{GM}{rc^2} - \dfrac{GM}{2rc^2} = -\dfrac32\dfrac{GM}{rc^2}$.`,
                t`Difference of rates: $-\dfrac32\dfrac{GM}{c^2}\left(\dfrac1r - \dfrac{1}{1\ \text{AU}}\right)$; multiply by 86 400 s.`,
              ],
              teach: 'A clock deeper in a gravity well and moving faster ages less: on circular orbits the rate deficit is (3/2)GM/rc².',
              explain: t`Kestrel's rate is $1 - \tfrac32(${sci(m, 4)}/${sci(rr, 4)})$ and the 1 AU clock's $1 - \tfrac32(${sci(m, 4)}/1.496\times10^{11})$; the difference times 86 400 s is $${sci(gain, 3)}\ \mu\text{s}$ per day — about ${sci(Math.abs(gain) / 1000, 2)} ms a day, which Kestrel's ground team must correct for when timing its signals. Proper time is what the [free-particle action](#/lesson/phys3550.M12.1) maximizes.`,
              visual: solarPic({ rings: [[1, 'ink3', true], [R0.au, 'accent', false]], point: { x: r6(R0.au * 0.7071), y: r6(R0.au * 0.7071), color: 'warn', r: 5, label: 'Kestrel', labelDx: 8, labelDy: -8 }, caption: t`The two circular orbits to scale (AU): Kestrel's (blue) and the reference at 1 AU (dashed); the Sun enlarged.` }),
            };
          },
        }),
      ],
    },
  ],
});
