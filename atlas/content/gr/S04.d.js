// Four-velocity, four-momentum and invariants — Derivation Mode.
// u^μ = dx^μ/dτ = γ(c, v) with η_μν u^μ u^ν = −c²; p^μ = m u^μ = (E/c, p) with
// p_μ p^μ = −m²c², i.e. E² = (pc)² + (mc²)². Conservation of p^μ plus the
// invariants solves two-body decays without ever boosting; the dust
// stress–energy T^μν = ρ u^μ u^ν is previewed for step 16.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { M_PI, M_MU, M_K, M_E, M_P, M_TAU, YEAR, sci, round, frames } from './_deriv.js';
import { stressTable } from './_curvature.js';

const t = String.raw;

const DEG = Math.PI / 180;
// two-body decay at rest into a massive daughter m and a massless neutrino: momentum, energy
const decay = (M, m) => { const p = (M * M - m * m) / (2 * M); return { p, E: Math.sqrt(p * p + m * m) }; };
const PI_MU = decay(M_PI, M_MU);

// four-momentum addition in the (pc, E) plane for π⁺ → μ⁺ν at rest
const piDecayPicture = {
  type: 'graph',
  params: {
    x: [-80, 80], y: [0, 165], equal: true, xlabel: 'pc (MeV)', ylabel: 'E (MeV)',
    curves: [
      { fn: `sqrt(x^2 + ${M_MU}^2)`, color: 'violet', label: 'muon mass shell', labelAt: 38, labelDx: 6, labelDy: 14 },
      { fn: 'abs(x)', color: 'warn', dash: true, label: 'massless (light)', labelAt: 52, labelDx: 8, labelDy: 10 },
    ],
    arrows: [
      { from: [0, 0], to: [round(-PI_MU.p), round(PI_MU.E)], color: 'violet', label: 'muon', labelDx: -48, labelDy: -6 },
      { from: [round(-PI_MU.p), round(PI_MU.E)], to: [0, round(M_PI)], color: 'gold' },
      { from: [0, 0], to: [0, round(M_PI)], color: 'accent', label: 'pion at rest', labelDx: 8, labelDy: 0 },
    ],
    points: [{ x: round(-PI_MU.p / 2), y: round((PI_MU.E + M_PI) / 2), r: 0.01, color: 'gold', label: 'neutrino', labelDx: -62, labelDy: -8 }],
  },
  caption: t`Four-momenta add like arrows. In the $(pc, E)$ plane the pion at rest points straight up; the muon’s arrow ends on its mass shell and the neutrino’s runs at 45°, along the light line. Drawn to scale, in MeV.`,
};

// four-velocities (divided by c) of two speeds, both ending on the hyperbola (ct)² − x² = 1
const uPicture = (betas, caption) => {
  const v = frames({ range: 3, xlabel: 'x', ylabel: 'ct', caption, cone: true, segments: betas.map((b) => [0, 0, 4.2, round(4.2 * b), 'ink3']) });
  v.params.curves.push({ param: ['sinh(t)', 'cosh(t)'], t: [-1.9, 1.9], color: 'ink3', width: 1.4 });
  v.params.arrows = betas.map((b, k) => {
    const g = 1 / Math.sqrt(1 - b * b);
    return { from: [0, 0], to: [round(g * b), round(g)], color: ['gold', 'violet'][k], label: `${b}c`, labelDx: 6 };
  });
  return v;
};

// the (pc, E) plane for a massive particle and the light line, with optional points
const shellPicture = (points = [], caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [-0.4, 3.6], y: [0, 3.8], equal: true, xlabel: 'pc / (mc²)', ylabel: 'E / (mc²)',
    curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', label: 'mass shell', labelAt: 2.5, labelDx: -84, labelDy: -10 }, { fn: 'abs(x)', color: 'warn', dash: true, label: 'massless: E = pc', labelAt: 2.6, labelDx: 8, labelDy: 10 }],
    points, ...extra,
  },
  caption,
});

// two photon momenta (× c) at an opening angle, to scale
const photonPair = (E1, E2, deg, caption) => {
  const a = deg * DEG, s = 3.2 / Math.max(E1, E2);
  const p1 = [E1 * s, 0], p2 = [E2 * s * Math.cos(a), E2 * s * Math.sin(a)];
  return {
    type: 'graph',
    params: {
      x: [-3.6, 3.9], y: [-0.6, 3.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: [`0.7*cos(t)`, `0.7*sin(t)`], t: [0, round(a)], color: 'ink3', width: 1.4 }],
      arrows: [
        { from: [0, 0], to: [round(p1[0]), 0], color: 'gold', label: `photon 1: ${E1} GeV`, labelDx: -60, labelDy: 14 },
        { from: [0, 0], to: [round(p2[0]), round(p2[1])], color: 'violet', label: `photon 2: ${E2} GeV`, labelDx: 6, labelDy: -8 },
      ],
      points: [{ x: round(0.9 * Math.cos(a / 2)), y: round(0.9 * Math.sin(a / 2)), r: 0.01, color: 'ink3', label: `${deg}°`, labelDx: 2, labelDy: -2 }],
    },
    caption: caption ?? 'The two photons’ momenta (times c), to scale, and the angle between them.',
  };
};

export default lesson({
  id: 'gr.S04.d',
  title: 'Four-velocity, four-momentum and invariants',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`A particle’s worldline $x^\mu(\tau)$, labelled by its own proper time $\tau$, has a tangent vector $u^\mu = dx^\mu/d\tau$: the **four-velocity**. In a frame where the particle moves at $\vec v$, $u^\mu = \gamma(c, \vec v)$, and its length never changes: $\eta_{\mu\nu}u^\mu u^\nu = -c^2$. Multiply by the mass and you get the **four-momentum** $p^\mu = m\,u^\mu = (E/c, \vec p)$, whose length is the equation above.

Energy and momentum are the time and space parts of one four-vector, conserved together in every collision and decay; **the mass is its invariant length**, the same for every observer. That is enough to solve a decay without ever changing frames.`,
  equation: t`p_\mu p^\mu = -m^2c^2 \quad\Longleftrightarrow\quad E^2 = (pc)^2 + (mc^2)^2`,
  symbols: [
    { tex: 'u^\\mu = dx^\\mu/d\\tau', text: t`the four-velocity: how fast each coordinate changes per second of the particle’s own time. In components $u^\mu = \gamma(c, v_x, v_y, v_z)$, in m/s` },
    { tex: '\\tau', text: 'proper time along the worldline — what a clock riding with the particle reads, in s' },
    { tex: 'p^\\mu', text: t`the four-momentum $m u^\mu = (E/c,\ p_x,\ p_y,\ p_z)$, in kg·m/s` },
    { tex: 'p_\\mu', text: t`the same vector with its index lowered by $\eta$: $p_\mu = \eta_{\mu\nu}p^\nu = (-E/c,\ \vec p)$, so $p_\mu p^\mu = -E^2/c^2 + p^2$` },
    { tex: 'E', text: t`the total energy, $\gamma mc^2$, in joules — or MeV and GeV in particle physics` },
    { tex: 'p', text: t`the size of the ordinary momentum $\vec p = \gamma m\vec v$` },
    { tex: 'm', text: t`the mass, the same in every frame; $m = 0$ for a photon, whose four-momentum has zero length` },
  ],
  why: t`Every object in general relativity moves with a four-velocity, and gravity enters its equation of motion through how $u^\mu$ changes; matter sources gravity through $T^{\mu\nu}$, built from $u^\mu$ (step 16).`,
  visual: {
    type: 'graph',
    title: 'Energy and momentum on the mass shell',
    lead: t`The gold arrow is a particle’s four-momentum drawn in the $(pc, E)$ plane, in units of $mc^2$. Change its speed: the arrow’s tip runs along the hyperbola $E^2 - (pc)^2 = (mc^2)^2$, the **mass shell**.`,
    tasks: [
      'At β = 0.6: E = 1.25 mc², pc = 0.75 mc², and E² − (pc)² = 1. Every observer finds a different E and p, but the same m.',
      'Push β toward 0.97: E and pc grow without limit and the tip hugs the light line, yet E² − (pc)² never leaves 1.',
      'Compare the kinetic energy (γ − 1)mc² with Newton’s ½mv²: they agree below about 0.1c and part company above it.',
    ],
    params: {
      x: [-0.5, 4.3], y: [0, 4.5], equal: true, xlabel: 'pc / (mc²)', ylabel: 'E / (mc²)',
      sliders: [{ key: 'b', label: t`Speed $\beta = v/c$`, min: 0, max: 0.97, step: 0.01, value: 0.6, explain: 'The particle’s speed in your frame. Its mass does not change.' }],
      curves: [
        { fn: 'sqrt(1 + x^2)', color: 'accent', label: 'mass shell', labelAt: 2.9, labelDx: 8, labelDy: 12 },
        { fn: 'abs(x)', color: 'warn', dash: true, label: 'light: E = pc', labelAt: 3.7, labelDx: -96, labelDy: -4 },
      ],
      arrows: [{ from: [0, 0], to: ['b/sqrt(1 - b^2)', '1/sqrt(1 - b^2)'], color: 'gold' }],
      points: [{ x: 'b/sqrt(1 - b^2)', y: '1/sqrt(1 - b^2)', color: 'gold', label: 'p' }],
      readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`$E/(mc^2)$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`$pc/(mc^2)$`, expr: 'b/sqrt(1 - b^2)', digits: 4 },
        { label: t`$[E^2 - (pc)^2]/(mc^2)^2$`, expr: '1/(1 - b^2) - b^2/(1 - b^2)', digits: 4 },
        { label: t`kinetic $(\gamma - 1)mc^2$`, expr: '1/sqrt(1 - b^2) - 1', digits: 3 },
        { label: t`Newton’s $\tfrac12 mv^2$`, expr: '0.5*b^2', digits: 3 },
      ],
    },
    caption: t`Units of $mc^2$ for both axes. The dashed line is where massless particles live ($E = pc$); a massive particle’s four-momentum always ends on its own shell, above it.`,
  },
  example: {
    prompt: t`A positive pion at rest decays into a muon and a neutrino, $\pi^+ \to \mu^+\nu_\mu$. Find the muon’s energy and momentum using four-momentum conservation and invariants only. ($m_\pi c^2 = 139.570$ MeV, $m_\mu c^2 = 105.658$ MeV; treat the neutrino as massless.)`,
    visual: piDecayPicture,
    steps: [
      { label: 'Name the vectors', text: t`Call the four-momenta $P$ (pion), $k$ (muon) and $q$ (neutrino), and write $A\cdot B$ for $\eta_{\mu\nu}A^\mu B^\nu$. Conservation of energy *and* momentum is one four-vector equation: $P = k + q$.` },
      { label: 'Square away the neutrino', text: t`We know nothing about the neutrino except its mass, so isolate it: $q = P - k$, and $q\cdot q = P\cdot P - 2P\cdot k + k\cdot k$.` },
      { label: 'Use the invariants', text: t`$q\cdot q = 0$ (massless; real neutrino masses are under 1 eV), $P\cdot P = -m_\pi^2c^2$ and $k\cdot k = -m_\mu^2c^2$. In the pion’s rest frame $P = (m_\pi c, \vec 0)$, so $P\cdot k = -m_\pi c\cdot E_\mu/c = -m_\pi E_\mu$.` },
      { label: 'Solve', text: t`$0 = -m_\pi^2c^2 + 2m_\pi E_\mu - m_\mu^2c^2$, so $E_\mu = \dfrac{(m_\pi^2 + m_\mu^2)c^2}{2m_\pi} = ${fmt(PI_MU.E, 6)}$ MeV.` },
      { label: 'Momentum and kinetic energy', text: t`$p_\mu c = \sqrt{E_\mu^2 - (m_\mu c^2)^2} = ${fmt(PI_MU.p, 4)}$ MeV, and the kinetic energy is $E_\mu - m_\mu c^2 = ${fmt(PI_MU.E - M_MU, 3)}$ MeV.` },
      { label: 'Sense check', text: t`The neutrino carries the opposite momentum, so $E_\nu = p_\mu c = ${fmt(PI_MU.p, 4)}$ MeV, and $E_\mu + E_\nu = ${fmt(PI_MU.E + PI_MU.p, 6)}$ MeV $= m_\pi c^2$ ✓. Every pion decaying at rest gives a muon of exactly this energy — which is why the muons from stopped pions all leave tracks of the same length in photographic emulsion, as Powell’s group saw in 1947.` },
    ],
    answer: t`$E_\mu = \dfrac{(m_\pi^2 + m_\mu^2)c^2}{2m_\pi} = ${fmt(PI_MU.E, 5)}$ MeV: kinetic energy ${fmt(PI_MU.E - M_MU, 3)} MeV, momentum ${fmt(PI_MU.p, 3)} MeV/$c$.`,
  },
  practice: [
    expr({
      id: 'norm-u', difficulty: 2,
      prompt: t`A particle moves along $x$ at speed $v$, so $u^\mu = \gamma\,(c, v, 0, 0)$ with $\gamma = 1/\sqrt{1 - v^2/c^2}$. Compute $\eta_{\mu\nu}u^\mu u^\nu$ and simplify as far as you can.`,
      answer: '-c^2', answerTeX: t`-c^2`,
      vars: { v: [0.05, 0.9], c: [1, 3] },
      errors: [
        { answer: 'c^2', feedback: t`That is the $(+,-,-,-)$ convention. With $\eta = \mathrm{diag}(-1, 1, 1, 1)$ the time part enters with a minus sign.` },
        { answer: 'v^2 - c^2', feedback: t`Each component carries a factor $\gamma$, so the sum carries $\gamma^2$: $\gamma^2(v^2 - c^2)$.` },
      ],
      hints: [t`$\eta_{\mu\nu}u^\mu u^\nu = -(u^0)^2 + (u^1)^2 = -\gamma^2c^2 + \gamma^2v^2$.`, t`$\gamma^2(v^2 - c^2) = -\gamma^2c^2(1 - v^2/c^2)$, and $\gamma^2(1 - v^2/c^2) = 1$.`],
      teach: t`Every four-velocity has the same length: $\eta_{\mu\nu}u^\mu u^\nu = -c^2$, whatever the speed.`,
      explain: t`$-\gamma^2c^2 + \gamma^2v^2 = -\gamma^2c^2\left(1 - \dfrac{v^2}{c^2}\right) = -c^2$. No speed appears: $u^\mu$ is the tangent to the worldline scaled to unit proper time, so its length is fixed. Divided by $c$, every four-velocity ends on the hyperbola $(ct)^2 - x^2 = 1$.`,
      visual: uPicture([0.6], t`A worldline at $0.6c$ and its four-velocity divided by $c$ (gold): the arrow ends on the grey hyperbola $(ct)^2 - x^2 = 1$, as every four-velocity does.`),
    }),
    num({
      id: 'lhc', difficulty: 2,
      gen(r) {
        const ETeV = r.pick([6.5, 6.8, 7]);
        const g = (ETeV * 1e6) / M_P, ans = 1 - Math.sqrt(1 - 1 / (g * g));
        return {
          prompt: t`A proton in the Large Hadron Collider has total energy $E = ${ETeV}$ TeV; its rest energy is $m_pc^2 = 938.272$ MeV. How far short of the speed of light is it? Find $1 - \beta$. (Your calculator will not resolve $\beta$ itself: use $1 - \beta \approx \dfrac{1}{2\gamma^2}$ for $\gamma \gg 1$.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: 1 / (g * g), feedback: t`Keep the factor $\tfrac12$: $1 - \beta^2 = 1/\gamma^2$ and $1 - \beta^2 = (1 - \beta)(1 + \beta) \approx 2(1 - \beta)$.` },
            { value: 1 / g, feedback: t`Square $\gamma$: $1 - \beta \approx 1/(2\gamma^2)$.` },
          ],
          hints: [t`$\gamma = E/(mc^2) = ${ETeV}\times10^{6}\ \text{MeV}/938.272\ \text{MeV} = ${fmt(g, 4)}$.`, t`$1 - \beta^2 = 1/\gamma^2$, and $1 - \beta^2 = (1 - \beta)(1 + \beta) \approx 2(1 - \beta)$.`],
          teach: t`For $\gamma \gg 1$ the shortfall from light speed is $1 - \beta \approx 1/(2\gamma^2)$: the time component of $p^\mu$ fixes $\gamma$, and $\gamma$ fixes $\beta$.`,
          explain: t`$\gamma = E/mc^2 = ${fmt(g, 4)}$, so $1 - \beta \approx \dfrac{1}{2\gamma^2} = ${sci(ans)}$: the proton trails a light beam by about ${fmt(ans * 299792458, 2)} m every second. Its energy is ${fmt(g, 4)} times its rest energy, yet its speed is only a few billionths short of $c$ — energy is what grows, not speed.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4.2], y: [-9, 0.2], xlabel: 'log₁₀ γ', ylabel: 'log₁₀(1 − β)',
              curves: [{ fn: 'log(1 - sqrt(1 - 10^(-2x)))', color: 'accent', domain: [0.01, 3.2] }, { fn: '-log(2) - 2x', color: 'violet', dash: true, domain: [0.5, 4.2], label: '1/(2γ²)', labelAt: 3.3, labelDx: 6, labelDy: -10 }],
            },
            caption: t`How far below $c$ a particle is, against its Lorentz factor, both on powers-of-ten scales. Beyond $\gamma \approx 10^3$ a double-precision calculator returns $\beta = 1$, so the approximation $1/(2\gamma^2)$ (dashed) takes over.`,
          },
        };
      },
    }),
    num({
      id: 'two-photons', difficulty: 2,
      gen(r) {
        const E1 = r.int(1, 6), E2 = r.int(2, 8), deg = r.pick([60, 120, 150]);
        const ans = Math.sqrt(2 * E1 * E2 * (1 - Math.cos(deg * DEG)));
        return {
          prompt: t`Two photons, of ${E1} GeV and ${E2} GeV, fly apart with ${deg}° between their directions. What is the mass of the two-photon system, as a rest energy $Mc^2$ in GeV? (For massless particles $k_1\cdot k_1 = k_2\cdot k_2 = 0$, so $-M^2c^2 = (k_1 + k_2)\cdot(k_1 + k_2) = 2\,k_1\cdot k_2$.)`,
          answer: ans, units: 'GeV', tol: { rel: 0.005 },
          errors: [
            { value: E1 + E2, feedback: 'That is the total energy. Mass is the length of the total four-momentum, and the photons’ momenta do not cancel.' },
            { value: Math.sqrt(2 * E1 * E2), feedback: t`You dropped the angle. $k_1\cdot k_2 = -\dfrac{E_1E_2}{c^2}(1 - \cos\theta)$.` },
            { value: 0, feedback: 'Each photon is massless, but the pair is not: mass is not additive.' },
          ],
          hints: [t`$k_1\cdot k_2 = -\dfrac{E_1E_2}{c^2} + \vec k_1\cdot\vec k_2 = -\dfrac{E_1E_2}{c^2}(1 - \cos\theta)$, since each photon has $|\vec k| = E/c$.`, t`So $M^2c^4 = 2E_1E_2(1 - \cos\theta) = 2\times${E1}\times${E2}\times(1 - \cos ${deg}^\circ)$.`],
          teach: 'The invariant mass of a system is the length of its total four-momentum: for two photons, Mc² = √(2E₁E₂(1 − cos θ)).',
          explain: t`$M^2c^4 = 2(${E1})(${E2})(1 - \cos ${deg}^\circ) = ${nice(2 * E1 * E2 * (1 - Math.cos(deg * DEG)))}\ \text{GeV}^2$, so $Mc^2 = ${fmt(ans, 4)}$ GeV. The more the photons fly apart, the larger the mass: back to back it would be $2\sqrt{E_1E_2} = ${fmt(2 * Math.sqrt(E1 * E2), 4)}$ GeV, and in the same direction zero.`,
          visual: photonPair(E1, E2, deg),
        };
      },
    }),
    mcq({
      id: 'u-length', difficulty: 2,
      prompt: t`A spacecraft coasts at $0.9c$. What is the length $\sqrt{\left|\eta_{\mu\nu}u^\mu u^\nu\right|}$ of its four-velocity?`,
      choices: [t`$c$`, t`$0.9c$`, t`$\gamma c \approx 2.29c$`, t`$0$, because it is moving almost as fast as light`],
      answer: 0,
      why: {
        1: 'The speed is not the length of the four-velocity: the ordinary velocity is only the space part, and the time part grows with it.',
        2: t`$u^0 = \gamma c$ is the time component alone; the space part, $\gamma v$, subtracts from it in the Minkowski length.`,
        3: 'Only light has a four-momentum of zero length. Any massive body’s four-velocity has length c, however fast it goes.',
      },
      hints: [t`Compute $-(u^0)^2 + (u^1)^2$ with $u^\mu = \gamma(c, v, 0, 0)$.`, t`$\gamma^2(c^2 - v^2) = c^2$ for every $v$.`],
      teach: 'The four-velocity always has Minkowski length c; its components grow with speed, its length does not.',
      explain: t`$-\gamma^2c^2 + \gamma^2v^2 = -c^2$, so the length is $c$ for any speed. A faster spacecraft’s four-velocity tips toward the light cone and gets longer *on the page*, but the hyperbola it ends on is the same — just as diagram lengths are not clock times.`,
      visual: uPicture([0.5, 0.9], t`Four-velocities (divided by $c$) at $0.5c$ (gold) and $0.9c$ (violet). Longer on the page, the same Minkowski length: both end on the hyperbola $(ct)^2 - x^2 = 1$.`),
    }),
    num({
      id: 'decay-momentum', difficulty: 3,
      gen(r) {
        const D = r.pick([
          { what: t`A kaon at rest decays as $K^+ \to \mu^+\nu_\mu$`, M: M_K, m: M_MU, Mname: t`m_Kc^2 = 493.677`, mname: t`m_\mu c^2 = 105.658`, d: 'muon' },
          { what: t`A tau lepton at rest decays as $\tau^- \to \pi^-\nu_\tau$`, M: M_TAU, m: M_PI, Mname: t`m_\tau c^2 = 1776.86`, mname: t`m_\pi c^2 = 139.570`, d: 'pion' },
          { what: t`A pion at rest takes its rare branch, $\pi^+ \to e^+\nu_e$`, M: M_PI, m: M_E, Mname: t`m_\pi c^2 = 139.570`, mname: t`m_ec^2 = 0.511`, d: 'positron' },
        ]);
        const { p, E } = decay(D.M, D.m);
        return {
          prompt: t`${D.what}. Treating the neutrino as massless, find the ${D.d}’s momentum, in MeV/$c$. ($${D.Mname}$ MeV, $${D.mname}$ MeV.)`,
          answer: p, units: 'MeV/c', tol: { rel: 0.005 },
          errors: [
            { value: E, feedback: t`That is the ${D.d}’s energy $E$, from $(M^2 + m^2)c^2/(2M)$. Its momentum is $\sqrt{E^2 - (mc^2)^2}/c$, or directly $(M^2 - m^2)c/(2M)$.` },
            { value: D.M - D.m, feedback: 'Energy is shared through four-momentum conservation, not by subtracting rest energies: the neutrino carries off much of the energy.' },
            { value: E - D.m, feedback: t`That is the kinetic energy, not the momentum.` },
          ].filter((e) => Math.abs(e.value - p) > 0.02 * p),
          hints: [t`Name the four-momenta $P = k + q$, isolate the neutrino and square: $0 = P\cdot P - 2P\cdot k + k\cdot k$, with $P\cdot k = -ME_k$ in the rest frame.`, t`That gives $E = (M^2 + m^2)c^2/(2M)$; then $pc = \sqrt{E^2 - (mc^2)^2} = (M^2 - m^2)c^2/(2M)$.`],
          teach: 'For a decay at rest into a massive particle and a massless one, invariants give the daughter’s momentum directly: pc = (M² − m²)c²/(2M).',
          explain: t`$pc = \dfrac{(Mc^2)^2 - (mc^2)^2}{2Mc^2} = ${fmt(p, 4)}$ MeV, so $p = ${fmt(p, 4)}$ MeV/$c$; the ${D.d}’s energy is $${fmt(E, 4)}$ MeV and the neutrino’s $${fmt(p, 4)}$ MeV, adding to the parent’s $${fmt(D.M, 6)}$ MeV.`,
          visual: shellPicture([{ x: 0, y: round(D.M / D.m > 6 ? 3.5 : D.M / D.m), color: 'accent', label: 'parent at rest' }], t`The setting, in units of the ${D.d}’s rest energy${D.M / D.m > 6 ? ' (the parent drawn far lower than scale)' : ''}: the ${D.d} must end on its mass shell (blue) and the neutrino on the light line, and their arrows must add up to the parent’s.`, D.M / D.m > 6 ? {} : { x: [-0.5, 5.2], y: [0, 5.1] }),
        };
      },
    }),
    mcq({
      id: 'dust', difficulty: 3,
      prompt: t`A cloud of dust has mass density $\rho_0$ in its own rest frame. Its stress–energy tensor (step 16) is $T^{\mu\nu} = \rho_0\,u^\mu u^\nu$, so in a frame where the cloud moves at speed $v$, the energy density is $T^{00} = \rho_0(u^0)^2 = \gamma^2\rho_0c^2$. Why **two** factors of $\gamma$?`,
      choices: [
        t`Each grain’s energy is $\gamma$ times larger, and length contraction packs $\gamma$ times more grains into each cubic metre`,
        t`Each grain’s mass grows as $\gamma^2$`,
        'One γ for the grains’ slow clocks and one for the Doppler shift of their light',
        t`There should be only one: the energy per grain grows by $\gamma$, nothing else changes`,
      ],
      answer: 0,
      why: {
        1: t`Mass is invariant. The energy per grain grows as $\gamma$ — once — and the other $\gamma$ is about how many grains share each unit volume.`,
        2: 'Clock rates and Doppler shifts do not enter: T⁰⁰ counts energy per unit volume, at one moment in your frame.',
        3: t`The volume changes too: along the motion the cloud is shorter by $\gamma$, so the same grains fill $1/\gamma$ of the volume.`,
      },
      hints: ['Energy density = (energy per grain) × (grains per unit volume). How does each change with the cloud’s speed?', 'Lengths along the motion contract by γ, so number densities grow by γ.'],
      teach: 'Moving dust has energy density γ²ρ₀c²: one γ from each grain’s energy, one from length contraction raising the number density.',
      explain: t`Energy per grain: $\gamma m c^2$. Grains per unit volume: $\gamma n_0$, because the cloud is contracted along its motion. Their product is $\gamma^2 n_0 mc^2 = \gamma^2\rho_0c^2$ — the $u^0u^0$ in $T^{00}$. The other entries ($T^{0x} = \gamma^2\rho_0cv$, $T^{xx} = \gamma^2\rho_0v^2$) are the flow of energy and of momentum.`,
      visual: stressTable([['γ²ρ₀c²', 'γ²ρ₀cv', '', ''], ['γ²ρ₀cv', 'γ²ρ₀v²', '', ''], ['', '', '', ''], ['', '', '', '']], { caption: t`$T^{\mu\nu} = \rho_0u^\mu u^\nu$ for dust moving along $x$ at speed $v$: energy density, energy flow and momentum flow; the rest are zero.` }),
    }),
    num({
      id: 'u0-speed', difficulty: 1,
      gen(r) {
        const [u0, beta] = r.pick([[1.25, 0.6], [2.5, Math.sqrt(1 - 1 / 6.25)], [5, Math.sqrt(1 - 1 / 25)], [10, Math.sqrt(1 - 1 / 100)], [13 / 12, 5 / 13]]);
        return {
          prompt: t`A particle’s four-velocity has time component $u^0 = ${nice(u0, 4)}\,c$ in your frame. How fast is it moving, as a fraction of $c$?`,
          answer: beta, tol: { rel: 0.002 },
          errors: [{ value: 1 / u0, feedback: t`$u^0 = \gamma c$ gives $\gamma = ${nice(u0, 4)}$; the speed is $\sqrt{1 - 1/\gamma^2}$, not $1/\gamma$.` }],
          hints: [t`$u^0 = \gamma c$, so $\gamma = ${nice(u0, 4)}$.`, t`$\beta = \sqrt{1 - 1/\gamma^2}$.`],
          teach: 'The time component of the four-velocity is γc; it fixes γ, and γ fixes the speed.',
          explain: t`$\gamma = ${nice(u0, 4)}$, so $\beta = \sqrt{1 - 1/${nice(u0 * u0, 5)}} = ${fmt(beta, 4)}$. Its space components are then $\gamma\beta c = ${fmt(u0 * beta, 4)}\,c$, and $-(u^0)^2 + (u^1)^2 = -c^2$ as always.`,
          visual: shellPicture([], t`The hyperbola on which every four-velocity ends (in units of $c$, the same curve as a mass shell in units of $mc^2$). The height of the tip is $u^0/c = \gamma$.`),
        };
      },
    }),
    mcq({
      id: 'photon-mass', difficulty: 2,
      prompt: t`A photon of visible light carries energy $E = 2.0$ eV and momentum $p = E/c$. What is its mass?`,
      choices: ['Zero', t`$E/c^2 \approx 3.6\times10^{-36}$ kg`, t`$2E/c^2 \approx 7.1\times10^{-36}$ kg`, 'It depends on the frame: zero only for observers moving with the light'],
      answer: 0,
      why: {
        1: t`$E/c^2$ is the mass of something with energy $E$ *at rest*. A photon is never at rest: with $p = E/c$, $E^2 - (pc)^2 = 0$.`,
        2: 'Doubling does not help: the invariant length of the photon’s four-momentum is exactly zero.',
        3: 'Mass is invariant, the same in every frame — and no observer can move with light.',
      },
      hints: [t`Mass is the length of the four-momentum: $(mc^2)^2 = E^2 - (pc)^2$.`, t`For the photon $pc = E$.`],
      teach: 'Mass is the invariant length of the four-momentum; for a photon E = pc, so its mass is exactly zero.',
      explain: t`$(mc^2)^2 = E^2 - (pc)^2 = (2.0\ \text{eV})^2 - (2.0\ \text{eV})^2 = 0$. Photons carry energy and momentum but no mass; their four-momentum lies on the light cone. (Two photons together can have mass — the system’s total four-momentum need not be null.)`,
      visual: shellPicture([{ x: 2, y: 2, color: 'gold', label: 'the photon' }], t`A photon’s four-momentum ends on the light line $E = pc$ (dashed): zero length, so zero mass. Massive particles end on mass shells above it.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-omg', difficulty: 3, transfer: true,
      prompt: t`In 1991 the Fly’s Eye detector in Utah recorded a cosmic-ray particle — probably a proton — with energy $3.2\times10^{20}$ eV. Taking it to be a proton ($m_pc^2 = 938.3$ MeV), how long would its own clock record for crossing our galaxy, 100,000 light-years across (in the galaxy’s frame)? Answer in seconds.`,
      answer: (1e5 * YEAR) / (3.2e14 / M_P), units: 's', tol: { rel: 0.01 },
      errors: [
        { value: 1e5 * YEAR, feedback: t`That is the galaxy’s time (it moves at essentially $c$). The proton’s own clock records $\gamma$ times less.` },
        { value: (1e5 * YEAR) / (3.2e14 / M_P) ** 2, feedback: t`Divide by $\gamma$ once: proper time $= t/\gamma$.` },
      ],
      hints: [t`$\gamma = E/(mc^2) = 3.2\times10^{20}\ \text{eV}/9.383\times10^{8}\ \text{eV}$.`, t`At $\beta \approx 1$ the crossing takes $t = 10^5$ years in the galaxy’s frame; the proton’s proper time is $t/\gamma$.`],
      teach: t`The time component of $p^\mu$ gives $\gamma = E/(mc^2)$, and proper time along the worldline is coordinate time divided by $\gamma$.`,
      explain: t`$\gamma = ${sci(3.2e14 / M_P)}$, and $10^5$ years is $${sci(1e5 * YEAR)}$ s, so the proton’s clock records $${sci(1e5 * YEAR)}/${sci(3.2e14 / M_P)} = ${fmt((1e5 * YEAR) / (3.2e14 / M_P), 3)}$ s. In its own frame the galaxy is contracted to about $${sci((1e5 * 9.4607e15) / (3.2e14 / M_P) / 1e3, 2)}$ km — roughly ${Math.round((1e5 * 9.4607e15) / (3.2e14 / M_P) / 3.844e8)} times the Earth–Moon distance.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 6], y: [0, 6], xlabel: 'log₁₀ γ', ylabel: 'log₁₀(proper time to cross, in years)',
          curves: [{ fn: '5 - x', color: 'accent', domain: [0, 5] }],
          points: [{ x: round(Math.log10(7247)), y: round(5 - Math.log10(7247)), color: 'violet', label: 'LHC proton' }],
          hlines: [{ y: 5, label: '100 000 years: the galaxy’s own time', color: 'ink3' }],
        },
        caption: t`For particles moving at essentially $c$, the time their own clocks record to cross the galaxy is $10^5$ years divided by $\gamma$: a line of slope $-1$ on these powers-of-ten axes. The line stops where the time reaches one year.`,
      },
    }),
    num({
      id: 'cp-higgs', difficulty: 3, transfer: true,
      gen(r) {
        const [E1, E2, deg] = r.pick([[70, 80, 113.3], [60, 90, 116.5], [100, 50, 124.2], [62.6, 62.6, 179]]);
        const ans = Math.sqrt(2 * E1 * E2 * (1 - Math.cos(deg * DEG)));
        return {
          prompt: t`A detector at CERN records two photons from one collision: ${E1} GeV and ${E2} GeV, with an opening angle of ${deg}° between them. Compute the invariant mass $Mc^2$ of the pair, in GeV. (Massless photons: $-M^2c^2 = 2\,k_1\cdot k_2$.)`,
          answer: ans, units: 'GeV', tol: { rel: 0.005 },
          errors: [
            { value: E1 + E2, feedback: 'That is the total energy, which depends on the frame. The mass is the invariant length of the total four-momentum.' },
            { value: Math.sqrt(2 * E1 * E2), feedback: t`Include the angle: $M^2c^4 = 2E_1E_2(1 - \cos\theta)$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Each photon has |k| = E/c, and the dot product of the two momenta brings in cos θ.', t`$M^2c^4 = 2E_1E_2(1 - \cos\theta)$.`],
          teach: 'Physicists find unstable particles as bumps in the invariant mass of their decay products: Mc² = √(2E₁E₂(1 − cos θ)) for two photons.',
          explain: t`$M^2c^4 = 2(${E1})(${E2})(1 - \cos ${deg}^\circ) = ${fmt(ans * ans, 5)}\ \text{GeV}^2$, so $Mc^2 = ${fmt(ans, 4)}$ GeV. Pairs like this pile up in a narrow bump at about 125 GeV: the Higgs boson, discovered this way (with four-lepton decays) by ATLAS and CMS in 2012. Every pair from a decaying particle gives the same mass, whatever its energies and angle, because the mass is an invariant.`,
          visual: photonPair(E1, E2, deg, 'The two photons’ momenta (times c), to scale, and their opening angle.'),
        };
      },
    }),
    expr({
      id: 'cp-twins', difficulty: 3,
      prompt: t`A particle of mass $M$ at rest decays into two particles of equal mass $m$ (for example $K^0_S \to \pi^+\pi^-$). Working with $c = 1$, find the momentum $p$ of each daughter as a function of $M$ and $m$.`,
      answer: 'sqrt(M^2/4 - m^2)', answerTeX: t`\sqrt{\frac{M^2}{4} - m^2}`,
      lhs: 'p',
      vars: { M: [3, 4], m: [0.2, 1.4] },
      errors: [
        { answer: 'M/2 - m', feedback: t`That is each daughter’s kinetic energy. The momentum comes from $E^2 = p^2 + m^2$ with $E = M/2$.` },
        { answer: 'sqrt(M^2 - m^2)/2', feedback: t`Each daughter has $E = M/2$, so $p^2 = (M/2)^2 - m^2$: the $m^2$ is not divided by 4.` },
      ],
      hints: ['The daughters fly apart with equal and opposite momenta, so by symmetry they share the energy equally.', t`Each has $E = M/2$; then $p = \sqrt{E^2 - m^2}$.`],
      teach: 'In a two-body decay at rest into equal masses, each daughter carries E = M/2 and p = √(M²/4 − m²) (with c = 1).',
      explain: t`Momentum conservation makes the momenta equal and opposite; equal masses then make the energies equal, $E = M/2$. So $p = \sqrt{M^2/4 - m^2}$. For $K^0_S \to \pi^+\pi^-$ ($M = 497.6$ MeV, $m = 139.6$ MeV): $p = ${fmt(Math.sqrt(497.611 ** 2 / 4 - M_PI ** 2), 4)}$ MeV/$c$.`,
      visual: shellPicture([{ x: 0, y: 3.56, color: 'accent', label: 'parent at rest' }], t`The setting in units of a daughter’s rest energy (parent drawn for $K^0_S \to \pi^+\pi^-$, $M/m = 3.56$): each daughter’s four-momentum must end on the mass shell, and the two must add to the parent’s.`),
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §1.4 (four-velocity, four-momentum)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Particle Data Group (2024), particle masses and lifetimes', url: 'https://pdg.lbl.gov/' },
    { label: 'Bird et al. (1995), detection of a cosmic ray with measured energy well beyond the expected spectral cutoff, ApJ 441, 144', url: 'https://doi.org/10.1086/175344' },
    { label: 'ATLAS Collaboration (2012), observation of a new particle in the search for the Higgs boson', url: 'https://arxiv.org/abs/1207.7214' },
  ],
});
