// What curves spacetime: energy, momentum and pressure — Intuition Mode. The
// source of gravity in general relativity is the stress–energy tensor T^μν: a
// symmetric 4 × 4 table of energy density (T⁰⁰), energy flow / momentum density
// (T⁰ⁱ) and momentum flow — pressure and stress (Tⁱʲ). All of it gravitates;
// for a fluid at rest it is diag(ρc², p, p, p) and the focusing source is
// ρ + 3p/c² (S15). Everyday pressures are negligible (p/ρc² ~ 10⁻¹²);
// radiation doubles the source; vacuum energy (p = −ρc²) makes it negative.
// Pressure gradients hold stars up; pressure itself adds to their gravity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { spacetimeSketch } from './_foundations.js';
import { C, sci, round, ball, stressTable } from './_curvature.js';

const t = String.raw;

const S_EARTH = 1361;                         // W/m², total solar irradiance at 1 AU
const U_EARTH = S_EARTH / C;                  // J/m³
const M_H = 1.674e-27;                        // kg, a hydrogen atom
const gamma2 = (v) => 1 / (1 - v * v);

const E = '';                                 // an empty (zero) cell
const GENERIC = stressTable([['T⁰⁰', 'T⁰¹', 'T⁰²', 'T⁰³'], ['T¹⁰', 'T¹¹', 'T¹²', 'T¹³'], ['T²⁰', 'T²¹', 'T²²', 'T²³'], ['T³⁰', 'T³¹', 'T³²', 'T³³']], {
  colors: [['gold', 'teal', 'teal', 'teal'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet']],
  caption: 'The sixteen entries of the stress–energy tensor, rows and columns labelled t, x, y, z. It is symmetric: T¹⁰ = T⁰¹ and so on, leaving 10 independent numbers. Colours group the entries into three kinds.',
});
const FLUID = (caption) => stressTable([['ρc²', E, E, E], [E, 'p', E, E], [E, E, 'p', E], [E, E, E, 'p']], { caption });
const BEAM = (caption) => stressTable([['u', 'u', E, E], ['u', 'u', E, E], [E, E, E, E], [E, E, E, E]], { caption });
const DUST = (caption) => stressTable([['ρc²', E, E, E], [E, E, E, E], [E, E, E, E], [E, E, E, E]], { caption });

// the source ρ(1 + 3w) against w = p/ρc²
const sourceGraph = {
  type: 'graph',
  params: {
    x: [-1.1, 0.45], y: [-2.3, 2.3], xlabel: 'p / ρc²', ylabel: 'source ÷ ρ', xticks: 6,
    curves: [{ fn: '1 + 3x', color: 'accent', width: 2.6 }],
    hlines: [{ y: 0, color: 'ink3' }],
    shade: [{ fn: '1 + 3x', lower: '0', from: -1.1, to: -0.3333, color: 'bad', alpha: 0.18 }, { fn: '1 + 3x', lower: '0', from: -0.3333, to: 0.45, color: 'accent', alpha: 0.12 }],
  },
  caption: 'The source of focusing, ρ + 3p/c², divided by ρ, against the pressure as a fraction of the energy density. Where it is positive (blue) a falling ball of test grains starts to shrink; where it is negative (red), to grow.',
};

// pressure inside a uniform star falls from the centre to zero at the surface; a shell is pushed up by the difference
const starPressure = {
  type: 'graph',
  params: {
    x: [0, 1.15], y: [0, 1.15], xlabel: 'distance from the centre ÷ radius', ylabel: 'pressure ÷ central pressure',
    curves: [{ fn: '1 - x^2', domain: [0, 1], color: 'accent', width: 2.6 }],
    vlines: [{ x: 0.5, color: 'gold' }, { x: 0.6, color: 'gold' }],
    shade: [{ fn: '0.05', from: 0.5, to: 0.6, color: 'gold', alpha: 0.7 }],
    points: [{ x: 0.5, y: 0.75, color: 'accent', label: 'higher p below' }, { x: 0.6, y: 0.64, color: 'accent', label: 'lower p above' }],
    arrows: [{ from: [0.62, 0.025], to: [0.85, 0.025], color: 'gold', label: 'net push outward' }],
  },
  caption: 'Pressure inside a star of uniform density, falling to zero at the surface (a Newtonian model). A thin shell between the gold lines is pushed outward because the pressure below it is higher than above it: the difference, not the pressure itself, holds it up.',
};

// the solar sail: sunlight reflected straight back
const sailPicture = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.1, 1.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['1.2', 't'], t: [-0.9, 0.9], color: 'ink2', width: 4 }],
    arrows: [
      ...[0.75, 0.15, -0.45].map((y) => ({ from: [-1.9, y], to: [1.05, y], color: 'gold' })),
      ...[0.45, -0.15].map((y) => ({ from: [1.05, y], to: [-0.4, y], color: 'teal' })),
      { from: [1.35, -0.75], to: [1.8, -0.75], color: 'good', label: 'force' },
    ],
    points: [{ x: 1.25, y: 0.95, r: 0.01, color: 'ink2', label: 'sail' }],
  },
  caption: 'A sail facing the Sun (not to scale). Gold: sunlight arriving; teal: light reflected. Sunlight carries momentum — $T^{xx}$ is the momentum it delivers per second through each square metre — and a mirror sends it back, so the sail receives twice that.',
};

export default lesson({
  id: 'gr.S16.i',
  title: 'What curves spacetime: energy, momentum and pressure',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`In Newton's theory only mass makes gravity. In Einstein's, the source is the **stress–energy tensor** $T^{\mu\nu}$: a table of numbers, at every event, that records all the energy and momentum there and how they flow.

- $T^{00}$ is the **energy density** — rest energy $\rho c^2$, heat, light, everything.
- $T^{0i}$ is energy **flowing** in direction $i$ (divided by $c$); it equals the momentum density times $c$.
- $T^{ij}$ is the flow of $i$-momentum across a surface facing direction $j$: **pressure** on the diagonal, shear stress off it.

All of it gravitates. For a fluid at rest it reduces to the equation above, and a falling ball of test grains starts to shrink at a rate set by $\rho + 3p/c^2$ (step 15). Because $c^2$ is so large, pressure hardly matters in everyday matter — but it does in neutron stars and the early universe, and the **negative** pressure of dark energy is why the expansion of the universe is speeding up.`,
  equation: t`T^{\mu\nu} = \begin{pmatrix} \rho c^2 & 0 & 0 & 0 \\ 0 & p & 0 & 0 \\ 0 & 0 & p & 0 \\ 0 & 0 & 0 & p \end{pmatrix}`,
  symbols: [
    { tex: 'T^{\\mu\\nu}', text: 'the stress–energy tensor: 16 entries, symmetric, so 10 independent numbers at each event. Every entry is in J/m³, which is the same unit as pascals' },
    { tex: '\\mu,\\ \\nu', text: 'labels running over $0, 1, 2, 3$ — time ($t$) and the three directions of space ($x, y, z$)' },
    { tex: '\\rho c^2', text: 'the energy density of the fluid in its own rest frame, in J/m³ ($\\rho$ in kg/m³, all energy counted as mass)' },
    { tex: 'p', text: 'the pressure, in Pa — the momentum flowing per second across each square metre, the same in every direction' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: '\\rho + 3p/c^2', text: 'the combination that makes a falling ball of test grains start to shrink (step 15): each of the three pressures adds to the mass density' },
  ],
  why: 'This table is the right-hand side of Einstein’s equation: the complete list of what curves spacetime. Light, heat, momentum and pressure all count, not only mass.',
  visual: {
    type: 'gr-dustball',
    title: 'What does pressure do to gravity?',
    lead: t`A ball of test grains inside uniform matter. Keep the energy density fixed and change only the **pressure**; press **Play** each time.`,
    tasks: [
      'Set the pressure to ⅓ of the energy density (a gas of light): the source ρ + 3p/c² doubles, and the ball shrinks faster.',
      'Drag it down to −⅓: the source vanishes, and the ball neither shrinks nor grows.',
      'Drag it to −1, the pressure of vacuum energy: the ball grows. Negative pressure repels — the dark energy that is speeding up the universe’s expansion.',
    ],
    params: { mode: 'matter', rho: 1000, rhoSlider: false, wSlider: true, w: 0, t: 0.6 },
  },
  example: {
    prompt: t`Sunlight at Earth’s distance carries $S = ${S_EARTH}\ \text{W/m}^2$ in a nearly parallel beam. Fill in its stress–energy tensor: its energy density, its energy flow, its momentum flow, and the pressure it exerts on a sail that absorbs it. How much does it “weigh”?`,
    visual: BEAM('Sunlight travelling along x: four equal non-zero entries, u, in the t–x corner of the table; everything else is zero.'),
    steps: [
      { label: 'Energy density', text: t`The beam’s energy moves at $c$, so the energy in each cubic metre is $u = S/c = ${S_EARTH}/(2.998\times10^{8}) = ${sci(U_EARTH)}\ \text{J/m}^3$. That is $T^{00}$.` },
      { label: 'Energy flow', text: t`$T^{0x}$ is the energy flow divided by $c$: $S/c = u$. The momentum density times $c$ is the same number, so $T^{x0} = T^{0x} = u$.` },
      { label: 'Momentum flow', text: t`$T^{xx}$ is the $x$-momentum carried across each square metre per second: $S/c = u = ${sci(U_EARTH)}$ Pa. On a sail that absorbs the light, that is the pressure — about $${sci(U_EARTH * 1e6, 2)}\ \mu\text{Pa}$.` },
      { label: 'The rest', text: t`A parallel beam carries no momentum sideways, so every other entry is zero: four equal numbers in one corner of the table.` },
      { label: 'Its weight', text: t`As a mass density, $u/c^2 = ${sci(U_EARTH / C ** 2)}\ \text{kg/m}^3$ — about ${(Math.round(U_EARTH / C ** 2 / M_H / 1000) * 1000).toLocaleString('en-US')} hydrogen atoms’ worth per cubic metre. Real, but utterly negligible beside the Earth; in the early universe, when light dominated, it was everything.` },
    ],
    answer: t`$T^{00} = T^{0x} = T^{x0} = T^{xx} = ${sci(U_EARTH)}\ \text{J/m}^3$ and every other entry zero; the light presses on an absorbing sail with $${sci(U_EARTH * 1e6, 2)}\ \mu\text{Pa}$ and weighs like $${sci(U_EARTH / C ** 2, 2)}\ \text{kg/m}^3$.`,
  },
  practice: [
    mcq({
      id: 'which-entry', difficulty: 1,
      prompt: 'Which entry of the stress–energy tensor is the energy density?',
      visual: GENERIC,
      choices: [t`$T^{00}$`, t`$T^{11}$`, t`$T^{01}$`, t`$T^{12}$`],
      answer: 0,
      why: {
        1: t`$T^{11}$ is the flow of $x$-momentum in the $x$ direction: the pressure on a surface facing $x$.`,
        2: t`$T^{01}$ is energy flowing in the $x$ direction (divided by $c$) — equivalently, momentum density times $c$.`,
        3: t`$T^{12}$ is a shear stress: $x$-momentum flowing in the $y$ direction.`,
      },
      hints: ['Index 0 means time; 1, 2, 3 mean the directions of space.', 'Energy density is the time–time entry.'],
      teach: 'T⁰⁰ is energy density, T⁰ⁱ energy flow (momentum density), Tⁱʲ momentum flow: pressure on the diagonal, shear off it.',
      explain: t`$T^{00}$, the time–time entry, is the energy per cubic metre. The first row and column (teal) are energy flow and momentum density; the spatial block (violet) is momentum flow — pressures on its diagonal, shear stresses off it.`,
    }),
    num({
      id: 'sunlight', difficulty: 2,
      gen(r) {
        const [where, S] = r.pick([['Mercury’s orbit, where it is 9100 W/m²', 9100], ['Venus’s orbit, where it is 2600 W/m²', 2600], ['Mars’s orbit, where it is 590 W/m²', 590], ['Jupiter’s orbit, where it is 50 W/m²', 50]]);
        const u = S / C;
        return {
          prompt: t`What is the energy density $T^{00}$ of sunlight at ${where}? Give it in J/m³.`,
          answer: u, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [{ value: S / C ** 2, feedback: 'That is u/c², the mass density. The energy density is S/c.' }, { value: S * C, feedback: 'Divide by c: energy moving at c with flux S fills each cubic metre with S/c.' }],
          hints: ['Energy crossing a square metre per second, S, sweeps out a column c metres long.', t`$u = S/c = ${S}/(2.998\times10^{8})$.`],
          teach: 'A beam of light of intensity S has energy density S/c — and the same number is its energy flow and momentum flow, T⁰ˣ and Tˣˣ.',
          explain: t`$u = S/c = ${S}/(2.998\times10^{8}) = ${sci(u)}\ \text{J/m}^3$. It is also the light’s pressure on an absorbing surface, $${sci(u)}$ Pa.`,
          visual: BEAM('A beam of sunlight along x: equal entries u in the t–x corner; all else zero.'),
        };
      },
    }),
    num({
      id: 'pressure-share', difficulty: 2,
      gen(r) {
        const [what, p, rho] = r.pick([
          ['air at sea level ($p = 1.013\\times10^{5}$ Pa, $\\rho = 1.225$ kg/m³)', 1.013e5, 1.225],
          ['hydrogen in a 700-bar fuel-cell tank ($p = 7.0\\times10^{7}$ Pa, $\\rho = 40$ kg/m³)', 7.0e7, 40],
          ['seawater at the bottom of the Mariana Trench ($p = 1.09\\times10^{8}$ Pa, $\\rho = 1070$ kg/m³)', 1.09e8, 1070],
          ['iron at the centre of the Earth ($p = 3.6\\times10^{11}$ Pa, $\\rho = 1.3\\times10^{4}$ kg/m³)', 3.6e11, 1.3e4],
        ]);
        const f = (3 * p) / (rho * C ** 2);
        return {
          prompt: t`By what fraction does pressure raise the source of gravity, $\rho + 3p/c^2$, above $\rho$ alone, for ${what}? That is, find $3p/(\rho c^2)$.`,
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: f / 3, feedback: 'Each of the three directions’ pressure counts: 3p/(ρc²).' }],
          hints: [t`Compute $3p/(\rho c^2)$ with $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'Pressure enters the source of gravity as 3p/c², which is utterly negligible for everyday matter because c² is so large.',
          explain: t`$3p/(\rho c^2) = 3\times${sci(p, 3)}/(${sci(rho, 3)}\times8.988\times10^{16}) = ${sci(f)}$ — pressure’s gravity is negligible here. It matters only where pressure approaches the energy density itself: neutron stars, and the light-filled early universe.`,
          visual: FLUID('A fluid at rest: energy density ρc² in the corner, the same pressure p on the rest of the diagonal.'),
        };
      },
    }),
    mcq({
      id: 'counteract', difficulty: 2,
      prompt: 'A student says: “Inside a star, pressure pushes outward against gravity, so pressure weakens the star’s gravity.” What is right?',
      visual: starPressure,
      choices: [
        'Pressure differences hold the star up; pressure itself adds to the star’s gravity, through ρ + 3p/c²',
        'Pressure weakens the star’s gravity, since it pushes outward',
        'Pressure has no effect on gravity at all',
        'Pressure strengthens gravity only when it is negative',
      ],
      answer: 0,
      why: {
        1: 'An outward push is a force on the matter, from a pressure difference. As a source of gravity, positive pressure adds; it never subtracts.',
        2: 'It enters Einstein’s equation through the stress–energy tensor: ρ + 3p/c².',
        3: 'Negative pressure (vacuum energy) makes the source smaller, even negative. Positive pressure adds to it.',
      },
      hints: ['Separate two roles: a force on the matter, and a source of curvature.', 'What holds a shell of gas up is the higher pressure below it than above it.'],
      teach: 'Pressure gradients support a star, while pressure itself adds to its gravity — so very strong pressure can help a star collapse.',
      explain: 'A layer of a star is held up by the difference between the pressure below it and above it. But as a source of gravity, pressure adds to the energy density: ρ + 3p/c². In ordinary stars that extra is tiny; in a neutron star, the pressure needed to resist collapse strengthens the very gravity it resists — a feedback that caps neutron-star masses at a little over two solar masses.',
    }),
    mcq({
      id: 'grow', difficulty: 2,
      prompt: 'A small ball of test grains is released at rest inside each of four uniform kinds of stuff, all with the same positive energy density. In which does the ball start to **grow**?',
      visual: sourceGraph,
      choices: [
        t`Vacuum energy, with $p = -\rho c^2$`,
        t`A gas of light, with $p = \rho c^2/3$`,
        t`Dust, with $p = 0$`,
        'None of them: gravity always attracts',
      ],
      answer: 0,
      why: {
        1: t`Light’s positive pressure adds: $\rho + 3p/c^2 = 2\rho$, so the ball shrinks twice as fast as in dust.`,
        2: t`Dust has $\rho + 3p/c^2 = \rho > 0$: the ball shrinks.`,
        3: t`Gravity attracts only when $\rho + 3p/c^2 > 0$. Negative pressure can make the source negative.`,
      },
      hints: [t`Compute $\rho + 3p/c^2$ for each.`, 'A negative source means the ball grows.'],
      teach: 'Negative pressure gravitates negatively: vacuum energy, with p = −ρc², has source ρ + 3p/c² = −2ρ and pushes things apart.',
      explain: t`For vacuum energy $\rho + 3p/c^2 = \rho - 3\rho = -2\rho < 0$, so the ball starts to grow: gravitational repulsion. This is how a cosmological constant (dark energy) accelerates the universe’s expansion (step 31).`,
    }),
    num({
      id: 'boost', difficulty: 3,
      gen(r) {
        const v = r.pick([0.6, 0.8, 0.28, 0.96]);
        const g2 = gamma2(v);
        return {
          prompt: t`A cloud of dust has energy density $\rho c^2$ in its own rest frame. It streams past you at $${v}c$. By what factor is the energy density $T^{00}$ that you measure larger than $\rho c^2$?`,
          answer: g2, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(g2), feedback: 'That is one factor of γ, from each grain’s extra energy. The other γ comes from length contraction: the moving cloud is packed more densely.' }],
          hints: [t`Each grain’s energy is $\gamma m c^2$, with $\gamma = 1/\sqrt{1 - v^2/c^2}$.`, 'The moving cloud is length-contracted along its motion, so each cubic metre holds γ times as many grains.', t`Two factors: $T^{00} = \gamma^2\rho c^2$.`],
          teach: 'Energy density is not the same for every observer: moving dust has T⁰⁰ = γ²ρc² — one γ for energy, one for length contraction.',
          explain: t`$\gamma = 1/\sqrt{1 - ${v}^2} = ${round(Math.sqrt(g2), 4)}$, so $T^{00} = \gamma^2\rho c^2 = ${round(g2, 4)}\,\rho c^2$. You also see energy flowing and momentum flowing ($T^{0x}$ and $T^{xx}$ non-zero): the stress–energy tensor’s entries change between observers, while the physics it describes does not.`,
          visual: spacetimeSketch({ range: 4, segments: [-2, -1, 0, 1, 2].map((x0) => { const t1 = Math.min(5, -0.5 + (3.9 - x0) / v); return [-0.5, x0, round(t1, 4), round(x0 + (t1 + 0.5) * v, 4), 'accent']; }), caption: t`Worldlines of dust grains streaming past you at $${v}c$ (time up, $c = 1$). In their own frame the grains are at rest.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail', difficulty: 2, transfer: true,
      gen(r) {
        const [what, A] = r.pick([['LightSail 2’s 32 m² sail', 32], ['a 100 m² sail', 100], ['a 1000 m² sail', 1000]]);
        const F = (2 * S_EARTH * A) / C;
        return {
          prompt: t`Sunlight at 1 AU delivers momentum at $T^{xx} = S/c$, with $S = ${S_EARTH}\ \text{W/m}^2$. A perfectly reflecting sail facing the Sun sends the light straight back. What force does it feel, for ${what}? Give it in newtons.`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: F / 2, feedback: 'That would be for an absorbing sail. Reflection reverses the light’s momentum, doubling the push: 2S/c.' }],
          hints: [t`Pressure on a mirror: $2S/c$, because the momentum is reversed, not just stopped.`, t`$F = (2S/c)\,A = 2\times${S_EARTH}\times${A}/(2.998\times10^{8})$.`],
          teach: 'Light carries momentum: its stress–energy has a momentum-flow entry S/c, which a mirror sail turns into a push of 2S/c per square metre.',
          explain: t`$F = 2SA/c = 2\times${S_EARTH}\times${A}/(2.998\times10^{8}) = ${sci(F)}$ N — tiny, but unceasing, and it needs no propellant.`,
          visual: sailPicture,
        };
      },
    }),
    num({
      id: 'cp-heat', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 5, 10]), dT = r.pick([50, 60, 80]);
        const Q = m * 4186 * dT, dm = Q / C ** 2;
        return {
          prompt: t`${m} kg of water is heated by ${dT} K, absorbing $Q = mc_w\Delta T$ with $c_w = 4186\ \text{J/(kg K)}$. Heat is energy, and $T^{00}$ counts all energy. By how much does the water’s gravitating mass increase? Give it in kg.`,
          answer: dm, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: Q / C, feedback: 'Divide by c², not c: Δm = Q/c².' }],
          hints: [t`$Q = ${m}\times4186\times${dT}$ J.`, t`$\Delta m = Q/c^2$, with $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'All energy gravitates: heating an object raises its energy density, and so its gravity, by Q/c².',
          explain: t`$Q = ${m}\times4186\times${dT} = ${sci(Q)}$ J, so $\Delta m = Q/c^2 = ${sci(dm)}$ kg — far too small to weigh, but exactly what $T^{00}$ demands.`,
          visual: FLUID('The water at rest: its energy density ρc² includes its heat.'),
        };
      },
    }),
    mcq({
      id: 'cp-flow', difficulty: 3,
      prompt: 'For a cloud of dust at rest, only $T^{00}$ is non-zero (shown). A rocket flies past along $x$ at $0.8c$. Which entries does its crew measure as non-zero?',
      visual: DUST('Dust at rest: only the energy density, in the corner.'),
      choices: [
        t`$T^{00}$, $T^{0x} = T^{x0}$ and $T^{xx}$: the crew sees energy and momentum streaming along $x$`,
        t`Only $T^{00}$, but larger`,
        t`$T^{00}$ and the three pressures $T^{xx}$, $T^{yy}$, $T^{zz}$ equally`,
        'All sixteen',
      ],
      answer: 0,
      why: {
        1: t`To the crew the dust is moving, so energy flows along $x$ ($T^{0x}$) and carries $x$-momentum along $x$ ($T^{xx}$).`,
        2: t`Nothing moves along $y$ or $z$, so there is no momentum flowing in those directions: $T^{yy} = T^{zz} = 0$.`,
        3: t`Only the $t$ and $x$ directions are involved; entries with $y$ or $z$ stay zero.`,
      },
      hints: ['In the crew’s frame the dust streams along −x. What flows, and in which direction?', 'Moving dust carries energy and x-momentum along x.'],
      teach: 'The entries of the stress–energy tensor depend on the observer, like the components of a vector: moving dust has energy flow and momentum flow too.',
      explain: t`In the rocket’s frame the dust streams by: $T^{00} = \gamma^2\rho c^2$ (with $\gamma^2 = 2.78$), $T^{0x} = T^{x0} = \gamma^2\rho c^2 v/c$ and $T^{xx} = \gamma^2\rho c^2 v^2/c^2$ (signs depend on the direction). All four describe the same dust, and gravitate together.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §1.9 (energy and momentum)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'OpenStax University Physics Vol. 2, §16.4 (momentum and radiation pressure)', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-4-momentum-and-radiation-pressure' },
  ],
});
