// The deflection angle 4GM/(c²b) from null geodesics — Derivation Mode.
// For light the normalization is 0: (du/dφ)² = 1/b² − u²(1 − 2Mu) with
// b = L/E, so u'' + u = 3Mu². Zeroth order u₀ = sin φ/b (a straight line at
// distance b); first order u₁ = (M/b²)(1 + cos²φ); u = 0 at φ = −2M/b and
// π + 2M/b, so α = 4M/b: 1.751″ at the solar limb. Checked with SymPy (the
// orbit equation, u₁) and numerically (RK4/solve_ivp on the exact equation:
// 4M/b + 15πM²/4b² agrees to 10⁻⁵ at b = 10³M; time-curvature alone and
// space-curvature alone each give 2M/b; a particle of speed v gets
// (2M/b)(1 + 1/v²); a ray grazing a 1.4 M☉, 12 km neutron star bends 61°
// exactly against 32° at first order). G = c = 1 inside the derivation.
// Avoids gr.S24.i's grazing, elongation, Einstein-radius, microlensing,
// shadow and focus items, gr.EQ.12's grazing item and gr.EQ.14's capture item.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { C, GM_SUN, M_SUN, R_SUN, AU, ARCSEC, sci, round, deflection } from './_classic.js';

const t = String.raw;

const LIMB = (4 * M_SUN) / R_SUN;                              // rad
const M_NS = (m) => m * M_SUN;                                 // neutron-star mass as a length, m

// a ray of light bent by a mass at the origin, first-order solution (G = c = 1, units of M)
const rayCurve = (b) => ({ polar: `1/(sin(theta)/${b} + (1 + cos(theta)^2)/${b}^2)`, theta: [`-1.9/${b}`, `pi + 1.9/${b}`] });
const rayPic = ({ b = 10, caption, marks = true } = {}) => {
  const r0 = round((b * b) / (b + 1), 4);
  return {
    type: 'graph',
    params: {
      x: [-30, 30], y: [-5, 17], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: 'sqrt(max(4 - x^2, 0))', lower: '-sqrt(max(4 - x^2, 0))', from: -2, to: 2, color: '#000000', alpha: 0.9 }],
      curves: [
        { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2 },
        { fn: String(b), domain: [-30, 30], color: 'ink4', dash: true, width: 1.2 },
        { ...rayCurve(b), color: 'gold', width: 2.4 },
      ],
      ...(marks ? {
        arrows: [
          { from: [0, 0], to: [0, r0], color: 'bad', label: 'r₀', labelDx: 8, labelDy: 18 },
          { from: [-22, 0], to: [-22, b], color: 'ink3', label: 'b', labelDx: 8, labelDy: 18 },
        ],
        points: [{ x: 0, y: r0, color: 'bad', r: 4 }, { x: -27, y: b, r: 0.01, color: 'ink3', label: 'straight line at distance b', labelDx: 0, labelDy: -10 }],
      } : {}),
    },
    caption: caption ?? t`A ray passing a black hole (horizon in black) with impact parameter $b = ${b}M$, drawn from the first-order solution $u = \sin\phi/b + (M/b^2)(1 + \cos^2\phi)$ ($G = c = 1$). Dashed: the straight line it would follow without the mass.`,
  };
};

// deflection against impact parameter: first and second order, and exact values
const EXACT_B = [6, 7, 8, 10, 12, 15, 20, 25, 30, 40];
const alphaGraph = {
  type: 'graph',
  params: {
    x: [5, 42], y: [0, 1.8], xlabel: 'b / M', ylabel: 'deflection α (radians)',
    curves: [
      { fn: '4/x', domain: [5.2, 42], color: 'accent', label: '4M/b', labelAt: 30, labelDy: -12 },
      { fn: '4/x + 15*pi/(4*x^2)', domain: [5.2, 42], color: 'gold', dash: true, width: 1.8, label: '+ 15πM²/4b²', labelAt: 12.5, labelDx: 6, labelDy: -6 },
    ],
    points: EXACT_B.map((b) => ({ x: b, y: round(deflection(b), 5), color: 'bad', r: 3.5 })),
    vlines: [{ x: round(Math.sqrt(27), 5), label: '3√3 M' }],
  },
  caption: t`Deflection against impact parameter ($G = c = 1$): first order (blue), with the next term (gold dashed), and the exact value from integrating $u'' + u = 3Mu^2$ numerically (red dots). Below $b = 3\sqrt3\,M$ light is captured.`,
};

// forcing on the first-order equation, against the straight-line solution
const forcingPic = {
  type: 'graph',
  params: {
    x: [0, 3.3], y: [0, 1.15], xlabel: 'φ (radians)', ylabel: '(scaled)',
    curves: [
      { fn: 'sin(x)', domain: [0, 3.1416], color: 'accent', label: 'u₀ · b = sin φ', labelAt: 0.5, labelDx: 8, labelDy: -6 },
      { fn: 'sin(x)^2', domain: [0, 3.1416], color: 'gold', label: '3Mu₀² · b²/3M = sin² φ', labelAt: 2.1, labelDx: 6, labelDy: -12 },
    ],
    vlines: [{ x: 3.1416, label: 'π' }],
  },
  caption: t`Along the straight line ($0 < \phi < \pi$), the right side $3Mu_0^2$ of the first-order equation, scaled: it pulls the ray inward most at closest approach, $\phi = \pi/2$.`,
};

// the weak-field metric: time part and space part bent by the same amount
const halvesPic = {
  type: 'graph',
  params: {
    x: [0, 40], y: [0.6, 1.45], xlabel: 'r / M', ylabel: '',
    curves: [
      { fn: '1 - 2/x', domain: [4, 40], color: 'gold', label: '−g_tt = 1 − 2M/r  (time)', labelAt: 22, labelDy: 16 },
      { fn: '1 + 2/x', domain: [4, 40], color: 'accent', label: 'g_rr ≈ 1 + 2M/r  (space)', labelAt: 22 },
    ],
    hlines: [{ y: 1, label: 'flat' }],
  },
  caption: t`Far from a mass ($G = c = 1$) the time part and the radial space part of the Schwarzschild metric depart from flat by the same amount, $2M/r$, in opposite directions.`,
};

// slower particles bend more (exaggerated)
const speedsPic = {
  type: 'graph',
  params: {
    x: [-7, 9.5], y: [-1.6, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'gold', alpha: 0.85 }],
    curves: [
      { fn: '1.1', domain: [-7, 9.5], color: 'ink4', dash: true, width: 1 },
      { fn: '1.1 - 0.08*(x + sqrt(x^2 + 1.21))', domain: [-7, 9.5], color: 'accent', width: 2.2, label: 'light', labelAt: 6.8, labelDy: 14 },
      { fn: '1.1 - 0.2*(x + sqrt(x^2 + 1.21))', domain: [-7, 9.5], color: 'violet', width: 2.2, label: 'slower particle', labelAt: 4.2, labelDx: 6, labelDy: 10 },
    ],
  },
  caption: 'Light and a slower particle passing the Sun on the same line, with the bending hugely exaggerated; dashed, the undeflected path. Not to scale.',
};

// a ray grazing a neutron star: the first-order shape, scaled so that it skims the surface (angle not to scale)
const nsPic = (m, Rk) => ({
  type: 'graph',
  params: {
    x: [-6, 6], y: [-4.2, 2.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'violet', alpha: 0.8 }],
    curves: [
      { fn: '1.3', domain: [-6, 6], color: 'ink4', dash: true, width: 1 },
      { polar: '1/(sin(theta)/1.3 + 0.39*(1 + cos(theta)^2)/1.69)', theta: [-0.5, 3.6416], color: 'gold', width: 2.2 },
    ],
    points: [{ x: 0, y: -1.45, r: 0.01, color: 'violet', label: `neutron star: ${m} M☉, R = ${Rk} km`, labelDx: -84, labelDy: 0 }],
  },
  caption: 'A ray of light skimming the surface of a neutron star, bent toward it on the way in and on the way out; dashed, the undeflected line. The angle is not to scale — see the answer.',
});

// radar to a planet at superior conjunction, grazing the Sun (not to scale)
const shapiroPic = (name, dist) => ({
  type: 'graph',
  params: {
    x: [-1.35, round(dist + 0.45, 4)], y: [-0.55, 0.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: [`-1 + ${round(dist + 1, 4)}*t`, '0.085'], t: [0, 1], color: 'gold', width: 1.8 }],
    points: [
      { x: -1, y: 0, color: 'teal', r: 5, label: 'Earth', labelDx: -16, labelDy: 20 },
      { x: 0, y: 0, color: 'gold', r: 9, label: 'Sun', labelDx: -12, labelDy: 24 },
      { x: dist, y: 0, color: 'bad', r: 4, label: name, labelDx: -20, labelDy: 20 },
      { x: -0.5, y: 0.085, r: 0.01, color: 'gold', label: 'radar pulse', labelDx: -30, labelDy: -10 },
    ],
  },
  caption: `Radar pulses from Earth to ${name} and back, passing just outside the Sun when ${name} is on the far side of it (superior conjunction). Distances along the line to scale; the Sun and planets not.`,
});

export default lesson({
  id: 'gr.S24.d',
  title: 'The deflection angle 4GM/(c²b) from null geodesics',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Light follows null geodesics. Redo step 25's derivation with the normalization $0$ in place of $-1$ and the orbit equation loses its Newtonian term entirely, leaving the equation above. Its solution with no mass is a straight line, $u = \sin\phi/b$, passing the centre at distance $b$, the **impact parameter**; the right side bends it. To first order in $M/b$ the ray turns through $\alpha = 4M/b$ — in SI units $4GM/(c^2b)$, $${sci(LIMB / ARCSEC, 4)}''$ for a ray grazing the Sun — twice what Newton's gravity gives a particle moving at $c$.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$**, so $M$ means $GM/c^2$; $u = 1/r$, and the ray lies in the plane $\theta = \pi/2$.`,
  equation: t`\frac{d^2u}{d\phi^2} + u = 3Mu^2 \quad\Longrightarrow\quad \alpha = \frac{4M}{b}`,
  symbols: [
    { tex: 'u', text: t`$1/r$, the reciprocal of the areal radius, as a function of the angle $\phi$ around the mass` },
    { tex: '\\phi', text: 'the angle around the mass in the plane of the ray, in radians' },
    { tex: '3Mu^2', text: t`the only term left on the right for light: it comes from the $-2ML^2/r^3$ of the effective potential` },
    { tex: 'M', text: t`the mass as a length, $GM/c^2$: 1476.6 m for the Sun` },
    { tex: 'b', text: t`the impact parameter $L/E$: how far from the centre the incoming straight line would pass. Only the ratio of $L$ to $E$ matters for light` },
    { tex: '\\alpha', text: t`the total deflection: the angle between the incoming and outgoing directions, in radians (1 rad = 206 265″)` },
  ],
  why: t`The factor of two is the signature of curved space as well as curved time, so light bending measures the parameter $\gamma$ of every metric theory — and it is the physics of every gravitational lens.`,
  visual: {
    type: 'graph',
    title: 'Bend a ray',
    lead: t`A ray of light passing a black hole, drawn from the first-order solution; dashed, the straight line it would follow without the mass. Change the impact parameter $b$ (in units of $M$, with $G = c = 1$) and read the deflection.`,
    tasks: [
      'At b = 20M the ray turns by 11°: both ends tilt toward the mass, half the bending on the way in and half on the way out.',
      'Halve b to 10M: the deflection doubles — it goes as 1/b.',
      'Close in, near b = 6M, the next term is already large and the first-order picture fails: the exact ray turns by about 98°, and below b = 3√3 M ≈ 5.2M light is captured.',
    ],
    params: {
      x: [-30, 30], y: [-5, 22], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [{ key: 'b', label: 'Impact parameter $b$', min: 6, max: 20, step: 0.1, value: 12, unit: 'M', explain: 'How far from the centre the undeflected straight line would pass, in units of $M = GM/c^2$.' }],
      shade: [{ fn: 'sqrt(max(4 - x^2, 0))', lower: '-sqrt(max(4 - x^2, 0))', from: -2, to: 2, color: '#000000', alpha: 0.9 }],
      curves: [
        { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2 },
        { fn: 'b', domain: [-30, 30], color: 'ink4', dash: true, width: 1.2 },
        { polar: '1/(sin(theta)/b + (1 + cos(theta)^2)/b^2)', theta: ['-1.9/b', 'pi + 1.9/b'], color: 'gold', width: 2.4 },
      ],
      readouts: [
        { label: 'first order, $4M/b$', expr: '4/b*180/pi', unit: '^\\circ', digits: 3 },
        { label: 'with the next term, $+15\\pi M^2/4b^2$', expr: '(4/b + 15*pi/(4*b^2))*180/pi', unit: '^\\circ', digits: 3 },
      ],
    },
    caption: t`First-order solution of $u'' + u = 3Mu^2$, drawn to scale in units of $M$ (black: the horizon, $2M$). It is accurate far out; within about $20M$ the true bending is noticeably larger (see the practice).`,
  },
  example: {
    prompt: t`Derive the deflection of light passing a mass $M$ with impact parameter $b \gg M$, and evaluate it for a ray grazing the Sun.`,
    visual: rayPic({ b: 10, marks: false }),
    steps: [
      { label: 'The orbit equation for light', text: t`With $E = (1 - 2M/r)\,dt/d\lambda$ and $L = r^2\,d\phi/d\lambda$ conserved as before, the null condition $g_{\mu\nu}\dfrac{dx^\mu}{d\lambda}\dfrac{dx^\nu}{d\lambda} = 0$ gives
$$\left(\frac{du}{d\phi}\right)^2 = \frac{1}{b^2} - u^2(1 - 2Mu), \qquad b = \frac{L}{E}.$$
Differentiating, $u'' + u = 3Mu^2$.` },
      { label: 'What b is', text: t`Far away ($u \to 0$) the right side vanishes and $u'^2 \to 1/b^2$: the ray is straight, $u = \sin(\phi - \phi_0)/b$, that is $r\sin(\phi - \phi_0) = b$ — a line passing the centre at distance $b$. For light only the ratio $L/E$ ever appears.` },
      { label: 'Zeroth order', text: t`With $M = 0$: $u_0 = \sin\phi/b$, a straight line coming in from $\phi = \pi$ and leaving toward $\phi = 0$.` },
      { label: 'First order', text: t`$u_1'' + u_1 = 3Mu_0^2 = \dfrac{3M}{b^2}\sin^2\phi = \dfrac{3M}{2b^2}(1 - \cos2\phi)$. A constant and a $\cos2\phi$ term need a constant and a $\cos2\phi$ response:
$$u_1 = \frac{3M}{2b^2} + \frac{M}{2b^2}\cos2\phi = \frac{M}{b^2}\left(1 + \cos^2\phi\right).$$
(Nothing resonates here, unlike the orbit of step 25.)` },
      { label: 'Where the ray escapes', text: t`The ray reaches infinity where $u = 0$. Near $\phi = 0$: $u \approx \dfrac{\phi}{b} + \dfrac{2M}{b^2} = 0$ gives $\phi = -\dfrac{2M}{b}$; by symmetry the other end is at $\pi + \dfrac{2M}{b}$. The ray sweeps $\pi + 4M/b$ instead of $\pi$:
$$\alpha = \frac{4M}{b} = \frac{4GM}{c^2b}.$$` },
      { label: 'The Sun', text: t`$b = R_\odot = 6.957\times10^{8}$ m and $M = 1476.6$ m: $\alpha = ${sci(LIMB, 4)}$ rad $= ${sci(LIMB / ARCSEC, 4)}''$. The 1919 eclipse plates favoured this over the "Newtonian" $${sci(LIMB / 2 / ARCSEC, 3)}''$; radio interferometry now confirms it to a few parts in $10^4$.` },
      { label: 'Why twice Newton', text: t`A Newtonian particle passing at speed $v$ turns by $2GM/(bv^2)$ to first order — $2M/b$ at $v = c$. Far from the mass the metric is $-(1 - 2M/r)dt^2 + (1 + 2M/r)(dx^2 + dy^2 + dz^2)$: the time part alone bends light by $2M/b$, and the curvature of space adds another $2M/b$ (both checked by integrating each separately). Metric theories write it as $\tfrac12(1 + \gamma)\cdot4M/b$; general relativity has $\gamma = 1$.` },
      { label: 'Check the approximation', text: t`Integrating the exact equation numerically: at $b = 1000M$ the deflection is $0.0040118$, against $4M/b = 0.0040000$ and $4M/b + 15\pi M^2/(4b^2) = 0.0040118$. The next term is $(15\pi/16)(M/b)$ of the first: about $${sci((15 * Math.PI) / 16 * (M_SUN / R_SUN), 1)}$ at the Sun's limb, a few microarcseconds.` },
    ],
    answer: t`$\alpha = 4M/b = 4GM/(c^2b)$, from the first-order solution $u = \sin\phi/b + (M/b^2)(1 + \cos^2\phi)$ of $u'' + u = 3Mu^2$: $${sci(LIMB / ARCSEC, 4)}''$ for a ray grazing the Sun.`,
  },
  practice: [
    expr({
      id: 'b-from-r0', difficulty: 2,
      prompt: t`A ray's closest approach to the centre is $r_0$ — a turning point, where $du/d\phi = 0$. Use $\left(\dfrac{du}{d\phi}\right)^2 = \dfrac{1}{b^2} - u^2(1 - 2Mu)$ to express the impact parameter $b$ in terms of $r_0$ and $M$ ($G = c = 1$). Type $r_0$ as \`r_0\`.`,
      answer: 'r_0/sqrt(1 - 2M/r_0)', answerTeX: t`\frac{r_0}{\sqrt{1 - 2M/r_0}}`, lhs: 'b',
      vars: { r_0: [4, 20], M: [0.5, 1.2] },
      errors: [
        { answer: 'r_0 sqrt(1 - 2M/r_0)', feedback: t`Upside down: $1/b^2 = u_0^2(1 - 2Mu_0)$, so $b = r_0/\sqrt{1 - 2M/r_0}$, larger than $r_0$.` },
        { answer: 'r_0', feedback: t`That is flat space. Gravity pulls the ray in, so its closest approach is smaller than $b$.` },
        { answer: 'r_0/(1 - 2M/r_0)', feedback: t`Take the square root: the equation fixes $1/b^2$.` },
      ],
      hints: [t`At the turning point $u = u_0 = 1/r_0$: $0 = \dfrac{1}{b^2} - \dfrac{1}{r_0^2}\left(1 - \dfrac{2M}{r_0}\right)$.`],
      teach: 'Gravity pulls a ray inward, so its closest approach r₀ lies inside its impact parameter: b = r₀/√(1 − 2M/r₀).',
      explain: t`$\dfrac{1}{b^2} = \dfrac{1}{r_0^2}\left(1 - \dfrac{2M}{r_0}\right)$, so $b = \dfrac{r_0}{\sqrt{1 - 2M/r_0}}$. Far from the mass $b \approx r_0 + M$; for a ray skimming the photon sphere, $r_0 = 3M$ gives $b = 3\sqrt3\,M$ — the edge of a black hole's shadow.`,
      visual: rayPic({ b: 10 }),
    }),
    expr({
      id: 'first-order', difficulty: 3,
      prompt: t`Put $u = \dfrac{\sin\phi}{b} + u_1$ into $u'' + u = 3Mu^2$ and keep only first-order terms: $u_1'' + u_1 = \dfrac{3M}{b^2}\sin^2\phi$. Find the particular solution $u_1$ that contains no $\sin\phi$ or $\cos\phi$ terms. (Hint: $\sin^2\phi = \tfrac12(1 - \cos2\phi)$.) Use $M$, $b$, \`phi\`.`,
      answer: '3M/(2b^2) + M cos(2phi)/(2b^2)', answerTeX: t`\frac{3M}{2b^2} + \frac{M}{2b^2}\cos2\phi`, lhs: 'u_1',
      vars: { M: [0.5, 1.5], b: [5, 20], phi: [0.2, 3] },
      errors: [
        { answer: '3M/(2b^2) - M cos(2phi)/(2b^2)', feedback: t`For $u_1 = A\cos2\phi$: $u_1'' + u_1 = -3A\cos2\phi$. Matching $-\dfrac{3M}{2b^2}\cos2\phi$ gives $A = +\dfrac{M}{2b^2}$.` },
        { answer: '3M/(2b^2)', feedback: t`That answers the constant part only. The $\cos2\phi$ part of the forcing needs its own response.` },
        { answer: '3M sin(phi)^2/b^2', feedback: t`That is the forcing itself. Try $u_1 = A + B\cos2\phi$ and match coefficients.` },
      ],
      hints: [t`The forcing is $\dfrac{3M}{2b^2} - \dfrac{3M}{2b^2}\cos2\phi$. Try $u_1 = A + B\cos2\phi$.`, t`$(B\cos2\phi)'' + B\cos2\phi = -3B\cos2\phi$, so $A = \dfrac{3M}{2b^2}$ and $-3B = -\dfrac{3M}{2b^2}$.`],
      teach: 'A forcing at a frequency the left side does not ring at gets a response at the same frequency, scaled by 1/(1 − n²).',
      explain: t`$A = \dfrac{3M}{2b^2}$, $B = \dfrac{M}{2b^2}$: $u_1 = \dfrac{3M}{2b^2} + \dfrac{M}{2b^2}\cos2\phi = \dfrac{M}{b^2}(1 + \cos^2\phi)$ (checked with SymPy). At closest approach, $\phi = \pi/2$, it adds $M/b^2$ to $u$: the ray comes in about $M$ closer than $b$.`,
      visual: forcingPic,
    }),
    expr({
      id: 'escape', difficulty: 2,
      prompt: t`The first-order ray is $u = \dfrac{\sin\phi}{b} + \dfrac{M}{b^2}(1 + \cos^2\phi)$. It escapes to infinity where $u = 0$. Near $\phi = 0$, with $\sin\phi \approx \phi$ and $\cos^2\phi \approx 1$, at what small angle $\phi_\text{out}$ does that happen? Use $M$ and $b$.`,
      answer: '-2M/b', answerTeX: t`-\frac{2M}{b}`, lhs: t`\phi_\text{out}`,
      vars: { M: [0.5, 1.5], b: [20, 200] },
      errors: [
        { answer: '-4M/b', feedback: t`That is the total deflection, from both ends. One end tilts by $2M/b$.` },
        { answer: '2M/b', feedback: t`$\phi/b + 2M/b^2 = 0$ needs $\phi < 0$: the outgoing end dips below $\phi = 0$, bent toward the mass.` },
        { answer: '-M/b', feedback: t`Near $\phi = 0$, $1 + \cos^2\phi \approx 2$, so the constant is $2M/b^2$.` },
      ],
      hints: [t`$u \approx \dfrac{\phi}{b} + \dfrac{2M}{b^2}$ near $\phi = 0$. Set it to zero.`],
      teach: 'Each end of the ray tilts toward the mass by 2M/b, so the total deflection is 4M/b.',
      explain: t`$\phi/b + 2M/b^2 = 0$ gives $\phi_\text{out} = -2M/b$. By symmetry the incoming end is at $\pi + 2M/b$, so the ray sweeps $\pi + 4M/b$: a total deflection $\alpha = 4M/b$.`,
      visual: rayPic({ b: 10, marks: false, caption: t`The first-order ray for $b = 10M$ ($G = c = 1$). Far to the right it leaves along a line tilted slightly below the horizontal — toward the mass.` }),
    }),
    num({
      id: 'next-term', difficulty: 3,
      gen(r) {
        const f = r.pick([0.05, 0.1, 0.2]);
        const b = (15 * Math.PI) / (16 * f);
        return {
          prompt: t`Carrying the expansion one order further gives $\alpha = \dfrac{4M}{b} + \dfrac{15\pi M^2}{4b^2} + \dots$ ($G = c = 1$). At what impact parameter, in units of $M$, is the second term ${Math.round(f * 100)}% of the first?`,
          answer: b, tol: { rel: 0.005 },
          errors: [
            { value: 15 / (16 * f), feedback: t`Keep the $\pi$: the ratio of the terms is $\dfrac{15\pi M}{16 b}$.` },
            { value: (15 * Math.PI) / (4 * f), feedback: t`Divide by the first term, $4M/b$, not by $M/b$: the ratio is $\dfrac{15\pi M^2/4b^2}{4M/b} = \dfrac{15\pi M}{16b}$.` },
          ],
          hints: [t`The ratio of the two terms is $\dfrac{15\pi M^2/(4b^2)}{4M/b} = \dfrac{15\pi}{16}\,\dfrac{M}{b}$.`, t`Set $\dfrac{15\pi}{16}\dfrac{M}{b} = ${f}$ and solve for $b$.`],
          teach: 'Each order of the expansion is smaller by about M/b: first-order results fail within a few tens of M.',
          explain: t`$b = \dfrac{15\pi}{16\times${f}}M = ${sci(b, 3)}M$. There the exact deflection (red dots in the picture) is larger still than the two-term value; at $b = 10M$ the first-order $4M/b$ misses a third of it. For the Sun, $M/b \approx 2\times10^{-6}$ and the second term is a few microarcseconds.`,
          visual: alphaGraph,
        };
      },
    }),
    mcq({
      id: 'halves', difficulty: 3,
      prompt: t`Far from a mass the Schwarzschild metric is nearly $-(1 - 2M/r)\,dt^2 + (1 + 2M/r)\,dr^2 + r^2d\Omega^2$. Suppose only the time part were curved — space exactly flat, $g_{rr} = 1$. Redoing the derivation, what deflection would light get?`,
      choices: [
        t`$2M/b$: half, the same as a Newtonian particle at speed $c$; the curvature of space supplies the other half`,
        t`$4M/b$: light bending comes entirely from the time part`,
        t`Zero: without curved space a ray stays straight`,
        t`$8M/b$: removing the spatial term removes its opposing effect`,
      ],
      answer: 0,
      why: {
        1: t`Integrating with $g_{rr} = 1$ gives $2M/b$ (checked numerically). The time part and the space part each contribute half.`,
        2: t`Curved time alone already bends light: it is the equivalence-principle bending, $2M/b$, that Einstein found in 1911.`,
        3: t`The spatial curvature bends light the same way as the time part, adding to it; nothing is cancelled.`,
      },
      hints: [t`Einstein's 1911 calculation used only the equivalence principle — clocks running slow low down — and got half of today's value.`, t`With $g_{rr} = 1$: $(du/d\phi)^2 = \dfrac{1}{b^2(1 - 2Mu)} - u^2 \approx \dfrac{1}{b^2} + \dfrac{2Mu}{b^2} - u^2$. What is $u''$?`],
      teach: 'Light bending is half curved time and half curved space; that is why it measures the space-curvature parameter γ.',
      explain: t`With flat space, $u'' + u \approx M/b^2$, whose straight-line-plus-constant solution $\sin\phi/b + M/b^2$ escapes at $\phi = -M/b$: a total of $2M/b$, Einstein's 1911 value (0.83″ for the Sun, with the constants he used). Space-curvature alone gives another $2M/b$. In a metric theory with parameter $\gamma$ the total is $(1 + \gamma)\,2M/b$; light-bending and Cassini's radio delay measurements give $\gamma = 1$ to about $2\times10^{-5}$.`,
      visual: halvesPic,
    }),
    num({
      id: 'massive', difficulty: 3,
      gen(r) {
        const [what, v] = r.pick([['a proton moving at half the speed of light', 0.5], ['an electron moving at 0.8c', 0.8], ['a particle moving at 0.3c', 0.3]]);
        const x = ((2 * M_SUN) / R_SUN) * (1 + 1 / (v * v)) / ARCSEC;
        return {
          prompt: t`For a particle with speed $v$ far away (in units of $c$), $E = 1/\sqrt{1 - v^2}$ and $L = bv/\sqrt{1 - v^2}$, and the orbit equation keeps its $M/L^2$ term. The same first-order calculation then gives $\alpha = \dfrac{2M}{b}\left(1 + \dfrac{1}{v^2}\right)$. By how many arcseconds does the Sun deflect ${what}, passing at $b = R_\odot = 6.957\times10^{8}$ m? ($GM_\odot/c^2 = 1476.6$ m)`,
          answer: x, units: 'arcsec', tol: { rel: 0.01 },
          errors: [
            { value: LIMB / ARCSEC, feedback: t`That is light's value. A slower particle bends more: the factor is $1 + 1/v^2$, not 2.` },
            { value: ((2 * M_SUN) / R_SUN) * (1 / (v * v)) / ARCSEC, feedback: t`That is Newton's value, $2M/(bv^2)$. General relativity adds $2M/b$ on top: the $1 +$ in the bracket.` },
          ],
          hints: [t`$2M/b = 2\times1476.6/6.957\times10^{8} = ${sci((2 * M_SUN) / R_SUN, 4)}$ rad.`, t`Multiply by $1 + 1/${v}^2 = ${sci(1 + 1 / (v * v), 4)}$, then by 206 265.`],
          teach: 'Slow particles bend more than light: α = (2M/b)(1 + 1/v²), which tends to 4M/b as v → c and to Newton’s 2M/(bv²) as v → 0.',
          explain: t`$\alpha = ${sci((2 * M_SUN) / R_SUN, 4)}\times${sci(1 + 1 / (v * v), 4)} = ${sci(x / 206264.806, 4)}$ rad $= ${sci(x, 3)}''$. The $M/L^2 = M(1 - v^2)/(b^2v^2)$ term adds $-M(1 - v^2)/(bv^2)$ to each escape angle, on top of light's $-2M/b$ (the formula was checked by integrating the exact equation). At $v = 1$ it is light's $4M/b$; for $v \ll 1$, Newton's $2M/(bv^2)$.`,
          visual: speedsPic,
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-ring', difficulty: 3, transfer: true,
      prompt: t`A galaxy (the lens, mass $M$, distance $D_L$) lies exactly in front of a more distant source (distance $D_S$; lens to source $D_{LS}$). Light from the source passes the lens at impact parameter $b = \theta D_L$, where $\theta$ is the angle at which you see it, and is bent by $4M/b$. For it to reach you, small-angle geometry requires $\alpha D_{LS} = \theta D_S$. Solve for $\theta$ — the angular radius of the Einstein ring ($G = c = 1$). Type the distances as \`D_L\`, \`D_S\`, \`D_LS\`.`,
      answer: 'sqrt(4M D_LS/(D_L D_S))', answerTeX: t`\sqrt{\frac{4M\,D_{LS}}{D_L D_S}}`, lhs: t`\theta_E`,
      vars: { M: [0.5, 2], D_L: [1, 3], D_S: [4, 8], D_LS: [1, 4] },
      errors: [
        { answer: 'sqrt(4M D_L/(D_LS D_S))', feedback: t`Check which distance multiplies which angle: the bending happens at the lens and acts over the lens-to-source distance $D_{LS}$.` },
        { answer: '4M D_LS/(D_L D_S)', feedback: t`That is $\theta_E^2$: $\theta$ appears on both sides, once through $b = \theta D_L$.` },
        { answer: 'sqrt(2M D_LS/(D_L D_S))', feedback: t`Light bends by $4M/b$, not the Newtonian $2M/b$.` },
      ],
      hints: [t`$\dfrac{4M}{\theta D_L}\,D_{LS} = \theta D_S$.`, t`So $\theta^2 = \dfrac{4M\,D_{LS}}{D_L D_S}$.`],
      teach: t`The Einstein-ring radius follows from the deflection $4M/b$ and small-angle geometry: $\theta_E^2 = 4M D_{LS}/(D_L D_S)$.`,
      explain: t`$\theta^2 = 4M D_{LS}/(D_L D_S)$, so $\theta_E = \sqrt{4M D_{LS}/(D_L D_S)}$ — in SI, $\sqrt{4GM D_{LS}/(c^2 D_L D_S)}$. With $4M$ rather than Newton's $2M$ the ring is $\sqrt2$ times larger. (For galaxies far across the universe the $D$'s become angular-diameter distances; the form stays the same.)`,
      visual: { type: 'gr-lensing', params: { beta: 0.04, size: 0.12, system: 'galaxy' }, caption: 'A galaxy almost exactly behind a massive galaxy, ray-traced through a point-mass lens: its light arrives from all round the lens as a nearly complete ring. Drag the source to break the ring.' },
    }),
    num({
      id: 'cp-neutron', difficulty: 3,
      gen(r) {
        const [m, Rk] = r.pick([[1.4, 12], [1.4, 11], [2.0, 12.5]]);
        const M = M_NS(m), R = Rk * 1e3, b = R / Math.sqrt(1 - (2 * M) / R);
        const first = ((4 * M) / b) * (180 / Math.PI), exact = deflection(b / M) * (180 / Math.PI);
        return {
          prompt: t`A ray of light skims the surface of a neutron star of ${m} solar masses and radius ${Rk} km, so its closest approach is $r_0 = R$. Find its impact parameter from $b = r_0/\sqrt{1 - 2M/r_0}$, then the first-order deflection $4M/b$, in degrees. ($GM_\odot/c^2 = 1476.6$ m)`,
          answer: first, units: 'deg', tol: { rel: 0.01 },
          errors: [
            { value: ((4 * M) / R) * (180 / Math.PI), feedback: t`That uses $b = R$. Gravity pulls the ray in, so $b = R/\sqrt{1 - 2M/R}$ is larger than $R$ here — by ${Math.round(100 * (b / R - 1))}%.` },
            { value: first / 2, feedback: t`That is the Newtonian half. Light bends by $4M/b$.` },
          ],
          hints: [t`$M = ${m}\times1476.6$ m $= ${sci(M, 4)}$ m, so $2M/R = ${sci((2 * M) / R, 3)}$.`, t`$b = ${Rk}\ \text{km}/\sqrt{1 - ${sci((2 * M) / R, 3)}} = ${sci(b / 1e3, 4)}$ km; then $4M/b$ in radians times $180/\pi$.`],
          teach: 'Near a neutron star the first-order formula is only a rough guide: the exact bending is about twice as large.',
          explain: t`$b = ${sci(b / 1e3, 4)}$ km $= ${sci(b / M, 3)}M$, so $4M/b = ${sci(first, 3)}^\circ$. Integrating the exact equation gives $${sci(exact, 3)}^\circ$: with $M/b$ as large as $${sci(M / b, 2)}$, the higher-order terms are not small. Neutron stars bend their own light so strongly that more than half of the surface is visible at once — which X-ray astronomers use to measure their radii (NASA's NICER mission).`,
          visual: nsPic(m, Rk),
        };
      },
    }),
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const [name, d] = r.pick([['Mars', 1.524], ['Venus', 0.723], ['Mercury', 0.387]]);
        const T = ((4 * GM_SUN) / C ** 3) * Math.log((4 * AU * d * AU) / R_SUN ** 2);
        return {
          prompt: t`Light passing a mass is delayed as well as bent. Integrating $dt$ along the nearly straight path in the weak-field metric gives an excess round-trip time $\Delta t \approx \dfrac{4GM}{c^3}\ln\dfrac{4r_1r_2}{b^2}$ for a radar pulse between distances $r_1$ and $r_2$ from the Sun, passing it at $b \ll r_1, r_2$. Find $\Delta t$ in microseconds for radar from Earth ($r_1 = 1$ AU) to ${name} ($r_2 = ${d}$ AU) at superior conjunction, grazing the Sun ($b = 6.957\times10^{8}$ m). ($GM_\odot/c^3 = 4.925\ \mu\text{s}$, 1 AU $= 1.496\times10^{11}$ m.)`,
          answer: T * 1e6, units: 'μs', tol: { rel: 0.01 },
          errors: [
            { value: (T * 1e6) / 2, feedback: 'That is one way. Radar measures the round trip: there and back.' },
            { value: ((4 * GM_SUN) / C ** 3) * Math.log((AU * d * AU) / R_SUN ** 2) * 1e6, feedback: t`Keep the 4 inside the logarithm: $\ln(4r_1r_2/b^2)$.` },
          ],
          hints: [t`$\dfrac{4r_1r_2}{b^2} = \dfrac{4\times1.496\times10^{11}\times${sci(d * AU, 4)}}{(6.957\times10^{8})^2} = ${sci((4 * AU * d * AU) / R_SUN ** 2, 4)}$.`, t`Its natural log is $${sci(Math.log((4 * AU * d * AU) / R_SUN ** 2), 4)}$; multiply by $4\times4.925\ \mu\text{s}$.`],
          teach: 'The Shapiro delay of radar grazing the Sun is about a quarter of a millisecond — measured to a few parts in 100 000 by Cassini.',
          explain: t`$\Delta t = 19.70\ \mu\text{s}\times${sci(Math.log((4 * AU * d * AU) / R_SUN ** 2), 4)} = ${sci(T * 1e6, 3)}\ \mu\text{s}$. Irwin Shapiro proposed the test in 1964 and measured it with radar echoes from Mercury and Venus; the Viking landers on Mars confirmed it to 0.1% (1979), and the Cassini spacecraft's radio link pinned $\gamma - 1 = (2.1 \pm 2.3)\times10^{-5}$ (2003) — the best test of space curvature so far.`,
          visual: shapiroPic(name, d),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (light bending)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014), §3.4', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Bertotti, Iess & Tortora, “A test of general relativity using radio links with the Cassini spacecraft”, Nature 425, 374 (2003)', url: 'https://doi.org/10.1038/nature01997' },
  ],
});
