// Causality in the frequency plane. A linear response x(t) = ∫G(t − t′)F(t′)dt′
// is causal when G(t) = 0 for t < 0; then χ(ω) = ∫₀^∞ G(t)e^{iωt} dt is analytic
// in the upper half-plane (e^{iωt} only helps there), so every pole lies
// below the axis. Inverting by residues: close above for t < 0 (nothing —
// G = 0), below for t > 0 (the poles ring: the retarded Green's function of
// the damped oscillator, e^{−γt/2} sin Ωt/Ω). Analyticity in the upper
// half-plane plus Cauchy's formula on the real line, indented at ω, gives
// the Kramers–Kronig relations: Re χ and Im χ are Hilbert transforms of
// each other — dispersion fixed by absorption — and the sum rule
// Re χ(0) = (2/π)∫ Im χ/ω dω. Transfer: a brick-wall filter is acausal.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import * as K from '../../src/viz/model/cx3-causal.js';

const t = String.raw;
const PI = Math.PI;
const causal = (params, caption) => ({ type: 'cx3-causal', params: { drag: false, showT: false, readout: false, ...params }, caption });
const osc = (w0, g) => ({ re: +Math.sqrt(w0 * w0 - (g * g) / 4).toFixed(6), im: -g / 2 });

export default lesson({
  id: 'st-d.D11.1',
  title: 'Causality, Green’s functions and Kramers–Kronig',
  minutes: 16, difficulty: 4,
  intro: t`Kick a linear system at $t = 0$ and record its response $G(t)$, the **Green’s function**; any push $F(t)$ then gives $x(t) = \int G(t - t')F(t')\,dt'$. Its Fourier transform $\chi(\omega) = \int G(t)\,e^{i\omega t}\,dt$ is the **response function** (with $G(t) = \frac{1}{2\pi}\int\chi(\omega)e^{-i\omega t}\,d\omega$). Now impose **causality** — no response before the kick, $G(t) = 0$ for $t < 0$. Then $\chi(\omega) = \int_0^\infty G(t)e^{i\omega t}\,dt$, and for $\operatorname{Im}\omega > 0$ the factor $e^{i\omega t}$ only shrinks: $\chi$ is **analytic in the whole upper half-plane**. All its poles lie below the real axis. Cauchy’s formula, applied along the real line, then ties the real and imaginary parts together — the **Kramers–Kronig relations**:

$$\operatorname{Re}\chi(\omega) = \frac{1}{\pi}\,\mathcal{P}\!\!\int_{-\infty}^{\infty}\frac{\operatorname{Im}\chi(\omega')}{\omega' - \omega}\,d\omega'$$

and the same with the roles swapped and a minus sign. The absorption ($\operatorname{Im}\chi$) of a material, measured at every frequency, determines its dispersion ($\operatorname{Re}\chi$) — because effects cannot come before their causes.`,
  symbols: [
    { tex: 'G(t)', text: 'the Green’s function: the response to a unit kick at t = 0' },
    { tex: t`\chi(\omega)`, text: t`the response function, the Fourier transform of $G$: the complex amplitude of the response to a steady drive $e^{-i\omega t}$` },
    { tex: t`\omega,\ \omega'`, text: 'angular frequencies (rad/s); ω′ is the integration variable' },
    { tex: t`\operatorname{Re}\chi,\ \operatorname{Im}\chi`, text: t`the in-phase (reactive, dispersive) and out-of-phase (absorptive) parts of the response` },
    { tex: t`\mathcal{P}`, text: t`the Cauchy principal value: cut out $|\omega' - \omega| < \varepsilon$ symmetrically and let $\varepsilon \to 0$ (D9.3’s indentation)` },
  ],
  why: t`Kramers–Kronig relations check every measured optical constant, extract refractive indices from absorption spectra, and constrain particle-physics amplitudes; the same pole-placement argument decides which Green’s function — retarded or advanced — physics uses, and it is the frame for the quasinormal ringing of black holes in the next lesson.`,
  visual: {
    type: 'cx3-causal',
    title: 'Where the poles are is when the response is',
    lead: t`Left: the complex $\omega$-plane with a damped oscillator’s two poles (drag the right one; its mirror follows). The gold contour inverts the Fourier transform at the probe time $t$: for $t > 0$ it closes below, for $t < 0$ above, and the ringed poles are the ones it encloses. Top right: the response $G(t)$. Bottom right: $\chi$ along the real axis, with the Kramers–Kronig reconstruction of $\operatorname{Re}\chi$ from $\operatorname{Im}\chi$ dashed.`,
    tasks: [
      t`Slide the probe time below $0$: the contour flips to the upper half-plane, encloses nothing, and $G = 0$ — no response before the kick.`,
      t`Drag the pole closer to the real axis: the ringing lasts longer and the peaks of $\chi$ sharpen. The dashed Kramers–Kronig curve stays exactly on $\operatorname{Re}\chi$.`,
      t`Drag the pole **above** the axis: now $G$ is zero after the kick and nonzero before it, and the dashed curve flips to $-\operatorname{Re}\chi$. Kramers–Kronig holds only for causal responses.`,
    ],
    params: { poles: [osc(1, 0.3)], t: 4, T: [-12, 24], window: { re: [-2, 2], im: [-1.2, 1.2] }, W: [-2.5, 2.5], readout: ['pole', 'G', 'half', 'causal'] },
    caption: t`One damped oscillator, $\chi = 1/(\omega_0^2 - \omega^2 - i\gamma\omega)$, in units where $\omega_0 \approx 1$. $G(t)$ and the Kramers–Kronig curve are computed exactly from the residues (the model’s test checks both against direct numerical integration).`,
  },
  example: {
    prompt: t`A mass on a damped spring obeys $\ddot x + \gamma\dot x + \omega_0^2 x = F(t)$ (per unit mass), so $\chi(\omega) = \dfrac{1}{\omega_0^2 - \omega^2 - i\gamma\omega}$. Find its Green’s function $G(t) = \dfrac{1}{2\pi}\displaystyle\int\chi(\omega)e^{-i\omega t}\,d\omega$, for an underdamped spring ($\gamma < 2\omega_0$).`,
    visual: causal({ poles: [osc(1, 0.3)], panels: ['w', 't'], t: 6, T: [-6, 30] }, t`The two poles at $\pm\Omega - i\gamma/2$ (here $\omega_0 = 1$, $\gamma = 0.3$) and the response: nothing before the kick, a decaying ring after it.`),
    steps: [
      { label: 'Poles', text: t`$\omega_0^2 - \omega^2 - i\gamma\omega = 0$ gives $\omega = \pm\Omega - \dfrac{i\gamma}{2}$ with $\Omega = \sqrt{\omega_0^2 - \gamma^2/4}$. Both lie **below** the axis: damping puts them there.` },
      { label: 'Before the kick', text: t`For $t < 0$, $|e^{-i\omega t}| = e^{t\operatorname{Im}\omega}$ dies in the upper half-plane: close there (Jordan’s lemma, D9.3). No poles inside, so $G(t) = 0$. Causality, from pole positions alone.` },
      { label: 'After the kick', text: t`For $t > 0$ close below — clockwise, so $\frac{1}{2\pi}(-2\pi i)\sum\operatorname{Res}$. Writing $\chi = \dfrac{-1}{(\omega - \omega_+)(\omega - \omega_-)}$, the residues of $\chi e^{-i\omega t}$ are $-\dfrac{e^{-i\omega_+ t}}{2\Omega}$ at $\omega_+ = \Omega - i\gamma/2$ and $+\dfrac{e^{-i\omega_- t}}{2\Omega}$ at $\omega_- = -\Omega - i\gamma/2$.` },
      { label: 'Add', text: t`The residues add to $\dfrac{e^{-i\omega_-t} - e^{-i\omega_+t}}{2\Omega} = e^{-\gamma t/2}\,\dfrac{e^{i\Omega t} - e^{-i\Omega t}}{2\Omega} = ie^{-\gamma t/2}\,\dfrac{\sin\Omega t}{\Omega}$. Multiplying by $-i$: $$G(t) = \theta(t)\,e^{-\gamma t/2}\,\frac{\sin\Omega t}{\Omega}.$$` },
      { label: 'Check', text: t`$G(0^+) = 0$ and $\dot G(0^+) = 1$: a unit kick gives the mass unit velocity and no displacement yet — exactly what $\ddot x = \delta(t)$ means. The real part of a pole is the ringing frequency; minus the imaginary part is the decay rate.` },
    ],
    answer: t`$G(t) = \theta(t)\,e^{-\gamma t/2}\sin(\Omega t)/\Omega$, $\Omega = \sqrt{\omega_0^2 - \gamma^2/4}$`,
  },
  practice: [
    mcq({
      id: 'close-where', difficulty: 1,
      prompt: t`To find $G(t)$ at a time $t < 0$ (before the kick), you close the real $\omega$ line with a big semicircle. Which half-plane, and why?`,
      visual: causal({ poles: [osc(1, 0.4)], panels: ['w'], t: -3, arc: false }, 'The ω-plane and the poles of a damped oscillator. The closing contour is not drawn.'),
      choices: [
        t`The upper: there $|e^{-i\omega t}| = e^{t\operatorname{Im}\omega}$ is small when $t < 0$, so the arc vanishes`,
        t`The lower: the poles are there, and you must enclose them`,
        'Either: the arc vanishes in both half-planes',
        t`The upper, because $\chi$ is larger there`,
      ],
      answer: 0,
      why: {
        1: 'You close where the arc dies, not where the poles are. For t < 0 the lower arc blows up.',
        2: t`$e^{-i\omega t}$ grows exponentially in one of them.`,
        3: t`$\chi$ is smaller there, if anything; what matters is the exponential.`,
      },
      hints: [t`Write $\omega = a + ib$: $|e^{-i\omega t}| = e^{bt}$.`, t`With $t < 0$, which sign of $b$ makes $bt$ negative?`],
      teach: t`$e^{-i\omega t}$ dies above for $t < 0$ and below for $t > 0$: the sign of $t$ chooses the half-plane.`,
      explain: t`For $t < 0$ you need $b > 0$. The upper half-plane holds no poles of a causal $\chi$, so $G(t) = 0$ there: causality is the statement that $\chi$ is analytic above the axis.`,
    }),
    num({
      id: 'ring-freq', difficulty: 2,
      gen(r) {
        const w0 = r.pick([2, 5, 10, 20]), g = r.pick([0.4, 1, 2, 3]) * w0 / 5;
        const ans = Math.sqrt(w0 * w0 - (g * g) / 4);
        return {
          prompt: t`An accelerometer’s proof mass has $\omega_0 = ${w0}$ rad/s and damping $\gamma = ${nm(g, 3)}\ \text{s}^{-1}$, so $\chi = 1/(\omega_0^2 - \omega^2 - i\gamma\omega)$. Its poles are at $\pm\Omega - i\gamma/2$. At what angular frequency $\Omega$ does it ring after a kick?`,
          visual: causal({ poles: [{ re: ans / w0, im: -g / (2 * w0) }], panels: ['w', 't'], t: 6, T: [-6, 30], window: { re: [-1.6, 1.6], im: [-0.9, 0.6] }, names: { w: 'ω/ω₀', t: 'ω₀t', G: 'G' } }, t`The poles in units of $\omega_0$, and the ringing response.`),
          answer: ans, units: 'rad/s', tol: { rel: 0.002 },
          errors: apart(ans, [{ value: w0, feedback: t`Damping pulls the ringing frequency below $\omega_0$: $\Omega = \sqrt{\omega_0^2 - \gamma^2/4}$.` }, { value: Math.sqrt(w0 * w0 - g * g), feedback: t`It is $\gamma^2/4$ under the root: the poles sit at $-i\gamma/2$.` }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans)),
          hints: [t`Solve $\omega^2 + i\gamma\omega - \omega_0^2 = 0$.`, t`$\omega = -\dfrac{i\gamma}{2} \pm \sqrt{\omega_0^2 - \gamma^2/4}$.`],
          teach: 'A pole’s real part is the ringing frequency; its imaginary part, the decay rate.',
          explain: t`$\Omega = \sqrt{${w0}^2 - ${nm(g, 3)}^2/4} = ${nm(ans, 5)}$ rad/s; the ringing decays at $\gamma/2 = ${nm(g / 2, 3)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    num({
      id: 'G-value', difficulty: 2,
      gen(r) {
        const w0 = r.pick([1, 2, 3]), g = r.pick([0.2, 0.4, 0.6]), tt = r.pick([0.5, 1, 1.5, 2.5]);
        const P = K.tidy([osc(w0, g)]), ans = K.G(tt, P);
        const Om = Math.sqrt(w0 * w0 - (g * g) / 4);
        return {
          prompt: t`For $\chi = 1/(\omega_0^2 - \omega^2 - i\gamma\omega)$ with $\omega_0 = ${w0}$ rad/s and $\gamma = ${g}\ \text{s}^{-1}$, evaluate the Green’s function $G(t)$ at $t = ${tt}$ s. (Units of $G$: seconds, per unit mass.)`,
          visual: causal({ poles: P, panels: ['w'], t: tt, window: { re: [-3.5, 3.5], im: [-1.2, 1.2] } }, t`The two poles and the contour for $t = ${tt}$ s: closed below, enclosing both.`),
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp((-g * tt) / 2) * Math.sin(w0 * tt) / w0, feedback: t`Use the damped frequency $\Omega = ${nm(Om, 4)}$, not $\omega_0$.` }, { value: Math.sin(Om * tt) / Om, feedback: t`Include the decay $e^{-\gamma t/2}$ from the poles’ imaginary part.` }, { value: Math.exp(-g * tt) * Math.sin(Om * tt) / Om, feedback: t`The poles sit at $-i\gamma/2$, so the decay is $e^{-\gamma t/2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans))),
          hints: [t`$G(t) = e^{-\gamma t/2}\sin(\Omega t)/\Omega$ for $t > 0$, with $\Omega = \sqrt{\omega_0^2 - \gamma^2/4} = ${nm(Om, 4)}$ rad/s.`, t`Angles in radians: $\Omega t = ${nm(Om * tt, 4)}$.`],
          teach: t`The retarded Green’s function of a damped oscillator is $\theta(t)e^{-\gamma t/2}\sin(\Omega t)/\Omega$.`,
          explain: t`$G(${tt}) = e^{-${nm((g * tt) / 2, 3)}}\,\dfrac{\sin(${nm(Om * tt, 4)})}{${nm(Om, 4)}} = ${nm(ans, 4)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'pole-above', difficulty: 2,
      prompt: t`Suppose a proposed response function had its poles **above** the real axis, at $\pm1 + 0.2i$, as in the picture. What would its $G(t)$, computed by closing contours, look like?`,
      visual: causal({ poles: [{ re: 1, im: 0.2 }], panels: ['w'], t: -3, arc: true }, t`Poles above the axis, and the contour for $t < 0$: it closes above and encloses them.`),
      choices: [
        t`Zero after the kick, and an oscillation that grows toward $t = 0$ from the past — a response **before** its cause`,
        t`An ordinary decaying ring after the kick`,
        t`Zero for all $t$`,
        t`A ring after the kick that grows without bound`,
      ],
      answer: 0,
      why: {
        1: 'A ring after the kick needs poles in the half-plane enclosed for t > 0: the lower one.',
        2: 'The poles are enclosed for t < 0, so the residues give a nonzero response then.',
        3: t`That is what an unstable *causal* system does — but its Fourier transform does not converge on the real axis, so it cannot be this $\chi(\omega)$.`,
      },
      hints: [t`For $t > 0$ you close below. Are there poles there?`, t`For $t < 0$ you close above, and enclose these poles.`],
      teach: 'Poles in the upper half-plane mean a response before the cause: acausal. Physical response functions keep them below.',
      explain: t`For $t > 0$ the lower contour encloses nothing: $G = 0$. For $t < 0$ the upper one encloses both poles: $G = -e^{0.2t}\sin t$, a ring that grows as $t \to 0^-$ and stops dead at the kick. This is the **advanced** Green’s function; physics uses the **retarded** one, whose poles are below.`,
    }),
    num({
      id: 'sum-rule', difficulty: 3,
      gen(r) {
        const w0 = r.pick([1, 1.5, 2, 3]), g = r.pick([0.5, 1, 1.5]);
        const ans = 1 / (w0 * w0);
        return {
          prompt: t`The absorptive part of a damped oscillator’s response is $\operatorname{Im}\chi(\omega) = \dfrac{\gamma\omega}{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}$, with $\omega_0 = ${w0}$ rad/s and $\gamma = ${g}\ \text{s}^{-1}$. Kramers–Kronig at $\omega = 0$ says the static response is $\operatorname{Re}\chi(0) = \dfrac{2}{\pi}\displaystyle\int_0^\infty\frac{\operatorname{Im}\chi(\omega)}{\omega}\,d\omega$. Evaluate it, in $\text{s}^2$.`,
          visual: causal({ poles: [osc(w0, g)], panels: ['chi'], kk: false, W: [-3 * w0, 3 * w0] }, t`$\operatorname{Re}\chi$ (blue) and $\operatorname{Im}\chi$ (violet) along the real axis. The absorption peaks near $\pm\omega_0$; its integral fixes the blue curve’s value at $0$.`),
          answer: ans, units: 's^2', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 1 / w0, feedback: t`$\chi$ has units of $1/\omega^2$: the static response is $1/\omega_0^2$.` }, { value: 1 / (g * w0 * w0), feedback: t`The $\gamma$ cancels: a sharper, taller peak and a broader, lower one have the same weighted area.` }]),
          hints: [t`$\dfrac{\operatorname{Im}\chi}{\omega} = \dfrac{\gamma}{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}$, an even rational function: integrate over the whole line and halve.`, t`D9.1’s result: $\displaystyle\int_{-\infty}^{\infty}\frac{d\omega}{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2} = \frac{\pi}{\gamma\omega_0^2}$.`, t`So the answer is $\dfrac{2}{\pi}\cdot\dfrac{\gamma}{2}\cdot\dfrac{\pi}{\gamma\omega_0^2} = \dfrac{1}{\omega_0^2}$.`],
          teach: 'The Kramers–Kronig sum rule: the static response equals a weighted integral of the absorption over all frequencies.',
          explain: t`$\dfrac{1}{\omega_0^2} = \dfrac{1}{${w0 * w0}} = ${nm(ans, 4)}\ \text{s}^2$ — exactly $\operatorname{Re}\chi(0)$, as it must be, and independent of $\gamma$. In optics this is why a material’s static dielectric constant can be predicted from its absorption spectrum.`,
        };
      },
    }),
    order({
      id: 'derive-kk', difficulty: 3,
      prompt: t`Put the steps of the derivation of the Kramers–Kronig relations in order.`,
      visual: causal({ poles: [osc(1, 0.4)], panels: ['w', 'chi'], t: -3, arc: true }, t`A causal $\chi$: poles below, analytic above — the half-plane the derivation lives in.`),
      items: [
        t`Causality: $G(t) = 0$ for $t < 0$`,
        t`So $\chi(\omega) = \int_0^\infty G\,e^{i\omega t}\,dt$ is analytic for $\operatorname{Im}\omega > 0$`,
        t`Integrate $\chi(\omega')/(\omega' - \omega)$ along the real line indented over $\omega$, closed above: the total is $0$`,
        t`The indentation gives $-\pi i\chi(\omega)$, so $\chi(\omega) = \frac{1}{\pi i}\mathcal{P}\!\int\frac{\chi(\omega')}{\omega' - \omega}d\omega'$`,
        t`Take real and imaginary parts`,
      ],
      hints: ['Start from the physics: no response before the cause.', 'The half-residue from the small semicircle (D9.3) is what makes χ appear on the left.'],
      teach: 'Causality → analyticity in the upper half-plane → Cauchy with an indented contour → Kramers–Kronig.',
      explain: t`The closed contour encloses no pole (χ is analytic above, and $1/(\omega' - \omega)$’s pole is stepped over), so the principal value equals $\pi i\chi(\omega)$. Its real and imaginary parts are the two Kramers–Kronig relations. The big arc vanishes because $\chi \to 0$ as $|\omega| \to \infty$ — real materials stop responding at high enough frequency.`,
    }),
    mcq({
      id: 'dispersion', difficulty: 2,
      prompt: t`A glass is transparent across the visible but absorbs strongly in the ultraviolet. What do the Kramers–Kronig relations say about its refractive index in the visible?`,
      visual: causal({ poles: [{ re: 1, im: -0.08 }], panels: ['chi'], kk: false, W: [0, 1.6], names: { w: 'ω/ω(UV)', G: 'G', t: 't' } }, t`A model absorption line (violet, $\operatorname{Im}\chi$) at the ultraviolet frequency $\omega_{\text{UV}}$, and $\operatorname{Re}\chi$ (blue), which sets the refractive index, rising toward it from below.`),
      choices: [
        'The UV absorption forces the index to vary with frequency in the visible, rising toward the blue — normal dispersion',
        'With no absorption in the visible, the index must be constant there',
        'The index in the visible must be exactly 1',
        'Kramers–Kronig relates absorption only to absorption, so it says nothing about the index',
      ],
      answer: 0,
      why: {
        1: 'Re χ at one frequency depends on Im χ at all frequencies, including the far-away UV line.',
        2: 'The UV line raises Re χ throughout the visible: glass has n ≈ 1.5.',
        3: 'They relate the real part (index) to the imaginary part (absorption).',
      },
      hints: [t`$\operatorname{Re}\chi(\omega)$ is an integral of $\operatorname{Im}\chi$ over **all** frequencies.`, 'Below a resonance, how does the blue curve behave as ω approaches it?'],
      teach: 'Absorption anywhere implies dispersion everywhere: that is the content of Kramers–Kronig.',
      explain: t`Below an absorption line, $\operatorname{Re}\chi$ rises as $\omega$ approaches it: the index grows toward the blue. That is why a prism spreads white light, with violet bent most — the UV absorption of glass, seen through causality.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-peak', difficulty: 3,
      gen(r) {
        const w0 = r.pick([1, 2, 4]), g = r.pick([0.3, 0.5, 0.8]);
        const Om = Math.sqrt(w0 * w0 - (g * g) / 4), ans = Math.atan((2 * Om) / g) / Om;
        return {
          prompt: t`After a kick at $t = 0$, an oscillator with $\omega_0 = ${w0}$ rad/s and $\gamma = ${g}\ \text{s}^{-1}$ responds with $G(t) = e^{-\gamma t/2}\sin(\Omega t)/\Omega$. At what time (in s) does it reach its first maximum displacement?`,
          visual: causal({ poles: [osc(w0, g)], panels: ['w'], t: 1, window: { re: [-1.4 * w0, 1.4 * w0], im: [-0.9 * w0, 0.5 * w0] } }, 'The poles of this oscillator.'),
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: PI / (2 * Om), feedback: t`A quarter period, $\pi/2\Omega$, is the undamped answer. The decay pulls the maximum earlier: $\tan\Omega t = 2\Omega/\gamma$.` }, { value: PI / (2 * w0), feedback: t`Use $\Omega$, and include the damping: $\tan\Omega t = 2\Omega/\gamma$.` }]),
          hints: [t`Set $\dot G = 0$: $e^{-\gamma t/2}\left(\Omega\cos\Omega t - \tfrac{\gamma}{2}\sin\Omega t\right)/\Omega = 0$.`, t`$\tan\Omega t = 2\Omega/\gamma$, with $\Omega = ${nm(Om, 4)}$ rad/s.`],
          teach: 'The first maximum comes slightly before a quarter period, because the decay tips the peak earlier.',
          explain: t`$t = \arctan(2\Omega/\gamma)/\Omega = \arctan(${nm((2 * Om) / g, 4)})/${nm(Om, 4)} = ${nm(ans, 4)}$ s, a little before the quarter period $${nm(PI / (2 * Om), 4)}$ s.`,
        };
      },
    }),
    num({
      id: 'cp-two-lines', difficulty: 3,
      gen(r) {
        const [w1, w2] = r.pick([[1, 3], [2, 5], [1, 2]]), [f1, f2] = r.pick([[1, 2], [0.5, 4], [2, 1]]), g = 0.5;
        const ans = f1 / (w1 * w1) + f2 / (w2 * w2);
        return {
          prompt: t`A material has two absorption lines: $\operatorname{Im}\chi(\omega) = \displaystyle\sum_{k = 1}^{2} \frac{f_k\gamma\omega}{(\omega_k^2 - \omega^2)^2 + \gamma^2\omega^2}$ with strengths $f_1 = ${f1}$, $f_2 = ${f2}$, frequencies $\omega_1 = ${w1}$, $\omega_2 = ${w2}$ rad/s, and $\gamma = ${g}\ \text{s}^{-1}$. Use the sum rule $\operatorname{Re}\chi(0) = \frac{2}{\pi}\int_0^\infty\frac{\operatorname{Im}\chi}{\omega}d\omega$ to find the static response, in $\text{s}^2$.`,
          visual: causal({ poles: [{ ...osc(w1, g), amp: f1 }, { ...osc(w2, g), amp: f2 }], panels: ['chi'], kk: false, W: [-1.3 * w2, 1.3 * w2] }, 'The two absorption lines (violet) and the real part they imply (blue).'),
          answer: ans, units: 's^2', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: f1 / w1 + f2 / w2, feedback: t`Each line contributes $f_k/\omega_k^2$: square the frequencies.` }, { value: (f1 + f2) / (w1 * w1), feedback: 'Each line is weighted by its own frequency.' }]),
          hints: ['The sum rule is linear: apply it to each line separately.', t`Each line gives $f_k/\omega_k^2$ (the previous problem, scaled by $f_k$).`],
          teach: 'Sum rules add: each absorption line contributes its strength over its frequency squared to the static response.',
          explain: t`$\dfrac{${f1}}{${w1 * w1}} + \dfrac{${f2}}{${w2 * w2}} = ${nm(ans, 4)}\ \text{s}^2$. Low-frequency lines dominate the static response — which is why water’s molecular rotations, not its electrons, give it a static dielectric constant near 80.`,
        };
      },
    }),
    mcq({
      id: 'cp-brickwall', difficulty: 3, transfer: true,
      prompt: t`A telemetry engineer wants a perfect low-pass filter for a probe’s downlink: gain exactly $1$ with zero phase shift below a cut-off $\omega_c$, exactly $0$ above. Its impulse response is $h(t) = \dfrac{\sin\omega_c t}{\pi t}$, plotted below. What does causality say about it?`,
      visual: { type: 'graph', params: { x: [-20, 20], y: [-0.12, 0.36], aspect: 'wide', xlabel: 't (in units of 1/ωc)', ylabel: 'h', axesAt: 'edge', curves: [{ fn: 'sin(x)/(pi*x)', color: 'accent', width: 2.2 }], shade: [{ fn: 'sin(x)/(pi*x)', from: -20, to: -0.01, color: 'bad', alpha: 0.25 }], vlines: [{ x: 0, color: 'ink3', label: 'input pulse' }] },
        caption: t`The ideal low-pass filter’s response to a pulse at $t = 0$. The red-shaded part comes before the pulse.` },
      choices: [
        t`It cannot be built to run in real time: $h(t) \ne 0$ before the input arrives. Its $H(\omega)$ is real with $\operatorname{Im}H = 0$, which by Kramers–Kronig would force $\operatorname{Re}H$ to be constant`,
        'It can be built exactly, given fast enough electronics',
        'It is causal, because the main peak is at t = 0',
        'It violates causality only because its gain is greater than 1',
      ],
      answer: 0,
      why: {
        1: 'Speed does not help: the response must start before the input does.',
        2: 'The sidelobes before t = 0 are a response before the cause.',
        3: 'Its gain never exceeds 1; the trouble is the sharp, phase-free cut-off.',
      },
      hints: ['Look at the curve for t < 0.', t`If $\operatorname{Im}H \equiv 0$, what does Kramers–Kronig give for $\operatorname{Re}H$?`],
      teach: 'A sharp cut-off with no phase shift is acausal; real filters trade sharpness for phase lag.',
      explain: t`With $\operatorname{Im}H = 0$ everywhere, the Kramers–Kronig integral makes $\operatorname{Re}H$ constant — contradicting the cut-off. Real filters (Butterworth, Chebyshev, elliptic) put their poles in the half-plane that keeps them causal and pay with a frequency-dependent phase lag; digital systems approximate the ideal only by **delaying** the output long enough that the sidelobes come after the input.`,
    }),
  ],
  sources: [
    { label: 'Toll, “Causality and the dispersion relation: logical foundations”, Phys. Rev. 104, 1760 (1956)', url: 'https://doi.org/10.1103/PhysRev.104.1760' },
    { label: 'Jackson, Classical Electrodynamics (3rd ed.), §7.10 (causality and Kramers–Kronig)', url: 'https://openlibrary.org/search?q=Jackson+Classical+Electrodynamics' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
  ],
});
