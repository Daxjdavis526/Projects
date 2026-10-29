// Gravitational waves as a wave equation (enrichment). Far from any source,
// the linearized Einstein equations in Lorenz gauge are □h̄_μν = 0: the same
// wave equation as each component of E in W12, with speed c and no
// dispersion. A plane wave has two transverse polarizations, + and ×, rotated
// 45° from each other (spin 2, against light's 90°); the amplitude falls as
// 1/r like any spherical wave (W7.2); a binary radiates at twice its orbital
// frequency. GW150914 read as a wave (PRL 116, 061102); the honest limits of
// the linear picture. GR's own lessons (gr.S27, gr.S28) carry the derivation,
// the quadrupole formula and the chirp mass; st-b.B9.3 the GW170817 speed bound.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const C = 299792458, GMSUN = 1.32712440018e20, LY = 9.4607304725808e15, RS_SUN = 2953.25;   // m per solar mass for 2GM/c²

// the worked example: GW150914 (Abbott et al. 2016)
const EX = (() => {
  const f1 = 35, f2 = 150, M = 65, d = 3002e3;
  const lam = C / f2, forb = f2 / 2, w = 2 * Math.PI * forb, a = Math.cbrt((GMSUN * M) / (w * w));
  return { f1, f2, M, lam, forb, a, rs: RS_SUN * M, dtMax: d / C, sep: d };
})();

/** A ring of free test masses deformed by a + or × wave (deformation exaggerated). */
function ringPic(kinds, caption, eps = 0.28) {
  const curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', width: 1.2, dash: [4, 4] }];
  const ofs = { plus: [-1.6, 0], cross: [1.6, 0] };
  const shift = kinds.length === 2;
  for (const k of kinds) {
    const [dx] = shift ? ofs[k] : [0];
    const X = k === 'plus' ? `(1 + ${eps})*cos(t)` : `cos(t) + ${eps}*sin(t)`, Y = k === 'plus' ? `(1 - ${eps})*sin(t)` : `sin(t) + ${eps}*cos(t)`;
    curves.push({ param: [`${dx} + ${X}`, Y], t: [0, 2 * Math.PI], color: k === 'plus' ? 'accent' : 'gold', width: 2.4 });
    if (shift) curves.push({ param: [`${dx} + cos(t)`, 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', width: 1.1, dash: [4, 4] });
  }
  if (shift) curves.shift();
  const points = shift ? [{ x: -1.6, y: -1.55, r: 0, label: 'h+ (plus)', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.6, y: -1.55, r: 0, label: 'h× (cross)', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 }] : [];
  return { type: 'graph', params: { x: shift ? [-3.2, 3.2] : [-1.8, 1.8], y: [-1.75, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves, points }, caption };
}

const chirp = (caption, p = {}) => ({ type: 'gr-chirp', params: { sliders: false, play: false, readout: false, ...p }, caption });

export default lesson({
  id: 'phys3750.W14.1',
  title: 'Gravitational waves as a wave equation',
  minutes: 16, difficulty: 3,
  intro: t`Where gravity is weak, write the spacetime metric as flat plus a ripple, $g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}$ with $|h| \ll 1$, and keep Einstein’s equations to first order in $h$. With a convenient choice of coordinates (the Lorenz gauge), empty space gives

$$\Box\bar h_{\mu\nu} = \Big(-\frac{1}{c^2}\frac{\partial^2}{\partial t^2} + \nabla^2\Big)\bar h_{\mu\nu} = 0$$

— term for term the wave equation that [each component of $\vec E$](#/lesson/phys3750.W12.1) obeys. So gravitational waves travel at $c$, with $\omega = ck$ and no dispersion, and they spread from a source like any [spherical wave](#/lesson/phys3750.W7.2), amplitude $\propto 1/r$. What is new is the shape of the field. A plane wave along $z$, with the remaining coordinate freedom used up, has only $h_{xx} = -h_{yy} = h_+$ and $h_{xy} = h_\times$: **two transverse polarizations**, which stretch one direction while squeezing the other. The equation is honest only where $h$ is tiny; the derivation lives in [linearized field equations](#/lesson/gr.S28.d), the sources in [wave solutions and the quadrupole formula](#/lesson/gr.S27.d).`,
  symbols: [
    { tex: 'h_{\\mu\\nu}', text: 'the small deviation of the metric from flat spacetime (dimensionless); a strain — the fractional change it makes in distances is about $h/2$' },
    { tex: '\\bar h_{\\mu\\nu}', text: 'the trace-reversed ripple, $h_{\\mu\\nu} - \\tfrac12\\eta_{\\mu\\nu}h$, which makes the equations tidy; for a wave in the transverse–traceless gauge it equals $h_{\\mu\\nu}$' },
    { tex: '\\Box', text: 'the wave operator $-c^{-2}\\partial_t^2 + \\nabla^2$, in the course’s GR signature $(-,+,+,+)$' },
    { tex: 'h_+,\\ h_\\times', text: 'the two polarizations’ amplitudes for a wave along $z$: “plus” stretches along $x$ and squeezes along $y$; “cross” does the same along the diagonals' },
    { tex: 'c', text: 'the speed of light, $299\\,792\\,458$ m/s — also the speed of gravity' },
  ],
  why: t`This is the equation behind every LIGO, Virgo and KAGRA detection — and behind pulsar-timing arrays and the planned LISA — and it ends the course where it began: one wave equation, now for spacetime itself.`,
  visual: {
    type: 'gr-chirp',
    title: 'A chirp, and what it does',
    lead: t`The strain $h(t)$ from two black holes spiralling together, at leading order, beside a ring of free test masses and an interferometer’s arms, stretched and squeezed by the + polarization at the playhead.`,
    tasks: [
      t`Play: the ring breathes out along one axis and in along the other, twice per orbit — a binary radiates at twice its orbital frequency.`,
      t`Watch frequency and amplitude climb together as the orbit shrinks: the chirp.`,
      t`Move the source farther away: the strain falls as $1/D$, the falloff of any spherical wave, not $1/D^2$.`,
    ],
    params: { m1: 36, m2: 29, D: 410 },
    caption: t`Leading-order (quadrupole) inspiral of point masses on a circular orbit, stopped before the merger, which needs numerical relativity. The ring’s deformation is exaggerated about $10^{20}$ times; the readout gives the true numbers.`,
  },
  example: {
    prompt: t`On 14 September 2015 both LIGO detectors recorded GW150914: in about 0.2 s, over some eight cycles, the signal rose from ${EX.f1} to ${EX.f2} Hz, where its strain peaked at $1.0\times10^{-21}$. Read it as a wave: find its wavelength at the peak, the orbital frequency and separation of a binary of total mass about ${EX.M} solar masses radiating at ${EX.f2} Hz, and the largest possible delay between the two detectors, ${EX.sep / 1000} km apart.`,
    steps: [
      { label: 'Wavelength', text: t`$\omega = ck$, so $\lambda = c/f = ${tn(EX.lam / 1000)}$ km at ${EX.f2} Hz: much longer than the detectors’ 4 km arms (each arm feels a nearly uniform strain), and comparable to Earth itself.` },
      { label: 'Twice per orbit', text: t`The quadrupole pattern of two orbiting masses repeats every half orbit, so $f_{\text{orb}} = f/2 = ${EX.forb}$ Hz.` },
      { label: 'Separation', text: t`Kepler: $a^3 = GM/\omega_{\text{orb}}^2$ with $\omega_{\text{orb}} = 2\pi\times${EX.forb}$ rad/s and $GM = ${EX.M}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$: $a \approx ${tn(EX.a / 1000)}$ km.` },
      { label: 'Only black holes', text: t`Two Schwarzschild radii for ${EX.M} solar masses add to $2GM/c^2 \approx ${tn(EX.rs / 1000)}$ km. Bodies that massive, that close, orbiting 75 times a second, can only be black holes — the discovery paper’s argument. (Newtonian orbits are only a rough guide this close.)` },
      { label: 'Two detectors', text: t`The wave crosses Earth at $c$: the delay between Hanford and Livingston can be at most $${EX.sep / 1000}\ \text{km}/c = ${tn(EX.dtMax * 1000)}$ ms. GW150914 reached Livingston 6.9 ms before Hanford — inside the limit, and the start of locating it on the sky.` },
      { label: 'Honest framing', text: t`$\Box\bar h = 0$ holds where the wave is weak: at the detectors, and anywhere far from the source. Near the merger $h$ is not small, and the full nonlinear equations are solved on computers. The energy the wave carries — three solar masses’ worth for GW150914 — is a second-order effect that the linear equation alone does not contain.` },
    ],
    answer: t`$\lambda \approx ${tn(EX.lam / 1000)}$ km; $f_{\text{orb}} = ${EX.forb}$ Hz; separation about $${tn(EX.a / 1000, 2)}$ km, not much more than the bodies’ own Schwarzschild radii; delay at most $${tn(EX.dtMax * 1000)}$ ms (6.9 ms observed).`,
    visual: chirp(t`The leading-order chirp for 36 and 29 solar masses: frequency and amplitude rising together. The merger itself is not drawn.`, { ring: false }),
  },
  practice: [
    num({
      id: 'wavelength', difficulty: 1,
      gen(r) {
        const [f, band] = r.pick([[20, 'LIGO’s low-frequency end'], [100, 'the middle of LIGO’s band'], [400, 'a neutron-star merger’s late inspiral'], [1000, 'a neutron star’s ringing after a merger']]);
        const lam = C / f / 1000;
        return {
          prompt: t`Gravitational waves obey $\Box\bar h_{\mu\nu} = 0$, so $\omega = ck$. What is the wavelength of a ${f} Hz gravitational wave (${band}), in km?`,
          visual: curvesPic([{ fn: 'cos(2*pi*x)', color: 'accent', width: 2.2 }], [0, 3], [-1.4, 1.4], t`A plane wave of strain along its direction of travel (relative units; distance in wavelengths).`, { xlabel: 'distance (wavelengths)', ylabel: 'h', yticks: 0 }),
          answer: lam, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: lam / (2 * Math.PI), feedback: t`$\lambda = c/f$; $c/2\pi f = 1/k$ is the reduced wavelength.` }],
          hints: [t`$\lambda = c/f$.`, t`$c = 2.998\times10^{5}$ km/s.`],
          teach: t`No dispersion: $\lambda = c/f$ at every frequency, just as for light.`,
          explain: t`$\lambda = ${tn(C / 1000)}/${f} = ${tn(lam)}$ km — far longer than LIGO’s 4 km arms, which therefore sit inside a nearly uniform strain.`,
        };
      },
    }),
    num({
      id: 'one-over-r', difficulty: 2,
      gen(r) {
        const [where, D] = r.pick([['the Virgo cluster, about 16.5 Mpc away', 16.5], ['the Andromeda galaxy, 0.77 Mpc away', 0.77], ['a galaxy 2000 Mpc away', 2000], ['the distance of GW170817, about 40 Mpc', 40]]);
        const h = (1.0 * 410) / D;
        return {
          prompt: t`GW150914 peaked at strain $1.0\times10^{-21}$ from about 410 Mpc. An identical merger in ${where}: what peak strain would it produce at Earth? Give it in units of $10^{-21}$.`,
          visual: curvesPic([{ fn: '1/x', color: 'accent', width: 2.4, domain: [0.25, 5] }, { fn: '1/x^2', color: 'ink3', dash: [5, 4], width: 1.3, domain: [0.45, 5] }], [0, 5], [0, 4], t`Amplitude against distance: $1/r$ (blue) for a wave’s amplitude; $1/r^2$ (dashed) is the falloff of its energy flux. Relative units.`, { xlabel: 'distance (relative)', ylabel: 'strain (relative)' }),
          answer: h, tol: { rel: 0.01 },
          errors: [{ value: (1.0 * 410 * 410) / (D * D), feedback: t`Amplitude falls as $1/r$; it is the energy flux, $\propto \dot h^2$, that falls as $1/r^2$.` }].filter((e) => Math.abs(e.value - h) > 0.02 * h),
          hints: [t`A spherical wave’s amplitude goes as $1/r$.`, t`$h = 1.0\times(410/${D})$ in units of $10^{-21}$.`],
          teach: t`Gravitational-wave strain falls as $1/r$ — so doubling a detector’s sensitivity doubles its reach and multiplies the volume it surveys by eight.`,
          explain: t`$h = 1.0\times10^{-21}\times410/${D} = ${tn(h)}\times10^{-21}$. Detectors measure amplitude, not energy, which is why they see so far.`,
        };
      },
    }),
    num({
      id: 'lisa-binary', difficulty: 2, transfer: true,
      gen(r) {
        const [name, P] = r.pick([['HM Cancri, two white dwarfs with an orbital period of 321.5 s', 321.5], ['ZTF J1539+5027, two white dwarfs orbiting every 6.91 minutes', 414.6]]);
        const f = (2 / P) * 1000;
        return {
          prompt: t`The space detector LISA, planned for the 2030s, is guaranteed to hear known “verification binaries” such as ${name}. At what frequency are its gravitational waves, in mHz?`,
          visual: ringPic(['plus'], t`The quadrupole pattern on a ring of test masses: stretched along one axis, squeezed along the other; half an orbit later it is the same again. Deformation hugely exaggerated.`),
          answer: f, units: 'mHz', tol: { rel: 0.01 },
          errors: [{ value: f / 2, feedback: 'That is the orbital frequency. The quadrupole pattern repeats every half orbit, so the waves are at twice it.' }],
          hints: ['A binary looks the same after half an orbit.', t`$f_{\text{gw}} = 2f_{\text{orb}} = 2/P$.`],
          teach: 'A circular binary radiates gravitational waves at twice its orbital frequency.',
          explain: t`$f = 2/P = ${tn(f)}$ mHz, in the middle of LISA’s band (about 0.1 to 100 mHz), far below anything a ground detector can hear.`,
        };
      },
    }),
    mcq({
      id: 'polarizations', difficulty: 2,
      prompt: t`The picture shows the two polarizations of a gravitational wave acting on rings of free test masses. How is the × pattern related to the + pattern?`,
      visual: ringPic(['plus', 'cross'], t`A ring of free masses (dashed) under the + and × polarizations at one instant. Deformation hugely exaggerated; the wave travels out of the page.`),
      choices: [
        'It is the + pattern rotated by 45°',
        'It is the + pattern rotated by 90°, as for light’s two polarizations',
        'It is the + pattern rotated by 180°',
        'It is not related by any rotation: it squeezes the ring’s area instead',
      ],
      answer: 0,
      why: {
        1: 'Turn the + pattern by 90° and the stretched axis becomes the squeezed one: that is the same polarization with the opposite sign, a half-cycle later. For a pattern with two-fold symmetry the independent rotation is 45°.',
        2: 'Turning by 180° maps the + pattern exactly onto itself.',
        3: 'Both polarizations keep the ring’s area (to first order): one axis stretches as much as the other squeezes.',
      },
      hints: ['Where are the stretched directions in each pattern?', 'Rotating the + pattern by 90° swaps stretch and squeeze; rotating it by 180° does nothing.'],
      teach: 'Gravitational-wave polarizations differ by 45° (spin 2), light’s by 90° (spin 1).',
      explain: t`The + pattern stretches along $x$, the × along the diagonals: 45° apart. A pattern that returns to itself after 180° has its independent orientations 45° apart; the field’s “spin” is 2. Light’s field, an arrow, returns after 360° and needs 90°. Details in [gr.S27.d](#/lesson/gr.S27.d).`,
    }),
    num({
      id: 'separation', difficulty: 3,
      gen(r) {
        const [what, M, f] = r.pick([['two neutron stars of total mass 2.7 solar masses', 2.7, 100], ['two neutron stars of total mass 2.7 solar masses', 2.7, 400], ['two black holes of total mass 20 solar masses', 20, 100], ['two black holes of total mass 65 solar masses', 65, 50]]);
        const w = Math.PI * f, a = Math.cbrt((GMSUN * M) / (w * w)) / 1000;
        return {
          prompt: t`A detector hears ${what} radiating at ${f} Hz. Treating the orbit as Newtonian and circular, how far apart are they, in km? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
          visual: chirp(t`A leading-order chirp; the frequency is read off the signal (illustrative masses).`, { ring: false }),
          answer: a, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: Math.cbrt((GMSUN * M) / (4 * w * w)) / 1000, feedback: t`The orbit turns at half the wave frequency: $\omega_{\text{orb}} = 2\pi f/2 = \pi f$.` }, { value: Math.cbrt((GMSUN * M) / (f * f)) / 1000, feedback: t`Kepler’s law uses the angular frequency in rad/s: $\omega_{\text{orb}} = \pi f$.` }],
          hints: [t`$f_{\text{orb}} = f/2$, so $\omega_{\text{orb}} = \pi f$.`, t`Kepler: $a^3 = GM/\omega_{\text{orb}}^2$.`],
          teach: 'The wave frequency and Kepler’s law give the orbit’s size: the wave is a direct readout of the source’s motion.',
          explain: t`$\omega_{\text{orb}} = \pi\times${f} = ${tn(w)}$ rad/s and $a = (GM/\omega^2)^{1/3} = ${tn(a)}$ km. ${M < 3 ? 'Neutron stars are about 12 km in radius, so they have not yet touched.' : t`Their Schwarzschild radii add to $2GM/c^2 \approx ${tn((RS_SUN * M) / 1000)}$ km, so the orbit is only ${tn(a / ((RS_SUN * M) / 1000), 2)} times that: the merger is close.`}`,
        };
      },
    }),
    mcq({
      id: 'no-dispersion', difficulty: 2,
      prompt: t`The chirp from a merger 1.3 billion light-years away arrives with its shape intact: the 35 Hz and the 150 Hz parts have not slid relative to each other. What in $\Box\bar h_{\mu\nu} = 0$ guarantees that?`,
      visual: chirp(t`A chirp: the low and high frequencies stay in their order and spacing across the journey.`, { ring: false }),
      choices: [
        t`Its dispersion relation is $\omega = ck$: every frequency travels at the same speed`,
        'Gravitational waves are too weak to interact with anything, so nothing can distort them',
        'The wave equation conserves energy, and a dispersed signal would carry less energy',
        'Higher frequencies travel slightly faster and exactly cancel the expansion of the universe',
      ],
      answer: 0,
      why: {
        1: 'Weak interaction keeps them from being absorbed, but a dispersive medium — even empty space, if gravitons had mass — would still spread a chirp.',
        2: 'A dispersed packet carries the same energy; dispersion rearranges it in time without losing any.',
        3: 'Cosmic expansion stretches every frequency by the same factor (1 + z), keeping the shape; no frequency dependence is needed or seen.',
      },
      hints: [t`Substitute $e^{i(kz - \omega t)}$ into $-c^{-2}\partial_t^2h + \partial_z^2h = 0$.`, 'Dispersion needs ω/k to depend on k.'],
      teach: 'No dispersion: gravitational waves of every frequency travel at c, so a chirp keeps its shape.',
      explain: t`$\omega^2 = c^2k^2$, so $v_p = v_g = c$ for all frequencies. A graviton mass would add a term, $\omega^2 = c^2k^2 + m^2c^4/\hbar^2$, and make low frequencies lag; LIGO’s signals show no such lag. The arrival of light 1.7 s after GW170817 pins the speed of gravity to $c$ within about $10^{-15}$ — see [retarded Green’s functions](#/lesson/st-b.B9.3).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-delay', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([20, 35, 50, 65]);
        const dt = (EX.sep / C) * Math.cos((th * Math.PI) / 180) * 1000;
        return {
          prompt: t`The two LIGO sites are ${EX.sep / 1000} km apart. A gravitational wave arrives from a direction ${th}° from the line joining them. How much earlier does it reach one site than the other, in ms?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.8], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-1.5, 1.5], color: 'ink3', width: 1.5 }, ...[-2.7, -2.1].map((x0) => ({ param: [`${x0} + t*cos(${(th * Math.PI) / 180 + Math.PI / 2})`, `t*sin(${(th * Math.PI) / 180 + Math.PI / 2})`], t: [-1.2, 1.2], color: 'accent', width: 1.4, dash: [5, 4] }))], points: [{ x: -1.5, y: 0, color: 'gold', r: 6, label: 'site 1', labelAlign: 'center', labelDx: 0, labelDy: 18 }, { x: 1.5, y: 0, color: 'gold', r: 6, label: 'site 2', labelAlign: 'center', labelDx: 0, labelDy: 18 }], arrows: [{ from: [-1.2, 0.95], to: [-1.2 + 0.7 * Math.cos((th * Math.PI) / 180), 0.95 + 0.7 * Math.sin((th * Math.PI) / 180)], color: 'accent', label: 'travel', labelDx: 6 }] }, caption: 'Wavefronts (dashed) crossing the baseline between the two sites at an angle; the curvature of the Earth is ignored. Not to scale.' },
          answer: dt, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (EX.sep / C) * Math.sin((th * Math.PI) / 180) * 1000, feedback: t`The delay is the baseline’s projection on the direction of travel: $d\cos\theta/c$, with $\theta$ measured from the baseline.` }, { value: (EX.sep / C) * 1000, feedback: t`That is the maximum, for a wave travelling along the baseline. Project: $d\cos\theta/c$.` }],
          hints: [t`A plane wavefront moves at $c$ along its direction of travel.`, t`$\Delta t = d\cos\theta/c$.`],
          teach: 'Arrival-time differences between detectors, set by the speed c, locate a source on the sky.',
          explain: t`$\Delta t = (${EX.sep / 1000}\ \text{km})\cos${th}°/c = ${tn(dt)}$ ms. One delay fixes a ring on the sky; Virgo and KAGRA add more delays and shrink it to a patch.`,
        };
      },
    }),
    num({
      id: 'cp-pta', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([2, 4, 10, 30]);
        const ly = C / (f * 1e-9) / LY;
        return {
          prompt: t`Pulsar-timing arrays such as NANOGrav listen for gravitational waves of nanohertz frequencies by timing dozens of pulsars for years; in 2023 they reported evidence for a background of such waves. What is the wavelength of a ${f} nHz gravitational wave, in light-years?`,
          visual: curvesPic([{ fn: 'cos(2*pi*x/3)', color: 'accent', width: 2.2 }], [0, 6], [-1.4, 1.4], t`A very long, slow wave (relative units): the Earth and the pulsars, thousands of light-years apart, sit at different phases of it.`, { xlabel: 'distance', ylabel: 'h', xticks: 0, yticks: 0 }),
          answer: ly, units: 'ly', tol: { rel: 0.01 },
          errors: [{ value: ly / (2 * Math.PI), feedback: t`$\lambda = c/f$, not $c/2\pi f$.` }],
          hints: [t`$\lambda = c/f$ with $f = ${f}\times10^{-9}$ Hz.`, t`One light-year is $9.461\times10^{15}$ m.`],
          teach: t`$\lambda = c/f$ holds at every frequency: nanohertz waves are light-years long.`,
          explain: t`$\lambda = ${tn(C / (f * 1e-9))}$ m $= ${tn(ly)}$ light-years. A wave that long is detected not by an instrument on Earth but by the galaxy itself, through correlated delays in the pulsars’ ticks.`,
        };
      },
    }),
    mcq({
      id: 'cp-honest', difficulty: 3,
      prompt: t`Which statement about the equation $\Box\bar h_{\mu\nu} = 0$ is accurate?`,
      visual: chirp(t`The leading-order chirp stops short of the merger, where the weak-field picture fails.`, { ring: false }),
      choices: [
        t`It is Einstein’s equation linearized about flat spacetime in a chosen gauge: excellent where $h \ll 1$, as at the detectors, but the merger itself needs the full nonlinear equations`,
        'It is Einstein’s full field equation in empty space, exact everywhere, including next to merging black holes',
        'It shows that gravitational waves travel more slowly near massive objects, because the box operator contains the mass',
        'It describes the waves only inside the source; outside, the waves obey a different, dispersive equation',
      ],
      answer: 0,
      why: {
        1: t`Einstein’s vacuum equation is $R_{\mu\nu} = 0$, nonlinear in the metric. Keeping only first order in $h$ gives the wave equation; near the merger $h$ is of order 1 and that approximation fails.`,
        2: t`$\Box$ here is the flat-spacetime wave operator; no mass appears in it. (Waves passing near masses are delayed and lensed — but that needs the curved background, beyond this equation.)`,
        3: t`It is the vacuum equation: it holds outside the source, where the waves travel. Inside, a source term $-16\pi GT_{\mu\nu}/c^4$ appears on the right.`,
      },
      hints: ['What was assumed to get a linear equation?', t`How big is $h$ next to two merging black holes?`],
      teach: 'Linearized gravity is a weak-field approximation: right where waves are measured, wrong where they are made.',
      explain: t`Linear in $h$, flat background, Lorenz gauge: it holds wherever spacetime is nearly flat — which is everywhere the waves are detected. The source region needs numerical relativity, and the waves’ own energy appears only at second order.`,
    }),
  ],
  sources: [
    { label: 'Abbott et al. (LIGO Scientific and Virgo Collaborations), Observation of gravitational waves from a binary black hole merger, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
    { label: 'Carroll, Spacetime and Geometry (2004), ch. 7: perturbation theory and gravitational waves', url: 'https://doi.org/10.1017/9781108770385' },
    { label: 'Roelofs et al., Spectroscopic evidence for a 5.4 minute orbital period in HM Cancri, ApJL 711, L138 (2010)', url: 'https://doi.org/10.1088/2041-8205/711/2/L138' },
    { label: 'Agazie et al. (NANOGrav), The NANOGrav 15 yr data set: evidence for a gravitational-wave background, ApJL 951, L8 (2023)', url: 'https://doi.org/10.3847/2041-8213/acdac6' },
  ],
});
