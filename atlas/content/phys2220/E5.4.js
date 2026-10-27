// Dielectrics: an insulator in the gap multiplies C by κ. Its molecules
// polarize, leaving bound surface charge that cancels part of the free
// charge's field. Battery connected: V fixed, Q and U rise by κ. Isolated: Q
// fixed, V, E and U fall by κ. Every dielectric breaks down above its
// dielectric strength.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, sf, apart, plates } from './_circuits.js';

const t = String.raw;
const MAT = {
  teflon: ['Teflon', 2.1, 60e6], polystyrene: ['polystyrene', 2.56, 24e6], mylar: ['Mylar', 3.2, 7e6],
  nylon: ['nylon', 3.4, 14e6], paper: ['paper', 3.7, 16e6], pyrex: ['Pyrex glass', 5.6, 14e6], neoprene: ['neoprene rubber', 6.7, 12e6],
};

export default lesson({
  id: 'phys2220.E5.4',
  title: 'Dielectrics',
  minutes: 11, difficulty: 3,
  intro: t`Fill the gap of a capacitor with an insulator — a **dielectric** — and its capacitance goes up by a factor $\kappa$, the material’s **dielectric constant**. The free charge on the plates pulls the material’s molecules slightly out of shape (or turns molecules that are already lopsided, like water’s), so each face of the slab ends up with a thin layer of **bound charge** of the opposite sign to the plate beside it. That bound charge cancels part of the free charge’s field: for the same charge on the plates, the field and the voltage drop to $1/\kappa$ of their vacuum values, so $C = Q/V$ rises by $\kappa$.

What happens next depends on the battery. **Connected**, the voltage is held fixed, so the plates take on $\kappa$ times the charge (and store $\kappa$ times the energy). **Disconnected**, the charge is trapped, so the voltage, the field and the energy all fall by $\kappa$.`,
  equation: t`C = \kappa C_0 = \frac{\kappa\varepsilon_0 A}{d}`,
  symbols: [
    { tex: '\\kappa', text: 'the dielectric constant (Greek kappa): a pure number, 1 for vacuum, 1.0006 for air, 2–7 for plastics, glass and rubber, 80 for water' },
    { tex: 'C_0', text: 'the capacitance with vacuum in the gap, in farads' },
    { tex: 'C', text: 'the capacitance with the dielectric filling the gap' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}$ F/m' },
    { tex: 'A,\\ d', text: 'the plate area (m²) and the gap (m), which the dielectric fills' },
    { tex: 'E_\\text{max}', text: 'the dielectric strength: the largest field a material can stand before it breaks down and conducts — 3 MV/m for air, 60 MV/m for Teflon' },
  ],
  why: 'Every practical capacitor has a dielectric: it multiplies the capacitance, holds the plates apart, and stands a field far stronger than air could — which is what sets how much energy a capacitor of a given size can hold.',
  visual: {
    type: 'em-capacitor',
    title: 'Slide in a dielectric',
    lead: t`Push the slab into the gap and watch the free charge on the plates (± above and below), the bound charge on the slab’s faces, and the readout. Then disconnect the battery and do it again.`,
    tasks: [
      'With the battery connected, push the slab fully in: Q and U rise by κ while V and E stay fixed — the battery supplies the extra charge.',
      'Pull it out, untick “Battery connected”, then push it in again: now Q stays fixed while V, E and U all fall by κ.',
      'Try strontium titanate (κ = 233) on the battery: the plates suddenly hold 233 times the charge.',
    ],
    params: { A: 0.02, d: 2e-3, V: 12, f: 0, material: 'paper', readouts: ['C', 'Q', 'V', 'E', 'U'] },
  },
  example: {
    prompt: t`A 200 pF air-filled capacitor is charged to 100 V and disconnected from the battery. A slab of paper ($\kappa = 3.7$) is then slid in until it fills the gap. Find the new capacitance, voltage and stored energy. Where did the energy go?`,
    visual: plates({ A: 0.0226, d: 1e-3, V: 100, material: 'paper', f: 0.6, Q: 2e-8, connected: false, show: { energy: true } }, 'Part-way in: the battery is disconnected, so the charge on the plates is fixed. More free charge crowds onto the plates over the slab, where the bound charge cancels part of its field; the field (and the energy density, in gold) is the same everywhere in the gap.'),
    steps: [
      { label: 'The charge is trapped', text: t`Before: $Q = C_0V_0 = (200\ \text{pF})(100\ \text{V}) = 20$ nC. With the battery gone it cannot change.` },
      { label: 'New capacitance', text: t`$C = \kappa C_0 = 3.7\times200 = 740$ pF.` },
      { label: 'New voltage', text: t`$V = Q/C = 20\ \text{nC}/740\ \text{pF} = 27$ V: down by the factor 3.7, and the field between the plates with it.` },
      { label: 'Energy', text: t`Before: $\tfrac12C_0V_0^2 = \tfrac12(200\times10^{-12})(100)^2 = 1.00\ \mu$J. After: $Q^2/2C = (20\times10^{-9})^2/(2\times740\times10^{-12}) = 0.27\ \mu$J — also down by 3.7.` },
      { label: 'Where it went', text: t`The fringing field at the slab’s edge pulls it into the gap: about 0.73 µJ of work is done on the slab (or on the hand holding it back). Pulling the slab out again would take that much work.` },
    ],
    answer: t`$C = 740$ pF, $V = 27$ V, $U = 0.27\ \mu$J (from 1.00 µJ); the field did 0.73 µJ of work drawing the slab in.`,
  },
  practice: [
    num({
      id: 'kappa-c', difficulty: 1,
      gen(r) {
        const key = r.pick(['teflon', 'polystyrene', 'mylar', 'paper', 'pyrex']), [name, k] = MAT[key];
        const C0 = r.pick([22, 47, 100, 150]);
        return {
          prompt: t`An air-filled capacitor of ${C0} pF has its gap completely filled with ${name} ($\kappa = ${k}$). What is its new capacitance?`,
          answer: k * C0, units: 'pF', tol: { rel: 0.005 },
          errors: [{ value: C0 / k, feedback: 'The dielectric weakens the field of a given charge, so the same voltage holds more charge: C goes up by κ, not down.' }],
          hints: [t`$C = \kappa C_0$ (air is so close to vacuum, $\kappa = 1.0006$, that $C_0$ is the air value).`],
          teach: t`Filling the gap with a dielectric multiplies the capacitance by $\kappa$.`,
          explain: t`$C = \kappa C_0 = ${k}\times${C0} = ${nice(sf(k * C0))}$ pF.`,
          visual: plates({ A: 0.01, d: 2e-3, V: 12, material: key, f: 1, hide: ['Q'] }, `The gap filled with ${name}; bound charges (small, on the slab’s faces) oppose the free charges on the plates.`),
        };
      },
    }),
    mcq({
      id: 'connected', difficulty: 2,
      prompt: t`A capacitor stays connected to a battery while a slab of dielectric ($\kappa = 4$) is pushed in to fill the gap. What happens?`,
      choices: [
        'Q rises fourfold; V and E between the plates stay the same',
        'V and E fall fourfold; Q stays the same',
        'Nothing changes: the battery fixes everything',
        'Q rises fourfold and E falls fourfold',
      ],
      answer: 0,
      why: {
        1: 'That is what happens when the battery is disconnected and the charge is trapped.',
        2: 'The battery fixes the voltage, not the charge: it pumps extra charge on as C rises.',
        3: 'With V fixed, E = V/d cannot change: the extra free charge exactly makes up for the bound charge.',
      },
      hints: ['Which quantity does a connected battery hold fixed?', 'C rises by κ; with V fixed, Q = CV follows.'],
      teach: 'Connected to a battery, V is fixed: a dielectric raises C, and Q = CV rises with it.',
      explain: t`$V$ is the battery’s, so $E = V/d$ is unchanged, while $C = 4C_0$ means $Q = 4C_0V$: the battery pushes three times the original charge on. The extra free charge is what it takes to keep the field the same despite the slab’s bound charge.`,
      visual: plates({ A: 0.02, d: 2e-3, V: 12, material: 'nylon', f: 0.5, hide: ['Q'] }, 'The slab half in, the battery connected.'),
    }),
    num({
      id: 'isolated-v', difficulty: 2,
      gen(r) {
        const key = r.pick(['teflon', 'mylar', 'paper', 'pyrex', 'neoprene']), [name, k] = MAT[key];
        const V0 = r.pick([50, 100, 150, 400]);
        return {
          prompt: t`A capacitor is charged to ${V0} V and disconnected. A slab of ${name} ($\kappa = ${k}$) is then slid in to fill the gap. What is the voltage across the capacitor now?`,
          answer: V0 / k, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: V0 * k, feedback: 'Q is fixed and C rises by κ, so V = Q/C falls by κ.' }, { value: V0, feedback: 'The battery is gone, so nothing holds V at its old value: Q is what stays fixed.' }],
          hints: ['Disconnected: Q is fixed.', t`$V = Q/C = Q/(\kappa C_0) = V_0/\kappa$.`],
          teach: t`With the charge trapped, a dielectric lowers the voltage (and the field) by $\kappa$.`,
          explain: t`$V = V_0/\kappa = ${V0}/${k} = ${nice(sf(V0 / k))}$ V. The bound charge on the slab’s faces cancels all but $1/\kappa$ of the plates’ field.`,
          visual: plates({ A: 0.02, d: 2e-3, V: 12, material: key, f: 0.7, Q: 4e-10, connected: false, hide: ['V'] }, 'The capacitor disconnected, slab sliding in.'),
        };
      },
    }),
    num({
      id: 'breakdown', difficulty: 2,
      gen(r) {
        const key = r.pick(['teflon', 'polystyrene', 'paper', 'pyrex']), [name, , Es] = MAT[key];
        const d = r.pick([0.05, 0.1, 0.2, 0.5]);    // mm
        const Vmax = Es * d * 1e-3;
        return {
          prompt: t`A capacitor’s plates are separated by a ${name} film ${d} mm thick. ${name.charAt(0).toUpperCase() + name.slice(1)} breaks down at about ${nice(Es / 1e6)} MV/m. Roughly what is the highest voltage the capacitor can stand?`,
          answer: Vmax / 1e3, units: 'kV', tol: { rel: 0.01 },
          errors: apart([{ value: (Es / d) / 1e3, feedback: t`Multiply the field by the gap: $V = Ed$, with $d$ in metres.` }], Vmax / 1e3),
          hints: [t`In a uniform field $V = Ed$; breakdown starts when $E$ reaches $E_\text{max}$.`, t`$V_\text{max} = E_\text{max}d = (${nice(Es / 1e6)}\times10^6\ \text{V/m})(${d}\times10^{-3}\ \text{m})$.`],
          teach: t`The breakdown voltage is the dielectric strength times the thickness: $V_\text{max} = E_\text{max}d$.`,
          explain: t`$V_\text{max} = (${nice(Es / 1e6)}\times10^6)(${d}\times10^{-3}) = ${nice(sf(Vmax))}$ V $= ${nice(sf(Vmax / 1e3))}$ kV. Real films fail somewhat below the textbook figure at defects, so capacitors are rated well under it. The same gap of air would stand only ${nice(sf(3e6 * d * 1e-3))} V.`,
          visual: plates({ A: 0.01, d: d * 1e-3, V: 12, material: key, f: 1, hide: ['V', 'Q'] }, 'The film fills the whole gap.'),
        };
      },
    }),
    num({
      id: 'bound', difficulty: 3,
      gen(r) {
        const key = r.pick(['teflon', 'paper', 'pyrex', 'neoprene']), [name, k] = MAT[key];
        const sig = r.pick([2, 5, 8, 12]);     // µC/m²
        const sb = sig * (1 - 1 / k);
        return {
          prompt: t`The plates of a charged, isolated capacitor carry free charge densities of $\pm${sig}\ \mu\text{C/m}^2$. A slab of ${name} ($\kappa = ${k}$) fills the gap. What is the bound charge density on each face of the slab?`,
          answer: sb, units: 'µC/m^2', tol: { rel: 0.01 },
          errors: apart([
            { value: sig / k, feedback: t`That is the net charge density $\sigma_\text{free} - \sigma_\text{bound}$ that the field responds to. The bound charge is the rest: $\sigma(1 - 1/\kappa)$.` },
            { value: sig, feedback: 'Then the field inside would vanish, as in a conductor. A dielectric cancels only part of the field.' },
          ], sb),
          hints: [t`Inside the slab the field is $E_0/\kappa$, and Gauss’s law ties it to the net charge: $(\sigma - \sigma_b)/\varepsilon_0 = \sigma/(\kappa\varepsilon_0)$.`, t`Solve for $\sigma_b$: $\sigma_b = \sigma(1 - 1/\kappa)$.`],
          teach: t`A dielectric’s bound surface charge is $\sigma_b = \sigma(1 - 1/\kappa)$: it cancels all but $1/\kappa$ of the free charge’s field.`,
          explain: t`$\sigma_b = ${sig}(1 - 1/${k}) = ${nice(sf(sb))}\ \mu\text{C/m}^2$, of the opposite sign to the plate it faces. The field inside comes from the ${nice(sf(sig / k))}\ µC/m² that is left over.`,
          visual: plates({ A: 0.02, d: 2.5e-3, V: 12, material: key, f: 1, Q: 4e-10, connected: false, hide: ['Q'] }, 'Free charge on the plates (large marks) and the bound charge it induces on the slab’s faces (small marks, opposite sign). Marks show density only.'),
        };
      },
    }),
    num({
      id: 'half-filled', difficulty: 3,
      gen(r) {
        const key = r.pick(['teflon', 'mylar', 'paper', 'pyrex']), [name, k] = MAT[key];
        const C0 = r.pick([40, 60, 100]);
        const C = C0 * (1 + k) / 2;
        return {
          prompt: t`A slab of ${name} ($\kappa = ${k}$), as thick as the gap, is pushed halfway into a ${C0} pF air capacitor, so it fills half the plate area. What is the capacitance now?`,
          answer: C, units: 'pF', tol: { rel: 0.005 },
          errors: apart([
            { value: (k * C0) / 2, feedback: 'The empty half still counts: it is a capacitor too, in parallel with the filled half.' },
            { value: 1 / (2 / C0 + 2 / (k * C0)), feedback: 'The two halves are side by side (in parallel), not in series: both span the full gap and share the voltage.' },
          ], C),
          hints: ['Think of two capacitors side by side, each with half the area, sharing the same voltage.', t`Empty half: $C_0/2$. Filled half: $\kappa C_0/2$. In parallel they add.`],
          teach: 'A slab filling part of the area makes two capacitors in parallel: the empty part and the filled part.',
          explain: t`$C = \dfrac{C_0}{2} + \dfrac{\kappa C_0}{2} = \dfrac{(1 + \kappa)C_0}{2} = \dfrac{(1 + ${k})(${C0})}{2} = ${nice(sf(C))}$ pF.`,
          visual: plates({ A: 0.02, d: 2e-3, V: 12, material: key, f: 0.5, hide: ['Q'] }, 'The slab fills the gap over half of the plate area.'),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A charged capacitor is disconnected from its battery and a dielectric slab is pushed into its gap. A student explains: “The dielectric increases the capacitance, so the capacitor can hold more charge — the charge on the plates goes up by $\kappa$.” What is wrong?`,
      choices: [
        'With the battery disconnected there is nowhere for extra charge to come from: Q stays fixed and the voltage falls by κ',
        'Nothing: Q rises by κ',
        'The capacitance falls, so the charge falls',
        'The charge rises, but by κ − 1 rather than κ',
      ],
      answer: 0,
      why: {
        1: 'Q = CV would rise only if V were held fixed — by a connected battery.',
        2: 'A dielectric always raises C.',
        3: 'The free charge cannot change at all: the plates are isolated.',
      },
      hints: ['Where would extra charge come from?', 'Isolated plates: Q is fixed. Then V = Q/C.'],
      teach: 'An isolated capacitor keeps its charge; a dielectric then lowers its voltage instead.',
      explain: t`“Can hold more charge” means more charge *per volt*. With no battery, $Q$ is fixed, so $V = Q/(\kappa C_0)$ falls by $\kappa$ — and the stored energy $Q^2/2C$ falls too, as the slab is drawn in.`,
      visual: plates({ A: 0.02, d: 2e-3, V: 12, material: 'pyrex', f: 0.4, Q: 4e-10, connected: false }, 'The charged capacitor, disconnected, with the slab going in.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-film', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([1, 1.5, 2]), w = r.pick([2, 3]), th = r.pick([6, 10, 12]);     // m, cm, µm
        const C = (3.2 * EPS0 * L * w * 1e-2) / (th * 1e-6);
        return {
          prompt: t`A film capacitor for a satellite’s power-conditioning unit is made from two aluminium foils ${w}.0 cm wide and ${L} m long, separated by Mylar film ($\kappa = 3.2$) ${th} µm thick. What is its capacitance before it is rolled up? (Rolling it with a second film doubles the useful area; ignore that here.)`,
          answer: C * 1e9, units: 'nF', tol: { rel: 0.01 },
          errors: apart([{ value: (EPS0 * L * w * 1e-2) / (th * 1e-6) * 1e9, feedback: t`Include the film’s dielectric constant: $C = \kappa\varepsilon_0A/d$.` }], C * 1e9),
          hints: [t`$A = (${w}\times10^{-2}\ \text{m})(${L}\ \text{m})$ and $d = ${th}\times10^{-6}$ m.`, t`$C = \kappa\varepsilon_0A/d$.`],
          teach: 'Thin films with a dielectric are how real capacitors pack large capacitance into small volumes.',
          explain: t`$C = \dfrac{(3.2)(8.854\times10^{-12})(${nice(w * 1e-2 * L)})}{${th}\times10^{-6}} = ${tex(C)}$ F $= ${nice(sf(C * 1e9))}$ nF. The film’s strength (about 7 MV/m) lets this ${th} µm gap stand roughly ${nice(sf(7e6 * th * 1e-6))} V.`,
          visual: plates({ A: w * 1e-2 * L, d: 0.5e-3, V: 12, material: 'mylar', f: 1, hide: ['Q', 'd'] }, 'The capacitor unrolled, seen edge-on: two foils with Mylar between them (the film thickness is drawn hugely exaggerated).'),
        };
      },
    }),
    num({
      id: 'cp-energy', difficulty: 2,
      gen(r) {
        const key = r.pick(['teflon', 'paper', 'pyrex', 'neoprene']), [name, k] = MAT[key];
        const U0 = r.pick([10, 25, 40, 80]);     // µJ
        return {
          prompt: t`An isolated air capacitor stores ${U0} µJ. A slab of ${name} ($\kappa = ${k}$) is slid in to fill the gap. How much energy does it store now?`,
          answer: U0 / k, units: 'µJ', tol: { rel: 0.005 },
          errors: [{ value: U0 * k, feedback: t`That would be right with a battery connected (V fixed). Isolated, Q is fixed and $U = Q^2/2C$ falls as C rises.` }],
          hints: [t`Isolated: $Q$ fixed. Use $U = Q^2/2C$.`],
          teach: t`At fixed charge, $U = Q^2/2C$, so a dielectric lowers the stored energy by $\kappa$.`,
          explain: t`$U = \dfrac{Q^2}{2\kappa C_0} = \dfrac{U_0}{\kappa} = ${nice(sf(U0 / k))}\ \mu$J. The difference, ${nice(sf(U0 - U0 / k))} µJ, is the work the field did pulling the slab in.`,
          visual: plates({ A: 0.02, d: 2e-3, V: 12, material: key, f: 1, Q: 4e-10, connected: false, hide: ['Q'], show: { energy: true } }, 'The slab in place in the isolated capacitor; gold shading shows the energy density.'),
        };
      },
    }),
    mcq({
      id: 'cp-best', difficulty: 3, transfer: true,
      prompt: t`A designer of a pulsed-power supply wants to store as much energy as possible in a given volume of dielectric, charged right up to the material’s breakdown field. The most energy a filled gap can hold per cubic metre is $u_\text{max} = \tfrac12\kappa\varepsilon_0E_\text{max}^2$. Which material is best?`,
      choices: ['strontium titanate (κ = 233, 8 MV/m)', 'Teflon (κ = 2.1, 60 MV/m)', 'paper (κ = 3.7, 16 MV/m)', 'air (κ = 1.0006, 3 MV/m)'],
      answer: 0,
      why: {
        1: t`Teflon’s high strength helps a lot, because $u_\text{max}$ goes as $E_\text{max}^2$: $2.1\times60^2 \approx 7600$ — but strontium titanate reaches $233\times8^2 \approx 15\,000$ (in units of $\tfrac12\varepsilon_0$ (MV/m)²).`,
        2: t`Paper: $3.7\times16^2 \approx 950$, well behind.`,
        3: t`Air: $1\times3^2 = 9$ — over a thousand times worse than the best solid.`,
      },
      hints: [t`Compare $\kappa E_\text{max}^2$ for each — the field counts twice.`, t`Strontium titanate: $233\times64$; Teflon: $2.1\times3600$.`],
      teach: t`The energy a dielectric can store per volume goes as $\kappa E_\text{max}^2$, so strength matters as much as the dielectric constant.`,
      explain: t`$\kappa E_\text{max}^2$ in (MV/m)²: strontium titanate $\approx 14\,900$, Teflon $\approx 7560$, paper $\approx 950$, air 9. So strontium titanate, at about $6.6\times10^4$ J/m³, about twice Teflon. (Real high-κ ceramics lose capacitance at high fields and temperatures, which is why film capacitors still win many pulsed-power jobs.)`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §8.4–8.5 Capacitor with a Dielectric; Molecular Model of a Dielectric (Table 8.1)', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-4-capacitor-with-a-dielectric' },
  ],
});
