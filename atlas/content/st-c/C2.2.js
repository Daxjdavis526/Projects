// Torsion: how fast a space curve leaves its osculating plane; the formula
// in any parameter; τ ≡ 0 iff planar; its sign (handedness).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, cross, dot, norm } from './_dg.js';

const t = String.raw;
const vecTeX = (v) => t`(${v.map((x) => nice(x, 3)).join(',\ ')})`;

// the family (t, t², h t³) as a still picture at t0
const cubicPic = (h, t0, caption, show = ['T', 'N', 'B']) => ({
  type: 'c3-curve',
  params: { curve: { param: ['t', 't^2', `${h}*t^3`], t: [-1.3, 1.3] }, at: t0, fixed: true, show, readouts: [], range: 2.4, scale: { frame: 0.9 } },
  caption,
});

export default lesson({
  id: 'st-c.C2.2',
  title: 'Torsion',
  minutes: 12, difficulty: 3,
  intro: t`Curvature says how fast a curve turns *within* its osculating plane, the plane of $\mathbf T$ and $\mathbf N$. **Torsion** says how fast that plane itself turns about $\mathbf T$ — how quickly the curve escapes from the plane it was momentarily in. It is defined by $\mathbf B' = -\tau\mathbf N$, and in any regular parameter it is

$$\tau = \frac{(\alpha'\times\alpha'')\cdot\alpha'''}{|\alpha'\times\alpha''|^2}.$$

Three facts make it useful: a curve with $\kappa > 0$ is **planar exactly when $\tau \equiv 0$**; near a point the curve leaves its osculating plane by about $\kappa\tau s^3/6$; and the **sign** of $\tau$ is its handedness — positive for a right-handed twist, flipping in a mirror.`,
  symbols: [
    { tex: t`\tau`, text: t`the torsion, in $\text{m}^{-1}$ (radians of twist of the osculating plane per metre)` },
    { tex: t`\alpha', \alpha'', \alpha'''`, text: 'the first three derivatives of the curve in whatever parameter it is given' },
    { tex: t`\alpha'\times\alpha''`, text: t`a vector along the binormal $\mathbf B$, of length $v^3\kappa$ ($v$ the speed)` },
    { tex: t`\mathbf B' = -\tau\mathbf N`, text: 'the defining equation; this course’s sign makes a right-handed helix have τ > 0' },
  ],
  why: t`Torsion is the second of the two numbers that pin down a curve’s shape. Do not confuse it with the **torsion tensor** of a connection, $T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$, met in module C12: same name, unrelated object — and general relativity’s connection has zero torsion tensor, while the worldlines in it can twist freely.`,
  visual: {
    type: 'c3-curve',
    title: 'Dial up a twist',
    lead: t`The curve $(t,\ t^2,\ h\,t^3)$: a parabola in the $xy$-plane lifted out of it by the $h\,t^3$ term. Watch the binormal $\mathbf B$ (teal) as the point moves, and the torsion readout.`,
    tasks: [
      t`Set $h = 0$. The curve is a flat parabola: $\mathbf B$ never moves and $\tau = 0$ everywhere.`,
      t`Set $h = 1$ (the twisted cubic) and put the point at $t = 0$: $\kappa = 2$ and $\tau = 3$. In general $\tau(0) = 3h$.`,
      t`Set $h = -1$, the mirror image in the $xy$-plane: $\kappa$ is unchanged and $\tau$ flips sign.`,
    ],
    params: {
      curve: { param: ['t', 't^2', 'h*t^3'], t: [-1.3, 1.3] },
      sliders: [{ key: 'h', label: 'lift $h$', min: -1.5, max: 1.5, step: 0.1, value: 1, explain: t`How strongly the $t^3$ term pulls the curve out of the $xy$-plane.` }],
      at: 0.4, show: ['T', 'N', 'B', 'shadows'], toggles: ['circle', 'shadows'], readouts: ['t', 'kappa', 'tau'], range: 2.4, speed: 0.5,
    },
    caption: t`$\kappa$ and $\tau$ from numerical derivatives (exactly: $\tau(t) = 3h/(9h^2t^4 + 9h^2t^2 + 1)$). Dashed lines are the curve’s shadows on the coordinate planes; with $h = 0$ the curve lies in its shadow on the floor.`,
  },
  example: {
    prompt: t`Find the torsion of the twisted cubic $\alpha(t) = (t,\ t^2,\ t^3)$ at every $t$. Where is it largest, and what happens far out along the curve?`,
    visual: cubicPic(1, 0, t`The twisted cubic and its frame at $t = 0$, where $\mathbf T = (1, 0, 0)$, $\mathbf N = (0, 1, 0)$, $\mathbf B = (0, 0, 1)$.`),
    steps: [
      { label: 'Derivatives', text: t`$\alpha' = (1, 2t, 3t^2)$, $\;\alpha'' = (0, 2, 6t)$, $\;\alpha''' = (0, 0, 6)$.` },
      { label: 'Cross product', text: t`$\alpha'\times\alpha'' = (2t\cdot6t - 3t^2\cdot2,\ -(6t - 0),\ 2) = (6t^2,\ -6t,\ 2)$.` },
      { label: 'Triple product', text: t`$(\alpha'\times\alpha'')\cdot\alpha''' = 2 \times 6 = 12$, and $|\alpha'\times\alpha''|^2 = 36t^4 + 36t^2 + 4$.` },
      { label: 'Torsion', text: t`$\tau(t) = \dfrac{12}{36t^4 + 36t^2 + 4} = \dfrac{3}{9t^4 + 9t^2 + 1}$.` },
      { label: 'Read it', text: t`$\tau > 0$ everywhere: the twisted cubic is right-handed along its whole length. It is largest at $t = 0$, where $\tau = 3$, and falls off like $1/(3t^4)$: far out, the curve is dominated by its $t^3$ term and is nearly planar on any short stretch.` },
      { label: 'Sense check', text: t`Units: a triple product of three derivatives over the square of a two-derivative cross product leaves $1/\text{length}$ ✓. Replacing $t^3$ by $-t^3$ (a mirror image) flips the triple product, and so $\tau$, but not $|\alpha'\times\alpha''|$ or $\kappa$ ✓.` },
    ],
    answer: t`$\tau(t) = \dfrac{3}{9t^4 + 9t^2 + 1}$: positive (right-handed) everywhere, largest ($\tau = 3$) at $t = 0$, tending to 0 far out.`,
  },
  practice: [
    num({
      id: 'tau-at', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), b = r.pick([1, 2]), c = r.pick([1, -1, 2]), t0 = r.pick([0, 1, 0.5, -1]);
        const d1 = [a, 2 * b * t0, 3 * c * t0 * t0], d2 = [0, 2 * b, 6 * c * t0], d3 = [0, 0, 6 * c];
        const cr = cross(d1, d2), tau = dot(cr, d3) / dot(cr, cr);
        const co = (k, s) => (k === 1 ? s : k === -1 ? `-${s}` : `${k}${s}`);
        const sx = 1.4 / Math.max(a * 1.3, b * 1.69, Math.abs(c) * 2.2);
        return {
          prompt: t`Find the torsion of $\alpha(t) = (${co(a, 't')},\ ${co(b, 't^2')},\ ${co(c, 't^3')})$ at $t = ${t0}$, to 3 significant figures.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${r6(a * sx)}*t`, `${r6(b * sx)}*t^2`, `${r6(c * sx)}*t^3`], t: [-1.3, 1.3] }, at: t0, fixed: true, show: ['T', 'N', 'B'], readouts: [], range: 2 }, caption: 'The curve (scaled down to fit) and its frame at the point. Scaling changes τ but not its sign.' },
          answer: tau, tol: { rel: 0.005 },
          errors: [{ value: dot(cr, d3) / norm(cr), feedback: t`Divide by $|\alpha'\times\alpha''|^2$, not $|\alpha'\times\alpha''|$.` }].filter((e) => Math.abs(e.value - tau) > 0.01 * Math.abs(tau)),
          hints: [t`$\alpha' = ${vecTeX(d1)}$, $\alpha'' = ${vecTeX(d2)}$, $\alpha''' = ${vecTeX(d3)}$ at $t = ${t0}$.`, t`$\alpha'\times\alpha'' = ${vecTeX(cr)}$; now $\tau = (\alpha'\times\alpha'')\cdot\alpha'''/|\alpha'\times\alpha''|^2$.`],
          teach: t`In any parameter, $\tau = (\alpha'\times\alpha'')\cdot\alpha'''/|\alpha'\times\alpha''|^2$.`,
          explain: t`$(\alpha'\times\alpha'')\cdot\alpha''' = ${nice(dot(cr, d3))}$ and $|\alpha'\times\alpha''|^2 = ${nice(dot(cr, cr))}$, so $\tau = ${nice(tau, 4)}$ — ${tau > 0 ? 'positive: a right-handed twist' : 'negative: a left-handed twist'} there.`,
        };
      },
    }),
    mcq({
      id: 'zero-torsion', difficulty: 2,
      prompt: t`Which of these curves has $\tau = 0$ at every point?`,
      visual: { type: 'calc-vectors3d', params: { range: 2, curves: [{ param: ['t', 't^2', 't^2'], t: [-1.2, 1.2], color: 'accent', width: 2.4, label: 'P' }, { param: ['t', 't^3', 't^2'], t: [-1.2, 1.2], color: 'gold', width: 2.4, label: 'Q', labelAt: 0.9 }] }, caption: t`Two of the four candidates, $(t, t^2, t^2)$ and $(t, t^3, t^2)$. Turn the picture: a planar curve seen edge-on looks like a straight line or a single arc.` },
      choices: [t`$(t,\ t^2,\ t^2)$`, t`$(t,\ t^2,\ t^3)$`, t`$(\cos t,\ \sin t,\ t)$`, t`$(t,\ t^3,\ t^2)$`],
      answer: 0,
      why: {
        1: t`The twisted cubic: $\tau = 3/(9t^4 + 9t^2 + 1) > 0$.`,
        2: t`A helix: constant $\tau = \tfrac12$ — it never settles into a plane.`,
        3: t`$(\alpha'\times\alpha'')\cdot\alpha''' = -12 \ne 0$; this curve twists (left-handed).`,
      },
      hints: ['A curve with τ ≡ 0 lies in a plane. Look for a linear relation between the coordinates.', t`For $(t, t^2, t^2)$: compare $y$ and $z$.`],
      teach: 'Zero torsion everywhere means the curve lies in a plane — and conversely.',
      explain: t`$(t, t^2, t^2)$ satisfies $y = z$: it is a parabola in that plane. Directly, $\alpha''' = 0$, so the triple product vanishes and $\tau \equiv 0$.`,
    }),
    mcq({
      id: 'mirror-reverse', difficulty: 2,
      prompt: t`A curve has torsion $\tau_0$ at a point. What is the torsion at the corresponding point of (i) the same curve traversed backwards, and (ii) its mirror image in a plane?`,
      visual: cubicPic(1, 0.5, t`The twisted cubic: reversing the direction flips $\mathbf T$ and $\mathbf B$ but keeps $\mathbf N$, which still points into the bend.`),
      choices: [t`(i) $\tau_0$; (ii) $-\tau_0$`, t`(i) $-\tau_0$; (ii) $\tau_0$`, t`(i) $-\tau_0$; (ii) $-\tau_0$`, t`(i) $\tau_0$; (ii) $\tau_0$`],
      answer: 0,
      why: {
        1: t`Reversing $t \to -t$ flips the signs of $\alpha'$ and $\alpha'''$ but not $\alpha''$, so the triple product $(\alpha'\times\alpha'')\cdot\alpha'''$ is unchanged.`,
        2: 'Reversal does not change handedness: a right-handed screw is right-handed from either end.',
        3: 'A reflection reverses the sign of every triple product, so it turns a right-handed curve into a left-handed one.',
      },
      hints: [t`Under $t \to -t$, each derivative picks up a factor $(-1)^k$.`, 'Is a right-handed screw still right-handed when you turn it round? In a mirror?'],
      teach: 'Torsion is unchanged by reversing the direction of travel and changes sign under a reflection: it measures handedness.',
      explain: t`(i) Factors $(-1)(+1)(-1) = +1$: $\tau$ is unchanged. (ii) A reflection has determinant $-1$, which multiplies the triple product by $-1$ while leaving lengths alone: $\tau \to -\tau$. Curvature is unchanged by both.`,
    }),
    order({
      id: 'planar-proof', difficulty: 3,
      prompt: t`Prove that a unit-speed curve with $\kappa > 0$ and $\tau \equiv 0$ lies in a plane. Order the steps.`,
      visual: cubicPic(0, 0.6, t`With $h = 0$ the curve is the parabola $(t, t^2, 0)$: $\mathbf B = (0, 0, 1)$ at every point.`),
      items: [
        t`$\mathbf B' = -\tau\mathbf N = 0$, so $\mathbf B$ is a constant vector $\mathbf B_0$.`,
        t`Let $f(s) = \big(\alpha(s) - \alpha(0)\big)\cdot\mathbf B_0$.`,
        t`Then $f'(s) = \mathbf T(s)\cdot\mathbf B_0 = 0$, since $\mathbf T \perp \mathbf B$.`,
        t`So $f(s) = f(0) = 0$ for all $s$: the curve lies in the plane through $\alpha(0)$ perpendicular to $\mathbf B_0$.`,
      ],
      hints: [t`What does $\tau = 0$ say about $\mathbf B$?`, 'To show a curve lies in a plane, show its displacement from a point is always perpendicular to a fixed vector.'],
      teach: 'Zero torsion freezes the binormal, and a frozen binormal is the normal of the plane the curve lives in.',
      explain: t`The converse holds too: in a plane, $\mathbf T$ and $\mathbf N$ stay in the plane, so $\mathbf B$ is the constant unit normal and $\tau = 0$. The hypothesis $\kappa > 0$ matters: where $\kappa = 0$ the frame is undefined, and two planar arcs in different planes can be joined through a straight piece.`,
    }),
    order({
      id: 'tau-formula', difficulty: 4,
      prompt: t`Derive $\tau = (\alpha'\times\alpha'')\cdot\alpha'''/|\alpha'\times\alpha''|^2$ for a curve with speed $v(t)$. Order the steps.`,
      visual: cubicPic(1, -0.6, t`$\alpha'$ points along $\mathbf T$; $\alpha''$ has parts along $\mathbf T$ and $\mathbf N$; only $\alpha'''$ reaches $\mathbf B$.`),
      items: [
        t`$\alpha' = v\,\mathbf T$.`,
        t`$\alpha'' = \dot v\,\mathbf T + v^2\kappa\,\mathbf N$ (using $\dot{\mathbf T} = v\kappa\mathbf N$).`,
        t`$\alpha'\times\alpha'' = v^3\kappa\,\mathbf B$, so $|\alpha'\times\alpha''|^2 = v^6\kappa^2$.`,
        t`The only $\mathbf B$-part of $\alpha'''$ comes from differentiating $v^2\kappa\mathbf N$: it is $v^2\kappa\cdot v\tau\,\mathbf B$.`,
        t`So $(\alpha'\times\alpha'')\cdot\alpha''' = v^3\kappa\cdot v^3\kappa\tau = v^6\kappa^2\tau$; divide.`,
      ],
      hints: ['Write each derivative in the Frenet frame, using the chain rule with ds/dt = v.', t`$\dot{\mathbf N} = v(-\kappa\mathbf T + \tau\mathbf B)$: that is where $\tau$ enters.`],
      teach: 'Each derivative of α reaches one step further into the frame: α′ along T, α″ into N, α‴ into B — and the B-part of α‴ carries τ.',
      explain: t`Everything in $\alpha'''$ along $\mathbf T$ or $\mathbf N$ is killed by the dot product with $\mathbf B$. The same bookkeeping gives $\kappa = |\alpha'\times\alpha''|/v^3$.`,
    }),
    num({
      id: 'leave-plane', difficulty: 3,
      gen(r) {
        const [k, ta] = r.pick([[0.5, 1], [1, 0.5], [1, 1], [2, 1], [1, 2], [2, 3]]), s = r.pick([0.1, 0.2, 0.3]);
        const q = ta / k, tm = Math.min(4, 2.2 / q);
        const d = (k * ta * s ** 3) / 6;
        return {
          prompt: t`Near a point, a unit-speed curve is approximated by its local canonical form
$$\alpha(s) \approx \alpha(0) + \Big(s - \tfrac{\kappa^2s^3}{6}\Big)\mathbf T + \Big(\tfrac{\kappa s^2}{2} + \tfrac{\kappa' s^3}{6}\Big)\mathbf N + \tfrac{\kappa\tau s^3}{6}\,\mathbf B.$$
With $\kappa = ${k}\ \text{m}^{-1}$ and $\tau = ${ta}\ \text{m}^{-1}$ at the point, how far is the curve from its osculating plane after $s = ${s}$ m, in millimetres?`,
          visual: { type: 'c3-curve', params: { curve: { param: ['cos(t)', 'sin(t)', `${r6(q)}*t`], t: [r6(-tm / 2), r6(tm)] }, at: 0, fixed: true, show: ['T', 'N', 'B'], readouts: [], range: 2.4, scale: { frame: 0.9 } }, caption: t`A helix with the same ratio $\tau/\kappa$, in units of its radius, and its frame at the point. The osculating plane is spanned by $\mathbf T$ and $\mathbf N$; the curve climbs out of it along $\mathbf B$.` },
          answer: d * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((k * s * s) / 2) * 1000, feedback: t`That is the $\mathbf N$-component — the bending within the osculating plane. The distance *from* the plane is the $\mathbf B$-component.` }, { value: ((ta * s ** 3) / 6) * 1000, feedback: t`The $\mathbf B$-component is $\kappa\tau s^3/6$: a straight line cannot leave a plane by twisting, so $\kappa$ appears too.` }].filter((e) => Math.abs(e.value - d * 1000) > 0.02 * d * 1000),
          hints: [t`The distance from the osculating plane (spanned by $\mathbf T$ and $\mathbf N$) is the $\mathbf B$-component.`, t`$\tfrac{\kappa\tau s^3}{6} = \tfrac{${k}\times${ta}\times${s}^3}{6}$ m.`],
          teach: 'A curve leaves its osculating plane only at third order, at the rate κτ s³/6.',
          explain: t`$\tfrac{${k}\times ${ta}\times ${s}^3}{6} = ${tex(d, 3)}$ m $= ${nice(d * 1000, 3)}$ mm, against $\kappa s^2/2 = ${nice((k * s * s) / 2 * 1000, 3)}$ mm of bending within the plane. Torsion is a third-order effect: that is why the osculating plane “fits” a curve so well.`,
        };
      },
    }),
    mcq({
      id: 'name-clash', difficulty: 2,
      prompt: t`General relativity uses a connection whose **torsion tensor** $T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$ is zero. What does that say about the Frenet torsion $\tau$ of a particle’s path in space?`,
      visual: cubicPic(1.2, 0.3, 'A twisting space curve. Its τ describes its own shape, not the space it sits in.'),
      choices: [
        'Nothing: the two torsions are unrelated objects that share a name',
        'Every path must have τ = 0, so particles move in planes',
        'Paths can twist only where the torsion tensor is non-zero',
        'τ is one component of the torsion tensor along the path',
      ],
      answer: 0,
      why: {
        1: 'A charged particle in a magnetic field follows a helix (τ ≠ 0) in perfectly ordinary, torsion-free space.',
        2: 'The torsion tensor is a property of the rule for differentiating, the connection; τ is a property of one curve.',
        3: 'They are different kinds of object: τ is a number along a curve, the torsion tensor a (1, 2) tensor field built from Christoffel symbols.',
      },
      hints: ['Ask what each torsion is a property of: a curve, or a rule for differentiating vector fields?'],
      teach: 'The torsion of a curve and the torsion tensor of a connection are unrelated; only the name is shared.',
      explain: 'Frenet’s τ measures how one curve twists; the torsion tensor measures whether infinitesimal parallelograms built by the connection close. Flat Euclidean space has zero torsion tensor and is full of helices.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-gyration', difficulty: 3, transfer: true,
      prompt: t`In Earth’s radiation belts a proton and an electron spiral round the same magnetic field line, both drifting **along** the field $\mathbf B = B\hat{\mathbf z}$ (so $v_\parallel > 0$). The force $q\,\mathbf v\times\mathbf B$ makes positive charges gyrate clockwise and negative charges anticlockwise, seen from $+z$. What are the signs of the torsion of their helical paths?`,
      visual: { type: 'c3-curve', params: { curve: { param: ['sin(t)', 'cos(t)', '0.18*t'], t: [0, 12.5] }, at: 2, fixed: true, show: ['T', 'B'], readouts: [], range: 2.4 }, caption: t`A helix turning clockwise seen from $+z$ while it rises along $+z$ — one of the two particles’ paths, not to scale.` },
      choices: [
        t`Proton $\tau < 0$ (left-handed), electron $\tau > 0$ (right-handed)`,
        t`Both $\tau > 0$: the torsion does not depend on the charge`,
        t`Proton $\tau > 0$, electron $\tau < 0$`,
        t`Both $\tau = 0$: each particle stays on a circle round the field line`,
      ],
      answer: 0,
      why: {
        1: 'Opposite charges gyrate in opposite senses while drifting the same way, so their helices are mirror images.',
        2: t`A right-handed helix, like $(\cos t, \sin t, t)$, turns anticlockwise seen from the end it rises toward. Clockwise while rising is left-handed.`,
        3: t`Only with $v_\parallel = 0$. A drift along the field lifts the circle into a helix, with $|\tau| = b/(a^2 + b^2) \ne 0$.`,
      },
      hints: [t`The right-handed helix $(\cos t, \sin t, bt)$ turns anticlockwise seen from $+z$ as it rises.`, 'Clockwise while rising: is that the right-handed helix or its mirror image?'],
      teach: 'The sign of torsion is the handedness of the twist, and a mirror image flips it.',
      explain: t`The proton’s path is $(R\sin\omega t,\ R\cos\omega t,\ v_\parallel t)$; computing $(\alpha'\times\alpha'')\cdot\alpha''' = -v_\parallel R^2\omega^5 < 0$. The electron’s is its mirror image, with $\tau > 0$. A particle drifting *against* the field reverses this — for a given charge the handedness depends on the direction of drift, because reversing $v_\parallel$ alone makes the mirror-image helix.`,
    }),
    num({
      id: 'cp-tau', difficulty: 2,
      gen(r) {
        const h = r.pick([0.5, 2, 1.5, -0.5]), t0 = r.pick([0, 0.5, 1]);
        const tau = (3 * h) / (9 * h * h * t0 ** 4 + 9 * h * h * t0 * t0 + 1);
        return {
          prompt: t`Find the torsion of $\alpha(t) = (t,\ t^2,\ ${h}\,t^3)$ at $t = ${t0}$, to 3 significant figures.`,
          visual: cubicPic(h, t0, 'The curve and its Frenet frame at the point.'),
          answer: tau, tol: { rel: 0.005 },
          hints: [t`$\alpha' = (1, 2t, ${nice(3 * h)}t^2)$, $\alpha'' = (0, 2, ${nice(6 * h)}t)$, $\alpha''' = (0, 0, ${nice(6 * h)})$.`, t`$\alpha'\times\alpha'' = (${nice(6 * h)}t^2,\ -${nice(6 * h)}t,\ 2)$ (careful with signs if the coefficient is negative).`],
          teach: t`$\tau = (\alpha'\times\alpha'')\cdot\alpha'''/|\alpha'\times\alpha''|^2$ in any parameter.`,
          explain: t`The triple product is $12 \times ${h} = ${nice(12 * h)}$ and $|\alpha'\times\alpha''|^2 = ${nice(36 * h * h * t0 ** 4 + 36 * h * h * t0 * t0 + 4, 4)}$, so $\tau = ${nice(tau, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-triple', difficulty: 2,
      gen(r) {
        const d1 = [r.int(1, 2), 0, r.intExcept(-1, 1, [0])], d2 = [0, r.int(1, 3), 0], d3 = [r.intExcept(-2, 2, [0]), r.int(-2, 2), r.intExcept(-3, 3, [0])];
        const cr = cross(d1, d2);
        let tau = dot(cr, d3) / dot(cr, cr);
        if (Math.abs(tau) < 1e-9) { d3[2] += 1; tau = dot(cr, d3) / dot(cr, cr); }
        return {
          prompt: t`At one point of a curve, $\alpha' = ${vecTeX(d1)}$, $\alpha'' = ${vecTeX(d2)}$ and $\alpha''' = ${vecTeX(d3)}$. What is the torsion there, to 3 significant figures?`,
          visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: d1, color: 'accent', label: t`\alpha'` }, { to: d2, color: 'violet', label: t`\alpha''` }, { to: d3, color: 'teal', label: t`\alpha'''` }] }, caption: 'The three derivative vectors at the point. Drag to turn them.' },
          answer: tau, tol: { rel: 0.005 },
          hints: [t`$\alpha'\times\alpha'' = ${vecTeX(cr)}$.`],
          teach: 'Torsion is the triple product of the first three derivatives over the squared length of the first cross product.',
          explain: t`$(\alpha'\times\alpha'')\cdot\alpha''' = ${nice(dot(cr, d3))}$, $|\alpha'\times\alpha''|^2 = ${nice(dot(cr, cr))}$, so $\tau = ${nice(tau, 4)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-5 and §1-6 (local canonical form)', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §2.3', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
