// Gravitational redshift from the metric — Derivation Mode. The metric does
// not depend on t, so the lowered component p_t of a photon's four-momentum is
// conserved along its geodesic (dp_μ/dλ = ½ ∂_μg_αβ p^α p^β); what an observer
// with four-velocity u measures is ω = −p_μu^μ. A static observer has
// u^t = 1/√(1 − 2M/r), so ω_rec/ω_em = √[(1 − 2M/r_em)/(1 − 2M/r_rec)] ≈ 1 − gh.
// Checked with SymPy: the t-equation of the geodesic equation is exactly
// d/dτ[(1 − 2M/r) dt/dτ] = 0; a free-faller from rest at infinity
// (u^t = 1/(1 − 2M/r), u^r = −√(2M/r)) sees infalling light at
// E/(1 + √(2M/r)) — half at the horizon; a circular-orbit emitter has
// u^t = 1/√(1 − 3M/r). G = c = 1 inside the derivation. Avoids gr.S23.i's
// GPS, star, neutron-star, white-dwarf and static-probe-to-infinity items.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { C, GM_EARTH, M_EARTH, R_EARTH, M_SUN, AU, sci, round } from './_classic.js';

const t = String.raw;

const G_LAB = 9.80;                                   // m/s², local gravity used in the clock items
const SGR = 4.30e6;                                   // Sgr A*, solar masses (GRAVITY 2022)

// the static clock rate √(1 − 2M/r) with an emitter and a receiver marked (G = c = 1)
const clockMap = (em, rec) => ({
  type: 'graph',
  params: {
    x: [0, Math.max(12, Math.ceil(Math.max(em, rec) * 1.15))], y: [0, 1.12], xlabel: 'r / M', ylabel: 'static clock rate √(1 − 2M/r)',
    curves: [{ fn: 'sqrt(1 - 2/x)', domain: [2, 60], color: 'gold' }],
    vlines: [{ x: 2, label: 'horizon' }],
    hlines: [{ y: 1, label: 'far away' }],
    points: [
      { x: em, y: round(Math.sqrt(1 - 2 / em), 5), color: 'bad', label: 'emitter' },
      { x: rec, y: round(Math.sqrt(1 - 2 / rec), 5), color: 'accent', label: 'receiver' },
    ],
  },
  caption: t`How fast a clock hovering at $r$ ticks against far-away time, $d\tau/dt = \sqrt{1 - 2M/r}$ ($G = c = 1$), with the two hovering stations marked.`,
});

// a tower with two clocks, not to scale
const towerPic = (label) => ({
  type: 'graph',
  params: {
    x: [-2, 3], y: [-0.4, 3.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['-1.6 + 3.2t', '0'], t: [0, 1], color: 'ink3', width: 3 }, { param: ['0', '2.4t'], t: [0, 1], color: 'ink3', width: 5 }],
    arrows: [{ from: [0.35, 0.15], to: [0.35, 2.2], color: 'gold', label: 'light climbs', labelDx: 8, labelDy: 0 }],
    points: [
      { x: 0, y: 0.08, color: 'accent', r: 6, label: 'lower clock', labelDx: -86, labelDy: -10 },
      { x: 0, y: 2.4, color: 'violet', r: 6, label: 'upper clock', labelDx: -86, labelDy: 10 },
      { x: 1.2, y: 1.2, r: 0.01, color: 'ink2', label },
    ],
  },
  caption: 'Two clocks, one above the other, compare frequencies by sending light between them. Not to scale.',
});

// how fast an observer falling from rest far away moves, as measured by hovering observers
const fallerSpeed = (k) => ({
  type: 'graph',
  params: {
    x: [0, 22], y: [0, 1.08], xlabel: 'r / M', ylabel: 'speed / c',
    curves: [{ fn: 'sqrt(2/x)', domain: [2, 22], color: 'accent' }],
    vlines: [{ x: 2, label: 'horizon' }],
    points: [{ x: k, y: round(Math.sqrt(2 / k), 5), color: 'accent', label: `r = ${k}M` }],
  },
  caption: t`An observer falling from rest far away passes each hovering observer at speed $\sqrt{2M/r}$ ($G = c = 1$) — Newton's escape speed, exactly, in these coordinates — reaching $c$ at the horizon.`,
});

// a hot spot on a circular orbit, seen from far away along the orbit's axis
const hotSpot = (k) => ({
  type: 'graph',
  params: {
    x: [-k * 1.5, k * 1.5], y: [-k * 1.25, k * 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(4 - x^2, 0))', lower: '-sqrt(max(4 - x^2, 0))', from: -2, to: 2, color: '#000000', alpha: 0.9 }],
    curves: [{ param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 1.6, dash: true }, { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2 }],
    points: [
      { x: round(k * Math.cos(0.6), 4), y: round(k * Math.sin(0.6), 4), color: 'gold', r: 6, label: 'hot spot' },
      { x: round(-k * 1.45, 4), y: round(-k * 1.12, 4), r: 0.01, color: 'ink2', label: 'seen face-on: you are far away along the axis' },
    ],
    arrows: [{ from: [round(k * Math.cos(0.6), 4), round(k * Math.sin(0.6), 4)], to: [round(k * Math.cos(0.6) - 0.32 * k * Math.sin(0.6), 4), round(k * Math.sin(0.6) + 0.32 * k * Math.cos(0.6), 4)], color: 'gold' }],
  },
  caption: t`A glowing blob of gas on a circular orbit at $r = ${k}M$ around a black hole (black: the horizon, $2M$), seen from far away along the orbit's axis. To scale in $r$.`,
});

// p^t changes along an outgoing ray, p_t does not
const conservedPic = {
  type: 'graph',
  params: {
    x: [2, 20], y: [0, 3.2], xlabel: 'r / M (along the photon’s path)', ylabel: 'in units of E',
    curves: [
      { fn: '1/(1 - 2/x)', domain: [2.6, 20], color: 'accent', label: 'p^t = dt/dλ', labelAt: 4.5 },
      { fn: '1', domain: [2.6, 20], color: 'gold', width: 3, label: '−p_t', labelAt: 15, labelDy: -12 },
    ],
  },
  caption: t`Two components of a photon's four-momentum along a radial path ($G = c = 1$): the upper one, $p^t$, changes from place to place; the lower one, $p_t$, does not.`,
};

// Earth and Gravity Probe A's apogee, to scale
const gpaPic = {
  type: 'graph',
  params: {
    x: [-2.2, 2.9], y: [-1.15, 2.95], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.6 },
      { param: ['0.25*sin(1.4*t)', 't'], t: [1, 2.5696], color: 'ink3', width: 1.4, dash: true },
    ],
    points: [{ x: round(0.25 * Math.sin(1.4 * 2.5696), 4), y: 2.5696, color: 'gold', r: 6, label: 'maser at apogee, 10 000 km up' }, { x: 0, y: 1, color: 'accent', r: 4, label: 'ground station', labelDx: 8, labelDy: -14 }],
  },
  caption: 'Earth (circle, radius 6371 km) and the top of Gravity Probe A’s arc, 10 000 km above the surface, to scale. The dashed path is schematic.',
};

// S2's orbit around Sgr A*, to scale, with the pericentre marked
const s2Pic = {
  type: 'graph',
  params: {
    x: [-1950, 700], y: [-560, 560], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ polar: '225.6/(1 + 0.88*cos(theta))', theta: [0, 6.2832], color: 'gold', width: 1.8 }],
    points: [{ x: 0, y: 0, color: 'ink', r: 4, label: 'Sgr A*', labelDx: -62, labelDy: 0 }, { x: 120, y: 0, color: 'bad', r: 5, label: 'pericentre, 120 AU', labelDx: 10, labelDy: 0 }],
  },
  caption: 'The star S2’s orbit around Sagittarius A*, to scale (semi-major axis about 1000 AU, eccentricity 0.88). Drawn in its own plane; we see it tilted.',
};

const S2 = (() => {
  const Mlen = SGR * M_SUN, rp = 120 * AU, v = 7.65e6;
  const zg = Mlen / rp, zd = (v / C) ** 2 / 2;
  return { zg, zd, kms: (x) => (x * C) / 1e3 };
})();

export default lesson({
  id: 'gr.S23.d',
  title: 'Gravitational redshift from the metric',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`A photon's frequency is not a property of the photon alone: it is what an observer measures, $\omega = -p_\mu u^\mu$ — the photon's four-momentum $p$ projected on the observer's four-velocity $u$. In a static spacetime one component of $p$ never changes along the photon's path, $p_t = -E$, because the metric does not depend on $t$. Put the two together and the frequency ratio between any two observers follows from the metric alone; for two observers hovering in Schwarzschild spacetime it is the result above. It is general relativity's most precisely tested prediction.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$** inside the derivation, so $M$ means $GM/c^2$.`,
  equation: t`\frac{\omega_\text{rec}}{\omega_\text{em}} = \frac{u^t_\text{rec}}{u^t_\text{em}} = \sqrt{\frac{1 - 2M/r_\text{em}}{1 - 2M/r_\text{rec}}}`,
  symbols: [
    { tex: '\\omega_\\text{em},\\ \\omega_\\text{rec}', text: 'the frequency of the light as measured by the emitter and by the receiver, each with their own clock' },
    { tex: 'p_\\mu', text: t`the photon's four-momentum with its index lowered, $p_\mu = g_{\mu\nu}p^\nu$, where $p^\mu = dx^\mu/d\lambda$ along its path` },
    { tex: 'u^\\mu', text: t`the observer's four-velocity, $dx^\mu/d\tau$, with $\tau$ the observer's own time; always $g_{\mu\nu}u^\mu u^\nu = -1$` },
    { tex: 'u^t', text: t`its time component, $dt/d\tau$: how much far-away time passes per second of the observer's clock` },
    { tex: 'E', text: t`$-p_t$, conserved along the photon's path; it is the frequency measured by an observer at rest far away` },
    { tex: 'r_\\text{em},\\ r_\\text{rec}', text: t`the areal radii of the emitter and the receiver, both at rest (hovering)` },
    { tex: 'M', text: t`the mass as a length, $GM/c^2$: 4.435 mm for the Earth, 1476.6 m for the Sun` },
  ],
  why: t`The method — a conserved quantity from a symmetry, projected on an observer — is how the next steps get numbers out of a metric: orbital energy and angular momentum, light bending, and black-hole efficiencies.`,
  visual: {
    type: 'graph',
    title: 'Same starlight, two observers',
    lead: t`Light from a distant star falls straight in. At the same radius $r$, a **hovering** observer (blue) and an observer **falling** from rest far away (gold) measure its frequency; both are shown divided by the frequency far away ($G = c = 1$). Slide $r$.`,
    tasks: [
      'Far out both ratios are 1: both observers agree with clocks far away.',
      'Slide toward 2M: the hovering observer sees the starlight blueshifted without limit — staying put there needs an ever more violent rocket, and her clock barely ticks.',
      'The falling observer sees the same light redshifted, to exactly half at the horizon: she is moving away from the source, and that Doppler shift beats the gravitational blueshift. A frequency belongs to an observer, not to the light alone.',
    ],
    params: {
      x: [0, 20], y: [0, 3.2], xlabel: 'r / M', ylabel: 'ω measured ÷ ω far away',
      sliders: [{ key: 'R', label: 'Radius $r$', min: 2.05, max: 20, step: 0.05, value: 6, unit: 'M', explain: 'Where the two observers meet the light. The horizon is at $2M$.' }],
      curves: [
        { fn: '1/sqrt(1 - 2/x)', domain: [2.12, 20], color: 'accent', label: 'hovering', labelAt: 3.2, labelDx: 8, labelDy: -4 },
        { fn: '1/(1 + sqrt(2/x))', domain: [2, 20], color: 'gold', label: 'falling from rest', labelAt: 12, labelDy: 16 },
      ],
      vlines: [{ x: 2, label: 'horizon' }],
      hlines: [{ y: 1 }],
      points: [{ x: 'R', y: '1/sqrt(1 - 2/R)', color: 'accent' }, { x: 'R', y: '1/(1 + sqrt(2/R))', color: 'gold' }],
      readouts: [
        { label: 'hovering: $1/\\sqrt{1 - 2M/r}$', expr: '1/sqrt(1 - 2/R)', digits: 4 },
        { label: 'falling: $1/(1 + \\sqrt{2M/r})$', expr: '1/(1 + sqrt(2/R))', digits: 4 },
      ],
    },
    caption: t`Starlight falling radially inward, its frequency measured at $r$ by two observers and divided by its frequency far away. Both curves come from $\omega = -p_\mu u^\mu$ with the conserved $E = -p_t$ (checked with SymPy). The falling observer passes the horizon and reads exactly $\tfrac12$ there.`,
  },
  example: {
    prompt: t`Light leaves an emitter hovering at $r_\text{em}$ and reaches a receiver hovering at $r_\text{rec}$. Derive the ratio of the frequencies they measure, then evaluate it for Pound and Rebka's 1960 experiment, which sent gamma rays up and down a 22.5 m tower at Harvard.`,
    visual: towerPic('22.5 m'),
    steps: [
      { label: 'A conserved quantity', text: t`Write the geodesic equation with a lower index (for light, with an affine parameter $\lambda$ and $p^\mu = dx^\mu/d\lambda$):
$$\frac{dp_\mu}{d\lambda} = \tfrac12\,\partial_\mu g_{\alpha\beta}\,p^\alpha p^\beta.$$
The Schwarzschild metric does not depend on $t$, so for $\mu = t$ the right side vanishes: $p_t$ is constant along the whole path. Call it $-E$. (In the language of symmetries: $\partial_t$ is a Killing vector, and $K_\mu p^\mu$ is conserved.)` },
      { label: 'What an observer measures', text: t`In the observer's own local inertial frame $u^\mu = (1, 0, 0, 0)$ and the photon's energy is $p^0$. The frame-independent way to write that is $\omega = -p_\mu u^\mu$: a scalar, so it can be evaluated in any coordinates.` },
      { label: 'A hovering observer', text: t`It has $u^r = u^\theta = u^\phi = 0$, and the normalization $g_{\mu\nu}u^\mu u^\nu = -1$ reads $-(1 - 2M/r)(u^t)^2 = -1$, so
$$u^t = \frac{1}{\sqrt{1 - 2M/r}}.$$` },
      { label: 'Combine', text: t`$\omega = -p_t u^t = E/\sqrt{1 - 2M/r}$. The same $E$ appears at both ends, so it cancels:
$$\frac{\omega_\text{rec}}{\omega_\text{em}} = \sqrt{\frac{1 - 2M/r_\text{em}}{1 - 2M/r_\text{rec}}}.$$
Light climbing out ($r_\text{rec} > r_\text{em}$) arrives with a lower frequency: redshifted.` },
      { label: 'Weak field', text: t`With $r_\text{rec} = r_\text{em} + h$ and $M/r \ll 1$, keep first order in $M$:
$$\frac{\omega_\text{rec}}{\omega_\text{em}} \approx 1 - \frac{M}{r_\text{em}} + \frac{M}{r_\text{em} + h} \approx 1 - \frac{Mh}{r_\text{em}^2} = 1 - gh,$$
with $g = M/r^2$ the surface gravity. Restoring $c$: a fractional shift $gh/c^2$.` },
      { label: 'Pound–Rebka', text: t`$gh/c^2 = (${G_LAB}\ \text{m/s}^2)(22.5\ \text{m})/(2.998\times10^{8}\ \text{m/s})^2 = ${sci((G_LAB * 22.5) / C ** 2)}$. Sending the gamma rays up and then down and comparing doubles it, to $${sci((2 * G_LAB * 22.5) / C ** 2)}$. They measured $1.05 \pm 0.10$ times the prediction (1960), and Pound and Snider $0.9990 \pm 0.0076$ (1965).` },
      { label: 'Sense check', text: t`Nothing about the path entered — only that it is a geodesic of a static spacetime. The ratio depends only on the clock rates at the two ends: the receiver's clock ticks faster, so it counts fewer crests per tick. Whether you call that "the photon loses energy climbing" depends on which observers you ask; $E$ itself never changes.` },
    ],
    answer: t`$\omega_\text{rec}/\omega_\text{em} = \sqrt{(1 - 2M/r_\text{em})/(1 - 2M/r_\text{rec})} \approx 1 - gh/c^2$; for the 22.5 m tower, a fractional shift of $${sci((G_LAB * 22.5) / C ** 2)}$ each way, $${sci((2 * G_LAB * 22.5) / C ** 2)}$ up versus down.`,
  },
  practice: [
    expr({
      id: 'ut-static', difficulty: 2,
      prompt: t`An observer hovers at fixed $r$, $\theta$ and $\phi$ outside a Schwarzschild black hole ($G = c = 1$), so the only non-zero component of her four-velocity is $u^t = dt/d\tau$. Use the normalization $g_{\mu\nu}u^\mu u^\nu = -1$, with $g_{tt} = -(1 - 2M/r)$, to find $u^t$.`,
      answer: '1/sqrt(1 - 2M/r)', answerTeX: t`\frac{1}{\sqrt{1 - 2M/r}}`, lhs: 'u^t',
      vars: { M: [0.5, 1.5], r: [4, 12] },
      errors: [
        { answer: 'sqrt(1 - 2M/r)', feedback: t`That is $d\tau/dt$, the clock rate. $u^t = dt/d\tau$ is its reciprocal: far-away time per tick of her clock.` },
        { answer: '1/(1 - 2M/r)', feedback: t`Take the square root: the normalization fixes $(u^t)^2$.` },
      ],
      hints: [t`With only $u^t$ non-zero, $g_{\mu\nu}u^\mu u^\nu = g_{tt}(u^t)^2$.`, t`$-(1 - 2M/r)(u^t)^2 = -1$.`],
      teach: t`Every four-velocity is normalized to $-1$; for a hovering observer that alone fixes $u^t$.`,
      explain: t`$(u^t)^2 = 1/(1 - 2M/r)$, so $u^t = 1/\sqrt{1 - 2M/r}$: more far-away time passes per second of her clock the deeper she hovers, without limit as $r \to 2M$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 12], y: [-1.3, 0.25], xlabel: 'r / M', ylabel: 'g_tt',
          curves: [{ fn: '-(1 - 2/x)', domain: [2, 12], color: 'gold', label: 'g_tt = −(1 − 2M/r)', labelAt: 7, labelDy: 16 }],
          vlines: [{ x: 2, label: 'horizon' }],
          hlines: [{ y: -1, label: 'flat space' }],
        },
        caption: t`The time component of the metric outside the hole ($G = c = 1$). Near the horizon it approaches zero.`,
      },
    }),
    mcq({
      id: 'why-conserved', difficulty: 2,
      prompt: t`Along a photon's path outside a star, which statement explains why $p_t = g_{tt}\,p^t$ stays constant, while $p^t$ itself changes (see the picture)?`,
      choices: [
        t`The geodesic equation gives $dp_t/d\lambda = \tfrac12\,\partial_t g_{\alpha\beta}\,p^\alpha p^\beta$, and nothing in the metric depends on $t$`,
        'Light always moves at c, so its energy cannot change',
        'Every observer measures the same frequency for a given photon',
        t`$p^t$ and $p_t$ are the same thing written two ways, so both are constant`,
      ],
      answer: 0,
      why: {
        1: 'Locally light always moves at c, yet different observers measure different frequencies: speed and energy are separate things.',
        2: 'The opposite: the frequency depends on the observer, ω = −p·u. That is the whole point of the redshift.',
        3: t`$p_t = g_{tt}p^t = -(1 - 2M/r)\,p^t$: they differ by a factor that changes with $r$, so at most one of them can be constant.`,
      },
      hints: ['What symmetry does a static spacetime have?', t`If $\partial_t g_{\alpha\beta} = 0$, what does the lower-index geodesic equation say about $p_t$?`],
      teach: 'A coordinate the metric does not depend on gives a conserved lower-index momentum component: time independence gives energy.',
      explain: t`With a lowered index the geodesic equation reads $dp_\mu/d\lambda = \tfrac12\partial_\mu g_{\alpha\beta}p^\alpha p^\beta$, so $p_t$ is constant when the metric is independent of $t$. The upper component $p^t = -p_t/(1 - 2M/r) = E/(1 - 2M/r)$ changes with $r$. The same argument with $\phi$ will give the conserved angular momentum (step 25).`,
      visual: conservedPic,
    }),
    num({
      id: 'two-stations', difficulty: 2,
      gen(r) {
        const [em, rec] = r.pick([[3, 10], [2.5, 6], [4, 40], [10, 3], [6, 2.5], [5, 15]]);
        const x = Math.sqrt((1 - 2 / em) / (1 - 2 / rec));
        return {
          prompt: t`Two stations hover outside a black hole ($G = c = 1$): one at $r = ${em}M$ sends a laser signal to one at $r = ${rec}M$. What is the ratio $\omega_\text{rec}/\omega_\text{em}$ of the frequency received to the frequency sent, each measured by the local station's clock?`,
          answer: x, tol: { rel: 0.003 },
          errors: [
            { value: 1 / x, feedback: t`Upside down. The receiver's $u^t$ goes on top: $\omega_\text{rec}/\omega_\text{em} = u^t_\text{rec}/u^t_\text{em}$.` },
            { value: Math.sqrt(1 - 2 / em), feedback: 'That is the ratio for a receiver far away. This receiver hovers too, and its clock also runs slow.' },
          ],
          hints: [t`$\omega = E\,u^t$ at each station, with the same $E$.`, t`$\dfrac{\omega_\text{rec}}{\omega_\text{em}} = \sqrt{\dfrac{1 - 2/${em}}{1 - 2/${rec}}}$.`],
          teach: t`Between two static observers the frequency ratio is the ratio of their $u^t$: the conserved $E$ cancels.`,
          explain: t`$\sqrt{(1 - 2/${em})/(1 - 2/${rec})} = ${sci(x, 4)}$: ${x < 1 ? 'redshifted, because the signal climbs to a station whose clock runs faster' : 'blueshifted, because the signal falls to a station whose clock runs slower'}.`,
          visual: clockMap(em, rec),
        };
      },
    }),
    num({
      id: 'lab-clocks', difficulty: 2,
      gen(r) {
        const [what, h, note] = r.pick([
          ['two optical clocks at NIST in 2010, one raised by 33 cm', 0.33, 'Chou and colleagues resolved it — the first redshift measured over a tabletop height.'],
          ['a pair of optical lattice clocks, one at the foot of the Tokyo Skytree and one at its observatory 450 m up (2020)', 450, 'Takamoto and colleagues found agreement with general relativity to about one part in 10 000.'],
          ['Pound and Rebka’s gamma-ray source and absorber at the bottom and top of a 22.5 m tower (1960), for one trip up', 22.5, 'The measured shift was 1.05 ± 0.10 times this (up and down compared), sharpened to 1% by 1965.'],
        ]);
        const x = (G_LAB * h) / C ** 2;
        return {
          prompt: t`Take $g = ${G_LAB}\ \text{m/s}^2$. By what fraction does the upper clock run faster than the lower one, for ${what}? (Give $\Delta\omega/\omega$, a pure number.)`,
          answer: x, tol: { rel: 0.01 },
          errors: [
            { value: 2 * x, feedback: t`That is twice the shift: the up-and-down comparison Pound and Rebka made. One way it is $gh/c^2$.` },
            { value: (G_LAB * h) / C, feedback: 'Divide by c², not c: the shift is a ratio of energies, gh/c².' },
          ],
          hints: [t`The weak-field form of the redshift: $\Delta\omega/\omega = gh/c^2$.`, t`$gh/c^2 = ${G_LAB}\times${h}/(2.998\times10^{8})^2$.`],
          teach: 'Near a planet’s surface the fractional rate difference between two static clocks is gh/c².',
          explain: t`$gh/c^2 = ${sci(x)}$. ${note}`,
          visual: towerPic(`${h} m`),
        };
      },
    }),
    num({
      id: 'faller', difficulty: 3,
      gen(r) {
        const k = r.pick([3, 4, 8, 18]);
        const x = 1 / (1 + Math.sqrt(2 / k));
        return {
          prompt: t`An astronaut falls from rest far away straight into a black hole ($G = c = 1$). Her four-velocity is $u^t = 1/(1 - 2M/r)$, $u^r = -\sqrt{2M/r}$. Starlight falls in radially behind her: $p_t = -E$ and $p^r = -E$, so $p_r = g_{rr}p^r = -E/(1 - 2M/r)$. At $r = ${k}M$, what does she measure for $\omega/E$ — the light's frequency compared with its value far away?`,
          answer: x, tol: { rel: 0.003 },
          errors: [
            { value: 1 / Math.sqrt(1 - 2 / k), feedback: 'That is what a hovering observer measures. She is falling: include the u^r p_r term.' },
            { value: 1 + Math.sqrt(2 / k), feedback: t`Upside down. Simplify $\dfrac{1 - \sqrt{2M/r}}{1 - 2M/r}$ using $1 - 2M/r = (1 - \sqrt{2M/r})(1 + \sqrt{2M/r})$.` },
            { value: (1 + Math.sqrt(2 / k)) / (1 - 2 / k), feedback: t`Check the sign of the $u^r p_r$ term: $u^r$ and $p_r$ are both negative, so $-u^r p_r$ is negative.` },
          ],
          hints: [t`$\omega = -p_t u^t - p_r u^r$.`, t`$\omega = \dfrac{E}{1 - 2M/r} - \dfrac{E\sqrt{2M/r}}{1 - 2M/r} = E\,\dfrac{1 - \sqrt{2M/r}}{1 - 2M/r}$; now factor the denominator.`],
          teach: 'A frequency depends on who measures it: a falling observer sees light from behind redshifted, even deep in the well.',
          explain: t`$\omega = E\,\dfrac{1 - \sqrt{2M/r}}{1 - 2M/r} = \dfrac{E}{1 + \sqrt{2M/r}}$, which at $r = ${k}M$ is $${sci(x, 4)}\,E$. The gravitational blueshift is beaten by the Doppler shift of her fall away from the source; at the horizon the ratio is exactly $\tfrac12$. She does not see the universe's future flash by.`,
          visual: fallerSpeed(k),
        };
      },
    }),
    num({
      id: 'hot-spot', difficulty: 3,
      gen(r) {
        const k = r.pick([7, 8, 10, 12]);
        const x = Math.sqrt(1 - 3 / k);
        return {
          prompt: t`A glowing hot spot of gas moves on a circular geodesic orbit at $r = ${k}M$ around a black hole ($G = c = 1$), where $d\phi/dt = \sqrt{M/r^3}$ exactly. You observe it from far away along the orbit's axis, so the light reaching you has no angular momentum about that axis and $\omega_\text{em} = E\,u^t$. Find $u^t$ from the normalization $-(1 - 2M/r)(u^t)^2 + r^2(u^\phi)^2 = -1$ with $u^\phi = u^t\,d\phi/dt$, and give $\omega_\text{rec}/\omega_\text{em}$.`,
          answer: x, tol: { rel: 0.003 },
          errors: [
            { value: Math.sqrt(1 - 2 / k), feedback: 'That is a hovering emitter. This one also moves, and its motion slows its clock further.' },
            { value: 1 / x, feedback: t`Upside down: $\omega_\text{rec}/\omega_\text{em} = E/(E\,u^t) = 1/u^t$.` },
            { value: Math.sqrt(1 - 2 / k) * Math.sqrt(1 - 1 / k), feedback: t`That multiplies the hovering rate by a special-relativity factor with Newton's speed $\sqrt{M/r}$. The normalization does it exactly: $(u^t)^2(1 - 2M/r - r^2\Omega^2) = 1$ with $r^2\Omega^2 = M/r$.` },
          ],
          hints: [t`$(u^t)^2\left[(1 - 2M/r) - r^2\,(d\phi/dt)^2\right] = 1$, and $r^2\,(d\phi/dt)^2 = M/r$.`, t`So $(u^t)^2(1 - 3M/r) = 1$, and the ratio is $1/u^t = \sqrt{1 - 3M/r}$.`],
          teach: t`For an orbiting emitter $u^t$ carries both the gravitational and the transverse-Doppler shifts at once: $u^t = 1/\sqrt{1 - 3M/r}$ on a circular orbit.`,
          explain: t`$(u^t)^2(1 - 2M/r - M/r) = 1$ gives $u^t = 1/\sqrt{1 - 3M/r}$, so $\omega_\text{rec}/\omega_\text{em} = \sqrt{1 - 3/${k}} = ${sci(x, 4)}$. In 2018 the GRAVITY instrument tracked flares circling Sagittarius A* at roughly this distance, about 6 to 10 $M$ out.`,
          visual: hotSpot(k),
        };
      },
    }),
    code({
      id: 'measure', difficulty: 3,
      prompt: t`Measure frequencies with SymPy. Complete \`dot(a, b)\`, the inner product $g_{\mu\nu}a^\mu b^\nu$ of two vectors given by their upper components, and \`frequency(u, p)\` $= -p_\mu u^\mu = -g_{\mu\nu}u^\mu p^\nu$. The tests check that both observers' four-velocities are normalized, that the photon is null, and what each observer measures.`,
      starter: t`import sympy as sp

t, r, th, ph = sp.symbols('t r theta phi')
M, E = sp.symbols('M E', positive=True)
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)   # Schwarzschild, G = c = 1

def dot(a, b):
    """g_mn a^m b^n, summed over m and n."""
    return 0   # replace

p_in = [E/f, -E, 0, 0]                    # starlight falling radially inward, conserved E = -p_t
u_static = [1/sp.sqrt(f), 0, 0, 0]        # a hovering observer
u_fall = [1/f, -sp.sqrt(2*M/r), 0, 0]     # an observer falling from rest far away

def frequency(u, p):
    """What an observer with four-velocity u measures for a photon p."""
    return 0   # replace
`,
      answer: t`import sympy as sp

t, r, th, ph = sp.symbols('t r theta phi')
M, E = sp.symbols('M E', positive=True)
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)   # Schwarzschild, G = c = 1

def dot(a, b):
    """g_mn a^m b^n, summed over m and n."""
    return sum(g[m, n]*a[m]*b[n] for m in range(4) for n in range(4))

p_in = [E/f, -E, 0, 0]                    # starlight falling radially inward, conserved E = -p_t
u_static = [1/sp.sqrt(f), 0, 0, 0]        # a hovering observer
u_fall = [1/f, -sp.sqrt(2*M/r), 0, 0]     # an observer falling from rest far away

def frequency(u, p):
    """What an observer with four-velocity u measures for a photon p."""
    return -dot(u, p)
`,
      tests: [
        { name: 'both four-velocities have g(u, u) = −1', code: 'sp.simplify(dot(u_static, u_static) + 1) == 0 and sp.simplify(dot(u_fall, u_fall) + 1) == 0' },
        { name: 'the photon is null: g(p, p) = 0', code: 'sp.simplify(dot(p_in, p_in)) == 0 and sp.sympify(dot(u_static, u_static)) != 0' },
        { name: t`the hovering observer measures $E/\sqrt{1 - 2M/r}$`, code: 'sp.simplify(sp.sympify(frequency(u_static, p_in)) - E/sp.sqrt(f)) == 0' },
        { name: t`the falling observer measures $E/(1 + \sqrt{2M/r})$ (checked at $r = 5M$)`, code: 'abs(float(sp.sympify(frequency(u_fall, p_in)).subs({M: 1, r: 5, E: 1})) - 1/(1 + (2/5)**0.5)) < 1e-12' },
      ],
      hints: [t`\`dot\` is a double sum: \`sum(g[m, n]*a[m]*b[n] for m in range(4) for n in range(4))\`.`, t`\`frequency\` is one line: \`return -dot(u, p)\`.`],
      teach: 'Everything an observer measures is a scalar built from her four-velocity — here the frequency −g(u, p).',
      explain: t`With the inner product in place, both observers come out normalized, the photon null, and the two frequencies are those of the Explore picture: $E/\sqrt{1 - 2M/r}$ for the hovering observer and $E/(1 + \sqrt{2M/r})$ for the falling one. Try $r$ close to $2M$: the first blows up, the second tends to $E/2$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 20], y: [0, 1.1], xlabel: 'r / M', ylabel: 'u^r (falling observer)',
          curves: [{ fn: 'sqrt(2/x)', domain: [2, 20], color: 'gold', label: '|uʳ| = √(2M/r)', labelAt: 8 }],
          vlines: [{ x: 2, label: 'horizon' }],
        },
        caption: t`The radial component of the falling observer's four-velocity, $|u^r| = \sqrt{2M/r}$ ($G = c = 1$): the extra term her motion adds to $-p_\mu u^\mu$.`,
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-expand', difficulty: 3,
      prompt: t`Light climbs from a hovering emitter at $r$ to a hovering receiver at $r + h$ ($G = c = 1$). Expand the exact ratio $\dfrac{\omega_\text{rec}}{\omega_\text{em}} = \sqrt{\dfrac{1 - 2M/r}{1 - 2M/(r + h)}}$ to **first order in $M$**, keeping $h$ arbitrary.`,
      answer: '1 - M h/(r (r + h))', answerTeX: t`1 - \frac{Mh}{r(r + h)}`, lhs: t`\omega_\text{rec}/\omega_\text{em}`,
      vars: { M: [0.05, 0.3], r: [3, 10], h: [0.5, 6] },
      errors: [
        { answer: '1 + M h/(r (r + h))', feedback: t`Light climbing out is redshifted: the ratio must be below 1.` },
        { answer: '1 - M h/r^2', feedback: t`That also assumes $h \ll r$. Keep $h$ arbitrary: $1 - M/r + M/(r + h)$.` },
        { answer: '1 - 2 M h/(r (r + h))', feedback: t`Each square root halves its exponent: $\sqrt{1 - 2M/r} \approx 1 - M/r$.` },
      ],
      hints: [t`$\sqrt{1 - 2x} \approx 1 - x$ and $1/\sqrt{1 - 2y} \approx 1 + y$ for small $x$, $y$.`, t`$(1 - M/r)(1 + M/(r + h)) \approx 1 - M/r + M/(r + h)$; combine the fractions.`],
      teach: 'To first order the redshift is the difference of the Newtonian potentials, −M/r, at the two ends.',
      explain: t`$1 - \dfrac{M}{r} + \dfrac{M}{r + h} = 1 - \dfrac{Mh}{r(r + h)}$: the difference of $\Phi = -M/r$ at the two ends. For $h \ll r$ it becomes $1 - gh$ with $g = M/r^2$; for Gravity Probe A, $h$ was not small.`,
      visual: clockMap(4, 9),
    }),
    num({
      id: 'cp-gpa', difficulty: 3, transfer: true,
      prompt: t`In 1976 Gravity Probe A carried a hydrogen-maser clock on a rocket to 10 000 km above the ground and compared it with an identical maser on the ground. Ignoring the probe's slow motion near the top of its arc (the experiment cancelled the first-order Doppler shift with a two-way microwave link), by what fraction did the maser at apogee run faster than the one on the ground? Use $GM_\oplus/c^2 = 4.435$ mm and $R_\oplus = 6371$ km.`,
      answer: M_EARTH * (1 / R_EARTH - 1 / (R_EARTH + 1e7)), tol: { rel: 0.01 },
      errors: [
        { value: ((GM_EARTH / R_EARTH ** 2) * 1e7) / C ** 2, feedback: t`$gh/c^2$ assumes $g$ is the same all the way up. Over 10 000 km it is not: use $\dfrac{GM}{c^2}\left(\dfrac{1}{R} - \dfrac{1}{R + h}\right)$.` },
        { value: M_EARTH / (R_EARTH + 1e7), feedback: t`That is only the top clock's $GM/(rc^2)$. The shift is the difference between the two ends.` },
        { value: M_EARTH / R_EARTH, feedback: t`That compares the ground with far away. The probe was 10 000 km up, not at infinity.` },
      ],
      hints: [t`First order in $M$: $\dfrac{\Delta\omega}{\omega} = \dfrac{GM}{c^2}\left(\dfrac{1}{R} - \dfrac{1}{R + h}\right)$.`, t`$\dfrac{1}{6.371\times10^{6}} - \dfrac{1}{1.6371\times10^{7}}$ per metre, times $4.435\times10^{-3}$ m.`],
      teach: 'Over large heights the redshift is the difference of potentials, GM(1/R − 1/(R + h))/c², not gh/c².',
      explain: t`$4.435\times10^{-3}\times\left(\dfrac{1}{6.371\times10^{6}} - \dfrac{1}{1.6371\times10^{7}}\right) = ${sci(M_EARTH * (1 / R_EARTH - 1 / (R_EARTH + 1e7)))}$. Vessot and Levine's measurement agreed with the prediction to about 2 parts in 10 000 — still one of the most precise redshift tests, bettered only in 2018 by two Galileo navigation satellites stranded in eccentric orbits.`,
      visual: gpaPic,
    }),
    num({
      id: 'cp-s2', difficulty: 3, transfer: true,
      prompt: t`At its closest approach in May 2018 the star S2 passed Sagittarius A* (4.30 million solar masses) at 120 AU, moving at 7650 km/s. In this weak field, $u^t \approx 1 + \dfrac{GM}{rc^2} + \dfrac{v^2}{2c^2}$: gravity and the transverse Doppler shift both slow S2's clock. The extra redshift beyond the ordinary Doppler shift is $z \approx u^t - 1$; astronomers quote it as a speed, $zc$. Find $zc$ in km/s. ($GM_\odot/c^2 = 1476.6$ m, 1 AU $= 1.496\times10^{11}$ m.)`,
      answer: S2.kms(S2.zg + S2.zd), units: 'km/s', tol: { rel: 0.01 },
      errors: [
        { value: S2.kms(S2.zg), feedback: t`That is the gravitational part alone. S2 also moves fast: add $v^2/(2c^2)$.` },
        { value: S2.kms(S2.zd), feedback: t`That is the transverse Doppler part alone. Add the gravitational $GM/(rc^2)$.` },
        { value: S2.kms(2 * S2.zg + S2.zd), feedback: t`The gravitational part is $GM/(rc^2) = r_s/(2r)$, not $r_s/r$.` },
      ],
      hints: [t`$GM/c^2 = 4.30\times10^{6}\times1476.6$ m $= ${sci(SGR * M_SUN, 4)}$ m; divide by $r = 120\times1.496\times10^{11}$ m.`, t`$v^2/(2c^2) = (7.65\times10^{6})^2/(2\times(2.998\times10^{8})^2)$; add the two and multiply by $c$.`],
      teach: t`For a fast star deep in a black hole’s well, $u^t - 1$ adds the gravitational redshift and the transverse Doppler shift, about equal for a bound orbit.`,
      explain: t`Gravity: $${sci(S2.zg)}$, or $${sci(S2.kms(S2.zg))}$ km/s; transverse Doppler: $${sci(S2.zd)}$, or $${sci(S2.kms(S2.zd))}$ km/s; together $zc \approx ${sci(S2.kms(S2.zg + S2.zd))}$ km/s. The GRAVITY collaboration measured $f = 0.90 \pm 0.09\,(\text{stat}) \pm 0.15\,(\text{sys})$ times this (2018): the first redshift test near a supermassive black hole.`,
      visual: s2Pic,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (gravitational redshift and Killing vectors)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Pound & Rebka, “Apparent weight of photons”, Phys. Rev. Lett. 4, 337 (1960)', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Vessot et al., “Test of relativistic gravitation with a space-borne hydrogen maser”, Phys. Rev. Lett. 45, 2081 (1980)', url: 'https://doi.org/10.1103/PhysRevLett.45.2081' },
    { label: 'GRAVITY Collaboration, gravitational redshift in the orbit of S2 (2018)', url: 'https://arxiv.org/abs/1807.09409' },
  ],
});
