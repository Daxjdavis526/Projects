// Orbital transfers and Hohmann manoeuvres (Taylor §8.8; Curtis ch. 6):
// an impulsive tangential burn changes v at one point, and vis-viva gives the
// new semi-major axis. The Hohmann transfer between coplanar circles: two
// prograde burns on an ellipse tangent to both, Δv₁ = √(μ/r₁)(√(2r₂/(r₁+r₂)) − 1),
// Δv₂ = √(μ/r₂)(1 − √(2r₁/(r₁+r₂))), flight time half the ellipse's period.
// Worked: LEO (200 km) → GEO, 2.45 + 1.48 = 3.93 km/s in 5.26 h (plus the
// honest plane-change caveat from 28.5°). Practice: totals to MEO/GPS/the
// Moon's distance, skipping burn 2, apogee raising, flight time, bi-elliptic
// savings beyond r₂/r₁ ≈ 11.94. Transfer: Earth → Mars/Venus/Jupiter Δv and
// flight times with the Sun's μ; phasing to catch the ISS (slow down first).
// Links (not reused): prog.P1.3 (the hohmann() function, LEO 300 km → GEO).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { sci, r6, gpic, distinct } from './_cm.js';
import { GM_E, GM_SUN, R_EQ, R_GEO, AU, A_MARS, visviva, hohmann, bielliptic, hohmannPic, ring, disc } from './_cm3.js';

const t = String.raw;

const EX = (() => {
  const r1 = R_EQ + 200e3, h = hohmann(GM_E, r1, R_GEO);
  const inc = (28.5 * Math.PI) / 180;
  const dv2p = Math.sqrt(h.va ** 2 + h.vc2 ** 2 - 2 * h.va * h.vc2 * Math.cos(inc));
  return { r1, ...h, dv2p };
})();

// Sun-centred transfer between circles of radius 1 (Earth, on +x) and q (AU); inward when q < 1
function helioPic(q, caption) {
  const lo = Math.min(1, q), hi = Math.max(1, q), p = (2 * lo * hi) / (lo + hi), e = (hi - lo) / (hi + lo);
  const sgn = q > 1 ? '+' : '-';
  const R = hi * 1.12;
  return gpic({
    x: [-R, R], y: [-R, R], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [ring(1, 'accent', 1.4), ring(q, 'warn', 1.4), { polar: `${r6(p)}/(1 ${sgn} ${r6(e)}*cos(theta))`, theta: [0, 3.1416], color: 'gold', width: 2.2 }],
    points: [{ x: 0, y: 0, color: 'gold', r: 7 }, { x: 1, y: 0, color: 'accent', r: 5, label: 'Earth', labelDx: 8, labelDy: 12 }, { x: r6(-q), y: 0, color: 'warn', r: 5, label: 'arrival', labelDx: q > 1 ? -50 : 8, labelDy: 12 }],
  }, caption, 'A transfer half-ellipse between two planetary orbits around the Sun');
}

const MU_KM = '398600.4418';
// a whole number of km as TeX with thin-space thousands
const km = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
const A = '(6.378137 + h/1000)';

export default lesson({
  id: 'phys3550.M5.4',
  title: 'Orbital transfers and Hohmann manoeuvres',
  minutes: 18, difficulty: 3,
  intro: t`A rocket burn lasting minutes is, on the scale of an orbit, an instant: it changes the velocity at one point and leaves the position alone. Vis-viva ([M5.3](#/lesson/phys3550.M5.3)) then says what new orbit you are on — the new speed fixes the new semi-major axis. To move between two circular orbits in the same plane, the **Hohmann transfer** fires prograde once to enter an ellipse that just touches both circles, coasts half an orbit, and fires prograde again to circularize. Its two burns, $\Delta v_1$ and $\Delta v_2$, are the currency of mission design: every one costs propellant by the rocket equation.`,
  equation: t`\Delta v_1 = \sqrt{\frac{\mu}{r_1}}\left(\sqrt{\frac{2r_2}{r_1 + r_2}} - 1\right), \qquad \Delta v_2 = \sqrt{\frac{\mu}{r_2}}\left(1 - \sqrt{\frac{2r_1}{r_1 + r_2}}\right)`,
  symbols: [
    { tex: '\\mu = GM', text: 'the central body’s gravitational parameter, in m³/s² — Earth $3.986\\times10^{14}$, the Sun $1.327\\times10^{20}$' },
    { tex: 'r_1,\\ r_2', text: 'the radii of the starting and target circular orbits, measured from the centre of the body, in m' },
    { tex: '\\Delta v_1', text: 'the first burn: from circular speed $\\sqrt{\\mu/r_1}$ to the transfer ellipse’s periapsis speed, in m/s' },
    { tex: '\\Delta v_2', text: 'the second burn, half an orbit later: from the ellipse’s apoapsis speed up to circular speed $\\sqrt{\\mu/r_2}$, in m/s' },
    { tex: 'a_t = \\tfrac12(r_1 + r_2)', text: 'the transfer ellipse’s semi-major axis; the coast takes half its period, $\\pi\\sqrt{a_t^3/\\mu}$' },
  ],
  why: t`Every satellite raised to geostationary orbit and every spacecraft sent to Mars flies a variant of this transfer; its $\Delta v$ budget decides how much of the rocket is payload.`,
  visual: {
    type: 'graph',
    title: 'A Hohmann transfer planner',
    lead: t`Earth (to scale) at the centre, a parking orbit, a target orbit, and the transfer half-ellipse (gold) that touches both. The readouts are the two burns and the coast time, from vis-viva with Earth's real $\mu$.`,
    tasks: [
      t`Start at the defaults (200 km to geostationary): $2.45 + 1.48 = 3.93$ km/s, coasting just over 5 hours.`,
      t`Pull the target in to a GPS orbit (26.6 thousand km): both burns shrink, and the second shrinks faster.`,
      t`Push the target out to 60 thousand km: $\Delta v_1$ keeps growing but $\Delta v_2$ starts to **fall** — far out, circular orbits are slow and the transfer arrives nearly at their speed.`,
    ],
    params: {
      aspect: 'wide', x: [-66, 66], y: [-66, 66], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'h', label: 'Parking altitude', min: 160, max: 2000, step: 10, value: 200, unit: '\\mathrm{km}', explain: 'Height of the starting circular orbit above Earth’s equatorial radius (6378 km).' },
        { key: 'b', label: 'Target radius $r_2$', min: 8, max: 60, step: 0.002, value: 42.164, unit: '\\mathrm{thousand\\ km}', explain: 'From Earth’s centre: 26.6 is GPS, 42.164 geostationary.' },
      ],
      shade: [disc(6.378137)],
      curves: [
        { param: [`${A}*cos(t)`, `${A}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4 },
        { param: ['b*cos(t)', 'b*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4 },
        { polar: `2*${A}*b/(${A} + b)/(1 + (b - ${A})/(b + ${A})*cos(theta))`, theta: [0, 3.1416], color: 'gold', width: 2.4 },
      ],
      points: [{ x: A, y: 0, color: 'warn', r: 5, label: 'burn 1', labelDx: 8, labelDy: 12 }, { x: '-b', y: 0, color: 'warn', r: 5, label: 'burn 2', labelDx: -52, labelDy: 12 }],
      readouts: [
        { label: '$\\Delta v_1$', expr: `abs(sqrt(${MU_KM}/(1000*${A}))*(sqrt(2*b/(${A} + b)) - 1))`, unit: '\\mathrm{km/s}', digits: 3 },
        { label: '$\\Delta v_2$', expr: `abs(sqrt(${MU_KM}/(1000*b))*(1 - sqrt(2*${A}/(${A} + b))))`, unit: '\\mathrm{km/s}', digits: 3 },
        { label: 'coast', expr: `pi*sqrt((500*(${A} + b))^3/${MU_KM})/3600`, unit: '\\mathrm{h}', digits: 3 },
      ],
    },
    caption: t`Distances in thousands of km, to scale. Impulsive burns, coplanar circular orbits, Earth a point mass (no drag, no oblateness). Real launches to geostationary orbit also tilt the orbit's plane, which costs more.`,
  },
  example: {
    prompt: t`A satellite sits in a 200 km parking orbit ($r_1 = ${sci(EX.r1 / 1e3, 5)}$ km). Plan a Hohmann transfer to geostationary orbit ($r_2 = 42\,164$ km): both burns, the total, and the coast time. ($\mu = 3.986\times10^{14}$ m³/s².)`,
    visual: hohmannPic({ r1: EX.r1 / 1e6, r2: R_GEO / 1e6, body: R_EQ / 1e6, caption: t`Earth, the parking and geostationary orbits, and the transfer half-ellipse, to scale (thousands of km). Both burns are prograde.` }),
    steps: [
      { label: 'Circular speeds', text: t`$v_{c1} = \sqrt{\mu/r_1} = ${sci(EX.vc1 / 1e3, 4)}$ km/s and $v_{c2} = \sqrt{\mu/r_2} = ${sci(EX.vc2 / 1e3, 4)}$ km/s.` },
      { label: 'The transfer ellipse', text: t`It touches both circles, so $r_p = r_1$, $r_a = r_2$ and $a_t = (r_1 + r_2)/2 = ${sci(EX.at / 1e3, 5)}$ km. Vis-viva: $v_p = \sqrt{\mu(2/r_1 - 1/a_t)} = ${sci(EX.vp / 1e3, 4)}$ km/s and $v_a = ${sci(EX.va / 1e3, 4)}$ km/s.` },
      { label: 'Burns', text: t`$\Delta v_1 = v_p - v_{c1} = ${sci(EX.dv1 / 1e3, 3)}$ km/s at perigee; $\Delta v_2 = v_{c2} - v_a = ${sci(EX.dv2 / 1e3, 3)}$ km/s at apogee. Total $${sci(EX.dv / 1e3, 3)}$ km/s.` },
      { label: 'Coast', text: t`Half the ellipse's period: $\pi\sqrt{a_t^3/\mu} = ${sci(EX.tof / 3600, 3)}$ h.` },
      { label: 'Sense check', text: t`Both burns speed the satellite up, yet it ends slower (${sci(EX.vc2 / 1e3, 3)} against ${sci(EX.vc1 / 1e3, 3)} km/s): climbing out of the well trades kinetic for potential energy. The total, 3.93 km/s, is less than the drop in circular speed, ${sci((EX.vc1 - EX.vc2) / 1e3, 3)} km/s. From Cape Canaveral the orbit must also be tilted by 28.5°; folding that into the apogee burn makes it $${sci(EX.dv2p / 1e3, 3)}$ km/s, not ${sci(EX.dv2 / 1e3, 3)}.` },
    ],
    answer: t`$\Delta v_1 = ${sci(EX.dv1 / 1e3, 3)}$ km/s, $\Delta v_2 = ${sci(EX.dv2 / 1e3, 3)}$ km/s, total $${sci(EX.dv / 1e3, 3)}$ km/s, coasting $${sci(EX.tof / 3600, 3)}$ h.`,
  },
  practice: [
    num({
      id: 'total-dv', difficulty: 2,
      gen(r) {
        const h1 = r.pick([200, 300, 400, 500]);
        const T = r.pick([{ name: 'a GPS orbit', r: 26560 }, { name: 'a medium-Earth orbit of radius 14 440 km (an O3b-style constellation)', r: 14440 }, { name: 'the Moon’s distance', r: 384400 }]);
        const r1 = R_EQ + h1 * 1e3, h = hohmann(GM_E, r1, T.r * 1e3), tot = h.dv / 1e3;
        return {
          prompt: t`What total $\Delta v$ does a Hohmann transfer need from a ${h1} km circular parking orbit to a circular orbit at ${T.name}${T.r === 384400 ? ' (384 400 km from Earth’s centre; ignore the Moon’s own gravity)' : T.r === 26560 ? ' (26 560 km from Earth’s centre)' : ''}? Answer in km/s.`,
          answer: tot, units: 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: h.dv1 / 1e3, feedback: t`That is only the first burn. Without $\Delta v_2$ the satellite falls back toward its parking orbit every period.` }, { value: (h.vc1 - h.vc2) / 1e3, feedback: t`That is the difference of the two circular speeds — but the transfer climbs, trading speed for height, so it costs something else: compute both burns with vis-viva.` }], tot),
          hints: [t`$a_t = (r_1 + r_2)/2$; get $v_p$ and $v_a$ from vis-viva, and the circular speeds from $\sqrt{\mu/r}$.`, t`$\Delta v_1 = v_p - v_{c1}$, $\Delta v_2 = v_{c2} - v_a$; add them.`],
          teach: t`A Hohmann transfer costs two prograde burns, each from vis-viva: onto the ellipse, then off it.`,
          explain: t`$\Delta v_1 = ${sci(h.dv1 / 1e3, 3)}$ km/s and $\Delta v_2 = ${sci(h.dv2 / 1e3, 3)}$ km/s, total $${sci(tot, 3)}$ km/s.`,
          visual: hohmannPic({ r1: r1 / 1e6, r2: T.r / 1e3, body: T.r > 1e5 ? 0 : R_EQ / 1e6, labels: false, caption: t`The parking orbit, the target orbit and the transfer half-ellipse, to scale${T.r > 1e5 ? ' (Earth too small to show)' : ', Earth shaded'}.` }),
        };
      },
    }),
    mcq({
      id: 'skip-burn-2', difficulty: 2,
      prompt: t`A satellite performs burn 1 of a Hohmann transfer to geostationary orbit, but burn 2 fails. What orbit is it left on?`,
      visual: hohmannPic({ r1: EX.r1 / 1e6, r2: R_GEO / 1e6, body: R_EQ / 1e6, caption: t`The planned transfer (to scale, thousands of km): burn 1 at perigee, burn 2 at apogee.` }),
      choices: [t`The whole transfer ellipse: it returns to the 200 km height every 10.5 hours`, t`A circular orbit at geostationary height, slightly too slow`, t`It falls back to Earth after reaching apogee`, t`An orbit that drifts gradually outward to geostationary height`],
      answer: 0,
      why: { 1: t`Without burn 2 nothing changes its velocity at apogee; it is on a Kepler ellipse, which closes.`, 2: t`Its perigee is still 200 km above the surface: it swings back past Earth (drag there will slowly lower it, but it does not crash on the first pass).`, 3: t`Free Kepler orbits do not drift: with no force but gravity, it retraces the same ellipse.` },
      hints: [t`After burn 1, what forces act? What does a body under gravity alone do?`, t`A closed Kepler ellipse passes through the point where the burn happened, every period.`],
      teach: t`An impulsive burn sets a new Kepler orbit that passes through the burn point; it repeats until the next burn.`,
      explain: t`The ellipse has perigee at the burn point (200 km) and apogee at 42 164 km, with period $2\pi\sqrt{a_t^3/\mu} \approx ${sci((2 * EX.tof) / 3600, 3)}$ h. This is a geostationary transfer orbit (GTO) — where many launchers deliberately leave satellites, letting the satellite's own motor do burn 2.`,
    }),
    num({
      id: 'raise-apogee', difficulty: 2,
      gen(r) {
        const h1 = r.pick([300, 400, 500]), h2 = r.pick([1000, 2000, 5000]);
        const r1 = R_EQ + h1 * 1e3, r2 = R_EQ + h2 * 1e3, a = (r1 + r2) / 2;
        const dv = visviva(GM_E, r1, a) - Math.sqrt(GM_E / r1);
        return {
          prompt: t`A spacecraft is in a circular orbit ${h1} km up. What single prograde burn raises its apogee (on the far side of the orbit) to ${h2} km altitude? Answer in m/s. (Earth's equatorial radius 6378 km.)`,
          answer: dv, units: 'm/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(GM_E / r1) - Math.sqrt(GM_E / r2), feedback: t`That is the difference of circular speeds. One burn makes an ellipse: compute its perigee speed with vis-viva.` }], dv),
          hints: [t`The new orbit's perigee is the burn point, $r_1$, and its apogee is $r_2$.`, t`$\Delta v = \sqrt{\mu(2/r_1 - 1/a)} - \sqrt{\mu/r_1}$ with $a = (r_1 + r_2)/2$.`],
          teach: t`A tangential burn changes the orbit's far side: prograde raises the opposite apsis.`,
          explain: t`$a = ${sci(a / 1e3, 5)}$ km; $v_p = ${sci(visviva(GM_E, r1, a), 5)}$ m/s against the circular $${sci(Math.sqrt(GM_E / r1), 5)}$ m/s, so $\Delta v = ${sci(dv, 3)}$ m/s.`,
          visual: hohmannPic({ r1: r1 / 1e6, r2: r2 / 1e6, body: R_EQ / 1e6, labels: false, burns: false, caption: t`The circular orbit and the target apogee height (to scale, thousands of km); the gold ellipse is the orbit after the burn.` }),
        };
      },
    }),
    num({
      id: 'coast-time', difficulty: 2,
      gen(r) {
        const h1 = r.pick([200, 400, 600]), r2 = r.pick([20200 + 6378, 42164, 100000]);
        const h = hohmann(GM_E, R_EQ + h1 * 1e3, r2 * 1e3), T = h.tof / 3600;
        return {
          prompt: t`How long does the coast of a Hohmann transfer take, from a ${h1} km circular orbit to a circular orbit $${km(r2)}$ km from Earth's centre? Answer in hours.`,
          answer: T, units: 'h', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * T, feedback: t`The coast is **half** the transfer ellipse: perigee to apogee.` }, { value: (Math.PI * Math.sqrt((r2 * 1e3) ** 3 / GM_E)) / 3600, feedback: t`Use the transfer ellipse's semi-major axis $(r_1 + r_2)/2$, not the target radius.` }], T),
          hints: [t`The transfer ellipse has $a_t = (r_1 + r_2)/2$.`, t`Coast time $= \tfrac12\times2\pi\sqrt{a_t^3/\mu}$.`],
          teach: t`A Hohmann coast is half the period of the transfer ellipse.`,
          explain: t`$a_t = ${sci(h.at / 1e3, 5)}$ km, so the coast is $\pi\sqrt{a_t^3/\mu} = ${sci(T, 3)}$ h.`,
          visual: hohmannPic({ r1: (R_EQ + h1 * 1e3) / 1e6, r2: r2 / 1e3, body: R_EQ / 1e6, labels: false, caption: t`The transfer (to scale, thousands of km): the coast is the gold half from burn 1 to burn 2.` }),
        };
      },
    }),
    num({
      id: 'bielliptic', difficulty: 3,
      gen(r) {
        const R = r.pick([15, 20, 30]), k = r.pick([2, 3]);
        const r1 = 7000e3, r2 = R * r1, rb = k * r2;
        const ho = hohmann(GM_E, r1, r2), be = bielliptic(GM_E, r1, r2, rb);
        const save = ho.dv - be.dv;
        return {
          prompt: t`From a circular orbit of radius 7000 km to one of $${km(r2 / 1e3)}$ km ($r_2/r_1 = ${R}$): a Hohmann transfer costs $${sci(ho.dv, 4)}$ m/s. A **bi-elliptic** transfer instead climbs to $r_b = ${km(rb / 1e3)}$ km on one ellipse, burns there to raise its perigee to $r_2$, and circularizes on the way down. How much $\Delta v$ does it save, in m/s?`,
          answer: save, units: 'm/s', tol: { rel: 0.02 },
          errors: [{ value: be.dv, feedback: t`That is the bi-elliptic total. The question asks for the saving: Hohmann total minus bi-elliptic total.` }],
          hints: [t`Three burns: at $r_1$ onto an ellipse $(r_1, r_b)$; at $r_b$ from that ellipse onto $(r_2, r_b)$; at $r_2$ down to circular. Each from vis-viva.`, t`Burn 3 is a **retrograde** braking burn: the second ellipse arrives at its perigee $r_2$ faster than circular speed.`],
          teach: t`For large $r_2/r_1$ (above about 11.94), going higher first and braking can beat Hohmann — at the cost of far more time.`,
          explain: t`The burns are $${sci(be.dv1, 4)}$, $${sci(be.dv2, 4)}$ and $${sci(Math.abs(be.dv3), 4)}$ m/s, total $${sci(be.dv, 4)}$ m/s: a saving of $${sci(save, 3)}$ m/s. The price is time: ${sci(be.tof / ho.tof, 3)} times as long. It works because burns far out are cheap: there, small changes in speed move the perigee a long way.`,
          visual: gpic({ x: [-rb * 1.05e-6, r2 * 1.15e-6], y: [r6(-Math.sqrt(r2 * rb) * 1.08e-6), r6(Math.sqrt(r2 * rb) * 1.08e-6)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [ring(r1 / 1e6, 'ink3', 1.2), ring(r2 / 1e6, 'ink3', 1.2), { polar: `${r6((2 * r1 * rb) / (r1 + rb) / 1e6)}/(1 + ${r6((rb - r1) / (rb + r1))}*cos(theta))`, theta: [0, 3.1416], color: 'gold', width: 2 }, { polar: `${r6((2 * r2 * rb) / (r2 + rb) / 1e6)}/(1 + ${r6((rb - r2) / (rb + r2))}*cos(theta))`, theta: [3.1416, 6.2832], color: 'violet', width: 2 }], points: [{ x: r6(r1 / 1e6), y: 0, color: 'warn', r: 4 }, { x: r6(-rb / 1e6), y: 0, color: 'warn', r: 4, label: 'rb', labelDx: 8, labelDy: -10 }, { x: r6(r2 / 1e6), y: 0, color: 'warn', r: 4 }] }, t`The bi-elliptic route, to scale (thousands of km): out on the gold ellipse, back on the violet one. The tiny inner circle is the start.`, 'Two half-ellipses forming a bi-elliptic transfer'),
        };
      },
    }),
    multi({
      id: 'true-of-hohmann', difficulty: 2,
      prompt: t`Which statements about raising a satellite from a low circular orbit to a high one by a Hohmann transfer are true?`,
      visual: hohmannPic({ r1: 1, r2: 3, labels: true, caption: t`A Hohmann transfer from radius 1 to radius 3 (schematic).` }),
      choices: [t`Both burns are prograde (they speed the satellite up)`, t`The satellite ends up moving more slowly than it started`, t`The coast lasts half the transfer ellipse's period`, t`Burn 2 is retrograde, because the final orbit is slower`, t`The total $\Delta v$ equals the difference between the two circular speeds`],
      answer: [0, 1, 2],
      why: { 3: t`At apogee the transfer ellipse is slower than the circular orbit there ($v_a < \sqrt{\mu/r_2}$), so burn 2 must speed it up.`, 4: t`They are different numbers: for 200 km → GEO the burns total 3.93 km/s while the circular speeds differ by 4.71 km/s.` },
      hints: [t`Compare $v_a$ with $\sqrt{\mu/r_2}$ using vis-viva: which is bigger?`],
      teach: t`Raising an orbit takes two speed-ups, yet the higher circle is slower: the climb converts kinetic energy into potential.`,
      explain: t`Both burns are prograde, the coast is half an ellipse, and the final circular speed $\sqrt{\mu/r_2}$ is lower than the start's. The kinetic energy the burns add, and more, goes into potential energy on the way up.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planet', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([{ name: 'Mars', a: A_MARS / AU }, { name: 'Venus', a: 0.723332 }, { name: 'Jupiter', a: 5.2026 }]);
        const h = hohmann(GM_SUN, AU, P.a * AU), dv = h.dv1 / 1e3;
        return {
          prompt: t`Treat Earth's and ${P.name}'s orbits as coplanar circles of radius 1 AU and ${P.a.toFixed(4)} AU. In the Sun's frame, what speed change starts a Hohmann transfer from Earth's orbit to ${P.name}'s? Answer in km/s. ($GM_\odot = 1.327\times10^{20}$ m³/s², 1 AU $= 1.496\times10^{11}$ m.)`,
          answer: dv, units: 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: h.dv / 1e3, feedback: t`That is the total of both burns. The question asks for the departure burn only.` }, { value: Math.abs(Math.sqrt(GM_SUN / AU) - Math.sqrt(GM_SUN / (P.a * AU))) / 1e3, feedback: t`That is the difference between the planets' orbital speeds. The departure burn takes you onto the transfer ellipse: compute its speed at 1 AU with vis-viva.` }], dv),
          hints: [t`Earth's orbital speed is $\sqrt{\mu/r_1}$; the transfer ellipse has $a_t = (1 + ${P.a.toFixed(3)})/2$ AU.`, t`$\Delta v_1 = \big|\sqrt{\mu(2/r_1 - 1/a_t)} - \sqrt{\mu/r_1}\big|$. ${P.a < 1 ? 'Going inward, it is a slowdown.' : ''}`],
          teach: t`Interplanetary Hohmann transfers are the same arithmetic with the Sun's $\mu$, burns measured relative to the departure planet's orbital motion.`,
          explain: t`Earth moves at $${sci(h.vc1 / 1e3, 4)}$ km/s; the transfer ellipse needs $${sci(h.vp / 1e3, 4)}$ km/s at 1 AU, a change of $${sci(dv, 3)}$ km/s ${P.a > 1 ? 'forward' : 'backward'}. This is the speed left over after escaping Earth (the hyperbolic excess); from a 200 km parking orbit the actual burn is $\sqrt{v_\infty^2 + v_{\text{esc}}^2} - v_c = ${sci((Math.sqrt(h.dv1 ** 2 + (2 * GM_E) / (R_EQ + 200e3)) - Math.sqrt(GM_E / (R_EQ + 200e3))) / 1e3, 3)}$ km/s. The flight takes $${sci(h.tof / 86400, 3)}$ days.`,
          visual: helioPic(P.a, t`Earth's orbit (blue), ${P.name}'s (orange) and the transfer half-ellipse (gold), to scale, with the Sun at the centre.`),
        };
      },
    }),
    num({
      id: 'cp-time', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([{ name: 'Mars', a: A_MARS / AU }, { name: 'Venus', a: 0.723332 }, { name: 'Saturn', a: 9.5371 }]);
        const at = ((1 + P.a) / 2) * AU, d = (Math.PI * Math.sqrt(at ** 3 / GM_SUN)) / 86400;
        return {
          prompt: t`How many days does a Hohmann transfer from Earth's orbit (1 AU) to ${P.name}'s (${P.a.toFixed(4)} AU, circular and coplanar) take?`,
          answer: d, units: 'd', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * d, feedback: t`The transfer is half of the ellipse.` }, { value: (Math.PI * Math.sqrt((P.a * AU) ** 3 / GM_SUN)) / 86400, feedback: t`That is half of ${P.name}'s own period. Use the transfer ellipse, $a_t = (1 + ${P.a.toFixed(3)})/2$ AU.` }], d),
          hints: [t`With $T$ in years and $a$ in AU, Kepler's third law is $T = a^{3/2}$; the transfer takes half of that.`],
          teach: t`A Hohmann transfer takes half the period of an ellipse whose semi-major axis is the average of the two orbits.`,
          explain: t`$a_t = ${sci((1 + P.a) / 2, 4)}$ AU, so the trip is $\tfrac12a_t^{3/2}$ yr $= ${sci(d, 3)}$ days.${P.name === 'Mars' ? ' The planets must be lined up for it: Mars has to be 44° ahead of Earth at launch, which happens every 26 months.' : ''}`,
          visual: helioPic(P.a, t`The transfer half-ellipse (gold) between Earth's orbit and ${P.name}'s, to scale.`),
        };
      },
    }),
    mcq({
      id: 'cp-phasing', difficulty: 3, transfer: true,
      prompt: t`A crew capsule is in the same circular orbit as the space station, but $20^\circ$ **behind** it. To catch up with the least propellant, the capsule should first:`,
      visual: gpic({ x: [-1.7, 1.7], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.6)], curves: [ring(1, 'ink3', 1.4)], points: [{ x: r6(Math.cos(1.2)), y: r6(Math.sin(1.2)), color: 'accent', r: 6, label: 'station', labelDx: 8, labelDy: -10 }, { x: r6(Math.cos(0.85)), y: r6(Math.sin(0.85)), color: 'warn', r: 5, label: 'capsule', labelDx: 10, labelDy: 6 }], arrows: [{ from: [1.15, -0.3], to: [1.15, 0.3], color: 'ink3', label: 'orbital motion', labelDx: 6, labelDy: 0 }] }, t`The capsule trailing the station on the same circular orbit, both moving anticlockwise (not to scale).`, 'Two spacecraft on one circular orbit, one behind the other'),
      choices: [t`Fire retrograde, dropping into a lower, shorter-period orbit that gains on the station; then raise its orbit again to meet it`, t`Fire prograde to speed up and close the gap directly`, t`Fire radially inward, toward Earth`, t`Fire prograde, then retrograde half an orbit later, to pass the station at the same height`],
      answer: 0,
      why: { 1: t`Speeding up raises the far side of the orbit: a bigger orbit has a longer period, so the capsule falls further behind.`, 2: t`A radial burn barely changes the period ($a$ depends on speed, not direction — [M5.3](#/lesson/phys3550.M5.3)): it makes the orbit slightly eccentric, which does not accumulate a gain.`, 3: t`Speeding up first puts the capsule on a bigger orbit with a longer period: it loses ground during that half-orbit, whatever the second burn does.` },
      hints: [t`Which orbit has the shorter period: a smaller one or a larger one?`, t`To gain on a target you need to complete laps faster, which means a smaller semi-major axis — reached by slowing down.`],
      teach: t`In orbit, to catch up you slow down: a lower orbit has a shorter period.`,
      explain: t`A retrograde burn lowers the far side of the orbit, shrinking $a$ and the period; after enough laps the capsule has gained $20^\circ$, and a prograde burn (or two) brings it back up to the station. Real rendezvous plans are exactly such phasing manoeuvres, worked out in the station's rotating frame ([M6.2](#/lesson/phys3550.M6.2)).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §8.8: changes of orbit', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. D. Curtis, Orbital Mechanics for Engineering Students, 4th ed. (Elsevier, 2020), ch. 6: Hohmann and bi-elliptic transfers, phasing', url: 'https://www.sciencedirect.com/book/9780128240250/orbital-mechanics-for-engineering-students' },
    { label: 'NASA Goddard Planetary Fact Sheet (orbital semi-major axes)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
