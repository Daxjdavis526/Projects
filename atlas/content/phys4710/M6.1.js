// Quantum cross sections (Griffiths & Schroeter §10.1; Sakurai §6.1). The
// classical picture — impact parameter, dσ/dΩ = (b/sin θ)|db/dθ|,
// Rutherford — is phys3550.M11 and is only linked. Here: the scattering
// state ψ → A[e^{ikz} + f(θ)e^{ikr}/r], dσ/dΩ = |f(θ)|² from the ratio of
// scattered to incident probability flux, f a length, σ = ∫|f|²dΩ; count
// rates Φ·N·(dσ/dΩ)·ΔΩ; the hard sphere's s-wave limit f → −a, σ = 4πa²,
// four times the classical πa², and 2πa² at high energy (the shadow).
// Real numbers: thermal-neutron coherent scattering lengths (NIST, from
// Sears, Neutron News 3, 26 (1992)): C 6.6460, O 5.803, Al 3.449, Si 4.1491,
// Fe 9.45, Ni 10.3, Pb 9.405, V −0.3824 fm; σ_coh = 4πb². Partial waves
// are M6.2, the Born approximation M6.3. Exact curves from the q2b-scatter model.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { scatPic, geomPic, r6 } from './_q2b.js';
import * as S from '../../src/viz/model/q2b-scatter.js';

const t = String.raw;
const BCOH = [['carbon', 6.646], ['oxygen', 5.803], ['aluminium', 3.449], ['silicon', 4.1491], ['iron', 9.45], ['nickel', 10.3], ['lead', 9.405]];
const sigHard = (ka) => S.crossSections(S.phaseShifts('hard', ka), ka).total;      // in πa²

export default lesson({
  id: 'phys4710.M6.1',
  title: 'Cross sections',
  minutes: 14, difficulty: 3,
  intro: t`In a scattering experiment a beam meets a target and detectors count what comes out at each angle. Quantum mechanically the beam is a plane wave, the target sends out a spherical wave, and everything measurable is in the amplitude $f(\theta)$ of that spherical wave:

$$\begin{gathered} \psi \;\xrightarrow{\;r\to\infty\;}\; A\Bigl[e^{ikz} + f(\theta)\,\frac{e^{ikr}}{r}\Bigr] \\ \frac{d\sigma}{d\Omega} = |f(\theta)|^2,\qquad \sigma = \int|f(\theta)|^2\,d\Omega \end{gathered}$$

(The classical theory is in [scattering angles and cross sections](#/lesson/phys3550.M11.1).) The **cross section** is an effective area: the rate of scattering divided by the incident flux. It need not equal the target’s geometric size — a hard sphere scatters slow waves from **four times** its cross-sectional area.`,
  symbols: [
    { tex: 'e^{ikz}', text: 'the incident plane wave, travelling along z with wavenumber k = p/ħ' },
    { tex: 'f(\\theta)', text: 'the scattering amplitude, a **length** (in m or fm), depending on the angle θ from the beam (and on k)' },
    { tex: '\\frac{e^{ikr}}{r}', text: 'the outgoing spherical wave; the 1/r keeps the probability flowing through a large sphere constant' },
    { tex: 'A', text: 'an overall normalization, which cancels in every cross section' },
    { tex: '\\frac{d\\sigma}{d\\Omega}', text: 'the differential cross section, in m²/sr (or barns per steradian; 1 b = 10⁻²⁸ m²)' },
    { tex: '\\sigma', text: 'the total cross section, in m² or barns: dσ/dΩ integrated over all directions' },
    { tex: 'd\\Omega', text: 'an element of solid angle, sin θ dθ dφ, in steradians' },
  ],
  why: 'Almost everything known about nuclei, particles and the forces between them — from Rutherford to the LHC — was learned by measuring cross sections.',
  visual: {
    type: 'q2b-scatter',
    title: 'A hard sphere, slow and fast',
    lead: t`Waves of wavenumber $k$ scattering off an impenetrable sphere of radius $a$. Top: $d\sigma/d\Omega$ as a polar diagram (beam from the left). Middle: how each partial wave contributes (next lesson). Bottom: the total $\sigma$ against $ka$, in units of the geometric area $\pi a^2$.`,
    tasks: [
      'Set ka = 0.1: the scattering is the same in every direction, and σ is close to 4πa² — four times the shadow the sphere casts.',
      'Raise ka to 10: a sharp forward spike appears and σ heads for 2πa², still twice the geometric area.',
      'Watch the forward spike narrow as ka grows: its width is about 1/ka radians, a diffraction pattern.',
    ],
    params: { target: 'hard', ka: 0.5, controls: ['ka'] },
  },
  example: {
    prompt: t`Show from probability currents that $d\sigma/d\Omega = |f|^2$. Then take a hard sphere at very low energy, where $f \to -a$, find $\sigma$, and evaluate it for thermal neutrons on carbon nuclei, whose measured scattering length is $b = 6.646$ fm.`,
    visual: geomPic(35),
    steps: [
      { label: 'Incident flux', text: t`The plane wave $Ae^{ikz}$ carries a probability current $j_{\text{in}} = |A|^2v$ along $z$, with $v = \hbar k/m$: particles per unit area per unit time.` },
      { label: 'Scattered flux', text: t`The spherical wave $Af\,e^{ikr}/r$ carries $|A|^2|f|^2v/r^2$ outward. Through a detector of area $dA = r^2\,d\Omega$ that is $|A|^2v\,|f|^2\,d\Omega$ per second — independent of $r$, as it must be.` },
      { label: 'Define the cross section', text: t`$d\sigma$ is the area of incident beam that delivers that many particles: $j_{\text{in}}\,d\sigma = |A|^2v|f|^2d\Omega$, so $\dfrac{d\sigma}{d\Omega} = |f(\theta)|^2$. Since $d\sigma/d\Omega$ is an area per steradian, $f$ is a length.` },
      { label: 'Hard sphere, slow', text: t`For $ka \ll 1$ the scattered wave is isotropic with $f = -a$ (next lesson derives it: the wave is pushed out by $a$, a phase shift $\delta_0 = -ka$). So $d\sigma/d\Omega = a^2$ and $\sigma = 4\pi a^2$.` },
      { label: 'Carbon', text: t`Nuclear scattering of slow neutrons is s-wave too: thermal neutrons ($\lambda \approx 0.18$ nm) have wavelengths tens of thousands of times larger than a nucleus. With $b = 6.646$ fm, $\sigma = 4\pi b^2 = ${fmt(4 * Math.PI * 6.646 ** 2, 4)}\ \text{fm}^2 = ${fmt(4 * Math.PI * 6.646 ** 2 / 100, 4)}$ b; the tabulated value is 5.551 b.` },
      { label: 'Sense check', text: t`Classically a hard sphere blocks $\pi a^2$. The wave answer is four times that because a slow wave cannot see the sphere’s edge; it diffracts all around it. And the scattering length is not the nuclear radius: it is set by the nuclear potential’s strength and can even be negative.` },
    ],
    answer: t`$d\sigma/d\Omega = |f|^2$ (scattered flux per steradian ÷ incident flux). A slow hard sphere has $\sigma = 4\pi a^2$; carbon’s $b = 6.646$ fm gives $\sigma = ${fmt(4 * Math.PI * 6.646 ** 2 / 100, 4)}$ b.`,
  },
  practice: [
    mcq({
      id: 'f-units', difficulty: 1,
      prompt: t`What are the units of the scattering amplitude $f(\theta)$?`,
      visual: geomPic(60, t`The outgoing wave is $f(\theta)\,e^{ikr}/r$: compare the units of the two terms in the bracket.`, { detector: false }),
      choices: ['A length', 'None: it is a dimensionless probability amplitude', 'An area', 'Inverse length'],
      answer: 0,
      why: {
        1: t`$e^{ikz}$ is dimensionless and so is $f\,e^{ikr}/r$; with $1/r$ in it, $f$ must carry a length.`,
        2: t`An area is $|f|^2$, the differential cross section.`,
        3: t`$f/r$ must be dimensionless, so $f$ has the units of $r$.`,
      },
      hints: [t`The bracket $e^{ikz} + f\,e^{ikr}/r$ adds two terms, so they must have the same units.`],
      teach: 'f is a length; its square, an area per steradian, is the differential cross section.',
      explain: t`$f\,e^{ikr}/r$ must match the dimensionless $e^{ikz}$, so $f$ is a length — fm for nuclei, ångströms for atoms. Then $|f|^2$ is an area per steradian.`,
    }),
    num({
      id: 'sigma-b', difficulty: 2,
      gen(r) {
        const [el, b] = r.pick(BCOH);
        const ans = (4 * Math.PI * b * b) / 100;
        return {
          prompt: t`Slow neutrons scatter from ${el} nuclei isotropically, with coherent scattering length $b = ${b}$ fm (so $f = -b$). What is the coherent scattering cross section, in barns? (1 b $= 100\ \text{fm}^2$.)`,
          visual: scatPic({ target: 'hard', ka: 0.1, panels: ['polar'] }, 'Scattering at very low energy (ka = 0.1): the same in every direction — the s-wave limit.'),
          answer: ans, units: 'b', tol: { rel: 0.005 },
          errors: [{ value: (Math.PI * b * b) / 100, feedback: t`$\sigma = \int|f|^2d\Omega = 4\pi b^2$: integrate over the full $4\pi$ steradians.` }, { value: 4 * Math.PI * b * b, feedback: '1 barn is 100 fm².' }],
          hints: [t`Isotropic: $d\sigma/d\Omega = b^2$ everywhere, and the sphere has $4\pi$ steradians.`],
          teach: 'For isotropic s-wave scattering σ = 4π|f|², with f the scattering length.',
          explain: t`$\sigma = 4\pi(${b}\ \text{fm})^2 = ${fmt(ans * 100, 4)}\ \text{fm}^2 = ${fmt(ans, 4)}$ b, the value tabulated for neutron scattering. Neutron diffraction from crystals uses exactly these lengths.`,
        };
      },
    }),
    mcq({
      id: 'four', difficulty: 2,
      prompt: t`A hard sphere of radius $a$ blocks an area $\pi a^2$ of a classical beam. Why is its cross section for very slow waves $4\pi a^2$ instead?`,
      visual: scatPic({ target: 'hard', ka: 0.2, panels: ['sigma'] }, 'σ/πa² against ka for a hard sphere: it starts at 4 and falls toward 2.'),
      choices: [
        'A wave much longer than the sphere diffracts around it and is scattered in all directions; the amplitude −a, squared and summed over 4π steradians, gives 4πa²',
        'Quantum particles are four times larger than classical ones',
        'The sphere’s shadow and the reflected beam each count twice',
        'It is a mistake: the true low-energy cross section is πa²',
      ],
      answer: 0,
      why: {
        1: 'The particle is not bigger; the wave is longer than the target.',
        2: 'At high energy the shadow does double σ (to 2πa²); at low energy there is no sharp shadow at all.',
        3: 'The 4πa² is exact in the limit ka → 0 and is measured (it is why neutron cross sections come out as 4πb²).',
      },
      hints: [t`At low energy $f(\theta) = -a$ for every angle.`],
      teach: 'Cross sections are effective areas, not geometric ones: a slow wave sees a hard sphere as four times its silhouette.',
      explain: t`$\sigma = \int a^2\,d\Omega = 4\pi a^2$. The wave cannot resolve the sphere’s shape when $ka \ll 1$, so it scatters isotropically; this is pure diffraction, with no classical counterpart.`,
    }),
    num({
      id: 'sp-sigma', difficulty: 3,
      gen(r) {
        const f0 = r.pick([-4, -3, 2, 5]), f1 = r.pick([1, 2, 3]);           // fm
        const ans = (4 * Math.PI * (f0 * f0 + (f1 * f1) / 3)) / 100;
        return {
          prompt: t`At a slightly higher energy a real scattering amplitude has an s-wave and a p-wave part: $f(\theta) = ${f0} + ${f1}\cos\theta$, in fm. Find the total cross section, in barns.`,
          visual: { type: 'graph', params: { x: [-1.1, 1.1], y: [-1.1, 1.1], aspect: 'wide', equal: true, xlabel: '', ylabel: '', axes: false, grid: false, curves: [{ param: [`(${f0} + ${f1}*cos(t))^2/${(Math.abs(f0) + f1) ** 2}*cos(t)`, `(${f0} + ${f1}*cos(t))^2/${(Math.abs(f0) + f1) ** 2}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: ['t', '0'], t: [-1.1, 1.1], color: 'ink4', width: 1 }], arrows: [{ from: [-1.05, 0.9], to: [-0.6, 0.9], color: 'ink3', label: 'beam' }] }, caption: 'dσ/dΩ = |f(θ)|² as a polar diagram (scaled to fit), beam from the left: the cos θ term makes it lopsided.' },
          answer: ans, units: 'b', tol: { rel: 0.005 },
          errors: [{ value: (4 * Math.PI * (f0 * f0 + f1 * f1)) / 100, feedback: t`$\cos^2\theta$ averages to $\tfrac13$ over the sphere, not 1.` }, { value: (4 * Math.PI * (f0 + f1) ** 2) / 100, feedback: t`That is $|f(0)|^2$ times $4\pi$; integrate $|f(\theta)|^2$ over angle instead.` }],
          hints: [t`$|f|^2 = f_0^2 + 2f_0f_1\cos\theta + f_1^2\cos^2\theta$; integrate with $d\Omega = 2\pi\sin\theta\,d\theta$.`, t`$\int\cos\theta\,d\Omega = 0$ and $\int\cos^2\theta\,d\Omega = 4\pi/3$.`],
          teach: 'Integrating |f|² over the sphere, the cross terms between different partial waves vanish: σ is a sum over l of separate pieces.',
          explain: t`$\sigma = 4\pi f_0^2 + \tfrac{4\pi}{3}f_1^2 = 4\pi(${f0 * f0} + ${fmt((f1 * f1) / 3, 4)})\ \text{fm}^2 = ${fmt(ans * 100, 4)}\ \text{fm}^2 = ${fmt(ans, 4)}$ b. The interference term $2f_0f_1\cos\theta$ tilts the angular distribution forward or backward but integrates to zero — a first glimpse of partial waves’ orthogonality.`,
        };
      },
    }),
    num({
      id: 'rate', difficulty: 2,
      gen(r) {
        const phi = r.pick([1e6, 5e6, 2e7]), N = r.pick([1e20, 5e20, 2e21]), b = r.pick([5, 8, 10]), A = r.pick([4, 10, 25]), L = r.pick([0.5, 1, 2]);     // n/cm²/s, nuclei, fm, cm², m
        const dO = (A * 1e-4) / (L * L), ans = phi * 1e4 * N * (b * 1e-15) ** 2 * dO;
        return {
          prompt: t`A neutron beam of flux $\Phi = ${tex(phi, 2)}\ \text{cm}^{-2}\text{s}^{-1}$ hits a small sample of $${tex(N, 2)}$ nuclei, each scattering isotropically with $d\sigma/d\Omega = b^2$, $b = ${b}$ fm (no crystal effects). A detector of area $${A}\ \text{cm}^2$ faces the sample from $${L}$ m away. How many neutrons per second does it count?`,
          visual: geomPic(50, 'Beam, sample and a small detector at angle θ (schematic). The count rate is Φ × N × dσ/dΩ × ΔΩ.'),
          answer: ans, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: ans * 1e4, feedback: t`Convert the flux to $\text{m}^{-2}\text{s}^{-1}$ (×$10^4$) and $b$ to metres consistently — the units are off by $10^4$.` }, { value: ans * 4 * Math.PI, feedback: t`The detector catches only $d\sigma/d\Omega\times\Delta\Omega$, not the whole $\sigma$.` }],
          hints: [t`$\Delta\Omega = A/L^2$ in steradians.`, t`Rate $= \Phi N\,\dfrac{d\sigma}{d\Omega}\,\Delta\Omega$ with everything in SI.`],
          teach: 'Count rate = flux × number of scatterers × dσ/dΩ × solid angle: the cross section is what turns a flux into a rate.',
          explain: t`$\Delta\Omega = ${tex(A * 1e-4, 2)}/${L * L} = ${tex(dO, 3)}$ sr and $b^2 = ${tex((b * 1e-15) ** 2, 3)}\ \text{m}^2$, so the rate is $${tex(phi * 1e4, 2)}\times${tex(N, 2)}\times${tex((b * 1e-15) ** 2, 3)}\times${tex(dO, 3)} = ${tex(ans, 3)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'shadow', difficulty: 3,
      prompt: t`At high energy ($ka \gg 1$) the hard sphere’s total cross section approaches $2\pi a^2$, twice its silhouette. Where does the second $\pi a^2$ come from?`,
      visual: scatPic({ target: 'hard', ka: 10, panels: ['polar'] }, 'A hard sphere at ka = 10: dσ/dΩ as a polar diagram, beam from the left.'),
      choices: [
        'A narrow forward diffraction peak: to cast a sharp shadow, the scattered wave must cancel the incident wave behind the sphere, and that wave counts as scattered',
        'Particles that hit the sphere bounce twice',
        'Back-scattering doubles at high energy',
        'The sphere’s effective radius grows to √2 a',
      ],
      answer: 0,
      why: {
        1: 'Reflection off the surface accounts for πa² once — the classical part.',
        2: 'The reflected part is nearly isotropic, as for a classical hard sphere; the extra half sits in the forward peak.',
        3: 'The size does not change; the extra area is diffraction.',
      },
      hints: ['Look at the forward spike in the picture. What must happen in the region right behind the sphere?', 'A shadow is a place where the total wave is zero, so the scattered wave must be equal and opposite to the incident one there.'],
      teach: 'Shadow scattering: every obstacle that casts a shadow removes as much again in a forward diffraction peak, so σ = 2 × the silhouette at short wavelengths.',
      explain: t`Half of $2\pi a^2$ is reflection, spread nearly evenly over angles as for a classical sphere. The other half is the forward peak of angular width $\sim 1/ka$ — the wave that interferes destructively with the beam to make the shadow. The same “extinction paradox” gives a raindrop an extinction cross section of twice its area.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vanadium', difficulty: 2, transfer: true,
      gen(r) {
        const [el, b, use] = r.pick([['vanadium', -0.3824, 'sample cans'], ['aluminium', 3.449, 'windows and the walls of sample environments'], ['nickel', 10.3, 'neutron supermirrors']]);
        const ans = (4 * Math.PI * b * b) / 100;
        return {
          prompt: t`Neutron diffractometers choose materials by their coherent scattering length. For ${el}, $b = ${b}$ fm, which is why it is used for ${use}. What coherent cross section $4\pi b^2$ does that give, in barns?`,
          visual: geomPic(90, 'A diffractometer: neutrons scattered by the sample (and anything around it) reach a detector bank. Schematic.'),
          answer: ans, units: 'b', tol: { rel: 0.01 },
          errors: [{ value: (Math.PI * b * b) / 100, feedback: t`Integrate over $4\pi$ steradians: $\sigma = 4\pi b^2$.` }],
          hints: [t`$\sigma = 4\pi b^2$, and $1\ \text{b} = 100\ \text{fm}^2$.`],
          teach: 'A tiny or zero scattering length makes a material nearly invisible to neutron diffraction; a large one makes a good neutron mirror.',
          explain: t`$4\pi(${b})^2 = ${fmt(ans * 100, 3)}\ \text{fm}^2 = ${fmt(ans, 3)}$ b. ${b < 0 ? 'The negative sign means the nucleus pulls the wave’s phase the other way — and alloying a negative-b metal with a positive-b one can cancel coherent scattering almost entirely.' : (el === 'nickel' ? 'Nickel’s large b gives neutrons a large refractive-index contrast, so nickel layers reflect them at grazing angles.' : 'Aluminium scatters only weakly and absorbs very little, so neutrons pass through its walls almost untouched.')}`,
        };
      },
    }),
    num({
      id: 'cp-rate', difficulty: 2,
      gen(r) {
        const dsig = r.pick([0.5, 2, 8]), Ndot = r.pick([1e9, 1e10]), n = r.pick([1e22, 5e22]), dO = r.pick([1e-3, 5e-3]);   // mb/sr, particles/s, nuclei/cm²
        const ans = Ndot * n * 1e4 * dsig * 1e-31 * dO;
        return {
          prompt: t`A beam of $${tex(Ndot, 1)}$ particles per second crosses a thin target with $${tex(n, 1)}$ nuclei per cm² of its area. If $d\sigma/d\Omega = ${dsig}$ mb/sr at the detector’s angle and the detector subtends $${tex(dO, 1)}$ sr, what is its count rate, per second?`,
          visual: geomPic(30, 'Beam, thin target and detector (schematic).'),
          answer: ans, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: ans * 1e3, feedback: '1 mb = 10⁻³ b = 10⁻³¹ m².' }, { value: ans / 1e4, feedback: 'Convert nuclei per cm² to per m² (×10⁴).' }],
          hints: [t`For a thin target: rate $= \dot N_{\text{beam}}\times n\times\dfrac{d\sigma}{d\Omega}\times\Delta\Omega$, with $n$ the nuclei per unit area.`],
          teach: 'With a thin target the fraction of beam particles scattered into ΔΩ is n·(dσ/dΩ)·ΔΩ.',
          explain: t`$${tex(Ndot, 1)}\times${tex(n * 1e4, 1)}\ \text{m}^{-2}\times${tex(dsig * 1e-31, 1)}\ \text{m}^2\text{/sr}\times${tex(dO, 1)}\ \text{sr} = ${tex(ans, 3)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-iso', difficulty: 2,
      prompt: t`Thermal neutrons ($\lambda \approx 0.18$ nm) scatter from a single nucleus (radius a few fm). What angular distribution do you expect, and why?`,
      visual: scatPic({ target: 'well', ka: 0.1, g: 1.2, panels: ['polar'] }, 'Scattering from an attractive well at ka = 0.1 (polar diagram, beam from the left).'),
      choices: [
        t`Isotropic: $ka \sim 10^{-4}$, so only the l = 0 (s-wave) part scatters and $f$ is independent of angle`,
        'Sharply forward-peaked, because the neutron is fast',
        'Backward-peaked, because the nucleus repels it',
        'Zero: a wave much longer than the target passes straight through',
      ],
      answer: 0,
      why: {
        1: 'Forward peaking needs ka ≫ 1, a wave short compared with the target.',
        2: 'Without a short wavelength there is no angular structure, forward or backward; and the strong force is attractive.',
        3: t`The wave does scatter, with $\sigma = 4\pi b^2$ of a few barns, but evenly in angle.`,
      },
      hints: [t`Compare the wavelength with the nuclear size: what is $ka$?`],
      teach: 'When the wave is much longer than the target, only the s-wave scatters and the angular distribution is flat.',
      explain: t`$k = 2\pi/\lambda \approx 3.5\times10^{10}\ \text{m}^{-1}$ and $a \approx 5$ fm give $ka \approx 2\times10^{-4}$. Partial waves with $l \ge 1$ are suppressed by $(ka)^{2l}$, so the scattering is isotropic with $f = -b$ — the reason nuclear scattering of slow neutrons is described by a single number per isotope.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §10.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST Center for Neutron Research, neutron scattering lengths and cross sections (Sears 1992)', url: 'https://www.ncnr.nist.gov/resources/n-lengths/' },
  ],
});
