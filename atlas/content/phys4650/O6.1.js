// Polarized light and Malus's law (Hecht §8.1–8.2, 8.5). PHYS 2220 O1.3
// did Malus's law, three polarizers and Brewster glare; PHYS 3750 W12.2 did
// the states (linear, circular, elliptical) from Maxwell. This lesson goes on
// to real light, which is usually partly polarized: an analyser turned
// through θ reads I = I_u/2 + I_p cos²(θ − θ_p); the degree of polarization
// P = (I_max − I_min)/(I_max + I_min); N polarizers stepping 90° pass
// cos^{2N}(90°/N); imperfect polarizers (principal transmittances k₁, k₂)
// leak k₁k₂ when crossed. Skylight: single Rayleigh scattering gives
// P = sin²Θ/(1 + cos²Θ) with the field perpendicular to the scattering plane,
// a band of strong polarization 90° from the Sun that animals and sky-compass
// sensors navigate by. Uses op2-jones (chains) and graphs. Transfers: an
// Earth-observation spectrometer's polarization sensitivity, the twilight
// band overhead.
import { lesson, mcq, num } from '../../src/core/content.js';
import { DEG, sf } from './_op.js';

const t = String.raw;

// the worked example: an analyser turned in front of a patch of blue sky 90° from the Sun
const EX = { Imax: 1, Imin: 0.22 };
EX.P = (EX.Imax - EX.Imin) / (EX.Imax + EX.Imin);
EX.Iu = 2 * EX.Imin;
EX.Ip = EX.Imax - EX.Imin;

/** The analyser curve I(θ) for unpolarized Iu plus polarized Ip at angle tp (deg), θ in degrees 0–180. */
const curvePic = (Iu, Ip, tp, caption, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [0, 180], y: [0, sf((Iu / 2 + Ip) * 1.15, 3)], aspect: 'wide', xlabel: 'analyser angle θ (°)', ylabel: 'irradiance', xticks: 6, yticks: 4,
    curves: [{ fn: `${sf(Iu / 2, 5)} + ${sf(Ip, 5)}*cos((x - ${tp})*pi/180)^2`, color: 'gold', width: 2.4 }], ...extra },
});
/** A chain for op2-jones. */
const chainPic = (input, elements, caption, extra = {}) => ({ type: 'op2-jones', params: { input, elements, view: 'chain', readout: false, ...extra }, caption });

/** The sky dome seen from above (zenith at the centre, horizon the circle), the Sun at elevation e (deg) toward +x. */
const skyPic = (e, caption, band = true) => {
  const rs = (90 - e) / 90;     // equidistant projection: radius = zenith angle / 90°
  return {
    type: 'graph', caption,
    params: { x: [-1.6, 1.6], y: [-1.15, 1.15], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      points: [{ x: sf(rs, 4), y: 0, color: 'gold', r: 7, label: 'Sun' }, { x: 0, y: 0, r: 3, color: 'ink2', label: 'zenith', labelDy: 12 }, { x: 0, y: 1.08, r: 0, label: 'N', color: 'ink3', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.1, y: -0.14, r: 0, label: 'W', color: 'ink3', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
      ...(band ? SKYBAND(e) : { curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 }] }) },
  };
};
/** Points of the band 90° from the Sun (elevation e toward azimuth 0), in the equidistant sky projection. */
function SKYBAND(e) {
  // two unit vectors perpendicular to s
  const u = [-Math.sin(e * DEG), 0, Math.cos(e * DEG)], w = [0, 1, 0];
  const pts = [];
  for (let k = 0; k <= 120; k++) {
    const a = (2 * Math.PI * k) / 120, d = [0, 1, 2].map((i) => Math.cos(a) * u[i] + Math.sin(a) * w[i]);
    if (d[2] < 0) { pts.push(null); continue; }
    const z = Math.acos(Math.min(1, d[2])) / (Math.PI / 2), az = Math.atan2(d[1], d[0]);
    pts.push([z * Math.cos(az), z * Math.sin(az)]);
  }
  // as short straight segments
  const curves = [];
  for (let k = 0; k + 1 < pts.length; k++) if (pts[k] && pts[k + 1]) curves.push({ param: [`${sf(pts[k][0], 5)} + t*${sf(pts[k + 1][0] - pts[k][0], 5)}`, `${sf(pts[k][1], 5)} + t*${sf(pts[k + 1][1] - pts[k][1], 5)}`], t: [0, 1], color: 'violet', width: 4 });
  return { curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 }, ...curves] };
}

export default lesson({
  id: 'phys4650.O6.1',
  title: 'Polarized light and Malus’s law',
  minutes: 15, difficulty: 2,
  intro: t`An ideal polarizer passes the component of the field along its axis, so polarized light of irradiance $I_0$ at angle $\theta$ to the axis gets through as $I_0\cos^2\theta$ — Malus’s law ([PHYS 2220](#/lesson/phys2220.O1.3)), while unpolarized light loses half. Most real light is **partly polarized**: skylight, glare, light from the sea. Think of it as an unpolarized part $I_u$ plus a linearly polarized part $I_p$ at angle $\theta_p$. Turn an analyser through $\theta$ and you read

$$I(\theta) = \frac{I_u}{2} + I_p\cos^2(\theta - \theta_p)$$

The fraction that is polarized, the **degree of polarization**, follows from the extremes: $P = \dfrac{I_p}{I_u + I_p} = \dfrac{I_{\max} - I_{\min}}{I_{\max} + I_{\min}}$.`,
  symbols: [
    { tex: 'I_u', text: 'the irradiance of the unpolarized part, in W/m²: an analyser passes half of it at any angle' },
    { tex: 'I_p', text: 'the irradiance of the linearly polarized part, in W/m²' },
    { tex: '\\theta', text: 'the angle of the analyser’s transmission axis' },
    { tex: '\\theta_p', text: 'the direction of the polarized part’s field (the “e-vector”)' },
    { tex: 'P', text: 'the degree of polarization, 0 for unpolarized light and 1 for fully polarized light' },
  ],
  why: t`Sky-polarization compasses, Earth-observation radiometers and every polarizing instrument measure $I_{\max}$, $I_{\min}$ and $\theta_p$ — this equation is how they read the light.`,
  visual: {
    type: 'graph',
    title: 'Turning an analyser',
    lead: t`Partly polarized light (unpolarized part $I_u$, polarized part $I_p$ along $\theta_p$) seen through an analyser turned through $\theta$. The curve never falls to zero unless $I_u = 0$.`,
    tasks: [
      t`Set $I_u = 0$: Malus’s law, $I_p\cos^2(\theta - \theta_p)$, dark at $90^\circ$ from $\theta_p$.`,
      t`Set $I_p = 0$: unpolarized light gives $I_u/2$ at every angle — a polarizer cannot tell it apart from circular light (that needs a wave plate, O6.3).`,
      t`Read $P$ from the curve’s maximum and minimum and compare with the readout.`,
    ],
    params: {
      x: [0, 180], y: [0, 1.6], aspect: 'wide', xlabel: 'analyser angle θ (°)', ylabel: 'irradiance', xticks: 6, yticks: 4,
      sliders: [
        { key: 'Iu', label: 'Unpolarized part $I_u$', min: 0, max: 1.5, step: 0.05, value: 0.6, explain: 'Irradiance of the unpolarized component (arbitrary units).' },
        { key: 'Ip', label: 'Polarized part $I_p$', min: 0, max: 1, step: 0.05, value: 0.6, explain: 'Irradiance of the linearly polarized component.' },
        { key: 'tp', label: 'Its direction $\\theta_p$', min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'The angle of the polarized component’s field.' },
      ],
      curves: [{ fn: 'Iu/2 + Ip*cos((x - tp)*pi/180)^2', color: 'gold', width: 2.4 }],
      hlines: [{ y: 'Iu/2 + Ip', color: 'ink3' }, { y: 'Iu/2', color: 'ink3' }],
      readouts: [{ label: 'degree of polarization $P$', expr: 'Ip/(Iu + Ip + 0.000001)', digits: 3 }],
    },
    caption: t`Ideal analyser. The light is modelled as an unpolarized plus a linearly polarized part; a circular or elliptical part would need a wave plate to reveal it.`,
  },
  example: {
    prompt: t`Pointing a polarizing filter at blue sky 90° from the Sun, you find the brightest reading $I_{\max} = ${EX.Imax}$ (arbitrary units) with the filter’s axis perpendicular to the direction of the Sun, and the dimmest $I_{\min} = ${EX.Imin}$ at 90° to that. Find the degree of polarization and split the light into its unpolarized and polarized parts. What does single Rayleigh scattering predict?`,
    visual: curvePic(EX.Iu, EX.Ip, 90, t`The reading against the filter angle, with $\theta$ measured from the direction of the Sun.`),
    steps: [
      { label: 'Degree of polarization', text: t`$P = \dfrac{I_{\max} - I_{\min}}{I_{\max} + I_{\min}} = \dfrac{${EX.Imax} - ${EX.Imin}}{${EX.Imax} + ${EX.Imin}} = ${sf(EX.P, 3)}$.` },
      { label: 'Split', text: t`At the minimum only half the unpolarized part passes: $I_u/2 = I_{\min}$, so $I_u = ${sf(EX.Iu, 3)}$. The rest of the maximum is polarized: $I_p = I_{\max} - I_{\min} = ${sf(EX.Ip, 3)}$. Check: $I_p/(I_u + I_p) = ${sf(EX.Ip / (EX.Iu + EX.Ip), 3)}$.` },
      { label: 'Direction', text: t`The field of the polarized part lies perpendicular to the plane through the Sun, you and the patch of sky. Scattering molecules are driven by the sunlight’s field, which is transverse to the sunbeam; seen at 90° only the component perpendicular to the scattering plane radiates toward you.` },
      { label: 'Rayleigh’s prediction', text: t`Single scattering at angle $\Theta$ gives $P = \sin^2\Theta/(1 + \cos^2\Theta)$: 1 at $\Theta = 90^\circ$. The real sky reaches about 0.6–0.8: multiple scattering, aerosols, the ground’s reflection and the molecules’ slight anisotropy all add unpolarized light.` },
    ],
    answer: t`$P = ${sf(EX.P, 3)}$: $I_u = ${sf(EX.Iu, 3)}$ unpolarized plus $I_p = ${sf(EX.Ip, 3)}$ polarized perpendicular to the scattering plane; single scattering alone would give $P = 1$.`,
  },
  practice: [
    num({
      id: 'dop', difficulty: 1,
      gen(r) {
        const Imax = r.pick([4, 5, 8, 10]), Imin = r.pick([0.5, 1, 1.5, 2]);
        const P = (Imax - Imin) / (Imax + Imin);
        return {
          prompt: t`An analyser turned in front of a beam reads at most ${Imax} W/m² and at least ${Imin} W/m². What is the beam’s degree of polarization?`,
          visual: curvePic(2 * Imin, Imax - Imin, 40, t`The analyser reading against its angle.`),
          answer: P, tol: { rel: 0.005 },
          errors: [{ value: (Imax - Imin) / Imax, feedback: t`Divide by $I_{\max} + I_{\min}$, the total irradiance.` }, { value: Imin / Imax, feedback: 'That is the ratio of the extremes; P compares their difference with their sum.' }],
          hints: [t`$P = (I_{\max} - I_{\min})/(I_{\max} + I_{\min})$.`],
          teach: t`The degree of polarization is $(I_{\max} - I_{\min})/(I_{\max} + I_{\min})$, read off a turning analyser.`,
          explain: t`$P = (${Imax} - ${Imin})/(${Imax} + ${Imin}) = ${sf(P, 3)}$.`,
        };
      },
    }),
    num({
      id: 'partial-malus', difficulty: 2,
      gen(r) {
        const Iu = r.pick([20, 40, 60]), Ip = r.pick([30, 50, 80]), th = r.pick([25, 40, 60, 75]);
        const I = Iu / 2 + Ip * Math.cos(th * DEG) ** 2;
        return {
          prompt: t`A beam is ${Iu} W/m² of unpolarized light plus ${Ip} W/m² of light polarized vertically. What irradiance passes an ideal analyser whose axis is ${th}° from vertical?`,
          visual: curvePic(Iu, Ip, 0, t`The analyser reading against its angle from vertical; the question’s angle is not marked.`),
          answer: I, units: 'W/m^2', tol: { rel: 0.005 },
          errors: [{ value: (Iu + Ip) * Math.cos(th * DEG) ** 2, feedback: 'Malus’s law applies only to the polarized part; the unpolarized part is halved at any angle.' }, { value: Iu + Ip * Math.cos(th * DEG) ** 2, feedback: 'An analyser passes only half of the unpolarized part.' }],
          hints: [t`Unpolarized part: half passes. Polarized part: $\cos^2\theta$ passes.`],
          teach: t`Partly polarized light through an analyser: $I_u/2 + I_p\cos^2\theta$.`,
          explain: t`$${Iu}/2 + ${Ip}\cos^2${th}^\circ = ${sf(I, 3)}$ W/m².`,
        };
      },
    }),
    num({
      id: 'n-steps', difficulty: 3,
      gen(r) {
        const N = r.pick([2, 3, 5, 10, 20]);
        const f = Math.cos((90 / N) * DEG) ** (2 * N);
        return {
          prompt: t`Vertically polarized light passes ${N} ideal polarizers, the first at $${sf(90 / N, 4)}^\circ$ from vertical and each turned a further $${sf(90 / N, 4)}^\circ$, so that the last is horizontal. What fraction of the light gets through?`,
          visual: chainPic({ angle: 90 }, Array.from({ length: Math.min(N, 4) }, (_, k) => ({ kind: 'pol', angle: 90 - (90 / Math.min(N, 4)) * (k + 1) })), t`Vertically polarized light (angles measured from horizontal here) through ${Math.min(N, 4)} polarizers stepping to horizontal${N > 4 ? ` — ${N} in the problem` : ''}; irradiances under the panels.`, { hide: N > 4 ? ['states', 'intensity'] : ['out', 'intensity'] }),
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: Math.cos((90 / N) * DEG) ** 2, feedback: 'That is one polarizer; each of the N passes the same fraction.' }, { value: 0, feedback: 'Crossed polarizers alone pass nothing; intermediate ones change that.' }],
          hints: [t`Each polarizer passes $\cos^2(90^\circ/${N})$ of what reaches it.`, t`Total: $\cos^{2N}(90^\circ/N)$ with $N = ${N}$.`],
          teach: t`Turning polarization in $N$ small steps loses little: $\cos^{2N}(90^\circ/N) \to 1$ as $N$ grows.`,
          explain: t`$\cos^{${2 * N}}(${sf(90 / N, 4)}^\circ) = ${sf(f, 3)}$. In the limit of many tiny steps all the light is turned, not absorbed — which is what a twisted-nematic liquid crystal or an optically active sugar solution does.`,
        };
      },
    }),
    num({
      id: 'rayleigh-P', difficulty: 2,
      gen(r) {
        const T = r.pick([30, 45, 60, 120, 150]);
        const P = Math.sin(T * DEG) ** 2 / (1 + Math.cos(T * DEG) ** 2);
        return {
          prompt: t`For single Rayleigh scattering of unpolarized sunlight, the degree of polarization at scattering angle $\Theta$ is $P = \sin^2\Theta/(1 + \cos^2\Theta)$. What is $P$ for sky light scattered through ${T}°?`,
          visual: { type: 'graph', params: { x: [0, 180], y: [0, 1.1], aspect: 'wide', xlabel: 'scattering angle Θ (°)', ylabel: 'P', xticks: 6, yticks: 2, curves: [{ fn: 'sin(x*pi/180)^2/(1 + cos(x*pi/180)^2)', color: 'violet', width: 2.4 }] }, caption: t`The single-scattering prediction against scattering angle; real skies peak lower.` },
          answer: P, tol: { rel: 0.005 },
          errors: [{ value: Math.sin(T * DEG) ** 2, feedback: 'Divide by 1 + cos²Θ: the parallel component also scatters, as cos²Θ.' }],
          hints: [t`The perpendicular component scatters equally at all $\Theta$; the parallel one as $\cos^2\Theta$.`, t`$P = (1 - \cos^2\Theta)/(1 + \cos^2\Theta)$.`],
          teach: t`Rayleigh scattering polarizes light most at 90°, where $P = 1$, and not at all straight ahead or back.`,
          explain: t`$P = \sin^2${T}^\circ/(1 + \cos^2${T}^\circ) = ${sf(P, 3)}$.`,
        };
      },
    }),
    num({
      id: 'leak', difficulty: 3,
      gen(r) {
        const k1 = r.pick([0.8, 0.85, 0.9]), k2 = r.pick([1e-3, 5e-4, 2e-4, 1e-5]);
        const cross = k1 * k2, par = (k1 * k1 + k2 * k2) / 2;
        return {
          prompt: t`A real sheet polarizer transmits a fraction $k_1 = ${k1}$ of light polarized along its axis and $k_2 = ${sf(k2 * 1e5, 2)}\times 10^{-5}$ of light polarized across it. Unpolarized light meets two such sheets with crossed axes. What fraction of it gets through? Give the answer in parts per million.`,
          visual: chainPic('unpolarized', [{ kind: 'pol', angle: 0 }, { kind: 'pol', angle: 90 }], t`Unpolarized light through crossed polarizers, drawn ideal (zero output); real sheets leak a little.`, { hide: ['intensity'] }),
          answer: cross * 1e6, tol: { rel: 0.005 },
          errors: [{ value: (cross / 2) * 1e6, feedback: t`Follow both halves of the unpolarized light: the half along sheet 1 passes $k_1$ then $k_2$; the half across it passes $k_2$ then $k_1$. Total $\tfrac12(k_1k_2 + k_2k_1)$.` }, { value: k2 * 1e6, feedback: 'Both sheets contribute: each half of the light meets one k₁ and one k₂.' }],
          hints: [t`Split unpolarized light into two equal halves polarized along each sheet’s axes.`, t`Each half meets $k_1$ at one sheet and $k_2$ at the other: total $\tfrac12 k_1k_2 + \tfrac12 k_2k_1 = k_1k_2$.`],
          teach: t`Crossed real polarizers leak $k_1k_2$; parallel ones pass $\tfrac12(k_1^2 + k_2^2)$ — their ratio is the pair’s extinction ratio.`,
          explain: t`$k_1k_2 = ${sf(cross * 1e6, 3)}$ ppm, against $\tfrac12(k_1^2 + k_2^2) = ${sf(par, 3)}$ for parallel sheets: an extinction ratio of about $${sf(par / cross, 2)}$ to 1. Crystal polarizers (Glan–Taylor) reach $10^5$ to $10^6$.`,
        };
      },
    }),
    mcq({
      id: 'evector', difficulty: 2,
      prompt: t`An insect or a sky-compass sensor looks at a patch of blue sky. Which way is the polarized part of that light’s field (its e-vector)?`,
      visual: skyPic(30, t`The sky seen from below, zenith at the centre and the horizon at the rim, with the Sun 30° above the western horizon. Violet: the band 90° from the Sun, where polarization is strongest. Equidistant projection.`),
      choices: ['Perpendicular to the plane containing the Sun, the observer and the patch of sky.', 'Parallel to the line from the patch toward the Sun.', 'Always vertical.', 'Always horizontal, like glare from water.'],
      answer: 0,
      why: { 1: 'The field driving the scatterers is transverse to the sunbeam; the component in the scattering plane is the one suppressed near 90°.', 2: 'It depends on where the Sun is; overhead at sunset it is horizontal (north–south when the Sun sets due west).', 3: 'Glare is horizontal because the reflecting surface is; skylight follows the scattering geometry.' },
      hints: ['The molecule radiates like a dipole driven by the sunlight’s field, which is perpendicular to the sunbeam.', 'A dipole does not radiate along its own axis: which component cannot reach you at 90°?'],
      teach: 'Skylight’s e-vector is perpendicular to the scattering plane: the pattern points to the Sun even when the Sun is hidden.',
      explain: t`The pattern of e-vectors across the sky is fixed by the Sun’s position, so measuring it in two patches of blue sky finds the Sun behind cloud or below the horizon. Desert ants and bees navigate this way, and sky-polarization compass sensors are being developed for navigation where satellite signals are denied.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eo', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.5, 1, 2, 3]), P = r.pick([0.2, 0.4, 0.6]);
        const err = m * P;
        return {
          prompt: t`An Earth-observation spectrometer’s gratings and mirrors make it slightly polarization-sensitive: its response to fully linearly polarized light varies by $\pm${m}\%$ as the polarization turns. It views ocean glint with degree of polarization ${P}. What is the largest radiometric error this can cause, in percent?`,
          visual: curvePic(1 - P, P, 0, t`How the scene’s light varies with the angle of an ideal analyser; the instrument responds like a weak analyser.`),
          answer: err, units: '%', tol: { rel: 0.01 },
          errors: [{ value: m, feedback: 'Only the polarized fraction of the light is affected: multiply by P.' }, { value: m * (1 - P), feedback: 'It is the polarized part, P, that the instrument responds to unevenly.' }],
          hints: [t`Model the response as $1 + m\cos 2(\theta - \theta_0)$ for polarized light and 1 for unpolarized.`, t`Only the fraction $P$ is polarized: error up to $\pm mP$.`],
          teach: 'A polarization sensitivity m turns a scene polarization P into a radiometric error up to mP.',
          explain: t`$\pm${m}\%\times${P} = \pm${sf(err, 2)}\%$ — ${err >= 0.3 ? 'as large as or larger than' : 'a sizeable share of'} a climate-quality accuracy budget (a few tenths of a percent), which is why such instruments use depolarizers or measure the polarization and correct for it.`,
        };
      },
    }),
    mcq({
      id: 'cp-twilight', difficulty: 2, transfer: true,
      prompt: t`At sunset, with the Sun on the western horizon, where in the sky is the band of strongest polarization, and which way do its e-vectors point at the zenith?`,
      visual: skyPic(0, t`The sky from below at sunset: the Sun on the western horizon (right). Equidistant projection; the band’s position is the question.`, false),
      choices: ['A north–south band through the zenith, 90° from the Sun; at the zenith the e-vector points north–south.', 'Near the Sun, with the e-vector pointing toward it.', 'Along the eastern horizon only, e-vector vertical.', 'Everywhere equally; the e-vector is random at sunset.'],
      answer: 0,
      why: { 1: 'Near the Sun the scattering angle is small, and P is small there.', 2: 'The band is the great circle 90° from the Sun: with the Sun on the horizon it passes through the zenith.', 3: 'Single scattering gives a definite pattern; at sunset it is at its simplest.' },
      hints: ['Strongest polarization is at a scattering angle of 90°.', 'For a patch at the zenith, the scattering plane contains the zenith, you and the Sun (west): the e-vector is perpendicular to it.'],
      teach: 'The polarization band is the great circle 90° from the Sun; at sunset it runs through the zenith from north to south.',
      explain: t`The zenith is 90° from a Sun on the horizon, so it lies in the band. The scattering plane there is east–west and vertical, so the e-vector is horizontal and north–south — a compass needle in the sky at twilight.`,
    }),
    num({
      id: 'cp-find-angle', difficulty: 2,
      gen(r) {
        const Iu = r.pick([10, 20, 30]), Ip = r.pick([40, 60, 80]), frac = r.pick([0.4, 0.5, 0.7]);
        const target = Iu / 2 + frac * Ip, th = Math.acos(Math.sqrt(frac)) / DEG;
        return {
          prompt: t`A beam contains ${Iu} W/m² unpolarized and ${Ip} W/m² polarized horizontally. At what angle from horizontal (between 0° and 90°) must an ideal analyser be set to pass $${sf(target, 4)}$ W/m²?`,
          visual: curvePic(Iu, Ip, 0, t`The analyser reading against its angle from horizontal.`),
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.acos(Math.sqrt(target / (Iu + Ip))) / DEG, feedback: 'Subtract the unpolarized half first; Malus’s law applies to the polarized part only.' }, { value: Math.acos(frac) / DEG, feedback: 'Malus’s law has cos², not cos.' }].filter((e) => Math.abs(e.value - th) > 0.01 * th),
          hints: [t`$${sf(target, 4)} = ${Iu}/2 + ${Ip}\cos^2\theta$.`, t`$\cos^2\theta = ${sf(frac, 3)}$.`],
          teach: 'Invert the analyser curve after removing the unpolarized floor.',
          explain: t`$\cos^2\theta = (${sf(target, 4)} - ${Iu / 2})/${Ip} = ${frac}$, so $\theta = ${sf(th, 3)}^\circ$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §8.1–8.2 and §8.5 (polarizers, Malus’s law, scattering)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'G. Horváth and D. Varjú, Polarized Light in Animal Vision (Springer, 2004)', url: 'https://link.springer.com/book/10.1007/978-3-662-09387-0' },
    { label: 'K. L. Coulson, Polarization and Intensity of Light in the Atmosphere (A. Deepak, 1988)', url: 'https://openlibrary.org/works/OL2041797W' },
  ],
});
