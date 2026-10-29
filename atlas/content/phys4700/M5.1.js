// The Schrödinger equation in spherical coordinates (Griffiths & Schroeter
// §4.1). For a central potential, ψ = R(r) Y(θ, φ): the angular equation
// gives l(l + 1) and the spherical harmonics (lessons M5.3–M5.4); the radial
// equation for u = rR is a one-dimensional problem on r > 0 with u(0) = 0 and
// an effective potential V + ħ²l(l + 1)/2mr². Explore: hydrogen's effective
// potential and the allowed region at a chosen energy. Worked: the infinite
// spherical well — l = 0 is the 1D box, l = 1 needs tan x = x (4.4934),
// spherical Bessel zeros order the levels 1s, 1p, 1d, 2s. Transfer: CdSe
// quantum dots in the particle-in-a-sphere (Brus) model. phys2710.MP8.1 met
// separation and the centrifugal barrier qualitatively; this lesson solves
// the radial equation. Every number is computed here.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HB2M_EVNM2, seg, label, r6 } from './_qm.js';
import { bisect } from './_wells.js';
import { RYD_EV } from '../../src/viz/model/mp-orbitals.js';

const t = String.raw;
const HARTREE = 2 * RYD_EV;                                        // eV
/** The kth positive zero of the spherical Bessel function j_l (l ≤ 3), by bisection on its closed form. */
const jl = [
  (x) => Math.sin(x) / x,
  (x) => Math.sin(x) / (x * x) - Math.cos(x) / x,
  (x) => (3 / (x * x) - 1) * Math.sin(x) / x - 3 * Math.cos(x) / (x * x),
  (x) => (15 / x ** 3 - 6 / x) * Math.sin(x) / x - (15 / (x * x) - 1) * Math.cos(x) / x,
];
function besselZero(l, k) {
  const zs = [];
  for (let x = 0.5; zs.length < k && x < 60; x += 0.05) if (jl[l](x) * jl[l](x + 0.05) < 0) zs.push(bisect(jl[l], x, x + 0.05));
  return zs[k - 1];
}
const Z10 = Math.PI, Z11 = besselZero(1, 1), Z12 = besselZero(2, 1), Z20 = 2 * Math.PI, Z13 = besselZero(3, 1);

/** Hydrogen's effective potential (eV) against r (in a₀) for a fixed l, with an energy line. */
function veffPic(l, E, caption, { shadeAllowed = true, xr = 20 } = {}) {
  const V = `-${r6(HARTREE)}/x + ${r6(RYD_EV)}*${l * (l + 1)}/x^2`;
  return {
    type: 'graph',
    params: {
      x: [0, xr], y: [-16, 8], aspect: 'wide', xlabel: 'r (a₀)', ylabel: 'energy (eV)', xticks: 5, yticks: 4, axesAt: 'edge',
      curves: [{ fn: V, color: 'accent', width: 2.4, domain: [0.05, xr] }, ...(E !== null ? [{ fn: String(E), color: 'gold', width: 2 }] : [])],
      shade: E !== null && shadeAllowed ? [{ fn: String(E), lower: `min(${V}, ${E})`, from: 0.05, to: xr, color: 'gold', alpha: 0.2 }] : [],
    },
    caption,
  };
}
/** u(r) on [0, a] for the spherical well, as an expression of x = r/a. */
const uWell = { 0: (n) => `sin(${n}*pi*x)`, 1: () => `${r6(Z11)}*x*(sin(${r6(Z11)}*x)/(${r6(Z11)}*x)^2 - cos(${r6(Z11)}*x)/(${r6(Z11)}*x))/1.0631` };

export default lesson({
  id: 'phys4700.M5.1',
  title: 'The Schrödinger equation in spherical coordinates',
  minutes: 17, difficulty: 3,
  intro: t`When the potential depends only on the distance $r$ from a centre, the three-dimensional Schrödinger equation separates in spherical coordinates: $\psi(r, \theta, \phi) = R(r)\,Y(\theta, \phi)$. The angular part is the same for every central potential — it fixes a number $l = 0, 1, 2, \dots$ and gives the spherical harmonics $Y_l^m$. All the physics of the particular potential is in the **radial equation**, which, written for $u(r) = rR(r)$, is a one-dimensional Schrödinger equation on $r > 0$ with $u(0) = 0$:

$$-\frac{\hbar^2}{2m}\frac{d^2u}{dr^2} + \Big[V(r) + \frac{\hbar^2}{2m}\frac{l(l+1)}{r^2}\Big]u = Eu$$

The extra term is a **centrifugal barrier**: angular momentum $\sqrt{l(l+1)}\,\hbar$ pushes the particle away from the centre, more strongly the larger $l$.`,
  symbols: [
    { tex: 'u(r) = rR(r)', text: t`the radial function times $r$: $|u|^2dr$ is the probability of finding the particle between $r$ and $r + dr$, in any direction` },
    { tex: 'V(r)', text: 'the central potential energy, in J or eV' },
    { tex: 'l', text: t`the orbital angular momentum quantum number: $|\vec L| = \sqrt{l(l+1)}\,\hbar$` },
    { tex: '\\frac{\\hbar^2l(l+1)}{2mr^2}', text: 'the centrifugal term: the kinetic energy of the angular motion, which acts like a repulsive potential' },
    { tex: 'm', text: t`the particle’s mass (the reduced mass for a two-body problem), in kg` },
    { tex: 'E', text: 'the energy eigenvalue, the same for every m at a given l' },
  ],
  why: 'Every atom, nucleus, quantum dot and molecule-scale collision with spherical symmetry reduces to this one radial equation.',
  visual: {
    type: 'graph',
    title: 'The effective potential of hydrogen',
    lead: t`$V_{\text{eff}} = -\dfrac{e^2}{4\pi\epsilon_0r} + \dfrac{\hbar^2l(l+1)}{2m_er^2}$ for hydrogen’s electron, with $r$ in Bohr radii. The gold line is an energy $E$; the shaded band is where the electron is classically allowed at that energy.`,
    tasks: [
      'At l = 0 the well reaches down to r = 0: an s electron can sit at the nucleus.',
      'Raise l: the centrifugal barrier walls off the centre, and the minimum of the well moves out to r = l(l+1) a₀.',
      'Set E = −3.4 eV (hydrogen’s n = 2) and compare l = 0 and l = 1: the l = 1 electron is confined between two turning points.',
    ],
    params: {
      x: [0, 20], y: [-16, 8], aspect: 'wide', xlabel: 'r (a₀)', ylabel: 'energy (eV)', xticks: 5, yticks: 4, axesAt: 'edge',
      sliders: [
        { key: 'l', label: t`Angular momentum $l$`, min: 0, max: 3, step: 1, value: 1, explain: t`$l = 0, 1, 2, 3$ are the s, p, d, f states; $|\vec L| = \sqrt{l(l+1)}\,\hbar$.` },
        { key: 'E', label: t`Energy $E$`, min: -14, max: 2, step: 0.1, value: -3.4, unit: '\\text{eV}', explain: t`A trial energy. Hydrogen’s bound levels are $-13.6\ \text{eV}/n^2$: $-13.6$, $-3.4$, $-1.51$ …` },
      ],
      curves: [{ fn: `-${r6(HARTREE)}/x + ${r6(RYD_EV)}*l*(l + 1)/x^2`, color: 'accent', width: 2.4, domain: [0.05, 20] }, { fn: 'E', color: 'gold', width: 2 }],
      shade: [{ fn: 'E', lower: `min(-${r6(HARTREE)}/x + ${r6(RYD_EV)}*l*(l + 1)/x^2, E)`, from: 0.05, to: 20, color: 'gold', alpha: 0.2 }],
      readouts: [
        { label: t`well minimum at $r = l(l+1)\,a_0$`, expr: 'l*(l + 1)', digits: 3 },
        { label: t`centrifugal term at $r = a_0$ (eV)`, expr: `${r6(RYD_EV)}*l*(l + 1)`, digits: 4 },
      ],
    },
    caption: t`Exact for the Coulomb potential with an infinitely heavy nucleus; $V_{\text{eff}}$ is drawn from $r = 0.05\,a_0$. For $l = 0$ there is no minimum: the well falls without limit. Quantum mechanically the electron also leaks into the unshaded, forbidden region.`,
  },
  example: {
    prompt: t`A particle of mass $m$ is confined inside a sphere of radius $a$: $V = 0$ for $r < a$, $V = \infty$ outside. Find its energies for $l = 0$ and the lowest for $l = 1$, then put numbers in for an electron with $a = 1$ nm.`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'r / a', ylabel: 'u(r) (scaled)', xticks: 5, yticks: 0, axesAt: 'edge', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.4 }, { fn: uWell[1](), color: 'violet', width: 2.2, dash: [6, 4] }], legend: [{ label: 'l = 0, lowest', color: 'accent' }, { label: 'l = 1, lowest', color: 'violet', dash: [6, 4] }], legendAt: 'tr' }, caption: t`The two lowest radial functions $u = rR$ in the sphere (heights scaled). Both vanish at $r = 0$ and at the wall; the $l = 1$ state starts more slowly, as $r^2$.` },
    steps: [
      { label: 'Radial equation', text: t`Inside, $u'' = \Big[\dfrac{l(l+1)}{r^2} - k^2\Big]u$ with $k = \sqrt{2mE}/\hbar$. The boundary conditions are $u(0) = 0$ and $u(a) = 0$.` },
      { label: 'The s states', text: t`For $l = 0$, $u'' = -k^2u$: $u = A\sin kr$ (the cosine fails at $r = 0$). Then $ka = n\pi$, so $E_{n0} = \dfrac{n^2\pi^2\hbar^2}{2ma^2}$ — exactly the one-dimensional box of width $a$.` },
      { label: 'The lowest p state', text: t`For $l = 1$ the regular solution is $u = r\,j_1(kr)$ with $j_1(x) = \dfrac{\sin x}{x^2} - \dfrac{\cos x}{x}$. Setting $j_1(ka) = 0$ gives $\tan x = x$, whose first positive root is $x = ${fmt(Z11, 5)}$.` },
      { label: 'Compare', text: t`$E_{11}/E_{10} = (${fmt(Z11, 5)}/\pi)^2 = ${fmt((Z11 / Z10) ** 2, 4)}$. The centrifugal barrier costs energy: an $l = 1$ particle cannot use the middle of the sphere.` },
      { label: 'Numbers', text: t`With $\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}$ eV nm² and $a = 1$ nm: $E_{10} = \pi^2\times${fmt(HB2M_EVNM2, 5)} = ${fmt(Z10 ** 2 * HB2M_EVNM2, 4)}$ eV and $E_{11} = ${fmt(Z11 ** 2 * HB2M_EVNM2, 4)}$ eV.` },
      { label: 'Ordering', text: t`The zeros of $j_l$ order the levels: $\pi$ (1s), $${fmt(Z11, 4)}$ (1p), $${fmt(Z12, 4)}$ (1d), $2\pi$ (2s), $${fmt(Z13, 4)}$ (1f) … Each level holds $2l + 1$ values of $m$. The same sequence, modified by spin–orbit coupling, is the start of the nuclear shell model.` },
    ],
    answer: t`$E_{n0} = n^2\pi^2\hbar^2/2ma^2$; the lowest $l = 1$ level has $ka = ${fmt(Z11, 4)}$, $${fmt((Z11 / Z10) ** 2, 3)}$ times higher. For an electron in a 1 nm sphere: $${fmt(Z10 ** 2 * HB2M_EVNM2, 3)}$ eV and $${fmt(Z11 ** 2 * HB2M_EVNM2, 3)}$ eV.`,
  },
  practice: [
    mcq({
      id: 'u-zero', difficulty: 2,
      prompt: t`Why must $u(r) = rR(r)$ vanish at $r = 0$, even for $l = 0$ where nothing in the radial equation blows up?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.3, 1.2], aspect: 'wide', xlabel: 'r / a', ylabel: 'u(r)', xticks: 5, yticks: 0, axesAt: 'edge', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.4 }, { fn: 'cos(pi*x/2)', color: 'bad', width: 2, dash: [6, 4] }], legend: [{ label: 'u = sin kr', color: 'accent' }, { label: 'u = cos kr: rejected', color: 'bad', dash: [6, 4] }], legendAt: 'tr' }, caption: 'Two solutions of u″ = −k²u that vanish at the wall. Only one is allowed.' },
      choices: [
        t`If $u(0) \ne 0$ then $R \sim 1/r$, and $\nabla^2(1/r) = -4\pi\delta^3(\vec r)$: the full 3D equation would fail at the origin`,
        t`Because the probability of being exactly at $r = 0$ must be zero`,
        t`Because $u$ must be an odd function of $r$`,
        t`It need not: $u = \cos kr$ is an equally good $l = 0$ solution`,
      ],
      answer: 0,
      why: {
        1: t`Probability of any single point is zero for every wave function; that does not constrain $u(0)$.`,
        2: t`$r \ge 0$, so $u$ has no “other side” to be odd about; the condition comes from the 3D equation.`,
        3: t`$\cos kr/r$ solves the radial equation for $r > 0$ but puts a delta function into $\nabla^2\psi$ at the origin, where $V$ has none.`,
      },
      hints: [t`What does $R = u/r$ do near $r = 0$ if $u(0) \ne 0$?`, t`Recall $\nabla^2(1/r)$ from electrostatics.`],
      teach: 'u(0) = 0 because R ∝ 1/r would solve the radial equation but not the full 3D Schrödinger equation at the origin.',
      explain: t`$\psi \propto \cos kr/r$ satisfies $(\nabla^2 + k^2)\psi = -4\pi\delta^3(\vec r)$: a point source, not a free particle. Requiring the 3D equation everywhere forces $u(0) = 0$, so only $\sin kr$ survives.`,
    }),
    num({
      id: 'sphere-s', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 2, 3]), n = r.pick([1, 2, 3]);
        const ans = (n * Math.PI) ** 2 * HB2M_EVNM2 / (a * a);
        return {
          prompt: t`An electron is trapped in a spherical cavity of radius $${a}$ nm with impenetrable walls. What is the energy of its ${['', 'lowest', 'second', 'third'][n]} $l = 0$ state, in eV? ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}$ eV nm².)`,
          visual: { type: 'graph', params: { x: [0, a], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'r (nm)', ylabel: 'u(r) (scaled)', xticks: 4, yticks: 0, axesAt: 'edge', curves: [1, 2, 3].map((k) => ({ fn: `sin(${k}*pi*x/${a})`, color: k === n ? 'accent' : 'ink4', width: k === n ? 2.6 : 1.4, ...(k === n ? {} : { dash: [4, 4] }) })) }, caption: t`The first three $l = 0$ radial functions $u = \sin(k r)$ in the cavity; the one asked about is solid.` },
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: ans / 4, feedback: t`The radius $a$ plays the role of the 1D box’s full width, not half of it: $ka = n\pi$.` }, { value: 4 * ans, feedback: t`The condition is $ka = n\pi$ with $a$ the radius, not the diameter.` }],
          hints: [t`For $l = 0$, $u = \sin kr$ and $u(a) = 0$ give $ka = n\pi$.`, t`$E = \dfrac{\hbar^2k^2}{2m} = \dfrac{\hbar^2}{2m_e}\Big(\dfrac{n\pi}{a}\Big)^2$.`],
          teach: 'With l = 0 the radial equation for u is a 1D box of width a, so E = n²π²ħ²/2ma².',
          explain: t`$E = ${fmt(HB2M_EVNM2, 5)}\times(${n}\pi/${a})^2 = ${fmt(ans, 4)}$ eV. The wave function $\psi = u/r \propto \sin(kr)/r$ is largest at the centre, not zero there.`,
        };
      },
    }),
    num({
      id: 'barrier', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3]), rr = r.pick([1, 2, 4]);
        const ans = RYD_EV * l * (l + 1) / (rr * rr);
        return {
          prompt: t`For hydrogen’s electron, how large is the centrifugal term $\dfrac{\hbar^2l(l+1)}{2m_er^2}$ at $r = ${rr}\,a_0$ when $l = ${l}$, in eV? (At $r = a_0$, $\hbar^2/2m_ea_0^2$ is the Rydberg energy, $${fmt(RYD_EV, 7)}$ eV.)`,
          visual: veffPic(l, null, t`The effective potential for $l = ${l}$: Coulomb attraction plus the centrifugal barrier.`),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: RYD_EV * l * l / (rr * rr), feedback: t`The barrier carries $l(l+1)$, the eigenvalue of $\hat L^2/\hbar^2$, not $l^2$.` }, { value: RYD_EV * l * (l + 1) / rr, feedback: t`It falls as $1/r^2$, not $1/r$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\dfrac{\hbar^2}{2m_er^2} = ${fmt(RYD_EV, 5)}\ \text{eV}\times\Big(\dfrac{a_0}{r}\Big)^2$.`, t`Multiply by $l(l+1) = ${l * (l + 1)}$.`],
          teach: 'The centrifugal term is the kinetic energy of angular motion, L²/2mr², with L² = l(l + 1)ħ².',
          explain: t`$${fmt(RYD_EV, 5)}\times${l * (l + 1)}/${rr * rr} = ${fmt(ans, 4)}$ eV, compared with a Coulomb energy of $-${fmt(HARTREE / rr, 4)}$ eV there. Near the nucleus the barrier always wins, which is why only s electrons reach it.`,
        };
      },
    }),
    num({
      id: 'inner-half', difficulty: 3,
      gen(r) {
        const [f, ftex] = r.pick([[0.25, t`\tfrac14`], [1 / 3, t`\tfrac13`], [0.5, t`\tfrac12`], [2 / 3, t`\tfrac23`], [0.75, t`\tfrac34`]]);
        const ans = f - Math.sin(2 * Math.PI * f) / (2 * Math.PI);
        return {
          prompt: t`A particle in a spherical box of radius $a$ is in its ground state, $u(r) = \sqrt{2/a}\,\sin(\pi r/a)$. What is the probability of finding it within $r < ${ftex}\,a$? (That sphere holds a fraction $${fmt(f ** 3, 3)}$ of the volume.)`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 2.2], aspect: 'wide', xlabel: 'r / a', ylabel: '|u|² (per a)', xticks: 4, yticks: 2, axesAt: 'edge', curves: [{ fn: '2*sin(pi*x)^2', color: 'accent', width: 2.4 }], shade: [{ fn: '2*sin(pi*x)^2', from: 0, to: r6(f), color: 'gold', alpha: 0.45 }] }, caption: t`The radial probability density $|u|^2$; the region $r < ${fmt(f, 3)}\,a$ is shaded.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: f ** 3, feedback: t`That is the volume fraction. Probability per unit radius is $|u|^2 = r^2|R|^2$, already including the $4\pi r^2$ growth of shells.` }, { value: f, feedback: t`$|u|^2$ is not uniform: integrate $\tfrac{2}{a}\sin^2(\pi r/a)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$P = \dfrac{2}{a}\displaystyle\int_0^{fa}\sin^2\frac{\pi r}{a}\,dr$.`, t`$\int_0^{fa}\sin^2(\pi r/a)\,dr = \tfrac{a}{2}\Big(f - \tfrac{\sin 2\pi f}{2\pi}\Big)$.`],
          teach: 'The radial probability is |u|² dr, which already counts the area 4πr² of each shell.',
          explain: t`$P = f - \sin(2\pi f)/2\pi = ${fmt(ans, 4)}$ with $f = ${fmt(f, 4)}$ — far more than the volume fraction $${fmt(f ** 3, 3)}$: $|\psi|^2 = \sin^2(\pi r/a)/(2\pi a r^2)$ is largest at the centre.`,
        };
      },
    }),
    num({
      id: 'p-level', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 1.5, 2, 3]);
        const ans = Z11 ** 2 * HB2M_EVNM2 / (a * a);
        return {
          prompt: t`For an electron in a spherical box of radius $${a}$ nm, the lowest $l = 1$ state has $u = r\,j_1(kr)$ with $j_1(x) = \dfrac{\sin x}{x^2} - \dfrac{\cos x}{x}$, and the wall demands $j_1(ka) = 0$, i.e. $\tan x = x$. The plot shows both sides of that equation. What is the state’s energy, in eV?`,
          visual: { type: 'graph', params: { x: [0, 7.5], y: [-4, 10], aspect: 'wide', xlabel: 'x = ka', ylabel: '', xticks: 7, yticks: 3, axesAt: 'edge', curves: [{ fn: 'tan(x)', color: 'accent', width: 2.2, samples: 3000 }, { fn: 'x', color: 'gold', width: 2.2 }], vlines: [{ x: r6(Math.PI / 2), color: 'ink4' }, { x: r6(1.5 * Math.PI), color: 'ink4' }], legend: [{ label: 'tan x', color: 'accent' }, { label: 'x', color: 'gold' }], legendAt: 'tl' }, caption: 'The two sides of tan x = x. Their first crossing after x = 0 is the root needed; asymptotes are dotted.' },
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: Math.PI ** 2 * HB2M_EVNM2 / (a * a), feedback: t`That is the $l = 0$ ground state. For $l = 1$ the root of $\tan x = x$ is near 4.49, not $\pi$.` }, { value: (1.5 * Math.PI) ** 2 * HB2M_EVNM2 / (a * a), feedback: t`$3\pi/2$ is an asymptote of $\tan x$; the crossing is a little below it.` }],
          hints: [t`The first nonzero crossing of $\tan x$ and $x$ is just below $3\pi/2 \approx 4.71$; it is $x \approx 4.493$.`, t`$E = \dfrac{\hbar^2}{2m_e}\Big(\dfrac{4.493}{a}\Big)^2$ with $\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}$ eV nm².`],
          teach: 'For l > 0 the radial solutions are spherical Bessel functions, and the energies come from their zeros.',
          explain: t`$ka = ${fmt(Z11, 5)}$, so $E = ${fmt(HB2M_EVNM2, 5)}\times(${fmt(Z11, 4)}/${a})^2 = ${fmt(ans, 4)}$ eV: $${fmt((Z11 / Z10) ** 2, 4)}$ times the $l = 0$ ground state. It is threefold degenerate ($m = -1, 0, 1$).`,
        };
      },
    }),
    order({
      id: 'separate', difficulty: 2,
      prompt: t`Put the steps of separating the Schrödinger equation for a central potential in order.`,
      visual: veffPic(2, -1.5, t`The end point: a one-dimensional problem in $r$ with an effective potential (here hydrogen’s, $l = 2$).`),
      items: [
        t`Write $\nabla^2$ in spherical coordinates`,
        t`Try $\psi = R(r)\,Y(\theta, \phi)$ and divide by $RY$`,
        t`Set the angular part equal to $-l(l+1)$, the separation constant`,
        t`Substitute $u = rR$ in the radial part`,
        t`Solve a 1D problem with $V_{\text{eff}} = V + \hbar^2l(l+1)/2mr^2$ and $u(0) = 0$`,
      ],
      hints: ['The separation constant can only be named after the equation has been split into an r part and an angle part.', 'u = rR is the substitution that turns the radial derivative into a plain second derivative.'],
      teach: 'Separation in spherical coordinates turns a 3D problem into a fixed angular problem plus a 1D radial one.',
      explain: t`Dividing by $RY$ leaves one side depending only on $r$ and the other only on angles, so both equal a constant, written $l(l+1)$. The angular equation is the same for every $V(r)$; the radial one, in $u = rR$, is where $V$ enters.`,
    }),
    mcq({
      id: 'm-free', difficulty: 2,
      prompt: t`Why does the energy of a particle in any central potential depend on $l$ but not on $m$?`,
      visual: veffPic(1, -2, t`The effective potential for $l = 1$. It is the same curve for $m = -1$, $0$ and $+1$.`),
      choices: [
        t`$m$ appears only in the angular equation; the radial equation, which fixes $E$, contains $l$ alone`,
        t`States with different $m$ have the same energy only by accident`,
        t`Because $m$ is always zero for bound states`,
        t`Because $L_z$ is not conserved in a central potential`,
      ],
      answer: 0,
      why: {
        1: t`It is no accident: rotating the system changes $m$ but cannot change the energy of a rotationally symmetric problem.`,
        2: t`$m$ runs from $-l$ to $l$; bound p, d … states have $m \ne 0$ too.`,
        3: t`Every component of $\vec L$ is conserved in a central potential.`,
      },
      hints: ['Look at the radial equation: which quantum numbers appear in it?'],
      teach: 'Spherical symmetry makes every central-potential level (2l + 1)-fold degenerate in m.',
      explain: t`The radial equation contains $l(l+1)$ but not $m$, so each solution serves all $2l + 1$ values of $m$. Physically: $m$ says how the angular momentum is oriented, and a spherically symmetric potential has no preferred orientation. A magnetic field breaks that symmetry and splits the levels (the Zeeman effect).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-origin', difficulty: 2,
      prompt: t`Near the origin the regular solution of the radial equation behaves as $R(r) \propto r^l$. Which states have a nonzero probability density $|\psi|^2$ **at** the nucleus?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'r (small, arbitrary units)', ylabel: 'R(r) (scaled)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: '1 - 0.3*x', color: 'accent', width: 2.4 }, { fn: 'x', color: 'violet', width: 2.2, dash: [6, 4] }, { fn: 'x^2', color: 'gold', width: 2.2, dash: [2, 3] }], legend: [{ label: 'l = 0', color: 'accent' }, { label: 'l = 1', color: 'violet', dash: [6, 4] }, { label: 'l = 2', color: 'gold', dash: [2, 3] }], legendAt: 'tl' }, caption: 'The radial function near the origin for l = 0, 1, 2. Schematic shapes.' },
      choices: [t`Only $l = 0$ (s) states`, t`All states, since $u(0) = 0$ only for $l > 0$`, t`No states: $u(0) = 0$ for every $l$`, t`Only states with $m = 0$`],
      answer: 0,
      why: {
        1: t`$u(0) = 0$ for every $l$, but $R = u/r$ tends to a constant when $l = 0$.`,
        2: t`$u = rR$ vanishes there, but $|\psi|^2 = |R|^2|Y|^2$, and $R(0) \ne 0$ for s states.`,
        3: t`$m$ is irrelevant to the radial behaviour; $l$ sets it.`,
      },
      hints: [t`$|\psi(0)|^2 \propto |R(0)|^2$. What is $r^l$ at $r = 0$?`],
      teach: 'Only s states reach the nucleus — which is why only they feel the nuclear contact interactions.',
      explain: t`$R \propto r^l$ is nonzero at the origin only for $l = 0$. That single fact explains why electron capture by nuclei, the Fermi contact hyperfine splitting (the 21 cm line) and the isotope field shift all involve s electrons.`,
    }),
    num({
      id: 'cp-dot', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1.5, 2, 2.5, 3]);
        const ans = Math.PI ** 2 * HB2M_EVNM2 / (a * a) * (1 / 0.13 + 1 / 0.45);
        return {
          prompt: t`The colour of a CdSe quantum dot — the emitters in quantum-dot displays — is set by confinement. Model the electron and the hole each as a particle in a sphere of radius $a = ${a}$ nm, with effective masses $0.13\,m_e$ and $0.45\,m_e$. By how much, in eV, does confinement raise the photon energy above the bulk gap (each particle in its $l = 0$ ground state)?`,
          visual: { type: 'graph', params: { x: [1, 4], y: [0, 3], aspect: 'wide', xlabel: 'dot radius a (nm)', ylabel: 'confinement energy (eV)', xticks: 6, yticks: 3, axesAt: 'edge', curves: [{ fn: `${r6(Math.PI ** 2 * HB2M_EVNM2 * (1 / 0.13 + 1 / 0.45))}/x^2`, color: 'accent', width: 2.4 }] }, caption: 'The model’s confinement energy against radius: it grows as 1/a². The model ignores the electron–hole attraction, which lowers the energy by a few tenths of an eV in real dots.' },
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: Math.PI ** 2 * HB2M_EVNM2 / (a * a) / 0.13, feedback: 'Both the electron and the hole are confined: add the hole’s ground-state energy too.' }, { value: Math.PI ** 2 * HB2M_EVNM2 / (a * a), feedback: t`Use the effective masses: $E \propto 1/m^*$, so divide by 0.13 and by 0.45.` }],
          hints: [t`Each particle: $E = \dfrac{\pi^2\hbar^2}{2m^*a^2}$ $= \dfrac{\pi^2}{a^2}\cdot\dfrac{\hbar^2}{2m_e}\cdot\dfrac{m_e}{m^*}$.`, t`Total: $\dfrac{\pi^2\hbar^2}{2m_ea^2}\Big(\dfrac{1}{0.13} + \dfrac{1}{0.45}\Big)$ with $\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}$ eV nm².`],
          teach: 'A quantum dot is a particle in a sphere: its confinement energy grows as 1/a², so smaller dots glow bluer.',
          explain: t`$\pi^2\times${fmt(HB2M_EVNM2, 5)}/${a}^2\times(${fmt(1 / 0.13, 4)} + ${fmt(1 / 0.45, 4)}) = ${fmt(ans, 3)}$ eV above the 1.74 eV bulk gap. This particle-in-a-sphere (Brus) estimate overshoots measured dots: the electron–hole Coulomb attraction, the finite barrier at the surface and the non-parabolic bands all lower it. The $1/a^2$ trend is right.`,
        };
      },
    }),
    mcq({
      id: 'cp-order', difficulty: 3,
      prompt: t`In an infinite spherical well, the energy of each level is set by a zero of a spherical Bessel function: $ka = \pi$ (1s), $4.493$ (1p), $5.763$ (1d), $2\pi$ (2s), $6.988$ (1f). Counting each $m$ as a separate state, how many states lie below the 2s level?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 52], aspect: 'wide', xlabel: '', ylabel: '(ka)²', xticks: 0, yticks: 4, axesAt: 'edge', curves: [[Z10, 's'], [Z11, 'p'], [Z12, 'd'], [Z20, 's'], [Z13, 'f']].map(([z], k) => seg(0.4 + (k % 2) * 0.1, z * z, 3.4, z * z, ['accent', 'violet', 'gold', 'accent', 'teal'][k], 2.6)), points: [[Z10, '1s'], [Z11, '1p'], [Z12, '1d'], [Z20, '2s'], [Z13, '1f']].map(([z, n], k) => label(3.5, z * z, n, ['accent', 'violet', 'gold', 'accent', 'teal'][k], 4, 0)) }, caption: 'The levels of the spherical well, to scale in (ka)², which is proportional to energy.' },
      choices: ['9', '3', '18', '4'],
      answer: 0,
      why: {
        1: t`That counts levels (1s, 1p, 1d), not states: each has $2l + 1$ values of $m$.`,
        2: t`Counting spin doubles it; the question counts orbital states only.`,
        3: t`1d ($ka = 5.763$) also lies below 2s ($ka = 2\pi = 6.283$).`,
      },
      hints: ['Below 2s lie 1s, 1p and 1d.', 'Each level holds 2l + 1 states: 1 + 3 + 5.'],
      teach: 'Each central-potential level with angular momentum l holds 2l + 1 states, one for each m.',
      explain: t`1s (1) + 1p (3) + 1d (5) = 9. With two spin states each, 18 — and 2s fills to 20. The numbers 2, 8, 20 are the first “magic numbers” of nuclei; beyond 20 the real nuclear sequence needs spin–orbit coupling.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Brus, “Electron–electron and electron–hole interactions in small semiconductor crystallites”, J. Chem. Phys. 80, 4403 (1984)', url: 'https://doi.org/10.1063/1.447218' },
  ],
});
