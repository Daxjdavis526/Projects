// Rutherford scattering as a central-force problem (Taylor §14.6; Goldstein
// §3.10): the repulsive inverse-square orbit is a hyperbola whose asymptotes
// make cos φ₀ = 1/e, giving b = (γ/2E) cot(θ/2) and dσ/dΩ =
// (γ/4E)²/sin⁴(θ/2). Numbers for Rutherford's alphas (radium C′, 7.69 MeV)
// on gold: γ = 2·79·e²/4πε₀, b(90°) = 14.8 fm, dσ/dΩ(90°) = 2.19 b/sr; the
// 1911 predictions (θ, thickness, Z², 1/E²) against Geiger and Marsden's 1913
// counts; why the total cross section is infinite (screening cuts it off);
// the centre-of-mass energy and where the formula fails (closest approach
// reaching the nuclear surface on light targets). Transfer: a gravity-assist
// flyby is attractive Rutherford scattering. The experiment's story is
// phys2710.MP5.1; nuclear sizes phys3710.N1.1. Numbers from
// model/mp-rutherford.js.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import * as R from '../../src/viz/model/mp-rutherford.js';
import { sci, gpic, seg, lab, distinct } from './_cm5.js';

const t = String.raw;
const DEG = Math.PI / 180;
const KE2 = R.KE2;                              // e²/4πε₀ in MeV fm
const GM_JUP = 1.26686534e17, R_JUP = 7.1492e7;  // m³/s², m (equatorial)

const EX = (() => {
  const K = 7.69, Z = 79, g = 2 * Z * KE2, b90 = g / (2 * K), ds90 = (g / (4 * K)) ** 2 / Math.sin(Math.PI / 4) ** 4;
  return { K, Z, g, b90, ds90, d: g / K, Rn: R.nuclearRadius(197) + R.nuclearRadius(4) };
})();
const GM = Object.fromEntries(R.GM_GOLD.map(([a, n]) => [a, n]));

/** A still mp-rutherford picture. */
const still = (params, caption) => ({ type: 'mp-rutherford', params: { play: false, controls: false, readout: false, panel: 'none', ...params }, caption });

export default lesson({
  id: 'phys3550.M11.2',
  title: 'Rutherford scattering',
  minutes: 18, difficulty: 3,
  intro: t`Rutherford's problem was a central-force problem. An alpha particle (charge $ze$, $z = 2$) passes a nucleus (charge $Ze$) that repels it with $F = \gamma/r^2$ — Kepler's force with the sign flipped. Its orbit is one branch of a hyperbola ([M5.3](#/lesson/phys3550.M5.3)), bent away from the nucleus, and the hyperbola's geometry ties the impact parameter to the scattering angle. Feed that into [the cross-section formula](#/lesson/phys3550.M11.1) and out comes the law Rutherford published in 1911: the number scattered per steradian falls as $1/\sin^4(\theta/2)$, grows as $Z^2$ and falls as $1/E^2$. Geiger and Marsden confirmed every one of those dependences in 1913. The formula proves the positive charge is concentrated in a point-like nucleus — no spread-out charge could throw alphas straight back. (The experiment's story is told in [Rutherford scattering](#/lesson/phys2710.MP5.1); here is the mechanics.)`,
  equation: t`\frac{d\sigma}{d\Omega} = \left(\frac{\gamma}{4E}\right)^2\frac{1}{\sin^4(\theta/2)}, \qquad b = \frac{\gamma}{2E}\cot\frac{\theta}{2}, \qquad \gamma = \frac{zZe^2}{4\pi\epsilon_0}`,
  symbols: [
    { tex: '\\gamma', text: 'the strength of the repulsion $F = \\gamma/r^2$; for an alpha on a nucleus $\\gamma = zZe^2/4\\pi\\epsilon_0$, and $e^2/4\\pi\\epsilon_0 = 1.440$ MeV fm' },
    { tex: 'E', text: 'the incoming kinetic energy (in the centre-of-mass frame; for a heavy target, nearly the lab energy), in MeV' },
    { tex: '\\theta', text: 'the scattering angle' },
    { tex: 'b', text: 'the impact parameter, in fm ($1\\ \\text{fm} = 10^{-15}$ m)' },
    { tex: 'z, Z', text: 'the charge numbers of projectile and target: 2 for an alpha, 79 for gold' },
    { tex: '\\frac{d\\sigma}{d\\Omega}', text: 'the differential cross section, in $\\text{fm}^2/\\text{sr}$ or b/sr ($1\\ \\text{b} = 100\\ \\text{fm}^2$)' },
  ],
  why: t`It is the one scattering problem whose classical answer is exactly the quantum one, it discovered the nucleus, and its attractive twin is every gravity-assist flyby a spacecraft has made.`,
  visual: {
    type: 'mp-rutherford',
    title: 'Hyperbolas past a nucleus',
    lead: t`A beam of alphas on exact Coulomb hyperbolas past a fixed nucleus, one (gold) at the impact parameter you set, and below it Geiger and Marsden's 1913 counts against angle with Rutherford's $1/\sin^4(\theta/2)$.`,
    tasks: [
      t`Slide $b$ down: the gold alpha turns through larger angles, and only $b \lesssim 15$ fm (on gold at 7.7 MeV) turns it past $90^\circ$.`,
      t`Halve the energy $K$: every hyperbola bends more, and $b$ for a given angle doubles — the cross section, an area, grows four times.`,
      t`Switch to Thomson's atom: the same beam barely deviates. The data on the right cannot be fitted by any spread-out charge.`,
    ],
    params: { K: 7.7, target: 'gold', b: 20, panel: 'counts', controls: ['K', 'target', 'b', 'model'] },
    caption: t`Distances in femtometres, to scale; the nucleus is held fixed (its recoil, about 2% for gold, is ignored) and the motion is non-relativistic (a 7.7 MeV alpha moves at about $0.064c$). Counts from Geiger and Marsden (1913), with the curve scaled to fit the large-angle points.`,
  },
  example: {
    prompt: t`Derive $b(\theta)$ and $d\sigma/d\Omega$ for a repulsive force $F = \gamma/r^2$, then evaluate them for Rutherford's $${EX.K}$ MeV alphas on gold ($Z = 79$) at $\theta = 90^\circ$.`,
    visual: still({ K: EX.K, b: +EX.b90.toFixed(2), beam: false, range: 60 }, t`The alpha (gold) at $b = ${sci(EX.b90, 3)}$ fm on gold, turned through $90^\circ$ (to scale, in fm).`),
    steps: [
      { label: 'The orbit', text: t`With $u = 1/r$, Binet's equation is $u'' + u = -\mu\gamma/\ell^2$ (the sign of Kepler's flipped). Its solution is a hyperbola $r = p/(e\cos\phi - 1)$ with $p = \ell^2/\mu\gamma$ and eccentricity $e = \sqrt{1 + 2E\ell^2/\mu\gamma^2} > 1$.` },
      { label: 'Asymptotes', text: t`$r \to \infty$ where $\cos\phi_0 = 1/e$. The particle comes in along one asymptote and leaves along the other, turned through $\theta = \pi - 2\phi_0$, so $\cot(\theta/2) = \tan\phi_0 = \sqrt{e^2 - 1}$.` },
      { label: 'Impact parameter', text: t`Far away $\ell = \mu v_\infty b$ and $E = \tfrac12\mu v_\infty^2$, so $\ell^2 = 2\mu Eb^2$ and $e^2 - 1 = 4E^2b^2/\gamma^2$. Hence $\cot\dfrac\theta2 = \dfrac{2Eb}{\gamma}$: $b = \dfrac{\gamma}{2E}\cot\dfrac{\theta}{2}$.` },
      { label: 'Cross section', text: t`$\left|\dfrac{db}{d\theta}\right| = \dfrac{\gamma}{4E\sin^2(\theta/2)}$, and with $\sin\theta = 2\sin\frac\theta2\cos\frac\theta2$, $\dfrac{d\sigma}{d\Omega} = \dfrac{b}{\sin\theta}\left|\dfrac{db}{d\theta}\right| = \left(\dfrac{\gamma}{4E}\right)^2\dfrac{1}{\sin^4(\theta/2)}$.` },
      { label: 'Numbers', text: t`$\gamma = 2\times79\times1.440 = ${sci(EX.g, 4)}$ MeV fm. At $90^\circ$: $b = \gamma/2E = ${sci(EX.b90, 3)}$ fm and $\dfrac{d\sigma}{d\Omega} = (${sci(EX.g / (4 * EX.K), 3)}\ \text{fm})^2/(\sin45^\circ)^4 = ${sci(EX.ds90, 3)}\ \text{fm}^2/\text{sr} = ${sci(EX.ds90 / 100, 3)}$ b/sr.` },
      { label: 'Sense check', text: t`Head-on the alpha stops at $d = \gamma/E = ${sci(EX.d, 3)}$ fm, over three times the touching distance $R_{\text{Au}} + R_\alpha \approx ${sci(EX.Rn, 2)}$ fm: the alpha never reaches the nuclear force, so the pure Coulomb result applies. (The recoil of gold, $4/197$ of the energy, is ignored.)` },
    ],
    answer: t`$b = \dfrac{\gamma}{2E}\cot\dfrac\theta2$ and $\dfrac{d\sigma}{d\Omega} = \left(\dfrac{\gamma}{4E}\right)^2\dfrac{1}{\sin^4(\theta/2)}$; for $${EX.K}$ MeV alphas on gold at $90^\circ$, $b = ${sci(EX.b90, 3)}$ fm and $d\sigma/d\Omega = ${sci(EX.ds90 / 100, 3)}$ b/sr.`,
  },
  practice: [
    num({
      id: 'b-for-theta', difficulty: 2,
      gen(r) {
        const T = r.pick([['gold', 79], ['silver', 47], ['copper', 29]]), K = r.pick([5, 6, 7.7]), th = r.pick([30, 60, 120, 150]);
        const g = 2 * T[1] * KE2, key = (g / (2 * K)) / Math.tan((th * DEG) / 2);
        return {
          prompt: t`An alpha particle of ${K} MeV approaches a ${T[0]} nucleus ($Z = ${T[1]}$). For what impact parameter is it scattered through $${th}^\circ$? ($e^2/4\pi\epsilon_0 = 1.440$ MeV fm.)`,
          answer: key, units: 'fm', tol: { rel: 0.01 },
          errors: distinct([{ value: (g / (2 * K)) * Math.tan((th * DEG) / 2), feedback: t`It is $\cot(\theta/2)$: larger angles need *smaller* impact parameters.` }, { value: (g / K) / Math.tan((th * DEG) / 2), feedback: t`$b = (\gamma/2E)\cot(\theta/2)$: you dropped the 2.` }, { value: (T[1] * KE2 / (2 * K)) / Math.tan((th * DEG) / 2), feedback: t`An alpha has charge $2e$: $\gamma = zZe^2/4\pi\epsilon_0$ with $z = 2$.` }], key),
          hints: [t`$\gamma = 2Z\times1.440$ MeV fm.`, t`$b = \dfrac{\gamma}{2E}\cot\dfrac{\theta}{2}$.`],
          teach: t`In Rutherford scattering, $b = (\gamma/2E)\cot(\theta/2)$: the harder the turn, the closer the aim.`,
          explain: t`$\gamma = ${sci(g, 4)}$ MeV fm; $b = \dfrac{${sci(g, 4)}}{2\times${K}}\cot ${th / 2}^\circ = ${sci(key, 3)}$ fm — a few times the nuclear radius${th >= 120 ? ', inside the region where the nucleus fills a tiny fraction of the atom' : ''}.`,
          visual: still({ K: Math.min(10, Math.max(2, K)), target: T[0], b: +Math.min(110, key).toFixed(2), beam: true, hide: ['theta', 'b'], range: 100 }, t`Alphas on Coulomb hyperbolas past this nucleus; the highlighted one's angle and impact parameter are hidden.`),
        };
      },
    }),
    num({
      id: 'predict-counts', difficulty: 2,
      gen(r) {
        const [a1, a2] = r.pick([[150, 45], [135, 60], [120, 30], [105, 37.5], [150, 75]]);
        const n1 = GM[a1], key = n1 * Math.sin((a1 * DEG) / 2) ** 4 / Math.sin((a2 * DEG) / 2) ** 4;
        return {
          prompt: t`Geiger and Marsden (1913) counted ${n1} scintillations (per unit time, corrected for their apparatus) at $${a1}^\circ$ from a gold foil. If Rutherford's law holds, how many should they have counted at $${a2}^\circ$?`,
          answer: key, tol: { rel: 0.01 },
          errors: distinct([{ value: n1 * Math.sin((a1 * DEG) / 2) ** 2 / Math.sin((a2 * DEG) / 2) ** 2, feedback: t`The law is $1/\sin^4(\theta/2)$ — the fourth power, not the square.` }, { value: n1 * Math.sin(a1 * DEG) ** 4 / Math.sin(a2 * DEG) ** 4, feedback: t`Use half the scattering angle: $\sin^4(\theta/2)$.` }], key),
          hints: [t`$N \propto 1/\sin^4(\theta/2)$, so $N_2 = N_1\sin^4(\theta_1/2)/\sin^4(\theta_2/2)$.`],
          teach: t`Rutherford's law fixes the *ratio* of counts at two angles: $\sin^4(\theta_1/2)/\sin^4(\theta_2/2)$.`,
          explain: t`$N_2 = ${n1}\times\dfrac{\sin^4 ${a1 / 2}^\circ}{\sin^4 ${a2 / 2}^\circ} = ${sci(key, 3)}$. They measured ${GM[a2]} — within ${sci((100 * Math.abs(GM[a2] - key)) / key, 2)}%, across a range where the count changes by a factor $${sci(Math.max(GM[a2], n1) / Math.min(GM[a2], n1), 2)}$.`,
          visual: still({ beam: true, b: 30, hide: ['theta', 'b'] }, t`Alphas on Coulomb hyperbolas past a gold nucleus (to scale, fm): the smaller the impact parameter, the larger the angle — and the thinner the ring of beam that feeds it.`),
        };
      },
    }),
    num({
      id: 'energy-scaling', difficulty: 2,
      gen(r) {
        const K1 = r.pick([4, 5, 7.7]), f = r.pick([0.5, 1.5, 2]), K2 = +(K1 * f).toFixed(2), n1 = r.pick([120, 400, 900]);
        const key = n1 * (K1 / K2) ** 2;
        return {
          prompt: t`At a fixed angle, a detector counts ${n1} alphas per minute when the alphas have ${K1} MeV. The source is changed so they have ${K2} MeV, with the same beam intensity. What is the new count rate per minute?`,
          answer: key, units: 'min^-1', tol: { rel: 0.01 },
          errors: distinct([{ value: n1 * (K1 / K2), feedback: t`$d\sigma/d\Omega \propto (\gamma/4E)^2$: it goes as $1/E^2$, not $1/E$.` }, { value: n1 * (K2 / K1) ** 2, feedback: t`Faster alphas are deflected *less*: the rate falls as $1/E^2$.` }], key),
          hints: [t`$d\sigma/d\Omega \propto 1/E^2$ at fixed angle.`],
          teach: t`Rutherford's cross section scales as $1/E^2$: halve the energy and four times as many particles scatter into any angle.`,
          explain: t`$${n1}\times(${K1}/${K2})^2 = ${sci(key, 3)}$ per minute. Geiger and Marsden slowed their alphas with sheets of mica and found exactly this $1/E^2$ (they wrote it as $1/v^4$).`,
          visual: still({ K: Math.min(10, Math.max(2, K2)), beam: true, b: 20, hide: ['theta'], range: 120 }, t`Alphas past a gold nucleus at the new energy (to scale, fm).`),
        };
      },
    }),
    expr({
      id: 'db-dtheta', difficulty: 3,
      prompt: t`Starting from $b = \dfrac{\gamma}{2E}\cot\dfrac{\theta}{2}$, find $\left|\dfrac{db}{d\theta}\right|$. Type $\theta$ as theta and $\gamma$ as gamma.`,
      answer: 'gamma/(4*E*sin(theta/2)^2)', answerTeX: t`\frac{\gamma}{4E\sin^2(\theta/2)}`,
      lhs: '\\left|\\frac{db}{d\\theta}\\right|', vars: { theta: [0.3, 3], gamma: [1, 5], E: [1, 5] },
      errors: [{ answer: 'gamma/(2*E*sin(theta/2)^2)', feedback: t`The chain rule brings a factor $\tfrac12$ from the inside, $\theta/2$.` }, { answer: 'gamma/(4*E*sin(theta)^2)', feedback: t`$\dfrac{d}{d\theta}\cot\dfrac\theta2 = -\dfrac{1}{2\sin^2(\theta/2)}$: keep the half angle.` }],
      hints: [t`$\dfrac{d}{dx}\cot x = -\csc^2x$.`, t`With $x = \theta/2$, $dx/d\theta = \tfrac12$.`],
      teach: t`Differentiating $b(\theta)$ is the step that turns a deflection law into a cross section.`,
      explain: t`$\dfrac{db}{d\theta} = \dfrac{\gamma}{2E}\left(-\dfrac{1}{2\sin^2(\theta/2)}\right)$, so $|db/d\theta| = \gamma/(4E\sin^2(\theta/2))$. Multiplying by $b/\sin\theta$ gives Rutherford's $(\gamma/4E)^2/\sin^4(\theta/2)$.`,
      visual: gpic({ x: [0, 180], y: [0, 6], axesAt: 'edge', xlabel: 'θ (degrees)', ylabel: 'b (units of γ/2E)', curves: [{ fn: '1/tan(x*pi/360)', domain: [18, 180], color: 'accent', width: 2.4 }] }, t`The impact parameter against scattering angle, $b = (\gamma/2E)\cot(\theta/2)$: steep at small angles.`, 'A curve falling from large values at small angle to zero at 180 degrees'),
    }),
    mcq({
      id: 'infinite', difficulty: 3,
      prompt: t`Integrate Rutherford's $d\sigma/d\Omega$ over all directions. What is the total cross section, and what does that mean?`,
      visual: gpic({ x: [0, 180], y: [-1, 5], axesAt: 'edge', xlabel: 'θ (degrees)', ylabel: 'log₁₀ of dσ/dΩ (relative)', curves: [{ fn: '-4*log(sin(x*pi/360)) - 0', domain: [3, 180], color: 'accent', width: 2.4 }] }, t`$\log_{10}$ of Rutherford's cross section (relative to its value at $180^\circ$): it climbs without limit toward $\theta = 0$.`, 'A curve rising steeply toward zero angle'),
      choices: [t`Infinite: every particle, however far off it is aimed, is deflected a little, because the Coulomb force has no range. In real atoms the electrons screen the nucleus beyond about $10^{-10}$ m, which cuts it off`, t`$\pi(\gamma/2E)^2$, the area inside the $90^\circ$ impact parameter`, t`$4\pi(\gamma/4E)^2$, by analogy with the hard sphere`, t`Zero, because the nucleus is so small`],
      answer: 0,
      why: { 1: t`That is the cross section for scattering *beyond* $90^\circ$ — a finite piece. The total includes every tiny deflection.`, 2: t`$1/\sin^4(\theta/2)$ is not constant: near $\theta = 0$ it blows up as $16/\theta^4$, faster than $d\Omega \approx 2\pi\theta\,d\theta$ shrinks.`, 3: t`The force reaches far beyond the nucleus; the nucleus's size matters only for the very largest angles.` },
      hints: [t`Near $\theta = 0$, $\sin(\theta/2) \approx \theta/2$. How does $\int\frac{d\sigma}{d\Omega}2\pi\theta\,d\theta$ behave?`, t`Equivalently: is there any impact parameter beyond which a Coulomb force does nothing at all?`],
      teach: t`A force with infinite range has an infinite total cross section; only screening makes it finite.`,
      explain: t`$\int\frac{16}{\theta^4}\cdot2\pi\theta\,d\theta \sim \int\theta^{-3}d\theta$ diverges at small angles. Every particle with any $b$ is deflected: the total "area" is infinite. Physically, the atom's electrons cancel the nucleus's field beyond an atomic radius, so particles with $b$ larger than that go straight on. Gravity has no such screening, which is why a flyby deflects a probe however far it passes (by little).`,
    }),
    num({
      id: 'touch', difficulty: 3,
      gen(r) {
        const T = r.pick([['aluminium', 13, 27], ['copper', 29, 64], ['silver', 47, 108]]), K = r.pick([5, 7.7, 9]);
        const Ecm = (K * T[2]) / (T[2] + 4), g = 2 * T[1] * KE2, key = g / Ecm;
        return {
          prompt: t`An alpha particle (mass 4 u) of ${K} MeV in the lab hits ${T[0]} ($Z = ${T[1]}$, mass ${T[2]} u) head-on. Working in the centre-of-mass frame, how close do the two centres get?`,
          answer: key, units: 'fm', tol: { rel: 0.01 },
          errors: distinct([{ value: g / K, feedback: t`Only the energy of relative motion, $E_{\text{cm}} = K\,M/(m + M)$, can be spent climbing the Coulomb hill; the rest stays as motion of the centre of mass.` }, { value: (T[1] * KE2) / Ecm, feedback: t`The alpha has charge $2e$.` }], key),
          hints: [t`$E_{\text{cm}} = K\,\dfrac{M}{m + M}$ for a target at rest.`, t`At closest approach in a head-on collision all of $E_{\text{cm}}$ is potential energy: $\gamma/d = E_{\text{cm}}$.`],
          teach: t`The Coulomb barrier is climbed with the centre-of-mass energy, which is less than the lab energy — much less for a light target.`,
          explain: t`$E_{\text{cm}} = ${K}\times${T[2]}/${T[2] + 4} = ${sci(Ecm, 3)}$ MeV and $\gamma = ${sci(g, 3)}$ MeV fm, so $d = ${sci(key, 3)}$ fm. The touching distance is $1.2(${T[2]}^{1/3} + 4^{1/3}) = ${sci(R.nuclearRadius(T[2]) + R.nuclearRadius(4), 3)}$ fm: ${key < 1.15 * (R.nuclearRadius(T[2]) + R.nuclearRadius(4)) ? 'the alpha reaches the nuclear surface, and backward scattering departs from Rutherford’s law — the anomaly seen with light targets in the 1920s, which gave the first estimates of nuclear radii' : 'still outside the nucleus, so the Coulomb law holds even for head-on collisions'}.`,
          visual: still({ K: Math.min(10, Math.max(2, K)), target: T[0], b: 1, beam: false, hide: ['rmin'], range: 40 }, t`A nearly head-on alpha on this nucleus (to scale, fm; the nucleus held fixed, unlike the question). The closest approach is hidden.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-flyby', difficulty: 3, transfer: true,
      gen(r) {
        const bR = r.pick([30, 50, 80]), v = r.pick([5, 7, 9]);
        const b = bR * R_JUP, x = GM_JUP / (b * (v * 1e3) ** 2), key = 2 * Math.atan(x) / DEG;
        const rp = (GM_JUP / (v * 1e3) ** 2) * (Math.sqrt(1 + 1 / (x * x)) - 1);
        return {
          prompt: t`A probe approaches Jupiter at $v_\infty = ${v}$ km/s relative to the planet, aimed ${bR} Jupiter radii ($R_J = 71\,492$ km) off-centre. Gravity is Rutherford's force with the sign reversed ($\gamma = -GMm$, attractive), and the same geometry gives $\tan(\theta/2) = GM/(bv_\infty^2)$. Through what angle does Jupiter turn the probe's velocity? ($GM_J = 1.267\times10^{17}\ \text{m}^3/\text{s}^2$.)`,
          answer: key, units: 'deg', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.atan(x) / DEG, feedback: t`That is $\theta/2$.` }, { value: 2 * Math.atan(x / 2) / DEG, feedback: t`$\tan(\theta/2) = GM/(bv_\infty^2)$, with $E = \tfrac12mv_\infty^2$ already folded in: $|\gamma|/2E = GM/v_\infty^2$.` }, { value: 2 * Math.atan(GM_JUP / (b * v * v)) / DEG, feedback: t`Convert $v_\infty$ to m/s.` }], key),
          hints: [t`$b = ${bR}\times7.149\times10^{7}$ m and $v_\infty = ${v}\times10^3$ m/s.`, t`$\theta = 2\arctan\bigl(GM/(bv_\infty^2)\bigr)$.`],
          teach: t`A gravity assist is attractive Rutherford scattering: the planet turns the probe's velocity through $2\arctan(GM/bv_\infty^2)$ without changing its speed relative to the planet.`,
          explain: t`$GM/(bv_\infty^2) = ${sci(x, 3)}$, so $\theta = 2\arctan(${sci(x, 3)}) = ${sci(key, 3)}^\circ$; the closest approach is $${sci(rp / R_JUP, 2)}\,R_J$. Relative to Jupiter the speed is unchanged, but turning a velocity of ${v} km/s through $${sci(key, 3)}^\circ$ changes it by $2v_\infty\sin(\theta/2) = ${sci(2 * v * Math.sin((key * DEG) / 2), 3)}$ km/s — and seen from the Sun, where Jupiter itself moves, that is a change of speed: the gravity assist.`,
          visual: gpic({ x: [-3, 3], y: [-1.6, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 0.04 - x^2))', lower: '-sqrt(max(0, 0.04 - x^2))', from: -0.2, to: 0.2, color: 'gold', alpha: 0.85 }], curves: [{ polar: '1.2/(1 + 1.6*cos(theta))', theta: [-2.1, 2.1], color: 'accent', width: 2.2 }, seg([-3, 0], [3, 0], 'ink4', 1, true)], points: [lab(-0.55, -0.3, 'Jupiter', 'gold', 0, 0)] }, t`A hyperbolic flyby, schematic and not to scale: the probe swings round the planet's far side and leaves in a new direction.`, 'A hyperbolic path curving around a planet'),
        };
      },
    }),
    num({
      id: 'cp-ds', difficulty: 2,
      gen(r) {
        const K = r.pick([5, 6, 7.7]), th = r.pick([45, 60, 120, 150]);
        const g = 2 * 79 * KE2, key = ((g / (4 * K)) ** 2 / Math.sin((th * DEG) / 2) ** 4) / 100;
        return {
          prompt: t`What is Rutherford's $d\sigma/d\Omega$, in barns per steradian, for ${K} MeV alphas on gold ($Z = 79$) at $${th}^\circ$? ($e^2/4\pi\epsilon_0 = 1.440$ MeV fm, $1\ \text{b} = 100\ \text{fm}^2$.)`,
          answer: key, units: 'b/sr', tol: { rel: 0.01 },
          errors: distinct([{ value: key * 100, feedback: t`That is in $\text{fm}^2$/sr. A barn is $100\ \text{fm}^2$.` }, { value: ((g / (4 * K)) ** 2 / Math.sin(th * DEG) ** 4) / 100, feedback: t`Use $\sin^4(\theta/2)$ — half the angle.` }, { value: ((g / (2 * K)) ** 2 / Math.sin((th * DEG) / 2) ** 4) / 100, feedback: t`The prefactor is $(\gamma/4E)^2$.` }], key),
          hints: [t`$\gamma = 2\times79\times1.440$ MeV fm; $\gamma/4E$ is a length.`, t`$\dfrac{d\sigma}{d\Omega} = (\gamma/4E)^2/\sin^4(\theta/2)$, then divide by 100 for barns.`],
          teach: t`Rutherford's cross section is $(\gamma/4E)^2/\sin^4(\theta/2)$, with $\gamma/4E$ a few femtometres for alphas on heavy nuclei.`,
          explain: t`$\gamma/4E = ${sci(g / (4 * K), 3)}$ fm, so $d\sigma/d\Omega = ${sci((g / (4 * K)) ** 2, 3)}/\sin^4 ${th / 2}^\circ = ${sci(key * 100, 3)}\ \text{fm}^2/\text{sr} = ${sci(key, 3)}$ b/sr.`,
          visual: still({ K, b: +Math.min(110, (g / (2 * K)) / Math.tan((th * DEG) / 2)).toFixed(2), beam: true, hide: ['theta', 'b'], range: 100 }, t`Alphas past a gold nucleus at this energy (to scale, fm).`),
        };
      },
    }),
    mcq({
      id: 'cp-anomaly', difficulty: 3,
      prompt: t`Alphas of the same energy are scattered from gold and from aluminium. At backward angles the aluminium counts fall **below** Rutherford's prediction, while gold's follow it. Why?`,
      visual: still({ K: 7.7, target: 'aluminium', b: 2, beam: true, range: 40 }, t`Alphas on an aluminium nucleus (to scale, fm): the head-on ones come within a few femtometres of it.`),
      choices: [t`Aluminium's smaller charge lets backward-scattered alphas (small $b$) come close enough to touch the nucleus, where the strong nuclear force adds to the Coulomb force`, t`Aluminium atoms are lighter, so the formula is simply wrong for them`, t`Aluminium foils are thinner`, t`The alphas pass straight through aluminium's electrons`],
      answer: 0,
      why: { 1: t`Recoil is a known correction (use the centre-of-mass energy and angle); it does not make counts fall below the corrected prediction.`, 2: t`Thickness scales every angle's count equally; it cannot change the angular shape.`, 3: t`Electrons are far too light to deflect alphas; they only screen the nucleus at very small angles.` },
      hints: [t`Head-on, the closest approach is $\gamma/E_{\text{cm}}$ with $\gamma \propto Z$. Compare with the nuclear radius, $1.2A^{1/3}$ fm.`, t`Backward scattering means small $b$: close approach.`],
      teach: t`Departures from Rutherford's law at large angles on light nuclei measure where the nuclear force begins — the nuclear radius.`,
      explain: t`For aluminium $\gamma = 2\times13\times1.44 = ${sci(2 * 13 * KE2, 3)}$ MeV fm, so a 7.7 MeV alpha ($E_{\text{cm}} = ${sci((7.7 * 27) / 31, 3)}$ MeV) can come within $${sci((2 * 13 * KE2) / ((7.7 * 27) / 31), 2)}$ fm — about the touching distance $${sci(R.nuclearRadius(27) + R.nuclearRadius(4), 2)}$ fm. For gold the closest approach is $${sci(EX.d, 3)}$ fm, far outside. This "anomalous scattering" gave the first estimates of nuclear radii; today electron scattering measures them ([N1.1](#/lesson/phys3710.N1.1)).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 14: the Rutherford cross section', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'E. Rutherford, The scattering of α and β particles by matter and the structure of the atom, Phil. Mag. 21, 669 (1911)', url: 'https://doi.org/10.1080/14786440508637080' },
    { label: 'H. Geiger and E. Marsden, The laws of deflexion of α particles through large angles, Phil. Mag. 25, 604 (1913)', url: 'https://doi.org/10.1080/14786440408634197' },
  ],
});
