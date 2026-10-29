// Energy and momentum conservation in collisions, as one four-vector law,
// in Hartle's (−, +, +, +) sign with c = 1. Builds on gr.S04.d (π → μν,
// two-photon invariant masses, two-body decays) and phys2710.MP3.2–3.3
// (putty sticking head-on, thresholds on fixed targets and colliders, GZK)
// without repeating them: here relativistic elastic scattering (the lab
// momentum ellipse and the opening angle below 90°), an asymmetric sticky
// collision, the squaring trick for a photon emitted by a recoiling nucleus
// (why the Mössbauer effect needs a crystal), the centre-of-momentum speed,
// and photon–photon pair creation that makes the universe opaque to the
// highest-energy gamma rays.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { r6, label } from './_geom.js';

const t = String.raw;
const MP = 938.27208943;            // MeV, proton (CODATA 2022)
const ME = 0.51099895;              // MeV, electron
const U = 931.49410372;             // MeV per atomic mass unit (CODATA 2022)
const DEG = 180 / Math.PI;
const gam = (b) => 1 / Math.sqrt(1 - b * b);
/** Symmetric elastic scattering of equal masses: each particle's lab angle, in degrees, for a beam of Lorentz factor g. */
const halfAngle = (g) => Math.atan(Math.sqrt(2 / (g + 1))) * DEG;

/**
 * The momentum ellipse of equal-mass elastic scattering on a target at rest,
 * in units of the beam momentum: every possible outgoing momentum of particle 1
 * ends on it, and particle 2 carries the rest. g: the beam's Lorentz factor
 * (number or slider key); th: the centre-of-momentum angle in degrees.
 */
function ellipse({ g, th, sliders = null, readouts = null, showOut = true, newton = true, caption }) {
  const G = typeof g === 'number' ? r6(g) : g, TH = typeof th === 'number' ? r6(th) : th;
  const gc = `sqrt((${G} + 1)/2)`;
  const qx = `0.5*(1 + cos(${TH}*pi/180))`, qy = `0.5*sin(${TH}*pi/180)/${gc}`;
  const rx = `0.5*(1 - cos(${TH}*pi/180))`, ry = `-0.5*sin(${TH}*pi/180)/${gc}`;
  return {
    type: 'graph',
    params: {
      x: [-0.12, 1.12], y: [-0.62, 0.62], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'momentum along the beam (fraction of p)', ylabel: 'sideways',
      xticks: 6, yticks: 4,
      curves: [
        ...(newton ? [{ param: ['0.5 + 0.5*cos(t)', '0.5*sin(t)'], t: [0, 6.2832], color: 'ink3', dash: true, width: 1.2 }] : []),
        { param: ['0.5 + 0.5*cos(t)', `0.5*sin(t)/${gc}`], t: [0, 6.2832], color: 'accent', width: 2 },
      ],
      arrows: [
        { from: [0, 0], to: [1, 0], color: 'ink2', width: 1.4, dash: true, label: 'beam p', labelDx: -4, labelDy: 14, labelAlign: 'right' },
        ...(showOut ? [
          { from: [0, 0], to: [qx, qy], color: 'gold', width: 2.6, label: '1', labelDx: 6 },
          { from: [0, 0], to: [rx, ry], color: 'violet', width: 2.6, label: '2', labelDx: 6, labelDy: 12 },
        ] : []),
      ],
      ...(showOut ? { points: [{ x: qx, y: qy, r: 3, color: 'gold' }] } : {}),
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`Final momenta of two equal masses after an elastic collision with one initially at rest, as fractions of the beam momentum $p$. Every possible momentum of particle 1 ends on the blue ellipse; particle 2 takes the rest. Grey dashed: Newton’s circle, where the two always leave at $90^\circ$.`,
  };
}

/** Four-momentum arrows on the energy–momentum plane (c = 1): parts added tip to tail, and the total. */
function emPicture({ parts, M, unit = 'kg', caption }) {
  let x = 0, y = 0, lo = 0, hi = 0;
  const names = [];
  const arrows = parts.map(([E, p, name, color]) => { const a = { from: [r6(x), r6(y)], to: [r6(x + p), r6(y + E)], color, width: 2.4 }; names.push(label(x + p / 2, y + E / 2, name, color, 8, 4)); x += p; y += E; lo = Math.min(lo, x); hi = Math.max(hi, x); return a; });
  arrows.push({ from: [0, 0], to: [r6(x), r6(y)], color: 'gold', width: 2.8 });
  names.push(parts[0][1] < 0 ? label(x * 0.45, y * 0.45, 'total', 'gold', 8, 4) : label(x * 0.45, y * 0.45, 'total', 'gold', -8, 4, 'right'));
  const top = y * 1.18, span = Math.max(hi - lo, top * 0.5), right = hi + 0.3 * span, left = lo - 0.15 * span;
  return {
    type: 'graph',
    params: {
      x: [r6(left), r6(right)], y: [0, r6(top)], equal: true, aspect: 'square', axesAt: 'edge', xlabel: `momentum (${unit})`, ylabel: `energy (${unit})`, xticks: 0, yticks: 0,
      curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, ...(M ? [{ fn: `sqrt(${r6(M * M)} + x^2)`, color: 'ink3', dash: true, width: 1.2 }] : [])],
      arrows, points: names,
    },
    caption: caption ?? t`Four-momenta as arrows on the energy–momentum plane, $c = 1$, added tip to tail; the gold arrow is the total, which a collision cannot change. The grey hyperbola holds every four-momentum of the total’s mass; the orange line is light.`,
  };
}

const EX = { K: 1500 };
EX.g = 1 + EX.K / MP; EX.E = EX.g * MP; EX.p = Math.sqrt(EX.E ** 2 - MP ** 2);
EX.Ep = (EX.E + MP) / 2; EX.pp = Math.sqrt(EX.Ep ** 2 - MP ** 2);
EX.th = halfAngle(EX.g);

export default lesson({
  id: 'phys3710.R3.2',
  title: 'Energy and momentum conservation in collisions',
  minutes: 13, difficulty: 3,
  intro: t`In relativity energy and momentum are the time and space parts of one four-vector, so their conservation is one law: in any collision or decay, **the total four-momentum before equals the total after** (with $c = 1$),

$$\sum_{\text{in}} \mathbf p_i = \sum_{\text{out}} \mathbf p_f$$

Four equations at once, true in every frame. Two tools make them easy. **Square to kill unknowns:** $\mathbf p\cdot\mathbf p = -m^2$ for every particle and $0$ for a photon, so squaring a well-chosen combination removes whatever you do not want. And **masses do not add**: what is conserved is energy, rest energy included, so a lump made by a collision weighs more than its parts. [Massless particles and four-momentum](#/lesson/phys2710.MP3.3) used this law for thresholds; here it predicts angles, recoils and the opacity of the universe.`,
  symbols: [
    { tex: '\\mathbf p_i,\\ \\mathbf p_f', text: t`the four-momenta $(E, \vec p)$ of each incoming and each outgoing particle, in MeV (with $c = 1$)` },
    { tex: '\\sum', text: 'add the four-vectors component by component: total energy and total momentum' },
    { tex: '\\mathbf p\\cdot\\mathbf p', text: t`the invariant $-E^2 + |\vec p|^2 = -m^2$, in the $(-,+,+,+)$ signature of Hartle and lesson R1.2` },
    { tex: 'm', text: t`a particle’s mass, in MeV (meaning MeV/$c^2$) or kg; zero for a photon` },
  ],
  why: 'Every particle discovered at an accelerator, every gamma-ray line from a nucleus and every cosmic-ray cutoff is read through this one conservation law and its invariants.',
  visual: {
    ...ellipse({
      g: 'g', th: 'th',
      sliders: [
        { key: 'g', label: t`Beam Lorentz factor $\gamma$`, min: 1, max: 20, step: 0.01, value: 2.6, explain: t`$\gamma = E/m$ of the incoming particle. For protons $\gamma = 2.6$ is a kinetic energy of 1.5 GeV.` },
        { key: 'th', label: t`Scattering angle in the centre-of-momentum frame`, min: 0, max: 180, step: 1, value: 70, unit: '^\\circ', explain: 'In the frame where the total momentum is zero the two particles fly apart back to back; this is the angle they turn through there.' },
      ],
      readouts: [
        { label: t`proton kinetic energy $(\gamma - 1)m$`, expr: `(g - 1)*${MP}`, digits: 4, unit: t`\text{MeV}` },
        { label: t`lab angle, gold`, expr: `atan2(0.5*sin(th*pi/180)/sqrt((g + 1)/2), 0.5*(1 + cos(th*pi/180)))*180/pi`, digits: 3, unit: t`^\circ` },
        { label: t`lab angle, violet`, expr: `atan2(0.5*sin(th*pi/180)/sqrt((g + 1)/2), 0.5*(1 - cos(th*pi/180) + 0.000001))*180/pi`, digits: 3, unit: t`^\circ` },
        { label: 'opening angle', expr: `(atan2(0.5*sin(th*pi/180)/sqrt((g + 1)/2), 0.5*(1 + cos(th*pi/180))) + atan2(0.5*sin(th*pi/180)/sqrt((g + 1)/2), 0.5*(1 - cos(th*pi/180) + 0.000001)))*180/pi`, digits: 3, unit: t`^\circ` },
      ],
      caption: t`A beam particle hits an identical one at rest and both fly off, with no energy lost to anything else. Momenta are fractions of the beam momentum; motion is in one plane. Grey dashed: Newton’s circle. Blue: the relativistic ellipse, squashed sideways by the factor $1/\sqrt{(\gamma + 1)/2}$.`,
    }),
    title: 'Why fast billiard balls part at less than 90°',
    lead: t`A beam proton hits a proton at rest. Conservation of four-momentum fixes everything except the direction they scatter; slide that angle and the gold and violet arrows show the two outgoing momenta in the laboratory. They always add up to the beam’s momentum. Watch the opening angle between them.`,
    tasks: [
      t`Set $\gamma$ to 1 (a slow beam): the ellipse becomes Newton’s circle, and the opening angle is $90^\circ$ whatever the scattering angle — Thales’ theorem.`,
      t`Raise $\gamma$: the ellipse flattens and the opening angle drops below $90^\circ$ for every scattering angle. At $\gamma = 20$ the protons leave in a narrow forward wedge.`,
      t`Set the scattering angle to $90^\circ$: the two protons share the energy equally and leave symmetrically — the case of the worked example.`,
    ],
  },
  example: {
    prompt: t`A proton with kinetic energy ${EX.K} MeV hits a proton at rest, and the two scatter elastically and symmetrically, each at angle $\theta$ to the beam. Find $\theta$ and the opening angle $2\theta$. ($m = 938.27$ MeV.)`,
    visual: ellipse({ g: EX.g, th: 90, caption: t`Symmetric scattering at this energy: the two momenta end on the ellipse at equal angles above and below the beam. Fractions of the beam momentum; Newton’s circle dashed.` }),
    steps: [
      { label: 'Before', text: t`Beam: $E = K + m = ${nice(EX.E, 6)}$ MeV, $p = \sqrt{E^2 - m^2} = ${nice(EX.p, 5)}$ MeV. Target: $(m, 0)$. Total four-momentum: $(${nice(EX.E + MP, 6)},\ ${nice(EX.p, 5)},\ 0,\ 0)$ MeV.` },
      { label: 'After: energy', text: t`By symmetry the protons share the energy: each has $E' = (E + m)/2 = ${nice(EX.Ep, 6)}$ MeV, so $p' = \sqrt{E'^2 - m^2} = ${nice(EX.pp, 5)}$ MeV.` },
      { label: 'After: momentum', text: t`Sideways components cancel; the forward ones add to the beam’s: $2p'\cos\theta = p$, so $\cos\theta = ${nice(EX.p, 5)}/(2\times${nice(EX.pp, 5)}) = ${nice(Math.cos(EX.th / DEG), 4)}$ and $\theta = ${nice(EX.th, 4)}^\circ$.` },
      { label: 'In general', text: t`Write $E = \gamma m$ and the same steps give $\cos^2\theta = \dfrac{\gamma + 1}{\gamma + 3}$, or $\tan^2\theta = \dfrac{2}{\gamma + 1}$. Here $\gamma = ${nice(EX.g, 5)}$: $\tan^2\theta = ${nice(2 / (EX.g + 1), 4)}$ ✓.` },
      { label: 'Sense check', text: t`For a slow beam $\gamma \to 1$, $\tan\theta \to 1$ and $2\theta \to 90^\circ$ — Newton’s billiard-ball result. Here $2\theta = ${nice(2 * EX.th, 4)}^\circ$: in bubble-chamber photographs this narrowing was a visible signature of relativistic protons.` },
    ],
    answer: t`$\theta = ${nice(EX.th, 4)}^\circ$ each, an opening angle of $${nice(2 * EX.th, 4)}^\circ$ — less than Newton’s $90^\circ$.`,
  },
  practice: [
    multi({
      id: 'conserved', difficulty: 1,
      prompt: 'Two lumps of clay fly together at relativistic speed and stick. Which quantities are the same before and after? Select every one.',
      visual: emPicture({ parts: [[2.5, 1.5, 'lump 1', 'accent'], [3, 0, 'lump 2', 'violet']], M: Math.sqrt(28), caption: t`One possible collision: a 2 kg lump at $0.6c$ meets a 3 kg lump at rest ($c = 1$, energies in kg). The gold total is what the stuck lump carries.` }),
      choices: ['The total energy, rest energy included', 'The total momentum', 'The total four-momentum', 'The sum of the masses', 'The total kinetic energy', 'The speed of the centre of mass'],
      answer: [0, 1, 2, 5],
      why: {
        3: 'Mass is not additive: kinetic energy turns into rest energy (heat in the clay), so the lump weighs more than the two pieces did.',
        4: 'Kinetic energy is lost — it becomes internal energy, and so mass.',
      },
      hints: ['Energy and momentum are always conserved; ask which quantities are just pieces of them.', 'The centre-of-momentum velocity is the total momentum over the total energy.'],
      teach: 'In every collision the total four-momentum is conserved; kinetic energy and the sum of rest masses are not.',
      explain: t`Total energy, total momentum (together, the four-momentum) and their ratio — the velocity of the centre of momentum, $\vec p_{\text{tot}}/E_{\text{tot}}$ — are fixed. The kinetic energy that disappears reappears as extra mass of the stuck lump.`,
    }),
    num({
      id: 'stick-mass', difficulty: 2,
      gen(r) {
        const [m1, m2] = r.pick([[2, 3], [1, 4], [3, 2], [1, 1.5]]);
        const [b, bs] = r.pick([[0.6, '0.6'], [0.8, '0.8'], [5 / 13, t`\tfrac{5}{13}`]]);
        const E1 = gam(b) * m1, p1 = E1 * b, M = Math.sqrt((E1 + m2) ** 2 - p1 ** 2);
        return {
          prompt: t`A ${m1} kg lump moving at $${bs}c$ hits a ${m2} kg lump at rest and they stick. What is the mass of the stuck lump, in kg? (With $c = 1$, measure energies in kg.)`,
          visual: emPicture({ parts: [[E1, p1, `${m1} kg`, 'accent'], [m2, 0, `${m2} kg`, 'violet']], M, caption: t`The two four-momenta and their total ($c = 1$, in kg). The stuck lump’s mass is the total arrow’s invariant length.` }),
          answer: M, units: 'kg', tol: { rel: 0.002 },
          errors: [{ value: m1 + m2, feedback: 'Masses do not add. The kinetic energy lost becomes rest energy: compute √(E² − p²) of the total.' }],
          hints: [t`Lump 1: $E_1 = \gamma m_1 = ${nice(E1, 4)}$, $p_1 = \gamma m_1\beta = ${nice(p1, 4)}$. Lump 2: $(${m2}, 0)$.`, t`$M^2 = (E_1 + ${m2})^2 - p_1^2$.`],
          teach: 'The mass of what a collision makes is the invariant length of the total four-momentum — more than the sum of the parts.',
          explain: t`$M = \sqrt{(${nice(E1, 4)} + ${m2})^2 - ${nice(p1, 4)}^2} = ${nice(M, 4)}$ kg, heavier than $${m1 + m2}$ kg by $${nice(M - m1 - m2, 3)}$ kg — the kinetic energy that became heat. It moves off at $p/E = ${nice(p1 / (E1 + m2), 4)}c$.`,
        };
      },
    }),
    num({
      id: 'elastic-angle', difficulty: 2,
      gen(r) {
        const K = r.pick([500, 1000, 2000, 5000]);
        const g = 1 + K / MP, ans = 2 * halfAngle(g);
        return {
          prompt: t`A proton with kinetic energy ${K} MeV scatters elastically off a proton at rest, and the two leave symmetrically about the beam. What is the opening angle between them, in degrees? Use $\tan^2\theta = 2/(\gamma + 1)$ for each one’s angle $\theta$. ($m = 938.27$ MeV.)`,
          visual: ellipse({ g, th: 90, showOut: false, caption: t`The momentum ellipse at this energy (blue) and Newton’s circle (grey dashed), in fractions of the beam momentum. The symmetric pair ends on the ellipse straight above and below its centre.` }),
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: 90, feedback: 'That is Newton’s answer, true only for slow particles. Use the relativistic γ.' }, { value: ans / 2, feedback: 'That is the angle of one proton. The opening angle is between the two: 2θ.' }],
          hints: [t`$\gamma = 1 + K/m = ${nice(g, 5)}$.`, t`$\tan\theta = \sqrt{2/(\gamma + 1)} = ${nice(Math.sqrt(2 / (g + 1)), 4)}$; double the angle.`],
          teach: 'Equal masses scattering elastically off a target at rest leave at less than 90° once the beam is relativistic.',
          explain: t`$\theta = \arctan${nice(Math.sqrt(2 / (g + 1)), 4)} = ${nice(ans / 2, 4)}^\circ$, so $2\theta = ${nice(ans, 4)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'cm-speed', difficulty: 2,
      gen(r) {
        const K = r.pick([800, 1500, 3000, 6000]);
        const E = K + MP, p = Math.sqrt(E * E - MP * MP), ans = p / (E + MP);
        return {
          prompt: t`A proton with kinetic energy ${K} MeV hits a proton at rest. How fast does the centre-of-momentum frame — the frame where the total momentum is zero — move through the laboratory? Give $v/c$.`,
          visual: emPicture({ parts: [[E, p, 'beam', 'accent'], [MP, 0, 'target', 'violet']], M: Math.sqrt((E + MP) ** 2 - p * p), unit: 'MeV', caption: t`The beam and target four-momenta and their total ($c = 1$). The total points along the centre-of-momentum frame’s time axis.` }),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: p / E, feedback: t`That is the beam proton’s own speed. The centre-of-momentum frame moves with the total: $p_{\text{tot}}/E_{\text{tot}}$.` }, { value: (p / E) / 2, feedback: t`Half the beam speed is Newton’s answer. Use the total four-momentum: $v = p_{\text{tot}}/E_{\text{tot}}$.` }],
          hints: [t`Total: $E_{\text{tot}} = K + 2m = ${nice(E + MP, 6)}$ MeV and $p_{\text{tot}} = \sqrt{(K + m)^2 - m^2} = ${nice(p, 5)}$ MeV.`, t`A frame in which a four-vector has no space part moves at $p/E$ of that four-vector.`],
          teach: t`The centre-of-momentum frame moves at $v = p_{\text{tot}}/E_{\text{tot}}$: the velocity of the total four-momentum.`,
          explain: t`$v = ${nice(p, 5)}/${nice(E + MP, 6)} = ${nice(ans, 4)}c$, faster than the Galilean guess of half the beam speed, $${nice(p / E / 2, 4)}c$.`,
        };
      },
    }),
    order({
      id: 'square-trick', difficulty: 3,
      prompt: t`An excited nucleus of mass $M^*$, at rest, emits a gamma ray and drops to mass $M$. Put the steps that find the gamma ray’s energy $E_\gamma$ in order (four-momenta $\mathbf P^*$, $\mathbf P$ and $\mathbf k$; $c = 1$).`,
      visual: emPicture({ parts: [[1.2, -0.45, 'nucleus P', 'accent'], [0.45, 0.45, 'photon k', 'warn']], M: 0, unit: 'MeV', caption: t`The decay drawn on the energy–momentum plane, $c = 1$, with the recoil exaggerated: the photon and the recoiling nucleus add up to the excited nucleus at rest (gold, straight up).` }),
      items: [
        t`Conservation: $\mathbf P^* = \mathbf P + \mathbf k$.`,
        t`Isolate what you do not care about: $\mathbf P = \mathbf P^* - \mathbf k$.`,
        t`Square both sides: $\mathbf P\cdot\mathbf P = \mathbf P^*\cdot\mathbf P^* - 2\,\mathbf P^*\cdot\mathbf k + \mathbf k\cdot\mathbf k$.`,
        t`Use invariants: $-M^2 = -M^{*2} - 2\,\mathbf P^*\cdot\mathbf k + 0$.`,
        t`In the rest frame $\mathbf P^*\cdot\mathbf k = -M^*E_\gamma$, so $E_\gamma = \dfrac{M^{*2} - M^2}{2M^*}$.`,
      ],
      hints: ['Start from the conservation law, then get the unknown recoil momentum alone on one side.', 'Squaring turns every four-momentum you do not know into its mass.'],
      teach: 'Square to kill unknowns: isolate the four-momentum you do not need, square it, and only its mass is left.',
      explain: t`Isolating $\mathbf P$ and squaring replaces the unknown recoil by $-M^2$; the photon’s $\mathbf k\cdot\mathbf k = 0$. The result $E_\gamma = (M^{*2} - M^2)/2M^*$ is a little less than $M^* - M$: the nucleus’s recoil takes the rest.`,
    }),
    num({
      id: 'recoil', difficulty: 3,
      gen(r) {
        const [nuc, mu, dE] = r.pick([['iron-57', 56.935392, 14412.5], ['tin-119', 118.903311, 23870], ['iridium-191', 190.960591, 129400]]);
        const M = mu * U * 1e6, ans = dE * dE / (2 * (M + dE)) * 1e3;
        return {
          prompt: t`A free ${nuc} atom (mass ${mu} u, with $1\ \text{u} = 931.494$ MeV) at rest emits a gamma ray from a nuclear transition of energy ${dE >= 1e5 ? '129.4' : nice(dE / 1000, 6)} keV. Momentum conservation makes the atom recoil. How much kinetic energy does the recoil take, in meV? (From $E_\gamma = (M^{*2} - M^2)/2M^*$ the recoil is $\Delta E^2/2M^*$.)`,
          visual: emPicture({ parts: [[1.2, -0.45, 'atom', 'accent'], [0.45, 0.45, 'gamma ray', 'warn']], M: 0, unit: 'MeV', caption: t`Not to scale: the recoil is drawn hugely exaggerated. In reality the photon’s arrow is about $10^{-7}$ of the atom’s.` }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`The recoil kinetic energy is $p^2/2M$ with $p = E_\gamma$: there is a 2 in the denominator.` }],
          hints: [t`$M^* \approx ${tex(M, 5)}$ eV and $\Delta E = ${tex(dE, 6)}$ eV.`, t`Recoil $= \Delta E^2/2M^* = (${tex(dE, 6)})^2/(2\times${tex(M, 5)})$ eV.`],
          teach: 'An emitting atom recoils with energy ΔE²/2M, so the photon falls short of the transition energy by that amount.',
          explain: t`$\Delta E^2/2M^* = ${nice(ans, 4)}$ meV. That is $10^4$ to $10^6$ times the natural width of such lines (for iron-57, about $5\times10^{-9}$ eV), so a free atom’s gamma ray misses the resonance of an identical atom at rest. Rudolf Mössbauer found in 1958 that a nucleus bound in a crystal can emit with no recoil — the whole crystal takes the momentum — and the line becomes sharp enough to measure gravitational redshift in a 22.5 m tower ([Clocks run slow low down](#/lesson/gr.S23.i)).`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A student finds the speed of the lump made when a 1 kg lump at $0.8c$ sticks to a 1 kg lump at rest:

“Momentum: $\gamma m v = \tfrac53 \times 1 \times 0.8 = \tfrac43$ kg·c. The new lump has mass $1 + 1 = 2$ kg, so $\gamma' (2) v' = \tfrac43$, which gives $v' = 0.555c$.”

Where is the error?`,
      visual: emPicture({ parts: [[5 / 3, 4 / 3, 'moving', 'accent'], [1, 0, 'at rest', 'violet']], M: Math.sqrt((8 / 3) ** 2 - (4 / 3) ** 2), caption: t`The two four-momenta and their total ($c = 1$, in kg). The total lies on the grey hyperbola of its own mass — not on the one for 2 kg.` }),
      choices: ['The new lump’s mass is not 2 kg', t`The moving lump’s momentum should be $mv = 0.8$ kg·c`, 'Momentum is not conserved in an inelastic collision', t`$\gamma$ for $0.8c$ is $\tfrac54$, not $\tfrac53$`],
      answer: 0,
      why: {
        1: t`Relativistic momentum is $\gamma m v$; the student had that right.`,
        2: 'Momentum is conserved in every collision; it is kinetic energy that is not.',
        3: t`$1/\sqrt{1 - 0.64} = 1/0.6 = \tfrac53$. Correct.`,
      },
      hints: ['Which of the student’s assumptions would fail if kinetic energy turned into heat?', 'Use energy conservation too: the lump’s mass is √(E² − p²) of the total.'],
      teach: 'In an inelastic collision the products are heavier than the parts: find their mass from the total four-momentum, never by adding masses.',
      explain: t`Total $E = \tfrac53 + 1 = \tfrac83$, $p = \tfrac43$, so $M = \sqrt{64/9 - 16/9} = ${nice(Math.sqrt(48) / 3, 4)}$ kg, and $v' = p/E = 0.5c$ exactly.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-therapy', difficulty: 3, transfer: true,
      prompt: t`Proton-therapy cyclotrons deliver protons of up to about 230 MeV kinetic energy. In the hydrogen of tissue, a beam proton sometimes scatters elastically off a hydrogen nucleus (a proton at rest), and both leave symmetrically about the beam. What is the opening angle between them, in degrees? ($m = 938.27$ MeV.)`,
      visual: ellipse({ g: 1 + 230 / MP, th: 90, showOut: false, caption: t`The momentum ellipse at this energy (blue) beside Newton’s circle (grey dashed): at 230 MeV they almost coincide.` }),
      answer: 2 * halfAngle(1 + 230 / MP), units: 'deg', tol: { rel: 0.002 },
      errors: [{ value: 90, feedback: 'Close, but not Newton’s answer: at γ = 1.25 the relativistic angle is a few degrees smaller.' }, { value: halfAngle(1 + 230 / MP), feedback: 'That is one proton’s angle; the opening angle is twice it.' }],
      hints: [t`$\gamma = 1 + 230/938.27$; each angle has $\tan^2\theta = 2/(\gamma + 1)$.`, t`$\tan\theta = \sqrt{2/${nice(2 + 230 / MP, 5)}}$.`],
      teach: 'Even at medical energies the relativistic opening angle is measurably below 90°.',
      explain: t`$\gamma = ${nice(1 + 230 / MP, 5)}$, $\theta = ${nice(halfAngle(1 + 230 / MP), 4)}^\circ$, so the opening angle is $${nice(2 * halfAngle(1 + 230 / MP), 4)}^\circ$ — about $3^\circ$ less than Newton predicts, which beam-transport and dose codes must get right.`,
    }),
    num({
      id: 'cp-opaque', difficulty: 3, transfer: true,
      gen(r) {
        const [what, Eb, unit, f] = r.pick([
          ['a cosmic-microwave-background photon of typical energy $6.3\\times10^{-4}$ eV', 6.3e-4, 'TeV', 1e-12],
          ['an infrared photon of starlight of energy 0.5 eV', 0.5, 'GeV', 1e-9],
          ['a near-infrared photon of energy 1.2 eV', 1.2, 'GeV', 1e-9],
        ]);
        const ans = (ME * 1e6) ** 2 / Eb * f;
        return {
          prompt: t`A gamma ray from a distant galaxy meets ${what} head-on. What is the least gamma-ray energy for $\gamma + \gamma \to e^+ + e^-$? (Square the total four-momentum: for head-on photons $-(\mathbf k_1 + \mathbf k_2)^2 = 4E_1E_2$, and it must reach $(2m_e)^2$, with $m_e = 0.511$ MeV.) Answer in ${unit}.`,
          visual: {
            type: 'graph',
            params: { x: [-4, 1], y: [-1, 6], aspect: 'wide', xlog: true, ylog: true, xlabel: 'background photon energy (eV)', ylabel: 'threshold gamma-ray energy (GeV)', axesAt: 'edge',
              curves: [{ fn: `${r6(Math.log10((ME * 1e6) ** 2 / 1e9))} - x`, color: 'accent', width: 2.2 }],
              shade: [{ fn: '6', lower: `${r6(Math.log10((ME * 1e6) ** 2 / 1e9))} - x`, from: -4, to: 1, color: 'bad', alpha: 0.12 }],
              points: [label(-1.4, 4.8, 'pairs made: gamma rays absorbed', 'bad', 0, 0), label(-3.4, -0.4, 'universe transparent', 'good', 0, 0, 'left')] },
            caption: t`Head-on threshold for making an electron–positron pair, on logarithmic scales. Above the line the gamma ray is absorbed. Real backgrounds come from all directions, which raises the threshold for most collisions.`,
          },
          answer: ans, units: unit, tol: { rel: 0.01 },
          errors: [{ value: ans / 4, feedback: t`The pair needs $4E_1E_2 \ge (2m_e)^2 = 4m_e^2$, so $E_1 \ge m_e^2/E_2$, not $m_e^2/(4E_2)$.` }],
          hints: [t`$4E_1E_2 = 4m_e^2$ at threshold, so $E_1 = m_e^2/E_2$.`, t`$m_e^2 = (${tex(ME * 1e6, 4)}\ \text{eV})^2 = ${tex((ME * 1e6) ** 2, 4)}\ \text{eV}^2$.`],
          teach: 'Two photons can make a pair once −(k₁ + k₂)² reaches (2m)²: head-on, E₁E₂ ≥ m².',
          explain: t`$E_1 = ${tex((ME * 1e6) ** 2, 4)}/${Eb < 1e-3 ? tex(Eb, 2) : Eb}\ \text{eV} = ${tex(ans, 3)}$ ${unit}. Above this, gamma rays from far away are absorbed on the way: the observed TeV spectra of distant blazars are steepened in just this way, and the CMB makes the universe nearly opaque to photons above about a PeV over intergalactic distances.`,
        };
      },
    }),
    mcq({
      id: 'cp-ninety', difficulty: 2,
      prompt: t`A bubble-chamber photograph shows a proton striking a proton at rest; the two outgoing tracks make an angle of $90.0^\circ \pm 0.5^\circ$. What can you conclude?`,
      visual: ellipse({ g: 1.002, th: 60, caption: t`At low beam energy the ellipse is indistinguishable from Newton’s circle, and every pair of outgoing momenta meets at a right angle.` }),
      choices: ['The beam proton was far from relativistic', 'The collision was inelastic', 'The beam proton was ultra-relativistic', 'The protons scattered at 90° in the centre-of-momentum frame'],
      answer: 0,
      why: {
        1: 'An elastic collision is exactly what gives 90° at low energy; a lost particle or energy would change the angle in no fixed way.',
        2: 'Fast protons leave at less than 90°, for every scattering angle.',
        3: 'At low energy the opening angle is 90° whatever the centre-of-momentum angle; at high energy it is below 90° even for 90° there.',
      },
      hints: [t`$\tan\theta_1\tan\theta_2 = 2/(\gamma + 1)$ for any elastic scattering of equal masses.`],
      teach: 'An opening angle of 90° for equal masses means a slow beam; relativity closes the angle.',
      explain: t`$\tan\theta_1\tan\theta_2 = 2/(\gamma + 1)$ equals 1 — a right angle — only when $\gamma \approx 1$. A measurably smaller angle would have been the signature of a relativistic beam.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.3 (conservation of four-momentum, collisions and decays)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics, ch. 8 (collisions)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Mössbauer (1958), Kernresonanzfluoreszenz von Gammastrahlung in Ir191, Z. Phys. 151, 124', url: 'https://doi.org/10.1007/BF01344210' },
    { label: 'Gould & Schréder (1966), Opacity of the universe to high-energy photons, PRL 16, 252', url: 'https://doi.org/10.1103/PhysRevLett.16.252' },
  ],
});
