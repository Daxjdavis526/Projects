// Thin-film interference: reflections from the two faces of a film, the
// extra path 2nt, the half-cycle flip on reflecting from a higher index, the
// colours of soap films and oil slicks, anti-reflection coatings, air wedges.
// Pictures from optics-waves (film mode: the exact single-layer reflectance,
// tested against quarter-wave and absentee layers).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, filmPic, label, seg, r6 } from './_optics.js';

const t = String.raw;

/** Two glass plates touching at one end, held apart at the other by a hair (angle exaggerated). */
function wedgePic(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.6, 10.6], y: [-1.3, 2.4], axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: '-0.6', from: 0, to: 10, color: 'accent', alpha: 0.25 }, { fn: '0.1*x + 0.6', lower: '0.1*x', from: 0, to: 10, color: 'accent', alpha: 0.25 }],
      curves: [seg([0, 0], [10, 0], { color: 'accent2', width: 1.6 }), seg([0, 0], [10, 1], { color: 'accent2', width: 1.6 }), { param: ['10.15 + 0.15*cos(t)', '0.5 + 0.5*sin(t)'], t: [0, 6.2832], color: 'ink', width: 1.6 }],
      arrows: [{ from: [3, 2.3], to: [3, 0.45], color: 'gold', label: 'light from above', labelDx: 8, labelDy: 0 }],
      points: [label(0.1, -0.95, 'plates touch here', 'ink2'), label(7.6, -0.95, 'a hair holds them apart', 'ink2'), label(6.2, 0.33, 'air wedge', 'ink3')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O3.2',
  title: 'Thin-film interference',
  minutes: 14, difficulty: 3,
  intro: t`Light reflects from both faces of a thin film — a soap bubble, an oil slick, a coating on a lens — and the two reflections interfere. Seen straight on, the one from the bottom face travels an extra distance $2t$ inside the film, which is $2nt$ wavelengths' worth of path in air terms. One more rule decides the result: a wave reflecting from a **higher** index flips by half a cycle; from a lower index it does not. With **one** such flip (a soap film in air),

$$2nt = \left(m + \tfrac12\right)\lambda \quad\text{gives bright reflection}, \qquad 2nt = m\lambda \quad\text{gives dark}$$

With **none or two** flips (a coating on glass), the two conditions swap.`,
  symbols: [
    { tex: 'n', text: 'the refractive index of the film; inside it the wavelength is $\\lambda/n$, which is why the path counts as $2nt$' },
    { tex: 't', text: 'the film’s thickness, in nm (soap films and coatings are tens to hundreds of nanometres)' },
    { tex: '\\lambda', text: 'the wavelength of the light in vacuum (or air)' },
    { tex: 'm', text: 'a whole number, 0, 1, 2, …' },
    { tex: '\\tfrac12', text: 'the half-cycle flip: a reflection from a medium of higher index turns crests into troughs' },
  ],
  why: 'Anti-reflection coatings on camera lenses, star-tracker windows and solar cells work this way; so do the colours of soap bubbles, oil slicks and beetle shells — and stacks of many such layers make mirrors that reflect all but a few parts per million of the light, like those in LIGO.',
  visual: {
    type: 'optics-waves',
    title: 'Colours from a thin film',
    lead: t`Left: light reflecting from the top (ray 1) and bottom (ray 2) of a film. Right: the fraction reflected at each wavelength, the colour that makes in white light, and how that colour changes with thickness — Newton's colour scale. Start with a soap film in air.`,
    tasks: [
      'Slide the thickness toward zero: the film turns black. That is the black spot at the top of a draining bubble, just before it pops.',
      'Set the index below the film to 1.52 (glass), the film to 1.38 and the thickness to 100 nm: the reflection falls well under the dashed “no film” line — an anti-reflection coating.',
      'Tilt the viewing angle: the path difference shrinks and the colours shift toward blue — why a bubble’s bands look different from different directions.',
    ],
    params: { mode: 'film', t: 300, nFilm: 1.33, nSub: 1 },
  },
  example: {
    prompt: t`A soap film ($n = 1.33$) in air is 300 nm thick. Viewed straight on in white light, which visible wavelengths does it reflect most strongly, and which does it cancel?`,
    visual: filmPic({ t: 300, nFilm: 1.33, nSub: 1 }, 'The 300 nm soap film: its two reflections, its reflected spectrum and the colour it shows.'),
    steps: [
      { label: 'Count the flips', text: t`Top face: air ($1.00$) to soap ($1.33$), a higher index — a half-cycle flip. Bottom face: soap to air, a lower index — no flip. One flip, so the bright condition is $2nt = (m + \tfrac12)\lambda$.` },
      { label: 'Bright', text: t`$2nt = 2(1.33)(300\ \text{nm}) = 798$ nm. $\lambda = 798/(m + \tfrac12)$: $1596$ nm ($m = 0$, infrared), $532$ nm ($m = 1$, green), $319$ nm ($m = 2$, ultraviolet). Only the green one is visible.` },
      { label: 'Dark', text: t`$2nt = m\lambda$: $\lambda = 798$ nm (at the red edge) and $399$ nm (at the violet edge).` },
      { label: 'Sense check', text: t`Strong green, weak deep red and violet: the film looks green — as the colour swatch shows. A thicker or thinner film shifts the whole pattern.` },
    ],
    answer: t`Strongest reflection at 532 nm (green); 798 nm and 399 nm are cancelled, at the ends of the visible range.`,
  },
  practice: [
    mcq({
      id: 'flips', difficulty: 2,
      prompt: 'Sunlight in air reflects from an oil slick (n = 1.47) floating on water (n = 1.33). Which of the two reflections flip by half a cycle?',
      choices: ['Only the top one (air to oil)', 'Only the bottom one (oil to water)', 'Both', 'Neither'],
      answer: 0,
      why: {
        1: 'From oil (1.47) to water (1.33) is toward a *lower* index: no flip there.',
        2: 'The bottom reflection goes from 1.47 toward 1.33, a lower index: it does not flip.',
        3: 'Air (1.00) to oil (1.47) is toward a higher index: that reflection does flip.',
      },
      hints: ['A reflection flips only when the light is about to enter a medium of higher index.', 'Compare the indices at each face: 1.00 → 1.47 at the top, 1.47 → 1.33 at the bottom.'],
      teach: 'A reflection flips by half a cycle only when the light reflects off a medium of higher index.',
      explain: 'At the top, air → oil is toward a higher index: flip. At the bottom, oil → water is toward a lower index: no flip. With one flip, the oil is bright where 2nt = (m + ½)λ — like a soap film, unlike a coating on glass.',
      visual: filmPic({ t: 250, nFilm: 1.47, nSub: 1.33, hide: ['flips', 'spectrum', 'colour'], strip: false }, 'Light reflecting from the top and bottom of an oil film on water.'),
    }),
    num({
      id: 'ar-thickness', difficulty: 2,
      gen(r) {
        const [coat, nc] = r.pick([['magnesium fluoride', 1.38], ['silica', 1.46], ['cryolite', 1.35]]);
        const lam = r.pick([500, 550, 600]);
        const key = lam / (4 * nc);
        return {
          prompt: t`An anti-reflection coating of ${coat} ($n = ${nc}$) is put on glass ($n = 1.52$). What is the thinnest coating that cancels the reflection of ${lam} nm light at normal incidence?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: apart([{ value: lam / (2 * nc), feedback: t`That puts the two reflections in step (bright). Both reflections flip here, so cancelling needs $2nt = \tfrac12\lambda$.` }, { value: lam / 4, feedback: t`Use the wavelength in the coating, $\lambda/n$: $t = \lambda/(4n)$.` }], key),
          hints: [t`Both reflections (air → coating, coating → glass) go toward a higher index: two flips, which cancel each other's effect.`, t`So the reflections cancel when the extra path is half a wavelength: $2nt = \tfrac12\lambda$.`],
          teach: 'With two flips, a quarter-wave layer (t = λ/4n) makes the reflections cancel: an anti-reflection coating.',
          explain: t`$t = \dfrac{\lambda}{4n} = \dfrac{${lam}}{4(${nc})} = ${tn(key)}$ nm — a quarter of the wavelength inside the coating, so the round trip is half a wavelength.`,
          visual: filmPic({ t: Math.round(key * 0.6), nFilm: nc, nSub: 1.52, hide: ['flips', 'spectrum', 'colour'], strip: false }, 'A coating on glass, and the two reflections that are to cancel (thickness not to scale).'),
        };
      },
    }),
    num({
      id: 'soap-min', difficulty: 2,
      gen(r) {
        const [col, lam] = r.pick([['red (650 nm)', 650], ['yellow (580 nm)', 580], ['blue (470 nm)', 470], ['green (530 nm)', 530]]);
        const key = lam / (4 * 1.33);
        return {
          prompt: t`What is the thinnest soap film ($n = 1.33$, in air) that reflects ${col} light strongly at normal incidence?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: apart([{ value: lam / (2 * 1.33), feedback: 'One reflection flips, so bright needs 2nt = (m + ½)λ: for the thinnest film, m = 0.' }, { value: lam / 4, feedback: t`Divide by the film's index too: $t = \lambda/(4n)$.` }], key),
          hints: ['A soap film in air has one flipping reflection (at its top face).', t`Bright: $2nt = (m + \tfrac12)\lambda$; the thinnest film has $m = 0$.`],
          teach: 'With one flip, the thinnest film that reflects a colour strongly is a quarter of that wavelength thick, measured inside the film.',
          explain: t`$2nt = \tfrac12\lambda$ gives $t = \lambda/(4n) = ${lam}/(4\times1.33) = ${tn(key)}$ nm. The next bright thickness is three times that, $${tn(3 * key)}$ nm.`,
          visual: filmPic({ t: 300, nFilm: 1.33, nSub: 1, hide: ['spectrum', 'colour'] }, 'A soap film in air (here 300 nm thick), with Newton’s colour scale against thickness from 0 to 1500 nm.'),
        };
      },
    }),
    mcq({
      id: 'black-film', difficulty: 2,
      prompt: 'As a soap bubble drains, the film at its top thins until it looks black, just before the bubble pops. Why black?',
      choices: [
        'Far thinner than a wavelength, the film gives almost no extra path, and the half-cycle flip at its top face makes the two reflections cancel at every wavelength',
        'The film there has broken: there is a hole, and nothing to reflect light',
        'Thin soap absorbs all colours of light',
        'Thin films reflect only infrared, which we cannot see',
      ],
      answer: 0,
      why: {
        1: 'A hole would pop the bubble at once; the black film is intact, just very thin — 10 to 30 nm.',
        2: 'Soap solution is transparent; it absorbs almost nothing.',
        3: 'For a very thin film the two reflections cancel at all wavelengths, infrared included.',
      },
      hints: ['How big is the extra path 2nt when t is far smaller than λ?', 'How many of the two reflections flip?'],
      teach: 'A film much thinner than a wavelength cancels its own reflection when exactly one face flips the phase.',
      explain: t`With $t \ll \lambda$ the extra path $2nt$ is negligible, so the only difference between the two reflections is the half-cycle flip at the top face. They arrive half a cycle apart and cancel — at every wavelength, so the film looks black against a dark background. A film with no flips, or two, would instead look bright as it vanished.`,
      visual: filmPic({ t: 15, nFilm: 1.33, nSub: 1, hide: ['flips', 'spectrum', 'colour'] }, 'A very thin soap film and Newton’s colour scale against thickness.'),
    }),
    num({
      id: 'which-colour', difficulty: 2,
      gen(r) {
        const [t0, n0, what] = r.pick([[250, 1.47, t`An oil film ($n = 1.47$) on water`], [300, 1.33, t`A soap film ($n = 1.33$) in air`], [250, 1.33, t`A soap film ($n = 1.33$) in air`], [300, 1.47, t`An oil film ($n = 1.47$) on water`]]);
        const opd = 2 * n0 * t0;
        const vis = [0, 1, 2, 3, 4].map((m) => opd / (m + 0.5)).filter((l) => l >= 400 && l <= 700);
        const key = vis.length ? vis[0] : NaN;
        return {
          prompt: t`${what} is ${t0} nm thick. Which visible wavelength (400–700 nm) does it reflect most strongly at normal incidence?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: apart([{ value: opd, feedback: 'That would need a whole-wavelength path difference — the dark condition when one reflection flips.' }, ...[1, 2, 3].map((m) => ({ value: opd / m, feedback: 'With one flipping reflection, whole wavelengths of path difference give cancellation, not reinforcement.' }))], key),
          hints: [t`One reflection flips (the top), so bright needs $2nt = (m + \tfrac12)\lambda$.`, t`$2nt = ${opd}$ nm; try $m = 0, 1, 2, \ldots$ until $\lambda = ${opd}/(m + \tfrac12)$ falls between 400 and 700 nm.`],
          teach: 'List the wavelengths 2nt/(m + ½) and keep the visible one.',
          explain: t`$2nt = ${opd}$ nm; $\lambda = ${opd}/(m + \tfrac12)$ gives ${[0, 1, 2, 3].map((m) => `$${tn(opd / (m + 0.5))}$`).join(', ')} nm…; the visible one is $${tn(key)}$ nm.`,
          visual: filmPic({ t: t0, nFilm: n0, nSub: n0 === 1.47 ? 1.33 : 1, hide: ['spectrum', 'colour', 'flips'], strip: false }, `The ${t0} nm film and its two reflections.`),
        };
      },
    }),
    num({
      id: 'wedge', difficulty: 3,
      gen(r) {
        const D = r.pick([0.04, 0.05, 0.08]), L = r.pick([8, 10, 12]), lam = r.pick([546, 589]);
        const dx = ((lam * 1e-9 * (L * 1e-2)) / (2 * D * 1e-3)) * 1e3;
        return {
          prompt: t`Two flat glass plates ${L} cm long touch at one end and are held apart at the other by a hair ${D} mm thick, trapping a thin wedge of air. Lit from above with ${lam} nm light, the wedge shows straight bright and dark fringes. How far apart are neighbouring dark fringes?`,
          answer: dx, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 2 * dx, feedback: t`Each fringe needs the air gap $t$ to grow by $\lambda/2$ (the path $2t$ grows by $\lambda$), not by $\lambda$.` }, { value: dx / 2, feedback: t`The gap grows by $\lambda/2$ per fringe: spacing $= (\lambda/2)\,L/D$.` }],
          hints: [t`Moving one fringe along the wedge, the extra path $2t$ grows by one wavelength, so the gap $t$ grows by $\lambda/2$.`, t`The gap grows by $D$ over the length $L$, i.e. by $D/L$ per unit length.`, t`Fringe spacing $= \dfrac{\lambda/2}{D/L} = \dfrac{\lambda L}{2D}$.`],
          teach: 'In an air wedge each fringe marks a further half-wavelength of gap, which measures tiny thicknesses.',
          explain: t`Spacing $= \dfrac{\lambda L}{2D} = \dfrac{(${lam}\times10^{-9})(${L / 100})}{2(${D}\times10^{-3})} = ${tn(dx)}$ mm. Counting fringes turns this round: $N = 2D/\lambda = ${tn((2 * D * 1e-3) / (lam * 1e-9))}$ fringes along the plate measure the hair's thickness to a fraction of a micrometre. (At the touching end the film is dark: the reflection from the lower plate flips, the one from the upper glass–air face does not.)`,
          visual: wedgePic('Two glass plates held apart by a hair at one end, trapping a wedge of air (angle hugely exaggerated).'),
        };
      },
    }),
    mcq({
      id: 'purple', difficulty: 2,
      prompt: 'Look at an anti-reflection-coated camera lens and its faint reflection has a purple or magenta tint. Why?',
      choices: [
        'The coating is a quarter-wave for green light in the middle of the spectrum; red and blue, farther from that design, are cancelled less, so they dominate the weak reflection',
        'The coating is made of purple dye',
        'The coating absorbs green light',
        'Coated lenses reflect more light than uncoated ones, mostly purple',
      ],
      answer: 0,
      why: {
        1: 'The coatings are clear materials such as magnesium fluoride; the colour comes from interference.',
        2: 'A good coating absorbs almost nothing; green is cancelled in the reflection and passes through the lens.',
        3: 'Coated lenses reflect less — about 1% instead of 4% per surface.',
      },
      hints: ['A single quarter-wave layer can be exactly right for only one wavelength. Which is it designed for?', 'Read the spectrum in the Explore with the coating set: where is the reflection lowest, and highest?'],
      teach: 'A single-layer coating cancels best at its design wavelength, so the residual reflection is tinted by the colours it misses.',
      explain: 'Coatings are designed for the middle of the spectrum, around 550 nm, where the eye is most sensitive. There the reflection nearly vanishes; toward violet and deep red the path difference is no longer half a wavelength and some reflection returns. Red plus blue looks magenta. Modern lenses stack several layers to flatten the reflection across the spectrum.',
      visual: filmPic({ t: 100, nFilm: 1.38, nSub: 1.52, design: 550, hide: ['colour', 'flips'], strip: false }, 'A 100 nm magnesium fluoride coating on glass: the fraction reflected across the spectrum, with the uncoated glass for comparison (dashed).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-oil', difficulty: 2,
      gen(r) {
        const lam = r.pick([480, 520, 600]), m = r.pick([0, 1]);
        const key = ((m + 0.5) * lam) / (2 * 1.47);
        return {
          prompt: t`Seen from directly above, a patch of oil ($n = 1.47$) floating on water ($n = 1.33$) reflects ${lam} nm light strongly. What is the ${m === 0 ? 'thinnest' : 'second-thinnest'} oil film that does so?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: apart([{ value: ((m + 1) * lam) / (2 * 1.47), feedback: t`One reflection flips (air → oil), so bright needs $2nt = (m + \tfrac12)\lambda$, not a whole number of wavelengths.` }, { value: ((m + 0.5) * lam) / 2, feedback: t`Divide by the oil's index: the path inside the film counts as $2nt$.` }], key),
          hints: [t`Flips: air → oil yes, oil → water no. One flip: bright at $2nt = (m + \tfrac12)\lambda$.`, t`${m === 0 ? 'Thinnest' : 'Second-thinnest'}: $m = ${m}$.`],
          teach: 'Count the flips first, then pick the bright or dark condition and solve for the thickness.',
          explain: t`$t = \dfrac{(m + \tfrac12)\lambda}{2n} = \dfrac{${m + 0.5}\times${lam}}{2\times1.47} = ${tn(key)}$ nm.`,
          visual: filmPic({ t: 400, nFilm: 1.47, nSub: 1.33, hide: ['flips', 'spectrum', 'colour'], strip: false }, 'Oil on water and its two reflections (the thickness drawn is not the answer).'),
        };
      },
    }),
    num({
      id: 'cp-sapphire', difficulty: 3, transfer: true,
      prompt: t`A star tracker looks out through a sapphire window ($n = 1.77$), which reflects $\left(\tfrac{0.77}{2.77}\right)^2 = 7.7\%$ of the light at each bare surface. A single coating cancels the reflection completely at its design wavelength if its index is $\sqrt{n_\text{window}}$ (the geometric mean of air's and sapphire's) and its thickness is a quarter of the wavelength inside it. For 550 nm, how thick should that ideal coating be?`,
      answer: 550 / (4 * Math.sqrt(1.77)), units: 'nm', tol: { rel: 0.005 },
      errors: [{ value: 550 / (4 * 1.77), feedback: t`Use the coating's index, $\sqrt{1.77} = 1.33$, not the window's.` }, { value: 550 / 4, feedback: t`A quarter of the wavelength *inside* the coating: $\lambda/(4n)$.` }, { value: 550 / (2 * Math.sqrt(1.77)), feedback: 'That is a half-wave layer, which leaves the reflection unchanged.' }],
      hints: [t`Coating index: $n_c = \sqrt{1.77}$.`, t`Thickness: $t = \lambda/(4n_c)$.`],
      teach: t`The ideal single-layer coating has index $\sqrt{n_1 n_2}$ and a quarter-wave thickness: its two reflections are then equal and opposite.`,
      explain: t`$n_c = \sqrt{1.77} = ${tn(Math.sqrt(1.77), 4)}$ and $t = 550/(4\times${tn(Math.sqrt(1.77), 4)}) = ${tn(550 / (4 * Math.sqrt(1.77)))}$ nm. With that index the reflections from the coating's two faces are equally strong, so the quarter-wave path makes them cancel exactly. Each uncoated surface would scatter 7.7% of the starlight as glare — a real problem for a sensor hunting faint stars beside a bright Earth or Moon.`,
      visual: filmPic({ t: 70, nFilm: 1.33, nSub: 1.77, design: 550, hide: ['flips', 'colour'], strip: false }, 'A sapphire window with a coating of the right index (1.33) but the wrong thickness, 70 nm: its reflection is least in the violet, not at 550 nm. The dashed line is bare sapphire. The right thickness is what you are finding.'),
    }),
    mcq({
      id: 'cp-slick-edge', difficulty: 3, transfer: true,
      prompt: 'A survey aircraft photographs an oil slick (n = 1.47) on the sea (n = 1.33). Toward its edges the oil thins to almost nothing. How do the thinnest edges look in the reflected light?',
      choices: ['Dark: the one flipping reflection makes the two reflections cancel when the film is very thin', 'Bright white: with no extra path, the two reflections add', 'The same as the open sea: an edge that thin has no effect at all', 'Deep red: thin films reflect the longest wavelengths'],
      answer: 0,
      why: {
        1: 'That would be true with zero or two flips (oil on glass, say) — not oil on water, which has one.',
        2: 'A film far thinner than a wavelength still changes the reflection: here it cancels most of it.',
        3: 'As the film thins, the extra path shrinks for every colour alike; nothing favours red.',
      },
      hints: ['Count the flips for air → oil → water.', 'With almost no extra path, only the flips decide whether the reflections add or cancel.'],
      teach: 'Whether a vanishing film looks dark or bright depends only on how many of its two reflections flip.',
      explain: 'Air → oil flips, oil → water does not: one flip. As t → 0 the two reflections arrive half a cycle apart and cancel, so the thinnest edges look darker than the sea around them. Remote-sensing analysts use the colour bands to estimate oil thickness — and the darkest thin sheen as its outer edge.',
      visual: filmPic({ t: 20, nFilm: 1.47, nSub: 1.33, hide: ['flips', 'colour', 'spectrum'], strip: false }, 'A very thin oil film on water, with its two reflections.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §3.4 Interference in Thin Films', url: 'https://openstax.org/books/university-physics-volume-3/pages/3-4-interference-in-thin-films' },
    { label: 'Hecht, Optics (5th ed.), §9.4 and §9.7 (thin films, multilayer coatings)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
  ],
});
