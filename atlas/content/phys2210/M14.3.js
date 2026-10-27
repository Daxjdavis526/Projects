// Buoyancy and Archimedes' principle: the fluid pushes up with the weight of
// the fluid displaced — whatever the body is made of, and at any depth.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, RHO, s3, tn, tank, seg, box, label } from './_fluids.js';
import { bodyFBD, force } from './_forces.js';

const t = String.raw;

// a block of volume V (m³) hung from a scale with its bottom `below` m under the bottom of its
// own height: fully submerged by that margin
const hung = (rhoObj, V, fluid, extra = {}) => tank({ scene: 'buoy', rhoObj, V, fluid, hold: 'scale', depth: +(Math.cbrt(V) + 0.06).toFixed(3), values: false, ...extra });

export default lesson({
  id: 'phys2210.M14.3',
  title: 'Buoyancy and Archimedes’ principle',
  minutes: 11, difficulty: 2,
  intro: t`Anything in a fluid is pushed up by it. Pressure grows with depth, so the fluid pushes harder on a body’s bottom than on its top, and the difference is an upward **buoyant force** equal to the weight of the fluid the body pushes aside — **Archimedes’ principle**:

$$B = \rho_\text{fluid}\, V_\text{disp}\, g$$

For a block of height $h$ and top area $A$: the bottom is pushed up by $\rho g h$ more than the top is pushed down, so $B = \rho g h A = \rho V g$. The buoyant force does not depend on what the body is made of — only on the volume it occupies in the fluid — and, once it is fully under in a liquid, **not on its depth**. A floating body sinks until it displaces its own weight, so the fraction under the surface is $\rho_\text{body}/\rho_\text{fluid}$.`,
  symbols: [
    { tex: 'B', text: 'the buoyant force, in N, pointing straight up' },
    { tex: '\\rho_\\text{fluid}', text: 'the density of the **fluid**, in kg/m³ — not of the body' },
    { tex: 'V_\\text{disp}', text: 'the volume of fluid displaced, in m³: the part of the body that is under the surface (all of it, if fully submerged)' },
    { tex: 'g', text: 'the gravitational acceleration, 9.8 m/s²' },
    { tex: 'W - B', text: 'the *apparent weight*: what a spring scale reads when the body hangs in the fluid' },
  ],
  why: 'Buoyancy floats ships and balloons, lets astronauts rehearse spacewalks under water, and gives the simplest way to measure a density: weigh the thing in air and again in water.',
  visual: {
    title: 'Weigh a block in water',
    lead: t`A block hangs from a spring scale over a tank. Lower it in and watch the scale’s pull (green) and the buoyant force (blue) — then let it go and see whether it floats.`,
    tasks: ['Lower the aluminium block step by step: the reading falls until the block is fully under, then stays put however deep it goes.', 'Choose “let go” and set the density to 917 (ice): it floats with 92% under the surface.', 'Switch to mercury: even steel (7800 kg/m³) floats.'],
    ...tank({ scene: 'buoy', rhoObj: 2700, V: 0.001, fluid: 'water', hold: 'scale', depth: 0.05, sliders: true },
    'A 1 L block hung from a spring scale over a tank. Weight (white), buoyant force (blue) and the scale’s pull (green) share one scale. The buoyant force is the weight of the liquid displaced. The tank is wide enough that its level does not rise; $g = 9.8\\ \\text{m/s}^2$.'),
  },
  example: {
    prompt: t`A metal part weighs $25.0$ N in air and $21.8$ N when it hangs fully under water from the same scale. What is its density — is it aluminium ($2700$), titanium ($4500$) or steel ($7800\ \text{kg/m}^3$)?`,
    visual: tank({ scene: 'buoy', rhoObj: 7812.5, V: 3.265e-4, fluid: 'water', hold: 'scale', depth: 0.12 }, 'The part fully under water: the scale holds what the water does not. Arrows share one scale.'),
    steps: [
      { label: 'Buoyant force', text: t`The water holds up what the scale no longer has to: $B = 25.0 - 21.8 = 3.2\ \text{N}$.` },
      { label: 'Volume', text: t`$B = \rho_\text{water} V g$, so $V = \dfrac{B}{\rho_\text{water} g} = \dfrac{3.2}{1000\times9.8} = 3.27\times10^{-4}\ \text{m}^3$ (327 cm³).` },
      { label: 'Mass', text: t`$m = W/g = 25.0/9.8 = 2.55\ \text{kg}$.` },
      { label: 'Density', text: t`$\rho = \dfrac{m}{V} = \dfrac{2.55}{3.27\times10^{-4}} = 7.8\times10^{3}\ \text{kg/m}^3$ — steel.` },
      { label: 'Shortcut', text: t`Since $W = \rho V g$ and $B = \rho_\text{water} V g$, the ratio $\dfrac{W}{B} = \dfrac{\rho}{\rho_\text{water}}$: $\dfrac{25.0}{3.2} = 7.8$ times water’s density. Archimedes is said to have checked a crown’s gold this way — gold would give 19.3.` },
    ],
    answer: t`$\rho \approx 7800\ \text{kg/m}^3$: steel.`,
  },
  practice: [
    num({
      id: 'canister', difficulty: 1,
      gen(r) {
        const VL = r.pick([0.5, 1.0, 2.0, 2.5, 4.0]), [fname, rho] = r.pick([['fresh water', 1000], ['seawater', RHO.seawater], ['mercury', RHO.mercury]]);
        const B = rho * (VL / 1000) * G;
        return {
          prompt: t`A sealed ${VL.toFixed(1)} L canister is held completely under ${fname} ($${tn(rho)}\ \text{kg/m}^3$). What buoyant force acts on it? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: B, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: rho * VL * G, feedback: 'Convert the volume to cubic metres first: 1 L = 10⁻³ m³.' }],
          hints: [t`$B = \rho_\text{fluid} V g$ with the whole canister under.`, t`$V = ${VL.toFixed(1)}\ \text{L} = ${tn(VL / 1000)}\ \text{m}^3$.`],
          teach: 'The buoyant force is the weight of the displaced fluid, ρ_fluid V g — what the body is made of does not matter.',
          explain: t`$B = ${tn(rho)}\times${tn(VL / 1000)}\times9.8 = ${tn(B)}\ \text{N}$: exactly the weight of ${VL.toFixed(1)} L of ${fname}.`,
          visual: hung(7800, VL / 1000, fname === 'mercury' ? 'mercury' : fname === 'seawater' ? 'seawater' : 'water', { rhoObj: fname === 'mercury' ? 15000 : 7800 }),
        };
      },
    }),
    mcq({
      id: 'deeper', difficulty: 1,
      prompt: t`A steel block hangs from a spring scale, fully under water $0.10$ m below the surface. It is lowered further, to $0.30$ m below the surface, still clear of the bottom. What happens to the scale reading?`,
      choices: ['It stays the same', 'It decreases: deeper water pushes up harder', 'It increases: more water above pushes the block down', 'It falls to zero once the block is deep enough'],
      answer: 0,
      why: {
        1: 'Both the top and the bottom feel more pressure deeper down — by the same amount — so the difference between them, the buoyant force, does not change.',
        2: 'The extra water above pushes harder on the top, but the bottom is pushed up harder by just as much.',
        3: 'The reading is W − B, and both W and B stay fixed once the block is fully under.',
      },
      hints: ['The buoyant force is the difference between the push on the bottom and on the top.', 'Deeper, both pressures grow by the same ρgΔh.'],
      teach: 'Once a body is fully submerged in a liquid, the buoyant force does not depend on depth.',
      explain: t`$B = \rho_\text{water} V g$ involves the volume, not the depth: going deeper adds $\rho g\,\Delta h$ to the pressure on the top and on the bottom alike. (Liquids are nearly incompressible; even 1000 m of extra depth squeezes water by under 0.5%.)`,
      visual: hung(7800, 0.001, 'water'),
    }),
    num({
      id: 'float-fraction', difficulty: 2,
      gen(r) {
        const [body, rb, fl, rf] = r.pick([['An iceberg', RHO.ice, 'seawater', RHO.seawater], ['An ice cube', RHO.ice, 'fresh water', 1000], ['An oak log', RHO.oak, 'fresh water', 1000], ['A block of polyethylene', 950, 'seawater', RHO.seawater]]);
        const f = (100 * rb) / rf;
        return {
          prompt: t`${body} ($${tn(rb)}\ \text{kg/m}^3$) floats in ${fl} ($${tn(rf)}\ \text{kg/m}^3$). What percentage of its volume is **below** the surface?`,
          answer: f, units: '%', tol: { rel: 0.003 },
          errors: [{ value: 100 - f, feedback: 'That is the part above the surface. The question asks for the part below.' }, { value: (100 * rf) / rb, feedback: 'The ratio is upside down: a floating body has the smaller density on top.' }],
          hints: ['Floating: the buoyant force equals the weight.', t`$\rho_\text{fluid} V_\text{under} g = \rho_\text{body} V g$, so $\dfrac{V_\text{under}}{V} = \dfrac{\rho_\text{body}}{\rho_\text{fluid}}$.`],
          teach: 'A floating body displaces its own weight, so the fraction under is ρ_body/ρ_fluid.',
          explain: t`$\dfrac{V_\text{under}}{V} = \dfrac{${tn(rb)}}{${tn(rf)}} = ${tn(rb / rf)}$, so ${s3(f)}% is under the surface${body === 'An iceberg' ? ' — hence “the tip of the iceberg”' : ''}.`,
          visual: bodyFBD([force('B', 30, 90, 'lift'), force('W', 30, 270, 'weight')], { icon: 'block', name: 'the floating body', caption: 'Floating: the buoyant force B and the weight W are equal and opposite. Arrows to scale.' }),
        };
      },
    }),
    num({
      id: 'apparent', difficulty: 2,
      gen(r) {
        const m = r.pick([2.0, 3.5, 5.0]), [mat, rho] = r.pick([['aluminium', RHO.aluminium], ['steel', RHO.steel], ['copper', 8960]]);
        const W = m * G, T = W * (1 - 1000 / rho);
        return {
          prompt: t`A ${m.toFixed(1)} kg ${mat} part ($${tn(rho)}\ \text{kg/m}^3$) hangs from a spring scale, fully under water. What does the scale read? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: T, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: W, feedback: 'That is its weight in air. Under water the buoyant force holds up part of it.' }, { value: W * (1000 / rho), feedback: 'That is the buoyant force. The scale holds the rest: W − B.' }],
          hints: [t`Find the part’s volume, $V = m/\rho$, then $B = \rho_\text{water} V g$.`, t`Scale reading $= mg - B = mg\left(1 - \dfrac{\rho_\text{water}}{\rho}\right)$.`],
          teach: 'Under water, a scale reads the apparent weight W − B.',
          explain: t`$V = ${m.toFixed(1)}/${tn(rho)} = ${tn(m / rho)}\ \text{m}^3$, so $B = 1000\times${tn(m / rho)}\times9.8 = ${tn(W * (1000 / rho))}$ N and the scale reads $${tn(W)} - ${tn(W * (1000 / rho))} = ${tn(T)}\ \text{N}$.`,
          visual: hung(rho, m / rho, 'water'),
        };
      },
    }),
    num({
      id: 'balloon', difficulty: 2,
      gen(r) {
        const V = r.pick([3.0, 4.5, 6.0, 8.0]);
        const m = (RHO.air - RHO.helium) * V;
        return {
          prompt: t`A weather balloon is filled with ${V.toFixed(1)} m³ of helium ($0.169\ \text{kg/m}^3$) at sea level, where the air is $1.225\ \text{kg/m}^3$. What is the largest total mass — envelope, string and instruments — it can lift?`,
          answer: m, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: RHO.air * V, feedback: 'The helium inside has weight too: the balloon lifts the difference between the air displaced and the helium carried.' }],
          hints: [t`At the limit, $B = $ the weight of the helium plus the weight of everything else.`, t`$\rho_\text{air} V g = \rho_\text{He} V g + m g$, so $m = (\rho_\text{air} - \rho_\text{He})V$.`],
          teach: 'A gas balloon lifts the weight of the air it displaces minus the weight of the gas inside.',
          explain: t`$m = (1.225 - 0.169)\times${V.toFixed(1)} = ${tn(m)}\ \text{kg}$ — about a kilogram per cubic metre. Hydrogen ($0.085\ \text{kg/m}^3$) would lift only 8% more.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-3, 3], y: [-2.2, 2.4], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [{ param: ['cos(t)', '0.9 + 1.05*sin(t)'], t: [0, 6.2832], color: 'violet', width: 2.4 }, seg([0, -0.15], [0, -1.4], { color: 'ink3', width: 1.2 })],
              shade: [box(-0.25, 0.25, -1.75, -1.4, 'warn', 0.8)],
              arrows: [{ from: [1.6, 0.4], to: [1.6, 1.9], color: 'accent' }, { from: [-1.6, 1.3], to: [-1.6, 0.2], color: 'ink2' }, { from: [0.55, -1.6], to: [0.55, -2.1], color: 'ink2' }],
              points: [label(1.75, 1.6, 'B: air displaced', 'accent'), label(-2.9, 1.5, 'weight of helium', 'ink2'), label(0.7, -1.85, 'payload', 'ink2'), label(-0.45, 0.9, 'helium', 'violet')],
            },
            caption: 'The balloon and its load. Arrows show directions only.',
          },
        };
      },
    }),
    mcq({
      id: 'ice-melt', difficulty: 3,
      prompt: t`An ice cube floats in a glass of water filled exactly to the brim. When the ice has melted, the water level:`,
      choices: ['Is still exactly at the brim', 'Has risen, and water spills over the edge', 'Has fallen, because ice is less dense than water', 'Has fallen, because melting releases trapped air'],
      answer: 0,
      why: {
        1: 'The ice sticking up above the surface does not add water: the floating ice already displaced its full weight in water, and that is exactly what it becomes.',
        2: 'The ice is less dense, but it only ever displaced water equal to its weight — and it melts into exactly that much water.',
        3: 'Even with no air at all the level is unchanged; the argument rests only on weights.',
      },
      hints: ['How much water does the floating ice displace?', 'Floating ice displaces its own weight of water. How much water does it turn into?'],
      teach: 'A floating body displaces exactly its own weight of the liquid it floats in.',
      explain: t`Floating, the ice displaces water weighing as much as the ice. Melted, the ice *becomes* water of that same weight — which fills exactly the hole it was displacing. (Sea ice melting barely changes sea level; ice melting off land does raise it.)`,
      visual: tank({ scene: 'buoy', rhoObj: RHO.ice, V: 0.001, fluid: 'water', hold: 'free', values: false }, 'Ice floating in water: about 92% of it under the surface.'),
    }),
    mcq({
      id: 'steel-ship', difficulty: 2,
      prompt: t`Steel is $7.8$ times denser than seawater, yet a steel ship floats. Why?`,
      choices: [
        'Its hull encloses a large volume of air, so the ship’s weight is less than that of the water its hull pushes aside',
        'Surface tension holds the hull up',
        'Buoyancy grows faster than weight for large objects, whatever their shape',
        'The water’s pressure on the flat bottom is greater than on a solid steel block',
      ],
      answer: 0,
      why: {
        1: 'Surface tension can hold up a needle or an insect, never a ship.',
        2: 'Both B and W grow with size. A solid steel block of any size sinks: it is the hollow shape that matters.',
        3: 'The pressure at a given depth is the same for any shape. What differs is the volume the hull displaces for its weight.',
      },
      hints: ['What volume of water does a hollow hull push aside, compared with the same steel as a solid lump?'],
      teach: 'A body floats when its average density — total mass over the volume it can displace — is less than the fluid’s.',
      explain: t`The hull sinks until it displaces its own weight of water. Shaped as a hollow hull, the steel can push aside far more water than its own volume, so it floats with most of the hull above the surface — its average density, steel plus enclosed air, is below seawater’s.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-3.2, 3.2], y: [-1.6, 1.4], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [box(-8, 8, -4, 0, 'teal', 0.25)],
          curves: [seg([-2.2, 0.8], [-1.9, -0.6], { color: 'ink', width: 3.5 }), seg([-1.9, -0.6], [1.9, -0.6], { color: 'ink', width: 3.5 }), seg([1.9, -0.6], [2.2, 0.8], { color: 'ink', width: 3.5 })],
          points: [label(-0.35, 0.25, 'air', 'ink3'), label(2.35, 0.1, 'waterline', 'teal')],
        },
        caption: 'A hull in cross-section: thin steel walls around a large volume of air. Not to scale.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-weigh', difficulty: 2,
      gen(r) {
        const [mat, rho0] = r.pick([['a titanium bracket', 4500], ['an aluminium casting', RHO.aluminium], ['a copper fitting', 8960], ['a gold-coloured statuette of unknown alloy', 15600]]);
        const W = r.pick([12.0, 20.0, 30.0]);
        const Ww = +(W * (1 - 1000 / rho0)).toPrecision(3);
        const rho = (1000 * W) / (W - Ww);
        return {
          prompt: t`${mat[0].toUpperCase() + mat.slice(1)} weighs ${W.toFixed(1)} N in air and ${Ww} N hanging fully under water. What is its density?`,
          answer: rho, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: (1000 * W) / Ww, feedback: 'Divide the weight by the buoyant force — the weight lost in water — not by the reading in water.' }],
          hints: ['The weight lost in water is the buoyant force, ρ_water V g.'],
          teach: 'Weighing in air and in water gives W/B = ρ/ρ_water.',
          explain: t`$B = ${W.toFixed(1)} - ${Ww} = ${tn(W - Ww)}$ N, and $\dfrac{\rho}{\rho_\text{water}} = \dfrac{W}{B} = \dfrac{${W.toFixed(1)}}{${tn(W - Ww)}} = ${tn(W / (W - Ww))}$, so $\rho = ${tn(rho)}\ \text{kg/m}^3$.`,
          visual: hung(rho0, W / G / rho0, 'water'),
        };
      },
    }),
    mcq({
      id: 'cp-river', difficulty: 2,
      prompt: t`A cargo ship sails from the sea ($1025\ \text{kg/m}^3$) up a freshwater river ($1000\ \text{kg/m}^3$) without changing its load. How does it float in the river?`,
      choices: ['Slightly lower, with a little more of the hull under water', 'Slightly higher, with less of the hull under water', 'At exactly the same level: its weight has not changed', 'It sinks, because fresh water gives no buoyancy'],
      answer: 0,
      why: {
        1: 'The less dense fresh water needs a *larger* volume displaced to weigh as much as the ship.',
        2: 'The buoyant force must still equal the weight — but the volume that provides it depends on the water’s density.',
        3: 'Any liquid denser than the ship’s average density floats it; fresh water is only 2.4% less dense than seawater.',
      },
      hints: ['The buoyant force must equal the ship’s weight in both waters.'],
      teach: 'A floating body displaces its own weight: in a less dense liquid it must displace more volume.',
      explain: t`$\rho_\text{water} V_\text{under} g = W$ in both places, so $V_\text{under}$ grows by the factor $1025/1000$: the ship settles about 2.5% deeper by volume. Ships carry load-line marks for fresh and salt water for exactly this reason.`,
      visual: tank({ scene: 'buoy', rhoObj: 700, V: 0.008, fluid: 'seawater', hold: 'free', values: false }, 'A floating body in seawater. Not to scale.'),
    }),
    num({
      id: 'cp-nbl', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([210, 225, 240]), V = r.pick([0.28, 0.3, 0.32]);
        const rl = 11340, ml = (1000 * V - m) / (1 - 1000 / rl);
        return {
          prompt: t`Astronauts rehearse spacewalks in a training pool, weighted to be **neutrally buoyant** — neither rising nor sinking. A suited astronaut has a mass of ${m} kg and a volume of ${V.toFixed(2)} m³ in fresh water ($1000\ \text{kg/m}^3$). What mass of lead ($11\,340\ \text{kg/m}^3$) must be attached to make them neutrally buoyant?`,
          answer: ml, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: 1000 * V - m, feedback: 'The lead is in the water too: it displaces a little water and is buoyed up by it, so a bit more is needed.' }],
          hints: ['Neutral: the total buoyant force equals the total weight.', t`$1000\,(V + m_\text{lead}/11\,340) = m + m_\text{lead}$; solve for $m_\text{lead}$.`],
          teach: 'Neutral buoyancy means the average density of the whole body equals the fluid’s.',
          explain: t`Without lead, $B$ corresponds to $${tn(1000 * V)}$ kg against $${m}$ kg. Each kilogram of lead adds a kilogram of weight but also $1000/11\,340 = 0.088$ kg of buoyancy, so $m_\text{lead} = \dfrac{${tn(1000 * V)} - ${m}}{1 - 0.088} = ${tn(ml)}\ \text{kg}$. Real training suits are trimmed with small weights and foam pads until they neither rise nor sink, in any orientation.`,
          visual: bodyFBD([force('B', 1000 * V * G, 90, 'lift'), force('W', m * G, 270, 'weight')], { icon: 'person', show: 'both', name: 'suited astronaut, before ballast', caption: 'Before any lead is added the buoyant force B is larger than the weight W, so the astronaut floats up. Arrows to scale.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §14.4 Archimedes’ Principle and Buoyancy', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-4-archimedes-principle-and-buoyancy' },
  ],
});
