// Maxwell's equations in matter and the boundary conditions (Griffiths
// §7.3.5–7.3.6): bound charge −∇·P, bound current ∇×M and the new
// polarization current ∂P/∂t (bound charges moving as P changes; it obeys
// its own continuity equation with ρ_b); the equations in terms of free
// sources, ∇·D = ρ_f and ∇×H = J_f + ∂D/∂t; in a linear dielectric the
// displacement current ∂D/∂t splits into ε₀∂E/∂t and ∂P/∂t in the ratio
// 1 : (ε_r − 1). The four boundary conditions, unchanged from statics because
// the time derivatives integrate over a vanishing pillbox or loop: D⊥ jumps
// by σ_f, B⊥ continuous, E∥ continuous, H∥ jumps by K_f × n̂; refraction of
// field lines, tan θ₂/tan θ₁ = ε₂/ε₁; a perfect conductor's surface (E∥ = 0,
// B⊥ = 0 for changing fields). Transfers: a gas void in a high-voltage
// supply's epoxy (field ε_r times larger in the void), an AC polarization
// current.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, PI, DEG, sf, bare, tag } from './_em4.js';

const t = String.raw;

// the worked example: a Kapton film capacitor, 10 cm², 25 μm thick, ε_r = 3.4, voltage rising at 10 kV/s
const EX = { A: 10e-4, d: 25e-6, er: 3.4, dV: 1e4 };
EX.C = (EX.er * EPS0 * EX.A) / EX.d;
EX.I = EX.C * EX.dV;
EX.Ivac = EX.I / EX.er;
EX.Ipol = EX.I - EX.Ivac;

/** A static refraction picture: a field line meeting an interface at θ₁ from the normal (degrees), with ε₂/ε₁ = q. */
function refrPic(th1, q, caption, { show2 = true } = {}) {
  const a1 = th1 * DEG, a2 = Math.atan(q * Math.tan(a1));
  const L = 1.25;
  return {
    type: 'graph',
    params: bare([-2.8, 2.8], [-1.4, 1.4], {
      shade: [{ fn: '0', lower: '-1.4', from: -2.8, to: 2.8, color: 'teal', alpha: 0.18 }],
      curves: [{ fn: '0', domain: [-2.8, 2.8], color: 'ink2', width: 2 }, { param: ['0', 't'], t: [-1.3, 1.3], color: 'ink3', dash: [4, 4], width: 1.2 }],
      arrows: [{ from: [+(-L * Math.sin(a1)).toFixed(4), +(L * Math.cos(a1)).toFixed(4)], to: [0, 0], color: 'warn', width: 2.4 },
        ...(show2 ? [{ from: [0, 0], to: [+(L * Math.sin(a2)).toFixed(4), +(-L * Math.cos(a2)).toFixed(4)], color: 'warn', width: 2.4 }] : [])],
      points: [tag(1.5, 0.75, 'medium 1, ε₁', 'ink2'), tag(1.5, -0.75, 'medium 2, ε₂', 'teal'), tag(-0.35, 0.8, 'θ₁', 'warn', { labelAlign: 'right' }), ...(show2 ? [tag(0.3, -0.8, 'θ₂', 'warn')] : [])],
    }),
    caption,
  };
}

/** A flat gas void inside epoxy insulation between two electrodes, the field normal to it. */
const voidPic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.55, 1.55], {
    shade: [{ fn: '1.1', lower: '-1.1', from: -2.6, to: 2.6, color: 'gold', alpha: 0.2 }, { fn: '0.1', lower: '-0.1', from: -0.7, to: 0.7, color: 'bg', alpha: 1 }, { fn: '1.3', lower: '1.1', from: -2.6, to: 2.6, color: 'ink3', alpha: 0.85 }, { fn: '-1.1', lower: '-1.3', from: -2.6, to: 2.6, color: 'ink3', alpha: 0.85 }],
    curves: [{ fn: '0.1', domain: [-0.7, 0.7], color: 'ink2', width: 1.2 }, { fn: '-0.1', domain: [-0.7, 0.7], color: 'ink2', width: 1.2 }],
    arrows: [-2, -1.2, 1.2, 2].map((x) => ({ from: [x, 0.85], to: [x, -0.85], color: 'warn', width: 2 })),
    points: [tag(0.75, 0.1, 'gas void', 'ink', { labelDx: 8, labelDy: -2 }), tag(-2.5, -0.7, 'epoxy', 'gold'), tag(-2.6, 1.42, 'electrode', 'ink2', { labelDx: 0, labelDy: 0 })],
  }),
  caption,
});

export default lesson({
  id: 'phys4600.M1.5',
  title: 'Maxwell’s equations in matter and boundary conditions',
  minutes: 15, difficulty: 3,
  equation: t`\begin{gathered}\nabla\cdot\vec D = \rho_f, \qquad \nabla\cdot\vec B = 0, \\ \nabla\times\vec E = -\frac{\partial\vec B}{\partial t}, \\ \nabla\times\vec H = \vec J_f + \frac{\partial\vec D}{\partial t}\end{gathered}`,
  intro: t`Inside matter, polarization and magnetization add bound sources: a charge density $\rho_b = -\nabla\cdot\vec P$ and a current density $\vec J_b = \nabla\times\vec M$ ([PHYS 3600 M8.1](#/lesson/phys3600.M8.1)). Time brings one more. When $\vec P$ changes, the bound charges at the ends of every little dipole move, and that is a current: the **polarization current** $\vec J_p = \partial\vec P/\partial t$. It carries exactly the bound charge that piles up, $\nabla\cdot\vec J_p = -\partial\rho_b/\partial t$. Gather all the bound pieces into $\vec D = \varepsilon_0\vec E + \vec P$ and $\vec H = \vec B/\mu_0 - \vec M$, and Maxwell’s equations speak only of **free** charge and current. In a linear medium, $\vec D = \varepsilon\vec E$ and $\vec H = \vec B/\mu$. Across a surface between two materials, the integral forms give four boundary conditions — the same as in statics, because the time derivatives are integrated over a pillbox or a loop that shrinks to nothing.`,
  symbols: [
    { tex: '\\vec D', text: t`the electric displacement $\varepsilon_0\vec E + \vec P$, in $\text{C/m}^2$` },
    { tex: '\\vec H', text: t`the auxiliary field $\vec B/\mu_0 - \vec M$, in A/m` },
    { tex: '\\rho_f,\\ \\vec J_f', text: t`free charge density ($\text{C/m}^3$) and free current density ($\text{A/m}^2$): the charge and current you put there` },
    { tex: '\\partial\\vec D/\\partial t', text: t`the displacement current density in matter, $\varepsilon_0\partial\vec E/\partial t + \partial\vec P/\partial t$, in $\text{A/m}^2$` },
    { tex: '\\vec E,\\ \\vec B', text: 'the electric and magnetic fields, in V/m and T' },
  ],
  why: t`Every wave that meets a window, a radome, a lens or a metal wall is governed by these boundary conditions — they are the whole content of the Fresnel equations and waveguides in M3.`,
  visual: {
    type: 'graph',
    title: 'A field line crossing an interface',
    lead: t`An electric field line meets the boundary between two insulators (no free charge on it). $E_\parallel$ must be the same on both sides, and so must $D_\perp = \varepsilon E_\perp$. So the line bends: $\tan\theta_2/\tan\theta_1 = \varepsilon_2/\varepsilon_1$, away from the normal going into the higher permittivity.`,
    tasks: [
      t`Set $\varepsilon_2/\varepsilon_1 = 1$: no bend. Raise it: the line in medium 2 swings toward the surface, and the field there is weaker.`,
      t`At $\theta_1 = 0$ the line goes straight through — but its strength drops by $\varepsilon_1/\varepsilon_2$, because $D_\perp$, not $E_\perp$, is continuous.`,
      t`Watch $D_2/D_1$ and $E_2/E_1$: their ratio is always $\varepsilon_2/\varepsilon_1$. At $\theta_1 = 0$ it is $D$ that matches across the surface; near $90^\circ$ it is $E$.`,
    ],
    params: {
      x: [-2.8, 2.8], y: [-1.4, 1.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'th', label: t`Angle in medium 1, $\theta_1$`, min: 0, max: 80, step: 1, value: 35, unit: '^\\circ', explain: 'The field line’s angle from the normal, above the surface.' },
        { key: 'q', label: t`Permittivity ratio $\varepsilon_2/\varepsilon_1$`, min: 0.25, max: 6, step: 0.05, value: 3, unit: '', explain: 'Medium 2 (below) relative to medium 1 (above).' },
      ],
      shade: [{ fn: '0', lower: '-1.4', from: -2.8, to: 2.8, color: 'teal', alpha: 0.18 }],
      curves: [{ fn: '0', domain: [-2.8, 2.8], color: 'ink2', width: 2 }, { param: ['0', 't'], t: [-1.3, 1.3], color: 'ink3', dash: [4, 4], width: 1.2 }],
      arrows: [
        { from: ['-1.25*sin(th*pi/180)', '1.25*cos(th*pi/180)'], to: [0, 0], color: 'warn', width: 2.4 },
        { from: [0, 0], to: ['1.25*sin(atan(q*tan(th*pi/180)))', '-1.25*cos(atan(q*tan(th*pi/180)))'], color: 'warn', width: 2.4 },
      ],
      points: [tag(1.5, 0.75, 'medium 1, ε₁', 'ink2'), tag(1.5, -0.75, 'medium 2, ε₂', 'teal')],
      readouts: [
        { label: t`$\theta_2$`, expr: 'atan(q*tan(th*pi/180))*180/pi', unit: '^\\circ', digits: 3 },
        { label: t`$E_2/E_1$`, expr: 'sqrt(sin(th*pi/180)^2 + (cos(th*pi/180)/q)^2)', digits: 3 },
        { label: t`$D_2/D_1$`, expr: 'sqrt((q*sin(th*pi/180))^2 + cos(th*pi/180)^2)', digits: 3 },
      ],
    },
    caption: t`Linear, isotropic insulators with no free surface charge; the arrows show directions, drawn the same length on both sides.`,
  },
  example: {
    prompt: t`A film capacitor has plates of ${EX.A * 1e4} cm² separated by ${EX.d * 1e6} μm of polyimide (Kapton, $\varepsilon_r \approx ${EX.er}$). The voltage across it rises at ${EX.dV / 1e3} kV/s. Find the current in its leads, and split the displacement current in the film into its vacuum part, $\varepsilon_0\partial E/\partial t$, and its polarization part, $\partial P/\partial t$.`,
    visual: { type: 'em-gap', params: { at: 'gap', r: 3, controls: false, readout: false, t: 3 }, caption: t`A charging capacitor: in a dielectric the displacement current includes the bound charges’ own motion. Fringing ignored; not to scale.` },
    steps: [
      { label: 'Lead current', text: t`$C = \dfrac{\varepsilon_r\varepsilon_0A}{d} \approx ${nice(sf(EX.C * 1e9, 3))}$ nF, so $I = C\dfrac{dV}{dt} \approx ${nice(sf(EX.I * 1e6, 3))}$ μA.` },
      { label: 'In the film', text: t`No free charge crosses the film, so $\nabla\times\vec H = \partial\vec D/\partial t$ there: the whole current continues as $\partial D/\partial t$, with $D = \sigma_f$ on the plates and $\partial D/\partial t = I/A$.` },
      { label: 'Split it', text: t`$\vec D = \varepsilon_0\vec E + \vec P$ with $\vec P = (\varepsilon_r - 1)\varepsilon_0\vec E$. So the vacuum part is $1/\varepsilon_r$ of the total, $\approx ${nice(sf(EX.Ivac * 1e6, 3))}$ μA, and the polarization current is $(\varepsilon_r - 1)/\varepsilon_r$ of it, $\approx ${nice(sf(EX.Ipol * 1e6, 3))}$ μA.` },
      { label: 'What moves', text: t`The polarization current is real charge: every molecule’s electrons shift slightly as $E$ grows, and the bound surface charge $\sigma_b = P$ at the film’s faces grows at $\partial P/\partial t$. Only the vacuum part is charge-free.` },
      { label: 'Sense check', text: t`With $\varepsilon_r = 1$ the polarization current vanishes; with a large $\varepsilon_r$ it is nearly all of it. Either way their sum is the lead current, as charge conservation demands.` },
    ],
    answer: t`$I \approx ${nice(sf(EX.I * 1e6, 3))}$ μA: about $${nice(sf(EX.Ivac * 1e6, 3))}$ μA as $\varepsilon_0\partial E/\partial t$ and $${nice(sf(EX.Ipol * 1e6, 3))}$ μA as polarization current $\partial P/\partial t$.`,
  },
  practice: [
    match({
      id: 'bound-pieces', difficulty: 2,
      prompt: 'Match each source to what it is.',
      visual: refrPic(35, 3, t`Bound charge on the surface between two dielectrics is what bends the field line. Schematic.`),
      left: [t`$-\nabla\cdot\vec P$`, t`$\nabla\times\vec M$`, t`$\partial\vec P/\partial t$`, t`$\varepsilon_0\,\partial\vec E/\partial t$`, t`$\vec J_f$`],
      right: ['bound charge density, where polarization piles up', 'bound current density, from circulating magnetization', 'polarization current: bound charges moving as P changes', 'the vacuum displacement current: no charge moves', 'current of free charge in wires and plasmas', 'magnetic charge density'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Two of these involve P, one involves M, one involves only E.', 'Which one exists even in empty space?'],
      teach: 'In matter, three bound sources join the free ones: −∇·P, ∇×M and the polarization current ∂P/∂t.',
      explain: t`$-\nabla\cdot\vec P$ and $\nabla\times\vec M$ are the bound charge and current of statics. $\partial\vec P/\partial t$ is new: changing polarization moves bound charge. $\varepsilon_0\partial\vec E/\partial t$ is Maxwell’s vacuum term, and $\vec J_f$ is what you control. There is no magnetic charge.`,
    }),
    num({
      id: 'pol-fraction', difficulty: 2,
      gen(r) {
        const [mat, er] = r.pick([['PTFE', 2.1], ['glass', 4.7], ['alumina', 9.8], ['water', 80]]), I = r.pick([1, 5, 20]);
        const Ip = I * (1 - 1 / er);
        return {
          prompt: t`A capacitor filled with ${mat} ($\varepsilon_r \approx ${er}$) is charged by a current of ${I} mA. How much of the displacement current in the ${mat} is polarization current, $\partial P/\partial t$?`,
          visual: { type: 'em-gap', params: { at: 'gap', r: 3, controls: false, readout: false, t: 3 }, caption: t`A charging capacitor (drawn empty; here filled with ${mat}). Fringing ignored; not to scale.` },
          answer: Ip, units: 'mA', tol: { rel: 0.01 },
          errors: [
            { value: I / er, feedback: t`That is the vacuum part, $\varepsilon_0\partial E/\partial t$. The polarization part is the rest: $(1 - 1/\varepsilon_r)I$.` },
            { value: I * (er - 1), feedback: t`$P = (\varepsilon_r - 1)\varepsilon_0E$ is $(\varepsilon_r - 1)$ times the **vacuum** part, which is $I/\varepsilon_r$ — not $I$.` },
          ].filter((e) => Math.abs(e.value - Ip) > 0.02 * Ip),
          hints: [t`The total displacement current $\partial D/\partial t$ equals the charging current.`, t`$D = \varepsilon_r\varepsilon_0E$ and $P = (\varepsilon_r - 1)\varepsilon_0E$, so $P/D = (\varepsilon_r - 1)/\varepsilon_r$.`],
          teach: t`In a linear dielectric the polarization current is the fraction $(\varepsilon_r - 1)/\varepsilon_r$ of the displacement current.`,
          explain: t`$\dfrac{\partial P}{\partial t} = \dfrac{\varepsilon_r - 1}{\varepsilon_r}\dfrac{\partial D}{\partial t}$, so $I_p \approx ${nice(sf(Ip, 3))}$ mA of the ${I} mA. ${er > 10 ? 'In a strongly polar material almost all of it is molecules turning.' : 'The rest is the vacuum term.'}`,
        };
      },
    }),
    num({
      id: 'refract', difficulty: 2,
      gen(r) {
        const th1 = r.pick([20, 30, 45, 60]), [m1, e1, m2, e2] = r.pick([['air', 1, 'glass', 4.7], ['oil', 2.2, 'glass', 4.7], ['air', 1, 'PTFE', 2.1], ['glass', 4.7, 'air', 1]]);
        const th2 = Math.atan((e2 / e1) * Math.tan(th1 * DEG)) / DEG;
        return {
          prompt: t`An electric field line in ${m1} ($\varepsilon_r = ${e1}$) meets a flat boundary with ${m2} ($\varepsilon_r = ${e2}$) at ${th1}° from the normal. There is no free charge on the boundary. At what angle from the normal does it leave into the ${m2}?`,
          visual: refrPic(th1, e2 / e1, t`The field line arriving in medium 1 (above); the line in medium 2 is the question. Schematic.`, { show2: false }),
          answer: th2, units: 'deg', tol: { rel: 0.01 },
          errors: [
            { value: Math.atan((e1 / e2) * Math.tan(th1 * DEG)) / DEG, feedback: t`Upside down: $D_\perp$ is continuous, so $E_\perp$ is **smaller** in the higher permittivity and the line tilts away from the normal there.` },
            { value: Math.asin(Math.min(1, Math.sqrt(e1 / e2) * Math.sin(th1 * DEG))) / DEG, feedback: t`That is Snell’s law for a light ray. A static field line obeys $\tan\theta_2/\tan\theta_1 = \varepsilon_2/\varepsilon_1$.` },
          ].filter((e) => Math.abs(e.value - th2) > 0.02 * th2),
          hints: [t`$E_\parallel = E\sin\theta$ is continuous; $D_\perp = \varepsilon E\cos\theta$ is continuous.`, t`Divide: $\dfrac{\tan\theta_2}{\varepsilon_2} = \dfrac{\tan\theta_1}{\varepsilon_1}$.`],
          teach: 'With no free surface charge, E∥ and D⊥ are continuous, so field lines refract as tan θ₂/tan θ₁ = ε₂/ε₁.',
          explain: t`$\tan\theta_2 = \dfrac{${e2}}{${e1}}\tan${th1}^\circ$, so $\theta_2 \approx ${nice(sf(th2, 3))}^\circ$. ${e2 > e1 ? 'Into the higher permittivity the line leans toward the surface.' : 'Into the lower permittivity the line straightens toward the normal.'}`,
        };
      },
    }),
    multi({
      id: 'bcs', difficulty: 2,
      prompt: t`A surface between two materials carries free charge $\sigma_f$ and free current $\vec K_f$, and the fields on both sides change in time. Which of these hold? (Select all that apply.)`,
      visual: refrPic(40, 2.2, t`A field line crossing an interface, bending as it goes. Schematic.`),
      choices: [t`$E_\parallel$ is continuous`, t`$B_\perp$ is continuous`, t`$D_\perp$ jumps by $\sigma_f$`, t`$H_\parallel$ jumps by $K_f$ (perpendicular to $\vec K_f$)`, t`$E_\perp$ is continuous`, t`$B_\parallel$ is continuous`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`$E_\perp$ jumps by the **total** surface charge over $\varepsilon_0$, bound included; only $D_\perp$’s jump is fixed by free charge alone.`,
        5: t`$B_\parallel$ jumps by $\mu_0$ times the total surface current — free and bound.`,
      },
      hints: ['Pillboxes give the perpendicular components from the divergence laws; thin loops give the parallel ones from the curl laws.', t`The $\partial/\partial t$ terms are integrated over the pillbox’s volume or the loop’s area — both shrink to zero.`],
      teach: t`The boundary conditions of statics hold unchanged for changing fields: $D_\perp$ jumps by $\sigma_f$, $H_\parallel$ by $K_f$, and $B_\perp$ and $E_\parallel$ are continuous.`,
      explain: t`Divergences through a thin pillbox: $D_{1\perp} - D_{2\perp} = \sigma_f$ and $B_{1\perp} = B_{2\perp}$. Curls round a thin loop: $\vec E_{1\parallel} = \vec E_{2\parallel}$ (the $-d\Phi_B/dt$ through a vanishing area is zero) and $\vec H_{1\parallel} - \vec H_{2\parallel} = \vec K_f\times\hat n$ (likewise for $d\Phi_D/dt$).`,
    }),
    num({
      id: 'wall-current', difficulty: 2,
      gen(r) {
        const B = r.pick([0.2, 0.5, 1, 2]);
        const K = (B * 1e-3) / MU0;
        return {
          prompt: t`Inside a microwave cavity with walls of (nearly) perfect conductor, the oscillating magnetic field just inside one wall is tangential to it, with amplitude ${B} mT; inside the metal it is zero. What is the amplitude of the surface current density on the wall?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.4, 1.4], {
            shade: [{ fn: '-0.4', lower: '-1.4', from: -3, to: 3, color: 'ink3', alpha: 0.7 }],
            arrows: [{ from: [-2.4, -0.05], to: [-0.6, -0.05], color: 'accent', width: 2.4, label: 'B (tangential)', labelDx: 6, labelDy: -12 }, { from: [-2.4, 0.5], to: [-0.6, 0.5], color: 'accent', width: 1.6 }],
            points: [tag(1.2, -0.9, 'conductor: B = 0', 'ink'), tag(1.2, 0.6, 'cavity', 'ink2'), tag(0.6, -0.22, 'K along the surface', 'warn', { labelDy: 0 })],
          }), caption: t`A cavity wall in cross-section: tangential $\vec B$ just outside the metal, none inside. The surface current flows across the page. Schematic.` },
          answer: K, units: 'A/m', tol: { rel: 0.01 },
          errors: [{ value: (B * 1e-3) / (2 * MU0), feedback: t`The whole jump in $B_\parallel$ — from ${B} mT to zero — is $\mu_0K$. There is no factor of 2 here.` }],
          hints: [t`$B_\parallel$ jumps by $\mu_0K$ across a surface current.`, t`$K = B_\parallel/\mu_0$.`],
          teach: 'At a perfect conductor the tangential B outside ends on a surface current K = B∥/μ₀.',
          explain: t`$K = B/\mu_0 \approx ${nice(sf(K, 3))}$ A/m, flowing perpendicular to $\vec B$ along the wall. In a real copper wall this current fills a skin a few microns deep (M3) and its ohmic loss sets the cavity’s quality factor.`,
        };
      },
    }),
    mcq({
      id: 'pec', difficulty: 3,
      prompt: t`An oscillating field meets the surface of a perfect conductor, inside which $\vec E = 0$ and $\vec B = 0$. Which components of the fields just outside **must** vanish?`,
      visual: { type: 'graph', params: bare([-3, 3], [-1.4, 1.4], {
        shade: [{ fn: '-0.4', lower: '-1.4', from: -3, to: 3, color: 'ink3', alpha: 0.7 }],
        arrows: [{ from: [-1.6, -0.4], to: [-1.6, 0.9], color: 'warn', width: 2.2, label: 'E⊥', labelDx: 6 }, { from: [0.4, -0.25], to: [2.0, -0.25], color: 'accent', width: 2.2, label: 'B∥', labelDx: 6 }],
        points: [tag(-2.9, -0.9, 'perfect conductor', 'ink'), tag(1.6, -0.75, '+ + surface charge, current', 'ink2', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
      }), caption: t`A perfect conductor’s surface: the fields that may survive just outside it. Schematic.` },
      choices: [
        t`$E_\parallel$ and $B_\perp$`,
        t`All of $\vec E$ and $\vec B$`,
        t`$E_\perp$ and $B_\parallel$`,
        t`Only $\vec E$; $\vec B$ is unaffected by a conductor`,
      ],
      answer: 0,
      why: {
        1: t`$E_\perp$ can end on surface charge and $B_\parallel$ on surface current: a conductor carries both.`,
        2: t`Those are the ones that **may** be non-zero, supported by surface charge and surface current.`,
        3: t`A changing $B_\perp$ would drive circulating currents in the surface (Faraday) — in a perfect conductor they cancel it.`,
      },
      hints: [t`Which components are continuous across any surface? They must match the zero inside.`, t`$E_\parallel$ and $B_\perp$ are continuous whatever charges and currents sit on the surface.`],
      teach: 'At a perfect conductor E∥ = 0 and B⊥ = 0; E⊥ ends on surface charge and B∥ on surface current — the wall conditions of every waveguide.',
      explain: t`$E_\parallel$ and $B_\perp$ are continuous across any surface, and they are zero inside, so they vanish just outside too. $E_\perp = \sigma/\varepsilon_0$ and $B_\parallel = \mu_0K$ survive, carried by charge and current on the surface. These are the conditions that fix the modes of a waveguide in M3.5.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-void', difficulty: 3, transfer: true,
      gen(r) {
        const er = r.pick([3.5, 4, 4.5]), V = r.pick([5, 10, 15]), d = r.pick([5, 8, 10]);
        const E = (V * 1e3) / (d * 1e-3), Ev = er * E;
        return {
          prompt: t`A spacecraft’s high-voltage supply is potted in epoxy ($\varepsilon_r \approx ${er}$). Between two electrodes ${d} mm apart at ${V} kV, the field in the epoxy is uniform. A thin, flat gas void lies across the field, its faces perpendicular to it. What is the field inside the void? (Ignore the void’s effect on the field in the epoxy around it.)`,
          visual: voidPic(t`Epoxy between two electrodes, with a thin flat gas void lying across the field (orange). Not to scale.`),
          answer: Ev / 1e6, units: 'MV/m', tol: { rel: 0.01 },
          errors: [
            { value: E / 1e6, feedback: t`At the void’s faces it is $D_\perp$ that is continuous, not $E_\perp$.` },
            { value: E / er / 1e6, feedback: t`Upside down: $\varepsilon_rE_{\text{epoxy}} = E_{\text{void}}$, so the field in the gas is **larger**.` },
          ],
          hints: [t`In the epoxy $E = V/d$.`, t`$D_\perp$ is continuous: $\varepsilon_r\varepsilon_0E_{\text{epoxy}} = \varepsilon_0E_{\text{void}}$.`],
          teach: t`A flat void across the field carries $\varepsilon_r$ times the field of the insulation around it: that is why voids in insulation break down first.`,
          explain: t`$E = V/d = ${nice(sf(E / 1e6, 3))}$ MV/m in the epoxy, and $E_{\text{void}} = \varepsilon_rE \approx ${nice(sf(Ev / 1e6, 3))}$ MV/m in the gas — ${Ev > 3e6 ? 'above' : 'close to'} air’s breakdown of about 3 MV/m at sea-level pressure (and in a partial vacuum, outgassed voids can break down at far less). The void suffers partial discharges that erode the epoxy from inside, a classic failure of space power electronics; vacuum potting is how manufacturers avoid it.`,
        };
      },
    }),
    num({
      id: 'cp-pol-ac', difficulty: 3,
      gen(r) {
        const er = r.pick([2.1, 3.4, 9.8]), E0 = r.pick([1, 5, 10]), f = r.pick([1e3, 1e6, 1e8]);
        const Jp = EPS0 * (er - 1) * 2 * PI * f * E0 * 1e3;
        return {
          prompt: t`An insulator with $\varepsilon_r = ${er}$ sits in an alternating field of amplitude ${E0} kV/m at ${f >= 1e6 ? `${f / 1e6} MHz` : `${f / 1e3} kHz`}. What is the amplitude of its polarization current density?`,
          visual: refrPic(0, 1, t`A field crossing an insulator; its polarization follows the field back and forth. Schematic.`),
          answer: Jp, units: 'A/m^2', tol: { rel: 0.01 },
          errors: [
            { value: EPS0 * er * 2 * PI * f * E0 * 1e3, feedback: t`That is the whole $\partial D/\partial t$. The polarization is $P = (\varepsilon_r - 1)\varepsilon_0E$.` },
            { value: EPS0 * (er - 1) * f * E0 * 1e3, feedback: t`Use $\omega = 2\pi f$.` },
          ],
          hints: [t`$P = (\varepsilon_r - 1)\varepsilon_0E$, so $J_p = \partial P/\partial t = (\varepsilon_r - 1)\varepsilon_0\,\partial E/\partial t$.`, t`For $E_0\sin\omega t$ the amplitude of $\partial E/\partial t$ is $\omega E_0$.`],
          teach: t`An alternating field drives a polarization current $(\varepsilon_r - 1)\varepsilon_0\omega E_0$ in an insulator — real bound charge sloshing.`,
          explain: t`$J_p = (\varepsilon_r - 1)\varepsilon_0\omega E_0 \approx ${tex(Jp, 3)}\ \text{A/m}^2$. It grows with frequency; where the molecules lag behind the field, part of it is in phase with $\vec E$ and dissipates — the dielectric loss that heats food in a microwave oven.`,
        };
      },
    }),
    mcq({
      id: 'cp-why-same', difficulty: 2,
      prompt: t`Why are the boundary conditions for changing fields the same as for static ones, even though Faraday’s and Maxwell’s terms are present?`,
      visual: refrPic(30, 2, t`A field line crossing an interface. Schematic.`),
      choices: [
        t`The time-derivative terms are integrated over the area of a thin loop (or the volume of a thin pillbox), which shrinks to zero while the fields stay finite`,
        'Fields change too slowly near a surface to matter',
        'The boundary conditions are an approximation valid only at low frequency',
        'Surface charges and currents exactly cancel the time-derivative terms',
      ],
      answer: 0,
      why: {
        1: 'Nothing in the argument depends on how fast the fields change; it holds at optical frequencies.',
        2: 'They are exact, as long as the fields themselves are finite at the surface — the Fresnel equations of optics come from them.',
        3: t`Surface charge and current enter the jumps, but the time-derivative terms vanish on their own, being integrals over a vanishing region.`,
      },
      hints: [t`Write $\oint\vec E\cdot d\vec l = -\dfrac{d}{dt}\int\vec B\cdot d\vec a$ for a thin rectangle straddling the surface.`, 'As the rectangle’s thickness goes to zero, what happens to the flux through it?'],
      teach: 'The time-derivative terms drop out of the boundary conditions because they integrate a finite field over a vanishing area or volume.',
      explain: t`For a loop of length $l$ and thickness $\epsilon$ straddling the surface, $\oint\vec E\cdot d\vec l \to (E_{1\parallel} - E_{2\parallel})l$, while $\dfrac{d}{dt}\int\vec B\cdot d\vec a \propto l\epsilon \to 0$. The same happens to $\partial\vec D/\partial t$, and the conditions are exactly those of statics — at any frequency.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §7.3.5–7.3.6', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
  ],
});
