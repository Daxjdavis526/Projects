// Energy, irradiance and momentum of light (Hecht §3.3). PHYS 3750 W12.2,
// PHYS 2220 B6.4 and PHYS 4600 M2.2–M2.3 have the vacuum basics (E₀ of
// sunlight, a square-on sail, IKAROS, LightSail 2); this lesson takes the
// optics angle and goes further: irradiance as the time-averaged Poynting
// vector, I = ½ncε₀E₀² inside a medium (the field of a fibre link), and the
// force on a flat, opaque surface of reflectance R tilted at θ: normal
// (1 + R)(IA/c)cos²θ, shear (1 − R)(IA/c)sinθcosθ; the sideways (steering)
// component 2R(IA/c)cos²θ sinθ comes only from reflected light and peaks at
// 35.3°. A transparent window feels almost nothing; at 60° an absorber and a
// mirror are pushed equally hard. Transfer: Pioneer 10's anomalous
// acceleration as the recoil of its own unevenly radiated heat.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, EPS0, PI, DEG, S_SUN, sf, nOf, MATS, bare } from './_op.js';

const t = String.raw;

// the worked example: a 100 m² aluminized sail, R = 0.90, tilted 30° at 1 AU, 20 kg
const EX = { A: 100, R: 0.9, th: 30, m: 20 };
EX.f = (S_SUN * EX.A) / C;
EX.Fn = EX.f * (1 + EX.R) * Math.cos(EX.th * DEG) ** 2;
EX.Ft = EX.f * (1 - EX.R) * Math.sin(EX.th * DEG) * Math.cos(EX.th * DEG);
EX.F = Math.hypot(EX.Fn, EX.Ft);
EX.tilt = Math.atan(EX.Ft / EX.Fn) / DEG;
EX.a = EX.F / EX.m;

/**
 * A flat sail (seen edge-on) in sunlight arriving along +x: the sail at angle th
 * (degrees) between its normal and the light, sunlight arrows, the normal, and
 * optionally the force (normal and shear parts, scaled), all as a static graph.
 */
function sailPic({ th, R = 1, force = true, parts = false, label = 'F⃗', shearScale = 1, caption, extra = {} }) {
  const c = Math.cos(th * DEG), s = Math.sin(th * DEG);
  const n = [c, s], sd = [s, -c], L = 1.3;
  const r = (v) => sf(v, 4);
  const Fn = (1 + R) * c * c, Ft = (1 - R) * s * c, k = 1.1;
  const F = [k * (Fn * n[0] + Ft * sd[0]), k * (Fn * n[1] + Ft * sd[1])];
  const sun = [-0.75, -0.25, 0.25, 0.75].map((f) => { const y = f * c * L; return { from: [-3, r(y)], to: [r(-y * Math.tan(th * DEG) - 0.08), r(y)], color: 'gold', width: 1.8 }; });
  const arrows = [...sun];
  if (force) arrows.push({ from: [0, 0], to: [r(F[0]), r(F[1])], color: 'warn', width: 3, label });
  if (parts) {
    arrows.push({ from: [0, 0], to: [r(k * Fn * n[0]), r(k * Fn * n[1])], color: 'violet', width: 2, label: 'Fₙ' });
    if (Ft > 0.002) arrows.push({ from: [0, 0], to: [r(k * shearScale * Ft * sd[0]), r(k * shearScale * Ft * sd[1])], color: 'teal', width: 2, label: shearScale === 1 ? 'Fₜ' : `Fₜ × ${shearScale}`, labelDx: 6, labelDy: 10 });
  }
  return {
    type: 'graph',
    params: bare([-3.2, 2.8], [-1.7, 1.7], {
      curves: [
        { param: [`${r(sd[0] * L)}*t`, `${r(sd[1] * L)}*t`], t: [-1, 1], color: 'ink', width: 4 },
        { param: [`${r(n[0])}*t`, `${r(n[1])}*t`], t: [-0.4, 1.6], color: 'ink3', width: 1.2, dash: [4, 4] },
      ],
      arrows,
      points: [{ x: -3, y: 1.35, r: 0, label: 'sunlight', color: 'gold' }, { x: r(-0.4 * n[0]), y: r(-0.4 * n[1]), r: 0, label: 'normal', color: 'ink3', labelAlign: 'right', labelDx: -6, labelDy: 0 }],
      ...extra,
    }),
    caption,
  };
}

export default lesson({
  id: 'phys4650.O2.2',
  title: 'Energy, irradiance and momentum of light',
  minutes: 14, difficulty: 3,
  intro: t`A light wave carries energy at the rate given by the Poynting vector $\vec S = \vec E\times\vec B/\mu_0$ ([PHYS 4600 M2.2](#/lesson/phys4600.M2.2)). Optics never sees $\vec S$ oscillating; it sees the time average, the **irradiance**. In a medium of index $n$, where $B_0 = nE_0/c$,

$$I = \langle S\rangle = \tfrac12\,n\,c\,\varepsilon_0E_0^2$$

Light also carries **momentum**: in vacuum, a beam of irradiance $I$ delivers momentum $I/c$ per unit area per second ([W12.2](#/lesson/phys3750.W12.2) found the pressure on a mirror facing the Sun). For a spacecraft the real question is a surface that is tilted and not quite a perfect mirror: it reflects a fraction $R$ and absorbs the rest, and the force on it has a part along its normal and a part along its surface.`,
  symbols: [
    { tex: 'I', text: 'the irradiance: average power per unit area crossing a surface square to the beam, in W/m²' },
    { tex: '\\langle S\\rangle', text: 'the time average of the Poynting vector’s magnitude, in W/m²' },
    { tex: 'n', text: 'the refractive index of the medium the beam is in (1 in vacuum)' },
    { tex: 'c', text: 'the speed of light in vacuum, in m/s' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}$ F/m` },
    { tex: 'E_0', text: 'the amplitude of the electric field, in V/m' },
  ],
  why: t`Irradiance is the quantity every detector, solar cell and sail responds to, and $I/c$ is the only propellant a solar sail ever needs.`,
  visual: {
    type: 'graph',
    title: 'The push on a tilted sail',
    lead: t`A flat, opaque sail reflects a fraction $R$ of the light (like a mirror) and absorbs the rest; its normal is tilted $\theta$ from the sunlight. In units of $IA/c$ (the push on a square-on absorber of area $A$): the **normal** force is $(1 + R)\cos^2\theta$, the **shear** along the surface $(1 - R)\sin\theta\cos\theta$, and the **sideways** part, at right angles to the sunlight, $2R\cos^2\theta\sin\theta$.`,
    tasks: [
      t`Set $R = 1$: the shear vanishes. A perfect mirror can only push along its own normal.`,
      t`Set $R = 0$: the sideways force vanishes at every angle — absorbed light pushes only along the beam.`,
      t`Find the tilt where the sideways (gold) curve peaks: about 35°, for any $R$. That is how sails steer and spiral outward or inward.`,
    ],
    params: {
      x: [0, 90], y: [0, 2.05], aspect: 'wide', xlabel: 'tilt θ (°)', ylabel: 'force ÷ (IA/c)', xticks: 6, yticks: 4,
      sliders: [
        { key: 'R', label: 'Reflectance $R$', min: 0, max: 1, step: 0.01, value: 0.9, explain: 'The fraction of the light reflected like a mirror; the rest is absorbed. Aluminized film: about 0.9.' },
        { key: 'th', label: 'Tilt $\\theta$', min: 0, max: 89, step: 1, value: 30, unit: '^\\circ', explain: 'Between the sail’s normal and the incoming sunlight.' },
      ],
      curves: [
        { fn: '(1 + R)*cos(x*pi/180)^2', color: 'violet', width: 2.4, label: 'normal', labelAt: 12, labelDy: -6 },
        { fn: '(1 - R)*sin(x*pi/180)*cos(x*pi/180)', color: 'teal', width: 2.4, label: 'shear', labelAt: 60, labelDy: -6 },
        { fn: '2*R*cos(x*pi/180)^2*sin(x*pi/180)', color: 'gold', width: 2.4, label: 'sideways', labelAt: 55, labelDy: -8 },
      ],
      vlines: [{ x: 'th', color: 'ink3' }],
      readouts: [
        { label: 'normal', expr: '(1 + R)*cos(th*pi/180)^2', digits: 3 },
        { label: 'shear', expr: '(1 - R)*sin(th*pi/180)*cos(th*pi/180)', digits: 3 },
        { label: 'force tilted from the normal by', expr: 'atan((1 - R)*sin(th*pi/180)/((1 + R)*cos(th*pi/180)))*180/pi', unit: '^\\circ', digits: 3 },
      ],
    },
    caption: t`A flat, smooth sail: specular reflection plus absorption, no transmission. Real films also scatter diffusely, and re-radiate the absorbed heat (front and back unequally), which adds small forces not drawn here.`,
  },
  example: {
    prompt: t`A ${EX.A} m² aluminized sail with $R = ${EX.R}$ is tilted $${EX.th}^\circ$ from the Sun at 1 AU ($I = ${S_SUN}$ W/m²). Find the normal and shear forces, the total force and its direction, and the acceleration of a ${EX.m} kg spacecraft.`,
    visual: sailPic({ th: EX.th, R: EX.R, force: false, parts: true, shearScale: 10, caption: t`The sail edge-on, with sunlight from the left. The normal force (violet) dominates; the shear (teal) is drawn ten times too long to be visible. Not to scale.` }),
    steps: [
      { label: 'The momentum arriving', text: t`The sail intercepts the beam over $A\cos\theta$, so momentum arrives at $(IA/c)\cos\theta$ per second, along the light. $IA/c = ${S_SUN}\times${EX.A}/c = ${tex(EX.f, 3)}$ N.` },
      { label: 'Absorbed part', text: t`A fraction $1 - R$ is absorbed and gives up all its momentum, along the light: $(1 - R)(IA/c)\cos\theta$. Split along the normal ($\times\cos\theta$) and the surface ($\times\sin\theta$).` },
      { label: 'Reflected part', text: t`A fraction $R$ bounces; its momentum along the surface is unchanged and its normal momentum reverses, so the sail receives $2R(IA/c)\cos\theta\cdot\cos\theta$ along the normal.` },
      { label: 'Add', text: t`$F_n = (1 + R)\dfrac{IA}{c}\cos^2\theta = ${tex(EX.Fn, 3)}$ N and $F_t = (1 - R)\dfrac{IA}{c}\sin\theta\cos\theta = ${tex(EX.Ft, 3)}$ N.` },
      { label: 'Total and direction', text: t`$F = ${tex(EX.F, 3)}$ N, tilted only $${sf(EX.tilt, 2)}^\circ$ from the normal: a good mirror is pushed almost straight along its normal.` },
      { label: 'Acceleration', text: t`$a = F/m = ${tex(EX.a, 3)}\ \text{m/s}^2$ — tiny, but it never stops: about ${sf((EX.a * 86400 * 30), 2)} m/s of $\Delta v$ a month with no propellant.` },
    ],
    answer: t`$F_n \approx ${tex(EX.Fn, 3)}$ N, $F_t \approx ${tex(EX.Ft, 3)}$ N, total $${tex(EX.F, 3)}$ N at $${sf(EX.tilt, 2)}^\circ$ from the normal; $a \approx ${tex(EX.a, 3)}$ m/s².`,
  },
  practice: [
    num({
      id: 'irradiance-medium', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'water', 'sapphire', 'silica']), nm = r.pick([532, 633, 1064]), E0 = r.pick([200, 500, 1200, 3000]);
        const n = nOf(mat, nm), I = 0.5 * n * C * EPS0 * E0 * E0;
        return {
          prompt: t`Inside ${MATS[mat].name} ($n = ${sf(n, 4)}$ at ${nm} nm) a beam’s electric-field amplitude is ${E0} V/m. What is its irradiance, in W/m²?`,
          visual: { type: 'graph', params: { x: [0, 12.57], y: [0, 1.15], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: 'S/Smax', yticks: 3, curves: [{ fn: 'cos(x)^2', color: 'accent', width: 2 }], hlines: [{ y: 0.5, color: 'gold', label: 'average' }] }, caption: t`The Poynting vector at one point oscillates between 0 and its peak; the irradiance is its average, half the peak.` },
          answer: I, units: 'W/m^2', tol: { rel: 0.005 },
          errors: [{ value: I / n, feedback: t`That is the vacuum formula. In a medium $B_0 = nE_0/c$, so $I = \tfrac12 nc\varepsilon_0E_0^2$.` }, { value: 2 * I, feedback: t`That is the peak of $S$; the average of $\cos^2$ is $\tfrac12$.` }],
          hints: [t`$\langle S\rangle = E_0B_0/2\mu_0$, and in the medium $B_0 = nE_0/c$.`, t`$I = \tfrac12 nc\varepsilon_0E_0^2$.`],
          teach: t`Inside a medium the same $E_0$ carries $n$ times the irradiance it would in vacuum, because $B_0$ is $n$ times larger: $I = \tfrac12nc\varepsilon_0E_0^2$.`,
          explain: t`$I = \tfrac12(${sf(n, 4)})c\varepsilon_0(${E0})^2 = ${tex(I, 3)}$ W/m².`,
        };
      },
    }),
    num({
      id: 'fibre-field', difficulty: 3,
      gen(r) {
        const P = r.pick([10, 50, 100, 200]), mfd = r.pick([9.2, 10.4]), n = 1.4682;
        const I = P * 1e-3 / (PI * (mfd * 1e-6 / 2) ** 2), E0 = Math.sqrt((2 * I) / (n * C * EPS0));
        return {
          prompt: t`A fibre link carries ${P} mW of 1550 nm light in a single-mode fibre. Treat the light as spread evenly over a circle ${mfd} µm across (the mode-field diameter) in glass of $n = ${n}$. What is the electric-field amplitude in the core, in kV/m?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.6, 1.6], { curves: [{ param: ['1.4*cos(t)', '1.4*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 2 }, { param: ['0.45*cos(t)', '0.45*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }], shade: [{ fn: 'sqrt(max(0.2025 - x^2, 0))', lower: '-sqrt(max(0.2025 - x^2, 0))', from: -0.45, to: 0.45, color: 'warn', alpha: 0.5 }], points: [{ x: 0, y: 0.6, r: 0, label: `${mfd} µm`, color: 'warn', labelAlign: 'center', labelDx: 0, labelDy: -6 }, { x: 1.45, y: 1.1, r: 0, label: 'cladding', color: 'ink3' }] }), caption: t`The fibre end-on: the light (orange) fills a spot about the size of the core. A top-hat spot is a simplification; the real mode is close to a Gaussian.` },
          answer: E0 / 1000, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((2 * I) / (C * EPS0)) / 1000, feedback: t`Include the index: inside glass $I = \tfrac12nc\varepsilon_0E_0^2$.` }, { value: Math.sqrt((2 * P * 1e-3 / (PI * (mfd * 1e-6) ** 2)) / (n * C * EPS0)) / 1000, feedback: t`Use the radius, half the ${mfd} µm diameter, in the area $\pi r^2$.` }],
          hints: [t`First the irradiance: $I = P/\pi r^2$ with $r = ${mfd / 2}$ µm.`, t`Then $E_0 = \sqrt{2I/nc\varepsilon_0}$.`],
          teach: t`Squeezing modest power into a few-micrometre core makes enormous irradiance and fields — which is why fibres show nonlinear effects at milliwatts.`,
          explain: t`$I = ${P}\times10^{-3}/\pi(${mfd / 2}\times10^{-6})^2 = ${tex(I, 3)}$ W/m², so $E_0 = \sqrt{2I/nc\varepsilon_0} = ${tex(E0 / 1000, 3)}$ kV/m — hundreds of thousands of times sunlight’s irradiance.`,
        };
      },
    }),
    num({
      id: 'partial-mirror', difficulty: 2,
      gen(r) {
        const R = r.pick([0.04, 0.3, 0.5, 0.75, 0.92]), P = r.pick([1, 5, 20]);
        const F = ((1 + R) * P * 1e3) / C;
        return {
          prompt: t`A ${P} kW laser beam strikes an opaque plate square-on. The plate reflects ${sf(R * 100, 3)}% of the light straight back and absorbs the rest. What force does the light exert on it, in μN?`,
          visual: sailPic({ th: 0, R, caption: t`The plate edge-on, the beam arriving from the left. Not to scale.` }),
          answer: F * 1e6, units: 'μN', tol: { rel: 0.005 },
          errors: [{ value: (P * 1e3 / C) * 1e6, feedback: 'That is a perfect absorber. The reflected part reverses its momentum, so it pushes twice as hard.' }, { value: (2 * P * 1e3 / C) * 1e6, feedback: 'That is a perfect mirror. Only the fraction R is reflected; the rest is absorbed.' }, { value: (R * P * 1e3 / C) * 1e6, feedback: 'The absorbed light pushes too: (1 − R) of it, with momentum P/c per second.' }],
          hints: [t`Absorbed light delivers its momentum once; reflected light delivers it twice.`, t`$F = (1 - R)\dfrac{P}{c} + 2R\dfrac{P}{c} = (1 + R)\dfrac{P}{c}$.`],
          teach: t`At normal incidence an opaque surface of reflectance $R$ feels $(1 + R)P/c$.`,
          explain: t`$F = (1 + ${R})(${P}\times10^{3})/c = ${sf(F * 1e6, 3)}$ μN.`,
        };
      },
    }),
    mcq({
      id: 'window', difficulty: 2,
      prompt: t`A strong laser beam passes square-on through a thick window with perfect anti-reflection coatings: no light is reflected or absorbed. What net force does the beam exert on the window?`,
      visual: { type: 'graph', params: bare([-3, 3], [-1.4, 1.4], { shade: [{ fn: '1', lower: '-1', from: -0.5, to: 0.5, color: 'teal', alpha: 0.25 }], arrows: [{ from: [-2.9, 0], to: [-0.55, 0], color: 'gold', width: 3, label: 'in' }, { from: [0.55, 0], to: [2.9, 0], color: 'gold', width: 3, label: 'out' }] }), caption: t`The window side-on with the beam passing through. Not to scale.` },
      choices: ['Essentially zero: the light leaves with the momentum it brought.', 'P/c, as for an absorber, because the light enters it.', '2P/c, as for a mirror.', '(n − 1)P/c, because the light slows down inside.'],
      answer: 0,
      why: {
        1: 'An absorber keeps the momentum. Here every photon leaves again, in the same direction.',
        2: 'Nothing is turned back, so the momentum is never reversed.',
        3: 'The beam is slower inside, but it speeds up again on the way out: the pushes at the two faces cancel. (While the pulse is inside there is a small, temporary push — the Abraham–Minkowski question.)',
      },
      hints: ['Compare the light’s momentum before and after the window.'],
      teach: 'The force on any object equals the rate at which light’s momentum changes on passing it; transmission without deflection changes nothing.',
      explain: t`Momentum in = momentum out, so the net force is zero. An uncoated window reflects about 4% at each face (O3.4), so in practice it feels about $(2\times0.04)\times2P/c$ — still small.`,
    }),
    num({
      id: 'tilt-normal', difficulty: 2,
      gen(r) {
        const th = r.pick([20, 30, 40, 50, 60]), R = r.pick([0.85, 0.9, 0.95]);
        const f = ((1 + R) * Math.cos(th * DEG) ** 2) / (1 + R);
        return {
          prompt: t`A sail with $R = ${R}$ is turned from facing the Sun square-on to a tilt of $${th}^\circ$. By what factor does the **normal** force change? (Give the new normal force divided by the old one.)`,
          visual: sailPic({ th, R, force: false, caption: t`The sail tilted $${th}^\circ$; sunlight from the left. Not to scale.` }),
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: Math.cos(th * DEG), feedback: t`Two factors of $\cos\theta$: the sail catches less light ($A\cos\theta$), and each photon’s push has only a $\cos\theta$ normal part.` }],
          hints: [t`$F_n = (1 + R)\dfrac{IA}{c}\cos^2\theta$.`],
          teach: t`Tilting a flat sail by $\theta$ cuts its normal force by $\cos^2\theta$: one cosine for the light caught, one for the direction of the push.`,
          explain: t`The ratio is $\cos^2${th}^\circ = ${sf(f, 3)}$ — independent of $R$.`,
        };
      },
    }),
    num({
      id: 'sideways', difficulty: 3,
      gen(r) {
        const A = r.pick([40, 80, 150, 400]), R = r.pick([0.85, 0.9]), th = r.pick([25, 35, 45]), d = r.pick([0.7, 1, 1.5]);
        const I = S_SUN / (d * d), side = (2 * R * I * A / C) * Math.cos(th * DEG) ** 2 * Math.sin(th * DEG);
        return {
          prompt: t`A ${A} m² sail with $R = ${R}$ is ${d} AU from the Sun (sunlight $${S_SUN}/d^2$ W/m², $d$ in AU), tilted $${th}^\circ$. What is the component of the light’s force **perpendicular to the sunlight** — the part that can change its orbital speed — in mN?`,
          visual: sailPic({ th, R, caption: t`Sunlight from the left; the force (orange) leans away from the beam’s line. Not to scale.` }),
          answer: side * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: ((1 + R) * I * A / C) * Math.cos(th * DEG) ** 2 * Math.sin(th * DEG) * 1e3, feedback: t`The absorbed light pushes only along the beam, so it adds nothing sideways: use $2R$, not $1 + R$.` }, { value: (2 * R * I * A / C) * Math.cos(th * DEG) ** 2 * 1e3, feedback: t`That is the reflected part of the normal force; its sideways component carries another factor $\sin\theta$.` }],
          hints: [t`Only reflection pushes sideways: reflected momentum adds $2R(IA/c)\cos^2\theta$ along the normal.`, t`The normal is tilted $\theta$ from the sunlight, so its sideways part is that times $\sin\theta$.`],
          teach: t`A sail’s steering force, $2R\frac{IA}{c}\cos^2\theta\sin\theta$, comes entirely from reflection.`,
          explain: t`$I = ${sf(I, 4)}$ W/m², and $2R\frac{IA}{c}\cos^2\theta\sin\theta = ${tex(side * 1e3, 3)}$ mN.`,
        };
      },
    }),
    mcq({
      id: 'absorber-vs-mirror', difficulty: 3,
      prompt: t`Sunlight falls at $60^\circ$ from the normal on two plates of the same area: a perfect absorber and a perfect mirror. Which feels the larger **total** force?`,
      visual: sailPic({ th: 60, R: 1, caption: t`A plate tilted $60^\circ$ from the sunlight, edge-on. Not to scale.` }),
      choices: ['They feel forces of equal size, in different directions.', 'The mirror, always twice as much.', 'The absorber, because it catches all the light.', 'The mirror, but only √2 times as much.'],
      answer: 0,
      why: {
        1: t`Twice as much only square-on. The mirror’s push is $2\cos^2\theta$, the absorber’s $\cos\theta$ (in units of $IA/c$).`,
        2: t`Both catch the same light; but the absorber’s force, $\cos\theta$, is the larger only beyond $60^\circ$.`,
        3: t`Compute both: $2\cos^2 60^\circ = 0.5$ and $\cos 60^\circ = 0.5$.`,
      },
      hints: [t`The absorber’s force is along the beam: size $(IA/c)\cos\theta$.`, t`The mirror’s is along its normal: size $2(IA/c)\cos^2\theta$.`],
      teach: t`At grazing angles a mirror catches little light and reverses only a small normal component, so an absorber can be pushed harder.`,
      explain: t`Absorber: $\cos 60^\circ = 0.5$; mirror: $2\cos^2 60^\circ = 0.5$ (both $\times IA/c$). Equal at $60^\circ$; beyond it the absorber wins. Their directions differ: along the beam versus along the normal.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pioneer', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([58, 63, 67]), m = r.pick([241, 250]);
        const a = P / (m * C);
        return {
          prompt: t`For decades Pioneer 10 showed a tiny unexplained acceleration toward the Sun. Its nuclear power sources and electronics radiate heat; much of it bounces off the back of its big antenna dish. Suppose a net ${P} W more of that heat is radiated away from the Sun than toward it. What acceleration does the recoil give its ${m} kg, in m/s²?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.5, 1.5], { shade: [{ fn: '0.5', lower: '-0.5', from: -0.4, to: 0.4, color: 'ink3', alpha: 0.6 }], arrows: [{ from: [0.5, 0.25], to: [1.8, 0.6], color: 'bad', width: 2 }, { from: [0.5, 0], to: [1.9, 0], color: 'bad', width: 2 }, { from: [0.5, -0.25], to: [1.8, -0.6], color: 'bad', width: 2 }, { from: [-0.5, 0], to: [-1.1, 0], color: 'bad', width: 1.2 }, { from: [0, -0.9], to: [-1.0, -0.9], color: 'warn', width: 2.8, label: 'recoil', labelDx: -50, labelDy: 14 }], points: [{ x: -2.9, y: 1.2, r: 0, label: '← toward the Sun', color: 'gold' }, { x: 0.6, y: 1.0, r: 0, label: 'more heat radiated this way', color: 'bad' }] }), caption: t`The spacecraft radiating heat unevenly: the excess thermal radiation leaves away from the Sun and pushes the craft toward it. Schematic.` },
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: (2 * P) / (m * C), feedback: 'Radiated light is emitted, not reflected: its recoil is P/c, with no factor of 2.' }, { value: P / m, feedback: t`Divide by $c$: radiated power $P$ carries momentum $P/c$ per second.` }],
          hints: [t`Emitted radiation of power $P$ carries away momentum $P/c$ per second.`, t`$a = P/mc$.`],
          teach: t`Any spacecraft that radiates unevenly is a (very weak) photon rocket: thrust $P/c$.`,
          explain: t`$a = P/mc = ${P}/(${m}\times c) = ${tex(a, 3)}\ \text{m/s}^2$. The measured anomaly was $(8.74 \pm 1.33)\times10^{-10}\ \text{m/s}^2$; a detailed thermal model (Turyshev et al., 2012) showed the recoil of this anisotropic heat accounts for it — no new physics needed.`,
        };
      },
    }),
    num({
      id: 'cp-best-angle', difficulty: 3,
      prompt: t`A sail steers by tilting: its sideways force is $2R\dfrac{IA}{c}\cos^2\theta\sin\theta$. At what tilt $\theta$ is it largest, in degrees?`,
      visual: { type: 'graph', params: { x: [0, 90], y: [0, 0.8], aspect: 'wide', xlabel: 'tilt θ (°)', ylabel: 'cos²θ sin θ', xticks: 6, yticks: 4, curves: [{ fn: 'cos(x*pi/180)^2*sin(x*pi/180)', color: 'gold', width: 2.4 }] }, caption: t`The angle-dependent factor of the sideways force.` },
      answer: Math.atan(1 / Math.SQRT2) / DEG, units: 'deg', tol: { rel: 0.005 },
      errors: [{ value: 45, feedback: t`45° maximizes $\sin\theta\cos\theta$. Here the cosine is squared, which favours smaller tilts.` }],
      hints: [t`Differentiate $f(\theta) = \cos^2\theta\sin\theta$ and set $f' = 0$.`, t`$f' = \cos^3\theta - 2\cos\theta\sin^2\theta = 0$, so $\tan^2\theta = \tfrac12$.`],
      teach: t`The steering optimum, $\tan\theta = 1/\sqrt2$, balances catching light (more at small tilts) against leaning the push sideways (more at large tilts).`,
      explain: t`$f' = \cos\theta(\cos^2\theta - 2\sin^2\theta) = 0$ gives $\tan\theta = 1/\sqrt2$, $\theta = ${sf(Math.atan(1 / Math.SQRT2) / DEG, 4)}^\circ$.`,
    }),
    num({
      id: 'cp-window-field', difficulty: 2,
      gen(r) {
        const mat = r.pick(['bk7', 'sapphire', 'silica']), nm = r.pick([532, 1064]);
        const n = nOf(mat, nm);
        return {
          prompt: t`A beam crosses a window of ${MATS[mat].name} ($n = ${sf(n, 4)}$) at normal incidence. Ignore reflections, so the irradiance inside equals the irradiance outside. What is $E_0(\text{inside})/E_0(\text{outside})$?`,
          visual: { type: 'graph', params: { x: [0, 6], y: [-1.4, 1.4], aspect: 'wide', xlabel: 'x', ylabel: 'E', xticks: 0, yticks: 0, shade: [{ fn: '1.4', lower: '-1.4', from: 2, to: 4, color: 'teal', alpha: 0.15 }], curves: [{ fn: `cos(2*pi*x/0.5*(1 + ${sf(n - 1, 4)}*step(x - 2)*step(4 - x)))*(1 - (1 - ${sf(1 / Math.sqrt(n), 4)})*step(x - 2)*step(4 - x))`, color: 'accent', width: 1.8, samples: 1500 }] }, caption: t`A wave crossing the window, schematic: inside, the wavelength is shorter and — as you are to find — the amplitude smaller.` },
          answer: 1 / Math.sqrt(n), tol: { rel: 0.003 },
          errors: [{ value: 1 / n, feedback: t`$I \propto nE_0^2$, so $E_0 \propto 1/\sqrt n$ at fixed $I$.` }, { value: Math.sqrt(n), feedback: t`Larger $n$ means *more* irradiance for the same field, so the same irradiance needs a smaller field.` }],
          hints: [t`$I = \tfrac12nc\varepsilon_0E_0^2$ on both sides.`],
          teach: t`At equal irradiance the field amplitude inside a medium is smaller by $\sqrt n$, because $B_0$ is larger by $n$.`,
          explain: t`$nE_\text{in}^2 = E_\text{out}^2$, so the ratio is $1/\sqrt{${sf(n, 4)}} = ${sf(1 / Math.sqrt(n), 4)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §3.3', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'C. R. McInnes, Solar Sailing: Technology, Dynamics and Mission Applications (Springer, 1999), ch. 2', url: 'https://doi.org/10.1007/978-1-4471-3992-8' },
    { label: 'S. G. Turyshev et al., Support for the thermal origin of the Pioneer anomaly, Phys. Rev. Lett. 108, 241101 (2012)', url: 'https://arxiv.org/abs/1204.2507' },
  ],
});
