// The Doppler effect: a moving source crowds its wavefronts ahead and spreads
// them behind; a moving listener meets fronts more or less often. The shift
// depends on velocities, not distance. Faster than sound, the fronts pile into
// a Mach cone, sin θ = 1/M: the sonic boom.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, label, seg, curvePicture } from './_waves.js';

const t = String.raw;
const V = 343;                                  // m/s, air at 20 °C
const D2R = Math.PI / 180;
const doppler = (f, vo, vs) => (f * (V + vo)) / (V - vs);
const VT = Math.sqrt((1.4 * 8.314462618 * 216.65) / 0.0289647);   // speed of sound in the stratosphere, 295 m/s
/** Keep only the slips that differ from the key by more than the tolerance. */
const apart = (errs, key, rel = 0.012) => errs.filter((e) => Math.abs(e.value - key) > rel * Math.abs(key));
/** A static Doppler picture. */
const dop = (M, extra = {}, caption) => ({ type: 'wave-doppler', params: { M, controls: false, play: false, readout: false, trace: false, mics: false, ...extra }, ...(caption ? { caption } : {}) });

/** A supersonic aircraft at height h (km), level, at the moment its cone reaches an observer below. */
function boomPicture(M, h) {
  const th = Math.asin(1 / M), d = h / Math.tan(th);          // the cone meets the ground d km behind the aircraft
  const x0 = 0, xa = d;                                         // observer at 0, aircraft at d
  return curvePicture({
    fn: null, x: [r6(-0.25 * d), r6(1.35 * d)], y: [r6(-0.3 * h), r6(1.45 * h)], equal: true, numbers: false, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      seg([r6(-0.25 * d), 0], [r6(1.35 * d), 0], { color: 'ink3', width: 2 }),
      seg([r6(xa), r6(h)], [x0, 0], { color: 'bad', width: 2.2 }),
      seg([r6(xa), r6(h)], [r6(xa - 1.15 * d), r6(h + 1.15 * h)], { color: 'bad', width: 2.2 }),
      seg([x0, 0], [x0, r6(h)], { color: 'ink3', width: 1.2, dash: true }),
      seg([x0, r6(h)], [r6(xa), r6(h)], { color: 'warn', width: 1.4, dash: true }),
    ],
    points: [{ x: r6(xa), y: r6(h), color: 'warn', r: 7, label: `aircraft, Mach ${M}`, labelDx: -40, labelDy: -16 }, { x: 0, y: 0, color: 'good', r: 6, label: 'you', labelDx: -8, labelDy: 18 },
      label(-0.02 * d, 0.55 * h, `h = ${h} km`, 'ink2', -66, 0), label(0.3 * d, 1.08 * h, 'flown since it was overhead', 'warn')],
    caption: 'The moment the boom reaches you: the shock cone (red) trails the aircraft and meets the ground behind it. Straight-line sound paths through air with one temperature; not to scale.',
  });
}

export default lesson({
  id: 'phys2220.W2.3',
  title: 'The Doppler effect',
  minutes: 13, difficulty: 3,
  intro: t`When a source of sound moves, each wavefront still spreads at the speed of sound from the point where it was emitted. So the fronts **crowd together ahead** of a moving source and **spread apart behind** it; a moving listener, likewise, meets fronts more or less often. In still air, for motion along the line joining them,

$$f_o = f_s\,\frac{v + v_o}{v - v_s}$$

with $v_o$ positive when the listener moves toward the source and $v_s$ positive when the source moves toward the listener. The shift depends on **velocities, not on distance**: a source approaching at a steady speed sounds steadily higher, near or far. A source faster than sound outruns its own waves. At Mach number $M = v_s/v > 1$ its fronts pile up into a **cone** of half-angle $\theta$, with $\sin\theta = 1/M$ — a shock wave, heard as a sonic boom.`,
  symbols: [
    { tex: 'f_o', text: 'the frequency the listener (observer) hears, in Hz' },
    { tex: 'f_s', text: 'the frequency the source emits, in Hz' },
    { tex: 'v', text: 'the speed of sound in the air, in m/s (343 m/s at 20 °C)' },
    { tex: 'v_o', text: 'the listener’s speed, in m/s: positive toward the source, negative away' },
    { tex: 'v_s', text: 'the source’s speed, in m/s: positive toward the listener, negative away' },
    { tex: 'M = v_s/v', text: 'the Mach number: the source’s speed in units of the speed of sound' },
    { tex: '\\theta', text: 'the half-angle of the Mach cone, between the cone and the source’s path' },
  ],
  why: 'Doppler shifts measure the speed of blood, of storms (Doppler radar) and of stars; the Mach cone is the signature of every supersonic aircraft — and for light the same idea returns, transformed, as the relativistic and cosmological redshifts.',
  visual: {
    type: 'wave-doppler',
    title: 'Crowded ahead, stretched behind',
    lead: t`The source (orange) emits a circular wavefront every period, each centred where the source was at that moment. The graph shows the pitch a microphone off to the side hears as the source goes by. Then push the Mach number past 1.`,
    tasks: [
      'At Mach 0.5, read the pitches: straight ahead f/(1 − 0.5) = 2f, straight behind f/1.5 — the shifts up and down are not equal.',
      'Watch the side microphone’s graph: the pitch is steady while the source is far away and slides down only as it passes — the shift follows the velocity toward the microphone, not the distance.',
      'Push past Mach 1: the fronts pile into a cone. At Mach 2 its half-angle is 30°, since sin θ = 1/2.',
    ],
    params: { M: 0.5, f: 500 },
  },
  example: {
    prompt: t`An ambulance siren sounds at 700 Hz. What do you hear as the ambulance approaches at 25 m/s, and after it has passed and is moving away at 25 m/s? What would you hear if instead the ambulance were parked and you drove toward it at 25 m/s? (Speed of sound 343 m/s.)`,
    visual: dop(0.3, { time: 0.55 }, 'Wavefronts from a source moving to the right, drawn at Mach 0.3 so the crowding shows. At 25 m/s (Mach 0.07) the effect is much smaller. Scaled picture, still air.'),
    steps: [
      { label: 'Approaching', text: t`The source moves toward you: $v_s = +25$ m/s, $v_o = 0$. $f_o = 700 \times \dfrac{343}{343 - 25} = 755$ Hz.` },
      { label: 'Receding', text: t`Moving away: $v_s = -25$ m/s. $f_o = 700 \times \dfrac{343}{343 + 25} = 652$ Hz. As it passes, the pitch drops by 103 Hz — a fall of about two and a half semitones in music.` },
      { label: 'You move instead', text: t`Now $v_o = +25$ m/s and $v_s = 0$: $f_o = 700 \times \dfrac{343 + 25}{343} = 751$ Hz — close to 755 Hz, but not the same.` },
      { label: 'Why not the same', text: t`Sound travels through the air, so it matters which of you moves *relative to the air*. A moving source shortens the wavelength in the air; a moving listener keeps the wavelength but meets the fronts faster. For small speeds the two agree to first order in $v_s/v$.` },
    ],
    answer: t`755 Hz approaching, 652 Hz receding; 751 Hz if you drive toward the parked siren.`,
  },
  practice: [
    num({
      id: 'approaching', difficulty: 1,
      gen(r) {
        const f = r.pick([440, 600, 800, 1000]), vs = r.pick([15, 25, 30, 40]);
        const fo = doppler(f, 0, vs);
        return {
          prompt: t`A train sounds a ${f} Hz horn as it approaches a level crossing at ${vs} m/s. What frequency does a person waiting at the crossing hear? (Speed of sound 343 m/s.)`,
          answer: fo, units: 'Hz', tol: { rel: 0.003 },
          errors: apart([{ value: doppler(f, 0, -vs), feedback: 'An approaching source sounds higher, not lower: the fronts are crowded together ahead of it.' }, { value: doppler(f, vs, 0), feedback: t`That is the formula for a *moving listener*. Here the source moves: $f_o = f_s\,v/(v - v_s)$.` }], fo, 0.006),
          hints: [t`$f_o = f_s\,\dfrac{v}{v - v_s}$ for a source moving toward a listener at rest.`],
          teach: 'A source approaching at v_s is heard at f_s·v/(v − v_s): higher than it emits.',
          explain: t`$f_o = ${f} \times \dfrac{343}{343 - ${vs}} = ${tn(fo, 4)}$ Hz.`,
          visual: dop(r6(vs / V * 3), { time: 0.5 }, 'Wavefronts crowding ahead of a moving source (exaggerated: drawn at three times the real Mach number). Scaled picture.'),
        };
      },
    }),
    num({
      id: 'receding', difficulty: 1,
      gen(r) {
        const f = r.pick([500, 750, 900]), vs = r.pick([20, 30, 45]);
        const fo = doppler(f, 0, -vs);
        return {
          prompt: t`A motorbike engine whines at ${f} Hz. The bike passes you and speeds away at ${vs} m/s. What frequency do you hear as it recedes? (Speed of sound 343 m/s.)`,
          answer: fo, units: 'Hz', tol: { rel: 0.003 },
          errors: apart([{ value: doppler(f, 0, vs), feedback: 'Moving away, the source leaves its fronts spread out behind it: the pitch is lower.' }, { value: doppler(f, -vs, 0), feedback: 'That would be you moving away from a parked bike. Here the source moves.' }], fo, 0.006),
          hints: [t`Moving away means $v_s$ is negative: $f_o = f_s\,\dfrac{v}{v + |v_s|}$.`],
          teach: 'A receding source is heard at f_s·v/(v + |v_s|): lower than it emits.',
          explain: t`$f_o = ${f} \times \dfrac{343}{343 + ${vs}} = ${tn(fo, 4)}$ Hz.`,
          visual: dop(r6(vs / V * 3), { time: 0.82 }, 'Wavefronts spread out behind a moving source (exaggerated: three times the real Mach number). Scaled picture.'),
        };
      },
    }),
    num({
      id: 'moving-listener', difficulty: 2,
      gen(r) {
        const f = r.pick([350, 500, 640]), vo = r.pick([12, 20, 30]), toward = r.bool(0.5);
        const fo = doppler(f, toward ? vo : -vo, 0);
        return {
          prompt: t`A cyclist rides at ${vo} m/s ${toward ? 'toward' : 'away from'} a stationary loudspeaker playing a steady ${f} Hz tone. What frequency does the cyclist hear? (Speed of sound 343 m/s.)`,
          answer: fo, units: 'Hz', tol: { rel: 0.003 },
          errors: apart([{ value: doppler(f, toward ? -vo : vo, 0), feedback: t`Check the direction: moving ${toward ? 'toward' : 'away from'} the source means you meet the fronts ${toward ? 'more' : 'less'} often.` }, { value: doppler(f, 0, toward ? vo : -vo), feedback: t`That treats the speaker as moving. For a moving listener, $f_o = f_s(v + v_o)/v$.` }], fo, 0.006),
          hints: [t`A moving listener: $f_o = f_s\,\dfrac{v + v_o}{v}$, with $v_o$ positive toward the source.`],
          teach: 'A listener moving toward a source meets more wavefronts per second: f_o = f_s(v + v_o)/v.',
          explain: t`$v_o = ${toward ? '+' : '-'}${vo}$ m/s, so $f_o = ${f} \times \dfrac{343 ${toward ? '+' : '-'} ${vo}}{343} = ${tn(fo, 4)}$ Hz. The wavelength in the air is unchanged; only the rate at which the cyclist meets the fronts changes.`,
          visual: dop(0, { time: 0.5 }, 'A stationary source: its fronts are evenly spaced circles. A moving listener crosses them more or less often. Scaled picture.'),
        };
      },
    }),
    mcq({
      id: 'distance', difficulty: 2,
      prompt: 'A drone flies straight toward you at a constant speed, humming at 400 Hz. As it gets closer, the pitch you hear:',
      choices: ['Stays the same — above 400 Hz — until it reaches you', 'Rises steadily as the drone gets closer', 'Stays at exactly 400 Hz: only the loudness changes', 'Falls steadily as the drone gets closer'],
      answer: 0,
      why: {
        1: 'Getting closer makes it louder, not higher. The Doppler shift depends on the velocity toward you, which is constant here.',
        2: 'Motion toward you crowds the wavefronts together, so the frequency is raised — by a constant amount while the speed is constant.',
        3: 'An approaching source is heard higher than it emits, never lower.',
      },
      hints: [t`Which quantities appear in $f_o = f_s\,v/(v - v_s)$? Is distance one of them?`],
      teach: 'The Doppler shift depends on velocity, not distance: a steady approach gives a steady, raised pitch.',
      explain: t`$f_o = f_s\,v/(v - v_s)$ contains no distance. Head-on, the pitch stays at that raised value until the drone passes, then jumps to the lower value. (Off to one side, as in the Explore, the pitch slides smoothly instead, because the component of velocity toward you changes as the angle changes.)`,
      visual: dop(0.3, { time: 0.4 }, 'Wavefronts from a source moving to the right at a steady speed (scaled picture). Ahead of it, the spacing of the fronts is the same near and far.'),
    }),
    num({
      id: 'mach-angle', difficulty: 2,
      gen(r) {
        const M = r.pick([1.2, 1.4, 1.6, 2.0, 2.5]);
        const th = Math.asin(1 / M) / D2R;
        return {
          prompt: t`An aircraft flies at Mach ${M}. What is the half-angle of its Mach cone, in degrees?`,
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: Math.acos(1 / M) / D2R, feedback: t`$\sin\theta = 1/M$, not $\cos\theta$: in the right triangle, $vt$ (sound) is opposite $\theta$ and $Mvt$ (the aircraft) is the hypotenuse.` }, { value: Math.atan(1 / M) / D2R, feedback: t`Use $\sin\theta = 1/M$: the aircraft’s path is the hypotenuse.` }], th),
          hints: ['In time t the sound spreads vt while the aircraft flies Mvt.', t`$\sin\theta = \dfrac{vt}{Mvt} = \dfrac{1}{M}$.`],
          teach: 'The Mach cone’s half-angle obeys sin θ = 1/M: the faster, the narrower.',
          explain: t`$\theta = \sin^{-1}(1/${M}) = ${tn(th)}°$. At Mach 1 the cone opens out flat (90°); the faster the aircraft, the narrower the cone.`,
          visual: dop(M, { time: 0.62, ask: true }, 'Wavefronts from a supersonic source: they pile up along a cone trailing behind it (scaled picture; angle not labelled).'),
        };
      },
    }),
    num({
      id: 'mach-from-angle', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 40, 45, 60]);
        const M = 1 / Math.sin(th * D2R);
        return {
          prompt: t`A schlieren photograph of a bullet shows the shock cone at a half-angle of $${th}°$ to its path. What is the bullet’s Mach number?`,
          answer: M, tol: { rel: 0.005 },
          errors: apart([{ value: 1 / Math.cos(th * D2R), feedback: t`$\sin\theta = 1/M$, so $M = 1/\sin\theta$.` }, { value: Math.sin(th * D2R), feedback: t`Upside down: $M = 1/\sin\theta$, which is always at least 1.` }], M),
          hints: [t`$\sin\theta = 1/M$.`],
          teach: 'Measuring a Mach cone’s angle measures the speed: M = 1/sin θ.',
          explain: t`$M = 1/\sin ${th}° = ${tn(M, 4)}$. Photographs of shock cones have measured the speeds of bullets and supersonic models in wind tunnels this way.`,
          visual: dop(r6(Math.min(2.5, M)), { time: 0.62, ask: true }, 'A supersonic source and its shock cone (scaled picture).'),
        };
      },
    }),
    num({
      id: 'speed-from-shift', difficulty: 3,
      gen(r) {
        const vs = r.pick([20, 27, 35]), f = r.pick([500, 650]);
        const fu = +doppler(f, 0, vs).toFixed(1), fd = +doppler(f, 0, -vs).toFixed(1);
        const u = (V * (fu - fd)) / (fu + fd);
        return {
          prompt: t`A car with a steady engine note passes a roadside microphone. Approaching, the note is ${fu} Hz; receding, it is ${fd} Hz. How fast is the car going? (Speed of sound 343 m/s.)`,
          answer: u, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([{ value: fu - fd, feedback: 'The frequency difference is in hertz, not a speed. Use both Doppler equations.' }, { value: (V * (fu - fd)) / (2 * fu), feedback: t`Divide by $f_\text{up} + f_\text{down}$, not twice one of them.` }], u),
          hints: [t`Write $f_\text{up} = f\,v/(v - u)$ and $f_\text{down} = f\,v/(v + u)$, then divide one by the other.`, t`$\dfrac{f_\text{up}}{f_\text{down}} = \dfrac{v + u}{v - u}$, which gives $u = v\,\dfrac{f_\text{up} - f_\text{down}}{f_\text{up} + f_\text{down}}$.`],
          teach: 'The ratio of the approaching and receding pitches gives the speed, without knowing the emitted frequency.',
          explain: t`$u = 343 \times \dfrac{${fu} - ${fd}}{${fu} + ${fd}} = ${tn(u)}$ m/s (about $${tn(u * 3.6)}$ km/h). The car’s own note, $f = ${f}$ Hz, cancels out.`,
          visual: dop(r6(vs / V), { f, time: 0.6, trace: true, mics: true, ask: true }, 'The car’s wavefronts (scaled picture) and, below, the pitch a roadside microphone hears, sliding from high to low as the car passes.'),
        };
      },
    }),
    mcq({
      id: 'boom-once', difficulty: 2,
      prompt: 'A jet flies at a steady Mach 1.6 for many kilometres over open country. Who hears a sonic boom?',
      choices: ['Everyone along its path, as the shock cone sweeps over them', 'Only people below the point where it first went faster than sound', 'Nobody: the boom happens only at the instant of passing Mach 1', 'Only people ahead of the jet, before it arrives'],
      answer: 0,
      why: {
        1: 'The boom is not a one-off bang at “breaking the sound barrier”: the cone exists the whole time the jet is supersonic and drags a band of booms across the ground.',
        2: 'The shock cone travels with the jet for as long as it stays above Mach 1.',
        3: 'Ahead of a supersonic jet there is silence: it arrives before its own sound.',
      },
      hints: ['Does the Mach cone disappear once the jet is supersonic?'],
      teach: 'A supersonic aircraft drags its shock cone with it, laying a continuous carpet of booms along its path.',
      explain: t`The cone trails the jet for as long as $M > 1$, sweeping over everyone beneath its path — a “boom carpet” tens of kilometres wide. That is why supersonic flight over land is restricted in many countries, and why designers are trying to shape aircraft to turn the boom into a softer thump.`,
      visual: dop(1.6, { time: 0.55 }, 'A source at Mach 1.6 and the cone that trails it (scaled picture).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-horn', difficulty: 2,
      gen(r) {
        const f = r.pick([300, 420, 520]), vs = r.pick([18, 28, 36]), up = r.bool(0.5);
        const fo = doppler(f, 0, up ? vs : -vs);
        return {
          prompt: t`A boat’s ${f} Hz horn sounds as the boat ${up ? 'heads straight for' : 'moves straight away from'} a harbour wall at ${vs} m/s. What frequency does someone standing on the wall hear? (Speed of sound 343 m/s.)`,
          answer: fo, units: 'Hz', tol: { rel: 0.003 },
          errors: apart([{ value: doppler(f, 0, up ? -vs : vs), feedback: up ? 'Approaching: the pitch goes up.' : 'Receding: the pitch goes down.' }], fo, 0.006),
          hints: [t`$f_o = f_s\,v/(v - v_s)$, with $v_s$ positive toward the listener.`],
          teach: 'The source’s velocity toward or away from the listener sets the shift.',
          explain: t`$f_o = ${f} \times \dfrac{343}{343 ${up ? '-' : '+'} ${vs}} = ${tn(fo, 4)}$ Hz.`,
          visual: dop(r6((vs / V) * 3), { time: up ? 0.45 : 0.8 }, 'Wavefronts from a moving source (speed exaggerated three times; scaled picture).'),
        };
      },
    }),
    num({
      id: 'cp-boom-delay', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([12, 15, 18]), M = r.pick([1.5, 2.0, 2.2]);
        const th = Math.asin(1 / M), u = M * VT, dt = (h * 1000) / (u * Math.tan(th));
        return {
          prompt: t`A supersonic airliner flies level at Mach ${M}, ${h} km up, where the speed of sound is 295 m/s. It passes directly over you. How many seconds later does its sonic boom reach you? Assume the speed of sound is the same all the way down, so the cone is a straight-sided cone.`,
          answer: dt, units: 's', tol: { rel: 0.01 },
          errors: apart([{ value: (h * 1000) / u, feedback: 'That is how long the aircraft takes to fly a distance equal to its height. The cone meets the ground well behind the aircraft: h/tan θ.' }, { value: (h * 1000) / (u * Math.sin(th)), feedback: t`The distance behind is $h/\tan\theta$, not $h/\sin\theta$.` }, { value: (h * 1000) / 295, feedback: 'The boom does not travel straight down from the overhead point: it arrives when the trailing cone reaches you.' }], dt),
          hints: [t`The cone’s half-angle: $\sin\theta = 1/M$. It meets the ground a distance $h/\tan\theta$ behind the aircraft.`, t`You hear the boom when the aircraft is $h/\tan\theta$ past the overhead point: $\Delta t = h/(u\tan\theta)$, with $u = M \times 295$ m/s.`],
          teach: 'A boom arrives only when the trailing cone reaches you — well after the aircraft has passed overhead.',
          explain: t`$\theta = \sin^{-1}(1/${M}) = ${tn(th / D2R)}°$ and $u = ${M} \times 295 = ${tn(u)}$ m/s. The cone meets the ground $h/\tan\theta = ${tn(h / Math.tan(th))}$ km behind the aircraft, so $\Delta t = ${tn(h * 1000 / Math.tan(th))}/${tn(u)} = ${tn(dt)}$ s. In the real atmosphere the air is warmer lower down, so sound speeds up and its paths bend; that changes the timing and narrows the band of ground that hears the boom.`,
          visual: boomPicture(M, h),
        };
      },
    }),
    mcq({
      id: 'cp-light', difficulty: 3, transfer: true,
      prompt: t`For sound, a source approaching you at half the speed of sound is heard at $2f_s$, but you approaching the source at half the speed of sound hear $1.5f_s$. For light, the shift is the same whichever one moves. Why the difference?`,
      choices: [
        'Sound travels through air, which picks out one “at rest” frame; light needs no medium, so only the relative speed of source and observer can matter',
        'Light is too fast to be Doppler shifted at all',
        'Light is a transverse wave and sound is longitudinal',
        'The light formulas are only approximations; measured carefully, light behaves like sound',
      ],
      answer: 0,
      why: {
        1: 'Light is Doppler shifted: astronomers measure the speeds of stars and galaxies by the shifts of their spectral lines.',
        2: 'Transverse waves on a string still have a medium, and show the same source-or-listener difference as sound.',
        3: 'Experiments confirm it: the speed of light is the same for every observer, and the Doppler shift of light depends only on the relative velocity.',
      },
      hints: ['In each case, what is the wave moving through — and is there anything to be “at rest” relative to?'],
      teach: 'Sound’s Doppler shift depends on motion relative to the air; light has no medium, so its shift depends only on relative velocity.',
      explain: t`For sound, the air is a physical reference: a source moving through it changes the wavelength in the air, while a listener moving through it changes how fast the fronts arrive, and the two effects differ. Light has no medium, its speed is the same for every observer, and its Doppler shift — worked out in special relativity, $f_o = f_s\sqrt{(1 + \beta)/(1 - \beta)}$ for approach at speed $\beta c$ — depends only on the relative velocity.`,
      visual: dop(0.5, { time: 0.6 }, 'Sound fronts from a source moving at Mach 0.5 through still air (scaled picture). The air itself is the reference the fronts spread in.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §17.7 The Doppler Effect', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect' },
    { label: 'OpenStax University Physics Vol. 1, §17.8 Shock Waves', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-8-shock-waves' },
  ],
});
