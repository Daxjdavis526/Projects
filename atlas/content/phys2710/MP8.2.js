// Quantum numbers and orbitals — n, l, mₗ and what each one sets; the
// spectroscopic letters; the radial probability P(r) = r²|Rₙₗ|² with its
// most probable radius and ⟨r⟩ = [3n² − l(l+1)]a₀/2; radial (n − l − 1) and
// angular (l) nodes; the real orbitals chemists draw (px, dxy) as mixtures
// of +m and −m. Worked example: hydrogen's 1s — peak at a₀, mean 1.5a₀,
// 32% inside a₀. SciPy's sph_harm_y: normalisation and nodal cones.
// Transfer: Rydberg atoms as radio-field sensors. Every number is computed
// here or in model/mp-orbitals.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { A0 } from './_constants.js';
import { label, r6 } from './_schrodinger.js';
import * as O from '../../src/viz/model/mp-orbitals.js';

const t = String.raw;
const A0NM = A0 * 1e9;
const orb = (params, caption) => ({ type: 'mp-orbitals', params: { controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });
const LET = ['s', 'p', 'd', 'f'];

/** P(r) of the 1s state, 4r²e^(−2r) (r in a₀), shaded from 0 to k. */
const p1s = (k, caption) => ({
  type: 'graph',
  params: {
    x: [0, 6], y: [0, 0.65], aspect: 'wide', axesAt: 'edge', xlabel: 'r (Bohr radii a₀)', ylabel: 'P(r) (per a₀)',
    curves: [{ fn: '4*x^2*exp(-2*x)', color: 'accent', width: 2.4 }],
    shade: [{ fn: '4*x^2*exp(-2*x)', from: 0, to: 6, color: 'accent', alpha: 0.12 }, ...(k ? [{ fn: '4*x^2*exp(-2*x)', from: 0, to: k, color: 'gold', alpha: 0.45 }] : [])],
  },
  caption: caption ?? 'The radial probability density of hydrogen’s ground state, P(r) = (4r²/a₀³)e^(−2r/a₀), in units where a₀ = 1.',
});

export default lesson({
  id: 'phys2710.MP8.2',
  title: 'Quantum numbers and orbitals',
  minutes: 15, difficulty: 3,
  intro: t`Each state of hydrogen’s electron is labelled by three integers: the **principal** number $n = 1, 2, 3, \ldots$, which sets the energy $E_n = -13.6\ \text{eV}/n^2$ and the size; the **orbital** number $l = 0, \ldots, n - 1$, which sets the angular momentum and the shape (named s, p, d, f for $l = 0, 1, 2, 3$); and the **magnetic** number $m_l = -l, \ldots, l$, which sets the angular momentum’s tilt. An **orbital** is not a path: it is a wave function, a cloud of probability. How far out the electron is likely to be is given by the radial probability density

$$P(r) = r^2\,|R_{nl}(r)|^2, \qquad P_{1s}(r) = \frac{4r^2}{a_0^3}\,e^{-2r/a_0}$$

where the factor $r^2$ counts the volume of a thin shell at radius $r$. Each state has $n - l - 1$ spherical (radial) nodes and $l$ angular nodes.`,
  symbols: [
    { tex: 'n', text: 'the principal quantum number 1, 2, 3 … — sets the energy and, roughly, the size (⟨r⟩ grows as n²)' },
    { tex: 'l', text: 'the orbital quantum number 0 … n − 1 (s, p, d, f …) — sets the angular momentum and the shape' },
    { tex: 'm_l', text: 'the magnetic quantum number −l … l — sets the z-component of the angular momentum' },
    { tex: 'R_{nl}(r)', text: t`the radial wave function, in $\text{m}^{-3/2}$` },
    { tex: 'P(r)', text: t`the probability per unit radius of finding the electron at distance $r$ from the nucleus, in $\text{m}^{-1}$; $\int_0^\infty P\,dr = 1$` },
    { tex: 'a_0', text: 'the Bohr radius, 0.0529 nm' },
  ],
  why: 'The quantum numbers of hydrogen are the scaffolding of the periodic table, chemical bonds and atomic spectra; the same s, p, d, f shapes appear in every atom.',
  visual: {
    type: 'mp-orbitals',
    title: 'Hydrogen’s orbitals',
    lead: t`Choose $n$, $l$ and $m_l$. Left: a slice through the cloud. Right: its angular shape. Below: the radial probability $P(r)$, with the most probable radius (gold), $\langle r\rangle$ (violet) and Bohr’s orbit radius $n^2a_0$ (grey) for comparison.`,
    tasks: [
      '1s: P(r) peaks exactly at Bohr’s radius a₀ — but the average distance is 1.5a₀, and the electron can be found anywhere.',
      'Set n = 3 and step l from 0 to 2: radial nodes (dark shells) trade for angular nodes (dark cones and planes), always n − 1 in all.',
      'Turn on real orbitals and step m: the chemist’s px, py, dxy … appear. Compare with the physicist’s m = ±1 states, rings around the z-axis.',
    ],
    params: { n: 1, l: 0, m: 0, marks: ['peak', 'mean', 'bohr'] },
  },
  example: {
    prompt: t`For hydrogen’s ground state, $P(r) = \dfrac{4r^2}{a_0^3}e^{-2r/a_0}$. Find the most probable radius, the mean radius $\langle r\rangle$, and the probability that the electron is closer than $a_0$ to the nucleus.`,
    visual: orb({ n: 1, l: 0, m: 0, panels: ['radial'], marks: ['peak', 'mean'] }, 'The 1s radial probability density, with its most probable radius (gold) and mean (violet).'),
    steps: [
      { label: 'Most probable radius', text: t`Set $dP/dr = 0$: $\dfrac{d}{dr}\left(r^2e^{-2r/a_0}\right) = \left(2r - \dfrac{2r^2}{a_0}\right)e^{-2r/a_0} = 0$, so $r = a_0$. Bohr’s orbit radius survives — as the peak of a probability, not a path.` },
      { label: 'Mean radius', text: t`$\langle r\rangle = \displaystyle\int_0^\infty r\,P(r)\,dr = \frac{4}{a_0^3}\int_0^\infty r^3e^{-2r/a_0}dr = \frac{4}{a_0^3}\cdot\frac{3!}{(2/a_0)^4} = \frac32a_0$. The long tail pulls the average past the peak.` },
      { label: 'Inside one Bohr radius', text: t`$\displaystyle\int_0^{a_0}P\,dr$: with $u = 2r/a_0$ this is $\tfrac12\int_0^2u^2e^{-u}du = 1 - 5e^{-2} = ${fmt(O.probInside(1, 0, 1), 3)}$.` },
      { label: 'Sense check', text: t`Only a third of the time inside $a_0$, and $\int_0^\infty P\,dr = 1$ as it must. In SI units: peak at 0.0529 nm, mean 0.0794 nm.` },
    ],
    answer: t`Most probable $r = a_0$; $\langle r\rangle = \tfrac32a_0$; $P(r < a_0) = 1 - 5e^{-2} = ${fmt(O.probInside(1, 0, 1), 3)}$.`,
  },
  practice: [
    num({
      id: 'subshell', difficulty: 1,
      gen(r) {
        const l = r.pick([1, 2, 3]), n = l + r.pick([1, 2]);
        return {
          prompt: t`How many states with different $m_l$ make up the ${n}${LET[l]} subshell (ignoring spin)?`,
          answer: 2 * l + 1, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: l, feedback: t`$m_l$ runs from $-l$ to $+l$, including zero: $2l + 1$ values.` }, { value: n * n, feedback: t`$n^2$ counts every state of the whole level $n$. A subshell has one value of $l$.` }],
          hints: [t`The letter ${LET[l]} means $l = ${l}$.`, t`$m_l = -${l}, \ldots, ${l}$.`],
          teach: 'A subshell (fixed n and l) has 2l + 1 orbitals: m = −l … l.',
          explain: t`${LET[l]} means $l = ${l}$, so $m_l = ${Array.from({ length: 2 * l + 1 }, (_, i) => i - l).join(', ')}$: ${2 * l + 1} states. (With spin, twice that — the ${2 * (2 * l + 1)} electrons a ${LET[l]} subshell can hold.)`,
          visual: orb({ n, l, m: 0, panels: ['angular'] }, t`The angular shape of the $m_l = 0$ member of the subshell; its partners are tilted differently.`),
        };
      },
    }),
    mcq({
      id: 'identify', difficulty: 2,
      prompt: t`The pictures show one state of hydrogen: its cloud, its angular shape and its radial probability. Which state is it?`,
      choices: ['3d', '3p', '4d', '2p'],
      answer: 0,
      why: {
        1: 'A p state has one angular node (a plane) and two lobes along z; this shape has two nodal cones.',
        2: 'A 4d state has n − l − 1 = 1 radial node: P(r) would drop to zero once before its main peak. This one has none.',
        3: 'A 2p state has two lobes and one nodal plane, not this four-lobed shape with a ring.',
      },
      hints: ['Count the angular nodes (dark cones or planes through the nucleus) — that is l.', 'Count the zeros of P(r) for r > 0 — that is n − l − 1.'],
      teach: 'Angular nodes give l; radial nodes give n − l − 1; together they identify the state.',
      explain: t`Two nodal cones (at 54.7° from the z-axis) mean $l = 2$; no radial node means $n - l - 1 = 0$, so $n = 3$: the 3d state with $m_l = 0$ (the chemist’s $3d_{z^2}$).`,
      visual: orb({ n: 3, l: 2, m: 0, marks: [], hide: ['name'] }, 'One state of hydrogen: cloud, angular shape and radial probability (name hidden).'),
    }),
    num({
      id: 'radial-nodes', difficulty: 1,
      gen(r) {
        const [n, l] = r.pick([[4, 1], [5, 3], [4, 0], [5, 2], [3, 0]]);
        return {
          prompt: t`How many spherical (radial) nodes — distances at which $\psi$ vanishes — does the ${n}${LET[l]} state of hydrogen have?`,
          answer: n - l - 1, tol: { rel: 0, abs: 0.5 },
          errors: n - 1 !== n - l - 1 ? [{ value: n - 1, feedback: t`$n - 1$ is the total number of nodes. ${l} of them are angular, so the radial ones number $n - l - 1$.` }] : [],
          hints: [t`Radial nodes: $n - l - 1$. Angular nodes: $l$.`],
          teach: 'Radial nodes number n − l − 1: the higher l, the fewer spherical shells.',
          explain: t`$n - l - 1 = ${n} - ${l} - 1 = ${n - l - 1}$${n - l - 1 ? ` spherical shell${n - l - 1 > 1 ? 's' : ''} where the electron is never found` : ': no spherical shells'}, plus ${l} angular node${l === 1 ? '' : 's'}.`,
          visual: orb({ n, l, m: 0, panels: ['angular'] }, t`The angular shape of a ${LET[l]} state (with $m_l = 0$). Its radial structure is not shown.`),
        };
      },
    }),
    num({
      id: 'inside', difficulty: 2,
      gen(r) {
        const k = r.pick([0.5, 2, 3]), P = O.probInside(1, 0, k);
        return {
          prompt: t`What is the probability of finding hydrogen’s 1s electron within $${k}a_0$ of the nucleus? ($\int_0^x u^2e^{-u}du = 2 - e^{-x}(x^2 + 2x + 2)$.)`,
          answer: P, tol: { rel: 0.005 },
          errors: [{ value: 1 - Math.exp(-2 * k), feedback: t`$P(r)$ includes the factor $r^2$; integrate $\frac{4r^2}{a_0^3}e^{-2r/a_0}$, not $e^{-2r/a_0}$ alone.` }],
          hints: [t`With $u = 2r/a_0$, $\int_0^{${k}a_0}P\,dr = \tfrac12\int_0^{${2 * k}}u^2e^{-u}\,du$.`, t`$= 1 - e^{-${2 * k}}\left(1 + ${2 * k} + \tfrac{${2 * k}^2}{2}\right)$.`],
          teach: 'A probability within a radius is the area under P(r) up to it.',
          explain: t`$P = 1 - e^{-${2 * k}}\left(1 + ${2 * k} + ${fmt((2 * k) ** 2 / 2, 3)}\right) = ${fmt(P, 3)}$. ${k >= 3 ? 'Even at three Bohr radii a few percent of the probability lies further out.' : ''}`,
          visual: p1s(k, t`The 1s radial probability density, with the region inside $${k}a_0$ shaded gold.`),
        };
      },
    }),
    num({
      id: 'mean-r', difficulty: 2,
      gen(r) {
        const [n, l] = r.pick([[2, 0], [2, 1], [3, 1], [3, 2], [4, 3]]), R = O.meanR(n, l) * A0NM;
        return {
          prompt: t`The mean distance of hydrogen’s electron from the nucleus in state $(n, l)$ is $\langle r\rangle = \tfrac12\left[3n^2 - l(l+1)\right]a_0$. What is it for the ${n}${LET[l]} state, in nm? ($a_0 = 0.0529$ nm.)`,
          answer: R, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: n * n * A0NM, feedback: t`$n^2a_0$ is Bohr’s orbit radius (and the most probable radius when $l = n - 1$), not the mean.` }],
          hints: [t`$3n^2 - l(l+1) = ${3 * n * n} - ${l * (l + 1)}$.`],
          teach: '⟨r⟩ = [3n² − l(l+1)]a₀/2: size grows as n², and higher l pulls the cloud slightly in.',
          explain: t`$\langle r\rangle = \tfrac12(${3 * n * n - l * (l + 1)})a_0 = ${fmt(O.meanR(n, l), 3)}a_0 = ${fmt(R, 3)}$ nm. The most probable radius is ${fmt(O.peakR(n, l), 3)}$a_0$: the tail always pulls the mean further out.`,
          visual: orb({ n, l, m: 0, panels: ['radial'], marks: ['bohr'] }, t`The radial probability of the ${n}${LET[l]} state, with Bohr’s orbit radius $n^2a_0$ marked for comparison.`),
        };
      },
    }),
    mcq({
      id: 'real', difficulty: 3,
      prompt: t`Chemistry books draw a $2p_x$ orbital as two lobes along $x$. The states of definite $m_l$ that this lesson uses, $m_l = \pm1$, are rings around the $z$-axis. How are they related?`,
      choices: [
        t`$2p_x$ is an equal mixture of $m_l = +1$ and $m_l = -1$: it has the same energy and a definite shape, but no definite $L_z$`,
        t`$2p_x$ is the $m_l = +1$ state, and $2p_y$ is $m_l = -1$`,
        t`$2p_x$ has a different energy from the $m_l = \pm1$ states`,
        t`The rings are a mistake: only the lobed shapes solve the Schrödinger equation`,
      ],
      answer: 0,
      why: {
        1: t`A state with $m_l = +1$ has $|\psi|^2$ symmetric about $z$ — a ring. Lobes along $x$ need both $e^{i\phi}$ and $e^{-i\phi}$, combined into $\cos\phi$.`,
        2: t`All three 2p states, and every mixture of them, have $E_2 = -3.40$ eV.`,
        3: t`Both are solutions: any combination of states with the same energy is another solution with that energy.`,
      },
      hints: [t`$\cos\phi = (e^{i\phi} + e^{-i\phi})/2$.`, 'A combination of two states with the same energy is still a stationary state of that energy.'],
      teach: 'Real orbitals are superpositions of +m and −m: same energy, definite shape, indefinite Lz.',
      explain: t`$2p_x \propto \sin\theta\cos\phi \propto (Y_{1,-1} - Y_{1,1})/\sqrt2$. Chemists prefer real orbitals because bonds point along directions; physicists prefer definite $m_l$ because a magnetic field along $z$ picks those out (next lesson).`,
      visual: orb({ n: 2, l: 1, m: 1, real: true, panels: ['cloud', 'angular'] }, 'The real orbital 2px: two lobes along x, opposite in sign (blue +, orange −).'),
    }),
    code({
      id: 'harmonics', difficulty: 3,
      prompt: t`SciPy evaluates spherical harmonics: \`scipy.special.sph_harm_y(l, m, theta, phi)\`, with \`theta\` the polar angle and \`phi\` the azimuth (in older SciPy this was \`sph_harm\`, with the angles the other way round). Finish \`sphere_integral(l, m)\`, which returns $\int|Y_{lm}|^2\sin\theta\,d\theta\,d\phi$ over the whole sphere by applying \`np.trapezoid\` twice on the grid, and \`node_angle(l)\`, which returns the first polar angle, in degrees, where $Y_{l0}$ changes sign — the opening angle of its nodal cone.`,
      starter: t`import numpy as np
from scipy.special import sph_harm_y

theta = np.linspace(0, np.pi, 801)          # polar angle
phi = np.linspace(0, 2 * np.pi, 801)        # azimuth
T, P = np.meshgrid(theta, phi, indexing="ij")

def sphere_integral(l, m):
    # integrate |Y_lm|^2 sin(theta) over phi (axis 1), then over theta
    pass

def node_angle(l):
    # sample Y_l0 along theta (phi = 0), find the first sign change, interpolate
    pass

print(sphere_integral(2, 1), node_angle(2))
`,
      answer: t`import numpy as np
from scipy.special import sph_harm_y

theta = np.linspace(0, np.pi, 801)
phi = np.linspace(0, 2 * np.pi, 801)
T, P = np.meshgrid(theta, phi, indexing="ij")

def sphere_integral(l, m):
    f = np.abs(sph_harm_y(l, m, T, P))**2 * np.sin(T)
    return np.trapezoid(np.trapezoid(f, phi, axis=1), theta)

def node_angle(l):
    y = np.real(sph_harm_y(l, 0, theta, 0.0))
    i = np.where(np.sign(y[:-1]) != np.sign(y[1:]))[0][0]
    t0 = theta[i] - y[i] * (theta[i + 1] - theta[i]) / (y[i + 1] - y[i])
    return np.degrees(t0)

print(sphere_integral(2, 1), node_angle(2))`,
      tests: [
        { name: t`$Y_{21}$ is normalised: $\int|Y_{21}|^2d\Omega = 1$`, code: 'abs(sphere_integral(2, 1) - 1) < 1e-4' },
        { name: t`so is $Y_{3,-2}$`, code: 'abs(sphere_integral(3, -2) - 1) < 1e-4' },
        { name: t`$Y_{20}$’s nodal cone opens at $\arccos(1/\sqrt3) = 54.74°$`, code: 'abs(node_angle(2) - 54.7356) < 0.05' },
        { name: t`$Y_{30}$’s first nodal cone opens at $\arccos\sqrt{3/5} = 39.23°$`, code: 'abs(node_angle(3) - 39.2315) < 0.05' },
      ],
      hints: [t`\`f = np.abs(sph_harm_y(l, m, T, P))**2 * np.sin(T)\`; then \`np.trapezoid(np.trapezoid(f, phi, axis=1), theta)\`.`, t`For the node: \`y = np.real(sph_harm_y(l, 0, theta, 0.0))\`; \`i = np.where(np.sign(y[:-1]) != np.sign(y[1:]))[0][0]\`; interpolate linearly between \`theta[i]\` and \`theta[i+1]\`.`],
      teach: 'Spherical harmonics are normalised over the sphere (with sin θ in the area element), and Yₗ₀ has l nodal cones.',
      explain: t`The $\sin\theta$ is the sphere’s area element: without it the integral is wrong near the poles. $Y_{20} \propto 3\cos^2\theta - 1$ vanishes where $\cos^2\theta = 1/3$ — the cones you see in the $3d_{z^2}$ cloud.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-peak', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]), l = n - 1;
        return {
          prompt: t`For hydrogen states with the largest possible $l$, $l = n - 1$, the radial function is $R \propto r^{n-1}e^{-r/na_0}$. Find the most probable radius of the ${n}${LET[l]} state, in nm. ($a_0 = 0.0529$ nm.)`,
          answer: n * n * A0NM, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: O.meanR(n, l) * A0NM, feedback: t`That is $\langle r\rangle$. The most probable radius is the peak of $P(r) = r^2R^2$: set $dP/dr = 0$.` }, { value: n * A0NM, feedback: t`Include the $r^2$: $P \propto r^{2n}e^{-2r/na_0}$, which peaks at $r = n^2a_0$.` }],
          hints: [t`$P(r) = r^2R^2 \propto r^{2n}e^{-2r/na_0}$.`, t`$\dfrac{dP}{dr} = 0$ gives $\dfrac{2n}{r} = \dfrac{2}{na_0}$.`],
          teach: 'For l = n − 1 the most probable radius is exactly Bohr’s n²a₀.',
          explain: t`$P \propto r^{${2 * n}}e^{-2r/${n}a_0}$ peaks at $r = n^2a_0 = ${n * n}a_0 = ${fmt(n * n * A0NM, 3)}$ nm — exactly Bohr’s orbit radius, which is why his model got the sizes right for these states.`,
          visual: orb({ n, l, m: 0, panels: ['cloud', 'angular'], hide: ['name'] }, t`The ${n}${LET[l]} state with $m_l = 0$: cloud and angular shape.`),
        };
      },
    }),
    mcq({
      id: 'cp-2s2p', difficulty: 2,
      prompt: t`Which statement about hydrogen’s 2s and 2p states is true?`,
      choices: [
        t`They have the same energy, $-3.40$ eV; 2s has one radial node and more probability very close to the nucleus`,
        t`2p lies lower in energy than 2s, because its electron stays further from the nucleus`,
        t`2s is a sphere and 2p is a ring at exactly $2^2a_0 = 4a_0$`,
        t`2s has angular momentum $\sqrt2\,\hbar$ and 2p has none`,
      ],
      answer: 0,
      why: {
        1: 'In hydrogen the energy depends only on n. (In larger atoms 2s does lie below 2p, because inner electrons screen the nucleus — the next module.)',
        2: 'Orbitals are clouds with no edges, and no orbital is a ring of fixed radius.',
        3: t`Backwards: $l = 0$ for 2s gives $|\vec L| = 0$; $l = 1$ gives $\sqrt2\,\hbar$.`,
      },
      hints: ['What does the energy of hydrogen depend on?'],
      teach: 'Same n, same energy in hydrogen; l changes the shape, the nodes and the angular momentum.',
      explain: t`Both have $E_2 = -13.6/4 = -3.40$ eV. 2s has a small inner hump of probability inside its radial node at $2a_0$ — it penetrates closer to the nucleus, which is what lowers it in many-electron atoms.`,
      visual: orb({ n: 2, l: 0, m: 0, panels: ['radial'], marks: [] }, 'The radial probability of 2s, for comparison: an inner hump, a node, and the main peak.'),
    }),
    num({
      id: 'cp-rydberg', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([50, 70, 100]), R = O.meanR(n, 0) * A0NM / 1000;
        return {
          prompt: t`Atoms excited to very high $n$ — Rydberg atoms — are so large and so loosely bound that they respond to weak radio waves, and laboratories now use them as antennas: electric-field sensors calibrated by atomic physics. For a hydrogen-like s state with $n = ${n}$, use $\langle r\rangle = \tfrac12\left[3n^2 - l(l+1)\right]a_0$ to find the atom’s mean radius, in μm.`,
          answer: R, units: 'μm', tol: { rel: 0.01 },
          errors: [{ value: n * n * A0NM / 1000, feedback: t`$n^2a_0$ is Bohr’s radius for level $n$. For an s state $\langle r\rangle = \tfrac32n^2a_0$.` }, { value: n * A0NM / 1000, feedback: t`Size grows as $n^2$, not $n$.` }],
          hints: [t`With $l = 0$: $\langle r\rangle = \tfrac32n^2a_0$.`, t`$\tfrac32(${n})^2(0.0529\ \text{nm})$, then convert to μm.`],
          teach: 'Atoms grow as n²: at n ≈ 100 a single atom is almost a micrometre across.',
          explain: t`$\langle r\rangle = 1.5\times${n * n}\times0.0529\ \text{nm} = ${fmt(R * 1000, 3)}$ nm $= ${fmt(R, 3)}$ μm — ${n >= 100 ? 'nearly the size of a bacterium' : 'thousands of times a ground-state atom'}. Neighbouring levels are only $\sim 2\times13.6\ \text{eV}/n^3$ apart, so transitions between them fall in the microwave and radio bands, and a radio field shifts them measurably: that is how a Rydberg-atom receiver reads a signal.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, 4], y: [-0.2, 1.5], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'size (nm), logarithmic', ylabel: '', yticks: 0, grid: false,
              points: [
                { x: r6(Math.log10(2 * A0NM)), y: 0.5, r: 6, color: 'accent', label: 'ground-state hydrogen', labelDx: 0, labelDy: -14, labelAlign: 'center' },
                { x: 2, y: 0.9, r: 6, color: 'good', label: 'a virus, about 100 nm', labelDx: 0, labelDy: -14, labelAlign: 'center' },
                { x: r6(Math.log10(1500)), y: 0.5, r: 6, color: 'gold', label: 'a bacterium, about 1.5 μm', labelDx: 0, labelDy: -14, labelAlign: 'center' },
                label(-1.9, 1.3, `where does an n = ${n} atom fall?`, 'violet', 0, 0, 'left'),
              ],
            },
            caption: 'Sizes on a logarithmic axis, from a ground-state hydrogen atom (about 0.1 nm across) to a bacterium.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §8.1 (the hydrogen atom: wave functions and probability densities)', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-1-the-hydrogen-atom' },
    { label: 'SciPy documentation: scipy.special.sph_harm_y', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.sph_harm_y.html' },
    { label: 'Sedlacek et al. (2012), Microwave electrometry with Rydberg atoms in a vapour cell, Nature Physics 8, 819', url: 'https://doi.org/10.1038/nphys2423' },
  ],
});
