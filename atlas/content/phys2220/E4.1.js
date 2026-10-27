// Potential energy and potential: the electric force is conservative, so a
// charge has a potential energy, and dividing out the charge leaves the
// potential V — energy per coulomb — with ΔV = −∫E·ds and ΔU = qΔV.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, EPS0, QE, ME, MP, MXE, tn, s3, r6, field } from './_efield.js';

const t = String.raw;
const MA = 6.645e-27;            // kg, an alpha particle
const C = 2.998e8;               // m/s

// two large vertical plates, + at x = −g/2 and − at x = +g/2 (in `unit`), dV volts across, V = 0 on the − plate
const plates = (dV, g, unit = 'cm', extra = {}) => {
  const L = { cm: 0.01, mm: 0.001 }[unit], sig = r6(((EPS0 * dV) / (g * L)) * 1e9);
  return { unit, sheets: [{ x: -g / 2, y: 0, angle: 90, sigma: sig }, { x: g / 2, y: 0, angle: 90, sigma: -sig }], ref: [g / 2, 0], ...extra };
};

// a field of 50 V/cm pointing right between plates at x = ±5 cm, with V = 0 at x = x0: V(x) = 50(x0 − x) (x in cm)
const ladder = (pts, caption, x0 = 0, levels = [-200, -100, 0, 100, 200]) => field({
  ...plates(500, 10), ref: [x0, 0], x: [-6.5, 6.5], y: [-4, 4], equip: true, levels, fieldLines: false, arrows: 'linear',
  notes: { points: pts.map(([lab, V, y]) => ({ x: x0 - V / 50, y, label: lab, color: 'gold', r: 4.5, ldx: 7, ldy: -6 })) },
}, caption);
const an = (w) => (/^[aeiou]/i.test(w) ? `an ${w}` : `a ${w}`);

// the worked example: an electron gun, 2500 V across 1.5 cm
const WX = { dV: 2500, d: 0.015 };
WX.K = QE * WX.dV;
WX.v = Math.sqrt((2 * WX.K) / ME);
WX.E = WX.dV / WX.d;

const relSpeed = (Kj, m) => { const g = 1 + Kj / (m * C * C); return C * Math.sqrt(1 - 1 / (g * g)); };

export default lesson({
  id: 'phys2220.E4.1',
  title: 'Potential energy and potential',
  minutes: 14, difficulty: 2,
  intro: t`The electric force is conservative, like gravity: the work it does on a charge moving from A to B is the same along every path. So a charge $q$ in a field has a potential energy $U$, and since $U$ is proportional to $q$, dividing it out leaves a property of the place alone — the **electric potential** $V = U/q$, energy per unit charge, in volts ($1\ \text{V} = 1\ \text{J/C}$):

$$\Delta V = V_B - V_A = -\int_A^B \vec E\cdot d\vec s, \qquad \Delta U = q\,\Delta V$$

$V$ falls along the direction of the field: in a uniform field, a step $d$ along it lowers $V$ by $Ed$ — so field strength is also measured in V/m ($1\ \text{V/m} = 1\ \text{N/C}$). Released from rest, a positive charge heads for lower $V$ and a negative one for higher $V$: either way its potential energy falls and its kinetic energy rises by $-q\,\Delta V$.`,
  symbols: [
    { tex: 'U', text: 'the potential energy of a charge in the field, in J. Only changes in it matter: you choose where it is zero' },
    { tex: 'V', text: 'the electric potential at a point: the potential energy per coulomb a charge would have there, in volts (J/C). It belongs to the point, whether or not a charge sits there' },
    { tex: '\\Delta V', text: 'the potential difference, or “voltage”, between two points: final minus initial' },
    { tex: 'q', text: 'the charge that moves, in C, with its sign' },
    { tex: 'd\\vec s', text: 'a small step along the path from A to B; $\\vec E\\cdot d\\vec s$ counts only the part of the step along the field' },
    { tex: '\\text{eV}', text: 'the electron-volt: the energy a charge $e$ gains crossing 1 V, $1.602\\times10^{-19}$ J' },
  ],
  why: 'Voltage is the language of every battery, circuit and power line. In an electron gun, an ion thruster or a particle accelerator it says straight away how much energy each particle gains: an electron crossing 1000 V gains 1000 eV, whatever the path or the field’s shape.',
  visual: {
    type: 'em-field',
    title: 'Falling through a potential difference',
    lead: t`Two large plates, 8 cm apart, with a voltage across them. The violet dashed lines are equipotentials: lines of equal $V$. Drag the probe to read $V$; drag the particle and launch it from rest.`,
    tasks: [
      'Drag the probe from the + plate to the − plate: V falls steadily, by the same amount for every centimetre.',
      'Launch the proton from the middle. Its kinetic energy at the plate, in eV, equals the drop in V it fell through. Now try an electron: it heads the other way, toward higher V, and gains just as much.',
      'Try the xenon ion: the same charge as a proton, so the same energy — but 131 times heavier, so it ends up about 11 times slower.',
    ],
    params: {
      unit: 'cm', ref: [4, 0], x: [-6, 6], y: [-3.75, 3.75],
      sheets: [{ x: -4, y: 0, angle: 90, sigma: 'dV*0.110675' }, { x: 4, y: 0, angle: 90, sigma: '-dV*0.110675' }],
      sliders: [{ key: 'dV', label: 'Voltage across the plates $\\Delta V$', min: 100, max: 2000, step: 100, value: 1000, unit: 'V' }],
      choices: [{ key: 'kind', label: 'Particle', options: [['proton', 'Proton'], ['electron', 'Electron'], ['alpha', 'Alpha particle'], ['xenon', 'Xenon ion']], value: 'proton' }],
      particle: { kind: 'kind', x: 0, y: 0, speed: 0, angle: 0 },
      probe: { x: -2, y: 2.2 },
      readouts: ['V', 'E', 'K', 'speed'], equip: true, fieldLines: true, density: 10, arrows: false,
    },
    caption: 'The plates are large: between them the field is uniform, outside it is zero. V is measured from the − plate (marked V = 0). The particle starts at rest; its energy and speed are read where it reaches a plate.',
  },
  example: {
    prompt: t`In an electron gun, electrons leave a hot cathode almost at rest and are pulled toward an anode 1.5 cm away, held 2500 V above the cathode. Find (a) the change in an electron's potential energy, (b) its speed at the anode, (c) the field between them, taken as uniform.`,
    visual: field({ ...plates(-2500, 15, 'mm'), ref: [-7.5, 0], x: [-10, 10], y: [-6.25, 6.25], equip: true, levels: [500, 1000, 1500, 2000], fieldLines: false, arrows: 'linear', particle: { kind: 'electron', x: -7.3, y: 0, speed: 0, path: true }, notes: { points: [{ x: -7.5, y: 5, label: 'cathode 0 V', color: 'ink2', r: 0.1, ldx: -30, ldy: -2 }, { x: 7.5, y: 5, label: 'anode 2500 V', color: 'ink2', r: 0.1, ldx: -40, ldy: -2 }] } }, 'The cathode (left) and anode (right), the field between them (arrows, pointing from high V to low V), the equipotentials every 500 V, and the electron’s path. A real anode has a hole for the beam to pass through.'),
    steps: [
      { label: 'Potential energy', text: t`The electron's charge is $q = -e$, and it moves from 0 V to $+2500$ V: $\Delta U = q\,\Delta V = (-1.602\times10^{-19}\ \text{C})(+2500\ \text{V}) = ${tn(-WX.K)}$ J. Its potential energy falls — by 2500 eV.` },
      { label: 'Speed', text: t`The potential energy lost becomes kinetic energy: $\tfrac12mv^2 = ${tn(WX.K)}$ J, so $v = \sqrt{\dfrac{2K}{m}} = \sqrt{\dfrac{2(${tn(WX.K, 4)})}{9.109\times10^{-31}}} = ${tn(WX.v)}$ m/s — a tenth of the speed of light, reached in 1.5 cm. (Relativity lowers this by ${s3((100 * (WX.v - relSpeed(WX.K, ME))) / relSpeed(WX.K, ME), 1)}%.)` },
      { label: 'Field', text: t`$E = \dfrac{\Delta V}{d} = \dfrac{2500\ \text{V}}{0.015\ \text{m}} = ${tn(WX.E)}$ V/m, pointing from the anode back toward the cathode — from high $V$ to low $V$. The electron, being negative, is pushed against the field.` },
      { label: 'Sense check', text: t`The energy depends only on the voltage: double it, and the energy doubles and the speed grows by $\sqrt2$. This is about the speed of the electrons that the deflecting plates steered in lesson E2.5.` },
    ],
    answer: t`(a) $\Delta U = ${tn(-WX.K)}$ J ($-2500$ eV); (b) $${tn(WX.v)}$ m/s; (c) $${tn(WX.E)}$ V/m, pointing toward the cathode.`,
  },
  practice: [
    num({
      id: 'uniform-dV', difficulty: 1,
      gen(r) {
        const E = r.pick([500, 1200, 25000]), d = r.pick([2, 4, 5]), dV = E * (d / 100);
        return {
          prompt: t`Two large parallel plates, A and B, ${d} cm apart, make a uniform field of $${tn(E)}$ N/C pointing from A to B. What is the potential difference $V_A - V_B$?`,
          answer: dV, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: E / (d / 100), feedback: t`Divide or multiply? $\Delta V = Ed$: field (V/m) times distance (m) gives volts.` }],
          hints: [t`$V$ falls along the field, by $E$ for every metre.`, t`$V_A - V_B = Ed$, with $d$ in metres.`],
          teach: 'In a uniform field, V falls by Ed over a distance d along the field: 1 N/C is 1 V/m.',
          explain: t`Moving from A to B along the field, $V$ drops by $Ed = (${tn(E)}\ \text{V/m})(${d / 100}\ \text{m}) = ${tn(dV)}$ V, so $V_A - V_B = +${tn(dV)}$ V: A, where the field starts, is the higher.`,
          visual: field({ ...plates(dV, d), x: [-d, d], y: [-0.62 * d, 0.62 * d], fieldLines: true, density: 8, notes: { points: [{ x: -d / 2, y: 0.5 * d, label: 'A', color: 'gold', r: 0.1, ldx: -18, ldy: -2 }, { x: d / 2, y: 0.5 * d, label: 'B', color: 'gold', r: 0.1, ldx: 8, ldy: -2 }] } }, 'The plates edge-on, with the field between them.'),
        };
      },
    }),
    num({
      id: 'energy-gain', difficulty: 1,
      gen(r) {
        const pairs = [[200, -100], [100, -200], [200, 0], [0, -200], [100, -100]];
        const [hi, lo] = r.pick(pairs), kind = r.pick(['proton', 'electron']);
        const [VA, VB] = kind === 'proton' ? [hi, lo] : [lo, hi], gain = Math.abs(hi - lo);
        return {
          prompt: t`${an(kind).replace(/^a/, 'A')} moves from point A, where $V = ${VA}$ V, to point B, where $V = ${VB}$ V, with only the electric force acting on it. By how much does its kinetic energy change, in eV?`,
          answer: gain, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: -gain, feedback: kind === 'proton' ? 'A positive charge moving to lower V loses potential energy, so it gains kinetic energy.' : 'A negative charge moving to higher V loses potential energy (U = qV with q < 0), so it gains kinetic energy.' }],
          hints: [t`$\Delta K = -\Delta U = -q\,\Delta V$.`, t`For the ${kind}, $q = ${kind === 'proton' ? '+e' : '-e'}$, and $\Delta V = V_B - V_A$.`],
          teach: 'With only the electric force acting, ΔK = −qΔV: a charge e crossing ΔV volts changes its energy by ΔV electron-volts.',
          explain: t`$\Delta V = ${VB} - (${VA}) = ${VB - VA}$ V and $q = ${kind === 'proton' ? '+e' : '-e'}$, so $\Delta K = -q\,\Delta V = ${kind === 'proton' ? '-' : '+'}e(${VB - VA}\ \text{V}) = +${gain}$ eV $= ${tn(gain * QE)}$ J. ${kind === 'proton' ? 'The proton gains energy falling to lower potential.' : 'The electron gains energy climbing to higher potential.'}`,
          visual: ladder([['A', VA, 1.8], ['B', VB, -1.8]], 'Equipotentials (violet, every 100 V) in a uniform field (arrows), with the points A and B.'),
        };
      },
    }),
    mcq({
      id: 'which-way', difficulty: 2,
      prompt: 'A proton and an electron are released from rest at the point P between the plates. What happens?',
      choices: [
        'The proton moves toward lower V and the electron toward higher V; both lose potential energy and gain kinetic energy',
        'Both move toward lower V, the way a ball rolls downhill',
        'The proton loses potential energy, but the electron gains it as it climbs to higher V',
        'Neither moves: a single point has a potential, but nothing pushes on a charge there',
      ],
      answer: 0,
      why: {
        1: 'Only positive charges “roll downhill” in V. A negative charge’s potential energy qV is lowest where V is highest, so the electron heads for higher V.',
        2: 'U = qV and the electron’s q is negative: at higher V its potential energy is lower. Released from rest, any charge moves so that its potential energy falls.',
        3: 'The push comes from how V changes from place to place — the field. Between the plates V changes steadily, so both charges are pushed.',
      },
      hints: ['Work out U = qV for each charge on either side of P. Which way does each one’s U fall?'],
      teach: 'Released from rest, a positive charge moves to lower V and a negative charge to higher V: both lose potential energy.',
      explain: 'The proton (q > 0) has its lowest potential energy where V is lowest, so it moves along the field toward lower V. The electron (q < 0) has its lowest qV where V is highest, so it moves against the field, toward higher V. Each loses potential energy and gains the same amount of kinetic energy.',
      visual: ladder([['P', 0, 0.8]], 'Equipotentials (violet) between two plates, the field (arrows) and the point P.'),
    }),
    num({
      id: 'speed-from-V', difficulty: 2,
      gen(r) {
        const kind = r.pick(['proton', 'alpha', 'electron']), dV = r.pick([500, 2000, 10000]);
        const [q, m, name] = { proton: [1, MP, 'proton'], alpha: [2, MA, 'alpha particle (charge +2e, mass 6.645×10⁻²⁷ kg)'], electron: [1, ME, 'electron'] }[kind];
        const Kj = q * QE * dV, v = Math.sqrt((2 * Kj) / m), vr = relSpeed(Kj, m), pct = (100 * (v - vr)) / vr;
        const errs = [{ value: Math.sqrt(Kj / m), feedback: t`Kinetic energy is $\tfrac12mv^2$: $v = \sqrt{2K/m}$.` }];
        if (q === 2) errs.push({ value: Math.sqrt((2 * QE * dV) / m), feedback: 'An alpha particle carries 2e, so it gains 2 eV for every volt.' });
        return {
          prompt: t`${an(name).replace(/^a/, 'A')} starts from rest and is accelerated through a potential difference of ${dV} V. How fast is it then moving?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: errs,
          hints: [t`Kinetic energy gained: $K = |q|\,\Delta V$.`, t`$\tfrac12mv^2 = |q|\Delta V$, so $v = \sqrt{2|q|\Delta V/m}$.`],
          teach: 'Accelerated from rest through ΔV, a charge reaches v = √(2|q|ΔV/m).',
          explain: t`$K = |q|\Delta V = ${q === 2 ? '2' : ''}(1.602\times10^{-19})(${dV}) = ${tn(Kj)}$ J, so $v = \sqrt{2K/m} = ${tn(v)}$ m/s.${pct > 0.5 ? ` That is ${s3(v / C, 2)} of the speed of light: relativity lowers it by ${s3(pct, 2)}%.` : ''}`,
          visual: field({ ...plates(dV, 6), x: [-5, 5], y: [-3.125, 3.125], fieldLines: false, arrows: 'linear', particle: { kind, x: kind === 'electron' ? 2.9 : -2.9, y: 0, speed: 0, path: true } }, `The ${kind === 'alpha' ? 'alpha particle' : kind} starts at rest beside one plate and is accelerated across the gap (its path in gold).`),
        };
      },
    }),
    num({
      id: 'wire-dV', difficulty: 2,
      gen(r) {
        const lam = r.pick([10, 20, 40]), r1 = r.pick([1, 2]), r2 = r.pick([5, 8, 10]);
        const A = 2 * K * lam * 1e-9, dV = A * Math.log(r2 / r1);
        return {
          prompt: t`A long straight wire carries $${lam}$ nC/m. Its field points straight out from it, with size $E = 2k\lambda/r$. Integrate to find the potential difference $V(r_1) - V(r_2)$ between points ${r1} cm and ${r2} cm from the wire.`,
          answer: dV, units: 'V', tol: { rel: 0.01 },
          integrand: `${A}/x`, limits: [r1 / 100, r2 / 100],
          errors: [{ value: (A / (r1 / 100)) * ((r2 - r1) / 100), feedback: t`That treats the field as uniform at its value at $r_1$. It weakens as $1/r$: integrate.` }],
          hints: [t`$V(r_1) - V(r_2) = \displaystyle\int_{r_1}^{r_2} E\,dr$, moving outward along the field.`, t`$\displaystyle\int_{r_1}^{r_2}\frac{2k\lambda}{r}\,dr = 2k\lambda\ln\frac{r_2}{r_1}$.`],
          teach: 'ΔV is the integral of the field along the path: for a line charge, V(r₁) − V(r₂) = 2kλ ln(r₂/r₁).',
          explain: t`$V(r_1) - V(r_2) = \displaystyle\int_{r_1}^{r_2}\frac{2k\lambda}{r}\,dr = 2k\lambda\ln\frac{r_2}{r_1} = 2(8.988\times10^{9})(${lam}\times10^{-9})\ln${s3(r2 / r1, 3)} = ${tn(dV)}$ V — the area under the field curve. The closer point is at the higher potential.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 11], y: [0, Math.ceil(((A / r1) * 1.1) / 50) * 50], aspect: 'wide', xlabel: 'distance from the wire r (cm)', ylabel: 'E (V/cm)',
              curves: [{ fn: `${r6(A)}/max(x, 0.05)`, domain: [0.3, 11], color: 'accent', width: 2.4 }],
              shade: [{ fn: `${r6(A)}/max(x, 0.05)`, from: r1, to: r2, color: 'accent', alpha: 0.25 }],
              vlines: [{ x: r1, label: 'r₁' }, { x: r2, label: 'r₂' }],
            },
            caption: 'The wire’s field against distance, in V/cm so that the shaded area, field × distance, is in volts: it is the potential difference.',
          },
        };
      },
    }),
    mcq({
      id: 'two-paths', difficulty: 2,
      prompt: t`A small positive test charge is carried from A to B along path 1, and the field does $2.0\ \mu\text{J}$ of work on it. How much work does the field do if the charge goes along path 2 instead?`,
      choices: ['2.0 μJ: the same', 'More: path 2 is longer', 'Less: part of path 2 runs against the field', 'There is no way to tell without the field all along path 2'],
      answer: 0,
      why: {
        1: 'Work is force times distance only for a constant force along a straight path. Here the extra length goes partly with the field and partly against it, and these cancel.',
        2: 'It does — and partly with the field too. The two parts cancel down to the same total.',
        3: t`The field is conservative: the work is $q(V_A - V_B)$, set by the end points alone.`,
      },
      hints: ['The electric force is conservative. What does the work depend on?'],
      teach: t`The work an electrostatic field does on a charge, $q(V_A - V_B)$, depends only on where the charge starts and ends.`,
      explain: t`The work the field does is $W = -\Delta U = q(V_A - V_B)$, which depends only on the potentials at A and B. Along any path from A to B it is $2.0\ \mu\text{J}$. (Equivalently: around any closed loop the field does no net work.)`,
      visual: field({ unit: 'cm', x: [-8, 8], y: [-5, 5], charges: [{ x: 0, y: 0, q: 2 }], equip: true, equipLabels: false, fieldLines: false, notes: { lines: [{ from: [-3, 2], to: [5, -1], color: 'gold', width: 2.4 }, { from: [-3, 2], to: [-6, -3.5], color: 'teal', width: 2.4 }, { from: [-6, -3.5], to: [2, -4.2], color: 'teal', width: 2.4 }, { from: [2, -4.2], to: [5, -1], color: 'teal', width: 2.4 }], points: [{ x: -3, y: 2, label: 'A', color: 'ink', r: 4 }, { x: 5, y: -1, label: 'B', color: 'ink', r: 4, ldx: 8, ldy: 4 }, { x: 1, y: 0.75, label: '1', color: 'gold', r: 0.1, ldx: 4, ldy: -6 }, { x: -4.5, y: -0.75, label: '2', color: 'teal', r: 0.1, ldx: -14, ldy: -4 }] } }, 'A positive point charge, its equipotentials (violet), and two paths from A to B: path 1 (gold) straight, path 2 (teal) the long way round.'),
    }),
    num({
      id: 'work-carry', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 5]), [V1, V2] = r.pick([[-100, 200], [-200, 100], [0, 200], [100, -200]]), W = q * 1e-6 * (V2 - V1);
        return {
          prompt: t`How much work must you do to carry a $+${q}\ \mu\text{C}$ charge slowly from A, where $V = ${V1}$ V, to B, where $V = ${V2}$ V? (Slowly: it gains no kinetic energy.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: -W, feedback: 'That is the work the field does. You push against it, so your work is the change in potential energy, qΔV.' }],
          hints: [t`With no change in kinetic energy, your work equals the change in potential energy.`, t`$W_\text{you} = \Delta U = q(V_B - V_A)$.`],
          teach: 'Carrying a charge slowly, your work equals its change in potential energy: W = qΔV.',
          explain: t`$W = q(V_B - V_A) = (${q}\times10^{-6})(${V2} - (${V1})) = ${tn(W)}$ J. ${W > 0 ? 'Positive: you push the charge toward higher V, against the field.' : 'Negative: the field pulls the charge along, and you hold it back.'}`,
          visual: ladder([['A', V1, 1.8], ['B', V2, -1.8]], 'Equipotentials (violet, every 100 V) in a uniform field (arrows), with A and B.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion-thruster', difficulty: 3, transfer: true,
      gen(r) {
        const dV = r.pick([1000, 1500, 2000]), v = Math.sqrt((2 * QE * dV) / MXE);
        return {
          prompt: t`A gridded ion thruster ionises xenon atoms, giving ions Xe⁺ (charge $+e$, mass 131.3 u $= 2.181\times10^{-25}$ kg), then accelerates them through a potential difference of ${dV} V between its grids. How fast do the ions leave?`,
          answer: v / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((QE * dV) / MXE) / 1000, feedback: t`Kinetic energy is $\tfrac12mv^2$: $v = \sqrt{2e\Delta V/m}$.` }],
          hints: [t`Each ion gains $K = e\,\Delta V$.`, t`$v = \sqrt{2e\Delta V/m}$.`],
          teach: 'An ion engine turns voltage straight into exhaust speed: v = √(2qΔV/m).',
          explain: t`$K = e\Delta V = (1.602\times10^{-19})(${dV}) = ${tn(QE * dV)}$ J, so $v = \sqrt{\dfrac{2(${tn(QE * dV)})}{2.181\times10^{-25}}} = ${tn(v)}$ m/s $= ${tn(v / 1000)}$ km/s — about ${Math.round(v / 4500)} times the 4.5 km/s exhaust of the best chemical rockets. The price is thrust: the beam is a trickle, a fraction of a newton.`,
          visual: field({ ...plates(dV, 1, 'mm'), x: [-1.2, 1.2], y: [-0.75, 0.75], fieldLines: false, arrows: 'linear', particle: { kind: 'xenon', x: -0.48, y: 0.1, speed: 0, path: true }, notes: { points: [{ x: -0.5, y: 0.62, label: 'screen grid', color: 'ink2', r: 0.1, ldx: -60, ldy: -2 }, { x: 0.5, y: 0.62, label: 'accelerator grid', color: 'ink2', r: 0.1, ldx: 6, ldy: -2 }] } }, 'An ion (gold path) accelerated across the 1 mm gap between the grids, drawn as plates. In a thruster it flies on through holes in the second grid.'),
        };
      },
    }),
    num({
      id: 'cp-stop', difficulty: 3,
      gen(r) {
        const v0 = r.pick([2e5, 3e5]), E = r.pick([1000, 2000, 5000]), Kj = 0.5 * MP * v0 * v0, d = Kj / (QE * E), g = r6(d * 100 * 1.3);
        return {
          prompt: t`A proton moving at $${tn(v0)}$ m/s enters a region of uniform field, $${E}$ N/C, pointing straight against its motion. How far does it travel before it stops?`,
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: (2 * d) * 100, feedback: t`Kinetic energy is $\tfrac12mv^2$, not $mv^2$.` }],
          hints: [t`Its kinetic energy all turns into potential energy: $\tfrac12mv^2 = e\,\Delta V$.`, t`Over a distance $d$ against the field, $V$ rises by $Ed$.`],
          teach: 'A charge moving against a uniform field stops when its kinetic energy equals |q|Ed.',
          explain: t`$K = \tfrac12(1.673\times10^{-27})(${tn(v0)})^2 = ${tn(Kj)}$ J $= ${tn(Kj / QE)}$ eV. It stops when $eEd = K$: $d = \dfrac{K}{eE} = \dfrac{${tn(Kj / QE)}\ \text{V}}{${E}\ \text{V/m}} = ${tn(d)}$ m — then the field sends it back the way it came.`,
          visual: field({ ...plates(-E * (g / 100), g), x: [-0.58 * g, 0.58 * g], y: [-0.36 * g, 0.36 * g], fieldLines: false, arrows: 'linear', particle: { kind: 'proton', x: r6(-0.49 * g), y: 0, speed: v0, angle: 0, path: true, tmax: r6(((MP * v0) / (QE * E)) * 0.999) } }, 'The proton (gold path) enters the field from the left, through a hole in the plate (not drawn); the field (arrows) points against its motion.'),
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: 'The point P is at a potential of +200 V (taking V = 0 at the − plate). What does that tell you?',
      choices: [
        'A charge q placed at P would have potential energy q × 200 V, compared with the − plate',
        'Any charge placed at P has 200 J of potential energy',
        'The field at P is 200 V/m',
        'A 1 C charge at P would feel a force of 200 N',
      ],
      answer: 0,
      why: {
        1: 'V is energy per coulomb. A 1 nC charge at P has 200 nJ; an electron has −200 eV.',
        2: 'Field strength is how fast V changes with distance, not V itself. At P, V is 200 V whatever the field is.',
        3: 'Force goes with the field, not with V: F = qE.',
      },
      hints: ['V is potential energy per unit charge.'],
      teach: 'V is potential energy per coulomb; the field is how fast V changes with distance. They are different things.',
      explain: 'V = U/q, so a charge q at P has U = q × 200 V more potential energy than at the zero of potential: 200 J for 1 C, 200 nJ for 1 nC, −200 eV for an electron. The field at P — 50 V/cm here — is set by how fast V changes from place to place.',
      visual: ladder([['P', 200, 1.5]], 'Equipotentials (violet, every 100 V) between two plates, the field (arrows) and the point P.', 5, [100, 200, 300, 400]),
    }),
    num({
      id: 'cp-esd', difficulty: 3, transfer: true,
      gen(r) {
        const [Q, V] = r.pick([[1.5, 10], [2.2, 15], [3.0, 20]]), U = 0.5 * Q * 1e-6 * V * 1e3;
        return {
          prompt: t`A technician walking across a floor has picked up $${Q}\ \mu\text{C}$ of static charge, raising them to ${V} kV above the ground. They reach for a grounded propellant tank and a spark jumps. As charge leaves them, their potential falls in proportion to the charge that is left, so the spark carries the charge across an ever smaller voltage (the graph). How much energy does the spark release?`,
          answer: U * 1000, units: 'mJ', tol: { rel: 0.01 },
          errors: [{ value: 2 * U * 1000, feedback: 'That carries all the charge across the full voltage. The voltage falls as the charge leaves: the energy is the area under the graph, half of QV.' }],
          hints: [t`A small charge $dq$ crossing voltage $V$ releases $V\,dq$: the energy is the area under the $V$-against-charge graph.`, 'The area is a triangle: ½ × charge × starting voltage.'],
          teach: 'A charge dq falling through V releases V dq; when V falls as the charge leaves, the total is the area under V(q).',
          explain: t`The energy is $\displaystyle\int V\,dq$, the triangle under the graph: $\tfrac12QV = \tfrac12(${Q}\times10^{-6})(${V}\times10^{3}) = ${tn(U * 1000)}$ mJ. Many fuel vapours ignite with a fraction of a millijoule, which is why propellant handlers wear conductive shoes and wrist straps, and bond and ground every tank and cart: charge then drains away before it can build up.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, Q * 1.25], y: [0, V * 1.25], aspect: 'wide', xlabel: 'charge that has crossed (μC)', ylabel: 'technician’s voltage (kV)',
              curves: [{ fn: `${V}*(1 - x/${Q})`, domain: [0, Q], color: 'accent', width: 2.4 }],
              shade: [{ fn: `${V}*(1 - x/${Q})`, from: 0, to: Q, color: 'accent', alpha: 0.25 }],
            },
            caption: 'The technician’s voltage against the charge that has crossed in the spark. The shaded area, voltage × charge, is energy (kV × μC = mJ).',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §7.1–7.2 Electric Potential Energy; Electric Potential and Potential Difference', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-2-electric-potential-and-potential-difference' },
  ],
});
