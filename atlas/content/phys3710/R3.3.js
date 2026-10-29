// The Doppler effect and aberration from one dot product: a photon's
// four-momentum k = E(1, n̂) and an observer's four-velocity give the energy
// the observer measures, E_obs = −k·u_obs (Hartle's (−, +, +, +), c = 1).
// The same transformation turns directions: stars crowd forward for a fast
// ship, a fast emitter's light is beamed into a cone of half-angle 1/γ.
// Builds on R0.2 and R2.1 (the longitudinal factor e^φ, pulse spacing) and
// phys2710.MP2.5 (SS 433, Ives–Stilwell, a quasar jet, the CMB dipole,
// light at 90° in the receiver's frame) without repeating their examples:
// here the starship's sky, the two meanings of "transverse", the fraction of
// stars ahead, synchrotron-light cones and two-way radar tracking.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { r6, st, label } from './_geom.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const ME = 0.51099895;                 // MeV
const gam = (b) => 1 / Math.sqrt(1 - b * b);
/** Direction to a star seen from a ship moving at b along +x, given its angle th (degrees) from +x in the galaxy's frame. */
const aberr = (th, b) => Math.acos((Math.cos(th / DEG) + b) / (1 + b * Math.cos(th / DEG))) * DEG;
/** Energy factor E_ship/E_galaxy for that star. */
const dopp = (th, b) => gam(b) * (1 + b * Math.cos(th / DEG));

const STARS = Array.from({ length: 12 }, (_, k) => k * 30);

/** The sky round a ship moving along +x: grey rings where stars are in the galaxy's frame, gold dots where the ship sees them. */
function sky({ b, mark = null, arrows = true, sliders = null, readouts = null, caption }) {
  const B = typeof b === 'number' ? r6(b) : b;
  const pos = (th) => {
    const c = r6(Math.cos(th / DEG)), s = r6(Math.sin(th / DEG));
    return [`(${c} + ${B})/(1 + ${B}*${c})`, `${s}*sqrt(1 - ${B}^2)/(1 + ${B}*${c})`];
  };
  const points = [];
  for (const th of STARS) {
    const c = r6(Math.cos(th / DEG)), s = r6(Math.sin(th / DEG));
    points.push({ x: c, y: s, r: 5, hollow: true, color: 'ink3' });
  }
  for (const th of STARS) { const [x, y] = pos(th); points.push({ x, y, r: th === mark ? 6 : 4.5, color: th === mark ? 'accent2' : 'gold' }); }
  points.push({ x: 0, y: 0, r: 4, color: 'accent', label: 'ship', labelDx: -6, labelDy: 16, labelAlign: 'right' });
  if (mark !== null) points.push(label(Math.cos(mark / DEG), Math.sin(mark / DEG), 'galaxy frame', 'ink3', 10, -4));
  return {
    type: 'graph',
    params: {
      x: [-1.35, 1.35], y: [-1.2, 1.2], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }],
      arrows: [
        { from: [-0.3, 0], to: [0.3, 0], color: 'accent', width: 2.4, label: 'motion', labelDx: 4, labelDy: -8 },
        ...(arrows ? STARS.filter((th) => th % 180 !== 0).map((th) => { const [x, y] = pos(th); return { from: [r6(Math.cos(th / DEG)), r6(Math.sin(th / DEG))], to: [x, y], color: 'ink3', width: 1, dash: true }; }) : []),
      ],
      points,
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`Directions to twelve stars, spaced every $30^\circ$ in the galaxy’s frame (grey rings), and where a ship moving to the right sees them (gold). A cut through the sky in one plane; the dashed lines show how each star slides.`,
  };
}

/** A photon's direction and an observer's velocity, drawn in space. */
function arrowsInSpace({ alpha, b, caption }) {
  return {
    type: 'graph',
    params: {
      x: [-1.25, 1.25], y: [-0.25, 1.15], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      arrows: [
        { from: [0, 0], to: [r6(Math.cos(alpha / DEG)), r6(Math.sin(alpha / DEG))], color: 'warn', width: 2.6, label: 'photon', labelDx: 6 },
        { from: [0, 0], to: [r6(0.9 * b), 0], color: 'accent', width: 2.6, label: 'observer', labelDx: 4, labelDy: 14 },
      ],
      curves: [{ param: [`0.25*cos(t)`, `0.25*sin(t)`], t: [0, r6(alpha / DEG)], color: 'ink3', width: 1.2 }],
      points: [label(0.32 * Math.cos(alpha / 2 / DEG), 0.32 * Math.sin(alpha / 2 / DEG), 'α', 'ink2', 4, 0)],
    },
    caption: caption ?? t`In the laboratory frame: the direction the photon travels (orange) and the observer’s velocity (blue), with the angle $\alpha$ between them. Lengths are not to scale.`,
  };
}

const EXB = 0.75, EXG = gam(EXB), EXT = aberr(90, EXB);

export default lesson({
  id: 'phys3710.R3.3',
  title: 'The Doppler effect and aberration',
  minutes: 12, difficulty: 3,
  intro: t`A photon has a four-momentum like any particle, but on the light cone: $\mathbf k = E\,(1, \hat n)$, where $\hat n$ is the direction it travels and $E = h\nu$ its energy in that frame. Lesson R3.1 showed that an observer with four-velocity $\mathbf u$ measures energy $-\mathbf p\cdot\mathbf u$. For light that is the whole of the Doppler effect (with $c = 1$):

$$E_{\text{obs}} = -\,\mathbf k\cdot\mathbf u_{\text{obs}} = \gamma E\,(1 - \beta\cos\alpha)$$

where the observer moves at speed $\beta$ at angle $\alpha$ to the photon’s direction of travel. The same Lorentz transformation that changes the energy changes the direction — **aberration** — so a fast ship sees the stars crowd towards the point it is heading for, and a fast emitter throws its light forward in a narrow cone. Lessons R0.2 and R2.1 found the factor $e^{\varphi}$ for light along the line of motion; this is every other angle.`,
  symbols: [
    { tex: '\\mathbf k', text: t`the photon’s four-momentum $(E, E\hat n)$; it is null, $\mathbf k\cdot\mathbf k = 0$` },
    { tex: 'E', text: t`the photon’s energy in the frame where $\mathbf k$ is written, $h\nu$ (eV); frequency and energy shift together` },
    { tex: '\\hat n', text: 'the unit vector along which the photon travels' },
    { tex: '\\mathbf u_{\\text{obs}}', text: t`the observer’s four-velocity, $\gamma(1, \vec\beta)$` },
    { tex: 'E_{\\text{obs}}', text: 'the energy (and so frequency) that observer measures' },
    { tex: '\\beta,\\ \\gamma', text: t`the observer’s speed as a fraction of $c$, and $1/\sqrt{1 - \beta^2}$` },
    { tex: '\\alpha', text: t`the angle between the observer’s velocity and the photon’s direction of travel, in the frame where $\mathbf k$ is written` },
  ],
  why: 'Redshifts of galaxies, beamed jets from black holes, the X-rays of synchrotron light sources and the radio tracking of every deep-space probe are all this one dot product.',
  visual: {
    ...sky({
      b: 'b',
      sliders: [{ key: 'b', label: t`Ship speed $\beta$`, min: 0, max: 0.98, step: 0.01, value: 0.6, explain: t`The ship moves to the right relative to the stars, as a fraction of $c$.` }],
      readouts: [
        { label: t`star dead ahead: $E_{\text{ship}}/E$`, expr: 'sqrt((1 + b)/(1 - b))', digits: 3 },
        { label: t`star abeam in galaxy frame: $E_{\text{ship}}/E = \gamma$`, expr: '1/sqrt(1 - b^2)', digits: 3 },
        { label: t`it appears at`, expr: 'acos(b)*180/pi', digits: 3, unit: t`^\circ\ \text{from ahead}` },
        { label: 'share of stars in the front half of the sky', expr: '(1 + b)/2*100', digits: 3, unit: t`\%` },
      ],
    }),
    title: 'A starship’s sky',
    lead: t`Grey rings: where twelve stars are, seen from the galaxy’s frame. Gold dots: where a ship moving to the right sees them. Slide the speed and watch the sky pour forward. The readouts give the energy factor for a star straight ahead and for one that is abeam in the galaxy’s frame.`,
    tasks: [
      t`At $\beta = 0.6$ the star abeam in the galaxy’s frame appears $53^\circ$ from straight ahead, and its light is *blueshifted* by $\gamma = 1.25$.`,
      'Push to 0.98: almost every star crowds into a small circle ahead. The front half of the ship’s sky holds 99% of them.',
      'The stars straight ahead and straight behind never move: aberration only tilts directions towards the motion.',
    ],
  },
  example: {
    prompt: t`A ship cruises at $\beta = ${EXB}$ through a field of stars at rest. A star lies exactly abeam — at $90^\circ$ to the ship’s motion — in the galaxy’s frame, and emits light of energy $E$ there. Where does the ship see it, and with what energy?`,
    visual: sky({ b: EXB, mark: 90, caption: t`At $\beta = ${EXB}$: the larger highlighted dot is where the ship sees the star that is abeam in the galaxy’s frame (its grey ring is labelled). One plane through the sky.` }),
    steps: [
      { label: 'The photon', text: t`In the galaxy’s frame the light travels straight across the ship’s path, towards it: $\mathbf k = E\,(1, 0, -1, 0)$ if the ship moves along $x$ and the star is off in the $+y$ direction.` },
      { label: 'The ship', text: t`$\mathbf u = \gamma(1, \beta, 0, 0)$ with $\gamma = 1/\sqrt{1 - ${EXB}^2} = ${nice(EXG, 4)}$.` },
      { label: 'Energy', text: t`$E_{\text{ship}} = -\mathbf k\cdot\mathbf u = -\left(-E\gamma + 0\right) = \gamma E = ${nice(EXG, 4)}\,E$. The space parts are perpendicular and drop out. The light is **blueshifted**. In the galaxy’s frame the reason is plain: the ship crosses the wavefronts at the galaxy’s rate, but its own clock runs slow by $\gamma$, so it counts $\gamma$ times as many crests per tick.` },
      { label: 'Direction', text: t`Transform the photon’s momentum into the ship’s frame: $k'^x = \gamma(k^x - \beta k^t) = -\gamma\beta E$ and $k'^y = -E$. The light now comes from ahead of abeam: $\cos\theta' = \dfrac{\gamma\beta E}{\gamma E} = \beta$, so $\theta' = ${nice(EXT, 4)}^\circ$ from straight ahead.` },
      { label: 'Sense check', text: t`$k'^t = \gamma E$ and $\sqrt{(\gamma\beta E)^2 + E^2} = \gamma E\sqrt{\beta^2 + 1/\gamma^2} = \gamma E$ ✓ — the photon is still null. A star that the ship sees abeam would instead be redshifted, by $1/\gamma$: which frame’s “90°” you mean decides the sign of the transverse Doppler shift.` },
    ],
    answer: t`The ship sees the star $${nice(EXT, 4)}^\circ$ from straight ahead, with its light blueshifted by $\gamma = ${nice(EXG, 4)}$.`,
  },
  practice: [
    num({
      id: 'k-dot-u', difficulty: 2,
      gen(r) {
        const [line, E] = r.pick([['Lyman-α light from hydrogen', 10.2], ['the 21 cm line of hydrogen', 5.87e-6], ['a 2.0 eV red photon', 2.0]]);
        const alpha = r.pick([60, 120, 135, 45]), b = r.pick([0.5, 0.3, 0.8]);
        const f = gam(b) * (1 - b * Math.cos(alpha / DEG)), ans = f;
        return {
          prompt: t`In the laboratory, a photon of ${line} travels at $\alpha = ${alpha}^\circ$ to the $+x$ axis. A detector moves along $+x$ at $\beta = ${b}$. By what factor does the energy it measures differ from the laboratory’s, $E_{\text{obs}}/E = -\mathbf k\cdot\mathbf u_{\text{obs}}/E$?`,
          visual: arrowsInSpace({ alpha, b }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: gam(b) * (1 + b * Math.cos(alpha / DEG)), feedback: t`Check the sign: $\mathbf k\cdot\mathbf u = -E\gamma + E\gamma\beta\cos\alpha$, so $E_{\text{obs}} = \gamma E(1 - \beta\cos\alpha)$.` }, { value: 1 - b * Math.cos(alpha / DEG), feedback: t`You dropped the $\gamma$ from the observer’s four-velocity, $\gamma(1, \beta, 0, 0)$.` }],
          hints: [t`$\mathbf k = E(1, \cos\alpha, \sin\alpha, 0)$ and $\mathbf u = \gamma(1, \beta, 0, 0)$.`, t`$-\mathbf k\cdot\mathbf u = \gamma E(1 - \beta\cos\alpha)$, with $\gamma = ${nice(gam(b), 4)}$.`],
          teach: t`The measured photon energy is $-\mathbf k\cdot\mathbf u_{\text{obs}} = \gamma E(1 - \beta\cos\alpha)$: one dot product gives the Doppler shift at any angle.`,
          explain: t`$${nice(gam(b), 4)}\times(1 - ${b}\cos${alpha}^\circ) = ${nice(ans, 4)}$: ${ans > 1 ? 'a blueshift — the detector runs into the light' : 'a redshift — the detector runs away from the light'}.`,
        };
      },
    }),
    expr({
      id: 'derive', difficulty: 2,
      prompt: t`Starting from $\mathbf k = E(1, \cos\alpha, \sin\alpha, 0)$ and $\mathbf u = \gamma(1, \beta, 0, 0)$ with $\gamma = 1/\sqrt{1 - \beta^2}$, write the ratio $E_{\text{obs}}/E = -\mathbf k\cdot\mathbf u/E$ in terms of $\beta$ and $\alpha$ only.`,
      visual: arrowsInSpace({ alpha: 50, b: 0.6 }),
      answer: '(1 - beta cos(alpha))/sqrt(1 - beta^2)', answerTeX: t`\frac{1 - \beta\cos\alpha}{\sqrt{1 - \beta^2}}`, lhs: t`\dfrac{E_{\text{obs}}}{E}`,
      vars: { beta: [-0.8, 0.8], alpha: [0, 3] },
      errors: [{ answer: '(1 + beta cos(alpha))/sqrt(1 - beta^2)', feedback: t`The time parts enter the dot product with a minus sign: $-\mathbf k\cdot\mathbf u = \gamma E - \gamma\beta E\cos\alpha$.` }, { answer: '(1 - beta cos(alpha))*sqrt(1 - beta^2)', feedback: t`$\gamma$ multiplies: it is $1/\sqrt{1 - \beta^2}$, not $\sqrt{1 - \beta^2}$.` }],
      hints: [t`$\mathbf k\cdot\mathbf u = -k^tu^t + k^xu^x + k^yu^y$.`, t`$= -E\gamma + E\cos\alpha\,\gamma\beta + 0$.`],
      teach: t`$-\mathbf k\cdot\mathbf u = \gamma E(1 - \beta\cos\alpha)$ is the relativistic Doppler formula for any angle.`,
      explain: t`$E_{\text{obs}}/E = \gamma(1 - \beta\cos\alpha)$. At $\alpha = 180^\circ$ (head-on) it is $\gamma(1 + \beta) = \sqrt{(1 + \beta)/(1 - \beta)}$, the $e^{\varphi}$ of lesson R0.2; at $\alpha = 90^\circ$ it is $\gamma$.`,
    }),
    num({
      id: 'aberration', difficulty: 2,
      gen(r) {
        const th = r.pick([60, 120, 150, 90]), b = r.pick([0.5, 0.9, 0.99]);
        const ans = aberr(th, b);
        return {
          prompt: t`A star lies $${th}^\circ$ from a ship’s direction of motion, in the galaxy’s frame. The ship moves at $\beta = ${b}$. How far from straight ahead does the ship see it, in degrees? Use $\cos\theta' = \dfrac{\cos\theta + \beta}{1 + \beta\cos\theta}$.`,
          visual: sky({ b: 0, caption: t`The sky in one plane, for a ship at rest relative to the stars: rings every $30^\circ$. The ship moves to the right; at speed the stars would slide towards the front.` }),
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: Math.acos((Math.cos(th / DEG) - b) / (1 - b * Math.cos(th / DEG))) * DEG, feedback: 'That moves the star backwards. Moving towards the right, the ship sees every star shifted towards straight ahead.' }],
          hints: [t`$\cos${th}^\circ = ${nice(Math.cos(th / DEG), 4)}$.`, t`$\cos\theta' = (${nice(Math.cos(th / DEG), 4)} + ${b})/(1 + ${b}\times${nice(Math.cos(th / DEG), 4)})$.`],
          teach: 'Aberration tilts every direction towards the direction of motion: cos θ′ = (cos θ + β)/(1 + β cos θ).',
          explain: t`$\cos\theta' = ${nice(Math.cos(ans / DEG), 4)}$, so $\theta' = ${nice(ans, 4)}^\circ$ — ${nice(th - ans, 3)}° further forward than in the galaxy’s frame.`,
        };
      },
    }),
    num({
      id: 'forward-share', difficulty: 2,
      gen(r) {
        const b = r.pick([0.5, 0.8, 0.95, 0.3]);
        const ans = (1 + b) / 2 * 100;
        return {
          prompt: t`Stars are spread evenly over the sky in the galaxy’s frame, so the fraction with $\cos\theta > c$ is $(1 - c)/2$. A ship moves at $\beta = ${b}$. What percentage of the stars does it see in the front half of its sky ($\theta' < 90^\circ$)?`,
          visual: sky({ b, arrows: false, caption: t`Gold: where a ship at $\beta = ${b}$ sees twelve stars that are spaced every $30^\circ$ in the galaxy’s frame (grey rings). One plane through the sky.` }),
          answer: ans, units: '%', tol: { rel: 0.002 },
          errors: [{ value: 50, feedback: 'Half is the answer at rest. Find which galaxy-frame directions end up in front: θ′ = 90° comes from cos θ = −β.' }, { value: (1 - b) / 2 * 100, feedback: 'That is the share behind. The stars crowd forward.' }],
          hints: [t`Set $\cos\theta' = 0$: $\cos\theta + \beta = 0$, so the boundary is $\cos\theta = -\beta$.`, t`Every star with $\cos\theta > -\beta$ appears in front: a fraction $(1 + \beta)/2$.`],
          teach: 'A ship at speed β sees a fraction (1 + β)/2 of an even sky in its front hemisphere.',
          explain: t`The boundary is $\cos\theta = -${b}$, so $(1 + ${b})/2 = ${nice(ans, 4)}\%$ of the stars appear ahead.`,
        };
      },
    }),
    mcq({
      id: 'transverse', difficulty: 3,
      prompt: t`A satellite carrying a clock flies past a ground station at high speed. Which statement about the “transverse” Doppler effect is right?`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.7, 1.7], y: [-0.35, 1.35], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
          curves: [{ param: ['t', '1'], t: [-1.6, 1.6], color: 'accent', width: 1.2, dash: true }],
          arrows: [
            { from: [0.55, 1], to: [1.05, 1], color: 'accent', width: 2.4, label: 'satellite velocity', labelDx: 4, labelDy: -10 },
            { from: [0, 1], to: [0, 0.04], color: 'warn', width: 2.2, label: '90° in the station’s frame', labelDx: 8, labelDy: -40 },
            { from: [-0.6, 1], to: [-0.03, 0.04], color: 'gold', width: 2.2, dash: true, label: '90° in the satellite’s frame', labelDx: -12, labelDy: -60, labelAlign: 'right' },
          ],
          points: [{ x: 0, y: 0, r: 5, color: 'violet', label: 'ground station', labelDx: 10, labelDy: 14 }, { x: 0.55, y: 1, r: 5, color: 'accent' }],
        },
        caption: 'Seen from above, in the station’s frame: two rays that reach the station, emitted at different moments of the pass. The tilt of the dashed ray is exaggerated; it is about v/c.',
      },
      choices: [
        t`Light that reaches the station travelling at $90^\circ$ to the satellite’s velocity **in the station’s frame** is redshifted by $1/\gamma$`,
        t`Light at $90^\circ$ to the velocity is unshifted in every frame, since there is no first-order effect`,
        t`Light at $90^\circ$ in the station’s frame is blueshifted by $\gamma$`,
        t`Light at $90^\circ$ is redshifted by $1/\gamma$ whichever frame the angle is measured in`,
      ],
      answer: 0,
      why: {
        1: t`The first-order term $\beta\cos\alpha$ vanishes, but the factor $\gamma$ remains: a second-order shift.`,
        2: t`That is light at $90^\circ$ in the *satellite’s* frame — light emitted while the satellite is still approaching, which reaches the station tilted from perpendicular by about $v/c$.`,
        3: t`Aberration means $90^\circ$ in one frame is not $90^\circ$ in the other; the two cases give $1/\gamma$ and $\gamma$.`,
      },
      hints: [t`Work in the station’s frame: there the satellite’s clock, which sets the emitted frequency, runs slow by $\gamma$.`, t`Light that is perpendicular in the station’s frame is not perpendicular in the satellite’s: aberration tilts it. So the two meanings of “$90^\circ$” give different answers.`],
      teach: 'The transverse Doppler shift is a redshift 1/γ for light perpendicular in the receiver’s frame and a blueshift γ for light perpendicular in the emitter’s frame.',
      explain: t`In the station’s frame the satellite’s clock runs slow by $\gamma$, and light arriving perpendicular has no first-order shift, so the station sees $E/\gamma$. Light perpendicular in the satellite’s frame is blueshifted by $\gamma$ — the worked example from the other side.`,
    }),
    num({
      id: 'radar', difficulty: 3,
      gen(r) {
        const v = r.pick([12, 17, 25, 40]), f = r.pick([7.2, 8.4]);
        const b = v * 1e3 / 299792458, ans = (f * 1e9 * ((1 - b) / (1 + b)) - f * 1e9) / 1e3;
        return {
          prompt: t`A radar sends a $${f}$ GHz signal to a probe receding at ${v} km/s along the line of sight, and a transponder on the probe sends back exactly the frequency it receives. Each leg multiplies the frequency by $\sqrt{(1 - \beta)/(1 + \beta)}$. By how many kHz is the returned signal shifted? (Negative means lower.)`,
          visual: st({ x: [-0.3, 3], t: [-0.2, 5.2], cones: [], numbers: false, xlabel: 'x', ylabel: 't',
            lines: [{ pts: [[0, -0.2], [0, 5.2]], color: 'violet', width: 2.2, label: 'Earth', at: 0, dx: 8, dy: 40 }, { pts: [[1, -0.2], [2.5, 5.2]], color: 'accent', width: 2.2, label: 'probe', at: 0, dx: 8, dy: 40 },
              { pts: [[0, 0.3], [1.5769, 1.8769]], color: 'warn', width: 1.4 }, { pts: [[1.5769, 1.8769], [0, 3.4538]], color: 'warn', width: 1.4 }],
            caption: 'A radar pulse out and back on a spacetime diagram, c = 1. The probe’s speed is hugely exaggerated so that its worldline visibly tilts.' }),
          answer: ans, units: 'kHz', tol: { rel: 0.002 },
          errors: [{ value: ans / 2, feedback: 'That is one leg only. The signal is shifted on the way out and again on the way back.' }, { value: -ans, feedback: 'A receding probe returns a lower frequency.' }],
          hints: [t`$\beta = v/c = ${tex(b, 4)}$; the round trip multiplies by $(1 - \beta)/(1 + \beta)$.`, t`Shift $= f\left[\frac{1 - \beta}{1 + \beta} - 1\right] = -\frac{2\beta}{1 + \beta}f \approx -2\beta f$.`],
          teach: 'Two-way tracking doubles the Doppler shift: a receding probe returns f(1 − β)/(1 + β).',
          explain: t`$-\dfrac{2\beta}{1 + \beta}f = ${nice(ans, 5)}$ kHz. The second-order part, about $2\beta^2 f$, is only $${nice(2 * b * b * f * 1e9, 2)}$ Hz — but deep-space tracking resolves frequencies far more finely than that, so the exact formula is the one used.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-synchrotron', difficulty: 3, transfer: true,
      gen(r) {
        const [name, EG] = r.pick([['Diamond Light Source, 3 GeV', 3], ['the ESRF, 6 GeV', 6], ['SPring-8, 8 GeV', 8]]);
        const g = EG * 1e3 / ME, ans = Math.asin(1 / g) * 1e3;
        return {
          prompt: t`At a synchrotron light source (${name}) electrons circle with that energy. Light emitted sideways in an electron’s own frame comes out in the laboratory at the angle where $\cos\theta = \beta$, that is $\sin\theta = 1/\gamma$: everything the electron sends forward in its own frame is squeezed inside this cone. What is its half-angle, in milliradians? ($m_e = 0.511$ MeV.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.2], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
              curves: [{ param: ['3*t', '3*t*0.35'], t: [0, 1], color: 'warn', dash: true, width: 1.4 }, { param: ['3*t', '-3*t*0.35'], t: [0, 1], color: 'warn', dash: true, width: 1.4 }],
              shade: [{ fn: '0.35*x', lower: '-0.35*x', from: 0, to: 3, color: 'warn', alpha: 0.15 }],
              arrows: [{ from: [0, 0], to: [0.9, 0], color: 'accent', width: 2.6, label: 'electron', labelDy: 16 }],
              points: [label(2.2, 1.05, 'cone of half-angle θ', 'warn', 0, 0)] },
            caption: 'The forward cone of light from an electron. The angle is drawn thousands of times wider than it really is; real synchrotron light is also spread by the orbit’s curve.',
          },
          answer: ans, units: 'mrad', tol: { rel: 0.003 },
          errors: [{ value: Math.asin(1 / g), feedback: 'That is in radians. Multiply by 1000 for milliradians.' }],
          hints: [t`$\gamma = E/m_e = ${EG}\ \text{GeV}/0.511\ \text{MeV}$.`, t`$\theta \approx 1/\gamma$ when $\gamma$ is large.`],
          teach: 'Light from an ultra-relativistic emitter is beamed into a cone of half-angle about 1/γ.',
          explain: t`$\gamma = ${nice(g, 4)}$, so $\theta = 1/\gamma = ${nice(ans, 3)}$ mrad — a beam narrower than a laser pointer’s, which is what makes these X-ray sources so bright. (Real synchrotron emission is not even in the electron’s frame, but its spread in the laboratory is of this same order, $1/\gamma$.)`,
        };
      },
    }),
    num({
      id: 'cp-star', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([120, 135, 60]), b = r.pick([0.6, 0.9]);
        const ans = dopp(th, b);
        return {
          prompt: t`An interstellar ship moves at $\beta = ${b}$. A star lies $${th}^\circ$ from the ship’s direction of motion in the galaxy’s frame. By what factor is the star’s light shifted in energy as the ship receives it? (The light travels towards the ship, opposite to the direction to the star.)`,
          visual: sky({ b, mark: th, caption: t`At $\beta = ${b}$: the larger highlighted dot is where the ship sees the star in question; its labelled grey ring is where the galaxy’s frame puts it.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: gam(b) * (1 - b * Math.cos(th / DEG)), feedback: t`The light travels *towards* the ship, so its direction of travel makes angle $${180 - th}^\circ$ with the velocity: $\cos\alpha = -\cos${th}^\circ$.` }, { value: Math.sqrt((1 + b) / (1 - b)), feedback: 'That is the factor for a star straight ahead. Use the angle.' }],
          hints: [t`$E_{\text{ship}}/E = \gamma(1 - \beta\cos\alpha)$ with $\alpha = 180^\circ - ${th}^\circ$.`, t`That is $\gamma(1 + \beta\cos${th}^\circ)$.`],
          teach: 'For a star at angle θ from the direction of motion, the ship measures γ(1 + β cos θ) times the energy.',
          explain: t`$${nice(gam(b), 4)}\times(1 + ${b}\cos${th}^\circ) = ${nice(ans, 4)}$${ans > 1 ? ': blueshifted' : ': redshifted'}. The ship sees the star $${nice(aberr(th, b), 3)}^\circ$ from straight ahead.`,
        };
      },
    }),
    mcq({
      id: 'cp-null', difficulty: 2,
      prompt: t`A photon’s energy and direction both change from one frame to another. What stays the same for every observer?`,
      visual: arrowsInSpace({ alpha: 70, b: 0.7, caption: 'One photon and one observer, drawn in the laboratory. Another frame would draw a different energy and a different angle.' }),
      choices: [t`$\mathbf k\cdot\mathbf k = 0$: it is null and moves at $c$`, 'Its frequency', 'The angle between its direction and the observer’s velocity', 'Its wavelength'],
      answer: 0,
      why: {
        1: t`The frequency is $-\mathbf k\cdot\mathbf u/h$: it depends on which observer $\mathbf u$.`,
        2: 'Aberration changes the angle.',
        3: 'Wavelength shifts with frequency, since their product is c.',
      },
      hints: ['Which quantity is a dot product that involves no observer at all?'],
      teach: 'Frequency and direction belong to an observer; only invariants such as k·k = 0 belong to the photon alone.',
      explain: t`$\mathbf k\cdot\mathbf k = -E^2 + E^2 = 0$ in every frame: the light is on the light cone, moving at $c$, for everyone.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.4–5.5 (light rays, the Doppler shift as −k·u)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Rindler, Relativity: Special, General, and Cosmological, §4.4 (Doppler effect and aberration)', url: 'https://global.oup.com/academic/product/relativity-9780198567325' },
    { label: 'Diamond Light Source: machine parameters (3 GeV storage ring)', url: 'https://www.diamond.ac.uk/Science/Machine.html' },
  ],
});
