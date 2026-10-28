// Tidal acceleration from curvature: the geodesic deviation equation
// A^μ = R^μ_νρσ T^ν T^ρ S^σ (Carroll's sign), derived from a family of
// geodesics, and its Newtonian limit −∂_i∂_jΦ ξ^j. In the frame of a body
// falling radially into a Schwarzschild hole the components are exactly
// Newton's: −2M/r³ along r, +M/r³ across. Spaghettification honestly: from
// a stretch of 10 g to the singularity takes (2/3)√(L/Δa) of proper time
// for any mass — outside the horizon for a stellar hole, far inside for a
// supermassive one. The Earth–Moon equilibrium tide, the rigid Roche limit
// (Shoemaker–Levy 9), and a neutron-star flyby.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { GM_SUN, GM_EARTH, GM_MOON, R_EARTH_M, C, G } from './_curv.js';

const t = String.raw;
const g0 = 9.80665;
const spag = (L, a) => (2 / 3) * Math.sqrt(L / a);       // proper time from a stretch a (over length L) to r = 0, radial fall from rest at infinity
const rAt = (GM, L, a) => Math.cbrt((2 * GM * L) / a);   // where the stretch 2GML/r³ reaches a

const atHorizon = (m) => Math.log10((2 * GM_SUN * m * 2) / ((2 * GM_SUN * m) / (C * C)) ** 3);   // log₁₀ of the 2 m stretch at r = rₛ

/** Tidal acceleration across a body of length L against distance (units of the horizon radius), two masses. */
const tidePic = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.5, 5.2], y: [-6, 9.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'distance r / horizon radius', ylabel: 'head-to-foot stretch (m/s²)', yticks: 6,
    curves: [
      { fn: `${atHorizon(10).toFixed(4)} - 3*x`, color: 'warn', width: 2.4, label: '10 M☉ black hole', labelAt: 1.6, labelDy: -12 },
      { fn: `${atHorizon(4.3e6).toFixed(4)} - 3*x`, color: 'violet', width: 2.4, label: 'Sagittarius A* (4.3 million M☉)', labelAt: 0.4, labelDy: 18 },
    ],
    hlines: [{ y: Math.log10(10 * g0), color: 'bad', label: '10 g' }],
    vlines: [{ x: 0, color: 'ink3', label: 'horizon' }],
  },
  caption,
});

export default lesson({
  id: 'st-c.C17.1',
  title: 'Tidal acceleration from curvature',
  minutes: 15, difficulty: 3,
  equation: t`\frac{D^2S^\mu}{d\tau^2} = R^\mu{}_{\nu\rho\sigma}\,T^\nu T^\rho S^\sigma`,
  intro: t`Free fall cannot be felt at a single point — but two neighbours, each in free fall, drift apart or together. Their separation $S^\mu$ (from one geodesic to the next, at equal proper time $\tau$) obeys the **geodesic deviation equation** above, where $T^\mu$ is the four-velocity they share. The relative acceleration is curvature, and nothing else: no choice of frame removes it.

In weak, slow gravity it is Newton’s tide, $\ddot\xi^{\,i} = -\partial_i\partial_j\Phi\,\xi^j$, because $R^i{}_{0j0} \approx \partial_i\partial_j\Phi$. Falling straight into a non-spinning black hole it is *exactly* Newton’s formula in the faller’s own frame: a stretch of $2GM/r^3$ per metre along the fall and a squeeze of $GM/r^3$ across it. This is the curvature you met in gr.S14.i and gr.EQ.4, now with its derivation and its numbers.`,
  symbols: [
    { tex: t`S^\mu`, text: 'the separation vector between two neighbouring geodesics, in m' },
    { tex: t`T^\mu`, text: t`the four-velocity $dx^\mu/d\tau$ of the geodesics (in a Riemannian space, the unit tangent)` },
    { tex: t`\frac{D^2}{d\tau^2}`, text: t`the second covariant derivative along the geodesic: the relative acceleration, in $\text{m/s}^2$` },
    { tex: t`R^\mu{}_{\nu\rho\sigma}`, text: 'the Riemann tensor, Carroll’s convention' },
    { tex: t`\tau`, text: 'proper time (arc length for a surface)' },
  ],
  why: t`Every gravitational measurement that cannot be cancelled by falling — ocean tides, gravity gradiometers, the tidal disruption of stars, the arm-length changes LIGO records — is this equation.`,
  visual: {
    type: 'gr-dustball',
    title: 'Tides from three masses',
    lead: t`A ball of dust released at rest. Its centre falls freely; its grains accelerate relative to the centre by the curvature where they are. Pick the mass and the distance, then press Play.`,
    tasks: [
      t`Near the Earth the ball stretches toward the mass and squeezes across it, $2 : 1$ — and the time scale $T$ is long: tides are gentle.`,
      t`Choose the 10 solar-mass black hole at a few horizon radii: the same shape, millions of times faster.`,
      t`Choose Sagittarius A* at the same number of horizon radii: the shape is the same but far slower. Tidal strength at a fixed $r/r_s$ falls as $1/M^2$.`,
    ],
    params: { mode: 'tides', body: 'earth', bodies: true, rSlider: true, play: true, t: 0.3 },
    caption: t`The relative accelerations are the exact radial-infall tidal components (equal to Newton’s); the deformation is exaggerated so that it shows. Time runs in units of the scale $T = 1/\sqrt{GM/r^3}$ in the readout.`,
  },
  example: {
    prompt: t`An astronaut $L = 2$ m tall falls feet first, from rest far away, into a non-spinning black hole: (a) a stellar one, $10\,M_\odot$; (b) Sagittarius A*, $4.3\times10^6\,M_\odot$. Where does the head-to-foot stretch reach $10g = 98.1\ \text{m/s}^2$, and how much proper time is left from there to $r = 0$?`,
    visual: tidePic('The head-to-foot stretch 2GML/r³ for L = 2 m against distance in horizon radii, both on log scales; the red line is 10 g.'),
    steps: [
      { label: 'The stretch', text: t`In the faller’s frame $R^{\hat r}{}_{\hat\tau\hat r\hat\tau} = -2GM/(c^2r^3)$ exactly, so $\Delta a = 2GML/r^3$ (in SI). Set it to $98.1\ \text{m/s}^2$: $r = (2GML/98.1)^{1/3}$.` },
      { label: 'Stellar', text: t`$GM = 1.327\times10^{21}\ \text{m}^3/\text{s}^2$: $r = ${nice(rAt(GM_SUN * 10, 2, 98.1) / 1e3, 3)}$ km, about $${nice(rAt(GM_SUN * 10, 2, 98.1) / ((2 * GM_SUN * 10) / (C * C)), 3)}$ horizon radii out ($r_s = 29.5$ km). The astronaut is torn apart long before reaching the horizon.` },
      { label: 'Supermassive', text: t`$GM = 5.71\times10^{26}\ \text{m}^3/\text{s}^2$: $r = ${tex(rAt(GM_SUN * 4.3e6, 2, 98.1) / 1e3, 3)}$ km — only $${nice(rAt(GM_SUN * 4.3e6, 2, 98.1) / ((2 * GM_SUN * 4.3e6) / (C * C)), 2)}$ of the horizon radius $1.27\times10^{7}$ km. At the horizon the stretch is a gentle $${tex((2 * GM_SUN * 4.3e6 * 2) / ((2 * GM_SUN * 4.3e6) / (C * C)) ** 3, 2)}\ \text{m/s}^2$.` },
      { label: 'Time left', text: t`Falling from rest at infinity, $dr/d\tau = -\sqrt{2GM/r}$ exactly, so $\tau = \tfrac23\,r^{3/2}/\sqrt{2GM}$. With $r^3 = 2GML/\Delta a$ the mass cancels: $\tau = \tfrac23\sqrt{L/\Delta a} = ${nice(spag(2, 98.1), 3)}$ s, for **every** black hole.` },
      { label: 'Honest labels', text: t`What differs is where the last tenth of a second happens: outside the horizon of a stellar hole (and visible to the universe), deep inside a supermassive one (seen by no one outside). Near $r = 0$ general relativity itself is expected to fail; the 0.095 s is its prediction, not an observation. A human body would fail at far less than $10g$ of stretch in practice — the number is a benchmark.` },
    ],
    answer: t`(a) $r \approx ${nice(rAt(GM_SUN * 10, 2, 98.1) / 1e3, 3)}$ km, far outside the horizon; (b) $r \approx ${tex(rAt(GM_SUN * 4.3e6, 2, 98.1) / 1e3, 3)}$ km, deep inside it. In both cases $\tfrac23\sqrt{L/\Delta a} = ${nice(spag(2, 98.1), 3)}$ s of proper time remains.`,
  },
  practice: [
    mcq({
      id: 'components', difficulty: 2,
      prompt: t`In the frame of a body falling radially toward a mass ($G = c = 1$), the relevant curvature components are $R^{\hat r}{}_{\hat\tau\hat r\hat\tau} = -2M/r^3$ and $R^{\hat\theta}{}_{\hat\tau\hat\theta\hat\tau} = R^{\hat\varphi}{}_{\hat\tau\hat\varphi\hat\tau} = +M/r^3$. With $T = \hat e_\tau$, what does the deviation equation predict?`,
      visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', t: 0, readout: false, views: 'side', arrows: false, play: false }, caption: 'A ball of dust about to be released (side view, the mass to the left).' },
      choices: [
        t`Stretching along $\hat e_r$ at $2M/r^3$ per unit separation, squeezing across at $M/r^3$`,
        t`Squeezing along $\hat e_r$ at $2M/r^3$, stretching across at $M/r^3$`,
        t`Stretching in all three directions, since the hole pulls everything in`,
        'No relative acceleration: everything falls at the same rate',
      ],
      answer: 0,
      why: {
        1: t`$A^{\hat r} = R^{\hat r}{}_{\hat\tau\hat\tau\hat r}S^{\hat r} = -R^{\hat r}{}_{\hat\tau\hat r\hat\tau}S^{\hat r} = +\tfrac{2M}{r^3}S^{\hat r}$: the antisymmetry in the last pair flips the sign. Positive means apart.`,
        2: t`Across the fall the neighbours converge — both head for the centre. Only the radial direction stretches.`,
        3: 'Equal rates hold at one point (the equivalence principle). Neighbours at different places feel slightly different pulls.',
      },
      hints: [t`$A^{\hat r} = R^{\hat r}{}_{\hat\tau\rho\sigma}T^\rho S^\sigma$ with $T = \hat e_\tau$: the components that enter are $R^{\hat r}{}_{\hat\tau\hat\tau\hat r} = -R^{\hat r}{}_{\hat\tau\hat r\hat\tau}$.`],
      teach: t`Read the deviation equation slot by slot: the order of the last pair flips the sign of the familiar component $R^{\hat r}{}_{\hat\tau\hat r\hat\tau}$.`,
      explain: t`$\ddot S^{\hat r} = +\dfrac{2M}{r^3}S^{\hat r}$ and $\ddot S^{\hat\theta} = -\dfrac{M}{r^3}S^{\hat\theta}$. The trace is $2 - 1 - 1 = 0$: in empty space the volume of a small ball starts out unchanged (Ricci zero, C16.1).`,
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Derive the deviation equation for a family of geodesics $x^\mu(\tau, s)$, with $T = \partial_\tau$ along each geodesic and $S = \partial_s$ across the family. Order the steps.`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'geodesic', P: [0.6, 1.5708], heading: 0, fan: 6, spread: 8, length: 3.3, drag: false, readout: false, field: false, sliders: [] }, caption: 'A fan of great circles leaving one point of the equator on the sphere’s chart: their separation grows, then shrinks to zero half way round.' },
      items: [
        t`$S$ and $T$ are coordinate vector fields of the family, so they commute: $[T, S] = 0$, which for a torsion-free connection means $\nabla_TS = \nabla_ST$.`,
        t`The relative acceleration is $A = \nabla_T\nabla_TS = \nabla_T\nabla_ST$.`,
        t`Swap the order of the derivatives at the cost of a curvature term: $\nabla_T\nabla_ST = \nabla_S\nabla_TT + R(T, S)T$.`,
        t`Each curve is a geodesic, $\nabla_TT = 0$, so $A^\mu = R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma$.`,
      ],
      hints: ['Start from what is special about coordinate vector fields.', 'Which step uses the geodesic equation?'],
      teach: 'Geodesic deviation is the commutator of covariant derivatives applied to the tangent field of a family of geodesics.',
      explain: t`The swap in the third step is the commutator of C15.1 with $V = T$: $[\nabla_T, \nabla_S]T = R(T, S)T$ when $[T, S] = 0$. That is why the deviation equation contains exactly one Riemann tensor and nothing else.`,
    }),
    num({
      id: 'moon-tide', difficulty: 3,
      gen(r) {
        const [when, d] = r.pick([['at perigee (356 500 km)', 3.565e8], ['at apogee (406 700 km)', 4.067e8], ['at its mean distance (384 400 km)', 3.844e8]]);
        const q = GM_MOON / GM_EARTH, h = 1.5 * q * R_EARTH_M ** 4 / d ** 3;
        return {
          prompt: t`The Moon’s tide stretches the oceans along the Earth–Moon line. If the oceans covered the Earth and settled into equilibrium, the difference between high and low water would be $h = \tfrac32\dfrac{M_{\text{Moon}}}{M_\oplus}\dfrac{R_\oplus^4}{d^3}$. With $M_{\text{Moon}}/M_\oplus = 0.0123$ and $R_\oplus = 6371$ km, find $h$ in metres with the Moon ${when}.`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'teal', width: 2 }, { param: ['(1 + 0.12*(3*cos(t)^2 - 1)/2)*cos(t)', '(1 + 0.12*(3*cos(t)^2 - 1)/2)*sin(t)'], t: [0, 2 * Math.PI], color: 'accent', width: 2.2, dash: [5, 4] }], points: [{ x: 1.75, y: 0, r: 7, color: 'ink3', label: 'to the Moon', labelDx: -30, labelDy: -16 }], arrows: [{ from: [1.06, 0], to: [1.3, 0], color: 'warn', width: 2 }, { from: [-1.06, 0], to: [-1.3, 0], color: 'warn', width: 2 }, { from: [0, 0.97], to: [0, 0.8], color: 'warn', width: 2 }, { from: [0, -0.97], to: [0, -0.8], color: 'warn', width: 2 }] }, caption: 'The equilibrium tide: the ocean surface (dashed) bulges toward and away from the Moon and is drawn in across. The bulge is exaggerated about a million times.' },
          answer: h, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: h / 1.5, feedback: t`Keep the $\tfrac32$: high water sits $+1$ and low water $-\tfrac12$ in units of $\tfrac{M}{M_\oplus}\tfrac{R^4}{d^3}$.` },
            { value: (1.5 * q * R_EARTH_M ** 3) / d ** 2, feedback: t`The tide falls off as $1/d^3$ — a difference of pulls — not as $1/d^2$.` },
          ].filter((e) => Math.abs(e.value - h) > 0.02 * h),
          hints: [t`Use metres throughout: $R_\oplus = 6.371\times10^6$ m.`, t`$R_\oplus^4/d^3 = ${tex(R_EARTH_M ** 4 / d ** 3, 4)}$ m.`],
          teach: 'The tidal stretch falls as 1/d³, so the equilibrium tide is a fraction of a metre, and changes markedly between perigee and apogee.',
          explain: t`$h = 1.5\times0.0123\times${tex(R_EARTH_M ** 4 / d ** 3, 4)} = ${nice(h, 3)}$ m. Real tides are not in equilibrium: the oceans respond as driven, resonant basins, so the open-ocean range is similar but coasts range from almost nothing to 16 m in the Bay of Fundy. The $1/d^3$ law shows in the data, though: perigee ("perigean spring") tides are noticeably higher.`,
        };
      },
    }),
    num({
      id: 'flyby', difficulty: 2,
      gen(r) {
        const m = r.pick([1.4, 2.0]), rk = r.pick([500, 1000, 2000]), w = r.pick([3, 5, 8]);
        const a = (GM_SUN * m * w) / (rk * 1e3) ** 3;
        return {
          prompt: t`A probe ${w} m wide passes ${rk} km from the centre of a ${m}-solar-mass neutron star ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$), falling freely. How hard are its two sides squeezed toward each other — the relative acceleration across the direction to the star, in $\text{m/s}^2$?`,
          visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', t: 0.6, readout: false, views: 'side', play: false }, caption: 'The shape of a tidal squeeze (drawn near the Earth, exaggerated): the squeeze across the direction to the mass is half the stretch along it.' },
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 2 * a, feedback: t`$2GM/r^3$ is the stretch *along* the line to the star. Across it the squeeze is half that: $GM\,w/r^3$.` }],
          hints: [t`Across the fall, $\ddot\xi = -\dfrac{GM}{r^3}\xi$.`, t`$GM = ${m}\times1.327\times10^{20}$, $r = ${rk}\times10^3$ m, $\xi = ${w}$ m.`],
          teach: 'Across the direction of the mass the tidal squeeze is GM/r³ per unit separation: half the radial stretch.',
          explain: t`$\Delta a = \dfrac{GMw}{r^3} = ${nice(a, 3)}\ \text{m/s}^2$, or $${nice(a / g0, 3)}g$. Along the line to the star the stretch would be twice that. These are exact for radial infall and accurate for any free fall at these distances.`,
        };
      },
    }),
    num({
      id: 'last-tenth', difficulty: 3,
      gen(r) {
        const [L, a, what] = r.pick([[1.8, 10 * g0, 'a 1.8 m astronaut, from the moment the stretch reaches 10g'], [10, 200, 'a 10 m probe rated to 200 m/s² of stretch, from the moment that limit is reached'], [0.3, 1000, 'a 30 cm instrument rated to 1000 m/s², from the moment that limit is reached'], [2, 50 * g0, 'a 2 m astronaut, from 50g of stretch']]);
        const M = r.pick([5, 30, 4.3e6, 6.5e9]);
        const key = spag(L, a);
        return {
          prompt: t`Something falls feet first, from rest far away, into a non-spinning black hole of ${M >= 1e6 ? t`$${tex(M, 2)}$` : M} solar masses: ${what}. How much proper time, in seconds, does it have left before reaching $r = 0$? (Radially, $dr/d\tau = -\sqrt{2GM/r}$ exactly, and the stretch is $2GML/r^3$.)`,
          visual: tidePic('The head-to-foot stretch across 2 m against distance in horizon radii, for a stellar-mass and a supermassive black hole.'),
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(L / a), feedback: t`Integrate $d\tau = -dr/\sqrt{2GM/r}$: it gives $\tfrac23 r^{3/2}/\sqrt{2GM}$, with the $\tfrac23$.` },
            { value: (2 / 3) * Math.sqrt((2 * L) / a), feedback: t`$r^3 = 2GML/\Delta a$, so $r^{3/2}/\sqrt{2GM} = \sqrt{L/\Delta a}$: the 2 cancels.` },
          ],
          hints: [t`Integrate: $\tau = \tfrac23 r^{3/2}/\sqrt{2GM}$ from radius $r$ to 0.`, t`Substitute $r^3 = 2GML/\Delta a$: the mass cancels, $\tau = \tfrac23\sqrt{L/\Delta a}$.`],
          teach: 'The proper time from a given tidal stretch to the singularity, (2/3)√(L/Δa), is the same for every black hole.',
          explain: t`$\tau = \tfrac23\sqrt{${L}/${nice(a, 4)}} = ${nice(key, 3)}$ s, whatever the mass — ${M} solar masses was a red herring. Whether that interval begins outside the horizon or inside it does depend on the mass. (A non-spinning hole, a body too small to disturb it, and general relativity trusted all the way down — near $r = 0$ nobody expects it to hold.)`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-roche', difficulty: 3, transfer: true,
      gen(r) {
        const [planet, Rp, rhoP] = r.pick([['Jupiter', 71492, 1326], ['Saturn', 60268, 687]]);
        const rhoS = r.pick([300, 500, 800]);
        const d = Rp * Math.cbrt((2 * rhoP) / rhoS);
        return {
          prompt: t`A small rigid body of density $${rhoS}\ \text{kg/m}^3$ (a comet’s nucleus) passes ${planet} (equatorial radius $${Rp}$ km, mean density $${rhoP}\ \text{kg/m}^3$). A loose grain on its surface is lost when the tidal stretch $2GM_pa/d^3$ across the body’s radius $a$ exceeds the body’s own surface gravity $Gm/a^2$. At what distance $d$ from ${planet}’s centre does that happen, in km?`,
          visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', t: 0.7, readout: false, views: 'side', play: false }, caption: 'The tidal stretch along the line to a planet (drawn near the Earth, exaggerated): close enough, it beats the body’s own gravity.' },
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: Rp * Math.cbrt(rhoP / rhoS), feedback: t`The radial stretch is $2GM_pa/d^3$, with the factor 2.` },
            { value: Rp * Math.cbrt((2 * rhoS) / rhoP), feedback: 'The ratio is upside down: a less dense body is torn apart farther out.' },
          ].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`Set $2GM_pa/d^3 = Gm/a^2$ and write both masses as density times volume: $M_p = \tfrac43\pi\rho_pR_p^3$, $m = \tfrac43\pi\rho_sa^3$.`, t`$d = R_p\,(2\rho_p/\rho_s)^{1/3}$.`],
          teach: t`Tides beat self-gravity inside the Roche limit, $d = R_p(2\rho_p/\rho_s)^{1/3}$ for a rigid sphere: it depends on densities, not sizes.`,
          explain: t`$d = ${Rp}\times(2\times${rhoP}/${rhoS})^{1/3} = ${tex(d, 4)}$ km $= ${nice(d / Rp, 3)}$ ${planet} radii. ${planet === 'Jupiter' ? 'Comet Shoemaker–Levy 9 passed about 40 000 km above Jupiter’s cloud tops (about 1.6 Jupiter radii from the centre) in July 1992 — inside this limit unless its nucleus was denser than about 700 kg/m³ — and was found broken into some twenty pieces, which struck Jupiter in 1994.' : 'Saturn’s main rings end near 2.3 Saturn radii, close to the fluid limit for ice (below); small rigid moonlets survive inside it.'} This is the crudest version: a fluid body, deformed by the tide, comes apart farther out (Roche’s $2.44\,(\rho_p/\rho_s)^{1/3}R_p$), and real nuclei have some strength.`,
        };
      },
    }),
    num({
      id: 'cp-probe', difficulty: 3, transfer: true,
      gen(r) {
        const [M, name] = r.pick([[10, 'a 10-solar-mass black hole'], [65, 'a 65-solar-mass black hole (like those LIGO has seen merge)'], [4.3e6, 'Sagittarius A* (4.3 million solar masses)']]);
        const L = 10, a = 200, rr = rAt(GM_SUN * M, L, a), rs = (2 * GM_SUN * M) / (C * C), key = rr / rs;
        return {
          prompt: t`A 10 m probe built to withstand a head-to-foot stretch of $200\ \text{m/s}^2$ falls radially into ${name}. At what radius does the stretch $2GML/r^3$ reach its limit? Give the answer as a multiple of the horizon radius $r_s = 2GM/c^2$ ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$).`,
          visual: tidePic('The stretch across 2 m (the probe’s scales with its 10 m length) against distance in horizon radii.'),
          answer: key, tol: { rel: 0.01 },
          errors: [
            { value: rr / 1e3, feedback: 'That is the radius in km. Divide by the horizon radius.' },
            { value: Math.cbrt((GM_SUN * M * L) / a) / rs, feedback: t`The radial stretch is $2GML/r^3$: keep the 2.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`$r = (2GML/\Delta a)^{1/3}$ with $GM = ${tex(GM_SUN * M, 4)}\ \text{m}^3/\text{s}^2$.`, t`$r_s = 2GM/c^2 = ${tex(rs, 4)}$ m.`],
          teach: 'At a fixed number of horizon radii the tide scales as 1/M²: small black holes shred things outside, big ones inside.',
          explain: t`$r = ${tex(rr, 3)}$ m $= ${nice(key, 3)}\,r_s$. ${key > 1 ? 'Outside the horizon: the probe breaks up where distant observers could, in principle, watch.' : 'Inside the horizon: the probe crosses intact and fails where no signal can get out.'} Either way it has $\tfrac23\sqrt{10/200} = ${nice(spag(10, 200), 3)}$ s of proper time left.`,
        };
      },
    }),
    mcq({
      id: 'cp-honest', difficulty: 2,
      prompt: t`Which statement about falling into a black hole is supported by general relativity as it stands?`,
      visual: tidePic('The stretch across 2 m for a stellar-mass and a supermassive black hole, against distance in horizon radii.'),
      choices: [
        'Falling into a supermassive black hole, an astronaut would cross the horizon unharmed by tides and reach the strong-tide region less than a minute of proper time later',
        'Every black hole spaghettifies an astronaut before the horizon',
        'Tidal forces at the horizon are the same for every black hole',
        'Astronauts have been observed being stretched near black holes',
      ],
      answer: 0,
      why: {
        1: t`For Sagittarius A* the stretch at the horizon is about $10^{-3}\ \text{m/s}^2$: imperceptible.`,
        2: t`At the horizon $\Delta a = c^6L/(4G^2M^2)$: it falls as $1/M^2$.`,
        3: 'No. What has been observed is stars torn apart by supermassive black holes — tidal disruption events — seen as flares.',
      },
      hints: ['At the horizon r = rₛ ∝ M, so how does 2GML/rₛ³ depend on M?'],
      teach: 'Tides at the horizon fall as 1/M²: harmless for supermassive holes, lethal outside stellar ones; all of this is prediction, the stellar version observed only for stars.',
      explain: t`From the horizon of Sagittarius A* to $r = 0$ takes at most $\pi GM/c^3 \approx 66$ s of proper time (less, about 28 s, falling from rest far away). Tidal disruption of whole stars, seen as luminous flares in distant galaxies, is the observed side of this physics; the fate of astronauts is calculation.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.10 (geodesic deviation) and §5.6 (radial infall)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Hartle, Gravity, ch. 21 (geodesic deviation) and §12.2 (tides near a black hole)', url: 'https://www.pearson.com/en-us/subject-catalog/p/gravity-an-introduction-to-einsteins-general-relativity/P200000003301' },
    { label: 'NASA/JPL, Comet Shoemaker–Levy 9 fact sheet', url: 'https://www2.jpl.nasa.gov/sl9/' },
    { label: 'Gezari 2021, Tidal disruption events, Annu. Rev. Astron. Astrophys. 59, 21', url: 'https://doi.org/10.1146/annurev-astro-111720-030029' },
  ],
});
