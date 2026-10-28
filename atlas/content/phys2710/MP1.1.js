// Blackbody radiation and the ultraviolet catastrophe — the measured laws
// (Wien’s displacement law, Stefan–Boltzmann) and the classical prediction
// (Rayleigh–Jeans: equipartition over standing-wave modes) that fails at
// short wavelengths. Planck’s law, which fits, is the next lesson (MP1.2).
// Constants are exact in the 2019 SI; solar values are the IAU 2015 nominal
// ones. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, sig, tex } from '../../src/core/format.js';
import { C, KB, SIGMA, WIEN_B, T_SUN, R_SUN, S_SUN, AU } from './_constants.js';
import { seg, label, circle, disc, frame, r6 } from './_diagrams.js';

const t = String.raw;

// the worked example: the Sun's temperature from the solar constant
const EX = { L: 4 * Math.PI * AU ** 2 * S_SUN };
EX.M = EX.L / (4 * Math.PI * R_SUN ** 2);
EX.T = (EX.M / SIGMA) ** 0.25;
EX.lam = (WIEN_B / EX.T) * 1e9;

// Earth's energy balance (albedo 0.30)
const ALB = 0.3;
const T_EARTH = ((S_SUN * (1 - ALB)) / (4 * SIGMA)) ** 0.25;
// Parker Solar Probe at its closest, 9.86 solar radii from the Sun's centre
const PSP = { d: 9.86 };
PSP.flux = SIGMA * T_SUN ** 4 / PSP.d ** 2;
PSP.T = T_SUN / Math.sqrt(PSP.d);
// modes between 500 and 501 THz in a 1-litre cavity
const MODES = (8 * Math.PI * (500e12) ** 2 * 1e12 * 1e-3) / C ** 3;
// Planck ÷ Rayleigh–Jeans = x/(eˣ − 1), x = hc/λkT: at 600 nm and 1500 K, and at any blackbody's peak
const xOf = (lam, T) => (6.62607015e-34 * C) / (lam * KB * T);
const RATIO_600 = xOf(600e-9, 1500) / Math.expm1(xOf(600e-9, 1500));
const RJ_AT_PEAK = Math.expm1(4.965114231744276) / 4.965114231744276;

/** The spectrum of a blackbody, as a still picture for a problem. */
const bb = (T, extra = {}, caption) => ({ type: 'mp-blackbody', params: { T, axis: 'lambda', controls: false, readout: false, ...extra }, ...(caption ? { caption } : {}) });

/** A cavity with a small hole: light that gets in bounces until it is absorbed. */
const cavity = {
  type: 'graph',
  params: frame([-1.6, 5.6], [-1.5, 2.4], {
    aspect: 'wide',
    shade: [{ fn: '2', lower: '-1', from: 0, to: 4, color: 'warn', alpha: 0.12 }],
    curves: [
      seg(0, -1, 4, -1, 'ink', 3.4), seg(0, 2, 4, 2, 'ink', 3.4), seg(4, -1, 4, 2, 'ink', 3.4), seg(0, -1, 0, 0.35, 'ink', 3.4), seg(0, 0.65, 0, 2, 'ink', 3.4),
      { param: ['-1.3 + t*1.3', '0.5'], t: [0, 1], color: 'gold', width: 2 },
      seg(0, 0.5, 2.4, 2, 'gold', 1.6), seg(2.4, 2, 4, 0.9, 'gold', 1.4), seg(4, 0.9, 1.7, -1, 'gold', 1.2), seg(1.7, -1, 0.2, 1.1, 'gold', 1), seg(0.2, 1.1, 1.6, 2, 'gold', 0.8, true),
    ],
    points: [label(-0.15, 0.5, 'small hole', 'ink2', -8, -16, 'right'), label(2, -1, 'walls held at temperature T', 'warn', 0, 16, 'center'), label(-1.3, 0.5, 'light in', 'gold', 0, 14, 'left')],
  }),
  caption: 'A hollow box with a small hole, seen in cross-section. Light that enters bounces from wall to wall and is almost certainly absorbed before it can find the hole again. Not to scale.',
};

/** Earth intercepts sunlight on a disc but radiates from its whole sphere. */
const earthBalance = {
  type: 'graph',
  params: frame([-0.8, 9.8], [-2.4, 2.4], {
    aspect: 'wide',
    shade: [disc(5, 0, 1.2, 'accent', 0.35)],
    curves: [circle(5, 0, 1.2, 'accent', 2.2), seg(5, -1.2, 5, 1.2, 'ink3', 1.4, true)],
    arrows: [
      ...[-0.9, -0.3, 0.3, 0.9].map((y) => ({ from: [0.2, y], to: [3.6, y], color: 'gold', width: 2 })),
      ...[-100, -50, 0, 50, 100].map((d) => { const a = (d * Math.PI) / 180; return { from: [r6(5 + 1.35 * Math.cos(a)), r6(1.35 * Math.sin(a))], to: [r6(5 + 2.05 * Math.cos(a)), r6(2.05 * Math.sin(a))], color: 'bad', width: 1.8 }; }),
    ],
    points: [label(1.9, 1.25, 'sunlight, 1361 W/m²', 'gold', 0, 0, 'center'), label(7.2, 0, 'radiates from all 4πR²', 'bad', 6, 0, 'left'), label(1.9, -1.3, 'caught on the disc πR²', 'ink2', 0, 0, 'center')],
  }),
  caption: 'Earth catches sunlight on a disc of area πR² (dashed: its cross-section) but radiates infrared from its whole surface, 4πR². Not to scale.',
};

/** Parker Solar Probe at closest approach, roughly to scale. */
const parker = {
  type: 'graph',
  params: frame([-1.6, 11.6], [-2.2, 2.2], {
    aspect: 'wide',
    shade: [disc(0, 0, 1, 'warn', 0.75)],
    curves: [seg(PSP.d, -0.42, PSP.d, 0.42, 'ink', 4.5), seg(PSP.d + 0.12, -0.18, PSP.d + 0.5, -0.18, 'ink3', 2), seg(PSP.d + 0.12, 0.18, PSP.d + 0.5, 0.18, 'ink3', 2), seg(0, -1.55, PSP.d, -1.55, 'ink3', 1.3, true)],
    arrows: [1.2, 3.4, 5.6, 7.6].map((x) => ({ from: [x, 0.75], to: [x + 1.2, 0.75], color: 'gold', width: 1.6 })),
    points: [label(0, 0, 'Sun', 'ink', 0, 0, 'center'), label(PSP.d, 0.42, 'heat shield', 'ink2', 0, -14, 'center'), label(PSP.d / 2, -1.55, '9.86 solar radii from the Sun’s centre', 'ink2', 0, 14, 'center')],
  }),
  caption: 'Parker Solar Probe at its closest approach, with its heat shield facing the Sun. Distances roughly to scale; the probe is drawn much larger than life.',
};

/** Mode density ∝ f², with a narrow band marked. */
const modeGraph = {
  type: 'graph',
  params: {
    x: [0, 1000], y: [0, 1.08], aspect: 'wide', xlabel: 'frequency f (THz)', ylabel: 'modes per hertz (relative)',
    curves: [{ fn: '(x/1000)^2', color: 'accent', width: 2.6, label: 'grows as f²', labelAt: 820, labelDx: -84, labelDy: -6 }],
    vlines: [{ x: 500, label: '500 THz', color: 'gold' }],
  },
  caption: 'How densely a cavity’s standing-wave modes are packed, per hertz of frequency: doubling the frequency gives four times as many. The visible band runs from about 400 to 790 THz.',
};

export default lesson({
  id: 'phys2710.MP1.1',
  title: 'Blackbody radiation and the ultraviolet catastrophe',
  minutes: 12, difficulty: 2,
  intro: t`Heat anything enough and it glows — dull red, then orange, then white. In 1859 Kirchhoff showed that a perfect absorber, a **blackbody**, emits a spectrum that depends **only on its temperature**, not on what it is made of; the best laboratory blackbody is a small hole in a heated, hollow box. By 1900 two measured laws described that spectrum, and classical physics had a third prediction of its own:

$$\lambda_{\max}T = b, \qquad M = \sigma T^4, \qquad B_\lambda^{\text{RJ}} = \frac{2ckT}{\lambda^4}$$

The first two — Wien’s displacement law and the Stefan–Boltzmann law — are measured facts. The third, the **Rayleigh–Jeans law**, follows from Maxwell’s waves in a box sharing energy by equipartition. It matches the data at long wavelengths, but it grows without limit at short ones: summed over all wavelengths, a warm oven would hold infinite energy. That failure, later named the **ultraviolet catastrophe**, is where quantum physics began.

> You met $\sigma T^4$ as a rule for heat transfer in [Conduction, convection and radiation](#/lesson/phys2210.M16.5). Here it is a clue.`,
  symbols: [
    { tex: '\\lambda_{\\max}', text: 'the wavelength at which the spectrum, measured per unit wavelength, peaks, in m' },
    { tex: 'T', text: 'the absolute temperature of the body, in kelvin (K)' },
    { tex: 'b', text: t`Wien’s constant, $2.898\times10^{-3}$ m K (exact in the 2019 SI, because it follows from $h$, $c$ and $k$)` },
    { tex: 'M', text: 'the power radiated by each square metre of a black surface (its exitance), in W/m²' },
    { tex: '\\sigma', text: t`the Stefan–Boltzmann constant, $${tex(SIGMA, 4)}\ \text{W m}^{-2}\,\text{K}^{-4}$` },
    { tex: 'B_\\lambda', text: 'spectral radiance: the power a surface sends per square metre, per steradian of direction, per metre of wavelength, in W sr⁻¹ m⁻³ — how bright it is in a narrow band of colours' },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s` },
    { tex: 'k', text: t`Boltzmann’s constant, $1.381\times10^{-23}$ J/K; equipartition gives every standing-wave mode an average energy $kT$` },
  ],
  why: t`The same curve, measured precisely, gave Planck his constant $h$ — and today it gives the temperatures of stars, of the cosmic microwave background, and of the heat shields that protect spacecraft.`,
  visual: {
    type: 'mp-blackbody',
    title: 'One curve per temperature — and a classical law that blows up',
    lead: t`The orange curve is the spectrum a blackbody at temperature $T$ actually emits, scaled so its peak sits at 1. The dashed red curve is the classical Rayleigh–Jeans prediction for the same $T$. Change $T$ with the slider, or pick a real object.`,
    tasks: [
      'Pick the Sun (5772 K): the peak sits at 502 nm, in the middle of the visible band, and 44% of the power is visible light.',
      'Pick the lamp (2800 K): the peak moves out to 1035 nm and only 8% of the power is visible — the rest is heat.',
      'Switch to log–log: the classical line keeps climbing toward short wavelengths, while the real spectrum turns over and plunges.',
    ],
    params: { T: 5772, axis: 'lambda', curves: ['planck', 'rj'] },
    caption: t`Solid: the spectrum a blackbody really emits — Planck’s law, the subject of the next lesson, which fits the best measurements. Dashed: the classical Rayleigh–Jeans prediction. The linear views scale each curve to its own peak. Real objects are only approximately black, and screen colours are approximate.`,
  },
  example: {
    prompt: t`Above Earth’s atmosphere, sunlight delivers $S = ${S_SUN}\ \text{W/m}^2$ (the total solar irradiance). The Sun’s radius is $R_\odot = 6.957\times10^{8}$ m, and Earth orbits $d = 1\ \text{au} = 1.496\times10^{11}$ m from it. Treating the Sun as a blackbody, find its surface temperature and the wavelength at which its spectrum peaks.`,
    visual: bb(T_SUN, {}, 'The spectrum of a 5772 K blackbody: the Sun, idealized. The visible band is marked under the curve.'),
    steps: [
      { label: 'The total power', text: t`The Sun’s output crosses every sphere around it. At Earth’s distance it is spread over $4\pi d^2$, so its luminosity is $L = 4\pi d^2 S = 4\pi\,(1.496\times10^{11}\ \text{m})^2\,(${S_SUN}\ \text{W/m}^2) = ${tex(EX.L, 4)}$ W.` },
      { label: 'Per square metre of the Sun', text: t`That power leaves a surface of area $4\pi R_\odot^2$: $M = \dfrac{L}{4\pi R_\odot^2} = S\left(\dfrac{d}{R_\odot}\right)^2 = ${S_SUN}\times(${fmt(AU / R_SUN, 4)})^2 = ${tex(EX.M, 3)}\ \text{W/m}^2$.` },
      { label: 'Stefan–Boltzmann', text: t`$M = \sigma T^4$, so $T = \left(\dfrac{M}{\sigma}\right)^{1/4} = \left(\dfrac{${tex(EX.M, 4)}}{5.670\times10^{-8}}\right)^{1/4} = ${Math.round(EX.T)}$ K.` },
      { label: 'Wien', text: t`$\lambda_{\max} = \dfrac{b}{T} = \dfrac{2.898\times10^{-3}\ \text{m K}}{${Math.round(EX.T)}\ \text{K}} = ${fmt(EX.lam, 3)}$ nm — blue-green, in the middle of the visible band.` },
      { label: 'Sense check', text: t`Why does the Sun look white, not green? Its spectrum is broad: it covers the whole visible band, with 44% of its power there, and our eyes evolved under it. Real sunlight has absorption lines and dips, so ${Math.round(EX.T)} K is the Sun’s **effective temperature** — the temperature of the blackbody that emits the same power per square metre. The IAU’s nominal value is 5772 K.` },
    ],
    answer: t`$T \approx ${Math.round(EX.T)}$ K, and the spectrum peaks at $\lambda_{\max} \approx ${fmt(EX.lam, 3)}$ nm.`,
  },
  practice: [
    mcq({
      id: 'hole-in-box', difficulty: 1,
      prompt: 'Why is a small hole in the wall of a hollow, heated box the best blackbody a laboratory can make?',
      visual: cavity,
      choices: [
        'Light entering the hole is almost certainly absorbed before it escapes, so the hole absorbs everything — and what leaks out has come into equilibrium with walls at one temperature',
        'The inside of the box is painted with the blackest paint available',
        'The hole is too small for any light to come out of it, so it looks black',
        'The box’s walls are made of a material that emits the ideal spectrum',
      ],
      answer: 0,
      why: {
        1: 'Paint helps, but no surface absorbs everything at every wavelength. The geometry does the work: a ray must hit the walls many times before it can find the hole again.',
        2: 'A heated cavity glows through its hole — that glow is exactly the blackbody radiation being measured.',
        3: 'Kirchhoff’s result is that the material does not matter: radiation in equilibrium inside any cavity has the same spectrum at the same temperature.',
      },
      hints: ['What happens to a ray of light that enters the hole?', 'A perfect absorber is also a perfect emitter (Kirchhoff).'],
      teach: 'A cavity with a small hole absorbs almost all light that enters, so its hole radiates a spectrum set by temperature alone.',
      explain: 'Light that enters bounces from wall to wall and is absorbed long before it can find the tiny hole again, so the hole is a nearly perfect absorber. By Kirchhoff’s law a perfect absorber is a perfect emitter: the radiation inside comes into equilibrium with the walls, and what leaks out depends only on their temperature.',
    }),
    num({
      id: 'peak-of', difficulty: 1,
      gen(r) {
        const [what, tc, unit, note] = r.pick([
          ['the skin of a person', 33, 'μm', 'in the thermal infrared, which is why thermal cameras work between 8 and 14 μm'],
          ['basalt lava as it erupts', 1130, 'μm', 'in the near infrared: the orange glow you see is only the short-wavelength tail'],
          ['an electric stove ring glowing dull red', 750, 'μm', 'in the infrared: only the far tail of the spectrum reaches the red end of vision'],
          ['the tungsten filament of an old-style lamp', 2530, 'nm', 'just beyond the red end of vision: most of a filament’s output is infrared heat'],
        ]);
        const T = tc + 273.15, f = unit === 'μm' ? 1e6 : 1e9, lam = (WIEN_B / T) * f;
        return {
          prompt: t`Treat ${what}, at about ${tc} °C, as a blackbody. At what wavelength does its spectrum peak? Answer in ${unit === 'μm' ? 'micrometres' : 'nanometres'}.`,
          answer: lam, units: unit, tol: { rel: 0.01 },
          errors: [
            { value: (WIEN_B / tc) * f, feedback: 'Wien’s law needs the absolute temperature: add 273.15 to the Celsius value first.' },
            { value: WIEN_B * T * f, feedback: t`The peak wavelength is $b$ *divided* by $T$: hotter bodies peak at shorter wavelengths.` },
          ],
          hints: [t`Wien’s displacement law: $\lambda_{\max} = b/T$, with $b = 2.898\times10^{-3}$ m K and $T$ in kelvin.`, t`$T = ${tc} + 273.15 = ${T.toFixed(2)}$ K.`],
          teach: t`Wien’s law: the peak wavelength is inversely proportional to the absolute temperature, $\lambda_{\max} = b/T$.`,
          explain: t`$\lambda_{\max} = \dfrac{2.898\times10^{-3}\ \text{m K}}{${T.toFixed(2)}\ \text{K}} = ${fmt(lam, 3)}\ ${unit === 'μm' ? t`\mu\text{m}` : t`\text{nm}`}$ — ${note}.`,
          visual: bb(T, { peak: false, numbers: false }, t`The spectrum of a blackbody at ${tc} °C, with the wavelength numbers hidden. A real ${what.replace(/^the |^an? /, '')} is only approximately black.`),
        };
      },
    }),
    num({
      id: 'star-temp', difficulty: 2,
      gen(r) {
        const [star, T0, colour] = r.pick([['Betelgeuse', 3600, 'orange-red'], ['Rigel', 12100, 'blue-white'], ['Sirius A', 9940, 'white'], ['Arcturus', 4290, 'orange']]);
        const lamNm = sig((WIEN_B / T0) * 1e9, 3), T = WIEN_B / (lamNm * 1e-9);
        return {
          prompt: t`The ${colour} star ${star} emits a spectrum, close to a blackbody’s, that peaks near ${lamNm} nm. Estimate its surface temperature.`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: lamNm / WIEN_B / 1e9, feedback: t`Upside down: $T = b/\lambda_{\max}$, so the temperature is $b$ divided by the wavelength.` }],
          hints: [t`Rearrange Wien’s law: $T = b/\lambda_{\max}$.`, t`$T = \dfrac{2.898\times10^{-3}\ \text{m K}}{${lamNm}\times10^{-9}\ \text{m}}$.`],
          teach: 'A star’s colour is a thermometer: the hotter the star, the shorter the wavelength at which its spectrum peaks.',
          explain: t`$T = \dfrac{2.898\times10^{-3}}{${lamNm}\times10^{-9}} = ${Math.round(T).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')}$ K. ${T > 6000 ? 'Its peak lies in the ultraviolet: we see only the long-wavelength side, which looks blue-white.' : 'Its peak lies at the red end or beyond: the star looks orange or red.'} Astronomers refine such estimates with the star’s absorption lines, since no star is a perfect blackbody.`,
          visual: bb(T, { hide: ['T'] }, t`A blackbody spectrum with its peak at ${lamNm} nm, close to ${star}’s.`),
        };
      },
    }),
    num({
      id: 'sirius-lum', difficulty: 2,
      prompt: t`Sirius A has a radius of $1.711\,R_\odot$ and a surface temperature of 9940 K; the Sun’s is 5772 K. Treating both as blackbodies, how many times more power does Sirius A radiate than the Sun? (Luminosity $L = 4\pi R^2\sigma T^4$.)`,
      answer: 1.711 ** 2 * (9940 / 5772) ** 4, tol: { rel: 0.01 },
      errors: [
        { value: (9940 / 5772) ** 4, feedback: t`That is the ratio per square metre. Sirius A is also bigger: multiply by $(R/R_\odot)^2$.` },
        { value: 1.711 ** 2, feedback: t`That counts only the size. Each square metre of Sirius A also radiates $(T/T_\odot)^4$ times as much.` },
        { value: 1.711 * (9940 / 5772) ** 4, feedback: t`Area grows as the radius *squared*: use $(1.711)^2$.` },
      ],
      hints: [t`The ratio is $\dfrac{L}{L_\odot} = \left(\dfrac{R}{R_\odot}\right)^2\left(\dfrac{T}{T_\odot}\right)^4$.`, t`$(1.711)^2 = ${fmt(1.711 ** 2, 4)}$ and $(9940/5772)^4 = ${fmt((9940 / 5772) ** 4, 4)}$.`],
      teach: 'A star’s luminosity grows as the square of its radius and the fourth power of its temperature.',
      explain: t`$\dfrac{L}{L_\odot} = ${fmt(1.711 ** 2, 4)}\times${fmt((9940 / 5772) ** 4, 4)} = ${fmt(1.711 ** 2 * (9940 / 5772) ** 4, 3)}$. The measured value is about 25.4 — close, though no star is a perfect blackbody.`,
      visual: { type: 'mp-blackbody', params: { T: 9940, axis: 'log', window: 'fit', compare: ['sun'], controls: false, readout: false }, caption: 'Sirius A (orange) and the Sun (grey) per square metre of surface, to scale on log–log axes: the hotter body is brighter at every wavelength. The dashed line joins the peaks of all blackbodies.' },
    }),
    mcq({
      id: 'why-catastrophe', difficulty: 2,
      prompt: 'Why does the classical Rayleigh–Jeans law give a blackbody cavity infinite total energy?',
      visual: { type: 'mp-blackbody', params: { T: 1500, axis: 'log', window: 'fit', curves: ['planck', 'rj'], peak: false, controls: false, readout: false }, caption: 'A 1500 K oven, log–log: the classical Rayleigh–Jeans line (dashed) against the measured spectrum (solid).' },
      choices: [
        t`Equipartition gives every standing-wave mode the same average energy $kT$, and the number of modes keeps growing at higher frequencies without limit`,
        'Maxwell’s equations fail for short-wavelength light',
        'The walls of the cavity cannot absorb ultraviolet light, so it builds up',
        'Hotter bodies emit at shorter wavelengths, so the oven keeps heating itself',
      ],
      answer: 0,
      why: {
        1: t`Maxwell’s equations are fine: the count of standing-wave modes they give survives unchanged into Planck’s law. The faulty step is giving each mode $kT$.`,
        2: 'The walls’ material does not matter (Kirchhoff): any cavity at the same temperature holds the same radiation.',
        3: 'The temperature is held fixed. The divergence comes from adding up the energy over all modes at that one temperature.',
      },
      hints: [t`How many modes are there between $f$ and $f + df$, and what energy does classical physics give each one?`, t`The number of modes per hertz grows as $f^2$; each gets $kT$.`],
      teach: t`Classical equipartition gives every mode $kT$, and there are unboundedly many high-frequency modes, so the total energy diverges.`,
      explain: t`A cavity holds $\dfrac{8\pi f^2}{c^3}\,df$ standing-wave modes per unit volume between $f$ and $f + df$. Equipartition gives each an average energy $kT$, so the energy per unit frequency grows as $f^2$ and its integral over all frequencies diverges. Planck kept the mode count and changed the energy per mode (next lesson).`,
    }),
    num({
      id: 'count-modes', difficulty: 3,
      prompt: t`A cavity of volume $V$ holds $\dfrac{8\pi f^2}{c^3}\,V\,\Delta f$ standing-wave modes with frequencies between $f$ and $f + \Delta f$ (the 8π counts both polarizations). How many modes does a 1.00-litre oven hold between 500 THz and 501 THz — a sliver of green light?`,
      answer: MODES, tol: { rel: 0.01 },
      errors: [{ value: MODES * 1e3, feedback: t`A litre is $10^{-3}\ \text{m}^3$, not 1 m³.` }],
      hints: [t`Use SI units throughout: $f = 5.00\times10^{14}$ Hz, $\Delta f = 1.0\times10^{12}$ Hz, $V = 1.00\times10^{-3}\ \text{m}^3$.`, t`$N = \dfrac{8\pi\,(5.00\times10^{14})^2\,(10^{12})\,(10^{-3})}{(2.998\times10^{8})^3}$.`],
      teach: 'The number of cavity modes per unit frequency grows as f², so a narrow band of visible light already holds an astronomical number of them.',
      explain: t`$N = ${tex(MODES, 3)}$ modes. Classical equipartition would give each of them $kT$ — at 1500 K that is $0.13$ eV apiece — and the next terahertz up holds slightly more, without end. Real ovens hold almost no energy at these frequencies: at 600 nm a 1500 K cavity holds only $${tex(RATIO_600, 1)}$ of the classical energy.`,
      visual: modeGraph,
    }),
    num({
      id: 'earth-temp', difficulty: 3,
      prompt: t`Sunlight reaches Earth with an intensity of $S = ${S_SUN}\ \text{W/m}^2$, and Earth reflects 30% of it back to space (its albedo, 0.30). If Earth absorbs the rest on its cross-section $\pi R^2$ and radiates as a blackbody at one uniform temperature from its whole surface $4\pi R^2$, what is that temperature?`,
      answer: T_EARTH, units: 'K', tol: { rel: 0.01 },
      errors: [
        { value: ((S_SUN * (1 - ALB)) / SIGMA) ** 0.25, feedback: t`Earth absorbs on $\pi R^2$ but radiates from $4\pi R^2$: divide the absorbed flux by 4.` },
        { value: ((S_SUN * (1 - ALB)) / (2 * SIGMA)) ** 0.25, feedback: t`The whole sphere radiates, day side and night side: the ratio of areas is $4\pi R^2/\pi R^2 = 4$, not 2.` },
        { value: (S_SUN / (4 * SIGMA)) ** 0.25, feedback: 'You left out the albedo: only 70% of the sunlight is absorbed.' },
      ],
      hints: [t`Balance absorbed and emitted power: $(1 - A)\,S\,\pi R^2 = \sigma T^4\,4\pi R^2$.`, t`So $T = \left(\dfrac{(1 - A)\,S}{4\sigma}\right)^{1/4} = \left(\dfrac{0.70\times${S_SUN}}{4\times5.670\times10^{-8}}\right)^{1/4}$.`],
      teach: t`A planet’s equilibrium temperature comes from balancing sunlight absorbed on a disc against $\sigma T^4$ radiated from a sphere.`,
      explain: t`$T = \left(\dfrac{0.70\times${S_SUN}}{4\times5.670\times10^{-8}}\right)^{1/4} = ${fmt(T_EARTH, 3)}$ K, or $${fmt(T_EARTH - 273.15, 2)}$ °C. Seen from space Earth does radiate like a body near 255 K; its surface averages about +15 °C because the atmosphere absorbs much of the infrared the ground emits — the greenhouse effect. Its emission peaks near $b/T \approx ${fmt((WIEN_B / T_EARTH) * 1e6, 2)}\ \mu\text{m}$.`,
      visual: earthBalance,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wien', difficulty: 2,
      gen(r) {
        const [what, lam, unit, note] = r.pick([
          ['Sirius B, the white dwarf that orbits Sirius A,', 116, 'nm', 'far ultraviolet: white dwarfs are small but very hot'],
          ['Proxima Centauri, the red dwarf nearest the Sun,', 950, 'nm', 'a cool star: its peak lies in the near infrared'],
          ['the Moon’s sunlit equator at noon', 7.4, 'μm', 'hot enough to boil water, though the Moon has no air to hold the heat at night'],
        ]);
        const T = WIEN_B / (lam * (unit === 'nm' ? 1e-9 : 1e-6));
        return {
          prompt: t`The thermal emission of ${what} peaks near ${lam} ${unit === 'nm' ? 'nm' : 'μm'}. Treating it as a blackbody, what is its temperature?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          hints: [t`$T = b/\lambda_{\max}$ with $b = 2.898\times10^{-3}$ m K.`],
          teach: 'Wien’s displacement law turns a peak wavelength into a temperature: T = b/λ_max.',
          explain: t`$T = \dfrac{2.898\times10^{-3}\ \text{m K}}{${lam}\times10^{${unit === 'nm' ? -9 : -6}}\ \text{m}} = ${fmt(T, 3)}$ K — ${note}.`,
          visual: bb(T, { hide: ['T'] }, t`A blackbody spectrum peaking at ${lam} ${unit === 'nm' ? 'nm' : 'μm'}.`),
        };
      },
    }),
    mcq({
      id: 'cp-where-agree', difficulty: 2,
      prompt: 'Where does the classical Rayleigh–Jeans law agree with the measured spectrum of a blackbody?',
      visual: bb(1200, { curves: ['planck', 'rj'], peak: false }, 'The spectrum of a 1200 K blackbody (solid) and the classical Rayleigh–Jeans prediction (dashed), each to the same scale.'),
      choices: ['At long wavelengths only', 'At short wavelengths only', 'Near the peak only', 'Everywhere, provided the temperature is low enough'],
      answer: 0,
      why: {
        1: 'Short wavelengths are exactly where it fails: the classical curve shoots up as 1/λ⁴ while the real spectrum plunges.',
        2: t`At the peak the classical curve is already ${Math.round(RJ_AT_PEAK)} times too high, and climbing.`,
        3: 'No temperature saves it. Lowering T only moves the place where the two curves part company to longer wavelengths.',
      },
      hints: ['Look at both ends of the plot.', 'Which end has the most low-frequency modes, and which the most high-frequency ones?'],
      teach: 'Classical physics gets blackbody radiation right only at long wavelengths, where the light’s frequency is low.',
      explain: 'The two curves merge at long wavelengths and part company toward short ones, where the classical law diverges. Whatever was wrong with classical physics, it mattered only at high frequencies — the clue Planck would follow.',
    }),
    num({
      id: 'cp-parker', difficulty: 3, transfer: true,
      prompt: t`At its closest approach Parker Solar Probe is $${PSP.d}\,R_\odot$ from the Sun’s centre. Model its heat shield as a flat black plate facing the Sun that absorbs all the sunlight falling on it and radiates only from its sunlit face. The Sun is a 5772 K blackbody. What temperature does the shield reach?`,
      answer: PSP.T, units: 'K', tol: { rel: 0.01 },
      errors: [
        { value: T_SUN / PSP.d, feedback: t`The flux falls as $1/d^2$, and $T$ goes as the fourth root of the flux: $T = T_\odot\sqrt{R_\odot/d}$, not $T_\odot R_\odot/d$.` },
        { value: T_SUN / PSP.d ** 0.25, feedback: t`Inverse-square: the flux at distance $d$ is $\sigma T_\odot^4 (R_\odot/d)^2$ — keep the square.` },
      ],
      hints: [t`Sunlight at distance $d$ carries $\sigma T_\odot^4\,(R_\odot/d)^2$ per square metre (the Sun’s surface flux, spread over a bigger sphere).`, t`Set that equal to what the plate radiates, $\sigma T^4$: $T = T_\odot\sqrt{R_\odot/d}$.`],
      teach: t`A black plate facing a star reaches $T = T_\star\sqrt{R_\star/d}$: inverse-square dilution, then the fourth root of Stefan–Boltzmann.`,
      explain: t`The flux is $\sigma T_\odot^4/${PSP.d}^2 = ${tex(PSP.flux, 3)}\ \text{W/m}^2$ — about ${Math.round(PSP.flux / S_SUN)} times what reaches Earth. Then $T = 5772\ \text{K}/\sqrt{${PSP.d}} = ${fmt(PSP.T, 3)}$ K. NASA quotes about 1400 °C (1650 K) for the real shield: its white coating reflects much of the sunlight, which a black plate would not.`,
      visual: parker,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.1 Blackbody radiation', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-1-blackbody-radiation' },
    { label: 'Prša et al. (2016), Nominal values for selected solar and planetary quantities: IAU 2015 Resolution B3', url: 'https://arxiv.org/abs/1605.09788' },
    { label: 'Kragh (2000), Max Planck: the reluctant revolutionary, Physics World', url: 'https://physicsworld.com/a/max-planck-the-reluctant-revolutionary/' },
    { label: 'NASA, Parker Solar Probe', url: 'https://science.nasa.gov/mission/parker-solar-probe/' },
  ],
});
