// The electromagnetic spectrum: one kind of wave across more than twenty
// decades of frequency, c = fλ in a vacuum and photon energy E = hf; the bands
// as conventions tied to how the waves are made and how they meet matter; real
// sources (GPS L1, a microwave oven, the Deep Space Network's X-band link).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { C3, H_PLANCK, EV, tn, apart, specPic } from './_maxwell.js';
import { bandOf } from '../../src/viz/model/em-light.js';

const t = String.raw;

/** where each band lies, for the feedback on a wrong band */
const RANGE = {
  radio: 'Radio waves are longer than about 1 m (below 300 MHz).',
  microwave: 'Microwaves run from about 1 m down to 1 mm (300 MHz to 300 GHz).',
  infrared: 'Infrared runs from about 1 mm down to 750 nm.',
  visible: 'Visible light is only the narrow stretch from about 750 nm down to 400 nm.',
  ultraviolet: 'Ultraviolet runs from about 400 nm down to 10 nm.',
  'X-ray': 'X-rays run from about 10 nm down to 0.01 nm (roughly 0.1 to 100 keV).',
  'gamma ray': 'Gamma rays, from atomic nuclei, are usually above about 100 keV.',
};
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** a "which band?" item: the quantity described, its frequency, three wrong bands */
function bandItem(r, variants) {
  const v = r.pick(variants), band = bandOf(v.f).name;
  return {
    prompt: t`Which band of the spectrum does ${v.q} belong to?`,
    visual: specPic({ f: null, bands: false, marks: [], sizes: false }, 'The spectrum with its bands coloured but not named.'),
    choices: [cap(band), ...v.others.map(cap)],
    answer: 0,
    why: Object.fromEntries(v.others.map((o, k) => [k + 1, RANGE[o]])),
    hints: [v.hint],
    teach: 'Locate a wave on the spectrum by converting to wavelength (λ = c/f, or λ = hc/E for a photon) and comparing with the band edges.',
    explain: v.explain,
  };
}

// the worked example: the Deep Space Network's X-band downlink, 8.4 GHz
const EX = (() => {
  const f = 8.4e9, lam = C3 / f, EJ = H_PLANCK * f, EeV = EJ / EV;
  const fg = C3 / 532e-9, Eg = (H_PLANCK * fg) / EV;
  return { f, lam, EJ, EeV, Eg, ratio: Eg / EeV };
})();

export default lesson({
  id: 'phys2220.B6.5',
  title: 'The electromagnetic spectrum',
  minutes: 11, difficulty: 2,
  intro: t`Radio waves, microwaves, infrared, visible light, ultraviolet, X-rays and gamma rays are one phenomenon: electromagnetic waves, all travelling at $c$ in a vacuum. They differ only in frequency, and with it the wavelength and the energy each photon — each quantum of the wave — carries:

$$c = f\lambda,\qquad E = hf$$

The spectrum spans more than twenty decades, so it is drawn on a logarithmic scale. Its bands are named for how the waves are made and how they meet matter — antennas for radio, warm bodies and molecular vibrations for infrared, atoms’ outer electrons for visible and ultraviolet light, inner electrons for X-rays, nuclei for gamma rays — and their edges are conventions, not physics. Photon energy separates the gentle from the harmful: a radio photon carries millionths of an electronvolt, far too little to break a chemical bond (a few eV), while ultraviolet, X-ray and gamma photons carry enough to break bonds and knock electrons out of atoms.`,
  symbols: [
    { tex: 'f', text: 'the frequency, in hertz (cycles per second)' },
    { tex: t`\lambda`, text: 'the wavelength, in metres' },
    { tex: 'c', text: t`the speed of light in a vacuum, $3.00\times10^8$ m/s, the same for every band` },
    { tex: 'E = hf', text: 'the energy of one photon of the wave, in joules or electronvolts' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J·s` },
    { tex: t`\text{eV}`, text: t`the electronvolt, $1.602\times10^{-19}$ J: the energy an electron gains across 1 V. A handy form is $E = (1240\ \text{eV·nm})/\lambda$.` },
  ],
  why: 'Every radio link, telescope and medical scan picks its frequency for a reason: the band decides what makes the wave, what it passes through, and what it can do to the matter it meets.',
  visual: {
    type: 'em-spectrum',
    title: 'One wave, twenty decades',
    lead: 'The whole spectrum on a logarithmic strip: wavelength along the top, frequency and photon energy along the bottom, and things about one wavelength across beneath. Slide the marker, or click a labelled source, and read off its wavelength, photon energy and band.',
    tasks: [
      'Click “GPS L1” and then “microwave oven”: two microwaves only a factor of 1.6 apart in frequency, with wavelengths of 19 cm and 12 cm.',
      'Slide from H-alpha (red light) to the germicidal lamp: the photon energy climbs from 1.9 eV to 4.9 eV, past the few electronvolts that hold a chemical bond together.',
      'Find where one wavelength is the size of an atom: deep in the X-rays, which is why X-rays can map the atoms in a crystal.',
    ],
    params: { f: 5.45e14 },
  },
  example: {
    prompt: t`NASA’s Deep Space Network receives spacecraft signals at 8.4 GHz. Find (a) the wavelength, (b) the energy of one photon, in joules and in electronvolts, and (c) how many times more energy a photon of green light (532 nm) carries. Use $c = 3.00\times10^8$ m/s, $h = 6.626\times10^{-34}$ J·s and $1\ \text{eV} = 1.602\times10^{-19}$ J.`,
    visual: { type: 'em-spectrum', params: { f: EX.f, controls: [], readout: true, readouts: ['f', 'lambda', 'E', 'band'], marks: ['dsn', 'green'] }, caption: 'The X-band downlink and green light on the same scale: about five decades apart in frequency.' },
    steps: [
      { label: 'Wavelength', text: t`$\lambda = \dfrac{c}{f} = \dfrac{3.00\times10^8}{8.4\times10^9} = ${tn(EX.lam)}$ m $= ${tn(EX.lam * 100)}$ cm, in the microwave band.` },
      { label: 'Photon energy', text: t`$E = hf = (6.626\times10^{-34})(8.4\times10^9) = ${tn(EX.EJ)}$ J, and dividing by $1.602\times10^{-19}$ J/eV gives $${tn(EX.EeV)}$ eV $= ${tn(EX.EeV * 1e6)}\ \mu$eV.` },
      { label: 'Green light', text: t`$f = c/\lambda = ${tn(C3 / 532e-9)}$ Hz, so $E = hf = ${tn(EX.Eg)}$ eV — or directly, $E = (1240\ \text{eV·nm})/(532\ \text{nm}) = ${tn(1240 / 532)}$ eV.` },
      { label: 'Compare', text: t`$${tn(EX.Eg)}/${tn(EX.EeV)} \approx ${tn(EX.ratio, 2)}$: a green photon carries about ${Math.round(EX.ratio / 1000)} 000 times more energy, because its frequency is that much higher.` },
      { label: 'Sense check', text: t`A microwave photon carries about a hundred-thousandth of the few electronvolts needed to break a chemical bond: microwaves heat and carry signals, but cannot ionize.` },
    ],
    answer: t`(a) $\lambda = ${tn(EX.lam * 100)}$ cm; (b) $E = ${tn(EX.EJ)}$ J $= ${tn(EX.EeV * 1e6)}\ \mu$eV; (c) about $${tn(EX.ratio, 2)}$ times more.`,
  },
  practice: [
    num({
      id: 'lambda-from-f', difficulty: 1,
      gen(r) {
        const c = r.pick([
          { what: 'An FM radio station broadcasts at 101.5 MHz', f: 101.5e6, unit: 'm', k: 1 },
          { what: 'A Wi-Fi router transmits at 5.8 GHz', f: 5.8e9, unit: 'cm', k: 100 },
          { what: 'An airport surveillance radar works at 2.8 GHz', f: 2.8e9, unit: 'cm', k: 100 },
        ]);
        const lam = C3 / c.f;
        return {
          prompt: t`${c.what}. What is the wavelength of its waves? Use $c = 3.00\times10^8$ m/s.`,
          visual: specPic({ f: c.f, axes: ['f'], sizes: false, marks: [] }, 'The frequency marked on the spectrum (the wavelength scale is hidden).'),
          answer: lam * c.k, units: c.unit, tol: { rel: 0.01 },
          errors: apart([
            { value: (c.f / C3) * c.k, feedback: t`That is $f/c$, the number of waves per metre. The wavelength is $c/f$.` },
            ...(c.k === 100 ? [{ value: lam, feedback: 'That is the wavelength in metres; the answer is asked in centimetres.' }] : []),
          ], lam * c.k),
          hints: [t`$c = f\lambda$, so $\lambda = c/f$.`],
          teach: 'In a vacuum λ = c/f: the higher the frequency, the shorter the wave.',
          explain: t`$\lambda = \dfrac{c}{f} = \dfrac{3.00\times10^8}{${tn(c.f)}} = ${tn(lam)}$ m${c.k === 100 ? t` $= ${tn(lam * 100)}$ cm` : ''}.`,
        };
      },
    }),
    num({
      id: 'f-from-lambda', difficulty: 1,
      gen(r) {
        const c = r.pick([
          { what: 'A helium–neon laser emits red light of wavelength 632.8 nm', l: 632.8e-9, its: 'its' },
          { what: 'Copper Kα X-rays, used to find the structure of crystals, have a wavelength of 0.154 nm', l: 0.154e-9, its: 'their' },
          { what: 'Hydrogen gas between the stars emits radio waves of wavelength 21.1 cm', l: 0.211, its: 'their' },
        ]);
        const f = C3 / c.l;
        return {
          prompt: t`${c.what}. What is ${c.its} frequency? Use $c = 3.00\times10^8$ m/s.`,
          visual: specPic({ f, axes: ['lambda'], sizes: false, marks: [] }, 'The wavelength marked on the spectrum (the frequency scale is hidden).'),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: apart([{ value: c.l / C3, feedback: t`That is $\lambda/c$, the time per wave (the period). The frequency is its inverse, $c/\lambda$.` }], f),
          hints: [t`$f = c/\lambda$, with $\lambda$ in metres.`],
          teach: 'In a vacuum f = c/λ.',
          explain: t`$f = \dfrac{c}{\lambda} = \dfrac{3.00\times10^8}{${tn(c.l)}} = ${tn(f)}$ Hz.`,
        };
      },
    }),
    num({
      id: 'photon-eV', difficulty: 2,
      gen(r) {
        const c = r.pick([
          { what: 'a green laser pointer', lnm: 532, lT: t`532\ \text{nm}` },
          { what: 'a germicidal ultraviolet lamp', lnm: 254, lT: t`254\ \text{nm}` },
          { what: 'an optical-fibre telecom laser', lnm: 1550, lT: t`1550\ \text{nm}` },
          { what: 'a carbon-dioxide cutting laser', lnm: 10600, lT: t`10.6\ \mu\text{m}` },
        ]);
        const l = c.lnm * 1e-9, EJ = (H_PLANCK * C3) / l, E = EJ / EV;
        return {
          prompt: t`What is the energy, in electronvolts, of one photon from ${c.what}, wavelength $${c.lT}$? Use $h = 6.626\times10^{-34}$ J·s, $c = 3.00\times10^8$ m/s and $1\ \text{eV} = 1.602\times10^{-19}$ J.`,
          visual: specPic({ f: C3 / l, axes: ['lambda'], marks: [] }, 'The wavelength marked on the spectrum (the photon-energy scale is hidden).'),
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: apart([
            { value: EJ, feedback: t`That is the energy in joules. Divide by $1.602\times10^{-19}$ J/eV.` },
            { value: (H_PLANCK * l) / EV, feedback: t`$E = hf = hc/\lambda$: divide by the wavelength, do not multiply.` },
          ], E),
          hints: [t`$E = hf = hc/\lambda$.`, t`Shortcut: $hc = 1240$ eV·nm, so $E = (1240\ \text{eV·nm})/\lambda$.`],
          teach: t`A photon of wavelength $\lambda$ carries $E = hc/\lambda$; with $\lambda$ in nm, $E \approx 1240/\lambda$ eV.`,
          explain: t`$E = \dfrac{hc}{\lambda} = \dfrac{(6.626\times10^{-34})(3.00\times10^8)}{${tn(l)}} = ${tn(EJ)}$ J $= ${tn(E)}$ eV. Check: $1240/${c.lnm} = ${tn(1240 / c.lnm)}$.${E > 4 ? ' Enough to break chemical bonds, which is how ultraviolet light kills germs.' : E < 1 ? ' Too little to break a chemical bond: this light heats, rather than breaks, what it hits.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'which-band', difficulty: 2,
      gen(r) {
        return bandItem(r, [
          { q: t`a wave of wavelength $10\ \mu$m`, f: C3 / 10e-6, others: ['microwave', 'visible', 'ultraviolet'], hint: 'Compare 10 µm with the 400–750 nm of visible light: it is longer.', explain: t`$10\ \mu$m is about 13 times longer than red light (750 nm) but much shorter than 1 mm: infrared — where warm bodies like yours glow most strongly.` },
          { q: 'a wave of frequency 600 THz', f: 6e14, others: ['infrared', 'ultraviolet', 'microwave'], hint: t`Convert: $\lambda = c/f$.`, explain: t`$\lambda = (3.00\times10^8)/(6.00\times10^{14}) = 500$ nm, inside 400–750 nm: visible (green-blue) light.` },
          { q: t`light of wavelength $250$ nm`, f: C3 / 250e-9, others: ['visible', 'X-ray', 'infrared'], hint: 'Visible light stops at about 400 nm.', explain: t`250 nm is shorter than violet light (400 nm) but far longer than X-rays (below 10 nm): ultraviolet, the UV-C that germicidal lamps use.` },
          { q: 'a wave of frequency 12 GHz', f: 12e9, others: ['radio', 'infrared', 'visible'], hint: t`Convert: $\lambda = c/f$.`, explain: t`$\lambda = (3.00\times10^8)/(12\times10^9) = 2.5$ cm, between 1 mm and 1 m: microwave — satellite-TV dishes use these frequencies.` },
          { q: 'a photon of energy 5 keV', f: (5e3 * EV) / H_PLANCK, others: ['gamma ray', 'ultraviolet', 'visible'], hint: t`Use $\lambda = (1240\ \text{eV·nm})/E$.`, explain: t`$\lambda = 1240/5000 = 0.25$ nm: an X-ray, about the size of an atom.` },
        ]);
      },
    }),
    mcq({
      id: 'what-differs', difficulty: 1,
      prompt: 'A radio wave from an FM station and an X-ray from a dentist’s machine both travel through empty space. What is different about them?',
      visual: specPic({ f: null, marks: ['fm', 'cuka'] }, 'An FM broadcast and an X-ray (here copper’s Kα line) on the same spectrum, more than ten decades apart.'),
      choices: [
        'Only the frequency — and with it the wavelength and the energy of each photon',
        'Their speed: X-rays travel much faster than radio waves',
        'The radio wave is a sound wave; only the X-ray is electromagnetic',
        'The X-ray is made of particles, while the radio wave is a wave',
      ],
      answer: 0,
      why: {
        1: t`In a vacuum every electromagnetic wave travels at $c = 3.00\times10^8$ m/s.`,
        2: 'A radio carries sound, but the radio wave itself is electromagnetic: the receiver turns it into sound. Sound cannot cross empty space at all.',
        3: 'Both are waves of fields, and both come in photons; the photon picture just matters more at high frequency, where each photon carries a lot of energy.',
      },
      hints: ['Which one quantity, once you know it, fixes everything else about an electromagnetic wave in a vacuum?'],
      teach: 'All electromagnetic waves are the same kind of wave; they differ only in frequency, and so in wavelength and photon energy.',
      explain: t`Both are oscillating electric and magnetic fields moving at $c$. The FM wave’s frequency is about 100 MHz ($\lambda \approx 3$ m, photons of 0.4 µeV); a dental X-ray’s is around $10^{19}$ Hz ($\lambda \approx 0.02$ nm, photons of tens of keV). That factor of about $10^{11}$ in frequency is the whole difference — and why one is harmless at everyday strengths while the other can break molecules.`,
    }),
    mcq({
      id: 'oven-door', difficulty: 2,
      prompt: 'The window of a microwave oven is covered by a metal mesh with holes about 2 mm across. Why does it keep the 2.45 GHz microwaves in, yet let you watch the food?',
      visual: specPic({ f: 2.45e9, marks: ['oven', 'green'], axes: ['lambda'], sizes: false }, 'The oven’s frequency marked (gold), with green light for comparison, on a wavelength scale.'),
      choices: [
        'The holes are far smaller than the microwaves’ 12 cm wavelength, which cannot pass through them, but far larger than visible light’s wavelength, which can',
        'The glass absorbs the microwaves; the mesh is only decoration',
        'Microwaves travel more slowly than light, so they cannot pass through the holes in time',
        'The mesh carries an electric charge that repels the microwaves',
      ],
      answer: 0,
      why: {
        1: 'Ordinary glass lets microwaves straight through — that is why a glass bowl works in the oven. The metal mesh is what does the shielding.',
        2: 'Microwaves and light travel at the same speed, c.',
        3: 'The mesh is uncharged; it shields because it is a conductor riddled with holes much smaller than the wavelength.',
      },
      hints: ['Compare the size of the holes with each wavelength: 12 cm for the microwaves, about 0.5 µm for light.'],
      teach: 'A conducting mesh blocks waves much longer than its holes and passes waves much shorter: the wavelength decides.',
      explain: t`$\lambda = c/f = (3.00\times10^8)/(2.45\times10^9) = 12.2$ cm, sixty times the 2 mm holes: to the microwaves the mesh is a solid metal sheet, and they reflect. Visible light, at about 0.5 µm, is four thousand times smaller than the holes and passes through. The same rule lets a radio telescope’s dish be a mesh full of holes: to long radio waves it is a solid mirror.`,
    }),
    order({
      id: 'order-lambda', difficulty: 2,
      prompt: 'Put these in order of wavelength, longest first.',
      visual: specPic({ f: null, marks: [], sizes: false }, 'The bands of the spectrum, for reference.'),
      items: ['AM radio broadcasts', 'a microwave oven', 'the thermal glow of your skin', 'a green laser pointer', 'a germicidal ultraviolet lamp', 'cobalt-60 gamma rays'],
      hints: ['Place each source in its band first — the thermal glow of a warm body, for instance, is infrared.', 'On the picture, wavelength falls from left to right.'],
      teach: 'Longest to shortest wavelength: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma ray.',
      explain: t`AM radio (about 300 m), microwave oven (12 cm), skin’s thermal glow (about 9 µm, infrared), green laser (532 nm), germicidal lamp (254 nm), cobalt-60 gamma rays (about 0.001 nm) — from three football pitches to a hundredth of an atom.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 2, transfer: true,
      prompt: t`GPS satellites broadcast their L1 signal at 1575.42 MHz. What is its wavelength? Use $c = 3.00\times10^8$ m/s.`,
      visual: specPic({ f: 1.57542e9, axes: ['f'], sizes: false, marks: [] }, 'The GPS L1 frequency marked on the spectrum (the wavelength scale is hidden).'),
      answer: (C3 / 1.57542e9) * 100, units: 'cm', tol: { rel: 0.01 },
      errors: apart([{ value: C3 / 1.57542e9, feedback: 'That is the wavelength in metres; the answer is asked in centimetres.' }], (C3 / 1.57542e9) * 100),
      hints: [t`$\lambda = c/f$, with $f$ in hertz.`, t`$1575.42$ MHz $= 1.57542\times10^9$ Hz.`],
      teach: 'λ = c/f: the GPS L1 carrier is a microwave about 19 cm long.',
      explain: t`$\lambda = \dfrac{3.00\times10^8}{1.57542\times10^9} = ${tn(C3 / 1.57542e9)}$ m $= ${tn((C3 / 1.57542e9) * 100)}$ cm. Survey-grade receivers track the phase of this carrier to a small fraction of a wavelength, which is how they reach centimetre precision.`,
    }),
    num({
      id: 'cp-dish', difficulty: 2, transfer: true,
      gen(r) {
        const [band, f] = r.pick([['S-band', 2.3e9], ['X-band', 8.4e9], ['Ka-band', 32e9]]), D = r.pick([34, 70]);
        const lam = C3 / f, n = D / lam;
        return {
          prompt: t`The Deep Space Network talks to distant spacecraft through ${D} m dish antennas. How many wavelengths across is a dish at ${band}, ${tn(f / 1e9, 2)} GHz? Use $c = 3.00\times10^8$ m/s.`,
          visual: specPic({ f, axes: ['f'], sizes: false, marks: [] }, `The ${band} frequency marked on the spectrum (the wavelength scale is hidden).`),
          answer: n, tol: { rel: 0.01 },
          errors: apart([{ value: D * lam, feedback: t`Divide the diameter by the wavelength: $D/\lambda$.` }, { value: (D * (f / 1e9)) / C3, feedback: t`Convert to hertz first: 1 GHz $= 10^9$ Hz.` }], n),
          hints: [t`$\lambda = c/f$.`, t`Then the number of wavelengths is $D/\lambda$.`],
          teach: 'An antenna many wavelengths across sends a narrow beam, about λ/D radians wide.',
          explain: t`$\lambda = \dfrac{3.00\times10^8}{${tn(f)}} = ${tn(lam * 100)}$ cm, so $D/\lambda = ${D}/${tn(lam)} = ${tn(n)}$. The beam spreads by about $\lambda/D = ${tn(1 / n)}$ rad $= ${tn((180 / Math.PI) / n, 2)}^\circ$ — the higher the frequency, the tighter the beam, which is one reason missions moved from S-band to X-band and Ka-band.`,
        };
      },
    }),
    mcq({
      id: 'cp-band', difficulty: 2,
      gen(r) {
        return bandItem(r, [
          { q: 'a photon of energy 2.5 eV', f: (2.5 * EV) / H_PLANCK, others: ['infrared', 'ultraviolet', 'X-ray'], hint: t`$\lambda = (1240\ \text{eV·nm})/E$.`, explain: t`$\lambda = 1240/2.5 = 496$ nm, inside 400–750 nm: visible (blue-green) light.` },
          { q: 'a wave of wavelength 3 mm', f: C3 / 3e-3, others: ['radio', 'infrared', 'visible'], hint: 'Compare with the band edges at 1 m and 1 mm.', explain: 'Between 1 mm and 1 m: microwave, close to the 77 GHz (3.9 mm) radars that cars use to keep their distance.' },
          { q: 'a photon of energy 2 MeV', f: (2e6 * EV) / H_PLANCK, others: ['X-ray', 'ultraviolet', 'microwave'], hint: 'Photons above about 100 keV are usually gamma rays.', explain: t`$\lambda = 1240/(2\times10^6) = 6\times10^{-4}$ nm: a gamma ray, the kind atomic nuclei emit.` },
          { q: 'a wave of wavelength 50 nm', f: C3 / 50e-9, others: ['visible', 'X-ray', 'gamma ray'], hint: 'Visible light stops at about 400 nm; X-rays begin at about 10 nm.', explain: 'Between 10 nm and 400 nm: ultraviolet — the extreme ultraviolet that the Sun’s corona emits and chip-makers now print circuits with (13.5 nm).' },
        ]);
      },
    }),
    num({
      id: 'cp-photon', difficulty: 2,
      gen(r) {
        const c = r.pick([
          { what: 'a microwave oven, 2.45 GHz', f: 2.45e9, fT: t`2.45\times10^{9}` },
          { what: t`a germicidal lamp’s ultraviolet line, $1.18\times10^{15}$ Hz`, f: 1.18e15, fT: t`1.18\times10^{15}` },
          { what: t`an X-ray tube’s beam at $3.0\times10^{18}$ Hz`, f: 3.0e18, fT: t`3.0\times10^{18}` },
        ]);
        const E = (H_PLANCK * c.f) / EV;
        return {
          prompt: t`What is the energy of one photon from ${c.what}, in electronvolts? Use $h = 6.626\times10^{-34}$ J·s and $1\ \text{eV} = 1.602\times10^{-19}$ J.`,
          visual: specPic({ f: c.f, axes: ['f'], sizes: false, marks: [] }, 'The frequency marked on the spectrum (the photon-energy scale is hidden).'),
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: H_PLANCK * c.f, feedback: t`That is the energy in joules; divide by $1.602\times10^{-19}$ J/eV.` }], E),
          hints: [t`$E = hf$, then convert joules to electronvolts.`],
          teach: 'One photon carries E = hf; divide by 1.602×10⁻¹⁹ J/eV to express it in electronvolts.',
          explain: t`$E = hf = (6.626\times10^{-34})(${c.fT}) = ${tn(H_PLANCK * c.f)}$ J $= ${tn(E)}$ eV.${E < 1e-3 ? ' Far too little to break a chemical bond: microwaves heat food by setting water molecules turning, not by breaking them.' : E > 1e3 ? ' Thousands of electronvolts: enough to knock electrons out of atoms — ionizing radiation.' : ' Enough to break chemical bonds, which is how it damages the DNA of germs.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §16.5 The electromagnetic spectrum', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-5-the-electromagnetic-spectrum' },
    { label: 'NASA/JPL: DSN Telecommunications Link Design Handbook (810-005)', url: 'https://deepspace.jpl.nasa.gov/dsndocs/810-005/' },
    { label: 'GPS.gov: new civil signals and the L1 carrier', url: 'https://www.gps.gov/systems/gps/modernization/civilsignals/' },
  ],
});
