// Density and pressure: mass per volume, and force per area — a scalar that
// pushes perpendicular to every surface it touches.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, P_ATM, PSI, RHO, s3, tn, tank, seg, box, label, massVolume } from './_fluids.js';
import { dualScale } from './_measure.js';

const t = String.raw;
const D2R = Math.PI / 180;

// a flat plate (thick segment) with arrows, on equal axes, for "which way does pressure push?"
const r3 = (v) => +(+v).toFixed(3);

export default lesson({
  id: 'phys2210.M14.1',
  title: 'Density and pressure',
  minutes: 9, difficulty: 1,
  intro: t`A **fluid** — a liquid or a gas — is matter that flows: at rest it cannot push sideways along a surface, only straight against it. Two quantities describe it at every point: how much mass is packed into each cubic metre, and how hard it pushes on each square metre.

$$\rho = \frac{m}{V}, \qquad p = \frac{F_\perp}{A}$$

**Pressure is a scalar**: at a point in a fluid at rest it pushes equally in every direction, and on any surface it pushes perpendicular to that surface. Its unit, the pascal, is small — the air around you presses with about $101\ \text{kPa}$, roughly the weight of 10 tonnes on every square metre.`,
  symbols: [
    { tex: '\\rho', text: 'density (Greek *rho*): mass per unit volume, in kg/m³. Water 1000, liquid oxygen 1141, RP-1 kerosene about 810, sea-level air 1.225' },
    { tex: 'm', text: 'mass, in kg' },
    { tex: 'V', text: 'volume, in m³. One litre is $10^{-3}\\ \\text{m}^3$; one cm³ is $10^{-6}\\ \\text{m}^3$' },
    { tex: 'p', text: 'pressure, in pascals: $1\\ \\text{Pa} = 1\\ \\text{N/m}^2$. One atmosphere is $101\\,325\\ \\text{Pa} \\approx 101\\ \\text{kPa} \\approx 14.7\\ \\text{psi} \\approx 1.013\\ \\text{bar}$' },
    { tex: 'F_\\perp', text: 'the part of a force that is perpendicular to the surface, in N — a fluid at rest exerts no other kind' },
    { tex: 'A', text: 'the area the force is spread over, in m²' },
  ],
  why: 'Pressure, not force, is what a fluid applies to everything it touches — tank walls, pistons, hatches, eardrums — and the load on any wall is pressure times area.',
  visual: {
    title: 'Pressure pushes on every face',
    lead: t`A pressure sensor — a thin membrane, seen edge-on — sits in a tank of liquid 10 m deep. The red arrows are the liquid’s push on each face of the membrane. Turn it, move it deeper, change the liquid.`,
    tasks: ['Turn the sensor through 180°: the arrows stay perpendicular to the membrane and the reading never changes.', 'Lower it from 0 to 10 m: the pressure roughly doubles, from one atmosphere to two.', 'Switch to mercury: every metre now adds 13.6 times as much pressure as water.'],
    ...tank({
      scene: 'vessels', shapes: ['wide'], H: 10, depth: 5, sensor: true, tilt: 30,
      fluids: ['water', 'seawater', 'mercury', 'lox', 'rp1'], sliders: ['depth', 'tilt', 'fluid'],
    }, 'A sensor membrane, seen edge-on, in a tank 10 m deep. The red arrows are the liquid’s push on each face: always perpendicular to the face, and the same size whichever way it is turned. Depths to scale; the tank’s width is not. $g = 9.8\\ \\text{m/s}^2$.'),
  },
  example: {
    prompt: t`A cylindrical propellant tank $2.0\ \text{m}$ across holds $12\,000\ \text{kg}$ of liquid oxygen ($\rho = 1141\ \text{kg/m}^3$). (a) What volume does the oxygen fill? (b) The gas above the liquid is kept $250\ \text{kPa}$ above the outside air’s pressure. What net outward force does that pressure difference put on the tank’s flat circular end?`,
    visual: tank({ scene: 'vessels', closed: true, fluid: 'lox', H: 4, depth: null, p0: P_ATM + 250e3, gauge: true, graph: false },
      'The tank cut open: liquid oxygen below, pressurising gas (the ullage) above. The label gives the gas pressure above the outside air’s. Not to scale.'),
    steps: [
      { label: 'Volume', text: t`Density is mass per volume, so $V = \dfrac{m}{\rho} = \dfrac{12\,000\ \text{kg}}{1141\ \text{kg/m}^3} = 10.5\ \text{m}^3$.` },
      { label: 'Area of the end', text: t`A circle $2.0$ m across has radius $1.0$ m: $A = \pi r^2 = \pi(1.0\ \text{m})^2 = 3.14\ \text{m}^2$.` },
      { label: 'Why the difference', text: t`Inside, the gas pushes outward on the end; outside, the air pushes inward. Only the difference, $\Delta p = 250\ \text{kPa} = 2.50\times10^{5}\ \text{Pa}$, is left over.` },
      { label: 'Force', text: t`$F = \Delta p\,A = (2.50\times10^{5}\ \text{N/m}^2)(3.14\ \text{m}^2) = 7.85\times10^{5}\ \text{N}$, perpendicular to the end, outward.` },
      { label: 'Sense check', text: t`That is the weight of about 80 tonnes ($7.85\times10^5/9.8$) — from a pressure only $2.5$ times the atmosphere’s. Modest pressures over large areas make enormous forces, which is why tank ends are strong, curved domes. (A dome feels the same net push: pressure times its flat, projected area.)` },
    ],
    answer: t`$V = 10.5\ \text{m}^3$; $F = 7.9\times10^{5}\ \text{N}$, outward.`,
  },
  practice: [
    num({
      id: 'density', difficulty: 1,
      gen(r) {
        const [name, rho] = r.pick([['RP-1 kerosene', RHO.rp1], ['liquid oxygen', RHO.lox], ['seawater', RHO.seawater], ['ethanol', RHO.ethanol], ['glycerine', 1260]]);
        const VL = r.pick([2.5, 4.0, 5.0, 8.0, 12.0, 20.0]);
        const m = +((rho * VL) / 1000).toPrecision(3), ans = m / (VL / 1000);
        return {
          prompt: t`A ${VL.toFixed(1)} L sample of ${name} has a mass of ${m} kg. What is its density, in kg/m³?`,
          answer: ans, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [
            { value: m / VL, feedback: 'You divided by the volume in litres, which gives kg per litre. Convert first: 1 L = 10⁻³ m³.' },
            { value: VL / 1000 / m, feedback: 'That is volume per kilogram — the ratio upside down. Density is mass divided by volume.' },
          ],
          hints: [t`$\rho = m/V$, with $V$ in cubic metres.`, t`$${VL.toFixed(1)}\ \text{L} = ${tn(VL / 1000)}\ \text{m}^3$.`],
          teach: 'Density is mass per unit volume, ρ = m/V, in kg/m³; convert litres to cubic metres first.',
          explain: t`$\rho = \dfrac{${m}\ \text{kg}}{${tn(VL / 1000)}\ \text{m}^3} = ${tn(ans)}\ \text{kg/m}^3$ — ${ans > 1000 ? 'denser' : 'less dense'} than water.`,
          visual: massVolume({
            lines: [{ rho: 1000, label: 'water', dash: true, color: 'ink3' }], points: [{ V: VL, m, label: 'sample' }],
            V: r3(VL * 1.35), m: r3(Math.max(m, VL) * 1.4),
            caption: 'The sample (gold) against the line for water (dashed). A point above the water line is denser than water; the slope from the origin to the point is the density.',
          }),
        };
      },
    }),
    mcq({
      id: 'which-lox', difficulty: 1,
      ...(() => {
        const names = ['Q', 'R', 'P'];   // the lines of RP-1, water and liquid oxygen
        return {
          prompt: t`The graph shows mass against volume for samples of RP-1 kerosene ($810\ \text{kg/m}^3$), water ($1000\ \text{kg/m}^3$) and liquid oxygen ($1141\ \text{kg/m}^3$). Which line is liquid oxygen?`,
          choices: [`Line ${names[2]}`, `Line ${names[0]}`, `Line ${names[1]}`, 'None of them: a density line depends on how much of the liquid you have'],
          answer: 0,
          why: {
            1: t`That is the shallowest line: the least mass in each litre — the least dense liquid, RP-1.`,
            2: 'That is the middle line, water. Liquid oxygen is about 14% denser than water, so its line is steeper still.',
            3: 'Density is a property of the substance, not of the sample: a bigger sample has more mass and more volume in the same ratio — the slope of its line.',
          },
          hints: ['Density is mass ÷ volume: the slope of each line.', 'The densest liquid puts the most kilograms into each litre.'],
          teach: 'On a mass–volume graph each substance is a line through the origin whose slope is its density.',
          explain: t`The steepest line, ${names[2]}, gains the most mass per litre: $1.141$ kg in every litre of liquid oxygen, against $1.000$ kg of water and $0.81$ kg of RP-1.`,
          visual: massVolume({
            lines: [{ rho: RHO.rp1, label: names[0] }, { rho: 1000, label: names[1] }, { rho: RHO.lox, label: names[2] }].map((l) => ({ ...l, color: 'accent' })),
            V: 20, m: 26, labelAt: 0.95,
            caption: 'Mass against volume for three liquids. Each line passes through the origin.',
          }),
        };
      })(),
    }),
    num({
      id: 'psi-kpa', difficulty: 1,
      gen(r) {
        const psi = r.pick([35, 45, 50, 60, 75, 90]);
        const kpa = (psi * PSI) / 1000;
        return {
          prompt: t`A propellant tank’s pressure gauge reads ${psi} psi (pounds-force per square inch). What is that in kPa? ($1\ \text{psi} = 6.895\ \text{kPa}$.)`,
          answer: kpa, units: 'kPa', tol: { rel: 0.005 },
          errors: [{ value: psi / 6.895, feedback: 'You divided. A psi is bigger than a kPa (one psi is 6.895 kPa), so the number of kPa must be bigger than the number of psi.' }],
          hints: ['Each psi is 6.895 kPa, so multiply.'],
          teach: 'One psi is 6.895 kPa, and one atmosphere is 14.7 psi or 101.3 kPa.',
          explain: t`$${psi}\ \text{psi}\times 6.895\ \tfrac{\text{kPa}}{\text{psi}} = ${tn(kpa)}\ \text{kPa}$ — about ${s3(kpa / 101.325)} atmospheres.`,
          visual: dualScale({ value: psi, perA: PSI / 1000, unitA: 'psi', unitB: 'kPa', stepA: 10, maxA: 100, ticksB: 5, caption: 'The same pressures on two scales: psi above, kPa below. Use it to check the direction of the conversion, then compute.' }),
        };
      },
    }),
    num({
      id: 'tyres', difficulty: 2,
      gen(r) {
        const M = r.pick([1100, 1300, 1500, 1800]), a = r.pick([150, 180, 200, 220]);
        const p = (M * G) / (4 * a * 1e-4);
        return {
          prompt: t`A ${M} kg car rests on four tyres, and each tyre touches the road over about ${a} cm². What average pressure do the tyres exert on the road? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: p / 1000, units: 'kPa', tol: { rel: 0.01 },
          errors: [
            { value: (M * G) / (a * 1e-4) / 1000, feedback: 'The weight is shared by four contact patches: the total area is four times one patch.' },
            { value: M / (4 * a * 1e-4) / 1000, feedback: t`Pressure needs a force: use the weight $mg$, not the mass.` },
          ],
          hints: [t`The force is the car’s weight, $mg$; the area is all four patches together.`, t`$1\ \text{cm}^2 = 10^{-4}\ \text{m}^2$, so the total area is $4\times${a}\times10^{-4}\ \text{m}^2$.`],
          teach: 'Average pressure is the total perpendicular force divided by the total area it acts on.',
          explain: t`$p = \dfrac{mg}{4a} = \dfrac{${M}\times9.8\ \text{N}}{4\times${tn(a * 1e-4)}\ \text{m}^2} = ${tn(p / 1000)}\ \text{kPa}$. That is close to a car tyre’s gauge pressure (about 200–250 kPa) — no coincidence: the air in the tyre holds the car up, so each patch flattens until its area times the air’s gauge pressure roughly matches its share of the weight.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-3.2, 3.2], y: [-2.1, 2.1], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [[-1.1, 1.3], [1.1, 1.3], [-1.1, -1.3], [1.1, -1.3]].map(([x, y]) => box(x - 0.3, x + 0.3, y - 0.4, y + 0.4, 'ink3', 0.7)),
              curves: [seg([-1.6, -1.95], [1.6, -1.95], { color: 'ink4', dash: true }), seg([1.6, -1.95], [1.6, 1.95], { color: 'ink4', dash: true }), seg([1.6, 1.95], [-1.6, 1.95], { color: 'ink4', dash: true }), seg([-1.6, 1.95], [-1.6, -1.95], { color: 'ink4', dash: true })],
              points: [label(-0.92, 0, `weight ${M} kg × g`, 'warn', 0, 0), ...[[-1.1, 1.3], [1.1, 1.3], [-1.1, -1.3], [1.1, -1.3]].map(([x, y]) => label(x - 0.36, y > 0 ? y - 0.62 : y + 0.58, `${a} cm²`, 'ink2', 0, 0))],
            },
            caption: 'Seen from below: the four contact patches (grey, enlarged) carry the car’s weight between them. Not to scale.',
          },
        };
      },
    }),
    num({
      id: 'slanted-push', difficulty: 2,
      gen(r) {
        const F = r.pick([200, 300, 400, 500]), th = r.pick([30, 35, 40, 55, 60]), A = r.pick([0.25, 0.4, 0.5]);
        const p = (F * Math.sin(th * D2R)) / A;
        const L = 1.6, s = Math.sin(th * D2R), c = Math.cos(th * D2R);
        return {
          prompt: t`An astronaut pushes on a hatch of area ${A} m² with a force of ${F} N directed at ${th}° to the hatch’s surface. What average pressure does the push put on the hatch?`,
          answer: p, units: 'Pa', tol: { rel: 0.01 },
          errors: [
            { value: F / A, feedback: 'Only the part of the force perpendicular to the surface presses on it. Find that component first.' },
            { value: (F * Math.cos(th * D2R)) / A, feedback: t`That is the component *along* the surface. The angle is measured from the surface, so the perpendicular part is $F\sin\theta$.` },
          ],
          hints: [t`Pressure uses $F_\perp$, the component perpendicular to the surface.`, t`With the angle measured from the surface, $F_\perp = F\sin${th}^\circ$.`],
          teach: 'Pressure counts only the force perpendicular to the surface: p = F⊥/A.',
          explain: t`$F_\perp = ${F}\sin${th}^\circ = ${tn(F * s)}\ \text{N}$, so $p = ${tn(F * s)}/${A} = ${tn(p)}\ \text{Pa}$. The part of the push along the hatch only tends to slide the hand.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-2.4, 2.4], y: [-0.5, 2.0], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(-1.4, 1.4, -0.22, 0, 'ink3', 0.5)],
              curves: [seg([0, 0], [0, L * s], { color: 'good', dash: true }), { param: [`0.45*cos(pi - t)`, `0.45*sin(pi - t)`], t: [0, r3(th * D2R)], color: 'gold', width: 1.8 }],
              arrows: [{ from: [r3(-L * c), r3(L * s)], to: [0, 0], color: 'accent' }],
              points: [label(-L * c - 0.2, L * s + 0.16, `F = ${F} N`, 'accent'), label(-0.62, 0.17, `${th}°`, 'gold'), label(0.08, r3(L * s * 0.6), 'F⊥', 'good', 4, 0), label(0.5, -0.4, `hatch, ${A} m²`, 'ink2')],
            },
            caption: 'The push and its perpendicular part (dashed). Drawn to proportion.',
          },
        };
      },
    }),
    mcq({
      id: 'plate-force', difficulty: 2,
      prompt: t`A thin flat plate of area $A$ is held at $30^\circ$ to the horizontal, deep in a lake where the pressure is $p$. Which describes the force of the water on the plate’s **upper** face?`,
      choices: [
        t`Size $pA$, perpendicular to the face (arrow 1)`,
        t`Size $pA$, straight down (arrow 2)`,
        t`Size $pA\cos 30^\circ$, straight down (arrow 2)`,
        t`Size $pA\sin 30^\circ$, along the face (arrow 3)`,
      ],
      answer: 0,
      why: {
        1: 'Pressure is not weight. At a point it pushes equally in every direction, and on a surface it pushes perpendicular to that surface — whatever way the surface faces.',
        2: t`Pressure is not a vector to take components of. The force on the face is the whole $pA$, and it is perpendicular to the face.`,
        3: 'A fluid at rest cannot push along a surface — that would be a sideways (shear) force, and a still fluid exerts none.',
      },
      hints: ['Which way can a fluid at rest push on a surface?', 'It pushes straight against the surface, never along it.'],
      teach: 'A fluid at rest pushes perpendicular to every surface, with force pA, whatever the surface’s tilt.',
      explain: t`The force is $pA$ along the inward normal of the face — arrow 1. The lower face feels (almost) the same push the other way, which is why a plate in still water is not crushed.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-2.6, 2.6], y: [-1.5, 1.5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [box(-8, 8, -4, 4, 'accent', 0.12)],
          curves: [{ param: [`t*${r3(Math.cos(30 * D2R))}`, `t*0.5`], t: [-1.2, 1.2], color: 'ink', width: 5 }],
          // along the plate u = (cos 30°, sin 30°); its upper face's normal n = (−sin 30°, cos 30°)
          arrows: [
            { from: [r3(0.6 * 0.866 - 1.0 * 0.5), r3(0.6 * 0.5 + 1.0 * 0.866)], to: [r3(0.6 * 0.866 - 0.07 * 0.5), r3(0.6 * 0.5 + 0.07 * 0.866)], color: 'good' },
            { from: [r3(-0.8 * 0.866), 0.62], to: [r3(-0.8 * 0.866), -0.32], color: 'warn' },
            { from: [r3(-0.3 * 0.866 - 0.14 * 0.5), r3(-0.3 * 0.5 + 0.14 * 0.866)], to: [r3(0.25 * 0.866 - 0.14 * 0.5), r3(0.25 * 0.5 + 0.14 * 0.866)], color: 'violet' },
          ],
          points: [label(0.6 * 0.866 - 1.0 * 0.5 + 0.05, 0.6 * 0.5 + 1.0 * 0.866 + 0.1, '1', 'good'), label(-0.8 * 0.866 + 0.06, 0.7, '2', 'warn'), label(0.25 * 0.866 - 0.14 * 0.5 + 0.04, 0.25 * 0.5 + 0.14 * 0.866 + 0.16, '3', 'violet')],
        },
        caption: 'The plate seen edge-on, in still water. Three candidate directions for the water’s push on its upper face.',
      },
    }),
    mcq({
      id: 'g-cc-error', difficulty: 2, kind: 'error',
      prompt: t`A student converts the density of aluminium to SI units:

$$2.70\ \frac{\text{g}}{\text{cm}^3} = \frac{2.70\times10^{-3}\ \text{kg}}{10^{-2}\ \text{m}^3} = 0.270\ \frac{\text{kg}}{\text{m}^3}.$$

Where is the mistake?`,
      choices: [
        t`$1\ \text{cm}^3 = 10^{-6}\ \text{m}^3$, not $10^{-2}$: the density is $2700\ \text{kg/m}^3$`,
        t`$1\ \text{g} = 10^{3}\ \text{kg}$, so the density is $2.70\times10^{5}\ \text{kg/m}^3$`,
        'There is none: SI densities are always smaller numbers than g/cm³ ones',
        t`The cube applies to the mass too: $1\ \text{g} = 10^{-9}\ \text{kg}$`,
      ],
      answer: 0,
      why: {
        1: 'A gram is a thousandth of a kilogram, not a thousand of them.',
        2: 'Sense check: aluminium sinks in water (1000 kg/m³), so 0.27 kg/m³ — less than air — cannot be right. SI densities are 1000 times the g/cm³ value.',
        3: 'Only the length unit is cubed. A gram is 10⁻³ kg whatever it is divided by.',
      },
      hints: ['How many centimetres in a metre? Now cube it.', t`$1\ \text{cm} = 10^{-2}\ \text{m}$, so $1\ \text{cm}^3 = (10^{-2})^3\ \text{m}^3$.`],
      teach: 'A volume unit converts with the cube of the length factor: 1 cm³ = 10⁻⁶ m³, so 1 g/cm³ = 1000 kg/m³.',
      explain: t`$\dfrac{2.70\times10^{-3}\ \text{kg}}{10^{-6}\ \text{m}^3} = 2.70\times10^{3}\ \text{kg/m}^3 = 2700\ \text{kg/m}^3$. Water’s 1 g/cm³ is 1000 kg/m³, and aluminium is 2.7 times denser.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tank-mass', difficulty: 2,
      gen(r) {
        const D = r.pick([1.2, 1.5, 1.8, 2.4]), L = r.pick([2, 3, 4, 5]);
        const V = Math.PI * (D / 2) ** 2 * L, m = RHO.rp1 * V;
        return {
          prompt: t`A cylindrical tank ${D} m in diameter and ${L} m long is full of RP-1 kerosene ($810\ \text{kg/m}^3$). What mass of fuel does it hold, in kg?`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: RHO.rp1 * Math.PI * D * D * L, feedback: 'The radius is half the diameter: A = π(D/2)².' }, { value: V, feedback: 'That is the volume in m³. Multiply by the density to get the mass.' }],
          hints: [t`$m = \rho V$, and a cylinder’s volume is $\pi r^2 L$ with $r = D/2$.`],
          teach: 'Mass is density times volume, m = ρV.',
          explain: t`$V = \pi(${D / 2})^2(${L}) = ${tn(V)}\ \text{m}^3$, so $m = 810\times${tn(V)} = ${tn(m)}\ \text{kg}$ — about ${s3(m / 1000)} tonnes.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.5, L + 0.5], y: [-0.35 * D, 1.4 * D], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, L, 0, D, 'warn', 0.35)],
              curves: [seg([0, 0], [L, 0]), seg([L, 0], [L, D]), seg([L, D], [0, D]), seg([0, D], [0, 0]), { param: [`${0.12 * D}*cos(t)`, `${D / 2} + ${D / 2}*sin(t)`], t: [-1.5708, 1.5708], color: 'ink3', width: 1.4, dash: true }],
              points: [label(L / 2, D * 1.2, `length ${L} m`, 'ink2'), label(L + 0.08, D / 2, `${D} m`, 'ink2', 4, 0)],
            },
            caption: 'The tank seen from the side, to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-sideways', difficulty: 1,
      prompt: t`A pressure sensor $3.0$ m down in a still lake reads $131\ \text{kPa}$ while its membrane faces up. It is turned to face sideways, at the same depth. Now it reads:`,
      choices: [t`$131\ \text{kPa}$`, t`Less than $131\ \text{kPa}$: the water above pushes down, not sideways`, t`More than $131\ \text{kPa}$: now water pushes from the side as well as from above`, t`$0\ \text{kPa}$: still water presses only downward`],
      answer: 0,
      why: {
        1: 'Pressure at a point has no direction: the water pushes on the membrane with the same pressure however it faces.',
        2: 'The membrane only ever feels the push on its own face, perpendicular to it — and that push is the same in every orientation.',
        3: 'Still water presses on surfaces facing every way. A swimmer’s ears feel it on the side of the head.',
      },
      hints: ['Does pressure at a point depend on which way a surface faces?'],
      teach: 'At a point in a fluid at rest, pressure is the same in every direction.',
      explain: t`Pressure is a scalar: at $3.0$ m it is $101.3 + 1000\times9.8\times3.0/1000 \approx 131\ \text{kPa}$, whichever way the membrane faces.`,
      visual: tank({ scene: 'vessels', shapes: ['wide'], H: 5, depth: 3, sensor: true, tilt: 90, values: false, graph: false }, 'The sensor membrane turned to face sideways, 3.0 m down. Not to scale across.'),
    }),
    num({
      id: 'cp-hatch', difficulty: 3, transfer: true,
      gen(r) {
        const [craft, pc, note] = r.pick([
          ['the International Space Station', 101.3, 'sea-level air pressure'],
          ['the Space Shuttle, lowered before a spacewalk,', 70.3, '10.2 psi'],
          ['an Apollo command module in flight', 34.5, '5 psi of pure oxygen'],
        ]);
        const d = r.pick([0.8, 0.9, 1.0]);
        const A = Math.PI * (d / 2) ** 2, F = pc * 1000 * A;
        return {
          prompt: t`The cabin of ${craft} is kept at ${pc} kPa (${note}); outside is vacuum. What net force does the cabin air exert on a circular hatch ${d.toFixed(1)} m in diameter? Give it in kN.`,
          answer: F / 1000, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: (pc * 1000 * Math.PI * d * d) / 1000, feedback: 'The radius is half the diameter: A = π(d/2)².' }],
          hints: [t`$F = \Delta p\,A$, and with vacuum outside $\Delta p$ is the whole cabin pressure.`, t`$A = \pi(${d}/2)^2\ \text{m}^2$; convert kPa to Pa before multiplying.`],
          teach: 'The net force of a pressure difference on a flat surface is Δp times its area.',
          explain: t`$A = \pi(${d / 2})^2 = ${tn(A)}\ \text{m}^2$, so $F = (${tn(pc * 1000)}\ \text{Pa})(${tn(A)}\ \text{m}^2) = ${tn(F / 1000)}\ \text{kN}$ — the weight of about ${s3(F / G / 1000)} tonnes. No astronaut can push that open, which is why a hatch that opens inward is sealed by the cabin’s pressure. Apollo 1’s inward-opening hatch could not be opened against the cabin’s rising pressure during the 1967 fire; later Apollo hatches opened outward.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-2.2, 2.2], y: [-1.1, 1.1], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(-2.2, 0, -1.1, 1.1, 'accent', 0.14)],
              curves: [seg([0, 0.55], [0, 1.1], { color: 'ink2', width: 4 }), seg([0, -0.55], [0, -1.1], { color: 'ink2', width: 4 }), seg([0.04, -0.5], [0.04, 0.5], { color: 'gold', width: 6 })],
              arrows: [-0.4, -0.2, 0, 0.2, 0.4].map((y) => ({ from: [-0.75, y], to: [-0.05, y], color: 'accent' })),
              points: [label(-1.6, 0.85, 'cabin air', 'accent'), label(1.2, 0.85, 'vacuum', 'ink3'), label(0.15, -0.72, `hatch, ${d.toFixed(1)} m across`, 'gold')],
            },
            caption: 'The hatch seen edge-on. The cabin air presses on its whole area; nothing presses back. Arrows show direction only.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §14.1 Fluids, Density, and Pressure', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure' },
    { label: 'NIST Chemistry WebBook: oxygen (saturated liquid density)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
