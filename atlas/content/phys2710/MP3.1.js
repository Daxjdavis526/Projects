// Relativistic momentum — why Newton's mv cannot be conserved in every
// frame (Lewis and Tolman's glancing collision, worked with numbers), the
// conserved p = γmv, F = dp/dt under a constant force (momentum grows
// linearly for ever, the speed saturates), and momentum measured by bending
// in a magnet: Fermilab's muon g − 2 ring, bubble-chamber tracks, and the
// cyclotron falling out of step. Bertozzi's electrons, the work–energy
// integral and the energy triangle are in phys2220.R1.4 and not repeated.
// Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, MEC2, MPC2, MMUC2 } from './_constants.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const gb = (b) => b * g(b);                       // p/(mc) at speed βc
const fromP = (k) => k / Math.sqrt(1 + k * k);    // speed β for p = k·mc
const CG = C / 1e9;                               // 0.299 792 458: p (GeV/c) = 0.2998 B (T) r (m) for charge e
const TAU_E = MEC2 / (C / 1e9);                   // ns·(MV/m): mc/(eE) for an electron = 1.7045/E ns

// the worked example: Lewis and Tolman's glancing collision
const LT = { u: 0.3, v: 0.8 };
LT.gv = g(LT.v); LT.gu = g(LT.u); LT.uy = LT.u / LT.gv;
LT.vb = Math.hypot(LT.v, LT.uy); LT.gB = g(LT.vb);

/** p/(mc) against v/c: Newton's line and the relativistic curve, with optional marks. */
function pGraph({ points = [], hlines = [], vlines = [], y = 6, x = [0, 1], caption }) {
  return {
    type: 'graph',
    params: {
      x, y: [0, y], aspect: 'wide', xlabel: 'speed v/c', ylabel: 'momentum p/(mc)', axesAt: 'edge',
      curves: [
        { fn: 'x', color: 'ink3', dash: true, width: 2, label: 'Newton: mv', labelAt: r6(x[0] + 0.8 * (x[1] - x[0])), labelDx: 6, labelDy: 14 },
        { fn: 'x/sqrt(1 - x^2)', color: 'gold', width: 2.6, label: 'γmv', labelAt: r6(x[0] + 0.85 * (x[1] - x[0])), labelDx: -10, labelDy: -10, labelAlign: 'right' },
      ],
      vlines: [{ x: 1, label: 'c', color: 'bad' }, ...vlines],
      hlines, points,
    },
    caption: caption ?? 'Momentum against speed for any particle, in units of mc. Newton’s mv (dashed) would reach mc at the speed of light; the conserved γmv (gold) grows without limit as v approaches c.',
  };
}

/** The glancing collision in frame S, before and (optionally) after: A moves up and down; B crosses at v and drifts at u/γ. */
function collision({ u, v, after = true, caption }) {
  const uy = u / g(v), k = 2;                        // arrow length per unit of c
  const ball = (x, y, col, text, dx, dy, al) => [circle(x, y, 0.13, col, 2.2), label(x, y, text, col, dx, dy, al)];
  const curves = [], points = [], arrows = [];
  const add = ([c0, l0]) => { curves.push(c0); points.push(l0); };
  // before
  add(ball(-0.3, -0.95, 'accent', `A: ${u}c up`, 14, 0, 'left'));
  arrows.push({ from: [-0.3, -0.8], to: [-0.3, r6(-0.8 + k * u)], color: 'accent', width: 2.4 });
  add(ball(-2.3, 0.75, 'violet', `B: ${v}c across, ${fmt(uy, 3)}c down`, -12, -24, 'left'));
  arrows.push({ from: [-2.15, 0.75], to: [r6(-2.15 + k * v), r6(0.75 - k * uy)], color: 'violet', width: 2.4 });
  points.push(label(-1.3, 1.35, after ? 'before' : 'frame S, before the collision', 'ink3', 0, 0, 'center'));
  if (after) {
    curves.push(seg(2.25, -1.4, 2.25, 1.4, 'ink4', 1, true));
    add(ball(3.3, -0.25, 'accent', `A: ${u}c down`, 14, 0, 'left'));
    arrows.push({ from: [3.3, -0.4], to: [3.3, r6(-0.4 - k * u)], color: 'accent', width: 2.4, dash: [5, 4] });
    add(ball(3.4, 0.55, 'violet', `B: ${v}c across, ${fmt(uy, 3)}c up`, -12, 24, 'left'));
    arrows.push({ from: [3.55, 0.55], to: [r6(3.55 + k * v), r6(0.55 + k * uy)], color: 'violet', width: 2.4, dash: [5, 4] });
    points.push(label(4.4, 1.35, 'after', 'ink3', 0, 0, 'center'));
  }
  return {
    type: 'graph',
    params: frame(after ? [-2.6, 6.2] : [-2.6, 1.2], [-1.5, 1.5], { aspect: 'wide', curves, arrows, points }),
    caption: caption ?? 'A glancing collision of two identical balls, seen from frame S (A’s launcher at rest). Arrows are velocities, across and up–down to one scale; positions are schematic.',
  };
}

/** A circular track in a field into the page (×), with its radius marked; 'arc' draws only part of it. */
function ring({ r, B, what, caption, track = 'full' }) {
  const R0 = 1.1, crosses = [];
  const arc = track !== 'full';
  // a positive charge in a field into the page circles anticlockwise
  const tEnd = arc ? 3.4 : 0, tR = arc ? 2.3 : -Math.PI / 4;
  // field marks, kept clear of the radius line
  for (const [x, y] of [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6], [0, 0.75], [0, -0.75]]) if (Math.abs(x * Math.sin(tR) - y * Math.cos(tR)) > 0.25) crosses.push(label(x, y, '×', 'ink3', 0, 0, 'center'));
  const at = (th, k = R0) => [r6(k * Math.cos(th)), r6(k * Math.sin(th))];
  const tan = (th) => [-Math.sin(th), Math.cos(th)];
  const [ex, ey] = at(tEnd), [tx, ty] = tan(tEnd);
  return {
    type: 'graph',
    params: frame([-2.6, 2.6], [-1.35, 1.35], {
      aspect: 'wide',
      curves: [arc ? { param: [`${R0}*cos(t)`, `${R0}*sin(t)`], t: [1.0, tEnd], color: 'gold', width: 2.6 } : circle(0, 0, R0, 'gold', 2.6), seg(0, 0, ...at(tR), 'ink2', 1.4, true)],
      arrows: [{ from: [r6(ex - 0.45 * tx), r6(ey - 0.45 * ty)], to: [r6(ex + 0.02 * tx), r6(ey + 0.02 * ty)], color: 'gold', width: 2.6 }],
      points: [...crosses, label(...at(tR, 0.55), `r = ${r}`, 'ink2', arc ? -10 : 10, arc ? 0 : 4, arc ? 'right' : 'left'), label(...at(arc ? 1.6 : 0.3, R0), what, 'gold', 10, arc ? -10 : 0, 'left'), label(-2.5, 1.2, `B = ${B} T, into the page (×)`, 'ink3', 0, 0, 'left')],
    }),
    caption,
  };
}

export default lesson({
  id: 'phys2710.MP3.1',
  title: 'Relativistic momentum',
  minutes: 13, difficulty: 3,
  intro: t`In Newton’s mechanics the total of $m\vec v$ is conserved in every collision, seen from any frame. Combine that with the relativistic velocity rules and it fails: a collision that conserves $m\vec v$ in one frame breaks it in another. The quantity conserved in **every** inertial frame is

$$\vec p = \gamma m\vec v = \frac{m\vec v}{\sqrt{1 - v^2/c^2}}, \qquad \vec F = \frac{d\vec p}{dt}$$

where $m$ is the particle’s mass — the same in every frame — and $\gamma$ uses the particle’s own speed. At everyday speeds $\gamma \approx 1$ and Newton is back. Near $c$, $p$ grows without limit while $v$ creeps toward $c$: a steady force adds momentum at a steady rate for ever, but never carries a massive particle to the speed of light. A magnet bends a charge along a circle of radius $r = p/(qB)$, which is how momentum is measured in practice.

> You met $p = \gamma mv$, and Bertozzi’s electrons that never reach $c$, in [Relativistic momentum and energy](#/lesson/phys2220.R1.4). Here: why momentum *must* take this form, and what it does under a steady force and in a magnet.`,
  symbols: [
    { tex: '\\vec p', text: t`momentum, in kg·m/s — or in MeV/$c$ or GeV/$c$, particle physics’ units: $pc$ in MeV` },
    { tex: 'm', text: t`the particle’s mass, the same in every frame; $mc^2$ is its rest energy (${fmt(MEC2, 4)} MeV for an electron, ${fmt(MPC2, 6)} MeV for a proton)` },
    { tex: '\\vec v', text: 'the particle’s velocity, in m/s' },
    { tex: '\\gamma', text: t`$1/\sqrt{1 - v^2/c^2}$, with $v$ the particle’s speed` },
    { tex: '\\vec F', text: 'the net force on the particle, in N' },
    { tex: 'q,\\ B,\\ r', text: t`the particle’s charge (C), the magnetic field across its path (T), and the radius of the circle it then follows (m)` },
  ],
  why: 'Every particle detector measures momentum by bending tracks in a magnet, and every circular accelerator is sized by r = p/(qB). Getting momentum right is the difference between a ring that holds its beam and one that loses it.',
  visual: {
    type: 'graph',
    title: 'A steady force: momentum rises for ever, speed stalls',
    lead: t`An electron starts from rest in a uniform electric field $\mathcal E$. The force $e\mathcal E$ is constant, so its momentum grows in a straight line, $p = e\mathcal E t$ — exactly as Newton says. Plotted in units of $mc$, that line (dashed) is also the speed Newton’s $p = mv$ would give. The gold curve is the real speed.`,
    tasks: [
      t`At $\mathcal E = 1$ MV/m, after ${fmt(TAU_E, 3)} ns the momentum reaches $mc$. Newton’s electron would be at $c$; the real one is at $${fmt(fromP(1), 3)}c$.`,
      t`Run the clock to 10 ns: $p = ${fmt(10 / TAU_E, 3)}\,mc$ and still climbing; the speed is only $${fmt(fromP(10 / TAU_E), 4)}c$.`,
      'Multiply the field by 10: the same curves, ten times faster. Everything depends only on eℰt/(mc).',
    ],
    params: {
      x: [0, 10], y: [0, 2.2], aspect: 'wide', xlabel: 'time t (ns)', ylabel: 'p/(mc) or v/c', axesAt: 'edge',
      constants: { k: r6(TAU_E) },
      sliders: [
        { key: 'E', label: 'Field $\\mathcal E$', min: 0.2, max: 10, step: 0.1, value: 1, unit: '\\mathrm{MV/m}', explain: 'The force on the electron is $e\\mathcal E$. Accelerating structures run at tens of MV/m.' },
        { key: 'tt', label: 'Time $t$', min: 0, max: 10, step: 0.05, value: 3, unit: '\\mathrm{ns}', explain: 'Time since the electron left rest, on the lab’s clocks.' },
      ],
      curves: [
        { fn: 'x*E/k', color: 'ink3', dash: true, width: 2, label: 'p/(mc) — and Newton’s v/c', labelAt: 2.6, labelDx: -10, labelDy: 0, labelAlign: 'right' },
        { fn: '(x*E/k)/sqrt(1 + (x*E/k)^2)', color: 'gold', width: 2.6, label: 'real v/c', labelAt: 6, labelDx: 0, labelDy: 16 },
      ],
      hlines: [{ y: 1, label: 'c', color: 'bad' }],
      points: [{ x: 'tt', y: 'tt*E/k', color: 'ink2', r: 4.5 }, { x: 'tt', y: '(tt*E/k)/sqrt(1 + (tt*E/k)^2)', color: 'gold', r: 5 }],
      readouts: [
        { label: t`$p/(mc)$`, expr: 'tt*E/k', digits: 4 },
        { label: t`$v/c$`, expr: '(tt*E/k)/sqrt(1 + (tt*E/k)^2)', digits: 5 },
        { label: t`$\gamma$`, expr: 'sqrt(1 + (tt*E/k)^2)', digits: 4 },
        { label: 'Newton’s v/c', expr: 'tt*E/k', digits: 4 },
      ],
    },
    caption: t`An electron in a uniform field from rest, with $p = e\mathcal E t$ and $v = p/(\gamma m)$, so $v/c = (p/mc)/\sqrt{1 + (p/mc)^2}$. Ignores the radiation the electron gives off, which is negligible for straight-line acceleration at these fields.`,
  },
  example: {
    prompt: t`Lewis and Tolman’s 1909 argument. Two identical balls are launched at $u = ${LT.u}c$, each from its own launcher, at right angles to the line along which the launchers move apart at $v = ${LT.v}c$. In frame S (A’s launcher at rest) ball A moves straight up and ball B crosses it, and they strike a glancing blow: by symmetry each reverses its up–down velocity. Show that the up–down total of $mv$ is **not** conserved in S, and that $\gamma mv$ is.`,
    visual: collision({ u: LT.u, v: LT.v }),
    steps: [
      { label: 'B’s up–down speed in S', text: t`In its own launcher’s frame B moves only up–down, at $u$. Distances across the motion are the same in both frames, but B’s launcher clock runs slow: each second there is $\gamma_v$ seconds in S. So in S, B moves down at $u/\gamma_v = ${LT.u}c/${fmt(LT.gv, 4)} = ${fmt(LT.uy, 3)}c$, while crossing at $${LT.v}c$.` },
      { label: 'Newton’s momentum', text: t`Up–down $mv$ before: $m(${LT.u}c) - m(${fmt(LT.uy, 3)}c) = +${fmt(LT.u - LT.uy, 2)}\,mc$. After, both reverse: $-${fmt(LT.u - LT.uy, 2)}\,mc$. The total changed by $${fmt(2 * (LT.u - LT.uy), 2)}\,mc$ with no outside force: $m\vec v$ is not conserved.` },
      { label: 'Use each ball’s own γ', text: t`A’s speed is $${LT.u}c$, so $\gamma_A = ${fmt(LT.gu, 5)}$ and its momentum is $${fmt(LT.gu * LT.u, 4)}\,mc$. B’s speed is $\sqrt{${LT.v}^2 + ${fmt(LT.uy, 3)}^2}\,c = ${fmt(LT.vb, 4)}c$, so $\gamma_B = ${fmt(LT.gB, 5)}$, and B’s up–down momentum is $${fmt(LT.gB, 5)}\times${fmt(LT.uy, 3)}\,mc = ${fmt(LT.gB * LT.uy, 4)}\,mc$.` },
      { label: 'Exactly balanced', text: t`The two cancel before and after, so $\gamma m\vec v$ is conserved. Not by luck: $1 - \beta_B^2 = 1 - v^2 - u^2(1 - v^2) = (1 - v^2)(1 - u^2)$, so $\gamma_B = \gamma_u\gamma_v$ and B’s up–down momentum is $\gamma_u\gamma_v\,m\,u/\gamma_v = \gamma_u m u$ — A’s, for any $u$ and $v$.` },
      { label: 'Sense check', text: t`As $u \to 0$, both momenta become $mu$ and Newton is right for the up–down motion. The factor $\gamma$ belongs to each particle’s own speed: B carries a large $\gamma$ because it crosses at $${LT.v}c$, which is exactly what makes up for its slower up–down drift.` },
    ],
    answer: t`$m\vec v$ changes by $${fmt(2 * (LT.u - LT.uy), 2)}\,mc$; $\gamma m\vec v$ balances at $${fmt(LT.gu * LT.u, 4)}\,mc$ each way, because $\gamma_B = \gamma_u\gamma_v$.`,
  },
  practice: [
    num({
      id: 'p-to-speed', difficulty: 2,
      gen(r) {
        const pc = r.pick([0.25, 0.511, 1.0, 2.0]);
        const k = pc / MEC2, b = fromP(k);
        return {
          prompt: t`A bubble-chamber photograph shows an electron with momentum $p = ${pc}$ MeV/$c$. How fast is it moving? Give $v/c$. (For an electron $m_ec^2 = ${fmt(MEC2, 4)}$ MeV.)`,
          answer: b, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`That is Newton’s $v = p/m$. With $p = \gamma mv$, solve for $v$: $v/c = (p/mc)/\sqrt{1 + (p/mc)^2}$.` }],
          hints: [t`In units of $mc$: $p/(m_ec) = pc/(m_ec^2) = ${fmt(k, 4)}$.`, t`Square $p/(mc) = \gamma\beta$ and solve: $\beta = \dfrac{p/mc}{\sqrt{1 + (p/mc)^2}}$.`],
          teach: 'Momentum fixes speed through p/(mc) = γβ, so β = (p/mc)/√(1 + (p/mc)²) — always below 1.',
          explain: t`$p/(mc) = ${fmt(k, 4)}$, so $\beta = ${fmt(k, 4)}/\sqrt{1 + ${fmt(k * k, 4)}} = ${fmt(b, 4)}$.${k >= 1 ? ` Newton’s $p/m$ would give $${fmt(k, 3)}c$ — at or beyond light speed.` : ''}`,
          visual: pGraph({ y: Math.max(4.5, Math.ceil(k * 1.4)), hlines: [{ y: r6(k), label: `p = ${pc} MeV/c`, color: 'accent' }], points: [{ x: r6(b), y: r6(k), color: 'gold', r: 5 }], caption: 'Where the horizontal line meets the gold curve is the speed. Newton’s line (dashed) crosses it at a higher speed — or not at all before c.' }),
        };
      },
    }),
    num({
      id: 'double-p', difficulty: 3,
      gen(r) {
        const [b0, f] = r.pick([[0.6, 2], [0.8, 2], [0.9, 3], [0.5, 4]]);
        const k = f * gb(b0), b = fromP(k);
        return {
          prompt: t`A proton moves at $${b0}c$. A push multiplies its momentum by ${f}. How fast does it now move? Give $v/c$.`,
          answer: b, tol: { rel: 0.003 },
          errors: [{ value: f * b0, feedback: t`Multiplying the speed by ${f} is Newton’s rule. Momentum is $\gamma mv$: multiply $\gamma\beta$ by ${f}, then convert back.` }],
          hints: [t`At $${b0}c$, $p/(mc) = \gamma\beta = ${fmt(gb(b0), 4)}$.`, t`Afterwards $p/(mc) = ${fmt(k, 4)}$; then $\beta = \dfrac{p/mc}{\sqrt{1 + (p/mc)^2}}$.`],
          teach: 'Near c, multiplying the momentum barely changes the speed: γβ grows without limit while β is capped at 1.',
          explain: t`$\gamma\beta$ goes from $${fmt(gb(b0), 4)}$ to $${fmt(k, 4)}$, so $\beta = ${fmt(k, 4)}/\sqrt{1 + ${fmt(k * k, 4)}} = ${fmt(b, 4)}$: ${f} times the momentum, but only ${fmt(b / b0, 3)} times the speed.`,
          visual: pGraph({ y: Math.max(4, Math.ceil(k * 1.25)), points: [{ x: r6(b0), y: r6(gb(b0)), color: 'accent', r: 5, label: 'before', labelDx: -10, labelDy: -10, labelAlign: 'right' }, { x: r6(b), y: r6(k), color: 'gold', r: 5, label: 'after', labelDx: -10, labelDy: -4, labelAlign: 'right' }], caption: 'Momentum against speed. The push moves the proton up the gold curve; near c a large step up is a small step across.' }),
        };
      },
    }),
    num({
      id: 'lewis-tolman', difficulty: 3,
      gen(r) {
        const [u, v] = r.pick([[0.5, 0.6], [0.2, 0.9], [0.6, 0.8]]);
        const uy = u / g(v), vb = Math.hypot(v, uy);
        return {
          prompt: t`In a Lewis–Tolman collision, ball A moves straight up at $${u}c$ in frame S, while ball B crosses at $${v}c$ and drifts down at $u/\gamma_v = ${fmt(uy, 4)}c$. What is ball B’s Lorentz factor $\gamma_B$ in S?`,
          answer: g(vb), tol: { rel: 0.002 },
          errors: [{ value: g(v), feedback: t`That is $\gamma$ for the crossing speed alone. B’s own speed includes its drift: $\beta_B^2 = ${v}^2 + ${fmt(uy, 4)}^2$.` }, { value: g(u), feedback: 'That is A’s Lorentz factor. B moves faster in S.' }],
          hints: [t`B’s speed in S: $\beta_B = \sqrt{${v}^2 + ${fmt(uy, 4)}^2}$.`, t`Then $\gamma_B = 1/\sqrt{1 - \beta_B^2}$. Compare it with $\gamma_u\gamma_v$.`],
          teach: t`In the Lewis–Tolman collision $\gamma_B = \gamma_u\gamma_v$ exactly, which makes B’s up–down $\gamma mv$ equal A’s.`,
          explain: t`$\beta_B = ${fmt(vb, 5)}$, so $\gamma_B = ${fmt(g(vb), 5)} = \gamma_u\gamma_v = ${fmt(g(u), 5)}\times${fmt(g(v), 5)}$. B’s up–down momentum is then $\gamma_B m\,(${fmt(uy, 4)}c) = ${fmt(g(vb) * uy, 4)}\,mc$, the same as A’s $\gamma_u m u = ${fmt(g(u) * u, 4)}\,mc$.`,
          visual: collision({ u, v, after: false, caption: 'The two balls just before their glancing collision, seen from frame S. Arrow lengths show velocities to one common scale.' }),
        };
      },
    }),
    num({
      id: 'g2-ring', difficulty: 2, transfer: true,
      prompt: t`Fermilab’s Muon $g - 2$ experiment stores muons of momentum $p = 3.094$ GeV/$c$ in a ring with a uniform vertical field $B = 1.45$ T. A muon carries charge $e$. What is the radius of the muons’ orbit, in metres? ($m_\mu c^2 = ${fmt(MMUC2, 6)}$ MeV.)`,
      answer: 3.094 / (CG * 1.45), units: 'm', tol: { rel: 0.005 },
      errors: [{ value: (MMUC2 / 1000) / (CG * 1.45), feedback: t`That uses Newton’s $p = mv$ with $v \approx c$, i.e. $p = m_\mu c$. The real momentum is $\gamma m v$, ${fmt(3094 / MMUC2, 3)} times larger.` }],
      hints: [t`The magnetic force $qvB$ supplies the centripetal force $\gamma mv^2/r$, so $r = \gamma mv/(qB) = p/(qB)$.`, t`With $p$ in GeV/$c$: $r = \dfrac{p}{eB} = \dfrac{3.094\times10^9\ \text{eV}/c}{e\times1.45\ \text{T}} = \dfrac{3.094\times10^9}{(2.998\times10^8)(1.45)}$ m.`],
      teach: 'A charge in a magnetic field circles with r = p/(qB), where p is the relativistic momentum γmv.',
      explain: t`$r = \dfrac{3.094\times10^9}{(${tex(C, 4)})\times1.45}\ \text{m} = ${fmt(3.094 / (CG * 1.45), 3)}$ m. The real ring has a radius of 7.112 m, with the field set to 1.4513 T. The muons carry $\gamma = ${fmt(Math.hypot(3094, MMUC2) / MMUC2, 3)}$: Newton’s $mv$ would give a ring ${fmt(3094 / MMUC2, 3)} times too small.`,
      visual: ring({ r: '?', B: 1.45, what: 'muons, 3.094 GeV/c', caption: 'The muon storage ring seen from above, with its field into the page. The muons circle at nearly the speed of light. Not to scale.' }),
    }),
    num({
      id: 'constant-force', difficulty: 3,
      gen(r) {
        const [E, b] = r.pick([[1, 0.9], [5, 0.99], [20, 0.999], [2, 0.95]]);
        const tns = (gb(b) * TAU_E) / E;
        return {
          prompt: t`An electron starts from rest in a uniform electric field of ${E} MV/m. How long, in nanoseconds of lab time, until it moves at $${b}c$? ($m_ec^2 = ${fmt(MEC2, 4)}$ MeV.)`,
          answer: tns, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: (b * TAU_E) / E, feedback: t`That is Newton’s $t = mv/F$. The force adds momentum $\gamma mv$, not $mv$: $t = \gamma m v/(e\mathcal E)$.` }],
          hints: [t`$F = dp/dt$ with constant $F = e\mathcal E$ gives $p = e\mathcal E t$, so $t = p/(e\mathcal E) = \gamma\beta\,mc/(e\mathcal E)$.`, t`$mc/(e\mathcal E) = \dfrac{${fmt(MEC2, 4)}\ \text{MV}}{${E}\ \text{MV/m}}\cdot\dfrac{1}{c} = ${fmt(TAU_E / E, 4)}$ ns, and $\gamma\beta = ${fmt(gb(b), 4)}$.`],
          teach: 'A constant force adds momentum at a constant rate, p = Ft; the speed follows from p = γmv and never reaches c.',
          explain: t`$t = \gamma\beta\,\dfrac{mc}{e\mathcal E} = ${fmt(gb(b), 4)}\times${fmt(TAU_E / E, 4)}\ \text{ns} = ${fmt(tns, 3)}$ ns — ${fmt(g(b), 3)} times longer than Newton’s estimate.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(tns * 1.3)], y: [0, 1.1], aspect: 'wide', xlabel: 'time (ns)', ylabel: 'v/c', axesAt: 'edge',
              constants: { k: r6(TAU_E / E) },
              curves: [{ fn: 'x/k', color: 'ink3', dash: true, width: 2, label: 'Newton', labelAt: r6((0.6 * b * TAU_E) / E), labelDx: -8, labelDy: 0, labelAlign: 'right' }, { fn: '(x/k)/sqrt(1 + (x/k)^2)', color: 'gold', width: 2.6, label: 'real v/c', labelAt: r6(tns * 1.1), labelDx: 0, labelDy: 16 }],
              hlines: [{ y: b, label: `${b}c`, color: 'accent' }],
            },
            caption: 'An electron’s speed under a constant force: Newton’s straight line (dashed) and the real curve (gold), which approaches c without reaching it.',
          },
        };
      },
    }),
    num({
      id: 'cyclotron', difficulty: 2,
      gen(r) {
        const K = r.pick([10, 20, 50]);
        const G = 1 + K / MPC2;
        return {
          prompt: t`A cyclotron’s alternating voltage is tuned to the orbit frequency of slow protons, $f_0 = qB/(2\pi m)$. A proton with kinetic energy $K = ${K}$ MeV circles in the same field. Its momentum is $\gamma mv$, so its orbit frequency is $f = qB/(2\pi\gamma m)$. What is $f/f_0$? ($m_pc^2 = ${fmt(MPC2, 6)}$ MeV.)`,
          answer: 1 / G, tol: { abs: 0.0004 },
          errors: [{ value: 1, feedback: t`With Newton’s $p = mv$ the frequency would not depend on speed — the cyclotron’s whole trick. The relativistic $\gamma$ spoils it.` }],
          hints: [t`$f/f_0 = 1/\gamma$, and $\gamma = E/(mc^2) = 1 + K/(mc^2)$.`, t`$\gamma = 1 + ${K}/${fmt(MPC2, 5)}$.`],
          teach: 'In a magnet the orbit period grows with γ: f = qB/(2πγm). A fixed-frequency cyclotron falls out of step once γ − 1 is a few per cent.',
          explain: t`$\gamma = ${fmt(G, 5)}$, so $f/f_0 = ${fmt(1 / G, 4)}$: the proton arrives ${fmt(100 * (1 - 1 / G), 2)}% late each turn. Over the hundreds of turns of a cyclotron that adds up to being out of step; it is why Berkeley’s 1946 synchrocyclotron lowered its frequency as each bunch of protons sped up.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 100], y: [0.88, 1.01], aspect: 'wide', xlabel: 'proton kinetic energy (MeV)', ylabel: 'f/f₀', axesAt: 'edge',
              curves: [{ fn: `1/(1 + x/${r6(MPC2)})`, color: 'gold', width: 2.6, label: 'f/f₀ = 1/γ', labelAt: 80, labelDx: 0, labelDy: -14 }, { fn: '1', color: 'ink3', dash: true, width: 2, label: 'Newton', labelAt: 85, labelDx: 0, labelDy: -10 }],
              vlines: [{ x: K, label: `${K} MeV`, color: 'accent' }],
            },
            caption: 'A proton’s orbit frequency in a fixed magnetic field, relative to its low-speed value: Newton (dashed) and relativity (gold).',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bubble', difficulty: 3, transfer: true,
      gen(r) {
        const [B, rr] = r.pick([[1.5, 2.0], [1.0, 2.5], [1.8, 1.2]]);
        const pc = CG * B * rr, k = (pc * 1000) / MPC2, b = fromP(k);
        return {
          prompt: t`A proton crosses a liquid-hydrogen bubble chamber in a ${B} T field, and its track curves with radius ${rr} m. How fast is it moving? Give $v/c$. ($m_pc^2 = ${fmt(MPC2, 6)}$ MeV.)`,
          answer: b, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`That is $p/(mc)$ — Newton’s speed. With $p = \gamma mv$, $\beta = (p/mc)/\sqrt{1 + (p/mc)^2}$.` }],
          hints: [t`The radius gives the momentum: $pc = ecBr$, which is $0.2998$ GeV for each tesla-metre.`, t`Then $p/(mc) = pc/(mc^2)$ is $\gamma\beta$; solve for $\beta$.`],
          teach: 'Track radius gives momentum, p = qBr (0.2998 GeV/c per T·m); momentum and mass give the speed through γβ = p/(mc).',
          explain: t`$pc = (0.2998)(${B})(${rr})$ GeV $= ${fmt(pc * 1000, 4)}$ MeV, so $p/(mc) = ${fmt(k, 4)}$ and $\beta = ${fmt(k, 4)}/\sqrt{1 + ${fmt(k * k, 4)}} = ${fmt(b, 3)}$. Newton would say $${fmt(k, 3)}c$.`,
          visual: ring({ r: `${rr} m`, B, what: 'proton track', track: 'arc', caption: 'A proton track in a bubble chamber, seen along the field. Only part of the circle lies in the chamber. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const [b1, b2] = r.pick([[0.5, 0.99], [0.6, 0.95], [0.8, 0.995]]);
        const R = gb(b2) / gb(b1);
        return {
          prompt: t`A particle’s speed rises from $${b1}c$ to $${b2}c$. By what factor does its momentum rise?`,
          answer: R, tol: { rel: 0.005 },
          errors: [{ value: b2 / b1, feedback: t`That is the ratio of speeds — Newton’s answer. Momentum is $\gamma mv$: compare $\gamma\beta$.` }, { value: g(b2) / g(b1), feedback: t`That compares $\gamma$ alone; momentum is $\gamma\beta$.` }],
          hints: [t`Momentum is $\gamma\beta\,mc$, so the factor is $(\gamma\beta)_2/(\gamma\beta)_1$.`],
          teach: 'Momentum ratios are ratios of γβ, which run away as v approaches c.',
          explain: t`$\gamma\beta$ goes from $${fmt(gb(b1), 4)}$ to $${fmt(gb(b2), 4)}$: a factor $${fmt(R, 3)}$, for ${fmt(b2 / b1, 3)} times the speed.`,
          visual: pGraph({ y: Math.ceil(gb(b2) * 1.2), points: [{ x: b1, y: r6(gb(b1)), color: 'accent', r: 5 }, { x: b2, y: r6(gb(b2)), color: 'gold', r: 5 }], caption: 'Momentum against speed in units of mc, with the two speeds marked.' }),
        };
      },
    }),
    mcq({
      id: 'cp-same-p', difficulty: 2,
      prompt: 'An electron and a proton each have momentum 1.00 GeV/c. Which is true?',
      visual: pGraph({ y: 4, x: [0, 1], points: [{ x: r6(fromP(1000 / MPC2)), y: r6(1000 / MPC2), color: 'violet', r: 5, label: 'proton', labelDx: -10, labelDy: -8, labelAlign: 'right' }], caption: t`Momentum against speed in units of each particle’s own $mc$. For the proton, 1 GeV/c is ${fmt(1000 / MPC2, 3)} mc (marked); for the electron it is ${fmt(1000 / MEC2, 4)} mc, far off the top.` }),
      choices: [
        t`The electron moves within a millionth of $c$; the proton at about $${fmt(fromP(1000 / MPC2), 2)}c$`,
        'They move at the same speed, because they have the same momentum',
        t`The electron moves ${fmt(MPC2 / MEC2, 4)} times faster than the proton`,
        'The proton moves faster, because its large mass carries momentum more easily',
      ],
      answer: 0,
      why: {
        1: t`Equal momentum means equal $\gamma mv$, not equal $v$: the lighter particle needs a far larger $\gamma$.`,
        2: t`That is Newton’s $v = p/m$; it would put the electron far beyond $c$. Both speeds follow from $\beta = (p/mc)/\sqrt{1 + (p/mc)^2}$.`,
        3: t`For the same momentum the heavier particle is slower: $p/(mc)$ is smaller, so $\gamma\beta$ — and $\beta$ — is smaller.`,
      },
      hints: [t`Work out $p/(mc)$ for each: 1000 MeV divided by each rest energy.`],
      teach: 'At equal momentum the lighter particle is faster but never beyond c: β = (p/mc)/√(1 + (p/mc)²).',
      explain: t`Proton: $p/(mc) = ${fmt(1000 / MPC2, 4)}$, so $\beta = ${fmt(fromP(1000 / MPC2), 4)}$. Electron: $p/(mc) = ${fmt(1000 / MEC2, 4)}$, so $1 - \beta = ${tex(1 - fromP(1000 / MEC2), 2)}$.`,
    }),
  ],
  sources: [
    { label: 'Lewis & Tolman (1909), The principle of relativity, and non-Newtonian mechanics, Proc. Am. Acad. Arts Sci. 44, 711', url: 'https://doi.org/10.2307/20022495' },
    { label: 'Muon g−2 Collaboration (2021), Measurement of the positive muon anomalous magnetic moment to 0.46 ppm, Phys. Rev. Lett. 126, 141801', url: 'https://doi.org/10.1103/PhysRevLett.126.141801' },
    { label: 'OpenStax University Physics Vol. 3, §5.8 Relativistic momentum', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-8-relativistic-momentum' },
  ],
});

