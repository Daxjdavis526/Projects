// Charged particles in a uniform magnetic field: circles of radius mv/(|q|B)
// whose period 2πm/(|q|B) does not depend on the speed, helices when v has a
// part along B, and the devices built on them — the velocity selector, the
// mass spectrometer, the cyclotron — out to the Hall thruster.
import { lesson, mcq, num } from '../../src/core/content.js';
import { QE, ME, MP, U, DEG, COL, PARTICLES, tn, r4, r6, lab, seg2, circ2, fieldMarks, page } from './_magnet.js';

const t = String.raw;
const TAU = 2 * Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
// one particle's circle seen along B (a schematic: no axes, no numbers)
const circlePic = (species, v, B, caption, extra = {}) => ({
  type: 'em-lorentz',
  params: { view: 'top', species, v, B, bdir: 'in', play: false, t: 0.3, turns: 1, readouts: [], axes: false, grid: false, ...extra },
  caption,
});
// a helix seen from the side: front half-turns solid, back half-turns dashed, one pitch marked
function helixPic(caption, { pitchMark = true, charge = -1 } = {}) {
  const p = 2.4, R = 0.8, n = 3, k = p / (2 * Math.PI), x0 = -n * p / 2;
  const curves = [seg2([x0 - 0.6, 0], [-x0 + 0.6, 0], { color: 'ink4', width: 1, dash: true })];
  for (let j = 0; j < 2 * n; j++) {
    curves.push({ param: [`${r6(x0)} + ${r6(k)}*t`, `${R}*cos(t)`], t: [r6(j * Math.PI), r6((j + 1) * Math.PI)], color: charge > 0 ? COL.pos : COL.neg, width: 2.2, ...(j % 2 ? { dash: true } : {}) });
  }
  const xc = x0 + 2 * p;          // a crest two turns along
  return page({
    x: [x0 - 0.9, -x0 + 0.9], y: [-1.75, 1.75],
    curves,
    arrows: [
      { from: [r6(x0 - 0.8), -1.45], to: [r6(-x0 + 0.8), -1.45], color: COL.B, label: 'B', labelDx: 6, labelDy: 0 },
      ...(pitchMark ? [{ from: [r6(xc - p), 1.2], to: [r6(xc), 1.2], color: 'ink2' }, { from: [r6(xc), 1.2], to: [r6(xc - p), 1.2], color: 'ink2' }] : []),
    ],
    points: [
      { x: r6(x0 + 0.5 * p), y: r6(R * Math.cos(Math.PI)), r: 6, color: charge > 0 ? COL.pos : COL.neg },
      ...(pitchMark ? [lab(xc - p / 2, 1.5, 'one pitch, p', 'ink2')] : []),
    ],
    caption,
  });
}
// a velocity selector for protons: plates as long as half a turn, three speeds
function selectorPic(E, B, caption) {
  const v0 = E / B, W = (QE * B) / MP, L = (Math.PI * v0) / W, h = 1.3 * (2 * 0.25 * v0) / W;
  const unit = L >= 0.02 ? 'cm' : 'mm', u = unit === 'cm' ? 0.01 : 0.001;
  return {
    type: 'em-lorentz',
    params: {
      view: 'top', B, E, bdir: 'out', unit, plates: { x0: 0, x1: r6(L / u), h: r6(h / u) }, play: false, t: 0.25, turns: 1,
      particles: [
        { species: 'proton', v: v0, at: [0, 0], dir: 0, label: 'just right' },
        { species: 'proton', v: 1.25 * v0, at: [0, 0], dir: 0, label: 'faster', labelAt: 0.8, labelDy: 18 },
        { species: 'proton', v: 0.75 * v0, at: [0, 0], dir: 0, label: 'slower', labelAt: 0.8, labelDy: -16 },
      ],
      arrows: ['FB', 'FE'], readouts: [], axes: false, grid: false,
    },
    caption,
  };
}
// a mass spectrometer: ions entering a field that points out of the page
function spectroPic(ions, B, unit, caption, axes = false) {
  return {
    type: 'em-lorentz',
    params: {
      view: 'top', B, bdir: 'out', detector: true, unit, play: false, t: 0.5,
      particles: ions.map(([m, v, label]) => ({ species: { q: 1, m, name: label }, v, label })),
      arrows: [], readouts: [], ...(axes ? {} : { axes: false, grid: false }),
    },
    caption,
  };
}
// a cyclotron seen from above: two dees, the field into the page, the spiral path
function cyclotronPic(caption) {
  const g = 0.14, R = 1.6;
  return page({
    x: [-2.6, 2.6], y: [-2.05, 1.85],
    curves: [
      circ2(-g / 2, 0, R, { color: 'ink2', a0: Math.PI / 2, a1: (3 * Math.PI) / 2 }), seg2([-g / 2, -R], [-g / 2, R]),
      circ2(g / 2, 0, R, { color: 'ink2', a0: -Math.PI / 2, a1: Math.PI / 2 }), seg2([g / 2, -R], [g / 2, R]),
      { polar: '0.1 + 0.06*theta', theta: [0, 7 * Math.PI], color: COL.pos, width: 2 },
      seg2([-1.42, 0], [-1.42, -1.95], { color: COL.pos, width: 2 }),
    ],
    points: [
      ...fieldMarks(-1.1, 1.1, -1.1, 1.1, 4, 4, 'in', { skip: (x, y) => Math.abs(x) < 0.3 }),
      { x: 0, y: 0, r: 4, color: COL.pos },
      lab(-1.85, 1.25, 'dee', 'ink2'), lab(1.85, 1.25, 'dee', 'ink2'),
      lab(0, 1.75, '~ alternating voltage across the gap', 'ink3'),
      lab(-1.42, -1.95, 'beam out', COL.pos, -40, 0),
    ],
    arrows: [{ from: [-1.42, -1.5], to: [-1.42, -1.9], color: COL.pos }],
    caption,
  });
}
// a Hall thruster's annular channel, seen looking into its exit
function hallPic(caption) {
  const r1 = 1.0, r2 = 1.6, rm = 1.3;
  const arrows = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8, c = Math.cos(a), s = Math.sin(a);
    arrows.push({ from: [r4(1.06 * c), r4(1.06 * s)], to: [r4(1.54 * c), r4(1.54 * s)], color: COL.B });
  }
  const a1 = 2.2;
  arrows.push({ from: [r4(rm * Math.cos(a1 - 0.25)), r4(rm * Math.sin(a1 - 0.25))], to: [r4(rm * Math.cos(a1)), r4(rm * Math.sin(a1))], color: COL.I });
  return page({
    x: [-2.7, 2.7], y: [-1.85, 1.85],
    curves: [circ2(0, 0, r1, { color: 'ink2' }), circ2(0, 0, r2, { color: 'ink2' }), circ2(0, 0, rm, { color: COL.I, width: 2.2, a0: 0.5, a1 })],
    points: [
      ...[0, 1, 2, 3, 4, 5].map((k) => lab(rm * Math.cos(k * Math.PI / 3 - 0.6), rm * Math.sin(k * Math.PI / 3 - 0.6), '•', COL.E)),
      lab(2.15, 0.55, 'B (radial)', COL.B), lab(2.15, -0.75, 'E (out of the page)', COL.E), lab(-2.0, 1.5, 'electron drift', COL.I),
    ],
    arrows,
    caption,
  });
}

// isotope pairs for the mass spectrometer: masses in u
const ISOTOPES = [[12.000, 13.003, '¹²C⁺', '¹³C⁺', 'carbon-12 and carbon-13'], [19.992, 21.991, '²⁰Ne⁺', '²²Ne⁺', 'neon-20 and neon-22'], [34.969, 36.966, '³⁵Cl⁺', '³⁷Cl⁺', 'chlorine-35 and chlorine-37'], [235.04, 238.05, '²³⁵U⁺', '²³⁸U⁺', 'uranium-235 and uranium-238']];

// the worked example: an e/m tube
const EX = (() => {
  const V = 250, B = 1.0e-3, v = Math.sqrt((2 * QE * V) / ME), r = (ME * v) / (QE * B), T = (TAU * ME) / (QE * B);
  return { V, B, v, r, T, em: (2 * V) / (B * B * r * r) };
})();

export default lesson({
  id: 'phys2220.B1.2',
  title: 'Charged particles in magnetic fields',
  minutes: 13, difficulty: 2,
  intro: t`A magnetic force is always perpendicular to the velocity, so it never changes a particle’s speed — only its direction. A charge moving across a uniform field therefore goes round a **circle**, with the magnetic force as the centripetal force, $|q|vB = mv^2/r$:

$$r = \frac{mv}{|q|B}, \qquad T = \frac{2\pi r}{v} = \frac{2\pi m}{|q|B}$$

Faster particles make bigger circles, but **every particle of the same kind takes the same time per turn**, whatever its speed — the fact that makes the cyclotron work. Velocity along $\vec B$ is left alone, so in general the path is a **helix** wound round the field lines. And an electric field across $\vec B$ makes the circles drift sideways at $E/B$: the trap that holds electrons in a Hall thruster.`,
  symbols: [
    { tex: 'r', text: 'the radius of the circle, in m' },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: 'v', text: 'its speed **across** the field, in m/s. If $\\vec v$ is at angle $\\theta$ to $\\vec B$, only $v_\\perp = v\\sin\\theta$ goes round the circle' },
    { tex: '|q|', text: 'the size of its charge, in C: $e = 1.602\\times10^{-19}$ C for a proton or an electron' },
    { tex: 'B', text: 'the field strength, in tesla (T)' },
    { tex: 'T', text: 'the period: the time for one turn, in s. Its inverse $f = 1/T = |q|B/(2\\pi m)$ is the **cyclotron frequency**' },
    { tex: 'v_\\parallel', text: 'the part of the velocity along $\\vec B$, $v\\cos\\theta$: it carries the particle along the field, a **pitch** $p = v_\\parallel T$ per turn' },
    { tex: 'E/B', text: 'for crossed electric and magnetic fields: the speed at which the electric and magnetic forces cancel (a **velocity selector**), and the speed of the sideways drift' },
  ],
  why: 'Mass spectrometers weigh molecules this way, accelerators steer their beams with it, and Earth’s field traps the radiation belts and funnels the aurora down its lines.',
  visual: {
    type: 'em-lorentz',
    title: 'Circles, helices, and a period that ignores speed',
    lead: t`The field $\vec B$ (teal) points to the right. The particle’s velocity (green) and the magnetic force (violet) turn together; the dashed line is the path ahead. The readouts give the radius, the time per turn and the pitch — and the speed, which never changes.`,
    tasks: [
      'Double the speed: the circle doubles in size, but the time per turn stays exactly the same.',
      'Double B: the radius and the period both halve.',
      'Lower the angle from 90°: the circle stretches into a helix along B, and the speed still never changes.',
      'Switch to the electron: it circles the other way, 1836 times faster (the picture rescales).',
    ],
    params: { view: '3d', species: 'proton', choose: ['proton', 'electron'], v: 2e6, pitch: 75, B: 0.5, turns: 3, sliders: ['v', 'B', 'pitch'], readouts: ['r', 'T', 'f', 'pitch', 'speed'] },
    caption: 'Exact, non-relativistic motion in a uniform field. The picture keeps one scale while you move the sliders, so the circle visibly grows and shrinks; changing the particle rescales it. Arrow lengths are in proportion to |v| and |F|. Drag to rotate.',
  },
  example: {
    prompt: t`In the lab’s $e/m$ apparatus, electrons leave an electron gun after falling through $250$ V and enter a uniform $1.00$ mT field made by a pair of coils, moving at right angles to it. Find their speed, the radius of their circle, and the time for one turn. ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg)`,
    visual: circlePic('electron', EX.v, EX.B, 'The electron’s circle, seen along the field (into the page), with the radius marked. To scale; the arrows show directions.', { showR: true, axes: true, grid: true, unit: 'cm', readouts: ['r', 'T'] }),
    steps: [
      { label: 'Speed', text: t`Energy from the gun: $eV = \tfrac12 m_ev^2$, so $v = \sqrt{2eV/m_e} = \sqrt{\dfrac{2(1.602\times10^{-19})(250)}{9.109\times10^{-31}}} = ${tn(EX.v)}$ m/s — about 3% of the speed of light, so Newtonian mechanics is fine.` },
      { label: 'Radius', text: t`The magnetic force is the centripetal force: $evB = m_ev^2/r$, so $r = \dfrac{m_ev}{eB} = \dfrac{(9.109\times10^{-31})(${tn(EX.v)})}{(1.602\times10^{-19})(1.00\times10^{-3})} = ${tn(EX.r)}$ m $= ${tn(EX.r * 100)}$ cm.` },
      { label: 'Period', text: t`$T = \dfrac{2\pi r}{v} = \dfrac{2\pi m_e}{eB} = ${tn(EX.T)}$ s $= ${tn(EX.T * 1e9)}$ ns. The speed cancelled: a faster electron would make a bigger circle in exactly the same time.` },
      { label: 'Sense check', text: t`A circle ${tn(EX.r * 200, 2)} cm across fits inside the glass bulb, and you can see it glow where the electrons hit gas atoms. Turned round, the same equations give $e/m = 2V/(B^2r^2) = ${tn(EX.em)}$ C/kg — how this experiment measures the electron’s charge-to-mass ratio.` },
    ],
    answer: t`$v = ${tn(EX.v)}$ m/s, $r = ${tn(EX.r * 100)}$ cm, $T = ${tn(EX.T * 1e9)}$ ns.`,
  },
  practice: [
    num({
      id: 'radius', difficulty: 2,
      gen(r) {
        const key = r.pick(['proton', 'alpha', 'electron']), P = PARTICLES[key];
        const [v, B] = key === 'electron' ? [r.pick([2e6, 5e6, 1.5e7]), r.pick([1e-3, 5e-3, 0.02])] : [r.pick([1.5e5, 4e5, 1.2e6, 3e6]), r.pick([0.1, 0.25, 0.6, 1.2])];
        const Q = Math.abs(P.q), rad = (P.m * v) / (Q * B);
        const Bt = B < 0.01 ? t`${tn(B * 1e3)}\ \text{mT}` : t`${tn(B)}\ \text{T}`;
        const errors = [{ value: ((Q * B) / (P.m * v)) * 100, feedback: t`That is $|q|B/(mv)$, upside down: $r = mv/(|q|B)$.` }];
        if (key === 'alpha') errors.push({ value: ((P.m * v) / (QE * B)) * 100, feedback: t`An alpha particle carries charge $2e$: use $|q| = 3.204\times10^{-19}$ C.` });
        return {
          prompt: t`${P.An} moves at $${tn(v)}$ m/s at right angles to a uniform $${Bt}$ magnetic field. What is the radius of its circle? ($${P.mTeX}$, $e = 1.602\times10^{-19}$ C)`,
          visual: circlePic(key, v, B, `The ${P.name}’s circle, seen along the field (into the page). A schematic: the size is not shown.`),
          answer: rad * 100, units: 'cm', tol: { rel: 0.01 }, errors,
          hints: [t`Set the magnetic force equal to the centripetal force: $|q|vB = mv^2/r$.`, t`$r = \dfrac{mv}{|q|B}$ with $|q| = ${tn(Q, 4)}$ C${B < 0.01 ? ' and $B$ in tesla' : ''}.`],
          teach: 'In a uniform field, the magnetic force supplies the centripetal force: r = mv/(|q|B).',
          explain: t`$r = \dfrac{mv}{|q|B} = \dfrac{(${tn(P.m, 4)})(${tn(v)})}{(${tn(Q, 4)})(${tn(B)})} = ${tn(rad)}$ m $= ${tn(rad * 100)}$ cm.`,
        };
      },
    }),
    mcq({
      id: 'double-speed', difficulty: 2,
      prompt: 'A proton circles in a uniform magnetic field. If it were moving twice as fast (still across the field), what would happen to the radius of its circle and to the time it takes to go round once?',
      visual: circlePic('proton', 1e6, 0.2, 'The proton’s circle, seen along the field (into the page).'),
      choices: [
        'The radius doubles; the time per turn stays the same',
        'The radius doubles and so does the time per turn',
        'The radius doubles; the time per turn halves',
        'The radius stays the same; the time per turn halves',
      ],
      answer: 0,
      why: {
        1: 'Twice the distance at twice the speed takes the same time. T = 2πr/v, and r grows in step with v.',
        2: 'A faster proton does cover the circle faster — but the circle is twice as big, and the two effects cancel exactly.',
        3: 'The radius is set by the speed: r = mv/(|q|B). A faster particle is harder to bend, so its circle is bigger.',
      },
      hints: [t`Write both: $r = mv/(|q|B)$ and $T = 2\pi r/v$.`, t`Substitute $r$ into $T$: what happens to $v$?`],
      teach: 'The radius is proportional to the speed, so the period 2πm/(|q|B) does not depend on the speed at all.',
      explain: t`$r = mv/(|q|B)$ doubles, and $T = 2\pi r/v = 2\pi m/(|q|B)$ does not depend on $v$. A cyclotron exploits exactly this: as its particles speed up, their circles grow, but they keep pace with a fixed-frequency voltage.`,
    }),
    num({
      id: 'cyclotron', difficulty: 2,
      gen(r) {
        const [name, q, m, mTeX] = r.pick([['protons', QE, MP, 'm_p = 1.673\\times10^{-27}\\ \\text{kg}'], ['deuterons', QE, 3.344e-27, 'm_d = 3.344\\times10^{-27}\\ \\text{kg}'], ['alpha particles', 2 * QE, 6.645e-27, 'm_\\alpha = 6.645\\times10^{-27}\\ \\text{kg},\\ q = 2e']]);
        const B = r.pick([0.8, 1.2, 1.5, 1.8]), f = (q * B) / (TAU * m);
        return {
          prompt: t`A cyclotron uses a $${B}$ T field to accelerate ${name}. At what frequency must the voltage across its dees alternate to give them a kick every half turn? ($${mTeX}$, $e = 1.602\times10^{-19}$ C)`,
          visual: cyclotronPic('A cyclotron from above. The field points into the page; each time a particle crosses the gap it gains energy, so its circles grow — but every half-turn takes the same time. Schematic.'),
          answer: f / 1e6, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: (q * B) / m / 1e6, feedback: t`That is the angular frequency $\omega = |q|B/m$ in rad/s. The voltage’s frequency is $f = \omega/2\pi$.` }, { value: ((TAU * m) / (q * B)) * 1e6, feedback: t`That is the period in μs, not the frequency. $f = 1/T$.` }],
          hints: [t`The particles must cross the gap once every half turn, so the voltage must reverse at the cyclotron frequency $f = 1/T$.`, t`$f = \dfrac{|q|B}{2\pi m}$.`],
          teach: 'The cyclotron frequency f = |q|B/(2πm) does not depend on speed, so one fixed frequency keeps the particles in step as they speed up.',
          explain: t`$f = \dfrac{|q|B}{2\pi m} = \dfrac{(${tn(q, 4)})(${B})}{2\pi(${tn(m, 4)})} = ${tn(f)}$ Hz $= ${tn(f / 1e6)}$ MHz — a radio frequency, which is why cyclotrons are driven by radio transmitters.`,
        };
      },
    }),
    num({
      id: 'selector', difficulty: 2,
      gen(r) {
        const E = r.pick([1.5e4, 2.4e4, 3.6e4, 5.0e4]), B = r.pick([0.06, 0.12, 0.2, 0.3]), v = E / B;
        return {
          prompt: t`In a velocity selector, an electric field of $${tn(E)}$ V/m and a magnetic field of $${B.toPrecision(2)}$ T cross at right angles, both perpendicular to a beam of protons. At what speed do protons pass straight through?`,
          visual: selectorPic(E, B, 'A velocity selector: plates make E (up the page), and B points out of the page. The electric force (gold) and the magnetic force (violet) on a proton at the right speed cancel; faster and slower protons are bent aside. Schematic.'),
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: B / E, feedback: t`Upside down: $qE = qvB$ gives $v = E/B$.` }, { value: E * B, feedback: t`Set the forces equal, $qE = qvB$, and solve for $v$: divide, don’t multiply.` }],
          hints: ['The beam goes straight when the electric and magnetic forces on it cancel.', t`$qE = qvB$, so $v = E/B$.`],
          teach: 'In crossed fields the electric force qE and the magnetic force qvB cancel for just one speed, v = E/B, whatever the charge or mass.',
          explain: t`$v = \dfrac{E}{B} = \dfrac{${tn(E)}}{${B.toPrecision(2)}} = ${tn(v)}$ m/s. Faster protons feel a bigger magnetic force and bend one way; slower ones bend the other. The charge cancels, so electrons of that speed pass too.`,
        };
      },
    }),
    num({
      id: 'spectrometer', difficulty: 3,
      gen(r) {
        const [m1, m2, l1, l2, names] = r.pick(ISOTOPES), v = r.pick([5e4, 8e4, 1.2e5]), B = r.pick([0.1, 0.2, 0.3, 0.5]);
        const x1 = (2 * m1 * U * v) / (QE * B), x2 = (2 * m2 * U * v) / (QE * B), dx = x2 - x1;
        const unit = x2 >= 1 ? 'm' : 'cm';
        return {
          prompt: t`After a velocity selector, singly charged ions of ${names} all move at $${tn(v)}$ m/s. They enter a $${B.toFixed(2)}$ T field at right angles through a slit and land on a detector after half a circle. How far apart do the two isotopes land? (Masses ${m1.toFixed(3)} u and ${m2.toFixed(3)} u; $1\ \text{u} = 1.661\times10^{-27}$ kg, $e = 1.602\times10^{-19}$ C.)`,
          visual: spectroPic([[m1, v, l1], [m2, v, l2]], B, unit, 'A mass spectrometer: the ions turn through half a circle in a field pointing out of the page and land on the detector. Schematic: the gap between the landing points is what you are finding.'),
          answer: dx * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: (dx / 2) * 100, feedback: 'That is the difference in radius. Each ion lands a whole diameter, 2r, from the slit.' }],
          hints: [t`Each ion lands a diameter $2r = 2mv/(eB)$ from the slit.`, t`The separation is $\Delta x = \dfrac{2\,\Delta m\,v}{eB}$, with $\Delta m = ${tn(m2 - m1, 4)}$ u $= ${tn((m2 - m1) * U, 4)}$ kg.`],
          teach: 'At equal speed, the landing distance 2mv/(qB) is proportional to the mass, so isotopes land apart in proportion to their mass difference.',
          explain: t`$\Delta x = \dfrac{2\,\Delta m\,v}{eB} = \dfrac{2(${tn((m2 - m1) * U, 4)})(${tn(v)})}{(1.602\times10^{-19})(${B.toFixed(2)})} = ${tn(dx)}$ m $= ${tn(dx * 100)}$ cm. Spectrometers like this, scaled up as the “calutrons”, separated uranium-235 in the 1940s.`,
        };
      },
    }),
    num({
      id: 'pitch', difficulty: 3,
      gen(r) {
        const key = r.pick(['electron', 'proton']), P = PARTICLES[key];
        const [v, B] = key === 'electron' ? [r.pick([3e6, 6e6, 1e7]), r.pick([2e-3, 5e-3, 0.01])] : [r.pick([2e5, 5e5, 1e6]), r.pick([0.05, 0.1, 0.2])];
        const th = r.pick([30, 45, 60, 75]), T = (TAU * P.m) / (QE * B), p = v * Math.cos(th * DEG) * T;
        const Bt = B < 0.01 ? t`${tn(B * 1e3)}\ \text{mT}` : t`${tn(B)}\ \text{T}`;
        return {
          prompt: t`${P.An} moves at $${tn(v)}$ m/s at $${th}^\circ$ to a uniform $${Bt}$ field, so its path is a helix. How far along the field does it travel during one turn? ($${P.mTeX}$, $e = 1.602\times10^{-19}$ C)`,
          visual: helixPic(`The ${P.name}’s helix seen from the side, with the field (teal) along its axis. Solid: the near side of each turn; dashed: the far side. Schematic: the real pitch depends on the angle.`, { charge: Math.sign(P.q) }),
          answer: p * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [
            ...(th !== 45 ? [{ value: v * Math.sin(th * DEG) * T * 100, feedback: t`The distance along the field uses the velocity component *along* $\vec B$: $v_\parallel = v\cos\theta$.` }] : []),
            { value: v * T * 100, feedback: t`Only the part of the velocity along the field, $v\cos\theta$, carries the particle along it.` },
          ],
          hints: [t`The period is $T = 2\pi m/(|q|B)$, whatever the angle.`, t`During one period the particle moves $p = v_\parallel T = (v\cos ${th}^\circ)T$ along $\vec B$.`],
          teach: 'A helix combines a circle (from v⊥) with steady motion along B (from v∥): the pitch is v∥T.',
          explain: t`$T = \dfrac{2\pi m}{eB} = ${tn(T)}$ s and $v_\parallel = v\cos ${th}^\circ = ${tn(v * Math.cos(th * DEG))}$ m/s, so $p = v_\parallel T = ${tn(p)}$ m $= ${tn(p * 100)}$ cm.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`An electron moves at $3.0\times10^{6}$ m/s at $30^\circ$ to a uniform $2.0$ mT field. A student writes: “$r = \dfrac{m_ev}{eB} = \dfrac{(9.109\times10^{-31})(3.0\times10^{6})}{(1.602\times10^{-19})(2.0\times10^{-3})} = 8.5$ mm.” What is wrong?`,
      visual: helixPic('The electron’s helix seen from the side, the field (teal) along its axis. Solid: the near side of each turn; dashed: the far side. Schematic.', { pitchMark: false }),
      choices: [
        t`Only the velocity across the field goes round the circle: $r = m_ev\sin 30^\circ/(eB) = 4.3$ mm`,
        t`It should use $v\cos 30^\circ$: $r = 7.4$ mm`,
        t`An electron’s charge is negative, so the radius comes out negative`,
        'A particle moving at an angle to the field does not go round a circle, so it has no radius',
      ],
      answer: 0,
      why: {
        1: t`$v\cos 30^\circ$ is the part along $\vec B$, which the field leaves alone; it sets how fast the helix advances, not its radius.`,
        2: t`A radius is a length: the formula uses the size of the charge, $|q|$. The sign decides only which way the electron circles.`,
        3: 'Seen along the field the path is still a circle — the helix is that circle drawn out along B — and its radius uses v⊥.',
      },
      hints: ['Split the velocity into a part along B and a part across it. Which part does the magnetic force bend?', t`$v_\perp = v\sin\theta$.`],
      teach: 'Only the velocity component perpendicular to B goes round the circle: r = mv⊥/(|q|B) with v⊥ = v sin θ.',
      explain: t`The part along $\vec B$, $v\cos 30^\circ$, is untouched; only $v_\perp = v\sin 30^\circ = 1.5\times10^{6}$ m/s circles. So $r = m_ev_\perp/(eB) = 4.3$ mm, half the student’s answer.`,
    }),
    mcq({
      id: 'drift', difficulty: 3,
      prompt: t`An electric field points up the page and a magnetic field points out of the page. A proton and an electron are released from rest side by side. Which way does each one drift, on average?`,
      visual: {
        type: 'em-lorentz',
        params: {
          view: 'top', B: 0.1, E: 1e4, bdir: 'out', unit: 'cm', x: [-3, 3], y: [-1.6, 1.6], play: false, t: 0, path: 'none',
          particles: [{ species: 'proton', v: 0, at: [-0.8, 0.5], label: 'proton', labelAt: 0, labelDy: 18 }, { species: 'electron', v: 0, at: [0.8, -0.5], label: 'electron', labelAt: 0, labelDy: -16 }],
          arrows: ['F'], arrowsOn: [0, 1], readouts: [], axes: false, grid: false,
        },
        caption: 'The two particles at the moment they are released, with the force on each (violet): only the electric force, qE, since neither is moving yet. Gold arrows: E; ⊙: B out of the page.',
      },
      choices: [
        'Both drift to the right, at the same average speed E/B',
        'The proton drifts to the right and the electron to the left',
        'The proton drifts up the page and the electron down, along the electric forces',
        'Neither drifts: each just bobs up and down where it started',
      ],
      answer: 0,
      why: {
        1: 'Flipping the charge flips both forces: the electron is pushed down, then bent the other way round, and the two flips cancel. The drift is along E × B for every charge.',
        2: 'The electric force starts each moving, but the magnetic force then turns them sideways; on average neither moves along E.',
        3: 'Once they move, the magnetic force bends them sideways; they trace arches that step steadily along E × B.',
      },
      hints: [t`Follow the proton: E starts it moving up; then $q\vec v\times\vec B$ bends it. Which way?`, t`Every charge drifts along $\vec E\times\vec B$, at speed $E/B$. Here $\vec E$ is up the page and $\vec B$ out of it.`],
      teach: 'In crossed E and B fields every charged particle drifts along E × B at speed E/B, whatever its charge or mass.',
      explain: t`The proton accelerates up, the magnetic force bends it to the right, it slows to rest and repeats: a chain of arches moving right. The electron starts down and is bent the opposite way round — also ending up moving right. Both drift along $\vec E\times\vec B$ (here, to the right) at $E/B$; only the arches differ in size, by the mass ratio 1836.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hall-ion', difficulty: 3, transfer: true,
      gen(r) {
        const BmT = r.pick([10, 15, 20]), v = r.pick([1.5e4, 1.8e4, 2.0e4]), m = 131.3 * U, B = BmT * 1e-3;
        const rad = (m * v) / (QE * B);
        return {
          prompt: t`A Hall-effect thruster — the kind that keeps many satellites on station — accelerates xenon ions through a ring-shaped channel about 2 cm wide, crossed by a radial magnetic field of about $${BmT}$ mT. What is the radius of the circle into which that field would bend a singly charged xenon ion (mass $131.3$ u $= 2.181\times10^{-25}$ kg) moving at $${tn(v)}$ m/s across it? ($e = 1.602\times10^{-19}$ C)`,
          visual: hallPic('Looking into the exit of a Hall thruster’s ring-shaped channel: the magnetic field is radial (teal) and the electric field points out of the page, along the thrust (gold •). Electrons, trapped in millimetre circles, drift round the ring along E × B (blue). Schematic, not to scale.'),
          answer: rad, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (m * v) / (QE * B * 1e3), feedback: t`Convert the field to tesla: $${BmT}$ mT $= ${tn(B)}$ T.` }],
          hints: [t`Use $r = mv/(|q|B)$ with $B$ in tesla.`, t`$r = \dfrac{(2.181\times10^{-25})(${tn(v)})}{(1.602\times10^{-19})(${tn(B)})}$.`],
          teach: 'Heavy, slow ions have huge radii in a field that traps light electrons in tiny circles: r = mv/(|q|B).',
          explain: t`$r = \dfrac{mv}{eB} = ${tn(rad)}$ m — about a hundred times the width of the channel, so the field barely bends the ions: they fly straight out and make the thrust. An electron with a few tens of eV, in the same field, circles with a radius of about a millimetre and stays trapped, drifting round the ring along $\vec E\times\vec B$. That trapped electron cloud is what holds the accelerating voltage across the channel.`,
        };
      },
    }),
    mcq({
      id: 'cp-voltage', difficulty: 2,
      prompt: t`In the $e/m$ apparatus, the electrons are accelerated from rest through a voltage $V$ and then circle in a fixed magnetic field. If $V$ is made four times larger, the radius of the circle becomes:`,
      visual: circlePic('electron', EX.v, EX.B, 'The electrons’ circle, seen along the field.'),
      choices: ['Twice as large', 'Four times as large', 'The same', 'Half as large'],
      answer: 0,
      why: {
        1: t`The radius follows the speed, and the speed grows only as $\sqrt V$: $\tfrac12 mv^2 = eV$.`,
        2: 'That is true of the period, which does not depend on speed. The radius does.',
        3: 'A faster electron is harder to bend: its circle grows.',
      },
      hints: [t`First the speed: $eV = \tfrac12 mv^2$. Then the radius: $r = mv/(eB)$.`],
      teach: 'r = mv/(eB) with v = √(2eV/m), so the radius grows as the square root of the accelerating voltage.',
      explain: t`$v = \sqrt{2eV/m}$ doubles when $V$ is four times larger, and $r = mv/(eB)$ doubles with it.`,
    }),
    num({
      id: 'cp-which-ion', difficulty: 3,
      gen(r) {
        const [A, name] = r.pick([[14.003, 'nitrogen-14'], [15.995, 'oxygen-16'], [27.977, 'silicon-28'], [39.962, 'argon-40']]);
        const B = r.pick([0.1, 0.15, 0.2]), v = r.pick([4e4, 6e4]);
        const x = +((2 * A * U * v) / (QE * B)).toPrecision(3), m = (QE * B * x) / (2 * v) / U;
        return {
          prompt: t`In a mass spectrometer, singly charged ions moving at $${tn(v)}$ m/s enter a $${B.toFixed(2)}$ T field and land $${tn(x * 100)}$ cm from the entrance slit, after half a circle. What is the ion’s mass, in atomic mass units? ($1\ \text{u} = 1.661\times10^{-27}$ kg, $e = 1.602\times10^{-19}$ C)`,
          visual: spectroPic([[A, v, 'ion']], B, 'cm', 'The unknown ion’s half circle in a field pointing out of the page, landing on the detector.', true),
          answer: m, units: 'u', tol: { rel: 0.01 },
          errors: [{ value: m * 2, feedback: t`The landing distance is the diameter: use $r = ${tn(x * 50)}$ cm, half of it.` }],
          hints: [t`The ion lands a diameter from the slit, so $r = x/2$.`, t`$m = \dfrac{eBr}{v}$, then divide by $1.661\times10^{-27}$ kg.`],
          teach: 'A spectrometer weighs an ion from its radius: m = |q|Br/v.',
          explain: t`$r = ${tn(x * 50)}$ cm, so $m = \dfrac{eBr}{v} = ${tn(m * U)}$ kg $= ${tn(m)}$ u — ${name}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §11.4', url: 'https://openstax.org/books/university-physics-volume-2/pages/11-4-motion-of-a-charged-particle-in-a-magnetic-field' },
    { label: 'OpenStax University Physics Vol. 2, §11.8', url: 'https://openstax.org/books/university-physics-volume-2/pages/11-8-applications-of-magnetic-forces-and-fields' },
    { label: 'Goebel & Katz, Fundamentals of Electric Propulsion (JPL), ch. 7: Hall thrusters', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
