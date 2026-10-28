// Electrostatics and magnetostatics side by side (Griffiths §5.3.4, §6.3–6.4
// and the course as a whole): the static Maxwell equations as one table —
// divergence and curl, potentials, Poisson's equations, the fields in matter,
// bound sources, boundary conditions — with Helmholtz's theorem saying why
// div, curl and the conditions at infinity are enough. The dictionary
// ε₀E ↔ H, P ↔ M, D ↔ B/μ₀ that turns a polarized body's solution into a
// magnetized one's (the em3h-magnet sim's electret mode), and where the
// parallel breaks: E inside a polarized sphere points against P, B inside a
// magnetized one along M. Line charge against line current (E/B = c²/v), the
// energy densities (E = cB for equal energy), magnetic against electrostatic
// pressure. Transfers: the self-fields of an ion thruster's beam, and why
// actuators are magnetic. Hands off to PHYS 4600, where the curls gain
// their time derivatives.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, QE, AMU, PI, sf, circle, polygon, bare } from './_mag.js';
import { centreN, magPic } from './_matter.js';

const t = String.raw;
const C = 299792458;                 // m/s, exact
const M_XE = 131.293;                // u, xenon's standard atomic weight (the ion's mass, to 4 figures)
const E_AIR = 3e6;                   // V/m: dry air at sea level breaks down near 3 MV/m (approximate; depends on gap and pressure)

/** Side by side: a point charge with radial E (left) and a wire carrying current out of the page with circling B (right). */
const pairPic = (caption) => ({
  type: 'graph',
  params: bare([-3.2, 3.2], [-1.55, 1.55], {
    curves: [0.55, 0.95, 1.35].map((rr) => circle(rr, 'accent', { width: 1.5 }, 1.6, 0)),
    arrows: [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * PI) / 4; return { from: [-1.6 + 0.3 * Math.cos(a), 0.3 * Math.sin(a)], to: [-1.6 + 1.25 * Math.cos(a), 1.25 * Math.sin(a)], color: 'warn', width: 1.8 }; }),
      ...[0.55, 0.95, 1.35].map((rr) => ({ from: [1.6 + rr, -0.05], to: [1.6 + rr, 0.05], color: 'accent', width: 1.8 })),
    ],
    points: [{ x: -1.6, y: 0, r: 8, color: 'warn' }, { x: -1.6, y: 0, r: 0, label: '+', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'bg' }, { x: 1.6, y: 0, r: 6, color: 'accent' }, { x: -1.6, y: -1.42, r: 0, label: 'E of a charge', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'warn' }, { x: 1.6, y: -1.42, r: 0, label: 'B of a current (out of page)', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' }],
  }),
  caption,
});

/** A beam end-on: radial E (orange) and circling B (blue) at one radius. */
const beamPic = (caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: 'sqrt(max(0.09 - x^2, 0))', lower: '-sqrt(max(0.09 - x^2, 0))', from: -0.3, to: 0.3, color: 'violet', alpha: 0.5 }],
    curves: [circle(0.9, 'accent', { width: 1.5, dash: [5, 4] })],
    arrows: [...[0, 1, 2, 3, 4, 5].map((k) => { const a = (k * PI) / 3 + 0.3; return { from: [0.9 * Math.cos(a), 0.9 * Math.sin(a)], to: [1.25 * Math.cos(a), 1.25 * Math.sin(a)], color: 'warn', width: 2 }; }),
      ...[0, 1, 2, 3].map((k) => { const a = (k * PI) / 2 + 0.9; return { from: [0.9 * Math.cos(a), 0.9 * Math.sin(a)], to: [0.9 * Math.cos(a) - 0.3 * Math.sin(a), 0.9 * Math.sin(a) + 0.3 * Math.cos(a)], color: 'accent', width: 2 }; })],
    points: [{ x: 0.32, y: -0.28, r: 0, label: 'beam (out of page)', labelDx: 4, labelDy: 8, color: 'violet' }, { x: 1.3, y: 0.9, r: 0, label: 'E', color: 'warn' }, { x: -1.05, y: 0.6, r: 0, label: 'B', color: 'accent' }],
  }),
  caption,
});

/** An interface between two media (horizontal), with a field line refracting across it. */
const interfacePic = {
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '0', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.18 }],
    curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'ink2', width: 2 }],
    arrows: [{ from: [-1.4, 1.1], to: [0, 0], color: 'accent', width: 2.2 }, { from: [0, 0], to: [0.5, -1.1], color: 'accent', width: 2.2 }, { from: [0, 0], to: [0, 0.75], color: 'ink3', width: 1.4, dash: [4, 4], label: 'n̂', labelDx: 6 }],
    points: [{ x: 1.6, y: 0.6, r: 0, label: 'medium 1', color: 'ink2' }, { x: 1.6, y: -0.6, r: 0, label: 'medium 2', color: 'teal' }],
  }),
  caption: 'A field line crossing the interface between two materials, bending as it goes. Schematic.',
};

// the worked example: a polarized and a magnetized sphere of the same size
const EX_P = 1.0e-6, EX_M = 1.0e6;
const EX_E = EX_P / (3 * EPS0), EX_B = (2 / 3) * MU0 * EX_M;

export default lesson({
  id: 'phys3600.M8.1',
  title: 'Electrostatics and magnetostatics side by side',
  minutes: 15, difficulty: 3,
  intro: t`Everything in this course rests on four equations — two divergences and two curls — and a table shows how closely the two halves mirror each other:
$$\begin{array}{c|c} \text{electrostatics} & \text{magnetostatics} \\ \hline \nabla\cdot\vec E = \rho/\varepsilon_0 & \nabla\cdot\vec B = 0 \\ \nabla\times\vec E = 0 & \nabla\times\vec B = \mu_0\vec J \\ \vec E = -\nabla V & \vec B = \nabla\times\vec A \\ \nabla^2V = -\rho/\varepsilon_0 & \nabla^2\vec A = -\mu_0\vec J \\ \rho_b = -\nabla\cdot\vec P & \vec J_b = \nabla\times\vec M \\ \nabla\cdot\vec D = \rho_f & \nabla\times\vec H = \vec J_f \end{array}$$
Charge is a **source** of $\vec E$; current makes $\vec B$ **circulate**. Each field has one derivative that vanishes, and that is what licenses its potential: no curl, so $\vec E = -\nabla V$; no divergence, so $\vec B = \nabla\times\vec A$. By [Helmholtz’s theorem](#/lesson/phys3600.M0.5) a divergence and a curl that are known everywhere, plus fields that die away at infinity, fix a field uniquely — so this table, with the boundary conditions of M2.2 and M6.5, is all of statics. In matter, polarization and magnetization add bound sources of exactly the same mathematical form, and that gives a **dictionary**: where no free charge or current is present, $\varepsilon_0\vec E$ of a polarized body obeys the same equations as $\vec H$ of a magnetized one, with $\vec P$ in place of $\vec M$.`,
  symbols: [
    { tex: '\\vec E,\\ \\vec B', text: 'the electric field (V/m) and the magnetic field (T)' },
    { tex: '\\rho,\\ \\vec J', text: t`charge density ($\text{C/m}^3$) and current density ($\text{A/m}^2$); subscripts $f$ and $b$ mark free and bound parts` },
    { tex: 'V,\\ \\vec A', text: 'the scalar potential (V) and the vector potential (T·m)' },
    { tex: '\\vec D,\\ \\vec H', text: t`the displacement $\varepsilon_0\vec E + \vec P$ ($\text{C/m}^2$) and the auxiliary field $\vec B/\mu_0 - \vec M$ (A/m)` },
    { tex: '\\vec P,\\ \\vec M', text: t`polarization ($\text{C/m}^2$) and magnetization (A/m): dipole moment per unit volume` },
    { tex: '\\varepsilon_0,\\ \\mu_0', text: t`the vacuum permittivity and permeability; $1/\sqrt{\varepsilon_0\mu_0} = c$` },
  ],
  why: t`Next course the two curls gain time derivatives — $\nabla\times\vec E = -\partial\vec B/\partial t$ and Maxwell’s displacement current — and the two halves of this table become one theory of light.`,
  visual: {
    type: 'em3h-magnet',
    title: 'Electret and magnet',
    lead: t`A body polarized uniformly (an **electret**) and one magnetized uniformly (a **magnet**), of the same shape. Switch between them and between the fields. The probe’s inset adds the two parts of $\vec D$ or $\vec B$ head to tail.`,
    tasks: [
      t`Show the auxiliary field and switch body: the electret’s $\varepsilon_0\vec E$ and the magnet’s $\vec H$ are the same picture — lines from the $+$ face to the $-$ face, backward inside.`,
      t`Now show the field itself: the electret’s $\vec D$ and the magnet’s $\vec B$ are the same picture too, closed loops through the body. The difference is which one is “the” field: $\vec E$ for the electret, $\vec B$ for the magnet.`,
      t`So inside, the electret’s real field $\vec E$ points **against** $\vec P$, while the magnet’s real field $\vec B$ points **along** $\vec M$. Outside, $\vec E$ and $\vec B$ have exactly the same shape.`,
    ],
    params: { kind: 'electret', show: 'H', ratio: 0.6, probe: [0.2, 0.35], controls: ['kind', 'show', 'shape', 'ratio'], M: 1 },
    caption: t`Exact fields of a uniformly polarized or magnetized cylinder, in units of $P$ or $M$ (the readouts use $P = 1\ \mu\text{C/m}^2$ for the electret, $M = 1$ kA/m for the magnet). Real electrets slowly lose their polarization as stray charge settles on them.`,
  },
  example: {
    prompt: t`A sphere polarized uniformly with $P = ${tex(EX_P, 2)}\ \text{C/m}^2$ has $\vec E = -\vec P/3\varepsilon_0$ inside ([M5.1](#/lesson/phys3600.M5.1)). Use the dictionary to find $\vec H$ and $\vec B$ inside a sphere of the same size magnetized uniformly with $M = ${tex(EX_M, 2)}\ \text{A/m}$, then compare the two bodies inside and out.`,
    visual: magPic({ kind: 'electret', shape: 'sphere', show: 'H', sources: true }, t`The polarized sphere and its $\vec E$ lines, from $+$ bound charge to $-$; read as a magnet, the same picture is its $\vec H$. Exact.`),
    steps: [
      { label: 'The two problems', text: t`Electret: $\nabla\times\vec E = 0$ and $\nabla\cdot(\varepsilon_0\vec E) = -\nabla\cdot\vec P$. Magnet (no free current): $\nabla\times\vec H = 0$ and $\nabla\cdot\vec H = -\nabla\cdot\vec M$. The same equations, with $\varepsilon_0\vec E \leftrightarrow \vec H$ and $\vec P \leftrightarrow \vec M$.` },
      { label: 'Same answer', text: t`Same equations, same shape, same conditions at infinity: by uniqueness, the same solution. So $\vec H = -\vec M/3$ inside the magnetized sphere, just as $\varepsilon_0\vec E = -\vec P/3$.` },
      { label: 'Then B', text: t`$\vec B = \mu_0(\vec H + \vec M) = \tfrac23\mu_0\vec M$ — the result M7.1 got from the bound currents. Numbers: $B = ${nice(sf(EX_B, 3))}$ T along $\vec M$, while the electret has $E = ${nice(sf(EX_E / 1e3, 3))}$ kV/m **against** $\vec P$.` },
      { label: 'Outside', text: t`Outside, $\vec M = 0$ and $\vec P = 0$, so $\vec B = \mu_0\vec H$ and $\vec E = \vec H$’s twin divided by $\varepsilon_0$: both are pure dipole fields, with $\vec p = \tfrac43\pi R^3\vec P$ and $\vec m = \tfrac43\pi R^3\vec M$.` },
      { label: 'Where they differ', text: t`The physical fields differ only inside: $\vec E$ follows the auxiliary-field pattern (sources at the surface), $\vec B$ the closed-loop one. It is the difference between bound **charge** and bound **current** — and between point dipoles’ contact terms, which M6.6 found in hydrogen’s 21-cm line.` },
    ],
    answer: t`Inside the magnet $\vec H = -\vec M/3$ and $\vec B = \tfrac23\mu_0\vec M \approx ${nice(sf(EX_B, 3))}$ T; inside the electret $\vec E = -\vec P/3\varepsilon_0 \approx -${nice(sf(EX_E / 1e3, 3))}$ kV/m along $\vec P$. Outside, both are dipole fields of the same shape.`,
  },
  practice: [
    match({
      id: 'laws', difficulty: 2,
      prompt: 'Match each equation to what it says.',
      visual: pairPic('A charge is a source of E, whose lines leave it (left); a current makes B circulate round it (right, current out of the page). Schematic.'),
      left: [t`$\nabla\cdot\vec E = \rho/\varepsilon_0$`, t`$\nabla\times\vec E = 0$`, t`$\nabla\cdot\vec B = 0$`, t`$\nabla\times\vec B = \mu_0\vec J$`, t`$\nabla\cdot\vec D = \rho_f$`, t`$\nabla\times\vec H = \vec J_f$`],
      right: ['charge is where E lines begin and end', 'a static E never circulates, so E = −∇V', 'there are no magnetic charges, so B = ∇ × A', 'current makes B circulate round it', 'free charge alone is the source of D', 'free current alone makes H circulate'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['A divergence says where field lines start or stop; a curl says how much they swirl.', 'D and H are the fields that count only the free part of the sources.'],
      teach: 'Divergences locate sources, curls locate circulation: the static Maxwell equations say charge sources E, current circulates B, and neither has the other kind.',
      explain: t`Divergence: $\rho$ is the source of $\vec E$, and nothing is the source of $\vec B$. Curl: nothing makes a static $\vec E$ circulate, and $\vec J$ makes $\vec B$ circulate. In matter, $\vec D$ and $\vec H$ split off the bound parts, keeping only $\rho_f$ and $\vec J_f$ — but each gives up the other derivative: $\nabla\times\vec D = \nabla\times\vec P$ and $\nabla\cdot\vec H = -\nabla\cdot\vec M$ need not vanish.`,
    }),
    mcq({
      id: 'potentials', difficulty: 2,
      prompt: t`Why may every static $\vec E$ be written $-\nabla V$, but $\vec B$ only as $\nabla\times\vec A$?`,
      visual: pairPic('E spreads from charges but never swirls; B swirls round currents but never spreads. Schematic.'),
      choices: [
        t`$\nabla\times\vec E = 0$ makes $\vec E$ a gradient; $\nabla\cdot\vec B = 0$ makes $\vec B$ a curl`,
        t`$\vec E$ acts on charges at rest and $\vec B$ only on moving ones`,
        t`$\nabla\cdot\vec E = \rho/\varepsilon_0$ makes $\vec E$ a gradient; $\nabla\times\vec B = \mu_0\vec J$ makes $\vec B$ a curl`,
        t`$V$ is a scalar because charge is a scalar, and $\vec A$ a vector because current is a vector`,
      ],
      answer: 0,
      why: {
        1: 'True of the forces, but it says nothing about which potential a field admits.',
        2: t`Backwards: the **vanishing** derivative is what allows a potential. A curl-free field is a gradient; a divergence-free field is a curl.`,
        3: t`It is suggestive — Poisson’s equations do follow — but the potentials exist because of the vanishing derivatives: $\nabla\times\nabla V = 0$ and $\nabla\cdot(\nabla\times\vec A) = 0$ always.`,
      },
      hints: [t`What is $\nabla\times(\nabla V)$? And $\nabla\cdot(\nabla\times\vec A)$?`, 'A field may be written as a gradient exactly when its curl vanishes, and as a curl exactly when its divergence vanishes (in a simple region).'],
      teach: 'No curl, so a scalar potential; no divergence, so a vector potential — each field’s vanishing derivative licenses its potential.',
      explain: t`Because $\nabla\times\nabla V = 0$ identically, a field can be a gradient only if its curl vanishes — and the converse holds in a simply connected region. Likewise $\nabla\cdot(\nabla\times\vec A) = 0$, and a divergence-free field is a curl. Statics has $\nabla\times\vec E = 0$ and $\nabla\cdot\vec B = 0$; once fields change in time, $\nabla\times\vec E \ne 0$ and $V$ alone is no longer enough.`,
    }),
    num({
      id: 'energy-equal', difficulty: 2,
      gen(r) {
        const B = r.pick([0.05, 0.2, 0.5, 1.5]);
        const E = B / Math.sqrt(EPS0 * MU0), u = (B * B) / (2 * MU0);
        return {
          prompt: t`What electric field stores the same energy per cubic metre as a magnetic field of ${B} T? (The energy densities are $\tfrac12\varepsilon_0E^2$ and $B^2/2\mu_0$.)`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'B (T)', ylabel: 'u (10⁵ J/m³)', curves: [{ fn: 'x^2/(2*1.25663706127e-6)/1e5', color: 'accent', width: 2.6 }], vlines: [{ x: B, color: 'gold' }], points: [{ x: B, y: u / 1e5, r: 5, color: 'gold' }] }, caption: 'Magnetic energy density against B (blue), at the field asked about (gold).' },
          answer: E / 1e6, units: 'MV/m', tol: { rel: 0.01 },
          errors: [{ value: B / MU0 / 1e6, feedback: t`Set the energy densities equal: $E = B/\sqrt{\varepsilon_0\mu_0} = cB$, not $B/\mu_0$ (that is $H$, in A/m).` }],
          hints: [t`$\tfrac12\varepsilon_0E^2 = \dfrac{B^2}{2\mu_0}$, so $E = \dfrac{B}{\sqrt{\varepsilon_0\mu_0}}$.`, t`$1/\sqrt{\varepsilon_0\mu_0} = c$.`],
          teach: 'Equal energy density needs E = cB: a modest magnetic field matches an enormous electric one.',
          explain: t`$E = cB \approx ${nice(sf(E / 1e6, 3))}$ MV/m, storing $${tex(u, 3)}\ \text{J/m}^3$. Air breaks down near 3 MV/m, so an electric field can never hold the energy density of even a modest magnet in air: that is why motors and actuators are magnetic.`,
        };
      },
    }),
    num({
      id: 'beam-e', difficulty: 3,
      gen(r) {
        const I = r.pick([2, 5, 10]), v = r.pick([30, 40, 50]), s = r.pick([0.5, 1, 2]);
        const lam = (I * 1e-3) / (v * 1e3), E = lam / (2 * PI * EPS0 * s * 1e-2), B = (MU0 * I * 1e-3) / (2 * PI * s * 1e-2);
        return {
          prompt: t`A narrow beam of xenon ions carries ${I} mA at ${v} km/s, with no electrons to neutralize it. Treating it as a long line, how strong is its electric field ${s} cm from the axis?`,
          visual: beamPic(t`The beam end-on (violet): its charge makes a radial $\vec E$ (orange), its current a circling $\vec B$ (blue) — Gauss’s law and Ampère’s law on the same dashed circle. Not to scale.`),
          answer: E / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: (I * 1e-3) / (2 * PI * EPS0 * s * 1e-2) / 1e3, feedback: t`The current is not the charge per length: $\lambda = I/v$, charge per second divided by metres per second.` }],
          hints: [t`The line charge is $\lambda = I/v$.`, t`Gauss: $E = \dfrac{\lambda}{2\pi\varepsilon_0s}$.`],
          teach: 'A beam is a line charge λ = I/v and a line current I at once: E = λ/2πε₀s and B = μ₀I/2πs, with E/B = c²/v.',
          explain: t`$\lambda = I/v = ${tex(lam, 3)}$ C/m, so $E = \dfrac{\lambda}{2\pi\varepsilon_0s} \approx ${nice(sf(E / 1e3, 3))}$ kV/m — while its $B = \mu_0I/2\pi s$ is only $${tex(B, 3)}$ T. Their ratio is $E/B = c^2/v$, enormous for a slow beam. A real ion thruster’s beam of an ampere or more would blow itself apart this way; a neutralizer cathode feeds it an equal current of electrons.`,
        };
      },
    }),
    multi({
      id: 'bc', difficulty: 3,
      prompt: t`A field line crosses the boundary between two materials. There is **no free** charge or current on the boundary, but there may be bound ones. Which components are certainly continuous across it?`,
      visual: interfacePic,
      choices: [t`$E_\parallel$`, t`$D_\perp$`, t`$B_\perp$`, t`$H_\parallel$`, t`$E_\perp$`, t`$B_\parallel$`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`$E_\perp$ jumps by $\sigma_b/\varepsilon_0$ where polarization ends: bound surface charge.`,
        5: t`$B_\parallel$ jumps by $\mu_0K_b$ where magnetization ends: bound surface current.`,
      },
      hints: ['Pillboxes give the normal components (divergence laws); thin loops give the tangential ones (curl laws).', t`$\vec D$ and $\vec H$ jump only at **free** sources; $\vec E$ and $\vec B$ at all sources — but $\vec E$ has no curl and $\vec B$ no divergence.`],
      teach: 'At a boundary with no free sources, E∥, D⊥, B⊥ and H∥ are continuous; E⊥ and B∥ jump by the bound charge and current.',
      explain: t`From the curl laws: $\nabla\times\vec E = 0$ keeps $E_\parallel$ continuous, and $\nabla\times\vec H = \vec J_f$ keeps $H_\parallel$ continuous when $\vec K_f = 0$. From the divergence laws: $\nabla\cdot\vec B = 0$ keeps $B_\perp$ continuous, and $\nabla\cdot\vec D = \rho_f$ keeps $D_\perp$ continuous when $\sigma_f = 0$. In linear media these give the refraction laws $\tan\theta_2/\tan\theta_1 = \varepsilon_2/\varepsilon_1$ and $\mu_2/\mu_1$.`,
    }),
    mcq({
      id: 'spheres', difficulty: 3,
      prompt: t`A sphere polarized uniformly with $\vec P$ and a sphere magnetized uniformly with $\vec M$, both along $+\hat z$. Which describes their physical fields, $\vec E$ and $\vec B$?`,
      visual: magPic({ kind: 'electret', shape: 'sphere', show: 'H', sources: true }, t`The polarized sphere’s $\vec E$, from its bound charge. Exact.`),
      choices: [
        t`Outside both are dipole fields of the same shape; inside, $\vec E$ points against $\vec P$ but $\vec B$ along $\vec M$`,
        'Identical everywhere, apart from units',
        t`Inside both point along their polarization or magnetization; outside they differ`,
        t`Inside $\vec E$ points along $\vec P$, while $\vec B$ points against $\vec M$`,
      ],
      answer: 0,
      why: {
        1: t`Their **auxiliary** fields ($\varepsilon_0\vec E$ and $\vec H$) match everywhere; $\vec E$ and $\vec B$ do not, because $\vec B = \mu_0(\vec H + \vec M)$ adds $\vec M$ inside.`,
        2: t`Outside they agree: both are pure dipoles. And inside $\vec E$ points against $\vec P$ ($-\vec P/3\varepsilon_0$).`,
        3: t`Swapped: bound charge makes $\vec E$ run from the $+$ end to the $-$ end, against $\vec P$; bound current makes $\vec B$ run along $\vec M$.`,
      },
      hints: [t`Inside: $\vec E = -\vec P/3\varepsilon_0$; $\vec B = \tfrac23\mu_0\vec M$.`, 'Outside: both are point-dipole fields.'],
      teach: 'Polarized and magnetized bodies look alike from outside; inside, bound charge turns E against P while bound current turns B along M.',
      explain: t`Outside, $\vec E$ is the field of $\vec p = \tfrac43\pi R^3\vec P$ and $\vec B$ that of $\vec m = \tfrac43\pi R^3\vec M$: the same shape. Inside, $\vec E = -\vec P/3\varepsilon_0$ but $\vec B = +\tfrac23\mu_0\vec M$. The auxiliary fields $\varepsilon_0\vec E$ and $\vec H$ are the twins; the physical field of the magnet is $\vec B = \mu_0(\vec H + \vec M)$.`,
    }),
    num({
      id: 'dictionary', difficulty: 3,
      gen(r) {
        const ratio = r.pick([0.25, 0.5, 1, 2]), P = r.pick([2, 5]), M = r.pick([600, 900, 1200]);
        const S = { shape: 'cylinder', half: ratio, L: 2 * ratio };
        const N = centreN(S), E = (-N * P * 1e-6) / EPS0;
        return {
          prompt: t`A cylinder polarized uniformly along its axis with $P = ${P}\ \mu\text{C/m}^2$ has $\vec E$ of $${nice(sf(E / 1e3, 4))}$ kV/m along its axis at its centre (negative: against $\vec P$). A cylinder of exactly the same shape is magnetized uniformly with $M = ${M}$ kA/m. What is $H$ along the axis at its centre?`,
          visual: magPic({ kind: 'electret', ratio, show: 'H', sources: true }, t`The polarized cylinder and its $\vec E$ lines; read as a magnet of the same shape, the same lines are its $\vec H$. Exact.`),
          answer: -N * M, units: 'kA/m', tol: { rel: 0.01 },
          errors: [
            { value: N * M, feedback: t`Keep the sign: $\vec H$ inside a magnet, like $\vec E$ inside an electret, points backward.` },
            { value: (-N * M * 1e3 * MU0) * 1e3, feedback: t`That is $\mu_0H$ in mT; the question asks for $H$ in kA/m.` },
            { value: (1 - N) * M, feedback: t`$(1 - N)M$ is $B/\mu_0$ at the centre. $\vec H = \vec B/\mu_0 - \vec M$.` },
          ].filter((e) => Math.abs(e.value + N * M) > 0.02 * N * M),
          hints: [t`The dictionary: $\varepsilon_0\vec E \leftrightarrow \vec H$ and $\vec P \leftrightarrow \vec M$. So $H/M = \varepsilon_0E/P$.`, t`$\varepsilon_0E/P = \dfrac{(${tex(EPS0, 5)})(${nice(sf(E, 4))})}{${P}\times10^{-6}}$.`],
          teach: 'Where no free sources act, a magnet’s H is its electret twin’s ε₀E with P replaced by M — same shape, same solution.',
          explain: t`$\varepsilon_0E/P \approx ${nice(sf(-N, 3))}$ — the shape’s depolarizing factor with a minus sign. So $H = ${nice(sf(-N, 3))}\times${M} \approx ${nice(sf(-N * M, 3))}$ kA/m, against $\vec M$. Nothing about the magnet had to be solved again.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion-beam', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([1000, 1100, 1500, 1800]);
        const v = Math.sqrt((2 * QE * V) / (M_XE * AMU)), ratio = (v / C) ** 2;
        return {
          prompt: t`In a gridded ion thruster, singly charged xenon ions (mass about ${M_XE} u) are accelerated through ${V} V. Inside the beam, each ion feels the beam’s electric repulsion and its magnetic “pinch”, and for a long beam their ratio is $F_B/F_E = v^2/c^2$. What is that ratio, in parts per billion?`,
          visual: beamPic(t`The ion beam end-on (violet), its radial $\vec E$ (orange) and circling $\vec B$ (blue). The electric force on an ion pushes outward, the magnetic force inward. Not to scale.`),
          answer: ratio * 1e9, tol: { rel: 0.01 },
          errors: [{ value: (v / C) * 1e9, feedback: t`Square it: the ratio is $(v/c)^2$ — one factor of $v$ from the current that makes $\vec B$, one from the ion’s motion through it.` }],
          hints: [t`$\tfrac12mv^2 = eV$, so $v = \sqrt{2eV/m}$, with $m = ${M_XE}\times${tex(AMU, 6)}$ kg.`, t`Then $F_B/F_E = (v/c)^2$; multiply by $10^9$.`],
          teach: 'For charges moving together, the magnetic force is v²/c² times the electric one: magnetism is the relativistic correction to electrostatics.',
          explain: t`$v = \sqrt{2eV/m} \approx ${nice(sf(v / 1e3, 3))}$ km/s, and $(v/c)^2 \approx ${nice(sf(ratio * 1e9, 3))}$ parts per billion. The magnetic pinch is negligible, so the beam’s own repulsion must be cancelled by electrons from the neutralizer cathode. The ratio $v^2/c^2$ is no accident: the magnetic force is the electric one seen from a moving frame, the thread PHYS 4600 follows to relativity.`,
        };
      },
    }),
    num({
      id: 'cp-pressure', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.3, 0.6, 1, 1.5]);
        const pB = (B * B) / (2 * MU0), pE = (EPS0 * E_AIR * E_AIR) / 2, ratio = pB / pE;
        return {
          prompt: t`An actuator pulls on a part with the field’s pressure — $B^2/2\mu_0$ for a magnetic gap, $\tfrac12\varepsilon_0E^2$ for an electrostatic one. In air, $E$ is limited to about 3 MV/m by breakdown. How many times larger is the magnetic pressure with ${B} T in the gap than the largest electrostatic pressure?`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'B (T)', ylabel: 'pressure (10⁵ Pa)', curves: [{ fn: 'x^2/(2*1.25663706127e-6)/1e5', color: 'accent', width: 2.6 }], hlines: [{ y: pE / 1e5, color: 'warn', label: 'electrostatic, at breakdown' }], points: [{ x: B, y: pB / 1e5, r: 5, color: 'gold' }] }, caption: 'Magnetic pressure against B (blue), the electrostatic pressure at air’s breakdown field (orange, almost on the axis), and the field asked about (gold).' },
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: B / (Math.sqrt(EPS0 * MU0) * E_AIR), feedback: t`The pressures go as the **squares** of the fields: square $cB/E$.` }],
          hints: [t`$p_B = B^2/2\mu_0$ and $p_E = \tfrac12\varepsilon_0E^2$ with $E = 3\times10^{6}$ V/m.`, t`The ratio is $\left(\dfrac{cB}{E}\right)^2$.`],
          teach: 'Field pressure goes as the field squared, and the electric field in air is capped at breakdown — so magnetic actuators win by thousands.',
          explain: t`$p_B = ${tex(pB, 3)}$ Pa against $p_E \approx ${nice(sf(pE, 3))}$ Pa: about $${nice(sf(ratio, 3))}$ times larger. Electrostatic actuators work in micromachines, where gaps of microns raise the breakdown field, but every reaction wheel, valve and gimbal motor on a spacecraft is magnetic.`,
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 3,
      prompt: t`Permanent-magnet designers often write $\vec H = -\nabla W$ and solve $\nabla^2W = \nabla\cdot\vec M$, exactly like electrostatics. Why is that allowed?`,
      visual: magPic({ ratio: 0.8, show: 'H', sources: true }, t`A magnet’s $\vec H$ lines, from the pole density on its faces: the picture of an electrostatic field. Exact.`),
      choices: [
        t`With no free current, $\nabla\times\vec H = 0$, so $\vec H$ is a gradient; and $\nabla\cdot\vec H = -\nabla\cdot\vec M$`,
        t`Because $\nabla\cdot\vec B = 0$ makes $\vec B$ a gradient`,
        t`Because $\vec H$ is always curl-free, whatever the currents`,
        t`It is only an approximation for weak magnets`,
      ],
      answer: 0,
      why: {
        1: t`$\nabla\cdot\vec B = 0$ makes $\vec B$ a **curl**, $\nabla\times\vec A$, not a gradient.`,
        2: t`$\nabla\times\vec H = \vec J_f$: with coils present, $\vec H$ circulates and has no single-valued scalar potential round them.`,
        3: t`It is exact wherever there is no free current — that is the whole point of $\vec H$.`,
      },
      hints: [t`Which derivative of $\vec H$ vanishes where there is no free current?`, t`Then $\nabla\cdot\vec H = -\nabla\cdot\vec M$ plays the role of $\rho/\varepsilon_0$.`],
      teach: 'Where there is no free current, H is curl-free: a magnetic scalar potential turns magnet design into electrostatics with pole density for charge.',
      explain: t`$\nabla\times\vec H = \vec J_f = 0$ makes $\vec H = -\nabla W$, and $\nabla\cdot\vec H = -\nabla\cdot\vec M$ gives $\nabla^2W = \nabla\cdot\vec M$ — Poisson’s equation with $-\nabla\cdot\vec M$ (and $\vec M\cdot\hat n$ on surfaces) as the “charge”. Every method of M4 — images, separation of variables, multipoles, relaxation — then designs magnets. Then $\vec B = \mu_0(\vec H + \vec M)$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.3.4, §6.3 and §6.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Goebel and Katz, Fundamentals of Electric Propulsion (JPL, 2008), ch. 5 and 6: ion beams and neutralizers', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
