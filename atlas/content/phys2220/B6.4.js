// Energy and momentum of light: equal electric and magnetic energy densities,
// the Poynting vector S = E × B/μ₀ and the intensity I = ½cε₀E₀²; momentum
// p = U/c and radiation pressure I/c on an absorber, 2I/c on a mirror. Real
// numbers: the solar constant (1361 W/m² at 1 AU), JAXA's IKAROS sail, the
// push on a navigation satellite's panels.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C3, C_LIGHT, EPS0, tn, sf, r6, apart, lab, seg, pwl, wavePic } from './_maxwell.js';

const t = String.raw;
const S0 = 1361;            // W/m², total solar irradiance at 1 AU
const C = 2.99792458e8;     // m/s, for pictures

/**
 * Light falling square-on to a flat panel, seen edge-on: incoming rays gold;
 * on a mirror the reflected rays green. mode: 'absorb', 'reflect' or 'both'
 * (a black sheet and a mirror side by side).
 */
function sailPic({ mode = 'absorb', light = 'sunlight', panel, caption } = {}) {
  const curves = [], arrows = [], points = [];
  const one = (x0, kind, name) => {
    const ys = [-0.7, 0, 0.7];
    curves.push(seg([x0, -1.15], [x0, 1.15], { color: kind === 'reflect' ? 'accent' : 'ink3', width: 8 }));
    for (const y of ys) arrows.push({ from: [r6(x0 - 2.6), y], to: [r6(x0 - 0.14), y], color: 'gold' });
    if (kind === 'reflect') for (const y of ys) arrows.push({ from: [r6(x0 - 0.14), r6(y + 0.24)], to: [r6(x0 - 1.9), r6(y + 0.24)], color: 'good' });
    points.push(lab(x0 - 2.6, 1.2, light, 'gold', 0, 0, 'left'));
    points.push(lab(x0, -1.15, name, kind === 'reflect' ? 'accent' : 'ink2', 0, 16));
  };
  if (mode === 'both') { one(0, 'absorb', 'black sheet'); one(4.4, 'reflect', 'mirror'); }
  else one(0, mode, panel ?? (mode === 'reflect' ? 'mirror' : 'black sheet'));
  const x = mode === 'both' ? [-3.0, 4.9] : [-3.1, 1.4];
  return {
    type: 'graph',
    params: { x, y: [-1.6, 1.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption: caption ?? (mode === 'both'
      ? 'The same light falling square-on to a black sheet (left), which absorbs it, and a mirror (right), which sends it straight back (green). Seen edge-on.'
      : mode === 'reflect' ? 'Light falling square-on to a mirror and sent straight back (green). Seen edge-on.' : 'Light falling square-on to a surface that absorbs it. Seen edge-on.'),
  };
}

/** sunlight's intensity against distance from the Sun, 1361 W/m² at 1 AU; planets marked; y numbers hidden */
function sunCurve({ mark, caption } = {}) {
  const pl = [['Venus', 0.723], ['Earth', 1], ['Mars', 1.524], ['Jupiter', 5.203]];
  return {
    type: 'graph',
    params: {
      x: [0, 6], y: [0, 4000], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the Sun (AU)', ylabel: 'intensity (W/m²)', yticks: 0.001,
      curves: [{ fn: `${S0}/x^2`, domain: [0.58, 6], color: 'gold', width: 2.6 }],
      points: pl.map(([n, r]) => ({ x: r, y: r6(S0 / r ** 2), r: n === mark ? 6 : 4, color: n === mark ? 'accent' : n === 'Earth' ? 'teal' : 'ink3', label: n === 'Earth' ? 'Earth: 1361 W/m²' : n, labelDx: 8, labelDy: n === 'Jupiter' ? -14 : -4 })),
    },
    caption: caption ?? 'Sunlight’s intensity falls as the inverse square of the distance from the Sun (intensity numbers hidden).',
  };
}

/** a laser pointer's beam meeting a wall, beam diameter d marked (not to scale) */
function beamPic(caption) {
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-1.5, 1.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        ...pwl([[0.4, -0.4], [2.6, -0.4], [2.6, 0.4], [0.4, 0.4], [0.4, -0.4]], { color: 'ink2', width: 2.2 }),
        seg([2.6, 0.32], [8.6, 0.32], { color: 'warn', width: 1.6 }), seg([2.6, -0.32], [8.6, -0.32], { color: 'warn', width: 1.6 }),
        seg([8.6, -1.3], [8.6, 1.3], { color: 'ink3', width: 5 }),
      ],
      arrows: [{ from: [9.2, 0], to: [9.2, 0.32], color: 'ink2' }, { from: [9.2, 0], to: [9.2, -0.32], color: 'ink2' }],
      points: [lab(1.5, 0, 'laser', 'ink2'), lab(9.2, 0, 'd', 'ink2', 10, 0, 'left'), lab(5.6, 0.32, 'beam', 'warn', 0, -12)],
    },
    caption: caption ?? 'A laser pointer’s beam, its power spread over a circle of diameter d. Not to scale.',
  };
}

// the worked example: sunlight at 1 AU
const EX = (() => {
  const I = S0, E0 = Math.sqrt((2 * I) / (C_LIGHT * EPS0)), B0 = E0 / C_LIGHT, u = I / C_LIGHT;
  return { I, E0, B0, u, pA: I / C_LIGHT, pR: (2 * I) / C_LIGHT };
})();

export default lesson({
  id: 'phys2220.B6.4',
  title: 'Energy and momentum of light',
  minutes: 12, difficulty: 2,
  intro: t`Light carries energy in both of its fields. In a plane wave the two energy densities are equal — $\tfrac12\varepsilon_0E^2 = B^2/2\mu_0$, because $B = E/c$ — so the total is $u = \varepsilon_0E^2$, streaming along at $c$. The energy crossing unit area per second is the **Poynting vector** $\vec S = \frac{1}{\mu_0}\vec E\times\vec B$, which points along the travel. Averaged over a cycle it is the **intensity**:

$$I = \langle S\rangle = \frac{E_0B_0}{2\mu_0} = \tfrac12c\varepsilon_0E_0^2 = c\,\langle u\rangle$$

Light carries momentum too: energy $U$ travelling as light brings momentum $p = U/c$. A surface that absorbs the light takes that momentum and feels a **radiation pressure** $P_\text{rad} = I/c$; a mirror sends the light back reversed and takes twice as much, $2I/c$. Sunlight at Earth, 1361 W/m², presses on a black sheet with only 4.5 µPa — yet acting for months on a large, light surface, that push drives solar sails.`,
  symbols: [
    { tex: t`\langle u\rangle`, text: t`the energy density of the wave averaged over a cycle, in J/m³: $\tfrac12\varepsilon_0E_0^2$, half of it in each field` },
    { tex: t`\vec S`, text: 'the Poynting vector: the energy crossing unit area per second, in W/m², pointing along the direction of travel' },
    { tex: 'I', text: 'the intensity, the average of $S$ over a cycle, in W/m²' },
    { tex: 'E_0,\\ B_0', text: 'the amplitudes of the electric field (V/m) and the magnetic field (T), with $B_0 = E_0/c$' },
    { tex: 'p = U/c', text: 'the momentum carried by light of energy $U$, in kg·m/s' },
    { tex: t`P_\text{rad}`, text: 'the radiation pressure on a surface facing the light, in pascals (N/m²): $I/c$ if it absorbs, $2I/c$ if it reflects' },
  ],
  why: 'The push of light is tiny per square metre, but it never runs out: solar sails ride it with no fuel, and the orbits of navigation satellites must allow for it.',
  visual: {
    type: 'graph',
    title: 'Sunlight’s push across the solar system',
    lead: 'The radiation pressure of sunlight against distance from the Sun, on a perfect absorber (violet) and on a perfect mirror facing the Sun (gold). Slide the distance and read off the intensity, the two pressures, and the push on a mirror sail the size of JAXA’s IKAROS (196 m²).',
    tasks: [
      'Start at Earth, 1 AU: 1361 W/m² presses on a black surface with 4.5 µPa, about a twenty-billionth of atmospheric pressure.',
      'Compare the curves at any distance: the mirror always feels exactly twice the absorber’s push, because the light it sends back has had its momentum reversed.',
      'Move in to Venus and out to Mars: halve the distance and the push quadruples; double it and the push falls to a quarter.',
    ],
    params: {
      x: [0.4, 3], y: [0, 40], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the Sun (AU)', ylabel: 'pressure (µPa)',
      sliders: [{ key: 'r', label: 'Distance from the Sun $r$', min: 0.5, max: 3, step: 0.01, value: 1, unit: t`\text{AU}`, explain: 'One astronomical unit (AU) is Earth’s mean distance from the Sun, $1.496\\times10^{11}$ m. Venus orbits at 0.72 AU, Mars at 1.52 AU.' }],
      curves: [
        { fn: `${r6((S0 / C) * 1e6)}/x^2`, domain: [0.48, 3], color: 'violet', width: 2.4 },
        { fn: `${r6(((2 * S0) / C) * 1e6)}/x^2`, domain: [0.48, 3], color: 'gold', width: 2.6 },
      ],
      points: [
        { x: 'r', y: `${r6((S0 / C) * 1e6)}/r^2`, color: 'violet', r: 5 },
        { x: 'r', y: `${r6(((2 * S0) / C) * 1e6)}/r^2`, color: 'gold', r: 5 },
        lab(1.9, 33, 'on a mirror, 2I/c', 'gold', 0, 0, 'left'),
        lab(1.9, 28.5, 'on an absorber, I/c', 'violet', 0, 0, 'left'),
      ],
      vlines: [{ x: 0.723, label: 'Venus' }, { x: 1, label: 'Earth' }, { x: 1.524, label: 'Mars' }],
      readouts: [
        { label: t`intensity $I$`, expr: `${S0}/r^2`, unit: t`\mathrm{W/m^2}`, digits: 4 },
        { label: t`on an absorber, $I/c$`, expr: `${r6((S0 / C) * 1e6)}/r^2`, unit: t`\mu\mathrm{Pa}` },
        { label: t`on a mirror, $2I/c$`, expr: `${r6(((2 * S0) / C) * 1e6)}/r^2`, unit: t`\mu\mathrm{Pa}` },
        { label: 'force on a 196 m² mirror sail', expr: `${r6(((2 * S0) / C) * 196 * 1e3)}/r^2`, unit: t`\mathrm{mN}` },
      ],
    },
    caption: 'Idealised surfaces facing the Sun square-on, with sunlight at 1361 W/m² at 1 AU. Real sail film reflects roughly 90% of the light, and a sail tilted away from the Sun feels less.',
  },
  example: {
    prompt: t`Sunlight reaches the top of Earth’s atmosphere with an intensity of 1361 W/m². Find (a) its electric amplitude $E_0$, (b) its magnetic amplitude $B_0$, (c) the average energy density of the light, and (d) the radiation pressure it exerts, square-on, on a perfect absorber and on a perfect mirror. Use $c = 2.998\times10^8$ m/s and $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`,
    visual: { type: 'em-wave', params: { E0: r6(EX.E0), phase: 40, controls: [], readout: true, readouts: ['B0', 'I', 'p'] }, caption: 'Sunlight treated as a single plane wave with the same intensity (real sunlight is a mixture of many frequencies and polarizations, but the energy bookkeeping is the same). Not to scale.' },
    steps: [
      { label: 'Electric amplitude', text: t`$I = \tfrac12c\varepsilon_0E_0^2$, so $E_0 = \sqrt{\dfrac{2I}{c\varepsilon_0}} = \sqrt{\dfrac{2(1361)}{(2.998\times10^8)(8.854\times10^{-12})}} = ${tn(EX.E0, 4)}$ V/m.` },
      { label: 'Magnetic amplitude', text: t`$B_0 = E_0/c = ${tn(EX.B0)}$ T $= ${tn(EX.B0 * 1e6)}\ \mu$T.` },
      { label: 'Energy density', text: t`$\langle u\rangle = I/c = 1361/(2.998\times10^8) = ${tn(EX.u)}$ J/m³, half in each field.` },
      { label: 'Radiation pressure', text: t`Absorber: $P_\text{rad} = I/c = ${tn(EX.pA * 1e6)}\ \mu$Pa. Mirror: $2I/c = ${tn(EX.pR * 1e6)}\ \mu$Pa. (Pressure and energy density share units, and for an absorber they are equal.)` },
      { label: 'Sense check', text: t`A kilovolt per metre sounds large, but the magnetic amplitude is fifteen times weaker than Earth’s field, and the pressure is about $2\times10^{10}$ times smaller than the atmosphere’s 101 kPa. A hand-sized patch of 0.01 m² facing this sunlight takes about 0.05 µN of push — and about 14 W of heat.` },
    ],
    answer: t`(a) $E_0 = ${tn(EX.E0, 4)}$ V/m; (b) $B_0 = ${tn(EX.B0 * 1e6)}\ \mu$T; (c) $${tn(EX.u * 1e6)}\ \mu$J/m³; (d) $${tn(EX.pA * 1e6)}\ \mu$Pa on an absorber, $${tn(EX.pR * 1e6)}\ \mu$Pa on a mirror.`,
  },
  practice: [
    mcq({
      id: 'equal-share', difficulty: 2,
      prompt: t`In sunlight $E_0 \approx 1000$ V/m, while $B_0 \approx 3.4\ \mu$T. Which field carries more of the light’s energy?`,
      visual: wavePic({ phase: 20 }, 'The two fields of a light wave, in phase. Not to scale.'),
      choices: [
        'Neither: the two fields carry exactly equal shares',
        'The electric field, since 1000 is far bigger than 3.4 millionths',
        'The magnetic field, since magnetic fields are what store energy in coils',
        'They take turns: first the electric field holds it all, then the magnetic',
      ],
      answer: 0,
      why: {
        1: t`Numbers in different units cannot be compared. Put them into the energy densities, $\tfrac12\varepsilon_0E^2$ and $B^2/2\mu_0$, and they come out equal.`,
        2: t`Coils do store magnetic energy, but in a light wave the shares are fixed by $B = E/c$, which makes them equal.`,
        3: 'The fields are in phase, so both shares rise and fall together; neither ever holds it all.',
      },
      hints: [t`Compare $u_E = \tfrac12\varepsilon_0E^2$ with $u_B = B^2/2\mu_0$, using $B = E/c$ and $c^2 = 1/\mu_0\varepsilon_0$.`],
      teach: 'In an electromagnetic wave the electric and magnetic fields carry equal shares of the energy at every point and instant.',
      explain: t`$u_B = \dfrac{B^2}{2\mu_0} = \dfrac{E^2}{2\mu_0c^2} = \tfrac12\varepsilon_0E^2 = u_E$, since $\mu_0c^2 = 1/\varepsilon_0$. With $E_0 = 1000$ V/m both peak at $\tfrac12(8.854\times10^{-12})(1000)^2 = ${tn(0.5 * EPS0 * 1e6 * 1e6)}\ \mu$J/m³ — and they peak together.`,
    }),
    num({
      id: 'I-from-E0', difficulty: 2,
      gen(r) {
        const E0T = r.pick(['25', '140', '870']), E0 = +E0T, I = 0.5 * C3 * EPS0 * E0 * E0;
        return {
          prompt: t`A plane wave in a vacuum has an electric amplitude of ${E0T} V/m. What is its intensity? Use $c = 3.00\times10^8$ m/s and $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`,
          visual: wavePic({ phase: 50 }, 'The wave: its intensity is set by the amplitude of its fields. Not to scale.'),
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: apart([
            { value: 2 * I, feedback: t`Average over a cycle: $\langle\sin^2\rangle = \tfrac12$, so $I = \tfrac12c\varepsilon_0E_0^2$.` },
            { value: 0.5 * C3 * EPS0 * E0, feedback: t`Square the amplitude: the energy goes as $E_0^2$.` },
          ], I),
          hints: [t`$I = \tfrac12c\varepsilon_0E_0^2$.`],
          teach: t`The intensity of a plane wave is $I = \tfrac12c\varepsilon_0E_0^2$: it grows as the square of the field.`,
          explain: t`$I = \tfrac12(3.00\times10^8)(8.854\times10^{-12})(${E0T})^2 = ${tn(I)}$ W/m².`,
        };
      },
    }),
    num({
      id: 'E0-laser', difficulty: 3,
      gen(r) {
        const PT = r.pick(['1.0', '5.0']), dT = r.pick(['1.0', '2.0']), P = +PT * 1e-3, d = +dT * 1e-3;
        const A = Math.PI * (d / 2) ** 2, I = P / A, E0 = Math.sqrt((2 * I) / (C3 * EPS0));
        return {
          prompt: t`A ${PT} mW laser pointer makes a beam ${dT} mm in diameter. Treating the power as spread evenly across the beam, what is the electric amplitude of its light? Use $c = 3.00\times10^8$ m/s and $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`,
          visual: beamPic(),
          answer: E0, units: 'V/m', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.sqrt(I / (C3 * EPS0)), feedback: t`$I = \tfrac12c\varepsilon_0E_0^2$, so $E_0 = \sqrt{2I/c\varepsilon_0}$ — keep the 2.` },
            { value: Math.sqrt((2 * P) / (Math.PI * d * d) / (C3 * EPS0)), feedback: t`The beam’s area is $\pi(d/2)^2$: use the radius, not the diameter.` },
            { value: (2 * I) / (C3 * EPS0), feedback: 'Take the square root at the end.' },
          ], E0),
          hints: [t`Intensity is power per area: $I = P/\pi(d/2)^2$.`, t`Then $E_0 = \sqrt{2I/c\varepsilon_0}$.`],
          teach: t`From an intensity, $E_0 = \sqrt{2I/c\varepsilon_0}$; for a beam, $I$ is its power divided by its cross-section.`,
          explain: t`$I = \dfrac{${PT}\times10^{-3}}{\pi(${sf(d / 2, 2)}\ \text{m})^2} = ${tn(I)}$ W/m², about ${Math.round(I / S0 * 10) / 10 === 1 ? 'the same as' : `${sf(I / S0, 2)} times`} sunlight’s. Then $E_0 = \sqrt{\dfrac{2(${tn(I)})}{(3.00\times10^8)(8.854\times10^{-12})}} = ${tn(E0)}$ V/m.`,
        };
      },
    }),
    mcq({
      id: 'double-E', difficulty: 1,
      prompt: 'The electric amplitude of a laser beam is doubled, with the beam the same size. What happens to the intensity and to the radiation pressure on a surface that absorbs it?',
      visual: wavePic({ phase: 50 }, 'A light wave. Not to scale.'),
      choices: [
        'Both become four times as large',
        'Both double',
        'The intensity quadruples, but the pressure only doubles',
        'The intensity doubles, and the pressure stays the same because light has no mass',
      ],
      answer: 0,
      why: {
        1: t`The energy goes as the square of the field: $I \propto E_0^2$.`,
        2: t`$P_\text{rad} = I/c$ follows the intensity exactly, so it quadruples too.`,
        3: 'Light has no mass but does carry momentum, p = U/c, and more energy per second brings more momentum per second.',
      },
      hints: [t`$I = \tfrac12c\varepsilon_0E_0^2$ and $P_\text{rad} = I/c$.`],
      teach: 'Intensity and radiation pressure both grow as the square of the field amplitude.',
      explain: t`$I \propto E_0^2$, so doubling $E_0$ multiplies $I$ by 4; and $P_\text{rad} = I/c$, so the pressure is multiplied by 4 as well.`,
    }),
    num({
      id: 'panel-force', difficulty: 2,
      gen(r) {
        const AT = r.pick(['2.0', '12', '40']), A = +AT, kind = r.pick(['absorb', 'reflect']);
        const k = kind === 'reflect' ? 2 : 1, F = (k * S0 * A) / C3;
        return {
          prompt: t`Sunlight of intensity 1361 W/m² falls square-on to a flat panel of area ${AT} m² that ${kind === 'reflect' ? 'reflects all of it straight back' : 'absorbs all of it'}. What force does the light exert on the panel? Use $c = 3.00\times10^8$ m/s.`,
          visual: sailPic({ mode: kind }),
          answer: F * 1e6, units: 'µN', tol: { rel: 0.01 },
          errors: apart([
            { value: ((3 - k) * S0 * A) / C3 * 1e6, feedback: kind === 'reflect' ? t`A mirror takes twice the light’s momentum: $P_\text{rad} = 2I/c$.` : t`An absorber takes the light’s momentum once: $P_\text{rad} = I/c$. Only a mirror gets $2I/c$.` },
            { value: ((k * S0) / C3) * 1e6, feedback: 'That is the pressure in µPa. Multiply by the area for the force.' },
          ], F * 1e6),
          hints: [t`Pressure ${kind === 'reflect' ? '$2I/c$' : '$I/c$'}, then force = pressure × area.`],
          teach: 'The force of light on a surface is its radiation pressure times the area: IA/c absorbed, 2IA/c reflected.',
          explain: t`$F = ${kind === 'reflect' ? '\\dfrac{2IA}{c}' : '\\dfrac{IA}{c}'} = \dfrac{${k === 2 ? '2' : ''}(1361)(${AT})}{3.00\times10^8} = ${tn(F)}$ N $= ${tn(F * 1e6)}\ \mu$N.`,
        };
      },
    }),
    mcq({
      id: 'mirror-vs-black', difficulty: 2,
      prompt: 'The same sunlight falls square-on to a black sheet and to a mirror of the same area. Which does the light push harder?',
      visual: sailPic({ mode: 'both' }),
      choices: [
        'The mirror, twice as hard: it reverses the light’s momentum instead of just stopping it',
        'The black sheet, because it soaks up the light’s energy',
        'Neither: the same light brings the same push',
        'Neither feels any push, because light has no mass',
      ],
      answer: 0,
      why: {
        1: 'Absorbing energy heats the black sheet, but the push comes from momentum. Stopping the light takes p; reversing it takes 2p.',
        2: 'The same light arrives at both, but the mirror also has to send it back — like a ball that bounces rather than sticks.',
        3: 'Light carries momentum p = U/c even without mass; the push is small but real, and measured.',
      },
      hints: ['Think of a ball thrown at a wall: does the wall get a bigger push when the ball sticks, or when it bounces back?'],
      teach: 'A mirror feels twice the radiation pressure of an absorber, 2I/c rather than I/c, because the reflected light’s momentum is reversed.',
      explain: t`Light arriving with momentum $p$ leaves an absorber with nothing, so the sheet takes $p$. At a mirror it leaves with $-p$, so the mirror takes $2p$. Hence $P_\text{rad} = I/c$ for the black sheet and $2I/c$ for the mirror — which is why solar sails are made of shiny film.`,
    }),
    num({
      id: 'pulse-momentum', difficulty: 2,
      gen(r) {
        const UT = r.pick(['0.50', '2.0', '15']), U = +UT, kind = r.pick(['absorb', 'reflect']), k = kind === 'reflect' ? 2 : 1;
        const p = (k * U) / C3;
        return {
          prompt: t`A ${UT} J pulse from a laboratory laser strikes a target square-on and is ${kind === 'reflect' ? 'reflected straight back by its mirror coating' : 'completely absorbed'}. How much momentum does the target receive? Use $c = 3.00\times10^8$ m/s.`,
          visual: sailPic({ mode: kind, light: 'laser pulse', panel: kind === 'reflect' ? 'mirrored target' : 'black target' }),
          answer: p, units: 'kg m/s', tol: { rel: 0.01 },
          errors: apart([
            { value: ((3 - k) * U) / C3, feedback: kind === 'reflect' ? 'The reflected pulse leaves with its momentum reversed, so the target receives 2U/c.' : 'An absorbed pulse hands over its momentum once: U/c. Only a reflection doubles it.' },
            { value: k * U * C3, feedback: t`Divide by $c$: light of energy $U$ carries momentum $U/c$.` },
          ], p),
          hints: [t`Light of energy $U$ carries momentum $p = U/c$.`],
          teach: 'Light of energy U carries momentum U/c; an absorber receives U/c and a mirror 2U/c.',
          explain: t`$p = ${k === 2 ? '2U/c' : 'U/c'} = \dfrac{${k === 2 ? '2' : ''}(${UT})}{3.00\times10^8} = ${tn(p)}$ kg·m/s. Tiny: a 1 mg speck drifting at ${sf((p / 1e-6) * 1e3, 2)} mm/s carries as much. Yet delicate torsion balances measured the push of light as early as 1901.`,
        };
      },
    }),
    num({
      id: 'inverse-square', difficulty: 2,
      gen(r) {
        const [name, au] = r.pick([['Venus', 0.723], ['Mars', 1.524], ['Jupiter', 5.203]]);
        const I = S0 / au ** 2;
        return {
          prompt: t`At Earth’s distance from the Sun, 1 AU, sunlight’s intensity is 1361 W/m². ${name} orbits ${au} AU from the Sun. What is the intensity of sunlight there?`,
          visual: sunCurve({ mark: name }),
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: apart([
            { value: S0 / au, feedback: 'Intensity falls as the inverse square of the distance, not the inverse.' },
            { value: S0 * au ** 2, feedback: au > 1 ? 'Farther from the Sun the light is spread over a bigger sphere, so it is weaker: divide by r².' : 'Closer to the Sun the light is spread over a smaller sphere, so it is stronger: divide by r², which is less than 1.' },
          ], I),
          hints: ['The Sun’s power is spread over a sphere of area 4πr².', t`$I = 1361\ \text{W/m}^2 \times (1\ \text{AU}/r)^2$.`],
          teach: 'Sunlight’s intensity falls as 1/r² from the Sun: 1361 W/m² at 1 AU divided by r² in AU.',
          explain: t`$I = \dfrac{1361}{(${au})^2} = ${tn(I)}$ W/m²${name === 'Jupiter' ? ' — 1/27 of the sunlight at Earth, which is why the Juno spacecraft at Jupiter carries such large solar panels' : ''}.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-E0-planet', difficulty: 3,
      gen(r) {
        const [name, au] = r.pick([['Venus', 0.723], ['Mars', 1.524], ['Jupiter', 5.203]]);
        const I = S0 / au ** 2, E0 = Math.sqrt((2 * I) / (C3 * EPS0));
        return {
          prompt: t`Sunlight has an intensity of 1361 W/m² at 1 AU. What is the electric amplitude of sunlight at ${name}, ${au} AU from the Sun? Treat the light as a single plane wave; use $c = 3.00\times10^8$ m/s and $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`,
          visual: sunCurve({ mark: name }),
          answer: E0, units: 'V/m', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.sqrt((2 * S0) / (C3 * EPS0)), feedback: t`That is the field at Earth. First scale the intensity to ${name}: $I = 1361/r^2$.` },
            { value: Math.sqrt((2 * S0) / (C3 * EPS0)) / au ** 2, feedback: t`The field goes as $\sqrt I$, so it falls as $1/r$, not $1/r^2$.` },
          ], E0),
          hints: [t`First the intensity at ${name}: $I = 1361/r^2$ W/m², with $r$ in AU.`, t`Then $E_0 = \sqrt{2I/c\varepsilon_0}$.`],
          teach: t`The intensity falls as $1/r^2$, so the field amplitude, which goes as $\sqrt I$, falls as $1/r$.`,
          explain: t`$I = 1361/(${au})^2 = ${tn(I)}$ W/m², so $E_0 = \sqrt{2I/c\varepsilon_0} = ${tn(E0)}$ V/m — or, more quickly, the ${tn(EX.E0, 4)} V/m at Earth divided by ${au}.`,
        };
      },
    }),
    mcq({
      id: 'cp-negligible', difficulty: 2,
      prompt: 'A classmate says: “Light pressure is a few micropascals, so it can always be ignored.” Which reply is best?',
      visual: sailPic({ mode: 'reflect', panel: 'sail', caption: 'Sunlight on a sail made of reflective film. Seen edge-on; not to scale.' }),
      choices: [
        'It is negligible against big forces, but it acts on large, light surfaces for months on end with nothing else pushing: it pushes comet dust into tails, must be modelled to predict satellite orbits, and propels solar sails',
        'Right: it has never been measured, only predicted',
        'Wrong: sunlight pushes on you with about a newton on a sunny day',
        'Right, because light’s push is cancelled by the heat it delivers',
      ],
      answer: 0,
      why: {
        1: 'It was measured in the laboratory in 1901 (Lebedev; Nichols and Hull) and by spacecraft ever since — IKAROS among them.',
        2: 'On your body, about half a square metre facing the Sun, it is roughly 2 µN — two millionths of a newton.',
        3: 'Heating and pushing are separate effects; the absorbed momentum stays, whatever the temperature.',
      },
      hints: ['Where would a tiny, steady, fuel-free force add up to something?'],
      teach: 'Radiation pressure is tiny per square metre, but over large areas, small masses and long times it matters: comet tails, satellite orbits, solar sails.',
      explain: t`At 4.5 µPa (absorbed) to 9.1 µPa (reflected) the push is small, but it never stops. On a dust grain it can beat the Sun’s gravity, sweeping comet dust into a tail; on a navigation satellite it is the largest force after gravity; on a sail of thin film it is the whole engine.`,
    }),
    num({
      id: 'cp-ikaros', difficulty: 3, transfer: true,
      gen(r) {
        const au = r.pick([0.8, 0.9, 1.0]), A = 196, I = S0 / au ** 2, F = (2 * I * A) / C3;
        return {
          prompt: t`JAXA’s IKAROS, launched in 2010, was the first spacecraft to use a solar sail in interplanetary space: a square of polyimide film 14 m on a side and 7.5 µm thick. Treat the sail as a perfect mirror facing the Sun square-on, ${au} AU from the Sun (where sunlight’s intensity is 1361 W/m² ÷ ${au === 1 ? '1' : `${au}²`}). What force does sunlight exert on it? Use $c = 3.00\times10^8$ m/s.`,
          visual: sailPic({ mode: 'reflect', panel: 'sail', caption: 'Sunlight reflected straight back from a mirror sail. Seen edge-on; not to scale.' }),
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: apart([
            { value: ((I * A) / C3) * 1e3, feedback: t`A mirror takes twice the momentum: $F = 2IA/c$.` },
            { value: ((2 * S0 * A) / C3) * 1e3, feedback: t`Scale the intensity to ${au} AU first: $I = 1361/r^2$.` },
          ], F * 1e3),
          hints: [t`$A = (14\ \text{m})^2$ and $I = 1361/r^2$ W/m² with $r$ in AU.`, t`$F = 2IA/c$ for a mirror.`],
          teach: 'A mirror sail facing the Sun feels F = 2IA/c, with I = 1361 W/m² ÷ r² (r in AU).',
          explain: t`$A = 14^2 = 196$ m², $I = ${tn(I)}$ W/m², so $F = \dfrac{2IA}{c} = \dfrac{2(${tn(I)})(196)}{3.00\times10^8} = ${tn(F * 1e3)}$ mN — the weight of about ${sf((F / 9.81) * 1e3, 1)} g. JAXA measured about 1.1 mN in July 2010, less than this ideal because the film is not a perfect mirror and the sail does not always face the Sun square-on. On a 310 kg craft that is under $10^{-5}$ m/s², yet it never runs out.`,
        };
      },
    }),
    num({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([20, 25, 30]), m = r.pick([1100, 1600]), a = (S0 * A) / (m * C3);
        return {
          prompt: t`A ${m} kg navigation satellite keeps ${A} m² of solar panels facing the Sun at 1 AU, where sunlight’s intensity is 1361 W/m². Treating the panels as perfect absorbers, what acceleration does the sunlight’s push give the satellite? Use $c = 3.00\times10^8$ m/s.`,
          visual: sailPic({ mode: 'absorb', panel: 'solar panels', caption: 'Sunlight absorbed by a satellite’s solar panels. Seen edge-on; not to scale.' }),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: apart([
            { value: (S0 * A) / C3, feedback: 'That is the force in newtons. Divide by the mass for the acceleration.' },
            { value: (2 * S0 * A) / (m * C3), feedback: t`The panels absorb the light, so the pressure is $I/c$, not $2I/c$.` },
          ], a),
          hints: [t`The pressure on an absorber is $I/c$, so the force is $F = IA/c$.`, t`Then $a = F/m$.`],
          teach: 'Radiation force on an absorber is IA/c; divided by the mass, it gives a small but steady acceleration.',
          explain: t`$F = \dfrac{IA}{c} = \dfrac{(1361)(${A})}{3.00\times10^8} = ${tn((S0 * A) / C3)}$ N, so $a = F/m = ${tn(a)}$ m/s². If that acted steadily in one direction for a day it would shift the satellite by $\tfrac12at^2 \approx ${Math.round((0.5 * a * 86400 ** 2) / 10) * 10}$ m — which is why orbit models for GPS and other navigation satellites include radiation pressure, their largest force after gravity.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §16.3 Energy carried by electromagnetic waves', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-3-energy-carried-by-electromagnetic-waves' },
    { label: 'OpenStax University Physics Vol. 2, §16.4 Momentum and radiation pressure', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-4-momentum-and-radiation-pressure' },
    { label: 'Kopp & Lean (2011), A new, lower value of total solar irradiance (1360.8 W/m²)', url: 'https://doi.org/10.1029/2010GL045777' },
    { label: 'JAXA: the small solar power sail demonstrator IKAROS', url: 'https://global.jaxa.jp/projects/sas/ikaros/' },
  ],
});
