// The first Born approximation (Griffiths & Schroeter §10.4; Sakurai §6.3).
// From the integral Schrödinger equation with the outgoing Green's function
// −(m/2πħ²)e^{ik|r−r′|}/|r−r′|, replacing ψ by the incident wave inside the
// integral: f_B = −(m/2πħ²)∫e^{−iq·r}V d³r, the Fourier transform of V at
// the momentum transfer q = 2k sin(θ/2); for central V,
// f_B = −(2m/ħ²q)∫rV sin(qr) dr. Yukawa → −2mβ/ħ²(μ² + q²); μ → 0 gives
// exactly Rutherford's formula (the classical result of phys3550.M11.2,
// recovered quantum mechanically). Validity: weak potential, |V| ≪ ħ²/ma²
// at low energy or |V|a ≪ ħv at high energy; first order is blind to the sign
// of V. The square well's Born scattering length g²a/3 against the exact
// a(tan g/g − 1). Transfer: electron scattering and nuclear form factors —
// a uniform sphere's F(q) = 3(sin x − x cos x)/x³ vanishes first at
// x = qR = 4.4934 (Hofstadter's Stanford programme). Exact comparisons from
// the q2b-scatter model.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { scatPic, geomPic, HBARC_EVNM, r6 } from './_q2b.js';
import { MEC2 } from '../phys2710/_constants.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const KE2 = 1.43996448;                       // MeV fm, e²/4πε₀
const X1 = 4.493409457909064;                 // first positive root of tan x = x
/** Rutherford dσ/dΩ in b/sr for charges z, Z, kinetic energy E (MeV), angle θ (deg); non-relativistic, no recoil. */
const ruth = (z, Z, E, th) => ((z * Z * KE2) / (4 * E)) ** 2 / Math.sin(th / 2 / DEG) ** 4 / 100;
const EX = { z: 1, Z: 82, E: 10, th: 40 };
EX.v = ruth(EX.z, EX.Z, EX.E, EX.th);

export default lesson({
  id: 'phys4710.M6.3',
  title: 'The Born approximation',
  minutes: 17, difficulty: 4,
  intro: t`If the potential is weak, the wave inside it is barely disturbed, so replace it by the incoming plane wave. The scattering amplitude then becomes a **Fourier transform of the potential**, evaluated at the momentum the particle has gained:

$$\begin{gathered} f_B(\theta) = -\frac{m}{2\pi\hbar^2}\int e^{-i\vec q\cdot\vec r}\,V(\vec r)\,d^3r \\ q = |\vec k' - \vec k| = 2k\sin\frac\theta2 \end{gathered}$$

Large angles probe short distances: the angular pattern of $|f_B|^2$ is a picture of $V$ in momentum space. That is how electron scattering measured the sizes of nuclei and how deep-inelastic scattering found quarks.`,
  symbols: [
    { tex: 'f_B(\\theta)', text: 'the scattering amplitude in the first Born approximation, a length' },
    { tex: 'V(\\vec r)', text: 'the scattering potential, in J (or MeV); the Born formula needs it weak' },
    { tex: '\\vec k,\\ \\vec k\'', text: 'the incoming and outgoing wave vectors; elastic scattering keeps |k′| = |k| = k = p/ħ' },
    { tex: '\\vec q', text: 'the momentum transfer k′ − k (times ħ, the momentum the target absorbs), in m⁻¹ or fm⁻¹' },
    { tex: '\\theta', text: 'the scattering angle between k and k′' },
    { tex: 'm', text: 'the (reduced) mass of the scattered particle' },
    { tex: 'd^3r', text: 'a volume element: the integral runs over all space where V is not zero' },
  ],
  why: 'The Born approximation turns scattering data into the shape of a potential or a charge distribution: nuclear form factors, X-ray and electron crystallography, and dark-matter detector rates all use it.',
  visual: {
    type: 'q2b-scatter',
    title: 'Born against exact',
    lead: t`Scattering from a square well of radius $a$: the exact $d\sigma/d\Omega$ from partial waves (blue) and the first Born approximation (gold, dashed), on a log scale against angle; below, the total cross sections against $ka$.`,
    tasks: [
      'At g = 0.5 the two curves have the same shape and differ by about 10%; lower g to 0.2 and they nearly coincide. The error shrinks as g²: a weak well is where Born works.',
      'Raise g to 2.5 at ka = 1: Born is off by a factor of 1.5 to 3. Then raise ka to 8: it is good again at small angles — fast particles feel even a strong potential only briefly.',
      'Switch to the repulsive barrier: the Born curve does not change at all. First-order Born cannot tell attraction from repulsion.',
    ],
    params: { target: 'well', ka: 1, g: 0.5, born: true, panels: ['angle', 'sigma'], controls: ['target', 'ka', 'g', 'born'] },
  },
  example: {
    prompt: t`Find the Born amplitude for the Yukawa potential $V = \beta\,e^{-\mu r}/r$, then let $\mu \to 0$ with $\beta = zZe^2/4\pi\epsilon_0$ to scatter off a bare Coulomb charge. Evaluate $d\sigma/d\Omega$ for ${EX.E} MeV protons on lead ($Z = ${EX.Z}$) at $${EX.th}^\circ$.`,
    visual: geomPic(EX.th, `A proton beam scattering off a lead nucleus, detected at ${EX.th}° (schematic).`),
    steps: [
      { label: 'Central potential', text: t`For $V(r)$ the angular integrals of $e^{-i\vec q\cdot\vec r}$ give $4\pi\sin(qr)/qr$, so $f_B = -\dfrac{2m}{\hbar^2q}\displaystyle\int_0^\infty r\,V(r)\sin(qr)\,dr$.` },
      { label: 'Yukawa', text: t`$\displaystyle\int_0^\infty e^{-\mu r}\sin(qr)\,dr = \frac{q}{\mu^2 + q^2}$, so $f_B = -\dfrac{2m\beta}{\hbar^2(\mu^2 + q^2)}$ — smooth in angle, with a range $1/\mu$ setting where it turns over.` },
      { label: 'Coulomb limit', text: t`With $\mu \to 0$: $f_B = -\dfrac{2m\beta}{\hbar^2q^2}$. Using $q = 2k\sin(\theta/2)$ and $\hbar^2k^2 = 2mE$: $\dfrac{d\sigma}{d\Omega} = \Bigl(\dfrac{zZe^2}{16\pi\epsilon_0E}\Bigr)^2\dfrac{1}{\sin^4(\theta/2)}$.` },
      { label: 'Rutherford', text: t`That is exactly Rutherford’s classical formula — no $\hbar$ survives. (It is a happy accident of the Coulomb potential; the exact quantum answer differs only by a phase. The classical derivation is in [Rutherford scattering](#/lesson/phys3550.M11.2).)` },
      { label: 'Numbers', text: t`$zZe^2/4\pi\epsilon_0 = ${EX.Z}\times1.440 = ${fmt(EX.Z * KE2, 4)}$ MeV fm, divided by $4E = ${4 * EX.E}$ MeV gives $${fmt((EX.Z * KE2) / (4 * EX.E), 4)}$ fm; squared, $${fmt(((EX.Z * KE2) / (4 * EX.E)) ** 2, 4)}\ \text{fm}^2$; over $\sin^4 ${EX.th / 2}^\circ = ${fmt(Math.sin(EX.th / 2 / DEG) ** 4, 4)}$: $${fmt(EX.v * 100, 4)}\ \text{fm}^2 = ${fmt(EX.v, 3)}$ b/sr.` },
      { label: 'Sense check', text: t`At this angle the proton’s closest approach is $${fmt(((EX.Z * KE2) / EX.E / 2) * (1 + 1 / Math.sin(EX.th / 2 / DEG)), 3)}$ fm, well outside the lead nucleus (radius about 7 fm), so pure Coulomb is right. Real atoms screen the charge at large distances — a Yukawa with $1/\mu$ of order the atom’s size — which keeps the total cross section finite.` },
    ],
    answer: t`$f_B = -2m\beta/\hbar^2(\mu^2 + q^2)$; as $\mu \to 0$, Rutherford’s $d\sigma/d\Omega = (zZe^2/16\pi\epsilon_0E)^2/\sin^4(\theta/2)$, giving $${fmt(EX.v, 3)}$ b/sr for ${EX.E} MeV protons on lead at $${EX.th}^\circ$.`,
  },
  practice: [
    num({
      id: 'q', difficulty: 1,
      gen(r) {
        const E = r.pick([200, 420, 500, 750]), th = r.pick([10, 20, 30, 45]);             // MeV, deg
        const pc = Math.sqrt(E * E + 2 * E * MEC2), k = pc / (HBARC_EVNM), ans = 2 * k * Math.sin(th / 2 / DEG);
        return {
          prompt: t`Electrons of kinetic energy $${E}$ MeV scatter elastically from a heavy nucleus through $${th}^\circ$. What momentum transfer $q = 2k\sin(\theta/2)$ do they deliver, in fm⁻¹? (At these energies $pc = \sqrt{K^2 + 2Km_ec^2}$, almost $K$; $\hbar c = 197.33$ MeV fm.)`,
          visual: geomPic(th, 'Electron scattering at angle θ (schematic): the momentum transfer grows with angle.'),
          answer: ans, units: 'fm^-1', tol: { rel: 0.005 },
          errors: [{ value: k * Math.sin(th / 2 / DEG), feedback: t`$q = 2k\sin(\theta/2)$: the 2 comes from the two equal sides of the momentum triangle.` }, { value: 2 * k * Math.sin(th / DEG), feedback: t`Use half the angle: $\sin(\theta/2)$.` }],
          hints: [t`$k = pc/\hbar c$.`, t`Then $q = 2k\sin(\theta/2)$ with $\theta/2 = ${th / 2}^\circ$.`],
          teach: 'The momentum transfer q = 2k sin(θ/2) sets the length scale probed, about 1/q.',
          explain: t`$k = ${fmt(pc, 5)}/197.33 = ${fmt(k, 4)}\ \text{fm}^{-1}$, so $q = 2\times${fmt(k, 4)}\times\sin ${th / 2}^\circ = ${fmt(ans, 4)}\ \text{fm}^{-1}$: this scattering resolves structure about $1/q = ${fmt(1 / ans, 3)}$ fm across — nuclear sizes.`,
        };
      },
    }),
    expr({
      id: 'yukawa', difficulty: 3,
      prompt: t`Using $f_B = -\dfrac{2m}{\hbar^2q}\displaystyle\int_0^\infty rV(r)\sin(qr)\,dr$, find the Born amplitude for the Yukawa potential $V(r) = \beta\,e^{-\mu r}/r$.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 2.2], aspect: 'wide', xlabel: 'r (units of 1/μ)', ylabel: 'V / β', axesAt: 'edge', curves: [{ fn: 'exp(-x)/x', domain: [0.4, 5], color: 'accent', width: 2.4, label: 'Yukawa e^(−μr)/r', labelAt: 1.4, labelDy: -6 }, { fn: '1/x', domain: [0.45, 5], color: 'ink3', width: 1.6, dash: [5, 4], label: 'Coulomb 1/r', labelAt: 3, labelDy: -8 }] }, caption: 'The Yukawa potential (blue) is a Coulomb potential (dashed) cut off beyond about 1/μ.' },
      answer: '-2*m*beta/(hbar^2*(mu^2 + q^2))', answerTeX: t`-\frac{2m\beta}{\hbar^2(\mu^2 + q^2)}`,
      vars: { m: [0.5, 2], beta: [0.5, 2], mu: [0.3, 2], q: [0.3, 3], hbar: [0.5, 1.5] },
      keys: [['β', 'beta'], ['μ', 'mu'], ['ħ', 'hbar']],
      errors: [{ answer: '-2*m*beta/(hbar^2*(mu^2 - q^2))', feedback: t`$\int_0^\infty e^{-\mu r}\sin qr\,dr = q/(\mu^2 + q^2)$, with a plus.` }, { answer: '-2*m*beta/(hbar^2*q*(mu^2 + q^2))', feedback: t`The integral brings a factor $q$ that cancels the $1/q$ in front.` }],
      hints: [t`$rV = \beta e^{-\mu r}$, so you need $\int_0^\infty e^{-\mu r}\sin(qr)\,dr$.`, t`Write $\sin qr = \operatorname{Im}e^{iqr}$: $\int_0^\infty e^{(-\mu + iq)r}dr = \dfrac{1}{\mu - iq} = \dfrac{\mu + iq}{\mu^2 + q^2}$.`],
      teach: 'The Born amplitude of a Yukawa potential is −2mβ/ħ²(μ² + q²): it is flat for q ≪ μ and falls as 1/q² beyond.',
      explain: t`$\int_0^\infty e^{-\mu r}\sin qr\,dr = q/(\mu^2 + q^2)$, so $f_B = -\dfrac{2m\beta}{\hbar^2q}\cdot\dfrac{q}{\mu^2 + q^2} = -\dfrac{2m\beta}{\hbar^2(\mu^2 + q^2)}$. Yukawa invented this potential (1935) for a force carried by a massive particle; $\mu = m_\pi c/\hbar$ for the pion.`,
    }),
    num({
      id: 'ruth', difficulty: 2,
      gen(r) {
        const [z, nm, Z, el] = r.pick([[2, 'alpha particles', 47, 'silver'], [2, 'alpha particles', 29, 'copper'], [1, 'protons', 79, 'gold'], [1, 'protons', 50, 'tin']]);
        const E = r.pick([4, 6, 8]), th = r.pick([30, 60, 90, 120]);
        const ans = ruth(z, Z, E, th);
        return {
          prompt: t`Using the Born–Rutherford formula $\dfrac{d\sigma}{d\Omega} = \Bigl(\dfrac{zZe^2}{16\pi\epsilon_0E}\Bigr)^2\dfrac{1}{\sin^4(\theta/2)}$, find $d\sigma/d\Omega$ for $${E}$ MeV ${nm} on ${el} ($Z = ${Z}$) at $${th}^\circ$, in barns per steradian. ($e^2/4\pi\epsilon_0 = 1.440$ MeV fm; ignore recoil.)`,
          visual: { type: 'graph', params: { x: [10, 180], y: [-1, 4], ylog: true, aspect: 'wide', xlabel: 'θ (degrees)', ylabel: 'dσ/dΩ (relative)', axesAt: 'edge', curves: [{ fn: 'log10(1/sin(x*pi/360)^4)', color: 'accent', width: 2.4 }], vlines: [{ x: th, color: 'gold' }] }, caption: 'The Rutherford shape 1/sin⁴(θ/2) on a log scale (relative units), with the angle asked for in gold.' },
          answer: ans, units: 'b/sr', tol: { rel: 0.01 },
          errors: [{ value: ans * Math.sin(th / 2 / DEG) ** 4 / Math.sin(th / DEG) ** 4, feedback: t`Use $\sin^4(\theta/2)$, half the scattering angle.` }, { value: ans * 100, feedback: '1 b = 100 fm².' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\dfrac{zZe^2}{16\pi\epsilon_0E} = \dfrac{zZ\times1.440\ \text{MeV fm}}{4E}$.`, t`Square it (fm²), divide by $\sin^4(\theta/2)$, and convert: 1 b = 100 fm².`],
          teach: 'Rutherford’s cross section follows from first-order Born for the Coulomb potential, with no ħ left in it.',
          explain: t`$${z * Z}\times1.440/(4\times${E}) = ${fmt((z * Z * KE2) / (4 * E), 4)}$ fm; squared, $${fmt(((z * Z * KE2) / (4 * E)) ** 2, 4)}\ \text{fm}^2$; over $\sin^4 ${th / 2}^\circ = ${fmt(Math.sin(th / 2 / DEG) ** 4, 4)}$ gives $${fmt(ans * 100, 4)}\ \text{fm}^2 = ${fmt(ans, 4)}$ b/sr.`,
        };
      },
    }),
    num({
      id: 'born-length', difficulty: 3,
      gen(r) {
        const g = r.pick([0.3, 0.5, 0.8, 1.2]);
        const ans = (g * g) / 3, ex = Math.tan(g) / g - 1;
        return {
          prompt: t`At zero energy ($q = 0$) the Born amplitude of an attractive square well ($V = -V_0$ for $r < a$) is $f_B = \dfrac{2mV_0}{\hbar^2}\displaystyle\int_0^a r^2\,dr$. With strength $g = \sqrt{2mV_0}\,a/\hbar = ${g}$, find $f_B/a$.`,
          visual: scatPic({ target: 'well', ka: 0.1, g, born: true, panels: ['angle'] }, 'Exact (blue) and Born (gold, dashed) dσ/dΩ at ka = 0.1 for this well, log scale: both flat in angle.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: g * g, feedback: t`$\int_0^a r^2dr = a^3/3$.` }, { value: ex, feedback: 'That is the exact answer, a(tan g/g − 1); the question asks for the Born estimate.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$\lim_{q\to0}\sin(qr)/q = r$, so $f_B = \dfrac{2mV_0}{\hbar^2}\cdot\dfrac{a^3}{3}$.`, t`$\dfrac{2mV_0a^2}{\hbar^2} = g^2$, so $f_B/a = g^2/3$.`],
          teach: 'At low energy Born gives f = (2m/ħ²)∫r²|V|dr — the volume integral of the potential — which is good only for weak wells.',
          explain: t`$f_B/a = g^2/3 = ${fmt(ans, 4)}$. The exact s-wave answer is $f/a = \tan g/g - 1 = ${fmt(ex, 4)}$: Born is off by ${fmt(Math.abs(100 * (ans - ex) / ex), 2)}%. ${g > 1 ? 'At this strength the well is far from weak, and Born badly underestimates the scattering as the well approaches its first bound state at g = π/2.' : 'The error grows like g²: Born is the first term of a series in the potential’s strength.'}`,
        };
      },
    }),
    mcq({
      id: 'valid', difficulty: 3,
      prompt: t`When is the first Born approximation trustworthy for a potential of depth $V_0$ and range $a$?`,
      visual: scatPic({ target: 'well', ka: 1, g: 2.5, born: true, panels: ['sigma'] }, 'Total cross sections against ka for a fairly strong well (g = 2.5): exact (blue) and Born (gold, dashed).'),
      choices: [
        t`When the potential barely distorts the wave: $V_0 \ll \hbar^2/ma^2$ at low energy, or $V_0a \ll \hbar v$ at high energy`,
        'At low energy, for any potential, because slow particles are easier to describe',
        'Only for the Coulomb potential',
        'When the potential is strong enough to hold bound states',
      ],
      answer: 0,
      why: {
        1: 'Slow particles linger in the potential; Born fails at low energy unless the potential is weak.',
        2: 'It works for any weak potential; for Coulomb it happens to give the exact cross section.',
        3: 'A potential that can bind is precisely one that distorts the wave strongly: Born fails there.',
      },
      hints: ['Born replaces the wave inside the potential by the undisturbed plane wave. When is that close to true?', 'The phase the potential adds while the particle crosses it is about V₀a/ħv; at low energy the comparison is with the kinetic energy of a particle confined to size a.'],
      teach: 'Born needs the wave inside the potential to be almost the incident wave: a weak potential, or a fast particle.',
      explain: t`The phase the potential adds across it is about $V_0a/\hbar v$; Born needs that small. At low energy the relevant comparison is $V_0$ against $\hbar^2/ma^2$ — that is, $g^2 \ll 1$, far from the $g = \pi/2$ where a bound state appears.`,
    }),
    mcq({
      id: 'sign', difficulty: 2,
      prompt: t`Electrons and positrons of the same energy scatter off the same nucleus. What does the first Born approximation predict for their differential cross sections?`,
      visual: scatPic({ target: 'barrier', ka: 2, g: 0.6, born: true, panels: ['angle'] }, 'A weak repulsive barrier: exact (blue) and Born (gold, dashed).'),
      choices: [
        t`The same: $d\sigma/d\Omega \propto |f_B|^2$, and flipping the sign of $V$ only flips the sign of $f_B$`,
        'Positrons scatter more, because they are repelled',
        'Electrons scatter more, because they are attracted',
        'Positrons do not scatter at all',
      ],
      answer: 0,
      why: {
        1: 'At first order the sign drops out; differences appear only at second order (and in the exact Coulomb phase).',
        2: 'Attraction and repulsion give equal and opposite amplitudes, and equal cross sections at first order.',
        3: 'Both feel the Coulomb force, with opposite signs.',
      },
      hints: [t`$f_B$ is linear in $V$; $d\sigma/d\Omega$ is $|f_B|^2$.`],
      teach: 'First-order Born is blind to the sign of the potential; differences between e⁻ and e⁺ scattering are second-order effects.',
      explain: t`$f_B \propto \tilde V(q)$, so $V \to -V$ gives $f_B \to -f_B$ and the same $|f_B|^2$. Measured electron and positron cross sections do differ slightly — that is the second Born term, and a test of it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-form', difficulty: 3, transfer: true,
      gen(r) {
        const [el, A] = r.pick([['calcium-40', 40], ['nickel-58', 58], ['tin-120', 120], ['lead-208', 208]]);
        const E = r.pick([250, 420, 500]);
        const R = 1.2 * Math.cbrt(A), pc = Math.sqrt(E * E + 2 * E * MEC2), k = pc / HBARC_EVNM;
        const s = X1 / R / (2 * k), ans = 2 * Math.asin(s) * DEG;
        return {
          prompt: t`In the 1950s Robert Hofstadter’s group at Stanford measured the sizes of nuclei by scattering high-energy electrons. In the Born approximation the Rutherford cross section is multiplied by $|F(q)|^2$, the square of the Fourier transform of the charge distribution. For a uniformly charged sphere of radius $R$, $F = 3(\sin x - x\cos x)/x^3$ with $x = qR$, which first vanishes at $x = 4.4934$. Model ${el} as a uniform sphere with $R = 1.2A^{1/3}$ fm. At what angle, in degrees, is the first diffraction minimum for ${E} MeV electrons?`,
          visual: { type: 'graph', params: { x: [0, 10], y: [-8, 0.3], ylog: true, aspect: 'wide', xlabel: 'x = qR', ylabel: '|F(q)|²', axesAt: 'edge', curves: [{ fn: 'log10(max(1e-12, (3*(sin(x) - x*cos(x))/x^3)^2))', domain: [0.05, 10], color: 'accent', width: 2.4, samples: 2000 }] }, caption: 'The form factor |F|² of a uniform sphere on a log scale: deep minima where F changes sign. Real nuclei have soft edges, which fill in the minima.' },
          answer: ans, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.asin(X1 / R / k) * DEG, feedback: t`$q = 2k\sin(\theta/2)$: solve for $\sin(\theta/2)$, then double the angle.` }, { value: 2 * Math.asin(Math.PI / R / (2 * k)) * DEG, feedback: t`The first zero of $F$ is at $qR = 4.4934$, not $\pi$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$R = 1.2A^{1/3}$ fm and $k = pc/\hbar c$ with $pc \approx K$.`, t`$\sin(\theta/2) = \dfrac{4.4934}{2kR}$.`],
          teach: 'The angle of the first diffraction minimum measures the nuclear radius: qR ≈ 4.49 for a uniform sphere.',
          explain: t`$R = ${fmt(R, 3)}$ fm, $k = ${fmt(k, 4)}\ \text{fm}^{-1}$, so $\sin(\theta/2) = 4.4934/(2\times${fmt(k, 4)}\times${fmt(R, 3)}) = ${fmt(s, 4)}$ and $\theta = ${fmt(ans, 3)}^\circ$. Hofstadter’s fits showed that nuclei are not sharp spheres: the charge density has a flat interior and a soft surface a little over 2 fm thick (the Nobel Prize, 1961).`,
        };
      },
    }),
    num({
      id: 'cp-ruth', difficulty: 2,
      gen(r) {
        const E = r.pick([5, 7.69, 10]), th = r.pick([45, 90, 150]), Z = r.pick([13, 47, 79]);
        const ans = ruth(2, Z, E, th) * 1000;
        return {
          prompt: t`What is $d\sigma/d\Omega$, in mb/sr, for $${E}$ MeV alpha particles on a nucleus of charge $Z = ${Z}$ at $${th}^\circ$, from the Born–Rutherford formula? ($e^2/4\pi\epsilon_0 = 1.440$ MeV fm, 1 b = 100 fm², 1 b = 1000 mb.)`,
          visual: geomPic(th, `Alpha particles scattering through ${th}° (schematic).`),
          answer: ans, units: 'mb/sr', tol: { rel: 0.01 },
          errors: [{ value: ruth(1, Z, E, th) * 1000, feedback: 'An alpha particle has z = 2, and the cross section goes as z².' }, { value: ans / 1000, feedback: 'Convert to millibarns: 1 b = 1000 mb.' }],
          hints: [t`$\dfrac{d\sigma}{d\Omega} = \Bigl(\dfrac{2Z\times1.440}{4E}\Bigr)^2\dfrac{1}{\sin^4(\theta/2)}$ in fm²/sr.`],
          teach: 'Rutherford’s formula scales as (zZ/E)²/sin⁴(θ/2).',
          explain: t`$(2\times${Z}\times1.440/${fmt(4 * E, 4)})^2/\sin^4 ${th / 2}^\circ = ${fmt(ans / 10, 4)}\ \text{fm}^2\text{/sr} = ${fmt(ans, 4)}$ mb/sr.`,
        };
      },
    }),
    mcq({
      id: 'cp-fourier', difficulty: 2,
      prompt: t`Two potentials have the same strength but one has a range ten times shorter. How do their Born angular distributions differ at a given energy?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-3, 0.2], ylog: true, aspect: 'wide', xlabel: 'q (units of 1/a)', ylabel: '|f|² (relative)', axesAt: 'edge', curves: [{ fn: 'log10(1/(1 + x^2)^2)', color: 'accent', width: 2.4, label: 'range a', labelAt: 3, labelDy: -8 }, { fn: 'log10(1/(1 + (x/10)^2)^2)', color: 'gold', width: 2.2, dash: [6, 4], label: 'range a/10', labelAt: 7, labelDy: -8 }] }, caption: 'Yukawa Born cross sections against momentum transfer for two ranges, each scaled to 1 at q = 0.' },
      choices: [
        'The short-range potential scatters much more evenly to large angles: a narrow V has a wide Fourier transform',
        'The short-range potential is more forward-peaked',
        'They are identical, because only the strength matters',
        'The short-range one scatters only backwards',
      ],
      answer: 0,
      why: {
        1: 'Forward peaking comes from long range: a wide V has a narrow Fourier transform in q.',
        2: t`The range sets where $\tilde V(q)$ falls off — at $q \sim 1/\text{range}$.`,
        3: 'Nothing forces backward scattering; the distribution just stays flat out to larger q.',
      },
      hints: [t`$f_B \propto \tilde V(q)$, and $q$ grows with angle. How wide in $q$ is the Fourier transform of something narrow in $r$?`],
      teach: t`$f_B$ is the Fourier transform of $V$: short-range structure shows up at large momentum transfer, so to see small things you need large angles or high energies.`,
      explain: t`For a Yukawa, $|f_B|^2 \propto 1/(\mu^2 + q^2)^2$ stays flat until $q \sim \mu$, the inverse range. Ten times shorter range means ten times larger $q$ before the fall-off — a much broader angular distribution. This is why probing quarks inside protons needed GeV electrons.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §10.4', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Hofstadter, “Electron scattering and nuclear structure”, Rev. Mod. Phys. 28, 214 (1956)', url: 'https://doi.org/10.1103/RevModPhys.28.214' },
  ],
});
