// (−,+,+,+) versus (+,−,−,−): the two signatures in use, the same physics
// written both ways. η flips sign, so every dot product does; components
// with an upper index do not, components with a lower index do. A
// dictionary: u·u = ∓1, p·p = ∓m², p₀ = ∓E, E = ∓p·u, dτ² = ∓ds², the
// Klein–Gordon equation and the plane wave. Builds on st-a.A6.6 (signature,
// Sylvester's law, one short (+,−,−,−) question) and phys3710.R1.2 / R3.1
// (the interval and E = −p·u in Hartle's sign) without repeating them:
// here the translation itself, with Mandelstam s at a real collider.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const ME = 0.51099895e-3;                 // GeV
const r6 = (v) => +(+v).toPrecision(6);

/** A four-vector drawn in the (x, t) plane with the light cone and the hyperbola through its tip; labels name no sign. */
function vecPicture({ V, name = 'V', caption }) {
  const [vt, vx] = V, n = -vt * vt + vx * vx;
  const R = Math.max(Math.abs(vt), Math.abs(vx)) * 1.35 + 0.5;
  const s = Math.sqrt(Math.abs(n));
  const curves = [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }];
  if (n < -1e-9) curves.push({ param: [`${r6(s)}*sinh(t)`, `${r6(Math.sign(vt) * s)}*cosh(t)`], t: [-2, 2], color: 'ink3', dash: true, width: 1.2 });
  else if (n > 1e-9) curves.push({ param: [`${r6(Math.sign(vx) * s)}*cosh(t)`, `${r6(s)}*sinh(t)`], t: [-2, 2], color: 'ink3', dash: true, width: 1.2 });
  return {
    type: 'graph',
    params: {
      x: [r6(-R), r6(R)], y: [r6(-0.3 * R), r6(R)], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 't',
      curves, arrows: [{ from: [0, 0], to: [r6(vx), r6(vt)], color: 'gold', width: 2.6, label: name, labelDx: 8 }],
    },
    caption: caption ?? t`The vector drawn in the $(x, t)$ plane, $c = 1$: dashed orange is the light cone, grey the hyperbola through its tip. The picture is the same in both conventions; only the sign of the number $\eta(\mathbf V, \mathbf V)$ differs.`,
  };
}

/** Energy–momentum plane: an arrow (p, E) on its mass hyperbola. */
function emPicture({ m, p, unit = 'GeV', caption }) {
  const E = Math.hypot(m, p), top = E * 1.3;
  return {
    type: 'graph',
    params: {
      x: [r6(-0.35 * top), r6(top)], y: [0, r6(top)], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: `momentum (${unit})`, ylabel: `energy (${unit})`,
      curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: `sqrt(${r6(m * m)} + x^2)`, color: 'ink3', dash: true, width: 1.2, label: 'mass shell', labelAt: r6(-0.25 * top), labelDy: -12 }],
      arrows: [{ from: [0, 0], to: [r6(p), r6(E)], color: 'gold', width: 2.6, label: 'p', labelDx: 8 }],
    },
    caption: caption ?? t`A four-momentum on the energy–momentum plane, $c = 1$. The arrow and the mass shell are drawn identically in both conventions; one calls $\mathbf p\cdot\mathbf p$ $-m^2$, the other $+m^2$.`,
  };
}

// worked example: SuperKEKB, 7 GeV electrons on 4 GeV positrons
const KEK = { E1: 7, E2: 4 };
KEK.p1 = Math.sqrt(KEK.E1 ** 2 - ME ** 2); KEK.p2 = -Math.sqrt(KEK.E2 ** 2 - ME ** 2);
KEK.Et = KEK.E1 + KEK.E2; KEK.pt = KEK.p1 + KEK.p2;
KEK.mm = KEK.Et ** 2 - KEK.pt ** 2;     // (+,−,−,−) value of P·P

export default lesson({
  id: 'st-g.G-SIG.1',
  title: '(−,+,+,+) versus (+,−,−,−)',
  minutes: 11, difficulty: 2,
  intro: t`Relativists write the Minkowski metric as $\operatorname{diag}(-1, 1, 1, 1)$ — “mostly plus”, the signature of Misner–Thorne–Wheeler, Wald, Schutz, Hartle, Carroll and this Atlas. Most particle physicists write $\operatorname{diag}(1, -1, -1, -1)$ — “mostly minus”, as in Landau–Lifshitz and Peskin–Schroeder. The two metrics differ by an overall sign (with $c = 1$):

$$\eta^{(+---)}_{\mu\nu} = -\,\eta^{(-+++)}_{\mu\nu}, \qquad \mathbf A\cdot\mathbf B\,\big|_{(+---)} = -\,\mathbf A\cdot\mathbf B\,\big|_{(-+++)}$$

So **every dot product changes sign**, and with it every component with a lower index, $A_\mu = \eta_{\mu\nu}A^\nu$. **Components with an upper index do not change** — coordinates, four-velocities and four-momenta are the same lists of numbers in both books — and nothing anyone can measure changes. [Signature and the Minkowski metric](#/lesson/st-a.A6.6) showed why the count of minus signs is fixed; this lesson is the phrasebook for reading both camps.`,
  symbols: [
    { tex: '\\eta_{\\mu\\nu}', text: t`the Minkowski metric in an inertial frame, coordinates ordered $(t, x, y, z)$` },
    { tex: '(-,+,+,+)', text: 'the “mostly plus” signature of general relativity: timelike vectors have negative squared length' },
    { tex: '(+,-,-,-)', text: 'the “mostly minus” signature of most particle physics: timelike vectors have positive squared length' },
    { tex: '\\mathbf A\\cdot\\mathbf B', text: t`the dot product $\eta_{\mu\nu}A^\mu B^\nu$, a number every observer agrees on — within one convention` },
    { tex: 'A^\\mu', text: 'components with an upper index (a vector’s components): identical in both conventions' },
    { tex: 'A_\\mu', text: t`components with a lower index, $\eta_{\mu\nu}A^\nu$: they flip sign between the conventions` },
  ],
  why: 'Gravitational-wave astronomy uses (−,+,+,+) and particle physics mostly (+,−,−,−); dark matter, neutron stars and the early universe need both, and a single mistranslated sign turns a mass into a tachyon or an energy negative.',
  visual: {
    type: 'graph',
    title: 'One arrow, two sets of signs',
    lead: t`The gold arrow is a particle’s four-momentum on the energy–momentum plane. Switch the convention: nothing in the picture moves. Watch the readouts — the components with an upper index stay put, those with a lower index flip, and so does every dot product.`,
    tasks: [
      t`Switch to $(+,-,-,-)$: $p^0$ and $p^1$ do not change, but $p_0$ and $p_1$ both change sign, and $\mathbf p\cdot\mathbf p$ goes from $-m^2$ to $+m^2$.`,
      t`Slide the momentum: in each convention $\mathbf p\cdot\mathbf p$ never changes, because a dot product is the same for every observer. Only the convention chooses its sign.`,
      t`The energy is always $\mp\,\mathbf p\cdot\mathbf u$ for an observer at rest, $\mathbf u = (1, 0, 0, 0)$: the minus sign in Hartle’s $E = -\mathbf p\cdot\mathbf u$ is the price of mostly plus.`,
    ],
    params: {
      x: [-1.5, 4.2], y: [0, 4.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'momentum p¹ (GeV)', ylabel: 'energy p⁰ (GeV)',
      choices: [{ key: 's', label: 'Convention', options: [[1, t`$(-,+,+,+)$, mostly plus`], [-1, t`$(+,-,-,-)$, mostly minus`]], value: 1, explain: 'Mostly plus: MTW, Hartle, Carroll, Wald. Mostly minus: Landau–Lifshitz, Peskin–Schroeder. The picture is the same either way.' }],
      sliders: [{ key: 'p', label: t`Momentum $p^1$`, min: -1.2, max: 3.5, step: 0.01, value: 1.5, unit: t`\text{GeV}`, explain: 'The particle’s momentum along x in the laboratory frame.' }, { key: 'm', label: t`Mass $m$`, min: 0.1, max: 1.5, step: 0.01, value: 0.94, unit: t`\text{GeV}`, explain: 'About 0.94 GeV is a proton.' }],
      curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }, { fn: 'sqrt(m^2 + x^2)', color: 'ink3', dash: true, width: 1.4 }],
      arrows: [{ from: [0, 0], to: ['p', 'sqrt(m^2 + p^2)'], color: 'gold', width: 2.8, label: 'p', labelDx: 8 }],
      readouts: [
        { label: t`$p^0 = E$`, expr: 'sqrt(m^2 + p^2)', digits: 4, unit: t`\text{GeV}` },
        { label: t`$p^1$`, expr: 'p', digits: 4, unit: t`\text{GeV}` },
        { label: t`$p_0$`, expr: '-s*sqrt(m^2 + p^2)', digits: 4, unit: t`\text{GeV}` },
        { label: t`$p_1$`, expr: 's*p', digits: 4, unit: t`\text{GeV}` },
        { label: t`$\mathbf p\cdot\mathbf p = p_\mu p^\mu$`, expr: 's*(p^2 - (m^2 + p^2))', digits: 4, unit: t`\text{GeV}^2` },
        { label: t`$\mathbf p\cdot\mathbf u$, observer at rest`, expr: '-s*sqrt(m^2 + p^2)', digits: 4, unit: t`\text{GeV}` },
      ],
    },
    caption: t`One direction of space, $c = 1$. Grey dashed: the mass shell $E^2 - p^2 = m^2$; orange dashed: the light lines. The figure never changes with the convention — a convention is a choice of how to write numbers, not a change in the world.`,
  },
  example: {
    prompt: t`The SuperKEKB collider in Japan collides 7 GeV electrons head-on with 4 GeV positrons. Compute $\mathbf P\cdot\mathbf P$ for the total four-momentum in both conventions, and from it the collision energy $\sqrt{s}$. ($m_e = 0.511$ MeV.)`,
    visual: {
      type: 'graph',
      params: {
        x: [-5.5, 8.5], y: [0, 12.5], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'momentum (GeV)', ylabel: 'energy (GeV)',
        curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }, { fn: `sqrt(${r6(KEK.mm)} + x^2)`, color: 'ink3', dash: true, width: 1.2 }],
        arrows: [
          { from: [0, 0], to: [7, 7], color: 'accent', width: 2.4 },
          { from: [7, 7], to: [3, 11], color: 'violet', width: 2.4 },
          { from: [0, 0], to: [3, 11], color: 'gold', width: 2.8 },
        ],
        points: [
          { x: 3.5, y: 3.5, r: 0.01, color: 'accent', label: 'e⁻, 7 GeV', labelDx: 10, labelDy: 6 },
          { x: 5, y: 9, r: 0.01, color: 'violet', label: 'e⁺, 4 GeV', labelDx: 10, labelDy: 2 },
          { x: 1.5, y: 5.5, r: 0.01, color: 'gold', label: 'total P', labelDx: -10, labelDy: 4, labelAlign: 'right' },
        ],
      },
      caption: t`The two four-momenta added tip to tail ($c = 1$). The grey hyperbola holds every four-vector with the total’s invariant length. Electron masses are far too small to see: both arrows lie on light lines.`,
    },
    steps: [
      { label: 'The four-momenta', text: t`Upper-index components are the same in every book. The electron mass shifts the momenta by only parts in $10^{8}$, so $p_1^\mu = (7,\ 7,\ 0,\ 0)$ and $p_2^\mu = (4,\ -4,\ 0,\ 0)$ GeV, and $P^\mu = (11,\ 3,\ 0,\ 0)$ GeV.` },
      { label: 'Mostly minus', text: t`Peskin–Schroeder: $\mathbf P\cdot\mathbf P = (P^0)^2 - (P^1)^2 = 121 - 9 = 112\ \text{GeV}^2$, and they define $s = (p_1 + p_2)^2$ directly.` },
      { label: 'Mostly plus', text: t`Hartle or Carroll: $\mathbf P\cdot\mathbf P = -(P^0)^2 + (P^1)^2 = -112\ \text{GeV}^2$. Books in this convention define $s = -(p_1 + p_2)^2$, so that it comes out positive.` },
      { label: 'The physics', text: t`Both give $s = 112\ \text{GeV}^2$ and $\sqrt{s} = ${nice(Math.sqrt(KEK.mm), 5)}$ GeV — just above the mass of the $\Upsilon(4S)$ meson, $10.579$ GeV, which decays into pairs of B mesons. That is why the beam energies were chosen.` },
      { label: 'The dictionary', text: t`The same translation works everywhere:
$$\begin{array}{c|c|c} & (-,+,+,+) & (+,-,-,-) \\ \hline \mathbf u\cdot\mathbf u & -1 & +1 \\ \mathbf p\cdot\mathbf p & -m^2 & +m^2 \\ p_0 & -E & +E \\ E_{\text{obs}} & -\mathbf p\cdot\mathbf u & +\mathbf p\cdot\mathbf u \\ d\tau^2 & -ds^2 & +ds^2 \\ \text{timelike} & ds^2 < 0 & ds^2 > 0 \end{array}$$` },
    ],
    answer: t`$\mathbf P\cdot\mathbf P = +112\ \text{GeV}^2$ in $(+,-,-,-)$ and $-112\ \text{GeV}^2$ in $(-,+,+,+)$; both mean $\sqrt{s} = ${nice(Math.sqrt(KEK.mm), 4)}$ GeV.`,
  },
  practice: [
    mcq({
      id: 'which-book', difficulty: 1,
      prompt: t`A textbook states “for a free particle, $p^\mu p_\mu = m^2$”. Which signature does it use?`,
      visual: emPicture({ m: 0.94, p: 1.6 }),
      choices: [t`$(+,-,-,-)$`, t`$(-,+,+,+)$`, 'Either: the sign of p·p is not fixed by the signature', 'Neither: a mass shell must give zero'],
      answer: 0,
      why: {
        1: t`In $(-,+,+,+)$, $p^\mu p_\mu = -E^2 + |\vec p|^2 = -m^2$.`,
        2: t`For a given signature the sign is fixed: $p^\mu p_\mu = \eta_{\mu\nu}p^\mu p^\nu$ with a definite $\eta$.`,
        3: 'Zero is the mass shell of a massless particle only.',
      },
      hints: [t`Evaluate $p^\mu p_\mu$ in the rest frame, where $p^\mu = (m, 0, 0, 0)$.`],
      teach: 'Read a book’s signature off any invariant it states: p·p = +m² means mostly minus, −m² mostly plus.',
      explain: t`In the rest frame $p^\mu p_\mu = \eta_{00}m^2$, so $+m^2$ means $\eta_{00} = +1$: the $(+,-,-,-)$ signature of Landau–Lifshitz and most particle physics.`,
    }),
    num({
      id: 'lower-index', difficulty: 2,
      gen(r) {
        const [E, px] = r.pick([[5, 3], [13, 5], [17, 8], [25, 7]]);
        const which = r.pick(['p_0', 'p_x']);
        const ans = which === 'p_0' ? E : -px;
        return {
          prompt: t`A particle has $p^\mu = (${E}, ${px}, 0, 0)$ GeV. A paper in the $(+,-,-,-)$ convention lowers the index with $\eta_{\mu\nu} = \operatorname{diag}(1, -1, -1, -1)$. What is $${which}$ there, in GeV?`,
          visual: emPicture({ m: Math.sqrt(E * E - px * px), p: px, caption: t`The particle’s four-momentum ($c = 1$): $p^0 = ${E}$, $p^x = ${px}$ GeV in every convention.` }),
          answer: ans, units: 'GeV', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`That is the mostly-plus value. With $\eta = \operatorname{diag}(1, -1, -1, -1)$, $p_0 = +p^0$ and $p_x = -p^x$.` }],
          hints: [t`$p_\mu = \eta_{\mu\nu}p^\nu$: each lower component is the upper one times the diagonal entry.`],
          teach: 'Lowering an index multiplies each component by the metric’s diagonal entry, so lower components flip between the conventions.',
          explain: t`$p_0 = (+1)\,p^0 = ${E}$ GeV and $p_x = (-1)\,p^x = -${px}$ GeV, so $${which} = ${ans}$ GeV. In $(-,+,+,+)$ it would be ${-ans} GeV.`,
        };
      },
    }),
    num({
      id: 'interval-translate', difficulty: 2,
      gen(r) {
        const [dt, dx] = r.pick([[5, 3], [13, 12], [10, 8], [17, 15]]);
        const ll = dt * dt - dx * dx;
        return {
          prompt: t`In Landau–Lifshitz’s convention two events are separated by $\Delta s^2 = c^2\Delta t^2 - \Delta x^2 = +${ll}\ \text{ly}^2$. What number does a book using $(-,+,+,+)$ write for the same interval, in $\text{ly}^2$?`,
          visual: vecPicture({ V: [dt, dx], name: 'Δx', caption: t`The separation in the $(x, t)$ plane ($c = 1$, light-years and years): inside the light cone, so timelike in both conventions.` }),
          answer: -ll, units: 'ly^2', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ll, feedback: 'The interval is a dot product, so it flips sign between the conventions.' }],
          hints: [t`Every dot product changes sign between the conventions, and the interval is one: $\Delta s^2 = \Delta\mathbf x\cdot\Delta\mathbf x$.`],
          teach: 'The squared interval flips sign between conventions; its meaning (timelike, proper time) does not.',
          explain: t`$\Delta s^2 = -${ll}\ \text{ly}^2$: negative, which in mostly plus means timelike. In both books a clock carried between the events records $\sqrt{${ll}} = ${nice(Math.sqrt(ll), 4)}$ years.`,
        };
      },
    }),
    multi({
      id: 'what-changes', difficulty: 2,
      prompt: t`A calculation is translated from $(-,+,+,+)$ to $(+,-,-,-)$ by $\eta_{\mu\nu} \to -\eta_{\mu\nu}$. Which of these come out **unchanged**? Select every one.`,
      visual: vecPicture({ V: [2, 1.2], name: 'u', caption: t`A four-velocity in the $(x, t)$ plane, $c = 1$. Its components $u^\mu$ are the same in both conventions; $\mathbf u\cdot\mathbf u$ is $-1$ or $+1$.` }),
      choices: [t`the components $u^\mu$ of a four-velocity`, 'the light cone', 'a measured lifetime or cross section', t`the components $u_\mu$`, t`$\mathbf u\cdot\mathbf u$`, t`the Christoffel symbols $\Gamma^\lambda_{\mu\nu} = \tfrac12 g^{\lambda\sigma}(\partial_\mu g_{\sigma\nu} + \partial_\nu g_{\sigma\mu} - \partial_\sigma g_{\mu\nu})$`],
      answer: [0, 1, 2, 5],
      why: {
        3: t`$u_\mu = \eta_{\mu\nu}u^\nu$ carries one factor of the metric, so it flips.`,
        4: 'A dot product carries one factor of the metric: −1 becomes +1.',
      },
      hints: ['Count the factors of the metric in each quantity: an odd number flips, an even number (or none) does not.', t`In $\Gamma$, $g^{\lambda\sigma}$ flips and so do the derivatives of $g_{\mu\nu}$.`],
      teach: 'Count factors of the metric: anything with an odd number flips sign under η → −η, anything with an even number (or none) is unchanged.',
      explain: t`$u^\mu$ has no metric; the light cone is where $\eta(\mathbf V, \mathbf V) = 0$, the same set either way; measurements are physics. $\Gamma$ has one inverse metric and one metric derivative, two flips, so it is unchanged. $u_\mu$ and $\mathbf u\cdot\mathbf u$ have one factor of $\eta$ and flip.`,
    }),
    num({
      id: 'p-dot-u', difficulty: 2,
      gen(r) {
        const [E, p] = r.pick([[5, 4], [10, 6], [13, 12]]);
        const b = r.pick([0.6, 0.8, -0.6]);
        const g = 1 / Math.sqrt(1 - b * b), Eobs = g * (E - b * p);
        return {
          prompt: t`A particle has $p^\mu = (${E}, ${p}, 0, 0)$ GeV and a detector has $u^\mu = \gamma(1, ${b}, 0, 0)$, $\gamma = ${nice(g, 4)}$. Compute $\mathbf p\cdot\mathbf u$ in the $(-,+,+,+)$ convention, in GeV.`,
          visual: emPicture({ m: Math.sqrt(E * E - p * p), p, caption: t`The particle’s four-momentum ($c = 1$). The detector’s four-velocity is a second arrow, not drawn; their dot product is what either convention turns into the measured energy.` }),
          answer: -Eobs, units: 'GeV', tol: { rel: 0.003 },
          errors: [{ value: Eobs, feedback: t`That is the $(+,-,-,-)$ value. In mostly plus the time parts enter with a minus sign: $\mathbf p\cdot\mathbf u = -p^0u^0 + p^1u^1$.` }],
          hints: [t`$\mathbf p\cdot\mathbf u = -p^0u^0 + p^1u^1 = \gamma(-${E} + ${b}\times${p})$.`],
          teach: t`The measured energy is $-\mathbf p\cdot\mathbf u$ in $(-,+,+,+)$ and $+\mathbf p\cdot\mathbf u$ in $(+,-,-,-)$: the dot product itself flips sign.`,
          explain: t`$\mathbf p\cdot\mathbf u = ${nice(g, 4)}\times(-${E} + ${nice(b * p, 4)}) = ${nice(-Eobs, 4)}$ GeV, so the detector measures $E = -\mathbf p\cdot\mathbf u = ${nice(Eobs, 4)}$ GeV. A mostly-minus author gets $\mathbf p\cdot\mathbf u = +${nice(Eobs, 4)}$ GeV and the same energy.`,
        };
      },
    }),
    mcq({
      id: 'mixed', difficulty: 3, kind: 'error',
      prompt: t`A student takes the mass-shell condition $\mathbf p\cdot\mathbf p = m^2$ from Peskin–Schroeder and the energy formula $E = -\mathbf p\cdot\mathbf u$ from Hartle, and finds that a proton at rest has energy $-m$. Where is the mistake?`,
      visual: emPicture({ m: 0.938, p: 0, caption: t`A proton at rest: its four-momentum points straight up the energy axis, $p^\mu = (m, 0, 0, 0)$, in either convention.` }),
      choices: ['The two formulas come from different signatures and cannot be combined', t`Hartle’s formula should be $E = \mathbf p\cdot\mathbf p/m$`, t`A proton at rest has $\mathbf u = 0$`, 'Energy can be negative for particles at rest'],
      answer: 0,
      why: {
        1: t`$\mathbf p\cdot\mathbf p/m = \pm m$ is the rest energy only; it is not the energy a moving observer measures.`,
        2: t`A four-velocity is never zero: at rest it is $(1, 0, 0, 0)$.`,
        3: 'A free particle’s energy is never negative in either convention; the sign came from mixing books.',
      },
      hints: ['Check which signature each formula belongs to.', t`In Peskin–Schroeder’s signature, $\mathbf p\cdot\mathbf u = +E$.`],
      teach: 'Never combine formulas from books with different signatures without translating one of them first.',
      explain: t`In $(+,-,-,-)$, $\mathbf p\cdot\mathbf u = +m$ for a particle at rest, and the energy is $+\mathbf p\cdot\mathbf u$. Hartle’s minus sign belongs with $\mathbf p\cdot\mathbf p = -m^2$. Mixing them gives $-m$.`,
    }),
    mcq({
      id: 'plane-wave', difficulty: 3,
      prompt: t`In $(+,-,-,-)$ a plane wave of angular frequency $\omega$ and wave vector $\vec k$ is written $e^{-ik_\mu x^\mu}$, with $k^\mu = (\omega, \vec k)$. How is the same wave written in $(-,+,+,+)$?`,
      visual: {
        type: 'graph',
        params: { x: [0, 12.6], y: [-1.4, 1.4], aspect: 'wide', xlabel: 'x', ylabel: 'Re ψ', curves: [{ fn: 'cos(x - 1)', color: 'accent', width: 2.2 }, { fn: 'cos(x - 2.2)', color: 'violet', dash: true, width: 1.6 }] },
        caption: t`The real part of the wave at two moments (solid, then dashed a little later): the crests move towards $+x$ when the phase is $\vec k\cdot\vec x - \omega t$.`,
      },
      choices: [t`$e^{+ik_\mu x^\mu}$`, t`$e^{-ik_\mu x^\mu}$`, t`$e^{+ik^\mu x^\mu}$`, t`$e^{-ik_\mu x_\mu}$`],
      answer: 0,
      why: {
        1: t`In mostly plus $k_\mu x^\mu = -\omega t + \vec k\cdot\vec x$, so $e^{-ik_\mu x^\mu} = e^{i(\omega t - \vec k\cdot\vec x)}$: the complex conjugate — a negative-frequency wave.`,
        2: t`$k^\mu x^\mu$ has both indices up: it is not a contraction and not the same in every frame.`,
        3: t`Both indices down is not a contraction either.`,
      },
      hints: [t`In $(+,-,-,-)$, $k_\mu x^\mu = \omega t - \vec k\cdot\vec x$.`, t`In $(-,+,+,+)$, $k_\mu x^\mu = -\omega t + \vec k\cdot\vec x$: the opposite sign.`],
      teach: t`The phase $\vec k\cdot\vec x - \omega t$ is the physics; it is $-k_\mu x^\mu$ in mostly minus and $+k_\mu x^\mu$ in mostly plus.`,
      explain: t`The wave is $e^{i(\vec k\cdot\vec x - \omega t)}$ in both books. Mostly minus writes it $e^{-ik\cdot x}$, mostly plus $e^{+ik\cdot x}$ — a famous source of sign slips in quantum field theory.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-collider', difficulty: 3, transfer: true,
      gen(r) {
        const [name, E] = r.pick([['the LHC, 6.8 TeV per proton beam', 6.8], ['the Tevatron, 0.98 TeV per beam (protons on antiprotons)', 0.98], ['RHIC, 0.255 TeV per polarized-proton beam', 0.255]]);
        const exact = -((2 * E) ** 2);
        return {
          prompt: t`At ${name}, two beam particles collide head-on with equal energies. A gravitational-wave physicist, using $(-,+,+,+)$, computes $(\mathbf p_1 + \mathbf p_2)\cdot(\mathbf p_1 + \mathbf p_2)$. What number does she get, in $\text{TeV}^2$?`,
          visual: vecPicture({ V: [2, 0], name: 'P = p₁ + p₂', caption: t`Head-on and equal: the total four-momentum points straight up the time axis ($c = 1$), $P^\mu = (2E, 0, 0, 0)$, in both conventions.` }),
          answer: exact, tol: { rel: 0.002 },
          errors: [{ value: -exact, feedback: 'That is the mostly-minus value, s itself. In (−,+,+,+) the dot product of a timelike vector is negative.' }, { value: -E * E * 2, feedback: t`The total energy is $2E$, and its square is $4E^2$.` }],
          hints: [t`The momenta cancel: $P^\mu = (2E, 0, 0, 0)$, with $E = ${E}$ TeV.`, t`In $(-,+,+,+)$, $\mathbf P\cdot\mathbf P = -(P^0)^2$.`],
          teach: 'Collider physicists quote s = (p₁ + p₂)² > 0 in mostly minus; in mostly plus the same dot product is −s.',
          explain: t`$\mathbf P\cdot\mathbf P = -(2\times${E})^2 = ${nice(exact, 5)}\ \text{TeV}^2$, so $s = ${nice(-exact, 5)}\ \text{TeV}^2$ and $\sqrt{s} = ${nice(2 * E, 4)}$ TeV, the number in the papers. The masses never enter: equal and opposite momenta cancel exactly.`,
        };
      },
    }),
    mcq({
      id: 'cp-klein-gordon', difficulty: 3,
      prompt: t`Peskin–Schroeder write the free scalar field equation as $(\partial_\mu\partial^\mu + m^2)\phi = 0$, where in their signature $\partial_\mu\partial^\mu = \partial_t^2 - \nabla^2$. How does a $(-,+,+,+)$ book write the same equation?`,
      visual: emPicture({ m: 0.5, p: 1.1, caption: t`A plane-wave solution has a four-momentum on the mass shell, $\omega^2 = |\vec k|^2 + m^2$, in both conventions.` }),
      choices: [t`$(\partial_\mu\partial^\mu - m^2)\phi = 0$, with $\partial_\mu\partial^\mu = -\partial_t^2 + \nabla^2$`, t`$(\partial_\mu\partial^\mu + m^2)\phi = 0$, with $\partial_\mu\partial^\mu = -\partial_t^2 + \nabla^2$`, t`$(\partial_\mu\partial^\mu - m^2)\phi = 0$, with $\partial_\mu\partial^\mu = \partial_t^2 - \nabla^2$`, t`$(\partial_\mu\partial^\mu + m^2)\phi = 0$, with $\partial_\mu\partial^\mu = \partial_t^2 + \nabla^2$`],
      answer: 0,
      why: {
        1: t`That equation is $-\partial_t^2\phi + \nabla^2\phi + m^2\phi = 0$: plane waves would need $\omega^2 = |\vec k|^2 - m^2$, a tachyon.`,
        2: t`In mostly plus $\partial_\mu\partial^\mu = \eta^{\mu\nu}\partial_\mu\partial_\nu = -\partial_t^2 + \nabla^2$.`,
        3: t`$\partial_t^2 + \nabla^2$ is not built from either Minkowski metric.`,
      },
      hints: [t`$\partial_\mu\partial^\mu$ contains one inverse metric, so it flips sign; $m^2$ does not.`, t`Test with $\phi = e^{i(\vec k\cdot\vec x - \omega t)}$: the equation must give $\omega^2 = |\vec k|^2 + m^2$.`],
      teach: t`The Klein–Gordon equation is $(\Box + m^2)\phi = 0$ in mostly minus and $(\Box - m^2)\phi = 0$ in mostly plus: the box flips, the mass does not.`,
      explain: t`Both say $\partial_t^2\phi - \nabla^2\phi + m^2\phi = 0$. In mostly plus $\Box = -\partial_t^2 + \nabla^2$, so the equation reads $(\Box - m^2)\phi = 0$.`,
    }),
    num({
      id: 'cp-classify', difficulty: 2,
      gen(r) {
        const V = r.pick([[3, 4], [5, 2], [2, 2], [7, 3], [1, 3]]);
        const ans = V[0] * V[0] - V[1] * V[1];
        return {
          prompt: t`A vector has components $V^\mu = (${V[0]}, ${V[1]}, 0, 0)$. Compute $\mathbf V\cdot\mathbf V$ in the $(+,-,-,-)$ convention.`,
          visual: vecPicture({ V }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: ans !== 0 ? [{ value: -ans, feedback: t`That is the $(-,+,+,+)$ value. In mostly minus, $\mathbf V\cdot\mathbf V = (V^0)^2 - (V^1)^2$.` }] : [],
          hints: [t`$\eta = \operatorname{diag}(1, -1, -1, -1)$.`],
          teach: 'In mostly minus, timelike vectors have positive square, spacelike ones negative; null ones zero in both.',
          explain: t`$${V[0]}^2 - ${V[1]}^2 = ${ans}$: ${ans > 0 ? 'positive, so timelike in this convention' : ans < 0 ? 'negative, so spacelike in this convention' : 'zero, so null in either convention'}. In $(-,+,+,+)$ the same vector has $\mathbf V\cdot\mathbf V = ${-ans === 0 ? 0 : -ans}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Misner, Thorne & Wheeler, Gravitation (1973), inside front cover: sign conventions', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Peskin & Schroeder, An Introduction to Quantum Field Theory (1995), notations and conventions', url: 'https://www.routledge.com/An-Introduction-To-Quantum-Field-Theory/Peskin-Schroeder/p/book/9780201503975' },
    { label: 'Belle II / SuperKEKB: 7 GeV electrons on 4 GeV positrons at the Υ(4S)', url: 'https://www.belle2.org/' },
  ],
});
