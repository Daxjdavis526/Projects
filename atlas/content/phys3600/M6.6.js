// The magnetic dipole (Griffiths §5.4.3, 6.1.2): the multipole expansion of
// A has no monopole term (∮dl = 0); its dipole term A = (μ₀/4π) m × r̂/r²
// with m = I ∫da; the dipole field (2 cos θ r̂ + sin θ θ̂), the same shape as
// the electric dipole's far away; when a loop is a dipole (on its axis, the
// exact field against the dipole term); a spinning charged shell's moment;
// torque m × B, energy −m·B and force ∇(m·B) — pulled toward stronger field
// when aligned. Earth's field as a dipole from the IGRF-13 coefficients: its
// moment, 1/r³ with altitude, twice as strong at the poles, the dip angle
// tan I = 2 tan λ. Transfers: why a magnetorquer feels a torque but almost
// no force; electromagnetic formation flying. The contact term that splits
// hydrogen's 21-cm line closes the lesson. Torque on a coil and CubeSat
// magnetorquers in their intro form are phys2220.B1.4.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, KM, PI, DEG, sf, loopAxis, circle, bare } from './_mag.js';

const t = String.raw;
// IGRF-13 dipole coefficients for 2020.0 (nT) and the reference radius
const G10 = -29404.8, G11 = -1450.9, H11 = 4652.5, RE = 6371.2e3;
const B0 = Math.hypot(G10, G11, H11) * 1e-9;                 // equatorial surface field of the centred dipole, T
const M_EARTH = (4 * PI * RE ** 3 * B0) / MU0;                // A·m²
const B0uT = +(B0 * 1e6).toFixed(2);

/** Dipole field lines r = L cos²θ (axis vertical) on both sides, for the given L values. */
const lines = (Ls, color = 'violet') => Ls.flatMap((L) => {
  const th = Math.acos(1 / Math.sqrt(L)) * 0.999;
  return [{ polar: `${L}*cos(theta)^2`, theta: [-th, th], color, width: 1.3 }, { polar: `${L}*cos(theta)^2`, theta: [PI - th, PI + th], color, width: 1.3 }];
});
/** Earth (radius 1) with its dipole field lines; extra params merge in. */
const earth = (extra = {}, Ls = [1.5, 2.2, 3.2, 4.5]) => ({
  ...bare([-3.4, 3.4], [-1.62, 1.62]),
  shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'accent', alpha: 0.3 }],
  curves: [...lines(Ls), circle(1, 'accent'), { param: ['0', 't'], t: [-1.55, 1.55], color: 'ink4', width: 1, dash: [3, 5] }],
  ...extra,
});
/** Components of a dipole's field direction (axis vertical, moment pointing down like Earth's) at latitude λ (in units of its size there). */
const dirX = (lam) => -3 * Math.sin(lam) * Math.cos(lam), dirY = (lam) => Math.cos(lam) ** 2 - 2 * Math.sin(lam) ** 2;

/** A small dipole (a current loop seen edge-on) with its field lines, for a generic picture. */
const dipolePic = (caption, extra = {}) => ({
  type: 'graph',
  params: { ...bare([-3.4, 3.4], [-1.62, 1.62]), curves: [...lines([0.8, 1.4, 2.2, 3.4]), { param: ['0.25*cos(t)', '0.08*sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }], arrows: [{ from: [0, -0.35], to: [0, 0.35], color: 'gold', width: 2.6, label: 'm', labelDx: 6, labelDy: 4 }], ...extra },
  caption,
});

export default lesson({
  id: 'phys3600.M6.6',
  title: 'The magnetic dipole',
  minutes: 18, difficulty: 3,
  equation: t`\vec B_{\text{dip}}(\vec r) = \frac{\mu_0m}{4\pi r^3}\left(2\cos\theta\,\hat r + \sin\theta\,\hat\theta\right), \qquad \vec m = I\int d\vec a`,
  intro: t`Expand the vector potential of a current loop in powers of $r'/r$, as [M4.5](#/lesson/phys3600.M4.5) did for $V$. The monopole term is $\dfrac{\mu_0I}{4\pi r}\oint d\vec l\,'$ — and the vector sum of the steps round a closed loop is **zero**: no magnetic monopole, ever. The leading term is the **dipole**, $\vec A = \dfrac{\mu_0}{4\pi}\dfrac{\vec m\times\hat r}{r^2}$, with the magnetic moment $\vec m = I\vec a$, the current times the loop’s vector area. Its curl is the field above: far away, exactly the shape of an electric dipole’s field, with $\theta$ measured from $\vec m$. In a field a dipole feels a torque $\vec N = \vec m\times\vec B$, has energy $U = -\vec m\cdot\vec B$, and, if the field varies, a force $\vec F = \nabla(\vec m\cdot\vec B)$. You met the torque on a coil in [Physics II](#/lesson/phys2220.B1.4); here is the field such a coil makes — and the planet-sized dipole every satellite flies through.`,
  symbols: [
    { tex: '\\vec m', text: t`the magnetic dipole moment, in $\text{A·m}^2$: current times vector area, by the right-hand rule` },
    { tex: 'r,\\ \\theta', text: t`distance from the dipole (m) and angle from $\vec m$` },
    { tex: '\\hat r,\\ \\hat\\theta', text: 'unit vectors away from the dipole and toward increasing θ' },
    { tex: '\\mu_0', text: t`the vacuum permeability, $${tex(MU0, 9)}\ \text{N/A}^2$` },
    { tex: 'd\\vec a', text: t`a patch of a surface spanning the loop, in m² (for a flat loop, $\int d\vec a$ is its area along its normal)` },
  ],
  why: t`Earth’s field is close to a dipole of $7.7\times10^{22}\ \text{A·m}^2$; every electron and proton carries a magnetic moment; and the dipole–dipole interaction of hydrogen’s electron and proton gives the 21-cm line that maps the Milky Way.`,
  visual: {
    type: 'graph',
    title: 'Flying through Earth’s dipole',
    lead: t`Earth (blue) as a centred dipole, seen in a slice through its magnetic axis (dashed); its moment points roughly south, so field lines (violet) leave the southern hemisphere and enter the northern. Move the satellite in magnetic latitude and altitude: the gold arrow shows the field’s direction there.`,
    tasks: [
      t`At the magnetic equator the field is horizontal, pointing north. Slide toward a pole: it tips steeply downward and doubles in strength — the factor $\sqrt{1 + 3\sin^2\lambda}$.`,
      t`Raise the altitude from 400 km (the ISS) to 6400 km — one Earth radius up: the field falls eightfold, as $1/r^3$.`,
      t`Read the dip angle: at latitude 45° it is $\arctan 2 \approx 63°$, not 45°. Field lines are steeper than the latitude suggests.`,
    ],
    params: earth({
      sliders: [
        { key: 'lat', label: t`Magnetic latitude $\lambda$`, min: -80, max: 80, step: 1, value: 30, unit: '^\\circ', explain: 'Measured from the magnetic equator, positive toward the magnetic north pole.' },
        { key: 'alt', label: 'Altitude', min: 300, max: 12000, step: 50, value: 600, unit: t`\text{km}`, explain: 'Height above the reference sphere of radius 6371.2 km.' },
      ],
      points: [{ x: '(1 + alt/6371.2)*cos(lat*pi/180)', y: '(1 + alt/6371.2)*sin(lat*pi/180)', r: 6, color: 'good', label: 'satellite', labelDx: 10, labelDy: 12 }, { x: 0.06, y: 1.45, r: 0, label: 'magnetic axis', labelDx: 0, color: 'ink3' }],
      arrows: [
        { from: [0, 0.45], to: [0, -0.45], color: 'gold', width: 2.6, label: 'm', labelDx: 8, labelDy: 4 },
        { from: ['(1 + alt/6371.2)*cos(lat*pi/180)', '(1 + alt/6371.2)*sin(lat*pi/180)'], to: ['(1 + alt/6371.2)*cos(lat*pi/180) + 0.6*(-3*sin(lat*pi/180)*cos(lat*pi/180))/sqrt(1 + 3*sin(lat*pi/180)^2)', '(1 + alt/6371.2)*sin(lat*pi/180) + 0.6*(cos(lat*pi/180)^2 - 2*sin(lat*pi/180)^2)/sqrt(1 + 3*sin(lat*pi/180)^2)'], color: 'gold', width: 2.6, label: 'B', labelDx: 6 },
      ],
      readouts: [
        { label: t`$|\vec B|$ at the satellite`, expr: `${B0uT}*(1 + alt/6371.2)^(-3)*sqrt(1 + 3*sin(lat*pi/180)^2)`, unit: t`\mu\text{T}`, digits: 3 },
        { label: 'dip below horizontal', expr: 'atan(2*tan(lat*pi/180))*180/pi', unit: t`^\circ`, digits: 3 },
      ],
    }),
    caption: t`A centred dipole with the strength of IGRF-13 (2020), $B_0 = ${B0uT}\ \mu\text{T}$ at the equator’s surface. The real field is tilted about 10° from the spin axis, offset from Earth’s centre, and has smaller higher multipoles — the South Atlantic Anomaly among them — that the model leaves out. Only the arrow’s direction is to scale.`,
  },
  example: {
    prompt: t`The IGRF-13 model gives Earth’s dipole coefficients for 2020 as $g_1^0 = ${G10}$ nT, $g_1^1 = ${G11}$ nT and $h_1^1 = ${H11}$ nT, at reference radius $R = 6371.2$ km. Find Earth’s magnetic moment, and the field 500 km up over the magnetic equator and over a magnetic pole.`,
    visual: { type: 'graph', params: earth({ arrows: [{ from: [0, 0.45], to: [0, -0.45], color: 'gold', width: 2.6, label: 'm', labelDx: 8, labelDy: 4 }], points: [{ x: 1.0785, y: 0, r: 5, color: 'good', label: 'equator, 500 km', labelDx: 8, labelDy: 14 }, { x: 0, y: 1.0785, r: 5, color: 'good', label: 'pole, 500 km', labelDx: 8, labelDy: -2 }] }), caption: 'Earth’s centred dipole and the two points asked about (altitude exaggerated by drawing). Field lines in violet.' },
    steps: [
      { label: 'Dipole strength', text: t`The three coefficients are the components of the centred dipole, so the surface field at its equator is $B_0 = \sqrt{(g_1^0)^2 + (g_1^1)^2 + (h_1^1)^2} \approx ${nice(sf(B0 * 1e9, 5))}$ nT.` },
      { label: 'Moment', text: t`At the dipole’s equator ($\theta = 90°$), $B = \mu_0m/4\pi R^3$. So $m = \dfrac{4\pi R^3B_0}{\mu_0} \approx ${tex(M_EARTH, 3)}\ \text{A·m}^2$ — the moment of billions of amperes circling a loop the size of Earth’s core.` },
      { label: '500 km up', text: t`$r = 6871.2$ km, so $B$ scales by $(R/r)^3 = ${nice(sf((RE / (RE + 5e5)) ** 3, 4))}$. Over the equator: $${nice(sf(B0 * (RE / (RE + 5e5)) ** 3 * 1e6, 3))}\ \mu\text{T}$, horizontal.` },
      { label: 'Over a pole', text: t`On the axis $2\cos\theta = 2$: twice as strong, $${nice(sf(2 * B0 * (RE / (RE + 5e5)) ** 3 * 1e6, 3))}\ \mu\text{T}$, vertical.` },
      { label: 'Honesty', text: t`The dipole carries about 90% of the field at the surface. The real field is tilted about 10° from the spin axis and weaker over the South Atlantic, where satellites take more radiation hits.` },
    ],
    answer: t`$m \approx ${tex(M_EARTH, 3)}\ \text{A·m}^2$; at 500 km, $${nice(sf(B0 * (RE / (RE + 5e5)) ** 3 * 1e6, 3))}\ \mu\text{T}$ over the equator and $${nice(sf(2 * B0 * (RE / (RE + 5e5)) ** 3 * 1e6, 3))}\ \mu\text{T}$ over a pole.`,
  },
  practice: [
    num({
      id: 'shell-moment', difficulty: 3,
      gen(r) {
        const Q = r.pick([5, 10, 20]), R = r.pick([5, 10, 15]), rpm = r.pick([3000, 6000]);
        const w = (2 * PI * rpm) / 60, m = (Q * 1e-9 * w * (R / 100) ** 2) / 3;
        return {
          prompt: t`A thin spherical shell of radius ${R} cm carries ${Q} nC spread uniformly over it and spins at ${rpm} rpm about a diameter. What is its magnetic dipole moment?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [circle(1, 'gold'), ...[-0.7, -0.35, 0, 0.35, 0.7].map((z) => ({ param: [`${Math.sqrt(1 - z * z)}*cos(t)`, `${z} + 0.18*${Math.sqrt(1 - z * z)}*sin(t)`], t: [0, 2 * PI], color: 'gold', width: 1, dash: [3, 4] }))], arrows: [{ from: [0, 1.0], to: [0, 1.22], color: 'warn', width: 2.4, label: 'ω', labelDx: 8, labelDy: 6 }] }), caption: t`The spinning shell, cut into rings of latitude (dashed): each is a loop of current $dI = \sigma\omega R\sin\theta\cdot R\,d\theta$.` },
          answer: m * 1e9, units: 'nA m^2', tol: { rel: 0.01 },
          errors: [{ value: ((Q * 1e-9 * w * (R / 100) ** 2) / 2) * 1e9, feedback: t`$Q\omega R^2/2$ is a ring’s moment, with all the charge at the full radius. Rings near the poles are smaller: integrating gives $\tfrac13$.` }],
          hints: [t`A ring at polar angle $\theta$ carries $dI = \dfrac{dq}{T} = \dfrac{\omega}{2\pi}\,\sigma\,2\pi R^2\sin\theta\,d\theta$ and has area $\pi(R\sin\theta)^2$.`, t`$m = \displaystyle\int\pi R^2\sin^2\theta\,dI = \pi\sigma\omega R^4\int_0^\pi\sin^3\theta\,d\theta = \tfrac43\pi\sigma\omega R^4 = \tfrac13Q\omega R^2$.`],
          teach: 'Moments add: build a spinning body from current loops, each contributing I × area.',
          explain: t`$\omega = ${nice(sf(w, 4))}$ rad/s and $m = \tfrac13Q\omega R^2 \approx ${tex(m, 3)}\ \text{A·m}^2$ along the spin axis. For a shell whose mass spins with its charge, $m/L = Q/2M$; the electron’s ratio is about twice that ($g \approx 2$) — one of the hints that spin is not literal rotation.`,
        };
      },
    }),
    num({
      id: 'field-at', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 5, 20]), rr = r.pick([20, 50]), th = r.pick([0, 30, 60, 90]);
        const B = ((KM * m) / (rr / 100) ** 3) * Math.sqrt(1 + 3 * Math.cos(th * DEG) ** 2);
        return {
          prompt: t`A small coil has a magnetic moment of ${m} A·m². How strong is its field ${rr} cm away, in a direction ${th}° from the moment?`,
          visual: dipolePic(t`A small current loop (orange, edge-on), its moment (gold) and field lines (violet).`, { points: [{ x: 1.5 * Math.sin(th * DEG), y: 1.5 * Math.cos(th * DEG), r: 5, color: 'good', label: `${th}°`, labelDx: 8 }] }),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((2 * KM * m) / (rr / 100) ** 3) * 1e6, feedback: t`$2\mu_0m/4\pi r^3$ holds on the axis only; off it, use $\sqrt{4\cos^2\theta + \sin^2\theta}$.` }].filter((e) => Math.abs(e.value - B * 1e6) > 0.02 * B * 1e6),
          hints: [t`$|\vec B| = \dfrac{\mu_0m}{4\pi r^3}\sqrt{4\cos^2\theta + \sin^2\theta} = \dfrac{\mu_0m}{4\pi r^3}\sqrt{1 + 3\cos^2\theta}$.`, t`$\mu_0/4\pi = 10^{-7}$ T·m/A; $r = ${rr / 100}$ m.`],
          teach: 'A dipole’s field falls as 1/r³ and is twice as strong along the moment as across it.',
          explain: t`$B = \dfrac{10^{-7}(${m})}{(${rr / 100})^3}\sqrt{1 + 3\cos^2 ${th}°} \approx ${nice(sf(B * 1e6, 3))}\ \mu\text{T}$ — compare Earth’s 25 to 65 μT, which is why a spacecraft’s magnetometer sits on a boom away from its torquers.`,
        };
      },
    }),
    num({
      id: 'when-dipole', difficulty: 3,
      gen(r) {
        const [f, name] = r.pick([[0.01, '1%'], [0.05, '5%'], [0.1, '10%']]);
        const z = 1 / Math.sqrt((1 - f) ** (-2 / 3) - 1);
        if (Math.abs(loopAxis(1, 1, z) / ((2 * KM * PI) / z ** 3) - (1 - f)) > 1e-9) throw new Error('loop check');
        return {
          prompt: t`On the axis of a circular loop of radius $R$, the exact field is $\dfrac{\mu_0IR^2}{2(R^2 + z^2)^{3/2}}$ and the dipole term alone gives $\dfrac{\mu_0m}{2\pi z^3}$ with $m = I\pi R^2$. How far out, in units of $R$, must you go for the dipole term to be within ${name} of the exact field?`,
          visual: { type: 'graph', params: { x: [-0.3, 1.5], y: [-4.5, 0.8], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'z / R', ylabel: 'B (units of μ₀I/2R)', curves: [{ fn: 'log10((1 + (10^x)^2)^(-1.5))', color: 'accent', width: 2.6 }, { fn: 'log10((10^x)^(-3))', color: 'gold', width: 2, dash: [6, 4] }], legend: [{ label: 'exact', color: 'accent' }, { label: 'dipole term', color: 'gold', dash: true }], legendAt: 'bl' }, caption: 'The on-axis field of a loop (blue) and its dipole term (gold), on log–log axes. Near the loop the dipole term overshoots; far away the two merge.' },
          answer: z, tol: { rel: 0.01 },
          errors: [{ value: 1 / Math.sqrt((1 - f) ** -2 - 1), feedback: t`The ratio is $(1 + R^2/z^2)^{-3/2}$: raise $1 - ${f}$ to the power $-2/3$, not $-2$.` }],
          hints: [t`Divide: exact ÷ dipole $= \left(\dfrac{z^2}{R^2 + z^2}\right)^{3/2} = (1 + R^2/z^2)^{-3/2}$.`, t`Set it to $1 - ${f}$: $R^2/z^2 = (1 - ${f})^{-2/3} - 1$.`],
          teach: 'A loop looks like a pure dipole only from several radii away: within 1% only beyond about 12 radii on its axis.',
          explain: t`$z/R = \left[(1 - ${f})^{-2/3} - 1\right]^{-1/2} \approx ${nice(sf(z, 3))}$. The correction falls as $(R/z)^2$ — the next multipole. That is why magnetometers on spacecraft are mounted on booms several metres long.`,
        };
      },
    }),
    mcq({
      id: 'no-monopole', difficulty: 2,
      prompt: t`In the multipole expansion of a current loop’s vector potential, why is there no monopole ($1/r$) term?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [{ polar: '1 + 0.25*cos(3*theta)', theta: [0, 2 * PI], color: 'warn', width: 2.4 }], arrows: [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * PI) / 3, ra = 1 + 0.25 * Math.cos(3 * a), b = a + 0.25, rb = 1 + 0.25 * Math.cos(3 * b); return { from: [ra * Math.cos(a), ra * Math.sin(a)], to: [rb * Math.cos(b), rb * Math.sin(b)], color: 'gold', width: 2.4 }; }) }), caption: t`A closed loop of current with a few of its steps $d\vec l\,'$ (gold). Walk all the way round and you are back where you started.` },
      choices: [t`It is $\dfrac{\mu_0I}{4\pi r}\oint d\vec l\,'$, and the steps round a closed loop add up to zero`, 'Because the current is steady', t`Because $\vec B$ is perpendicular to $\vec A$`, 'There is one, but it is cancelled by the dipole term'],
      answer: 0,
      why: {
        1: 'Steadiness is needed for magnetostatics at all, but the monopole term vanishes for a purely geometric reason.',
        2: t`$\vec A$ and $\vec B$ need not be perpendicular, and that would say nothing about the $1/r$ term.`,
        3: 'Terms of different powers of r cannot cancel each other at all distances.',
      },
      hints: [t`Write the monopole term: $\dfrac{\mu_0I}{4\pi}\dfrac1r\oint d\vec l\,'$. What is $\oint d\vec l\,'$?`],
      teach: 'A closed loop’s displacement vectors sum to zero, so magnetostatics has no monopole term — the multipole form of ∇·B = 0.',
      explain: t`$\oint d\vec l\,' = 0$: the vector sum of the steps round any closed path is the net displacement, zero. So the magnetic field falls at least as fast as a dipole’s $1/r^3$ — the expansion’s way of saying there are no magnetic charges.`,
    }),
    num({
      id: 'dip', difficulty: 2,
      gen(r) {
        const lam = r.pick([10, 20, 30, 45, 60]);
        const I = Math.atan(2 * Math.tan(lam * DEG)) / DEG;
        const L = 1.35, X = L * Math.cos(lam * DEG), Y = L * Math.sin(lam * DEG);
        return {
          prompt: t`Treat Earth’s field as a centred dipole. At a magnetic latitude of ${lam}° north, how far below the horizontal does the field point (the **dip** or inclination)?`,
          visual: { type: 'graph', params: earth({ arrows: [{ from: [0, 0.45], to: [0, -0.45], color: 'gold', width: 2.6, label: 'm', labelDx: 8, labelDy: 4 }], points: [{ x: X, y: Y, r: 5, color: 'good', label: `${lam}° N`, labelDx: 8 }] }), caption: t`Earth’s dipole field lines (violet) and the place asked about (green), drawn a little above the surface.` },
          answer: I, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: lam, feedback: t`The field is not tilted at the latitude angle: $B_r \propto 2\sin\lambda$ against $B_\lambda \propto \cos\lambda$, so $\tan I = 2\tan\lambda$.` }, { value: Math.atan(0.5 * Math.tan(lam * DEG)) / DEG, feedback: t`Inverted: the radial component carries the factor 2, so $\tan I = 2\tan\lambda$.` }],
          hints: [t`At magnetic latitude $\lambda$ (so $\theta = 90° - \lambda$ from the axis), the vertical part is $\propto 2\sin\lambda$ and the horizontal part $\propto \cos\lambda$.`, t`$\tan I = \dfrac{2\sin\lambda}{\cos\lambda} = 2\tan\lambda$.`],
          teach: 'A dipole’s field dips at tan I = 2 tan λ: steeper than the latitude everywhere except the equator and the poles.',
          explain: t`$I = \arctan(2\tan ${lam}°) \approx ${nice(sf(I, 3))}°$. Seventeenth-century navigators hoped to read latitude from a dip needle this way; the real field’s tilt and higher multipoles defeated them.`,
        };
      },
    }),
    mcq({
      id: 'force', difficulty: 3,
      prompt: t`A small magnet (a dipole) sits near one pole of a big magnet, where the field spreads out and weakens with distance. The small magnet’s moment points **along** the field. What net force does it feel?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '0.6', lower: '-0.6', from: -2.6, to: -1.7, color: 'warn', alpha: 0.3 }], curves: [-0.5, -0.25, 0, 0.25, 0.5].map((y0) => ({ param: ['-1.7 + t', `${y0}*(1 + 0.9*t)`], t: [0, 3.9], color: 'violet', width: 1.3 })), arrows: [{ from: [0.1, 0], to: [0.75, 0], color: 'gold', width: 3, label: 'm', labelDx: 4, labelDy: -8 }], points: [{ x: -2.5, y: 0.8, r: 0, label: 'pole of the big magnet', labelDx: 0, color: 'warn' }] }), caption: 'The field lines (violet) spreading from the big magnet’s pole (orange), and the small magnet’s moment (gold) pointing along them.' },
      choices: [t`Toward the big magnet, where the field is stronger: $\vec F = \nabla(\vec m\cdot\vec B)$`, 'None: a dipole feels only a torque', 'Away from the big magnet', 'Sideways, perpendicular to the field'],
      answer: 0,
      why: {
        1: t`In a **uniform** field the net force is zero; here $B$ varies, so $\nabla(\vec m\cdot\vec B) \ne 0$.`,
        2: t`That happens when $\vec m$ points against the field (energy $-\vec m\cdot\vec B$ is then lowest where $B$ is weakest).`,
        3: t`By symmetry $\vec m\cdot\vec B$ changes along the axis, not across it: the force is along the axis.`,
      },
      hints: [t`The energy is $U = -\vec m\cdot\vec B$. Where is it lowest, for $\vec m$ along $\vec B$?`, t`$\vec F = -\nabla U = \nabla(mB)$: toward increasing $B$.`],
      teach: 'An aligned dipole is drawn toward stronger field — how a magnet picks up a nail (whose induced moment lines up) and how paramagnets are pulled into fields.',
      explain: t`$U = -mB$ is lowest where $B$ is largest, so the dipole is pulled toward the pole. Microscopically, the spreading field lines tilt the forces on opposite sides of the small current loop, leaving a net push along the axis. Reverse $\vec m$ and the force reverses: that is how diamagnets are pushed out of fields.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-torquer-force', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.2, 1, 5]), h = r.pick([400, 600, 800]);
        const rr = RE + h * 1e3, B = 2 * B0 * (RE / rr) ** 3, F = (3 * m * B) / rr;
        return {
          prompt: t`A small satellite flies ${h} km above Earth’s magnetic north pole with its ${m} A·m² magnetorquer switched on and aligned with the local field, which there points straight down. Treat Earth as a centred dipole (${B0uT} μT at the equator’s surface, radius 6371.2 km). What net force does the field exert on the torquer?`,
          visual: { type: 'graph', params: earth({ arrows: [{ from: [0, 0.45], to: [0, -0.45], color: 'gold', width: 2.6, label: 'm (Earth)', labelDx: 8, labelDy: 4 }, { from: [0, 1.45], to: [0, 1.2], color: 'warn', width: 2.4 }], points: [{ x: 0, y: 1.33, r: 5, color: 'good', label: 'satellite', labelDx: 10 }] }), caption: 'The satellite over the magnetic pole (altitude exaggerated), its torquer’s moment (orange) along the downward field.' },
          answer: F * 1e12, units: 'pN', tol: { rel: 0.01 },
          errors: [{ value: m * B * 1e12, feedback: t`$mB$ has units of torque (N·m), not force. The force needs the field’s **gradient**: $F = m\,dB/dr$.` }, { value: ((m * B) / rr) * 1e12, feedback: t`$B \propto r^{-3}$, so $dB/dr = -3B/r$: a factor of 3.` }],
          hints: [t`$\vec F = \nabla(\vec m\cdot\vec B)$; on the axis $\vec m\cdot\vec B = mB(r)$ with $B = 2B_0(R/r)^3$.`, t`$|dB/dr| = 3B/r$, so $F = 3mB/r$, pointing down toward stronger field.`],
          teach: 'A dipole in Earth’s field feels a useful torque mB but almost no force, because the field changes so slowly over the spacecraft.',
          explain: t`$B = 2B_0(R/r)^3 \approx ${nice(sf(B * 1e6, 3))}\ \mu\text{T}$, so $F = 3mB/r \approx ${nice(sf(F * 1e12, 3))}$ pN. Turned across the field, the same torquer feels a torque $mB \approx ${nice(sf(m * B * 1e6, 3))}\ \mu\text{N·m}$ — enough to turn a small satellite in minutes — while the force would move it by millimetres a year. That is why magnetorquers steer attitude, never orbits.`,
        };
      },
    }),
    num({
      id: 'cp-formation', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([20, 50, 100]), d = r.pick([1, 2, 3]);
        const F = (3 * MU0 * m * m) / (2 * PI * d ** 4);
        return {
          prompt: t`**Electromagnetic formation flying** proposes holding spacecraft in formation with big coils instead of thrusters. Two spacecraft line up on a common axis, ${d} m apart, each with a coil of moment ${m} A·m² pointing along the axis the same way. On the axis one dipole’s field is $B = \dfrac{\mu_0m}{2\pi z^3}$. How strong is the force between them?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [{ param: ['-1.2 + 0.08*sin(t)', '0.55*cos(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }, { param: ['1.2 + 0.08*sin(t)', '0.55*cos(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }, { fn: '0', domain: [-2.5, 2.5], color: 'ink4', width: 1, dash: [3, 5] }], arrows: [{ from: [-1.6, 0], to: [-0.8, 0], color: 'gold', width: 2.6, label: 'm', labelDx: 0, labelDy: -10 }, { from: [0.8, 0], to: [1.6, 0], color: 'gold', width: 2.6, label: 'm', labelDx: 0, labelDy: -10 }], points: [{ x: 0, y: 0.25, r: 0, label: `${d} m`, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }] }), caption: 'Two coils (orange, edge-on) on a common axis with parallel moments (gold). Not to scale.' },
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * m * m) / (2 * PI * d ** 3)) * 1e3, feedback: t`$mB$ is an energy (J), not a force. Differentiate: $F = m\,|dB/dz| = 3mB/z$.` }, { value: ((MU0 * m * m) / (2 * PI * d ** 4)) * 1e3, feedback: 'Differentiating z⁻³ brings down a factor of 3.' }].filter((e) => Math.abs(e.value - F * 1e3) > 0.02 * F * 1e3),
          hints: [t`$F = \dfrac{d}{dz}(mB) = m\dfrac{d}{dz}\dfrac{\mu_0m}{2\pi z^3}$ in size.`, t`$F = \dfrac{3\mu_0m^2}{2\pi z^4}$, attractive for parallel moments on a common axis.`],
          teach: 'Two coaxial dipoles attract with a force falling as 1/r⁴ — strong up close, useless far away.',
          explain: t`$F = \dfrac{3\mu_0m^2}{2\pi d^4} \approx ${nice(sf(F * 1e3, 3))}$ mN, attractive. Doubling the distance cuts it 16-fold, which is why the idea suits close formations and docking, and why the coils studied for it are superconducting, with moments of thousands of A·m².`,
        };
      },
    }),
    mcq({
      id: 'cp-inside', difficulty: 4,
      prompt: t`Far away, a current loop’s field and an electric dipole’s field have the same shape. Close in they differ: at the centre of the loop $\vec B$ points **along** $\vec m$, while between the charges of an electric dipole $\vec E$ points **against** $\vec p$. Where does that difference matter?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-8, 8], y: [-5, 5], charges: [{ x: 0, y: 1.2, q: 2 }, { x: 0, y: -1.2, q: -2 }], fieldLines: true, density: 14, equip: false, grid: false, static: true, readouts: [], arrows: false }, caption: t`An electric dipole: between the charges the field lines run from $+$ to $-$, opposite to $\vec p$ (which points from $-$ to $+$). A current loop’s field lines instead run straight through its middle along $\vec m$.` },
      choices: [
        t`In the hyperfine splitting of hydrogen’s ground state — the 21-cm line — where the electron sits right on the proton’s magnetic dipole`,
        'Nowhere: point dipoles of both kinds have identical fields everywhere',
        t`Only in the far field, where the $1/r^3$ terms differ`,
        'In the torque a uniform field exerts on each',
      ],
      answer: 0,
      why: {
        1: t`Averaged over a small sphere round the dipole, the fields differ: $-\vec p/3\varepsilon_0$ for the electric one, $+\tfrac23\mu_0\vec m$ for the magnetic one. Point dipoles carry these as delta-function terms.`,
        2: 'Far away the two fields are identical in form; the difference is all at the source.',
        3: t`$\vec p\times\vec E$ and $\vec m\times\vec B$ have the same form; in a uniform field the inside structure does not matter.`,
      },
      hints: [t`The difference is concentrated at the dipole itself. Which physical system puts a particle right at another’s dipole?`, t`An s-state electron has a nonzero probability density at the nucleus.`],
      teach: 'Magnetic and electric dipoles differ only at the source — a delta-function term that sets the hyperfine splitting of s-states.',
      explain: t`A magnetic dipole made of circulating current has the field term $\tfrac23\mu_0\vec m\,\delta^3(\vec r)$; an electric dipole made of charges has $-\vec p\,\delta^3(\vec r)/3\varepsilon_0$. Hydrogen’s ground-state electron overlaps the proton, so it samples that contact term, and the resulting energy splitting — computed with the **magnetic** sign — matches the measured 1420.4 MHz (21 cm) line. The agreement shows nuclear moments are current loops, not pairs of magnetic charges.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.4.3, §6.1 and Problem 5.61', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Alken et al., International Geomagnetic Reference Field: the thirteenth generation (Earth Planets Space 73, 49, 2021)', url: 'https://doi.org/10.1186/s40623-020-01288-x' },
    { label: 'Kwon, Electromagnetic formation flight of satellite arrays (MIT SSL report, 2005)', url: 'https://dspace.mit.edu/handle/1721.1/30361' },
  ],
});
