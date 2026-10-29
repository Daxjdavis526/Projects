// Waves in linear media and at interfaces (Griffiths §9.3.1–9.3.2). In a
// linear medium v = 1/√(εμ) = c/n with n = √(ε_rμ_r), B = E/v, and the ratio
// E/H is the medium's impedance Z = √(μ/ε) (Z₀ ≈ 376.7 Ω in vacuum), so the
// intensity is E₀²/2Z. At normal incidence the boundary conditions (E∥ and
// H∥ continuous, no free charge or current) give r = (Z₂ − Z₁)/(Z₂ + Z₁),
// t = 2Z₂/(Z₁ + Z₂), R = r², T = (Z₁/Z₂)t², R + T = 1; for non-magnetic media
// r = (n₁ − n₂)/(n₁ + n₂). The sign flip on entering a denser medium; t > 1
// leaving one; the string-junction analogy (PHYS 3750 W9.1). The EM-only
// twist: a magnetic medium with μ_r = ε_r has Z = Z₀ and reflects nothing at
// normal incidence, however large its n. Transfers: airborne ice-penetrating
// radar (ε_r of ice 3.15: 169 m/μs), why subglacial lakes are bright
// reflectors, a ferrite absorber tile. The optics side (glass, coatings,
// irradiance in glass) lives in PHYS 4650 O2.1 and O3.3.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { C, Z0, sf, normal } from './_em4b.js';

const t = String.raw;
const ER = { ice: 3.15, water: 88, rock: 6 };    // radio-frequency relative permittivities: ice (well measured), water at 0 °C, a typical crystalline rock (varies, 5–9)
const N = { air: 1, ice: Math.sqrt(ER.ice), water: Math.sqrt(ER.water), rock: Math.sqrt(ER.rock) };

// the worked example: an airborne ice-penetrating radar at 60 MHz over a 2 km ice sheet
const EX = (() => {
  const top = normal(N.air, N.ice), wat = normal(N.ice, N.water), rock = normal(N.ice, N.rock);
  const v = C / N.ice, d = 2000;
  return { top, wat, rock, v, d, dt: (2 * d) / v, lam: v / 60e6, dB: 10 * Math.log10(wat.R / rock.R) };
})();

const r4 = (v) => +(+v).toPrecision(4);

/**
 * A wave meeting the interface x = 0 from the left: incident + reflected
 * (left, medium 1) and transmitted (right, medium 2), E against x in vacuum
 * wavelengths at phase ph (degrees). Amplitudes from Z (impedances relative
 * to Z₀) and the indices.
 */
function interPic(n1, n2, caption, { ph = 40, Z1 = 1 / n1, Z2 = 1 / n2, labels = true, names = null } = {}) {
  const r = (Z2 - Z1) / (Z2 + Z1), tt = (2 * Z2) / (Z1 + Z2), p = r4((ph * Math.PI) / 180);
  const lo = -2, hi = 2, top = 2.3;
  return {
    type: 'graph',
    params: {
      x: [lo, hi], y: [-top, top], aspect: 'wide', xlabel: 'x / λ₀', ylabel: '', yticks: 0, grid: false,
      shade: [{ fn: String(top), lower: String(-top), from: 0, to: hi, color: 'teal', alpha: Math.min(0.32, 0.06 + 0.05 * n2) }, ...(n1 > 1.01 ? [{ fn: String(top), lower: String(-top), from: lo, to: 0, color: 'teal', alpha: Math.min(0.32, 0.06 + 0.05 * n1) }] : [])],
      curves: [
        { fn: `cos(2*pi*${r4(n1)}*x - ${p}) + ${r4(r)}*cos(-2*pi*${r4(n1)}*x - ${p})`, domain: [lo, 0], color: 'violet', width: 2.4, ...(labels ? { label: 'E', labelAt: lo + 0.1, labelDy: -2 } : {}) },
        { fn: `${r4(tt)}*cos(2*pi*${r4(n2)}*x - ${p})`, domain: [0, hi], color: 'violet', width: 2.4 },
      ],
      points: names ? [
        { x: lo / 2, y: top - 0.3, r: 0, label: names[0], labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: hi / 2, y: top - 0.3, r: 0, label: names[1], labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
      ] : [],
      vlines: [{ x: 0, color: 'ink3' }],
    },
    caption,
  };
}

/** The string-junction analogue (wv2-junction), still, after the pulse has met the junction. */
const stringPic = (ratio, caption, time = 200) => ({ type: 'wv2-junction', params: { ratio, time, controls: false, readout: false, panels: ['string'], play: false }, caption });

export default lesson({
  id: 'phys4600.M3.2',
  title: 'Waves in linear media and at interfaces',
  minutes: 16, difficulty: 3,
  equation: t`\begin{gathered}v = \frac{1}{\sqrt{\varepsilon\mu}} = \frac cn,\quad Z = \sqrt{\frac{\mu}{\varepsilon}}, \\ r = \frac{E_R}{E_I} = \frac{Z_2 - Z_1}{Z_2 + Z_1},\quad t = \frac{E_T}{E_I} = \frac{2Z_2}{Z_1 + Z_2}\end{gathered}`,
  intro: t`Inside a linear material the vacuum constants become the material’s own: $\varepsilon = \varepsilon_r\varepsilon_0$ and $\mu = \mu_r\mu_0$. Waves travel at $v = 1/\sqrt{\varepsilon\mu} = c/n$, with **index** $n = \sqrt{\varepsilon_r\mu_r}$, and $B = E/v$. A second number matters as much: the **impedance** $Z = \sqrt{\mu/\varepsilon}$, the ratio $E/H$ of the wave’s fields ($Z_0 \approx ${nice(sf(Z0, 4))}\ \Omega$ in vacuum). Where two media meet, the tangential $\vec E$ and the tangential $\vec H = \vec B/\mu$ must match on both sides. A single transmitted wave cannot satisfy both unless the impedances agree, so part of the wave is sent back. At normal incidence the result depends on the impedances alone. For ordinary non-magnetic materials, $Z = Z_0/n$, and $r = (n_1 - n_2)/(n_1 + n_2)$.`,
  symbols: [
    { tex: 'v', text: 'the wave speed in the medium, in m/s' },
    { tex: '\\varepsilon,\\ \\mu', text: t`the medium’s permittivity and permeability: $\varepsilon_r\varepsilon_0$ (F/m) and $\mu_r\mu_0$ (H/m)` },
    { tex: 'n', text: t`the refractive index, $n = \sqrt{\varepsilon_r\mu_r} = c/v$ (no units)` },
    { tex: 'Z', text: t`the wave impedance $E/H$ of the medium, in ohms; $Z = Z_0\sqrt{\mu_r/\varepsilon_r}$` },
    { tex: 'E_I,\\ E_R,\\ E_T', text: t`the amplitudes of the incident, reflected and transmitted electric fields, in V/m` },
    { tex: 'r,\\ t', text: t`the amplitude reflection and transmission coefficients; a negative $r$ means the reflected $\vec E$ is flipped` },
  ],
  why: t`Every radar echo, every ice-penetrating sounding of Antarctica or Mars, every stealth coating and anechoic chamber is a calculation of $Z_1$ against $Z_2$.`,
  visual: {
    type: 'graph',
    title: 'A wave meets a material',
    lead: t`A wave arrives from the left, in vacuum, and meets a flat material at $x = 0$. Violet is $E$: on the left the incident and reflected waves together, on the right the transmitted wave. Change the material’s $\varepsilon_r$ and $\mu_r$ and watch the wavelength inside, the amplitudes, and the readouts.`,
    tasks: [
      t`Raise $\varepsilon_r$: the wavelength inside shrinks as $1/n$, less gets through, and $r$ goes negative — the reflection is flipped.`,
      t`Now raise $\mu_r$ to match $\varepsilon_r$: the index climbs further, yet $r$ falls to zero. What the wave notices is the impedance, not the index.`,
      t`Check that $R + T = 1$ for any setting, although $t$ itself can exceed 1 (try $\mu_r$ large).`,
    ],
    params: {
      x: [-2, 2], y: [-2.3, 2.3], aspect: 'wide', xlabel: 'x / λ₀', ylabel: '', yticks: 0, grid: false,
      sliders: [
        { key: 'er', label: t`Material’s $\varepsilon_r$`, min: 1, max: 9, step: 0.1, value: 4, explain: t`Relative permittivity: 3.15 for ice, about 6 for rock, 88 for water at radio frequencies (off this scale).` },
        { key: 'mr', label: t`Material’s $\mu_r$`, min: 1, max: 9, step: 0.1, value: 1, explain: t`Relative permeability: 1 for almost everything except magnetic materials such as ferrites.` },
        { key: 'ph', label: t`Time $\omega t$`, min: 0, max: 360, step: 5, value: 40, unit: '^\\circ', explain: 'Step through a cycle to see the waves move.' },
      ],
      shade: [{ fn: '2.3', lower: '-2.3', from: 0, to: 2, color: 'teal', alpha: 0.18 }],
      curves: [
        { fn: 'cos(2*pi*x - ph*pi/180) + ((sqrt(mr/er) - 1)/(sqrt(mr/er) + 1))*cos(-2*pi*x - ph*pi/180)', domain: [-2, 0], color: 'violet', width: 2.4, label: 'E', labelAt: -1.9, labelDy: -2 },
        { fn: '(2*sqrt(mr/er)/(sqrt(mr/er) + 1))*cos(2*pi*sqrt(er*mr)*x - ph*pi/180)', domain: [0, 2], color: 'violet', width: 2.4 },
      ],
      points: [{ x: -1, y: 2.0, r: 0, label: 'vacuum', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }, { x: 1, y: 2.0, r: 0, label: 'material', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }],
      vlines: [{ x: 0, color: 'ink3' }],
      readouts: [
        { label: t`$n = \sqrt{\varepsilon_r\mu_r}$`, expr: 'sqrt(er*mr)', digits: 3 },
        { label: t`$Z/Z_0$`, expr: 'sqrt(mr/er)', digits: 3 },
        { label: t`$r$`, expr: '(sqrt(mr/er) - 1)/(sqrt(mr/er) + 1)', digits: 3, zero: 1e-9 },
        { label: t`$t$`, expr: '2*sqrt(mr/er)/(sqrt(mr/er) + 1)', digits: 3 },
        { label: t`$R = r^2$`, expr: '((sqrt(mr/er) - 1)/(sqrt(mr/er) + 1))^2', digits: 3, zero: 1e-9 },
        { label: t`$T$`, expr: '(1/sqrt(mr/er))*(2*sqrt(mr/er)/(sqrt(mr/er) + 1))^2', digits: 3 },
      ],
    },
    caption: t`Normal incidence on a flat, lossless, linear material; $E$ in units of the incident amplitude, distance in vacuum wavelengths. The shading marks the material, not its density. Real ε and μ depend on frequency.`,
  },
  example: {
    prompt: t`An airborne radar sounds the Antarctic ice sheet at 60 MHz. Ice has $\varepsilon_r = ${ER.ice}$. What fraction of the power reflects at the air–ice surface, how long does an echo from a bed ${EX.d / 1000} km down take, and how much brighter is the echo when the bed is a subglacial lake ($\varepsilon_r \approx ${ER.water}$) rather than rock ($\varepsilon_r \approx ${ER.rock}$)?`,
    visual: interPic(1, N.ice, t`The radar wave entering ice from above (drawn left to right). $E$ in units of the incident amplitude; lossless media, normal incidence.`, { names: ['air', 'ice'] }),
    steps: [
      { label: 'Into the ice', text: t`Ice is non-magnetic, so $n = \sqrt{${ER.ice}} = ${nice(sf(N.ice, 4))}$ and $r = \dfrac{1 - n}{1 + n} = ${nice(sf(EX.top.r, 3))}$: the surface returns $R = r^2 \approx ${nice(sf(EX.top.R * 100, 3))}\%$ of the power, with $E$ flipped, and $T \approx ${nice(sf(EX.top.T * 100, 3))}\%$ goes on.` },
      { label: 'Travel time', text: t`In ice $v = c/n \approx ${nice(sf(EX.v / 1e6, 4))}$ m/μs (radioglaciologists use 168–169 m/μs). Down and back: $\Delta t = 2d/v \approx ${nice(sf(EX.dt * 1e6, 3))}$ μs. The wavelength inside is $v/f \approx ${nice(sf(EX.lam, 3))}$ m.` },
      { label: 'At the bed', text: t`Ice to water: $r = \dfrac{${nice(sf(N.ice, 3))} - ${nice(sf(N.water, 3))}}{${nice(sf(N.ice, 3))} + ${nice(sf(N.water, 3))}} = ${nice(sf(EX.wat.r, 3))}$, $R \approx ${nice(sf(EX.wat.R, 3))}$. Ice to rock: $r = ${nice(sf(EX.rock.r, 3))}$, $R \approx ${nice(sf(EX.rock.R, 3))}$.` },
      { label: 'Compare', text: t`$10\log_{10}(${nice(sf(EX.wat.R, 3))}/${nice(sf(EX.rock.R, 3))}) \approx ${nice(sf(EX.dB, 3))}$ dB: the lake echo is that much stronger, and flat. Such bright, flat echoes are how hundreds of subglacial lakes, Lake Vostok among them, were found.` },
      { label: 'Sense check', text: t`$R + T = 1$ at the surface ✓. Real rock varies ($\varepsilon_r$ about 5 to 9) and the ice absorbs on the way down; both shift the numbers, but water’s huge $\varepsilon_r$ keeps the lake echo the brightest thing at the bed.` },
    ],
    answer: t`About ${nice(sf(EX.top.R * 100, 2))}% reflects at the surface; the bed echo returns after about ${nice(sf(EX.dt * 1e6, 3))} μs; a lake echo is about ${nice(sf(EX.dB, 2))} dB brighter than rock.`,
  },
  practice: [
    order({
      id: 'bc-order', difficulty: 2,
      prompt: t`Put in order the derivation of the reflection coefficient at normal incidence.`,
      visual: interPic(1, 2, t`Incident and reflected waves on the left, transmitted on the right. $E$ in units of the incident amplitude.`),
      items: [
        t`Write the three waves: incident $E_I$ and reflected $E_R$ on side 1, transmitted $E_T$ on side 2.`,
        t`Each wave has $H = \pm E/Z$, with the sign flipped for the reflected wave, which travels backward.`,
        t`Tangential $\vec E$ is continuous: $E_I + E_R = E_T$.`,
        t`Tangential $\vec H$ is continuous (no free current): $(E_I - E_R)/Z_1 = E_T/Z_2$.`,
        t`Solve: $E_R/E_I = (Z_2 - Z_1)/(Z_2 + Z_1)$ and $E_T/E_I = 2Z_2/(Z_1 + Z_2)$.`,
      ],
      hints: [t`Start from what the three waves are; the boundary conditions come next.`, t`$\vec E$ and $\vec H$ of a wave are tied by $Z$; a backward wave has its $\vec H$ reversed relative to its $\vec E$.`],
      teach: 'Two boundary conditions, two unknowns: matching E∥ and H∥ fixes the reflected and transmitted amplitudes.',
      explain: t`With $E_T = E_I + E_R$ substituted into $(E_I - E_R)/Z_1 = E_T/Z_2$: $E_I(Z_2 - Z_1) = E_R(Z_2 + Z_1)$. For non-magnetic media $Z \propto 1/n$, which turns this into $r = (n_1 - n_2)/(n_1 + n_2)$.`,
    }),
    num({
      id: 'R-pair', difficulty: 2,
      gen(r) {
        const pairs = [['air', 'dry sand', 1, 3], ['air', 'concrete', 1, 5], ['air', 'fresh water', 1, 80], ['ice', 'rock', 3.15, 6], ['dry sand', 'wet sand', 3, 20], ['air', 'glacier ice', 1, 3.15]];
        const [m1, m2, e1, e2] = r.pick(pairs);
        const q = normal(Math.sqrt(e1), Math.sqrt(e2));
        return {
          prompt: t`A radar wave travelling through ${m1} ($\varepsilon_r = ${e1}$) meets a flat boundary with ${m2} ($\varepsilon_r = ${e2}$) square-on. What percentage of its power is reflected? Treat both as non-magnetic and lossless.`,
          visual: interPic(Math.sqrt(e1), Math.sqrt(e2), t`The wave meeting the boundary. $E$ in units of the incident amplitude; distance in vacuum wavelengths.`, { names: [m1, m2] }),
          answer: q.R * 100, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: Math.abs(q.r) * 100, feedback: t`That is $|r|$, the amplitude ratio. The power goes as its square.` },
            { value: (((e1 - e2) / (e1 + e2)) ** 2) * 100, feedback: t`Use the indices, $n = \sqrt{\varepsilon_r}$, not the permittivities themselves.` },
          ].filter((e) => Math.abs(e.value - q.R * 100) > 0.03 * q.R * 100),
          hints: [t`For non-magnetic media $n = \sqrt{\varepsilon_r}$ and $r = (n_1 - n_2)/(n_1 + n_2)$.`, t`$R = r^2$.`],
          teach: 'At normal incidence between non-magnetic media, R = ((n₁ − n₂)/(n₁ + n₂))².',
          explain: t`$n_1 = ${nice(sf(Math.sqrt(e1), 3))}$, $n_2 = ${nice(sf(Math.sqrt(e2), 3))}$, so $r = ${nice(sf(q.r, 3))}$ and $R \approx ${nice(sf(q.R * 100, 3))}\%$.`,
        };
      },
    }),
    mcq({
      id: 'flip', difficulty: 2,
      prompt: t`The picture shows the analogue on a string: a pulse ran from a light string into a heavier one, and part of it came back. When does an electromagnetic wave’s **reflected electric field** come back flipped?`,
      visual: stringPic(4, t`A pulse that ran from a light string into one four times heavier (the junction is the dashed line): the reflection is inverted. Same physics as a wave entering a medium with twice the index.`),
      choices: [
        t`When it reflects from a medium of higher index (lower impedance) than the one it travels in`,
        t`When it reflects from a medium of lower index than the one it travels in`,
        'Always: every reflection flips the field',
        'Never: only the magnetic field can flip',
      ],
      answer: 0,
      why: {
        1: t`Going from high to low index, $n_1 > n_2$, gives $r = (n_1 - n_2)/(n_1 + n_2) > 0$: no flip.`,
        2: t`A reflection from a lower index comes back upright: $r > 0$.`,
        3: t`$\vec E$ and $\vec B$ cannot both keep their signs on reflection, since the direction of travel, along $\vec E\times\vec B$, reverses. Which one flips depends on the impedances.`,
      },
      hints: [t`$r = (n_1 - n_2)/(n_1 + n_2)$ for non-magnetic media. When is it negative?`, 'On the string, a heavier string plays the part of the higher index.'],
      teach: 'E flips on reflection from a higher-index (lower-impedance) medium; B flips in the other case.',
      explain: t`$r < 0$ exactly when $n_2 > n_1$, i.e. $Z_2 < Z_1$. The reflected $\vec B$ does the opposite, so that $\vec E\times\vec B$ points back the way the wave came. On a string, displacement plays the part of $E$ and a heavier string the part of a higher index.`,
    }),
    mcq({
      id: 't-gt-1', difficulty: 3,
      prompt: t`A wave leaves glass ($n = 1.5$) for air at normal incidence. The transmitted amplitude is $t = 2n_1/(n_1 + n_2) = 1.2$: the field in the air is **larger** than the incident field. How does that square with energy conservation?`,
      visual: interPic(1.5, 1, t`A wave leaving glass (left) for air (right). $E$ in units of the incident amplitude.`, { names: ['glass', 'air'] }),
      choices: [
        t`Intensity is $E^2/2Z$, and air has the larger impedance: the transmitted intensity is $(1.2)^2/1.5 = 0.96$ of the incident, and the reflected 0.04 makes up the rest`,
        'It does not: the formula fails when light leaves a denser medium',
        'The extra energy comes from the glass, which cools slightly',
        t`The amplitude is larger but the wave is slower in air, so it carries less energy per second`,
      ],
      answer: 0,
      why: {
        1: t`The formula holds both ways; it came from boundary conditions that do not care which side the wave starts on.`,
        2: t`The glass is lossless and passive: nothing is drawn from it.`,
        3: t`The wave is **faster** in air ($c$ rather than $c/1.5$). It is the impedance, $E/H$, that makes the same $E$ carry less power in air.`,
      },
      hints: [t`Energy flux is $\tfrac12 E_0^2/Z$, not $E_0^2$ alone.`, t`In air $Z = Z_0$; in glass $Z = Z_0/1.5$. Compare $t^2Z_1/Z_2$ with 1.`],
      teach: 'Amplitude is not energy: the transmitted power is (Z₁/Z₂)t², and with R it always adds up to 1.',
      explain: t`$T = \dfrac{Z_1}{Z_2}t^2 = \dfrac{1}{1.5}(1.2)^2 = 0.96$ and $R = (0.5/2.5)^2 = 0.04$: $R + T = 1$ ✓. A field can be bigger where the medium carries power less effectively per unit field.`,
    }),
    num({
      id: 'ferrite', difficulty: 3,
      gen(r) {
        const er = r.pick([8, 10, 12, 15]), mr = r.pick([2, 3, 5, 6]);
        const Zr = Math.sqrt(mr / er), rr = (Zr - 1) / (Zr + 1), R = rr * rr, n = Math.sqrt(er * mr);
        const naive = ((1 - n) / (1 + n)) ** 2;
        return {
          prompt: t`A ferrite tile for an anechoic chamber has $\varepsilon_r = ${er}$ and $\mu_r = ${mr}$ at the test frequency. What percentage of a radar wave’s power does its front face reflect at normal incidence from air? (Treat it as lossless here.)`,
          visual: interPic(1, n, t`A wave entering the tile from air. $E$ in units of the incident amplitude; the tile’s impedance $Z_0\sqrt{\mu_r/\varepsilon_r}$ sets the amplitudes.`, { Z1: 1, Z2: Zr, names: ['air', 'ferrite'] }),
          answer: R * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: naive * 100, feedback: t`For a magnetic material $r$ is not $(n_1 - n_2)/(n_1 + n_2)$. Use the impedances: $Z = Z_0\sqrt{\mu_r/\varepsilon_r}$.` }, { value: Math.abs(rr) * 100, feedback: t`That is $|r|$; the power goes as $r^2$.` }],
          hints: [t`$r = (Z_2 - Z_1)/(Z_2 + Z_1)$ with $Z_1 = Z_0$ and $Z_2 = Z_0\sqrt{\mu_r/\varepsilon_r}$.`, t`$Z_2/Z_0 = \sqrt{${mr}/${er}} = ${nice(sf(Zr, 3))}$.`],
          teach: 'Reflection is set by impedance, Z = Z₀√(μᵣ/εᵣ); a material with μᵣ = εᵣ is matched to free space whatever its index.',
          explain: t`$Z_2/Z_0 = ${nice(sf(Zr, 3))}$, so $r = ${nice(sf(rr, 3))}$ and $R \approx ${nice(sf(R * 100, 3))}\%$ — far less than the $${nice(sf(naive * 100, 3))}\%$ a non-magnetic material of the same index ($n = ${nice(sf(n, 3))}$) would send back. Real ferrite tiles also absorb strongly, so the little that enters does not come back out.`,
        };
      },
    }),
    num({
      id: 'lam-inside', difficulty: 1,
      gen(r) {
        const [mat, er] = r.pick([['glacier ice', 3.15], ['dry sand', 3], ['concrete', 5], ['fresh water', 80]]);
        const f = r.pick([60, 150, 400]);
        const lam = C / Math.sqrt(er) / (f * 1e6);
        return {
          prompt: t`A ${f} MHz radar wave travels through ${mat} ($\varepsilon_r = ${er}$, non-magnetic). What is its wavelength there, in m?`,
          visual: interPic(1, Math.sqrt(er), t`The wave entering the ${mat} from air: inside, the waves crowd together. Distance in vacuum wavelengths.`, { names: ['air', mat] }),
          answer: lam, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: C / (f * 1e6), feedback: 'That is the wavelength in vacuum. The frequency stays the same in the medium; the speed drops to c/n.' }, { value: C / er / (f * 1e6), feedback: t`$n = \sqrt{\varepsilon_r}$, not $\varepsilon_r$.` }],
          hints: [t`The frequency is the same on both sides; $v = c/n$ with $n = \sqrt{\varepsilon_r}$.`, t`$\lambda = v/f = \dfrac{c}{f\sqrt{\varepsilon_r}}$.`],
          teach: 'Crossing a boundary keeps the frequency and shrinks the wavelength by n.',
          explain: t`$n = ${nice(sf(Math.sqrt(er), 3))}$, $v = ${tex(C / Math.sqrt(er), 3)}$ m/s, $\lambda = v/f \approx ${nice(sf(lam, 3))}$ m. The wavelength sets how fine a layer a radar can resolve.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-depth', difficulty: 2, transfer: true,
      gen(r) {
        const dt = r.pick([8.5, 12, 19.6, 26, 33.4]);
        const d = ((C / Math.sqrt(ER.ice)) * dt * 1e-6) / 2;
        return {
          prompt: t`An ice-penetrating radar flown over Greenland receives the echo from the bed $${dt}$ μs after the echo from the ice surface. How thick is the ice, in m? Take $\varepsilon_r = ${ER.ice}$ for ice.`,
          visual: interPic(1, N.ice, t`The radar wave entering the ice. Distance in vacuum wavelengths; not to scale with the ice sheet.`, { names: ['air', 'ice'] }),
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 2 * d, feedback: 'The delay covers the trip down and back: halve it.' }, { value: (C * dt * 1e-6) / 2, feedback: t`In ice the wave travels at $c/n$, with $n = \sqrt{3.15}$.` }],
          hints: [t`In ice $v = c/\sqrt{\varepsilon_r}$.`, t`Thickness $= v\Delta t/2$.`],
          teach: 'Radar depth sounding: depth = (c/n)Δt/2, with n = √εᵣ.',
          explain: t`$v = c/\sqrt{3.15} \approx ${nice(sf(C / N.ice / 1e6, 4))}$ m/μs, so $d = v\Delta t/2 \approx ${nice(sf(d, 3))}$ m. This is how the thickness of the Greenland and Antarctic ice sheets — nearly 5 km at the deepest, in East Antarctica — has been mapped.`,
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const ew = r.pick([15, 25, 35]), er = r.pick([7, 9]);
        const nI = Math.sqrt(ER.ice), qw = normal(nI, Math.sqrt(ew)), qr = normal(nI, Math.sqrt(er));
        const dB = 10 * Math.log10(qw.R / qr.R);
        return {
          prompt: t`In 2018 the MARSIS radar on Mars Express reported unusually bright echoes from beneath 1.5 km of ice at the Martian south pole. Compare two readings of the base: wet sediment saturated with brine ($\varepsilon_r \approx ${ew}$) or dry basalt ($\varepsilon_r \approx ${er}$), under ice with $\varepsilon_r = ${ER.ice}$. How many dB stronger is the echo from the wet base? Normal incidence; ignore losses.`,
          visual: interPic(N.ice, Math.sqrt(ew), t`The radar wave reaching the base of the ice from above (drawn left to right). $E$ in units of the incident amplitude.`, { names: ['ice', 'base'] }),
          answer: dB, units: 'dB', tol: { rel: 0.02 },
          errors: [{ value: 20 * Math.log10(qw.R / qr.R), feedback: t`$R$ is already a power ratio: decibels are $10\log_{10}$ of it.` }],
          hints: [t`Find $R = r^2$ at each base, with $r = (n_1 - n_2)/(n_1 + n_2)$ and $n = \sqrt{\varepsilon_r}$.`, t`The difference in decibels is $10\log_{10}(R_\text{wet}/R_\text{dry})$.`],
          teach: 'A bright radar echo means a large jump in impedance; water-rich material has a large εᵣ.',
          explain: t`$R_\text{wet} \approx ${nice(sf(qw.R, 3))}$ and $R_\text{dry} \approx ${nice(sf(qr.R, 3))}$, so the wet base is about ${nice(sf(dB, 3))} dB brighter. The real interpretation is contested — clays, salts and the radar’s own geometry can also make bright echoes — but the logic of the argument is this impedance contrast.`,
        };
      },
    }),
    mcq({
      id: 'cp-match', difficulty: 3,
      prompt: t`A material is designed with $\varepsilon_r = \mu_r = 4$ at radar frequencies. Which statement about a radar wave meeting it square-on from air is right?`,
      visual: interPic(1, 4, t`A wave entering a material with $\varepsilon_r = \mu_r = 4$ from air. Lossless, normal incidence.`, { Z1: 1, Z2: 1, names: ['air', 'material'] }),
      choices: [
        t`Nothing is reflected, although inside the wavelength is four times shorter`,
        t`About 36% of the power is reflected, as for any material with $n = 4$`,
        t`Nothing is reflected, and the wavelength inside is unchanged`,
        t`All of it is reflected: equal $\varepsilon_r$ and $\mu_r$ make a perfect mirror`,
      ],
      answer: 0,
      why: {
        1: t`$((1 - 4)/(1 + 4))^2 = 36\%$ is right for a non-magnetic material with $n = 4$; here $\mu_r$ raises $Z$ back to $Z_0$.`,
        2: t`The index is $\sqrt{\varepsilon_r\mu_r} = 4$, so the wave slows to $c/4$ and its wavelength shrinks by 4.`,
        3: t`A perfect mirror needs $Z = 0$ (a perfect conductor). Here $Z = Z_0$, the opposite extreme.`,
      },
      hints: [t`Reflection depends on $Z = Z_0\sqrt{\mu_r/\varepsilon_r}$; the wavelength on $n = \sqrt{\varepsilon_r\mu_r}$.`, 'Compute both for this material.'],
      teach: 'Index and impedance are different numbers: n sets the wavelength, Z sets the reflection.',
      explain: t`$Z = Z_0\sqrt{4/4} = Z_0$, so $r = 0$; but $n = 4$, so the wave slows and its wavelength shrinks fourfold. Matching $\mu_r$ to $\varepsilon_r$ is one route to radar-absorbing materials: let the wave in without an echo, then absorb it.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §9.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Orosei et al., Radar evidence of subglacial liquid water on Mars, Science 361, 490 (2018)', url: 'https://doi.org/10.1126/science.aar7268' },
  ],
});
