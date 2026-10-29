// Maxwell's correction (Griffiths §7.3.1–7.3.3): the divergence of Ampère's
// law demands ∇·J = 0, which a charging capacitor violates; adding
// ε₀∂E/∂t repairs it exactly, because its divergence is ∂ρ/∂t. The charging
// capacitor two ways (flat surface and bag through the gap), the field
// between the plates (μ₀Is/2πR² inside the plates' radius, μ₀I/2πs beyond),
// the displacement current I_d = C dV/dt; how small it is in a metal
// (ε₀ω/σ) and how a leaky capacitor discharging through its own dielectric
// makes no magnetic field at all (J + ∂D/∂t = 0). Displacement current is
// not a flow of charge. Transfers: the frequency above which seawater stops
// behaving as a conductor; the field at the rim of an AC capacitor. Uses
// em-gap.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, PI, SIGMA, sf, bare, tag, outOf, into } from './_em4.js';

const t = String.raw;
const SIG_CU = SIGMA.copper.sigma;

// the worked example: circular plates of radius 4 cm, 2 mm apart, charged by a steady 0.5 A
const EX = { R: 0.04, d: 2e-3, I: 0.5, s1: 0.02, s2: 0.06 };
EX.dEdt = EX.I / (EPS0 * PI * EX.R ** 2);
EX.B1 = (MU0 * EX.I * EX.s1) / (2 * PI * EX.R ** 2);
EX.B2 = (MU0 * EX.I) / (2 * PI * EX.s2);

/** An em-gap picture without controls or readouts. */
const gap = (params, caption) => ({ type: 'em-gap', params: { controls: false, readout: false, t: 3, ...params }, caption });

/** A leaky capacitor: plates with a lossy dielectric between them, current crossing the dielectric. */
const leakyPic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.6, 1.6], {
    shade: [{ fn: '1.1', lower: '-1.1', from: -0.6, to: 0.6, color: 'teal', alpha: 0.2 }, { fn: '1.25', lower: '-1.25', from: -0.8, to: -0.6, color: 'ink3', alpha: 0.85 }, { fn: '1.25', lower: '-1.25', from: 0.6, to: 0.8, color: 'ink3', alpha: 0.85 }],
    arrows: [...[-0.7, 0, 0.7].map((y) => ({ from: [-0.5, y + 0.12], to: [0.5, y + 0.12], color: 'warn', width: 2 })), ...[-0.7, 0, 0.7].map((y) => ({ from: [0.5, y - 0.12], to: [-0.5, y - 0.12], color: 'violet', width: 2 }))],
    points: [tag(-0.7, 1.45, '+Q', 'bad', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(0.7, 1.45, '−Q', 'accent', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(1.0, 0.55, 'J = σE (leak)', 'warn'), tag(1.0, -0.55, 'ε ∂E/∂t (falling field)', 'violet'), tag(-2.9, -1.4, 'lossy dielectric', 'teal')],
  }),
  caption,
});

export default lesson({
  id: 'phys4600.M1.4',
  title: 'Maxwell’s correction: the displacement current',
  minutes: 15, difficulty: 3,
  equation: t`\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\frac{\partial\vec E}{\partial t}`,
  intro: t`Take the divergence of Ampère’s law, $\nabla\times\vec B = \mu_0\vec J$. The left side is the divergence of a curl, zero always — so the law demands $\nabla\cdot\vec J = 0$. That is true for steady currents and **false** wherever charge piles up: at a charging capacitor’s plate, current flows in and none flows out, and charge conservation says $\nabla\cdot\vec J = -\partial\rho/\partial t$. Maxwell’s repair is to add $\varepsilon_0\,\partial\vec E/\partial t$ to the current. Its divergence, by Gauss’s law, is $\varepsilon_0\,\partial(\nabla\cdot\vec E)/\partial t = \partial\rho/\partial t$ — exactly what is needed to make the right side divergence-free again. The new term, the **displacement current density** $\vec J_d = \varepsilon_0\,\partial\vec E/\partial t$, is not a flow of charge: it says a changing electric field makes a magnetic field, as a changing magnetic field makes an electric one. That symmetry is what lets light exist.`,
  symbols: [
    { tex: '\\vec B', text: 'the magnetic field, in tesla' },
    { tex: '\\vec J', text: t`the current density of moving charge, in $\text{A/m}^2$` },
    { tex: '\\varepsilon_0\\,\\partial\\vec E/\\partial t', text: t`the displacement current density $\vec J_d$, in $\text{A/m}^2$: a changing electric field, not moving charge` },
    { tex: '\\mu_0,\\ \\varepsilon_0', text: t`the vacuum permeability and permittivity; $\mu_0\varepsilon_0 = 1/c^2$` },
  ],
  why: t`Without this one term there would be no electromagnetic waves — no radio, no light as Maxwell understood it — and charge would not be conserved.`,
  visual: {
    type: 'em-gap',
    title: 'One loop, two surfaces',
    lead: t`A capacitor charging through straight wires, seen from the side. Ampère’s law relates the circulation of $\vec B$ round a loop to the current through **any** surface bounded by it. Round the wire, a flat disc is pierced by the current $I$; a bag stretched past the plate into the gap is pierced by nothing — unless the changing field in the gap counts.`,
    tasks: [
      t`Round the wire, switch between the flat disc and the bag: the conduction current through them is $I$ and 0, but conduction plus displacement current is $I$ for both.`,
      t`Move the loop between the plates and shrink it: it encloses only part of the changing flux, so $B$ there grows in proportion to the radius.`,
      t`Widen the loop past the plates’ edge: it encloses all the displacement current, $I$, and $B$ matches the field the same distance from the wire.`,
    ],
    params: { I: 2, R: 5, at: 'wire', r: 3, surface: 'bag' },
    caption: t`Quasistatic, with fringing ignored: the field between the plates is uniform and stops at their edge. ⊙ and ⊗ mark $\vec B$ out of and into the page, sized by strength.`,
  },
  example: {
    prompt: t`Circular plates of radius ${EX.R * 100} cm, ${EX.d * 1e3} mm apart, are charged by a steady ${EX.I} A. Find how fast the field between them grows, and the magnetic field in the gap ${EX.s1 * 100} cm and ${EX.s2 * 100} cm from the axis.`,
    visual: gap({ I: EX.I, R: EX.R * 100, at: 'gap', r: EX.s1 * 100, surface: 'flat' }, t`The charging capacitor side-on with a loop between the plates. Fringing ignored; not to scale.`),
    steps: [
      { label: 'The field grows', text: t`With charge $Q$ on plates of area $A = \pi R^2$, $E = Q/\varepsilon_0A$, so $\dfrac{\partial E}{\partial t} = \dfrac{I}{\varepsilon_0\pi R^2} \approx ${tex(EX.dEdt, 3)}\ \text{V/(m s)}$. The gap size does not enter.` },
      { label: 'Displacement current', text: t`$J_d = \varepsilon_0\,\partial E/\partial t = I/\pi R^2$: the displacement current through the whole gap equals $I$, the current in the wire. It continues the circuit where the charges stop.` },
      { label: 'Inside the rim', text: t`A loop of radius $s < R$ encloses displacement current $I s^2/R^2$, so $B\cdot2\pi s = \mu_0Is^2/R^2$ and $B = \dfrac{\mu_0Is}{2\pi R^2} \approx ${nice(sf(EX.B1 * 1e6, 3))}$ μT at ${EX.s1 * 100} cm.` },
      { label: 'Beyond the rim', text: t`At $s > R$ the loop encloses all of it: $B = \dfrac{\mu_0I}{2\pi s} \approx ${nice(sf(EX.B2 * 1e6, 3))}$ μT at ${EX.s2 * 100} cm — the same as ${EX.s2 * 100} cm from the wire. From far away, the gap is invisible to $\vec B$.` },
      { label: 'Sense check', text: t`A microtesla is a few percent of Earth’s field: real, but small enough that the first direct measurement waited until 1929 (Van Cauwenberghe). The term’s first triumph was indirect: Hertz’s radio waves, 1887–88.` },
    ],
    answer: t`$\partial E/\partial t \approx ${tex(EX.dEdt, 3)}$ V/(m s); $B \approx ${nice(sf(EX.B1 * 1e6, 3))}$ μT at ${EX.s1 * 100} cm and $${nice(sf(EX.B2 * 1e6, 3))}$ μT at ${EX.s2 * 100} cm.`,
  },
  practice: [
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put Maxwell’s argument in order.`,
      visual: gap({ at: 'wire', surface: 'bag', r: 3 }, t`The charging capacitor, with a bag surface through the gap. Fringing ignored.`),
      items: [
        t`Take the divergence of Ampère’s law: $\nabla\cdot(\nabla\times\vec B) = \mu_0\nabla\cdot\vec J$.`,
        t`The left side is always zero, so the law requires $\nabla\cdot\vec J = 0$.`,
        t`But charge conservation says $\nabla\cdot\vec J = -\partial\rho/\partial t$, non-zero at a charging plate.`,
        t`Gauss’s law gives $\partial\rho/\partial t = \varepsilon_0\nabla\cdot(\partial\vec E/\partial t)$.`,
        t`So $\nabla\cdot(\vec J + \varepsilon_0\partial\vec E/\partial t) = 0$: add $\varepsilon_0\partial\vec E/\partial t$ to the current.`,
      ],
      hints: ['Start from the law that fails, and find what it demands.', t`The fix must have divergence $\partial\rho/\partial t$; Gauss’s law supplies one.`],
      teach: 'Maxwell’s term is forced by charge conservation: it is the unique addition (up to a divergence-free piece) that makes Ampère’s law consistent.',
      explain: t`Ampère’s law forced $\nabla\cdot\vec J = 0$; continuity says otherwise wherever charge builds up. Gauss’s law converts $\partial\rho/\partial t$ into the divergence of $\varepsilon_0\partial\vec E/\partial t$, and adding that term makes the source of $\nabla\times\vec B$ divergence-free in every case.`,
    }),
    num({
      id: 'b-gap', difficulty: 2,
      gen(r) {
        const R = r.pick([3, 5, 8]), I = r.pick([0.5, 1, 2, 4]), inside = r.bool(0.5);
        const s = inside ? R * r.pick([0.25, 0.5, 0.75]) : R * r.pick([1.5, 2]);
        const B = inside ? (MU0 * I * s / 100) / (2 * PI * (R / 100) ** 2) : (MU0 * I) / (2 * PI * s / 100);
        return {
          prompt: t`Circular plates of radius ${R} cm are charged by a steady ${I} A. What is the magnetic field in the gap between them, ${nice(sf(s, 3))} cm from the axis? Ignore fringing.`,
          visual: gap({ I, R, at: 'gap', r: Math.min(s, 9), surface: 'flat' }, t`The capacitor side-on with a loop of radius $s$ between the plates. Fringing ignored; not to scale.`),
          answer: B * 1e6, units: 'μT', tol: { rel: 0.01 },
          errors: inside
            ? [{ value: (MU0 * I) / (2 * PI * s / 100) * 1e6, feedback: t`A loop inside the plates’ radius encloses only the fraction $s^2/R^2$ of the displacement current.` }, { value: 0, feedback: t`No charge crosses the gap, but the changing $\vec E$ there is a displacement current, and it makes $\vec B$.` }]
            : [{ value: (MU0 * I * s / 100) / (2 * PI * (R / 100) ** 2) * 1e6, feedback: t`Beyond the plates’ edge there is no changing field: the loop encloses all of the displacement current, $I$, and no more.` }],
          hints: [t`$\oint\vec B\cdot d\vec l = \mu_0I_{d,\text{enc}}$, with $J_d = I/\pi R^2$ spread evenly over the plates’ area.`, inside ? t`Inside the rim $I_{d,\text{enc}} = I s^2/R^2$, so $B = \mu_0Is/2\pi R^2$.` : t`Outside the rim $I_{d,\text{enc}} = I$, so $B = \mu_0I/2\pi s$.`],
          teach: 'Between charging plates B grows linearly with s out to the rim, then falls as 1/s — exactly like the field inside and outside a wire.',
          explain: inside
            ? t`$B = \dfrac{\mu_0Is}{2\pi R^2} \approx ${nice(sf(B * 1e6, 3))}$ μT: the field of a fat “wire” of displacement current, uniform across the plates.`
            : t`$B = \dfrac{\mu_0I}{2\pi s} \approx ${nice(sf(B * 1e6, 3))}$ μT, the same as the same distance from the wire: the loop encloses the whole displacement current.`,
        };
      },
    }),
    num({
      id: 'id-dvdt', difficulty: 1,
      gen(r) {
        const A = r.pick([50, 100, 200]), d = r.pick([0.5, 1, 2]), dV = r.pick([1e5, 1e6, 5e6]);
        const C = (EPS0 * A * 1e-4) / (d * 1e-3), Id = C * dV;
        return {
          prompt: t`The voltage across a parallel-plate capacitor (plates ${A} cm², ${d} mm apart, air between) is rising at $${tex(dV, 1)}$ V/s. What displacement current flows between the plates?`,
          visual: gap({ at: 'gap', r: 3 }, t`A charging capacitor; the displacement current fills the gap. Fringing ignored; not to scale.`),
          answer: Id * 1e3, units: 'mA', tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * dV / (d * 1e-3)) * 1e3, feedback: t`$\varepsilon_0\,\partial E/\partial t$ is a current **density**: multiply by the plates’ area.` }],
          hints: [t`$E = V/d$, so $J_d = \varepsilon_0\dfrac{dV/dt}{d}$.`, t`$I_d = J_dA = \dfrac{\varepsilon_0A}{d}\dfrac{dV}{dt} = C\dfrac{dV}{dt}$.`],
          teach: 'The displacement current through a capacitor is C dV/dt — exactly the current in its leads.',
          explain: t`$C = \varepsilon_0A/d \approx ${nice(sf(C * 1e12, 3))}$ pF, and $I_d = C\,dV/dt \approx ${nice(sf(Id * 1e3, 3))}$ mA — the conduction current in the wires, continued across the gap by the changing field.`,
        };
      },
    }),
    num({
      id: 'copper-ratio', difficulty: 2,
      gen(r) {
        const f = r.pick([60, 1e6, 1e9, 1e10]);
        const ratio = (EPS0 * 2 * PI * f) / SIG_CU;
        const fs = f >= 1e9 ? `${f / 1e9} GHz` : f >= 1e6 ? `${f / 1e6} MHz` : `${f} Hz`;
        return {
          prompt: t`In a copper wire carrying a sinusoidal current at ${fs}, $\vec J = \sigma\vec E$. How big is the displacement current density $\varepsilon_0\,\partial E/\partial t$ compared with the conduction current density? Give the ratio of their amplitudes. ($\sigma = ${tex(SIG_CU, 3)}$ S/m.)`,
          visual: gap({ at: 'wire', surface: 'flat', r: 2 }, t`A wire carrying current: inside the metal, conduction current dominates. Fringing ignored; not to scale.`),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: (EPS0 * f) / SIG_CU, feedback: t`Use $\omega = 2\pi f$: the rate of change of $E_0\sin\omega t$ peaks at $\omega E_0$.` }],
          hints: [t`With $E = E_0\sin\omega t$, $|J_d| = \varepsilon_0\omega E_0$ and $|J| = \sigma E_0$.`, t`The ratio is $\varepsilon_0\omega/\sigma$.`],
          teach: 'In a metal, displacement current is negligible at any frequency where Ohm’s law with its DC conductivity holds.',
          explain: t`$\dfrac{\varepsilon_0\omega}{\sigma} \approx ${tex(ratio, 2)}$. In wires Maxwell’s term is irrelevant; it matters where there is no conductor to carry current — in a capacitor’s gap, in an insulator, in empty space.`,
        };
      },
    }),
    mcq({
      id: 'leaky', difficulty: 3,
      prompt: t`A charged parallel-plate capacitor, disconnected from everything, is filled with a slightly conducting dielectric, so it slowly discharges through it. What magnetic field is there between the plates?`,
      visual: leakyPic(t`The capacitor discharging through its own dielectric: the leakage current (orange) flows from $+$ to $-$, while the field falls, so the displacement current (violet) points the other way. Not to scale.`),
      choices: [
        t`None: the leakage current and the displacement current cancel at every point`,
        t`A field circling the leakage current, as round a wire`,
        t`A field circling the displacement current only`,
        t`A field that grows as the capacitor discharges`,
      ],
      answer: 0,
      why: {
        1: t`The leakage current is there, but so is the displacement current of the falling field, equal and opposite: the total source of $\nabla\times\vec B$ is zero.`,
        2: t`The conduction current is just as real as the displacement current: both count, and they cancel.`,
        3: t`Nothing in the gap is a source of $\vec B$: the total current density there is zero throughout.`,
      },
      hints: [t`The charge on the plates falls at the rate of the leakage current: $dQ/dt = -I$. What does that do to $\partial E/\partial t$?`, t`In the dielectric $J = \sigma E$ toward the negative plate, while $\varepsilon\,\partial E/\partial t$ points back toward the positive one. Compare their sizes.`],
      teach: 'Maxwell’s correction is what makes a discharging leaky capacitor produce no magnetic field: total current, conduction plus displacement, is what makes B.',
      explain: t`The leakage current carries charge off the plates, so $E$ falls: $\varepsilon\,\partial E/\partial t = -\sigma E$. The total $\vec J + \partial\vec D/\partial t$ vanishes at every point, and so, by symmetry, does $\vec B$. Without Maxwell’s term, Ampère’s law would predict a field circling the leakage current — the classic test of the correction’s logic.`,
    }),
    mcq({
      id: 'not-charge', difficulty: 2,
      prompt: t`Which statement about the displacement current between the plates of a charging capacitor is right?`,
      visual: gap({ at: 'gap', r: 3 }, t`The gap of a charging capacitor: no charge crosses it, yet $\vec B$ circles it. Fringing ignored.`),
      choices: [
        t`It is a changing electric field, not moving charge; it makes $\vec B$ just as a conduction current would`,
        'It is a small current of electrons jumping the gap',
        'It is a bookkeeping device: it makes the equations consistent but produces no field',
        'It flows only if there is a dielectric between the plates',
      ],
      answer: 0,
      why: {
        1: 'In a vacuum gap no charge crosses at all; that is why the plates charge up.',
        2: t`It produces a real magnetic field, measured directly between capacitor plates, and it is what lets light travel through empty space.`,
        3: t`In vacuum it is $\varepsilon_0\partial\vec E/\partial t$; a dielectric adds a polarization current $\partial\vec P/\partial t$ (next lesson), but the vacuum term needs no matter.`,
      },
      hints: ['Does any charge cross a vacuum gap?', t`Write it out: $\vec J_d = \varepsilon_0\partial\vec E/\partial t$. Which quantity is changing?`],
      teach: 'Displacement current is a changing E field: it carries no charge, but it is a source of B like any current.',
      explain: t`$\vec J_d = \varepsilon_0\partial\vec E/\partial t$ involves no charge at all. Maxwell named it from his model of the vacuum as an elastic medium whose charges are displaced; that model is gone, and only the term remains — a changing electric field sourcing a magnetic one.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sea', difficulty: 3, transfer: true,
      gen(r) {
        const sigma = r.pick([3, 4, 4.8, 5.5]), er = r.pick([70, 80]);
        const f = sigma / (2 * PI * er * EPS0);
        return {
          prompt: t`A deep-ocean lander must send data through seawater (conductivity ${sigma} S/m, relative permittivity about ${er}, so the displacement current density is $${er}\varepsilon_0\,\partial E/\partial t$). Above what frequency does the displacement current exceed the conduction current?`,
          visual: gap({ at: 'wire', surface: 'bag', r: 3 }, t`Conduction current in the wire, displacement current in the gap: in seawater both flow at once. Schematic.`),
          answer: f / 1e9, units: 'GHz', tol: { rel: 0.01 },
          errors: [
            { value: sigma / (2 * PI * EPS0) / 1e9, feedback: t`In water the displacement current is $\varepsilon\,\partial E/\partial t$ with $\varepsilon = ${er}\varepsilon_0$.` },
            { value: sigma / (er * EPS0) / 1e9, feedback: t`That is the angular frequency $\omega = \sigma/\varepsilon$; divide by $2\pi$ for $f$.` },
          ],
          hints: [t`For $E = E_0\sin\omega t$ the amplitudes are $\sigma E_0$ and $\varepsilon\omega E_0$.`, t`They are equal at $\omega = \sigma/\varepsilon$, i.e. $f = \sigma/2\pi\varepsilon$.`],
          teach: 'A material behaves as a conductor below f = σ/2πε and as a dielectric above it.',
          explain: t`$f = \dfrac{\sigma}{2\pi\varepsilon} \approx ${nice(sf(f / 1e9, 3))}$ GHz. Below it, seawater acts as a conductor and radio waves die within metres or less, which is why submarines use very low frequencies and long antennas, and why ocean landers use sound. (Water’s permittivity itself falls at gigahertz frequencies, so the crossover is only approximate.)`,
        };
      },
    }),
    num({
      id: 'cp-ac-rim', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 5, 10]), d = r.pick([0.5, 1]), V0 = r.pick([10, 100, 1000]), f = r.pick([1e3, 1e5, 1e6]);
        const C = (EPS0 * PI * (R / 100) ** 2) / (d * 1e-3), I0 = 2 * PI * f * C * V0, B = (MU0 * I0) / (2 * PI * R / 100);
        return {
          prompt: t`An AC voltage of amplitude ${V0} V at ${f >= 1e6 ? `${f / 1e6} MHz` : `${f / 1e3} kHz`} is applied across circular plates of radius ${R} cm, ${d} mm apart in air. What is the amplitude of the magnetic field at the rim of the plates, midway between them?`,
          visual: gap({ at: 'gap', r: R >= 9 ? 9 : R, R: Math.min(R, 8), surface: 'flat' }, t`The capacitor side-on, with a loop at the plates’ rim. Fringing ignored; not to scale.`),
          answer: B * 1e9, units: 'nT', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * I0) / (2 * PI * R / 100) * 1e9 / (2 * PI), feedback: t`$\omega = 2\pi f$: the displacement current amplitude is $\omega CV_0$.` }],
          hints: [t`The displacement current amplitude is $I_0 = \omega CV_0$ with $C = \varepsilon_0\pi R^2/d$.`, t`At the rim the loop encloses all of it: $B_0 = \mu_0I_0/2\pi R$.`],
          teach: 'An AC capacitor carries a displacement current ωCV₀ across its gap, with the magnetic field of a wire carrying that current.',
          explain: t`$C \approx ${nice(sf(C * 1e12, 3))}$ pF, $I_0 = \omega CV_0 \approx ${tex(I0, 3)}$ A, and $B_0 = \mu_0I_0/2\pi R \approx ${nice(sf(B * 1e9, 3))}$ nT. Such fields are tiny next to Earth’s 50 μT, which is why Maxwell’s term was confirmed through waves before it was measured in a gap.`,
        };
      },
    }),
    mcq({
      id: 'cp-hertz', difficulty: 2,
      prompt: t`Which observation first confirmed that Maxwell’s displacement current is real?`,
      visual: { type: 'em-wave', params: { controls: false, readout: false, phase: 40 }, caption: t`An electromagnetic wave: a changing $\vec E$ makes $\vec B$ and a changing $\vec B$ makes $\vec E$, each sustaining the other. Not to scale.` },
      choices: [
        'Hertz’s generation and detection of electromagnetic waves (1887–88), travelling at the speed Maxwell predicted',
        'Oersted’s compass needle deflected by a current (1820)',
        'Faraday’s induction experiments (1831)',
        'The Michelson–Morley experiment (1887)',
      ],
      answer: 0,
      why: {
        1: t`Oersted found the magnetic field of a **conduction** current, which Ampère’s original law already described.`,
        2: t`Faraday found $\nabla\times\vec E = -\partial\vec B/\partial t$ — the other half of the symmetry.`,
        3: 'Michelson and Morley tested the motion of the Earth through a supposed ether; they found nothing, which later pointed to relativity.',
      },
      hints: ['Without the displacement current, could a changing field sustain itself in empty space?', 'The prediction was waves travelling at 1/√(μ₀ε₀).'],
      teach: 'The displacement current’s great prediction was electromagnetic waves at c: Hertz found them.',
      explain: t`With Maxwell’s term, the two curl equations feed each other and give waves at $1/\sqrt{\mu_0\varepsilon_0} = c$. Hertz made and detected such waves with a spark gap and a loop receiver, measured their wavelength and speed, and showed they reflect and refract like light. The magnetic field inside a capacitor’s gap was measured directly only decades later.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §7.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
  ],
});
