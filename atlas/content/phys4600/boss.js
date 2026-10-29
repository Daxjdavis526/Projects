// The PHYS 4600 boss, "Maxwell's Equations Challenge": Corvid, an imagined
// lunar relay smallsat built on paper from real physics, goes from the bench
// to its first downlink. Round 1 (M0–M1): how long a harness can be before
// the quasistatic picture fails, the induced E round its air-core torque
// coil, the displacement current's B in the gap of its pulse capacitor.
// Round 2 (M2): how the power in its coax feed is shared across the gap, and
// the recoil of its high-gain dish's beam (field momentum). Round 3 (M3): the
// thickness of an aluminium wall for a given shielding at a given frequency
// (exact complex wave number), the guide wavelength in its X-band feed.
// Round 4 (M4–M5): why the Coulomb gauge's instantaneous V does not signal
// faster than light (the station's E changes after d/c), the downlink's
// intensity at Earth from a half-wave antenna (directivity from its pattern),
// and the Liénard power of a radiation-belt electron. Round 5, the bonus
// Road-to-Spacetime round (M6): which Maxwell equation each component of the
// two tensor equations is, a crossed field Lorentz-transformed into F′^{12},
// and a laser beam's T′⁰⁰ seen by an approaching probe. Every number a learner
// reads comes from its generator; the case functions are exported so a script
// can recompute every key another way.
import { boss, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, QE, ME, PI, SIGMA, sf, outOf, into, circArrows, tag } from './_em4.js';
import { cutoff } from './_em4b.js';
import { pattern, tensorTable, F_CELLS, F_COLORS, boostPic, MEC2 } from './_em4c.js';
import { simpson } from '../../src/viz/model/em4c-dipole.js';

const t = String.raw;
const NB = ' ';
const r4 = (v) => +(+v).toPrecision(4);

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── round 1 ──────────────────────────────────────────────────────────────────
/** The longest harness for which a clock at f stays quasistatic (L ≤ λ/10): the highest frequency for a cable of length L. */
export function quasiCase(r) {
  const L = r.pick([0.4, 0.8, 1.5, 3, 6]);
  return { L, f: C / (10 * L) };
}
function quasiPic(L) {
  return {
    type: 'graph',
    params: {
      x: [0, 10.5], y: [-1.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'distance along the cable ÷ its length', ylabel: '', yticks: 0, xticks: 10,
      curves: [{ fn: 'sin(2*pi*x/10)', domain: [0, 10.5], color: 'accent', width: 2.2, label: 'signal at one instant', labelAt: 6.2, labelDx: 4, labelDy: 18 }, { param: ['t', '-1.25'], t: [0, 1], color: 'gold', width: 6 }],
      points: [{ x: 0.5, y: -1.25, r: 0, label: `cable, ${L} m`, color: 'gold', labelDx: 0, labelDy: -14, labelAlign: 'center' }],
      alt: 'A sine wave ten cable-lengths long, with the cable drawn as a short bar at the left',
    },
    caption: 'One wavelength of the signal at the limiting frequency, against the cable (gold): at λ = 10 L the voltage changes by about half its amplitude from one end of the cable to the other at some instants — the edge of the quasistatic picture.',
  };
}

/** The induced E round an air-core torque coil (a long solenoid of radius R) whose current ramps. */
export function torquerCase(r) {
  const n = r.pick([2000, 3000, 4000]), dIdt = r.pick([50, 100, 200, 400]), R = 1.0, s = r.pick([0.4, 0.7, 2, 3]);   // turns/m, A/s, cm, cm
  const dBdt = MU0 * n * dIdt, inside = s < R;
  const E = inside ? ((s * 1e-2) / 2) * dBdt : ((R * 1e-2) ** 2 / (2 * s * 1e-2)) * dBdt;
  return { n, dIdt, R, s, inside, dBdt, E, Ewrong: inside ? ((R * 1e-2) ** 2 / (2 * s * 1e-2)) * dBdt : ((s * 1e-2) / 2) * dBdt };
}
function torquerPic(s) {
  const pts = [], R = 1, W = Math.max(1.35, s + 0.45);
  for (const [x, y] of [[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.55], [0.55, -0.55], [0, 0]]) pts.push(...into(x, y, 'teal', 5));
  return {
    type: 'graph',
    params: {
      x: [-1.6 * W, 1.6 * W], y: [-W, W], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'ink2', width: 3 }, { param: [`${s}*cos(t)`, `${s}*sin(t)`], t: [0, 6.2832], color: 'warn', width: 1.4, dash: [5, 4] }],
      arrows: [...circArrows(s, 6, 1, 'warn', 0, 0, Math.min(0.7, s * 0.6))],
      points: [...pts, { x: r4(s * Math.cos(0.9)), y: r4(s * Math.sin(0.9)), r: 5, color: 'gold', label: 'P', labelDx: 8, labelDy: -8 }, tag(0, -1.25, 'coil winding', 'ink2', { labelAlign: 'center', labelDx: 0, labelDy: 12 })],
      alt: 'The torque coil seen end-on: its field into the page inside, and loops of induced electric field around it',
    },
    caption: 'The torque coil end-on (grey circle, radius 1 cm), its magnetic field into the page and growing. The induced electric field circles the axis (orange), inside and outside the coil; P is where it is asked for. Drawn to scale in units of cm; the coil is treated as infinitely long.',
  };
}

/** The magnetic field in the gap of a charging capacitor, inside the plates' radius: μ₀Is/2πR². */
export function gapCase(r) {
  const I = r.pick([0.5, 1, 2, 5]), R = r.pick([3, 4, 5]), s = r.pick([1, 1.5, 2]);   // A, cm, cm
  const B = (MU0 * I * s * 1e-2) / (2 * PI * (R * 1e-2) ** 2);
  return { I, R, s, B };
}

// ── round 2 ──────────────────────────────────────────────────────────────────
/** The share of a coax's power flowing within radius s of the axis: ln(s/a)/ln(b/a). */
export function coaxCase(r) {
  const a = r.pick([0.5, 0.9]), b = r.pick([3, 3.5, 4]), s = r.pick([1.2, 1.5, 2]);   // mm
  return { a, b, s, frac: Math.log(s / a) / Math.log(b / a) };
}
/** Recoil of a high-gain dish beaming P watts for T days from a craft of mass m: Δv = PT/mc. */
export function recoilCase(r) {
  const P = r.pick([5, 10, 20]), m = 24, days = r.pick([30, 100, 365]);
  return { P, m, days, F: P / C, dv: (P * days * 86400) / (m * C) };
}
function dishPic() {
  return {
    type: 'graph',
    params: {
      x: [-4, 8], y: [-2.4, 2.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      shade: [{ fn: '0.8', lower: '-0.8', from: -3.2, to: -1.6, color: 'ink3', alpha: 0.5 }],
      curves: [{ param: ['0.25*t^2 - 1.3', 't'], t: [-1.9, 1.9], color: 'ink2', width: 3 }, { param: ['-1.6 + 0.6*t', '0'], t: [0, 1], color: 'ink2', width: 2 }],
      arrows: [...[-1.2, -0.4, 0.4, 1.2].map((y) => ({ from: [0.2, y], to: [6.8, y], color: 'gold', width: 2 })), { from: [-3.3, -1.6], to: [-3.95, -1.6], color: 'bad', width: 2.4, label: 'recoil', labelDx: -2, labelDy: 14 }],
      points: [tag(-2.4, 0, 'Corvid', 'ink', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(4, 1.7, 'beam to Earth', 'gold', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
      alt: 'The spacecraft body, a dish, and a parallel beam leaving to the right, with a small recoil arrow pointing left',
    },
    caption: 'Corvid’s dish sending a beam toward Earth, schematic and not to scale: the beam carries momentum P/c per second away, so the craft is pushed the other way. Real dishes spill a little power sideways; all of it is taken to go into the beam.',
  };
}

// ── round 3 ──────────────────────────────────────────────────────────────────
/** Aluminium wall thickness for an amplitude fraction `keep` at f MHz: ln(1/keep)/κ with κ from the exact complex wave number. */
export function skinCase(r) {
  const f = r.pick([1, 10, 100]), keep = r.pick([0.01, 0.001]);
  const sigma = SIGMA.aluminium.sigma, w = 2 * PI * f * 1e6;
  const delta = Math.sqrt(2 / (w * MU0 * sigma));
  return { f, keep, sigma, delta, d: delta * Math.log(1 / keep) };
}
function skinPic(keep) {
  const L = +Math.log(1 / keep).toFixed(3);
  return {
    type: 'graph',
    params: {
      x: [0, 8], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'depth into the aluminium ÷ skin depth δ', ylabel: 'field amplitude', yticks: 2,
      shade: [{ fn: '1.1', lower: '0', from: 0, to: L, color: 'ink3', alpha: 0.25 }],
      curves: [{ fn: 'exp(-x)', domain: [0, 8], color: 'violet', width: 2.6, label: 'exp(−z/δ)', labelAt: 1.2, labelDx: 8, labelDy: -4 }],
      vlines: [{ x: L, label: 'wall', color: 'ink2' }],
      alt: 'An exponential decay of the field amplitude with depth, with the wall thickness shaded',
    },
    caption: 'A wave’s amplitude inside a good conductor, falling by e every skin depth; the shaded slab is a wall thick enough for the problem’s shielding. One plane wave at normal incidence; reflections inside the wall and seams in a real box are ignored.',
  };
}
/** TE₁₀ guide wavelength in WR-112 or WR-90 at f GHz. */
const GUIDES = { 'WR-112': 28.499, 'WR-90': 22.86 };   // inner widths, mm
export function guideCase(r) {
  const name = r.pick(['WR-112', 'WR-90']), f = r.pick([7.2, 8.4, 8.45]);
  const a = GUIDES[name] * 1e-3, fc = cutoff(a, a / 2, 1, 0), lam0 = C / (f * 1e9);
  return { name, a, f, fc, lam0, lamg: lam0 / Math.sqrt(1 - (fc / (f * 1e9)) ** 2) };
}

// ── round 4 ──────────────────────────────────────────────────────────────────
/** How long after a current switches on at Corvid the ground station's E changes: d/c (any gauge). */
export function gaugeCase(r) {
  const [d, where] = r.pick([[363300, 'at the Moon’s perigee distance'], [384400, 'at the Moon’s mean distance'], [405500, 'at the Moon’s apogee distance'], [446000, 'beyond the Moon, near the Earth–Moon L2 point']]);
  return { d, where, t: (d * 1e3) / C };
}
/** Half-wave antenna directivity from its pattern, D = 2/∫cos²(½π cos θ)/sin θ dθ, and the downlink intensity D P/4πr². */
export function linkCase(r) {
  const P = r.pick([2, 5, 10]), [d, where] = r.pick([[363300, 'perigee'], [384400, 'mean distance'], [405500, 'apogee']]);
  const I = simpson((th) => (Math.sin(th) < 1e-12 ? 0 : pattern('half', th) * Math.sin(th)), 0, PI, 4000);
  const D = 2 / I, rr = d * 1e3;
  return { P, d, where, D, S: (D * P) / (4 * PI * rr * rr), Siso: P / (4 * PI * rr * rr) };
}
function linkPic() {
  return {
    type: 'graph',
    params: {
      x: [-1.35, 1.35], y: [-0.8, 0.8], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [
        { param: ['0', 't'], t: [-0.78, 0.78], color: 'ink4', width: 1, dash: [3, 4] },
        { param: ['(cos(pi/2*cos(t))^2/max(sin(t)^2, 1e-9))*sin(t)', '(cos(pi/2*cos(t))^2/max(sin(t)^2, 1e-9))*cos(t)'], t: [0, 6.2832], color: 'gold', width: 2.6 },
        { param: ['0', 't'], t: [-0.12, 0.12], color: 'ink2', width: 3 },
      ],
      arrows: [{ from: [0, 0], to: [1.2, 0], color: 'accent', width: 2, label: 'to Earth', labelDx: -30, labelDy: -12 }],
      points: [tag(0, 0.72, 'antenna axis', 'ink3', { labelDx: 6, labelDy: 0 })],
      alt: 'The half-wave antenna pattern, a slightly flattened figure eight, with Earth broadside to the antenna',
    },
    caption: 'The half-wave antenna’s pattern [cos(½π cos θ)/sin θ]², scaled to 1 broadside, with Earth broadside to it. A thin antenna in free space; the spacecraft’s body would distort the real pattern.',
  };
}
/** Liénard power of a radiation-belt electron of kinetic energy K (MeV) gyrating in B (μT), pitch angle 90°. */
export function beltCase(r) {
  const K = r.pick([0.5, 1, 2]), B = r.pick([10, 20, 40]);
  const g = 1 + K / (MEC2 * 1e3), b = Math.sqrt(1 - 1 / (g * g)), v = b * C;
  const wc = (QE * B * 1e-6) / ME, a = (v * wc) / g;
  const larmor = (MU0 * QE * QE * a * a) / (6 * PI * C);
  return { K, B, g, v, wc, a, P: larmor * g ** 4, larmor };
}
function beltPic() {
  return {
    type: 'graph',
    params: {
      x: [-2.6, 2.6], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6, dash: [5, 4] }],
      arrows: [{ from: [0, -1], to: [0.9, -1], color: 'accent', width: 2.4, label: 'v', labelDx: 4, labelDy: 12 }, { from: [0, -1], to: [0, -0.35], color: 'warn', width: 2.4, label: 'a', labelDx: 6, labelDy: 0 }],
      points: [{ x: 0, y: -1, r: 5, color: 'bad' }, ...outOf(-1.9, 0.9, 'teal'), tag(-1.9, 0.9, 'B out of page', 'teal', { labelDx: 10, labelDy: -10 })],
      alt: 'An electron on a circle in a magnetic field pointing out of the page, its velocity along the circle and its acceleration toward the centre',
    },
    caption: 'An electron gyrating in Earth’s field, seen along the field: velocity along the circle, acceleration toward the centre. Pitch angle 90° (no motion along B); the field is taken as uniform over the orbit.',
  };
}

// ── round 5 ──────────────────────────────────────────────────────────────────
const LAWS = ['Gauss’s law', 'the Ampère–Maxwell law', 'no magnetic monopoles', 'Faraday’s law'];
/** Which law a component of ∂_νF^μν = μ₀J^μ (F) or ∂_νG^μν = 0 (G) is. */
export function lawCase(r) {
  const eq = r.pick(['F', 'G']), mu = r.int(0, 3);
  const law = eq === 'F' ? (mu === 0 ? 0 : 1) : (mu === 0 ? 2 : 3);
  return { eq, mu, law };
}
const G_CELLS = [['', 'Bx', 'By', 'Bz'], ['−Bx', '', '−Ez/c', 'Ey/c'], ['−By', 'Ez/c', '', '−Ex/c'], ['−Bz', '−Ey/c', 'Ex/c', '']];
const G_COLORS = [['', 'teal', 'teal', 'teal'], ['teal', '', 'gold', 'gold'], ['teal', 'gold', '', 'gold'], ['teal', 'gold', 'gold', '']];

/** Crossed fields E_y (MV/m), B_z (mT) seen from β along x: B′_z = γ(B_z − βE_y/c), the entry F′^{12}. */
export function boostCase(r) {
  const E = r.pick([3, 6, 9]), B = r.pick([5, 10, 40]), b = r.pick([0.4, 0.6, 0.8]);
  const g = 1 / Math.sqrt(1 - b * b), Bp = g * (B * 1e-3 - (b * E * 1e6) / C);
  return { E, B, b, g, Bp, Ep: g * (E * 1e6 - b * C * B * 1e-3) };
}
/** A laser beam's T⁰⁰ = I/c seen by a probe moving into it at β: × (1 + β)/(1 − β). */
export function beamCase(r) {
  const I = r.pick([50, 200, 1000]), b = r.pick([0.1, 0.2, 0.3]);
  const u = I / C, f = (1 + b) / (1 - b);
  return { I, b, u, f, up: u * f };
}

// ── the battle ───────────────────────────────────────────────────────────────
export default boss({
  title: 'Maxwell’s Equations Challenge',
  intro: t`*Corvid* is an imagined relay satellite for the far side of the Moon, designed on paper from real physics: a 24-kilogram box with a torque coil to point it, a pulse capacitor, a coaxial feed, an X-band waveguide and a half-wave antenna. You are its electromagnetics engineer, from the test bench to its first signal from lunar orbit — and, in a bonus round, you rewrite the whole design review in four-dimensional form. Five rounds, thirteen problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'On the bench',
      story: t`Before anything flies, the bench tests. The clock harness has to behave like a circuit, the torque coil’s ramping current makes electric fields where no wire runs, and the pulse capacitor has a magnetic field in its gap where no charge flows.`,
      items: [
        num({
          id: 'r1-quasi', skill: 'phys4600.M0.1', difficulty: 2,
          gen(r) {
            const Cq = quasiCase(r);
            return {
              prompt: t`Corvid’s test harness is ${Cq.L} m long. The engineers treat it as an ordinary circuit — the same current all along, voltages that do not depend on the path — only while the cable is at most a tenth of the signal’s wavelength. What is the highest frequency that allows, in MHz?`,
              answer: Cq.f / 1e6, units: 'MHz', tol: { rel: 0.01 },
              errors: apart([{ value: C / Cq.L / 1e6, feedback: t`At $f = c/L$ the cable is a whole wavelength long: different parts carry opposite currents at once. The rule here is $L \le \lambda/10$, so $f \le c/10L$.` }, { value: C / (2 * PI * 10 * Cq.L) / 1e6, feedback: t`Use $\lambda = c/f$ with the ordinary frequency, not $c/\omega$.` }], Cq.f / 1e6),
              hints: [t`Quasistatic means $L \ll \lambda$; here, $L \le \lambda/10$.`, t`$\lambda = c/f$, so $f \le c/(10L)$.`],
              teach: 'Fields follow their sources instantly only while the system is small compared with c times the time its sources take to change — L ≪ λ.',
              explain: t`$f = c/(10L) = ${tex(C, 4)}/(10 \times ${Cq.L}) \approx ${nice(sf(Cq.f / 1e6, 3))}$ MHz. Above that the harness is a transmission line, and the circuit picture of lumped currents and voltages fails ([M0.1](#/lesson/phys4600.M0.1)).`,
              visual: quasiPic(Cq.L),
            };
          },
        }),
        num({
          id: 'r1-torquer', skill: 'phys4600.M1.2', difficulty: 3,
          gen(r) {
            const Cq = torquerCase(r);
            return {
              prompt: t`Corvid’s air-core torque coil is a long solenoid of radius ${Cq.R} cm with ${Cq.n} turns per metre. On the bench its current ramps up at ${Cq.dIdt} A/s. How strong is the induced electric field ${Cq.s} cm from its axis, in mV/m?`,
              answer: Cq.E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.Ewrong * 1e3, feedback: Cq.inside ? t`Inside the coil the flux through a loop of radius $s$ grows with $s^2$: $E = \dfrac s2\dfrac{dB}{dt}$.` : t`Outside the coil the flux stops growing at $s = R$: $E\cdot2\pi s = \pi R^2\,dB/dt$, so $E = \dfrac{R^2}{2s}\dfrac{dB}{dt}$ — not zero, although $B$ is zero there.` },
                { value: 2 * Cq.E * 1e3, feedback: t`$\oint\vec E\cdot d\vec l = E\cdot2\pi s$ and the flux is $\pi s^2B$ (or $\pi R^2B$): the ratio has a factor $\tfrac12$.` },
              ], Cq.E * 1e3),
              hints: [t`$B = \mu_0nI$ inside, zero outside; $dB/dt = \mu_0n\,dI/dt$.`, t`Faraday on a circle of radius $s$: $E\cdot2\pi s = -d\Phi/dt$.`, t`The flux through the circle is $\pi s^2B$ if $s < R$, or $\pi R^2B$ if $s > R$.`],
              teach: 'An induced E is found like a magnetostatic B: a symmetric loop, and the flux it encloses.',
              explain: t`$dB/dt = \mu_0n\,dI/dt = ${tex(Cq.dBdt, 3)}$ T/s. ${Cq.inside ? t`Inside, $E = \dfrac s2\dfrac{dB}{dt}$` : t`Outside, $E = \dfrac{R^2}{2s}\dfrac{dB}{dt}$`} $\approx ${nice(sf(Cq.E * 1e3, 3))}$ mV/m, circling the axis. ${Cq.inside ? '' : 'There is an electric field where there is no magnetic field at all: what drives it is the changing flux inside. '}Small numbers, but they drive eddy currents in any metal near the coil ([M1.2](#/lesson/phys4600.M1.2)).`,
              visual: torquerPic(Cq.s),
            };
          },
        }),
        num({
          id: 'r1-gap', skill: 'phys4600.M1.4', difficulty: 3,
          gen(r) {
            const Cq = gapCase(r);
            return {
              prompt: t`Corvid’s pulse capacitor has circular plates of radius ${Cq.R} cm and charges with a steady ${Cq.I} A. What is the magnetic field in the gap, ${Cq.s} cm from the axis, in μT? (Fringing ignored.)`,
              answer: Cq.B * 1e6, units: 'uT', tol: { rel: 0.01 },
              errors: apart([
                { value: ((MU0 * Cq.I) / (2 * PI * Cq.s * 1e-2)) * 1e6, feedback: t`A loop of radius $s$ inside the plates encloses only the fraction $s^2/R^2$ of the displacement current.` },
                { value: ((MU0 * Cq.I) / (2 * PI * Cq.R * 1e-2)) * 1e6, feedback: t`That is the field at the rim, $s = R$. Inside, $B$ grows in proportion to $s$.` },
              ], Cq.B * 1e6),
              hints: [t`No charge crosses the gap, but the displacement current $\varepsilon_0\,\partial E/\partial t$ does, spread evenly over the plates and adding up to $I$.`, t`Ampère–Maxwell on a circle of radius $s$: $B\cdot2\pi s = \mu_0I\,s^2/R^2$.`],
              teach: 'Between the plates the displacement current makes B ∝ s inside and μ₀I/2πs beyond the plates’ edge.',
              explain: t`$B = \dfrac{\mu_0Is}{2\pi R^2} \approx ${nice(sf(Cq.B * 1e6, 3))}\ \mu\text{T}$ — the same field the wire makes at that distance, scaled by the enclosed fraction. Maxwell’s term is what keeps Ampère’s law consistent here ([M1.4](#/lesson/phys4600.M1.4)).`,
              visual: { type: 'em4-poynting', params: { mode: 'capacitor', V: 50, I: Cq.I, R: Cq.R, controls: false, readout: false, hide: ['S'] }, caption: 'The charging capacitor side-on: E across the gap, B circling the axis. Arrow lengths only roughly to scale.' },
            };
          },
        }),
      ],
    },
    {
      title: 'Power on',
      story: t`Corvid is switched on. Energy reaches the transmitter through a coaxial cable — not inside the copper, but through the insulation between the conductors — and leaves through the dish as a beam that carries momentum as well as energy.`,
      items: [
        num({
          id: 'r2-coax', skill: 'phys4600.M2.2', difficulty: 3,
          gen(r) {
            const Cq = coaxCase(r);
            const area = (Cq.s ** 2 - Cq.a ** 2) / (Cq.b ** 2 - Cq.a ** 2), lin = (Cq.s - Cq.a) / (Cq.b - Cq.a);
            return {
              prompt: t`The feed is a coaxial cable with inner radius ${Cq.a} mm and outer radius ${Cq.b} mm. What percentage of the power it carries flows within ${Cq.s} mm of the axis?`,
              answer: 100 * Cq.frac, units: '', tol: { rel: 0.01 },
              errors: apart([
                { value: 100 * area, feedback: t`The flow is not spread evenly over the gap’s area: $S \propto 1/s^2$, crowded toward the inner conductor.` },
                { value: 100 * lin, feedback: t`Integrate $S\cdot2\pi s\,ds$ with $S \propto 1/s^2$: each ring carries power $\propto ds/s$, giving logarithms, not a straight-line share.` },
              ], 100 * Cq.frac),
              hints: [t`Between the conductors $S = \dfrac{VI}{2\pi s^2\ln(b/a)}$.`, t`Power within radius $s$: $\int_a^sS\,2\pi s'\,ds' = VI\,\dfrac{\ln(s/a)}{\ln(b/a)}$.`],
              teach: 'In a coax the power flows in the insulation, with S ∝ 1/s²: equal shares in equal ratios of radius.',
              explain: t`$\dfrac{\ln(${Cq.s}/${Cq.a})}{\ln(${Cq.b}/${Cq.a})} \approx ${nice(sf(100 * Cq.frac, 3))}\%$. The inner part of the gap, though small in area, carries a large share — which is why insulation breaks down first next to the inner conductor ([M2.2](#/lesson/phys4600.M2.2)).`,
              visual: { type: 'em4-poynting', params: { mode: 'coax', V: 28, I: 1, ca: Cq.a, cb: Cq.b, controls: false, readout: false }, caption: 'The coax side-on: E radial, B circling, the Poynting vector (gold) along the gap, strongest near the inner conductor. Not to scale.' },
            };
          },
        }),
        num({
          id: 'r2-recoil', skill: 'phys4600.M2.3', difficulty: 3,
          gen(r) {
            const Cq = recoilCase(r);
            return {
              prompt: t`Corvid’s high-gain dish beams ${Cq.P} W toward Earth, all the time, for ${Cq.days} days. The spacecraft has a mass of ${Cq.m} kg. By how much does the recoil change its velocity, in mm/s?`,
              answer: Cq.dv * 1e3, units: 'mm/s', tol: { rel: 0.01 },
              errors: apart([
                { value: 2 * Cq.dv * 1e3, feedback: t`$2P/c$ is the force on a perfect mirror, where the light’s momentum reverses. Emitting a beam is like absorbing one in reverse: force $P/c$.` },
                { value: (Cq.P / C / Cq.m) * Cq.days * 1e3, feedback: 'Convert the time to seconds: 86 400 s per day.' },
              ], Cq.dv * 1e3),
              hints: [t`The beam carries momentum at the rate $P/c$ (momentum density $S/c^2$ times speed $c$ times area).`, t`$\Delta v = \dfrac{(P/c)\,t}{m}$, with $t$ in seconds.`],
              teach: 'A beam of power P carries momentum P/c per second: its source recoils.',
              explain: t`$F = P/c = ${tex(Cq.F, 3)}$ N, and over $${Cq.days} \times 86\,400$ s, $\Delta v \approx ${nice(sf(Cq.dv * 1e3, 3))}$ mm/s — tiny, but navigators of deep-space probes do model it. A dipole antenna gets no such push: its $\sin^2\theta$ pattern sends as much momentum one way as the other ([M2.3](#/lesson/phys4600.M2.3)).`,
              visual: dishPic(),
            };
          },
        }),
      ],
    },
    {
      title: 'Through metal and guide',
      story: t`The radio must not hear itself through the avionics box, so the box is aluminium; and the downlink runs through a hollow rectangular waveguide to the antenna.`,
      items: [
        num({
          id: 'r3-skin', skill: 'phys4600.M3.4', difficulty: 3,
          gen(r) {
            const Cq = skinCase(r);
            return {
              prompt: t`How thick must an aluminium wall ($\sigma = ${tex(Cq.sigma, 3)}$ S/m) be so that a ${Cq.f} MHz wave’s field amplitude falls to ${Cq.keep * 100}% of its value at the surface? Give the thickness in μm.`,
              answer: Cq.d * 1e6, units: 'um', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.delta * 1e6, feedback: t`One skin depth reduces the amplitude only by $1/e$. For a fraction $f$ you need $\ln(1/f)$ of them.` },
                { value: Math.sqrt(2 / (Cq.f * 1e6 * MU0 * Cq.sigma)) * Math.log(1 / Cq.keep) * 1e6, feedback: t`The skin depth uses the angular frequency: $\delta = \sqrt{2/\omega\mu_0\sigma}$ with $\omega = 2\pi f$.` },
              ], Cq.d * 1e6),
              hints: [t`In a good conductor the amplitude falls as $e^{-z/\delta}$ with $\delta = \sqrt{2/(\omega\mu_0\sigma)}$.`, t`Solve $e^{-d/\delta} = ${Cq.keep}$: $d = \delta\ln(1/${Cq.keep})$.`],
              teach: 'Shielding thickness is counted in skin depths: each one cuts the amplitude by a factor e.',
              explain: t`$\delta = \sqrt{2/\omega\mu_0\sigma} \approx ${nice(sf(Cq.delta * 1e6, 3))}\ \mu\text{m}$, so $d = \delta\ln(1/${Cq.keep}) \approx ${nice(sf(Cq.d * 1e6, 3))}\ \mu\text{m}$. ${Cq.f >= 10 ? 'A millimetre-thick box is plenty at this frequency — real shields leak through seams and holes, not walls.' : 'At low frequencies the skin depth grows, and thin shields stop working.'} ([M3.4](#/lesson/phys4600.M3.4))`,
              visual: skinPic(Cq.keep),
            };
          },
        }),
        num({
          id: 'r3-guide', skill: 'phys4600.M3.5', difficulty: 3,
          gen(r) {
            const Cq = guideCase(r);
            return {
              prompt: t`The ${Cq.f} GHz signal travels in the TE₁₀ mode of a ${Cq.name} waveguide, whose inner width is ${nice(Cq.a * 1e3)} mm. What is the guide wavelength, the distance over which the field pattern repeats along the guide, in mm?`,
              answer: Cq.lamg * 1e3, units: 'mm', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.lam0 * 1e3, feedback: t`That is the free-space wavelength $c/f$. In a guide the pattern repeats over a **longer** distance, $\lambda_g = \lambda_0/\sqrt{1 - (f_c/f)^2}$.` },
                { value: Cq.lam0 * Math.sqrt(1 - (Cq.fc / (Cq.f * 1e9)) ** 2) * 1e3, feedback: t`Divide by $\sqrt{1 - (f_c/f)^2}$, do not multiply: the phase velocity is above $c$, so the wavelength is longer than in free space.` },
              ], Cq.lamg * 1e3),
              hints: [t`TE₁₀ cutoff: $f_c = c/2a$.`, t`$\lambda_g = \dfrac{\lambda_0}{\sqrt{1 - (f_c/f)^2}}$, with $\lambda_0 = c/f$.`],
              teach: t`Above cutoff a guide’s wavelength is longer than free space’s by $1/\sqrt{1 - (f_c/f)^2}$.`,
              explain: t`$f_c = c/2a \approx ${nice(sf(Cq.fc / 1e9, 4))}$ GHz, $\lambda_0 \approx ${nice(sf(Cq.lam0 * 1e3, 4))}$ mm, so $\lambda_g \approx ${nice(sf(Cq.lamg * 1e3, 3))}$ mm. Slot antennas and couplers cut into the guide are spaced by $\lambda_g$, not $\lambda_0$ ([M3.5](#/lesson/phys4600.M3.5)).`,
              visual: { type: 'em4b-guide', params: { a: +(Cq.a * 1e3).toFixed(3), b: +(Cq.a * 500).toFixed(3), m: 1, n: 0, f: Cq.f, panels: ['section', 'side'], controls: false, phase: 70, readout: false }, caption: 'The TE₁₀ mode: the cross-section (E arrows, B along the guide shaded) and the guide from above. Perfectly conducting walls; arrow lengths show relative size only.' },
            };
          },
        }),
      ],
    },
    {
      title: 'First light',
      story: t`Corvid reaches lunar orbit and switches on its transmitter. The fields it makes are retarded — they reach Earth only after the light has travelled — and the antenna’s pattern decides how much reaches the ground station. Meanwhile, on its way out, Corvid crossed Earth’s radiation belts, where electrons circle the field lines and radiate.`,
      items: [
        num({
          id: 'r4-gauge', skill: 'phys4600.M4.2', difficulty: 2,
          gen(r) {
            const Cq = gaugeCase(r);
            return {
              prompt: t`In the Coulomb gauge the scalar potential $V$ is the instantaneous Coulomb potential of the charges now. Corvid, ${Cq.where} (${nice(Cq.d)} km), switches on a current at $t = 0$. How long after that does the electric field at the ground station first change, in seconds?`,
              answer: Cq.t, units: 's', tol: { rel: 0.01 },
              errors: [{ value: 0, feedback: t`$V$ does change at once in this gauge — but $\vec E = -\nabla V - \partial\vec A/\partial t$, and the vector potential’s change cancels the instantaneous part. Physical fields, in any gauge, change only after the light-travel time.` }],
              hints: [t`Changing the gauge changes $V$ and $\vec A$, never $\vec E$ and $\vec B$.`, t`In the Lorenz gauge the potentials are retarded: nothing arrives before $t = d/c$.`],
              teach: 'A gauge can make a potential instantaneous, but the fields — the only things measured — always travel at c.',
              explain: t`$t = d/c = ${nice(Cq.d)}\times10^{3}/${tex(C, 4)} \approx ${nice(sf(Cq.t, 3))}$ s. The Coulomb gauge’s instantaneous $V$ carries no information by itself: it is cancelled in $\vec E$ by the vector potential ([M4.2](#/lesson/phys4600.M4.2)).`,
              visual: { type: 'em4b-kink', params: { mode: 'start', beta: 0.4, tau: 0.6, time: 3, probe: [-2, 2.5], panels: ['field', 'cone'], controls: false, readout: false }, caption: 'A charge set moving: outside the news shell the field still shows the old state. Lower panel: the probe’s past light cone, along which the news arrives. c = 1, arbitrary units.' },
            };
          },
        }),
        num({
          id: 'r4-link', skill: 'phys4600.M5.1', difficulty: 3,
          gen(r) {
            const Cq = linkCase(r);
            return {
              prompt: t`From lunar orbit at the Moon’s ${Cq.where} (${nice(Cq.d)} km from Earth), Corvid feeds ${Cq.P} W into a half-wave antenna that lies broadside to Earth. Its pattern is $[\cos(\tfrac\pi2\cos\theta)/\sin\theta]^2$ times its peak value, and $\int_0^\pi\cos^2(\tfrac\pi2\cos\theta)/\sin\theta\,d\theta = 1.2188$. What intensity reaches the ground station, in units of $10^{-18}\ \text{W/m}^2$?`,
              answer: Cq.S / 1e-18, units: '', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.Siso / 1e-18, feedback: t`That spreads the power evenly in all directions. Broadside, a half-wave antenna is $D = 2/1.2188 \approx 1.64$ times stronger than average.` },
                { value: (1.5 * Cq.Siso) / 1e-18, feedback: t`$3P/8\pi r^2$ is a point dipole’s broadside value. The half-wave antenna’s pattern is a little narrower: $D \approx 1.64$, not 1.5.` },
              ], Cq.S / 1e-18),
              hints: [t`Write $\langle S\rangle = A\,F(\theta)/r^2$ with $F$ the pattern, and fix $A$ by $\oint\langle S\rangle\,da = P$.`, t`$\oint F\,d\Omega = 2\pi\times1.2188$, so $A = P/(2\pi\times1.2188)$ and broadside $F = 1$.`, t`Equivalently $\langle S\rangle = DP/4\pi r^2$ with $D = 2/1.2188$.`],
              teach: 'A pattern’s peak over its average is its directivity: 1.5 for a point dipole, 1.64 for a half-wave antenna.',
              explain: t`$D = 4\pi/\oint F\,d\Omega = 2/1.2188 \approx ${nice(sf(Cq.D, 4))}$, and $\langle S\rangle = \dfrac{DP}{4\pi r^2} \approx ${tex(Cq.S, 3)}\ \text{W/m}^2$. That is why lunar links use dishes: their directivity is in the thousands ([M5.1](#/lesson/phys4600.M5.1)).`,
              visual: linkPic(),
            };
          },
        }),
        num({
          id: 'r4-belt', skill: 'phys4600.M5.3', difficulty: 4,
          gen(r) {
            const Cq = beltCase(r);
            return {
              prompt: t`An electron with ${Cq.K} MeV of kinetic energy ($m_ec^2 = 0.511$ MeV) gyrates at right angles to a ${Cq.B} μT field in Earth’s radiation belts. Its acceleration is $a = v\omega$, with the relativistic gyrofrequency $\omega = eB/\gamma m_e$. Using Liénard’s formula for $\vec a \perp \vec v$, what power does it radiate, in units of $10^{-23}$ W?`,
              answer: Cq.P / 1e-23, units: '', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.larmor / 1e-23, feedback: t`That is Larmor’s value. For $\vec a \perp \vec v$ Liénard multiplies it by $\gamma^4$.` },
                { value: (Cq.larmor * Cq.g ** 6) / 1e-23, feedback: t`Either $\gamma^6$ (which is for acceleration **along** the velocity) or a gyrofrequency without its $\gamma$: here $a = v\,eB/\gamma m_e$ and the factor is $\gamma^4$.` },
              ], Cq.P / 1e-23),
              hints: [t`$\gamma = 1 + K/m_ec^2$, $v = c\sqrt{1 - 1/\gamma^2}$.`, t`$a = v\,eB/(\gamma m_e)$.`, t`$P = \dfrac{\mu_0e^2a^2}{6\pi c}\gamma^4$.`],
              teach: 'For circular motion Liénard’s formula is Larmor’s times γ⁴ — with the relativistic gyrofrequency eB/γm.',
              explain: t`$\gamma = ${nice(sf(Cq.g, 4))}$, $v = ${nice(sf(Cq.v / C, 3))}c$, $a \approx ${tex(Cq.a, 3)}\ \text{m/s}^2$, so $P = \dfrac{\mu_0e^2a^2}{6\pi c}\gamma^4 \approx ${tex(Cq.P, 3)}$ W. At that rate it would take about ${nice(sf((Cq.K * 1.602176634e-13) / Cq.P / 3.156e7, 2))} years to radiate away its kinetic energy (longer still, since the power falls as it slows) — longer than most belt electrons survive: there, losses come from collisions and waves instead ([M5.3](#/lesson/phys4600.M5.3)).`,
              visual: beltPic(),
            };
          },
        }),
      ],
    },
    {
      title: 'Bonus round: the Road to Spacetime',
      story: t`For the final design review you rewrite everything in four-dimensional form, the way general relativity will need it: two tensor equations instead of four vector ones, one field tensor instead of $\vec E$ and $\vec B$, and one stress–energy tensor for the beam.`,
      items: [
        mcq({
          id: 'r5-law', skill: 'phys4600.M6.3', difficulty: 3,
          gen(r) {
            const Cq = lawCase(r);
            const eqTeX = Cq.eq === 'F' ? t`\partial_\nu F^{\mu\nu} = \mu_0J^\mu` : t`\partial_\nu G^{\mu\nu} = 0`;
            const why = {
              0: t`Gauss’s law is the time component ($\mu = 0$) of $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$: row 0 of $F$ holds $\vec E/c$, and $J^0 = c\rho$.`,
              1: t`Ampère–Maxwell is the space components ($\mu = 1, 2, 3$) of $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$, where $\vec J$ appears.`,
              2: t`No monopoles is the time component of $\partial_\nu G^{\mu\nu} = 0$: row 0 of the dual holds $\vec B$.`,
              3: t`Faraday’s law is the space components of $\partial_\nu G^{\mu\nu} = 0$.`,
            };
            const wrong = Object.fromEntries([0, 1, 2, 3].filter((k) => k !== Cq.law).map((k) => [k, why[k]]));
            return {
              prompt: t`Take the $\mu = ${Cq.mu}$ component of $${eqTeX}$, with $F^{0i} = E_i/c$, $F^{ij} = \varepsilon_{ijk}B_k$ and the dual $G^{0i} = B_i$, $G^{ij} = -\varepsilon_{ijk}E_k/c$. Which of Maxwell’s laws is it${Cq.mu ? t` (or rather, its ${['', 'x', 'y', 'z'][Cq.mu]}-component)` : ''}?`,
              choices: LAWS.map((s) => s[0].toUpperCase() + s.slice(1)),
              answer: Cq.law,
              why: wrong,
              hints: [t`Which tensor has sources: $F$ or $G$?`, t`The time row ($\mu = 0$) gives a divergence; the space rows give a curl and a time derivative.`],
              teach: 'Two tensor equations, four laws: F’s equation gives Gauss and Ampère–Maxwell, G’s gives no monopoles and Faraday.',
              explain: t`Row $${Cq.mu}$ of ${Cq.eq === 'F' ? '$F$' : 'the dual $G$'} ${Cq.mu === 0 ? (Cq.eq === 'F' ? t`is $(0, \vec E/c)$, and its divergence $\nabla\cdot\vec E/c = \mu_0c\rho$ is Gauss’s law.` : t`is $(0, \vec B)$: $\nabla\cdot\vec B = 0$.`) : (Cq.eq === 'F' ? t`gives $-\dfrac{1}{c^2}\dfrac{\partial E_i}{\partial t} + (\nabla\times\vec B)_i = \mu_0J_i$: Ampère–Maxwell.` : t`gives $-\dfrac1c\left(\dfrac{\partial\vec B}{\partial t} + \nabla\times\vec E\right)_i = 0$: Faraday.`)} ([M6.3](#/lesson/phys4600.M6.3))`,
              visual: Cq.eq === 'F'
                ? tensorTable(F_CELLS, { caption: t`$F^{\mu\nu}$ (rows: the first index $\mu$). The equation for each $\mu$ reads along a row.`, colors: F_COLORS, names: ['t', 'x', 'y', 'z'] })
                : tensorTable(G_CELLS, { caption: t`The dual $G^{\mu\nu}$ (rows: the first index $\mu$): $\vec B$ in the time row, $\vec E/c$ in the space block.`, colors: G_COLORS, names: ['t', 'x', 'y', 'z'] }),
            };
          },
        }),
        num({
          id: 'r5-boost', skill: 'phys4600.M6.1', difficulty: 3,
          gen(r) {
            const Cq = boostCase(r);
            return {
              prompt: t`A test chamber has crossed fields $E_y = ${Cq.E}$ MV/m and $B_z = ${Cq.B}$ mT. Boost to an observer moving along $x$ at $${Cq.b}c$: $F'^{12} = \Lambda^1{}_\alpha\Lambda^2{}_\sigma F^{\alpha\sigma}$ (summed over $\alpha$ and $\sigma$), with $F^{12} = B_z$ and $F^{02} = E_y/c$. What is $B'_z = F'^{12}$, in mT? (Give the sign.)`,
              answer: Cq.Bp * 1e3, units: 'mT', tol: { rel: 0.01, abs: 0.05 },
              errors: apart([
                { value: Cq.g * (Cq.B * 1e-3 + (Cq.b * Cq.E * 1e6) / C) * 1e3, feedback: t`$\Lambda^1{}_0 = -\gamma\beta$: $F'^{12} = \gamma(F^{12} - \beta F^{02})$, so $B'_z = \gamma(B_z - vE_y/c^2)$.` },
                { value: (Cq.B * 1e-3 - (Cq.b * Cq.E * 1e6) / C) * 1e3, feedback: t`Keep the $\gamma$ from $\Lambda^1{}_1$ and $\Lambda^1{}_0$.` },
              ], Cq.Bp * 1e3),
              hints: [t`$\Lambda^2{}_\sigma$ is 1 for $\sigma = 2$ and 0 otherwise, so $F'^{12} = \Lambda^1{}_0F^{02} + \Lambda^1{}_1F^{12}$.`, t`$\Lambda^1{}_0 = -\gamma\beta$, $\Lambda^1{}_1 = \gamma$.`, t`$B'_z = \gamma(B_z - \beta E_y/c)$.`],
              teach: t`A boost along $x$ mixes $E_y$ with $B_z$: $B'_z = \gamma(B_z - vE_y/c^2)$, one entry of $\Lambda F\Lambda^{\mathsf T}$.`,
              explain: t`$\gamma = ${nice(sf(Cq.g, 4))}$ and $E_y/c = ${nice(sf((Cq.E * 1e6) / C * 1e3, 4))}$ mT, so $B'_z = \gamma(B_z - \beta E_y/c) \approx ${nice(sf(Cq.Bp * 1e3, 3))}$ mT. The observer also sees $E'_y = \gamma(E_y - vB_z) \approx ${nice(sf(Cq.Ep / 1e6, 3))}$ MV/m, and $E'^2 - c^2B'^2 = E^2 - c^2B^2$ ([M6.1](#/lesson/phys4600.M6.1), [M6.2](#/lesson/phys4600.M6.2)).`,
              visual: boostPic({ preset: 'crossedE', beta: Cq.b, panels: ['fields', 'matrix'], hide: ['cells'] }, t`Crossed fields seen from a frame moving along $x$, with the boosted $F'^{\mu\nu}$ (numbers hidden). $c = 1$; drawn for $E = 1$, $cB = 0.6$, not the problem’s values.`),
            };
          },
        }),
        num({
          id: 'r5-beam', skill: 'phys4600.M6.4', difficulty: 3,
          gen(r) {
            const Cq = beamCase(r);
            return {
              prompt: t`A laser beam of intensity ${Cq.I} W/m² is aimed at a probe flying toward the laser at $${Cq.b}c$. In the lab the beam’s stress–energy tensor has $T^{00} = T^{0x} = T^{x0} = T^{xx} = I/c$ and every other entry zero. Using $T'^{00} = \Lambda^0{}_\alpha\Lambda^0{}_\sigma T^{\alpha\sigma}$, what energy density does the probe measure, in $\text{nJ/m}^3$?`,
              answer: Cq.up * 1e9, units: 'nJ/m^3', tol: { rel: 0.01 },
              errors: apart([
                { value: Cq.u * Math.sqrt(Cq.f) * 1e9, feedback: t`$\sqrt{(1 + \beta)/(1 - \beta)}$ is the frequency’s Doppler factor. The energy density takes it twice — once per photon’s energy, once for their arrival rate.` },
                { value: Cq.u * ((1 - Cq.b) / (1 + Cq.b)) * 1e9, feedback: t`The probe flies **into** the beam: in its frame the boost velocity is against the beam, $\beta \to -\beta$, and the energy density goes up.` },
                { value: Cq.u * 1e9, feedback: t`Energy density is not invariant: it is one entry of $T^{\mu\nu}$, and a boost mixes it with the flux and the pressure.` },
              ], Cq.up * 1e9),
              hints: [t`With the probe moving along $-x$, $\Lambda^0{}_0 = \gamma$ and $\Lambda^0{}_1 = +\gamma\beta$.`, t`$T'^{00} = \gamma^2(T^{00} + 2\beta T^{0x} + \beta^2T^{xx}) = \gamma^2(1 + \beta)^2\,I/c$.`, t`That is $\dfrac{1 + \beta}{1 - \beta}\,\dfrac Ic$.`],
              teach: 'A beam’s whole stress–energy tensor scales by the Doppler factor squared under a boost along it.',
              explain: t`$I/c = ${nice(sf(Cq.u * 1e9, 4))}\ \text{nJ/m}^3$ and $\dfrac{1 + ${Cq.b}}{1 - ${Cq.b}} = ${nice(sf(Cq.f, 4))}$, so $T'^{00} \approx ${nice(sf(Cq.up * 1e9, 3))}\ \text{nJ/m}^3$. Its trace stays zero in every frame: a beam is a beam for everyone ([M6.4](#/lesson/phys4600.M6.4)).`,
              visual: tensorTable([['u', 'u', '', ''], ['u', 'u', '', ''], ['', '', '', ''], ['', '', '', '']], { caption: t`$T^{\mu\nu}$ of a beam travelling along $x$: four equal entries, $u = I/c$ (gold: energy; blue: flux; violet: pressure).`, colors: [['gold', 'accent', '', ''], ['accent', 'violet', '', ''], ['', '', '', ''], ['', '', '', '']], names: ['t', 'x', 'y', 'z'] }),
            };
          },
        }),
      ],
    },
  ],
});
