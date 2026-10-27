// Tμν for dust, fluids and fields — Derivation Mode. Dust as the flow of its
// particles' four-momentum, T^μν = ρu^μu^ν; the perfect fluid,
// (ρ + p/c²)u^μu^ν + p g^μν, checked in its rest frame; lowered and mixed
// components and the trace −ρc² + 3p (worked example). Pressure as moving
// dust, w = v²/3c² (Explore); fields: the Maxwell stress (tension along
// magnetic field lines, pressure across), a magnetar's field as mass, a
// uniform scalar field's ρc² = ½φ̇² + V and p = ½φ̇² − V. Checkpoint: the
// magnetopause (transfer: the solar wind's ρv² against B²/2μ₀), when a scalar
// field repels, and the gravitating source of a magnetic field (2u). Avoids
// gr.S16.i's and gr.EQ.7's items. Verified with SymPy (scratch v16.py).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, sci, stressTable } from './_curvature.js';

const t = String.raw;
const MU0 = 4e-7 * Math.PI;                                       // T m/A
const M_P = 1.673e-27;                                            // kg, proton
const LOG3 = Math.log10(3);

// dust streaming along x at speed v: its non-zero entries
const movingDust = stressTable([['γ²ρc²', 'γ²ρcv', '', ''], ['γ²ρcv', 'γ²ρv²', '', ''], ['', '', '', ''], ['', '', '', '']], {
  colors: [['gold', 'accent', '', ''], ['accent', 'violet', '', ''], ['', '', '', ''], ['', '', '', '']],
  caption: t`Dust streaming along $x$ at speed $v$: energy density (gold), energy flow and momentum density (blue), and the flow of $x$-momentum (violet). At rest only the corner survives, $\rho c^2$.`,
});
const restFluid = stressTable([['ρc²', '', '', ''], ['', 'p', '', ''], ['', '', 'p', ''], ['', '', '', 'p']], {
  caption: t`A perfect fluid at rest, $T^{\mu\nu}$ with both indices up: energy density in the corner, the same pressure along each space direction, nothing else.`,
});

// w = p/ρc² against particle speed, both on log scales: a straight line of slope 2
const REFS = [[-5.78, 'air', {}], [-2.68, 'Sun’s centre', {}], [-0.22, 'white dwarf', { labelDx: -12, labelDy: 6, labelAlign: 'right' }]];
const refPoints = [
  ...REFS.map(([x, label, o]) => ({ x, y: +(2 * x - LOG3).toFixed(3), r: 3.5, color: 'ink3', label, ...o })),
  { x: 0, y: +(-LOG3).toFixed(3), r: 4.5, color: 'gold', label: 'light: ⅓', labelDx: -10, labelDy: -14, labelAlign: 'right' },
];
const wGraph = (extra = {}) => ({
  type: 'graph',
  params: {
    x: [-6.3, 0.4], y: [-13.2, 0.8], axesAt: 'edge', xlabel: 'log₁₀(v/c)', ylabel: 'log₁₀(p/ρc²)',
    curves: [{ fn: `2*x - ${LOG3.toFixed(5)}`, domain: [-6.3, 0], color: 'accent' }],
    points: refPoints,
    ...extra,
  },
});

// a uniform magnetic field along x, and a box drawn in it
const fieldLines = [-2, -1.2, -0.4, 0.4, 1.2, 2].map((y) => ({ param: ['t', `${y}`], t: [-3.4, 3.4], color: 'accent', width: 1.6 }));
const box = [
  { param: ['-1 + 2*t', '-0.8'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1 + 2*t', '0.8'], t: [0, 1], color: 'ink', width: 2 },
  { param: ['-1', '-0.8 + 1.6*t'], t: [0, 1], color: 'ink', width: 2 }, { param: ['1', '-0.8 + 1.6*t'], t: [0, 1], color: 'ink', width: 2 },
];
const fieldBox = (forces, caption) => ({
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-2.4, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [...fieldLines, ...box],
    arrows: [
      ...[-2, 2].map((y) => ({ from: [2.4, y], to: [3.2, y], color: 'accent' })),
      ...(forces ? [
        { from: [1, 0], to: [1.9, 0], color: 'gold' }, { from: [-1, 0], to: [-1.9, 0], color: 'gold' },
        { from: [0, 1.7], to: [0, 0.85], color: 'violet' }, { from: [0, -1.7], to: [0, -0.85], color: 'violet' },
      ] : []),
    ],
    points: [
      { x: 2.75, y: 2.3, r: 0.01, color: 'accent', label: 'B' },
      ...(forces ? [{ x: 1.95, y: 0, r: 0.01, color: 'gold', label: 'tension', labelDx: 6, labelDy: 4 }, { x: 0.15, y: 1.45, r: 0.01, color: 'violet', label: 'pressure' }] : []),
    ],
  },
  caption,
});

// field lines of a magnetized star (a dipole: r = L sin²θ)
const dipole = {
  type: 'graph',
  params: {
    x: [-4.6, 4.6], y: [-3, 3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [1.4, 2.4, 3.8, 5.6].flatMap((L) => [1, -1].map((s) => ({ param: [`${s * L}*sin(t)^3`, `${L}*sin(t)^2*cos(t)`], t: [0, 3.1416], color: 'accent', width: 1.4 }))),
    points: [{ x: 0, y: 0, r: 12, color: 'gold' }],
  },
  caption: t`Field lines of a magnetized neutron star (a dipole, not to scale). The field's energy density $B^2/2\mu_0$ is energy like any other, and it gravitates.`,
};

// a uniform scalar field rolling down its potential
const rolling = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [0, 3], xlabel: 'field value φ', ylabel: 'potential energy density V',
    curves: [{ fn: '0.6 + 0.12*x^2', domain: [-4, 4], color: 'accent' }],
    points: [{ x: 2.6, y: 1.411, r: 7, color: 'gold' }],
    arrows: [{ from: [2.35, 1.6], to: [1.45, 1.13], color: 'gold' }],
  },
  caption: t`A field that is the same everywhere, rolling down its potential: its value $\phi$ changes in time at the rate $\dot\phi$. Its energy is kinetic, $\tfrac12\dot\phi^2$, plus potential, $V$.`,
};

// the solar wind held off by the Earth's field
const magnetopause = {
  type: 'graph',
  params: {
    x: [-24, 14], y: [-14, 14], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-10 + t^2/20', 't'], t: [-14, 14], color: 'violet', width: 2.2 },
      ...[3, 5, 8].flatMap((L) => [1, -1].map((s) => ({ param: [`${s * L}*sin(t)^3`, `${L}*sin(t)^2*cos(t)`], t: [0, 3.1416], color: 'accent', width: 1.2 }))),
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2 },
    ],
    arrows: [-8, -4, 0, 4, 8].map((y) => ({ from: [-23, y], to: [-16, y], color: 'gold' })),
    points: [
      { x: -23, y: 10.5, r: 0.01, color: 'gold', label: 'solar wind' },
      { x: -9.2, y: 12.4, r: 0.01, color: 'violet', label: 'magnetopause' },
      { x: 1.2, y: -2, r: 0.01, color: 'teal', label: 'Earth' },
    ],
  },
  caption: 'The solar wind (gold) streams out from the Sun, off to the left, and is held off by the Earth’s magnetic field (blue). The boundary, the magnetopause, sits where the wind’s momentum flow and the field’s pressure balance — about ten Earth radii out on the side facing the Sun. Field shapes are sketched, not computed.',
};

// dust energy density against speed (c = 1, ρ = 1)
const dustT00 = {
  type: 'graph',
  params: {
    x: [0, 0.95], y: [0, 8], xlabel: 'speed v (c = 1)', ylabel: 'T⁰⁰ ÷ ρ',
    curves: [{ fn: '1/(1 - x^2)', domain: [0, 0.95], color: 'gold' }],
  },
  caption: t`Dust streaming past at speed $v$: its energy density $T^{00} = \gamma^2\rho$ (gold) — one $\gamma$ because each particle's energy grows, one because moving dust is packed closer by length contraction.`,
};

export default lesson({
  id: 'gr.S16.d',
  title: 'Tμν for dust, fluids and fields',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Einstein's equations need a source with two indices, like the curvature it sets: the **stress–energy tensor** $T^{\mu\nu}$, the flow of energy and momentum through spacetime. Its first index says which component of four-momentum flows, its second through which surface: $T^{00}$ is energy density, $T^{0i}$ energy flow, $T^{ij}$ the flow of momentum — pressure and stress.

Here it is built from the bottom up: for **dust** (particles all moving together), for a **perfect fluid** (dust with pressure), and for **fields**, electromagnetic and scalar, whose stresses can be tensions and even negative pressures.`,
  equation: t`T^{\mu\nu}_{\text{dust}} = \rho\,u^\mu u^\nu, \qquad T^{\mu\nu}_{\text{fluid}} = \left(\rho + \frac{p}{c^2}\right)u^\mu u^\nu + p\,g^{\mu\nu}`,
  symbols: [
    { tex: 'T^{\\mu\\nu}', text: t`the stress–energy tensor, in J/m³ (the same as Pa): the flow of the $\mu$ component of four-momentum through a surface of constant $x^\nu$. Symmetric, so 10 independent numbers` },
    { tex: '\\mu,\\ \\nu', text: t`indices running over $0$–$3$, with $x^0 = ct$ and $x^1, x^2, x^3 = x, y, z$; Latin $i, j$ run over space only` },
    { tex: '\\rho', text: t`the mass density in the matter's own rest frame, in kg/m³; $\rho c^2$ is its energy density there` },
    { tex: 'u^\\mu', text: t`the matter's four-velocity, $\gamma(c, \mathbf v)$ with $\gamma = 1/\sqrt{1 - v^2/c^2}$; its length is fixed, $g_{\mu\nu}u^\mu u^\nu = -c^2$` },
    { tex: 'p', text: t`the pressure in the rest frame, in Pa — the same in every direction for a perfect fluid` },
    { tex: 'g^{\\mu\\nu}', text: t`the inverse metric, $\operatorname{diag}(-1, 1, 1, 1)$ in flat spacetime: the term $p\,g^{\mu\nu}$ puts the pressure into every frame` },
  ],
  why: t`This is the right-hand side of Einstein's equation, $8\pi G\,T_{\mu\nu}/c^4$ (step 18). All of it gravitates — energy, energy flow and stress — which is why a field's tension or a scalar field's negative pressure can change what gravity does.`,
  visual: {
    type: 'graph',
    title: 'Pressure is moving dust',
    lead: t`A gas is many streams of dust flying in all directions. Each stream carries momentum across a surface, $T^{ij} = n\gamma m\,v^iv^j$, and averaged over directions $\langle v_x^2\rangle = v^2/3$: a pressure $p = \tfrac13 n\gamma m v^2$, beside an energy density $n\gamma mc^2$. So $p/\rho c^2 = v^2/3c^2$. Both axes are logarithmic.`,
    tasks: [
      'Start at air (500 m/s): its pressure is a millionth of a millionth of its energy density — utterly negligible as a source of gravity.',
      'Slide to the Sun’s centre, about 6 × 10⁵ m/s: still a part in a million.',
      'Slide toward the speed of light: γ grows without limit, yet p/ρc² only creeps up to ⅓ — the value for light.',
    ],
    params: wGraph({
      sliders: [{ key: 'lv', label: 'Particle speed, $\\log_{10}(v/c)$', min: -6, max: -0.01, step: 0.01, value: -5.78, explain: '−5.8: air molecules. −2.7: protons at the Sun’s centre. −0.2: electrons in a white dwarf. Light itself would sit at 0.' }],
      readouts: [
        { label: '$v$', expr: '10^lv*299792458', digits: 3, unit: '\\text{m/s}' },
        { label: '$\\gamma$', expr: '1/sqrt(1 - 10^(2*lv))', digits: 5 },
        { label: '$p/\\rho c^2 = v^2/3c^2$', expr: '10^(2*lv)/3', digits: 3 },
      ],
      points: [
        ...refPoints,
        { x: 'lv', y: `2*lv - ${LOG3.toFixed(5)}`, r: 6, color: 'accent' },
      ],
    }).params,
    caption: t`Each point is a gas whose particles all move at the speed on the horizontal axis. Real gases have a spread of speeds; the slope and the limit of ⅓ stay the same.`,
  },
  example: {
    prompt: t`Build the stress–energy tensor of dust — particles of mass $m$, $n$ of them per unit volume in their own rest frame, all moving together — and then of a perfect fluid, which adds a pressure $p$ the same in every direction. Find $T^{\mu\nu}$, its lowered form $T_{\mu\nu}$, and its trace.`,
    visual: movingDust,
    steps: [
      { label: 'One particle', text: t`A particle's energy and momentum form its four-momentum $p^\mu = m u^\mu$, with $u^\mu = \gamma(c, \mathbf v)$. The stress–energy tensor counts how much of it flows: $T^{\mu\nu}$ is the flow of $p^\mu$ through a surface of constant $x^\nu$, per unit area and time (for $\nu = 0$, its density, times $c$).` },
      { label: 'Dust', text: t`The particles' flux is $N^\nu = n u^\nu$: in a frame where they move, $N^0/c = \gamma n$ per unit volume (length contraction packs them closer) and $N^i = \gamma n v^i$ per unit area per second. Each carries $m u^\mu$, so $T^{\mu\nu} = mn\,u^\mu u^\nu = \rho\,u^\mu u^\nu$, with $\rho = mn$.` },
      { label: 'At rest and moving', text: t`At rest, $u^\mu = (c, 0, 0, 0)$, so only $T^{00} = \rho c^2$ survives. Moving at $v$ along $x$: $T^{00} = \gamma^2\rho c^2$, $T^{0x} = T^{x0} = \gamma^2\rho cv$ and $T^{xx} = \gamma^2\rho v^2$ — energy density, energy flow, and the flow of $x$-momentum: the push of a wind.` },
      { label: 'A perfect fluid', text: t`At rest a perfect fluid has $T^{\mu\nu} = \operatorname{diag}(\rho c^2, p, p, p)$. The tensor that reduces to this is $T^{\mu\nu} = (\rho + p/c^2)u^\mu u^\nu + p\,g^{\mu\nu}$: at rest its $00$ entry is $(\rho + p/c^2)c^2 + p\,g^{00} = \rho c^2$ and its space entries are $p\,\delta^{ij}$. Built from tensors, it holds in every frame.` },
      { label: 'Lowering', text: t`$T_{\mu\nu} = g_{\mu\alpha}g_{\nu\beta}T^{\alpha\beta} = (\rho + p/c^2)u_\mu u_\nu + p\,g_{\mu\nu}$, with $u_\mu = (-\gamma c, \gamma\mathbf v)$. At rest: $T_{00} = \rho c^2$ (two factors of $g_{00} = -1$), $T_{ij} = p\,\delta_{ij}$, and the mixed component $T^0{}_0 = -\rho c^2$ (one factor).` },
      { label: 'The trace', text: t`$T = T^\mu{}_\mu = -\rho c^2 + 3p$; for dust, $-\rho c^2$. Sense check: for light, with $p = \rho c^2/3$, the trace vanishes — as it must for any electromagnetic field, whose stress–energy tensor is traceless.` },
    ],
    answer: t`Dust: $T^{\mu\nu} = \rho\,u^\mu u^\nu$. Perfect fluid: $T^{\mu\nu} = (\rho + p/c^2)u^\mu u^\nu + p\,g^{\mu\nu}$ and $T_{\mu\nu} = (\rho + p/c^2)u_\mu u_\nu + p\,g_{\mu\nu}$, both $\operatorname{diag}(\rho c^2, p, p, p)$ at rest; trace $T = -\rho c^2 + 3p$.`,
  },
  practice: [
    mcq({
      id: 'lower', difficulty: 2,
      prompt: t`A perfect fluid at rest has $T^{\mu\nu} = \operatorname{diag}(\rho c^2, p, p, p)$, in flat spacetime with $g_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$. Lowering one index means $T^\mu{}_\nu = T^{\mu\alpha}g_{\alpha\nu}$; lowering both, $T_{\mu\nu} = g_{\mu\alpha}g_{\nu\beta}T^{\alpha\beta}$. What are $T_{00}$ and $T^0{}_0$?`,
      choices: [
        t`$T_{00} = \rho c^2$ and $T^0{}_0 = -\rho c^2$`,
        t`$T_{00} = -\rho c^2$ and $T^0{}_0 = \rho c^2$`,
        t`Both $\rho c^2$: lowering an index never changes a component in flat spacetime`,
        t`Both $-\rho c^2$: any lowered time index carries the sign of $g_{00}$`,
      ],
      answer: 0,
      why: {
        1: t`The other way round: lowering twice multiplies by $g_{00}$ twice, $(-1)^2 = +1$; lowering once, by $-1$.`,
        2: t`In flat spacetime the space entries are unchanged, but a time index is not: $g_{00} = -1$.`,
        3: t`$T_{00}$ has two lowered time indices, and $(-1)(-1) = +1$.`,
      },
      hints: [t`$T^0{}_0 = T^{0\alpha}g_{\alpha0}$, and only $\alpha = 0$ contributes.`],
      teach: t`Each lowered time index brings a factor $g_{00} = -1$: $T_{00} = +\rho c^2$ but $T^0{}_0 = -\rho c^2$, while space entries are unchanged in flat spacetime.`,
      explain: t`$T^0{}_0 = T^{00}g_{00} = -\rho c^2$ and $T_{00} = g_{00}g_{00}T^{00} = +\rho c^2$; the space entries stay $p$. The mixed form is the one whose diagonal adds up to the trace, $T^\mu{}_\mu = -\rho c^2 + 3p$.`,
      visual: restFluid,
    }),
    num({
      id: 'streams', difficulty: 2,
      gen(r) {
        const [what, vText, b, note] = r.pick([
          ['protons at the Sun’s centre', t`$6.2\times10^5$ m/s`, 6.2e5 / C, 'The electrons add as much pressure again but almost no energy: at the Sun’s centre pressure adds about three parts in a million to the source of gravity. Newton’s ρ alone is an excellent approximation.'],
          ['neutrons in a neutron star’s core', t`$0.3c$`, 0.3, 'In a neutron star the pressure is a few per cent of the energy density or more: enough that pressure’s own gravity matters, and general relativity rather than Newton sets the largest mass such a star can have.'],
          ['electrons in a white dwarf', t`$0.6c$`, 0.6, 'That is the electron gas alone. The star’s mass is carried by nuclei that hardly move, so for the star as a whole p/ρc² is thousands of times smaller.'],
        ]);
        const w = (b * b) / 3;
        return {
          prompt: t`A gas is many streams of dust flying in all directions. Each stream carries momentum across a surface, $T^{ij} = n\gamma m\,v^iv^j$ ($n$ particles per unit volume, each of mass $m$ and velocity $v^i$), and the energy density is $T^{00} = n\gamma mc^2$. Averaged over directions, $\langle v_x^2\rangle = v^2/3$. Treating ${what} as all moving at ${vText}, what is $w = p/\rho c^2 = T^{xx}/T^{00}$?`,
          answer: w, tol: { rel: 0.01 },
          errors: [
            { value: b * b, feedback: t`Only a third of $v^2$ lies along any one direction: $\langle v_x^2\rangle = v^2/3$.` },
            { value: b / 3, feedback: t`$T^{xx}$ has two factors of velocity: $w = v^2/3c^2$.` },
          ],
          hints: [t`$T^{xx}/T^{00} = \langle v_x^2\rangle/c^2$: the $n\gamma m$ cancels.`, t`$w = v^2/(3c^2)$, with $v/c = ${b < 0.01 ? sci(b, 3) : b}$.`],
          teach: 'Pressure is momentum carried by moving particles: for particles of speed v in all directions, p/ρc² = v²/3c² — negligible unless they move near the speed of light, and ⅓ for light itself.',
          explain: t`$w = (v/c)^2/3 = ${sci(w, 3)}$. ${note}`,
          visual: { ...wGraph(), caption: 'Pressure against energy density for a gas whose particles all move at one speed, on log scales: a straight line rising to ⅓ for light. The points mark air, the Sun’s centre and white-dwarf electrons.' },
        };
      },
    }),
    num({
      id: 'scalar-w', difficulty: 2,
      gen(r) {
        const [K, V] = r.pick([[1, 9], [3, 1], [1, 49], [1, 4]]);
        const w = (K - V) / (K + V);
        return {
          prompt: t`A scalar field that is the same everywhere but changes in time — the kind thought to have driven inflation — has energy density $\rho c^2 = \tfrac12\dot\phi^2 + V$ and pressure $p = \tfrac12\dot\phi^2 - V$: its kinetic energy density $\tfrac12\dot\phi^2$ counts as energy and as pressure, its potential energy density $V$ as energy and as negative pressure. If $\tfrac12\dot\phi^2 = ${K}\,u_0$ and $V = ${V}\,u_0$, for some unit $u_0$, what is $w = p/\rho c^2$?`,
          answer: w, tol: { rel: 0.01, abs: 1e-6 },
          errors: [
            { value: (V - K) / (K + V), feedback: t`Sign: the kinetic term adds to the pressure, the potential subtracts: $p = \tfrac12\dot\phi^2 - V$.` },
            ...(Math.abs(w + 1) > 0.02 ? [{ value: -1, feedback: t`$w = -1$ exactly only when the field stands still, $\dot\phi = 0$.` }] : []),
          ],
          hints: [t`$w = \dfrac{\tfrac12\dot\phi^2 - V}{\tfrac12\dot\phi^2 + V}$.`],
          teach: t`A uniform scalar field has $\rho c^2 = \tfrac12\dot\phi^2 + V$ and $p = \tfrac12\dot\phi^2 - V$: when its potential dominates, $w$ approaches $-1$.`,
          explain: t`$w = (${K} - ${V})/(${K} + ${V}) = ${fmt(w, 3)}$. ${w < -1 / 3 ? t`Below $-\tfrac13$ the source $\rho c^2 + 3p$ is negative: this field makes space expand faster and faster — inflation, or dark energy.` : t`The kinetic energy wins and the pressure is positive: this field gravitates like ordinary matter, only more strongly per unit energy.`}`,
          visual: rolling,
        };
      },
    }),
    mcq({
      id: 'b-tension', difficulty: 3,
      prompt: t`An electromagnetic field carries momentum too: $T^{ij} = -\left[\epsilon_0\left(E^iE^j - \tfrac12\delta^{ij}E^2\right) + \dfrac{1}{\mu_0}\left(B^iB^j - \tfrac12\delta^{ij}B^2\right)\right]$, the Maxwell stress with the sign that makes it a flow of momentum ($\delta^{ij}$ is 1 when $i = j$, else 0). For a pure magnetic field of strength $B$ along $x$, what are $T^{xx}$ and $T^{yy}$?`,
      choices: [
        t`$T^{xx} = -B^2/2\mu_0$, a tension along the field lines, and $T^{yy} = +B^2/2\mu_0$, a pressure across them`,
        t`$T^{xx} = T^{yy} = +B^2/2\mu_0$: the field pushes equally in every direction, like a gas`,
        t`$T^{xx} = +B^2/2\mu_0$ and $T^{yy} = 0$: a field pushes only along its own lines`,
        t`$T^{xx} = -B^2/\mu_0$ and $T^{yy} = 0$: only the $B^iB^j$ term counts`,
      ],
      answer: 0,
      why: {
        1: t`The $B^iB^j$ term acts only along $x$: $T^{xx} = -\tfrac{1}{\mu_0}(B^2 - \tfrac12B^2)$ is negative, while $T^{yy} = -\tfrac{1}{\mu_0}(0 - \tfrac12B^2)$ is positive. A field is not a gas.`,
        2: t`Along the lines the sign is negative — a pull, not a push — and across them the $\delta^{ij}$ term gives a pressure.`,
        3: t`The $-\tfrac12\delta^{ij}B^2$ term enters every diagonal entry: it halves $T^{xx}$ and makes $T^{yy}$ non-zero.`,
      },
      hints: [t`For $\mathbf B = (B, 0, 0)$: $B^xB^x = B^2$ and $B^yB^y = 0$; there is no electric field.`, t`$T^{xx} = -\tfrac{1}{\mu_0}\left(B^2 - \tfrac12B^2\right)$ and $T^{yy} = -\tfrac{1}{\mu_0}\left(0 - \tfrac12B^2\right)$.`],
      teach: 'Magnetic field lines behave like stretched rubber bands that push their neighbours apart: tension B²/2μ₀ along them, pressure B²/2μ₀ across.',
      explain: t`$T^{xx} = -\dfrac{B^2}{2\mu_0}$ and $T^{yy} = T^{zz} = +\dfrac{B^2}{2\mu_0}$, the same size as the energy density $T^{00} = B^2/2\mu_0$. The tension is why a magnetic field resists being bent, the pressure what holds the solar wind off the Earth. And the trace, $-T^{00} + T^{xx} + T^{yy} + T^{zz}$, is zero, as for light.`,
      visual: fieldBox(false, t`A uniform magnetic field along $x$ (blue lines) and a box drawn in it. What does the field outside the box do to its end faces, and to its side faces?`),
    }),
    num({
      id: 'magnetar', difficulty: 2,
      gen(r) {
        const [B, Btex, cmp] = r.pick([[1e10, t`10^{10}`, 'over four hundred thousand times the density of water'], [1e11, t`10^{11}`, 'about four million times the density of lead']]);
        const rhoB = (B * B) / (2 * MU0 * C * C);
        return {
          prompt: t`Magnetars, the neutron stars with the strongest magnetic fields known, reach about $B = ${Btex}$ T. The field's energy density is $T^{00} = B^2/2\mu_0$, and all energy gravitates. What mass density, $T^{00}/c^2$, does the field have? ($\mu_0 = 4\pi\times10^{-7}$ T m/A, $c = 2.998\times10^8$ m/s.)`,
          answer: rhoB, units: 'kg/m^3', tol: { rel: 0.005 },
          errors: [
            { value: 2 * rhoB, feedback: t`The energy density is $B^2/2\mu_0$: don't drop the 2.` },
            { value: rhoB * C * C, feedback: 'That is the energy density in J/m³. Divide by c² for a mass density.' },
          ],
          hints: [t`$B^2/2\mu_0$ first, in J/m³; then divide by $c^2$.`],
          teach: t`A field's energy density counts in $T^{00}$ like any other: $B^2/2\mu_0$ is a mass density $B^2/2\mu_0c^2$.`,
          explain: t`$\dfrac{B^2}{2\mu_0c^2} = ${sci(rhoB, 3)}$ kg/m³ — ${cmp}. A field's energy is as real a source of gravity as matter. An MRI scanner's 3 T, by contrast, amounts to $4\times10^{-11}$ kg/m³.`,
          visual: dipole,
        };
      },
    }),
    expr({
      id: 'dust-flow', difficulty: 2,
      prompt: t`Dust of rest density $\rho = 1$ streams along $x$ at speed $v$, with $c = 1$: $u^\mu = \gamma(1, v, 0, 0)$ and $\gamma = 1/\sqrt{1 - v^2}$. What is its energy flow $T^{0x} = \rho\,u^0u^x$, as a function of $v$?`,
      answer: 'v/(1 - v^2)', answerTeX: t`\dfrac{v}{1 - v^2}`, lhs: t`T^{0x}`,
      vars: { v: [0.05, 0.9] },
      errors: [
        { answer: 'v/sqrt(1 - v^2)', feedback: t`Each factor of $u$ brings its own $\gamma$: $u^0u^x = \gamma\cdot\gamma v = \gamma^2v$.` },
        { answer: 'v', feedback: t`That is the slow-motion limit. At high speed both factors of $\gamma$ matter.` },
        { answer: '1/(1 - v^2)', feedback: t`That is $T^{00} = \gamma^2$, the energy density. The flow has one more factor, $v$.` },
      ],
      hints: [t`$u^0 = \gamma$ and $u^x = \gamma v$.`, t`$\gamma^2 = 1/(1 - v^2)$.`],
      teach: t`For dust, $T^{\mu\nu} = \rho u^\mu u^\nu$: every entry carries $\gamma^2$, and the energy flow $T^{0x} = \gamma^2\rho v$ is the energy density times the velocity.`,
      explain: t`$T^{0x} = \rho\gamma^2 v = \dfrac{v}{1 - v^2}$: the energy density $\gamma^2$ carried along at speed $v$. Read the other way, $T^{x0} = T^{0x}$ is the density of $x$-momentum — the same number, because energy flow and momentum density are one entry of a symmetric tensor.`,
      visual: dustT00,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-magnetopause', difficulty: 3, transfer: true,
      gen(r) {
        const [n, vk] = r.pick([[6, 450], [5, 400], [10, 600]]);
        const P = n * 1e6 * M_P * (vk * 1e3) ** 2, B = Math.sqrt(2 * MU0 * P), BnT = B * 1e9;
        const rE = Math.cbrt((2 * 31000) / BnT);
        return {
          prompt: t`The solar wind is dust to a good approximation: protons, ${n} per cm³ (each $1.673\times10^{-27}$ kg), streaming at ${vk} km/s, so $\gamma \approx 1$ and its flow of momentum is $T^{xx} = \rho v^2$. The Earth's magnetic field holds the wind off where the field's pressure across its lines, $B^2/2\mu_0$, matches $T^{xx}$. What field strength does that take, in nanotesla? ($\mu_0 = 4\pi\times10^{-7}$ T m/A.)`,
          answer: BnT, units: 'nT', tol: { rel: 0.01 },
          errors: [
            { value: BnT / Math.SQRT2, feedback: t`The field's pressure is $B^2/2\mu_0$: $B = \sqrt{2\mu_0\rho v^2}$.` },
            { value: BnT / 1e3, feedback: t`Use SI units throughout: $n$ in m⁻³ and $v$ in m/s.` },
          ],
          hints: [t`$\rho = n m_p$ with $n$ in m⁻³: ${n} cm⁻³ $= ${n}\times10^6$ m⁻³.`, t`$B = \sqrt{2\mu_0\rho v^2}$.`],
          teach: t`A stream of dust pushes with its momentum flow $T^{xx} = \rho v^2$; a magnetic field pushes back with $T^{yy} = B^2/2\mu_0$ across its lines.`,
          explain: t`$\rho v^2 = ${fmt(P * 1e9, 3)}$ nPa, so $B = \sqrt{2\mu_0\rho v^2} = ${fmt(BnT, 3)}$ nT. The Earth's field is about 31,000 nT at the equator and falls as $1/r^3$; squeezed by the wind, it is roughly doubled at the boundary, which puts the balance near ${fmt(rE, 2)} Earth radii — where spacecraft find the magnetopause.`,
          visual: magnetopause,
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 2,
      prompt: t`A scalar field the same everywhere has $\rho c^2 = \tfrac12\dot\phi^2 + V$ and $p = \tfrac12\dot\phi^2 - V$. A small ball of test grains in it starts to grow — gravity repels — when the source $\rho c^2 + 3p$ is negative (step 15). When is that?`,
      choices: [
        t`When $V > \dot\phi^2$: the potential exceeds twice the kinetic energy density`,
        t`Whenever $V > \tfrac12\dot\phi^2$, so that the pressure is negative`,
        t`Never: the energy density is positive, so its gravity attracts`,
        t`Whenever $\dot\phi \neq 0$: a changing field pushes outward`,
      ],
      answer: 0,
      why: {
        1: t`Negative pressure is not enough: it must beat the energy density threefold, $p < -\rho c^2/3$. With $V$ just above $\tfrac12\dot\phi^2$, the source is still positive.`,
        2: t`Pressure is part of the source, and a negative pressure can outweigh a positive energy density: $\rho c^2 + 3p$ can be negative.`,
        3: t`The kinetic term adds to the source: $\tfrac12\dot\phi^2$ counts once in $\rho c^2$ and three more times through $3p$.`,
      },
      hints: [t`$\rho c^2 + 3p = \tfrac12\dot\phi^2 + V + 3\left(\tfrac12\dot\phi^2 - V\right)$.`],
      teach: t`For a uniform scalar field the source is $\rho c^2 + 3p = 2\dot\phi^2 - 2V$: gravity repels when the potential exceeds $\dot\phi^2$.`,
      explain: t`$\rho c^2 + 3p = 2\dot\phi^2 - 2V$, negative exactly when $V > \dot\phi^2$, which is $w < -\tfrac13$. A field rolling slowly down a high potential does this: that is how inflation is thought to have blown up the early universe.`,
      visual: rolling,
    }),
    mcq({
      id: 'cp-field-source', difficulty: 3,
      prompt: t`A uniform magnetic field along $x$ has energy density $T^{00} = u = B^2/2\mu_0$, a tension $T^{xx} = -u$ along its lines and pressures $T^{yy} = T^{zz} = +u$ across them. What is its source of gravity, $T^{00} + T^{xx} + T^{yy} + T^{zz}$ (the $\rho c^2 + 3p$ of step 15, with the three pressures added separately)?`,
      choices: [t`$2u$`, t`$4u$`, t`$u$`, t`$0$`],
      answer: 0,
      why: {
        1: t`Along the lines the stress is a tension, $-u$, not a pressure: $u - u + u + u = 2u$.`,
        2: t`Stresses gravitate as well as energy: the three of them add $-u + u + u = +u$ to the energy density's $u$.`,
        3: t`The tension cancels only one of the two pressures, not the energy density.`,
      },
      hints: [t`Add the four diagonal entries, keeping the sign of the tension.`, t`$u + (-u) + u + u$.`],
      teach: t`Every component of $T^{\mu\nu}$ gravitates: a magnetic field's tension and pressures add up to a source of $2u$, just like light.`,
      explain: t`$u - u + u + u = 2u$ — twice what its energy alone would give, exactly as for a gas of light ($\rho c^2 + 3p = 2\rho c^2$). Both have a traceless stress–energy tensor, $-T^{00} + T^{xx} + T^{yy} + T^{zz} = 0$, so the stresses always add up to $T^{00}$.`,
      visual: fieldBox(true, t`On a box drawn in the field, the field outside pulls each end face outward — tension along the lines (gold) — and pushes each side face inward — pressure across them (violet).`),
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §1.9 (energy and momentum: dust, perfect fluids, the electromagnetic field)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity, ch. 4 (perfect fluids in special relativity)', url: 'https://www.cambridge.org/highereducation/books/a-first-course-in-general-relativity/' },
    { label: 'Baumann, Cosmology lecture notes: inflation and the scalar field’s ρ and p', url: 'https://arxiv.org/abs/0907.5424' },
  ],
});
