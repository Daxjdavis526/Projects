// Reflection and refraction from the wave picture (Hecht §4.3–4.4, §4.6.1).
// Snell's law came from least time in PHYS 3550 M3.4 and from Fermat in O3.2;
// here it comes from waves: Huygens's wavelets, and — the argument that also
// gives the Fresnel equations — phase matching. The boundary conditions must
// hold everywhere on the interface at every instant, so the incident,
// reflected and transmitted waves share ω and the tangential component of k:
// θ_r = θ_i and n_i sin θ_i = n_t sin θ_t. The normal component of k is what
// changes; when n_i sin θ_i > n_t it has no real value and the transmitted
// wave turns evanescent (O3.4). Trace wavelength along the surface, parallel
// layers, the critical angle as the end of phase matching. Transfer: depth
// from an airborne bathymetric lidar's 532 nm pulse.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { C, DEG, sf, nOf, MATS, bare } from './_op.js';

const t = String.raw;

// the worked example: a 1064 nm beam in air meets sapphire at 50°
const EX = { nm: 1064, th: 50 };
EX.n = nOf('sapphire', EX.nm);
EX.k0 = (2 * Math.PI) / (EX.nm / 1000);                  // rad/µm
EX.kx = EX.k0 * Math.sin(EX.th * DEG);
EX.kiz = EX.k0 * Math.cos(EX.th * DEG);
EX.kt = EX.n * EX.k0;
EX.ktz = Math.sqrt(EX.kt ** 2 - EX.kx ** 2);
EX.tht = Math.asin(EX.kx / EX.kt) / DEG;
EX.trace = (EX.nm / 1000) / Math.sin(EX.th * DEG);

/** An optics-rays interface picture with no controls. */
const iface = (n1, n2, angle, caption, extra = {}) => ({ type: 'optics-rays', params: { mode: 'interface', n1, n2, angle, controls: false, waves: true, ...extra }, caption });

export default lesson({
  id: 'phys4650.O3.3',
  title: 'Reflection and refraction from the wave picture',
  minutes: 13, difficulty: 3,
  intro: t`Snell’s law has come from least time ([M3.4](#/lesson/phys3550.M3.4)) and from Fermat ([O3.2](#/lesson/phys4650.O3.2)). The wave picture gives it a third way, and this one carries further. Whatever the boundary conditions are, they must hold **at every point of the interface and at every instant**. So the incident, reflected and transmitted waves must rise and fall together all along the surface: the same frequency, and the same phase change per metre along it — the same tangential wave vector:

$$k_i\sin\theta_i = k_r\sin\theta_r = k_t\sin\theta_t$$

With $k_i = k_r = n_ik_0$ and $k_t = n_tk_0$ this gives the law of reflection, $\theta_r = \theta_i$, and Snell’s law, $n_i\sin\theta_i = n_t\sin\theta_t$. What changes across the boundary is only the **normal** component of $\vec k$ — and when $n_i\sin\theta_i > n_t$ it has no real value at all.`,
  symbols: [
    { tex: 'k_i,\\ k_r,\\ k_t', text: t`the wavenumbers of the incident, reflected and transmitted waves, in rad/m: $nk_0$ in each medium, with $k_0 = 2\pi/\lambda_0$` },
    { tex: '\\theta_i,\\ \\theta_r,\\ \\theta_t', text: 'the angles of the three waves’ directions from the normal to the surface' },
    { tex: 'k\\sin\\theta', text: t`the **tangential** component of $\vec k$, along the surface: the phase change per metre along it` },
    { tex: 'n_i,\\ n_t', text: 'the refractive indices of the incident and transmitting media' },
  ],
  why: t`Phase matching is the master argument at any boundary — for light, sound, seismic and quantum waves alike — and it is the first step to the Fresnel equations and to evanescent waves.`,
  visual: {
    type: 'optics-rays',
    title: 'Wavefronts matched along a boundary',
    lead: t`A beam crossing a boundary, with its wavefronts drawn. Press **Play**: along the boundary the crests above and below meet at the same points and slide along together — the tangential phase matches. Below, the crests are closer (shorter $\lambda$) and turned, because the wave is slower there.`,
    tasks: [
      t`Change the angle and watch the crests stay joined at the surface: the crest spacing along the surface, $\lambda_0/(n_1\sin\theta_1)$, is the same on both sides.`,
      t`Make the top medium denser ($n_1 = 1.5$, $n_2 = 1$) and raise the angle past about 42°: no transmitted crests can match any more — total internal reflection.`,
    ],
    params: { mode: 'interface', n1: 1, n2: 1.5, angle: 40, waves: true, controls: ['n1', 'n2', 'angle', 'waves'] },
    caption: t`Wavefronts drawn with a made-up wavelength, far longer than light’s; the angles are exact. Ray brightness follows the Fresnel equations (O3.4).`,
  },
  example: {
    prompt: t`A ${EX.nm} nm laser beam in air meets a flat sapphire window ($n = ${sf(EX.n, 4)}$) at ${EX.th}° from the normal. Find the tangential and normal components of $\vec k$ on each side (in rad/µm), the transmission angle, and the distance between crests along the surface.`,
    visual: iface(1, sf(EX.n, 3), EX.th, t`The beam and its wavefronts at the air–sapphire surface; wavelength exaggerated.`),
    steps: [
      { label: 'Incident wave', text: t`$k_0 = 2\pi/\lambda_0 = ${sf(EX.k0, 4)}$ rad/µm. Tangential: $k_x = k_0\sin${EX.th}^\circ = ${sf(EX.kx, 4)}$; normal: $k_0\cos${EX.th}^\circ = ${sf(EX.kiz, 4)}$ rad/µm.` },
      { label: 'Match along the surface', text: t`The transmitted wave must have the same $k_x = ${sf(EX.kx, 4)}$ rad/µm, so that its phase keeps step with the incident one all along the boundary.` },
      { label: 'Normal part', text: t`In sapphire $|\vec k_t| = nk_0 = ${sf(EX.kt, 4)}$ rad/µm, so $k_{tz} = \sqrt{|\vec k_t|^2 - k_x^2} = ${sf(EX.ktz, 4)}$ rad/µm.` },
      { label: 'Angle', text: t`$\sin\theta_t = k_x/|\vec k_t| = \sin${EX.th}^\circ/n$, so $\theta_t = ${sf(EX.tht, 4)}^\circ$ — Snell’s law, from nothing but matching phases.` },
      { label: 'Trace wavelength', text: t`Crests are $2\pi/k_x = \lambda_0/\sin\theta_i = ${sf(EX.trace, 4)}$ µm apart along the surface, on both sides of it.` },
    ],
    answer: t`$k_x = ${sf(EX.kx, 4)}$ rad/µm on both sides; normal components $${sf(EX.kiz, 4)}$ (air) and $${sf(EX.ktz, 4)}$ rad/µm (sapphire); $\theta_t = ${sf(EX.tht, 3)}^\circ$; crests $${sf(EX.trace, 4)}$ µm apart along the surface.`,
  },
  practice: [
    mcq({
      id: 'what-matches', difficulty: 1,
      prompt: t`Light crosses from air into water. Which two quantities are the same on both sides of the surface?`,
      visual: iface(1, 1.33, 35, t`Wavefronts crossing an air–water surface (wavelength exaggerated).`),
      choices: ['The frequency and the component of k along the surface', 'The wavelength and the speed', 'The frequency and the wavelength', 'The component of k normal to the surface and the speed'],
      answer: 0,
      why: { 1: 'Both drop by the factor n in water: λ = λ₀/n and v = c/n.', 2: 'The frequency is the same, but the wavelength shrinks to λ₀/n.', 3: 'The normal component is exactly what changes: it is how the ray turns.' },
      hints: ['The boundary conditions must hold at every point of the surface at every instant.'],
      teach: 'At a boundary, the waves on both sides share ω (time matching) and the tangential wave vector (space matching).',
      explain: t`Matching in time fixes $\omega$; matching along the surface fixes $k\sin\theta$. With $k = n\omega/c$ that is Snell’s law. The wavelength, speed and normal component all change.`,
    }),
    num({
      id: 'k-normal', difficulty: 2,
      gen(r) {
        const nm = r.pick([532, 633, 1550]), mat = r.pick(['bk7', 'water', 'diamond', 'silica']), th = r.pick([20, 35, 50, 65]);
        const n = nOf(mat, nm), k0 = (2 * Math.PI) / (nm / 1000), kx = k0 * Math.sin(th * DEG), kz = Math.sqrt((n * k0) ** 2 - kx * kx);
        return {
          prompt: t`Light of vacuum wavelength ${nm} nm in air strikes ${MATS[mat].name} ($n = ${sf(n, 4)}$) at ${th}°. What is the component of the transmitted wave vector **normal** to the surface, in rad/µm?`,
          visual: iface(1, sf(n, 3), th, t`The beam at the surface; wavelength exaggerated.`, { hide: ['theta2'] }),
          answer: kz, units: 'rad/um', tol: { rel: 0.003 },
          errors: [{ value: n * k0 * Math.cos(th * DEG), feedback: t`$\theta_i$ is not the transmitted angle. Use $k_{tz} = \sqrt{(nk_0)^2 - k_x^2}$, with $k_x$ matched to the incident wave.` }, { value: n * k0, feedback: 'That is the whole wavenumber; subtract the tangential part in quadrature.' }],
          hints: [t`$k_x = k_0\sin\theta_i$ on both sides.`, t`$k_{tz} = \sqrt{(nk_0)^2 - k_x^2}$.`],
          teach: t`The tangential component is inherited from the incident wave; the medium fixes the length $nk_0$; the normal component makes up the rest.`,
          explain: t`$k_0 = ${sf(k0, 4)}$, $k_x = ${sf(kx, 4)}$, $nk_0 = ${sf(n * k0, 4)}$ rad/µm, so $k_{tz} = ${sf(kz, 4)}$ rad/µm.`,
        };
      },
    }),
    num({
      id: 'trace', difficulty: 2,
      gen(r) {
        const nm = r.pick([450, 589, 700]), n1 = r.pick([1, 1.333]), th = r.pick([25, 40, 60]);
        const tr = nm / (n1 * Math.sin(th * DEG));
        return {
          prompt: t`Light of vacuum wavelength ${nm} nm travels in a medium of index ${n1} and meets a flat surface at ${th}° from the normal. How far apart are its crests **along the surface**, in nm?`,
          visual: iface(n1 === 1 ? 1 : 1.33, 1.6, th, t`Crests meeting the surface; their spacing along it is what is asked. Wavelength exaggerated.`),
          answer: tr, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: nm / n1 / Math.cos(th * DEG), feedback: t`Along the surface the spacing is $\lambda/\sin\theta$; $\cos\theta$ belongs to the spacing along the normal.` }, { value: nm / Math.sin(th * DEG), feedback: t`Inside a medium of index ${n1} the wavelength is $\lambda_0/n$.` }].filter((e) => Math.abs(e.value - tr) > 0.01 * tr),
          hints: [t`The wavelength in the medium is $\lambda_0/n_1$.`, t`Crests cut the surface every $\lambda/\sin\theta$: wider than $\lambda$, as with a wave hitting a beach at an angle.`],
          teach: t`The trace wavelength along a surface is $\lambda_0/(n\sin\theta)$ — the quantity both sides must share.`,
          explain: t`$\lambda_0/(n_1\sin\theta) = ${nm}/(${n1}\sin${th}^\circ) = ${sf(tr, 4)}$ nm, the same on the far side of the surface.`,
        };
      },
    }),
    order({
      id: 'argument', difficulty: 2,
      prompt: t`Put the phase-matching argument for Snell’s law in order.`,
      visual: iface(1, 1.5, 40, t`Incident, reflected and transmitted waves meeting at the surface.`),
      items: [
        t`Write incident, reflected and transmitted plane waves $e^{i(\vec k\cdot\vec r - \omega t)}$.`,
        t`The boundary conditions link their amplitudes at the surface $z = 0$, for every $x$ and $t$.`,
        t`That is possible only if all three exponentials vary identically along the surface: equal $\omega$ and equal $k_x$.`,
        t`Equal $k_x$ with $k_i = k_r$ gives $\theta_r = \theta_i$.`,
        t`Equal $k_x$ with $k_t = (n_t/n_i)k_i$ gives $n_i\sin\theta_i = n_t\sin\theta_t$.`,
      ],
      hints: ['Start from the waves, then the condition, then what the condition forces.', t`If two exponentials $e^{iax}$ and $e^{ibx}$ must stay in a fixed ratio for all $x$, then $a = b$.`],
      teach: 'Kinematics (directions) follows from matching phases; dynamics (how much reflects) needs the actual boundary conditions.',
      explain: t`The argument never uses what the boundary conditions are — only that they hold everywhere on the surface. That is why the same laws hold for sound and for electron waves; the amplitudes (the Fresnel equations, O3.4) do depend on the details.`,
    }),
    mcq({
      id: 'window-layers', difficulty: 2,
      prompt: t`A beam in air crosses a star-tracker window made of three bonded flat layers of different glasses, then leaves into air again. At what angle does it leave?`,
      visual: { type: 'graph', params: bare([-3, 3], [-1.6, 1.6], { shade: [{ fn: '0.6', lower: '0.2', from: -3, to: 3, color: 'teal', alpha: 0.3 }, { fn: '0.2', lower: '-0.3', from: -3, to: 3, color: 'accent', alpha: 0.35 }, { fn: '-0.3', lower: '-0.6', from: -3, to: 3, color: 'violet', alpha: 0.3 }], curves: [{ param: ['-2.2 + 1.3*t', '1.6 - t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['-0.9 + 0.35*t', '0.6 - 0.4*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['-0.55 + 0.4*t', '0.2 - 0.5*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['-0.15 + 0.3*t', '-0.3 - 0.3*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['0.15 + 1.3*t', '-0.6 - t'], t: [0, 1], color: 'gold', width: 2, dash: [5, 4] }] }), caption: t`Three layers of different index; the ray’s path inside is schematic, and its exit direction is what is asked.` },
      choices: ['At the same angle it arrived at', 'Bent toward the normal, by the densest layer', 'Bent away from the normal, by the least dense layer', 'It depends on the order of the layers'],
      answer: 0,
      why: { 1: 'Each layer bends it, but n sin θ is the same in every layer, so it is back to its original value in air.', 2: 'All parallel surfaces share one tangential k, so only the outer media matter.', 3: 'The order changes the path inside, not the exit angle.' },
      hints: [t`What is conserved across every parallel surface?`],
      teach: t`Through parallel layers $n\sin\theta$ is invariant: the exit angle depends only on the first and last media.`,
      explain: t`$k_x$ is the same in every layer, so in the final air $\sin\theta = \sin\theta_{\text{in}}$. The beam is shifted sideways a little but not turned — a flat window does not deflect starlight.`,
    }),
    num({
      id: 'onset', difficulty: 3,
      gen(r) {
        const [n1, n2, what] = r.pick([[1.4682, 1.4629, 'a single-mode fibre core and its cladding'], [1.333, 1, 'water and air'], [2.417, 1, 'diamond and air'], [1.5168, 1.333, 'crown glass and water']]);
        const thc = Math.asin(n2 / n1) / DEG;
        return {
          prompt: t`Light inside the denser of ${what} ($n_1 = ${n1}$, $n_2 = ${n2}$) meets their boundary. Above what angle of incidence can no transmitted wave match the incident wave’s tangential $k$, in degrees?`,
          visual: { type: 'graph', params: { x: [0, 90], y: [0, 1.15 * n1], aspect: 'wide', xlabel: 'angle of incidence (°)', ylabel: 'k along surface ÷ k₀', yticks: 4, curves: [{ fn: `${n1}*sin(x*pi/180)`, color: 'accent', width: 2.4, label: 'n₁ sin θ', labelAt: 30, labelDy: -10 }], hlines: [{ y: n2, color: 'warn', label: 'largest kₓ medium 2 can carry: n₂' }] }, caption: t`The incident wave’s tangential wavenumber (in units of $k_0$) against angle, and the largest a propagating wave in medium 2 can have.` },
          answer: thc, units: 'deg', tol: { rel: 0.002 },
          errors: [{ value: Math.asin(n2 / n1) , feedback: 'That is in radians.' }, { value: Math.acos(n2 / n1) / DEG, feedback: t`Matching is lost when $n_1\sin\theta = n_2$ — sine, not cosine.` }],
          hints: [t`A propagating wave in medium 2 has $k_x \le n_2k_0$.`, t`Set $n_1k_0\sin\theta = n_2k_0$.`],
          teach: t`Beyond $\sin\theta_c = n_2/n_1$ the tangential $k$ exceeds what medium 2 can carry: its normal component turns imaginary and the field there is evanescent.`,
          explain: t`$\theta_c = \arcsin(${n2}/${n1}) = ${sf(thc, 4)}^\circ$. Beyond it $k_{tz} = \sqrt{n_2^2k_0^2 - k_x^2}$ is imaginary: the field decays away from the surface instead of travelling (O3.4).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bathymetry', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([15, 18, 20]), dt = r.pick([40, 80, 150, 260]), n = 1.337;
        const tt = Math.asin(Math.sin(th * DEG) / n);
        const d = ((C * dt * 1e-9) / (2 * n)) * Math.cos(tt);
        return {
          prompt: t`An airborne lidar maps a lagoon’s depth with 532 nm pulses aimed ${th}° off vertical. The pulse that returns from the sea floor arrives ${dt} ns after the one from the water surface. Seawater has $n = ${n}$ at 532 nm. How deep is the water, in metres?`,
          visual: iface(1, 1.34, th, t`The pulse refracting into the water (wavelength exaggerated); it travels at $c/n$ along the steeper refracted path, down and back.`, { waves: false }),
          answer: d, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (C * dt * 1e-9) / 2 * Math.cos(tt), feedback: 'In water the pulse travels at c/n, not c.' }, { value: ((C * dt * 1e-9) / (2 * n)) * Math.cos(th * DEG), feedback: 'Inside the water the path follows the refracted angle, not the incidence angle.' }, { value: (C * dt * 1e-9) / (2 * n), feedback: 'That is the slant distance along the refracted ray; the depth is its vertical part.' }],
          hints: [t`Refracted angle: $\sin\theta_t = \sin${th}^\circ/n$.`, t`One-way slant path $= (c/n)(\Delta t/2)$; depth $=$ slant path $\times\cos\theta_t$.`],
          teach: 'Lidar bathymetry corrects for both effects of the water: the slower speed and the refracted direction.',
          explain: t`$\theta_t = ${sf(tt / DEG, 3)}^\circ$; slant path $= c\Delta t/2n = ${sf((C * dt * 1e-9) / (2 * n), 4)}$ m; depth $= ${sf(d, 3)}$ m. NASA’s ICESat-2 makes the same corrections, from orbit, for shallow coastal water.`,
        };
      },
    }),
    mcq({
      id: 'cp-colour', difficulty: 2,
      prompt: t`A diver looks up at a red buoy. Inside the water the light’s wavelength is shorter than in air. Does the buoy look a different colour?`,
      visual: iface(1, 1.33, 25, t`Red light entering the water (wavelength exaggerated).`),
      choices: ['No: colour follows the frequency, which the water does not change.', 'Yes, it looks orange, because the wavelength in water is shorter.', 'Yes, it looks redder, because the light slows down.', 'No, because the water changes the frequency and wavelength in step.'],
      answer: 0,
      why: { 1: 'The eye responds to photon energy hν, set by the frequency; and the eye’s own fluid would shorten the wavelength anyway.', 2: 'Slowing does not change the photon energy hν.', 3: 'The frequency does not change at all; only the wavelength does.' },
      hints: ['What does a boundary leave unchanged?'],
      teach: 'Frequency, and hence photon energy and colour, is unchanged on crossing into a medium; only wavelength and speed change.',
      explain: t`Phase matching in time forces the same $\omega$ on both sides. (Absorption by water over long paths does make distant red things look dim and bluish — a different effect.)`,
    }),
    num({
      id: 'cp-tangential', difficulty: 2,
      gen(r) {
        const n2 = r.pick([1.33, 1.46, 1.52, 2.42]), th2 = r.pick(n2 > 2 ? [12, 16, 20] : [15, 20, 28]);
        const s1 = n2 * Math.sin(th2 * DEG), th1 = Math.asin(s1) / DEG;
        return {
          prompt: t`A beam inside a material of index ${n2} travels at ${th2}° from the normal after entering it from air. At what angle did it arrive in the air, in degrees?`,
          visual: iface(1, n2, sf(th1, 3), t`The beam entering the material; the incoming angle is what is asked.`, { hide: ['theta1'], readout: false }),
          answer: th1, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: Math.asin(Math.sin(th2 * DEG) / n2) / DEG, feedback: t`Inverted: the air side has the larger angle. Use $\sin\theta_{\text{air}} = n\sin\theta_{\text{medium}}$.` }],
          hints: [t`$\sin\theta_{\text{air}} = n\sin\theta_{\text{medium}}$.`],
          teach: t`Snell’s law works both ways: the tangential $k$, $n\sin\theta$, is the same on each side.`,
          explain: t`$\sin\theta_{\text{air}} = ${n2}\sin${th2}^\circ = ${sf(s1, 4)}$, so $\theta = ${sf(th1, 4)}^\circ$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §4.3–4.4 and §4.6.1', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'D. J. Griffiths, Introduction to Electrodynamics, 4th ed., §9.3.3 (the three laws of reflection and refraction)', url: 'https://doi.org/10.1017/9781108333511' },
  ],
});
