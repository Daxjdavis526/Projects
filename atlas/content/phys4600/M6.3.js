// Maxwell's equations in covariant form (Griffiths §12.3.4–12.3.5), in index
// notation with Carroll's −+++ signature and F^{0i} = E_i/c:
// ∂_ν F^{μν} = μ₀J^μ (Gauss + Ampère–Maxwell) and ∂_ν G^{μν} = 0 (no
// monopoles + Faraday), with J^μ = (cρ, J). Charge conservation ∂_μJ^μ = 0
// from antisymmetry; the Lorenz-gauge wave equation □A^μ = −μ₀J^μ. Honest
// about index order: ∂_μF^{μν} = −μ₀J^ν with this F (Jackson's F, with the
// opposite sign, writes it with +). Explore: a graph of the worldlines of the
// ions and drifting electrons in a neutral current-carrying wire, seen from a
// moving frame — J^μ is a four-vector, so the wire acquires a net charge
// (Purcell's magnetism-from-relativity). Links st-c.C10.4 for the
// forms view (dF = 0, d⋆F = ⋆J). Transfers: an electron beside a lightning
// channel, an LHC bunch's rest-frame charge density.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, QE, PI, sf, tensorTable, F_CELLS, F_COLORS, MPC2 } from './_em4c.js';

const t = String.raw;

/**
 * Worldlines (x′ across, ct′ up) of a wire's ions and drifting electrons, seen
 * from a frame moving along the wire at β (graph). In the wire's frame both
 * have spacing 1; the electrons drift at u (c = 1, hugely exaggerated).
 */
function wirePic(caption, { b = 0, u = 0.5, live = false, n = 9 } = {}) {
  const curves = [];
  const g = '(1/sqrt(1 - b^2))', up = '((u - b)/(1 - u*b))';
  for (let k = -n; k <= n; k++) {
    curves.push({ param: [`${k}*sqrt(1 - b^2) - b*t`, 't'], t: [0, 3.5], color: 'warn', width: 1.6 });
    curves.push({ param: [`${k}/(${g}*(1 - b*u)) + ${up}*t`, 't'], t: [0, 3.5], color: 'accent', width: 1.6, dash: [5, 4] });
  }
  return {
    type: 'graph',
    params: {
      x: [-4, 4], y: [0, 4.5], aspect: 'wide', axesAt: 'edge', xlabel: 'x′ along the wire (spacing in the wire’s frame = 1)', ylabel: 'ct′', yticks: 4, grid: false,
      ...(live ? {
        sliders: [{ key: 'b', label: t`Observer’s speed along the wire, $\beta$`, min: -0.8, max: 0.8, step: 0.01, value: b, explain: 'The frame you watch the wire from, moving along it at this fraction of c.' }],
        constants: { u },
        readouts: [
          { label: t`ions $\lambda'_+/\lambda_0$`, expr: g, digits: 3 },
          { label: t`electrons $\lambda'_-/\lambda_0$`, expr: `-${g}*(1 - b*u)`, digits: 3 },
          { label: t`net $\lambda'/\lambda_0$`, expr: `${g}*b*u`, digits: 3 },
        ],
      } : { constants: { b, u } }),
      curves,
      hlines: [{ y: 3, color: 'ink3', label: 'one instant, t′ = 3' }],
      legend: [{ label: 'positive ions', color: 'warn' }, { label: 'electrons', color: 'accent', dash: [5, 4] }], legendAt: 'tl',
    },
    caption,
  };
}

const FPIC = (caption) => tensorTable(F_CELLS, { caption, colors: F_COLORS, names: ['t', 'x', 'y', 'z'] });

export default lesson({
  id: 'phys4600.M6.3',
  title: 'Maxwell’s equations in covariant form',
  minutes: 18, difficulty: 4,
  equation: t`\partial_\nu F^{\mu\nu} = \mu_0J^\mu, \qquad \partial_\nu G^{\mu\nu} = 0, \qquad J^\mu = (c\rho,\ \vec J)`,
  intro: t`Charge and current also belong together: the **four-current** $J^\mu = (c\rho, \vec J)$ is a four-vector, $\rho_0u^\mu$ for charges moving with four-velocity $u^\mu$. With it, Maxwell’s four equations become two. The **inhomogeneous** one, $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$, is four equations: $\mu = 0$ is Gauss’s law, $\mu = 1, 2, 3$ the three components of Ampère–Maxwell. The **homogeneous** one, with the dual $G^{\mu\nu}$, gives $\nabla\cdot\vec B = 0$ and Faraday’s law. Written as tensor equations they hold in every inertial frame at once. Two more things fall out. Differentiate the first again: $\partial_\mu\partial_\nu F^{\mu\nu}$ vanishes because $F$ is antisymmetric, so $\partial_\mu J^\mu = 0$ — **charge conservation** is built in. And with $F^{\mu\nu} = \partial^\mu A^\nu - \partial^\nu A^\mu$ in the Lorenz gauge $\partial_\mu A^\mu = 0$, the first equation becomes four wave equations, $\Box A^\mu = -\mu_0J^\mu$. A caution on signs: the derivative is contracted with the **second** index of $F$. With this $F$, $\partial_\mu F^{\mu\nu} = -\mu_0J^\nu$.`,
  symbols: [
    { tex: 'F^{\\mu\\nu}', text: t`the field tensor of [M6.2](#/lesson/phys4600.M6.2), $F^{0i} = E_i/c$, $F^{ij} = \varepsilon_{ijk}B_k$, in tesla` },
    { tex: 'G^{\\mu\\nu}', text: t`its dual: $G^{0i} = B_i$, $G^{ij} = -\varepsilon_{ijk}E_k/c$` },
    { tex: '\\partial_\\nu', text: t`$\partial/\partial x^\nu$ with $x^\nu = (ct, x, y, z)$; a repeated index is summed over 0–3` },
    { tex: 'J^\\mu', text: t`the four-current: $c$ times the charge density $\rho$ (C/m³), then the current density $\vec J$ (A/m²)` },
    { tex: '\\mu_0', text: t`the permeability of free space, $1.257\times10^{-6}$ N/A²` },
  ],
  why: t`This is the form in which electromagnetism enters general relativity — replace $\partial$ by the covariant derivative $\nabla$ and nothing else changes — and the template for every gauge theory of particle physics. The same content as two differential forms, $dF = 0$ and $d{\star}F = {\star}J$, is in [st-c.C10.4](#/lesson/st-c.C10.4).`,
  visual: {
    ...wirePic(t`Worldlines of a wire’s positive ions (orange) and conduction electrons (blue, dashed), $c = 1$. In the wire’s frame both are spaced 1 apart, so the wire is neutral. The electrons’ drift is drawn at $0.5c$; in a real wire it is about $10^{-13}c$, and the effect is tiny but exactly the size of the magnetic force.`, { live: true, b: 0, u: 0.5 }),
    title: 'A neutral wire that is charged',
    lead: t`A wire carrying a current: positive ions at rest, electrons drifting along it. In the wire’s own frame the two kinds of worldline are equally spaced — no net charge. Now watch from a frame moving along the wire. Count the lines crossing the grey “one instant” line.`,
    tasks: [
      t`Move at $\beta = 0.5$, the electrons’ speed: they stand still and spread out, while the ions crowd together. The wire is **positively charged** in this frame.`,
      t`Move the other way: now the electrons crowd and the wire is negative. The net density is $\gamma\beta u\lambda_0$ — linear in the current.`,
      t`This is $J^\mu$ transforming as a four-vector: $c\rho' = \gamma(c\rho - \beta J_x)$. A charge moving alongside the wire feels a magnetic force in one frame and an electric force in the other.`,
    ],
  },
  example: {
    prompt: t`Show that the $\mu = 0$ component of $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$ is Gauss’s law and the $\mu = 1$ component is the $x$-component of the Ampère–Maxwell law.`,
    visual: FPIC(t`$F^{\mu\nu}$: the equation for each $\mu$ reads along row $\mu$, differentiating each entry with respect to its column’s coordinate.`),
    steps: [
      { label: 'Row 0', text: t`$\partial_\nu F^{0\nu} = \partial_0F^{00} + \partial_xF^{01} + \partial_yF^{02} + \partial_zF^{03}$. With $F^{00} = 0$ and $F^{0i} = E_i/c$, that is $\dfrac1c\nabla\cdot\vec E$.` },
      { label: 'Gauss', text: t`Set it equal to $\mu_0J^0 = \mu_0c\rho$: $\nabla\cdot\vec E = \mu_0c^2\rho = \rho/\varepsilon_0$, since $\mu_0\varepsilon_0c^2 = 1$.` },
      { label: 'Row 1', text: t`$\partial_\nu F^{1\nu} = \partial_0F^{10} + \partial_yF^{12} + \partial_zF^{13} = -\dfrac{1}{c^2}\dfrac{\partial E_x}{\partial t} + \dfrac{\partial B_z}{\partial y} - \dfrac{\partial B_y}{\partial z}$, using $\partial_0 = \tfrac1c\partial_t$.` },
      { label: 'Ampère–Maxwell', text: t`The last two terms are $(\nabla\times\vec B)_x$. Setting the row equal to $\mu_0J_x$ gives $(\nabla\times\vec B)_x = \mu_0J_x + \mu_0\varepsilon_0\,\partial E_x/\partial t$ — the displacement current of [M1.4](#/lesson/phys4600.M1.4) included automatically.` },
      { label: 'Sense check', text: t`Units: $F$ is in tesla, $\partial$ in 1/m, so the left side is T/m; $\mu_0J$ is (T·m/A)(A/m²) = T/m ✓.` },
    ],
    answer: t`Row 0 gives $\nabla\cdot\vec E = \rho/\varepsilon_0$; rows 1–3 give $\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\,\partial\vec E/\partial t$.`,
  },
  practice: [
    mcq({
      id: 'which-mu', difficulty: 1,
      prompt: t`Which component of $\partial_\nu G^{\mu\nu} = 0$ is the statement that there are no magnetic monopoles, $\nabla\cdot\vec B = 0$?`,
      visual: tensorTable([['', 'Bx', 'By', 'Bz'], ['−Bx', '', '−Ez/c', 'Ey/c'], ['−By', 'Ez/c', '', '−Ex/c'], ['−Bz', '−Ey/c', 'Ex/c', '']], { caption: t`The dual $G^{\mu\nu}$: the magnetic field now fills the time row.`, colors: [['', 'teal', 'teal', 'teal'], ['teal', '', 'gold', 'gold'], ['teal', 'gold', '', 'gold'], ['teal', 'gold', 'gold', '']], names: ['t', 'x', 'y', 'z'] }),
      choices: [t`$\mu = 0$: the time row, $\partial_iG^{0i} = \nabla\cdot\vec B$`, t`$\mu = 1$`, t`$\mu = 3$, the $z$-row`, 'None: it is an extra condition imposed separately'],
      answer: 0,
      why: {
        1: t`The space rows ($\mu = 1, 2, 3$) give the three components of Faraday’s law.`,
        2: t`The $z$ row holds $-B_z$ and parts of $\vec E$: it is the $z$-component of Faraday’s law.`,
        3: 'It is part of the homogeneous tensor equation, not separate.',
      },
      hints: [t`The time row of $G$ is $(0, B_x, B_y, B_z)$.`, t`$\partial_\nu G^{0\nu}$ differentiates each $B_i$ by $x^i$.`],
      teach: 'Time rows give the scalar laws (Gauss, no monopoles); space rows give the vector ones.',
      explain: t`$\partial_\nu G^{0\nu} = \partial_xB_x + \partial_yB_y + \partial_zB_z = 0$. The rows $\mu = i$ give $-\dfrac1c\left(\dfrac{\partial\vec B}{\partial t} + \nabla\times\vec E\right)_i = 0$: Faraday.`,
    }),
    order({
      id: 'conserve', difficulty: 3,
      prompt: t`Order the steps showing that $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$ forces charge conservation.`,
      visual: FPIC(t`$F^{\mu\nu} = -F^{\nu\mu}$: each entry is minus its mirror image across the diagonal.`),
      items: [
        t`Apply $\partial_\mu$ to both sides: $\partial_\mu\partial_\nu F^{\mu\nu} = \mu_0\partial_\mu J^\mu$`,
        t`Rename the summed indices: $\partial_\mu\partial_\nu F^{\mu\nu} = \partial_\nu\partial_\mu F^{\nu\mu}$`,
        t`Use $\partial_\nu\partial_\mu = \partial_\mu\partial_\nu$ and $F^{\nu\mu} = -F^{\mu\nu}$: the sum equals minus itself`,
        t`So it is zero, and $\partial_\mu J^\mu = 0$`,
        t`Which is $\partial\rho/\partial t + \nabla\cdot\vec J = 0$`,
      ],
      hints: ['A symmetric operator contracted with an antisymmetric tensor gives zero.', 'Show the double sum equals minus itself.'],
      teach: 'Charge conservation follows from Maxwell’s equations because F is antisymmetric and partial derivatives commute.',
      explain: t`Symmetric $\partial_\mu\partial_\nu$ against antisymmetric $F^{\mu\nu}$ always gives zero. The continuity equation of [M2.1](#/lesson/phys4600.M2.1) is not an extra assumption: Maxwell’s equations would be inconsistent without it.`,
    }),
    num({
      id: 'rest-density', difficulty: 2,
      gen(r) {
        const rho = r.pick([2, 5, 8]), b = r.pick([0.6, 0.8, 0.9]);   // μC/m³
        const g = 1 / Math.sqrt(1 - b * b);
        return {
          prompt: t`A beam of charge has density $\rho = ${rho}\ \mu\text{C/m}^3$ in the lab and moves at $${b}c$, so $\vec J = \rho\vec v$. What is its charge density in its own rest frame? (Use $J_\mu J^\mu = -c^2\rho_0^2$.)`,
          visual: wirePic(t`Seen from the rest frame of the blue charges: the orange charges, spaced 1 apart in their own rest frame, move at $0.8c$ and are packed $\gamma = 1.67$ times closer, 0.6 apart. $c = 1$.`, { b: 0.8, u: 0.8 }),
          answer: rho / g, units: 'uC/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho * g, feedback: t`In the lab the beam is length-contracted, so the lab density is the **larger** one: $\rho = \gamma\rho_0$.` }],
          hints: [t`$J_\mu J^\mu = -c^2\rho^2 + J^2 = -c^2\rho^2(1 - \beta^2)$.`, t`So $\rho_0 = \rho\sqrt{1 - \beta^2} = \rho/\gamma$.`],
          teach: t`$J^\mu = \rho_0u^\mu$: the rest-frame density is the invariant length of the four-current, $\rho_0 = \rho/\gamma$.`,
          explain: t`$\rho_0 = \rho/\gamma = ${rho}\times${nice(sf(Math.sqrt(1 - b * b), 3))} \approx ${nice(sf(rho / g, 3))}\ \mu\text{C/m}^3$. The charge is the same; only the volume it fills differs between frames.`,
        };
      },
    }),
    num({
      id: 'wire', difficulty: 3,
      gen(r) {
        const I = r.pick([5, 10, 20]), v = r.pick([100, 1000, 8000]);
        const lam = (v * I) / (C * C);
        return {
          prompt: t`A neutral wire carries ${I} A. An observer moves along it at ${v} m/s ($\gamma \approx 1$). What net line charge density does the observer measure on the wire? Give its size in units of $10^{-15}$ C/m.`,
          visual: wirePic(t`The wire seen from a moving frame: ions and electrons no longer equally spaced. Speeds hugely exaggerated; $c = 1$.`, { b: 0.4, u: 0.5 }),
          answer: (lam / 1e-15), tol: { rel: 0.01 },
          errors: [{ value: (v * I) / C / 1e-15, feedback: t`Transform $c\rho$: $c\lambda' = \gamma(c\lambda - \beta I)$, so $\lambda' = -\gamma vI/c^2$ — two powers of $c$.` }],
          hints: [t`The wire has $\lambda = 0$ and current $I$ along it: $(c\lambda, I)$ transforms like $(ct, x)$.`, t`$c\lambda' = \gamma(0 - \beta I)$, so $|\lambda'| = \gamma vI/c^2$.`],
          teach: 'A neutral current-carrying wire is charged, λ′ = −γvI/c², in a frame moving along it — the source of magnetism.',
          explain: t`$|\lambda'| = vI/c^2 \approx ${tex(lam, 3)}$ C/m. Tiny — yet its electric field $\lambda'/2\pi\varepsilon_0s$ at distance $s$ is exactly $v\mu_0I/2\pi s = vB$: the magnetic force in the lab, seen as an electric force here.`,
        };
      },
    }),
    mcq({
      id: 'lorenz', difficulty: 2,
      prompt: t`Put $F^{\mu\nu} = \partial^\mu A^\nu - \partial^\nu A^\mu$ into $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$ and choose the Lorenz gauge, $\partial_\nu A^\nu = 0$. What is left?`,
      visual: FPIC(t`$F^{\mu\nu}$, built from derivatives of the four-potential $A^\mu = (V/c, \vec A)$.`),
      choices: [
        t`$\Box A^\mu = -\mu_0J^\mu$: a wave equation for each component, sourced by the current`,
        t`$\Box A^\mu = 0$: the potentials no longer feel the sources`,
        t`$\partial_\nu A^\nu = \mu_0J^\mu$`,
        t`$A^\mu = \mu_0J^\mu$`,
      ],
      answer: 0,
      why: {
        1: t`The sources stay: only the term $\partial^\mu(\partial_\nu A^\nu)$ is removed by the gauge choice.`,
        2: 'That equates a scalar with a four-vector component; the indices do not even match.',
        3: 'The equation still has second derivatives: the potentials obey wave equations.',
      },
      hints: [t`$\partial_\nu F^{\mu\nu} = \partial^\mu(\partial_\nu A^\nu) - \partial_\nu\partial^\nu A^\mu$.`, t`$\partial_\nu\partial^\nu = \Box = \nabla^2 - \dfrac{1}{c^2}\dfrac{\partial^2}{\partial t^2}$ in $(-, +, +, +)$.`],
      teach: t`In Lorenz gauge, Maxwell’s equations are four wave equations, $\Box A^\mu = -\mu_0J^\mu$, one per component.`,
      explain: t`$\partial_\nu F^{\mu\nu} = \partial^\mu(\partial_\nu A^\nu) - \Box A^\mu$; the gauge kills the first term, leaving $-\Box A^\mu = \mu_0J^\mu$. These are the wave equations of [M4.2](#/lesson/phys4600.M4.2), solved by the retarded potentials of M4.3 — and the same steps, applied to the metric, give the linearized gravitational wave equation.`,
    }),
    mcq({
      id: 'index-order', difficulty: 4,
      prompt: t`With $F^{0i} = +E_i/c$ (this course’s convention), a student writes Maxwell’s equations as $\partial_\mu F^{\mu\nu} = \mu_0J^\nu$, contracting the derivative with the **first** index. What happens?`,
      visual: FPIC(t`$F^{\mu\nu}$ with $F^{0i} = +E_i/c$: column 0 holds $-\vec E/c$.`),
      choices: [
        t`Gauss’s law comes out as $\nabla\cdot\vec E = -\rho/\varepsilon_0$: with this $F$ the first-index form needs $-\mu_0J^\nu$`,
        'Nothing: the index contracted does not matter',
        'Only Faraday’s law changes sign',
        'It is correct in (−, +, +, +) and wrong only in (+, −, −, −)',
      ],
      answer: 0,
      why: {
        1: t`Swapping the indices of an antisymmetric tensor flips its sign, so it matters.`,
        2: t`Faraday’s law lives in the dual equation, which this choice does not touch.`,
        3: t`Griffiths, in $(+, -, -, -)$, has the same $F^{\mu\nu}$ matrix and the same rule: contract with the second index. Jackson defines $F$ with the opposite sign, and then the first-index form is right.`,
      },
      hints: [t`Column 0 of $F$ is $-\vec E/c$.`, t`$\partial_\mu F^{\mu0} = \partial_iF^{i0} = -\nabla\cdot\vec E/c$.`],
      teach: 'Index order on an antisymmetric tensor is a sign: match each book’s F to its own form of the equation.',
      explain: t`$\partial_\mu F^{\mu0} = -\nabla\cdot\vec E/c$, so $\partial_\mu F^{\mu\nu} = \mu_0J^\nu$ would give $\nabla\cdot\vec E = -\rho/\varepsilon_0$. Correct forms with this $F$: $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$ (Griffiths) or $\partial_\mu F^{\nu\mu} = \mu_0J^\nu$ (Carroll). A sign table for translating between books is in [st-g.G-SIG.2](#/lesson/st-g.G-SIG.2).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lightning', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([10, 20, 30]), v = r.pick([1, 2, 5]), s = r.pick([5, 10, 20]);   // kA, 10^6 m/s, m
        const E = (v * 1e6 * MU0 * I * 1e3) / (2 * PI * s);
        return {
          prompt: t`A lightning channel carries ${I} kA, straight and steady for the moment. An electron ${s} m away moves parallel to it at $${v}\times10^{6}$ m/s. In the electron’s own frame the channel carries a net line charge $\lambda' = -\gamma vI/c^2$. What electric field does the electron feel there, in V/m? ($\gamma \approx 1$.)`,
          visual: wirePic(t`A current seen from a frame moving along it: the two kinds of charge no longer balance. Speeds hugely exaggerated; $c = 1$.`, { b: 0.5, u: 0.5 }),
          answer: E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: (v * 1e6 * I * 1e3) / (C * C) / (4 * PI * EPS0 * s), feedback: t`A line charge’s field is $\lambda/2\pi\varepsilon_0s$, not $\lambda/4\pi\varepsilon_0s$.` }],
          hints: [t`$E' = \dfrac{|\lambda'|}{2\pi\varepsilon_0s}$ with $|\lambda'| = vI/c^2$.`, t`Since $\varepsilon_0c^2 = 1/\mu_0$, $E' = v\dfrac{\mu_0I}{2\pi s} = vB$.`],
          teach: 'The magnetic force on a moving charge in one frame is an electric force in its own frame: E′ = vB.',
          explain: t`$E' = \dfrac{vI}{2\pi\varepsilon_0c^2s} = v\,\dfrac{\mu_0I}{2\pi s} \approx ${nice(sf(E, 3))}$ V/m — precisely $vB$, the field the lab would call magnetic. The four-current transformation and the field transformation of M6.1 tell one story.`,
        };
      },
    }),
    num({
      id: 'cp-bunch', difficulty: 3, transfer: true,
      gen(r) {
        const [E, Np] = r.pick([[6.8, 1.15e11], [6.5, 1.2e11], [0.45, 1.15e11]]);
        const L = 0.3, rad = r.pick([0.5, 1]) * 1e-3;   // rough bunch: 30 cm long (lab), radius in m
        const g = (E * 1e3) / MPC2, rho = (Np * QE) / (PI * rad * rad * L), rho0 = rho / g;
        return {
          prompt: t`An LHC bunch holds $${tex(Np, 3)}$ protons at ${E} TeV ($m_pc^2 = 938.3$ MeV). Model it in the lab as a uniform cylinder 30 cm long and ${rad * 1e3} mm in radius. What is its charge density in its own rest frame, in $\mu\text{C/m}^3$?`,
          visual: wirePic(t`Seen from the rest frame of the blue charges: the orange charges, spaced 1 apart in their own rest frame, move at $0.8c$ and are packed $\gamma = 1.67$ times closer, 0.6 apart. $c = 1$.`, { b: 0.8, u: 0.8 }),
          answer: rho0 * 1e6, units: 'uC/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho * 1e6, feedback: t`That is the lab density. In the rest frame the bunch is $\gamma$ times longer (its radius is unchanged), so $\rho_0 = \rho/\gamma$.` }, { value: rho * g * 1e6, feedback: t`The lab sees the bunch contracted: the rest-frame density is **lower**, $\rho/\gamma$.` }],
          hints: [t`Lab density: $\rho = Ne/(\pi r^2L)$.`, t`$\rho_0 = \rho/\gamma$ with $\gamma = E/m_pc^2$: only the length along the motion changes.`],
          teach: t`$J_\mu J^\mu = -c^2\rho_0^2$: a fast bunch’s rest-frame density is its lab density divided by $\gamma$.`,
          explain: t`$\rho \approx ${nice(sf(rho * 1e6, 3))}\ \mu\text{C/m}^3$ in the lab and $\gamma \approx ${nice(sf(g, 4))}$, so $\rho_0 \approx ${tex(rho0 * 1e6, 3)}\ \mu\text{C/m}^3$: in its own frame the bunch is ${nice(sf((g * L) / 1e3, 2))} km long. (Real bunches are Gaussian and much narrower at the collision points; this is a uniform-cylinder estimate.)`,
        };
      },
    }),
    mcq({
      id: 'cp-frames', difficulty: 2,
      prompt: t`Why is it enough to check that $\partial_\nu F^{\mu\nu} = \mu_0J^\mu$ holds in one inertial frame?`,
      visual: FPIC(t`$F^{\mu\nu}$: every entry changes under a boost, but the equation between tensors does not.`),
      choices: [
        t`Both sides are four-vectors; if they are equal in one frame, the same Lorentz transformation acts on both, so they are equal in every frame`,
        'Because the fields are the same in every frame',
        'Because the equation contains no time derivatives',
        'It is not enough: each frame must be checked separately',
      ],
      answer: 0,
      why: {
        1: 'The fields differ between frames (M6.1); what is preserved is the form of the equation.',
        2: t`$\partial_0 = \tfrac1c\partial_t$ is one of the four derivatives in it.`,
        3: 'That was the situation before Einstein, which is why it mattered that Maxwell’s equations turned out to be covariant.',
      },
      hints: [t`How does each side transform? $\partial_\nu F^{\mu\nu}$ has one free index.`],
      teach: 'A tensor equation true in one frame is true in all: covariance is what the index notation buys.',
      explain: t`$\partial_\nu F^{\mu\nu} - \mu_0J^\mu$ is a four-vector; if all its components vanish in one frame, $\Lambda$ times zero is zero in every other. This is why Einstein could make the laws of physics frame-independent by writing them as tensor equations — and in general relativity, as equations between tensors on curved spacetime.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §12.3.1 and §12.3.4–12.3.5', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Carroll, Lecture Notes on General Relativity, §1.9 (Maxwell’s equations, −+++)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Purcell & Morin, Electricity and Magnetism (3rd ed.), §5.9: magnetism as a consequence of relativity', url: 'https://doi.org/10.1017/CBO9781139012973' },
  ],
});
