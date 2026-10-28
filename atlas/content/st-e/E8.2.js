// Vibrating drums — the ones a full disk cannot model: an annular membrane
// (a drum with a rigid hub) and the cross-section of a coaxial line. Both Jₘ
// and Yₘ stay; two rims give a 2 × 2 determinant, the cross-product equation
// Jₘ(ka)Yₘ(kb) − Jₘ(kb)Yₘ(ka) = 0 (TM, clamped) or its derivative version
// (TE, Neumann). Limits read off the Bessel asymptotics: a thin gap behaves
// like a string, k ≈ nπ/(b − a); a shrinking hub returns to the disk — fast
// for m ≥ 1, only logarithmically for m = 0. Overlaps: the full circular drum,
// its zeros and McMahon's formula are st-b B7.3 and phys3750 W8.2 (linked).
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { besselZero } from '../../src/viz/model/pde2-membrane.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
const ann = (params, caption) => ({ type: 'fa2-bessel', params: { mode: 'annulus', controls: false, readout: false, ...params }, caption });
const root = (m, q, n = 1, kind = 'D') => SF.annulusRoots(m, q, n, kind)[n - 1];
const C0 = 299792458;
const Q_HUB = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.001];
const EX = { a: 0.1, b: 0.3, c: 90 };                 // worked example: hub 10 cm, rim 30 cm, wave speed 90 m/s
const EXK = SF.annulusRoots(0, EX.a / EX.b, 2);

export default lesson({
  id: 'st-e.E8.2',
  title: 'Vibrating drums',
  minutes: 17, difficulty: 3,
  intro: t`The circular drum keeps only $J_m$ because $Y_m$ is infinite at the centre ([ST-B](#/lesson/st-b.B7.3), [PHYS 3750](#/lesson/phys3750.W8.2)). Clamp the membrane to a rigid **hub** of radius $a$ as well as to the rim at $b$ and the centre is no longer part of the drum: a mode $u = R(r)\cos m\theta\cos\omega t$ has $R = A\,J_m(kr) + B\,Y_m(kr)$, and the two conditions $R(a) = R(b) = 0$ have a nonzero solution $(A, B)$ only when their determinant vanishes:

$$J_m(ka)\,Y_m(kb) - J_m(kb)\,Y_m(ka) = 0, \qquad \omega = ck.$$

This **cross-product equation** has infinitely many roots $k_{m1} < k_{m2} < \cdots$ for each $m$ — the same Sturm–Liouville ladder as ever ([E5.2](#/lesson/st-e.E5.2)), now with weight $r$ on $[a, b]$. Exactly the same equation gives the cutoffs of TM modes in a **coaxial line** (the axial field $E_z$ vanishes on both conductors); TE modes need $\partial H_z/\partial r = 0$ instead, and use $J_m'$ and $Y_m'$. Nothing here has a closed form, but the large- and small-argument forms of [E8.1](#/lesson/st-e.E8.1) predict every limit.`,
  symbols: [
    { tex: 'a,\\ b', text: 'the hub (inner) and rim (outer) radii, in m' },
    { tex: 'k', text: 'the radial wavenumber, in m⁻¹; the roots $k_{mn}$ are the allowed values' },
    { tex: 'J_m,\\ Y_m', text: 'Bessel and Neumann functions of order $m$, the number of nodal diameters' },
    { tex: '\\omega', text: 'the angular frequency, in rad/s; $f = \\omega/2\\pi$' },
    { tex: 'c', text: 'the transverse wave speed $\\sqrt{T/\\sigma}$ (tension per length over areal density), in m/s' },
  ],
  why: t`Hubbed membranes, annular plates, the gap between a rocket engine’s injector face and chamber wall, coaxial cables and annular combustors all ring in cross-product modes; a coax’s first TE cutoff sets the highest frequency it can carry cleanly.`,
  visual: {
    type: 'fa2-bessel',
    title: 'A drum with a hole in it',
    lead: t`Above: one mode of a membrane clamped at $r = a$ and $r = b = 1$. Below: the cross-product (scaled by a positive factor so it stays readable) against $kb$; its roots, dotted, are the allowed wavenumbers, the gold one is drawn above. Dashed lines: the full disk’s $j_{mn}$ and the thin-gap estimate $n\pi/(1 - a/b)$.`,
    tasks: [
      'm = 0: slide the hub ratio from 0.9 down to 0.05. The roots track nπ/(1 − q) for a thin ring, but crawl only slowly toward the disk’s 2.405.',
      'Now m = 1: the first root reaches the disk value 3.832 by q ≈ 0.1 — the hub barely matters once the mode vanishes at the centre anyway.',
      'Pick root 2 or 3: each adds a nodal circle between the rims.',
    ],
    params: { mode: 'annulus', q: 0.4, m: 0, k: 1, kmax: 20, readout: true },
    caption: 'An ideal membrane clamped on both circles (b = 1). Shading: blue up, orange down; bold lines stay still. The lower curve is the cross-product of J and Y times a positive factor, so its zeros are exactly the allowed k.',
  },
  example: {
    prompt: t`A drum skin with wave speed $c = ${EX.c}$ m/s is clamped to a hub of radius $a = ${EX.a * 100}$ cm and a rim of radius $b = ${EX.b * 100}$ cm. Find its fundamental ($m = 0$) and first overtone of the same symmetry, and compare with the obvious estimates.`,
    visual: ann({ q: EX.a / EX.b, m: 0, k: 1, kmax: 16, readout: true }, 'The fundamental of the hubbed drum (a/b = 1/3) and the cross-product whose roots are kb.'),
    steps: [
      { label: 'Scale', text: t`Measure $k$ in units of $1/b$: the equation becomes $J_0(kb\,q)\,Y_0(kb) - J_0(kb)\,Y_0(kb\,q) = 0$ with $q = a/b = 1/3$.` },
      { label: 'Bracket and bisect', text: t`The scaled cross-product changes sign between $kb = 4.6$ and $4.7$; bisection gives $kb = ${r4(EXK[0])}$, and the next root is $${r4(EXK[1])}$.` },
      { label: 'Frequencies', text: t`$f = \dfrac{ck}{2\pi} = \dfrac{${EX.c}\times${r4(EXK[0])}}{2\pi\times${EX.b}} = ${r4((EX.c * EXK[0]) / (2 * PI * EX.b))}$ Hz, and the overtone $${r4((EX.c * EXK[1]) / (2 * PI * EX.b))}$ Hz — a ratio $${r4(EXK[1] / EXK[0])}$, close to 2.` },
      { label: 'String estimate', text: t`For large $kr$ both functions are cosines, and the determinant becomes $\sin\big(k(b - a)\big) \approx 0$: $kb \approx \dfrac{\pi}{1 - q} = ${r4(PI / (1 - EX.a / EX.b))}$, only $${r3((100 * (PI / (1 - EX.a / EX.b) - EXK[0])) / EXK[0])}\%$ high even for this fat ring.` },
      { label: 'Disk estimate', text: t`Without the hub, $kb = j_{0,1} = ${r4(besselZero(0, 1))}$: the hub nearly doubles the frequency. Clamping more of the membrane always raises the frequencies (a Rayleigh-quotient argument, [E5.2](#/lesson/st-e.E5.2)).` },
    ],
    answer: t`$kb = ${r4(EXK[0])}$ and $${r4(EXK[1])}$: $f_1 = ${r4((EX.c * EXK[0]) / (2 * PI * EX.b))}$ Hz, $f_2 = ${r4((EX.c * EXK[1]) / (2 * PI * EX.b))}$ Hz. A ring this wide already behaves almost like a string of length $b - a$; a disk would ring at $${r4((EX.c * besselZero(0, 1)) / (2 * PI * EX.b))}$ Hz.`,
  },
  practice: [
    num({
      id: 'freq', difficulty: 2,
      gen(r) {
        const q = r.pick([0.2, 0.3, 0.5]), m = r.int(0, 2), b = r.pick([0.15, 0.25, 0.4]), c = r.pick([60, 80, 110]);
        const kb = root(m, q), ans = (c * kb) / (2 * PI * b);
        return {
          prompt: t`An annular membrane with $a/b = ${q}$, $b = ${b}$ m and wave speed $c = ${c}$ m/s has its lowest $m = ${m}$ root at $kb = ${r4(kb)}$. What is that mode’s frequency, in Hz?`,
          visual: ann({ q, m, k: 1, panels: ['top'] }, `The lowest mode with m = ${m} on this annulus.`),
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: (c * kb) / b, feedback: t`That is $\omega$ in rad/s; divide by $2\pi$.` }, { value: (c * kb) / (2 * PI), feedback: t`$kb$ is dimensionless: divide by $b$ to get $k$ in m⁻¹.` }],
          hints: [t`$k = ${r4(kb)}/${b}$ m⁻¹ and $\omega = ck$.`, t`$f = \omega/2\pi$.`],
          teach: 'The roots come out in units of 1/b; frequency is c times k over 2π.',
          explain: t`$f = \dfrac{${c}\times${r4(kb)}}{2\pi\times${b}} = ${r4(ans)}$ Hz.`,
        };
      },
    }),
    order({
      id: 'derive', difficulty: 2,
      prompt: 'Put the derivation of the cross-product equation in order.',
      visual: ann({ q: 0.4, m: 2, k: 1, panels: ['top'] }, 'A mode with two nodal diameters on an annulus.'),
      items: [
        t`Separate: $u = R(r)\cos m\theta\cos\omega t$, so $R$ solves Bessel’s equation in $kr$ with $k = \omega/c$.`,
        t`Keep both solutions: $R = A\,J_m(kr) + B\,Y_m(kr)$ — the origin is not in the domain.`,
        t`Impose $R(a) = 0$ and $R(b) = 0$: two linear equations in $A$ and $B$.`,
        t`A nonzero $(A, B)$ needs a zero determinant: $J_m(ka)Y_m(kb) - J_m(kb)Y_m(ka) = 0$.`,
        t`Solve for the roots $k_{mn}$ numerically; each gives $\omega_{mn} = ck_{mn}$.`,
      ],
      hints: ['Separation first, then the general radial solution, then the boundary conditions.'],
      teach: 'Two boundary conditions on a two-constant solution give a determinant equation for the eigenvalues.',
      explain: 'This is the eigenvalue condition of a regular Sturm–Liouville problem on [a, b], written out: the determinant is zero exactly at the eigenvalues.',
    }),
    num({
      id: 'thin', difficulty: 2,
      gen(r) {
        const a = r.pick([0.22, 0.25, 0.28]), b = r.pick([0.34, 0.38]), c = r.pick([70, 100]);
        const ans = c / (2 * (b - a)), exact = (c * root(0, a / b)) / (2 * PI * b);
        return {
          prompt: t`A narrow annular membrane runs from $a = ${a}$ m to $b = ${b}$ m, with $c = ${c}$ m/s. Treat it as a string of length $b - a$ clamped at both ends to estimate its fundamental frequency.`,
          visual: ann({ q: a / b, m: 0, k: 1, kmax: Math.ceil(1.6 * PI / (1 - a / b)) }, 'A thin annulus: its m = 0 roots sit almost on the string estimates nπ/(1 − q) (violet dashed).'),
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: c / (b - a), feedback: t`A string clamped at both ends holds half a wavelength: $\lambda = 2(b - a)$.` }, { value: exact, feedback: 'That is the exact cross-product root; the question asks for the string estimate.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$k \approx \pi/(b - a)$, so $f = ck/2\pi$.`],
          teach: 'When the gap is small compared with the radius, curvature hardly matters and the radial problem is a string.',
          explain: t`$f \approx \dfrac{c}{2(b - a)} = ${r4(ans)}$ Hz; the cross-product root gives $${r4(exact)}$ Hz, ${r3((100 * Math.abs(ans - exact)) / exact)}% away. Asymptotically $J_m$ and $Y_m$ are cosine and sine with the same envelope, and their cross-product is $\propto\sin k(b - a)$.`,
        };
      },
    }),
    mcq({
      id: 'hub-shrinks', difficulty: 3,
      prompt: t`Shrink the hub, $a/b \to 0$. The lowest $m = 1$ root reaches the disk value $j_{1,1} = 3.832$ almost at once, but the lowest $m = 0$ root is still well above $j_{0,1} = 2.405$ at $a/b = 10^{-3}$. Why?`,
      visual: gpic({ x: [-3.2, 0], y: [2, 7], xlabel: 'log₁₀(a/b)', points: Q_HUB.flatMap((q) => [{ x: Math.log10(q), y: root(0, q), color: 'accent', r: 4 }, { x: Math.log10(q), y: root(1, q), color: 'violet', r: 4 }]), hlines: [{ y: besselZero(0, 1), color: 'accent', label: 'j₀,₁' }, { y: besselZero(1, 1), color: 'violet', label: 'j₁,₁' }] }, 'Lowest roots kb for m = 0 (blue) and m = 1 (violet) as the hub shrinks, against the full-disk values (lines). Computed by bisection.'),
      choices: [
        'The hub condition costs Y₀(ka) ~ (2/π) ln(ka), which grows only logarithmically, while for m = 1 it involves Y₁(ka) ~ 1/ka, so B → 0 like (ka)²',
        'm = 0 modes have no nodal diameters, so they cannot feel the hub',
        'The m = 1 root converges only because the computation is coarse',
        'An infinitely small hub still pins the drum at the centre, so m = 0 can never reach 2.405',
      ],
      answer: 0,
      why: {
        1: 'They feel it most: an m = 0 mode is largest at the centre, where the hub clamps it.',
        2: 'The roots are bisected to many digits; the slow approach is real.',
        3: 'The limit is 2.405 — the approach is just slow, like 1/ln(b/a): a point constraint is invisible in two dimensions.',
      },
      hints: ['Write B/A from the hub condition: B/A = −Jₘ(ka)/Yₘ(ka).', 'Compare how Y₀ and Y₁ blow up as their argument → 0.'],
      teach: 'Small-argument forms of Yₘ decide how a small hole perturbs a mode: logarithmically for m = 0, like a power for m ≥ 1.',
      explain: t`From $R(a) = 0$: $B/A = -J_m(ka)/Y_m(ka)$. For $m = 0$ this is $\approx -\pi/\big(2\ln(ka)\big)$ — it vanishes, but only like $1/\ln$; for $m = 1$ it is $\approx \tfrac\pi4(ka)^2$. A pinned point is “almost invisible” to a 2D membrane, but only logarithmically so.`,
    }),
    code({
      id: 'coax-code', difficulty: 3,
      prompt: t`Find annulus roots with SciPy. Write \`annulus_k(m, q, n)\`: the $n$-th root $kb$ of $J_m(kq)Y_m(k) - J_m(k)Y_m(kq)$ (scan $k$ upward in steps of 0.01 from 0.01 and refine each sign change with \`brentq\`). Then write \`coax_te11(q)\`: the first root of the Neumann version $J_1'(kq)Y_1'(k) - J_1'(k)Y_1'(kq)$, using \`jvp\` and \`yvp\` — the TE₁₁ cutoff of a coaxial line in units of $1/b$.`,
      starter: t`import numpy as np
from scipy.special import jv, yv, jvp, yvp
from scipy.optimize import brentq

def first_roots(g, count, k0=0.01, dk=0.01):
    """the first \`count\` sign changes of g(k) for k > k0, refined by brentq"""
    out, k, gk = [], k0, g(k0)
    while len(out) < count:
        k2 = k + dk; g2 = g(k2)
        if gk * g2 < 0:
            out.append(brentq(g, k, k2, xtol=1e-13))
        k, gk = k2, g2
    return out

def annulus_k(m, q, n):
    pass

def coax_te11(q):
    pass

print(annulus_k(0, 1/3, 1), annulus_k(0, 1/3, 2))
print(coax_te11(0.3), 2 / 1.3)
`,
      answer: t`import numpy as np
from scipy.special import jv, yv, jvp, yvp
from scipy.optimize import brentq

def first_roots(g, count, k0=0.01, dk=0.01):
    """the first \`count\` sign changes of g(k) for k > k0, refined by brentq"""
    out, k, gk = [], k0, g(k0)
    while len(out) < count:
        k2 = k + dk; g2 = g(k2)
        if gk * g2 < 0:
            out.append(brentq(g, k, k2, xtol=1e-13))
        k, gk = k2, g2
    return out

def annulus_k(m, q, n):
    g = lambda k: jv(m, k * q) * yv(m, k) - jv(m, k) * yv(m, k * q)
    return first_roots(g, n)[n - 1]

def coax_te11(q):
    g = lambda k: jvp(1, k * q) * yvp(1, k) - jvp(1, k) * yvp(1, k * q)
    return first_roots(g, 1)[0]

print(annulus_k(0, 1/3, 1), annulus_k(0, 1/3, 2))
print(coax_te11(0.3), 2 / 1.3)
`,
      tests: [
        { name: `annulus_k(0, 1/3, 1) ≈ ${r4(EXK[0])} (the worked example)`, code: `abs(annulus_k(0, 1/3, 1) - ${EXK[0].toFixed(10)}) < 1e-7` },
        { name: `annulus_k(0, 1/3, 2) ≈ ${r4(EXK[1])}`, code: `abs(annulus_k(0, 1/3, 2) - ${EXK[1].toFixed(10)}) < 1e-7` },
        { name: `annulus_k(2, 0.5, 1) ≈ ${r4(root(2, 0.5))}`, code: `abs(annulus_k(2, 0.5, 1) - ${root(2, 0.5).toFixed(10)}) < 1e-7` },
        { name: `coax_te11(0.3) ≈ ${r4(root(1, 0.3, 1, 'N'))}, a few per cent above 2/(1 + q)`, code: `abs(coax_te11(0.3) - ${root(1, 0.3, 1, 'N').toFixed(10)}) < 1e-7` },
      ],
      hints: ['Build g as a lambda of k with m and q fixed, then call first_roots(g, n).', 'For TE use jvp(1, ·) and yvp(1, ·), the derivatives with respect to the argument.'],
      teach: 'Eigenvalue conditions with no closed form are solved by bracketing sign changes and refining them.',
      explain: t`The roots match the lesson’s ($${r4(EXK[0])}$, $${r4(EXK[1])}$). The coax value $${r4(root(1, 0.3, 1, 'N'))}$ sits ${r3((100 * (root(1, 0.3, 1, 'N') - 2 / 1.3)) / (2 / 1.3))}% above the engineers’ rule $k_cb \approx 2/(1 + q)$, i.e. $k_c \approx 2/(a + b)$: the circumference of the mean circle holds one wavelength.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coax', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b] = r.pick([[0.46, 1.5], [0.9, 2.95], [1.6, 5.4]]), er = 2.1;
        const kc = 2 / ((a + b) * 1e-3), ans = (C0 * kc) / (2 * PI * Math.sqrt(er)) / 1e9;
        const exact = (C0 * root(1, a / b, 1, 'N') / (b * 1e-3)) / (2 * PI * Math.sqrt(er)) / 1e9;
        return {
          prompt: t`A coaxial cable has inner conductor radius $a = ${a}$ mm, shield radius $b = ${b}$ mm and a PTFE dielectric with $\varepsilon_r = ${er}$. Its first higher-order mode, TE₁₁, starts to propagate at $f_c = \dfrac{c_0\,k_c}{2\pi\sqrt{\varepsilon_r}}$, where $k_c$ is the lowest root of the Neumann cross-product with $m = 1$. Use the approximation $k_c \approx \dfrac{2}{a + b}$ to estimate $f_c$, in GHz.`,
          visual: ann({ q: a / b, m: 1, k: 1, kind: 'N', panels: ['top'] }, 'The TE₁₁ pattern of the axial magnetic field across the coax gap (zero slope at both conductors, dashed): one wavelength round the mean circle.'),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: ans * Math.sqrt(er), feedback: t`Divide by $\sqrt{\varepsilon_r}$: waves are slower in the dielectric.` }, { value: ans * er, feedback: t`It is $\sqrt{\varepsilon_r}$, not $\varepsilon_r$, that sets the wave speed.` }, { value: exact, feedback: 'That is the exact root; the question asks for the 2/(a + b) estimate.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$k_c \approx 2/(${a} + ${b})$ mm⁻¹ $= ${r4(kc)}$ m⁻¹.`, t`$f_c = c_0k_c/(2\pi\sqrt{${er}})$ with $c_0 = 2.998\times10^8$ m/s.`],
          teach: 'A coax is single-mode only below its TE₁₁ cutoff, roughly where one wavelength fits round the mean circumference.',
          explain: t`$f_c \approx ${r4(ans)}$ GHz; the exact cross-product root gives $${r4(exact)}$ GHz, a few per cent higher. Above it the cable carries two field patterns at once, which is why thinner cables reach higher frequencies.`,
        };
      },
    }),
    num({
      id: 'cp-refine', difficulty: 3,
      gen(r) {
        const m = r.int(1, 3), q = r.pick([0.8, 0.9]);
        const ans = Math.sqrt((PI / (1 - q)) ** 2 + (m / ((1 + q) / 2)) ** 2), exact = root(m, q);
        return {
          prompt: t`For a thin annulus ($a/b = ${q}$, $b = 1$) the mode $\cos(${m}\theta)$ needs $k^2 = k_r^2 + k_\theta^2$, with $k_r \approx \pi/(b - a)$ across the gap and $k_\theta \approx m/\bar r$ round the mean circle $\bar r = (a + b)/2$. Estimate the lowest $kb$ for $m = ${m}$.`,
          visual: ann({ q, m, k: 1, kmax: Math.ceil(1.3 * PI / (1 - q)) }, `The lowest m = ${m} mode of the thin annulus and its cross-product.`),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: PI / (1 - q), feedback: t`That ignores the angular variation; add $k_\theta^2 = (m/\bar r)^2$.` }, { value: PI / (1 - q) + m / ((1 + q) / 2), feedback: t`Wavenumbers add in quadrature: $k = \sqrt{k_r^2 + k_\theta^2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$k_r = \pi/(1 - ${q}) = ${r4(PI / (1 - q))}$ and $\bar r = ${(1 + q) / 2}$.`, t`$k_\theta = ${m}/${(1 + q) / 2} = ${r4(m / ((1 + q) / 2))}$; then $k = \sqrt{k_r^2 + k_\theta^2}$.`],
          teach: 'In a thin ring the mode is locally a plane wave: radial and angular wavenumbers add in quadrature.',
          explain: t`$k \approx \sqrt{${r4(PI / (1 - q))}^2 + (${m}/${(1 + q) / 2})^2} = ${r4(ans)}$; the cross-product root is $${r4(exact)}$, within ${r3((100 * Math.abs(ans - exact)) / exact)}%. The angular term is a small correction because the ring is long compared with its width.`,
        };
      },
    }),
    mcq({
      id: 'cp-te', difficulty: 2,
      prompt: t`TM modes of a coax use $J_m(ka)Y_m(kb) - J_m(kb)Y_m(ka) = 0$, TE modes the same with derivatives $J_m'$, $Y_m'$. Where does the difference come from?`,
      visual: ann({ q: 0.35, m: 1, k: 1, kind: 'N', kmax: 10 }, 'A TE pattern: the axial magnetic field has zero slope at both conductors (dashed rims).'),
      choices: [
        t`TM modes are described by $E_z$, which must vanish on a conductor (Dirichlet); TE modes by $H_z$, whose normal derivative must vanish there (Neumann)`,
        'TE modes travel faster, which changes the order of the Bessel functions',
        'TE modes have no angular dependence, so m = 0 always',
        'The derivative version applies only when the dielectric is not air',
      ],
      answer: 0,
      why: {
        1: 'Both families obey the same Helmholtz equation in the cross-section; only the boundary condition differs.',
        2: 'The lowest TE mode, TE₁₁, has m = 1: one wavelength round the gap.',
        3: 'The dielectric changes the speed, c₀/√εᵣ, not the type of boundary condition.',
      },
      hints: ['On a perfect conductor the tangential electric field is zero.', t`For TE modes the tangential $\vec E$ is built from the gradient of $H_z$.`],
      teach: 'The physics enters only through the boundary condition: Dirichlet gives the plain cross-product, Neumann the derivative one.',
      explain: t`Same eigenvalue problem $\nabla_\perp^2\psi + k_c^2\psi = 0$ on the annulus; Dirichlet ($E_z = 0$) or Neumann ($\partial_rH_z = 0$) boundary values pick which cross-product vanishes — the Sturm–Liouville boundary conditions of [E5.1](#/lesson/st-e.E5.1).`,
    }),
  ],
  sources: [SRC.dlmf10, SRC.watson, SRC.rhb],
});
