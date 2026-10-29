// The Maxwell stress tensor and field momentum (Griffiths §8.2.1–8.2.3): the
// force on the charges inside a surface written as fields on the surface,
// F = ∮T·da − ε₀μ₀ d/dt∫S dτ, with T_ij = ε₀(E_iE_j − ½δ_ijE²) +
// (1/μ₀)(B_iB_j − ½δ_ijB²). Faraday's picture made exact: a field pulls along
// its lines and pushes sideways, with the same ½ε₀E² (or B²/2μ₀) both ways,
// and the force per area on a surface at angle θ to the field points at 2θ
// from the normal. Showcases: the force between capacitor plates from T
// (Q²/2ε₀A, as from the energy); magnetic pressure on a coil's winding;
// radiation pressure as the flux of field momentum g = S/c², I/c absorbed
// and 2I/c reflected; Newton's third law failing for two moving charges
// until the field's momentum is counted. Transfers: LightSail 2 (32 m²,
// about 5 kg) and IKAROS (196 m², measured 1.12 mN in July 2010 against
// 1.78 mN for an ideal mirror), a magnetorquer coil's winding pressure.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, PI, DEG, sf, bare, tag } from './_em4.js';

const t = String.raw;
const I_SUN = 1361;   // W/m², the total solar irradiance at 1 AU (Kopp and Lean 2011)

// the worked example: square plates 10 cm on a side, 1 mm apart, at 1 kV
const EX = { A: 0.01, d: 1e-3, V: 1000 };
EX.E = EX.V / EX.d;
EX.T = 0.5 * EPS0 * EX.E ** 2;
EX.F = EX.T * EX.A;
EX.Q = EPS0 * EX.A * EX.E;

/** The stress picture: a surface (horizontal, normal up), a field at angle th (deg) from the normal, and the force per area at 2θ. */
function stressPic(th, caption, { showF = true } = {}) {
  const a = th * DEG;
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.3, 1.5], {
      shade: [{ fn: '0', lower: '-1.3', from: -2.6, to: 2.6, color: 'ink3', alpha: 0.18 }],
      curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'ink2', width: 2 }, { param: ['0', 't'], t: [0, 1.35], color: 'ink3', dash: [4, 4], width: 1.2 }],
      arrows: [{ from: [+(-1.1 * Math.sin(a)).toFixed(4), +(-1.1 * Math.cos(a)).toFixed(4)], to: [+(1.1 * Math.sin(a)).toFixed(4), +(1.1 * Math.cos(a)).toFixed(4)], color: 'warn', width: 2.2, label: 'E', labelDx: 6 },
        ...(showF ? [{ from: [0, 0], to: [+(1.0 * Math.sin(2 * a)).toFixed(4), +(1.0 * Math.cos(2 * a)).toFixed(4)], color: 'good', width: 3, label: 'force / area', labelDx: 8, labelDy: -6 }] : [])],
      points: [tag(-2.5, 1.3, 'n̂ (outward)', 'ink3'), tag(-2.5, -1.08, 'inside the surface', 'ink2')],
    }),
    caption,
  };
}

/** A sail facing the Sun, sunlight arriving and reflected. */
const sailPic = (th, caption) => {
  const a = th * DEG;
  return {
    type: 'graph',
    params: bare([-3, 3], [-1.5, 1.5], {
      curves: [{ param: [`${(1.2 * Math.sin(a)).toFixed(4)}*t`, `${(1.2 * Math.cos(a)).toFixed(4)}*t`], t: [-1, 1], color: 'ink', width: 3.5 }],
      arrows: [{ from: [-2.6, 0.55], to: [-0.35, 0.55], color: 'gold', width: 2 }, { from: [-2.6, -0.55], to: [-0.35, -0.55], color: 'gold', width: 2 }, { from: [0.15, 0], to: [+(0.15 + 1.2 * Math.cos(a)).toFixed(4), +(-1.2 * Math.sin(a)).toFixed(4)], color: 'good', width: 3, label: 'F', labelDx: 6 }],
      points: [tag(-2.9, 1.0, 'sunlight', 'gold'), tag(0.3, 1.3, 'sail', 'ink')],
    }),
    caption,
  };
};

export default lesson({
  id: 'phys4600.M2.3',
  title: 'The Maxwell stress tensor and field momentum',
  minutes: 18, difficulty: 4,
  equation: t`\begin{gathered}T_{ij} = \varepsilon_0\left(E_iE_j - \tfrac12\delta_{ij}E^2\right) \\ + \frac{1}{\mu_0}\left(B_iB_j - \tfrac12\delta_{ij}B^2\right), \\ \vec F = \oint_{\mathcal S}\overleftrightarrow{T}\cdot d\vec a \\ - \varepsilon_0\mu_0\frac{d}{dt}\int_{\mathcal V}\vec S\,d\tau\end{gathered}`,
  intro: t`The force on the charges in a volume is $\int(\rho\vec E + \vec J\times\vec B)\,d\tau$. Use Maxwell’s equations to replace $\rho$ and $\vec J$ by fields, and the force becomes a surface integral of the **Maxwell stress tensor** $T_{ij}$, plus a term in the Poynting vector inside. $T_{ij}$ is a force per unit area: the $i$ component of force on a surface element facing direction $j$. Read it as Faraday did: field lines are under **tension** along their length and push on each other **sideways**, with the same $\tfrac12\varepsilon_0E^2$ (or $B^2/2\mu_0$) each way. The extra term says the fields carry **momentum**, with density $\vec g = \varepsilon_0\mu_0\vec S = \vec S/c^2$: force on the charges equals momentum flowing in through the surface minus what piles up in the field. Without it, two moving charges would push on each other unequally — Newton’s third law would fail. With it, light pushes on what absorbs it.`,
  symbols: [
    { tex: 'T_{ij}', text: t`the Maxwell stress tensor, in N/m² (= $\text{J/m}^3$); $i, j$ run over $x, y, z$` },
    { tex: '\\delta_{ij}', text: t`the Kronecker delta: 1 when $i = j$, 0 otherwise` },
    { tex: '\\overleftrightarrow{T}\\cdot d\\vec a', text: t`the force transmitted across the surface element $d\vec a$ (pointing outward), with components $\sum_j T_{ij}\,da_j$` },
    { tex: '\\vec S', text: t`the Poynting vector, in $\text{W/m}^2$; $\vec S/c^2$ is the field’s momentum per unit volume` },
    { tex: '\\vec F', text: 'the total electromagnetic force on the charges inside the closed surface, in N' },
  ],
  why: t`Solar sails, radiation pressure on spacecraft orbits, magnet design and the momentum of light all live here — and $T_{ij}$, $\vec S/c$ and $u$ together form the stress–energy tensor $T^{\mu\nu}$ that appears on the right of Einstein’s equations.`,
  visual: {
    type: 'graph',
    title: 'What a field does to a surface',
    lead: t`A small patch of surface (grey below it is “inside”) in a uniform electric field at angle $\theta$ from its outward normal. The stress tensor gives the force per unit area the field exerts across it, $\overleftrightarrow{T}\cdot\hat n$. Its size is always $\tfrac12\varepsilon_0E^2$; its direction is $2\theta$ from the normal.`,
    tasks: [
      t`$\theta = 0$: the field runs straight through the surface and **pulls** it outward — tension along the lines.`,
      t`$\theta = 90^\circ$: the field runs along the surface and **pushes** in — pressure across the lines.`,
      t`At $\theta = 45^\circ$ the force is purely sideways, a shear. The same rules hold for $\vec B$ with $B^2/2\mu_0$.`,
    ],
    params: {
      x: [-2.6, 2.6], y: [-1.3, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [{ key: 'th', label: t`Field angle $\theta$ from the normal`, min: 0, max: 90, step: 1, value: 25, unit: '^\\circ', explain: 'The angle between the electric field and the surface’s outward normal.' }],
      shade: [{ fn: '0', lower: '-1.3', from: -2.6, to: 2.6, color: 'ink3', alpha: 0.18 }],
      curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'ink2', width: 2 }, { param: ['0', 't'], t: [0, 1.35], color: 'ink3', dash: [4, 4], width: 1.2 }],
      arrows: [
        { from: ['-1.1*sin(th*pi/180)', '-1.1*cos(th*pi/180)'], to: ['1.1*sin(th*pi/180)', '1.1*cos(th*pi/180)'], color: 'warn', width: 2.2, label: 'E', labelDx: 6 },
        { from: [0, 0], to: ['sin(2*th*pi/180)', 'cos(2*th*pi/180)'], color: 'good', width: 3, label: 'force / area', labelDx: 8, labelDy: -6 },
      ],
      points: [tag(-2.5, 1.3, 'n̂ (outward)', 'ink3'), tag(-2.5, -1.08, 'inside the surface', 'ink2')],
      readouts: [
        { label: t`normal part $/\tfrac12\varepsilon_0E^2$`, expr: 'cos(2*th*pi/180)', digits: 3 },
        { label: t`sideways part $/\tfrac12\varepsilon_0E^2$`, expr: 'sin(2*th*pi/180)', digits: 3 },
      ],
    },
    caption: t`Static, uniform field; the force arrow is drawn at a fixed length, $\tfrac12\varepsilon_0E^2$ per unit area. Positive normal part: a pull outward (tension); negative: a push inward (pressure).`,
  },
  example: {
    prompt: t`Square plates ${EX.A * 1e4} cm² in area, ${EX.d * 1e3} mm apart, are held at ${EX.V} V. Use the stress tensor to find the force between them, and check it against the energy.`,
    visual: { type: 'em-capacitor', params: { connected: true, V: 1000, d: 1e-3, A: 0.01, f: 0, controls: false, readout: false }, caption: t`A parallel-plate capacitor; the field fills the gap and (ignoring fringing) is zero outside.` },
    steps: [
      { label: 'The surface', text: t`Enclose the top plate in a box. Outside the capacitor $\vec E = 0$, so only the box’s face in the gap contributes. There $\vec E = -E\hat z$ (down, from the positive top plate), and the face’s outward normal is $-\hat z$; the sign of $\vec E$ will not matter, since $T$ is quadratic in it.` },
      { label: 'The tensor', text: t`With $\vec E$ along $z$: $T_{zz} = \varepsilon_0(E^2 - \tfrac12E^2) = \tfrac12\varepsilon_0E^2$, while $T_{xx} = T_{yy} = -\tfrac12\varepsilon_0E^2$ and the off-diagonal terms vanish.` },
      { label: 'The force', text: t`$F_z = T_{zz}\,da_z = \tfrac12\varepsilon_0E^2(-A)$: the top plate is pulled **down**, toward the other — the field lines’ tension. Size: $\tfrac12\varepsilon_0E^2A$ with $E = V/d = ${tex(EX.E, 2)}$ V/m, so $F \approx ${nice(sf(EX.F * 1e3, 3))}$ mN.` },
      { label: 'Check by energy', text: t`At fixed charge $U = \dfrac{Q^2d}{2\varepsilon_0A}$, so $F = -\dfrac{\partial U}{\partial d} = -\dfrac{Q^2}{2\varepsilon_0A}$; with $Q = \varepsilon_0AE$ that is $\tfrac12\varepsilon_0E^2A$ ✓.` },
      { label: 'Sense check', text: t`The tension $\tfrac12\varepsilon_0E^2 \approx ${nice(sf(EX.T, 3))}$ Pa is the electrostatic pressure of [PHYS 3600 M8.1](#/lesson/phys3600.M8.1) — the stress tensor turns it into a rule for any field and any surface.` },
    ],
    answer: t`The plates attract with $F = \tfrac12\varepsilon_0E^2A \approx ${nice(sf(EX.F * 1e3, 3))}$ mN.`,
  },
  practice: [
    num({
      id: 'txx', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 3, 10, 30]), comp = r.pick(['zz', 'xx']);
        const T = (comp === 'zz' ? 0.5 : -0.5) * EPS0 * (E * 1e5) ** 2;
        return {
          prompt: t`A uniform electric field of $${E}\times10^{5}$ V/m points along $\hat z$, and there is no magnetic field. What is $T_{${comp}}$?`,
          visual: stressPic(comp === 'zz' ? 0 : 90, t`A surface ${comp === 'zz' ? 'facing along' : 'lying along'} the field. The force arrow shows the direction only.`, { showF: false }),
          answer: T, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: -T, feedback: comp === 'zz' ? t`For the component along the field, $E_zE_z - \tfrac12E^2 = +\tfrac12E^2$: positive, a tension.` : t`For a component across the field, $E_xE_x = 0$ and only $-\tfrac12E^2$ remains: negative, a pressure.` }],
          hints: [t`$T_{ij} = \varepsilon_0(E_iE_j - \tfrac12\delta_{ij}E^2)$ with $E_x = 0$, $E_z = E$.`, comp === 'zz' ? t`$T_{zz} = \varepsilon_0(E^2 - \tfrac12E^2)$.` : t`$T_{xx} = \varepsilon_0(0 - \tfrac12E^2)$.`],
          teach: 'A field pulls along its lines (T along the field = +½ε₀E²) and pushes across them (T across = −½ε₀E²).',
          explain: t`$T_{${comp}} = ${comp === 'zz' ? '+' : '-'}\tfrac12\varepsilon_0E^2 \approx ${nice(sf(T, 3))}$ Pa: ${comp === 'zz' ? 'tension along the field lines' : 'pressure across them'}.`,
        };
      },
    }),
    num({
      id: 'plate-force', difficulty: 2,
      gen(r) {
        const A = r.pick([25, 100, 400]), d = r.pick([0.2, 0.5, 2]), V = r.pick([100, 500, 2000]);
        const E = V / (d * 1e-3), F = 0.5 * EPS0 * E * E * A * 1e-4;
        return {
          prompt: t`Plates of area ${A} cm², ${d} mm apart in air, are held at ${V} V. Using $T_{zz}$ on a surface in the gap, what force pulls them together? Ignore fringing.`,
          visual: { type: 'em-capacitor', params: { connected: true, V: 1000, d: 1e-3, A: 0.01, f: 0, controls: false, readout: false }, caption: t`A parallel-plate capacitor; the field fills the gap. Fringing ignored.` },
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: EPS0 * E * E * A * 1e-4 * 1e3, feedback: t`$T_{zz} = \tfrac12\varepsilon_0E^2$: the half matters. (Each plate feels only the other plate’s field, $E/2$.)` }],
          hints: [t`Only the face in the gap contributes, with $T_{zz} = \tfrac12\varepsilon_0E^2$ and $E = V/d$.`, t`$F = \tfrac12\varepsilon_0E^2A$.`],
          teach: 'The force between capacitor plates is the field’s tension ½ε₀E² times the area.',
          explain: t`$E = ${tex(E, 3)}$ V/m and $F = \tfrac12\varepsilon_0E^2A \approx ${nice(sf(F * 1e3, 3))}$ mN, attractive. This is how an electrostatic voltmeter, or a MEMS actuator, makes force from voltage.`,
        };
      },
    }),
    mcq({
      id: 'like-charges', difficulty: 3,
      prompt: t`Two equal positive charges sit side by side. On the plane midway between them their field is parallel to the plane. What does the stress tensor say about the force on one charge, found from that plane?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', charges: [{ q: 1, x: -2, y: 0 }, { q: 1, x: 2, y: 0 }], fieldLines: true, static: true, readouts: [], arrows: false, x: [-6, 6], y: [-3.5, 3.5], notes: { lines: [{ from: [0, -3.5], to: [0, 3.5], color: 'gold', dash: [5, 4] }] } }, caption: t`Two equal positive charges and their field lines; on the midplane the field runs along it. Exact field lines.` },
      choices: [
        t`On the midplane the lines run along the surface, so the stress there is a pressure: the field pushes the charges apart`,
        t`On the midplane the lines cross the surface, so the tension pulls the charges together`,
        'The stress tensor cannot give the force on a point charge',
        'The pressure and tension cancel, so the force must come from somewhere else',
      ],
      answer: 0,
      why: {
        1: t`For like charges the lines bend away from each other and run **along** the midplane; for opposite charges they cross it and the tension pulls the charges together.`,
        2: t`Enclose one charge in a huge hemisphere closed by the midplane: the far surface contributes nothing, and the midplane gives exactly Coulomb’s force.`,
        3: t`Across the field the stress is pure pressure, $\tfrac12\varepsilon_0E^2$ per area pushing inward; nothing cancels it.`,
      },
      hints: [t`Which way does the field point relative to the midplane’s normal?`, t`Across field lines, $\overleftrightarrow{T}\cdot\hat n = -\tfrac12\varepsilon_0E^2\hat n$: a push inward.`],
      teach: 'Like charges repel because the field lines between them press sideways; opposite charges attract because the lines between them are in tension.',
      explain: t`On the midplane $\vec E\cdot\hat n = 0$, so the stress is a pressure $\tfrac12\varepsilon_0E^2$ pushing into the half-space holding each charge: they are pushed apart. Integrating it over the plane gives exactly $q^2/4\pi\varepsilon_0(2d)^2$. Faraday pictured exactly this, lines that crowd together pushing each other aside.`,
    }),
    num({
      id: 'sail', difficulty: 2,
      gen(r) {
        const A = r.pick([10, 32, 100, 1000]), rau = r.pick([0.7, 1, 1.5]), refl = r.bool(0.5);
        const Iv = I_SUN / rau ** 2, F = ((refl ? 2 : 1) * Iv * A) / C;
        return {
          prompt: t`A flat sail of ${A} m² faces the Sun square-on at ${rau} AU and ${refl ? 'reflects all the light straight back' : 'absorbs all the light'}. Sunlight at 1 AU carries 1361 W/m². What force does the light exert?`,
          visual: sailPic(0, t`Sunlight (gold) falling square-on on a sail; the force (green) points straight away from the Sun. Not to scale.`),
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [
            { value: (((refl ? 1 : 2) * Iv * A) / C) * 1e3, feedback: refl ? t`A mirror reverses the light’s momentum: the change is twice the momentum delivered, $2I/c$.` : t`An absorber only stops the light: the pressure is $I/c$, not $2I/c$.` },
            { value: (((refl ? 2 : 1) * I_SUN * A) / C) * 1e3, feedback: t`Sunlight weakens as $1/r^2$: at ${rau} AU, $I = 1361/${rau}^2$ W/m².` },
          ].filter((e) => Math.abs(e.value - F * 1e3) > 0.02 * F * 1e3),
          hints: [t`Momentum flux of light is $I/c$ (the field momentum density $I/c^2$ moving at $c$).`, t`Absorbed: $F = IA/c$. Reflected straight back: $F = 2IA/c$. And $I = 1361/r^2$ with $r$ in AU.`],
          teach: 'Light pushes with its momentum flux: I/c on an absorber, 2I/c on a mirror.',
          explain: t`$I = ${nice(sf(Iv, 4))}$ W/m², so $F = ${refl ? '2' : ''}IA/c \approx ${nice(sf(F * 1e3, 3))}$ mN. In stress-tensor language, the light’s momentum flux $-T_{zz}$ equals its energy density $u$; a mirror doubles the momentum transfer.`,
        };
      },
    }),
    num({
      id: 'coil-pressure', difficulty: 2,
      gen(r) {
        const n = r.pick([2000, 5000, 10000]), I = r.pick([0.2, 0.5, 1]);
        const B = MU0 * n * I, p = (B * B) / (2 * MU0);
        return {
          prompt: t`The air-core coil of a satellite’s magnetorquer is wound with ${n} turns per metre and carries ${I} A. Treating it as a long solenoid, what pressure does its field exert outward on the winding?`,
          visual: { type: 'em-bfield', params: { unit: 'cm', x: [-8, 8], y: [-4, 4], solenoid: { x0: -5, x1: 5, R: 1.6, N: 14, I: 3 }, static: true, readouts: [], labels: false }, caption: t`A solenoid cut through its axis: the field lines inside run along it and press outward on the winding. Not to scale.` },
          answer: p, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: B * B / MU0, feedback: t`The magnetic pressure is $B^2/2\mu_0$: the energy density, with its half.` }],
          hints: [t`Inside, $B = \mu_0nI$, along the axis; outside, $B \approx 0$.`, t`On the winding the field runs along the surface: a pressure $B^2/2\mu_0$ pushing outward.`],
          teach: 'A field pushes sideways on whatever bounds it with a pressure B²/2μ₀: a solenoid’s winding feels it as outward hoop stress.',
          explain: t`$B = \mu_0nI \approx ${nice(sf(B * 1e3, 3))}$ mT, so $p = B^2/2\mu_0 \approx ${nice(sf(p, 3))}$ Pa — negligible here. The same rule at 10 T gives 40 MPa, which is why high-field magnets need steel bands to keep from bursting.`,
        };
      },
    }),
    num({
      id: 'momentum-density', difficulty: 2,
      gen(r) {
        const rau = r.pick([0.39, 1, 5.2]), V = r.pick([1, 10, 100]);
        const g = I_SUN / rau ** 2 / C ** 2, p = g * V;
        return {
          prompt: t`Sunlight at ${rau} AU has an intensity of $1361/${rau}^2$ W/m². How much momentum does the light in a box of ${V} m³ there carry?`,
          visual: sailPic(0, t`Sunlight streaming past; each cubic metre carries momentum $\vec g = \vec S/c^2$. Not to scale.`),
          answer: p, units: 'kg m/s', tol: { rel: 0.01 },
          errors: [{ value: (I_SUN / rau ** 2 / C) * V, feedback: t`$I/c$ is the momentum **flux** (per area per second). The density is $I/c^2$.` }],
          hints: [t`The field’s momentum density is $\vec g = \varepsilon_0\mu_0\vec S = \vec S/c^2$.`, t`Multiply $I/c^2$ by the volume.`],
          teach: 'Fields carry momentum S/c² per unit volume: tiny, because c² is huge.',
          explain: t`$g = I/c^2 \approx ${tex(g, 3)}\ \text{kg/(m}^2\,\text{s)}$, so the box holds $${tex(p, 3)}$ kg·m/s. That momentum, arriving at $c$, is the radiation pressure $I/c$.`,
        };
      },
    }),
    mcq({
      id: 'third-law', difficulty: 3,
      prompt: t`Two positive charges move at the same speed: one along $x$ toward the origin, the other along $y$ toward the origin, so their paths cross at right angles. Their electric forces are equal and opposite; their magnetic forces are not. What saves momentum conservation?`,
      visual: { type: 'graph', params: bare([-3, 3], [-1.6, 1.6], { arrows: [{ from: [-2.2, 0], to: [-1.3, 0], color: 'accent', width: 2.4, label: 'v', labelDx: 4 }, { from: [0.6, -1.5], to: [0.6, -0.6], color: 'accent', width: 2.4, label: 'v', labelDx: 6 }], points: [{ x: -2.3, y: 0, r: 7, color: 'bad' }, { x: 0.6, y: -1.55, r: 7, color: 'bad' }, tag(-2.3, 0, '+', 'ink', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(0.6, -1.55, '+', 'ink', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(0.6, 0, 'origin', 'ink3', { labelDx: 8 })] }), caption: t`Two charges heading for the origin at right angles. Schematic.` },
      choices: [
        'The fields themselves carry momentum, and the charges’ mechanical momentum plus the field’s is conserved',
        'Nothing: momentum is not conserved in electromagnetism',
        'The magnetic forces are in fact equal and opposite once relativity is included',
        'The difference is radiated away as heat',
      ],
      answer: 0,
      why: {
        1: t`Total momentum is conserved — once the field’s $\int\varepsilon_0\mu_0\vec S\,d\tau$ is counted.`,
        2: t`The asymmetry is real in any frame: one charge sits on the other’s line of motion, where its $\vec B$ vanishes, while the other does not.`,
        3: 'There is no heat here; the missing momentum is stored in the fields and given back.',
      },
      hints: [t`A charge moving straight at a point makes no $\vec B$ along its own line of motion.`, t`The momentum equation has a term $-\varepsilon_0\mu_0\dfrac{d}{dt}\int\vec S\,d\tau$.`],
      teach: 'Newton’s third law fails for moving charges; momentum conservation survives because the fields carry momentum S/c².',
      explain: t`At the instant drawn, one charge lies on the other’s line of motion, where its magnetic field is zero — so the magnetic forces cannot be equal and opposite. The fields’ momentum $\int\vec S/c^2\,d\tau$ changes to make up the difference: $\vec F_{\text{on charges}} = \oint\overleftrightarrow{T}\cdot d\vec a - \dfrac{d}{dt}\int\vec g\,d\tau$. Momentum belongs to the charges and the fields together.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lightsail', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([0, 20, 35, 50]);
        const A = 32, m = 5, F = (2 * I_SUN * A * Math.cos(th * DEG) ** 2) / C, a = F / m;
        return {
          prompt: t`The Planetary Society’s LightSail 2 (2019–2022) had a sail of 32 m² on a spacecraft of about 5 kg. Treating the sail as a perfect mirror at 1 AU, tilted ${th}° from facing the Sun, what acceleration could sunlight give it? (Light reflects specularly; only the momentum along the sail’s normal is transferred.)`,
          visual: sailPic(th, t`Sunlight (gold) striking a tilted mirror sail; for a perfect mirror the force (green) lies along the sail’s normal. Not to scale.`),
          answer: a * 1e6, units: 'μm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: ((2 * I_SUN * A * Math.cos(th * DEG)) / C / m) * 1e6, feedback: t`Two factors of $\cos\theta$: the tilted sail intercepts $IA\cos\theta$ of power, and only the normal component of each photon’s momentum, $\cos\theta$, is reversed.` },
            { value: ((I_SUN * A * Math.cos(th * DEG) ** 2) / C / m) * 1e6, feedback: t`A mirror reverses the normal momentum: twice that of an absorber.` },
          ].filter((e) => Math.abs(e.value - a * 1e6) > 0.02 * a * 1e6),
          hints: [t`Square-on, a perfect mirror feels $2IA/c$.`, t`Tilted by $\theta$: $F = \dfrac{2IA\cos^2\theta}{c}$, along the normal. Then $a = F/m$.`],
          teach: 'A mirror sail tilted θ from the Sun feels 2IA cos²θ/c along its normal — tilting is how a sail steers.',
          explain: t`$F = \dfrac{2(1361)(32)\cos^2${th}^\circ}{c} \approx ${nice(sf(F * 1e6, 3))}$ μN, so $a \approx ${nice(sf(a * 1e6, 3))}$ μm/s² — about $${nice(sf((a / 9.80665) * 1e6, 2))}$ μg. Tiny, but it never runs out: LightSail 2 used it to raise the high point of its orbit, before atmospheric drag won. A real sail is not a perfect mirror and billows, so the real force is somewhat smaller.`,
        };
      },
    }),
    num({
      id: 'cp-ikaros', difficulty: 3, transfer: true,
      gen(r) {
        const Fm = r.pick([1.12]), A = r.pick([196]), Iv = r.pick([1361, 1340]);
        const Fid = (2 * Iv * A) / C, frac = (Fm * 1e-3) / Fid;
        return {
          prompt: t`JAXA’s IKAROS, the first interplanetary solar sail, had a 196 m² polyimide sail. In July 2010 JAXA measured the sunlight’s force on it as 1.12 mN. Taking sunlight’s intensity there as ${Iv} W/m², what fraction is that of the force on an ideal mirror facing the Sun square-on?`,
          visual: sailPic(10, t`A sail in sunlight. A real sail is partly absorbing, wrinkled and not exactly facing the Sun. Not to scale.`),
          answer: frac, tol: { rel: 0.015 },
          errors: [{ value: (Fm * 1e-3) / (Fid / 2), feedback: t`An ideal mirror feels $2IA/c$, not $IA/c$.` }],
          hints: [t`Ideal mirror, square-on: $F = 2IA/c$.`, t`Divide 1.12 mN by it.`],
          teach: 'Real sails fall short of the ideal-mirror 2IA/c: imperfect reflectivity, wrinkles and tilt each cost some force.',
          explain: t`$2IA/c \approx ${nice(sf(Fid * 1e3, 3))}$ mN, so IKAROS achieved about $${nice(sf(frac, 2))}$ of the ideal. Its aluminized film reflects most but not all of the light (absorbed light pushes with $I/c$, not $2I/c$), the sail was not flat or exactly facing the Sun, and part of its area carried thin-film solar cells and steering panels.`,
        };
      },
    }),
    mcq({
      id: 'cp-signs', difficulty: 2,
      prompt: t`Using “tension along field lines, pressure across them”, which pair of statements is right?`,
      visual: stressPic(0, t`A field running straight through a surface: tension.`),
      choices: [
        'Capacitor plates are pulled together; a solenoid’s winding is pushed outward',
        'Capacitor plates are pushed apart; a solenoid’s winding is pulled inward',
        'Both are pulled inward',
        'Both are pushed outward',
      ],
      answer: 0,
      why: {
        1: t`Between the plates the lines run from one plate to the other: tension pulls them together. In a solenoid the lines run **along** the winding: pressure pushes it out.`,
        2: t`The winding sits beside field lines, not across them; the stress there is pressure.`,
        3: t`The plates sit across the lines, so they feel tension: they are pulled together.`,
      },
      hints: ['At each surface, does the field run through it or along it?', 'Through: tension (a pull). Along: pressure (a push).'],
      teach: 'Field lines through a surface pull it; field lines along a surface push it.',
      explain: t`The capacitor’s $\vec E$ crosses the plates’ faces: tension $\tfrac12\varepsilon_0E^2$ draws them together. The solenoid’s $\vec B$ runs along its winding: pressure $B^2/2\mu_0$ pushes it outward — the hoop stress magnet builders fight.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §8.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'The Planetary Society, LightSail 2', url: 'https://www.planetary.org/sci-tech/lightsail' },
    { label: 'Kopp and Lean, A new, lower value of total solar irradiance, Geophys. Res. Lett. 38, L01706 (2011)', url: 'https://doi.org/10.1029/2010GL045777' },
  ],
});
