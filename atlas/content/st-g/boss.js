// The st-g boss, "The Foundations Defence": a review panel takes apart the
// mathematical foundations of a gravitational-wave paper, one referee per
// round. Round 1 proves lemmas (an ε–δ bound with δ = min(1, ε/(2|a| + 1)), a
// contrapositive, an induction ordered step by step). Round 2 counts degrees
// of freedom (beads and rods; first- and second-class constraints per point
// of space; a constraint force from a Lagrange multiplier). Round 3
// translates conventions ((+,−,−,−) Mandelstam s into (−,+,+,+); what flips
// under g → −g; a luminosity in units of c⁵/G). Round 4 checks symmetry (a
// Thomas–Wigner angle; an attitude slew through the SU(2) double cover).
// Round 5 tests invariants (tidal stretch at a horizon; an orbital period from
// the area form). Every number comes from a generator; the case functions are
// exported so a script recomputes each key another way.
import { boss, mcq, num, order } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';
import { r6, wignerPerp } from './_sg3.js';

const t = String.raw;
const DEG = Math.PI / 180;
const G_STD = 9.81;                       // m/s²
const C = 299792458;                      // m/s
const GM_SUN = 1.32712440018e20;          // m³/s² (IAU)
const MU_EARTH = 398600.4418;             // km³/s² (WGS 84)
const C5G = C ** 5 / 6.6743e-11;          // W, c⁵/G (CODATA 2018 G)

/** Keep only the slips whose values are finite and clearly apart from the key and from each other. */
function apart(errors, key, rel = 0.02) {
  const kept = [];
  const far = (u, v) => Math.abs(u - v) > rel * Math.max(Math.abs(u), Math.abs(v), 1e-12);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key) && kept.every((k) => far(e.value, k.value))) kept.push(e);
  return kept;
}

// ── round 1: lemmas ──────────────────────────────────────────────────────────
/** ε–δ for x² at a: δ = min(1, ε/(2|a| + 1)). */
export function deltaCase(r) {
  const [a, eps] = r.pick([[1.5, 0.5], [2, 0.9], [3, 2], [-2.5, 0.6], [4, 3], [1.5, 6], [-1, 4], [2.5, 1.2]]);
  const raw = eps / (2 * Math.abs(a) + 1), key = Math.min(1, raw);
  return { a, eps, raw, key };
}

const LEMMAS = [
  { P: t`a sequence $(x_n)$ of real numbers converges`, Q: t`it is bounded`, nP: t`$(x_n)$ does not converge`, nQ: t`$(x_n)$ is unbounded` },
  { P: t`$f$ is differentiable at $a$`, Q: t`$f$ is continuous at $a$`, nP: t`$f$ is not differentiable at $a$`, nQ: t`$f$ is not continuous at $a$` },
  { P: t`a Lorentz transformation $\Lambda$ can be reached continuously from the identity`, Q: t`$\det\Lambda = +1$ and $\Lambda^0{}_0 \ge 1$`, nP: t`$\Lambda$ cannot be reached continuously from the identity`, nQ: t`$\det\Lambda = -1$ or $\Lambda^0{}_0 \le -1$` },
  { P: t`a vacuum region of spacetime is spherically symmetric`, Q: t`its metric is (a piece of) Schwarzschild`, nP: t`the vacuum region is not spherically symmetric`, nQ: t`its metric is not Schwarzschild` },
  { P: t`a closed surface is a sphere`, Q: t`every continuous tangent vector field on it vanishes somewhere`, nP: t`the surface is not a sphere`, nQ: t`some continuous tangent vector field on it vanishes nowhere` },
];
/** Which statement is the contrapositive; the lemma is picked by the generator. */
export function contraCase(r) {
  const k = r.int(0, LEMMAS.length - 1);
  return { k, L: LEMMAS[k] };
}

const INDUCTIONS = [
  { lhs: (n) => 2 ** n, rhs: (n) => n * n, n0: 5, f: '2ⁿ', g: 'n²', fT: t`2^n`, gT: t`n^2`, c: 2, cT: '2', step: t`2n^2 \ge (n+1)^2`, why: t`$2n^2 - (n+1)^2 = n^2 - 2n - 1 > 0$ for $n \ge 3$` },
  { lhs: (n) => 3 ** n, rhs: (n) => n ** 3, n0: 4, f: '3ⁿ', g: 'n³', fT: t`3^n`, gT: t`n^3`, c: 3, cT: '3', step: t`3n^3 \ge (n+1)^3`, why: t`$(1 + \tfrac1n)^3 \le \tfrac{125}{64} < 3$ for $n \ge 4$` },
  { lhs: (n) => [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880][n], rhs: (n) => 2 ** n, n0: 4, f: 'n!', g: '2ⁿ', fT: t`n!`, gT: t`2^n`, c: null, cT: 'n + 1', step: t`(n+1)\,2^n \ge 2^{n+1}`, why: t`$n + 1 \ge 2$` },
];
/** An induction proof whose steps are to be put in order. */
export function inductionCase(r) {
  const k = r.int(0, INDUCTIONS.length - 1), L = INDUCTIONS[k];
  return { k, L, base: [L.lhs(L.n0), L.rhs(L.n0)] };
}

// ── round 2: degrees of freedom ─────────────────────────────────────────────
const RIGS = [
  { what: 'a rigid triatomic molecule: 3 atoms in space joined pairwise by 3 rigid bonds', coords: 9, k: 3, beads: [[-1, 0], [1, 0], [0, 1.4]], rods: [[0, 1], [1, 2], [2, 0]] },
  { what: 'a double pendulum swinging in a vertical plane: 2 bobs, each on a rigid rod (the first hung from a fixed pivot)', coords: 4, k: 2, beads: [[0, 0.6], [0.9, -0.3]], rods: [[-1, 0], [0, 1]], pivot: [-0.5, 1.5] },
  { what: 'a rigid body of 4 atoms (a tetrahedron) joined by 6 rigid bonds, in space', coords: 12, k: 6, beads: [[-1.2, -0.5], [1.2, -0.5], [0, 1.3], [0.2, 0.2]], rods: [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]] },
  { what: 'a dumbbell: 2 atoms in space joined by 1 rigid bond', coords: 6, k: 1, beads: [[-1, 0], [1, 0.3]], rods: [[0, 1]] },
  { what: 'a chain of 3 beads hanging from a fixed point by 3 rigid links, free to swing in space', coords: 9, k: 3, beads: [[0.2, 0.7], [0.5, -0.1], [0.6, -0.9]], rods: [[-1, 0], [0, 1], [1, 2]], pivot: [0, 1.5] },
];
export function rigCase(r) {
  const k = r.int(0, RIGS.length - 1), R = RIGS[k];
  return { k, R, key: R.coords - R.k };
}

const FIELDS = [
  { label: 'electromagnetism', N: 4, F: 2, S: 0 },
  { label: 'Proca (massive vector)', N: 4, F: 0, S: 2 },
  { label: 'general relativity', N: 10, F: 8, S: 0 },
  { label: 'a reparametrized particle', N: 4, F: 1, S: 0 },
  { label: 'a free scalar', N: 1, F: 0, S: 0 },
];
export function phaseCase(r) {
  const k = r.int(0, FIELDS.length - 1), Fd = FIELDS[k];
  return { k, Fd, key: (2 * Fd.N - 2 * Fd.F - Fd.S) / 2 };
}

/** Pendulum tension from the multiplier: T = mg(3 cos θ − 2 cos θ₀). */
export function tensionCase(r) {
  const m = r.pick([0.5, 1.2, 2, 3.5]), th0 = r.pick([60, 75, 90, 120]), th = r.pick([0, 20, 35, 50]);
  const key = m * G_STD * (3 * Math.cos(th * DEG) - 2 * Math.cos(th0 * DEG));
  return { m, th0, th, key };
}

// ── round 3: conventions ─────────────────────────────────────────────────────
export function mandelstamCase(r) {
  const E1 = r.pick([3.5, 4, 6.5, 7, 45]), E2 = r.pick([3.5, 4, 7, 26.5]);
  const sMinus = 4 * E1 * E2;                        // (+,−,−,−): (p₁ + p₂)² for head-on massless beams
  return { E1, E2, sMinus, key: -sMinus };
}

const FLIPS = [
  { q: t`the Christoffel symbols $\Gamma^\lambda{}_{\mu\nu}$`, a: 0, n: t`one inverse metric times derivatives of one metric: $(-1)(-1) = +1$` },
  { q: t`the Riemann tensor $R^\rho{}_{\sigma\mu\nu}$`, a: 0, n: t`built from $\Gamma$ and its derivatives, which are unchanged` },
  { q: t`the Ricci tensor $R_{\mu\nu}$`, a: 0, n: t`a contraction of Riemann, with no metric needed` },
  { q: t`the Ricci scalar $R = g^{\mu\nu}R_{\mu\nu}$`, a: 1, n: t`one inverse metric: one factor of $-1$` },
  { q: t`the Einstein tensor $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$`, a: 0, n: t`$R_{\mu\nu}$ unchanged and $R\,g_{\mu\nu}$ picks up $(-1)^2$` },
  { q: t`the mixed stress tensor $T^\mu{}_\nu$ (with $T_{\mu\nu}$ unchanged)`, a: 1, n: t`one inverse metric raises the index: one factor of $-1$` },
  { q: t`the cosmological term $\Lambda g_{\mu\nu}$ with $\Lambda$ kept the same number`, a: 1, n: t`one metric, nothing to compensate` },
];
export function flipCase(r) {
  const k = r.int(0, FLIPS.length - 1);
  return { k, F: FLIPS[k], key: FLIPS[k].a };
}

const POWERS = [
  { what: 'GW150914 at its peak, the merger of two black holes', P: 3.6e49 },
  { what: 'the Sun (its nominal luminosity)', P: 3.828e26 },
  { what: 'a 1 GW power station', P: 1e9 },
  { what: 'the Saturn V first stage at full thrust (mechanical jet power)', P: 6e10 },
];
export function powerCase(r) {
  const k = r.int(0, POWERS.length - 1), W = POWERS[k];
  return { k, W, key: W.P / C5G };
}

// ── round 4: symmetry ────────────────────────────────────────────────────────
export function wignerCase(r) {
  const w1 = r.pick([0.6, 0.9, 1.2, 1.5]), w2 = r.pick([0.4, 0.8, 1.1, 1.6]);
  return { w1, w2, key: wignerPerp(w1, w2) / DEG };
}

export function slewCase(r) {
  const th = r.pick([30, 64, 96, 128, 150]), axis = r.pick([[0, 0, 1], [0.6, 0.8, 0], [0.48, 0.6, 0.64]]);
  const s = Math.sin((th * DEG) / 2), c = Math.cos((th * DEG) / 2);
  const qb = [-c, ...axis.map((x) => -x * s)].map((x) => r6(x));
  return { th, axis, qb, key: (2 * Math.acos(Math.min(1, Math.abs(qb[0])))) / DEG };
}

// ── round 5: invariants ──────────────────────────────────────────────────────
export function tidalCase(r) {
  const [what, m, body] = r.pick([['a 10 M☉ black hole', 10, 'bh'], ['a 30 M☉ black hole', 30, 'bh'], ['Sagittarius A* (4.3 × 10⁶ M☉)', 4.3e6, 'sgra'], ['M87* (6.5 × 10⁹ M☉)', 6.5e9, 'sgra']]);
  const L = r.pick([1.8, 2, 30]);   // an astronaut, or a 30 m spacecraft
  const GM = GM_SUN * m;
  return { what, m, body, L, GM, key: (L * C ** 6) / (4 * GM * GM) };
}

export function periodCase(r) {
  const [what, a, e] = r.pick([['a Tundra orbit', 42164, 0.27], ['a sun-synchronous orbit', 7078, 0.001], ['a lunar-transfer orbit', 200000, 0.967], ['a GTO (geostationary transfer orbit)', 24400, 0.73]]);
  const b = a * Math.sqrt(1 - e * e), h = Math.sqrt(MU_EARTH * a * (1 - e * e));
  return { what, a, e, b, h, key: (2 * Math.PI * a * b) / h / 3600 };
}

// ── pictures ─────────────────────────────────────────────────────────────────
const seg = (p, q, color = 'ink3', width = 2) => ({ param: [`${r6(p[0])} + t*${r6(q[0] - p[0])}`, `${r6(p[1])} + t*${r6(q[1] - p[1])}`], t: [0, 1], color, width });
function rigPic(R) {
  const pt = (i) => (i < 0 ? R.pivot : R.beads[i]);
  const curves = R.rods.map(([i, j]) => seg(pt(i), pt(j), 'ink3', 2.4));
  const points = R.beads.map(([x, y]) => ({ x, y, r: 8, color: 'accent' }));
  if (R.pivot) points.push({ x: R.pivot[0], y: R.pivot[1], r: 5, color: 'gold', label: 'fixed pivot' });
  return { type: 'graph', params: { x: [-3, 3], y: [-1.4, 1.8], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves, points }, caption: 'Beads (blue) and rigid rods (grey), drawn flat; the text says whether they move in a plane or in space.' };
}
function eulerPic() {
  return {
    type: 'graph',
    params: { x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [{ param: ['1.5*cos(t)', '1.4*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.2, label: 'Q true', labelAt: 0.6, labelDx: 6 }, { param: ['-0.3 + 0.75*cos(t)', '0.7*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2, label: 'P true', labelAt: 2.3, labelDx: -40, labelDy: -6 }] },
    caption: 'P ⇒ Q drawn as sets: every case where P holds lies inside the cases where Q holds.',
  };
}

export default boss({
  title: 'The Foundations Defence',
  intro: t`Your group’s paper — a new search for gravitational waves from merging black holes — goes before a review panel, and the panel does not care about the waveforms. It wants the **foundations**. Five referees, one per round: the analyst wants your lemmas proved; the mechanician wants the degrees of freedom counted; the particle physicist wants your conventions translated; the group theorist checks your symmetries; the relativist asks only for invariants. Five rounds, thirteen problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Prove a lemma',
      story: t`The analyst opens with the small print. Your pipeline’s error bounds rest on three lemmas — a continuity estimate, a logical step in the paper’s theorem, and an induction behind a convergence claim. She wants each one airtight.`,
      items: [
        num({
          id: 'r1-delta', skill: 'st-g.G1.4', difficulty: 3,
          gen(r) {
            const { a, eps, raw, key } = deltaCase(r);
            const A = Math.abs(a);
            return {
              prompt: t`**Lemma:** $f(x) = x^2$ is continuous at $a = ${a}$. The proof bounds $|x^2 - a^2| = |x - a|\,|x + a|$: if $|x - a| < 1$ then $|x + a| < 2|a| + 1$, so the choice $\delta = \min\bigl(1, \tfrac{\varepsilon}{2|a| + 1}\bigr)$ guarantees $|x^2 - a^2| < \varepsilon$. For $\varepsilon = ${eps}$, what $\delta$ does this proof choose?`,
              visual: { type: 'graph', params: { x: [a - 2.2, a + 2.2], y: [Math.max(-1, a * a - 6), a * a + 7], aspect: 'wide', xlabel: 'x', ylabel: 'x²', curves: [{ fn: 'x^2', color: 'accent', width: 2.2 }], shade: [{ fn: String(r6(a * a + eps)), lower: String(r6(a * a - eps)), from: r6(a - 2.2), to: r6(a + 2.2), color: 'gold', alpha: 0.16 }], points: [{ x: a, y: a * a, r: 5, color: 'ink', label: `(a, a²), a = ${a}` }] }, caption: t`$y = x^2$ and the band $a^2 \pm \varepsilon$ (gold): $\delta$ must keep $x^2$ inside it.` },
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: raw, feedback: t`That is $\varepsilon/(2|a| + 1)$ before taking the minimum with $1$. The bound $|x + a| < 2|a| + 1$ was only proved for $|x - a| < 1$, so $\delta$ may never exceed $1$.` },
                { value: eps / (2 * A), feedback: t`$|x + a|$ can be as large as $2|a| + |x - a|$, not $2|a|$: the extra $1$ covers the room $x$ has to move.` },
                { value: eps, feedback: t`That would work only if $|x + a| \le 1$. The slope of $x^2$ near $a$ is about $2|a|$, so $\delta$ must be smaller.` },
              ], key),
              hints: [t`Compute $\varepsilon/(2|a| + 1) = ${eps}/${2 * A + 1}$.`, t`Then take the smaller of that and $1$.`],
              teach: 'An ε–δ proof first bounds the troublesome factor on a fixed neighbourhood (here |x − a| < 1), then takes δ as the minimum of the two requirements.',
              explain: t`$\varepsilon/(2|a| + 1) = ${nice(raw, 4)}$, so $\delta = ${raw >= 1 ? '1' : nice(key, 4)}$${raw >= 1 ? t` — the first restriction wins: the factor bound $|x + a| < 2|a| + 1$ needs $|x - a| < 1$` : ''}. Then $|x^2 - a^2| < \delta(2|a| + 1) \le \varepsilon$.`,
            };
          },
        }),
        mcq({
          id: 'r1-contrapositive', skill: 'st-g.G1.2', difficulty: 2,
          gen(r) {
            const { L } = contraCase(r);
            return {
              prompt: t`The paper uses the lemma “if ${L.P}, then ${L.Q}”. Which statement is logically equivalent to it (its contrapositive)?`,
              visual: eulerPic(),
              choices: [t`If ${L.nQ}, then ${L.nP}.`, t`If ${L.Q}, then ${L.P}.`, t`If ${L.nP}, then ${L.nQ}.`, t`${L.P[0].toUpperCase() + L.P.slice(1)}, and yet ${L.nQ}.`],
              answer: 0,
              why: {
                1: 'That is the converse, Q ⇒ P: a different statement, which may be false even when the lemma is true (the gold ring is bigger than the blue one).',
                2: 'That is the inverse, ¬P ⇒ ¬Q — equivalent to the converse, not to the lemma. Points in the gold ring outside the blue one break it.',
                3: 'That is the negation of the lemma: it asserts a counterexample exists.',
              },
              hints: [t`The contrapositive of $P \Rightarrow Q$ is $\neg Q \Rightarrow \neg P$.`, 'In the picture: a point outside the gold ring cannot be inside the blue one.'],
              teach: 'P ⇒ Q and its contrapositive ¬Q ⇒ ¬P are the same statement; the converse and the inverse are different ones.',
              explain: t`“If ${L.nQ}, then ${L.nP}” says the same as the lemma: anything outside $Q$ is outside $P$. Proving the contrapositive is often the easier road.`,
            };
          },
        }),
        order({
          id: 'r1-induction', skill: 'st-g.G1.3', difficulty: 3,
          gen(r) {
            const { L, base } = inductionCase(r);
            const n0 = L.n0;
            const pts = [];
            for (let n = 1; n <= 9; n++) pts.push({ x: n, y: r6(Math.log10(L.lhs(n))), r: 4, color: 'accent' }, { x: n, y: r6(Math.log10(L.rhs(n))), r: 4, color: 'gold', hollow: true });
            return {
              prompt: t`Put the steps of this induction proof in order. **Lemma:** $${L.fT} > ${L.gT}$ for every integer $n \ge ${n0}$.`,
              visual: { type: 'graph', params: { x: [0.5, 9.5], y: [-0.2, 6], aspect: 'wide', xlabel: 'n', ylabel: 'log₁₀ of the value', points: pts, vlines: [{ x: n0, color: 'ink3', label: `n = ${n0}` }], legend: [{ label: L.f, color: 'accent', point: true }, { label: L.g, color: 'gold', point: true }], legendAt: 'tl' }, caption: 'Both sides for n = 1 to 9 on a log scale (blue: left side, gold: right side).' },
              items: [
                t`Base case: at $n = ${n0}$, $${L.fT} = ${base[0]} > ${base[1]} = ${L.gT}$.`,
                t`Hypothesis: suppose $${L.fT} > ${L.gT}$ for some $n \ge ${n0}$.`,
                L.c ? t`Multiply by $${L.cT}$: $${L.fT.replace('n', '{n+1}')} = ${L.cT}\cdot ${L.fT} > ${L.cT}\,${L.gT}$.` : t`Multiply by $n + 1$: $(n+1)! = (n+1)\,n! > (n+1)\,2^n$.`,
                t`Bound: $${L.step}$, because ${L.why}.`,
                t`So the statement holds for $n + 1$, hence for every $n \ge ${n0}$.`,
              ],
              hints: ['An induction proof starts with the base case and ends with the conclusion.', 'The hypothesis must come before the step that uses it; the bound closes the gap between what the step gives and what n + 1 needs.'],
              teach: 'Induction: a base case, a hypothesis for n, a step that uses it to reach n + 1, then the conclusion for all n from the base up.',
              explain: t`Base, hypothesis, step, bound, conclusion. The picture shows why the base is $n = ${n0}$: below it the inequality fails${n0 === 5 ? ' (2⁴ = 16 = 4²)' : ''}, and the step cannot start a chain that was never true.`,
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Count the degrees of freedom',
      story: t`The mechanician cares about one number for every system in the paper: how many independent things it can do. Constraints remove some coordinates; gauge freedom removes more; a Lagrange multiplier, used right, hands you a force for free.`,
      items: [
        num({
          id: 'r2-rig', skill: 'st-g.G6.1', difficulty: 2,
          gen(r) {
            const { R, key } = rigCase(r);
            return {
              prompt: t`How many degrees of freedom does ${R.what} have? Each rigid rod is one holonomic constraint.`,
              visual: rigPic(R),
              answer: key, tol: { rel: 0, abs: 0.01 },
              errors: apart([{ value: R.coords, feedback: 'That counts the coordinates before the constraints: each rigid rod removes one.' }, { value: R.coords + R.k, feedback: 'Constraints subtract, they do not add.' }, { value: R.coords - 2 * R.k, feedback: 'A holonomic constraint removes one configuration coordinate, not two (two is its phase-space count).' }], key, 0.01),
              hints: ['Count coordinates first: 3 per bead in space, 2 per bead in a plane.', 'Subtract one for each independent holonomic constraint.'],
              teach: 'Degrees of freedom = coordinates − independent holonomic constraints.',
              explain: t`$${R.coords} - ${R.k} = ${key}$.${key === 6 && !R.pivot ? ' Six — three translations and three rotations — as for any rigid body that is not a line.' : ''}`,
            };
          },
        }),
        num({
          id: 'r2-phase', skill: 'st-g.G6.4', difficulty: 3,
          gen(r) {
            const { k, Fd, key } = phaseCase(r);
            return {
              prompt: t`Dirac’s count: a system (per point of space, for a field) with $N$ configuration variables has a $2N$-dimensional phase space; each first-class constraint removes two dimensions (itself and the gauge direction it generates), each second-class one removes one. For ${Fd.label}, with $N = ${Fd.N}$, $F = ${Fd.F}$ first-class and $S = ${Fd.S}$ second-class constraints, how many physical degrees of freedom are there?`,
              visual: { type: 'graph', params: { x: [0, 7], y: [0, 2 * Fd.N + 3], aspect: 'wide', xlabel: '', ylabel: 'count', xticks: 0, yticks: Math.min(2 * Fd.N + 2, 10), shade: [{ fn: String(2 * Fd.N), lower: '0', from: 0.6, to: 1.8, color: 'accent', alpha: 0.6 }, { fn: String(Math.max(Fd.F, 0.05)), lower: '0', from: 2.9, to: 4.1, color: 'bad', alpha: Fd.F ? 0.6 : 0.15 }, { fn: String(Math.max(Fd.S, 0.05)), lower: '0', from: 5.2, to: 6.4, color: 'gold', alpha: Fd.S ? 0.6 : 0.15 }], points: [{ x: 1.2, y: 2 * Fd.N + 1, r: 0, label: 'phase space 2N', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 3.5, y: Fd.F + 1, r: 0, label: 'first-class F', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 5.8, y: Fd.S + 1, r: 0, label: 'second-class S', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: 'The three inputs as bars: phase-space dimensions and the two kinds of constraint. What is left is the question.' },
              answer: key, tol: { rel: 0, abs: 0.01 },
              errors: apart([{ value: (2 * Fd.N - Fd.F - Fd.S) / 2, feedback: 'Each first-class constraint removes two phase-space dimensions: the constraint surface and its gauge orbit.' }, { value: Fd.N - Fd.F - Fd.S, feedback: t`Work in phase space: $(2N - 2F - S)/2$, then halve — second-class constraints count half as much.` }, { value: 2 * Fd.N - 2 * Fd.F - Fd.S, feedback: 'That is the physical phase-space dimension; a degree of freedom is a coordinate–momentum pair, so halve it.' }], key, 0.01),
              hints: [t`Physical phase-space dimension: $2N - 2F - S$.`, 'Degrees of freedom are half of that.'],
              teach: 'Degrees of freedom = (2N − 2F − S)/2: first-class constraints cost two phase-space dimensions, second-class ones cost one.',
              explain: t`$(2\cdot${Fd.N} - 2\cdot${Fd.F} - ${Fd.S})/2 = ${key}$.${Fd.label === 'general relativity' ? ' Gravity has two: the plus and cross polarizations.' : Fd.label === 'electromagnetism' ? ' Two photon polarizations.' : ''}`,
            };
          },
        }),
        num({
          id: 'r2-tension', skill: 'st-g.G6.2', difficulty: 3,
          gen(r) {
            const { m, th0, th, key } = tensionCase(r);
            const c0 = Math.cos(th0 * DEG), c1 = Math.cos(th * DEG);
            return {
              prompt: t`A test mass of $${m}\ \text{kg}$ hangs on a light rigid rod and is released from rest at $\theta_0 = ${th0}^\circ$ from the vertical. Treating the rod as the constraint $f = x^2 + y^2 - \ell^2 = 0$ with a Lagrange multiplier, the rod’s force is $T = mg(3\cos\theta - 2\cos\theta_0)$ (tension positive). Find $T$ as the mass passes $\theta = ${th}^\circ$, with $g = 9.81\ \text{m/s}^2$, in newtons.`,
              visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.3, 0.2], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [seg([0, 0], [r6(Math.sin(th * DEG)), r6(-Math.cos(th * DEG))], 'ink3', 2.4), { param: ['sin(t)', '-cos(t)'], t: [r6(-th0 * DEG), r6(th0 * DEG)], color: 'ink4', dash: true, width: 1.2 }], points: [{ x: 0, y: 0, r: 4, color: 'gold', label: 'pivot' }, { x: r6(Math.sin(th * DEG)), y: r6(-Math.cos(th * DEG)), r: 8, color: 'accent', label: `θ = ${th}°` }, { x: r6(Math.sin(th0 * DEG)), y: r6(-Math.cos(th0 * DEG)), r: 5, color: 'accent', hollow: true, label: 'release' }] }, caption: 'The swing (dashed arc) from the release point; the rod’s force is along the rod.' },
              answer: key, units: 'N', tol: { rel: 0.01 },
              errors: apart([{ value: m * G_STD * c1, feedback: t`That is the static value $mg\cos\theta$; the mass is moving, and the rod also supplies the centripetal force $mv^2/\ell$.` }, { value: m * G_STD * (3 - 2 * c0), feedback: t`That is the tension at the bottom, $\theta = 0$.` }], key),
              hints: [t`$\cos${th}^\circ = ${nice(c1, 4)}$ and $\cos${th0}^\circ = ${nice(c0, 4)}$.`, t`$T = ${m}\times9.81\times(3\times${nice(c1, 4)} - 2\times${nice(c0, 4)})$.`],
              teach: 'A Lagrange multiplier for a constraint is the constraint force, read off with no free-body diagram.',
              explain: t`$T = ${nice(key, 4)}\ \text{N}$: $mg\cos\theta$ to hold the mass against gravity along the rod plus $mv^2/\ell = 2mg(\cos\theta - \cos\theta_0)$ to turn it.`,
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Translate between sign conventions',
      story: t`The particle physicist on the panel writes in $(+,-,-,-)$; your paper uses $(-,+,+,+)$ and geometrized units. He wants every borrowed number translated, and every sign accounted for.`,
      items: [
        num({
          id: 'r3-mandelstam', skill: 'st-g.G-SIG.1', difficulty: 3,
          gen(r) {
            const { E1, E2, sMinus, key } = mandelstamCase(r);
            return {
              prompt: t`A collider paper in $(+,-,-,-)$ quotes $s = (p_1 + p_2)^2 = ${nice(sMinus)}\ \text{GeV}^2$ for two head-on beams of $${E1}\ \text{GeV}$ and $${E2}\ \text{GeV}$ (masses negligible, $c = 1$). What is the same quantity, $(p_1 + p_2)\cdot(p_1 + p_2)$, in the $(-,+,+,+)$ convention, in $\text{GeV}^2$?`,
              visual: { type: 'graph', params: { x: [-1.3 * Math.max(E1, E2), 1.3 * Math.max(E1, E2)], y: [0, 1.25 * (E1 + E2)], equal: true, aspect: 'wide', xlabel: 'momentum (GeV)', ylabel: 'energy (GeV)', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], arrows: [{ from: [0, 0], to: [E1, E1], color: 'accent', width: 2.4, label: 'p₁' }, { from: [0, 0], to: [-E2, E2], color: 'gold', width: 2.4, label: 'p₂' }, { from: [0, 0], to: [E1 - E2, E1 + E2], color: 'ink', width: 2.6, label: 'p₁ + p₂' }] }, caption: 'The two beams’ four-momenta and their sum on the energy–momentum plane; the arrows are the same in both conventions.' },
              answer: key, units: 'GeV^2', tol: { rel: 0.005 },
              errors: apart([{ value: sMinus, feedback: 'Every dot product flips sign between the conventions; only upper-index components stay the same.' }, { value: -((E1 + E2) ** 2), feedback: t`That is $-(E_1 + E_2)^2$: you dropped the momentum part, $|\vec p_1 + \vec p_2|^2 = (E_1 - E_2)^2$.` }], key),
              hints: [t`$\eta^{(-+++)} = -\eta^{(+---)}$, so every dot product changes sign.`, t`Check directly: $-(E_1 + E_2)^2 + (E_1 - E_2)^2 = -4E_1E_2$.`],
              teach: 'Between (+,−,−,−) and (−,+,+,+) every dot product flips sign while the four-vectors themselves do not.',
              explain: t`$-s = ${nice(key)}\ \text{GeV}^2$; the invariant mass $\sqrt{s} = ${nice(Math.sqrt(sMinus), 4)}\ \text{GeV}$ is the same in both books — only the sign of the dot product is a convention.`,
            };
          },
        }),
        mcq({
          id: 'r3-flip', skill: 'st-g.G-SIG.2', difficulty: 3,
          gen(r) {
            const { F, key } = flipCase(r);
            return {
              prompt: t`A referee switches your paper’s metric sign, $g_{\mu\nu} \to -g_{\mu\nu}$ (so $g^{\mu\nu} \to -g^{\mu\nu}$), keeping the definitions of Riemann and Ricci. What happens to ${F.q}?`,
              visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 45, readout: false }, caption: 'The same curved geometry in either sign convention: only the bookkeeping changes. Count the factors of the metric.' },
              choices: ['It is unchanged', 'It flips sign', 'Only its time–time component flips', 'Only its space–space components flip'],
              answer: key, fixedOrder: true,
              why: Object.fromEntries([0, 1, 2, 3].filter((k) => k !== key).map((k) => [k, k < 2 ? t`Count the metrics: ${F.n}.` : 'The whole metric flips, time and space alike, so no component is singled out: each quantity is multiplied by (−1) to the number of metric factors it contains.'])),
              hints: ['Count how many factors of g or its inverse each quantity contains, net.', t`$\Gamma = \tfrac12g^{-1}\partial g$ has one of each, so it does not change.`],
              teach: t`Under $g \to -g$, a quantity is multiplied by $(-1)$ to the net number of metrics in it: $\Gamma$, Riemann, Ricci and $G_{\mu\nu}$ survive; $R$, mixed indices and the $\Lambda$ term flip.`,
              explain: t`${key === 0 ? 'Unchanged' : 'It flips'}: ${F.n}. That is why the field equation $G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi T_{\mu\nu}$ needs $\Lambda$’s sign changed when the signature is.`,
            };
          },
        }),
        num({
          id: 'r3-power', skill: 'st-g.G-UNITS.2', difficulty: 2,
          gen(r) {
            const { W, key } = powerCase(r);
            return {
              prompt: t`In $G = c = 1$ units a power is a pure number, $P\,G/c^5$ — the fraction of the “Planck luminosity” $c^5/G = ${tex(C5G, 4)}\ \text{W}$. What is it for ${W.what}, $P = ${tex(W.P, 4)}\ \text{W}$?`,
              visual: { type: 'graph', params: { x: [0.5, 4.5], y: [8, 54], ylog: true, aspect: 'wide', xlabel: '', ylabel: 'power (W)', xticks: 0, points: POWERS.map((p, i) => ({ x: i + 1, y: r6(Math.log10(p.P)), r: 6, color: p === W ? 'gold' : 'accent' })), hlines: [{ y: r6(Math.log10(C5G)), color: 'bad', label: 'c⁵/G' }] }, caption: 'The four sources on a log scale (left to right: GW150914, the Sun, a power station, a Saturn V stage), with c⁵/G.' },
              answer: key, tol: { rel: 0.01 },
              errors: apart([{ value: W.P / (C ** 5), feedback: t`Divide by $c^5/G$, not $c^5$: $G$ is part of the conversion.` }, { value: (W.P * 6.6743e-11) / C ** 4, feedback: t`Power needs $c^5$ ($G/c^4$ is the factor for an energy).` }], key),
              hints: [t`$P\,G/c^5 = P/(c^5/G)$.`, t`$${tex(W.P, 4)}/${tex(C5G, 4)}$.`],
              teach: 'In geometrized units a power is dimensionless, measured against c⁵/G ≈ 3.6 × 10⁵² W.',
              explain: t`$${tex(key, 3)}$.${W.P > 1e40 ? ' A merger at peak radiates about a thousandth of c⁵/G — more than all the stars in the observable universe together.' : ' Tiny: only colliding black holes come within a few orders of magnitude of c⁵/G.'}`,
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Check the symmetries',
      story: t`The group theorist reads only your appendix on frames. The detectors’ calibration boosts and the satellites that carry the timing reference both rotate frames, and both hide group theory: boosts that do not close, and quaternions that cover rotations twice.`,
      items: [
        num({
          id: 'r4-wigner', skill: 'st-g.G-LIEA.3', difficulty: 3,
          gen(r) {
            const { w1, w2, key } = wignerCase(r);
            const g1 = Math.cosh(w1), g2 = Math.cosh(w2);
            return {
              prompt: t`A frame is boosted with rapidity $w_1 = ${w1}$ along $x$, then — in its new rest frame — with rapidity $w_2 = ${w2}$ along $y$. Because $[K_x, K_y] = -J_z$, the result is a boost followed by a Thomas–Wigner rotation about $z$, with $\cos\theta = \dfrac{\gamma_1 + \gamma_2}{1 + \gamma_1\gamma_2}$ and $\gamma_i = \cosh w_i$. Find $\theta$ in degrees.`,
              visual: { type: 'graph', params: { x: [-2, 2], y: [-1.1, 1.1], equal: true, aspect: 'wide', xlabel: 'vₓ / c', ylabel: 'vᵧ / c', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'warn', dash: true, width: 1.2 }], arrows: [{ from: [0, 0], to: [r6(Math.tanh(w1)), 0], color: 'accent', width: 2.6, label: 'first boost' }, { from: [r6(Math.tanh(w1)), 0], to: [r6(Math.tanh(w1)), r6(Math.tanh(w2))], color: 'gold', width: 2.6, label: 'second' }] }, caption: t`The two boosts as speeds $\tanh w$ (schematic: the second is measured in the first one’s frame), inside the light-speed circle.` },
              answer: key, units: 'deg', tol: { rel: 0.005 },
              errors: apart([{ value: (w1 * w2) / 2 / DEG, feedback: t`$w_1w_2/2$ is the small-rapidity estimate; these rapidities are not small.` }, { value: Math.acos((g1 * g2) / (1 + g1 * g2)) / DEG, feedback: t`The numerator is $\gamma_1 + \gamma_2$, a sum.` }], key),
              hints: [t`$\gamma_1 = ${nice(g1, 4)}$, $\gamma_2 = ${nice(g2, 4)}$.`, t`$\cos\theta = ${nice((g1 + g2) / (1 + g1 * g2), 4)}$.`],
              teach: 'Two perpendicular boosts compose to a boost and a rotation: the boost generators close only into rotations.',
              explain: t`$\theta = ${nice(key, 4)}^\circ$ — confirmed by composing the $4\times4$ boost matrices and splitting off the pure boost.`,
            };
          },
        }),
        num({
          id: 'r4-slew', skill: 'st-g.G-LIEG.1', difficulty: 3,
          gen(r) {
            const { th, qb, key } = slewCase(r);
            const naive = (2 * Math.acos(qb[0])) / DEG;
            return {
              prompt: t`A timing satellite’s attitude is the unit quaternion (an element of $SU(2)$) $q_b = (${qb.map((x) => nice(x, 4)).join(', ')})$, scalar part first, relative to its reference attitude $q_a = (1, 0, 0, 0)$. The attitude controller turns through $\theta = 2\arccos|q_a\cdot q_b|$. How many degrees is that?`,
              visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.15, 1.15], equal: true, aspect: 'wide', xlabel: 'scalar part', ylabel: 'vector part (along the axis)', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2 }], points: [{ x: 1, y: 0, r: 5, color: 'accent', label: 'reference' }, { x: qb[0], y: r6(-Math.sin((th * DEG) / 2)), r: 5, color: 'gold', label: 'target', labelDy: 14 }, { x: r6(-qb[0]), y: r6(Math.sin((th * DEG) / 2)), r: 5, color: 'gold', hollow: true, label: 'minus target' }] }, caption: 'The quaternions on a slice of the unit 3-sphere: the target and its negative are the same attitude.' },
              answer: key, units: 'deg', tol: { rel: 0.005 },
              errors: apart([{ value: naive, feedback: t`Without the absolute value you took the long way round: $q_b$ and $-q_b$ are the same attitude, and $-q_b$ is closer.` }, { value: key / 2, feedback: t`A quaternion carries half the angle: $q_0 = \cos\tfrac\theta2$, so double the arccos.` }], key),
              hints: [t`$q_a\cdot q_b = ${nice(qb[0], 4)}$; take its absolute value.`, t`$\theta = 2\arccos(${nice(Math.abs(qb[0]), 4)})$.`],
              teach: t`$SU(2)$ covers $SO(3)$ twice, so $q$ and $-q$ are one attitude; the slew angle uses $|q_a\cdot q_b|$.`,
              explain: t`$\theta = ${nice(key, 4)}^\circ$ (the naive $${nice(naive, 4)}^\circ$ is the same rotation the long way).`,
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Only invariants',
      story: t`The relativist has one rule: no coordinate-dependent number may appear in a conclusion. She asks what an observer would actually feel at a horizon, and for an orbital period computed from geometry rather than from a formula sheet.`,
      items: [
        num({
          id: 'r5-tidal', skill: 'st-g.G-COV.2', difficulty: 3,
          gen(r) {
            const { what, body, L, GM, key } = tidalCase(r);
            return {
              prompt: t`The tidal stretch across a body of length $L$ along the radius, $\Delta a = 2GML/r^3$, is coordinate-free (it is geodesic deviation). At the horizon $r_s = 2GM/c^2$ it becomes $\Delta a = Lc^6/4(GM)^2$. For ${L > 10 ? `a ${L} m spacecraft` : `a ${L} m astronaut`} at the horizon of ${what} ($GM_\odot = ${tex(GM_SUN, 6)}\ \text{m}^3/\text{s}^2$), find $\Delta a$ in $\text{m/s}^2$.`,
              visual: { type: 'gr-dustball', params: { mode: 'tides', body, readout: false }, caption: 'A freely falling ball of dust near a black hole: stretched radially, squeezed across. The size is the question.' },
              answer: key, units: 'm/s^2', tol: { rel: 0.01 },
              errors: apart([{ value: (L * C ** 6) / (8 * GM * GM), feedback: t`$r_s^3 = 8(GM)^3/c^6$, so $2GML/r_s^3 = Lc^6/4(GM)^2$: check the factor of 2.` }, { value: (L * C ** 6) / (4 * GM * GM) / 2, feedback: t`The radial tidal term is $2GML/r^3$; $GML/r^3$ is the transverse squeeze.` }], key),
              hints: [t`$GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$ and $c^6 = ${tex(C ** 6, 4)}$.`, t`$\Delta a = ${L}\times c^6/(4(GM)^2)$.`],
              teach: 'The physics at a horizon is tidal and finite, falling as 1/M²: coordinate singularities are not felt.',
              explain: t`$\Delta a = ${tex(key, 3)}\ \text{m/s}^2$ — ${key > 1e3 ? 'fatal long before the horizon for a stellar-mass hole' : 'unnoticeable: a big black hole’s horizon is locally ordinary'}.`,
            };
          },
        }),
        num({
          id: 'r5-period', skill: 'st-g.G-FORMS.1', difficulty: 3,
          gen(r) {
            const { what, a, e, b, h, key } = periodCase(r);
            return {
              prompt: t`By Stokes’ theorem the 1-form $\tfrac12(x\,dy - y\,dx)$ measures area, and along an orbit it gives $dA/dt = h/2$. For ${what} round the Earth — $a = ${a}\ \text{km}$, $e = ${e}$, so $b = a\sqrt{1 - e^2}$ and $h = \sqrt{\mu a(1 - e^2)}$ with $\mu = ${MU_EARTH}\ \text{km}^3/\text{s}^2$ — find the period, $T = \pi ab/(h/2)$, in hours.`,
              visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.05, 1.05], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: [`${r6(e)} + cos(t)`, `${r6(Math.sqrt(1 - e * e))}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2 }], points: [{ x: 0, y: 0, r: 6, color: 'teal', label: 'Earth (focus)' }] }, caption: t`The orbit’s shape with $a$ scaled to 1 (Earth not to scale).` },
              answer: key, units: 'h', tol: { rel: 0.005 },
              errors: apart([{ value: (2 * Math.PI * a * a) / h / 3600, feedback: t`The area is $\pi ab$, not $\pi a^2$.` }, { value: key / 2, feedback: t`$dA/dt = h/2$, so $T = 2\pi ab/h$.` }], key),
              hints: [t`$h = ${tex(h, 5)}\ \text{km}^2/\text{s}$, $b = ${tex(b, 5)}\ \text{km}$.`, t`$T = 2\pi ab/h$ seconds; divide by 3600.`],
              teach: 'The area form plus constant angular momentum gives Kepler: T = 2πab/h = 2π√(a³/μ).',
              explain: t`$T = ${nice(key, 4)}\ \text{h}$, equal to $2\pi\sqrt{a^3/\mu}$ — the period depends only on $a$. (Two-body model; real orbits are perturbed.)`,
            };
          },
        }),
      ],
    },
  ],
});
