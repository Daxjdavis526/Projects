// The quadrupole formula, dissected: h^TT_ij = (2G/c⁴r) Q̈^TT_ij(t − r/c) and
// P = (G/5c⁵)⟨⃛Q_ij ⃛Q_ij⟩, with Q_ij = ∫ρ(x_i x_j − ⅓δ_ij r²)d³x the reduced
// quadrupole moment. Checked by hand and in code: two masses on a circular
// orbit (reduced mass μ, separation a, orbital angular frequency ω) give a
// face-on amplitude 4Gμa²ω²/(c⁴r) = 4(G𝓜/c²)^{5/3}(πf/c)^{2/3}/r and power
// (32/5)(G/c⁵)μ²a⁴ω⁶; seen edge-on, h₊ only, at half the amplitude; a star of
// ellipticity ε spinning at Ω gives 4GεIΩ²/(c⁴r) at twice the spin frequency.
// Avoids repeating gr.S27.i (ring, ΔL = hL, chirp mass, time to merger, energy
// radiated, Earth–Sun power, Hulse–Taylor decay) and gr.S21.i (the ISCO frequency).
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, PC, MPC, sci, round } from './_eq.js';
import { fISCO, fContact } from '../../src/viz/model/gr-waves.js';

const t = String.raw;

const G_C4 = G / C ** 4;                 // N⁻¹
const C5_G = C ** 5 / G;                 // W, the natural unit of gravitational luminosity

// ── pictures ────────────────────────────────────────────────────────────────

const arc = (cx, cy, R, a0, a1, color = 'accent') => ({
  curve: { param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [a0, a1], color, width: 1.6 },
  arrow: { from: [round(cx + R * Math.cos(a1 - 0.22), 4), round(cy + R * Math.sin(a1 - 0.22), 4)], to: [round(cx + R * Math.cos(a1 + 0.05), 4), round(cy + R * Math.sin(a1 + 0.05), 4)], color },
});
const circle = (cx, cy, R, color = 'teal', width = 2.4, dash = false) => ({ param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [0, 6.2832], color, width, ...(dash ? { dash: true } : {}) });
const tag = (x, y, label, color = 'ink2') => ({ x, y, r: 0.01, color, label, labelDx: -Math.round(label.length * 3.3), labelDy: 0 });

// four candidate sources, one per quadrant
function fourSources() {
  const curves = [], arrows = [], points = [];
  // tumbling bar
  {
    const [cx, cy] = [-2.4, 1.2], ux = round(0.62 * Math.cos(0.5236), 4), uy = round(0.62 * Math.sin(0.5236), 4);
    curves.push({ param: [`${cx} + ${ux}*t`, `${cy} + ${uy}*t`], t: [-1, 1], color: 'ink2', width: 3 });
    points.push({ x: round(cx + ux, 4), y: round(cy + uy, 4), r: 6, color: 'gold' }, { x: round(cx - ux, 4), y: round(cy - uy, 4), r: 6, color: 'gold' });
    const a = arc(cx, cy, 0.92, 1.25, 2.55);
    curves.push(a.curve); arrows.push(a.arrow);
    points.push(tag(cx, cy - 1.12, 'tumbling bar'));
  }
  // spherical collapse
  {
    const [cx, cy] = [2.4, 1.2];
    curves.push(circle(cx, cy, 0.42));
    for (let k = 0; k < 8; k++) {
      const th = (k * Math.PI) / 4 + Math.PI / 8;
      arrows.push({ from: [round(cx + 0.95 * Math.cos(th), 4), round(cy + 0.95 * Math.sin(th), 4)], to: [round(cx + 0.6 * Math.cos(th), 4), round(cy + 0.6 * Math.sin(th), 4)], color: 'warn' });
    }
    points.push(tag(cx, cy - 1.12, 'spherical collapse'));
  }
  // smooth star spinning
  {
    const [cx, cy] = [-2.4, -1.35];
    curves.push(circle(cx, cy, 0.55));
    const a = arc(cx, cy, 0.82, 0.35, 2.3);
    curves.push(a.curve); arrows.push(a.arrow);
    points.push(tag(cx, cy - 1.12, 'smooth star spinning'));
  }
  // star moving steadily
  {
    const [cx, cy] = [2.4, -1.35];
    curves.push(circle(cx - 0.45, cy, 0.42));
    arrows.push({ from: [cx + 0.1, cy], to: [cx + 0.95, cy], color: 'accent' });
    points.push(tag(cx, cy - 1.12, 'star moving steadily'));
  }
  return {
    type: 'graph',
    params: { x: [-4.7, 4.7], y: [-2.75, 2.45], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption: 'Four moving masses (not to scale). Arrows show how each one moves.',
  };
}

// two unequal stars and their centre of mass
const binaryCM = {
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.45, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [circle(0, 0, 0.6, 'ink4', 1.2, true), circle(0, 0, 1.2, 'ink4', 1.2, true)],
    points: [
      { x: 0.6, y: 0, color: 'gold', r: 9, label: 'mass 2m', labelDx: 12, labelDy: 0 },
      { x: -1.2, y: 0, color: 'accent', r: 6, label: 'mass m', labelDx: -62, labelDy: 0 },
      { x: 0, y: 0, color: 'ink', r: 3, label: 'centre of mass', labelDx: -44, labelDy: 16 },
    ],
    arrows: [{ from: [0.6, 0], to: [0.6, 0.45], color: 'gold' }, { from: [-1.2, 0], to: [-1.2, -0.9], color: 'accent' }],
  },
  caption: 'Two stars of unequal mass in orbit. Each swings around the centre of mass; their velocities (arrows) are always opposite, with the lighter star moving twice as fast.',
};

// Q_xx of a binary over two orbits
const qxx = {
  type: 'graph',
  params: {
    x: [0, 2.32], y: [-0.5, 0.9], xlabel: 'time (orbits)', ylabel: 'Qₓₓ ÷ μa²',
    curves: [{ fn: 'cos(6.28319*x)^2 - 1/3', domain: [0, 2], color: 'accent', width: 2.4 }],
    vlines: [{ x: 1, label: 'one orbit' }, { x: 2, label: 'two orbits' }],
  },
  caption: t`One component of a circular binary's quadrupole moment, $Q_{xx} = \mu a^2(\cos^2\omega t - \tfrac13)$, over two orbits ($\mu$ the reduced mass, $a$ the separation, $\omega$ the orbital angular frequency). Count the peaks in one orbit.`,
};

// the sphere a detector reaches, before and after an upgrade
const reach = (k) => ({
  type: 'graph',
  params: {
    x: [-(k + 0.5), k + 0.5], y: [-(k + 0.35), k + 0.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [circle(0, 0, 1, 'accent', 2, true), circle(0, 0, k, 'teal', 2.4)],
    points: [
      { x: 0, y: 0, r: 5, color: 'ink', label: 'detector', labelDx: -24, labelDy: 14 },
      { x: 0, y: 1, r: 0.01, color: 'accent', label: 'reach today', labelDx: -33, labelDy: -10 },
      { x: 0, y: k, r: 0.01, color: 'teal', label: 'reach after the upgrade', labelDx: -70, labelDy: -10 },
    ],
  },
  caption: 'A slice through the sphere of space a detector can hear, before and after an upgrade (not to scale). Sources are scattered through the volume.',
});

// a binary orbit before and after it shrinks by a factor k
const shrink = (k) => ({
  type: 'graph',
  params: {
    x: [-2.3, 2.3], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [circle(0, 0, 1, 'ink4', 1.4, true), circle(0, 0, round(1 / k, 4), 'accent', 1.8)],
    points: [
      { x: 1, y: 0, r: 6, color: 'gold', label: 'before', labelDx: 12, labelDy: 0 }, { x: -1, y: 0, r: 6, color: 'gold' },
      { x: round(1 / k, 4), y: 0, r: 5, color: 'accent' }, { x: -round(1 / k, 4), y: 0, r: 5, color: 'accent' },
      { x: 0, y: round(1 / k, 4), r: 0.01, color: 'accent', label: 'after', labelDx: -14, labelDy: -12 },
    ],
  },
  caption: `The same two stars before (dashed) and after (solid) their orbit has shrunk by a factor of ${k}.`,
});

// an orbit in perspective, with an observer on its axis and one in its plane
const views = {
  type: 'graph',
  params: {
    x: [-4.2, 4.6], y: [-1.5, 3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['1.5*cos(t)', '0.42*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true },
      { param: ['0', 't'], t: [-1.2, 1.4], color: 'ink4', width: 1, dash: true },
    ],
    points: [
      { x: 1.06, y: 0.297, r: 7, color: 'gold' }, { x: -1.06, y: -0.297, r: 7, color: 'accent' },
      { x: 0, y: 2.62, r: 5, color: 'ink', label: 'face-on observer (on the axis)', labelDx: 12, labelDy: 0 },
      { x: 4.1, y: 0, r: 5, color: 'ink', label: 'edge-on observer', labelDx: -54, labelDy: 18 },
    ],
    arrows: [{ from: [0, 2.4], to: [0, 1.2], color: 'ink2' }, { from: [3.85, 0], to: [2.1, 0], color: 'ink2' }],
  },
  caption: 'A binary’s orbit drawn in perspective (dashed ellipse), its axis (dashed line), and two distant observers: one looking down the axis, one in the plane of the orbit.',
};

// a neutron star seen along its spin axis, with a (hugely exaggerated) bump
const crabPic = (() => {
  const a = arc(0, 0, 1.32, 0.45, 2.45);
  return {
    type: 'graph',
    params: {
      x: [-2.6, 2.6], y: [-1.5, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['1.06*cos(t)', '0.94*sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.6 }, a.curve],
      arrows: [a.arrow],
      points: [{ x: 1.06, y: 0, r: 6, color: 'warn', label: 'mountain', labelDx: 12, labelDy: 0 }],
    },
    caption: 'A neutron star seen along its spin axis, made slightly non-round by a “mountain”. The bulge is drawn about a thousand times too large.',
  };
})();

// GW150914 as seen at the Earth: masses 1.09 × (36, 29) M☉, so G𝓜/c² ≈ 45.2 km
const GMC2 = 45.2e3, R150914 = 410 * MPC;
const hCirc = (f, gm = GMC2, r = R150914) => (4 / r) * gm ** (5 / 3) * ((Math.PI * f) / C) ** (2 / 3);
const F_ISCO = fISCO(65 * 1.09), F_END = fContact(65 * 1.09);
// the strain along the chirp, with no vertical scale, so the question does not print its answer
const chirpStrain = (f) => ({
  type: 'graph',
  params: {
    x: [0, 340], y: [0, 2.6], xlabel: 'gravitational-wave frequency f (Hz)', ylabel: 'strain h (scale left off)', yticks: 0,
    shade: [{ fn: '2.6', lower: '0', from: round(F_ISCO, 1), to: round(F_END, 1), color: 'warn', alpha: 0.1 }],
    curves: [{ fn: '(x/100)^(2/3)', domain: [20, round(F_END, 1)], color: 'accent', width: 2.4 }],
    vlines: [{ x: f, label: `${f} Hz`, color: 'gold' }],
    points: [{ x: 205, y: 2.4, r: 0.01, color: 'warn', label: 'last orbits: formula rough', labelDx: -72, labelDy: 0 }],
  },
  caption: t`The strain along GW150914's chirp grows as $f^{2/3}$ while the frequency climbs. Shaded: inside the innermost stable orbit of the total mass (above about ${Math.round(F_ISCO)} Hz) the leading-order formula is only a rough guide; it is left off where the horizons would touch.`,
});

// the Crab pulsar with ε = 10⁻⁴
const CRAB = { f: 29.6, I: 1e38, eps: 1e-4, r: 2000 * PC };
const OMEGA = 2 * Math.PI * CRAB.f;
const H_CRAB = ((2 * G) / (C ** 4 * CRAB.r)) * 2 * CRAB.eps * CRAB.I * OMEGA ** 2;

export default lesson({
  id: 'gr.EQ.13',
  kind: 'dissection',
  title: 'The quadrupole formula',
  minutes: 9, difficulty: 3,
  badges: ['est-der', 'est-obs'],
  equation: t`\begin{gathered}\part{1}{h^{\mathrm{TT}}_{ij}} = \part{2}{\frac{2G}{c^4 r}}\,\part{3}{\ddot Q^{\mathrm{TT}}_{ij}}\part{4}{(t - r/c)} \\[6pt] \part{5}{P} = \part{6}{\frac{G}{5c^5}}\,\part{7}{\big\langle \dddot Q_{ij}\,\dddot Q_{ij}\big\rangle} \\[6pt] \part{8}{Q_{ij} = \int\rho\,\big(x_ix_j - \tfrac13\delta_{ij}r^2\big)\,d^3x}\end{gathered}`,
  intro: t`The linearized field equations say that moving matter sends out ripples in spacetime. The quadrupole formula, which Einstein found in 1918, says how large they are and how much energy they carry, for a source that moves slowly compared with light: the wave is set by how fast the source's **quadrupole moment** — its departure from round — is changing. There is no monopole or dipole term. It is the formula behind the binary-pulsar test of general relativity and the size of every chirp LIGO hears.

Conventions: $G$ and $c$ shown. The indices $i, j$ label the space directions $x, y, z$ and are summed when repeated; in these flat Cartesian coordinates there is no difference between upper and lower ones. The source sits at the origin and the observer at distance $r$, many wavelengths away. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`h^{\mathrm{TT}}_{ij}`, name: 'the wave, as a detector meets it', badge: 'est-obs', units: 'dimensionless (a strain)',
      text: t`The ripple in the space part of the metric, $g_{ij} = \delta_{ij} + h_{ij}$, far from the source, written in the **transverse–traceless** (TT) gauge: only components across the line of sight survive, with their trace removed. That leaves two numbers, the polarizations $h_+$ and $h_\times$.

It is a strain: an arm of length $L$ across the line of sight changes length by about $\tfrac12 hL$. LIGO and Virgo have measured strains near $10^{-21}$ since 2015, with the shapes this formula and its higher-order corrections predict.`,
    },
    {
      tex: t`\frac{2G}{c^4 r}`, name: 'stiff spacetime, and the 1/r of radiation', badge: 'est-der', units: t`$\text{J}^{-1}$`,
      text: t`$G/c^4 = ${sci(G_C4)}\ \text{N}^{-1}$ is the same tiny number as in Einstein's equations: spacetime is very stiff, so even violent sources make small strains.

The amplitude falls as $1/r$, not $1/r^2$ — the signature of radiation. The energy flux goes as the square of the wave's rate of change, so it falls as $1/r^2$ and the energy crossing every sphere is the same. Detectors measure $h$ itself, so making one twice as sensitive doubles its reach.`,
    },
    {
      tex: t`\ddot Q^{\mathrm{TT}}_{ij}`, name: 'the changing shape of the source', badge: 'est-der', units: t`$\text{J} = \text{kg}\,\text{m}^2/\text{s}^2$`,
      text: t`The second time derivative (each dot is $d/dt$) of the quadrupole moment $Q_{ij}$, keeping only its TT part for the observer's direction. It has the units of energy: for two stars of reduced mass $\mu$ and relative speed $v$ on a circular orbit, seen face-on, its amplitude is $2\mu v^2$ — four times their orbital kinetic energy.

Why the quadrupole? The monopole, the total mass, is conserved. The dipole $\int\rho\,x_i\,d^3x = Mx^\text{cm}_i$ has second derivative $M$ times the centre of mass's acceleration, zero for an isolated source. Derived for slow ($v \ll c$), weakly self-gravitating sources, the formula works for neutron stars too, as binary pulsars show; in the last orbits before a merger higher-order corrections take over.`,
    },
    {
      tex: t`(t - r/c)`, name: 'the retarded time', badge: 'est-obs', units: t`$\text{s}$`,
      text: t`The wave arriving now at distance $r$ left the source a time $r/c$ ago: it carries the source's quadrupole as it was then. GW150914, recorded in 2015, came from black holes that merged about 1.3 billion years earlier. That the waves travel at exactly $c$ was confirmed in 2017, when gravitational waves and gamma rays from one neutron-star merger arrived 1.7 s apart after 130 million years.`,
    },
    {
      tex: t`P`, name: 'the power radiated', badge: 'est-obs', units: t`$\text{W}$`,
      text: t`The energy per second carried away by the waves in all directions. It comes out of the source's orbital energy, so orbits shrink and periods shorten.

Confirmed by the Hulse–Taylor binary pulsar: after correcting for the pulsar's motion through the Galaxy, its orbit decays at $0.998 \pm 0.002$ times the predicted rate (Weisberg and Huang, 2016).`,
    },
    {
      tex: t`\frac{G}{5c^5}`, name: 'the coupling for power', badge: 'est-der', units: t`$\text{W}^{-1}$`,
      text: t`$c^5/G = ${sci(C5_G)}$ W is the natural unit of gravitational luminosity, and $G/c^5$ is its inverse: again tiny. A source radiates a sizeable fraction of $c^5/G$ only when its masses move near the speed of light close to their own horizons. GW150914 peaked at about $3.6\times10^{49}$ W, a thousandth of $c^5/G$ — briefly more than all the starlight in the observable universe.

The $\tfrac15$ comes from adding up the TT parts over every direction. (Books that define the quadrupole three times larger write $G/(45c^5)$.)`,
    },
    {
      tex: t`\big\langle \dddot Q_{ij}\,\dddot Q_{ij}\big\rangle`, name: 'the third derivative, squared and averaged', badge: 'est-der', units: t`$\text{W}^2$`,
      text: t`Three dots: $d^3/dt^3$. Both indices are summed over $x, y, z$ — all nine products — so the result is the same in any rotated axes. The angle brackets average over several wave periods: the energy of a gravitational wave can only be defined averaged over a few wavelengths.

For a binary $\dddot Q \sim \mu a^2\omega^3$, with $a$ the separation and $\omega$ the orbital angular frequency, so the power climbs steeply as the orbit tightens.`,
    },
    {
      tex: t`Q_{ij} = \int\rho\,\big(x_ix_j - \tfrac13\delta_{ij}r^2\big)\,d^3x`, name: 'the reduced quadrupole moment', badge: 'math', units: t`$\text{kg}\,\text{m}^2$`,
      text: t`The mass distribution's second moment with its trace removed: $\rho$ is the mass density, $x_i$ the position measured from the centre of mass, $r^2 = x^2 + y^2 + z^2$ and $\delta_{ij}$ the Kronecker delta (1 if $i = j$, otherwise 0). The integral runs over the source.

Removing the trace makes $Q_{ij}$ zero for any spherical body, however it moves: a sphere cannot radiate. Notation varies from book to book: $Q_{ij}$, $J_{ij}$, or an $I$ with a bar through it.`,
    },
  ],
  readAloud: t`Far from a slowly moving source, the gravitational wave's strain is 2G over c⁴r times the second time derivative of the source's trace-free quadrupole moment, taken across the line of sight and at the moment the wave left, and the power radiated is G over 5c⁵ times the average of the squared third derivative.`,
  why: t`It turns a moving source into a predicted signal: it explained the shrinking orbit of the first binary pulsar, and it sets the size and the rising pitch of every chirp LIGO hears.`,
  visual: {
    type: 'gr-chirp',
    title: 'The formula, applied to two black holes',
    lead: t`The trace on the right is $h^{\mathrm{TT}}$ from this formula for two black holes on a slowly shrinking circular orbit, seen face-on; the ring on the left shows the strain it would cause, hugely exaggerated. Press **Play**.`,
    tasks: [
      t`Double the distance $D$: the strain halves — the $1/r$ of the second card.`,
      t`Watch the frequency climb as the orbit shrinks. The waves come at twice the orbital frequency, because two stars look the same after half a turn, so $Q_{ij}$ repeats twice an orbit.`,
      t`Raise both masses: the strain grows, because heavier stars on a faster orbit make a larger $\ddot Q_{ij}$.`,
    ],
    params: { m1: 36, m2: 29, D: 410, p: 0.6 },
  },
  practice: [
    mcq({
      id: 'sources', difficulty: 1,
      prompt: t`$$h^{\mathrm{TT}}_{ij} = \frac{2G}{c^4 r}\,\underbrace{\ddot Q^{\mathrm{TT}}_{ij}}_{\text{?}}(t - r/c)$$ The marked factor is the source's changing quadrupole moment. Which of the four sources in the picture sends out gravitational waves?`,
      choices: [
        'The tumbling bar',
        'The spherical collapse',
        'The smooth star spinning',
        'The star moving steadily',
      ],
      answer: 0,
      why: {
        1: t`However fast it falls inward, a spherical body has $Q_{ij} = 0$ at every instant — the trace-free part of a sphere's second moment vanishes — so $\ddot Q_{ij} = 0$. (Birkhoff's theorem says the same, exactly: the field outside stays Schwarzschild's.)`,
        2: t`Spinning about its axis of symmetry, it looks the same at every instant, so $Q_{ij}$ is constant. Give it a bump — a "mountain" — and it would radiate.`,
        3: t`A steadily moving star carries its static field along; in its own rest frame nothing moves at all. $\ddot Q_{ij}$ is constant, nothing oscillates, and $\dddot Q_{ij} = 0$ means it radiates no power.`,
      },
      hints: [t`Ask of each source: does its shape, seen from outside, keep changing?`],
      teach: 'Only a changing departure from roundness — a changing quadrupole moment — radiates gravitational waves.',
      explain: t`Seen from a fixed direction, the tumbling bar's mass distribution changes shape twice each turn, so its $\ddot Q_{ij}$ oscillates and it radiates. The spherical collapse and the smooth spinning star keep $Q_{ij}$ fixed (zero, for the sphere); the steadily moving star has $\dddot Q_{ij} = 0$.`,
      visual: fourSources(),
    }),
    mcq({
      id: 'dipole', difficulty: 2,
      prompt: t`In electromagnetism the strongest radiation comes from an oscillating electric dipole. Gravity's analogue is the mass dipole $d_i = \int\rho\,x_i\,d^3x$. Why does it radiate nothing?`,
      choices: [
        t`$d_i = M\,x^\text{cm}_i$, so $\ddot d_i$ is $M$ times the acceleration of the centre of mass — zero for an isolated source, whose total momentum is conserved`,
        'There are no negative masses, so the dipole moment of any body is zero',
        'Dipole waves are emitted, but they are far too weak to detect',
        'The two stars’ dipoles cancel only when their masses are equal, so only equal-mass binaries are silent at dipole order',
      ],
      answer: 0,
      why: {
        1: t`The dipole moment is not zero: it is the total mass times the position of the centre of mass. Having no negative mass matters because it ties the dipole to the centre of mass, whose motion momentum conservation fixes.`,
        2: t`Not weak — exactly zero: $\ddot d_i = 0$ for any isolated source, whatever it is doing inside.`,
        3: 'Unequal masses do not help: whatever the masses, the centre of mass stays put. (Some alternative theories of gravity do predict dipole radiation from unequal compact stars; binary pulsars rule it out to high precision.)',
      },
      hints: [t`Divide $\int\rho\,x_i\,d^3x$ by the total mass $M$: what point is that?`],
      teach: 'The mass dipole is the total mass times the centre of mass, which cannot accelerate in an isolated system — so gravitational radiation starts at the quadrupole.',
      explain: t`$\int\rho\,x_i\,d^3x = M\,x^\text{cm}_i$ and $\ddot d_i = M\,\ddot x^\text{cm}_i = \dot p_i = 0$. In electromagnetism positive and negative charges can slosh in opposite directions while the centre of mass stays still; with one sign of mass that cannot happen. The first moment that can change in an isolated system is the quadrupole.`,
      visual: binaryCM,
    }),
    num({
      id: 'doubling', difficulty: 2,
      gen(r) {
        const [name, P, mins] = r.pick([
          ['HM Cancri', 321.5, '5.36'],
          ['ZTF J1539+5027', 414.8, '6.91'],
          ['SDSS J0651+2844', 765, '12.75'],
        ]);
        return {
          prompt: t`The two white dwarfs of ${name} orbit each other every ${mins} minutes. At what frequency, in millihertz, do their gravitational waves arrive? (The space detector LISA, due in the 2030s, will listen from about 0.1 mHz to 0.1 Hz.)`,
          answer: (2 / P) * 1e3, units: 'mHz', tol: { rel: 0.01 },
          errors: [
            { value: (1 / P) * 1e3, feedback: 'That is the orbital frequency. Two stars look the same after half a turn, so the quadrupole moment — and the wave — repeats twice an orbit.' },
            { value: ((4 * Math.PI) / P) * 1e3, feedback: 'That is an angular frequency, in rad/s × 1000. Divide by 2π to get cycles per second.' },
          ],
          hints: [t`In the picture, how many times does $Q_{xx}$ peak in one orbit?`, t`$f = 2/P$ with $P = ${mins}\times60 = ${P}$ s.`],
          teach: 'A binary radiates at twice its orbital frequency, because its quadrupole moment repeats every half orbit.',
          explain: t`$f = 2/P = 2/${P}\ \text{s} = ${sci((2 / P) * 1e3)}$ mHz — in LISA's band. These "verification binaries" are known from telescopes, so LISA should hear them as soon as it switches on.`,
          visual: qxx,
        };
      },
    }),
    num({
      id: 'falloff', difficulty: 2,
      gen(r) {
        const k = r.pick([1.5, 2, 3]);
        return {
          prompt: t`$$h^{\mathrm{TT}}_{ij} = \underbrace{\frac{2G}{c^4 r}}_{\text{?}}\,\ddot Q^{\mathrm{TT}}_{ij}(t - r/c)$$ The marked factor makes the strain fall as $1/r$. An upgrade lets a detector measure strains ${k} times smaller than before. By what factor does the volume of space it can hear — and so, roughly, the number of sources it can detect — grow?`,
          answer: k ** 3, tol: { rel: 0.01 },
          errors: [
            { value: k, feedback: 'That is how much farther it reaches. The volume grows as the cube of the reach.' },
            { value: k ** 2, feedback: 'The sources fill a volume, not an area: the cube of the reach.' },
            { value: k ** 1.5, feedback: 'That would be right for a telescope, which measures energy flux, falling as 1/r². A gravitational-wave detector measures the amplitude h itself, falling as 1/r.' },
          ],
          hints: ['If h ∝ 1/r, how much farther away can a source be and still produce the smallest measurable strain?', 'The volume of a sphere grows as its radius cubed.'],
          teach: 'Because the strain itself falls as 1/r, each factor of k in a detector’s sensitivity multiplies its reach by k and its volume by k³.',
          explain: t`The reach grows by ${k}, so the volume grows by $${k}^3 = ${round(k ** 3, 3)}$. That is why every factor of two in LIGO's strain sensitivity is worth about eight times as many detections.`,
          visual: reach(k),
        };
      },
    }),
    num({
      id: 'power-scaling', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 10]);
        return {
          prompt: t`For two stars on a circular orbit, $\dddot Q_{ij} \sim \mu a^2\omega^3$ ($\mu$ the reduced mass, $a$ the separation, $\omega$ the orbital angular frequency), so the power is $P \propto a^4\omega^6$. Kepler's third law says $\omega^2 = GM/a^3$. As radiation shrinks the orbit by a factor of ${k}, by what factor does the power radiated grow?`,
          answer: k ** 5, tol: { rel: 0.01 },
          errors: [
            { value: k ** 4, feedback: 'The orbital frequency changes too: a tighter orbit is faster, ω ∝ a^(−3/2).' },
            { value: k ** 9, feedback: 'ω⁶ ∝ a⁻⁹, but a⁴ shrinks: P ∝ a⁴ · a⁻⁹.' },
            { value: k ** -5, feedback: 'The power grows as the orbit shrinks — upside down.' },
          ],
          hints: [t`$\omega^6 = (GM/a^3)^3 \propto a^{-9}$.`, t`So $P \propto a^4\cdot a^{-9} = a^{-5}$.`],
          teach: 'For a circular binary the radiated power goes as the separation to the minus fifth power, so the inspiral runs away.',
          explain: t`$P \propto a^4\omega^6 \propto a^4a^{-9} = a^{-5}$: shrinking the orbit ${k} times raises the power $${k}^5 = ${sci(k ** 5)}$ times. The faster the orbit decays, the faster the power grows — which is why a chirp ends in a crescendo, with most of the energy radiated in the last orbits.`,
          visual: shrink(k),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gw150914', difficulty: 3,
      gen(r) {
        const f = r.pick([35, 45, 55]);
        const h = hCirc(f);
        return {
          prompt: t`For two masses on a circular orbit, seen face-on, the quadrupole formula gives a strain $h = \dfrac{4}{r}\left(\dfrac{G\mathcal{M}}{c^2}\right)^{5/3}\left(\dfrac{\pi f}{c}\right)^{2/3}$, with $f$ the gravitational-wave frequency and $\mathcal{M}$ the chirp mass. For GW150914, as seen from the Earth, $G\mathcal{M}/c^2 = 45.2$ km and $r = 410$ Mpc. What is $h$ when $f = ${f}$ Hz? (1 Mpc $= 3.086\times10^{22}$ m)`,
          answer: h, tol: { rel: 0.02 },
          errors: [
            { value: hCirc(f / 2), feedback: 'f here is the gravitational-wave frequency itself, not half of it.' },
            { value: h / 4, feedback: 'Keep the factor of 4 in front.' },
          ],
          hints: [t`$G\mathcal{M}/c^2 = 4.52\times10^{4}$ m and $r = 410\times3.086\times10^{22} = ${sci(R150914)}$ m.`, t`$\pi f/c = ${sci((Math.PI * f) / C)}\ \text{m}^{-1}$; raise it to the power $2/3$, and $(4.52\times10^{4})^{5/3} = ${sci(GMC2 ** (5 / 3))}$.`],
          teach: 'Applied to two black holes, the quadrupole formula gives strains near 10⁻²¹ at hundreds of megaparsecs — the size LIGO was built to measure.',
          explain: t`$h = 4\times${sci(GMC2 ** (5 / 3))}\times${sci(((Math.PI * f) / C) ** (2 / 3))}/${sci(R150914)} = ${sci(h)}$. That is the best case, face-on. GW150914 was not face-on, and a detector feels only part of a passing wave, so the strain LIGO recorded was smaller than this best case at every frequency: it peaked at about $1.0\times10^{-21}$ at the merger itself, near 150 Hz, where the face-on estimate is $${sci(hCirc(150))}$. A formula derived for slow sources still gets the size of the first signal ever detected right to within a factor of a few.`,
          visual: chirpStrain(f),
        };
      },
    }),
    mcq({
      id: 'cp-edge', difficulty: 2,
      prompt: t`An observer on a binary's axis, seeing the orbit face-on, receives both polarizations, $h_+$ and $h_\times$, at full strength. What does an observer in the plane of the orbit, seeing it edge-on, receive? Remember that $h^{\mathrm{TT}}_{ij}$ keeps only the part of $\ddot Q_{ij}$ across the line of sight.`,
      choices: [
        t`Only $h_+$, at half the face-on amplitude: the stars' motion along the line of sight is projected out`,
        'The strongest signal, because the stars move straight toward and away from the observer',
        'Nothing at all: the whole orbit lies along the line of sight',
        'The same as face-on: gravitational waves spread out equally in every direction',
      ],
      answer: 0,
      why: {
        1: 'Motion along the line of sight is exactly what the TT projection removes: gravitational waves are transverse.',
        2: t`Seen edge-on, the stars still swing from side to side across the sky, and that part of $\ddot Q_{ij}$ survives the projection.`,
        3: 'The pattern is not the same in every direction: on the axis the whole rotating quadrupole lies across the line of sight; in the plane only half of it does.',
      },
      hints: [t`Seen edge-on, the stars move side to side across the sky and toward and away from you. Which of those motions does the TT projection keep?`, t`Face-on, the strain is $(\ddot Q_{xx} - \ddot Q_{yy})/2$ along the axis $z$; edge-on from $x$, it is $(\ddot Q_{yy} - \ddot Q_{zz})/2$, and $Q_{zz}$ does not oscillate.`],
      teach: 'Gravitational waves are transverse: a binary seen edge-on sends only the + polarization, at half the face-on amplitude.',
      explain: t`Face-on, $h_+$ and $h_\times$ have equal amplitude (circular polarization). At inclination $\iota$ they are $\tfrac12(1 + \cos^2\iota)$ and $\cos\iota$ times the face-on value, so edge-on ($\iota = 90°$) $h_+$ is halved and $h_\times$ vanishes. LIGO uses the mix of polarizations to tell how a binary is tilted.`,
      visual: views,
    }),
    num({
      id: 'cp-crab', difficulty: 3, transfer: true,
      prompt: t`The Crab pulsar is a neutron star 2.0 kpc away, spinning 29.6 times a second, with moment of inertia $I \approx 10^{38}\ \text{kg m}^2$. A perfectly smooth one would be silent, but suppose a "mountain" makes it slightly non-round, with ellipticity $\varepsilon = 10^{-4}$. Seen along the spin axis, the TT part of $\ddot Q_{ij}$ then has amplitude $2\varepsilon I\Omega^2$, with $\Omega$ the angular speed of the spin. Use the quadrupole formula to estimate the strain at the Earth. (1 pc $= 3.086\times10^{16}$ m)`,
      answer: H_CRAB, tol: { rel: 0.02 },
      errors: [
        { value: H_CRAB / (4 * Math.PI ** 2), feedback: 'Ω is the angular speed: 2π × 29.6 rad/s, not 29.6.' },
        { value: H_CRAB / 2, feedback: 'The formula has 2G/(c⁴r), not G/(c⁴r).' },
        { value: H_CRAB * 4, feedback: 'Use the spin’s angular speed, 2π × 29.6 rad/s; the waves come out at twice the spin frequency, but 2εIΩ² already accounts for that.' },
      ],
      hints: [t`$\Omega = 2\pi\times29.6 = ${OMEGA.toFixed(1)}$ rad/s and $r = 2000\times3.086\times10^{16} = ${sci(CRAB.r)}$ m.`, t`$h = \dfrac{2G}{c^4r}\times2\varepsilon I\Omega^2$, with $2\varepsilon I\Omega^2 = ${sci(2 * CRAB.eps * CRAB.I * OMEGA ** 2)}$ J.`],
      teach: 'A spinning star with a slight bump radiates continuous gravitational waves at twice its spin frequency — far weaker than a merger’s chirp.',
      explain: t`$h = (2G/c^4r)\times2\varepsilon I\Omega^2 = ${sci((2 * G) / (C ** 4 * CRAB.r))}\ \text{J}^{-1}\times${sci(2 * CRAB.eps * CRAB.I * OMEGA ** 2)}\ \text{J} = ${sci(H_CRAB)}$, at $2\times29.6 = ${round(2 * CRAB.f, 1)}$ Hz. Such continuous waves would build up over months of data. LIGO and Virgo have searched the Crab for them and found none, so its mountains must be smaller than this; no pulsar has yet been heard.`,
      visual: crabPic,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §7.5–7.6 (radiation, energy loss)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Weisberg & Huang, “Relativistic measurements from timing the binary pulsar PSR B1913+16” (2016)', url: 'https://arxiv.org/abs/1606.02744' },
    { label: 'LIGO/Virgo, “Observation of gravitational waves from a binary black hole merger” (2016)', url: 'https://arxiv.org/abs/1602.03837' },
  ],
});
