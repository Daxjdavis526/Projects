// Fresnel equations (Griffiths §9.3.3), from the electromagnetic boundary
// conditions. Matching phases along the whole boundary at every instant gives
// the kinematics for any wave: one frequency, θ_R = θ_I, n₁ sin θ_I =
// n₂ sin θ_T. The four field conditions (ε₁E₁⊥ = ε₂E₂⊥, B⊥ continuous, E∥
// continuous, B∥/μ continuous) give the dynamics: for E in the plane of
// incidence (p), E_I + E_R = αE_T and E_I − E_R = βE_T with α = cos θ_T/cos θ_I
// and β = μ₁n₂/μ₂n₁, so r_p = (α − β)/(α + β), t_p = 2/(α + β) (Griffiths's
// sign convention — Hecht's, used in PHYS 4650 and the op-fresnel sim, flips
// r_p); R = r², T = αβt², R + T = 1, α being the change in the beam's
// footprint. Brewster's angle where α = β (tan θ_B = n₂/n₁ for non-magnetic
// media), with θ_B + θ_T = 90°; for s light no zero unless μ₁ ≠ μ₂. The optics
// applications (glare, polarizers, TIR, fibres) belong to PHYS 4650 O3.4.
// Transfers: microwave radiometry of an ice sheet at SMAP's 40° (emissivity
// e = 1 − R, V-pol brighter), a radar's measurement of the lunar regolith's
// permittivity from its Brewster angle.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { DEG, sf, fresnel, brewster } from './_em4b.js';

const t = String.raw;
const ICE = 3.15;   // relative permittivity of glacier ice at microwave frequencies (low loss)

// the worked example: an L-band radiometer looking at a smooth ice sheet at 40° from the vertical
const EX = (() => {
  const n = Math.sqrt(ICE), th = 40 * DEG, f = fresnel(1, n, th);
  return { n, th, f, thB: brewster(1, n) / DEG };
})();

const r4 = (v) => +(+v).toPrecision(4);

/**
 * The boundary-condition picture: a p-polarized wave from medium 1 (top) at
 * angle thDeg meets medium 2 (below). Rays dashed, with E arrows (violet) in
 * Griffiths's convention, sized by amplitude: incident E_I(cos θ, sin θ),
 * reflected E_R(cos θ, −sin θ), transmitted E_T(cos θ_T, sin θ_T) in screen
 * coordinates (y up, medium 1 above).
 */
function bcPic(n1, n2, thDeg, caption, { arrows = true, labels = true } = {}) {
  const th = thDeg * DEG, f = fresnel(n1, n2, th), tt = f.thT;
  const L = 1.35, m = 0.8, s = 0.42;
  const I0 = [-m * Math.sin(th), m * Math.cos(th)], R0 = [m * Math.sin(th), m * Math.cos(th)], T0 = [m * Math.sin(tt), -m * Math.cos(tt)];
  const eI = [Math.cos(th), Math.sin(th)].map((v) => v * s), eR = [Math.cos(th), -Math.sin(th)].map((v) => v * s * f.rp), eT = [Math.cos(tt), Math.sin(tt)].map((v) => v * s * f.tp);
  const arr = (c, v, label) => ({ from: [r4(c[0] - v[0]), r4(c[1] - v[1])], to: [r4(c[0] + v[0]), r4(c[1] + v[1])], color: 'violet', width: 2.4, ...(labels && label ? { label } : {}) });
  return {
    type: 'graph',
    params: {
      x: [-2, 2], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: '-1.5', from: -2.5, to: 2.5, color: 'teal', alpha: Math.min(0.32, 0.05 + 0.06 * n2) }, ...(n1 > 1.01 ? [{ fn: '1.5', lower: '0', from: -2.5, to: 2.5, color: 'teal', alpha: Math.min(0.32, 0.05 + 0.06 * n1) }] : [])],
      curves: [
        { fn: '0', domain: [-2.5, 2.5], color: 'ink3', width: 1.5 },
        { param: ['0', 't'], t: [-1.4, 1.4], color: 'ink4', dash: [4, 4], width: 1 },
        { param: [`${r4(-L * Math.sin(th))}*(1 - t)`, `${r4(L * Math.cos(th))}*(1 - t)`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
        { param: [`${r4(L * Math.sin(th))}*t`, `${r4(L * Math.cos(th))}*t`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
        { param: [`${r4(L * Math.sin(tt))}*t`, `${r4(-L * Math.cos(tt))}*t`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
      ],
      arrows: arrows ? [arr(I0, eI, 'Eᵢ'), ...(Math.abs(f.rp) > 0.02 ? [arr(R0, eR, 'Eᵣ')] : []), arr(T0, eT, 'Eₜ')] : [],
      points: [
        { x: -1.95, y: 1.3, r: 0, label: `n₁ = ${n1}`, color: 'ink2' },
        { x: -1.95, y: -1.3, r: 0, label: `n₂ = ${nice(sf(n2, 3))}`, color: 'ink2' },
        { x: r4(-0.3 * Math.sin(th / 2)), y: r4(0.42 * Math.cos(th / 2)), r: 0, label: 'θ', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      ],
    },
    caption,
  };
}

/** The R(θ) curves for s and p from the op-fresnel simulation (power view), with marks optionally hidden. */
const powerPic = (n1, n2, angle, caption, hide = []) => ({ type: 'op-fresnel', params: { view: 'coeffs', n1, n2, angle, show: 'power', trans: false, controls: false, readout: false, hide, sketch: false }, caption });

// expressions for the Explore graph (n₁ = 1, sliders th in degrees and n2)
const TH = 'th*pi/180', TT = `asin(sin(${TH})/n2)`, AL = `(cos(${TT})/cos(${TH}))`;
const RP = `((${AL} - n2)/(${AL} + n2))`, TP = `(2/(${AL} + n2))`;
const S = 0.42;

export default lesson({
  id: 'phys4600.M3.3',
  title: 'Fresnel equations',
  minutes: 18, difficulty: 4,
  equation: t`\begin{gathered}\frac{E_R}{E_I} = \frac{\alpha - \beta}{\alpha + \beta},\quad \frac{E_T}{E_I} = \frac{2}{\alpha + \beta}, \\ \alpha = \frac{\cos\theta_T}{\cos\theta_I},\quad \beta = \frac{\mu_1n_2}{\mu_2n_1}\end{gathered}`,
  intro: t`A wave strikes a flat boundary at an angle. Two separate demands decide what happens. First, the incident, reflected and transmitted waves must keep in step **all along the boundary at every instant** — that fixes their frequency and directions: $\theta_R = \theta_I$ and Snell’s law $n_1\sin\theta_I = n_2\sin\theta_T$, for waves of any kind. Second, the fields must satisfy the four boundary conditions of [M1.5](#/lesson/phys4600.M1.5): normal $\varepsilon E$ and normal $B$ continuous, tangential $E$ and tangential $B/\mu$ continuous. That fixes the amplitudes. For $\vec E$ in the plane of incidence (**p**-polarization) the result is the pair of Fresnel equations above. They contain [M3.2](#/lesson/phys4600.M3.2)’s normal-incidence result as $\theta \to 0$, and something new: an angle, **Brewster’s angle**, at which the reflected p-wave vanishes entirely.`,
  symbols: [
    { tex: 'E_I,\\ E_R,\\ E_T', text: t`the amplitudes of the incident, reflected and transmitted electric fields, in V/m, with the reflected arrow drawn as in Griffiths’s Fig. 9.15` },
    { tex: '\\theta_I,\\ \\theta_T', text: 'the angles of incidence and transmission (refraction), measured from the normal to the boundary' },
    { tex: '\\alpha', text: t`$\cos\theta_T/\cos\theta_I$: how the beam’s footprint on the boundary stretches or squeezes in passing through` },
    { tex: '\\beta', text: t`$\mu_1n_2/\mu_2n_1 = Z_1/Z_2$, the ratio of the impedances; $n_2/n_1$ for non-magnetic media` },
    { tex: 'n_1,\\ n_2', text: 'the refractive indices of the two media' },
    { tex: '\\mu_1,\\ \\mu_2', text: t`their permeabilities ($\mu_0$ for nearly every material)` },
  ],
  why: t`Every polarimetric radar, every microwave radiometer measuring soil moisture or sea ice from orbit, and every polarizing filter works because reflection depends on polarization — and the boundary conditions say exactly how.`,
  visual: {
    type: 'graph',
    title: 'The boundary conditions, checked live',
    lead: t`A p-polarized wave (its $\vec E$, violet, in the plane of the page) comes down from the upper left onto a dielectric. The arrows are drawn to scale with the Fresnel amplitudes. The readouts add up the field components on each side of the boundary: tangential $E$ and normal $\varepsilon E$ match for every angle. That matching is what the Fresnel equations are.`,
    tasks: [
      t`Sweep $\theta$: the two numbers in each pair always agree. The reflected arrow shrinks, vanishes, then reappears pointing the other way.`,
      t`Find where the reflected arrow vanishes. Compare $\tan\theta$ there with $n_2$ — and look at the angle between the reflected and transmitted rays.`,
      t`Check $R + T = 1$ at a few angles; $T$ needs the factor $\alpha\beta$, not just $t^2$.`,
    ],
    params: {
      x: [-2, 2], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'th', label: t`Angle of incidence $\theta_I$`, min: 0, max: 85, step: 1, value: 30, unit: '^\\circ', explain: 'Measured from the normal (dashed).' },
        { key: 'n2', label: t`Index of medium 2, $n_2$`, min: 1.1, max: 3, step: 0.05, value: 1.5, explain: t`Medium 1 is vacuum ($n_1 = 1$); both are non-magnetic. Ice is 1.77 at microwave frequencies, glass about 1.5 for light.` },
      ],
      shade: [{ fn: '0', lower: '-1.5', from: -2.5, to: 2.5, color: 'teal', alpha: 0.18 }],
      curves: [
        { fn: '0', domain: [-2.5, 2.5], color: 'ink3', width: 1.5 },
        { param: ['0', 't'], t: [-1.4, 1.4], color: 'ink4', dash: [4, 4], width: 1 },
        { param: [`-1.35*sin(${TH})*(1 - t)`, `1.35*cos(${TH})*(1 - t)`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
        { param: [`1.35*sin(${TH})*t`, `1.35*cos(${TH})*t`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
        { param: [`1.35*sin(${TT})*t`, `-1.35*cos(${TT})*t`], t: [0, 1], color: 'gold', dash: [6, 4], width: 1.6 },
      ],
      arrows: [
        { from: [`-0.8*sin(${TH}) - ${S}*cos(${TH})`, `0.8*cos(${TH}) - ${S}*sin(${TH})`], to: [`-0.8*sin(${TH}) + ${S}*cos(${TH})`, `0.8*cos(${TH}) + ${S}*sin(${TH})`], color: 'violet', width: 2.4, label: 'Eᵢ' },
        { from: [`0.8*sin(${TH}) - ${S}*${RP}*cos(${TH})`, `0.8*cos(${TH}) + ${S}*${RP}*sin(${TH})`], to: [`0.8*sin(${TH}) + ${S}*${RP}*cos(${TH})`, `0.8*cos(${TH}) - ${S}*${RP}*sin(${TH})`], color: 'violet', width: 2.4, label: 'Eᵣ' },
        { from: [`0.8*sin(${TT}) - ${S}*${TP}*cos(${TT})`, `-0.8*cos(${TT}) - ${S}*${TP}*sin(${TT})`], to: [`0.8*sin(${TT}) + ${S}*${TP}*cos(${TT})`, `-0.8*cos(${TT}) + ${S}*${TP}*sin(${TT})`], color: 'violet', width: 2.4, label: 'Eₜ' },
      ],
      points: [{ x: -1.95, y: 1.3, r: 0, label: 'vacuum', color: 'ink2' }, { x: -1.95, y: -1.3, r: 0, label: 'medium 2', color: 'ink2' }],
      readouts: [
        { label: t`$\theta_T$`, expr: `${TT}*180/pi`, unit: '^\\circ', digits: 3 },
        { label: t`$r_p = E_R/E_I$`, expr: RP, digits: 3, zero: 1e-6 },
        { label: t`$E_\parallel$ above: $(E_I + E_R)\cos\theta_I$`, expr: `(1 + ${RP})*cos(${TH})`, digits: 4 },
        { label: t`below: $E_T\cos\theta_T$`, expr: `${TP}*cos(${TT})`, digits: 4 },
        { label: t`$\varepsilon E_\perp$ above: $\varepsilon_1(E_I - E_R)\sin\theta_I$`, expr: `(1 - ${RP})*sin(${TH})`, digits: 4, zero: 1e-9 },
        { label: t`below: $\varepsilon_2E_T\sin\theta_T$`, expr: `n2^2*${TP}*sin(${TT})`, digits: 4, zero: 1e-9 },
        { label: t`$R + T = r_p^2 + \alpha\beta t_p^2$`, expr: `${RP}^2 + ${AL}*n2*${TP}^2`, digits: 4 },
      ],
    },
    caption: t`Fields in units of the incident amplitude, with $\varepsilon$ in units of $\varepsilon_0$; arrows are amplitudes at one instant, drawn on their rays. Lossless, non-magnetic media; a flat boundary; Griffiths’s sign convention for $E_R$ (Hecht’s, used in PHYS 4650, draws it the other way).`,
  },
  example: {
    prompt: t`A satellite microwave radiometer looks at a smooth ice sheet ($\varepsilon_r = ${ICE}$, non-magnetic, negligible loss) at $40^\circ$ from the vertical. What fraction of the power reflects for p-polarization (E in the plane of incidence, “vertical” to radiometrists) and for s-polarization (“horizontal”)? Where is Brewster’s angle?`,
    visual: bcPic(1, EX.n, 40, t`A p-polarized wave meeting ice at $40^\circ$, with the field amplitudes to scale. Griffiths’s sign convention; flat, lossless boundary.`),
    steps: [
      { label: 'Kinematics', text: t`$n_2 = \sqrt{${ICE}} = ${nice(sf(EX.n, 4))}$. Snell: $\sin\theta_T = \sin 40^\circ/${nice(sf(EX.n, 4))}$, so $\theta_T = ${nice(sf(EX.f.thT / DEG, 4))}^\circ$. This step uses no electromagnetism at all — only that the phases match along the boundary.` },
      { label: 'Alpha and beta', text: t`$\alpha = \cos\theta_T/\cos\theta_I = ${nice(sf(EX.f.a, 4))}$ and $\beta = n_2/n_1 = ${nice(sf(EX.f.b, 4))}$.` },
      { label: 'p-polarization', text: t`$r_p = \dfrac{\alpha - \beta}{\alpha + \beta} = ${nice(sf(EX.f.rp, 3))}$, so $R_p = r_p^2 \approx ${nice(sf(EX.f.Rp * 100, 3))}\%$; $t_p = 2/(\alpha + \beta) = ${nice(sf(EX.f.tp, 3))}$ and $T_p = \alpha\beta t_p^2 \approx ${nice(sf(EX.f.Tp * 100, 3))}\%$. They add to 100% ✓.` },
      { label: 's-polarization', text: t`The same boundary conditions with $\vec E$ along the boundary give $r_s = \dfrac{n_1\cos\theta_I - n_2\cos\theta_T}{n_1\cos\theta_I + n_2\cos\theta_T} = ${nice(sf(EX.f.rs, 3))}$, so $R_s \approx ${nice(sf(EX.f.Rs * 100, 3))}\%$ — about ${nice(sf(EX.f.Rs / EX.f.Rp, 2))} times $R_p$.` },
      { label: 'Brewster', text: t`$r_p = 0$ when $\alpha = \beta$, which for non-magnetic media means $\tan\theta_B = n_2/n_1$: $\theta_B = ${nice(sf(EX.thB, 3))}^\circ$. At that angle the reflected and transmitted rays are exactly $90^\circ$ apart.` },
      { label: 'Sense check', text: t`At $40^\circ$ we are on the way toward $\theta_B$, so $R_p < R_s$ ✓. A smooth surface emits what it does not reflect (Kirchhoff), so the ice glows brighter in p than in s: emissivities $1 - R \approx ${nice(sf(1 - EX.f.Rp, 3))}$ and $${nice(sf(1 - EX.f.Rs, 3))}$. NASA’s SMAP radiometer looks at Earth at this very angle and reads soil moisture and ice from the two.` },
    ],
    answer: t`$R_p \approx ${nice(sf(EX.f.Rp * 100, 2))}\%$, $R_s \approx ${nice(sf(EX.f.Rs * 100, 3))}\%$; Brewster’s angle is $${nice(sf(EX.thB, 3))}^\circ$.`,
  },
  practice: [
    mcq({
      id: 'kinematics', difficulty: 2,
      prompt: t`Why must the reflected wave leave at the same angle as the incident wave arrives, and the transmitted one obey Snell’s law?`,
      visual: bcPic(1, 1.5, 35, t`Incident, reflected and transmitted rays (dashed gold) at a flat boundary.`, { arrows: false }),
      choices: [
        t`All three waves must match at every point of the boundary at every instant, so their phases must vary along it at the same rate: equal frequencies and equal $k\sin\theta$`,
        'Energy conservation forces the angles',
        t`The boundary condition on tangential $\vec E$ alone forces them`,
        'They are experimental facts that the electromagnetic theory takes as given',
      ],
      answer: 0,
      why: {
        1: t`Energy conservation fixes how the power divides ($R + T = 1$), not the directions.`,
        2: t`Any of the four conditions would do: each must hold all along the boundary, and that alone — not the content of the condition — forces the phases to match. The angles would be the same for sound or water waves.`,
        3: t`They follow from the wave picture: a boundary condition that holds everywhere along a flat boundary at all times forces them.`,
      },
      hints: [t`Each wave varies along the boundary as $e^{i(k_x x - \omega t)}$. What must be true of $k_x$ and $\omega$ for a sum of them to obey one equation at every $x$ and $t$?`, t`$k_x = k\sin\theta$, and $k = n\omega/c$.`],
      teach: 'The laws of reflection and refraction are kinematics: phase matching along the boundary. The Fresnel amplitudes are the dynamics.',
      explain: t`Matching at every $x$ and $t$ forces equal $\omega$ and equal $k_x$. Then $k_1\sin\theta_I = k_1\sin\theta_R = k_2\sin\theta_T$, which is $\theta_R = \theta_I$ and $n_1\sin\theta_I = n_2\sin\theta_T$. Only the amplitudes need the electromagnetic boundary conditions.`,
    }),
    order({
      id: 'derive-p', difficulty: 3,
      prompt: t`Put the derivation of the Fresnel equations for p-polarization in order.`,
      visual: bcPic(1, 1.5, 35, t`The three fields of a p-polarized wave at the boundary, drawn as in Griffiths’s Fig. 9.15.`),
      items: [
        t`Write the three plane waves with $\vec E$ in the plane of incidence, and use phase matching to drop the exponentials at the boundary.`,
        t`Tangential $\vec E$ continuous: $(E_I + E_R)\cos\theta_I = E_T\cos\theta_T$, so $E_I + E_R = \alpha E_T$.`,
        t`Tangential $\vec B/\mu$ continuous, with $B = E/v$: $(E_I - E_R)/\mu_1v_1 = E_T/\mu_2v_2$, so $E_I - E_R = \beta E_T$.`,
        t`Add and subtract: $E_T = \dfrac{2}{\alpha + \beta}E_I$ and $E_R = \dfrac{\alpha - \beta}{\alpha + \beta}E_I$.`,
        t`Check: normal $\varepsilon E$ gives nothing new once Snell’s law holds, and $r^2 + \alpha\beta t^2 = 1$.`,
      ],
      hints: ['Kinematics first, then the boundary conditions, then the algebra, then the checks.', t`Only two of the four conditions are independent for p light: tangential $\vec E$ and tangential $\vec H$.`],
      teach: 'Two independent boundary conditions — tangential E and tangential H — fix the two unknown amplitudes.',
      explain: t`The other two conditions are not independent: normal $B$ vanishes for p light, and normal $\varepsilon E$ reproduces the tangential-$H$ condition once Snell’s law is used. That redundancy is a good check on the algebra.`,
    }),
    num({
      id: 'rp-num', difficulty: 2,
      gen(r) {
        const er = r.pick([2.25, 3.15, 4, 6.25]), th = r.pick([20, 30, 45, 70, 80]);
        const n = Math.sqrt(er), f = fresnel(1, n, th * DEG);
        return {
          prompt: t`A p-polarized wave in vacuum meets a flat non-magnetic dielectric with $\varepsilon_r = ${er}$ at $${th}^\circ$ from the normal. What percentage of its power is reflected?`,
          visual: bcPic(1, n, th, t`The p-polarized wave at the boundary, with the reflected arrow hidden. Flat, lossless boundary.`, { arrows: false }),
          answer: f.Rp * 100, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: f.Rs * 100, feedback: t`That is $R_s$, for $\vec E$ perpendicular to the plane of incidence. For p use $r_p = (\alpha - \beta)/(\alpha + \beta)$.` },
            { value: (((1 - n) / (1 + n)) ** 2) * 100, feedback: t`That is the normal-incidence value. At an angle, $\alpha = \cos\theta_T/\cos\theta_I$ is no longer 1.` },
          ].filter((e) => Math.abs(e.value - f.Rp * 100) > 0.03 * f.Rp * 100 + 0.05),
          hints: [t`$n_2 = \sqrt{\varepsilon_r}$; find $\theta_T$ from Snell’s law.`, t`$\alpha = \cos\theta_T/\cos\theta_I$, $\beta = n_2$, $R_p = \left(\dfrac{\alpha - \beta}{\alpha + \beta}\right)^2$.`],
          teach: t`For p light, $R_p = \left(\frac{\alpha - \beta}{\alpha + \beta}\right)^2$ with $\alpha = \cos\theta_T/\cos\theta_I$ and $\beta = n_2/n_1$.`,
          explain: t`$n_2 = ${nice(sf(n, 3))}$, $\theta_T = ${nice(sf(f.thT / DEG, 3))}^\circ$, $\alpha = ${nice(sf(f.a, 3))}$, $\beta = ${nice(sf(f.b, 3))}$: $r_p = ${nice(sf(f.rp, 3))}$, $R_p \approx ${nice(sf(f.Rp * 100, 3))}\%$${th > brewster(1, n) / DEG ? t` — past Brewster’s angle ($${nice(sf(brewster(1, n) / DEG, 3))}^\circ$), so $r_p$ has changed sign` : ''}.`,
        };
      },
    }),
    num({
      id: 'tp-power', difficulty: 3,
      gen(r) {
        const n = r.pick([1.5, 1.77, 2.4]), th = r.pick([30, 50, 70]);
        const f = fresnel(1, n, th * DEG);
        return {
          prompt: t`A p-polarized wave goes from vacuum into a dielectric with $n = ${n}$ at $${th}^\circ$. Its transmitted amplitude is $t_p = E_T/E_I = ${nice(sf(f.tp, 4))}$. What percentage of the incident **power** is transmitted?`,
          visual: bcPic(1, n, th, t`The fields at the boundary, to scale. Note how the transmitted beam’s footprint on the boundary compares with the incident one.`),
          answer: f.Tp * 100, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: f.tp * f.tp * 100, feedback: t`Power is not just $t^2$: the intensity in medium 2 carries a factor $n_2/n_1$ (that is $\beta$), and the beam’s cross-section changes by $\alpha = \cos\theta_T/\cos\theta_I$.` },
            { value: f.b * f.tp * f.tp * 100, feedback: t`You included $\beta$ for the intensity but not $\alpha$ for the change in the beam’s cross-section.` },
          ],
          hints: [t`Intensity is $\tfrac12\varepsilon vE^2$, and the power crossing a patch of boundary is intensity times $\cos\theta$.`, t`$T = \alpha\beta t_p^2$ with $\alpha = \cos\theta_T/\cos\theta_I$ and $\beta = n_2/n_1$.`],
          teach: 'Transmitted power is αβt², not t²: the factor accounts for the new medium’s intensity per field and the beam’s new width.',
          explain: t`$\theta_T = ${nice(sf(f.thT / DEG, 3))}^\circ$, $\alpha = ${nice(sf(f.a, 3))}$, $\beta = ${n}$: $T_p = \alpha\beta t_p^2 \approx ${nice(sf(f.Tp * 100, 3))}\%$, and $R_p = r_p^2 \approx ${nice(sf(f.Rp * 100, 3))}\%$ makes up the rest ✓.`,
        };
      },
    }),
    num({
      id: 'brewster', difficulty: 2,
      gen(r) {
        const [mat, er] = r.pick([['dry sand', 3], ['glacier ice', 3.15], ['concrete', 5], ['lunar regolith', 2.7], ['fused silica', 3.8]]);
        const thB = brewster(1, Math.sqrt(er)) / DEG;
        return {
          prompt: t`At what angle of incidence does a radar wave polarized in the plane of incidence reflect not at all from flat ${mat} ($\varepsilon_r \approx ${er}$, non-magnetic)? Give it in degrees from the normal.`,
          visual: powerPic(1, Math.sqrt(er), 30, t`Reflected power against angle for $\vec E$ perpendicular to (s) and in (p) the plane of incidence. Brewster’s mark is hidden.`, ['brewster']),
          answer: thB, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.atan(er) / DEG, feedback: t`Use the index, $n = \sqrt{\varepsilon_r}$, not $\varepsilon_r$.` }, { value: 90 - thB, feedback: t`That is the refraction angle at Brewster incidence; $\tan\theta_B = n_2/n_1$ measures from the normal.` }],
          hints: [t`$r_p = 0$ when $\alpha = \beta$.`, t`For non-magnetic media that gives $\tan\theta_B = n_2/n_1$, with $n_2 = \sqrt{\varepsilon_r}$.`],
          teach: t`Brewster’s angle: $\tan\theta_B = n_2/n_1$ for non-magnetic media; there the p reflection vanishes.`,
          explain: t`$\theta_B = \arctan\sqrt{${er}} \approx ${nice(sf(thB, 3))}^\circ$. At this angle a surface reflects only the s component: unpolarized radiation comes back polarized.`,
        };
      },
    }),
    mcq({
      id: 's-zero', difficulty: 3,
      prompt: t`For $\vec E$ perpendicular to the plane of incidence (s-polarization), is there an angle at which nothing is reflected from a non-magnetic dielectric?`,
      visual: powerPic(1, 1.77, 60, t`Reflected power for s and p against the angle of incidence, from vacuum into $n = 1.77$.`),
      choices: [
        t`No: $r_s = 0$ would need $n_1\cos\theta_I = n_2\cos\theta_T$, which with Snell’s law forces $n_1 = n_2$. A magnetic medium ($\mu_1 \ne \mu_2$) could have one`,
        t`Yes, at the same Brewster angle as p light`,
        t`Yes, at the critical angle`,
        t`No, because s light is always totally reflected`,
      ],
      answer: 0,
      why: {
        1: t`The s curve never touches zero. The p zero comes from $\alpha = \beta$; the s condition is a different equation with no solution for non-magnetic media.`,
        2: t`There is no critical angle going from vacuum into a denser medium, and at a critical angle reflection is total, not zero.`,
        3: t`At normal incidence $R_s$ is only a few percent; it climbs to 1 only at grazing incidence.`,
      },
      hints: ['Look at the s curve: does it ever reach zero?', t`Square $n_1\cos\theta_I = n_2\cos\theta_T$ and use $n_2^2\sin^2\theta_T = n_1^2\sin^2\theta_I$: add the two equations.`],
      teach: 'Only p light has a Brewster angle between ordinary dielectrics; with magnetic media the roles of ε and μ allow an s zero too.',
      explain: t`Squaring gives $n_1^2\cos^2\theta_I = n_2^2\cos^2\theta_T$; adding $n_1^2\sin^2\theta_I = n_2^2\sin^2\theta_T$ gives $n_1^2 = n_2^2$. With $\mu_1 \ne \mu_2$ the s condition becomes $\cos\theta_I/Z_1 = \cos\theta_T/Z_2$, which can be met — the electric and magnetic sides of the problem trade places.`,
    }),
    mcq({
      id: 'convention', difficulty: 2,
      prompt: t`At normal incidence on glass, Griffiths’s formula gives $r_p = (\alpha - \beta)/(\alpha + \beta) = -0.2$, the same as $r_s$. An optics book gives $r_p = +0.2$ there, opposite to its $r_s$. Which is right?`,
      visual: { type: 'op-fresnel', params: { view: 'coeffs', n1: 1, n2: 1.5, angle: 0, show: 'amplitude', trans: false, controls: false, readout: false, sketch: false }, caption: t`Amplitude coefficients in Hecht’s convention (the op-fresnel simulation): $r_p$ and $r_s$ start with opposite signs.` },
      choices: [
        t`Both: they draw the reflected p-wave’s $\vec E$ arrow in opposite directions, so the same field has opposite signs`,
        t`Griffiths: at normal incidence s and p are the same physics, so the optics book has a sign error`,
        t`The optics book: reflection from a denser medium always gives a positive $r_p$`,
        t`Neither: at normal incidence the p and s waves cannot be told apart, so $r_p$ is undefined`,
      ],
      answer: 0,
      why: {
        1: t`Both books are internally consistent: each defines the positive direction of $\vec E_R$ for p light differently. The physical field is the same.`,
        2: t`The sign of $r_p$ depends on which way you choose to draw $\vec E_R$. Physically, at normal incidence the reflected field is flipped either way.`,
        3: t`The coefficient has a value as $\theta \to 0$; only its sign depends on the convention for the reflected arrow.`,
      },
      hints: [t`A coefficient is a ratio of field components along chosen directions. Who chooses the direction of the reflected $\vec E$ arrow?`, t`At normal incidence an s field and a p field are both just a field along the boundary — physically the same.`],
      teach: t`The sign of $r_p$ is a convention about how the reflected p arrow is drawn; $R = r^2$ and every physical prediction agree.`,
      explain: t`Griffiths draws $\vec E_R$ so that $r_p \to r_s$ at normal incidence; Hecht draws it so that $\vec E$, $\vec B$ and $\vec k$ keep the same handedness picture for all three waves, which flips $r_p$. Powers, Brewster’s angle and the reflected field itself are identical. Check a book’s figure before comparing signs.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-emiss', difficulty: 3, transfer: true,
      gen(r) {
        const [mat, er] = r.pick([['dry sandy soil', 3], ['moist soil', 10], ['first-year sea ice', 4], ['a smooth ice sheet', 3.15]]);
        const th = r.pick([40, 50, 55]);
        const f = fresnel(1, Math.sqrt(er), th * DEG), e = 1 - f.Rp;
        return {
          prompt: t`A spaceborne microwave radiometer views ${mat} ($\varepsilon_r \approx ${er}$, treated as smooth and lossless at the surface) at $${th}^\circ$ from the vertical. A smooth surface emits what it does not reflect: its emissivity is $e = 1 - R$. What is the emissivity for p-polarization (the radiometrist’s “vertical”)?`,
          visual: powerPic(1, Math.sqrt(er), th, t`Reflected power for s and p against angle at this surface; the gold line is the viewing angle.`, ['brewster']),
          answer: e, tol: { rel: 0.002, abs: 0.001 },
          errors: [{ value: 1 - f.Rs, feedback: t`That is the s (“horizontal”) emissivity. For p use $r_p = (\alpha - \beta)/(\alpha + \beta)$.` }, { value: f.Rp, feedback: t`That is the reflectivity $R_p$; the emissivity is $1 - R_p$.` }],
          hints: [t`Find $\theta_T$, then $\alpha = \cos\theta_T/\cos\theta_I$ and $\beta = \sqrt{\varepsilon_r}$.`, t`$R_p = \left(\dfrac{\alpha - \beta}{\alpha + \beta}\right)^2$ and $e = 1 - R_p$.`],
          teach: 'Kirchhoff: a smooth surface’s emissivity is 1 − R, so polarization-dependent reflection makes polarization-dependent brightness.',
          explain: t`$\theta_T = ${nice(sf(f.thT / DEG, 3))}^\circ$, $\alpha = ${nice(sf(f.a, 3))}$, $\beta = ${nice(sf(f.b, 3))}$, $R_p \approx ${nice(sf(f.Rp, 3))}$, so $e_p \approx ${nice(sf(e, 4))}$ (against $e_s \approx ${nice(sf(1 - f.Rs, 3))}$). Wetter soil has a larger $\varepsilon_r$, reflects more and glows less: that difference is how SMAP maps soil moisture.`,
        };
      },
    }),
    num({
      id: 'cp-regolith', difficulty: 3, transfer: true,
      gen(r) {
        const thB = r.pick([57.5, 58.5, 60, 61.5]);
        const er = Math.tan(thB * DEG) ** 2;
        return {
          prompt: t`A polarimetric radar studying the lunar surface finds that its p-polarized echo from smooth, flat areas vanishes at $${thB}^\circ$ from the normal. Treating the regolith as non-magnetic and lossless, what is its relative permittivity?`,
          visual: powerPic(1, Math.sqrt(er), 40, t`Reflected power for s and p against the angle of incidence for such a surface. Brewster’s mark is hidden.`, ['brewster']),
          answer: er, tol: { rel: 0.01 },
          errors: [{ value: Math.tan(thB * DEG), feedback: t`$\tan\theta_B$ gives the index $n$; the permittivity is $\varepsilon_r = n^2$.` }],
          hints: [t`At Brewster’s angle $\tan\theta_B = n_2/n_1$ with $n_1 = 1$.`, t`$\varepsilon_r = n^2 = \tan^2\theta_B$.`],
          teach: 'Measuring Brewster’s angle measures the index — a remote probe of what a surface is made of.',
          explain: t`$n = \tan ${thB}^\circ \approx ${nice(sf(Math.tan(thB * DEG), 3))}$, so $\varepsilon_r \approx ${nice(sf(er, 3))}$. Lunar regolith measures about 2.7 at radar wavelengths; its permittivity tracks its density, so such numbers say how loosely packed the surface is.`,
        };
      },
    }),
    mcq({
      id: 'cp-why', difficulty: 3,
      prompt: t`At Brewster’s angle the reflected and transmitted rays are exactly $90^\circ$ apart. Which picture explains why p-polarized light then has no reflection?`,
      visual: bcPic(1, 1.5, brewster(1, 1.5) / DEG, t`A p-polarized wave at Brewster’s angle: the reflected arrow has vanished, and the transmitted field lies along the direction the reflection would take. Glass-like $n_2 = 1.5$.`),
      choices: [
        t`The reflected wave is radiated by the electrons of medium 2, driven along the transmitted $\vec E$; at Brewster’s angle that direction lies along the would-be reflected ray, and a dipole does not radiate along its own axis`,
        'At Brewster’s angle the transmitted wave carries all the energy, so there is none left over for reflection',
        'The incident wave grazes the surface and cannot interact with it',
        'Reflected and transmitted waves interfere destructively in medium 1',
      ],
      answer: 0,
      why: {
        1: t`True ($R + T = 1$ with $R = 0$), but it restates the result instead of explaining it: why should energy go one way at exactly this angle?`,
        2: t`Brewster’s angle is far from grazing ($56^\circ$ for glass), and s light reflects there perfectly well.`,
        3: t`The transmitted wave lives in medium 2; it cannot interfere with anything in medium 1.`,
      },
      hints: [t`What drives the electrons just inside medium 2, and in which direction do they oscillate?`, 'An oscillating dipole radiates in a doughnut: strongest sideways, nothing along its axis.'],
      teach: 'Brewster’s angle is dipole radiation: the driven electrons cannot radiate along their own axis.',
      explain: t`The electrons in medium 2 oscillate along the transmitted $\vec E$, perpendicular to the transmitted ray. When $\theta_B + \theta_T = 90^\circ$, that oscillation points straight along the reflected direction, and a dipole sends nothing along its axis (the $\sin^2$ pattern of [M5.1](#/lesson/phys4600.M5.1)). For s light the electrons oscillate perpendicular to the page, which always radiates into the reflected direction.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §9.3.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Entekhabi et al., The Soil Moisture Active Passive (SMAP) mission, Proc. IEEE 98, 704 (2010)', url: 'https://doi.org/10.1109/JPROC.2010.2043918' },
  ],
});
