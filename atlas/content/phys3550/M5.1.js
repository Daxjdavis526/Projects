// The two-body problem and reduced mass (Taylor §8.1–8.3): with an internal
// force that depends only on the separation r = r₁ − r₂, the centre of mass
// moves uniformly and r obeys μr̈ = F(r) with μ = m₁m₂/(m₁ + m₂) — one body
// of mass μ about a fixed centre. Each body traces a scaled copy of the
// relative orbit about the CM (r₁ = (m₂/M)r, r₂ = −(m₁/M)r). Worked: the
// Hulse–Taylor binary pulsar (μ, separation from Kepler III with M = m₁ + m₂,
// each star's orbit). Practice: limits of μ, barycentres (Earth–Moon,
// Pluto–Charon, Sun–Jupiter), Kepler III with the total mass, T = ½MṘ² + ½μṙ²,
// the year shortened by Earth's own mass. Transfer: the double pulsar's
// separation, the Sun's reflex wobble behind radial-velocity planet searches.
// Links (not reused): phys2210.M13.4 (Kepler's laws), gr.S27.i (Hulse–Taylor's decay).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { GM_SUN, M_SUN, conic } from './_cm3.js';

const t = String.raw;

// the Hulse–Taylor pulsar PSR B1913+16 (Weisberg & Huang 2016)
const HT = (() => {
  const mp = 1.438, mc = 1.39, M = mp + mc, mu = (mp * mc) / M, Pb = 0.322997448918 * 86400;
  const a = Math.cbrt((GM_SUN * M * Pb * Pb) / (4 * Math.PI ** 2));
  return { mp, mc, M, mu, Pb, Ph: Pb / 3600, a, ap: (a * mc) / M, ac: (a * mp) / M, aRs: a / 6.957e8 };
})();

// two bodies about their centre of mass, relative orbit e = 0.5, at eccentric anomaly s; q = m₂/m₁
function pairPic({ q = 0.4, s = 1.1, caption, alt, rel = true, cm = true, labels = true }) {
  const k1 = q / (1 + q), k2 = 1 / (1 + q), b = Math.sqrt(0.75);
  const rx = Math.cos(s) - 0.5, ry = b * Math.sin(s);
  return gpic({
    x: [-1.25, 1.05], y: [-0.8, 0.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: [`${r6(k1)}*(cos(t) - 0.5)`, `${r6(k1 * b)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.6 },
      { param: [`${r6(-k2)}*(cos(t) - 0.5)`, `${r6(-k2 * b)}*sin(t)`], t: [0, 6.2832], color: 'warn', width: 1.6 },
    ],
    points: [
      { x: r6(k1 * rx), y: r6(k1 * ry), color: 'accent', r: 9, label: labels ? 'm₁' : '', labelDx: 10, labelDy: -10 },
      { x: r6(-k2 * rx), y: r6(-k2 * ry), color: 'warn', r: 6, label: labels ? 'm₂' : '', labelDx: 8, labelDy: -10 },
      ...(cm ? [{ x: 0, y: 0, color: 'ink2', r: 3, label: labels ? 'CM' : '', labelDx: 6, labelDy: 12 }] : []),
      ...(rel && labels ? [lab(r6((k1 - k2) * rx / 2 + 0.6 * (k1 + k2) * rx / 2), r6((k1 - k2) * ry / 2 + 0.6 * (k1 + k2) * ry / 2), 'r⃗', 'gold', 12, 0)] : []),
    ],
    arrows: rel ? [{ from: [r6(-k2 * rx), r6(-k2 * ry)], to: [r6(k1 * rx), r6(k1 * ry)], color: 'gold', width: 1.4 }] : [],
  }, caption, alt || 'Two bodies orbiting their common centre of mass');
}

// two bodies on a line, sizes and spacing not to scale
function linePic({ n1, n2, R1, R2, caption }) {
  return gpic({
    x: [-0.6, 4.6], y: [-0.7, 0.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([0, 0], [4, 0], 'ink4', 1, true)],
    points: [{ x: 0, y: 0, color: 'accent', r: R1, label: n1, labelDx: -12, labelDy: 24 }, { x: 4, y: 0, color: 'ink2', r: R2, label: n2, labelDx: -12, labelDy: 20 }, lab(2, 0.14, 'd', 'ink2')],
  }, caption, 'Two bodies a distance d apart');
}

const SYS = [
  { key: 'em', name: 'Earth and the Moon', a: 'Earth', b: 'the Moon', m1: 5.9722e24, m2: 7.342e22, d: 384400, R: 6371 },
  { key: 'pc', name: 'Pluto and Charon', a: 'Pluto', b: 'Charon', m1: 1.303e22, m2: 1.586e21, d: 19596, R: 1188 },
  { key: 'sj', name: 'the Sun and Jupiter', a: 'the Sun', b: 'Jupiter', m1: M_SUN, m2: 1.89813e27, d: 778.57e6, R: 695700 },
];

export default lesson({
  id: 'phys3550.M5.1',
  title: 'The two-body problem and reduced mass',
  minutes: 15, difficulty: 3,
  intro: t`Two bodies pull on each other with a force that depends only on their separation $\vec r = \vec r_1 - \vec r_2$ — gravity between a star and a planet, or between two neutron stars. Six coordinates look hard. But the **centre of mass** feels no external force, so it simply drifts; and the separation obeys Newton's law for a *single* body of mass $\mu$ about a fixed centre. The two-body problem becomes a one-body problem — the one that the rest of this module solves — and each real body traces a shrunken copy of the relative orbit about the centre of mass.`,
  equation: t`\mu\,\ddot{\vec r} = \vec F(\vec r), \qquad \mu = \frac{m_1 m_2}{m_1 + m_2}`,
  symbols: [
    { tex: '\\vec r = \\vec r_1 - \\vec r_2', text: 'the **relative position**: the vector from body 2 to body 1, in m' },
    { tex: '\\mu', text: 'the **reduced mass**, in kg: smaller than either mass, and close to the lighter one when the other is much heavier' },
    { tex: 'm_1,\\ m_2', text: 'the two masses, in kg; $M = m_1 + m_2$ is the total' },
    { tex: '\\vec F(\\vec r)', text: 'the force body 2 exerts on body 1 (body 1 pulls back with $-\\vec F$), in N; for gravity $-Gm_1m_2\\,\\hat r/r^2$' },
    { tex: '\\ddot{\\vec r}', text: 'the relative acceleration $\\ddot{\\vec r}_1 - \\ddot{\\vec r}_2$, in m/s²' },
  ],
  why: t`Every binary star, binary pulsar and black-hole merger is a two-body problem, and every mass measured from an orbit — including the masses of the black holes LIGO hears — comes from it.`,
  visual: {
    type: 'graph',
    title: 'Two bodies, one relative orbit',
    lead: t`Body 1 (blue) and body 2 (orange) circle their centre of mass (CM) on two ellipses, always on opposite sides of it. The gold arrow is $\vec r$; it traces the **relative orbit**, which is what the reduced-mass equation describes. Move the orbit phase and watch the arrow pass through the CM.`,
    tasks: [
      t`Slide $m_2/m_1$ down to 0.05: the heavy body barely moves, and $\mu$ is almost $m_2$ — a planet about a star.`,
      t`Slide it to 1: equal masses on equal ellipses, and $\mu = m/2$.`,
      t`At any setting the two ellipses are the relative orbit shrunk by $m_2/M$ and $m_1/M$; their sizes add up to the relative orbit's.`,
    ],
    params: {
      aspect: 'wide', x: [-1.3, 1.1], y: [-0.85, 0.85], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'q', label: 'Mass ratio $m_2/m_1$', min: 0.05, max: 1, step: 0.01, value: 0.4, explain: 'Body 2 is the lighter; at 1 they are equal.' },
        { key: 's', label: 'Orbit phase', min: 0, max: 6.28, step: 0.02, value: 1.1, unit: '\\mathrm{rad}', explain: 'Where the pair is along its orbit (the eccentric anomaly: not uniform in time).' },
      ],
      curves: [
        { param: ['q/(1+q)*(cos(t) - 0.5)', 'q/(1+q)*0.866025*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 },
        { param: ['-(cos(t) - 0.5)/(1+q)', '-0.866025*sin(t)/(1+q)'], t: [0, 6.2832], color: 'warn', width: 1.6 },
      ],
      points: [
        { x: 'q/(1+q)*(cos(s) - 0.5)', y: 'q/(1+q)*0.866025*sin(s)', color: 'accent', r: 9, label: 'm₁', labelDx: 10, labelDy: -10 },
        { x: '-(cos(s) - 0.5)/(1+q)', y: '-0.866025*sin(s)/(1+q)', color: 'warn', r: 6, label: 'm₂', labelDx: 8, labelDy: -10 },
        { x: 0, y: 0, color: 'ink2', r: 3, label: 'CM', labelDx: 6, labelDy: 12 },
        { x: '0.3*(cos(s) - 0.5) + (q - 1)/(1+q)*(cos(s) - 0.5)/2', y: '0.3*0.866025*sin(s) + (q - 1)/(1+q)*0.866025*sin(s)/2', r: 0, color: 'gold', label: 'r⃗', labelDx: 12, labelDy: 0 },
      ],
      arrows: [{ from: ['-(cos(s) - 0.5)/(1+q)', '-0.866025*sin(s)/(1+q)'], to: ['q/(1+q)*(cos(s) - 0.5)', 'q/(1+q)*0.866025*sin(s)'], color: 'gold', width: 1.4 }],
      readouts: [{ label: '$\\mu/m_2$', expr: '1/(1+q)', digits: 3 }, { label: 'body 1’s orbit ÷ relative orbit', expr: 'q/(1+q)', digits: 3 }],
    },
    caption: t`Point masses, gravity only, the CM at rest. The relative orbit is an ellipse of eccentricity 0.5 (semi-major axis 1); body 1's ellipse is it scaled by $m_2/M$, body 2's by $m_1/M$ and turned through 180°.`,
  },
  example: {
    prompt: t`The Hulse–Taylor binary pulsar, PSR B1913+16, is a pulsar of $${HT.mp}\,M_\odot$ orbiting a neutron star of $${HT.mc}\,M_\odot$ every $${sci(HT.Ph, 4)}$ h. Find the reduced mass, the semi-major axis $a$ of the relative orbit, and the semi-major axis of each star's orbit about the centre of mass. ($GM_\odot = 1.327\times10^{20}$ m³/s².)`,
    visual: pairPic({ q: HT.mc / HT.mp, s: 2.2, caption: t`Two nearly equal neutron stars on nearly equal ellipses about their centre of mass. Shape schematic (the real eccentricity is 0.62).` }),
    steps: [
      { label: 'Reduce', text: t`The force depends only on $\vec r = \vec r_1 - \vec r_2$, so $\mu\ddot{\vec r} = -\dfrac{Gm_1m_2}{r^2}\hat r$. Divide by $\mu$: $\ddot{\vec r} = -\dfrac{G(m_1 + m_2)}{r^2}\hat r$. The relative orbit is a Kepler orbit about a fixed mass $M = m_1 + m_2$.` },
      { label: 'Reduced mass', text: t`$\mu = \dfrac{${HT.mp}\times${HT.mc}}{${HT.M.toFixed(3)}}\,M_\odot = ${sci(HT.mu, 4)}\,M_\odot$ — about a quarter of the total, as for any equal pair.` },
      { label: 'Kepler III', text: t`With $M$ in place of the Sun's mass: $a^3 = \dfrac{GMP^2}{4\pi^2} = \dfrac{(${HT.M.toFixed(3)})(1.327\times10^{20})(${sci(HT.Pb, 5)})^2}{4\pi^2}$, so $a = ${sci(HT.a, 3)}$ m.` },
      { label: 'Each star', text: t`$\vec r_1 = (m_2/M)\vec r$ and $\vec r_2 = -(m_1/M)\vec r$: the pulsar's orbit has $a_p = (${HT.mc}/${HT.M.toFixed(3)})a = ${sci(HT.ap, 3)}$ m and its companion's $a_c = ${sci(HT.ac, 3)}$ m. The lighter star swings wider.` },
      { label: 'Sense check', text: t`$a_p + a_c = a$ ✓. The whole binary is $${sci(HT.a / 1e9, 3)}$ million km across — ${HT.aRs.toFixed(1)} solar radii: it would fit inside the Sun, which is why it radiates gravitational waves so strongly ([gr.S27.i](#/lesson/gr.S27.i)).` },
    ],
    answer: t`$\mu = ${sci(HT.mu, 3)}\,M_\odot$; $a = ${sci(HT.a, 3)}$ m; the pulsar's orbit $${sci(HT.ap, 3)}$ m and the companion's $${sci(HT.ac, 3)}$ m about the centre of mass.`,
  },
  practice: [
    mcq({
      id: 'mu-limit', difficulty: 1,
      prompt: t`A 1000 kg satellite orbits Earth ($m_\oplus = 5.97\times10^{24}$ kg). What is the reduced mass of the pair, to three significant figures?`,
      visual: gpic({ x: [0, 10], y: [0, 1.1], xlabel: 'm₁/m₂', ylabel: 'μ/m₂', curves: [{ fn: 'x/(1+x)', color: 'accent', width: 2.4, domain: [0, 10] }], hlines: [{ y: 1, color: 'ink3' }], points: [{ x: 1, y: 0.5, color: 'warn', label: 'equal masses', labelDx: 8, labelDy: 10 }] }, t`The reduced mass as a fraction of the lighter mass $m_2$, against the mass ratio $m_1/m_2$: it climbs toward $m_2$ as the partner grows heavier.`, 'A curve rising toward 1'),
      choices: [t`$1000$ kg: the satellite's own mass`, t`$5.97\times10^{24}$ kg: Earth's mass`, t`$500$ kg: half the satellite's mass`, t`$5.97\times10^{24}$ kg plus 1000 kg`],
      answer: 0,
      why: { 1: t`$\mu$ is never larger than either mass: $\mu = m_1m_2/(m_1 + m_2) < m_2$.`, 2: t`$\mu = m/2$ holds only for **equal** masses.`, 3: t`That is the total mass $M$, which appears in Kepler's third law — not the reduced mass.` },
      hints: [t`Write $\mu = \dfrac{m_2}{1 + m_2/m_1}$ and notice how tiny $m_2/m_1$ is.`],
      teach: t`When one body is far heavier, the reduced mass is the light body's mass and the heavy one is effectively a fixed centre.`,
      explain: t`$\mu = 1000/(1 + 1.7\times10^{-22})$ kg — 1000 kg to twenty significant figures. Treating Earth as fixed is exact enough for any satellite; the reduced mass matters when the masses are comparable.`,
    }),
    num({
      id: 'barycentre', difficulty: 2,
      gen(r) {
        const S = r.pick(SYS);
        const x = (S.d * S.m2) / (S.m1 + S.m2);
        return {
          prompt: t`For ${S.name} (masses $${sci(S.m1, 4)}$ kg and $${sci(S.m2, 4)}$ kg, centres ${S.d.toLocaleString('en-US').replace(/,/g, ' ')} km apart), how far from the centre of ${S.a} is their centre of mass? Answer in km.`,
          answer: x, units: 'km', tol: { rel: 0.005 },
          errors: distinct([{ value: (S.d * S.m1) / (S.m1 + S.m2), feedback: t`That is the distance from ${S.b}. The centre of mass sits close to the **heavier** body: $x_1 = (m_2/M)\,d$.` }, { value: (S.d * S.m2) / S.m1, feedback: t`The fraction is $m_2/(m_1 + m_2)$, with the total mass below, not $m_2/m_1$.` }], x),
          hints: [t`Put the origin at the centre of mass: $m_1x_1 = m_2x_2$ with $x_1 + x_2 = d$.`, t`$x_1 = \dfrac{m_2}{m_1 + m_2}\,d$.`],
          teach: t`Each body sits a fraction of the separation from the centre of mass equal to the *other* body's share of the total mass.`,
          explain: t`$x_1 = \dfrac{m_2}{M}d = ${sci(x, 4)}$ km. ${S.a === 'Earth' ? 'That is inside Earth (radius 6371 km), about 1700 km below the surface: Earth wobbles monthly about a point within itself.' : S.a === 'Pluto' ? 'That is outside Pluto (radius 1188 km): Pluto and Charon both circle a point in empty space.' : 'That is just outside the Sun’s surface (radius 695 700 km).'}`,
          visual: linePic({ n1: S.a.replace('the ', ''), n2: S.b.replace('the ', ''), R1: 12, R2: S.key === 'pc' ? 8 : 6, caption: t`The two bodies and the line between their centres. Sizes and spacing not to scale; the centre of mass is what you are finding.` }),
        };
      },
    }),
    num({
      id: 'binary-period', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1.2, 1.5, 2, 3]), m2 = r.pick([0.4, 0.6, 0.8, 1]), a = r.pick([2, 5, 10, 20]);
        const T = Math.sqrt(a ** 3 / (m1 + m2)), mu = (m1 * m2) / (m1 + m2);
        return {
          prompt: t`Two stars of $${m1}\,M_\odot$ and $${m2}\,M_\odot$ orbit each other with a relative orbit of semi-major axis ${a} AU. What is the orbital period in years? (In these units Kepler's third law reads $T^2 = a^3/M$ with $T$ in years, $a$ in AU and $M$ in solar masses.)`,
          answer: T, units: 'yr', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(a ** 3 / m1), feedback: t`The relative orbit is a Kepler orbit about the **total** mass $m_1 + m_2$, not the heavier star alone.` }, { value: Math.sqrt(a ** 3 / mu), feedback: t`$\mu$ cancels: $\mu\ddot{\vec r} = -Gm_1m_2\hat r/r^2$ gives $\ddot{\vec r} = -G(m_1 + m_2)\hat r/r^2$. The total mass sets the period.` }], T),
          hints: [t`Divide $\mu\ddot{\vec r} = -Gm_1m_2\hat r/r^2$ by $\mu$: which mass is left?`, t`$T = \sqrt{a^3/(m_1 + m_2)}$.`],
          teach: t`Kepler's third law for a pair uses the total mass: $T^2 = 4\pi^2a^3/[G(m_1 + m_2)]$.`,
          explain: t`$T = \sqrt{${a}^3/${r6(m1 + m2)}} = ${sci(T, 3)}$ yr. This is how binary stars are weighed: measure $T$ and $a$, get $m_1 + m_2$; the ratio of the two stars' orbit sizes then splits it.`,
          visual: pairPic({ q: m2 / m1, s: 1.6, rel: true, caption: t`The two stars about their centre of mass (shape schematic). The gold arrow traces the relative orbit, whose semi-major axis is $a$.` }),
        };
      },
    }),
    expr({
      id: 'ke-split', difficulty: 3,
      prompt: t`Write $\vec r_1 = \vec R + \dfrac{m_2}{M}\vec r$ and $\vec r_2 = \vec R - \dfrac{m_1}{M}\vec r$, with $\vec R$ the centre of mass. The kinetic energy $\tfrac12m_1\dot r_1^2 + \tfrac12m_2\dot r_2^2$ then splits into $\tfrac12M\dot R^2 + \tfrac12\,\square\,\dot r^2$ (the cross terms cancel). What goes in the box? Type $m_1$ as \`m_1\` and $m_2$ as \`m_2\`.`,
      answer: 'm_1*m_2/(m_1 + m_2)', answerTeX: t`\frac{m_1m_2}{m_1 + m_2}`,
      vars: { m_1: [0.5, 5], m_2: [0.5, 5] },
      errors: [{ answer: 'm_1 + m_2', feedback: t`The total mass goes with the centre of mass's motion, $\tfrac12M\dot R^2$. Collect the $\dot r^2$ terms: $\tfrac12m_1(m_2/M)^2 + \tfrac12m_2(m_1/M)^2$.` }, { answer: '(m_1 + m_2)/2', feedback: t`That is the average mass. Collect $\tfrac12\big[m_1m_2^2 + m_2m_1^2\big]/M^2\,\dot r^2$ and factor out $m_1m_2$.` }, { answer: 'm_1*m_2', feedback: t`Divide by the total mass: $m_1m_2(m_1 + m_2)/M^2 = m_1m_2/M$.` }],
      hints: [t`Square: $\dot r_1^2 = \dot R^2 + 2(m_2/M)\dot{\vec R}\cdot\dot{\vec r} + (m_2/M)^2\dot r^2$, and similarly for body 2 with $-m_1/M$.`, t`The cross terms are $m_1(m_2/M) - m_2(m_1/M) = 0$. The $\dot r^2$ terms give $\tfrac12\big[m_1m_2^2 + m_2m_1^2\big]/M^2$.`],
      teach: t`In centre-of-mass and relative coordinates the kinetic energy separates, with the reduced mass carrying the relative motion.`,
      explain: t`$\tfrac12\dfrac{m_1m_2(m_2 + m_1)}{M^2}\dot r^2 = \tfrac12\mu\dot r^2$. With $U = U(r)$ the Lagrangian is $\tfrac12M\dot R^2 + \big[\tfrac12\mu\dot r^2 - U(r)\big]$: $\vec R$ is cyclic ([M4.4](#/lesson/phys3550.M4.4)) — total momentum is conserved — and the bracket is one particle of mass $\mu$.`,
      visual: gpic({ x: [-0.3, 3.1], y: [-0.2, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', points: [{ x: 0, y: 0, color: 'ink3', r: 3, label: 'O', labelDx: -14, labelDy: 8 }, { x: 2.6, y: 1.5, color: 'accent', r: 8, label: 'm₁', labelDx: 10, labelDy: -6 }, { x: 1, y: 0.8, color: 'warn', r: 6, label: 'm₂', labelDx: -24, labelDy: -6 }, { x: 2.03, y: 1.25, color: 'ink2', r: 3, label: 'CM', labelDx: 8, labelDy: 14 }, lab(1.15, 0.5, 'R⃗', 'good', 10, 8), lab(1.7, 1.24, 'r⃗', 'gold', 0, -12)], arrows: [{ from: [0, 0], to: [2.03, 1.25], color: 'good' }, { from: [1, 0.8], to: [2.6, 1.5], color: 'gold' }] }, t`Positions from an origin O: the centre of mass $\vec R$ and the relative vector $\vec r$ from body 2 to body 1. Not to scale.`, 'Two bodies, their centre of mass and the vectors R and r'),
    }),
    multi({
      id: 'true-statements', difficulty: 2,
      prompt: t`An isolated pair of stars, of unequal mass, orbit each other under gravity. Which statements are true?`,
      visual: pairPic({ q: 0.35, s: 0.7, rel: false, caption: t`Two stars of unequal mass about their centre of mass. Shape schematic.` }),
      choices: [
        t`Both stars have the same orbital period`,
        t`The heavier star moves on the smaller ellipse, and the ratio of their sizes is $m_2/m_1$`,
        t`The centre of mass moves at constant velocity (or stays at rest)`,
        t`The lighter star orbits the heavier star's centre, which stays fixed`,
        t`The reduced mass is larger than the lighter star's mass`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`Both stars move about the centre of mass; only the **relative** vector behaves like an orbit about a fixed centre.`, 4: t`$\mu = m_2/(1 + m_2/m_1)$ is always smaller than $m_2$.` },
      hints: [t`$\vec r_1 = (m_2/M)\vec r$ and $\vec r_2 = -(m_1/M)\vec r$ in the CM frame.`],
      teach: t`Each body traces the relative orbit scaled by the other body's share of the mass, in step, on opposite sides of the centre of mass.`,
      explain: t`Both positions are fixed multiples of the one vector $\vec r(t)$, so they share its period and stay on opposite sides of the CM; their sizes are in the ratio $(m_2/M) : (m_1/M) = m_2 : m_1$. With no external force the CM moves uniformly.`,
    }),
    num({
      id: 'year-shorter', difficulty: 3,
      gen(r) {
        const B = r.pick([
          { name: 'Earth (with the Moon)', m: 5.9722e24 + 7.342e22, T: 31558149.8, unit: 's', scale: 1 },
          { name: 'Jupiter', m: 1.89813e27, T: 374335776, unit: 'h', scale: 3600 },
        ]);
        const dT = (0.5 * B.T * B.m) / M_SUN / B.scale;
        return {
          prompt: t`${B.name} has mass $${sci(B.m, 4)}$ kg and a sidereal orbital period of $${sci(B.T, 6)}$ s. The Sun's mass is $${sci(M_SUN, 6)}$ kg. By how much does including the planet's own mass in Kepler's third law shorten the period, compared with treating the planet as a massless test body on the same orbit? Answer in ${B.unit === 's' ? 'seconds' : 'hours'}.`,
          answer: dT, units: B.unit, tol: { rel: 0.01 },
          errors: distinct([{ value: (B.T * B.m) / M_SUN / B.scale, feedback: t`$T \propto (M + m)^{-1/2}$: a small fractional change in the mass changes $T$ by **half** as much.` }], dT),
          hints: [t`$T = 2\pi\sqrt{a^3/G(M + m)}$. Compare with $2\pi\sqrt{a^3/GM}$.`, t`$(1 + m/M)^{-1/2} \approx 1 - \tfrac12\,m/M$, so $\Delta T \approx \tfrac12(m/M)\,T$.`],
          teach: t`Using $M + m$ rather than $M$ shortens a period by the fraction $\tfrac12 m/M$.`,
          explain: t`$m/M = ${sci(B.m / M_SUN, 3)}$, so $\Delta T = \tfrac12(m/M)T = ${sci(dT, 3)}$ ${B.unit === 's' ? 's' : 'h'}. ${B.unit === 's' ? 'Under a minute a year — but a modern ephemeris tracks Earth to better than that.' : 'Days per orbit: for Jupiter the planet-as-test-body approximation is visibly wrong.'}`,
          visual: gpic({ x: [-1.5, 1.5], y: [-1.1, 1.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 }, { param: ['0.08*cos(t)', '0.08*sin(t)'], t: [0, 6.2832], color: 'gold', width: 1.2, dash: true }], points: [{ x: 0.06, y: -0.05, color: 'gold', r: 9, label: 'Sun', labelDx: 12, labelDy: 10 }, { x: -0.75, y: 0.66, color: 'accent', r: 5, label: 'planet', labelDx: 8, labelDy: -10 }, { x: 0, y: 0, color: 'ink2', r: 2.5 }] }, t`The planet and the Sun both circle their common centre of mass (dot); the Sun's small circle is exaggerated enormously.`, 'A planet and the Sun orbiting their centre of mass'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-double-pulsar', difficulty: 3, transfer: true,
      gen(r) {
        const sys = r.pick([
          { name: 'the double pulsar PSR J0737−3039A/B', m1: 1.338, m2: 1.249, P: 0.10225156248 * 86400 },
          { name: 'the Hulse–Taylor binary PSR B1913+16', m1: 1.438, m2: 1.39, P: 0.322997448918 * 86400 },
        ]);
        const M = sys.m1 + sys.m2, a = Math.cbrt((GM_SUN * M * sys.P ** 2) / (4 * Math.PI ** 2)) / 1e3;
        return {
          prompt: t`In ${sys.name} two neutron stars of $${sys.m1}\,M_\odot$ and $${sys.m2}\,M_\odot$ orbit each other every $${sci(sys.P, 5)}$ s. What is the semi-major axis of their relative orbit, in km? ($GM_\odot = 1.327\times10^{20}$ m³/s².)`,
          answer: a, units: 'km', tol: { rel: 0.005 },
          errors: distinct([{ value: a / Math.cbrt(M / sys.m1), feedback: t`The relative orbit feels the **total** mass: $a^3 = G(m_1 + m_2)P^2/4\pi^2$.` }, { value: (a * sys.m2) / M, feedback: t`That is one star's orbit about the centre of mass. The relative orbit is the sum of both.` }], a),
          hints: [t`Kepler's third law with $M = m_1 + m_2$.`, t`$a = \big[G(m_1 + m_2)P^2/4\pi^2\big]^{1/3}$; convert to km at the end.`],
          teach: t`The separation of a binary follows from Kepler's third law with the total mass.`,
          explain: t`$a = \big[(${r6(M)})(1.327\times10^{20})(${sci(sys.P, 5)})^2/4\pi^2\big]^{1/3} = ${sci(a, 3)}$ km. Such tight, fast orbits are relativistic laboratories: their periastra advance by degrees per year (the GR effect behind Mercury's 43″ per century, [M5.5](#/lesson/phys3550.M5.5)).`,
          visual: pairPic({ q: sys.m2 / sys.m1, s: 2.6, caption: t`Two neutron stars about their centre of mass. Shape schematic; the gold arrow traces the relative orbit.` }),
        };
      },
    }),
    num({
      id: 'cp-wobble', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([
          { name: 'Jupiter', m: 1.89813e27, v: 13.07 },
          { name: 'Saturn', m: 5.6832e26, v: 9.68 },
          { name: 'Earth', m: 5.9722e24, v: 29.78 },
        ]);
        const vs = (P.v * 1e3 * P.m) / (M_SUN + P.m);
        return {
          prompt: t`Astronomers find planets round other stars by the star's **reflex wobble** about the centre of mass. ${P.name} ($${sci(P.m, 4)}$ kg) moves at ${P.v} km/s relative to the Sun ($${sci(M_SUN, 4)}$ kg) on a nearly circular orbit. How fast does the Sun move about their common centre of mass, in m/s?`,
          answer: vs, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (P.v * 1e3 * M_SUN) / (M_SUN + P.m), feedback: t`That is the planet's own speed about the centre of mass. The Sun's share is the **planet's** fraction of the mass: $v_\odot = (m/M)\,v$.` }],
          hints: [t`$\vec r_\odot = -(m/M)\vec r$, so its speed is $(m/M)$ times the relative speed.`],
          teach: t`Each body moves at the relative velocity scaled by the other's share of the total mass.`,
          explain: t`$v_\odot = \dfrac{m}{M_\odot + m}\,v = ${sci(vs, 3)}$ m/s. ${P.name === 'Earth' ? 'About 9 cm/s — the precision needed to find an Earth twin, and a few times beyond today’s best spectrographs.' : 'Spectrographs that resolve about a metre per second detect such wobbles routinely.'}`,
          visual: pairPic({ q: 0.15, s: 1.3, rel: false, caption: t`A star and its planet about their centre of mass; the star's small ellipse is its reflex wobble. Mass ratio exaggerated.` }),
        };
      },
    }),
    mcq({
      id: 'cp-which-mass', difficulty: 2,
      prompt: t`For the relative motion of a binary under gravity, $\mu\ddot{\vec r} = -\dfrac{Gm_1m_2}{r^2}\hat r$. Treated as one body orbiting a fixed centre, this is a particle of mass ___ orbiting a fixed mass ___.`,
      visual: pairPic({ q: 0.6, s: 3.6, caption: t`Two bodies about their centre of mass; the gold arrow is the relative vector, which obeys the one-body equation.` }),
      choices: [t`$\mu$; $M = m_1 + m_2$`, t`$m_2$; $m_1$`, t`$\mu$; $m_1$`, t`$M$; $\mu$`],
      answer: 0,
      why: { 1: t`That is the fixed-Sun approximation, good only when $m_2 \ll m_1$.`, 2: t`$Gm_1m_2 = G\mu M$, not $G\mu m_1$: the effective central mass is the total.`, 3: t`The roles are reversed: the inertia of the relative motion is $\mu$, and the attracting mass is $M$.` },
      hints: [t`Show that $m_1m_2 = \mu M$.`],
      teach: t`The relative orbit is a test particle of mass $\mu$ about a fixed mass $M = m_1 + m_2$.`,
      explain: t`$Gm_1m_2 = G\mu M$, so $\mu\ddot{\vec r} = -G\mu M\hat r/r^2$: inertia $\mu$, attracted by a fixed mass $M$. Its energy and angular momentum, $E = \tfrac12\mu\dot r^2 - G\mu M/r$ and $\ell = \mu r^2\dot\phi$, are what the effective potential of [M5.2](#/lesson/phys3550.M5.2) uses.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §8.1–8.3: the two-body problem, CM and relative coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'J. M. Weisberg & Y. Huang, ApJ 829, 55 (2016): PSR B1913+16 masses and orbit, arXiv 1606.02744', url: 'https://arxiv.org/abs/1606.02744' },
    { label: 'M. Kramer et al., Phys. Rev. X 11, 041050 (2021): the double pulsar, arXiv 2112.06795', url: 'https://arxiv.org/abs/2112.06795' },
  ],
});
