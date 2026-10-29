// Angles in degrees and radians — a radian is the angle whose arc equals the radius, so θ = s/r.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { PI, D2R, piTeX } from './_m0trig.js';

const t = String.raw;
const AS = PI / 648000;                      // one arcsecond in radians
const AU_PER_LY = 63241.077;                 // IAU: 1 ly = 9.4607e15 m, 1 AU = 1.495978707e11 m
// the ISS (worked example): mean altitude about 420 km, period about 92.9 min
const ISS = (() => { const r = 6371 + 420, T = 92.9 * 60, w = (2 * PI) / T, th = w * 600; return { r, T, w, th, s: r * th, v: r * w }; })();
// a sector of radius R through angle a (radians), drawn with its two radii
const sector = (R, a, caption, extra = {}) => ({
  type: 'graph',
  params: { x: [-1.25 * R, 1.25 * R], y: [-0.35 * R, 1.25 * R], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false,
    curves: [{ param: [`${N(R)}*cos(t)`, `${N(R)}*sin(t)`], t: [0, N(PI)], color: 'ink4', width: 1.2, dash: true }, { param: [`${N(R)}*cos(t)`, `${N(R)}*sin(t)`], t: [0, N(a)], color: 'gold', width: 4 }, { param: [`t*${N(R)}`, '0'], t: [0, 1], color: 'ink2', width: 2 }, { param: [`t*${N(R * Math.cos(a))}`, `t*${N(R * Math.sin(a))}`], t: [0, 1], color: 'ink2', width: 2 }, { param: [`${N(0.18 * R)}*cos(t)`, `${N(0.18 * R)}*sin(t)`], t: [0, N(a)], color: 'gold', width: 1.6 }],
    points: [{ x: 0, y: 0, color: 'ink2', r: 3.5, label: 'hinge', labelAlign: 'center', labelDx: 0, labelDy: 14 }, { x: N(R * Math.cos(a)), y: N(R * Math.sin(a)), color: 'ink', r: 4.5 }, { x: N(R), y: 0, color: 'ink', r: 4.5 }], ...extra },
  caption,
});

export default lesson({
  id: 'm0.M0-7.1',
  title: 'Angles in degrees and radians',
  minutes: 9, difficulty: 1,
  intro: t`Degrees split a turn into $360$ parts — a Babylonian choice. **Radians measure an angle by the arc it cuts off, in units of the radius**:

$$\theta = \frac{s}{r}$$

An angle of $1$ rad is the one whose arc is exactly one radius long, about $57.3^\circ$. A whole turn has an arc of $2\pi r$, so $2\pi\ \text{rad} = 360^\circ$, and to convert you multiply by $\pi/180$ or $180/\pi$. A radian is a ratio of two lengths, so it carries no real unit — which is why **$s = r\theta$ and $v = r\omega$ work only with $\theta$ in radians**, and why calculus says $\tfrac{d}{dx}\sin x = \cos x$ only when $x$ is in radians.`,
  symbols: [
    { tex: '\\theta', text: 'the angle at the centre of the circle, in radians (rad)' },
    { tex: 's', text: 'the length of the arc the angle cuts off, in m (any length unit)' },
    { tex: 'r', text: 'the radius of the circle, in the same length unit as $s$' },
    { tex: '\\pi', text: 'the ratio of a circle’s circumference to its diameter, $3.14159\\ldots$; $\\pi$ rad is half a turn, $180^\\circ$' },
  ],
  why: t`Every rotation in physics is in radians: angular speed $\omega$ in rad/s, the phase of a wave, the arcseconds of a star’s parallax, the $\sin x \approx x$ of a small-angle approximation. A formula with $\theta$ in it almost always assumes radians — feed it degrees and it is wrong by a factor of $57.3$.`,
  visual: {
    type: 'm0-unitcircle',
    title: 'Radians are arc length in radii',
    lead: t`Drag $P$ (or use the slider). The gold arc runs from the positive $x$-axis to $P$; the teal ticks round the rim are $1, 2, 3, \ldots$ radians — each one radius of arc apart. Change the radius $r$ too.`,
    tasks: [
      t`Put $P$ on the tick marked $1$: the angle is $57.3^\circ$ and the arc is exactly as long as the radius.`,
      t`Go all the way round: six radians and a bit fit in a turn — $2\pi \approx 6.28$.`,
      t`Hold the angle and change $r$: the arc $s$ grows with the circle, but $\theta = s/r$ stays put. That is why an angle can be measured by a ratio.`,
    ],
    params: { mode: 'circle', theta: 1, units: 'both', radianTicks: true, rslider: true, r: 1.5, legs: false },
    caption: t`Angles are measured anticlockwise from the positive $x$-axis. The teal ticks sit $1$ rad apart; the last gap, from $6$ to the start, is the leftover $2\pi - 6 \approx 0.28$ rad.`,
  },
  example: {
    prompt: t`The International Space Station circles Earth at a radius of about $r = ${ISS.r}$ km (Earth’s $6371$ km plus $420$ km of altitude), once every $92.9$ minutes. Through what angle does it move in $10$ minutes, in radians and in degrees, and how far along its orbit does it travel?`,
    visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(ISS.th), units: 'both', legs: false, controls: false, readout: false, labels: false, rlabel: 'r' }, caption: t`The orbit as a circle seen from above the North Pole, with the arc covered in $10$ minutes; the station's altitude is too small to see at this scale.` },
    steps: [
      { label: 'Angular speed', text: t`One turn is $2\pi$ rad in $92.9 \times 60 = ${nice(ISS.T)}$ s, so $\omega = \dfrac{2\pi}{${nice(ISS.T)}\ \text{s}} = ${sig(ISS.w * 1000, 4)} \times 10^{-3}\ \text{rad/s}$.` },
      { label: 'Angle', text: t`In $600$ s: $\theta = \omega t = ${sig(ISS.th, 4)}$ rad.` },
      { label: 'To degrees', text: t`Multiply by $180^\circ/\pi$: $${sig(ISS.th, 4)} \times \dfrac{180^\circ}{\pi} = ${sig(ISS.th / D2R, 4)}^\circ$. Check: $10/92.9$ of $360^\circ$ is the same.` },
      { label: 'Arc length', text: t`$s = r\theta = ${ISS.r}\ \text{km} \times ${sig(ISS.th, 4)} = ${Math.round(ISS.s)}$ km. The radian’s whole point: no conversion factor appears.` },
      { label: 'Sense check', text: t`Speed $v = r\omega = ${sig(ISS.v, 3)}$ km/s — the familiar $7.7$ km/s of low Earth orbit. Had you used $${sig(ISS.th / D2R, 4)}$ (degrees) in $s = r\theta$, you would have got $${thou(sig(ISS.r * ISS.th / D2R, 3))}$ km in ten minutes.` },
    ],
    answer: t`$\theta \approx ${sig(ISS.th, 3)}$ rad $\approx ${sig(ISS.th / D2R, 3)}^\circ$; the station travels about $${Math.round(ISS.s / 10) * 10}$ km.`,
  },
  practice: [
    num({
      id: 'deg-to-rad', difficulty: 1,
      gen(r) {
        const d = r.pick([20, 40, 75, 100, 140, 200, 250, 310]), ans = d * D2R;
        return {
          prompt: t`Convert $${d}^\circ$ to radians, to 3 significant figures.`,
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: d / D2R, feedback: t`You multiplied by $180/\pi$, which turns radians into degrees. Degrees to radians is $\times\,\pi/180$.` }, { value: d / 180, feedback: t`Close: $${d}/180$ is the angle in units of $\pi$ rad. Multiply by $\pi$ as well.` }],
          hints: [t`$180^\circ = \pi$ rad, so multiply by $\dfrac{\pi}{180^\circ}$.`],
          teach: t`Degrees to radians: multiply by $\pi/180$; a radian is about $57.3^\circ$.`,
          explain: t`$${d}^\circ \times \dfrac{\pi}{180^\circ} = \dfrac{${d}\pi}{180} = ${sig(ans, 3)}$ rad.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(ans), units: 'deg', legs: false, controls: false, readout: false, labels: false, radianTicks: true }, caption: t`The angle on the unit circle, with ticks every radian: read off roughly where it falls before you compute.` },
        };
      },
    }),
    num({
      id: 'rad-to-deg', difficulty: 1,
      gen(r) {
        const [k, q] = r.pick([[2, 3], [3, 4], [5, 6], [7, 6], [5, 4], [4, 3], [5, 3], [7, 4], [11, 6], [5, 12], [7, 12], [11, 12]]), th = (k * PI) / q;
        const ans = (k * 180) / q;
        return {
          prompt: t`Convert $${piTeX(th, 'frac')}$ rad to degrees.`,
          answer: ans, units: 'deg', tol: { rel: 1e-6, abs: 0.05 },
          errors: [{ value: (th * PI) / 180, feedback: t`You multiplied by $\pi/180$, which turns degrees into radians. Here you go the other way: $\times\,180^\circ/\pi$.` }, { value: ans * PI, feedback: t`Replace $\pi$ by $180^\circ$ — do not keep a $\pi$ as well.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Replace $\pi$ by $180^\circ$.`],
          teach: t`In an angle written as a fraction of $\pi$, $\pi$ rad is simply $180^\circ$.`,
          explain: t`$${piTeX(th, 'frac')} \to \dfrac{${k} \times 180^\circ}{${q}} = ${nice(ans)}^\circ$.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(th % (2 * PI)), units: 'rad', legs: false, controls: false, readout: false, labels: false }, caption: t`The angle on the unit circle${th > 2 * PI ? ', after one full turn' : ''}.` },
        };
      },
    }),
    num({
      id: 'arc-length', difficulty: 2,
      gen(r) {
        const R = r.pick([4.5, 6, 7.5, 9]), d = r.pick([60, 75, 90, 110, 120]), ans = R * d * D2R;
        return {
          prompt: t`A spacecraft’s solar array swings open on a hinge. Its tip, $${R}$ m from the hinge, turns through $${d}^\circ$. How far does the tip travel?`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: R * d, feedback: t`$s = r\theta$ needs $\theta$ in radians. With degrees you get a number $57.3$ times too big — longer than the whole circle.` }],
          hints: [t`Convert the angle to radians first.`, t`$s = r\theta = ${R} \times ${d}^\circ \times \dfrac{\pi}{180^\circ}$.`],
          teach: t`Arc length is radius times angle, $s = r\theta$, with $\theta$ in radians.`,
          explain: t`$\theta = ${d}^\circ = ${sig(d * D2R, 4)}$ rad, so $s = ${R} \times ${sig(d * D2R, 4)} = ${sig(ans, 3)}$ m.`,
          visual: sector(R, d * D2R, t`The tip’s path (gold) is an arc of a circle of radius $${R}$ m about the hinge; to scale.`),
        };
      },
    }),
    mcq({
      id: 'calc-mode', difficulty: 2,
      prompt: t`A student types sin(30) into a calculator, expecting $0.5$, and gets $-0.988$. What happened?`,
      visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(30 - 8 * PI), range: [-0.1, 2 * PI], units: 'rad', legs: true, controls: false, readout: false, labels: false, arc: false }, caption: t`Where an angle of $30$ rad lands: $30$ rad is $4.77$ turns, ending just past $3\pi/2$, where the sine is close to $-1$.` },
      choices: ['The calculator was in radian mode, so it found the sine of 30 radians.', 'The calculator was in degree mode, so it found the sine of 30 degrees.', 'sin(30°) really is about −0.988; 0.5 is the cosine.', 'The calculator found the sine of 30π radians.'],
      answer: 0,
      why: {
        1: t`In degree mode it would print exactly $0.5$, the student’s expectation.`,
        2: t`$\sin 30^\circ = 0.5$ exactly, from the half-equilateral triangle. $\cos 30^\circ \approx 0.866$.`,
        3: t`$\sin(30\pi) = 0$: $30\pi$ is a whole number of half turns.`,
      },
      hints: [t`Thirty radians is about how many turns? Divide by $2\pi$.`],
      teach: t`A bare angle with no degree sign is read in radians: $\sin(30) = \sin(30\ \text{rad})$.`,
      explain: t`$30$ rad $= 30/2\pi \approx 4.77$ turns, ending at about $279^\circ$, where $\sin \approx -0.988$. Programming languages (Python’s \`math.sin\`, NumPy, spreadsheets) always work in radians, so convert first.`,
    }),
    num({
      id: 'rpm-omega', difficulty: 2,
      gen(r) {
        const n = r.pick([1500, 2400, 3600, 4500, 6000]), ans = (n * 2 * PI) / 60;
        return {
          prompt: t`A satellite’s reaction wheel — a flywheel spun up or down to turn the spacecraft — runs at $${n}$ revolutions per minute (rpm). What is its angular speed $\omega$ in rad/s?`,
          answer: ans, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: n / 60, feedback: t`$${n}/60 = ${nice(n / 60)}$ is revolutions per second. Each revolution is $2\pi$ rad.` }, { value: (n * 360) / 60, feedback: t`That is degrees per second. Count each revolution as $2\pi$ rad, not $360^\circ$.` }],
          hints: [t`One revolution is $2\pi$ rad and one minute is $60$ s.`],
          teach: t`Angular speed in rad/s is revolutions per second times $2\pi$.`,
          explain: t`$\omega = ${n} \times \dfrac{2\pi\ \text{rad}}{60\ \text{s}} = ${sig(ans, 4)}$ rad/s.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(2 * PI), units: 'rad', legs: false, controls: false, readout: false, labels: false, radianTicks: true }, caption: t`One revolution: a full $2\pi \approx 6.28$ rad of arc, in units of the radius.` },
        };
      },
    }),
    {
      type: 'slider', id: 'place-rad', difficulty: 2,
      gen(r) {
        const a = r.pick([2.5, 4, 5.5, 1.5]);
        return {
          prompt: t`Drag $P$ to the angle whose arc is $${a}$ times the radius.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: 0.3, units: 'rad', legs: false, controls: false, readout: false, labels: false }, caption: t`The unit circle. Angles are measured anticlockwise from the positive $x$-axis.` },
          param: 'theta', answer: [a - 0.09, a + 0.09],
          instruction: 'Drag P round the circle, then check.',
          hints: [t`An arc of $${a}$ radii is an angle of $${a}$ rad. Compare it with $\pi/2 \approx 1.57$, $\pi \approx 3.14$ and $3\pi/2 \approx 4.71$.`, t`In degrees, $${a}$ rad is $${sig(a / D2R, 3)}^\circ$.`],
          teach: t`An angle of $\theta$ rad cuts off an arc $\theta$ radii long — that is the definition of the radian.`,
          explain: t`$${a}$ rad $= ${sig(a / D2R, 3)}^\circ$: ${a < PI / 2 ? 'just short of a quarter turn' : a < PI ? 'in the second quadrant, short of half a turn' : a < 1.5 * PI ? 'in the third quadrant, past half a turn' : 'in the fourth quadrant, past three-quarters of a turn'}.`,
        };
      },
    },
    num({
      id: 'moon-size', difficulty: 2,
      prompt: t`The Moon, at a mean distance of $384\,400$ km, spans an angle of $0.518^\circ$ in the sky. Treating that small angle as an arc, $s \approx r\theta$, estimate the Moon’s diameter.`,
      answer: 384400 * 0.518 * D2R, units: 'km', tol: { rel: 0.01 },
      errors: [{ value: 384400 * 0.518, feedback: t`$\theta$ must be in radians. $0.518^\circ$ is only $${sig(0.518 * D2R, 3)}$ rad.` }],
      hints: [t`Convert $0.518^\circ$ to radians.`, t`$s \approx 384\,400\ \text{km} \times ${sig(0.518 * D2R, 4)}$.`],
      teach: t`For a small angle, the arc and the straight chord are almost the same, so size $\approx$ distance $\times$ angle in radians.`,
      explain: t`$\theta = 0.518 \times \pi/180 = ${sig(0.518 * D2R, 4)}$ rad, so $D \approx 384\,400 \times ${sig(0.518 * D2R, 4)} = ${Math.round(384400 * 0.518 * D2R)}$ km. The measured diameter is $3474.8$ km: the arc and the straight chord differ by only about three parts in a million here; the small gap from the true size comes from the rounded angle.`,
      visual: { type: 'graph', params: { x: [-0.6, 10.6], y: [-1.6, 1.6], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['10*t', 't'], t: [0, 1], color: 'ink2', width: 1.6 }, { param: ['10*t', '-t'], t: [0, 1], color: 'ink2', width: 1.6 }, { param: ['10 + cos(t)', 'sin(t)'], t: [0, N(2 * PI)], color: 'ink3', width: 2 }, { param: ['10*cos(t)', '10*sin(t)'], t: [N(-0.0997), N(0.0997)], color: 'gold', width: 3 }], points: [{ x: 0, y: 0, color: 'accent', r: 5, label: 'observer', labelDx: 0, labelDy: 16, labelAlign: 'center' }, { x: 10, y: 0, r: 0, label: 'Moon', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.6, y: 0, r: 0, label: 'θ', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`Not to scale: the real angle is about $20$ times thinner than drawn. The gold arc and the Moon’s diameter are nearly the same length when $\theta$ is small.` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rad-deg', difficulty: 1,
      gen(r) {
        const th = r.pick([0.8, 1.2, 2.2, 3.5, 4.4, 5.0]), ans = th / D2R;
        return {
          prompt: t`An attitude-control log gives a rotation of $${th}$ rad. What is that in degrees, to 3 significant figures?`,
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: th * D2R, feedback: t`That multiplies by $\pi/180$, the wrong way round: radians to degrees is $\times\,180^\circ/\pi$.` }, { value: th * 180, feedback: t`Multiply by $180^\circ/\pi$, not by $180^\circ$: the angle is $${th}$ rad, not $${th}\pi$ rad.` }],
          hints: [t`$1$ rad $= 180^\circ/\pi \approx 57.3^\circ$.`],
          teach: t`Radians to degrees: multiply by $180/\pi$.`,
          explain: t`$${th} \times \dfrac{180^\circ}{\pi} = ${sig(ans, 3)}^\circ$.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: th, units: 'rad', legs: false, controls: false, readout: false, labels: false, radianTicks: true }, caption: t`The rotation drawn on the unit circle, with ticks every radian.` },
        };
      },
    }),
    num({
      id: 'cp-gps-arc', difficulty: 2, transfer: true,
      gen(r) {
        const hrs = r.pick([1, 2, 3]), R = 26560, T = 11.967, th = (2 * PI * hrs) / T, ans = R * th;
        return {
          prompt: t`A GPS satellite orbits at a radius of $26\,560$ km, once every $11.967$ hours (half a sidereal day). How far along its orbit does it travel in $${hrs}$ hour${hrs > 1 ? 's' : ''}?`,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: R * (360 * hrs) / T, feedback: t`You used the angle in degrees in $s = r\theta$. Use radians: $\theta = 2\pi \times ${hrs}/11.967$.` }, { value: (2 * PI * R) / T, feedback: t`That is the distance in one hour; multiply by $${hrs}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The angle swept is $\theta = 2\pi \times \dfrac{${hrs}}{11.967}$ rad.`, t`Then $s = r\theta$.`],
          teach: t`Angle swept $= \omega t$ with $\omega = 2\pi/T$; distance along the orbit $= r\theta$.`,
          explain: t`$\theta = 2\pi \times ${hrs}/11.967 = ${sig(th, 4)}$ rad, so $s = 26\,560 \times ${sig(th, 4)} = ${Math.round(ans)}$ km — about $${sig(ans / (3600 * hrs), 3)}$ km/s.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(th), units: 'rad', legs: false, controls: false, readout: false, labels: false }, caption: t`The orbit as a circle, with the arc covered (gold). A real GPS orbit is very nearly circular, tilted $55^\circ$ to the equator.` },
        };
      },
    }),
    num({
      id: 'cp-parallax', difficulty: 3, transfer: true,
      gen(r) {
        const [name, mas] = r.pick([['Proxima Centauri', 768.07], ['Barnard’s Star', 546.98], ['Sirius', 379.21], ['Vega', 130.23]]);
        const p = sig(mas / 1000, 5), pr = p * AS, dAU = 1 / pr, ans = dAU / AU_PER_LY;
        return {
          prompt: t`As Earth swings round the Sun, ${name} appears to shift back and forth. Its **parallax** — the angle that the $1$ AU radius of Earth’s orbit subtends at the star — is $${p}$ arcseconds ($1'' = 1/3600$ of a degree). Using the small-angle approximation $1\ \text{AU} \approx d\,\theta$, how far away is it, in light-years? ($1$ ly $= 63\,241$ AU.)`,
          answer: ans, units: 'ly', tol: { rel: 0.01 },
          errors: [{ value: 1 / p / AU_PER_LY, feedback: t`An arcsecond is not a radian: $1'' = \pi/648\,000 \approx 4.848 \times 10^{-6}$ rad. Convert before dividing.` }, { value: (1 / (p / 3600)) / AU_PER_LY, feedback: t`You converted to degrees but stopped there. $d = 1\ \text{AU}/\theta$ needs $\theta$ in radians.` }],
          hints: [t`Convert the parallax to radians: $\theta = ${p} \times \dfrac{\pi}{180 \times 3600}$.`, t`Then $d = 1\ \text{AU}/\theta$, in AU; divide by $63\,241$ for light-years.`],
          teach: t`The small-angle approximation $s \approx d\theta$ needs $\theta$ in radians; one arcsecond is $4.848 \times 10^{-6}$ rad.`,
          explain: t`$\theta = ${p}'' = ${tex2(pr)}$ rad, so $d = 1/\theta = ${thou(sig(dAU, 4))}$ AU $= ${sig(ans, 3)}$ ly. Parallaxes from the Gaia and Hipparcos satellites.`,
          visual: { type: 'graph', params: { x: [-1.3, 10.6], y: [-1.6, 1.6], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, N(2 * PI)], color: 'ink4', width: 1.4, dash: true }, { param: ['10*t', '1 - t'], t: [0, 1], color: 'ink2', width: 1.4 }, { param: ['10*t', '0'], t: [0, 1], color: 'ink2', width: 1.4 }, { param: ['0', 't'], t: [0, 1], color: 'accent', width: 3 }], points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'Sun', labelDx: -12, labelDy: 14, labelAlign: 'center' }, { x: 0, y: 1, color: 'accent', r: 4.5, label: 'Earth', labelDx: -24, labelDy: -10 }, { x: 10, y: 0, color: 'ink', r: 4, label: 'star', labelDx: 8, labelDy: -10 }, { x: 0, y: 0.5, r: 0, label: '1 AU', color: 'accent', labelDx: 8, labelDy: 0 }, { x: 8.9, y: 0.04, r: 0, label: 'θ', color: 'gold', labelDx: 0, labelDy: -8, labelAlign: 'center' }] }, caption: t`Hugely not to scale: the real triangle is hundreds of thousands of times longer than it is wide.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §5.1 Angles', url: 'https://openstax.org/books/precalculus-2e/pages/5-1-angles' },
    { label: 'NASA, International Space Station facts and figures', url: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/' },
    { label: 'GPS.gov, Space segment (orbits)', url: 'https://www.gps.gov/systems/gps/space/' },
    { label: 'Gaia Collaboration (2023), Gaia Data Release 3, A&A 674, A1', url: 'https://doi.org/10.1051/0004-6361/202243940' },
  ],
});

function tex2(x) {
  const [m, e] = x.toExponential(3).split('e');
  return `${m} \\times 10^{${parseInt(e, 10)}}`;
}
