// Sound waves and intensity: sound is a longitudinal pressure wave in a medium;
// its speed in a gas is √(γRT/M); its intensity spreads as 1/r² from a point
// source and is set by the pressure amplitude.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, snapshot, curvePicture, label, seg, spheres, soundAltitude } from './_waves.js';

const t = String.raw;
const R = 8.314462618, GAMMA = 1.4, M_AIR = 0.0289647;
const vAt = (kelvin) => Math.sqrt((GAMMA * R * kelvin) / M_AIR);
const RHO = 1.2, V20 = 343;
const soundPic = (caption) => ({ type: 'wave-sound', params: { mode: 'travel', controls: false, play: false, readout: false }, caption: caption ?? 'Air parcels in a sound wave (motion hugely exaggerated), with the displacement (solid) and pressure (dashed) along the same line.' });

export default lesson({
  id: 'phys2220.W2.1',
  title: 'Sound waves and intensity',
  minutes: 12, difficulty: 2,
  intro: t`Sound is a **longitudinal pressure wave**. The parcels of air move back and forth *along* the direction the sound travels, crowding into **compressions**, where the pressure is slightly above normal, and spreading into **rarefactions**, where it is slightly below. So sound **needs a medium**: in a vacuum there is nothing to push on. In a gas, its speed is set by the temperature and the mass of the molecules; and from a small source its energy spreads over ever larger spheres:

$$v = \sqrt{\frac{\gamma R T}{M}}, \qquad I = \frac{P}{4\pi r^2}$$

The **intensity** $I$ — power per square metre — falls as $1/r^2$: twice as far, a quarter as intense. It is set by the size of the pressure swings, $I = \Delta p_\text{max}^2/(2\rho v)$.`,
  symbols: [
    { tex: 'v', text: 'the speed of sound, in m/s: 343 m/s in air at 20 °C' },
    { tex: '\\gamma', text: 'the adiabatic index of the gas (the ratio of its heat capacities, $c_p/c_v$): 1.40 for air, 5/3 for helium. No units' },
    { tex: 'R', text: 'the gas constant, 8.314 J/(mol·K)' },
    { tex: 'T', text: 'the absolute temperature, in kelvin: °C + 273.15' },
    { tex: 'M', text: 'the molar mass of the gas, in kg/mol: 0.0290 for air, 0.0040 for helium' },
    { tex: 'I', text: 'the intensity: the sound power crossing each square metre, in W/m²' },
    { tex: 'P', text: 'the sound power of the source, in W (power — not pressure)' },
    { tex: 'r', text: 'the distance from the source, in m; $4\\pi r^2$ is the area of the sphere the power is spread over' },
    { tex: '\\Delta p_\\text{max},\\ \\rho', text: 'the pressure amplitude, in Pa — how far the pressure swings above and below normal — and the density of the gas, in kg/m³ (1.20 for air at 20 °C)' },
  ],
  why: 'The speed of sound sets every aircraft’s Mach number and every instrument’s pitch; intensity is what ears, microphones and launch-pad acoustic engineers actually measure.',
  visual: {
    type: 'wave-sound',
    title: 'Air parcels pushing on each other',
    lead: t`Each dot is a parcel of air. Watch a red tracer: it moves back and forth along the direction the sound travels and keeps returning home. Underneath, the displacement of the air (solid) and its pressure (dashed) along the same line.`,
    tasks: [
      'Compare the two curves: the pressure is highest where the parcels crowd together — where the displacement is zero, not where it is largest.',
      'Switch to helium: at the same frequency the speed of sound nearly triples, and so does the wavelength.',
      'Cool the air to −56 °C, the temperature where airliners cruise: the speed of sound falls to about 295 m/s.',
    ],
    params: { mode: 'travel', f: 343, gas: 'air', T: 20 },
  },
  example: {
    prompt: t`A siren on a pole radiates 2.0 W of sound equally in all directions. Find the intensity 10 m and 40 m away, and the pressure amplitude at 10 m. (Air at 20 °C: $v = 343$ m/s, $\rho = 1.20$ kg/m³.)`,
    visual: spheres({ ratio: 4, l1: '10 m', l2: '40 m', caption: 'The siren (orange) and two spheres around it, 10 m and 40 m in radius, seen in cross-section. Drawn to scale.' }),
    steps: [
      { label: 'Spread the power', text: t`At 10 m the 2.0 W crosses a sphere of area $4\pi(10)^2 = 1257$ m², so $I = 2.0/1257 = 1.59\times10^{-3}$ W/m².` },
      { label: 'Four times as far', text: t`At 40 m the area is 16 times larger: $I = 1.59\times10^{-3}/16 = 9.9\times10^{-5}$ W/m².` },
      { label: 'Pressure amplitude', text: t`$\Delta p_\text{max} = \sqrt{2\rho v I} = \sqrt{2(1.20)(343)(1.59\times10^{-3})} = 1.14$ Pa.` },
      { label: 'Sense check', text: t`Atmospheric pressure is about 101 000 Pa, so even this loud siren changes it by about one part in 100 000. At 1 kHz the air moves only $s_\text{max} = \Delta p_\text{max}/(\rho v\,2\pi f) = 0.44\ \mu$m — sound is a very small disturbance.` },
    ],
    answer: t`$I = 1.6\times10^{-3}$ W/m² at 10 m and $9.9\times10^{-5}$ W/m² at 40 m; $\Delta p_\text{max} = 1.1$ Pa at 10 m.`,
  },
  practice: [
    mcq({
      id: 'vacuum', difficulty: 1,
      prompt: 'Two astronauts on a spacewalk float 10 m apart, not touching. One bangs a hammer on a metal toolbox. What does the other one hear?',
      choices: ['Nothing: sound needs a medium, and there is none between them', 'A bang, about 0.03 s after seeing the hammer strike', 'A bang louder than on Earth, because there is no air to absorb it', 'A bang at the same moment as the flash, since both travel at the speed of light'],
      answer: 0,
      why: {
        1: 'That assumes air carries the sound at 343 m/s. In a vacuum there are no parcels of air to push on, so there is no sound wave at all.',
        2: 'With no air there is nothing to absorb the sound — and nothing to carry it.',
        3: 'Light is an electromagnetic wave and crosses a vacuum; sound is a pressure wave in matter and cannot.',
      },
      hints: ['What does a sound wave consist of? What is there between the astronauts to do that?'],
      teach: 'Sound is a pressure wave in a material medium: no medium, no sound — unlike light, which crosses a vacuum.',
      explain: t`Sound is matter pushing on neighbouring matter. Between the astronauts there is (almost) no matter, so nothing carries the bang — though they would see the hammer strike, since light needs no medium. Sound still travels through the hammer, the toolbox and the air inside each suit — but not across the empty gap.`,
      visual: curvePicture({
        fn: null, x: [-1, 11], y: [-1.6, 2.2], equal: true, numbers: false, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg([0.6, 0], [9.4, 0], { color: 'ink3', width: 1.2, dash: true })],
        arrows: [{ from: [5, 0.45], to: [9.2, 0.45], color: 'gold' }, { from: [5, 0.45], to: [0.8, 0.45], color: 'gold' }],
        points: [{ x: 0, y: 0, color: 'accent', r: 12, label: 'astronaut 1 (hammer)', labelDx: -60, labelDy: 30 }, { x: 10, y: 0, color: 'accent', r: 12, label: 'astronaut 2', labelDx: -36, labelDy: 30 }, label(3.6, 1.05, '10 m of vacuum', 'gold')],
        caption: 'Two astronauts 10 m apart in the vacuum of space. Not to scale.',
      }),
    }),
    num({
      id: 'speed-temperature', difficulty: 1,
      gen(r) {
        const C = r.pick([-40, -20, 0, 10, 25, 35]);
        const v = vAt(C + 273.15);
        return {
          prompt: t`What is the speed of sound in air at ${C} °C? Use $v = \sqrt{\gamma RT/M}$ with $\gamma = 1.40$, $R = 8.314$ J/(mol·K) and $M = 0.0290$ kg/mol.`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: C > 0 ? [{ value: Math.sqrt((GAMMA * R * C) / M_AIR), feedback: 'Use the absolute temperature, in kelvin: add 273.15 to the Celsius value.' }] : [],
          hints: ['Convert the temperature to kelvin first.', t`$v = \sqrt{1.40 \times 8.314 \times T/0.0290}$.`],
          teach: 'The speed of sound in a gas is √(γRT/M), with T in kelvin.',
          explain: t`$T = ${C} + 273.15 = ${tn(C + 273.15, 5)}$ K, so $v = \sqrt{1.40 \times 8.314 \times ${tn(C + 273.15, 5)}/0.0290} = ${tn(v)}$ m/s.`,
          visual: soundPic(),
        };
      },
    }),
    num({
      id: 'altitude', difficulty: 2,
      gen(r) {
        const h = r.pick([3, 5, 8, 11]);
        const T = 288.15 - 6.5 * h, v = vAt(T);
        return {
          prompt: t`In the standard atmosphere the air at ${h} km altitude is at ${tn(T, 5)} K. What is the speed of sound there? ($\gamma = 1.40$, $M = 0.0290$ kg/mol.)`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: 343, feedback: 'That is the sea-level value at 20 °C. Up there the air is much colder.' }, { value: vAt(T) * Math.sqrt(1.4), feedback: t`Check $\gamma$: it multiplies $RT$ once, inside the square root.` }],
          hints: [t`$v = \sqrt{\gamma RT/M}$, with the temperature given in kelvin.`],
          teach: 'The speed of sound depends on temperature, so it falls with altitude as the air cools.',
          explain: t`$v = \sqrt{1.40 \times 8.314 \times ${tn(T, 5)}/0.0290} = ${tn(v)}$ m/s — slower than at sea level because the air is colder, not because it is thinner: pressure and density cancel out of $v$ for an ideal gas.`,
          visual: soundAltitude({ numbers: false, caption: 'The speed of sound against altitude in the standard atmosphere (axis numbers hidden): it falls with the temperature up to 11 km, then stays constant.' }),
        };
      },
    }),
    num({
      id: 'inverse-square', difficulty: 1,
      gen(r) {
        const I1 = r.pick([0.02, 0.05, 0.4, 1.2]), r1 = r.pick([5, 10, 20]), k = r.pick([2, 3, 5]);
        const r2 = k * r1, I2 = I1 / (k * k);
        return {
          prompt: t`The intensity of the sound from a small source is ${I1} W/m² at ${r1} m. What is it at ${r2} m?`,
          answer: I2, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: I1 / k, feedback: t`Intensity spreads over an area, $4\pi r^2$: it falls as $1/r^2$, not $1/r$.` }, { value: I1 * k * k, feedback: 'Farther away means less intense, not more.' }],
          hints: [t`$I \propto 1/r^2$.`, t`${k} times the distance means $1/${k * k}$ of the intensity.`],
          teach: 'From a point source, intensity falls as the inverse square of the distance.',
          explain: t`$I_2 = I_1 (r_1/r_2)^2 = ${I1} \times (1/${k})^2 = ${tn(I2)}$ W/m². The same power is spread over ${k * k} times the area.`,
          visual: spheres({ ratio: k, l1: `${r1} m`, l2: `${r2} m` }),
        };
      },
    }),
    num({
      id: 'jet-power', difficulty: 2,
      gen(r) {
        const rr = r.pick([25, 50, 100]), I = r.pick([0.1, 0.3, 1.0]);
        const P = 4 * Math.PI * rr * rr * I;
        return {
          prompt: t`${rr} m from a jet airliner at take-off power, the sound intensity is ${I} W/m². Treating the jet as a small source radiating equally in all directions, estimate its sound power.`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: Math.PI * rr * rr * I, feedback: t`The power crosses a whole **sphere**, of area $4\pi r^2$, not a circle.` }, { value: 4 * Math.PI * rr * I, feedback: t`The area of a sphere is $4\pi r^2$: square the radius.` }],
          hints: [t`$P = I \times 4\pi r^2$.`],
          teach: 'Multiply the intensity by the area of the sphere the power is spread over: P = 4πr²I.',
          explain: t`$P = 4\pi(${rr})^2 \times ${I} = ${tn(P)}$ W. A real jet is much louder behind than ahead, so this is only an estimate — and only a tiny fraction, well under 1%, of the engines’ power ends up as sound.`,
          visual: spheres({ ratio: 2, l1: '', l2: `${rr} m`, who: 'microphone', caption: 'The jet (orange) and a microphone on a sphere around it, seen in cross-section. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'pressure-max', difficulty: 2,
      prompt: 'The graph shows the displacement of the air parcels along a sound wave at one instant (positive: displaced in the direction the sound travels). At which marked point is the air pressure highest?',
      choices: ['Q', 'P', 'R', 'They are all the same: sound is a displacement wave, not a pressure wave'],
      answer: 0,
      why: {
        1: 'At P the parcels are displaced the most — but their neighbours on both sides are displaced almost as much, so they are no closer together than usual. The pressure there is normal.',
        2: 'At R the parcels on the left are displaced backward and those on the right forward: they spread apart. That is a rarefaction, the lowest pressure.',
        3: t`It is both: the displacement causes the pressure changes, $\Delta p = -B\,\partial s/\partial x$.`,
      },
      hints: ['Pressure is high where parcels crowd together. Where do the parcels on either side move toward the point?', t`At Q, parcels just to the left are displaced forward (toward Q) and those just to the right backward (toward Q).`],
      teach: 'In a sound wave the pressure peaks where the displacement is zero and the neighbouring parcels converge on that point.',
      explain: t`The pressure change is $\Delta p = -B\,\partial s/\partial x$ ($B$ is the gas’s bulk modulus): highest where $s$ falls most steeply through zero. At Q the parcels on both sides are displaced toward Q — a compression. Pressure and displacement are a quarter of a cycle out of step.`,
      visual: snapshot({
        A: 1, lambda: 1, phi: Math.PI / 2, x: [0, 2], ylabel: 'displacement s', xlabel: 'x (m)', numbers: true,
        points: [{ x: 1, y: 1, color: 'gold', label: 'P' }, { x: 1.25, y: 0, color: 'gold', label: 'Q' }, { x: 1.75, y: 0, color: 'gold', label: 'R' }],
        caption: 'The displacement of the air along a sound wave at one instant (scaled to 1 at its largest).',
      }),
    }),
    num({
      id: 'pressure-amplitude', difficulty: 2,
      gen(r) {
        const [I, what] = r.pick([[1e-6, 'a normal conversation, about 1 m away'], [1e-4, 'a busy street'], [1e-2, 'a rock concert near the stage'], [1, 'a jet engine 30 m away']]);
        const dp = Math.sqrt(2 * RHO * V20 * I);
        return {
          prompt: t`The intensity of ${what} is about $${tn(I)}$ W/m². What pressure amplitude is that, in air with $\rho = 1.20$ kg/m³ and $v = 343$ m/s?`,
          answer: dp, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(RHO * V20 * I), feedback: t`$\Delta p_\text{max} = \sqrt{2\rho v I}$: keep the 2.` }, { value: 2 * RHO * V20 * I, feedback: 'Take the square root.' }].filter((e) => Math.abs(e.value - dp) > 0.02 * dp),
          hints: [t`$I = \Delta p_\text{max}^2/(2\rho v)$, so $\Delta p_\text{max} = \sqrt{2\rho v I}$.`],
          teach: t`Intensity goes as the square of the pressure amplitude: $\Delta p_\text{max} = \sqrt{2\rho v I}$.`,
          explain: t`$\Delta p_\text{max} = \sqrt{2 \times 1.20 \times 343 \times ${tn(I)}} = ${tn(dp)}$ Pa — compared with the atmosphere’s 101 000 Pa, a tiny ripple.`,
          visual: soundPic(),
        };
      },
    }),
    num({
      id: 'echo', difficulty: 2,
      gen(r) {
        const tt = r.pick([0.6, 1.2, 1.8, 2.5]), C = r.pick([0, 10, 20]);
        const v = vAt(C + 273.15), d = (v * tt) / 2;
        return {
          prompt: t`Standing in front of a cliff on a ${C} °C day, you clap and hear the echo ${tt} s later. How far away is the cliff? (Speed of sound in air: $${tn(v)}$ m/s at this temperature.)`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: v * tt, feedback: 'The sound went to the cliff and back: halve the total distance.' }],
          hints: ['The echo travels to the cliff and back again.', t`$2d = vt$.`],
          teach: 'An echo’s delay covers the round trip: d = vt/2.',
          explain: t`$d = vt/2 = ${tn(v)} \times ${tt}/2 = ${tn(d)}$ m. Sonar and radar altimeters work the same way, with the right wave speed.`,
          visual: curvePicture({
            fn: null, x: [-1, 11], y: [-0.6, 3.2], equal: true, numbers: false, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [seg([9.5, -0.3], [9.5, 3], { color: 'ink3', width: 6 }), seg([-1, -0.3], [11, -0.3], { color: 'ink4', width: 1.5 })],
            arrows: [{ from: [0.6, 1.4], to: [9.1, 1.4], color: 'gold', label: 'clap' }, { from: [9.1, 0.8], to: [0.6, 0.8], color: 'violet', label: 'echo', labelDx: -40 }],
            points: [{ x: 0, y: 0.6, color: 'accent', r: 9 }, label(9.9, 2.6, 'cliff', 'ink3')],
            caption: 'The clap travels to the cliff and the echo comes back. Not to scale.',
          }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-farther', difficulty: 2,
      gen(r) {
        const I1 = r.pick([0.8, 2.5, 6]), r1 = r.pick([10, 15, 30]), r2 = r1 * r.pick([2.5, 4, 6]);
        const I2 = I1 * (r1 / r2) ** 2;
        return {
          prompt: t`At ${r1} m from a rocket engine on a test stand, the sound intensity is ${I1} W/m². Treating the engine as a small source, what is the intensity at ${r2} m?`,
          answer: I2, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: I1 * (r1 / r2), feedback: 'Intensity falls as 1/r², not 1/r.' }],
          hints: [t`$I_2 = I_1(r_1/r_2)^2$.`],
          teach: 'Intensity from a point source falls as 1/r².',
          explain: t`$I_2 = ${I1} \times (${r1}/${r2})^2 = ${tn(I2)}$ W/m².`,
          visual: spheres({ ratio: r2 / r1, l1: `${r1} m`, l2: `${r2} m`, caption: 'The engine (orange) and two spheres around it, seen in cross-section. Drawn to scale up to a ratio of 4.' }),
        };
      },
    }),
    num({
      id: 'cp-mach', difficulty: 3, transfer: true,
      gen(r) {
        const Mach = r.pick([0.78, 0.82, 0.85]);
        const v = vAt(216.65), u = Mach * v;
        return {
          prompt: t`An airliner cruises at Mach ${Mach} — that fraction of the **local** speed of sound — at 11 km, where the standard-atmosphere temperature is 216.65 K. What is its true airspeed, in m/s? ($\gamma = 1.40$, $M = 0.0290$ kg/mol.)`,
          answer: u, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Mach * 343, feedback: 'That uses the sea-level speed of sound. Mach number is measured against the speed of sound where the aircraft is — much lower in the cold air at 11 km.' }],
          hints: ['Find the speed of sound at 216.65 K first.', t`Airspeed $= \text{Mach number} \times v_\text{sound}$.`],
          teach: 'A Mach number compares speed with the local speed of sound, which falls with temperature.',
          explain: t`$v_\text{sound} = \sqrt{1.40 \times 8.314 \times 216.65/0.0290} = ${tn(v)}$ m/s, so the airspeed is $${Mach} \times ${tn(v)} = ${tn(u)}$ m/s ($${tn(u * 3.6)}$ km/h). The same Mach number at sea level would be faster: $${tn(Mach * 343)}$ m/s.`,
          visual: soundAltitude({ caption: 'The speed of sound against altitude in the standard atmosphere. Airliners cruise near 11 km, in the cold air at the top of the falling part.' }),
        };
      },
    }),
    mcq({
      id: 'cp-longitudinal', difficulty: 1,
      prompt: 'A sound wave travels east through still air. How do the air parcels move?',
      choices: ['Back and forth, east and west, about fixed positions', 'Up and down, across the direction of travel', 'Steadily east, carried along at the speed of sound', 'Not at all: only the pressure moves'],
      answer: 0,
      why: {
        1: 'That is a transverse wave, like a wave on a string. Sound in a gas is longitudinal: the parcels move along the direction of travel.',
        2: 'The wave carries energy east, not air: each parcel oscillates and returns to where it started.',
        3: 'The pressure changes exist because the parcels move, crowding together and spreading apart.',
      },
      hints: ['Is sound in air transverse or longitudinal?'],
      teach: 'In a longitudinal wave the medium oscillates along the direction of travel.',
      explain: t`Each parcel oscillates east–west about its home, by far less than a millimetre in ordinary sound, passing the push on to its neighbour. What travels east at 343 m/s is the pattern of compressions and rarefactions.`,
      visual: soundPic('Air parcels in a sound wave travelling to the right (motion hugely exaggerated).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §17.1–17.3 Sound Waves, Speed of Sound, Sound Intensity', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-1-sound-waves' },
    { label: 'U.S. Standard Atmosphere, 1976 (NOAA/NASA/USAF), NASA TM-X-74335', url: 'https://ntrs.nasa.gov/citations/19770009539' },
  ],
});
