// The st-c boss, "The Curvature Challenge". The surface nobody in the
// course has met: Flamm's paraboloid, the exact geometry of the equatorial
// plane of space, at one moment, around a non-spinning black hole,
// ds² = dr²/(1 − 2M/r) + r² dφ² (G = c = 1, M = 1.477 km per solar mass),
// embedded in an imaginary flat space as z = 2√(2M(r − 2M)). A surveyor
// works through the whole course on it: the profile curve's curvature (C1),
// the induced metric and a radial distance (C4), principal and Gaussian
// curvature (C5), the chart that fails at the throat (C8), Christoffels and
// which circle is a geodesic (C13–C14), Riemann and the holonomy of a sector
// (C15), Ricci (C16), the spreading of two radial walkers (C17) and the
// Killing (Clairaut) constant of a straight walk (C18). Every number a learner
// reads comes from its generator; the case functions are exported so a
// script can recompute every key another way.
import { boss, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { mesh } from './_dg.js';

const t = String.raw;
const KM = 1.477;            // GM☉/c² in km, as the prompts print it
const DEG = Math.PI / 180;
const r4 = (v) => Math.round(v * 1e4) / 1e4;

/** Keep only the slips that are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03) {
  const kept = [];
  const far = (u, v) => Math.abs(u - v) > rel * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key) && kept.every((k) => far(e.value, k.value))) kept.push(e);
  return kept;
}

// ── the surface ─────────────────────────────────────────────────────────────
// drawn in units of 4M: radius k = r/M at (k cos φ, k sin φ)/4, height √(2(k − 2))/2
const P3 = (k, p) => [r4((k * Math.cos(p)) / 4), r4((k * Math.sin(p)) / 4), r4(Math.sqrt(Math.max(0, 2 * (k - 2))) / 2)];
const X3 = (u, v) => [`(${u})*cos(${v})/4`, `(${u})*sin(${v})/4`, `sqrt(2*((${u}) - 2))/2`];
const ring = (k, color = 'gold', width = 2.4) => ({ param: X3(String(k), 't'), t: [0, 2 * Math.PI], color, width });
const radial = (p, k0 = 2, k1 = 12, color = 'accent', width = 2.4) => ({ param: X3('t', String(r4(p))), t: [k0, k1], color, width });
const poly = (pts, color = 'warn', width = 2.6) => pts.slice(1).map((q, i) => ({ from: P3(...pts[i]), to: P3(...q), color, width }));

/** Flamm's paraboloid for calc-vectors3d, with optional rings, radial lines, polylines (in (k, φ)) and points. */
function flamm({ rings = [], radials = [], paths = [], points = [], yaw = 0.6, pitch = 0.45 } = {}, caption) {
  return {
    type: 'calc-vectors3d',
    params: {
      range: 3.2, yaw, pitch, scale: 1.25,
      curves: [...mesh(X3, [2, 12], [0, 2 * Math.PI], { nu: 5, nv: 16, color: 'ink4', width: 0.8, closedV: true }), ...rings.map((r) => ring(...r)), ...radials.map((r) => radial(...r))],
      segments: paths.flatMap((p) => poly(...p)),
      points: points.map(([k, p, label, color = 'ink']) => ({ at: P3(k, p), color, label })),
      alt: 'Flamm’s paraboloid: a funnel-shaped surface whose narrowest circle is the throat at r = 2M',
    },
    caption: caption || t`Flamm’s paraboloid, drawn in units of $4M$: the plane of space around a non-spinning black hole at one moment, shown as a surface in an imaginary flat space. Only distances *within* the surface mean anything; the height does not exist, and nothing sags under weight.`,
  };
}

/** The profile curve z(r) = 2√(2M(r − 2M)) in units of M. */
function profilePic(k, caption) {
  return {
    type: 'graph',
    params: {
      x: [0, 12.5], y: [0, 9.5], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'r / M', ylabel: 'z / M', xticks: 6, yticks: 4,
      curves: [{ fn: 'sqrt(8*max(0, x - 2))', domain: [2, 12.5], color: 'accent', width: 2.6 }],
      shade: [{ fn: '9.5', lower: '0', from: 0, to: 2, color: 'ink4', alpha: 0.15 }],
      vlines: [{ x: 2, label: 'throat r = 2M', color: 'ink3' }],
      points: [{ x: k, y: r4(Math.sqrt(8 * (k - 2))), r: 5, color: 'warn', label: 'P' }],
    },
    caption: caption || 'The profile curve of the surface: height (not physical) against r, in units of M. Spinning it round the vertical axis gives the paraboloid.',
  };
}

const hole = (r) => {
  const m = r.pick([5, 8, 10, 15, 20, 30]);
  return { m, M: KM * m };
};
const holeTeX = (H) => t`${H.m === 8 ? 'an' : 'a'} ${H.m}-solar-mass black hole ($M = ${nice(H.M, 4)}$ km)`;

// ── case functions (exported for an independent check) ──────────────────────
/** C1.3: curvature of the profile curve z = 2√(2M(r − 2M)) at r = kM. */
export function profileCase(r) {
  const H = hole(r), k = r.pick([3, 4, 5, 6, 8, 10]), rr = k * H.M;
  const z1 = Math.sqrt((2 * H.M) / (rr - 2 * H.M)), z2 = -0.5 * Math.sqrt(2 * H.M) * (rr - 2 * H.M) ** -1.5;
  return { ...H, k, rr, z1, z2, kappa: Math.abs(z2) / (1 + z1 * z1) ** 1.5 };
}
/** C4.1: the induced g_rr = 1 + (dz/dr)² at r = kM. */
export function metricCase(r) {
  const H = hole(r), k = r.pick([2.5, 3, 4, 5, 6, 10]);
  return { ...H, k, zp2: 2 / (k - 2), grr: k / (k - 2) };
}
/** C5.3: principal curvatures and K at r = kM. */
export function shapeCase(r) {
  const H = hole(r), k = r.pick([3, 4, 6, 8]), rr = k * H.M;
  const k1 = -Math.sqrt(H.M / (2 * rr ** 3)), k2 = Math.sqrt((2 * H.M) / rr ** 3);
  return { ...H, k, rr, k1, k2, K: k1 * k2, Hm: (k1 + k2) / 2 };
}
/** C4.2: the distance walked between the circles r1 = k1 M and r2 = k2 M. */
export function radialCase(r) {
  const H = hole(r), k1 = r.pick([2.5, 3, 4, 5]), k2 = k1 + r.pick([1, 2, 4, 6]);
  const F = (x) => Math.sqrt(x * (x - 2 * H.M)) + 2 * H.M * Math.log(Math.sqrt(x) + Math.sqrt(x - 2 * H.M));
  const r1 = k1 * H.M, r2 = k2 * H.M;
  return { ...H, k1, k2, r1, r2, D: F(r2) - F(r1) };
}
/** C8.1: the throat r = 2M, where the (r, φ) chart fails. */
export function throatCase(r) {
  const H = hole(r);
  return { ...H, circ: 4 * Math.PI * H.M, Kt: -1 / (8 * H.M * H.M) };
}
/** C13.1: Γ^r_rr = −M/(r(r − 2M)) at r = kM. */
export function christoffelCase(r) {
  const H = hole(r), k = r.pick([3, 4, 5, 6, 8]), rr = k * H.M;
  return { ...H, k, rr, G: -H.M / (rr * (rr - 2 * H.M)), Gpp: -(rr - 2 * H.M) };
}
/** C14.1: which circle r = const is a geodesic (Γ^r_φφ = −(r − 2M) = 0)? */
export function geoCircleCase(r) {
  const H = hole(r);
  return { ...H, r2: 2 * H.M, r3: 3 * H.M, r6: 6 * H.M };
}
/** C15.2: R_rφrφ = −M/(r − 2M) at r = kM. */
export function riemannCase(r) {
  const H = hole(r), k = r.pick([2.5, 3, 4, 6, 10]), rr = k * H.M;
  return { ...H, k, rr, R: -H.M / (rr - 2 * H.M), K: -H.M / rr ** 3 };
}
/** C15.1: holonomy of the sector r1 ≤ r ≤ r2, 0 ≤ φ ≤ Δφ: ∬K dA = −Δφ(√(1 − 2M/r2) − √(1 − 2M/r1)). */
export function holonomyCase(r) {
  const H = hole(r), k1 = r.pick([2.5, 3, 4]), k2 = k1 + r.pick([2, 3, 6]), dphi = r.pick([30, 45, 60, 90]);
  const f = (k) => Math.sqrt(1 - 2 / k);
  return { ...H, k1, k2, dphi, turn: dphi * (f(k2) - f(k1)), f1: f(k1), f2: f(k2) };
}
/** C16.1: R_rr = K g_rr = −M/(r²(r − 2M)) at r = kM. */
export function ricciCase(r) {
  const H = hole(r), k = r.pick([3, 4, 5, 8]), rr = k * H.M;
  return { ...H, k, rr, Rrr: -H.M / (rr * rr * (rr - 2 * H.M)), K: -H.M / rr ** 3, grr: k / (k - 2) };
}
/** C17.1: two radial walkers ξ apart at r = kM: d²ξ/ds² = −Kξ = (M/r³)ξ, in metres per km². */
export function deviationCase(r) {
  const H = hole(r), k = r.pick([3, 4, 6, 10]), xi = r.pick([20, 50, 100]), rr = k * H.M;
  return { ...H, k, xi, rr, acc: (H.M / rr ** 3) * xi };
}
/** C18.2: a straight walk from r0 = k0 M at α0 to the outward radial direction; r sin α is conserved. */
export function killingCase(r) {
  const H = hole(r), k0 = r.pick([3, 4, 5]), a0 = r.pick([35, 50, 65, 80]), ratio = r.pick([1.5, 2, 3]);
  const k1 = k0 * ratio, a1 = Math.asin(Math.sin(a0 * DEG) / ratio) / DEG;
  return { ...H, k0, a0, ratio, k1, a1 };
}

export default boss({
  title: 'The Curvature Challenge',
  intro: t`A surveyor is sent to map a surface no one in this course has seen: **Flamm’s paraboloid**, the exact geometry of the equatorial plane of *space*, at one moment, around a non-spinning black hole ($G = c = 1$, $M = GM/c^2$ = 1.477 km per solar mass): $$ds^2 = \frac{dr^2}{1 - 2M/r} + r^2\,d\varphi^2.$$ Here $r$ is defined by circumference — the circle at $r$ is $2\pi r$ around — and $r \ge 2M$. The funnel in the pictures is that geometry drawn as a surface in an imaginary flat space; it is **not** the rubber-sheet picture of gravity. Nothing sags under weight, the height means nothing, and most of what makes things fall near a mass is the curvature of *time*, which this slice of space leaves out. Twelve problems in five rounds — no hints, one try each — from the shape of the surface to what a traveller on it would notice.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'The shape',
      story: t`First the outside view. Drawn in a flat space, the surface is a solid of revolution: spin the curve $z = 2\sqrt{2M(r - 2M)}$ about the vertical axis. Curves (C1), the first fundamental form (C4) and principal curvatures (C5) all apply.`,
      items: [
        num({
          id: 'r1-profile', skill: 'st-c.C1.3', difficulty: 3,
          gen(r) {
            const C = profileCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, the profile curve is $z(r) = 2\sqrt{2M(r - 2M)}$ in the $(r, z)$ plane. What is its curvature $\kappa = \dfrac{|z''|}{(1 + z'^2)^{3/2}}$ at $r = ${C.k}M = ${nice(C.rr, 4)}$ km, in $\text{km}^{-1}$?`,
              visual: profilePic(C.k),
              answer: C.kappa, units: 'km^-1', tol: { rel: 0.01 },
              errors: apart([
                { value: Math.abs(C.z2), feedback: t`That is $|z''|$ alone. Divide by $(1 + z'^2)^{3/2}$: the curve is steep near the throat.` },
                { value: 1 / C.rr, feedback: t`$1/r$ is the curvature of the circle of radius $r$ round the axis, not of the profile curve.` },
                { value: Math.abs(C.z2) / (1 + C.z1 * C.z1), feedback: t`The denominator has the power $\tfrac32$: $(1 + z'^2)^{3/2}$.` },
              ], C.kappa),
              hints: [
                t`$z' = \sqrt{\dfrac{2M}{r - 2M}}$ and $z'' = -\tfrac12\sqrt{2M}\,(r - 2M)^{-3/2}$.`,
                t`$1 + z'^2 = \dfrac{r}{r - 2M}$.`,
                t`It simplifies to $\kappa = \sqrt{M/(2r^3)}$.`,
              ],
              teach: t`The curvature of a graph $z(r)$ is $|z''|/(1 + z'^2)^{3/2}$: the slope’s rate of turning per unit arc length.`,
              explain: t`$z' = ${nice(C.z1, 4)}$, $z'' = ${tex(C.z2, 4)}\ \text{km}^{-1}$, so $\kappa = ${tex(Math.abs(C.z2), 4)}/${nice((1 + C.z1 * C.z1) ** 1.5, 4)} = ${tex(C.kappa, 4)}\ \text{km}^{-1}$ — which is $\sqrt{M/2r^3}$. This is one of the surface’s two principal curvatures (round 1, problem 3).`,
            };
          },
        }),
        num({
          id: 'r1-metric', skill: 'st-c.C4.1', difficulty: 2,
          gen(r) {
            const C = metricCase(r);
            return {
              prompt: t`Parameterize the surface by $(r, \varphi) \mapsto \big(r\cos\varphi,\ r\sin\varphi,\ z(r)\big)$ with $z = 2\sqrt{2M(r - 2M)}$. Its first fundamental form is $ds^2 = g_{rr}\,dr^2 + r^2d\varphi^2$ with $g_{rr} = 1 + z'(r)^2$. Around ${holeTeX(C)}, find $g_{rr}$ at $r = ${C.k}M$.`,
              visual: flamm({ rings: [[C.k, 'gold']], radials: [[0.8, 2, 12, 'accent']] }),
              answer: C.grr, tol: { rel: 0.005 },
              errors: apart([
                { value: C.zp2, feedback: t`That is $z'^2$; $g_{rr} = X_r\cdot X_r = 1 + z'^2$ includes the horizontal part of the step.` },
                { value: Math.sqrt(C.grr), feedback: t`$\sqrt{g_{rr}}$ is the stretch of length; the metric component is its square.` },
                { value: 1 / C.grr, feedback: t`Upside down: near the throat radial steps are *longer* than $dr$, so $g_{rr} > 1$.` },
              ], C.grr),
              hints: [t`$X_r = (\cos\varphi, \sin\varphi, z')$, so $g_{rr} = 1 + z'^2$.`, t`$z'^2 = \dfrac{2M}{r - 2M} = \dfrac{2}{${C.k} - 2}$ at $r = ${C.k}M$.`],
              teach: t`The first fundamental form of a surface of revolution: $g_{rr} = 1 + z'^2$ from the slope, $g_{\varphi\varphi} = r^2$ from the circles.`,
              explain: t`$g_{rr} = 1 + \dfrac{2M}{r - 2M} = \dfrac{r}{r - 2M} = ${nice(C.grr, 4)}$ — the Schwarzschild $g_{rr}$, recovered from the embedding. The mass drops out: at a given $r/M$ every black hole’s space looks alike.`,
            };
          },
        }),
        mcq({
          id: 'r1-shape', skill: 'st-c.C5.3', difficulty: 3,
          gen(r) {
            const C = shapeCase(r);
            const v = (x) => tex(x, 3);
            return {
              prompt: t`Around ${holeTeX(C)}, at $r = ${C.k}M$ the surface’s principal curvatures (with the normal chosen so that the circle’s is positive) are $\kappa_1 = ${v(C.k1)}\ \text{km}^{-1}$ along the profile and $\kappa_2 = ${v(C.k2)}\ \text{km}^{-1}$ round the circle. What is the Gaussian curvature there, and what does it say?`,
              visual: flamm({ rings: [[C.k, 'gold']], radials: [[0.8, 2, 12, 'violet']], points: [[C.k, 0.8, 'P', 'warn']] }),
              choices: [
                t`$K = ${v(C.K)}\ \text{km}^{-2}$: saddle-like, bending opposite ways in the two directions`,
                t`$K = ${v(-C.K)}\ \text{km}^{-2}$: dome-like, bending the same way in both directions`,
                t`$K = ${v(C.Hm)}\ \text{km}^{-1}$: the average of the two`,
                t`$K = ${v(C.k2 * C.k2)}\ \text{km}^{-2}$: set by the circle alone, since $\kappa_1$ belongs to the profile curve, not the surface`,
              ],
              answer: 0,
              why: {
                1: t`$K = \kappa_1\kappa_2$, and the two have opposite signs: the product is negative.`,
                2: t`The average is the mean curvature $H$, which describes the bending in space, not $K$.`,
                3: t`Both principal curvatures belong to the surface; $K$ is their product.`,
              },
              hints: [t`Gauss: $K = \kappa_1\kappa_2$.`, 'A negative product means the surface curves up one way and down the other, like a saddle.'],
              teach: 'K is the product of the principal curvatures; opposite signs make a saddle.',
              explain: t`$K = \kappa_1\kappa_2 = ${v(C.K)}\ \text{km}^{-2} = -M/r^3$ at $r = ${nice(C.rr, 4)}$ km. Negative everywhere: the space around a black hole is saddle-like in this plane — and by the Theorema Egregium (C6.1) that sign is a fact about distances within it, not about the picture.`,
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Measuring from inside',
      story: t`Now the surveyor forgets the picture and measures only along the surface, with a tape and the coordinates $(r, \varphi)$, where each circle $r = \text{const}$ has circumference $2\pi r$.`,
      items: [
        num({
          id: 'r2-distance', skill: 'st-c.C4.2', difficulty: 3,
          gen(r) {
            const C = radialCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, two circles have circumferences $2\pi r_1$ and $2\pi r_2$ with $r_1 = ${C.k1}M$ and $r_2 = ${C.k2}M$. How far apart are they, measured with a tape laid straight out along the surface, in km? An antiderivative of $\big(1 - 2M/r\big)^{-1/2}$ is $$\sqrt{r(r - 2M)} + 2M\ln\big(\sqrt r + \sqrt{r - 2M}\big).$$`,
              visual: flamm({ rings: [[C.k1, 'gold'], [C.k2, 'gold']], radials: [[0.5, C.k1, C.k2, 'warn', 3]] }),
              answer: C.D, units: 'km', tol: { rel: 0.005 },
              errors: apart([
                { value: C.r2 - C.r1, feedback: t`$r_2 - r_1$ is what a flat plane would give. Here $ds = dr/\sqrt{1 - 2M/r}$: the tape reads more.` },
                { value: (C.r2 - C.r1) * Math.sqrt(1 - (2 * C.M) / C.r1), feedback: t`The factor is $1/\sqrt{1 - 2M/r}$, which is greater than 1 — and it varies with $r$, so integrate.` },
                { value: (C.r2 - C.r1) / Math.sqrt(1 - (4 * C.M) / (C.r1 + C.r2)), feedback: t`Evaluating the stretch at the midpoint is only an estimate; the antiderivative gives the exact length.` },
              ], C.D, 0.02),
              hints: [t`Along a radial line, $ds = dr/\sqrt{1 - 2M/r}$.`, t`Evaluate the antiderivative at $r_2 = ${nice(C.r2, 4)}$ km and $r_1 = ${nice(C.r1, 4)}$ km and subtract.`],
              teach: 'Distances come from integrating the metric along the path, not from differences of coordinates.',
              explain: t`$$D = \Big[\sqrt{r(r - 2M)} + 2M\ln\big(\sqrt r + \sqrt{r - 2M}\big)\Big]_{${nice(C.r1, 4)}}^{${nice(C.r2, 4)}}$$ $= ${nice(C.D, 4)}$ km, against $r_2 - r_1 = ${nice(C.r2 - C.r1, 4)}$ km. The surveyor finds more room between the circles than their circumferences suggest — Flamm’s funnel is a picture of exactly that.`,
            };
          },
        }),
        mcq({
          id: 'r2-throat', skill: 'st-c.C8.1', difficulty: 3,
          gen(r) {
            const C = throatCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, the metric component $g_{rr} = (1 - 2M/r)^{-1}$ blows up at $r = 2M = ${nice(2 * C.M, 4)}$ km. What does the surveyor find there?`,
              visual: flamm({ rings: [[2.02, 'warn', 3]] }, t`The circle $r = 2M$ (orange) on the surface, drawn in units of $4M$.`),
              choices: [
                t`A smooth throat, the smallest circle (circumference $${nice(C.circ, 4)}$ km), where $r$ stops working as a coordinate; the surface continues beyond it`,
                t`A curvature singularity: $K$ diverges at $r = 2M$`,
                t`The edge of space: nothing lies beyond $r = 2M$`,
                t`A circle of infinite circumference`,
              ],
              answer: 0,
              why: {
                1: t`$K = -M/r^3$ is finite there: $${tex(C.Kt, 3)}\ \text{km}^{-2}$. Only the chart misbehaves.`,
                2: t`The surface curves back up on the far side of the throat (the other sheet of the full slice); $r$ just cannot tell the two sides apart, so a new chart — distance along the surface from the throat — is needed.`,
                3: t`The circumference is $2\pi r = 4\pi M$, the smallest on the surface.`,
              },
              hints: [t`Compute $K = -M/r^3$ at $r = 2M$. Is anything geometric infinite?`, t`Near the throat, $r$ has a minimum along each radial line, as $x^2$ does at 0: a coordinate that stops increasing.`],
              teach: 'A metric component that blows up may only mean the chart fails; check an invariant like K before calling it a singularity.',
              explain: t`At the throat $r$ has a minimum, like a coordinate $x = \ell^2$ along a line, so $dr = 0$ along it and $g_{rr}$ must blow up to keep distances finite. With proper distance $\ell$ from the throat as the coordinate the metric is smooth. (In the spacetime, $r = 2M$ is the horizon at this moment; the full slice joins two exterior regions — the Einstein–Rosen bridge, which is not traversable.)`,
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'The connection',
      story: t`To know which paths are straight, the surveyor needs the Christoffel symbols of $ds^2 = (1 - 2M/r)^{-1}dr^2 + r^2d\varphi^2$ (C13) and the geodesic equation (C14).`,
      items: [
        num({
          id: 'r3-christoffel', skill: 'st-c.C13.1', difficulty: 3,
          gen(r) {
            const C = christoffelCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, compute $\Gamma^r{}_{rr} = \tfrac12 g^{rr}\partial_rg_{rr}$ at $r = ${C.k}M = ${nice(C.rr, 4)}$ km, in $\text{km}^{-1}$.`,
              visual: profilePic(C.k, 'The profile of the surface with the point P where the symbol is wanted.'),
              answer: C.G, units: 'km^-1', tol: { rel: 0.005 },
              errors: apart([
                { value: -C.G, feedback: t`$\partial_r(1 - 2M/r)^{-1} = -\dfrac{2M/r^2}{(1 - 2M/r)^2}$ is negative: $g_{rr}$ falls as $r$ grows.` },
                { value: 2 * C.G, feedback: t`Keep the $\tfrac12$ in $\tfrac12 g^{rr}\partial_rg_{rr}$.` },
                { value: -C.M / (C.rr * C.rr), feedback: t`$-M/r^2$ forgets the factor $g^{rr}\partial_rg_{rr}$ brings: $\Gamma^r{}_{rr} = -\dfrac{M}{r(r - 2M)}$.` },
              ], C.G),
              hints: [t`$g_{rr} = \dfrac{r}{r - 2M}$, so $\partial_rg_{rr} = \dfrac{-2M}{(r - 2M)^2}$.`, t`$g^{rr} = \dfrac{r - 2M}{r}$, so $\Gamma^r{}_{rr} = -\dfrac{M}{r(r - 2M)}$.`],
              teach: t`For a diagonal metric, $\Gamma^r{}_{rr} = \tfrac12 g^{rr}\partial_rg_{rr}$: the log-derivative of $\sqrt{g_{rr}}$.`,
              explain: t`$\Gamma^r{}_{rr} = -\dfrac{M}{r(r - 2M)}$ $= -\dfrac{${nice(C.M, 4)}}{${nice(C.rr, 4)}\times${nice(C.rr - 2 * C.M, 4)}}$ $= ${tex(C.G, 4)}\ \text{km}^{-1}$. The others: $\Gamma^r{}_{\varphi\varphi} = -(r - 2M) = ${nice(C.Gpp, 4)}$ km and $\Gamma^\varphi{}_{r\varphi} = 1/r$ — the same as in the flat polar plane, because $g_{\varphi\varphi} = r^2$ is.`,
            };
          },
        }),
        mcq({
          id: 'r3-circle', skill: 'st-c.C14.1', difficulty: 3,
          gen(r) {
            const C = geoCircleCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, which circle $r = \text{const}$ can a traveller walk round without turning — a geodesic? Use the radial geodesic equation, $\ddot r + \Gamma^r{}_{rr}\dot r^2 + \Gamma^r{}_{\varphi\varphi}\dot\varphi^2 = 0$, with $\Gamma^r{}_{\varphi\varphi} = -(r - 2M)$.`,
              visual: flamm({ rings: [[2.02, 'warn'], [3, 'gold'], [6, 'teal']] }, t`Three circles on the surface (units of $4M$): $r = 2M$ (orange), $3M$ (gold) and $6M$ (teal).`),
              choices: [
                t`Only the throat, $r = 2M = ${nice(C.r2, 4)}$ km`,
                t`$r = 3M = ${nice(C.r3, 4)}$ km, the photon sphere`,
                t`$r = 6M = ${nice(C.r6, 4)}$ km, the innermost stable orbit`,
                'Every circle: each is symmetric, so none turns',
              ],
              answer: 0,
              why: {
                1: t`$3M$ is where *light* circles, in spacetime, where the curvature of time joins in. In this slice of space alone $\Gamma^r{}_{\varphi\varphi} \ne 0$ there.`,
                2: t`$6M$ is about orbits of massive particles in spacetime; on the spatial surface the circle at $6M$ bends: $\Gamma^r{}_{\varphi\varphi} = -4M$.`,
                3: t`A circle of latitude on a sphere is symmetric too but is not a geodesic (C6.2): symmetry is not straightness.`,
              },
              hints: [t`On a circle, $\dot r = \ddot r = 0$ and $\dot\varphi \ne 0$. What must $\Gamma^r{}_{\varphi\varphi}$ be?`, t`$-(r - 2M) = 0$ only at $r = 2M$.`],
              teach: t`A circle $r = \text{const}$ is a geodesic only where $\Gamma^r{}_{\varphi\varphi} = 0$: on this surface, only at the throat, its narrowest waist.`,
              explain: t`With $\dot r = \ddot r = 0$ the equation demands $\Gamma^r{}_{\varphi\varphi}\dot\varphi^2 = 0$, so $r = 2M$: the waist of the funnel, like the equator of a sphere or the smallest circle of a catenoid. The photon sphere and the innermost stable orbit are spacetime facts that this spatial slice cannot see.`,
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Curvature',
      story: t`From the Christoffels to the Riemann tensor (C15) and its contraction (C16) — and the surveyor checks the answer the honest way, by carrying a vector round a loop.`,
      items: [
        num({
          id: 'r4-riemann', skill: 'st-c.C15.2', difficulty: 3,
          gen(r) {
            const C = riemannCase(r);
            return {
              prompt: t`Around ${holeTeX(C)} the Gaussian curvature is $K = -M/r^3$. Using $R_{r\varphi r\varphi} = K\det g$, find $R_{r\varphi r\varphi}$ at $r = ${C.k}M$ (a pure number: $r$ is a length, $\varphi$ an angle).`,
              visual: flamm({ rings: [[C.k, 'gold']], points: [[C.k, 0.6, 'P', 'warn']] }),
              answer: C.R, tol: { rel: 0.005 },
              errors: apart([
                { value: -C.R, feedback: t`$K < 0$ everywhere here, so the component is negative.` },
                { value: C.K, feedback: t`That is $K$ in $\text{km}^{-2}$. Multiply by $\det g = \dfrac{r^2}{1 - 2M/r}$.` },
                { value: C.K * C.rr * C.rr, feedback: t`$\det g = g_{rr}g_{\varphi\varphi}$, and $g_{rr} = (1 - 2M/r)^{-1}$ is not 1.` },
              ], C.R),
              hints: [t`$\det g = \dfrac{r^2}{1 - 2M/r} = \dfrac{r^3}{r - 2M}$.`, t`$R_{r\varphi r\varphi} = -\dfrac{M}{r^3}\cdot\dfrac{r^3}{r - 2M} = -\dfrac{M}{r - 2M}$.`],
              teach: 'On any surface the one Riemann component is K det g, in whatever chart.',
              explain: t`$R_{r\varphi r\varphi} = -\dfrac{M}{r - 2M} = -\dfrac{1}{${C.k} - 2} = ${nice(C.R, 4)}$, the same for every mass at the same $r/M$. It blows up at the throat only because $\det g$ does; $K = -1/8M^2$ there is finite.`,
            };
          },
        }),
        num({
          id: 'r4-holonomy', skill: 'st-c.C15.1', difficulty: 4,
          gen(r) {
            const C = holonomyCase(r);
            const ph = C.dphi * DEG, pts = [];
            const N = 24;
            for (let i = 0; i <= N; i++) pts.push([C.k1 + ((C.k2 - C.k1) * i) / N, 0]);
            for (let i = 1; i <= N; i++) pts.push([C.k2, (ph * i) / N]);
            for (let i = 1; i <= N; i++) pts.push([C.k2 - ((C.k2 - C.k1) * i) / N, ph]);
            for (let i = 1; i <= N; i++) pts.push([C.k1, ph - (ph * i) / N]);
            return {
              prompt: t`Around ${holeTeX(C)}, the surveyor carries a vector round a sector: out along a radial line from $r = ${C.k1}M$ to $${C.k2}M$, round the circle through $${C.dphi}^\circ$, back in, and round the inner circle to the start. Using $\iint K\,dA$ with $K = -M/r^3$ and $dA = \dfrac{r\,dr\,d\varphi}{\sqrt{1 - 2M/r}}$, the vector comes back turned, one way or the other. By how many degrees?`,
              visual: flamm({ paths: [[pts, 'warn', 3]], pitch: 0.95, yaw: 1.2 }, t`The sector loop (orange) on the surface, seen from above, drawn in units of $4M$.`),
              answer: C.turn, units: 'deg', tol: { rel: 0.01 },
              errors: apart([
                { value: (C.dphi * DEG * (C.f2 - C.f1)), feedback: 'That is in radians; the question asks for degrees.' },
                { value: C.dphi * ((C.k2 * C.k2 - C.k1 * C.k1) / 2) * (1 / ((C.k1 + C.k2) / 2) ** 3), feedback: t`That uses the flat area and $K$ at one radius: integrate $K\,dA$ with the surface’s own area element.` },
              ], C.turn),
              hints: [
                t`$\iint K\,dA = -\Delta\varphi\displaystyle\int_{r_1}^{r_2}\frac{M\,dr}{r^2\sqrt{1 - 2M/r}}$.`,
                t`$\dfrac{d}{dr}\sqrt{1 - 2M/r} = \dfrac{M}{r^2\sqrt{1 - 2M/r}}$, so the integral is $\sqrt{1 - 2M/r_2} - \sqrt{1 - 2M/r_1}$.`,
                t`$\sqrt{1 - 2/${C.k2}} - \sqrt{1 - 2/${C.k1}} = ${nice(C.f2 - C.f1, 4)}$; multiply by $${C.dphi}^\circ$.`,
              ],
              teach: 'Holonomy round a loop is the curvature it encloses: here negative, so the vector turns clockwise against the loop.',
              explain: t`$\iint K\,dA = -${C.dphi}^\circ\times(${nice(C.f2, 4)} - ${nice(C.f1, 4)}) = -${nice(C.turn, 4)}^\circ$: the vector returns turned **clockwise** by $${nice(C.turn, 4)}^\circ$ for an anticlockwise loop — the opposite of a sphere. (Checked numerically by transporting a vector round this loop with the Christoffels.) Most of it is picked up near the throat, where $K$ is largest.`,
            };
          },
        }),
        num({
          id: 'r4-ricci', skill: 'st-c.C16.1', difficulty: 3,
          gen(r) {
            const C = ricciCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, find the Ricci component $R_{rr}$ at $r = ${C.k}M = ${nice(C.rr, 4)}$ km, in $\text{km}^{-2}$. ($K = -M/r^3$, and on a surface $R_{ab} = K g_{ab}$.)`,
              visual: profilePic(C.k, 'The profile of the surface with the point P.'),
              answer: C.Rrr, units: 'km^-2', tol: { rel: 0.005 },
              errors: apart([
                { value: C.K, feedback: t`That is $K$. Multiply by $g_{rr} = (1 - 2M/r)^{-1} = ${nice(C.grr, 4)}$.` },
                { value: 2 * C.K, feedback: t`That is the Ricci scalar $R = 2K$, not a component of the tensor.` },
                { value: C.K / C.grr, feedback: t`Multiply by $g_{rr}$, don’t divide: $R_{rr} = K g_{rr}$.` },
              ], C.Rrr),
              hints: [t`$R_{rr} = K g_{rr}$ with $g_{rr} = \dfrac{r}{r - 2M}$.`, t`$R_{rr} = -\dfrac{M}{r^2(r - 2M)}$.`],
              teach: 'On a surface the Ricci tensor is K times the metric, component by component.',
              explain: t`$R_{rr} = -\dfrac{M}{r^3}\cdot${nice(C.grr, 4)} = ${tex(C.Rrr, 4)}\ \text{km}^{-2}$. (The full 3D space around the hole has Ricci scalar zero — C16.2 — but this 2D slice of it is a surface with $R = 2K < 0$.)`,
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'What a traveller notices',
      story: t`Finally, two travellers who know nothing of coordinates walk straight ahead on the surface. What they see is geodesic deviation (C17) and a conservation law from the surface’s rotational symmetry (C18).`,
      items: [
        num({
          id: 'r5-deviation', skill: 'st-c.C17.1', difficulty: 3,
          gen(r) {
            const C = deviationCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, two travellers walk straight outward along neighbouring radial lines, side by side, $\xi = ${C.xi}$ m apart at $r = ${C.k}M$. With $s$ the distance walked, the deviation equation on a surface reads $\dfrac{d^2\xi}{ds^2} = -K\xi$. What is $d^2\xi/ds^2$ there, in metres per $\text{km}^2$ walked?`,
              visual: flamm({ radials: [[0.3, 2.02, 12, 'accent'], [0.42, 2.02, 12, 'violet']], rings: [[C.k, 'gold', 1.6]] }, t`Two neighbouring radial lines (blue and violet) on the surface, drawn in units of $4M$, with the circle $r = ${C.k}M$ in gold.`),
              answer: C.acc, tol: { rel: 0.01 },
              errors: apart([
                { value: -C.acc, feedback: t`$K < 0$, so $-K\xi > 0$: the walkers drift apart faster and faster, as on a saddle.` },
                { value: (2 * C.M * C.xi) / C.rr ** 3, feedback: t`On this surface $K = -M/r^3$ (not the $2M/r^3$ of the radial tide in spacetime).` },
              ], C.acc),
              hints: [t`$-K = M/r^3$ with $M$ and $r$ in km gives $\text{km}^{-2}$.`, t`$M/r^3 = ${tex(C.M / C.rr ** 3, 4)}\ \text{km}^{-2}$; multiply by $\xi = ${C.xi}$ m.`],
              teach: 'On a negatively curved surface nearby geodesics accelerate apart: ξ″ = −Kξ > 0.',
              explain: t`$\dfrac{d^2\xi}{ds^2} = \dfrac{M}{r^3}\xi = ${tex(C.M / C.rr ** 3, 4)}\times${C.xi} = ${tex(C.acc, 4)}$ m per km². Check without the deviation equation: $\xi = r\,\Delta\varphi$ and $dr/ds = \sqrt{1 - 2M/r}$ give $\xi'' = \tfrac12\,\tfrac{d}{dr}(1 - 2M/r)\,\Delta\varphi = \tfrac{M}{r^2}\Delta\varphi = \tfrac{M}{r^3}\xi$ ✓.`,
            };
          },
        }),
        num({
          id: 'r5-killing', skill: 'st-c.C18.2', difficulty: 3,
          gen(r) {
            const C = killingCase(r);
            return {
              prompt: t`Around ${holeTeX(C)}, a traveller at $r_0 = ${C.k0}M$ sets off straight ahead (along a geodesic) at $${C.a0}^\circ$ to the outward radial direction. The rotation $\partial_\varphi$ is a Killing vector, so $p_\varphi = r^2\dot\varphi$ is conserved; for unit speed this says $r\sin\alpha$ is constant, where $\alpha$ is the angle to the radial direction. At what angle $\alpha$ does the path cross the circle $r_1 = ${C.k1}M$, in degrees?`,
              visual: flamm({ rings: [[C.k0, 'gold', 1.8], [C.k1, 'teal', 1.8]], points: [[C.k0, 0, '\\text{start}', 'warn']] }, t`The starting circle $r_0$ (gold) and the circle $r_1$ (teal) on the surface, drawn in units of $4M$.`),
              answer: C.a1, units: 'deg', tol: { rel: 0.005 },
              errors: apart([
                { value: C.a0, feedback: t`The angle to the radial direction changes: what stays fixed is $r\sin\alpha$, and $r$ grows.` },
                { value: 90 - C.a1, feedback: t`That is the angle to the circle, not to the radial direction.` },
                { value: Math.asin(Math.min(1, Math.sin(C.a0 * DEG) / Math.sqrt(C.ratio))) / DEG, feedback: t`$r\sin\alpha$ is conserved, not $\sqrt r\sin\alpha$: divide $\sin ${C.a0}^\circ$ by $r_1/r_0 = ${C.ratio}$.` },
              ], C.a1),
              hints: [t`Unit speed: $g_{\varphi\varphi}\dot\varphi = r\cdot(r\dot\varphi) = r\sin\alpha$.`, t`$\sin\alpha_1 = \dfrac{r_0}{r_1}\sin\alpha_0 = \dfrac{\sin ${C.a0}^\circ}{${C.ratio}}$.`],
              teach: 'A Killing vector gives a conserved quantity along every geodesic: here Clairaut’s r sin α, the angular momentum of the walk.',
              explain: t`$\sin\alpha_1 = \sin ${C.a0}^\circ/${C.ratio} = ${nice(Math.sin(C.a0 * DEG) / C.ratio, 4)}$, so $\alpha_1 = ${nice(C.a1, 4)}^\circ$ — integrating the geodesic equation numerically gives the same. The same law holds on a flat plane, which has the same rotational symmetry; what differs is how far the traveller walks to get from $r_0$ to $r_1$, and that their path bends round the throat more than a straight line on a plane would.`,
            };
          },
        }),
      ],
    },
  ],
});
