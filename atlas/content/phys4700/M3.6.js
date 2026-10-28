// The finite square well and tunnelling (Griffiths & Schroeter §2.6; Gamow
// 1928). Derived: even states k tan(ka) = κ, odd −k cot(ka) = κ, in
// z = ka, z₀ = a√(2mV₀)/ħ (a = L/2): tan z = √(z₀²/z² − 1) and
// −cot z = √(z₀²/z² − 1); the count ⌈2z₀/π⌉; the odd threshold z₀ = π/2,
// i.e. V₀ = π²ħ²/2mL², the infinite well's E₁; the rectangular barrier's exact
// T. Roots by bisection on the pole-free forms (finiteRoots in _wells.js,
// matched against model/mp-schrodinger.js). Alpha decay: Q from AME2020
// masses (phys3710/_nuclear.js), half-lives NUBASE2020 (Po-210 138.376 d,
// Po-212 0.294 μs). phys2710.MP7.3 met the well, STM and Gamow's model; this
// lesson solves the transcendental equations.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { T0, wellZ0, boundCount, finiteRoots, r6 } from './_wells.js';
import { mass, U as UMEV, HBARC, ALPHA, MAC2 } from '../phys3710/_nuclear.js';

const t = String.raw;
const PI = Math.PI;
const SUB = '₀₁₂₃₄₅₆₇₈₉';

/** The graphical solution for a given z₀ (a number) or a slider key: tan z, −cot z and √(z₀²/z² − 1). */
function graphical(z0, { xmax, ymax = 8, extra = {}, rhs = true } = {}) {
  const X = xmax ?? Math.ceil(typeof z0 === 'number' ? z0 + 0.6 : 10.5);
  const curves = [];
  for (let j = 0; j * PI < X; j++) {
    curves.push({ fn: 'tan(x)', color: 'accent', width: 2, domain: [r6(j * PI), r6(j * PI + PI / 2 - 0.02)] });
    if (j * PI + PI / 2 < X) curves.push({ fn: '-1/tan(x)', color: 'violet', width: 2, dash: [6, 4], domain: [r6(j * PI + PI / 2 + 0.001), r6((j + 1) * PI - 0.02)] });
  }
  const Z = typeof z0 === 'number' ? r6(z0) : z0;
  if (rhs) curves.push({ fn: `sqrt((${Z}/x)^2 - 1)`, color: 'gold', width: 2.6, domain: [0.02, Z], samples: 2000 });
  return {
    x: [0, r6(X)], y: [0, ymax], aspect: 'wide', xlabel: 'z = ka', ylabel: '', axesAt: 'edge', xticks: 8, yticks: 4,
    curves,
    legend: [{ label: 'tan z (even states)', color: 'accent' }, { label: '−cot z (odd states)', color: 'violet', dash: [6, 4] }, ...(rhs ? [{ label: '√(z₀²/z² − 1)', color: 'gold' }] : [])], legendAt: 'tr',
    ...extra,
  };
}

const wellPic = (V0, L, caption, extra = {}) => ({ type: 'mp-schrodinger', params: { mode: 'bound', well: 'finite', V0, L, n: 1, show: 'psi', controls: false, readout: false, panels: ['energy', 'wave'], ...extra }, caption });

/** Exact transmission through a rectangular barrier (E < V₀), electron, eV and nm. */
const barrierT = (E, V0, d) => { const k = Math.sqrt((V0 - E) / T0); return 1 / (1 + (V0 * V0 * Math.sinh(k * d) ** 2) / (4 * E * (V0 - E))); };

/** Gamow's 2G for an alpha particle of the decay parent → daughter (Coulomb barrier from R to b). */
function gamow(parent, daughter) {
  const A = +parent.split('-')[1], Zd = 82;
  const Q = (mass(parent) - mass(daughter) - mass('He-4')) * UMEV;
  const Ea = (Q * (A - 4)) / A;
  const mD = mass(daughter) * UMEV, mu = (MAC2 * mD) / (MAC2 + mD);
  const b = (2 * Zd * ALPHA * HBARC) / Ea, R = 1.2 * (Math.cbrt(A - 4) + Math.cbrt(4)), x = R / b;
  return { Q, Ea, b, R, G2: 2 * (Math.sqrt(2 * mu * Ea) / HBARC) * b * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x))) };
}

const PO210 = gamow('Po-210', 'Pb-206'), PO212 = gamow('Po-212', 'Pb-208');

export default lesson({
  id: 'phys4700.M3.6',
  title: 'The finite square well and tunnelling',
  minutes: 18, difficulty: 3,
  intro: t`A well of depth $V_0$ and width $L = 2a$ lets the wave function leak into the walls, where it decays as $e^{-\kappa|x|}$. Matching $\psi$ and $\psi'$ at the walls gives no formula for the energies — only **transcendental equations**. In the dimensionless $z = ka$, with $k = \sqrt{2mE}/\hbar$ inside (energy above the floor) and the well’s strength $z_0 = a\sqrt{2mV_0}/\hbar$:

$$\text{even: } \tan z = \sqrt{\frac{z_0^2}{z^2} - 1}, \qquad \text{odd: } -\cot z = \sqrt{\frac{z_0^2}{z^2} - 1}$$

Plot both sides and read off the crossings — or let a computer bisect them. Every well has at least one bound state and $\lceil 2z_0/\pi\rceil$ in all. Above the top the states are unbound, and a barrier, the well turned upside down, lets a fraction of particles **tunnel** through.`,
  symbols: [
    { tex: 'z = ka', text: t`the state’s wavenumber inside the well times the half-width; the energy above the floor is $E = \hbar^2z^2/2ma^2$` },
    { tex: 'z_0', text: t`the well’s strength, $a\sqrt{2mV_0}/\hbar$: dimensionless, growing with both depth and width` },
    { tex: 'a = L/2', text: 'the half-width of the well, in m' },
    { tex: 'V_0', text: 'the depth of the well, in eV' },
    { tex: '\\kappa', text: t`the decay constant in the walls, $\sqrt{2m(V_0 - E)}/\hbar$; note $(\kappa a)^2 + z^2 = z_0^2$` },
    { tex: 'm', text: 'the particle’s mass (an effective mass in a semiconductor), in kg' },
  ],
  why: 'Quantum wells in lasers and infrared detectors, nuclei, and every real barrier from a transistor’s oxide to the Coulomb wall around a nucleus are finite: their levels are roots of equations like these.',
  visual: {
    type: 'graph',
    title: 'The graphical solution',
    lead: t`The gold curve is the right-hand side, $\sqrt{z_0^2/z^2 - 1}$; it reaches zero at $z = z_0$. Each crossing with a blue $\tan z$ branch is an even bound state, each crossing with a violet $-\cot z$ branch an odd one. Slide the well’s strength $z_0$.`,
    tasks: [
      'Make z₀ tiny: the gold curve still crosses the first blue branch. A one-dimensional well always binds.',
      'Raise z₀ past π/2 = 1.571: a second (odd) crossing appears. Past π, a third.',
      'At large z₀ the crossings creep toward z = π/2, π, 3π/2 …, the infinite well’s values.',
    ],
    params: {
      ...graphical('z', { xmax: 10.5 }),
      sliders: [{ key: 'z', label: 'Well strength $z_0$', min: 0.3, max: 10, step: 0.05, value: 4, explain: 'z₀ = a√(2mV₀)/ħ: deeper or wider wells have larger z₀.' }],
      readouts: [{ label: 'bound states', expr: 'ceil(2*z/pi)', digits: 2 }, { label: 'for an electron, $V_0$ at $L = 1$ nm (eV)', expr: `${r6(4 * T0)}*z^2`, digits: 3 }],
    },
    caption: t`Exact for a symmetric square well. The count is $\lceil 2z_0/\pi\rceil$; for an electron in a 1 nm well, $V_0 = 4z_0^2\,(\hbar^2/2m_e)/L^2$.`,
  },
  example: {
    prompt: t`An electron is in a well $V_0 = 5$ eV deep and $L = 1$ nm wide. Find $z_0$, the number of bound states, and their energies.`,
    visual: wellPic(5, 1, 'The 5 eV, 1 nm well and its four levels; the ground state’s ψ below. Exact (model/mp-schrodinger.js).'),
    steps: [
      { label: 'Inside and outside', text: t`Inside, $\psi'' = -k^2\psi$: even states $\cos kx$, odd states $\sin kx$ (origin at the centre). Outside, $\psi'' = \kappa^2\psi$, so $\psi \propto e^{-\kappa|x|}$.` },
      { label: 'Match at the wall', text: t`At $x = a$, matching $\psi'/\psi$ for the even state: $-k\tan(ka) = -\kappa$, so $k\tan(ka) = \kappa$. Multiply by $a$ and use $(\kappa a)^2 = z_0^2 - z^2$: $\tan z = \sqrt{z_0^2/z^2 - 1}$. The odd state gives $-\cot z$ instead.` },
      { label: 'The strength', text: t`$z_0 = a\sqrt{2mV_0}/\hbar = \tfrac{L}{2}\sqrt{V_0/(\hbar^2/2m_e)} = 0.5\sqrt{5/${fmt(T0, 4)}} = ${fmt(wellZ0(5, 1), 4)}$.` },
      { label: 'Count', text: t`Each branch of $\tan$ or $-\cot$ is $\pi/2$ wide, and the gold curve crosses every branch that starts below $z_0$: $\lceil 2z_0/\pi\rceil = \lceil ${fmt(2 * wellZ0(5, 1) / PI, 4)}\rceil = ${boundCount(5, 1)}$ bound states.` },
      { label: 'Solve', text: t`Bisection on each branch gives $z = ${finiteRoots(wellZ0(5, 1)).map((q) => fmt(q.z, 4)).join(',\\ ')}$. Then $E = (\hbar^2/2m_e)\,z^2/a^2$: $${finiteRoots(wellZ0(5, 1)).map((q) => fmt(T0 * q.z * q.z / 0.25, 3)).join(',\\ ')}$ eV above the floor.` },
      { label: 'Sense check', text: t`The infinite well of the same width has $${[1, 2, 3, 4].map((n) => fmt(n * n * PI * PI * T0, 3)).join(',\\ ')}$ eV. Each finite-well level is lower — the wave leaks into the walls, so it is effectively in a wider box — and the top one sits just below $V_0 = 5$ eV.` },
    ],
    answer: t`$z_0 = ${fmt(wellZ0(5, 1), 3)}$; four bound states at $${finiteRoots(wellZ0(5, 1)).map((q) => fmt(T0 * q.z * q.z / 0.25, 3)).join(',\\ ')}$ eV above the floor.`,
  },
  practice: [
    num({
      id: 'z0', difficulty: 1,
      gen(r) {
        const V0 = r.pick([0.5, 1, 2, 5, 10]), L = r.pick([0.5, 1, 2]);
        const ans = wellZ0(V0, L);
        return {
          prompt: t`An electron is in a square well $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide. What is the well’s strength $z_0 = a\sqrt{2mV_0}/\hbar$? ($a = L/2$; $\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm².)`,
          visual: wellPic(V0, L, 'The well (levels drawn but not labelled).', { hide: ['energy', 'count', 'labels'] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`Use the half-width $a = L/2$, not $L$.` }, { value: ans / Math.SQRT2, feedback: t`$z_0 = a\sqrt{V_0/(\hbar^2/2m)}$: the factor 2 in $2mV_0$ is already inside $\hbar^2/2m$.` }],
          hints: [t`$a\sqrt{2mV_0}/\hbar = a\sqrt{V_0/(\hbar^2/2m)}$.`, t`$z_0 = ${L / 2}\sqrt{${V0}/${fmt(T0, 4)}}$.`],
          teach: t`The well’s strength $z_0 = a\sqrt{2mV_0}/\hbar$ is the one number that decides how many states it holds.`,
          explain: t`$z_0 = ${L / 2}\times\sqrt{${fmt(V0 / T0, 4)}} = ${fmt(ans, 4)}$, so the well holds $\lceil 2z_0/\pi\rceil = ${boundCount(V0, L)}$ bound state${boundCount(V0, L) > 1 ? 's' : ''}.`,
        };
      },
    }),
    mcq({
      id: 'always-one', difficulty: 1,
      prompt: t`A very shallow, narrow well has $z_0 = 0.2$. How many bound states does it have?`,
      visual: { type: 'graph', params: graphical(0.2, { xmax: 2, ymax: 4 }), caption: 'The graphical solution for z₀ = 0.2.' },
      choices: ['Exactly one, an even state', 'None: the well is too weak to hold anything', 'One odd state', 'Two, one of each parity'],
      answer: 0,
      why: {
        1: t`The gold curve starts at $+\infty$ as $z \to 0$ and $\tan z$ starts at 0, so they always cross before $z_0$. In one dimension every attractive well binds.`,
        2: t`Odd states need $z_0 > \pi/2$: the first $-\cot z$ branch starts at $z = \pi/2$, beyond this $z_0$.`,
        3: t`$\lceil 2(0.2)/\pi\rceil = 1$.`,
      },
      hints: ['Where does the gold curve start, and where does tan z start?'],
      teach: 'Every one-dimensional attractive well has at least one bound state, an even one; odd states need z₀ > π/2.',
      explain: t`The ground state always exists: for $z_0 = 0.2$ it sits at $z \approx z_0$, just below the top, and its tails reach far beyond the well (since $\kappa a = \sqrt{z_0^2 - z^2}$ is small).`,
    }),
    {
      type: 'point', id: 'drag-root', difficulty: 3,
      gen(r) {
        const z0 = r.pick([2, 3, 4, 5, 6]);
        const z1 = finiteRoots(z0)[0].z;
        return {
          prompt: t`For a well with $z_0 = ${z0}$, drag the point to the crossing that gives the **ground state**, then check.`,
          visual: { type: 'graph', params: { ...graphical(z0, { ymax: 6 }), drag: [{ key: 'p', x: r6(z0 * 0.8), y: 4, snap: 0.01 }] }, caption: 'The graphical solution. The point is yours to move.' },
          answer: { x: r6(z1), y: r6(Math.tan(z1)) }, tol: { x: 0.06, y: 0.35 },
          instruction: 'Drag the point to the ground-state crossing.',
          hints: ['The ground state is even and has the lowest energy: the smallest z.', 'Look on the first blue branch, between z = 0 and π/2.'],
          teach: 'The ground state is the lowest crossing: the gold curve meeting the first tan z branch.',
          explain: t`It sits at $z = ${fmt(z1, 4)}$, a little below $\pi/2 = 1.571$ (the infinite-well value). Its energy is $E = (\hbar^2/2ma^2)\,z^2$, and its tails decay with $\kappa a = \sqrt{z_0^2 - z^2} = ${fmt(Math.sqrt(z0 * z0 - z1 * z1), 4)}$.`,
        };
      },
    },
    num({
      id: 'tail', difficulty: 2,
      gen(r) {
        const [V0, L] = r.pick([[5, 1], [2, 1], [10, 0.5], [1, 2], [0.5, 1]]);
        const z0 = wellZ0(V0, L), z1 = finiteRoots(z0)[0].z, a = L / 2;
        const ans = a / Math.sqrt(z0 * z0 - z1 * z1);
        return {
          prompt: t`For an electron in a well $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide ($z_0 = ${fmt(z0, 4)}$), the graphical solution puts the ground state at $z = ${fmt(z1, 4)}$. How far does its wave function reach into the walls — what is $1/\kappa$, in nm?`,
          visual: wellPic(V0, L, 'The ground state, with its tails in the classically forbidden walls (shaded).', { hide: ['energy'] }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: L / Math.sqrt(z0 * z0 - z1 * z1), feedback: t`$\kappa a = \sqrt{z_0^2 - z^2}$ uses the half-width: $1/\kappa = a/\sqrt{z_0^2 - z^2}$ with $a = ${a}$ nm.` }, { value: a / z1, feedback: t`That is $1/k$, the inside wavenumber. Outside, $\kappa a = \sqrt{z_0^2 - z^2}$.` }],
          hints: [t`$(ka)^2 + (\kappa a)^2 = z_0^2$, so $\kappa a = \sqrt{z_0^2 - z^2}$.`, t`$1/\kappa = a/\sqrt{z_0^2 - z^2}$ with $a = ${a}$ nm.`],
          teach: t`Inside and outside are tied together: $z^2 + (\kappa a)^2 = z_0^2$, so a state near the top of the well has long tails.`,
          explain: t`$\kappa a = \sqrt{${fmt(z0 * z0, 4)} - ${fmt(z1 * z1, 4)}} = ${fmt(Math.sqrt(z0 * z0 - z1 * z1), 4)}$, so $1/\kappa = ${fmt(ans, 3)}$ nm. The probability of finding the electron outside the well is not small for the higher levels, whose $\kappa$ is smaller still.`,
        };
      },
    }),
    num({
      id: 'barrier-T', difficulty: 2,
      gen(r) {
        const [E, V0, d] = r.pick([[1, 2, 0.5], [1, 4, 0.3], [2, 5, 0.4], [0.5, 1, 1], [3, 4, 0.5]]);
        const ans = barrierT(E, V0, d), k = Math.sqrt((V0 - E) / T0);
        return {
          prompt: t`An electron of energy $${E}$ eV meets a rectangular barrier $${V0}$ eV high and $${d}$ nm thick. The exact transmission probability is $T = \Big[1 + \dfrac{V_0^2\sinh^2(\kappa d)}{4E(V_0 - E)}\Big]^{-1}$ with $\kappa = \sqrt{2m(V_0 - E)}/\hbar$. Find $T$.`,
          visual: { type: 'mp-schrodinger', params: { mode: 'scatter', barrier: 'rect', E, Vb: V0, d, show: 'prob', controls: false, readout: false, panels: ['energy', 'wave'], hide: ['T'] }, caption: 'The barrier and |ψ|²: ripples where incident and reflected waves interfere, a flat transmitted wave beyond. Exact.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: Math.exp(-2 * k * d), feedback: t`$e^{-2\kappa d}$ is the thick-barrier exponential alone; the exact formula also has the prefactor and the $\sinh^2$.` },
            { value: 16 * (E / V0) * (1 - E / V0) * Math.exp(-2 * k * d), feedback: t`That is the thick-barrier approximation. Here $\kappa d = ${fmt(k * d, 3)}$ is not large enough: use the exact $\sinh^2$ form.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\kappa = \sqrt{(V_0 - E)/(\hbar^2/2m_e)} = \sqrt{${V0 - E}/${fmt(T0, 4)}} = ${fmt(k, 4)}\ \text{nm}^{-1}$.`, t`$\sinh^2(\kappa d) = \sinh^2(${fmt(k * d, 4)}) = ${fmt(Math.sinh(k * d) ** 2, 4)}$.`],
          teach: t`Through a barrier, $T$ falls roughly as $e^{-2\kappa d}$: exponentially in the thickness and in the square root of the height above $E$.`,
          explain: t`$T = 1/\big(1 + \tfrac{${V0 * V0}\times${fmt(Math.sinh(k * d) ** 2, 4)}}{4\times${E}\times${V0 - E}}\big) = ${tex(ans, 3)}$. Classically it would be exactly 0.`,
        };
      },
    }),
    mcq({
      id: 'deep-limit', difficulty: 2,
      prompt: t`A finite well is made deeper and deeper at fixed width. What happens to its lowest levels, measured from the floor?`,
      visual: wellPic(30, 1, 'A deep (30 eV) well, with the infinite well of the same width dashed for comparison.', { compare: true, hide: ['energy'] }),
      choices: [
        t`They rise toward the infinite-well energies $n^2\pi^2\hbar^2/2mL^2$, from below`,
        'They sink toward the floor, because a deeper well binds harder',
        'They stay fixed; only new levels are added near the top',
        t`They approach the infinite-well energies from above`,
      ],
      answer: 0,
      why: {
        1: t`Measured from the floor, a deeper well confines more tightly: $\kappa$ grows, the tails shrink, and the effective width falls toward $L$. (Measured from the top, they do sink.)`,
        2: t`The roots $z_n$ move as $z_0$ grows, toward $n\pi/2$; the levels shift.`,
        3: 'Leaking into the walls always makes the effective box wider than L, so the energies stay below the infinite-well values.',
      },
      hints: [t`As $z_0 \to \infty$, where do the crossings go?`, t`The infinite well has $z = ka = n\pi/2$.`],
      teach: 'Finite-well levels lie below the infinite-well ones of the same width and approach them as the walls get higher.',
      explain: t`As $z_0 \to \infty$ the gold curve rises everywhere, so each crossing moves up its branch toward the pole at $z = n\pi/2$: $E_n = \tfrac{\hbar^2}{2m}\tfrac{(n\pi/2)^2}{a^2} = \tfrac{n^2\pi^2\hbar^2}{2mL^2}$.`,
    }),
    code({
      id: 'roots-code', difficulty: 3,
      prompt: t`Solve the finite well without SciPy. The pole-free forms $f_{\text{even}}(z) = z\sin z - \sqrt{z_0^2 - z^2}\cos z$ and $f_{\text{odd}}(z) = z\cos z + \sqrt{z_0^2 - z^2}\sin z$ vanish at the even and odd states. Write \`bisect(f, a, b)\`, which halves $[a, b]$ 60 times keeping the sign change, and \`levels(V0, L)\`, which samples both functions on 4000 points of $(0, z_0]$, bisects every sign change, and returns the energies above the floor, in eV, sorted. $\hbar^2/2m_e$ is \`T0\`.`,
      starter: t`import numpy as np

T0 = 0.0380998211   # hbar^2/2m_e in eV nm^2

def f_even(z, z0):
    return z * np.sin(z) - np.sqrt(z0**2 - z**2) * np.cos(z)

def f_odd(z, z0):
    return z * np.cos(z) + np.sqrt(z0**2 - z**2) * np.sin(z)

def bisect(f, a, b):
    pass

def levels(V0, L):
    pass

print(levels(5, 1))
`,
      answer: t`import numpy as np

T0 = 0.0380998211   # hbar^2/2m_e in eV nm^2

def f_even(z, z0):
    return z * np.sin(z) - np.sqrt(z0**2 - z**2) * np.cos(z)

def f_odd(z, z0):
    return z * np.cos(z) + np.sqrt(z0**2 - z**2) * np.sin(z)

def bisect(f, a, b):
    fa = f(a)
    for _ in range(60):
        m = 0.5 * (a + b)
        fm = f(m)
        if (fm > 0) == (fa > 0):
            a, fa = m, fm
        else:
            b = m
    return 0.5 * (a + b)

def levels(V0, L):
    a = L / 2
    z0 = a * np.sqrt(V0 / T0)
    z = np.linspace(1e-9, z0, 4000)
    roots = []
    for f in (f_even, f_odd):
        g = lambda s: f(s, z0)
        v = g(z)
        for i in range(len(z) - 1):
            if v[i] * v[i + 1] < 0:
                roots.append(bisect(g, z[i], z[i + 1]))
    return np.sort(T0 * np.array(roots)**2 / a**2)

print(levels(5, 1))`,
      tests: [
        { name: 'bisect finds √2 from x² − 2 on [1, 2]', code: 'abs(bisect(lambda x: x**2 - 2, 1, 2) - 2**0.5) < 1e-12' },
        { name: 'the 5 eV, 1 nm well has four levels', code: 'len(levels(5, 1)) == 4' },
        { name: t`its ground state is at $0.2718$ eV`, code: 'abs(levels(5, 1)[0] - 0.271800) < 2e-4' },
        { name: t`its top level is at $4.059$ eV, just under $V_0$`, code: 'abs(levels(5, 1)[-1] - 4.05934) < 2e-4' },
        { name: t`the count is $\lceil 2z_0/\pi\rceil$ for a 20 eV, 2 nm well (15)`, code: 'len(levels(20, 2)) == 15' },
        { name: 'a 0.1 eV, 0.5 nm well still holds one level', code: 'len(levels(0.1, 0.5)) == 1' },
      ],
      hints: ['In bisect, keep whichever half still has a sign change: compare the sign of f at the midpoint with f(a).', '`v[i] * v[i + 1] < 0` flags a sign change between neighbouring samples; bisect that little interval.'],
      teach: 'Transcendental eigenvalue conditions are solved by bracketing each root — from a graph or a fine scan — and bisecting.',
      explain: t`Bisection is slow but cannot fail once a sign change is bracketed; the pole-free forms keep $\tan$’s infinities from posing as sign changes. The 5 eV well gives $0.272, 1.077, 2.379, 4.059$ eV, matching the worked example.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const [V0, L] = r.pick([[2, 2], [10, 1], [3, 3], [20, 0.8], [1, 4]]);
        const ans = boundCount(V0, L);
        return {
          prompt: t`How many bound states does an electron have in a well $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide? ($\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm².)`,
          visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'finite', V0, L, n: 1, show: 'psi', controls: false, readout: false, panels: ['energy'], levels: false, hide: ['energy', 'count', 'labels'] }, caption: 'The well, drawn to scale. Its levels are hidden.' },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(wellZ0(V0, L) / PI), feedback: t`Each branch is $\pi/2$ wide, alternating even and odd: the count is $\lceil 2z_0/\pi\rceil$, not $\lceil z_0/\pi\rceil$.` }].filter((e) => e.value !== ans),
          hints: [t`$z_0 = \tfrac L2\sqrt{V_0/(\hbar^2/2m)}$.`, t`Count $= \lceil 2z_0/\pi\rceil$.`],
          teach: t`A well of strength $z_0$ holds $\lceil 2z_0/\pi\rceil$ bound states.`,
          explain: t`$z_0 = ${fmt(wellZ0(V0, L), 4)}$, so $2z_0/\pi = ${fmt(2 * wellZ0(V0, L) / PI, 4)}$ and there are ${ans} bound states.`,
        };
      },
    }),
    num({
      id: 'cp-threshold', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2, 5]);
        const ans = PI * PI * T0 / (L * L);
        return {
          prompt: t`How deep must a well $L = ${L}$ nm wide be, in eV, before an electron has a second (odd) bound state?`,
          visual: { type: 'graph', params: graphical(PI / 2, { xmax: 3.4, ymax: 5 }), caption: 'The graphical solution exactly at the threshold.' },
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: ans / 4, feedback: t`Use $a = L/2$: $z_0 = a\sqrt{2mV_0}/\hbar = \pi/2$ gives $V_0 = \pi^2\hbar^2/2mL^2$.` }, { value: 4 * ans, feedback: t`The threshold is $z_0 = \pi/2$, where the first $-\cot$ branch begins, not $z_0 = \pi$.` }],
          hints: [t`The first odd branch, $-\cot z$, starts at $z = \pi/2$; the gold curve reaches it once $z_0 > \pi/2$.`, t`$\tfrac L2\sqrt{V_0/(\hbar^2/2m)} = \tfrac\pi2$ gives $V_0 = \pi^2(\hbar^2/2m)/L^2$.`],
          teach: t`The second state appears at $z_0 = \pi/2$: when $V_0$ equals the infinite well’s ground-state energy for the same width.`,
          explain: t`$V_0 = \pi^2\times${fmt(T0, 4)}/${L}^2 = ${fmt(ans, 4)}$ eV — exactly $E_1$ of an infinite well of width $L$, a neat coincidence of the geometry.`,
        };
      },
    }),
    num({
      id: 'cp-alpha', difficulty: 3, transfer: true,
      prompt: t`Polonium-210 (it heated the Soviet Lunokhod rovers through the lunar night) emits alpha particles of ${fmt(PO210.Ea, 4)} MeV and has a half-life of 138 days; polonium-212 emits ${fmt(PO212.Ea, 4)} MeV alphas with a half-life of 0.29 μs. In Gamow’s tunnelling model $t_{1/2} \propto e^{2G}$, and for the Coulomb barrier of lead the two exponents are $2G = ${fmt(PO210.G2, 4)}$ and $2G = ${fmt(PO212.G2, 4)}$. By how many powers of ten does the model predict their half-lives differ? (Ignore the small difference in how often each alpha strikes the barrier.)`,
      visual: { type: 'graph', params: { x: [0, 60], y: [0, 30], aspect: 'wide', xlabel: 'distance from the nucleus’ centre (fm)', ylabel: 'energy (MeV)', xticks: 6, yticks: 3, axesAt: 'edge', curves: [{ fn: `${r6(2 * 82 * ALPHA * HBARC)}/x`, color: 'ink2', width: 2.2, domain: [r6(PO210.R), 60] }, { fn: String(r6(PO210.Ea)), color: 'accent', width: 2, domain: [0, r6(PO210.b)], label: 'Po-210 alpha', labelAt: 30, labelDy: -10 }, { fn: String(r6(PO212.Ea)), color: 'gold', width: 2, domain: [0, r6(PO212.b)], label: 'Po-212 alpha', labelAt: 14, labelDy: -10 }], vlines: [{ x: r6(PO210.R), color: 'ink3', label: 'nuclear surface' }] }, caption: 'The Coulomb barrier of lead outside the nuclear surface (R ≈ 9 fm, a rough estimate). Each alpha must tunnel from R to where the curve falls below its energy; the more energetic one faces a thinner, lower barrier.' },
      answer: (PO210.G2 - PO212.G2) / Math.LN10, tol: { rel: 0.01 },
      errors: [{ value: PO210.G2 - PO212.G2, feedback: t`That is the natural-log difference. Divide by $\ln 10$ for powers of ten.` }, { value: (PO210.G2 - PO212.G2) / (2 * Math.LN10), feedback: t`$t_{1/2} \propto e^{2G}$: use the difference of the $2G$ values as given, not half of it.` }],
      hints: [t`$t_{210}/t_{212} = e^{2G_{210} - 2G_{212}}$.`, t`Powers of ten: $(2G_{210} - 2G_{212})/\ln10$.`],
      teach: 'Tunnelling probabilities are exponential in the barrier, so a modest change in alpha energy changes a half-life by many orders of magnitude.',
      explain: t`$(${fmt(PO210.G2, 4)} - ${fmt(PO212.G2, 4)})/\ln 10 = ${fmt((PO210.G2 - PO212.G2) / Math.LN10, 3)}$: a factor of about $10^{${fmt((PO210.G2 - PO212.G2) / Math.LN10, 3)}}$. The measured ratio, 138 days to 0.29 μs, is $10^{13.6}$. A one-line model and a factor of 1.7 in energy land within an order of magnitude across thirteen — Gamow’s 1928 triumph and the origin of the Geiger–Nuttall law. More in [alpha decay](#/lesson/phys3710.N2.2).`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.6 and Problem 2.33', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Gamow, “Zur Quantentheorie des Atomkernes”, Z. Physik 51, 204 (1928)', url: 'https://doi.org/10.1007/BF01343196' },
    { label: 'AME2020 atomic masses (Wang et al., Chinese Physics C 45, 030003, 2021)', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
  ],
});
