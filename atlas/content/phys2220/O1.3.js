// Polarization: light as a transverse wave whose electric field has a
// direction; polarizers and Malus's law I = I₀cos²θ (half of unpolarized
// light), the three-polarizer surprise, polarization by reflection
// (Brewster's angle tan θB = n₂/n₁) and by scattering. Pictures from the
// optics-waves (polar mode, Jones vectors) and optics-rays (Fresnel) sims.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, cosd, atand, acosd, polarPic, iface, label, seg, r6 } from './_optics.js';

const t = String.raw;
const malus = (I, d) => I * cosd(d) ** 2;

/** Sunlight scattered by one air molecule, seen from the side (schematic). */
const scatterPic = {
  type: 'graph',
  params: {
    aspect: 'wide', x: [-4.2, 4.2], y: [-1.5, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([0, 0.25], [0, 1.9], { color: 'accent2', width: 2, dash: true }), seg([0.25, 0], [3.4, 0], { color: 'gold', width: 1.6, dash: true })],
    arrows: [{ from: [-4, 0], to: [-0.35, 0], color: 'gold', label: 'sunlight (unpolarized)', labelDx: -150, labelDy: -14 }, { from: [0, 1.9], to: [0, 2.2], color: 'accent2' }],
    points: [{ x: 0, y: 0, color: 'ink', r: 6 }, label(0.2, -0.32, 'air molecule', 'ink2'), { x: 0, y: 2.25, color: 'good', r: 5, label: 'you, looking at the sky 90° from the Sun', labelDx: 10, labelDy: 0 }, label(1.6, 0.25, 'light carried on forward', 'gold')],
  },
  caption: 'Sunlight arriving from the left meets an air molecule; you look at that patch of sky from the side, at 90° to the sunlight (schematic).',
};

/** A drone looking down at a lake at an unknown angle from the vertical. */
const dronePic = {
  type: 'graph',
  params: {
    aspect: 'wide', x: [-3.2, 4.6], y: [-0.9, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: '0', lower: '-0.9', from: -10, to: 10, color: 'accent', alpha: 0.22 }],
    curves: [seg([-10, 0], [10, 0], { color: 'ink3', width: 1.6 }), seg([-2, 2.2], [0.6, 0], { color: 'gold', width: 2 }), seg([0.6, 0], [0.6, 2.3], { color: 'ink3', width: 1.1, dash: true }),
      { param: ['0.6 - 0.75*sin(t)', '0.75*cos(t)'], t: [0, 0.869], color: 'ink2', width: 1.4 }, seg([0.6, 0], [3.2, 2.2], { color: 'gold', width: 1.4, dash: true })],
    points: [{ x: -2.05, y: 2.24, color: 'ink', r: 7, label: 'drone with polarizing filter', labelDx: 12, labelDy: -6 }, label(0.0, 1.05, 'θ = ?', 'ink'), label(2.4, 1.35, 'sunlight reflected off the lake (glare)', 'gold'), label(-3.0, -0.45, 'lake, n = 1.33', 'ink2'), label(0.68, 2.2, 'normal', 'ink3')],
  },
  caption: 'A drone camera looking at a lake: glare from the surface travels along its line of sight (schematic, not to scale).',
};

export default lesson({
  id: 'phys2220.O1.3',
  title: 'Polarization',
  minutes: 12, difficulty: 2,
  intro: t`Light is a transverse wave: its electric field oscillates *across* the direction it travels. If the field always lies along one line, the light is **linearly polarized**; sunlight and lamp light are **unpolarized**, a jumble of all directions. A **polarizer** passes only the part of the field along its transmission axis. Because intensity goes as the field squared, polarized light meeting a polarizer at angle $\theta$ to its axis comes out with

$$I = I_0\cos^2\theta \qquad \text{(Malus's law)}$$

while unpolarized light loses exactly half. Reflection and scattering polarize light too, which is why polarizing filters cut glare.`,
  symbols: [
    { tex: 'I_0', text: 'the intensity of the polarized light arriving at the polarizer, in W/m²' },
    { tex: 'I', text: 'the intensity that gets through, in W/m²' },
    { tex: '\\theta', text: 'the angle between the light’s direction of polarization (its electric field) and the polarizer’s transmission axis' },
    { tex: '\\cos^2\\theta', text: 'the fraction passed: the field’s component along the axis is $E_0\\cos\\theta$, and intensity goes as the field squared' },
  ],
  why: t`Polarizers are in every LCD screen, camera filter and pair of glare-cutting sunglasses; astronomers read magnetic fields in space from polarized light. And gravitational waves have polarizations too — two of them, called + and ×, turned 45° apart rather than 90° ([how LIGO hears them](#/lesson/gr.S27.i)).`,
  visual: {
    type: 'optics-waves',
    title: 'Light through polarizers',
    lead: t`Unpolarized light (left) passes through polarizers drawn as discs; the bold line on each is its transmission axis. The yellow wave shows the electric field that gets through, and its size. Turn the polarizers and watch the intensities.`,
    tasks: [
      t`Turn polarizer 2 from 0° to 90°: the light fades as $\cos^2\theta$ — 75% of what reached it at 30°, half at 45°, none when the two are crossed.`,
      t`With the pair crossed (0° and 90°), choose three polarizers and set the middle one (polarizer 2) to 45° and the last to 90°: light gets through again — one eighth of $I_0$.`,
      t`Switch the light in to vertical: the first polarizer at 0° now passes all of it, and at 60° only a quarter.`,
    ],
    params: { mode: 'polar', n: 2, angles: [0, 90, 90], input: 'unpolarized' },
  },
  example: {
    prompt: t`Unpolarized light of intensity $800\ \text{W/m}^2$ passes through three polarizers in turn, with transmission axes at $0°$, $30°$ and $90°$ from the vertical. Find the intensity after each.`,
    visual: polarPic({ n: 3, angles: [0, 30, 90] }, 'Unpolarized light through polarizers at 0°, 30° and 90°: the field turns to follow each axis, shrinking each time.'),
    steps: [
      { label: 'First polarizer', text: t`Unpolarized light: the average of $\cos^2\theta$ over every direction is $\tfrac12$, so $I_1 = \tfrac12(800) = 400\ \text{W/m}^2$, now polarized at $0°$.` },
      { label: 'Second', text: t`The light's polarization is $30°$ from this axis: $I_2 = 400\cos^2 30° = 400(0.75) = 300\ \text{W/m}^2$, now polarized at $30°$.` },
      { label: 'Third', text: t`From $30°$ to $90°$ is $60°$: $I_3 = 300\cos^2 60° = 300(0.25) = 75\ \text{W/m}^2$.` },
      { label: 'Sense check', text: t`Without the middle polarizer, $0°$ and $90°$ are crossed and nothing gets through. The middle one doesn't add light: it turns the polarization in two smaller steps, each losing less.` },
    ],
    answer: t`$400$, $300$ and $75\ \text{W/m}^2$.`,
  },
  practice: [
    num({
      id: 'unpolarized', difficulty: 1,
      gen(r) {
        const I0 = r.pick([600, 800, 1000, 1200]), a = r.pick([0, 30, 45, 70]);
        return {
          prompt: t`Unpolarized light of intensity $${I0}\ \text{W/m}^2$ falls on a polarizer whose axis is at $${a}°$ from the vertical. What intensity gets through?`,
          answer: I0 / 2, units: 'W/m^2', tol: { rel: 0.005 },
          errors: apart([{ value: malus(I0, a), feedback: t`Malus's law needs light polarized along one direction. Unpolarized light has every direction equally, and on average $\cos^2\theta = \tfrac12$.` }, { value: I0, feedback: 'A polarizer blocks the part of the field across its axis: unpolarized light always loses half.' }], I0 / 2),
          hints: ['Unpolarized light has its field in every direction across the beam, equally.', t`The average of $\cos^2\theta$ over all angles is $\tfrac12$.`],
          teach: 'An ideal polarizer passes exactly half of unpolarized light, whatever the angle of its axis.',
          explain: t`$I = \tfrac12 I_0 = ${I0 / 2}\ \text{W/m}^2$, whatever the axis angle; what comes out is polarized along the axis.`,
          visual: polarPic({ n: 1, angles: [a], hide: ['I1'] }, `Unpolarized light meeting one polarizer at ${a}°. The intensity after it is what you are finding.`),
        };
      },
    }),
    num({
      id: 'malus', difficulty: 1,
      gen(r) {
        const I0 = r.pick([20, 40, 50, 80]), a = r.pick([20, 30, 45, 60, 75]);
        const key = malus(I0, a);
        return {
          prompt: t`Vertically polarized laser light of intensity $${I0}\ \text{W/m}^2$ passes through a polarizer whose axis is at $${a}°$ from the vertical. What intensity gets through?`,
          answer: key, units: 'W/m^2', tol: { rel: 0.005 },
          errors: apart([{ value: I0 * cosd(a), feedback: t`Intensity goes as the field *squared*: use $\cos^2\theta$, not $\cos\theta$.` }, { value: I0 * Math.sin((a * Math.PI) / 180) ** 2, feedback: t`$\theta$ is the angle between the polarization and the axis, and the part passed is the one along the axis: $\cos^2\theta$.` }, { value: I0 / 2, feedback: 'The light is already polarized, so it is not simply halved: use Malus’s law.' }], key),
          hints: [t`Malus's law: $I = I_0\cos^2\theta$.`, t`$\cos ${a}° = ${tn(cosd(a), 4)}$; square it.`],
          teach: 'Polarized light through a polarizer at angle θ to its polarization keeps the fraction cos²θ.',
          explain: t`$I = ${I0}\cos^2 ${a}° = ${I0}(${tn(cosd(a) ** 2, 4)}) = ${tn(key)}\ \text{W/m}^2$.`,
          visual: polarPic({ n: 1, angles: [a], input: 0, hide: ['I1'] }, `Vertically polarized light meeting a polarizer at ${a}°. The intensity after it is what you are finding.`),
        };
      },
    }),
    num({
      id: 'angle-for', difficulty: 2,
      gen(r) {
        const [frac, txt] = r.pick([[0.25, 'a quarter'], [0.5, 'half'], [0.75, 'three-quarters'], [0.1, 'a tenth']]);
        const key = acosd(Math.sqrt(frac));
        return {
          prompt: t`Polarized light meets a polarizer. At what angle between the light's polarization and the polarizer's axis does ${txt} of the intensity get through?`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: acosd(frac), feedback: t`Take the square root first: $\cos^2\theta = ${frac}$ means $\cos\theta = \sqrt{${frac}}$.` }, { value: 90 - key, feedback: t`That angle passes the complementary fraction, $1 - ${frac}$: you used $\sin^2\theta$ instead of $\cos^2\theta$.` }], key),
          hints: [t`Set $\cos^2\theta = ${frac}$.`, t`$\cos\theta = \sqrt{${frac}} = ${tn(Math.sqrt(frac), 4)}$; take the inverse cosine.`],
          teach: 'Malus’s law runs backwards too: a fraction f is passed at θ = arccos √f.',
          explain: t`$\cos\theta = \sqrt{${frac}} = ${tn(Math.sqrt(frac), 4)}$, so $\theta = ${tn(key)}°$.`,
          visual: {
            type: 'graph',
            params: { aspect: 'wide', x: [0, 90], y: [0, 1.08], xlabel: 'angle θ (°)', ylabel: 'fraction passed', xticks: 6, curves: [{ fn: 'cos(x*pi/180)^2', color: 'gold', width: 2.6, label: 'cos²θ', labelAt: 30 }] },
            caption: 'Malus’s law: the fraction of polarized light a polarizer passes, against the angle θ.',
          },
        };
      },
    }),
    num({
      id: 'three-pol', difficulty: 2,
      gen(r) {
        const I0 = r.pick([400, 600, 900]), a2 = r.pick([20, 30, 40, 50, 60]);
        const I1 = I0 / 2, I2 = malus(I1, a2), I3 = malus(I2, 90 - a2);
        return {
          prompt: t`Unpolarized light of intensity $${I0}\ \text{W/m}^2$ passes through three polarizers with axes at $0°$, $${a2}°$ and $90°$. What intensity leaves the third?`,
          answer: I3, units: 'W/m^2', tol: { rel: 0.005 },
          errors: apart([{ value: malus(malus(I1, a2), 90), feedback: t`Each angle is measured from the *previous* polarizer's axis: the last step is $90° - ${a2}° = ${90 - a2}°$.` }, { value: malus(malus(I0, a2), 90 - a2), feedback: 'The first polarizer halves unpolarized light; Malus’s law applies only after that.' }, { value: 0, feedback: 'The first and last are crossed, but the middle one turns the polarization between them, so some light gets through.' }], I3),
          hints: ['Halve the unpolarized light at the first polarizer.', t`Then apply $\cos^2$ of the angle between neighbouring axes: $${a2}°$, then $${90 - a2}°$.`],
          teach: 'Through a chain of polarizers, each one passes cos² of the angle between its axis and the one before.',
          explain: t`$${I0}/2 = ${I1}$; $\;${I1}\cos^2 ${a2}° = ${tn(I2)}$; $\;${tn(I2)}\cos^2 ${90 - a2}° = ${tn(I3)}\ \text{W/m}^2$. Altogether $\tfrac12\cos^2 ${a2}°\cos^2 ${90 - a2}° = \tfrac18\sin^2(${2 * a2}°)$ of $I_0$, largest when the middle axis is at $45°$.`,
          visual: polarPic({ n: 3, angles: [0, a2, 90], hide: ['I3'] }, 'Unpolarized light through three polarizers. The intensity after the last is what you are finding.'),
        };
      },
    }),
    mcq({
      id: 'paradox', difficulty: 2,
      prompt: 'Two crossed polarizers (axes at 0° and 90°) let no light through. Slip a third polarizer between them with its axis at 45°, and light gets through. How?',
      choices: [
        'Each polarizer passes the field’s component along its axis, so the middle one turns the light’s polarization to 45°, and the last one passes the component of that along 90°',
        'The middle polarizer emits light of its own',
        'Polarizers only block light, so the light must be leaking round the edges',
        'The middle polarizer makes the light unpolarized again, and unpolarized light always gets half through',
      ],
      answer: 0,
      why: {
        1: 'A polarizer is passive: it absorbs part of the light and emits none.',
        2: 'If polarizers only blocked, adding one could never let more light through. They project the field onto their axis.',
        3: 'Light leaving any polarizer is polarized along its axis — here 45°, not unpolarized.',
      },
      hints: ['After a polarizer, which way does the light’s field point?', 'Then apply cos² for each step: 45°, then 45° again.'],
      teach: 'A polarizer projects the field onto its axis, so inserting one between crossed polarizers turns the polarization in two passable steps.',
      explain: t`After the first: $\tfrac12 I_0$, polarized at $0°$. The middle passes $\cos^2 45° = \tfrac12$ of that and leaves it polarized at $45°$. The last passes $\cos^2 45° = \tfrac12$ again: $\tfrac18 I_0$ in all. The light is never "unblocked" — at each step it is projected onto a new direction.`,
      visual: polarPic({ n: 3, angles: [0, 45, 90] }, 'Unpolarized light through polarizers at 0°, 45° and 90°.'),
    }),
    num({
      id: 'brewster', difficulty: 2,
      gen(r) {
        const [mat, n] = r.pick([['water', 1.33], ['glass', 1.5], ['fused silica', 1.46], ['diamond', 2.42]]);
        const key = atand(n);
        return {
          prompt: t`Light in air reflects from ${mat} ($n = ${n.toFixed(2)}$). At what angle of incidence is the reflected light completely polarized (Brewster's angle, $\tan\theta_B = n_2/n_1$)?`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: atand(1 / n), feedback: t`Upside down: $\tan\theta_B = n_2/n_1$ with the light coming from air, so $n_2/n_1 = ${n.toFixed(2)}$.` }, { value: Math.asin(1 / n) * 180 / Math.PI, feedback: 'That is a critical angle (a sine). Brewster’s angle uses the tangent.' }], key),
          hints: [t`$\tan\theta_B = n_2/n_1 = ${n.toFixed(2)}/1.00$.`],
          teach: t`At Brewster's angle, $\tan\theta_B = n_2/n_1$, the reflected light is purely polarized parallel to the surface (s).`,
          explain: t`$\theta_B = \arctan ${n.toFixed(2)} = ${tn(key)}°$. Light polarized in the plane of incidence (p) is then not reflected at all; the reflected and refracted rays are exactly perpendicular, and only s light (field parallel to the surface) bounces off.`,
          visual: iface({ n1: 1, n2: n, angle: 30, graph: true, pol: 'u', hide: ['brewster'] }, `Light meeting ${mat}, and how much is reflected against the angle of incidence, for s light (field across the page) and p light (in the page). Dashed: unpolarized light.`),
        };
      },
    }),
    mcq({
      id: 'sunglasses', difficulty: 2,
      prompt: 'Sunlight glinting off a lake is partly polarized by the reflection. To cut this glare, polarizing sunglasses have their transmission axes:',
      choices: ['Vertical', 'Horizontal', 'At 45°', 'It makes no difference: any polarizer halves the glare'],
      answer: 0,
      why: {
        1: 'Horizontal axes would pass exactly the part of the glare the reflection favours.',
        2: 'At 45° the lenses would pass about half of each polarization: no better than plain tinted glass.',
        3: 'The glare is mostly polarized, not unpolarized, so the axis direction matters a great deal.',
      },
      hints: ['Read the graph: which polarization is reflected more strongly, s or p?', 's light has its field parallel to the reflecting surface — for a lake, horizontal.'],
      teach: 'Reflection from a horizontal surface favours light whose field is horizontal (s), so glare-cutting lenses pass vertical fields.',
      explain: 'At every angle s light — field parallel to the surface, here horizontal — reflects more strongly than p light, and near Brewster’s angle (53° for water) the glare is almost purely s. Vertical transmission axes block it while passing about half of the unpolarized light from everything else.',
      visual: iface({ n1: 1, n2: 1.33, angle: 53, graph: true, pol: 'u' }, 'Reflection from water against the angle of incidence: s light (field parallel to the surface) and p light (field in the plane of incidence).'),
    }),
    mcq({
      id: 'sky', difficulty: 3,
      prompt: 'Light from the blue sky 90° away from the Sun is strongly polarized. Why?',
      choices: [
        'Sunlight makes the electrons in air molecules oscillate across its direction of travel, and an oscillating charge sends no light along its own line of motion — so, seen at 90°, only one direction of oscillation is visible',
        'Air molecules are tiny polarizers, all lined up by Earth’s magnetic field',
        'Blue light is polarized and red light is not',
        'The atmosphere reflects sunlight like a mirror at Brewster’s angle',
      ],
      answer: 0,
      why: {
        1: 'Air molecules are not aligned; the effect comes from the geometry of the scattering itself.',
        2: 'Polarization is a property of the scattering direction, not of colour: scattered red light at 90° is polarized too.',
        3: 'There is no surface up there to reflect from; it is scattering by individual molecules.',
      },
      hints: ['Unpolarized sunlight still has its field across its direction of travel — in the picture, up–down or in and out of the page.', 'Can an electron moving up and down send light upward, along its own line of motion?'],
      teach: 'Scattering at 90° polarizes light, because an oscillating charge cannot radiate along its own line of oscillation.',
      explain: 'Sunlight travelling left to right drives electrons up–down and in–out of the page. An electron oscillating up–down radiates nothing straight up, so the light reaching you (above) comes only from the in–out motion: it is polarized perpendicular to the plane containing the Sun, the molecule and you. Real skylight is at most about 75–80% polarized, because some of it is scattered more than once. Bees navigate by this pattern, and photographers darken skies with a polarizing filter.',
      visual: scatterPic,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two-pol', difficulty: 2,
      gen(r) {
        const f = r.pick([0.1, 0.2, 0.3, 0.4]);
        const key = acosd(Math.sqrt(2 * f));
        return {
          prompt: t`Unpolarized light passes through two polarizers. At what angle between their axes is the intensity that leaves the second ${Math.round(f * 100)}% of the original?`,
          answer: key, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: acosd(Math.sqrt(f)), feedback: 'The first polarizer already halves unpolarized light: set ½cos²θ equal to the fraction.' }, { value: acosd(2 * f), feedback: t`Take the square root: $\cos^2\theta = ${tn(2 * f, 2)}$ gives $\cos\theta = \sqrt{${tn(2 * f, 2)}}$.` }], key),
          hints: [t`$I = \tfrac12 I_0\cos^2\theta$.`, t`$\cos^2\theta = 2 \times ${f} = ${tn(2 * f, 2)}$.`],
          teach: 'Two polarizers pass ½cos²θ of unpolarized light, θ being the angle between their axes.',
          explain: t`$\tfrac12\cos^2\theta = ${f}$ gives $\cos\theta = \sqrt{${tn(2 * f, 2)}} = ${tn(Math.sqrt(2 * f), 4)}$, so $\theta = ${tn(key)}°$.`,
          visual: polarPic({ n: 2, angles: [0, Math.round(key)], hide: ['I2'] }, 'Unpolarized light through two polarizers; the angle between their axes is what you are finding.'),
        };
      },
    }),
    num({
      id: 'cp-pilot', difficulty: 2, transfer: true,
      gen(r) {
        const tilt = r.pick([0, 15, 20, -20, -30]);
        const key = cosd(45 - tilt) ** 2;
        return {
          prompt: t`A cockpit's LCD display emits light polarized at $45°$ to the vertical. A pilot wears polarizing sunglasses whose transmission axis is vertical when her head is level. ${tilt === 0 ? 'Her head is level.' : `She tilts her head so that the lenses' axis turns $${Math.abs(tilt)}°$ ${tilt > 0 ? 'toward' : 'away from'} the display's direction of polarization.`} What fraction of the display's light passes her lenses?`,
          answer: key, tol: { rel: 0.01, abs: 0.002 },
          errors: apart([{ value: cosd(45 - tilt), feedback: t`Square the cosine: intensity goes as $\cos^2\theta$.` }, { value: 0.5 * key, feedback: 'The display’s light is already polarized: there is no extra factor of ½.' }], key),
          hints: ['First find the angle between the display’s polarization (45°) and the lenses’ axis.', t`Malus's law with $\theta = ${45 - tilt}°$.`],
          teach: 'Polarized displays seen through polarizing glasses dim as cos² of the angle between the two axes — and go dark when crossed.',
          explain: t`$\cos^2 ${45 - tilt}° = ${tn(key, 3)}$. Tilting her head the other way by 45° would cross the axes and black the display out — one reason pilots are advised to wear non-polarized sunglasses.`,
          visual: polarPic({ n: 1, angles: [tilt >= 0 ? tilt : 180 + tilt], input: 45, hide: ['I1'] }, 'The display’s light, polarized at 45°, meeting the sunglasses’ polarizing lens.'),
        };
      },
    }),
    num({
      id: 'cp-drone', difficulty: 2, transfer: true,
      prompt: t`A drone films a calm lake ($n = 1.33$) through a polarizing filter. Glare is sunlight reflected off the water. At what angle from the vertical should the camera look at the water for the filter to remove the glare completely?`,
      answer: atand(1.33), units: 'deg', tol: { rel: 0.005 },
      errors: [{ value: 90 - atand(1.33), feedback: 'That is measured from the water surface. Angles of incidence are measured from the normal, here the vertical.' }],
      hints: ['Glare can be removed completely only when the reflected light is completely polarized.', t`That happens at Brewster's angle: $\tan\theta_B = n_\text{water}/n_\text{air}$.`],
      teach: 'Reflected glare is completely polarized at Brewster’s angle, where a filter can remove all of it.',
      explain: t`$\theta_B = \arctan 1.33 = ${tn(atand(1.33))}°$ from the vertical. The reflected glare is then purely s-polarized (horizontal field), and a filter with a vertical axis blocks it entirely, so the camera sees into the water. At other angles the filter still helps, but cannot remove the glare completely.`,
      visual: dronePic,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §1.8 Polarization', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-8-polarization' },
    { label: 'Hecht, Optics (5th ed.), ch. 8: Polarization', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
  ],
});
