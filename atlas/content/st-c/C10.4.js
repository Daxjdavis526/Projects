// Maxwell's equations as dF = 0 and d⋆F = ⋆J: the field strength as one
// 2-form on spacetime (E and B are its components in a frame, mixed by a
// boost, with invariants B² − E² and E·B); dF = 0 is Gauss-for-B plus
// Faraday and needs no metric; d⋆F = ⋆J is Gauss plus Ampère–Maxwell and needs
// the metric through ⋆; F = dA and gauge freedom from d² = 0; charge
// conservation from d² = 0; an electrodynamic tether.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const C = (n, k) => { let c = 1; for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1); return c; };
const SEL = (k) => `step(0.5 - abs(m - ${k}))`;

// four field configurations (c = 1): E and B as expressions of the choice m
const PRE = [[[0, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 0.6]], [[0.5, 0.8, 0], [0.4, 0, 0.9]]];
const comp = (which, i) => PRE.map((p, k) => `${SEL(k + 1)}*(${p[which][i]})`).join(' + ');
const [EX, EY, EZ] = [0, 1, 2].map((i) => `(${comp(0, i)})`);
const [BX, BY, BZ] = [0, 1, 2].map((i) => `(${comp(1, i)})`);
const G = '(1/sqrt(1 - be^2))';
const E1 = [EX, `${G}*(${EY} - be*${BZ})`, `${G}*(${EZ} + be*${BY})`];
const B1 = [BX, `${G}*(${BY} + be*${EZ})`, `${G}*(${BZ} - be*${EY})`];
const boost = (E, B, b) => {
  const g = 1 / Math.sqrt(1 - b * b);
  return { E: [E[0], g * (E[1] - b * B[2]), g * (E[2] + b * B[1])], B: [B[0], g * (B[1] + b * E[2]), g * (B[2] - b * E[1])] };
};
const vecTeX = (v) => `(${v.map((x) => nice(x, 3)).join(',\\ ')})`;

export default lesson({
  id: 'st-c.C10.4',
  title: 'Maxwell’s equations as dF = 0 and d⋆F = ⋆J',
  minutes: 15, difficulty: 4,
  equation: t`dF = 0, \qquad d{\star}F = {\star}J`,
  intro: t`In spacetime the electric and magnetic fields are not two vectors but one **2-form**, the field strength (with $c = 1$ and Carroll’s signs):

$$F = -E_x\,dt\wedge dx - E_y\,dt\wedge dy - E_z\,dt\wedge dz + B_x\,dy\wedge dz + B_y\,dz\wedge dx + B_z\,dx\wedge dy.$$

Its six components ($\binom42 = 6$) split into $\mathbf E$ and $\mathbf B$ only once you pick a time direction; another observer splits the same $F$ differently. Maxwell’s four equations become two. **$dF = 0$** is a 3-form with four components: $\nabla\cdot\mathbf B = 0$ and Faraday’s law $\nabla\times\mathbf E + \partial_t\mathbf B = 0$. **$d{\star}F = {\star}J$** gives Gauss’s law $\nabla\cdot\mathbf E = \rho$ and Ampère–Maxwell $\nabla\times\mathbf B - \partial_t\mathbf E = \mathbf J$ (Heaviside–Lorentz units: $\varepsilon_0 = \mu_0 = c = 1$).

**The honest catch:** the Hodge star $\star$ is built from the metric — the volume form $\sqrt{|g|}\,d^4x$ and index raising with $g^{\mu\nu}$. So $dF = 0$ holds unchanged on any manifold, metric or not, while $d{\star}F = {\star}J$ is where spacetime geometry, and therefore gravity, enters electromagnetism. “Two equations instead of four” is real compression, but the metric has been folded into one symbol, not removed.`,
  symbols: [
    { tex: 'F', text: t`the electromagnetic field strength, a 2-form on spacetime; in a frame its components are $\mathbf E$ and $\mathbf B$` },
    { tex: 'd', text: 'the exterior derivative (C10.2): needs no metric' },
    { tex: t`{\star}`, text: t`the Hodge star: turns a $k$-form into a $(4 - k)$-form using the metric and an orientation. In Minkowski space $\star (dt\wedge dx) = -dy\wedge dz$ and $\star (dy\wedge dz) = dt\wedge dx$` },
    { tex: 'J', text: t`the current 1-form, $J = -\rho\,dt + J_x\,dx + J_y\,dy + J_z\,dz$: charge density and current density together` },
    { tex: t`{\star}J`, text: 'its dual 3-form, which measures how much charge crosses a 3-dimensional region of spacetime' },
  ],
  why: t`This is how electromagnetism is written in curved spacetime: replace $\eta$ by $g$ inside $\star$ and nothing else changes. Light bending, the redshift of radio signals and the fields near a black hole all follow from these two lines with the Schwarzschild metric.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'One 2-form, many observers',
    lead: t`$\mathbf E$ (gold) and $\mathbf B$ (violet) seen by an observer moving along $x$ at speed $\beta$ ($c = 1$). Pick a field and slide $\beta$: the arrows change, but they are only the components of one 2-form $F$. Two combinations never change.`,
    tasks: [
      t`Pure electric field: move the observer and a magnetic field appears, $B'_z = -\gamma\beta E_y$. A charge at rest for one observer is a current for another.`,
      t`Light wave ($\mathbf E \perp \mathbf B$, equal size): chase it with $\beta > 0$ and both shrink together — the Doppler shift. $B^2 - E^2 = 0$ and $\mathbf E\cdot\mathbf B = 0$ in every frame: light is light for everyone.`,
      t`$E$ larger than $B$ and perpendicular: one speed, $\beta = B/E = 0.6$, makes the magnetic field vanish. Generic field: $\mathbf E\cdot\mathbf B \ne 0$, and no observer can remove either field.`,
    ],
    params: {
      range: 1.6, yaw: 0.7, pitch: 0.35,
      choices: [{ key: 'm', label: 'Field in the lab', options: [[1, 'pure electric'], [2, 'light wave'], [3, t`$E > B$, perpendicular`], [4, 'generic']], value: 1, explain: 'The fields as measured in the lab frame (β = 0).' }],
      sliders: [{ key: 'be', label: t`observer speed $\beta$`, min: -0.9, max: 0.9, step: 0.01, value: 0, explain: 'Velocity of the observer along +x, as a fraction of c.' }],
      vectors: [{ to: E1, color: 'gold', label: t`\mathbf E'` }, { to: B1, color: 'violet', label: t`\mathbf B'` }],
      readouts: [
        { label: t`$\mathbf E'$`, vec: E1, digits: 3 },
        { label: t`$\mathbf B'$`, vec: B1, digits: 3 },
        { label: t`$B'^2 - E'^2$`, expr: `(${B1[0]})^2 + (${B1[1]})^2 + (${B1[2]})^2 - (${E1[0]})^2 - (${E1[1]})^2 - (${E1[2]})^2`, digits: 3 },
        { label: t`$\mathbf E'\cdot\mathbf B'$`, expr: `(${E1[0]})*(${B1[0]}) + (${E1[1]})*(${B1[1]}) + (${E1[2]})*(${B1[2]})`, digits: 3 },
      ],
    },
    caption: t`Exact Lorentz transformation of the components of $F$ for a boost along $x$ ($c = 1$, arbitrary field units). The invariants are $\tfrac12F_{\mu\nu}F^{\mu\nu} = B^2 - E^2$ and $\tfrac14F_{\mu\nu}({\star}F)^{\mu\nu} = \mathbf E\cdot\mathbf B$ (up to a convention-dependent sign).`,
  },
  example: {
    prompt: t`Expand $dF$ for the $F$ above and show that $dF = 0$ is exactly $\nabla\cdot\mathbf B = 0$ together with Faraday’s law.`,
    visual: { type: 'calc-vectors3d', params: { range: 1.4, yaw: 0.7, pitch: 0.35, vectors: [{ to: [0, 1, 0], color: 'gold', label: t`\mathbf E` }, { to: [0, 0, 1], color: 'violet', label: t`\mathbf B` }], parallelograms: [{ at: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], color: 'violet', alpha: 0.15 }] }, caption: t`A light wave’s fields at one event: $F$ has a $dt\wedge dy$ part (from $E_y$) and a $dx\wedge dy$ part (from $B_z$, the violet plane).` },
    steps: [
      { label: 'Spatial part', text: t`$d(B_x\,dy\wedge dz + B_y\,dz\wedge dx + B_z\,dx\wedge dy)$ gives $\partial_tB_x\,dt\wedge dy\wedge dz + \dots$ and the purely spatial $(\partial_xB_x + \partial_yB_y + \partial_zB_z)\,dx\wedge dy\wedge dz$.` },
      { label: 'Electric part', text: t`$d(-E_y\,dt\wedge dy) = -\partial_xE_y\,dx\wedge dt\wedge dy - \partial_zE_y\,dz\wedge dt\wedge dy = \partial_xE_y\,dt\wedge dx\wedge dy - \partial_zE_y\,dt\wedge dy\wedge dz$, and likewise for $E_x$, $E_z$.` },
      { label: 'Collect the time–space terms', text: t`$(\partial_tB_z + \partial_xE_y - \partial_yE_x)\,dt\wedge dx\wedge dy = (\partial_t\mathbf B + \nabla\times\mathbf E)_z\,dt\wedge dx\wedge dy$. The other two $dt\wedge\cdot\wedge\cdot$ terms give the $x$- and $y$-components (one with an overall sign).` },
      { label: 'Read off', text: t`$dF = 0$ has $\binom43 = 4$ components: $\nabla\cdot\mathbf B = 0$ (the $dx\wedge dy\wedge dz$ one) and the three of $\nabla\times\mathbf E + \partial_t\mathbf B = 0$.` },
      { label: 'No metric used', text: t`Only partial derivatives and wedges appeared. The same expansion of $d{\star}F$ needs $\star F$ first, $B_x\,dt\wedge dx + \dots + E_x\,dy\wedge dz + \dots$ — and that step used $\eta$.` },
      { label: 'Sense check', text: t`$4 + 4 = 8$ component equations: 1 (Gauss) + 3 (Ampère–Maxwell) + 1 (no monopoles) + 3 (Faraday), as in the vector form.` },
    ],
    answer: t`$dF = (\nabla\cdot\mathbf B)\,dx\wedge dy\wedge dz + (\nabla\times\mathbf E + \partial_t\mathbf B)_z\,dt\wedge dx\wedge dy + \dots$, so $dF = 0$ is Gauss’s law for magnetism plus Faraday’s law.`,
  },
  practice: [
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const n = r.pick([3, 4, 5, 11]), which = r.pick(['F', 'dF']);
        const ans = which === 'F' ? C(n, 2) : C(n, 3);
        return {
          prompt: which === 'F' ? t`In a spacetime of $${n}$ dimensions, how many independent components does the field-strength 2-form $F$ have?` : t`In a spacetime of $${n}$ dimensions, how many independent component equations does $dF = 0$ contain?`,
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: which === 'F' ? n * n : C(n, 2), feedback: which === 'F' ? t`Antisymmetry: $F_{\mu\nu} = -F_{\nu\mu}$, so only pairs $\mu < \nu$ count.` : t`$dF$ is a 3-form: count triples $\mu < \nu < \lambda$.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [which === 'F' ? t`A 2-form has $\binom{n}{2}$ components.` : t`A 3-form has $\binom{n}{3}$ components.`],
          teach: 'A k-form in n dimensions has n choose k components; Maxwell’s F is a 2-form and dF a 3-form.',
          explain: t`$${which === 'F' ? t`\binom{${n}}{2}` : t`\binom{${n}}{3}`} = ${ans}$. ${n === 4 ? (which === 'F' ? 'Six: three electric and three magnetic.' : 'Four: one for ∇·B = 0, three for Faraday.') : n === 3 ? 'In 2+1 dimensions the magnetic field has a single component.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'which-half', difficulty: 2,
      prompt: t`Which two of Maxwell’s equations are contained in $dF = 0$?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.4, yaw: 0.7, pitch: 0.35, vectors: [{ to: [0.5, 0.8, 0], color: 'gold', label: t`\mathbf E` }, { to: [0.4, 0, 0.9], color: 'violet', label: t`\mathbf B` }] }, caption: 'Electric and magnetic fields at one event: six numbers, the components of one 2-form.' },
      choices: [t`$\nabla\cdot\mathbf B = 0$ and $\nabla\times\mathbf E = -\partial_t\mathbf B$`, t`$\nabla\cdot\mathbf E = \rho$ and $\nabla\times\mathbf B = \mathbf J + \partial_t\mathbf E$`, t`$\nabla\cdot\mathbf E = \rho$ and $\nabla\cdot\mathbf B = 0$`, t`$\nabla\times\mathbf E = -\partial_t\mathbf B$ and $\nabla\times\mathbf B = \mathbf J + \partial_t\mathbf E$`],
      answer: 0,
      why: {
        1: t`Those have sources, and sources live in $d{\star}F = {\star}J$.`,
        2: t`The two divergence equations come from different halves: one from each.`,
        3: 'The two curl equations also come from different halves.',
      },
      hints: [t`$dF = 0$ has no source term. Which two Maxwell equations have no $\rho$ or $\mathbf J$?`],
      teach: 'dF = 0 holds the source-free pair: no magnetic monopoles and Faraday’s law.',
      explain: t`The source-free pair is $dF = 0$; the pair with $\rho$ and $\mathbf J$ is $d{\star}F = {\star}J$. In integral form, $dF = 0$ says that the magnetic flux through any closed surface is zero and that the emf round a loop is minus the rate of change of the flux through it.`,
    }),
    mcq({
      id: 'star-metric', difficulty: 2,
      prompt: t`Moving Maxwell’s equations from flat to curved spacetime, which ingredient of $dF = 0$, $d{\star}F = {\star}J$ is the only one that changes?`,
      visual: { type: 'ten-metric', params: { mode: 'chart', chart: 'minkowski', readout: false }, caption: 'The Minkowski metric drawn as its unit hyperbolae over a chart: this is what the star needs.' },
      choices: [t`The Hodge star $\star$, which uses the metric`, t`The exterior derivative $d$`, 'The wedge product', t`Nothing: the equations are metric-free`],
      answer: 0,
      why: {
        1: t`$d$ is defined from partial derivatives and wedges alone; it is the same on any manifold.`,
        2: 'The wedge is pure antisymmetrization: no metric.',
        3: t`$\star$ needs the volume form and index raising: $({\star}F)_{\mu\nu} = \tfrac12\varepsilon_{\mu\nu}{}^{\rho\sigma}F_{\rho\sigma}$ with $\varepsilon$ built from $\sqrt{|g|}$ and indices raised by $g$.`,
      },
      hints: ['Which symbol needs to know lengths and angles — or which directions are timelike?'],
      teach: 'dF = 0 is metric-free; the metric enters Maxwell’s equations only through the Hodge star.',
      explain: t`So $dF = 0$ is the same equation in any spacetime and any chart, while $d{\star}F = {\star}J$ carries the geometry. This is the clean statement of how gravity affects light: through $\star$.`,
    }),
    num({
      id: 'boost', difficulty: 2,
      gen(r) {
        const E = r.pick([[0, 1, 0], [0, 2, 0], [0, 1, 0.5]]), B = r.pick([[0, 0, 0], [0, 0, 1], [0, 0.5, 0.5]]), b = r.pick([0.6, 0.8, -0.6]);
        const f = boost(E, B, b), which = r.pick(['Ey', 'Bz']);
        const ans = which === 'Ey' ? f.E[1] : f.B[2];
        return {
          prompt: t`In the lab ($c = 1$), $\mathbf E = ${vecTeX(E)}$ and $\mathbf B = ${vecTeX(B)}$. An observer moves along $x$ at $\beta = ${b}$. What is ${which === 'Ey' ? t`$E'_y$` : t`$B'_z$`} in their frame? (Use $E'_y = \gamma(E_y - \beta B_z)$, $B'_z = \gamma(B_z - \beta E_y)$.)`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, yaw: 0.7, pitch: 0.35, vectors: [{ to: E, color: 'gold', label: t`\mathbf E` }, ...(B.some((x) => x !== 0) ? [{ to: B, color: 'violet', label: t`\mathbf B` }] : []), { from: [-1.2, -1.2, 0], to: [r6(-1.2 + b), -1.2, 0], color: 'ink3', label: t`\beta` }] }, caption: 'The lab fields and the observer’s velocity (grey).' },
          answer: ans, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: which === 'Ey' ? E[1] - b * B[2] : B[2] - b * E[1], feedback: t`Multiply by $\gamma = 1/\sqrt{1 - \beta^2} = ${nice(1 / Math.sqrt(1 - b * b), 4)}$.` }, { value: which === 'Ey' ? (E[1] + b * B[2]) / Math.sqrt(1 - b * b) : (B[2] + b * E[1]) / Math.sqrt(1 - b * b), feedback: 'Check the sign of the β term.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\gamma = 1/\sqrt{1 - ${b}^2} = ${nice(1 / Math.sqrt(1 - b * b), 4)}$.`],
          teach: 'A boost mixes E and B because they are components of one 2-form F.',
          explain: t`${which === 'Ey' ? t`$E'_y = ${nice(ans, 4)}$` : t`$B'_z = ${nice(ans, 4)}$`}. Full result: $\mathbf E' = ${vecTeX(f.E)}$, $\mathbf B' = ${vecTeX(f.B)}$; $B^2 - E^2 = ${nice(B.reduce((s, x) => s + x * x, 0) - E.reduce((s, x) => s + x * x, 0), 3)}$ before and after.`,
        };
      },
    }),
    num({
      id: 'b-from-a', difficulty: 2,
      gen(r) {
        const [Atex, Ax, Ay, Bz] = r.pick([
          [t`-y\,dx + x\,dy`, '-y', 'x', () => 2],
          [t`x^2y\,dy`, '0', 'x^2*y', (x, y) => 2 * x * y],
          [t`-\tfrac12 y^3\,dx + xy\,dy`, '-0.5*y^3', 'x*y', (x, y) => y + 1.5 * y * y],
          [t`\sin y\,dx + x^2\,dy`, 'sin(y)', 'x^2', (x, y) => 2 * x - Math.cos(y)],
        ]);
        const x = r.pick([1, 2, -1]), y = r.pick([1, 0.5, -1]);
        const ans = Bz(x, y);
        return {
          prompt: t`A static vector potential is $A = ${Atex}$ (with $c = 1$). Since $F = dA$, the magnetic field’s $z$-component is the coefficient of $dx\wedge dy$ in $dA$. Find $B_z$ at $(x, y) = (${x}, ${y})$.`,
          visual: { type: 'field2d', params: { P: Ax, Q: Ay, x: [-2.5, 2.5], y: [-2.5, 2.5], readout: false, probe: false, particles: false }, caption: 'The potential A drawn as arrows (Ax, Ay) — a picture that borrows the Euclidean metric.' },
          answer: ans, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: -ans, feedback: t`$B_z = \partial_xA_y - \partial_yA_x$: check the order.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$d(A_x\,dx + A_y\,dy) = (\partial_xA_y - \partial_yA_x)\,dx\wedge dy$.`],
          teach: t`$F = dA$ makes $dF = d^2A = 0$ automatic; in components, $\mathbf B = \nabla\times\mathbf A$.`,
          explain: t`$B_z = \partial_xA_y - \partial_yA_x = ${nice(ans, 4)}$ at the point. Because $d^2 = 0$, any $F$ of the form $dA$ satisfies $dF = 0$ — half of Maxwell for free.`,
        };
      },
    }),
    order({
      id: 'conservation', difficulty: 3,
      prompt: t`Show that Maxwell’s equations force electric charge to be conserved. Order the steps.`,
      visual: { type: 'spacetime', params: { beta: 0, events: [[1, -1.5], [3, 1.5]], range: 4, simultaneity: false, hyperbolae: false }, caption: 'A region of spacetime between two moments; charge can only enter or leave through its sides.' },
      items: [
        t`Apply $d$ to both sides of $d{\star}F = {\star}J$: $d({\star}J) = d(d{\star}F)$.`,
        t`$d^2 = 0$, so $d({\star}J) = 0$; in components this is $\partial_t\rho + \nabla\cdot\mathbf J = 0$.`,
        t`Integrate $d({\star}J)$ over a region of spacetime between two moments and use Stokes: $\int_{\partial\Omega}{\star}J = 0$.`,
        t`The boundary is the region of space at the two moments plus its sides: the charge at the end equals the charge at the start minus what flowed out through the sides.`,
      ],
      hints: ['What does d do to d of anything?', 'Then turn the local statement into a global one with Stokes’ theorem.'],
      teach: 'Charge conservation is d² = 0 applied to Maxwell’s equations — it is not an extra law.',
      explain: t`The equations would be inconsistent with a current that violated $d{\star}J = 0$: conservation is built into their form. The same mechanism in GR — the Bianchi identity — makes energy–momentum conservation a consequence of Einstein’s equation.`,
    }),
    mcq({
      id: 'gauge', difficulty: 2,
      prompt: t`Why does changing the potential by $A \to A + d\lambda$, for any function $\lambda$, leave the field $F = dA$ unchanged?`,
      visual: { type: 'field2d', params: { P: '-y + 0.6*x', Q: 'x + 0.6*y', x: [-2, 2], y: [-2, 2], probe: [0.8, 0.5] }, caption: t`$A = -y\,dx + x\,dy$ plus $d\lambda$ with $\lambda = 0.3(x^2 + y^2)$: the probe’s curl is still 2.` },
      choices: [t`Because $d(d\lambda) = 0$`, t`Because $d\lambda$ is small`, t`Because $\lambda$ must be a constant`, t`Because $F$ depends only on $\star A$`],
      answer: 0,
      why: {
        1: t`$\lambda$ can be any smooth function, of any size.`,
        2: t`Constants change nothing, but so do non-constant $\lambda$; that is the whole point of gauge freedom.`,
        3: t`$F = dA$, with no star.`,
      },
      hints: [t`Compute $d(A + d\lambda)$.`],
      teach: 'Gauge freedom is d² = 0: potentials that differ by an exact form give the same field.',
      explain: t`$d(A + d\lambda) = dA + d^2\lambda = F$. Many potentials describe one field; only $F$ (and, round non-contractible loops, $\oint A$ — C10.2’s solenoid) is physical.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const v = 7700, BuT = r.pick([20, 30, 40]), Lkm = r.pick([1, 5, 20]);
        const V = v * BuT * 1e-6 * Lkm * 1000;
        return {
          prompt: t`An electrodynamic tether is a conducting wire $${Lkm}$ km long hanging below a spacecraft that orbits at $7.7$ km/s through the Earth’s magnetic field, here $${BuT}\ \mu\text{T}$ and perpendicular to both the velocity and the wire. In the lab frame there is no electric field; in the tether’s frame the same $F$ has $\mathbf E' \approx \mathbf v\times\mathbf B$ (SI, $v \ll c$). What voltage appears along the tether, in volts?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, yaw: 0.7, pitch: 0.35, vectors: [{ to: [1.2, 0, 0], color: 'ink3', label: t`\mathbf v` }, { to: [0, 1, 0], color: 'violet', label: t`\mathbf B` }, { from: [0, 0, 0], to: [0, 0, 1.2], color: 'gold', label: t`\mathbf v\times\mathbf B` }], segments: [{ from: [0, 0, 0], to: [0, 0, -1.4], color: 'accent' }] }, caption: 'Velocity, magnetic field, and the electric field v × B the tether feels — parallel to the tether (blue, hanging below the craft). Directions only, not to scale.' },
          answer: V, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: V / 1000, feedback: 'Convert the length to metres.' }, { value: V * 1e6, feedback: 'The field is in microtesla: multiply by 10⁻⁶.' }],
          hints: [t`$|\mathbf E'| = vB$; the voltage is $E'L$.`, t`$7700\ \text{m/s}\times ${BuT}\times10^{-6}\ \text{T}\times ${Lkm * 1000}\ \text{m}$.`],
          teach: 'What is purely magnetic in one frame has an electric part in another: the tether sees E′ = v × B.',
          explain: t`$V = vBL = ${nice(V, 4)}$ V. NASA’s TSS-1R tether (1996) was reeled out to nearly 20 km and developed about 3.5 kV before it broke — the same physics. The lab sees a magnetic force on moving charges, the tether an electric field: one $F$, two splittings.`,
        };
      },
    }),
    num({
      id: 'cp-invariant', difficulty: 2,
      gen(r) {
        const E = r.pick([[0, 1, 0], [0.5, 0.8, 0], [0, 2, 0]]), B = r.pick([[0, 0, 1], [0.4, 0, 0.9], [0, 0.5, 0.5]]), b = r.pick([0.5, -0.7, 0.9]);
        const f = boost(E, B, b);
        const dot = E.reduce((s, x, i) => s + x * B[i], 0);
        return {
          prompt: t`In the lab, $\mathbf E = ${vecTeX(E)}$ and $\mathbf B = ${vecTeX(B)}$ ($c = 1$). An observer at $\beta = ${b}$ along $x$ measures $\mathbf E' = ${vecTeX(f.E)}$ and $\mathbf B' = ${vecTeX(f.B)}$. What is $\mathbf E'\cdot\mathbf B'$?`,
          visual: { type: 'calc-vectors3d', params: { range: 2.2, yaw: 0.7, pitch: 0.35, vectors: [{ to: f.E.map(r6), color: 'gold', label: t`\mathbf E'` }, { to: f.B.map(r6), color: 'violet', label: t`\mathbf B'` }] }, caption: 'The fields the moving observer measures.' },
          answer: dot, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: f.E.reduce((s, x) => s + x * x, 0) - f.B.reduce((s, x) => s + x * x, 0), feedback: t`That is $E'^2 - B'^2$, the other invariant. The question asks for the dot product.` }].filter((e) => Math.abs(e.value - dot) > 0.01),
          hints: [t`Either multiply the primed components, or use the fact that $\mathbf E\cdot\mathbf B$ is invariant.`],
          teach: 'E·B and B² − E² are the same for every observer: they are scalars built from the single 2-form F.',
          explain: t`$\mathbf E'\cdot\mathbf B' = \mathbf E\cdot\mathbf B = ${nice(dot, 4)}$ — no surprise once $\mathbf E$ and $\mathbf B$ are seen as parts of $F$: $\mathbf E\cdot\mathbf B$ is proportional to $F\wedge F$, a 4-form that no boost can change.`,
        };
      },
    }),
    mcq({
      id: 'cp-monopole', difficulty: 3,
      prompt: t`If magnetic monopoles existed, with a magnetic current 1-form $J_m$, how would the equations change?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'violet' }], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]].map((d) => ({ from: d, to: d.map((x) => 1.5 * x), color: 'violet' })) }, caption: 'A hypothetical monopole: magnetic flux leaving a closed surface. None has ever been found.' },
      choices: [
        t`$dF = {\star}J_m$, and $F$ could no longer be written as $dA$ everywhere`,
        t`$d{\star}F = 0$`,
        t`Nothing; monopoles are already allowed by $dF = 0$`,
        t`$d$ would need a metric`,
      ],
      answer: 0,
      why: {
        1: t`The electric equation keeps its electric source; a magnetic source enters the other equation.`,
        2: t`$dF = 0$ integrates to zero magnetic flux through every closed surface — it forbids monopoles.`,
        3: t`$d$ never needs a metric; the source term would bring in $\star$, and hence the metric.`,
      },
      hints: [t`Which equation says $\nabla\cdot\mathbf B = 0$?`, t`If $F = dA$ globally, what is $dF$?`],
      teach: 'dF = 0 is the statement that there are no magnetic charges; a monopole would give F a source and forbid a global potential.',
      explain: t`With $dF = {\star}J_m \ne 0$, $F$ cannot be $dA$ (that would make $dF = d^2A = 0$). Dirac showed a monopole is still possible with a potential defined patch by patch — charts again — at the price of quantized charge. Searches (MoEDAL at the LHC, IceCube, cosmic-ray detectors) have found none.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §1.10 and §2.9', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Baez & Muniain, Gauge Fields, Knots and Gravity, part I', url: 'https://www.worldscientific.com/worldscibooks/10.1142/2324' },
  ],
});
