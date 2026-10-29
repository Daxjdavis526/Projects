// The MATH 2250 boss, "The Combined Systems Challenge": one system, both
// halves of the course. The mirror of Halcyon, an imagined ground-based
// gravitational-wave detector, hangs from a two-stage pendulum: an upper mass
// m₁ on a wire ℓ₁ from the support, the mirror m₂ on a wire ℓ₂ below it. In
// small swings M x″ = −K x + (forcing), with K = [[k₁ + k₂, −k₂], [−k₂, k₂]],
// k₁ = (m₁ + m₂)g/ℓ₁, k₂ = m₂g/ℓ₂. Hang it: the laser's radiation pressure
// pushes the mirror aside (solve K x = F; LA-2.2) and det(K − ω²M) = 0 gives
// the modes (LA-9.2). Ring it: the lower mode's shape (an eigenvector; LA-9.1),
// a released mirror as a sum of modes (coordinates in the eigenbasis; LA-7.1),
// and the eigenvalues ±iω of the same system written first-order (DE-4.1).
// Shake and damp it: seismic isolation at 5–20 Hz by Cramer's rule on
// (K − ω²M)X = F (LA-8.3), the damping gain that puts a mode on the parabola
// τ² = 4Δ (DE-5.2) and its repeated-eigenvalue matrix exponential (DE-4.3).
// Lock it, and beyond: the radiation-pressure step through the Laplace
// transform (DE-6.3); a spin-stabilized probe's nutation as e^{At}, a rotation
// (DE-4.4); a test stand's two compartments purged in series (DE-4.2). Every
// item names the lesson whose skill it measures; every number comes from its
// generator, and the case functions are exported so a script can check the
// keys independently.
import { boss, mcq, num } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';

const t = String.raw;
const PI = Math.PI;
const G = 9.81;                                   // m/s², as the prompts quote it
const C = 299792458;                              // m/s
const r4 = (v) => +(+v).toFixed(4);
const r6 = (v) => +(+v).toPrecision(6);
const tn = (x, n = 3) => tex(x, n);
/** An integer as TeX with a thin space in thousands. */
const th = (x) => (Math.abs(x) >= 10000 ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : String(x));

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-300);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── the suspension ──────────────────────────────────────────────────────────
/** A two-stage pendulum: masses (kg), wire lengths (m), stiffnesses (N/m), and its modes. */
export function suspension(m1, m2, l1, l2) {
  const k1 = ((m1 + m2) * G) / l1, k2 = (m2 * G) / l2;
  // det(K − ω²M) = m₁m₂ω⁴ − (m₁k₂ + m₂(k₁ + k₂))ω² + k₁k₂
  const a = m1 * m2, b = m1 * k2 + m2 * (k1 + k2), c = k1 * k2, D = Math.sqrt(b * b - 4 * a * c);
  const w1 = Math.sqrt((b - D) / (2 * a)), w2 = Math.sqrt((b + D) / (2 * a));
  const ratio = (w) => k2 / (k2 - m2 * w * w);                     // x₂/x₁ in the mode at ω
  return { m1, m2, l1, l2, k1, k2, w1, w2, f1: w1 / (2 * PI), f2: w2 / (2 * PI), r1: ratio(w1), r2: ratio(w2) };
}
const pickSusp = (r) => suspension(r.pick([20, 30, 40]), 40, r.pick([0.4, 0.5, 0.6]), r.pick([0.4, 0.5, 0.6]));
/** The suspension as TeX facts for a prompt. */
const suspTeX = (S) => t`an upper mass $m_1 = ${S.m1}\ \text{kg}$ hangs from the support on a wire $\ell_1 = ${S.l1}\ \text{m}$ long, and the mirror, $m_2 = ${S.m2}\ \text{kg}$, hangs from it on a wire $\ell_2 = ${S.l2}\ \text{m}$ long`;
const eqTeX = t`$$\begin{bmatrix} m_1 & 0\\ 0 & m_2\end{bmatrix}\mathbf x'' = -\begin{bmatrix} k_1 + k_2 & -k_2\\ -k_2 & k_2\end{bmatrix}\mathbf x,\qquad k_1 = \frac{(m_1 + m_2)g}{\ell_1},\quad k_2 = \frac{m_2 g}{\ell_2},$$`;

// ── round 1: hang it ─────────────────────────────────────────────────────────
/** Radiation pressure 2P/c on the mirror: the static deflections (μm). */
export function staticCase(r) {
  const S = pickSusp(r), P = r.pick([200, 300, 400]);              // kW circulating in the arm
  const F = (2 * P * 1e3) / C;                                      // N
  return { S, P, F, x1: (F / S.k1) * 1e6, x2: (F / S.k1 + F / S.k2) * 1e6 };
}

// ── round 2: ring it ─────────────────────────────────────────────────────────
/** The mirror pushed aside by d (μm), the upper mass held at 0, both released from rest: x₂ at time T. */
export function releaseCase(r) {
  const S = pickSusp(r), d = r.pick([5, 10, 20]);
  const c1 = d / (S.r1 - S.r2), c2 = -c1;
  const x = (tt) => [c1 * Math.cos(S.w1 * tt) + c2 * Math.cos(S.w2 * tt), c1 * S.r1 * Math.cos(S.w1 * tt) + c2 * S.r2 * Math.cos(S.w2 * tt)];
  const Ts = [0.5, 0.8, 1, 1.2, 1.5, 2].filter((T) => Math.abs(x(T)[1]) > 0.2 * d);
  const T = r.pick(Ts);
  return { S, d, c1, c2, T, x, key: x(T)[1] };
}

// ── round 3: shake and damp it ───────────────────────────────────────────────
/** Ground motion X_g cos ωt at the support: the mirror's steady amplitude (fm) for X_g = 1 nm. */
export function isolationCase(r) {
  const S = pickSusp(r), f = r.pick([5, 10, 20]), w = 2 * PI * f;
  const det = (S.k1 + S.k2 - S.m1 * w * w) * (S.k2 - S.m2 * w * w) - S.k2 * S.k2;
  const X2 = (S.k1 * S.k2) / det, X1 = (S.k1 * (S.k2 - S.m2 * w * w)) / det;
  const w0 = Math.sqrt(G / (S.l1 + S.l2)), one = (w0 * w0) / (w0 * w0 - w * w);   // one pendulum of the whole length
  return { S, f, w, det, X1, X2, one, key: Math.abs(X2) * 1e6 };
}
/** The damping gain b that makes q″ + bq′ + ω²q = 0 critically damped. */
export function damperCase(r) {
  const w = r.pick([3, 5, 6]);
  return { w, crit: 2 * w, under: w, over: 4 * w, slip: w * w };
}
/** Critical damping: q(t) = e^{−ωt}((1 + ωt)q₀ + t v₀), from e^{At}. */
export function criticalCase(r) {
  const w = r.pick([2, 2.5, 4]), q0 = r.pick([5, 8, 10]), v0 = r.pick([-20, 10, 30]);
  const Ts = [0.3, 0.5, 0.8, 1].filter((T) => Math.abs(Math.exp(-w * T) * ((1 + w * T) * q0 + T * v0)) > 0.1 * q0);
  const T = r.pick(Ts);
  return { w, q0, v0, T, key: Math.exp(-w * T) * ((1 + w * T) * q0 + T * v0) };
}

// ── round 4: lock it, and beyond ─────────────────────────────────────────────
/** The arm power steps on; the mirror alone (upper mass held) is a damped pendulum: overshoot beyond its new rest (μm). */
export function stepCase(r) {
  const m2 = 40, l2 = r.pick([0.4, 0.5, 0.6]), P = r.pick([200, 300, 400]), z = r.pick([0.05, 0.1, 0.2]);
  const k = (m2 * G) / l2, F = (2 * P * 1e3) / C, xs = (F / k) * 1e6, w = Math.sqrt(k / m2), wd = w * Math.sqrt(1 - z * z);
  return { m2, l2, P, z, k, F, xs, w, wd, tp: PI / wd, key: xs * Math.exp((-z * PI) / Math.sqrt(1 - z * z)) };
}
/** A spinning axisymmetric probe: the transverse rates turn as e^{At}, a rotation by λt. */
export function nutationCase(r) {
  const ratio = r.pick([1.2, 1.4, 1.6]), rpm = r.pick([2, 3, 5]), w0 = r.pick([0.05, 0.08, 0.1]), comp = r.pick([1, 2]);
  const Om = (2 * PI * rpm) / 60, lam = (ratio - 1) * Om;
  const val = (T) => (comp === 1 ? w0 * Math.cos(lam * T) : w0 * Math.sin(lam * T));
  const Ts = [10, 15, 20, 30, 40].filter((T) => Math.abs(val(T)) > 0.15 * w0);
  const T = r.pick(Ts);
  return { ratio, rpm, w0, comp, Om, lam, T, key: val(T) };
}
/** Two compartments purged in series: the oxygen fraction (%) in the second after T. */
export function purgeCase(r) {
  const V1 = r.pick([1, 1.5, 2]), V2 = r.pick([3, 4, 5]), Q = r.pick([0.05, 0.08, 0.1]), T = r.pick([30, 45, 60]), c0 = 21;
  const a = Q / V1, b = Q / V2, A = b / (b - a);
  const c2 = c0 * (A * Math.exp(-a * T) + (1 - A) * Math.exp(-b * T));
  return { V1, V2, Q, T, c0, a, b, c1: c0 * Math.exp(-a * T), key: c2 };
}

// ── pictures ─────────────────────────────────────────────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: [5, 4] } : {}) });
const poly = (pts, color, width, dash) => pts.slice(1).map((p, k) => seg(pts[k], p, color, width, dash));
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });
const rect = (cx, cy, w, h, color, width = 2.2) => poly([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2], [cx - w / 2, cy - h / 2]], color, width);
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', xticks: 0, yticks: 0, ...params }, caption });

/**
 * The two-stage suspension, side on: support, wires, upper mass and mirror,
 * displaced to (X1, X2) (already scaled for drawing), with optional arrows,
 * ghosts at rest and labels.
 */
function suspPic({ l1 = 0.5, l2 = 0.5, X1 = 0, X2 = 0, ghost = false, arrows = [], extra = [], labels = true, caption }) {
  const y1 = -l1, y2 = -l1 - l2, h1 = 0.16, h2 = 0.2;
  const curves = [seg([-0.7, 0], [0.7, 0], 'ink2', 3), ...[-0.6, -0.3, 0, 0.3, 0.6].map((x) => seg([x, 0], [x + 0.12, 0.1], 'ink3', 1.2))];
  if (ghost && (X1 || X2)) curves.push(seg([0, 0], [0, y1], 'ink4', 1.2, true), ...rect(0, y1, 0.36, h1, 'ink4', 1.2), seg([0, y1], [0, y2], 'ink4', 1.2, true), ...rect(0, y2, 0.26, h2, 'ink4', 1.2));
  curves.push(seg([0, 0], [X1, y1 + h1 / 2], 'ink2', 1.4), ...rect(X1, y1, 0.36, h1, 'violet', 2.4), seg([X1, y1 - h1 / 2], [X2, y2 + h2 / 2], 'ink2', 1.4), ...rect(X2, y2, 0.26, h2, 'accent', 2.6));
  const points = labels ? [
    tag(X1 + 0.22, y1, 'm₁ (upper mass)', 'violet', 4, 0), tag(X2 + 0.17, y2, 'm₂ (mirror)', 'accent', 4, 0),
    tag(-0.04, y1 / 2, 'ℓ₁', 'ink2', -10, 0, 'right'), tag(X1 / 2 - 0.04, y1 + (y2 - y1) / 2, 'ℓ₂', 'ink2', -10, 0, 'right'),
    tag(-0.7, 0, 'support', 'ink3', 0, -10),
  ] : [];
  return picture({ x: [-1.3, 1.6], y: [r4(y2 - 0.25), 0.25], curves: [...curves, ...extra], arrows, points, alt: 'A mirror hanging from an upper mass, which hangs from a support: a double pendulum' }, caption);
}

export default boss({
  title: 'The Combined Systems Challenge',
  intro: t`*Halcyon* is an imagined gravitational-wave observatory, and its mirrors must hold still to a fraction of a proton’s width while the ground shakes beneath them. Each mirror hangs from a **two-stage pendulum**: an upper mass on one wire, the mirror on a second wire below it. Before the first observing run you sign off its design — and every question is one system seen through both halves of the course: matrices and eigenvectors, and the differential equations they solve. Four rounds, eleven problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Hang it',
      story: t`For small swings, call $x_1$ and $x_2$ the sideways displacements of the upper mass and the mirror. The wires’ tension pulls each mass back toward the line below its suspension point, like a spring, and Newton’s second law for the pair is one matrix equation: ${eqTeX} with $g = ${G}\ \text{m/s}^2$.`,
      items: [
        num({
          id: 'r1-static', skill: 'math2270.LA-2.2', difficulty: 3,
          gen(r) {
            const Cs = staticCase(r), { S, P, F, x1, x2 } = Cs;
            return {
              prompt: t`In Halcyon’s first design, ${suspTeX(S)}. When the arm’s laser light builds up to $P = ${P}\ \text{kW}$, its radiation pressure pushes the mirror with a steady force $F = 2P/c$. Solve $K\mathbf x = (0,\ F)$ for the new resting position. How far does the **mirror** move, in μm? Give 3 significant figures.`,
              answer: x2, units: 'um', tol: { rel: 0.005 },
              errors: apart([
                { value: x1, feedback: t`That is $x_1$, the upper mass. The mirror moves further: $x_2 = x_1 + F/k_2$.` },
                { value: (F / S.k2) * 1e6, feedback: t`That treats the upper mass as fixed. It moves too: the whole force passes up through the upper wire, so $x_1 = F/k_1$, and the mirror adds $F/k_2$ on top.` },
                { value: (F / (S.k1 + S.k2)) * 1e6, feedback: t`Adding the stiffnesses describes springs side by side. These act in series — the force passes through both — so the deflections add: $x_2 = F/k_1 + F/k_2$.` },
                { value: x2 / 2, feedback: t`Radiation pressure on a mirror that reflects the light is $2P/c$, not $P/c$: the light’s momentum is reversed.` },
              ], x2),
              hints: [
                t`Here $k_1 = ${nice(r6(S.k1))}\ \text{N/m}$ and $k_2 = ${nice(r6(S.k2))}\ \text{N/m}$, and $F = 2(${P}\times10^{3})/c = ${tn(F, 4)}$ N.`,
                t`Add the two rows of $K\mathbf x = (0, F)$: $k_1x_1 = F$. Then the second row, $-k_2x_1 + k_2x_2 = F$, gives $x_2$.`,
              ],
              teach: t`A static load on a linear structure is a linear system $K\mathbf x = \mathbf F$; for springs in series, elimination shows the deflections simply add.`,
              explain: t`$F = 2P/c = ${tn(F, 4)}$ N. Adding the rows of $$\begin{bmatrix} k_1 + k_2 & -k_2\\ -k_2 & k_2\end{bmatrix}\begin{bmatrix}x_1\\ x_2\end{bmatrix} = \begin{bmatrix}0\\ F\end{bmatrix}$$ eliminates $x_2$: $k_1x_1 = F$, so $x_1 = ${tn(x1)}\ \mu$m; the second row then gives $x_2 = x_1 + F/k_2 = ${tn(x2)}\ \mu$m. A few micrometres is enormous next to the $10^{-19}$ m the detector measures — but it is steady, and the control system simply holds the mirror there. It is the *changes* in the light’s power that matter, which the last round takes up. The pendulum’s small-angle stiffness is a linear model of wires that also stretch and bend.`,
              visual: suspPic({ l1: S.l1, l2: S.l2, X1: 0.12, X2: 0.32, ghost: true, arrows: [{ from: [-0.55, r4(-S.l1 - S.l2)], to: [0.12, r4(-S.l1 - S.l2)], color: 'bad', width: 2.6, label: 'laser push F', labelDx: -96, labelDy: 18 }], caption: 'The suspension to scale in its lengths, with the deflections greatly exaggerated: the laser’s push (red) moves both masses, the mirror further. Grey: the rest position.' }),
            };
          },
        }),
        num({
          id: 'r1-modes', skill: 'math2270.LA-9.2', difficulty: 3,
          gen(r) {
            const S = pickSusp(r);
            return {
              prompt: t`In another design, ${suspTeX(S)}. Free swings of the form $\mathbf x = \mathbf v\cos\omega t$ need $(K - \omega^2M)\mathbf v = \mathbf 0$ with $\mathbf v \ne \mathbf 0$. What is the frequency of the **higher** normal mode, in Hz? Give 3 significant figures.`,
              answer: S.f2, units: 'Hz', tol: { rel: 0.005 },
              errors: apart([
                { value: S.w2, feedback: t`That is the angular frequency $\omega$ in rad/s. In Hz, divide by $2\pi$.` },
                { value: S.f1, feedback: t`That is the lower mode, the two masses swinging together. The higher mode takes the larger root for $\omega^2$.` },
                { value: Math.sqrt(G / S.l2) / (2 * PI), feedback: t`That is the mirror swinging alone on its wire, $\sqrt{g/\ell_2}$, as if the upper mass were fixed. It is not: in the higher mode the two masses swing against each other.` },
                { value: Math.sqrt(S.k2 / S.m2 + (S.k1 + S.k2) / S.m1) / (2 * PI), feedback: t`Solve $\det(K - \omega^2M) = 0$ as a quadratic in $\omega^2$; adding the diagonal ratios is not its root.` },
              ], S.f2),
              hints: [
                t`$k_1 = ${nice(r6(S.k1))}\ \text{N/m}$ and $k_2 = ${nice(r6(S.k2))}\ \text{N/m}$. A nonzero $\mathbf v$ needs $\det(K - \omega^2M) = 0$.`,
                t`$\det\begin{bmatrix} k_1 + k_2 - m_1\omega^2 & -k_2\\ -k_2 & k_2 - m_2\omega^2\end{bmatrix} = m_1m_2\omega^4 - \big(m_1k_2 + m_2(k_1 + k_2)\big)\omega^2 + k_1k_2 = 0$ — a quadratic in $\omega^2$.`,
                t`Take the larger root for $\omega^2$, then $f = \omega/2\pi$.`,
              ],
              teach: t`Normal modes of $M\mathbf x'' = -K\mathbf x$ come from the generalized eigenvalue problem $\det(K - \omega^2M) = 0$: a characteristic polynomial in $\omega^2$.`,
              explain: t`The characteristic equation is $${th(S.m1 * S.m2)}\,\omega^4 - ${th(Math.round(S.m1 * S.k2 + S.m2 * (S.k1 + S.k2)))}\,\omega^2 + ${th(Math.round(S.k1 * S.k2))} = 0$ (rounded), with roots $\omega^2 = ${tn(S.w1 ** 2, 4)}$ and $${tn(S.w2 ** 2, 4)}\ \text{s}^{-2}$. The higher mode has $\omega = ${tn(S.w2, 4)}$ rad/s, $f = ${tn(S.f2)}$ Hz; the lower, $f = ${tn(S.f1)}$ Hz. Both lie far below the 10 Hz to kHz band where the detector listens — the whole point, as the isolation problem shows. Real suspensions (LIGO’s have four stages) add more modes, all kept below a few hertz.`,
              visual: suspPic({ l1: S.l1, l2: S.l2, caption: 'The two-stage suspension at rest, lengths to scale. The masses swing sideways, in the plane of the page.' }),
            };
          },
        }),
      ],
    },
    {
      title: 'Ring it',
      story: t`A pendulum with two masses has two **normal modes**, each an eigenvector of the problem $K\mathbf v = \omega^2M\mathbf v$: in one the masses swing together, in the other against each other. Any free motion is a sum of the two, each ringing at its own frequency.`,
      items: [
        num({
          id: 'r2-shape', skill: 'math2270.LA-9.1', difficulty: 3,
          gen(r) {
            const S = pickSusp(r);
            return {
              prompt: t`For the suspension in which ${suspTeX(S)}, the lower mode has $\omega_1^2 = ${tn(S.w1 ** 2, 5)}\ \text{s}^{-2}$. Find its eigenvector $\mathbf v = (1,\ v_2)$ of $(K - \omega_1^2M)\mathbf v = \mathbf 0$: in this mode, how many times as far as the upper mass does the mirror swing? Give 3 significant figures.`,
              answer: S.r1, tol: { rel: 0.005 },
              errors: apart([
                { value: S.r2, feedback: t`That is the higher mode’s shape, where the mirror swings opposite the upper mass. Use $\omega_1^2 = ${tn(S.w1 ** 2, 5)}\ \text{s}^{-2}$.` },
                { value: 1 / S.r1, feedback: t`That is $x_1/x_2$, upside down. The question asks for the mirror’s swing per unit of the upper mass’s.` },
                { value: S.k2 / (S.k2 - S.m2 * S.w1), feedback: t`The matrix is $K - \omega^2M$: use $\omega_1^2 = ${tn(S.w1 ** 2, 5)}\ \text{s}^{-2}$, not $\omega_1$.` },
                { value: S.k2 / (S.k2 + S.m2 * S.w1 ** 2), feedback: t`Check the sign: $K - \omega^2M$ has $k_2 - m_2\omega^2$ on its diagonal, so $v_2 = k_2/(k_2 - m_2\omega_1^2)$.` },
              ], S.r1),
              hints: [
                t`$k_2 = ${nice(r6(S.k2))}\ \text{N/m}$. Either row of $(K - \omega_1^2M)\mathbf v = \mathbf 0$ will do, since the matrix is singular at an eigenvalue.`,
                t`The second row: $-k_2\cdot 1 + (k_2 - m_2\omega_1^2)\,v_2 = 0$, so $v_2 = \dfrac{k_2}{k_2 - m_2\omega_1^2}$.`,
              ],
              teach: t`An eigenvector is found from the null space of $K - \omega^2M$ at an eigenvalue: the rows are dependent there, so one row fixes the ratio of the components.`,
              explain: t`From the second row, $v_2 = \dfrac{k_2}{k_2 - m_2\omega_1^2} = \dfrac{${nice(r6(S.k2))}}{${nice(r6(S.k2))} - ${S.m2}\times${tn(S.w1 ** 2, 5)}} = ${tn(S.r1)}$: the two swing together, the mirror ${tn(S.r1)} times as far. (The first row gives the same ratio — a check that $\omega_1^2$ is an eigenvalue.) The higher mode has $v_2 = ${tn(S.r2)}$: the masses swing against each other, the upper one further. The two shapes are not perpendicular as ordinary vectors; they are orthogonal with the masses as weights, $\mathbf v_1^{\mathsf T}M\mathbf v_2 = 0$, because $K$ and $M$ are symmetric.`,
              visual: suspPic({ l1: S.l1, l2: S.l2, X1: 0.12, X2: r4(0.12 * Math.min(S.r1, 3)), ghost: true, labels: true, caption: 'The lower mode drawn with a made-up amplitude: both masses on the same side, the mirror further out. Grey: the rest position. The drawing’s ratio is schematic, not the answer.' }),
            };
          },
        }),
        num({
          id: 'r2-release', skill: 'math2270.LA-7.1', difficulty: 4,
          gen(r) {
            const Cs = releaseCase(r), { S, d, c1, c2, T, key } = Cs;
            return {
              prompt: t`For the suspension in which ${suspTeX(S)}, the modes are $$\omega_1 = ${tn(S.w1, 5)}\ \text{rad/s},\ \mathbf v_1 = \begin{bmatrix}1\\ ${tn(S.r1, 5)}\end{bmatrix};\qquad \omega_2 = ${tn(S.w2, 5)}\ \text{rad/s},\ \mathbf v_2 = \begin{bmatrix}1\\ ${tn(S.r2, 5)}\end{bmatrix}.$$ Actuators hold the upper mass at $x_1 = 0$ and push the mirror to $x_2 = ${d}\ \mu\text{m}$, then let both go from rest. Where is the mirror at $t = ${T}$ s, in μm (with its sign)? Give 3 significant figures.`,
              answer: key, units: 'um', tol: { rel: 0.005 },
              errors: apart([
                { value: d * Math.cos(S.w1 * T), feedback: t`That lets the mirror ring in the lower mode alone. The starting shape $(0, ${d})$ is not a mode: write it as $c_1\mathbf v_1 + c_2\mathbf v_2$ — both modes ring.` },
                { value: d * Math.cos(S.w2 * T), feedback: t`That lets the mirror ring in the higher mode alone. Split the starting shape into both modes first.` },
                { value: c1 * Math.cos(S.w1 * T) + c2 * Math.cos(S.w2 * T), feedback: t`That is $x_1$, the upper mass. The mirror’s position is the second component, $c_1v_{1,2}\cos\omega_1t + c_2v_{2,2}\cos\omega_2t$.` },
                { value: c1 * S.r1 * Math.cos((S.w1 * T * PI) / 180) + c2 * S.r2 * Math.cos((S.w2 * T * PI) / 180), feedback: t`Your calculator is in degrees: $\omega t$ is in radians.` },
              ], key),
              hints: [
                t`Each mode alone moves as $\mathbf v_i\cos\omega_it$ from rest. So $\mathbf x(t) = c_1\mathbf v_1\cos\omega_1t + c_2\mathbf v_2\cos\omega_2t$, with $c_1\mathbf v_1 + c_2\mathbf v_2 = (0,\ ${d})$.`,
                t`The first components give $c_1 + c_2 = 0$, the second $c_1v_{1,2} + c_2v_{2,2} = ${d}$; so $c_1 = ${d}/(v_{1,2} - v_{2,2})$ and $c_2 = -c_1$.`,
                t`Then $x_2(${T}) = c_1v_{1,2}\cos(\omega_1\cdot${T}) + c_2v_{2,2}\cos(\omega_2\cdot${T})$, in radians.`,
              ],
              teach: t`To solve $M\mathbf x'' = -K\mathbf x$ from any start, find the start’s coordinates in the basis of mode shapes; then each coordinate rings on its own at its mode’s frequency.`,
              explain: t`In the eigenvector basis the start is $(0, ${d}) = c_1\mathbf v_1 + c_2\mathbf v_2$ with $c_1 = ${tn(c1, 4)}$ and $c_2 = ${tn(c2, 4)}\ \mu$m. Each part rings at its own frequency: $$x_2(t) = ${tn(c1 * S.r1, 4)}\cos(${tn(S.w1, 4)}\,t) ${c2 * S.r2 < 0 ? '-' : '+'} ${tn(Math.abs(c2 * S.r2), 4)}\cos(${tn(S.w2, 4)}\,t)\ \mu\text{m},$$ and at $t = ${T}$ s, $x_2 = ${tn(key)}\ \mu$m. Because the frequencies are not in a whole-number ratio, the motion never repeats exactly — and with no damping it would never stop, which is why the next round adds damping. Real wires and their clamps dissipate a little, so the modes ring down over minutes.`,
              visual: suspPic({ l1: S.l1, l2: S.l2, X1: 0, X2: 0.3, ghost: true, arrows: [{ from: [0.62, r4(-S.l1 - S.l2)], to: [0.24, r4(-S.l1 - S.l2)], color: 'gold', width: 2.2, label: 'released', labelDx: 8, labelDy: -10 }], caption: 'The starting state, the displacement exaggerated: the upper mass held at rest, the mirror pushed aside. Grey: the rest position.' }),
            };
          },
        }),
        mcq({
          id: 'r2-first-order', skill: 'math2280.DE-4.1', difficulty: 3,
          gen(r) {
            const S = pickSusp(r);
            const a = tn(S.w1, 3), b = tn(S.w2, 3), a2 = tn(S.w1 ** 2, 3), b2 = tn(S.w2 ** 2, 3);
            return {
              prompt: t`A control engineer rewrites the suspension in which ${suspTeX(S)} as a first-order system $\mathbf y' = A\mathbf y$ with $\mathbf y = (x_1, x_2, x_1', x_2')$ and $$A = \begin{bmatrix} 0 & I\\ -M^{-1}K & 0\end{bmatrix}.$$ The normal modes have $\omega_1 = ${a}$ and $\omega_2 = ${b}$ rad/s. What are the four eigenvalues of $A$, in $\text{s}^{-1}$?`,
              choices: [t`$\pm${a}\,i$ and $\pm${b}\,i$`, t`$${a2}$ and $${b2}$, each twice`, t`$-${a2}$ and $-${b2}$, each twice`, t`$\pm${a}$ and $\pm${b}$, all real`],
              answer: 0,
              why: {
                1: t`Those are the eigenvalues of $M^{-1}K$, which are $\omega^2$. For the first-order system, $\lambda^2$ must equal $-\omega^2$: try $\mathbf y = \mathbf w e^{\lambda t}$ and the lower block gives $\lambda^2\mathbf v = -M^{-1}K\mathbf v$.`,
                2: t`That gets $\lambda^2 = -\omega^2$ right but stops halfway: the eigenvalues are $\lambda$, the square roots of $-\omega^2$, not $\lambda^2$ itself.`,
                3: t`Real eigenvalues of opposite signs make a saddle: one grows without bound. An undamped pendulum swings — its eigenvalues are imaginary, $\pm i\omega$, and $e^{\pm i\omega t}$ combine into $\cos\omega t$ and $\sin\omega t$.`,
              },
              hints: [
                t`Try $\mathbf y = (\mathbf v,\ \lambda\mathbf v)e^{\lambda t}$. The top block of $A$ is automatic; the bottom block says $\lambda^2\mathbf v = -M^{-1}K\mathbf v$.`,
                t`$M^{-1}K\mathbf v = \omega^2\mathbf v$ for a mode, so $\lambda^2 = -\omega^2$: two values of $\lambda$ for each mode.`,
              ],
              teach: t`A second-order system $M\mathbf x'' = -K\mathbf x$ written first-order has eigenvalues $\lambda = \pm i\omega$ for each mode: imaginary eigenvalues are oscillation, and their imaginary parts are the angular frequencies.`,
              explain: t`With $\mathbf y = (\mathbf v, \lambda\mathbf v)e^{\lambda t}$, $A\mathbf y = \lambda\mathbf y$ reduces to $-M^{-1}K\mathbf v = \lambda^2\mathbf v$. Each mode has $M^{-1}K\mathbf v = \omega^2\mathbf v$, so $\lambda = \pm i\omega$: $\pm${a}\,i$ and $\pm${b}\,i\ \text{s}^{-1}$. Both halves of the course meet here: the eigenvalues of the first-order system are the normal-mode frequencies, and on the trace–determinant map each mode is a **centre** — trace 0, determinant $\omega^2$. Damping, next round, moves them into the left half-plane.`,
              visual: suspPic({ l1: S.l1, l2: S.l2, X1: 0.14, X2: 0.24, ghost: true, caption: 'The suspension, swinging (exaggerated). Four numbers fix its state at any instant: two positions and two velocities.' }),
            };
          },
        }),
      ],
    },
    {
      title: 'Shake and damp it',
      story: t`The ground under Halcyon is never still: the ocean’s waves and passing trucks shake the support. The pendulum must filter that shaking out above a few hertz — and its own swinging, which the filter cannot remove, must be damped.`,
      items: [
        num({
          id: 'r3-isolation', skill: 'math2270.LA-8.3', difficulty: 4,
          gen(r) {
            const Cs = isolationCase(r), { S, f, w, det, X1, X2, one, key } = Cs;
            const curve = (tag2) => {
              const om = '(2*pi*10^x)';
              const D = `((${r6(S.k1 + S.k2)} - ${S.m1}*${om}^2)*(${r6(S.k2)} - ${S.m2}*${om}^2) - ${r6(S.k2 * S.k2)})`;
              return tag2 === 'two'
                ? { fn: `log10(max(abs(${r6(S.k1 * S.k2)}/${D}), 1e-9))`, color: 'accent', width: 2.4, label: 'two stages', labelAt: 0.75, labelDx: 6, labelDy: 10 }
                : { fn: `log10(max(abs(${r6(G / (S.l1 + S.l2))}/(${r6(G / (S.l1 + S.l2))} - ${om}^2)), 1e-9))`, color: 'ink3', width: 1.8, dash: [6, 4], label: 'one pendulum', labelAt: 1.1, labelDx: 6, labelDy: -8 };
            };
            return {
              prompt: t`The support of the suspension in which ${suspTeX(S)} shakes sideways as $x_g = X_g\cos\omega t$ with $X_g = 1$ nm at $f = ${f}$ Hz. The ground pulls on the upper mass through its wire, so $$M\mathbf x'' = -K\mathbf x + \begin{bmatrix}k_1x_g\\ 0\end{bmatrix}.$$ Trying $\mathbf x = \mathbf X\cos\omega t$ turns this into a linear system, $(K - \omega^2M)\mathbf X = (k_1X_g,\ 0)$. Solve it (Cramer’s rule is quickest): how large is the mirror’s steady swing $|X_2|$, in femtometres? Give 3 significant figures.`,
              answer: key, units: 'fm', tol: { rel: 0.005 },
              errors: apart([
                { value: Math.abs(X1) * 1e6, feedback: t`That is $|X_1|$, the upper mass. Cramer’s rule for the second unknown replaces the second column: $X_2 = k_1k_2X_g/\det(K - \omega^2M)$.` },
                { value: Math.abs(one) * 1e6, feedback: t`That is a single pendulum of the whole length $\ell_1 + \ell_2$, whose response falls only as $1/f^2$. Two stages filter twice, and the response falls as $1/f^4$.` },
                { value: (Math.abs(X2) / S.k1) * 1e6, feedback: t`The right-hand side is $k_1X_g$, not $X_g$: the ground acts through the upper wire’s stiffness.` },
                { value: Math.abs((S.k1 * S.k2) / ((S.k1 + S.k2 + S.m1 * w * w) * (S.k2 + S.m2 * w * w) - S.k2 * S.k2)) * 1e6, feedback: t`Check the signs: trying $\cos\omega t$ makes $\mathbf x'' = -\omega^2\mathbf x$, so the matrix is $K - \omega^2M$, not $K + \omega^2M$.` },
              ], key),
              hints: [
                t`$k_1 = ${nice(r6(S.k1))}$, $k_2 = ${nice(r6(S.k2))}$ N/m, and $\omega = 2\pi(${f}) = ${tn(w, 4)}$ rad/s.`,
                t`Cramer: $X_2 = \dfrac{\det\begin{bmatrix} k_1 + k_2 - m_1\omega^2 & k_1X_g\\ -k_2 & 0\end{bmatrix}}{\det(K - \omega^2M)} = \dfrac{k_1k_2X_g}{(k_1 + k_2 - m_1\omega^2)(k_2 - m_2\omega^2) - k_2^2}$.`,
                t`Work in metres and convert: $1\ \text{nm} = 10^{6}\ \text{fm}$.`,
              ],
              teach: t`A sinusoidal drive turns $M\mathbf x'' = -K\mathbf x + \mathbf F\cos\omega t$ into the linear system $(K - \omega^2M)\mathbf X = \mathbf F$; well above the resonances its determinant grows like $\omega^4$, which is the isolation.`,
              explain: t`$\det(K - \omega^2M) = ${tn(det, 4)}\ \text{N}^2/\text{m}^2$, and Cramer’s rule gives $$X_2 = \frac{k_1k_2X_g}{\det(K - \omega^2M)} = \frac{${tn(S.k1 * S.k2, 4)}}{${tn(det, 4)}}\times 1\ \text{nm} = ${tn(X2 * 1e6, 4)}\ \text{fm}.$$ The mirror moves $${tn(key)}$ fm — about $${tn(1 / Math.abs(X2), 3)}$ times less than the ground. Far above both resonances $\det \approx m_1m_2\omega^4$, so each doubling of frequency buys a factor of 16; one pendulum of the same length would give only $${tn(Math.abs(one) * 1e6, 3)}$ fm. That $1/f^4$ fall is why detectors stack stages: LIGO’s quadruple pendulums, on top of active seismic platforms, reach the $10^{-19}$ m level at 10 Hz and above. Undamped and rigid-wire: a teaching model.`,
              visual: {
                type: 'graph',
                params: {
                  x: [-1, 1.6], y: [-7, 2], xlog: true, ylog: true, axesAt: 'edge', xlabel: 'shaking frequency (Hz)', ylabel: 'mirror swing / ground swing', yticks: 0, aspect: 'wide',
                  curves: [curve('one'), curve('two')],
                  vlines: [{ x: r4(Math.log10(f)), label: `${f} Hz`, color: 'gold' }],
                },
                caption: t`How much of the ground’s shaking reaches the mirror, against frequency, on logarithmic axes with the vertical numbers left off: two stages (blue) against one pendulum of the same total length (grey, dashed). The spikes are the resonances, where an undamped model goes to infinity.`,
              },
            };
          },
        }),
        mcq({
          id: 'r3-damper', skill: 'math2280.DE-5.2', difficulty: 3,
          gen(r) {
            const D = damperCase(r), { w, crit, under, over, slip } = D;
            const W2 = w * w;
            return {
              prompt: t`A magnet on the upper mass moving past a copper plate damps one mode. In that mode’s own coordinate $q$, $$q'' + b\,q' + ${W2}\,q = 0,\qquad\text{that is}\qquad \begin{bmatrix}q\\ q'\end{bmatrix}' = \begin{bmatrix} 0 & 1\\ -${W2} & -b\end{bmatrix}\begin{bmatrix}q\\ q'\end{bmatrix},$$ where the gain $b$ (in $\text{s}^{-1}$) is set by the magnet’s strength. Which $b$ brings a disturbed mode back to rest **fastest without overshooting**?`,
              choices: [t`$b = ${crit}$`, t`$b = ${under}$`, t`$b = ${over}$`, t`$b = ${slip}$`],
              answer: 0,
              why: {
                1: t`With $b = ${under}$, $\tau^2 - 4\Delta = ${under * under} - ${4 * W2} < 0$: complex eigenvalues, a stable **spiral** — the mode overshoots and rings down.`,
                2: t`With $b = ${over}$ the eigenvalues are real, $\lambda = \tfrac12\big(-${over} \pm \sqrt{${over * over} - ${4 * W2}}\big)$, but the slower one, $${tn((-over + Math.sqrt(over * over - 4 * W2)) / 2, 3)}\ \text{s}^{-1}$, is closer to zero than $-${w}$: an overdamped node creeps back.`,
                3: t`$b = ${slip}$ is $\omega^2$, a unit slip ($b$ is in $\text{s}^{-1}$, $\omega^2$ in $\text{s}^{-2}$). It overdamps: the slower eigenvalue is $${tn((-slip + Math.sqrt(slip * slip - 4 * W2)) / 2, 3)}\ \text{s}^{-1}$.`,
              },
              hints: [
                t`For this matrix $\tau = -b$ and $\Delta = ${W2}$. No overshoot needs real eigenvalues: $\tau^2 \ge 4\Delta$.`,
                t`The decay is set by the eigenvalue closest to zero. On the parabola $\tau^2 = 4\Delta$ both eigenvalues equal $\tau/2$; beyond it one of them moves toward zero.`,
              ],
              teach: t`On the trace–determinant map, critical damping is the parabola $\tau^2 = 4\Delta$: the fastest return without overshoot, with a repeated eigenvalue.`,
              explain: t`$\Delta = ${W2}$ is fixed by the mode’s stiffness; $b$ slides the point along $\tau = -b$. Real eigenvalues need $b^2 \ge 4\Delta = ${4 * W2}$, so $b \ge ${crit}$. At $b = ${crit}$ the point sits on the parabola $\tau^2 = 4\Delta$: a repeated eigenvalue $\lambda = -${w}\ \text{s}^{-1}$, a **degenerate node** — **critical damping**. Less damping spirals; more makes one eigenvalue creep toward zero, which slows the return. Real suspensions are damped more gently than this, because a damper also adds noise in the detector’s band.`,
              visual: {
                type: 'de-tracedet',
                params: { tau: -crit, Delta: W2, drag: false, marker: false, labels: false, readout: false, panels: 'map', map: { tau: [-(over + 2), 4], Delta: [-6, r4(W2 * 1.6)] } },
                caption: t`The trace–determinant map with its region names left off: below the axis, saddles; above, the parabola $\tau^2 = 4\Delta$ separates spirals (inside) from nodes (outside). The damper moves the mode along a horizontal line at $\Delta = ${W2}$.`,
              },
            };
          },
        }),
        num({
          id: 'r3-critical', skill: 'math2280.DE-4.3', difficulty: 4,
          gen(r) {
            const Cs = criticalCase(r), { w, q0, v0, T, key } = Cs;
            const W2 = w * w, b = 2 * w;
            return {
              prompt: t`With the damper set for critical damping, a mode obeys $\mathbf y' = A\mathbf y$ with $$A = \begin{bmatrix} 0 & 1\\ -${nice(W2)} & -${nice(b)}\end{bmatrix},\qquad \mathbf y = \begin{bmatrix} q\\ q'\end{bmatrix},$$ whose only eigenvalue is $\lambda = -${nice(w)}\ \text{s}^{-1}$, repeated. A gust of wind on the building leaves the mode at $q = ${q0}\ \mu\text{m}$ moving at $q' = ${v0}\ \mu\text{m/s}$. Use $e^{At}$ to find $q$ at $t = ${T}$ s, in μm. Give 3 significant figures.`,
              answer: key, units: 'um', tol: { rel: 0.005 },
              errors: apart([
                { value: q0 * Math.exp(-w * T), feedback: t`That is $e^{\lambda t}q_0$ alone. With a repeated eigenvalue and only one eigenvector, $e^{At} = e^{\lambda t}\big(I + (A - \lambda I)t\big)$: the extra term matters.` },
                { value: Math.exp(-w * T) * (1 + w * T) * q0, feedback: t`That leaves out the starting velocity. The first row of $e^{At}$ is $e^{\lambda t}\big(1 + ${nice(w)}t,\ t\big)$: it multiplies $q_0$ and $q'_0$.` },
                { value: Math.exp(-w * T) * ((1 - w * T) * q0 + T * v0), feedback: t`$A - \lambda I = A + ${nice(w)}I$ has $+${nice(w)}$ in its top-left entry, so the first row of $e^{At}$ starts $1 + ${nice(w)}t$.` },
                { value: Math.exp(-2 * w * T) * ((1 + w * T) * q0 + T * v0), feedback: t`The eigenvalue is $\lambda = \tau/2 = -${nice(w)}$, not $\tau = -${nice(b)}$.` },
              ], key),
              hints: [
                t`Here $(A - \lambda I)^2 = 0$, so the series for $e^{(A - \lambda I)t}$ stops after two terms: $e^{At} = e^{\lambda t}\big(I + (A - \lambda I)t\big)$.`,
                t`$A - \lambda I = \begin{bmatrix} ${nice(w)} & 1\\ -${nice(W2)} & -${nice(w)}\end{bmatrix}$, so the first row of $e^{At}$ is $e^{-${nice(w)}t}\big(1 + ${nice(w)}t,\ t\big)$.`,
              ],
              teach: t`When an eigenvalue repeats with only one eigenvector, $e^{At} = e^{\lambda t}\big(I + (A - \lambda I)t\big)$: the factor $t$ is the signature of critical damping.`,
              explain: t`$(A + ${nice(w)}I)^2 = 0$, so $$e^{At} = e^{-${nice(w)}t}\begin{bmatrix} 1 + ${nice(w)}t & t\\ -${nice(W2)}t & 1 - ${nice(w)}t\end{bmatrix},$$ and $q(${T}) = e^{-${nice(r6(w * T))}}\big(${nice(r6(1 + w * T))}\times${q0} + ${T}\times(${v0})\big) = ${tn(key)}\ \mu$m. The polynomial factor $(1 + \omega t)$ is what a repeated eigenvalue adds to the exponential — the same $te^{\lambda t}$ that appears for a repeated root of a characteristic equation. A one-mode teaching model.`,
              visual: {
                type: 'de-plane',
                params: { matrix: [[0, 1], [-W2, -b]], x: [-12, 12], y: [-40, 40], equal: false, aspect: 'wide', xlabel: 'q (μm)', ylabel: 'q′ (μm/s)', eigen: true, readout: false, grid: 15, seeds: [[10, 0], [-10, 0], [0, 35], [0, -35]], T: 6, click: false },
                caption: t`The damped mode’s phase plane: one eigenvector line (dashed) and trajectories that slide in along it without circling — a degenerate node. Arrows show direction only.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Lock it, and beyond',
      story: t`The design is approved, the arms are locked and the light builds up. The same mathematics follows the review team home: to a spinning space probe and to a rocket engine’s test stand.`,
      items: [
        num({
          id: 'r4-step', skill: 'math2280.DE-6.3', difficulty: 3,
          gen(r) {
            const Cs = stepCase(r), { m2, l2, P, z, k, F, xs, w, wd, tp, key } = Cs;
            const s = z * w;
            return {
              prompt: t`At lock the upper mass is held by its controls, so the mirror swings as a single damped pendulum, $$m_2x'' + c\,x' + k x = F\,u(t),\qquad k = \frac{m_2g}{\ell_2},$$ with $m_2 = ${m2}\ \text{kg}$, $\ell_2 = ${l2}\ \text{m}$ and damping ratio $\zeta = c/(2\sqrt{km_2}) = ${z}$. The arm power steps from 0 to $${P}\ \text{kW}$ at $t = 0$, so $F = 2P/c_{\text{light}}$ switches on as a step $u(t)$. Starting from rest at $x = 0$, the mirror swings past its new resting position $F/k$ before settling. By how much does it overshoot at its first peak, in μm? Give 3 significant figures.`,
              answer: key, units: 'um', tol: { rel: 0.005 },
              errors: apart([
                { value: xs + key, feedback: t`That is the peak position itself, $F/k$ plus the overshoot. The question asks how far past $F/k$ it swings.` },
                { value: xs, feedback: t`With no damping the overshoot would equal $F/k$; with $\zeta = ${z}$ it is reduced by $e^{-\zeta\pi/\sqrt{1 - \zeta^2}}$.` },
                { value: xs * Math.exp(-z * PI), feedback: t`The first peak comes at $t = \pi/\omega_d$ with $\omega_d = \omega\sqrt{1 - \zeta^2}$, so the decay factor is $e^{-\zeta\omega\pi/\omega_d} = e^{-\zeta\pi/\sqrt{1 - \zeta^2}}$.` },
                { value: key / 2, feedback: t`Radiation pressure on a reflecting mirror is $2P/c$: the light’s momentum is reversed.` },
              ], key),
              hints: [
                t`Transform: $X(s) = \dfrac{F/m_2}{s\,(s^2 + 2\zeta\omega s + \omega^2)}$ with $\omega^2 = k/m_2$. Its inverse is $\dfrac{F}{k}\Big[1 - e^{-\zeta\omega t}\Big(\cos\omega_dt + \dfrac{\zeta\omega}{\omega_d}\sin\omega_dt\Big)\Big]$, $\omega_d = \omega\sqrt{1 - \zeta^2}$.`,
                t`The first peak is where $x' = 0$, at $t = \pi/\omega_d$. There the bracket is $1 + e^{-\zeta\pi/\sqrt{1 - \zeta^2}}$.`,
                t`$F/k = 2P\ell_2/(c\,m_2g)$; the overshoot is $(F/k)\,e^{-\zeta\pi/\sqrt{1 - \zeta^2}}$.`,
              ],
              teach: t`The Laplace transform turns a step-forced oscillator into algebra; the inverse shows an underdamped system overshooting its new equilibrium by the factor $e^{-\zeta\pi/\sqrt{1 - \zeta^2}}$.`,
              explain: t`$k = ${tn(k, 4)}$ N/m and $F = ${tn(F, 4)}$ N, so the new rest is $F/k = ${tn(xs, 4)}\ \mu$m. Inverting $X(s) = \dfrac{F/m_2}{s(s^2 + 2\zeta\omega s + \omega^2)}$ gives the step response; it first peaks at $t = \pi/\omega_d = ${tn(tp, 3)}$ s, where it overshoots by $$\frac Fk\,e^{-\zeta\pi/\sqrt{1 - \zeta^2}} = ${tn(xs, 4)}\times${tn(Math.exp((-z * PI) / Math.sqrt(1 - z * z)), 4)} = ${tn(key)}\ \mu\text{m}.$$ Real lock acquisition ramps the power and lets the controls push back, precisely to avoid kicking the mirror like this. One mode, a sharp step: a teaching model.`,
              visual: {
                type: 'de-poles',
                params: { poles: [{ re: r4(-s), im: r4(wd) }], drag: false, readout: false, panels: ['s'], response: 'step', T: r4(4 * tp), window: { re: [-r4(Math.max(3 * s, 1)), r4(Math.max(s, 0.5))], im: [-r4(wd * 1.3), r4(wd * 1.3)] }, labels: true },
                caption: t`The pendulum’s two poles, $-\zeta\omega \pm i\omega_d$, just left of the imaginary axis: a lightly damped mode that overshoots and rings. The step response is not drawn.`,
              },
            };
          },
        }),
        num({
          id: 'r4-nutation', skill: 'math2280.DE-4.4', difficulty: 3, transfer: true,
          gen(r) {
            const Cs = nutationCase(r), { ratio, rpm, w0, comp, Om, lam, T, key } = Cs;
            const which = comp === 1 ? t`\omega_1` : t`\omega_2`;
            const deg = (lam * T * 180) / PI;
            return {
              prompt: t`A spin-stabilized probe — as Juno is, on its way to Jupiter — spins at $\Omega = ${rpm}$ rpm about its symmetry axis, with moment of inertia $I_3 = ${ratio}\,I$ about that axis and $I$ about any axis across it. A thruster pulse leaves a small sideways rotation rate $\omega_1 = ${w0}$ °/s, $\omega_2 = 0$. With no torque, Euler’s equations give $$\begin{bmatrix}\omega_1\\ \omega_2\end{bmatrix}' = \begin{bmatrix} 0 & -\lambda\\ \lambda & 0\end{bmatrix}\begin{bmatrix}\omega_1\\ \omega_2\end{bmatrix},\qquad \lambda = \frac{I_3 - I}{I}\,\Omega.$$ What is $${which}$ after $t = ${T}$ s, in °/s (with its sign)? Give 3 significant figures.`,
              answer: key, units: 'deg/s', tol: { rel: 0.005 },
              errors: apart([
                { value: comp === 1 ? w0 * Math.sin(lam * T) : w0 * Math.cos(lam * T), feedback: t`That is the other component. $e^{At}$ is a rotation, $\begin{bmatrix}\cos\lambda t & -\sin\lambda t\\ \sin\lambda t & \cos\lambda t\end{bmatrix}$; apply it to $(${w0}, 0)$.` },
                { value: comp === 1 ? w0 * Math.cos(Om * T) : w0 * Math.sin(Om * T), feedback: t`The sideways rate turns at $\lambda = (I_3 - I)\Omega/I$, not at the spin rate $\Omega$ itself.` },
                { value: comp === 1 ? w0 * Math.cos(ratio * Om * T) : w0 * Math.sin(ratio * Om * T), feedback: t`$\lambda = \dfrac{I_3 - I}{I}\Omega = ${r6(ratio - 1)}\,\Omega$, not $\dfrac{I_3}{I}\Omega$.` },
                { value: comp === 1 ? w0 * Math.cos((lam * T * PI) / 180) : w0 * Math.sin((lam * T * PI) / 180), feedback: t`Your calculator is in degrees: $\lambda t$ is in radians.` },
              ], key),
              hints: [
                t`$\Omega = ${rpm}\ \text{rpm} = 2\pi(${rpm})/60\ \text{rad/s}$, so $\lambda = ${r6(ratio - 1)}\,\Omega = ${tn(lam, 4)}\ \text{rad/s}$.`,
                t`$A$ has eigenvalues $\pm i\lambda$, and $e^{At} = \begin{bmatrix}\cos\lambda t & -\sin\lambda t\\ \sin\lambda t & \cos\lambda t\end{bmatrix}$ — check that its derivative at $t = 0$ is $A$.`,
              ],
              teach: t`For $A = \begin{bmatrix}0 & -\lambda\\ \lambda & 0\end{bmatrix}$ the eigenvalues are $\pm i\lambda$ and $e^{At}$ is a rotation by $\lambda t$: a centre, the sideways rate circling at constant size.`,
              explain: t`$\lambda = ${r6(ratio - 1)}\times${tn(Om, 4)} = ${tn(lam, 4)}$ rad/s, so after $${T}$ s the sideways rate vector has turned through $\lambda t = ${tn(lam * T, 4)}$ rad ($${tn(deg, 3)}^\circ$): $${which} = ${w0}\,${comp === 1 ? t`\cos` : t`\sin`}(${tn(lam * T, 4)}) = ${tn(key)}$ °/s. Its size never changes — the spin axis cones about the fixed angular momentum (nutation) — which is why spinning probes carry dampers to dissipate it. For a spin about the axis of largest moment, $I_3 > I$, energy loss shrinks the nutation; about the axis of least moment it grows (Explorer 1 tumbled this way in 1958). Rigid body, no torques: a teaching model.`,
              visual: {
                type: 'graph',
                params: {
                  x: [r4(-1.5 * w0), r4(1.5 * w0)], y: [r4(-1.25 * w0), r4(1.25 * w0)], equal: true, aspect: 'wide', xlabel: 'ω₁ (°/s)', ylabel: 'ω₂ (°/s)', xticks: 4, yticks: 4,
                  curves: [{ param: [`${w0}*cos(t)`, `${w0}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: [5, 4] }],
                  arrows: [{ from: [0, 0], to: [w0, 0], color: 'gold', width: 2.6, label: 'start', labelDx: 6, labelDy: 14 }, { from: [r4(w0 * Math.cos(0.5)), r4(w0 * Math.sin(0.5))], to: [r4(w0 * Math.cos(0.8)), r4(w0 * Math.sin(0.8))], color: 'accent', width: 2.2 }],
                },
                caption: t`The sideways rate $(\omega_1, \omega_2)$ starts on the $\omega_1$ axis (gold) and circles the dashed path at the rate $\lambda$ in the sense of the blue arrow. Where it is after $${T}$ s is the question.`,
              },
            };
          },
        }),
        num({
          id: 'r4-purge', skill: 'math2280.DE-4.2', difficulty: 4, transfer: true,
          gen(r) {
            const Cs = purgeCase(r), { V1, V2, Q, T, c0, a, b, c1, key } = Cs;
            return {
              prompt: t`Before a static fire, nitrogen purges the air from a rocket engine’s two compartments, which are connected in series: nitrogen flows in at $Q = ${Q}\ \text{m}^3/\text{s}$ into compartment 1 ($V_1 = ${V1}\ \text{m}^3$), from there into compartment 2 ($V_2 = ${V2}\ \text{m}^3$), and out. Both start full of air, ${c0}% oxygen. If each compartment stays well mixed, the oxygen percentages obey $$\begin{bmatrix}c_1\\ c_2\end{bmatrix}' = \begin{bmatrix} -Q/V_1 & 0\\ Q/V_2 & -Q/V_2\end{bmatrix}\begin{bmatrix}c_1\\ c_2\end{bmatrix}.$$ What is the oxygen percentage in compartment 2 after $${T}$ s? Give 3 significant figures.`,
              answer: key, units: '%', tol: { rel: 0.005 },
              errors: apart([
                { value: c1, feedback: t`That is compartment 1, which empties of oxygen as $e^{-Qt/V_1}$. Compartment 2 is fed by compartment 1’s outflow, so it lags behind.` },
                { value: c0 * Math.exp(-b * T), feedback: t`That purges compartment 2 with pure nitrogen from the start. Its inflow is compartment 1’s mixture, which still carries oxygen.` },
                { value: c0 * Math.exp(-(Q / (V1 + V2)) * T), feedback: t`That treats the two as one well-mixed volume $V_1 + V_2$. In series they purge more slowly at first: the second sees oxygen-rich gas from the first.` },
                { value: c0 * ((a / (b - a)) * Math.exp(-a * T) + (1 - a / (b - a)) * Math.exp(-b * T)), feedback: t`The oxygen arriving from compartment 1 is diluted into $V_2$: its term in $c_2'$ is $(Q/V_2)\,c_1$, not $(Q/V_1)\,c_1$.` },
              ], key),
              hints: [
                t`The matrix is triangular, so its eigenvalues are its diagonal entries, $-a = -Q/V_1$ and $-b = -Q/V_2$. Find an eigenvector for each.`,
                t`For $-a$: $(b - a)v_2 = b v_1$ gives $\mathbf v = (b - a,\ b)$; for $-b$: $\mathbf v = (0, 1)$. Write $(${c0}, ${c0}) = k_1(b - a, b) + k_2(0, 1)$.`,
                t`Then $c_2(t) = k_1\,b\,e^{-at} + k_2e^{-bt}$ with $a = ${r6(a)}$ and $b = ${r6(b)}\ \text{s}^{-1}$.`,
              ],
              teach: t`The eigenvalue method solves $\mathbf x' = A\mathbf x$ as a sum of eigenvectors times $e^{\lambda t}$, with weights fixed by the initial state; a triangular matrix shows its eigenvalues on the diagonal.`,
              explain: t`The eigenvalues are $-a = -${r6(a)}$ and $-b = -${r6(b)}\ \text{s}^{-1}$, with eigenvectors $(b - a,\ b)$ and $(0, 1)$. Matching $(${c0}, ${c0})$ gives $k_1 = ${c0}/(b - a) = ${tn(c0 / (b - a), 4)}$ and $k_2 = ${c0} - k_1b = ${tn(c0 - (c0 / (b - a)) * b, 4)}$, so $$c_2(t) = ${tn((c0 / (b - a)) * b, 4)}\,e^{-${r6(a)}t} ${c0 - (c0 / (b - a)) * b < 0 ? '-' : '+'} ${tn(Math.abs(c0 - (c0 / (b - a)) * b), 4)}\,e^{-${r6(b)}t},$$ and after $${T}$ s, $c_2 = ${tn(key)}\%$ (compartment 1 is down to $${tn(c1)}\%$). The slower eigenvalue sets the purge time: the downstream compartment cannot clear faster than its own $V_2/Q$. Real purges check the result with an oxygen sensor, since gas does not mix perfectly.`,
              visual: {
                type: 'de-plane',
                params: { matrix: [[r6(-a), 0], [r6(b), r6(-b)]], x: [0, 23], y: [0, 23], equal: true, aspect: 'wide', xlabel: 'c₁ (% O₂)', ylabel: 'c₂ (% O₂)', eigen: true, readout: false, grid: 13, seeds: [{ x: 21, y: 21, color: 'gold', dir: 'forward' }, { x: 21, y: 5, dir: 'forward' }, { x: 8, y: 21, dir: 'forward' }], T: 400, click: false },
                caption: t`The purge in the $(c_1, c_2)$ plane: both percentages fall to the origin, the gold path starting from air in both. Dashed: the eigenvector lines, labelled with their eigenvalues. Time is not marked along the paths. Perfect mixing is a model.`,
              },
            };
          },
        }),
      ],
    },
  ],
});
