// The WKB approximation in the classically allowed region (Griffiths &
// Schroeter §9.1). Where E > V and V changes little over a wavelength,
// ψ ≈ (C/√p) e^{±(i/ħ)∫p dx}: the phase advances by the local wavenumber
// p/ħ and the amplitude goes as 1/√p, so |ψ|² ∝ 1/v, the classical time
// spent. Validity: |dƛ/dx| ≪ 1 with ƛ = ħ/p (for a uniform force F it is
// ƛF/2K). Hard walls at both ends quantize ∫p dx = nπħ — exact for a flat
// floor; for a box with a shelf of height V₀ over half its width it gives the
// closed form √(E/E₁) = n + V₀/(4nE₁), within about 1% of the exact levels
// (computed here by shooting) even though a step is not slowly varying.
// Transfer: the action of the ISS's orbit in units of ħ (2 × 10⁵⁰), the
// classical limit. Turning points and the connection formulas are M5.3;
// tunnelling is M5.2. Every number is computed here.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { exactLevel as shelfExact } from '../phys4700/_pert.js';
import { HB2M_EVNM2, HBARC_EVNM, HBAR, GM_EARTH, R_EARTH, lambdaNm, wkbPic, potPic, r6, seg, label } from './_q2b.js';

const t = String.raw;
const E1 = (L) => (Math.PI ** 2 * HB2M_EVNM2) / (L * L);          // eV, the flat box's ground level
const shelfWkb = (L, V0, n) => E1(L) * (n + V0 / (4 * n * E1(L))) ** 2;
const SHELF = [];
for (const L of [1, 1.5, 2]) for (const V0 of [0.5, 1, 2]) for (const n of [3, 4, 5]) if (shelfWkb(L, V0, n) > 1.6 * V0) SHELF.push([L, V0, n]);
const EX = { L: 1, V0: 1, n: 3 };
EX.E1 = E1(EX.L); EX.wkb = shelfWkb(EX.L, EX.V0, EX.n); EX.exact = EX.E1 * shelfExact(EX.n, [{ from: 0.5, to: 1, V: EX.V0 / EX.E1 }]); EX.pt = EX.E1 * EX.n ** 2 + EX.V0 / 2;

/** The box with a shelf: walls at 0 and L, floor 0 then V₀, an energy line. */
const shelfPic = (L, V0, E, caption) => potPic({
  x: [r6(-0.08 * L), r6(1.08 * L)], y: [0, r6(Math.max(E, V0) * 1.35)],
  curves: [seg(0, 0, L / 2, 0, 'ink2', 2.4), seg(L / 2, 0, L / 2, V0, 'ink2', 2.4), seg(L / 2, V0, L, V0, 'ink2', 2.4)],
  walls: [0, L], E: E ? { from: 0, to: L, y: E } : null, Elabel: E ? 'E' : '',
  points: [label(L * 0.75, V0, `V₀ = ${V0} eV`, 'ink2', 0, 12, 'center')], caption,
});

export default lesson({
  id: 'phys4710.M5.1',
  title: 'The classical region',
  minutes: 15, difficulty: 3,
  intro: t`Most potentials have no exact solution. But where a particle has energy $E$ above the potential $V(x)$, a classical particle would simply move, with momentum $p(x)$. If $V$ changes little over one wavelength, the wave function is a wave whose **local wavelength is $h/p(x)$** and whose amplitude grows where the particle is slow:

$$\begin{gathered} \psi(x) \approx \frac{C}{\sqrt{p(x)}}\,e^{\pm\frac{i}{\hbar}\int p(x)\,dx} \\ p(x) = \sqrt{2m\,[E - V(x)]} \end{gathered}$$

This is the **WKB approximation** (Wentzel, Kramers and Brillouin, 1926). It turns the Schrödinger equation into an integral of the classical momentum, and it gets better the more wavelengths fit in the well.`,
  symbols: [
    { tex: '\\psi(x)', text: 'the stationary-state wave function, in m⁻½' },
    { tex: 'p(x)', text: 'the classical momentum at x, in kg m/s: what a particle of energy E would have there' },
    { tex: 'E', text: 'the energy of the state, in joules (or eV)' },
    { tex: 'V(x)', text: 'the potential energy; the region where E > V is the **classically allowed** region' },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\hbar', text: t`the reduced Planck constant, $h/2\pi = ${tex(HBAR, 9)}\ \text{J s}$` },
    { tex: 'C', text: 'a constant, fixed by normalization; the two signs give waves running right and left, and a real ψ is a combination of them' },
    { tex: '\\int p\\,dx', text: 'the action accumulated from some reference point to x: divided by ħ, it is the phase the wave has gained' },
  ],
  why: 'WKB is how physicists estimate tunnelling rates, alpha-decay lifetimes, the levels of molecules and Rydberg atoms, and it is the bridge from quantum to classical mechanics as ħ → 0.',
  visual: {
    type: 'q2b-wkb',
    title: 'Exact against WKB',
    lead: t`A particle in the well $V = x^4/2$ (units $\hbar = m = 1$). Top: the levels, exact (solid) and WKB (dashed). Middle: the exact $\psi$ (blue) against the WKB $\psi$ (gold). Bottom: the classical orbit in phase space.`,
    tasks: [
      'Step n from 0 up to 10: the WKB energy error falls from about 18% to well under 0.1%, and the gold curve settles onto the blue one.',
      'Turn on the envelope: the wave’s amplitude is largest near the edges of the allowed region, where the classical particle slows down.',
      'Look at the dashed lines at the turning points: there the WKB curve blows up. That is the one place it fails (lesson M5.3 repairs it).',
    ],
    params: { view: 'well', pot: 'quartic', n: 4, envelope: false, controls: ['pot', 'n', 'show', 'wkb', 'envelope'] },
  },
  example: {
    prompt: t`Derive the WKB form. In the allowed region the Schrödinger equation is $\psi'' = -\dfrac{p^2}{\hbar^2}\psi$. Write $\psi = A(x)\,e^{i\phi(x)}$ with $A$ and $\phi$ real, find what $A$ and $\phi$ must be when $V$ varies slowly, and say exactly what “slowly” means.`,
    visual: wkbPic({ pot: 'quartic', n: 8, envelope: true, panels: ['wave'] }, 'The exact ψ (blue), the WKB ψ (gold, dashed) and the envelope ±2C/√p (violet, dotted) for the ninth level of V = x⁴/2, in units ħ = m = 1.'),
    steps: [
      { label: 'Substitute', text: t`$\psi' = (A' + iA\phi')e^{i\phi}$ and $\psi'' = \bigl(A'' + 2iA'\phi' + iA\phi'' - A\phi'^2\bigr)e^{i\phi}$. Set this equal to $-(p^2/\hbar^2)Ae^{i\phi}$.` },
      { label: 'Real part', text: t`$A'' - A\phi'^2 = -\dfrac{p^2}{\hbar^2}A$. This is still exact.` },
      { label: 'Imaginary part', text: t`$2A'\phi' + A\phi'' = 0$, which is $\dfrac{1}{A}\dfrac{d}{dx}\bigl(A^2\phi'\bigr) = 0$: so $A^2\phi'$ is constant. Also exact.` },
      { label: 'The approximation', text: t`If the amplitude curves gently, $|A''/A| \ll \phi'^2$, drop $A''$: then $\phi' = \pm p/\hbar$, so $\phi = \pm\frac{1}{\hbar}\int p\,dx$ — the phase advances at the local wavenumber $k(x) = p(x)/\hbar$.` },
      { label: 'Amplitude', text: t`$A^2\phi' = \text{const}$ with $\phi' = p/\hbar$ gives $A = C/\sqrt{p}$. That is the whole WKB form: $\psi \approx \dfrac{C}{\sqrt p}e^{\pm\frac i\hbar\int p\,dx}$.` },
      { label: 'Sense check', text: t`$|\psi|^2 \propto 1/p \propto 1/v$: the probability of finding the particle in $dx$ is proportional to the time a classical particle spends there. And $A^2\phi' = \text{const}$ is the statement that the probability current $|\psi|^2\,p/m$ is the same everywhere.` },
      { label: 'Validity', text: t`Dropping $A''$ is fair when $p$ changes by little over one reduced wavelength $\bar\lambda = \hbar/p$: $\left|\dfrac{d\bar\lambda}{dx}\right| = \dfrac{\hbar\,|p'|}{p^2} \ll 1$. It fails where $p \to 0$ — at the **turning points**, where $E = V$.` },
    ],
    answer: t`$\phi = \pm\frac1\hbar\int p\,dx$ and $A = C/\sqrt{p}$, valid where $|d\bar\lambda/dx| = \hbar|p'|/p^2 \ll 1$, which excludes the neighbourhood of every turning point.`,
  },
  practice: [
    num({
      id: 'lambda-local', difficulty: 1,
      gen(r) {
        const E = r.pick([3, 5, 8]), V0 = r.pick([1, 1.5, 2, 2.5]);
        const K = E - V0, ans = lambdaNm(K);
        const xs = (4 * V0) / E;                 // the ramp V = (E/4)·x reaches V₀ at x = 4V₀/E
        return {
          prompt: t`An electron of total energy $E = ${E}$ eV moves along a smooth slope where, at the point marked, the potential energy is $V = ${V0}$ eV. What is its local de Broglie wavelength $\lambda = h/p(x)$ there, in nm? ($m_ec^2 = 510\,999$ eV, $hc = 1239.84$ eV nm.)`,
          visual: potPic({ x: [0, 4.6], y: [0, E * 1.3], curves: [{ fn: `${r6(E / 4)}*x`, domain: [0, 4.6] }], E: { from: 0, to: 4.6, y: E }, points: [{ x: r6(xs), y: V0, color: 'accent', label: 'here', labelDx: -36, labelDy: -10 }], xlabel: 'x (nm)', caption: 'A potential that rises slowly (illustrative ramp) and the electron’s energy E. Only the kinetic energy E − V sets the wavelength.' }),
          answer: ans, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lambdaNm(E), feedback: t`Use the kinetic energy $E - V$, not the total energy: $p = \sqrt{2m(E - V)}$.` }, { value: ans / (2 * Math.PI), feedback: t`That is $\bar\lambda = \hbar/p$; the de Broglie wavelength is $h/p$, $2\pi$ times larger.` }],
          hints: [t`$p = \sqrt{2m(E - V)}$, so $\lambda = \dfrac{hc}{\sqrt{2m_ec^2\,(E - V)}}$.`],
          teach: 'In WKB the wavelength is local: it is set by the kinetic energy E − V at each point, and lengthens where the particle slows.',
          explain: t`$E - V = ${K}$ eV, so $pc = \sqrt{2\times510\,999\times${K}} = ${fmt(Math.sqrt(2 * 510998.95 * K), 4)}$ eV and $\lambda = 1239.84/${fmt(Math.sqrt(2 * 510998.95 * K), 4)} = ${fmt(ans, 3)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'amp', difficulty: 2,
      prompt: t`In the picture the WKB wave function of a high level (gold) is largest near the edges of the allowed region and smallest in the middle. Why does the amplitude go as $1/\sqrt{p}$?`,
      visual: wkbPic({ pot: 'harmonic', n: 9, envelope: true, panels: ['wave'], wkb: true }, 'The tenth level of the harmonic oscillator: exact (blue), WKB (gold, dashed), and the envelope ±2C/√p (violet, dotted). Units ħ = m = 1.'),
      choices: [
        t`The probability current $|\psi|^2 p/m$ must be the same everywhere, so where the particle is slow its density is high`,
        t`The particle has more energy near the edges, so its wave is bigger there`,
        t`The potential pushes the wave outward, piling it up at the walls`,
        t`The wavelength is longer there, and a longer wave always has a larger amplitude`,
      ],
      answer: 0,
      why: {
        1: t`The energy $E$ is the same everywhere in a stationary state; only how it splits between kinetic and potential changes.`,
        2: t`Nothing is pushed: the shape comes from conservation of probability flow, $A^2\phi' = $ constant.`,
        3: t`Wavelength and amplitude are separate: $\phi' = p/\hbar$ sets the wavelength, and $A \propto 1/\sqrt p$ follows from the flow being constant, not from the wavelength itself.`,
      },
      hints: [t`The imaginary part of the Schrödinger equation gave $(A^2\phi')' = 0$, with $\phi' = p/\hbar$.`],
      teach: t`$|\psi|^2 \propto 1/p \propto 1/v$: a classical particle spends most of its time where it moves slowly, and the quantum density matches.`,
      explain: t`$A^2 p$ = constant is a constant probability current. Classically, the time spent in $dx$ is $dx/v$, so the density is $\propto 1/v$ — exactly $|\psi|^2 \propto 1/p$. This is the correspondence principle written into the approximation.`,
    }),
    num({
      id: 'validity', difficulty: 3,
      gen(r) {
        const K = r.pick([0.5, 1, 2, 5, 10]), Fv = r.pick([0.5, 1, 2, 5]);        // eV, V/nm
        const lb = lambdaNm(K) / (2 * Math.PI), ans = (lb * Fv) / (2 * K);
        return {
          prompt: t`An electron with kinetic energy $K = ${K}$ eV moves against a uniform electric field that slows it, with force $F = ${Fv}$ eV/nm. Find the WKB validity parameter $\left|\dfrac{d\bar\lambda}{dx}\right| = \dfrac{\hbar|p'|}{p^2}$ at that point (a pure number). Is WKB trustworthy there?`,
          visual: potPic({ x: [0, 3], y: [0, r6(Math.max(K, Fv * 3) * 1.25)], curves: [{ fn: `${Fv}*x`, domain: [0, 3] }], E: { from: 0, to: 3, y: r6(K + 0.6 * Fv) }, points: [{ x: 0.6, y: r6(0.6 * Fv), color: 'accent', label: `K = ${K} eV here`, labelDx: 8, labelDy: 14 }], caption: 'A uniform field: the potential rises linearly at F eV per nm, and the electron (energy line) slows as it climbs. Schematic heights.' }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: lambdaNm(K) * Fv / (2 * K), feedback: t`Use the reduced wavelength $\bar\lambda = \hbar/p = \lambda/2\pi$.` }, { value: (lb * Fv) / K, feedback: t`$p' = -mF/p$, so $\hbar|p'|/p^2 = \hbar mF/p^3 = \bar\lambda F/(2K)$ — the 2 comes from $p^2 = 2mK$.` }],
          hints: [t`With $V = Fx$, $p = \sqrt{2m(E - Fx)}$ gives $p' = -mF/p$.`, t`So $\hbar|p'|/p^2 = \dfrac{\hbar m F}{p^3} = \dfrac{\bar\lambda\,F}{2K}$ with $\bar\lambda = \dfrac{\hbar c}{\sqrt{2m_ec^2K}}$ and $\hbar c = 197.33$ eV nm.`],
          teach: 'WKB needs the wavelength to change by a small fraction of itself over one (reduced) wavelength; slow particles in strong fields break it.',
          explain: t`$\bar\lambda = 197.33/\sqrt{2\times510\,999\times${K}} = ${fmt(lb, 3)}$ nm, so $|d\bar\lambda/dx| = ${fmt(lb, 3)}\times${Fv}/(2\times${K}) = ${fmt(ans, 2)}$. ${ans < 0.1 ? 'That is well below 1: WKB is good here.' : ans < 0.5 ? 'That is not very small: WKB is only rough here.' : 'That is not small at all: WKB fails here — the electron is close to its turning point.'} The parameter grows without limit as $K \to 0$ at the turning point.`,
        };
      },
    }),
    num({
      id: 'shelf', difficulty: 3,
      gen(r) {
        const [L, V0, n] = r.pick(SHELF);
        const e1 = E1(L), ans = shelfWkb(L, V0, n), pt = e1 * n * n + V0 / 2;
        const ex = e1 * shelfExact(n, [{ from: 0.5, to: 1, V: V0 / e1 }]);
        return {
          prompt: t`An electron sits in an infinite well of width $L = ${L}$ nm whose floor has a shelf: $V = 0$ on the left half and $V_0 = ${V0}$ eV on the right half. With walls at both ends the WKB wave must vanish at each, which gives $\int_0^L p\,dx = n\pi\hbar$. Use it to estimate the energy of level $n = ${n}$, in eV. (The flat well’s ground level is $E_1 = \pi^2\hbar^2/2mL^2 = ${fmt(e1, 4)}$ eV.)`,
          visual: shelfPic(L, V0, null, 'The infinite well with a shelf on its right half. The energy asked for lies above the shelf.'),
          answer: ans, units: 'eV', tol: { rel: 0.003 },
          errors: [{ value: pt, feedback: t`That is first-order perturbation theory, $n^2E_1 + V_0/2$. The WKB condition gives a slightly different number: solve it exactly.` }, { value: e1 * n * n, feedback: 'The shelf raises every level: include it in p on the right half.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$p$ is constant on each half: $\sqrt{2mE}\,\tfrac L2 + \sqrt{2m(E - V_0)}\,\tfrac L2 = n\pi\hbar$.`, t`In units of $E_1$ this reads $\sqrt{\varepsilon} + \sqrt{\varepsilon - v} = 2n$ with $\varepsilon = E/E_1$, $v = V_0/E_1$. Since $\varepsilon - (\varepsilon - v) = v$, the difference of the roots is $v/2n$: so $\sqrt\varepsilon = n + v/4n$.`],
          teach: t`With two hard walls the WKB phase across the well must be a whole number of half-waves: $\int p\,dx = n\pi\hbar$.`,
          explain: t`$v = ${fmt(V0 / e1, 4)}$, so $\sqrt\varepsilon = ${n} + ${fmt(V0 / e1, 4)}/${4 * n} = ${fmt(n + V0 / (4 * n * e1), 5)}$ and $E = ${fmt(e1, 4)}\times${fmt((n + V0 / (4 * n * e1)) ** 2, 5)} = ${fmt(ans, 4)}$ eV. The exact level (from matching sines on the two halves) is $${fmt(ex, 4)}$ eV: WKB is off by ${fmt(Math.abs(100 * (ans - ex) / ex), 2)}%, even though a step is anything but slowly varying.`,
        };
      },
    }),
    mcq({
      id: 'turning', difficulty: 2,
      prompt: t`Where, and why, does the WKB wave function in the picture (gold) go wrong?`,
      visual: wkbPic({ pot: 'quartic', n: 2, panels: ['wave'] }, 'The third level of V = x⁴/2: exact ψ (blue) and WKB ψ (gold, dashed). The dashed vertical lines are the classical turning points. Units ħ = m = 1.'),
      choices: [
        t`At the turning points, where $p \to 0$: the wavelength becomes infinite and $1/\sqrt p$ blows up`,
        t`In the middle of the well, where the particle is fastest and the wavelength too short`,
        t`Everywhere equally: WKB is only good for the ground state`,
        t`Only far out in the forbidden region, where $\psi$ is too small to matter`,
      ],
      answer: 0,
      why: {
        1: t`The middle is where WKB is best: $p$ is large and changes slowly there.`,
        2: t`It is the other way round: WKB is worst for the lowest levels and improves with $n$.`,
        3: t`Far into the forbidden region the decaying WKB form is accurate; the trouble is only near $E = V$.`,
      },
      hints: [t`The validity condition is $\hbar|p'|/p^2 \ll 1$. Where is $p$ zero?`],
      teach: 'WKB fails in a small neighbourhood of every turning point, and only there.',
      explain: t`At a turning point $E = V$, so $p = 0$, $\bar\lambda = \hbar/p \to \infty$ and the condition $\hbar|p'|/p^2 \ll 1$ is violated, while the amplitude $C/\sqrt p$ diverges. The exact $\psi$ is perfectly smooth there. Patching across this gap — with Airy functions — is the subject of lesson M5.3.`,
    }),
    expr({
      id: 'phase-int', difficulty: 2,
      prompt: t`For a harmonic oscillator, $V = \tfrac12 m\omega^2x^2$, find the action $\displaystyle\int_{-a}^{a} p\,dx$ between the turning points $\pm a$ at energy $E$. (It is half the area of the ellipse the particle traces in the $(x, p)$ plane.)`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.25, 1.25], aspect: 'wide', equal: true, xlabel: 'x / a', ylabel: 'p / p(max)', xticks: 4, yticks: 4, axesAt: 'edge', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.4 }], shade: [{ fn: 'sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'gold', alpha: 0.3 }], points: [{ x: 1, y: 0, label: '+a', color: 'ink2' }, { x: -1, y: 0, label: '−a', color: 'ink2', labelDx: -26 }] }, caption: 'The oscillator’s orbit in phase space is an ellipse with semi-axes a and p(max) = √(2mE) (drawn scaled to a circle). The shaded upper half is ∫p dx from −a to a.' },
      answer: 'pi*E/omega', answerTeX: t`\frac{\pi E}{\omega}`,
      vars: { E: [1, 3], omega: [0.5, 2], m: [0.5, 2] },
      keys: [['ω', 'omega']],
      errors: [{ answer: '2*pi*E/omega', feedback: 'That is the whole ellipse, ∮p dx; between the turning points you get half of it.' }, { answer: 'pi*E/(2*omega)', feedback: t`The semi-axes are $a = \sqrt{2E/m\omega^2}$ and $\sqrt{2mE}$; half the ellipse is $\tfrac12\pi ab$.` }],
      hints: [t`The ellipse has semi-axes $a = \sqrt{2E/(m\omega^2)}$ and $p_{\max} = \sqrt{2mE}$, and area $\pi\,a\,p_{\max}$.`, t`$\int_{-a}^{a}p\,dx$ is the upper half: $\tfrac12\pi\,a\,p_{\max}$.`],
      teach: t`$\int p\,dx$ is an area in phase space; for the oscillator it is $\pi E/\omega$, so phase-space area counts energy in units of $\hbar\omega$.`,
      explain: t`$\tfrac12\pi\sqrt{2E/m\omega^2}\sqrt{2mE} = \pi E/\omega$; $m$ cancels. Setting this to $n\pi\hbar$ would give $E = n\hbar\omega$ — close to the truth, but missing the $\tfrac12$. Soft turning points are not hard walls: each one costs an eighth of a wavelength of phase, and with that correction (lesson M5.3) WKB gives $(n + \tfrac12)\hbar\omega$ exactly.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iss', difficulty: 2, transfer: true,
      gen(r) {
        const [name, m, h] = r.pick([['The International Space Station', 4.2e5, 420e3], ['A 1000 kg satellite', 1000, 550e3], ['The Hubble Space Telescope (11 100 kg)', 11100, 535e3]]);
        const rr = R_EARTH + h, v = Math.sqrt(GM_EARTH / rr), ans = (m * v * rr) / HBAR;
        return {
          prompt: t`${name} circles Earth at $${fmt(h / 1e3, 3)}$ km altitude${m === 4.2e5 ? ' with a mass of about 420 tonnes' : ''}. A circular orbit has no turning points, so the semiclassical rule is that the wave must fit round the orbit a whole number of times: $\oint p\,ds = 2\pi r\,mv = nh$. What is $n$? ($GM_\oplus = ${tex(GM_EARTH, 10)}\ \text{m}^3\text{s}^{-2}$, $R_\oplus = 6371$ km.)`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.35, 1.35], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 3, dash: [2, 3] }, { param: [`${r6(1.15)}*cos(t)`, `${r6(1.15)}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 1.6 }], points: [{ x: 0, y: 0, r: 0, label: 'Earth', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 0.813, y: 0.813, r: 5, color: 'gold', label: 'orbit' }] }, caption: 'A low Earth orbit, not to scale: the orbit is only a few per cent larger than Earth.' },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`$2\pi rmv = nh$ gives $n = rmv/\hbar$; you divided by $2\pi$ once too often.` }, { value: (m * v * h) / HBAR, feedback: 'The orbit’s radius is measured from Earth’s centre: add Earth’s radius to the altitude.' }],
          hints: [t`$v = \sqrt{GM_\oplus/r}$ with $r = R_\oplus + h$.`, t`$n = \dfrac{2\pi rmv}{h} = \dfrac{rmv}{\hbar}$.`],
          teach: 'The quantum number of a classical orbit is enormous: WKB becomes exact as the action grows in units of ħ, which is the classical limit.',
          explain: t`$r = ${fmt(rr / 1e3, 4)}$ km, $v = ${fmt(v, 4)}$ m/s, so $n = rmv/\hbar = ${tex(ans, 3)}$. Neighbouring “levels” differ by one part in $10^{${Math.floor(Math.log10(ans))}}$: the quantization is utterly invisible, and the orbit obeys classical mechanics — the limit in which WKB becomes exact.`,
        };
      },
    }),
    mcq({
      id: 'cp-where', difficulty: 2,
      prompt: t`A particle is in a highly excited stationary state ($n = 12$) of the well $V = x^4/2$ shown. Averaged over the wiggles, where is the probability density largest?`,
      visual: wkbPic({ pot: 'quartic', n: 12, panels: ['energy'], hide: ['labels'] }, 'The well V = x⁴/2 and its levels, the chosen one in gold (units ħ = m = 1).'),
      choices: [
        'Just inside the turning points, where the classical particle slows down and turns',
        'At the centre, where the potential is lowest',
        'Evenly spread across the allowed region',
        'Outside the turning points, in the forbidden region',
      ],
      answer: 0,
      why: {
        1: t`At the centre the particle moves fastest and spends the least time: $|\psi|^2 \propto 1/v$ is smallest there.`,
        2: 'That is true only for a flat floor, where p is constant (a square well).',
        3: t`The density decays rapidly beyond the turning points; at large $n$ the forbidden region holds very little probability.`,
      },
      hints: [t`$|\psi|^2 \propto 1/p$. Where is $p$ smallest inside the allowed region?`],
      teach: 'At high n the averaged quantum density approaches the classical one, ∝ 1/v, which peaks near the turning points.',
      explain: t`The WKB density averages to $|\psi|^2 \approx 2C^2/p(x)$, largest where $p$ is small — just inside the turning points. (Right at them WKB blows up; the exact density stays finite, with its biggest peaks next to the turning points.) This is the correspondence principle at work.`,
    }),
    order({
      id: 'cp-derive', difficulty: 2,
      prompt: t`Put the steps of the WKB derivation in order.`,
      items: [
        t`Write $\psi = A\,e^{i\phi}$ with real $A$ and $\phi$.`,
        t`Split the Schrödinger equation into real and imaginary parts.`,
        t`Neglect $A''$ beside $A\phi'^2$ (slowly varying $V$).`,
        t`Get $\phi' = \pm p/\hbar$, the local wavenumber.`,
        t`Use $(A^2\phi')' = 0$ to get $A \propto 1/\sqrt p$.`,
      ],
      visual: wkbPic({ pot: 'harmonic', n: 6, envelope: true, panels: ['wave'] }, 'The seventh level of the harmonic oscillator: exact (blue), WKB (gold, dashed) and its envelope (violet, dotted). Units ħ = m = 1.'),
      hints: [t`The approximation can only be made once the equation has been split in two.`, t`The amplitude comes last: it needs $\phi'$ first.`],
      teach: 'WKB writes ψ as amplitude times phase, splits the equation, neglects the amplitude’s curvature, and reads off a phase and an amplitude.',
      explain: t`Ansatz → real and imaginary parts → drop $A''$ → $\phi' = \pm p/\hbar$ → $A = C/\sqrt p$. The imaginary part is exact; only the real part was approximated.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §9.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
