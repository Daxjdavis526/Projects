// Disks, spheres and special functions: separating in polar and spherical
// coordinates. Periodicity makes m an integer; Bessel's equation gives the
// radial shapes; boundedness keeps J_m and drops Y_m; the rim condition picks
// the zeros j_mn — computed here, never typed. Inharmonic drum overtones;
// Laplace in a disk (r^n cos nθ) and a ball (r^ℓ P_ℓ), Earth's J2 outside.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { besselZero, modeList } from '../../src/viz/model/pde2-membrane.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const r4 = (x) => +x.toPrecision(4);
const disk = (params, caption) => ({ type: 'pde2-membrane', params: { shape: 'disk', readout: false, ...params }, caption });
const j01 = besselZero(0, 1), j11 = besselZero(1, 1), j21 = besselZero(2, 1), j02 = besselZero(0, 2);
// worked example: a 14-inch drumhead of 0.25 mm polyester film (ρ = 1390 kg/m³), tension 2500 N/m
const WE = { a: 0.178, sigma: 1390 * 0.25e-3, T: 2500 };
WE.c = Math.sqrt(WE.T / WE.sigma);
WE.f = (m, n) => (WE.c * besselZero(m, n)) / (2 * Math.PI * WE.a);
// distinct ideal-drum frequencies below 3× the fundamental (counting the fundamental)
const below3 = modeList('disk', 30).filter((o) => o.ratio < 3).length;
const EARTH = { J2: 1.08263e-3, R: 6378.137 };    // EGM2008 J2; equatorial radius (km)

export default lesson({
  id: 'st-b.B7.3',
  title: 'Disks, spheres and special functions',
  minutes: 16, difficulty: 4,
  intro: t`On a disk the natural coordinates are polar, and the Laplacian becomes $\nabla^2u = u_{rr} + \tfrac1r u_r + \tfrac{1}{r^2}u_{\theta\theta}$ (Advanced Math A, lesson A9.1). Separate the drumhead $u_{tt} = c^2\nabla^2u$ as $u = R(r)\,\Theta(\theta)\,T(t)$. The angle gives $\Theta = \cos m\theta$ or $\sin m\theta$, and going once round must bring you back, so **$m$ is a whole number**. The radius gives **Bessel’s equation**, $r^2R'' + rR' + (k^2r^2 - m^2)R = 0$, whose solution finite at the centre is $J_m(kr)$. A rim fixed at $r = a$ needs $J_m(ka) = 0$:

$$\omega_{mn} = \frac{c\,j_{mn}}{a},$$

where $j_{mn}$ is the $n$-th zero of $J_m$. Those zeros are not evenly spaced and not whole-number multiples of each other — so a drum’s overtones are **inharmonic**. On a ball, the same separation in spherical coordinates produces Legendre polynomials and spherical harmonics.`,
  symbols: [
    { tex: t`J_m`, text: 'the Bessel function of the first kind, of integer order $m$: an oscillation that fades like $1/\\sqrt{r}$ — the radial shape of a drum mode' },
    { tex: t`j_{mn}`, text: 'the $n$-th positive zero of $J_m$ (a pure number): $j_{01} \\approx 2.405$, $j_{11} \\approx 3.832$. Computed numerically in this lesson, as in the simulation' },
    { tex: 'm', text: 'the angular number: the mode has $m$ nodal diameters' },
    { tex: 'n', text: 'the radial number: $n - 1$ nodal circles inside the rim' },
    { tex: 'a', text: 'the drum’s radius (m)' },
    { tex: 'c', text: 'the membrane’s wave speed $\\sqrt{T/\\sigma}$ (m/s), as in lesson B7.2' },
  ],
  why: t`Separating perturbations of a star, or of a black hole, in spherical harmonics leaves one radial equation for each pair $(\ell, m)$ — the Regge–Wheeler and Zerilli equations. The ringdown frequencies LIGO measures after a merger are that problem’s eigenvalues, labelled exactly like a drum’s modes.`,
  visual: {
    type: 'pde2-membrane',
    title: 'The modes of a drumhead',
    lead: t`A circular membrane in one of its modes. Bold lines are nodal diameters and nodal circles. The ladder below places each mode at its frequency divided by the fundamental’s; dashed ticks mark 1×, 2×, 3×… — where a string’s overtones would be.`,
    tasks: [
      'm = 0, n = 1 is the fundamental: the whole head moves together. Raise n: nodal circles appear, at radii fixed by the zeros of J₀.',
      'Raise m: m nodal diameters. (1, 1) sounds at 1.593 times the fundamental — nowhere near 2×.',
      'Turn on the 3D view and play: the (1, 1) mode rocks like a seesaw; (0, 2) breathes in and out with its centre and rim ring opposite.',
    ],
    params: { shape: 'disk', m: 1, n: 1, count: 10, controls: ['m', 'n'] },
    caption: t`An ideal membrane: uniform tension, no stiffness, no air loading, small amplitude. Each $m \ge 1$ stands for two modes (cosine and sine), turned by $90°/m$. The zeros $j_{mn}$ are computed by bisection on $J_m$. Animation slowed down.`,
  },
  example: {
    prompt: t`A drumhead of radius ${WE.a * 100} cm is a polyester film 0.25 mm thick (density 1390 kg/m³), tensioned to ${WE.T} N/m. Find its fundamental and its next three frequencies, and compare them with a string’s harmonics.`,
    visual: disk({ m: 0, n: 2, ladder: true, readout: true, hide: [] }, t`The $(0, 2)$ mode — one nodal circle at $r = (j_{01}/j_{02})\,a \approx 0.436a$ — and the ideal drum’s frequency ladder.`),
    steps: [
      { label: 'Separate the angle', text: t`$\Theta'' + m^2\Theta = 0$ with $\Theta(\theta + 2\pi) = \Theta(\theta)$: $\Theta = \cos m\theta, \sin m\theta$ with $m = 0, 1, 2, \dots$` },
      { label: 'Separate the radius', text: t`$r^2R'' + rR' + (k^2r^2 - m^2)R = 0$, Bessel’s equation in $kr$. Its second solution $Y_m$ is infinite at $r = 0$, which a drumhead cannot be, so $R = J_m(kr)$ (MATH 2280, lesson DE-7.2, built these from series).` },
      { label: 'Fix the rim', text: t`$J_m(ka) = 0$, so $k = j_{mn}/a$ and $\omega_{mn} = c\,j_{mn}/a$. Computed: $j_{01} = ${r4(j01)}$, $j_{11} = ${r4(j11)}$, $j_{21} = ${r4(j21)}$, $j_{02} = ${r4(j02)}$.` },
      { label: 'Wave speed', text: t`$\sigma = 1390 \times 0.25\times10^{-3} = ${r3(WE.sigma)}\ \text{kg/m}^2$, so $c = \sqrt{${WE.T}/${r3(WE.sigma)}} = ${r3(WE.c)}$ m/s.` },
      { label: 'Frequencies', text: t`$f_{mn} = \dfrac{c\,j_{mn}}{2\pi a}$: $f_{01} = ${r3(WE.f(0, 1))}$ Hz, $f_{11} = ${r3(WE.f(1, 1))}$ Hz, $f_{21} = ${r3(WE.f(2, 1))}$ Hz, $f_{02} = ${r3(WE.f(0, 2))}$ Hz.` },
      { label: 'Compare', text: t`Ratios $1 : ${r4(j11 / j01)} : ${r4(j21 / j01)} : ${r4(j02 / j01)}$, against a string’s $1 : 2 : 3 : 4$. No overtone sits on a harmonic, so the ear hears a thud with a pitch, not a note.` },
      { label: 'Honesty', text: t`Real drums are not ideal: the air above and below a head lowers its modes, by different amounts. Kettledrums use their sealed bowl to pull $(1,1)$, $(2,1)$ and $(3,1)$ close to the ratios 2 : 3 : 4 and give a clear pitch; the $(0, n)$ modes, which push air in and out, die quickly.` },
    ],
    answer: t`$f \approx ${r3(WE.f(0, 1))}$, ${r3(WE.f(1, 1))}, ${r3(WE.f(2, 1))} and ${r3(WE.f(0, 2))} Hz, in the ratios $1 : 1.593 : 2.136 : 2.295$ — inharmonic, unlike a string’s $1 : 2 : 3 : 4$.`,
  },
  practice: [
    mcq({
      id: 'integer-m', difficulty: 2,
      prompt: t`Separating on a disk gives $\Theta'' + \mu\,\Theta = 0$ for the angular factor. Why must $\mu = m^2$ with $m$ a whole number?`,
      visual: { type: 'graph', params: { x: [0, 7.6], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'Θ', axesAt: 'edge', curves: [{ fn: 'cos(2*x)', color: 'accent', width: 2.2, label: 'm = 2: closes up', labelAt: 5.2, labelDy: -14 }, { fn: 'cos(1.5*x)', color: 'warn', width: 1.8, dash: [5, 4], label: 'm = 1.5: does not', labelAt: 5.9, labelDy: 18 }], vlines: [{ x: 6.2832, label: '2π', color: 'gold' }] }, caption: t`Going once round the drum, $\theta \to \theta + 2\pi$ is the same point: the angular factor must repeat.` },
      choices: [t`$\theta$ and $\theta + 2\pi$ are the same point, so $\Theta$ must have period $2\pi$`, 'The rim condition forces it', 'Bessel’s equation only has solutions for whole-number orders', 'Because sines and cosines are only defined for whole numbers'],
      answer: 0,
      why: {
        1: t`The rim condition $R(a) = 0$ acts on the radial factor and picks $k$; it says nothing about the angle.`,
        2: 'Bessel functions exist for any order; the angle, not the radial equation, makes the order a whole number.',
        3: t`$\cos(1.5\theta)$ is perfectly defined — it just fails to come back to its starting value after one turn.`,
      },
      hints: ['What happens to the displacement if you walk once around the centre?'],
      teach: 'Periodicity in the angle quantizes the angular number: m = 0, 1, 2, …',
      explain: t`$\Theta = \cos(\sqrt\mu\,\theta)$ returns to itself after $2\pi$ only if $\sqrt\mu$ is a whole number $m$. (The same argument quantizes angular momentum in quantum mechanics: $e^{im\phi}$ must be single-valued.)`,
    }),
    mcq({
      id: 'read-disk-mode', difficulty: 1,
      prompt: t`The picture shows a mode $J_m(j_{mn}r/a)\cos m\theta$ of a drumhead, seen from above. What are $m$ and $n$?`,
      visual: disk({ m: 2, n: 2, ladder: false }, 'Shading: blue up, orange down. Bold lines: nodal lines; the outer circle is the fixed rim.'),
      choices: ['m = 2, n = 2', 'm = 2, n = 1', 'm = 4, n = 2', 'm = 1, n = 2'],
      answer: 0,
      why: {
        1: 'n counts the zero on the rim as well: one interior nodal circle means n = 2.',
        2: 'You counted four straight segments from the centre; they make only two full diameters, so m = 2.',
        3: 'Count the straight nodal lines through the centre: there are two.',
      },
      hints: ['m = number of nodal diameters (full straight lines through the centre).', 'n − 1 = number of nodal circles inside the rim.'],
      teach: 'Disk mode (m, n): m nodal diameters, n − 1 interior nodal circles (the rim is the n-th zero).',
      explain: t`Two diameters cross at the centre ($m = 2$) and one circle lies inside the rim ($n - 1 = 1$, so $n = 2$): the $(2, 2)$ mode, at ${r4(besselZero(2, 2) / j01)} times the fundamental.`,
    }),
    num({
      id: 'nodal-circle', difficulty: 2,
      gen(r) {
        const m = r.pick([0, 1, 2]), a = r.pick([15, 20, 30]);
        const rc = (a * besselZero(m, 1)) / besselZero(m, 2);
        return {
          prompt: t`A drumhead of radius ${a} cm vibrates in its $(${m}, 2)$ mode, with shape $J_{${m}}(j_{${m}2}\,r/a)${m === 0 ? '' : m === 1 ? '\\cos\\theta' : `\\cos ${m}\\theta`}$. At what radius is its nodal circle, in cm? (Use $j_{${m}1} = ${r4(besselZero(m, 1))}$ and $j_{${m}2} = ${r4(besselZero(m, 2))}$.)`,
          visual: disk({ m, n: 2, ladder: false }, `The (${m}, 2) mode from above.`),
          answer: rc, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: a / 2, feedback: 'The nodal circle is not halfway out: Bessel zeros are not evenly spaced from the centre.' }, { value: (a * besselZero(m, 2)) / besselZero(m, 1), feedback: t`Invert the ratio: the circle is where $j_{${m}2}r/a = j_{${m}1}$.` }],
          hints: [t`The shape vanishes inside where its argument hits the first zero: $j_{${m}2}\,r/a = j_{${m}1}$.`, t`$r = a\,j_{${m}1}/j_{${m}2}$.`],
          teach: 'Interior nodal circles sit where the radial Bessel factor passes through its earlier zeros.',
          explain: t`$r = ${a}\times\dfrac{${r4(besselZero(m, 1))}}{${r4(besselZero(m, 2))}} = ${r3(rc)}$ cm.`,
        };
      },
    }),
    num({
      id: 'drum-fundamental', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.15, 0.2, 0.3]), T = r.pick([1000, 2000, 4000]), s = r.pick([0.2, 0.3, 0.5]);
        const c = Math.sqrt(T / s), f = (c * j01) / (2 * Math.PI * a);
        return {
          prompt: t`A circular membrane of radius ${a * 100} cm has tension ${T} N/m and areal density ${s} kg/m². What is its fundamental frequency, in Hz?`,
          visual: disk({ m: 0, n: 1, ladder: false }, 'The fundamental (0, 1): the whole head moves together, with no interior nodal lines.'),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (c * Math.PI) / (2 * Math.PI * a), feedback: t`That uses $\pi$, the string’s first zero. The disk’s fundamental uses the first zero of $J_0$, $j_{01} \approx 2.405$.` }, { value: (c * j01) / a, feedback: t`That is $\omega$ in rad/s; divide by $2\pi$.` }],
          hints: [t`$c = \sqrt{T/\sigma}$; $f_{01} = \dfrac{c\,j_{01}}{2\pi a}$.`, t`$j_{01} \approx ${r4(j01)}$.`],
          teach: 'Drum fundamental: f = c j₀₁/(2πa), with j₀₁ ≈ 2.405.',
          explain: t`$c = \sqrt{${T}/${s}} = ${r3(c)}$ m/s, so $f_{01} = \dfrac{${r3(c)}\times${r4(j01)}}{2\pi\times${a}} = ${r3(f)}$ Hz.`,
        };
      },
    }),
    num({
      id: 'disk-laplace', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]), A = r.pick([10, 20, 40]), q = r.pick([0.5, 0.25]);
        const val = A * q ** n;
        return {
          prompt: t`The rim of a thin disk of radius $a$ is held at the temperature $u(a, \theta) = ${A}\cos ${n === 1 ? '' : n}\theta$ (°C above ambient). What is the steady temperature at $r = ${q}a$, $\theta = 0$, in °C?`,
          visual: { type: 'c3-contour', params: { f: `${A}*(x^2 + y^2)^(${n}/2)*cos(${n}*atan2(y, x))*(1 + 0*sqrt(1 - x^2 - y^2))`, x: [-1.6, 1.6], y: [-1, 1], levels: 9, labels: false, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink', width: 2 }], points: [{ x: q, y: 0, color: 'gold' }] }, caption: 'The steady temperature in the disk (contours) and the point asked about (gold).' },
          answer: val, units: '°C', tol: { rel: 0.005 }, difference: true,
          errors: n === 1 ? [] : [{ value: A * q, feedback: t`The factor is $(r/a)^n$, not $r/a$: a pattern with $n$ wiggles round the rim fades as the $n$-th power.` }],
          hints: [t`In polar coordinates $r^n\cos n\theta$ is harmonic (it is the real part of $(x + iy)^n$).`, t`$u = ${A}(r/a)^{${n}}\cos ${n === 1 ? '' : n}\theta$ matches the rim.`],
          teach: 'Inside a disk, boundary data cos nθ spread inward as (r/a)ⁿ cos nθ: fine detail on the rim fades fast toward the centre.',
          explain: t`$u = ${A}(r/a)^{${n}}\cos ${n === 1 ? '' : n}\theta$, so at $r = ${q}a$, $\theta = 0$: $${A}\times${q}^{${n}} = ${r3(val)}$ °C. Note the centre is 0 — the average of the rim data, as lesson B5.1 demands.`,
        };
      },
    }),
    code({
      id: 'bessel-zeros', difficulty: 3,
      prompt: t`Compute the drum’s overtone ratios yourself. Write \`zeros(m, count)\` that returns the first \`count\` positive zeros of $J_m$ (\`scipy.special.jv\`), found by scanning $x$ from 0.1 in steps of 0.1 for sign changes and refining each with \`scipy.optimize.brentq\`. Then set \`ratios\` to the six lowest values of $j_{mn}/j_{01}$ over $m = 0 \dots 4$, $n = 1 \dots 3$, sorted.`,
      starter: t`import numpy as np
from scipy.special import jv, jn_zeros
from scipy.optimize import brentq

def zeros(m, count):
    found = []
    # scan x = 0.1, 0.2, ... for a sign change of jv(m, x); refine with brentq
    return found

ratios = None
print(ratios)
`,
      answer: t`import numpy as np
from scipy.special import jv, jn_zeros
from scipy.optimize import brentq

def zeros(m, count):
    found = []
    x = 0.1
    while len(found) < count:
        if jv(m, x) * jv(m, x + 0.1) < 0:
            found.append(brentq(lambda s: jv(m, s), x, x + 0.1))
        x += 0.1
    return found

j01 = zeros(0, 1)[0]
allz = [z for m in range(5) for z in zeros(m, 3)]
ratios = sorted(z / j01 for z in allz)[:6]
print(ratios)`,
      tests: [
        { name: t`$j_{01}$ agrees with \`scipy.special.jn_zeros\``, code: 'abs(zeros(0, 1)[0] - jn_zeros(0, 1)[0]) < 1e-9' },
        { name: t`the first three zeros of $J_2$ are right`, code: 'np.allclose(zeros(2, 3), jn_zeros(2, 3), rtol=1e-9)' },
        { name: 'six ratios, starting at 1', code: 'ratios is not None and len(ratios) == 6 and abs(ratios[0] - 1) < 1e-12' },
        { name: 'they are 1, 1.593, 2.136, 2.295, 2.653, 2.917', code: 'ratios is not None and np.allclose(ratios, [1, 1.5933, 2.1355, 2.2954, 2.6531, 2.9173], atol=1e-4)' },
      ],
      hints: ['Inside `zeros`, loop while `len(found) < count`, test `jv(m, x) * jv(m, x + 0.1) < 0`, and step x by 0.1.', 'Refine with `brentq(lambda s: jv(m, s), x, x + 0.1)`.', 'Collect zeros(m, 3) for m in range(5), divide by j01 = zeros(0, 1)[0], sort, keep the first six.'],
      teach: 'Special-function zeros are found like any root: bracket a sign change, then refine.',
      explain: t`The ratios $1, 1.593, 2.136, 2.295, 2.653, 2.917$ match lesson B7.3’s ladder. Scanning in steps of 0.1 is safe because consecutive zeros of $J_m$ are about $\pi$ apart; the first zero of $J_m$ lies beyond $x = m$, so $J_m$ has no zeros to miss near the origin.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-j2', difficulty: 3, transfer: true,
      gen(r) {
        const orb = r.pick([['a satellite in low Earth orbit, 400 km above the equator', EARTH.R + 400], ['a GPS satellite, 20 200 km up', EARTH.R + 20200], ['a geostationary satellite, 42 164 km from Earth’s centre', 42164]]);
        const rel = EARTH.J2 * (EARTH.R / orb[1]) ** 2 * 0.5;
        return {
          prompt: t`Outside Earth its potential is harmonic, and the biggest correction to $-GM/r$ comes from its equatorial bulge:
$$\Phi = -\frac{GM}{r}\Big[1 - J_2\Big(\frac{R}{r}\Big)^2P_2(\cos\theta)\Big], \qquad P_2(x) = \tfrac12(3x^2 - 1),$$
with $J_2 = ${tex(EARTH.J2)}$ and $R = ${EARTH.R}$ km. For ${orb[0]} (in the equatorial plane, $\theta = 90°$), how large is the $J_2$ term relative to the main term, $J_2(R/r)^2|P_2(0)|$?`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.2, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: '1 - 0.08*(3*sin(theta)^2 - 1)/2', theta: [0, 6.2832], color: 'accent', width: 2.4 }, { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [4, 4] }], points: [{ x: 1.6, y: 0, label: 'satellite', color: 'gold', labelDx: -30, labelDy: -14 }] }, caption: 'An oblate Earth (flattening exaggerated about 25-fold; dashed: a sphere) and a satellite in its equatorial plane, not to scale.' },
          answer: rel, tol: { rel: 0.01 },
          errors: [{ value: rel * 2, feedback: t`$P_2(\cos 90°) = P_2(0) = -\tfrac12$: include the factor $\tfrac12$.` }, { value: EARTH.J2 * (EARTH.R / orb[1]) ** 3 * 0.5, feedback: t`Relative to $GM/r$, the term carries $(R/r)^2$; the potential term itself falls as $r^{-3}$.` }],
          hints: [t`$P_2(0) = \tfrac12(0 - 1) = -\tfrac12$.`, t`Compute $J_2(R/r)^2/2$ with $r$ measured from Earth’s centre.`],
          teach: 'Each multipole of an exterior harmonic potential fades as (R/r)^(ℓ+1): the bulge (ℓ = 2) matters most for low orbits.',
          explain: t`$J_2(R/r)^2/2 = ${tex(EARTH.J2)}\times(${EARTH.R}/${r3(orb[1])})^2/2 = ${tex(rel)}$. Small, but it makes low orbits precess by several degrees a day — the effect sun-synchronous orbits are designed around. Each term $r^{-(\ell+1)}P_\ell(\cos\theta)$ is a separated solution of Laplace’s equation in spherical coordinates.`,
        };
      },
    }),
    num({
      id: 'cp-count-modes', difficulty: 2,
      prompt: t`For an ideal circular drum, how many **distinct** mode frequencies lie below three times the fundamental, counting the fundamental itself? (A frequency is below $3f_{01}$ when $j_{mn} < 3j_{01} \approx ${r4(3 * j01)}$.)`,
      visual: { type: 'graph', params: { x: [0, 8], y: [-0.6, 1.05], aspect: 'wide', xlabel: 'x', ylabel: 'Jₘ(x)', axesAt: 'edge', curves: [0, 1, 2, 3, 4].map((m, i) => ({ fn: `besselj(${m}, x)`, color: ['accent', 'warn', 'teal', 'violet', 'gold'][i], width: 1.8, label: `J${'₀₁₂₃₄'[m]}`, labelAt: [0.6, 1.6, 2.9, 4.2, 5.6][i], labelDy: -10 })), vlines: [{ x: 3 * j01, label: '3 j₀₁', color: 'ink2' }] }, caption: 'J₀ to J₄: each positive zero to the left of the line is a mode below 3× the fundamental.' },
      answer: below3, tol: { rel: 0, abs: 0.5 },
      hints: ['Count the zeros of J₀, J₁, J₂, J₃, J₄ to the left of the line (x = 0 is not a zero that counts: only positive zeros where the curve crosses).', 'J₀ has two, J₁ two, J₂ one, J₃ one, J₄ none (its first zero is at 7.59).'],
      teach: 'In 2D, modes crowd together: an ideal drum has six distinct frequencies below 3× its fundamental, a string two.',
      explain: t`$j_{01} = 2.405$, $j_{11} = 3.832$, $j_{21} = 5.136$, $j_{02} = 5.520$, $j_{31} = 6.380$, $j_{12} = 7.016$ lie below ${r4(3 * j01)}; $j_{41} = 7.588$ does not. ${below3} distinct frequencies — and the $m \ge 1$ ones each belong to two modes. A string has only $f_1$ and $2f_1$ below $3f_1$.`,
    }),
    mcq({
      id: 'cp-ringdown', difficulty: 2, transfer: true,
      prompt: t`A newly formed black hole “rings down” in a set of damped modes labelled by whole numbers $\ell$ and $m$ (plus an overtone number). Where do those labels come from?`,
      visual: { type: 'graph', params: { x: [0, 30], y: [-1.1, 1.1], aspect: 'wide', xlabel: 't (in units of GM/c³, illustrative)', ylabel: 'strain (scaled)', axesAt: 'edge', curves: [{ fn: 'e^(-0.089*x)*cos(0.3737*x)', color: 'accent', width: 2.2 }] }, caption: 'A damped sinusoid like the dominant ℓ = m = 2 ringdown mode (frequency and damping illustrative of a non-spinning hole: ωM ≈ 0.37 − 0.089i in units G = c = 1).' },
      choices: ['From separating the perturbation equations in spherical harmonics: ℓ and m label the angular pattern, as m and n label a drum’s', 'From the number of black holes that merged', 'They count orbits made before the merger', 'They are quantum numbers: the ringdown is a quantum effect'],
      answer: 0,
      why: {
        1: 'Two black holes merge into one; the labels describe how the final hole’s geometry oscillates.',
        2: 'The orbital phase is over by the ringdown; the modes belong to the final black hole alone.',
        3: 'The ringdown is classical general relativity. The integers come from the same periodicity argument as the drum’s m — no ħ anywhere.',
      },
      hints: ['Think of how the drum’s m arose: a periodic angle forced a whole number.'],
      teach: 'Separation in spherical coordinates turns angular dependence into spherical harmonics labelled by whole numbers ℓ and m.',
      explain: t`Perturbations of a black hole separate into spherical harmonics $Y_{\ell m}(\theta, \phi)$ times a radial function obeying one ODE per $\ell$ (the Regge–Wheeler or Zerilli equation, or Teukolsky’s for spinning holes). Requiring waves only to fall in at the horizon and only to leave at infinity selects complex frequencies — damped modes — just as a fixed rim selects a drum’s $j_{mn}$.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'NIST Digital Library of Mathematical Functions, §10.21 (zeros of Bessel functions)', url: 'https://dlmf.nist.gov/10.21' }, { label: 'N. H. Fletcher & T. D. Rossing, The Physics of Musical Instruments, 2nd ed. (Springer, 1998), ch. 18 (drums)', url: 'https://doi.org/10.1007/978-0-387-21603-4' }, { label: 'E. Berti, V. Cardoso & A. O. Starinets, Quasinormal modes of black holes and black branes, Class. Quantum Grav. 26, 163001 (2009)', url: 'https://arxiv.org/abs/0905.2975' }],
});
