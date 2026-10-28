// The Advanced Math A boss, "The Index Gauntlet": an imagined expedition that
// carries the course's toolbox from a spinning station to the edge of general
// relativity. Aboard Halcyon, a wobbling spin (the ε–δ identity in a double
// cross product) and a skewed deck basis (vector components through the dual
// basis, a gradient's components through the basis itself); along its spokes
// and round its ring, a cart's sideways push from the polar Christoffel
// symbols and the habitat ring's volume element in toroidal coordinates; on
// Mars, a slope from the raised gradient on the 2-sphere, the steering needed
// to hold a latitude (Γ^θ_φφ), and a Laplacian from (1/√g)∂_μ(√g g^μν ∂_ν);
// then the station's rotating coordinates as a metric of flat spacetime — a
// rim clock read from its line element, and the signature where g_tt changes
// sign — and last a courier's measured photon energy, −p_μu^μ, and the proof
// that it is a scalar. Every formula was checked in SymPy (the torus √g, the
// sphere Laplacian, the Christoffels, the rotating metric's determinant, the
// polar acceleration); every number comes from its generator.
import { boss, mcq, num, expr, order } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';
import { still, legs } from './_ten.js';
import { cols, matTeX, vecTeX, inv2, mv, transpose, dot } from './_metric.js';
import { plane, polarGrid } from './_tcalc.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;
const C = 2.998e8;              // m/s, as the prompts quote it
const G0 = 9.81;                // m/s²
const R_MARS = 3390;            // km, Mars's mean radius (3389.5 km)
const DAY = 86400;              // s
const SQ = [[1, 0], [0, 1]];
const r4 = (v) => +(+v).toFixed(4);
/** A number as TeX to n significant figures. */
const tn = (x, n = 3) => tex(x, n);
/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && far(Math.abs(e.value), Math.abs(key), rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}
/** A signed term for TeX: (3, 'x') → '+ 3x', (−2, 'y') → '- 2y'. */
const sgn = (c, v) => `${c < 0 ? '-' : '+'} ${Math.abs(c)}${v}`;
/** A number in hundredths, as TeX (−0.03). */
const hund = (n) => (n / 100).toFixed(2);

// ── picture pieces ──────────────────────────────────────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const arc = (cx, cy, R, a0, a1, color = 'ink3', width = 1.4, dash = false) => ({ param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [r4(a0), r4(a1)], color, width, ...(dash ? { dash: true } : {}) });
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy });
const dotp = (x, y, color = 'gold', r = 5) => ({ x: r4(x), y: r4(y), r, color });

/** The station seen along its spin axis: rim, hub, spokes at angle a0 (rad), the spin sense. */
function wheel({ a0 = 0.35, spokes = 4 } = {}) {
  const curves = [arc(0, 0, 1, 0, 2 * PI, 'ink2', 3), arc(0, 0, 0.13, 0, 2 * PI, 'ink2', 2)];
  for (let k = 0; k < spokes; k++) {
    const a = a0 + (2 * PI * k) / spokes;
    curves.push(seg([0.13 * Math.cos(a), 0.13 * Math.sin(a)], [Math.cos(a), Math.sin(a)], 'ink3', 2.2));
  }
  curves.push(arc(0, 0, 1.18, 0.5, 1.25, 'teal', 2));
  const head = { from: [r4(1.18 * Math.cos(1.17)), r4(1.18 * Math.sin(1.17))], to: [r4(1.18 * Math.cos(1.27)), r4(1.18 * Math.sin(1.27))], color: 'teal', width: 2.4 };
  return { curves, head };
}

// ── round 1: the wobble and the deck basis ──────────────────────────────────
const DECK = [[[2, 1], [0, 1]], [[1, -1], [1, 2]], [[1, 1], [-1, 2]], [[2, -1], [1, 1]], [[3, 1], [1, 1]], [[2, 1], [1, 2]]];
const AXES = ['x', 'y', 'z'];

export default boss({
  title: 'The Index Gauntlet',
  intro: t`An imagined expedition, worked end to end in index notation. It starts aboard *Halcyon*, a wheel-shaped station spun for gravity, where every plan uses a different basis; drops to Mars, whose surface is a 2-sphere with a metric of its own; and ends where general relativity begins — the station’s turning coordinates read as a metric of flat spacetime, and a courier crossing at a good fraction of the speed of light. Conventions are Carroll’s: signature $(-, +, +, +)$, and $c$ written out unless a problem says $c = 1$. Every chart changes the components. Your job is to know which numbers survive.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The wobbling wheel',
      story: t`A hard docking has left *Halcyon* wobbling, and the module’s deck plans use a skewed basis that nobody remembers choosing. Before anyone moves cargo, the navigator wants every component checked.`,
      items: [
        num({
          id: 'r1-wobble', skill: 'st-a.A1.3', difficulty: 3,
          gen(r) {
            let w, x, i, key, wr, ww;
            for (let k = 0; k < 60; k++) {
              w = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.int(16, 21)];   // hundredths of rad/s
              x = [r.sign() * r.int(10, 22) * 10, r.sign() * r.int(10, 22) * 10, r.intExcept(-3, 3, [0]) * 10];
              i = r.int(0, 2);
              wr = dot(w, x); ww = dot(w, w);
              key = (w[i] * wr - x[i] * ww) / 1e4;
              if (Math.abs(key) > 0.3 && Math.abs(w[i] * wr) / 1e4 > 0.2 && Math.abs(x[i] * ww) / 1e4 > 0.2) break;
            }
            const a = AXES[i], wT = `(${w.map(hund).join(',\\ ')})`, xT = `(${x.join(',\\ ')})`;
            const ring = Math.hypot(x[0], x[1]) / 100;
            return {
              prompt: t`In *Halcyon*’s Cartesian axes ($z$ along the spin axis it was designed for), the wobbling station turns with angular velocity $\boldsymbol\omega = ${wT}\ \text{rad/s}$. An accelerometer sits at $\mathbf r = ${xT}$ m from the centre of mass. The centripetal part of its acceleration is $\mathbf a = \boldsymbol\omega\times(\boldsymbol\omega\times\mathbf r)$, which in index notation (Cartesian components, so index height does not matter) is $$a_i = \varepsilon_{ijk}\,\omega_j\,\varepsilon_{klm}\,\omega_l\,r_m.$$ Use $\varepsilon_{ijk}\varepsilon_{klm} = \delta_{il}\delta_{jm} - \delta_{im}\delta_{jl}$ to find $a_${a}$.`,
              answer: key, units: 'm/s^2', tol: { rel: 0.01 },
              errors: apart([
                { value: (-x[i] * ww) / 1e4, feedback: t`That is only $-r_i\,|\boldsymbol\omega|^2$, the answer for a spin exactly perpendicular to $\mathbf r$. The first pair of deltas leaves $\omega_i(\omega_jr_j)$ as well, and with the wobble $\boldsymbol\omega\cdot\mathbf r \ne 0$.` },
                { value: (w[i] * wr) / 1e4, feedback: t`You kept $\delta_{il}\delta_{jm}$ but lost $-\delta_{im}\delta_{jl}$: the second pair gives $-r_i\,\omega_j\omega_j = -r_i|\boldsymbol\omega|^2$.` },
                { value: (w[i] * wr + x[i] * ww) / 1e4, feedback: t`The identity has a minus sign between its two terms: $\varepsilon_{ijk}\varepsilon_{klm} = \delta_{il}\delta_{jm} - \delta_{im}\delta_{jl}$. With a plus, the acceleration would point away from the axis.` },
              ], key),
              hints: [
                t`Contract each delta with the vector carrying its other index: $\delta_{il}\omega_l = \omega_i$, $\delta_{jm}r_m = r_j$, and so on.`,
                t`The identity turns $a_i$ into $\omega_i\,(\omega_jr_j) - r_i\,(\omega_j\omega_j)$: two dot products. Compute $\boldsymbol\omega\cdot\mathbf r$ and $|\boldsymbol\omega|^2$ first.`,
              ],
              teach: t`Two Levi-Civita symbols sharing an index collapse into Kronecker deltas, and the deltas turn a double cross product into dot products: $\boldsymbol\omega\times(\boldsymbol\omega\times\mathbf r) = \boldsymbol\omega(\boldsymbol\omega\cdot\mathbf r) - \mathbf r\,|\boldsymbol\omega|^2$.`,
              explain: t`Substituting the identity, $a_i = (\delta_{il}\delta_{jm} - \delta_{im}\delta_{jl})\,\omega_j\omega_lr_m = \omega_i\,(\omega_jr_j) - r_i\,(\omega_j\omega_j)$. Here $\boldsymbol\omega\cdot\mathbf r = ${nice(wr / 100)}\ \text{m rad/s}$ and $|\boldsymbol\omega|^2 = ${nice(ww / 1e4)}\ \text{rad}^2/\text{s}^2$, so $$a_${a} = (${hund(w[i])})(${nice(wr / 100)}) - (${x[i]})(${nice(ww / 1e4)}) = ${tn(key)}\ \text{m/s}^2.$$ Sense check: without the wobble ($\omega_x = \omega_y = 0$) and with $z = 0$ this is $-\omega^2\mathbf r$, the familiar centripetal $\omega^2r$ pointing at the axis.`,
              visual: {
                type: 'calc-vectors3d',
                params: {
                  range: 3.5,
                  vectors: [{ to: w.map((c) => r4(c / 10)), color: 'accent', label: t`\boldsymbol\omega` }, { to: x.map((c) => r4(c / 100)), color: 'gold', label: t`\mathbf r` }],
                  curves: [{ param: [`${r4(ring)}*cos(t)`, `${r4(ring)}*sin(t)`, '0'], t: [0, 6.2832], color: 'teal' }],
                },
                caption: t`The spin $\boldsymbol\omega$ (blue, drawn 10 m long per 0.1 rad/s) tipped off the design axis $z$, and the accelerometer’s position $\mathbf r$ (gold, in hundreds of metres). The teal circle is the ring at the accelerometer’s distance from the axis. Drag to rotate.`,
              },
            };
          },
        }),
        num({
          id: 'r1-deck', skill: 'st-a.A3.4', difficulty: 3,
          gen(r) {
            const A = r.pick(DECK), Vp = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], V = mv(A, Vp), j = r.int(0, 1);
            const Ai = inv2(A), E = cols(A), key = Vp[j];
            const e = E[j], o = E[1 - j];
            const fwd = mv(A, V)[j], proj = dot(V, e) / dot(e, e), invT = mv(transpose(Ai), V)[j];
            const vt = (v) => `(${v.join(',\\ ')})`;
            return {
              prompt: t`The module’s deck plans use the basis $\mathbf e'_1 = ${vt(E[0])}$, $\mathbf e'_2 = ${vt(E[1])}$, written in the station’s perpendicular basis (metres). A robot arm must shift a cargo pallet by $\mathbf d = ${vt(V)}$ m in station components, but its controller takes deck components, $\mathbf d = d'^1\mathbf e'_1 + d'^2\mathbf e'_2$. Find the dual covector $\mathbf e'^{${j + 1}}$ — the one with $\mathbf e'^j(\mathbf e'_k) = \delta^j_k$ — and use it to find $d'^{${j + 1}}$.`,
              answer: key, units: 'm', tol: { rel: 1e-6, abs: 0.02 },
              errors: apart([
                { value: fwd, feedback: t`You multiplied by the matrix whose columns are the new basis vectors. That matrix turns deck components *into* station ones; to go the other way, vector components need its inverse.` },
                { value: proj, feedback: t`Projecting onto $\mathbf e'_{${j + 1}}$ with the dot product works only when the basis is perpendicular. These deck arrows are skewed, so the component comes from the dual covector, which is perpendicular to the *other* arrow, $\mathbf e'_{${2 - j}}$.` },
                { value: invT, feedback: t`The dual covectors are the **rows** of $A^{-1}$ (with the deck arrows as the columns of $A$), not its columns.` },
              ], key),
              hints: [
                t`Put the deck arrows in the columns of $A = ${matTeX(A)}$. The dual covectors satisfy $\mathbf e'^j(\mathbf e'_k) = \delta^j_k$: as rows, they make the inverse of $A$.`,
                t`$A^{-1} = ${matTeX(Ai)}$. Row ${j + 1} is $\mathbf e'^{${j + 1}}$; apply it to $\mathbf d$ as a dot product of numbers.`,
              ],
              teach: t`The component $V'^j$ of a vector is what the dual covector $\mathbf e'^j$ returns on it, and the dual covectors are the rows of the inverse of the matrix whose columns are the basis — so vector components transform with $A^{-1}$.`,
              explain: t`With the deck arrows as the columns of $A = ${matTeX(A)}$, the conditions $\mathbf e'^j(\mathbf e'_k) = \delta^j_k$ say the rows of the dual covectors form $A^{-1} = ${matTeX(Ai)}$. Row ${j + 1} applied to $\mathbf d$ gives $d'^{${j + 1}} = ${nice(key)}$ m. Check: $${nice(Vp[0])}\,\mathbf e'_1 ${sgn(Vp[1], '')}\,\mathbf e'_2 = ${vt(V)}$ ✓. Note that $\mathbf e'^{${j + 1}}$ is perpendicular to $\mathbf e'_{${2 - j}} = ${vt(o)}$: a covector’s level lines run along the arrows it must ignore.`,
              visual: still({ basis: E, ghost: SQ, ghostNames: ['e₁', 'e₂'], names: ['e′₁', 'e′₂'], vector: V, vname: 'd', construction: false, grid: 'none' },
                t`The deck basis (bold) over the station’s perpendicular basis (faint), and the pallet’s shift $\mathbf d$ (gold). One arrow, two sets of components.`),
            };
          },
        }),
        num({
          id: 'r1-gradient', skill: 'st-a.A3.5', difficulty: 3,
          gen(r) {
            let A, w, k, key;
            for (let n = 0; n < 40; n++) {
              A = r.pick(DECK); w = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])]; k = r.int(0, 1);
              key = A[0][k] * w[0] + A[1][k] * w[1];
              if (key !== 0) break;
            }
            const E = cols(A), Ai = inv2(A);
            const vt = (v) => `(${v.join(',\\ ')})`;
            const other = A[0][1 - k] * w[0] + A[1][1 - k] * w[1];
            return {
              prompt: t`Near the galley heater, in the station’s perpendicular basis, the temperature gradient $dT$ has components $(\partial_1T,\ \partial_2T) = ${vt(w)}$ K/m. The deck plans use the skewed basis $\mathbf e'_1 = ${vt(E[0])}$, $\mathbf e'_2 = ${vt(E[1])}$ (in station components). What is the gradient’s deck component $\partial'_{${k + 1}}T = dT(\mathbf e'_{${k + 1}})$, in K/m?`,
              answer: key, units: 'K/m', tol: { rel: 1e-6, abs: 0.02 },
              errors: apart([
                { value: mv(Ai, w)[k], feedback: t`That is the rule for a vector’s components, with $A^{-1}$. A gradient is a covector: its components are its values on the basis arrows, so they transform with $A$ itself, like the basis.` },
                { value: mv(A, w)[k], feedback: t`You used a **row** of $A$. The covector law is $\omega'_j = A^i{}_j\,\omega_i$: the sum runs down column $j$ — the new arrow $\mathbf e'_j$ itself.` },
                { value: mv(transpose(Ai), w)[k], feedback: t`The inverse transpose would be right for a vector in a perpendicular basis only. Here, just evaluate $dT$ on the new arrow: $\partial'_jT = \partial_iT\,(\mathbf e'_j)^i$.` },
              ], key),
              hints: [
                t`A covector’s component on a basis arrow is its value there: $\partial'_jT = dT(\mathbf e'_j)$, and $dT$ is linear.`,
                t`$dT(\mathbf e'_{${k + 1}}) = \partial_1T\,(\mathbf e'_{${k + 1}})^1 + \partial_2T\,(\mathbf e'_{${k + 1}})^2$ — a dot product of numbers with the arrow’s station components.`,
              ],
              teach: t`Covector components transform with the same matrix as the basis vectors, $\omega'_j = A^i{}_j\,\omega_i$ — lower index, “co-variant” — because they are the covector’s values on those vectors.`,
              explain: t`$\partial'_jT = A^i{}_j\,\partial_iT$, with column $j$ of $A$ the arrow $\mathbf e'_j$: $$\partial'_{${k + 1}}T = (${w[0]})(${E[k][0]}) + (${w[1]})(${E[k][1]}) = ${key}\ \text{K/m}.$$ The other is $\partial'_{${2 - k}}T = ${other}$ K/m. A walk along $\mathbf e'_{${k + 1}}$ changes the temperature by ${key} K, whichever basis you write it in: paired with deck components of a displacement, these give the same temperature change as the station’s components do.`,
              visual: still({ mode: 'covector', basis: SQ, covector: w, names: ['e₁', 'e₂'], showVector: false, levelLabels: false, crossings: false, wname: 'dT',
                arrows: [{ from: [0, 0], to: E[0], color: 'violet', label: 'e′₁' }, { from: [0, 0], to: E[1], color: 'violet', label: 'e′₂' }] },
              t`The gradient $dT$ as its stack of isotherms one kelvin apart (teal), the station’s basis, and the deck arrows (violet). Isotherms only near the heater: a real gradient is not uniform over the deck.`),
            };
          },
        }),
      ],
    },
    {
      title: 'Spokes and the ring',
      story: t`Cargo moves between the hub and the habitat ring along the spokes. Two questions from the engineers: how hard do the rails push a cart that is climbing out along a spoke, and how much air does the ring hold?`,
      items: [
        num({
          id: 'r2-spoke', skill: 'st-a.A9.2', difficulty: 3, transfer: true,
          gen(r) {
            const R = r.pick([200, 225, 250]), gf = r.pick([0.38, 0.5, 1]);
            const w = +Math.sqrt((gf * G0) / R).toPrecision(3), v = r.pick([1.5, 2, 2.5, 3]), m = r.pick([250, 300, 400, 500]);
            const rr = Math.round((R * r.pick([1, 2])) / 3);
            const key = 2 * m * v * w;
            return {
              prompt: t`*Halcyon*’s rim is $${R}$ m from its axis, and it spins at $\omega = ${w}$ rad/s. A cart of mass ${m} kg climbs out along a straight spoke at a steady $${v}$ m/s relative to the spoke. Work in polar coordinates $(r, \theta)$ fixed to the stars, in the station’s plane, where the cart has $r = r_0 + vt$ and $\theta = \omega t$. Its acceleration is the covariant derivative of its velocity along its path, $$a^\mu = \ddot x^\mu + \Gamma^\mu{}_{\nu\lambda}\,\dot x^\nu\dot x^\lambda.$$ When the cart is $${rr}$ m from the axis, how hard must the rails push it sideways — along $\partial_\theta$ — in newtons?`,
              answer: key, units: 'N', tol: { rel: 0.01 },
              errors: apart([
                { value: m * v * w, feedback: t`The sum $\Gamma^\theta{}_{\nu\lambda}\dot x^\nu\dot x^\lambda$ runs over both orders: $\Gamma^\theta{}_{r\theta}\dot r\dot\theta + \Gamma^\theta{}_{\theta r}\dot\theta\dot r$, which is twice one of them.` },
                { value: m * rr * w * w, feedback: t`That is $m\,r\omega^2$, the **inward** push, from $a^r = \ddot r - r\dot\theta^2$. The question asks for the sideways one, along $\partial_\theta$.` },
                { value: (2 * m * v * w) / rr, feedback: t`$a^\theta = 2\dot r\dot\theta/r$ is a coordinate component, in rad/s². The basis vector $\partial_\theta$ is $r$ long, so the acceleration along it is $r\,a^\theta$ in m/s².` },
              ], key),
              hints: [
                t`For polar coordinates on the plane the only non-zero Christoffel symbols are $\Gamma^r{}_{\theta\theta} = -r$ and $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$.`,
                t`$a^\theta = \ddot\theta + \tfrac2r\dot r\dot\theta$ with $\ddot\theta = 0$, $\dot r = v$, $\dot\theta = \omega$. Then turn the coordinate component into metres per second squared: $|\partial_\theta| = r$.`,
              ],
              teach: t`In polar coordinates even a steady motion has an acceleration, carried by the Christoffel symbols: $a^\theta = \ddot\theta + \tfrac2r\dot r\dot\theta$ — the Coriolis push felt on a rotating station.`,
              explain: t`With $\ddot\theta = 0$, $$a^\theta = 2\,\Gamma^\theta{}_{r\theta}\,\dot r\dot\theta = \frac{2v\omega}{r},$$ a rate of change of angular speed. Along $\partial_\theta$, which is $r$ long, that is $r\,a^\theta = 2v\omega = ${tn(2 * v * w)}\ \text{m/s}^2$, so the rails push with $F = 2mv\omega = ${tn(key)}$ N — at any distance from the axis. Meanwhile $a^r = -r\omega^2$, the inward pull that holds the cart on its circle. In the station’s turning frame the same sideways force shows up as the Coriolis force.`,
              visual: (() => {
                const W = wheel({ a0: 0.35 }), q = rr / R, a = 0.35, P = [q * Math.cos(a), q * Math.sin(a)];
                return plane({
                  x: [-1.5, 1.5], y: [-1.25, 1.3], curves: W.curves,
                  arrows: [W.head, { from: P.map(r4), to: [r4(P[0] + 0.32 * Math.cos(a)), r4(P[1] + 0.32 * Math.sin(a))], color: 'gold', width: 2.6, label: 'v', labelDx: 4, labelDy: -2 }],
                  points: [dotp(P[0], P[1], 'gold', 6), tag(P[0], P[1], 'cart', 'gold', -14, 22), tag(1.18 * Math.cos(0.85), 1.18 * Math.sin(0.85), 'ω', 'teal', 6, -4), tag(0, 0, 'hub', 'ink2', -12, 26)],
                  caption: t`*Halcyon* seen along its axis, with the cart climbing a spoke at speed $v$ while the wheel turns at $\omega$. The arrows show directions only; the station is drawn with four spokes for clarity.`,
                });
              })(),
            };
          },
        }),
        expr({
          id: 'r2-ring', skill: 'st-a.A10.1', difficulty: 3,
          gen(r) {
            const R = r.pick([180, 200, 225, 250]), a = r.pick([6, 8, 10]);
            const V = 2 * PI * PI * R * a * a, M = 1.2 * V;
            return {
              prompt: t`The habitat ring is a torus: its tube’s centre-line is a circle of radius $R = ${R}$ m round the station’s axis, and the tube has radius $${a}$ m. Toroidal coordinates $(s, \psi, \phi)$ — distance $s$ from the tube’s centre-line, angle $\psi$ round the tube, angle $\phi$ round the station’s axis — are $$x = (${R} + s\cos\psi)\cos\phi,\quad y = (${R} + s\cos\psi)\sin\phi,\quad z = s\sin\psi.$$ Find the volume element’s factor $\sqrt g$, with $g = \det g_{\mu\nu}$, so that $dV = \sqrt g\,ds\,d\psi\,d\phi$. Write it in terms of $s$ and $\psi$.`,
              answer: `s*(${R} + s*cos(psi))`, answerTeX: t`s\,(${R} + s\cos\psi)`,
              vars: { s: [0.5, a], psi: [-3, 3] }, lhs: t`\sqrt g`, keys: [['ψ', 'psi']],
              errors: [
                { answer: `${R} + s*cos(psi)`, feedback: t`That is only $\sqrt{g_{\phi\phi}}$. Going round the tube, a step $d\psi$ covers $s\,d\psi$ metres: $g_{\psi\psi} = s^2$ contributes its factor $s$ too.` },
                { answer: 's', feedback: t`That is the polar area element of the tube’s cross-section. Sweeping it round the station’s axis, a step $d\phi$ covers $(${R} + s\cos\psi)\,d\phi$ metres, so that factor belongs in $\sqrt g$ as well.` },
                { answer: `s^2*(${R} + s*cos(psi))^2`, feedback: t`That is $g = \det g_{\mu\nu}$ itself. The volume element takes its square root: $\sqrt g = s\,(${R} + s\cos\psi)$.` },
                { answer: `s*${R}`, feedback: t`That treats the tube as thin, as if every point were $${R}$ m from the axis. The inner side of the tube ($\psi = 180^\circ$) is closer to the axis than the outer side, so the factor is $${R} + s\cos\psi$.` },
              ],
              hints: [
                t`Compute the metric $g_{\mu\nu} = \partial_\mu\mathbf x\cdot\partial_\nu\mathbf x$. All three coordinate directions turn out perpendicular, so $g_{\mu\nu}$ is diagonal.`,
                t`$g_{ss} = 1$, $g_{\psi\psi} = s^2$, $g_{\phi\phi} = (${R} + s\cos\psi)^2$. For a diagonal metric $\sqrt g$ is the product of the square roots of the diagonal entries.`,
              ],
              teach: t`The volume element is $\sqrt{g}\,d^nx$: for perpendicular coordinates, the product of the lengths $|\partial_\mu|$ of the coordinate basis vectors, the edges of a small coordinate box.`,
              explain: t`$\partial_s\mathbf x$, $\partial_\psi\mathbf x$ and $\partial_\phi\mathbf x$ are perpendicular, with lengths $1$, $s$ and $${R} + s\cos\psi$. So $g_{\mu\nu} = \operatorname{diag}\big(1,\ s^2,\ (${R} + s\cos\psi)^2\big)$ and $$\sqrt g = s\,(${R} + s\cos\psi).$$ Integrated over the tube, the $\cos\psi$ term cancels between the inner and outer halves: $V = 2\pi\cdot2\pi\int_0^{${a}}${R}\,s\,ds = 2\pi^2R a^2 = ${tn(V)}\ \text{m}^3$, holding about $${tn(M)}$ kg of air at $1.2\ \text{kg/m}^3$.`,
              visual: (() => {
                const Rd = 4, ad = 1.35, s = 0.95, p = 40 * DEG, P = [Rd + s * Math.cos(p), s * Math.sin(p)];
                return plane({
                  x: [-6, 6], y: [-2.1, 2.1],
                  curves: [seg([0, -2], [0, 2], 'ink3', 1.2, true), arc(Rd, 0, ad, 0, 2 * PI, 'ink2', 2.6), arc(-Rd, 0, ad, 0, 2 * PI, 'ink2', 2.6),
                    seg([Rd, 0], P, 'gold', 2), arc(Rd, 0, 0.42, 0, p, 'gold', 1.4), seg([Rd - ad, 0], [Rd + ad, 0], 'ink4', 1, true)],
                  arrows: [{ from: [0, -1.75], to: [Rd, -1.75], color: 'ink2', width: 1.6, label: 'R', labelDx: -60, labelDy: -6 }],
                  points: [dotp(P[0], P[1], 'gold', 5), dotp(Rd, 0, 'ink2', 3), tag((Rd + P[0]) / 2, P[1] / 2, 's', 'gold', -12, -4), tag(Rd + 0.5, 0.18, 'ψ', 'gold', 2, 2),
                    tag(0, 2, 'axis', 'ink3', 6, 10), tag(-Rd, 0, 'tube', 'ink3', -14, 4)],
                  caption: t`A cut through the station’s axis (dashed) and the ring’s tube on either side. The point $(s, \psi)$ is a distance $s$ from the tube’s centre, at angle $\psi$ from the outward direction; $\phi$ turns the whole cut round the axis. Not to scale: the real tube is far thinner than $R$.`,
                });
              })(),
            };
          },
        }),
      ],
    },
    {
      title: 'Planetfall',
      story: t`The expedition lands on Mars, treated here as a sphere of radius 3390 km with $ds^2 = R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$: $\theta$ is the colatitude, measured from the north pole, and $\phi$ the east longitude. There are no Cartesian coordinates on a surface — only the metric.`,
      items: [
        num({
          id: 'r3-slope', skill: 'st-a.A6.5', difficulty: 3,
          gen(r) {
            const H = r.pick([4, 5, 6, 8]), lat = r.pick([15, 25, 35, 50, 60]), lon = r.pick([20, 30, 35, 55, 60, 70, 115, 125, 150]);
            const th = (90 - lat) * DEG, ph = lon * DEG, Rk = R_MARS;
            const s = Math.sin(th), c = Math.cos(th), c2 = Math.cos(2 * ph), s2 = Math.sin(2 * ph);
            const dth = 2 * H * s * c * c2, dph = -2 * H * s * s * s2;             // km per radian
            const key = 1000 * Math.sqrt(dth ** 2 / Rk ** 2 + dph ** 2 / (Rk * s) ** 2);   // m per km
            return {
              prompt: t`A smooth, invented model of a broad rise near the landing site gives the ground’s height as $$h(\theta, \phi) = H\sin^2\theta\,\cos2\phi,\qquad H = ${H}\ \text{km}.$$ The steepness of the ground is the length of the gradient, $|dh| = \sqrt{g^{\mu\nu}\,\partial_\mu h\,\partial_\nu h}$. Find it at latitude $${lat}^\circ$ N, longitude $${lon}^\circ$ E, in metres of height per kilometre.`,
              answer: key, units: 'm/km', tol: { rel: 0.01 },
              errors: apart([
                { value: 1000 * Math.sqrt(dth ** 2 + dph ** 2) / Rk, feedback: t`You divided both components by $R^2$, as if $g^{\phi\phi} = 1/R^2$. A step $d\phi$ covers only $R\sin\theta\,d\phi$ of ground, so $g_{\phi\phi} = R^2\sin^2\theta$ and $g^{\phi\phi} = 1/(R^2\sin^2\theta)$.` },
                { value: 1000 * Math.sqrt(dth ** 2 / Rk ** 2 + dph ** 2 / (Rk ** 2 * s)), feedback: t`$g^{\phi\phi}$ is the inverse of $g_{\phi\phi} = R^2\sin^2\theta$: the sine is squared.` },
                { value: 1000 * Math.abs(dth) / Rk, feedback: t`That is only the north–south part. The east–west derivative $\partial_\phi h$ contributes too, raised with $g^{\phi\phi}$.` },
              ], key),
              hints: [
                t`$\partial_\theta h = 2H\sin\theta\cos\theta\cos2\phi$ and $\partial_\phi h = -2H\sin^2\theta\sin2\phi$ (kilometres per radian). Colatitude $\theta = 90^\circ - ${lat}^\circ$.`,
                t`The metric is diagonal, so its inverse is too: $g^{\theta\theta} = 1/R^2$, $g^{\phi\phi} = 1/(R^2\sin^2\theta)$. Then $|dh|^2 = (\partial_\theta h)^2/R^2 + (\partial_\phi h)^2/(R^2\sin^2\theta)$.`,
              ],
              teach: t`The partial derivatives $\partial_\mu h$ are a covector’s components; to get a length you raise one index with the inverse metric and contract, $g^{\mu\nu}\partial_\mu h\,\partial_\nu h$ — a scalar every chart agrees on.`,
              explain: t`At colatitude $\theta = ${90 - lat}^\circ$, $\partial_\theta h = ${tn(dth)}$ km/rad and $\partial_\phi h = ${tn(dph)}$ km/rad. With $g^{\theta\theta} = 1/R^2$ and $g^{\phi\phi} = 1/(R^2\sin^2\theta)$, $$|dh| = \frac1R\sqrt{(\partial_\theta h)^2 + \frac{(\partial_\phi h)^2}{\sin^2\theta}} = ${tn(key / 1000)},$$ or $${tn(key)}$ m per km. Sense check: ${H} km of relief spread over a few thousand kilometres makes a gentle grade, a few metres per kilometre. The partial derivatives alone, in km per radian, are not slopes at all until the metric turns radians into kilometres.`,
              visual: {
                type: 'ten-metric',
                params: { mode: 'chart', chart: 'sphere', probe: [r4(ph), r4(th)], dragProbe: false, readout: false },
                caption: t`The $(\phi, \theta)$ chart of the sphere with the landing site P. Each ellipse is the set of short steps of one fixed length on the ground: near the poles a small step in $\phi$ already covers that length, which is why $g^{\phi\phi} = 1/(R^2\sin^2\theta)$ grows there. The height model is invented.`,
              },
            };
          },
        }),
        num({
          id: 'r3-latitude', skill: 'st-a.A8.4', difficulty: 4, transfer: true,
          gen(r) {
            const lat = r.pick([20, 30, 35, 40, 50, 55, 60]);
            const L = lat * DEG, key = (180 / PI) * Math.tan(L) * (100 / R_MARS);
            return {
              prompt: t`A rover sets out due east along the parallel at latitude $${lat}^\circ$ N and must stay on it. Its path is $\theta = \theta_0$, $\phi = s/(R\sin\theta_0)$, with $s$ the distance driven. Its acceleration per unit distance squared is $a^\mu = \dfrac{d^2x^\mu}{ds^2} + \Gamma^\mu{}_{\nu\lambda}\dfrac{dx^\nu}{ds}\dfrac{dx^\lambda}{ds}$, which is zero for a geodesic. Find the Christoffel symbols from the metric, then: by how many degrees must the rover’s heading turn, relative to driving straight, over each 100 km of the parallel?`,
              answer: key, units: 'deg', tol: { rel: 0.01 },
              errors: apart([
                { value: (180 / PI) * (100 / R_MARS) / Math.tan(L), feedback: t`You have $\cot$ where $\tan$ belongs: $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ with $\theta$ the **colatitude**, $90^\circ - ${lat}^\circ$, so $\cot\theta = \tan(\text{latitude})$.` },
                { value: (180 / PI) * (100 / R_MARS) / Math.cos(L), feedback: t`That is the curvature of the parallel as a circle in space, $1/(R\cos\lambda)$. Part of that bending points into the ground and is the sphere’s own curving, which a rover cannot feel; only the part along the surface, $a^\theta$, needs steering.` },
                { value: (180 / PI) * (100 / R_MARS), feedback: t`That is $1/R$ per unit distance, the bending of a great circle in space. A great circle needs no steering at all; the parallel needs $\tan\lambda/R$.` },
              ], key),
              hints: [
                t`From $g_{\theta\theta} = R^2$, $g_{\phi\phi} = R^2\sin^2\theta$: $\Gamma^\theta{}_{\phi\phi} = -\tfrac12g^{\theta\theta}\partial_\theta g_{\phi\phi} = -\sin\theta\cos\theta$ and $\Gamma^\phi{}_{\theta\phi} = \cot\theta$.`,
                t`On the path, $d^2\theta/ds^2 = 0$ and $d\phi/ds = 1/(R\sin\theta_0)$, so $a^\theta = \Gamma^\theta{}_{\phi\phi}\,(d\phi/ds)^2 = -\cot\theta_0/R^2$, and $a^\phi = 0$.`,
                t`$\partial_\theta$ is $R$ long, so the sideways turning rate is $R\,|a^\theta| = \cot\theta_0/R$ radians per metre. Multiply by 100 km and convert to degrees.`,
              ],
              teach: t`A curve’s failure to be a geodesic is its covariant acceleration $a^\mu$, built from the Christoffel symbols — which come from derivatives of the metric alone, no embedding needed.`,
              explain: t`Metric compatibility gives $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$. Along the parallel, $a^\theta = -\sin\theta_0\cos\theta_0\cdot\dfrac{1}{R^2\sin^2\theta_0} = -\dfrac{\cot\theta_0}{R^2}$: negative, toward the pole. Its size along the ground is $R|a^\theta| = \cot\theta_0/R = \tan(${lat}^\circ)/(${R_MARS}\ \text{km})$, so over 100 km the heading turns by $$\frac{\tan ${lat}^\circ\times100}{${R_MARS}}\ \text{rad} = ${tn(key)}^\circ,$$ always toward the pole. Driven without steering, the rover would follow a great circle, curving toward the equator — as the geodesic in the picture does. At the equator $\tan0 = 0$: the equator is a geodesic.`,
              visual: {
                type: 'gr-surface',
                params: { mode: 'geodesic', surface: 'sphere', v: r4((90 - lat) * DEG), heading: 0, length: 2.2, controls: false, readout: false },
                caption: t`A sphere with the rover’s starting point P. The gold curve is the geodesic launched along the parallel through P — where the rover goes if it drives straight. Drag to rotate.`,
              },
            };
          },
        }),
        expr({
          id: 'r3-laplacian', skill: 'st-a.A9.1', difficulty: 4,
          gen(r) {
            const a = r.int(2, 6), b = r.intExcept(-5, 5, [0]);
            const fT = t`${a}\cos^2\theta ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\sin\theta\cos\phi`;
            const B2 = -2 * b;
            return {
              prompt: t`Overnight the ground cools in a pattern the team models as a temperature anomaly $$f(\theta, \phi) = ${fT}\ \text{K}.$$ Heat spreading through a thin surface layer needs the Laplacian on the sphere, $$\nabla^2f = \frac{1}{\sqrt g}\,\partial_\mu\!\left(\sqrt g\,g^{\mu\nu}\,\partial_\nu f\right),\qquad \sqrt g = R^2\sin\theta.$$ Find $R^2\,\nabla^2f$ as a function of $\theta$ and $\phi$.`,
              answer: `${a}*(2 - 6*cos(theta)^2) + (${B2})*sin(theta)*cos(phi)`,
              answerTeX: t`${a}\,(2 - 6\cos^2\theta) ${B2 < 0 ? '-' : '+'} ${Math.abs(B2)}\sin\theta\cos\phi`,
              vars: { theta: [0.3, 2.8], phi: [-3, 3] }, lhs: t`R^2\nabla^2 f`, keys: [['θ', 'theta'], ['φ', 'phi']],
              errors: [
                { answer: `${a}*(2 - 4*cos(theta)^2) + (${B2})*sin(theta)*cos(phi)`, feedback: t`That is $\partial_\theta^2f + \partial_\phi^2f$, the flat Laplacian in the chart’s coordinates. On the sphere, $\sqrt g = R^2\sin\theta$ varies with $\theta$, which adds $\cot\theta\,\partial_\theta f$; and $g^{\phi\phi} = 1/(R^2\sin^2\theta)$ weights the $\phi$ part.` },
                { answer: `${a}*(2 - 4*cos(theta)^2) + (${-b})*(sin(theta) + 1/sin(theta))*cos(phi)`, feedback: t`You kept $g^{\phi\phi}$ but lost the term from differentiating $\sqrt g$: $\dfrac{1}{\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta f) = \partial_\theta^2f + \cot\theta\,\partial_\theta f$.` },
                { answer: `${a}*(2 - 6*cos(theta)^2) + (${b})*(cos(2*theta)/sin(theta) - sin(theta))*cos(phi)`, feedback: t`The $\phi$ part needs $g^{\phi\phi} = 1/(R^2\sin^2\theta)$: it is $\dfrac{1}{\sin^2\theta}\partial_\phi^2f$, not $\partial_\phi^2f$.` },
              ],
              hints: [
                t`The metric is $\operatorname{diag}(R^2, R^2\sin^2\theta)$, so $g^{\theta\theta} = 1/R^2$ and $g^{\phi\phi} = 1/(R^2\sin^2\theta)$. Then $R^2\nabla^2f = \dfrac{1}{\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta f) + \dfrac{1}{\sin^2\theta}\partial_\phi^2f$.`,
                t`Do the two terms of $f$ separately. For $\cos^2\theta$: $\sin\theta\,\partial_\theta(\cos^2\theta) = -2\sin^2\theta\cos\theta$; differentiate again and divide by $\sin\theta$.`,
                t`For $\sin\theta\cos\phi$: the $\theta$ part gives $\cos2\theta\cos\phi/\sin\theta$ and the $\phi$ part $-\cos\phi/\sin\theta$; together, $(\cos2\theta - 1)\cos\phi/\sin\theta = -2\sin\theta\cos\phi$.`,
              ],
              teach: t`The divergence $\nabla_\mu V^\mu = \frac{1}{\sqrt g}\partial_\mu(\sqrt g\,V^\mu)$ applied to the raised gradient $V^\mu = g^{\mu\nu}\partial_\nu f$ gives the Laplacian in any coordinates, on any surface.`,
              explain: t`With $g^{\theta\theta} = 1/R^2$ and $g^{\phi\phi} = 1/(R^2\sin^2\theta)$, $$R^2\nabla^2f = \frac{1}{\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta f) + \frac{1}{\sin^2\theta}\partial_\phi^2f.$$ For $\cos^2\theta$: $\frac{1}{\sin\theta}\partial_\theta(-2\sin^2\theta\cos\theta) = -4\cos^2\theta + 2\sin^2\theta = 2 - 6\cos^2\theta$. For $\sin\theta\cos\phi$: $\frac{\cos2\theta - 1}{\sin\theta}\cos\phi = -2\sin\theta\cos\phi$. So $$R^2\nabla^2f = ${a}\,(2 - 6\cos^2\theta) ${B2 < 0 ? '-' : '+'} ${Math.abs(B2)}\sin\theta\cos\phi.$$ Check: $\sin\theta\cos\phi = x/R$ is a spherical harmonic with $\ell = 1$, and $\nabla^2Y_\ell = -\ell(\ell + 1)Y_\ell/R^2 = -2Y_1/R^2$ ✓. (SymPy agrees, term by term.)`,
              visual: {
                type: 'c3-contour',
                params: {
                  f: `${a}*sin(y)^2 + (${b})*cos(y)*cos(x)`, x: [-3.1416, 3.1416], y: [-1.5708, 1.5708], aspect: 'wide', levels: 9, labels: true, fill: true,
                  xlabel: 'longitude φ (rad)', ylabel: 'latitude (rad)', n: 110,
                },
                caption: t`The temperature anomaly over the whole planet on a longitude–latitude map, contours in kelvin (latitude is $90^\circ - \theta$). The map stretches the polar regions sideways: it is a chart, not the sphere’s own geometry, which is why the Laplacian needs the metric.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Clocks on the rim',
      story: t`Back aboard, the navigator rewrites flat spacetime in coordinates that turn with the station, $\phi = \phi_\star - \omega t$ with $\phi_\star$ fixed to the stars, so that *Halcyon* sits still in them. The result is a perfectly good metric of special relativity, with no gravity anywhere — and it already looks like the metrics of general relativity: $$ds^2 = -(c^2 - \omega^2r^2)\,dt^2 + 2\omega r^2\,dt\,d\phi + dr^2 + r^2\,d\phi^2 + dz^2.$$`,
      items: [
        num({
          id: 'r4-rim-clock', skill: 'st-a.A6.2', difficulty: 3, transfer: true,
          gen(r) {
            const R = r.pick([200, 225, 250, 300]), gf = r.pick([0.38, 0.5, 1]);
            const w = +Math.sqrt((gf * G0) / R).toPrecision(3), v = w * R, x = (v / C) ** 2;
            const per = DAY * 1e9;                                    // ns per day, per unit fractional rate
            const key = per * (x / (1 + Math.sqrt(1 - x)));          // 1 − √(1 − x), without cancellation
            return {
              prompt: t`*Halcyon*’s rim is $${R}$ m from its axis and it spins at $\omega = ${w}$ rad/s. One atomic clock sits at the hub ($r = 0$), another bolted to the rim ($r = ${R}$ m, fixed $\phi$ and $z$). Read their proper times from the line element above, with $c = 2.998\times10^{8}$ m/s, and ignore the planet’s gravity and the station’s orbit, which both clocks share. Over one day of hub time, how much less does the rim clock record, in nanoseconds?`,
              answer: key, units: 'ns', tol: { rel: 0.01 },
              errors: apart([
                { value: key / DAY, feedback: t`That is the lag per second. Multiply by the 86 400 seconds in a day.` },
                { value: per * (v / C), feedback: t`The rate depends on $(\omega R/c)^2$, not on $\omega R/c$: $d\tau = \sqrt{1 - \omega^2R^2/c^2}\,dt$.` },
              ], key),
              hints: [
                t`For a clock at rest in these coordinates, $dr = d\phi = dz = 0$, so only $g_{tt}$ survives: $-c^2d\tau^2 = ds^2 = -(c^2 - \omega^2r^2)\,dt^2$.`,
                t`The rim clock ticks at $d\tau/dt = \sqrt{1 - \omega^2R^2/c^2}$, the hub clock at $1$. The difference is about $\tfrac12\omega^2R^2/c^2$ per second; multiply by 86 400 s.`,
              ],
              teach: t`A clock’s proper time comes from the line element along its worldline, $d\tau^2 = -ds^2/c^2$: in rotating coordinates, $g_{tt} = -(c^2 - \omega^2r^2)$ slows the rim clock.`,
              explain: t`At rest in the rotating coordinates, $d\tau = \sqrt{1 - \omega^2r^2/c^2}\,dt$. The hub clock ($r = 0$) keeps coordinate time; the rim clock moves through the stars’ frame at $v = \omega R = ${tn(v)}$ m/s, so $$\Delta = \left(1 - \sqrt{1 - v^2/c^2}\right)\times86\,400\ \text{s} \approx \frac{v^2}{2c^2}\times86\,400\ \text{s} = ${tn(key)}\ \text{ns}$$ a day, about $${tn((key * 365.25) / 1000)}\ \mu\text{s}$ a year. That is the special-relativistic time dilation, read straight off a metric component — the same move as reading gravitational time dilation off the Schwarzschild metric’s $g_{tt}$. Clocks this good exist: optical clocks resolve fractional rates near $10^{-18}$.`,
              visual: (() => {
                const W = wheel({ a0: 0.35 });
                return plane({
                  x: [-1.5, 1.5], y: [-1.25, 1.3], curves: W.curves, arrows: [W.head],
                  points: [dotp(0, 0, 'accent', 6), tag(0, 0, 'hub clock', 'accent', -30, 26), dotp(Math.cos(-0.6), Math.sin(-0.6), 'gold', 6), tag(Math.cos(-0.6), Math.sin(-0.6), 'rim clock', 'gold', 10, 10),
                    tag(1.18 * Math.cos(0.85), 1.18 * Math.sin(0.85), 'ω', 'teal', 6, -4)],
                  caption: 'The two clocks on Halcyon, seen along its axis: one at the hub, one on the rim, both at rest in the turning coordinates. Not to scale.',
                });
              })(),
            };
          },
        }),
        mcq({
          id: 'r4-signature', skill: 'st-a.A6.6', difficulty: 3,
          gen(r) {
            const w = r.pick([0.15, 0.2, 0.25]), k = r.pick([1.5, 2, 3]);
            const rL = C / w / 1000, rk = k * rL;
            return {
              prompt: t`The turning coordinates can be extended far beyond the station. With $\omega = ${w}$ rad/s, $g_{tt} = -(c^2 - \omega^2r^2)$ is zero on the **light cylinder** $r = c/\omega = ${tn(rL)}$ km, where the turning grid would have to move at the speed of light, and positive beyond it. At $r = ${tn(rk)}$ km, what is the signature of the metric?`,
              choices: [
                t`Still $(-, +, +, +)$: the $(t, \phi)$ block has determinant $g_{tt}g_{\phi\phi} - g_{t\phi}^2 = -c^2r^2 < 0$, so it keeps one negative and one positive eigenvalue; only the coordinate $t$ has stopped being timelike`,
                t`$(+, +, +, +)$: with $g_{tt} > 0$ every diagonal entry is positive, so the metric has become positive definite out there`,
                t`$(-, -, +, +)$: $g_{tt}$ has turned positive, so $g_{\phi\phi}$ must turn negative to compensate`,
                t`None: the metric is degenerate on the light cylinder, and beyond it signature is not defined`,
              ],
              answer: 0,
              why: {
                1: t`The signature counts the signs of the eigenvalues, not of the diagonal entries. With the off-diagonal $g_{t\phi} = \omega r^2$, the $(t, \phi)$ block’s determinant is $-c^2r^2$: negative, so its eigenvalues have opposite signs.`,
                2: t`$g_{\phi\phi} = r^2$ is positive everywhere, and the number of minus signs comes from the determinant: $\det g = -c^2r^2$, one negative eigenvalue at every $r > 0$.`,
                3: t`$g_{tt} = 0$ does not make the metric degenerate — $\det g = -c^2r^2 \ne 0$ there. Only the vector $\partial_t$ has become null: it is the velocity of a point that turns with the grid at speed $c$.`,
              },
              hints: [t`Signature is the count of positive and negative eigenvalues, and it cannot change unless $\det g$ passes through zero.`, t`Compute the determinant of the $(t, \phi)$ block: $-(c^2 - \omega^2r^2)\,r^2 - (\omega r^2)^2$.`],
              teach: t`The signature is a property of the metric, not of a coordinate: it is fixed by the signs of $g$’s eigenvalues, so a diagonal entry changing sign, like $g_{tt}$ here, means only that a coordinate direction changed character.`,
              explain: t`$$\det\begin{pmatrix} -(c^2 - \omega^2r^2) & \omega r^2 \\ \omega r^2 & r^2 \end{pmatrix} = -c^2r^2 + \omega^2r^4 - \omega^2r^4 = -c^2r^2,$$ the same as for $-c^2dt^2 + r^2d\phi_\star^2$ — these are only new coordinates on flat spacetime. A negative $2\times2$ determinant means one eigenvalue of each sign, and with $dr^2 + dz^2$ the signature is $(-, +, +, +)$ at every radius. Beyond $r = c/\omega$ the curves of fixed $(r, \phi, z)$ would be spacelike: no observer can ride the grid there, but other worldlines remain timelike. The same thing happens inside a rotating black hole’s ergosphere, where $g_{tt} > 0$ and nothing can stay still.`,
              visual: plane({
                x: [-1.6, k + 1.6], y: [-1.3, 1.6],
                curves: [arc(0, 0, 1, 0, 2 * PI, 'bad', 2, true)],
                points: [dotp(0, 0, 'ink2', 4), tag(0, 0, 'station', 'ink2', -22, 18), dotp(k * Math.cos(0.35), k * Math.sin(0.35), 'gold', 6),
                  tag(k * Math.cos(0.35), k * Math.sin(0.35), `r = ${k} c/ω`, 'gold', -30, -12), tag(Math.cos(-0.8), Math.sin(-0.8), 'light cylinder, r = c/ω', 'bad', 8, 14)],
                caption: t`The station’s plane seen along its axis. On the dashed circle the turning grid would move at the speed of light; the gold point lies beyond it. Not to scale: the station itself is less than $10^{-3}$ of the light cylinder’s radius.`,
              }),
            };
          },
        }),
      ],
    },
    {
      title: 'The courier',
      story: t`An imagined courier ship crosses *Halcyon*’s path at a good fraction of the speed of light — far beyond any spacecraft yet built, but not forbidden by physics — while the station talks to it by laser. Work in the station’s inertial frame with $c = 1$ and $\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$.`,
      items: [
        num({
          id: 'r5-photon', skill: 'st-a.A6.4', difficulty: 3, transfer: true,
          gen(r) {
            const b = r.pick([0.3, 0.4, 0.5, 0.6]), al = r.pick([30, 40, 60, 120, 140, 150]), E = 0.8;
            const g = 1 / Math.sqrt(1 - b * b), ca = Math.cos(al * DEG), sa = Math.sin(al * DEG);
            const key = g * E * (1 - b * ca);
            return {
              prompt: t`The courier moves along the station’s $x$ axis at $\beta = ${b}$, so its four-velocity is $u^\mu = \gamma(1, ${b}, 0, 0)$. The station’s laser sends photons of energy $0.800$ eV (wavelength 1550 nm), travelling in the $xy$-plane at $${al}^\circ$ to the $x$ axis: $p^\mu = 0.800\,(1,\ \cos${al}^\circ,\ \sin${al}^\circ,\ 0)$ eV. The energy an observer measures is the scalar $E_{\text{obs}} = -p_\mu u^\mu$. What energy does the courier’s detector measure, in eV?`,
              answer: key, units: 'eV', tol: { rel: 0.005 },
              errors: apart([
                { value: g * E * (1 + b * ca), feedback: t`You summed $p^\mu u^\mu$ with both indices up. Lower one first: $p_\mu = \eta_{\mu\nu}p^\nu$ flips the sign of the time component, so $-p_\mu u^\mu = \gamma(p^0 - \beta p^x)$.` },
                { value: E * (1 - b * ca), feedback: t`The four-velocity is $\gamma(1, \beta, 0, 0)$, with $\gamma = 1/\sqrt{1 - \beta^2} = ${tn(g, 4)}$, not $(1, \beta, 0, 0)$: it must satisfy $u_\mu u^\mu = -1$.` },
                { value: (E * (1 - b * ca)) / g, feedback: t`$\gamma$ multiplies here; it does not divide. The courier’s $u^\mu = \gamma(1, \beta, 0, 0)$.` },
              ], key),
              hints: [
                t`Lower the photon’s index with $\eta$: $p_\mu = 0.800\,(-1,\ \cos${al}^\circ,\ \sin${al}^\circ,\ 0)$ eV.`,
                t`$-p_\mu u^\mu = -\gamma\,(p_0 + \beta p_x) = \gamma\,(0.800)(1 - \beta\cos${al}^\circ)$, with $\gamma = 1/\sqrt{1 - \beta^2}$.`,
              ],
              teach: t`What an observer with four-velocity $u^\mu$ measures as energy is the contraction $-p_\mu u^\mu$ — a scalar, so it can be computed in any frame — and lowering the index with $\eta$ supplies the minus sign that makes it a Doppler shift.`,
              explain: t`With $\gamma = ${tn(g, 4)}$ and $p_\mu = 0.800\,(-1, \cos${al}^\circ, \sin${al}^\circ, 0)$ eV, $$E_{\text{obs}} = -p_\mu u^\mu = \gamma\,(0.800)\,(1 - ${b}\cos${al}^\circ) = ${tn(key)}\ \text{eV}.$$ ${ca > 0 ? 'The photons chase the courier, which runs from them: they arrive redshifted, below 0.800 eV.' : 'The courier runs into the photons: they arrive blueshifted, above 0.800 eV.'} This is the relativistic Doppler shift, here with no formula to remember — one contraction, computed in the station’s frame, gives what the courier measures in its own.`,
              visual: (() => {
                const a = al * DEG, L = 1.4;
                return plane({
                  x: [-1.9, 2.6], y: [-0.6, 1.6],
                  curves: [seg([-1.7, 0], [2.4, 0], 'ink4', 1, true), arc(0, 0, 0.45, 0, a, 'gold', 1.4)],
                  arrows: [{ from: [0, 0], to: [1.6, 0], color: 'accent', width: 3, label: `courier, β = ${b}`, labelDx: -40, labelDy: 18 },
                    { from: [0, 0], to: [r4(L * Math.cos(a)), r4(L * Math.sin(a))], color: 'gold', width: 2.6, label: 'photon', labelDx: 6, labelDy: -4 }],
                  points: [dotp(0, 0, 'ink', 5), tag(0.55 * Math.cos(a / 2), 0.55 * Math.sin(a / 2), `${al}°`, 'gold', 4, 4), tag(-1.6, 0, 'x', 'ink3', 0, -8)],
                  caption: 'The directions, in the station’s frame: the courier’s velocity along x, and the laser’s photons at the given angle. Lengths mean nothing here.',
                });
              })(),
            };
          },
        }),
        order({
          id: 'r5-scalar', skill: 'st-a.A7.3', difficulty: 3,
          prompt: t`The courier’s crew compute $E_{\text{obs}} = -p_\mu u^\mu$ in their own frame; the station computes it in the station’s. To trust both, prove that $p_\mu u^\mu$ takes the same value in any coordinates $x'^\mu$. Put the steps in order.`,
          items: [
            t`Write each factor’s transformation law: $p'_\mu = \dfrac{\partial x^\alpha}{\partial x'^\mu}\,p_\alpha$ (a covector) and $u'^\mu = \dfrac{\partial x'^\mu}{\partial x^\beta}\,u^\beta$ (a vector).`,
            t`Multiply and sum over the repeated $\mu$: $p'_\mu u'^\mu = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x'^\mu}{\partial x^\beta}\,p_\alpha u^\beta$.`,
            t`Recognise the chain rule: $\dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x'^\mu}{\partial x^\beta} = \dfrac{\partial x^\alpha}{\partial x^\beta} = \delta^\alpha_\beta$.`,
            t`Let the delta rename the index: $p'_\mu u'^\mu = \delta^\alpha_\beta\,p_\alpha u^\beta = p_\alpha u^\alpha$.`,
            t`Conclude: with no free index left, $p_\mu u^\mu$ is a type $(0, 0)$ tensor — a scalar — so the courier and the station must get the same energy.`,
          ],
          hints: [t`Start from what you know about each factor separately: how its components change.`, t`The two Jacobian matrices are inverses of each other; that fact is the chain rule, and it is the heart of the proof.`],
          teach: t`Contracting an upper index with a lower one cancels a Jacobian against its inverse, so a fully contracted expression — no free indices — is a scalar, the same in every chart.`,
          explain: t`Transformation laws, product, chain rule, delta, conclusion. The proof never used the Lorentz transformation: it holds for any change of coordinates, polar, rotating or boosted. It also shows why $\sum_\mu p^\mu u^\mu$, with both indices up, is **not** a scalar: two Jacobians of the same kind do not cancel. The index diagram says it at a glance — every leg joined, nothing left loose.`,
          visual: legs([{ name: 'p' }, { name: 'u' }], { links: [{ a: 0, b: 1, index: 'μ' }],
            caption: t`$p_\mu u^\mu$ as an index diagram: the lower index of $p$ joined to the upper index of $u$. No loose legs are left: a scalar.` }),
        }),
      ],
    },
  ],
});
