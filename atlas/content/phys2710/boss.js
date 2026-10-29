// The PHYS 2710 boss, "The Quantum Threshold": two imagined spacecraft built
// from real parts. Halcyon is an infrared and X-ray observatory at the
// Sun–Earth L2 point; Petrel, its partner, is a plutonium-powered probe
// mapping a dark Kuiper-belt object 45 au out. Each problem mixes two or more
// of the course's skills the way their engineers would meet them — the
// sunshield's two Planck curves and the solar cell's band gaps under the
// Sun's spectrum; a cosmic ray weighed by curvature and time of flight, and
// a π⁰'s two photons on the calorimeter; Bohr's lines on a photocathode and
// Moseley's lines from a calibration source that changes element as it
// decays; Petrel's RTG as decay heat and a blackbody radiator, its
// plutonium-236 impurity as Gamow tunnelling, its tunnel-diode oscillator as
// a barrier widened by radiation damage; the laser altimeter's photon
// budget, the Boltzmann population of the Nd:YAG laser's lower level, and an
// honest sorting of what is established and what is open. Constants are
// CODATA 2022 from the course helpers, rounded as the prompts print them;
// every number a learner reads comes from its generator.
import { boss, mcq, multi, num } from '../../src/core/content.js';
import { tex, sig } from '../../src/core/format.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';
import { levels, xrayLevels, KALPHA1 } from './_atoms.js';
import { C as C_EXACT, H, KB, QE, HBAR, MPC2, MDC2, MEC2, MPI0C2, WIEN_B, T_SUN, SIGMA, YEAR, HC_EVNM } from './_constants.js';
import { MAC2, ALPHA, RYD, N_A } from './_quanta.js';

const t = String.raw;
// ---- the constants as the prompts print them, so a key always matches its prompt
const C = sig(C_EXACT, 4);                            // 2.998e8 m/s
const HCK = sig((H * C_EXACT) / KB, 5);               // 1.4388e-2 m K (hc/k)
const B_WIEN = sig(WIEN_B, 4);                        // 2.898e-3 m K
const HC = sig(HC_EVNM, 5);                           // 1239.8 eV nm
const SIG = sig(SIGMA, 4);                            // 5.670e-8 W m⁻² K⁻⁴
const NA = sig(N_A, 4);                               // 6.022e23 per mol
const MEV_J = sig(QE * 1e6, 4);                       // 1.602e-13 J per MeV
const YR = sig(YEAR, 4);                              // 3.156e7 s
const HBARC = sig(((HBAR * C_EXACT) / QE) * 1e9, 5);  // 197.33 eV nm
const MEC2_KEV = sig(MEC2 * 1000, 4);                 // 511.0 keV
const RYDP = sig(RYD, 5);                             // 13.606 eV
const HPL = sig(H, 4);                                // 6.626e-34 J s
const MPI0 = sig(MPI0C2, 5);                          // 134.98 MeV
const MA = sig(MAC2, 5);                              // 3727.4 MeV
const AINV = sig(1 / ALPHA, 6);                       // 137.036, 1/α
const MHE3 = 2808.39161;                              // MeV, the helion (helium-3 nucleus), CODATA 2022
const DEG = Math.PI / 180;
const r4 = (v) => +(+v).toFixed(4);
/** Keep only the slips whose values stand clear of the key (and of each other). */
const apart = (errors, key, rel = 0.03) => {
  const out = [];
  for (const e of errors) {
    if (!Number.isFinite(e.value) || e.value <= 0) continue;
    if (Math.abs(e.value - key) <= rel * Math.abs(key)) continue;
    if (out.some((o) => Math.abs(o.value - e.value) <= 1e-9 * Math.abs(e.value))) continue;
    out.push(e);
  }
  return out;
};

// ── round 1 pictures ─────────────────────────────────────────────────────────
const C2UM = HCK * 1e6;                               // hc/k in μm K
/** log₁₀ of a Planck curve B_λ (arbitrary units) at x = log₁₀(λ / 1 μm). */
const logB = (T, x) => -5 * x - Math.log10(Math.expm1(C2UM / (T * 10 ** x)));
function shieldPic(lam, Th, Tc) {
  const x0 = 0.5, x1 = 2.0, xp = Math.log10(B_WIEN * 1e6 / Th), top = logB(Th, xp), lo = -15;
  const curve = (T) => `-5*x - log10(exp(${r6(C2UM / T)}*10^(-x)) - 1) - (${r6(top)})`;
  let xs = x0;                                         // where the cold curve climbs into view
  while (logB(Tc, xs) - top < lo + 0.3 && xs < x1) xs += 0.01;
  return {
    type: 'graph',
    params: {
      x: [x0, x1], y: [lo, 1.5], xlog: true, aspect: 'wide', axesAt: 'edge', yticks: 0,
      xlabel: 'wavelength (μm)', ylabel: 'spectral radiance (log scale)',
      curves: [
        { fn: curve(Th), domain: [x0, x1], color: 'warn', width: 2.4, label: `hot layer, ${Th} K`, labelAt: 0.55, labelDx: -10, labelDy: -22 },
        { fn: curve(Tc), domain: [r4(xs), x1], color: 'accent', width: 2.4, label: `cold layer, ${Tc} K`, labelAt: 1.72, labelDx: -40, labelDy: 22 },
      ],
      vlines: [{ x: r4(Math.log10(lam)), label: `camera, ${lam} μm`, color: 'gold' }],
      alt: 'Two Planck curves on logarithmic axes, a hot one high and a cold one far below it, with the camera’s wavelength marked',
    },
    caption: 'The two layers’ Planck curves on logarithmic axes, each step on the wavelength axis a factor of ten; the radiance axis is logarithmic too, its numbers withheld. Both layers are drawn as perfect blackbodies, which real metal-coated films are not.',
  };
}

const LAYERS = { GaInP: 1.88, GaAs: 1.42, silicon: 1.12, germanium: 0.66 };
const CELLS = {
  si: { name: 'single-junction silicon cells', layers: ['silicon'] },
  gaas: { name: 'single-junction gallium arsenide (GaAs) cells', layers: ['GaAs'] },
  triple: { name: 'triple-junction cells', layers: ['GaInP', 'GaAs', 'germanium'] },
};
const L0 = (cell) => (CELLS[cell].layers.length === 1 ? 1.6 : 1.1);
function cellPic(cell, photon) {
  const L = CELLS[cell].layers, h = L0(cell), w = 7, colors = ['violet', 'accent', 'teal'];
  const shade = [], curves = [], points = [];
  L.forEach((name, i) => {
    const top = -i * h, bot = top - h;
    shade.push({ fn: String(r4(top)), lower: String(r4(bot)), from: 0, to: w, color: L.length === 1 ? 'accent' : colors[i], alpha: 0.28 });
    curves.push(seg(0, bot, w, bot, 'ink3', 1.2));
    points.push(label(w / 2, top - h / 2, `${name}, gap ${LAYERS[name]} eV`, 'ink', 0, 0, 'center'));
  });
  curves.push(seg(0, 0, w, 0, 'ink2', 2), seg(0, 0, 0, -L.length * h, 'ink2', 1.4), seg(w, 0, w, -L.length * h, 'ink2', 1.4));
  return {
    type: 'graph',
    params: frame([-4.5, 9], [r4(-L.length * h - 0.5), 3.1], {
      aspect: 'wide', equal: false, shade, curves,
      arrows: [{ from: [-3.2, 2.7], to: [2.2, 0.1], color: 'gold', width: 2.6 }],
      points: [...points, label(-4.3, 2.7, photon, 'gold', 0, -10, 'left')],
      alt: 'A solar cell in cross-section, its layers stacked, with a photon arriving at the top',
    }),
    caption: 'The cell in cross-section, schematic (real junctions are micrometres thick, on a thicker substrate). Light enters at the top; each layer is transparent to photons with less energy than its gap.',
  };
}

// ── round 2 pictures ─────────────────────────────────────────────────────────
function tofPic(z) {
  const track = { param: ['0.9 + 0.32*(1 - t/5)^2', 't'], t: [-0.2, 5.2], color: 'gold', width: 2.4 };
  const planes = [3.6, 2.9, 2.2, 1.5].map((y) => seg(-1.3, y, 3.1, y, 'violet', 1.8));
  return {
    type: 'graph',
    params: frame([-7.2, 9.6], [-0.6, 5.6], {
      aspect: 'wide',
      shade: [{ fn: '4.25', lower: '0.85', from: -2, to: 3.8, color: 'ink3', alpha: 0.12 }],
      curves: [seg(-2, 0.85, 3.8, 0.85, 'ink2', 1.4), seg(-2, 4.25, 3.8, 4.25, 'ink2', 1.4), seg(-2, 0.85, -2, 4.25, 'ink2', 1.4), seg(3.8, 0.85, 3.8, 4.25, 'ink2', 1.4),
        seg(-1.6, 4.7, 3.4, 4.7, 'accent', 4), seg(-1.6, 0.35, 3.4, 0.35, 'accent', 4), ...planes, track],
      arrows: [{ from: [-3.4, 4.7], to: [-3.4, 0.35], color: 'ink3' }, { from: [1.22, 5.5], to: [1.18, 4.95], color: 'gold' }],
      points: [label(-3.4, 2.5, '1.20 m', 'ink3', -8, 0, 'right'), label(3.4, 4.7, 'TOF plane 1', 'accent', 10, 0, 'left'), label(3.4, 0.35, 'TOF plane 2', 'accent', 10, 0, 'left'),
        label(3.8, 2.55, 'magnet', 'ink2', 10, -8, 'left'), label(3.8, 2.55, 'tracker', 'violet', 10, 10, 'left'),
        label(1.22, 5.5, z === 2 ? 'cosmic ray, charge +2e' : 'cosmic ray, charge +e', 'gold', -10, 0, 'right')],
      alt: 'A particle detector: a cosmic ray passes a time-of-flight plane, curves gently through a magnet with tracking planes, and passes a second time-of-flight plane',
    }),
    caption: 'The detector in side view, schematic: two time-of-flight (TOF) planes either side of a 0.140 T magnet holding the silicon tracker. The track’s bend is hugely exaggerated (its real radius is tens of metres); the field points into the page.',
  };
}

function pi0Pic(L) {
  const X = 6.2, h = 1.5;
  const cells = [-3, -2, -1, 0, 1, 2, 3].map((y) => seg(X, y * 0.9, X + 0.9, y * 0.9, 'ink3', 1));
  return {
    type: 'graph',
    params: frame([-5.6, 10.6], [-3.4, 3.4], {
      aspect: 'wide',
      shade: [{ fn: '2.9', lower: '-2.9', from: X, to: X + 0.9, color: 'accent', alpha: 0.2 }],
      curves: [seg(X, -2.9, X, 2.9, 'accent', 2), seg(X + 0.9, -2.9, X + 0.9, 2.9, 'accent', 1.4), ...cells, seg(0, 0, X, 0, 'ink4', 1, true)],
      arrows: [{ from: [-4.8, 0], to: [0, 0], color: 'warn', width: 2.6 }, { from: [0, 0], to: [X, h], color: 'gold', width: 2 }, { from: [0, 0], to: [X, -h], color: 'gold', width: 2 },
        { from: [0, -2.7], to: [X, -2.7], color: 'ink3', label: `L = ${L} m`, labelDx: -150, labelDy: 14 }, { from: [X - 0.5, -h], to: [X - 0.5, h], color: 'ink2', label: 's = ?', labelDx: -46, labelDy: 2 }],
      points: [{ x: 0, y: 0, r: 5, color: 'warn' }, label(-4.6, 0, 'π⁰', 'warn', 0, -12, 'left'), label(3.1, 0.75, 'γ', 'gold', -4, -10), label(3.1, -0.75, 'γ', 'gold', -4, 22), label(X + 0.45, 2.9, 'calorimeter', 'accent', 0, -10, 'center')],
      alt: 'A neutral pion decaying into two photons that strike a calorimeter some distance apart',
    }),
    caption: 'The symmetric decay drawn with its angle hugely exaggerated: the real opening angle is a few degrees at most. The calorimeter is a wall of crystals a few centimetres across.',
  };
}

// ── round 3 pictures ─────────────────────────────────────────────────────────
function uvPic(Z, n2) {
  const E = (n) => -(Z * Z * RYDP) / (n * n);
  const list = (n2 === 3 ? [1, 2, 3] : [1, 2]).map((n) => ({ E: E(n), label: `n = ${n}`, color: n === 1 || n === n2 ? 'ink' : 'ink3' }));
  list.push({ E: 0, label: 'free (ionized)', color: 'ink3', dash: true });
  return levels(list, {
    arrows: [{ from: E(n2), to: E(1), x: 2, color: 'violet', label: 'ultraviolet photon', width: 2.6 }],
    caption: `${Z === 1 ? 'Hydrogen' : 'The helium ion He⁺'}’s levels to scale (no numbers: working them out is part of the problem), with the jump that makes the line.`,
  });
}

// ── round 4 pictures ─────────────────────────────────────────────────────────
function rtgPic() {
  const fins = [], heat = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8, c = Math.cos(a), s = Math.sin(a);
    fins.push(seg(1.1 * c, 1.1 * s, 2.9 * c, 2.9 * s, 'ink2', 3));
    if (k % 2 === 0) heat.push({ from: [r4(2.2 * Math.cos(a + 0.39)), r4(2.2 * Math.sin(a + 0.39))], to: [r4(3.4 * Math.cos(a + 0.39)), r4(3.4 * Math.sin(a + 0.39))], color: 'warn', width: 1.8 });
  }
  return {
    type: 'graph',
    params: frame([-7.4, 7.4], [-3.6, 3.6], {
      aspect: 'wide',
      shade: [{ fn: 'sqrt(max(0, 1.21 - x^2))', lower: '-sqrt(max(0, 1.21 - x^2))', from: -1.1, to: 1.1, color: 'ink2', alpha: 0.3 }, { fn: 'sqrt(max(0, 0.36 - x^2))', lower: '-sqrt(max(0, 0.36 - x^2))', from: -0.6, to: 0.6, color: 'warn', alpha: 0.7 }],
      curves: [circle(0, 0, 1.1, 'ink2', 2), ...fins],
      arrows: heat,
      points: [label(0, 3.3, 'plutonium-238 core (orange)', 'warn', 0, 0, 'center'), label(2.9 * Math.cos(Math.PI / 8), 2.9 * Math.sin(Math.PI / 8), 'radiator fins', 'ink2', 10, 0, 'left'),
        label(0, -3.3, 'thermocouples between the fuel and the case', 'ink3', 0, 6, 'center')],
      alt: 'A radioisotope generator seen end-on: a hot plutonium core inside a case with eight radiator fins, heat radiating outward',
    }),
    caption: 'Petrel’s generator seen end-on, schematic. The fins radiate both ways into space; sunlight 45 au out (under 1 W/m²) is neglected, and so is the heat the fins radiate onto each other.',
  };
}

function gamowPic() {
  const k = 2 * 92 * 1.44, R = 9.3, E8 = 5.499, E6 = 5.768;
  return {
    type: 'graph',
    params: {
      x: [0, 62], y: [-7, 24], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the nucleus’s centre (fm)', ylabel: 'energy (MeV)',
      shade: [{ fn: `${k}/x`, lower: String(E8), from: R, to: r4(k / E8), color: 'bad', alpha: 0.18 }],
      curves: [{ fn: `${k}/x`, domain: [R, 62], color: 'ink2', width: 2.4 }, seg(R, -5, R, k / R, 'ink2', 2.4), seg(0, -5, R, -5, 'ink2', 2.4),
        seg(0, E8, 62, E8, 'gold', 2), seg(0, E6, 62, E6, 'violet', 2, true)],
      points: [label(17, 11, 'forbidden', 'bad', 0, 0, 'center')],
      legend: [{ label: 'Pu-236 alpha, 5.77 MeV', color: 'violet', dash: true }, { label: 'Pu-238 alpha, 5.50 MeV', color: 'gold' }], legendAt: 'tr',
      alt: 'The Coulomb barrier around a uranium nucleus, with two alpha energies drawn as horizontal lines',
    },
    caption: 'The alpha particle’s potential energy outside the uranium nucleus its parent becomes (Z = 92), with the two alpha energies; the well inside is schematic. The red band is the forbidden stretch at the lower energy; the higher one’s is a little thinner.',
  };
}

function diodePic(W0) {
  const W1 = W0 * 1.22, xm = W1 + 4;
  return {
    type: 'graph',
    params: {
      x: [-6, r4(xm)], y: [-0.55, 0.95], aspect: 'wide', axesAt: 'edge', xlabel: 'position across the junction (nm)', ylabel: 'energy (eV)', yticks: 4,
      shade: [{ fn: '0.5', lower: '0', from: 0, to: W0, color: 'bad', alpha: 0.22 }],
      curves: [seg(-6, 0, xm, 0, 'gold', 2, true), seg(0, 0, 0, 0.5, 'ink2', 2.2), seg(0, 0.5, W0, 0.5, 'ink2', 2.2), seg(W0, 0.5, W0, 0, 'ink2', 2.2),
        seg(W0, 0.5, W1, 0.5, 'ink3', 1.6, true), seg(W1, 0.5, W1, 0, 'ink3', 1.6, true),
        { fn: '0.22*cos(2.2*x)', domain: [-6, 0], color: 'accent', width: 1.8 }, { fn: '0.22*exp(-0.35*x)', domain: [0, W0], color: 'accent', width: 1.8 }],
      arrows: [{ from: [0, 0.72], to: [W0, 0.72], color: 'ink2', label: `W₀ = ${W0} nm`, labelDx: -40, labelDy: -8 }],
      points: [label(W1, 0.5, 'after damage', 'ink3', 0, -10, 'right'), label(-5.8, 0, 'electron energy', 'gold', 0, 14, 'left'), label(W0 / 2, 0.25, 'barrier 0.5 eV high', 'bad', 0, 0, 'center')],
      alt: 'A rectangular barrier half an electronvolt high and a few nanometres wide, with a wave decaying inside it, and a dashed outline where damage widens it',
    },
    caption: 'The rectangular-barrier teaching model of the junction (the real barrier is closer to a triangle). The wave’s decay inside is drawn far gentler than it really is, so it stays visible, and the dashed widening after damage is exaggerated.',
  };
}

// ── round 5 pictures ─────────────────────────────────────────────────────────
function altPic() {
  const H0 = 4.6, R = 1.5;
  return {
    type: 'graph',
    params: frame([-7.6, 7.6], [-0.9, 5.6], {
      aspect: 'wide',
      shade: [{ fn: '0', lower: '-0.7', from: -7.6, to: 7.6, color: 'ink3', alpha: 0.35 }, { fn: '5.0', lower: '4.4', from: -0.5, to: 0.5, color: 'ink2', alpha: 0.5 }],
      curves: [circle(0, R, R, 'violet', 1.6, true), seg(-0.08, H0 - 0.2, -0.25, 0, 'bad', 1.6), seg(0.08, H0 - 0.2, 0.25, 0, 'bad', 1.6), seg(-7.6, 0, 7.6, 0, 'ink2', 1.6)],
      arrows: [{ from: [0.7, 0.2], to: [0.7, H0 - 0.3], color: 'violet', width: 2 }, { from: [-5.4, H0 - 0.05], to: [-5.4, 0.05], color: 'ink3' }, { from: [-5.4, 0.05], to: [-5.4, H0 - 0.05], color: 'ink3' },
        { from: [-0.5, R], to: [-2.2, 2.2], color: 'violet', width: 1.4 }, { from: [0.5, R], to: [2.2, 2.2], color: 'violet', width: 1.4 }],
      points: [label(0.5, 4.7, 'Petrel', 'ink2', 10, 0, 'left'), label(-0.2, 3.4, 'laser pulse', 'bad', -10, 0, 'right'), label(0.7, 2.4, 'echo', 'violet', 8, 0, 'left'), label(-5.4, 2.3, 'h', 'ink3', -8, 0, 'right'),
        label(R, R, 'scattered light', 'violet', 10, 16, 'left'), label(-7.4, -0.35, 'dusty surface', 'ink2', 0, 4, 'left')],
      alt: 'A probe firing a laser pulse down at a surface, which scatters the light in a lobe brightest straight up, part of it returning to the probe’s telescope',
    }),
    caption: 'Far from scale: the altitude is kilometres and the telescope centimetres. The dashed circle is a Lambertian surface’s scattering pattern: the intensity in each direction is proportional to the cosine of its angle from the vertical.',
  };
}

function ndPic() {
  return levels([
    { E: 0, label: 'ground level', color: 'ink' },
    { E: 2.111, label: 'lower laser level', color: 'gold' },
    { E: 11.502, label: 'upper laser level', color: 'gold', dy: 8 },
    { E: 12.6, label: 'pump band', color: 'violet', dy: -8 },
  ], {
    arrows: [{ from: 0, to: 12.6, x: 0.5, color: 'violet', label: '808 nm', width: 2.2 }, { from: 12.6, to: 11.6, x: 1.7, color: 'ink3', dash: true },
      { from: 11.502, to: 2.111, x: 2.6, color: 'bad', label: '1064 nm', width: 2.6 }, { from: 2.111, to: 0.1, x: 3.5, color: 'ink3', dash: true, label: 'fast', dy: 0 }],
    x: [-0.6, 10.5],
    caption: 'The Nd:YAG levels that matter, to scale in wavenumber (each level is really a narrow group of sublevels). Dashed arrows are fast decays that give their energy to the crystal as heat.',
  });
}

function rotationPic() {
  const pts = [2, 4, 6, 8, 10, 13, 16, 19, 22, 25, 28].map((x, i) => ({ x, y: r4(150 * (1 - Math.exp(-x / 2.6)) + 3 * Math.sin(1.7 * i)), r: 4, color: 'accent' }));
  return {
    type: 'graph',
    params: {
      x: [0, 30], y: [0, 200], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the galaxy’s centre (kpc)', ylabel: 'orbital speed (km/s)',
      curves: [{ fn: '150*(1 - exp(-x/2.6))', domain: [0.2, 30], color: 'accent', width: 2.2, label: 'measured', labelAt: 22, labelDx: 0, labelDy: -14 },
        { fn: '411*sqrt((1 - (1 + x/3)*exp(-x/3))/x)', domain: [0.1, 30], color: 'warn', width: 2.2, dash: true, label: 'from visible matter alone', labelAt: 12, labelDx: -10, labelDy: 26 }],
      points: pts,
      alt: 'A galaxy rotation curve: measured speeds stay flat far out, while the speeds expected from visible matter fall away',
    },
    caption: 'A schematic rotation curve shaped like that of the spiral galaxy NGC 3198 (illustrative, not the published data): far from the centre, gas orbits as fast as near it, though the visible matter thins out.',
  };
}

// ── generator tables ─────────────────────────────────────────────────────────
const PARTICLES = [
  { name: 'proton', z: 1, m: MPC2 }, { name: 'deuteron', z: 1, m: MDC2 },
  { name: 'helium-3 nucleus', z: 2, m: MHE3 }, { name: 'helium-4 nucleus (an alpha particle)', z: 2, m: MAC2 },
];
const LINES = [
  { key: 'lya', Z: 1, n2: 2, what: t`hydrogen's Lyman-α line ($n = 2 \to 1$), which maps the hydrogen clouds around comets and the interstellar hydrogen drifting through the solar system`, who: 'hydrogen' },
  { key: 'lyb', Z: 1, n2: 3, what: t`hydrogen's Lyman-β line ($n = 3 \to 1$)`, who: 'hydrogen' },
  { key: 'he', Z: 2, n2: 2, what: t`the brightest ultraviolet line of the helium ion $\text{He}^+$ ($Z = 2$, $n = 2 \to 1$), which solar imagers use to watch the Sun's transition region`, who: 'the helium ion' },
];
const SOURCES = [
  { iso: 'iron-55', Zp: 26, half: '2.74 years', parent: 'iron', daughter: 'manganese' },
  { iso: 'cobalt-57', Zp: 27, half: '272 days', parent: 'cobalt', daughter: 'iron' },
  { iso: 'cadmium-109', Zp: 48, half: '462 days', parent: 'cadmium', daughter: 'silver' },
];
// plutonium alpha lines (strongest branch, MeV) and half-lives (NUBASE2020)
const PU = { 236: { K: 5.768, half: 2.858 }, 238: { K: 5.499, half: 87.7 } };

export default boss({
  title: 'The Quantum Threshold',
  intro: t`*Halcyon* and *Petrel* are imagined spacecraft built from real parts. Halcyon is an infrared and X-ray observatory parked a million and a half kilometres beyond Earth, at the Sun–Earth L2 point, behind a five-layer sunshield. Petrel, its partner, is a plutonium-powered probe mapping a dark Kuiper-belt object 45 au from the Sun. You are the instrument scientist for both, and every number the engineers send you is yours to check: blackbodies and quanta, relativity, photons and atoms, tunnelling, lasers and statistics, solids and nuclei. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Sunlight at L2',
      story: t`At L2 the Sun, Earth and Moon all lie on one side, so Halcyon keeps its sunshield between them and its telescope. Sunlight is both the enemy and the power supply: the shield must stop its heat, and the solar arrays must turn its photons into current.`,
      items: [
        num({
          id: 'r1-shield', skill: 'phys2710.MP1.2', difficulty: 3,
          gen(r) {
            const lam = r.pick([15, 18, 21, 25]), Th = r.pick([320, 345, 370]), Tc = r.pick([36, 40, 45]);
            const x = (T) => HCK / (lam * 1e-6 * T), xh = x(Th), xc = x(Tc);
            const ratio = Math.expm1(xc) / Math.expm1(xh);
            return {
              prompt: t`Halcyon's sunshield is a stack of five thin films. The layer facing the Sun settles at ${Th} K; the coldest layer, facing the telescope, at ${Tc} K. The mid-infrared camera works at a wavelength of ${lam} μm. Treat both layers as blackbodies. At that wavelength, by what factor does a square metre of the hot layer outshine a square metre of the cold one — that is, what is the ratio of their spectral radiances $B_\lambda$? ($hc/k = 1.4388\times10^{-2}$ m K)`,
              answer: ratio, tol: { rel: 0.02 },
              errors: apart([
                { value: (Th / Tc) ** 4, feedback: t`$(T_h/T_c)^4$ compares the *total* power of the two layers (Stefan–Boltzmann). At one wavelength far down the cold layer's short-wavelength side, Planck's law gives a far bigger ratio.` },
                { value: Th / Tc, feedback: t`A ratio of $T_h/T_c$ is the classical Rayleigh–Jeans law, $B_\lambda \propto T/\lambda^4$, which only holds where $hc/\lambda kT \ll 1$. Here $hc/\lambda kT$ is $${tex(xc, 3)}$ for the cold layer: use Planck's law.` },
                { value: Math.exp(xc - xh), feedback: t`Dropping the $-1$ in Planck's denominator (Wien's approximation) is fine for the cold layer, where $e^{x}$ is huge, but not for the hot one, where $hc/\lambda kT = ${tex(xh, 3)}$.` },
              ], ratio),
              hints: [
                t`Planck's law per unit wavelength is $B_\lambda = \dfrac{2hc^2}{\lambda^5}\,\dfrac{1}{e^{hc/\lambda kT} - 1}$. At one wavelength, everything but the last factor cancels in the ratio.`,
                t`Compute $x = hc/\lambda kT$ for each layer: $x = \dfrac{1.4388\times10^{-2}}{(${lam}\times10^{-6})T}$.`,
                t`The ratio is $\dfrac{e^{x_c} - 1}{e^{x_h} - 1}$, with $x_c$ for the cold layer and $x_h$ for the hot one.`,
              ],
              teach: 'On the short-wavelength side of its peak a blackbody’s radiance falls exponentially, so a modest temperature ratio becomes an enormous brightness ratio.',
              explain: t`At one wavelength Planck's law leaves only $1/(e^{x} - 1)$ to compare, with $x = hc/\lambda kT$: $x_h = ${tex(xh, 4)}$ for the hot layer and $x_c = ${tex(xc, 4)}$ for the cold one. So $$\frac{B_\lambda(${Th}\ \text{K})}{B_\lambda(${Tc}\ \text{K})} = \frac{e^{${tex(xc, 4)}} - 1}{e^{${tex(xh, 4)}} - 1} = ${tex(ratio, 3)}.$$ The total powers differ only by $(T_h/T_c)^4 = ${tex((Th / Tc) ** 4, 3)}$; at ${lam} μm the cold layer sits deep on the exponential side of its curve, whose peak is out at $${tex(B_WIEN * 1e6 / Tc, 3)}$ μm. That is why the shield has five layers with gaps between them: each layer sees mostly the cooler one beyond it, and the last one barely glows at the camera's wavelengths. The James Webb Space Telescope's shield runs from about 380 K on its sunward side to about 36 K on its coldest layer. Real films are far from black, which changes the ratio by the ratio of their emissivities, not its exponential character.`,
              visual: shieldPic(lam, Th, Tc),
            };
          },
        }),
        num({
          id: 'r1-cell', skill: 'phys2710.MP12.3', difficulty: 3,
          gen(r) {
            const cell = r.pick(['si', 'gaas', 'triple']), ph = r.pick(['sun', 420, 780]);
            const lam = ph === 'sun' ? (B_WIEN / T_SUN) * 1e9 : ph, E = HC / lam;
            const layers = CELLS[cell].layers, absorbed = layers.find((n) => LAYERS[n] <= E), Eg = LAYERS[absorbed];
            const heat = 100 * (1 - Eg / E);
            const which = ph === 'sun'
              ? t`A photon from the peak of the Sun's spectrum — taking the Sun as a ${T_SUN} K blackbody and its spectrum per unit wavelength, with Wien's constant $b = 2.898\times10^{-3}$ m K —`
              : t`A photon of wavelength ${lam} nm`;
            const stack = cell === 'triple'
              ? t`Light enters through a GaInP layer (gap 1.88 eV), then a GaAs layer (1.42 eV), then germanium (0.66 eV); each layer is transparent to photons with less energy than its gap.`
              : t`The cell's band gap is ${Eg} eV.`;
            const errs = [{ value: 100 * (Eg / E), feedback: t`That is the share the gap *keeps* — the most the electron–hole pair can carry away as electrical energy. The rest of the photon's energy becomes heat.` }];
            if (cell === 'triple' && absorbed !== 'germanium') errs.push({ value: 100 * (1 - LAYERS.germanium / E), feedback: t`The photon never reaches the germanium. It is absorbed by the first layer whose gap it can cross, coming in from the top.` });
            return {
              prompt: t`Halcyon's solar arrays use ${CELLS[cell].name}. ${stack} ${which} enters the cell from the top. In the layer that absorbs it, the photon lifts one electron across the gap, and the electron and the hole it leaves behind quickly shed any energy beyond the gap as heat, in vibrations of the crystal. At the least, what percentage of the photon's energy ends up as heat? ($hc = 1239.8$ eV nm)`,
              answer: heat, units: '%', tol: { rel: 0.02 },
              errors: apart(errs, heat),
              hints: [
                ph === 'sun' ? t`Wien's law gives the peak wavelength, $\lambda_{\max} = b/T$; then $E = hc/\lambda$.` : t`The photon's energy is $E = hc/\lambda$, with $hc = 1239.8$ eV nm.`,
                cell === 'triple' ? 'Going down the stack, find the first layer whose gap is no larger than the photon’s energy: that layer absorbs it.' : 'The photon is absorbed if its energy exceeds the gap; the pair keeps the gap energy, at most.',
                t`The heat is at least $E - E_g$, as a share of $E$: $1 - E_g/E$.`,
              ],
              teach: 'A photon above the gap makes one electron–hole pair, which keeps at most the gap energy; the excess becomes heat — which is why cells stack several gaps.',
              explain: t`${ph === 'sun' ? t`The Sun's spectrum per unit wavelength peaks at $\lambda_{\max} = b/T = ${tex(lam, 4)}$ nm, so ` : ''}$E = hc/\lambda = 1239.8/${tex(lam, 4)} = ${tex(E, 4)}$ eV. ${cell === 'triple' ? t`It ${E >= LAYERS.GaInP ? 'can cross the GaInP layer’s 1.88 eV gap, so the top layer absorbs it' : t`passes through the GaInP layer (gap 1.88 eV) and is absorbed in the GaAs layer below`}. ` : ''}The pair keeps at most $E_g = ${Eg}$ eV, so at least $$1 - \frac{E_g}{E} = 1 - \frac{${Eg}}{${tex(E, 4)}} = ${tex(heat / 100, 3)} = ${tex(heat, 3)}\%$$ of its energy becomes heat. Stacking gaps lets each slice of the spectrum meet a gap just below its own energy, so less is thrown away: that is why spacecraft fly triple-junction cells, near 30% efficient, against under 20% for silicon. Even the gap energy is not all delivered — a cell works at a voltage well below $E_g/e$ — so this is a floor on the heat, not the whole of it.`,
              visual: cellPic(cell, ph === 'sun' ? 'photon from the Sun’s peak' : `photon, ${lam} nm`),
            };
          },
        }),
      ],
    },
    {
      title: 'Fast particles',
      story: t`Outside Earth's magnetic field Halcyon is bathed in cosmic rays: nuclei from distant supernova remnants, some moving close to the speed of light. A small magnetic spectrometer weighs them, and a calorimeter catches the photons they make when they strike the spacecraft.`,
      items: [
        num({
          id: 'r2-tof', skill: 'phys2710.MP3.2', difficulty: 4,
          gen(r) {
            const P = r.pick(PARTICLES), beta0 = r.pick([0.66, 0.72, 0.78, 0.84]), B = 0.14, L = 1.2;
            const pc0 = (P.m * beta0) / Math.sqrt(1 - beta0 * beta0);                  // MeV
            const rad = sig((pc0 * 1e6) / (P.z * B * C), 3), dt = sig((L / (beta0 * C)) * 1e9, 3);
            const pc = (P.z * B * rad * C) / 1e6, beta = L / (C * dt * 1e-9), m = (pc * Math.sqrt(1 - beta * beta)) / beta;
            const errs = [{ value: pc / beta, feedback: t`$pc/\beta$ is the particle's total energy, $E = \gamma mc^2$ — what Newton's $p = mv$ would call $mc^2$. The mass is $m = p/\gamma v$, smaller by $\gamma = ${tex(1 / Math.sqrt(1 - beta * beta), 3)}$.` }];
            if (P.z === 2) errs.push({ value: m / 2, feedback: t`The charge is $+2e$, so the momentum is $p = 2eBr$: a doubly charged particle bends half as much as a singly charged one with the same momentum.` });
            return {
              prompt: t`A cosmic ray crosses Halcyon's magnetic spectrometer. In the 0.140 T field of its magnet, the silicon tracker finds that the track curves with a radius of ${rad} m, and the size of its signals shows a charge of ${P.z === 1 ? '$+e$' : '$+2e$'}. Two time-of-flight planes 1.20 m apart along the track time its passage at ${dt} ns. What is the particle's mass, as a rest energy $mc^2$, in MeV? ($c = 2.998\times10^8$ m/s)`,
              answer: m, units: 'MeV', tol: { rel: 0.01 },
              errors: apart(errs, m),
              hints: [
                t`In a magnetic field a charge $q$ moving across the field curves with $p = qBr$ — true at any speed, with the relativistic momentum. In energy units, $pc = qBrc$; divided by $e$, that is $pc$ in eV.`,
                t`The speed is $v = L/\Delta t$, so $\beta = v/c$.`,
                t`$p = \gamma mv$, so $mc^2 = \dfrac{pc}{\gamma\beta} = pc\,\dfrac{\sqrt{1 - \beta^2}}{\beta}$.`,
              ],
              teach: 'Curvature in a magnetic field measures momentum, a stopwatch measures speed, and p = γmv turns the two into a mass.',
              explain: t`The bend gives the momentum: $pc = ${P.z === 1 ? '' : '2'}eBrc$, which in electronvolts is $${P.z === 1 ? '' : '2\\times'}(0.140)(${rad})(2.998\times10^8) = ${tex(pc, 4)}$ MeV. The stopwatch gives the speed: $\beta = \dfrac{1.20}{(2.998\times10^8)(${dt}\times10^{-9})} = ${tex(beta, 4)}$, so $\gamma = ${tex(1 / Math.sqrt(1 - beta * beta), 4)}$. Then $$mc^2 = \frac{pc}{\gamma\beta} = ${tex(m, 4)}\ \text{MeV}:$$ a **${P.name}** (${tex(P.m, 6)} MeV). Real time-of-flight planes time each crossing to about a tenth of a nanosecond, so one particle's mass comes out within roughly 10% — enough to tell a deuteron from a proton and helium-3 from helium-4. The Alpha Magnetic Spectrometer on the International Space Station weighs cosmic rays this way, with a 0.14 T permanent magnet.`,
              visual: tofPic(P.z),
            };
          },
        }),
        num({
          id: 'r2-pi0', skill: 'phys2710.MP3.3', difficulty: 4,
          gen(r) {
            const E = r.pick([1.5, 2, 2.5, 3, 4, 5]), L = r.pick([0.8, 1.0, 1.25]);
            const half = Math.asin(MPI0 / (E * 1000)), s = 2 * L * Math.tan(half) * 100;
            const sHalf = 2 * L * Math.tan(Math.asin(MPI0 / (2 * E * 1000))) * 100;
            return {
              prompt: t`Cosmic rays striking Halcyon's structure make neutral pions, $\pi^0$ (rest energy 134.98 MeV), which at once decay into two photons, $\pi^0 \to \gamma\gamma$. A $\pi^0$ with a total energy of ${E} GeV, heading straight at the calorimeter, decays ${L} m in front of its face. The photons may share the energy in any proportion, and the sharing sets the angle between them. What is the smallest possible distance between the two photons' hits on the calorimeter face, in cm?`,
              answer: s, units: 'cm', tol: { rel: 0.01 },
              errors: apart([
                { value: sHalf, feedback: t`Each photon carries *part* of the pion's energy: for the smallest angle they share it equally, $E_1 = E_2 = E/2$. Then $m^2c^4 = 2E_1E_2(1 - \cos\theta)$ gives $\sin(\theta/2) = mc^2/E$, not $mc^2/2E$.` },
                { value: s * 2, feedback: t`$\theta$ is the angle between the two photons; each makes $\theta/2$ with the pion's line of flight, so each hit lies $L\tan(\theta/2)$ from the axis.` },
              ], s),
              hints: [
                t`The invariant mass of the photon pair is the pion's mass: $m^2c^4 = (E_1 + E_2)^2 - |\vec p_1c + \vec p_2c|^2 = 2E_1E_2(1 - \cos\theta)$.`,
                t`For a fixed total $E = E_1 + E_2$, the product $E_1E_2$ is largest — so $\theta$ is smallest — when $E_1 = E_2 = E/2$. Then $\sin(\theta/2) = mc^2/E$.`,
                t`The photons then fly at $\pm\theta/2$ to the axis, landing $2L\tan(\theta/2)$ apart.`,
              ],
              teach: 'The invariant mass of a decay’s products is the parent’s mass; for two photons it fixes the least opening angle, sin(θ/2) = mc²/E, reached when they share the energy equally.',
              explain: t`The two photons' total four-momentum is the pion's, so $m^2c^4 = 2E_1E_2(1 - \cos\theta) = 4E_1E_2\sin^2(\theta/2)$. With $E_1 + E_2 = E$ fixed, $E_1E_2$ is largest at $E_1 = E_2 = E/2$, which makes $\theta$ smallest: $$\sin\frac{\theta_{\min}}{2} = \frac{mc^2}{E} = \frac{134.98}{${E * 1000}} = ${tex(MPI0 / (E * 1000), 4)},$$ so $\theta_{\min} = ${tex((2 * half) / DEG, 3)}^\circ$. The hits are $2L\tan(\theta_{\min}/2) = ${tex(s, 3)}$ cm apart, and any unequal sharing spreads them further. The faster the pion, the tighter the pair: above about ${tex((2 * L * MPI0) / 2.5 / 1000 * 100, 2)} GeV this calorimeter's 2.5 cm crystals would see the two showers merge into one, and a $\pi^0$ would masquerade as a single high-energy photon — a background every gamma-ray telescope has to reject.`,
              visual: pi0Pic(L),
            };
          },
        }),
      ],
    },
    {
      title: 'Lines of light',
      story: t`Halcyon's spectrometers read atoms by their light. The ultraviolet camera must see one line and ignore all of sunlight's visible glare; the X-ray spectrometer must know its own energy scale to a fraction of a per cent, so it carries a tiny radioactive source to check it.`,
      items: [
        num({
          id: 'r3-uv', skill: 'phys2710.MP5.2', difficulty: 3,
          gen(r) {
            const Ln = r.pick(LINES), ask = r.pick(['V', 'v']), phi = 6.2;
            const E = Ln.Z ** 2 * RYDP * (1 - 1 / Ln.n2 ** 2), K = E - phi;
            const speed = (K0) => C * Math.sqrt((2 * K0) / (MEC2_KEV * 1000)) / 1000;   // km/s
            const key = ask === 'V' ? K : speed(K);
            const noPhi = ask === 'V' ? E : speed(E);
            const errs = [{ value: noPhi, feedback: t`Some of the photon's energy, the threshold $\phi = 6.2$ eV, is spent freeing the electron; only $E - \phi$ is left as kinetic energy.` }];
            if (Ln.Z === 2) { const Kz = 2 * RYDP * 0.75 - phi; errs.push({ value: ask === 'V' ? Kz : speed(Kz), feedback: t`Bohr's energies scale as $Z^2$: for $\text{He}^+$ they are four times hydrogen's, not twice.` }); }
            if (ask === 'v') errs.push({ value: key / Math.SQRT2, feedback: t`Kinetic energy is $\tfrac12mv^2$, so $v = \sqrt{2K/m}$.` });
            return {
              prompt: t`Halcyon's ultraviolet camera images ${Ln.what}. Its photocathode is caesium iodide, whose photoemission threshold, 6.2 eV, plays the part of a work function: no visible photon can free an electron from it, so the camera is blind to ordinary sunlight. Using Bohr's model (with $R_\infty hc = 13.606$ eV, ignoring the nucleus's recoil), find ${ask === 'V' ? 'the stopping voltage of the photoelectrons this line ejects, in volts' : t`the greatest speed of the photoelectrons this line ejects, in km/s ($m_ec^2 = 511.0$ keV, $c = 2.998\times10^8$ m/s)`}.`,
              answer: key, units: ask === 'V' ? 'V' : 'km/s', tol: { rel: 0.01 },
              errors: apart(errs, key),
              hints: [
                t`Bohr's levels for one electron around a charge $Ze$ are $E_n = -Z^2(13.606\ \text{eV})/n^2$; the photon carries the difference between the two levels.`,
                t`The fastest photoelectrons have $K_{\max} = E_\text{photon} - \phi$.`,
                ask === 'V' ? t`The stopping voltage turns them back: $eV_0 = K_{\max}$.` : t`$v = c\sqrt{2K_{\max}/m_ec^2}$ — slow enough here for Newton's kinetic energy.`,
              ],
              teach: 'Bohr’s levels give the photon’s energy, and Einstein’s photoelectric equation spends the threshold first and leaves the rest as kinetic energy.',
              explain: t`For ${Ln.who} the photon carries $E = ${Ln.Z === 1 ? '' : '2^2\\times'}13.606\left(1 - \tfrac{1}{${Ln.n2 ** 2}}\right) = ${tex(E, 4)}$ eV (wavelength $${tex(HC / E, 4)}$ nm). Freeing an electron costs 6.2 eV, leaving $K_{\max} = ${tex(K, 4)}$ eV, ${ask === 'V' ? t`so the stopping voltage is $V_0 = ${tex(K, 4)}$ V` : t`so $v = c\sqrt{2K_{\max}/m_ec^2} = ${tex(key, 4)}$ km/s`}. Visible sunlight, at 1.7–3.3 eV a photon, cannot reach the threshold however bright it is: the "solar-blind" photocathode is the photoelectric effect's threshold put to work, and it lets an ultraviolet camera ignore visible sunlight far brighter than the line it is looking for.`,
              visual: uvPic(Ln.Z, Ln.n2),
            };
          },
        }),
        num({
          id: 'r3-calib', skill: 'phys2710.MP9.3', difficulty: 3,
          gen(r) {
            const S = r.pick(SOURCES), Zd = S.Zp - 1;
            const mos = (Z) => (0.75 * RYDP * (Z - 1) ** 2) / 1000, key = mos(Zd), meas = KALPHA1[Zd];
            return {
              prompt: t`Halcyon's X-ray spectrometer carries a tiny calibration source of ${S.iso} (half-life ${S.half}). It decays by **electron capture**: the nucleus swallows one of its atom's own K-shell electrons, turning a proton into a neutron and emitting a neutrino. The K shell is left with a vacancy, which an L-shell electron fills, sending out a Kα X-ray. Use Moseley's law, $E_{K\alpha} = \tfrac34(13.606\ \text{eV})(Z - 1)^2$, to predict the energy of that X-ray line, in keV.`,
              answer: key, units: 'keV', tol: { rel: 0.01 },
              errors: apart([
                { value: mos(S.Zp), feedback: t`By the time the vacancy is filled the atom is no longer ${S.parent}: capturing an electron turned a proton into a neutron, so $Z$ fell by one, to ${Zd} (${S.daughter}). (Using $Z^2$ instead of $(Z - 1)^2$ for ${S.daughter} gives the same wrong number.)` },
                { value: (RYDP * (Zd - 1) ** 2) / 1000, feedback: t`Kα is the jump from $n = 2$ to $n = 1$, so the factor is $1/1^2 - 1/2^2 = \tfrac34$.` },
              ], key),
              hints: [
                'Which element is the atom when the X-ray comes out? Electron capture turns one proton into a neutron.',
                t`The daughter has $Z = ${S.Zp} - 1 = ${Zd}$. In Moseley's law the other K electron screens one unit of the nuclear charge, hence $Z - 1$.`,
                t`$E = \tfrac34(13.606\ \text{eV})(${Zd} - 1)^2$; divide by 1000 for keV.`,
              ],
              teach: 'An X-ray line belongs to the atom that emits it — after electron capture, that is the daughter element, one step down the table.',
              explain: t`Electron capture turns ${S.parent} ($Z = ${S.Zp}$) into ${S.daughter} ($Z = ${Zd}$) before the vacancy is filled, so the line is ${S.daughter}'s: $$E_{K\alpha} = \tfrac34(13.606\ \text{eV})(${Zd} - 1)^2 = ${tex(key, 4)}\ \text{keV}.$$ The measured Kα₁ line of ${S.daughter} is ${tex(meas, 5)} keV; Moseley's screening estimate is ${tex((100 * Math.abs(meas - key)) / meas, 2)}% off${Zd > 40 ? ', worse for heavy atoms, where relativity deepens the K shell' : ''}. That this source shows ${S.daughter}'s line and not ${S.parent}'s is itself proof of electron capture. In the silicon detector each photon makes one electron–hole pair per 3.65 eV it deposits — about $${tex((meas * 1000) / 3.65, 3)}$ pairs here — and counting that charge is how the photon's energy is read.`,
              visual: xrayLevels({ show: ['ka'], ask: 'ka', caption: `The daughter atom’s X-ray levels, schematic and not to scale: the vacancy (red) left in the K shell by the captured electron is filled from the L shell, giving the Kα line.` }),
            };
          },
        }),
      ],
    },
    {
      title: 'Petrel’s heart',
      story: t`Forty-five au out, sunlight is two thousand times fainter than at Earth, so Petrel runs on the heat of plutonium-238. Its engineers worry about three things: what the fuel's heat does to the radiator, what an impurity in the fuel does to its radioactivity, and what the generator's neutrons do to the electronics beside it.`,
      items: [
        num({
          id: 'r4-rtg', skill: 'phys2710.MP1.1', difficulty: 4,
          gen(r) {
            const kg = r.pick([3.6, 4.0, 4.4]), yrs = r.pick([16, 20, 25]), eta = r.pick([0.055, 0.065]), A = r.pick([1.0, 1.2, 1.4]), eps = 0.9, Q = 5.593, Th = 87.7;
            const N0 = ((kg * 1000) / 238.05) * NA, lam = Math.LN2 / (Th * YR), P0 = lam * N0 * Q * MEV_J, P = P0 * 2 ** (-yrs / Th);
            const Tof = (Pw, e = eps) => (Pw / (e * SIG * A)) ** 0.25;
            const key = Tof((1 - eta) * P);
            const errs = [
              { value: Tof((1 - eta) * P0), feedback: t`The plutonium has been decaying for ${yrs} years: the heat now is $P_0\,2^{-${yrs}/87.7}$.` },
              { value: Tof(P), feedback: t`The thermocouples turn ${tex(eta * 100, 2)}% of the heat into electricity, which leaves through the wires; only the rest, $(1 - ${eta})P$, is radiated by the fins.` },
              { value: Tof((1 - eta) * P / Math.LN2), feedback: t`The decay constant is $\lambda = \ln 2/T_{1/2}$, not $1/T_{1/2}$.` },
              { value: Tof((1 - eta) * P, 1), feedback: t`The fins radiate $\varepsilon\sigma AT^4$, with emissivity $\varepsilon = 0.90$.` },
            ].filter((e) => Math.abs(e.value - key) > 3);
            return {
              prompt: t`Petrel's generator was loaded with ${kg} kg of plutonium-238 (238.05 g/mol, half-life 87.7 years) ${yrs} years ago. Each decay deposits $Q = 5.593$ MeV as heat. Thermocouples turn ${tex(eta * 100, 2)}% of that heat into electricity, and the rest leaves through radiator fins with a total radiating area of ${A} m² and an emissivity of 0.90. Taking the fins to be at one temperature, radiating into cold space, what is that temperature now, in kelvin? ($N_A = 6.022\times10^{23}$ per mol, 1 MeV $= 1.602\times10^{-13}$ J, 1 year $= 3.156\times10^7$ s, $\sigma = 5.670\times10^{-8}\ \text{W m}^{-2}\,\text{K}^{-4}$)`,
              answer: key, units: 'K', tol: { rel: 0, abs: 1.5 },
              errors: errs,
              hints: [
                t`The heat is the activity times $Q$: $P = \lambda NQ$, with $\lambda = \ln 2/T_{1/2}$ (in s$^{-1}$) and $N$ the number of plutonium-238 nuclei.`,
                t`After ${yrs} years, $N = N_0\,2^{-${yrs}/87.7}$, with $N_0 = \dfrac{${kg * 1000}\ \text{g}}{238.05\ \text{g/mol}}\,N_A$.`,
                t`The fins radiate $(1 - ${eta})P = \varepsilon\sigma AT^4$: solve for $T$.`,
              ],
              teach: 'An RTG’s heat is its activity times the energy per decay, it fades with the half-life, and what the thermocouples do not take must leave as thermal radiation, σT⁴ per unit area.',
              explain: t`$N_0 = \dfrac{${kg * 1000}}{238.05}(6.022\times10^{23}) = ${tex(N0, 4)}$ nuclei and $\lambda = \dfrac{\ln 2}{(87.7)(3.156\times10^7\ \text{s})} = ${tex(lam, 4)}\ \text{s}^{-1}$, so at loading $P_0 = \lambda N_0Q = ${tex(P0, 4)}$ W — about 0.57 W per gram. After ${yrs} years, $P = P_0\,2^{-${yrs}/87.7} = ${tex(P, 4)}$ W, of which $${tex((1 - eta) * P, 4)}$ W reaches the fins. Then $$T = \left(\frac{${tex((1 - eta) * P, 4)}}{(0.90)(5.670\times10^{-8})(${A})}\right)^{1/4} = ${tex(key, 4)}\ \text{K},$$ or $${tex(key - 273.15, 3)}\ ^\circ\text{C}$. Their glow peaks near $${tex(B_WIEN * 1e6 / key, 2)}$ μm, in the mid-infrared: a probe carrying an infrared camera must keep the generator out of its view. This is an idealization — real fins are hotter at their roots than their tips — and over the decades the falling heat lowers the thermocouples' output twice over, since their efficiency also falls as the temperature difference shrinks.`,
              visual: rtgPic(),
            };
          },
        }),
        mcq({
          id: 'r4-gamow', skill: 'phys2710.MP13.1', difficulty: 4,
          gen(r) {
            const ask = r.pick(['ratio', 'life']);
            const v = (K) => Math.sqrt((2 * K) / MA);                  // v/c of each alpha
            const G = (K) => (2 * Math.PI * 2 * 92) / AINV / v(K);     // 2πη
            const dG = G(PU[238].K) - G(PU[236].K);
            const ratios = [Math.exp(dG), PU[236].K / PU[238].K, Math.exp(dG / 2), Math.exp(2 * dG)];
            const show = (x) => (ask === 'ratio' ? t`about $${tex(x, x < 2 ? 3 : 2)}$ times shorter` : 87.7 / x >= 1 ? t`about $${tex(87.7 / x, 2)}$ years` : t`about $${tex((87.7 * 365.25) / x, 2)}$ days`);
            return {
              prompt: t`Petrel's fuel is not pure: a few parts per million of it are plutonium-236, whose decay chain ends in a hard gamma-ray emitter, so the impurity's share is strictly limited. Both isotopes decay by emitting an alpha particle and leave uranium ($Z = 92$). Plutonium-238's alphas leave with $K = 5.499$ MeV; plutonium-236's with $K = 5.768$ MeV. In Gamow's leading-order estimate, the chance that an alpha tunnels out on each try is $e^{-2\pi\eta}$, with $\eta = Z_1Z_2\alpha\,c/v$: here $Z_1 = 2$ (the alpha), $Z_2 = 92$, $\alpha = 1/137.036$ and $v$ the alpha's speed as it leaves (from $K$, with $m_\alpha c^2 = 3727.4$ MeV). Taking everything else to be the same for the two isotopes, ${ask === 'ratio' ? 'how does plutonium-236’s half-life compare with plutonium-238’s?' : 'what half-life does this predict for plutonium-236, given plutonium-238’s 87.7 years?'}`,
              choices: ratios.map(show),
              answer: 0,
              why: {
                1: t`That scales the half-life in proportion to the energies, which differ by about 5%. Tunnelling depends on energy exponentially: the 5% change moves the exponent $2\pi\eta \approx ${tex(G(PU[238].K), 3)}$ by about ${tex(dG, 2)}.`,
                2: t`That is half the right exponent — what you get if the alpha's charge is taken as $e$ instead of $2e$ ($Z_1 = 1$), or the exponent as $\pi\eta$.`,
                3: t`That doubles the exponent. The tunnelling chance is $e^{-2\pi\eta}$ with $\eta \propto 1/v \propto 1/\sqrt K$; doubling it squares the ratio.`,
              },
              hints: [
                t`$v/c = \sqrt{2K/m_\alpha c^2}$ for each alpha, then $2\pi\eta = 2\pi(2)(92)\,\dfrac{1}{137.036}\,\dfrac{c}{v}$.`,
                t`The half-life is inversely proportional to the tunnelling chance, so the ratio of half-lives is $e^{2\pi\eta_{238} - 2\pi\eta_{236}}$.`,
                t`The two exponents are each about ${tex(G(PU[238].K), 3)}; it is their *difference*, about ${tex(dG, 2)}, that matters.`,
              ],
              teach: 'Because the tunnelling chance is exponential in 1/v, a few per cent more decay energy shortens an alpha emitter’s life many times over — the Geiger–Nuttall law.',
              explain: t`The speeds are $v/c = ${tex(v(PU[238].K), 4)}$ and $${tex(v(PU[236].K), 4)}$, so $2\pi\eta = ${tex(G(PU[238].K), 5)}$ for plutonium-238 and $${tex(G(PU[236].K), 5)}$ for plutonium-236. The half-lives differ by $e^{${tex(dG, 3)}} \approx ${tex(Math.exp(dG), 2)}$${ask === 'life' ? t`, predicting $87.7/${tex(Math.exp(dG), 3)} = ${tex(87.7 / Math.exp(dG), 2)}$ years` : ''}. Measured: plutonium-236 lives 2.858 years, $${tex(PU[238].half / PU[236].half, 3)}$ times shorter — so a 5% step in energy really does shorten the life thirtyfold. The leading-order term exaggerates the effect a little; Gamow's full formula, with the nuclear radius in it (lesson MP7.3), gives about 30. The impurity matters because plutonium-236's chain passes through uranium-232 to thallium-208, whose 2.6 MeV gamma rays go through shielding that stops everything plutonium-238 emits.`,
              visual: gamowPic(),
            };
          },
        }),
        num({
          id: 'r4-diode', skill: 'phys2710.MP7.3', difficulty: 4,
          gen(r) {
            const W0 = r.pick([6, 8, 10]), f = r.pick([0.05, 0.1, 0.2]), U = 0.5, mr = 0.067;
            const kap = (m) => Math.sqrt(2 * m * MEC2_KEV * 1000 * U) / HBARC;   // per nm
            const W1 = W0 / Math.sqrt(1 - f), dW = W1 - W0, F = Math.exp(-2 * kap(mr) * dW);
            return {
              prompt: t`Petrel's altimeter times its echoes with a tunnel-diode oscillator: a gallium arsenide p–n junction doped so heavily that its depletion layer is only $W_0 = ${W0}$ nm wide, and electrons tunnel straight through it. Model the layer as a rectangular barrier rising 0.5 eV above the electrons' energy, with the electron's effective mass in GaAs, $m^* = 0.067\,m_e$. Neutrons from the generator knock dopant atoms out of place, and over the mission ${tex(f * 100, 2)}% of the dopants stop working. The depletion width is $W = \sqrt{\dfrac{2\varepsilon V_\text{bi}}{e}\left(\dfrac{1}{N_A} + \dfrac{1}{N_D}\right)}$; ignore the small change in $V_\text{bi}$. By what factor does the tunnelling probability change — new divided by old? ($\hbar c = 197.33$ eV nm, $m_ec^2 = 511.0$ keV)`,
              answer: F, tol: { rel: 0.02 },
              errors: apart([
                { value: Math.exp(-2 * kap(1) * dW), feedback: t`Inside the crystal the electron moves as if its mass were $m^* = 0.067\,m_e$; with the free mass, $\kappa$ comes out $\sqrt{1/0.067} \approx 3.9$ times too big.` },
                { value: Math.exp(-kap(mr) * dW), feedback: t`The tunnelling probability goes as $|\psi|^2$, so it falls as $e^{-2\kappa W}$: the wave's amplitude falls as $e^{-\kappa x}$, its square twice as fast.` },
                { value: Math.exp(-2 * kap(mr) * W0 * (1 / (1 - f) - 1)), feedback: t`$W$ goes as $1/\sqrt N$, not $1/N$: losing ${tex(f * 100, 2)}% of the dopants widens the layer by the factor $1/\sqrt{1 - ${f}}$.` },
              ], F),
              hints: [
                t`With both dopings reduced by the same fraction, $W \propto 1/\sqrt N$, so $W = W_0/\sqrt{1 - ${f}}$.`,
                t`Inside the barrier $\psi \propto e^{-\kappa x}$ with $\kappa = \dfrac{\sqrt{2m^*(U - E)}}{\hbar} = \dfrac{\sqrt{2(m^*c^2)(U - E)}}{\hbar c}$.`,
                t`The tunnelling probability goes as $e^{-2\kappa W}$, so the factor is $e^{-2\kappa(W - W_0)}$.`,
              ],
              teach: 'A barrier’s width sits in the exponent of the tunnelling probability, so a fraction of a nanometre changes a tunnel current several-fold.',
              explain: t`Losing ${tex(f * 100, 2)}% of the dopants widens the layer to $W = ${W0}/\sqrt{${tex(1 - f, 2)}} = ${tex(W1, 4)}$ nm, $${tex(dW, 3)}$ nm wider. With $m^*c^2 = 0.067\times511.0\ \text{keV} = ${tex(mr * MEC2_KEV, 4)}$ keV, $$\kappa = \frac{\sqrt{2(${tex(mr * MEC2_KEV * 1000, 4)}\ \text{eV})(0.5\ \text{eV})}}{197.33\ \text{eV nm}} = ${tex(kap(mr), 4)}\ \text{nm}^{-1},$$ so the tunnelling probability changes by $e^{-2(${tex(kap(mr), 4)})(${tex(dW, 3)})} = ${tex(F, 3)}$. The diode's peak current falls in proportion, which shifts the oscillator's working point. The dopant losses here are generous: in so heavily doped a junction a given neutron dose removes only a small share of the dopants, which is one reason tunnel diodes have a name for radiation hardness. The rectangular barrier is a teaching model: in a real Esaki junction electrons tunnel from band to band through a roughly triangular barrier, but the exponential dependence on the layer's width is the same.`,
              visual: diodePic(W0),
            };
          },
        }),
      ],
    },
    {
      title: 'Ranging, and reckoning',
      story: t`Petrel maps its target with a laser altimeter, timing pulses of infrared light down to the surface and back. Meanwhile the mission's scientists draft the press release, and you must check what it claims.`,
      items: [
        num({
          id: 'r5-altimeter', skill: 'phys2710.MP10.3', difficulty: 3,
          gen(r) {
            const Ep = r.pick([2, 3, 5]), h = r.pick([8, 12, 20]), D = r.pick([10, 15, 20]), rho = r.pick([0.06, 0.1, 0.15]), eta = 0.4, lam = 1064;
            const Nph = (Ep * 1e-3 * lam * 1e-9) / (HPL * C), frac = (rho * (D / 100) ** 2) / (4 * (h * 1000) ** 2), N = Nph * frac * eta;
            return {
              prompt: t`Petrel's altimeter fires ${Ep} mJ pulses of 1064 nm light from a Nd:YAG laser straight down at the surface, ${h} km below. The dusty surface reflects a fraction $\rho = ${rho}$ of the light, scattering it as a Lambertian surface does: the intensity in a direction at angle $\theta$ from the vertical is proportional to $\cos\theta$. A telescope ${D} cm across, beside the laser, catches part of the echo, and its detector registers 40% of the photons that reach it. How many photoelectrons does one pulse's echo produce? ($h = 6.626\times10^{-34}$ J s, $c = 2.998\times10^8$ m/s)`,
              answer: N, tol: { rel: 0.02 },
              errors: apart([
                { value: N / 2, feedback: t`A Lambertian surface is not an even spreader over the hemisphere: it sends most light straight up. Integrating $I_0\cos\theta$ over the hemisphere gives $\pi I_0$, so straight up $I_0 = \rho P/\pi$ per steradian — twice the even-spread value $\rho P/2\pi$.` },
                { value: N / 4, feedback: t`The scattered light goes only into the hemisphere above the surface, and not evenly: straight up the intensity is $\rho P/\pi$ per steradian.` },
                { value: N / eta, feedback: 'The detector registers only 40% of the photons: multiply by its quantum efficiency.' },
                { value: N * 4, feedback: t`The telescope is ${D} cm *across*: its collecting area is $\pi(D/2)^2$.` },
              ], N),
              hints: [
                t`Each pulse holds $E_p/(hc/\lambda)$ photons.`,
                t`For a Lambertian surface, the intensity straight up is $\rho N/\pi$ photons per steradian (the factor $\pi$ comes from integrating $\cos\theta$ over the hemisphere).`,
                t`The telescope subtends a solid angle $\pi(D/2)^2/h^2$; multiply by it and by the detector's 0.40.`,
              ],
              teach: 'A laser echo’s photon budget is the pulse’s photon count, times the reflectance, times the telescope’s solid angle over π for a Lambertian surface — an inverse-square loss.',
              explain: t`Each photon carries $hc/\lambda = ${tex((HPL * C) / (lam * 1e-9), 4)}$ J, so a ${Ep} mJ pulse holds $${tex(Nph, 4)}$ photons. Straight up, the surface sends $\rho/\pi$ of them per steradian, and the telescope subtends $\pi(D/2)^2/h^2$, so the fraction caught is $$\frac{\rho}{\pi}\cdot\frac{\pi(D/2)^2}{h^2} = \frac{${rho}\,(${tex(D / 200, 3)}\ \text{m})^2}{(${h * 1000}\ \text{m})^2} = ${tex(frac, 3)}.$$ With 40% detected, $N = ${tex(Nph, 4)}\times${tex(frac, 3)}\times0.40 = ${tex(N, 3)}$ photoelectrons per pulse. Of some $10^{16}$ photons sent, only about $${tex(N / eta, 2)}$ reach the telescope — still plenty to time an echo. NASA's Lunar Orbiter Laser Altimeter works with a few millijoules per pulse from 50 km; a photon-counting altimeter such as ICESat-2's, from 500 km, gets back only a handful of photons per shot and builds its map from millions of them.`,
              visual: altPic(),
            };
          },
        }),
        mcq({
          id: 'r5-nd', skill: 'phys2710.MP10.1', difficulty: 3,
          gen(r) {
            const T = r.pick([290, 320, 350]), hck = 1.4388;      // cm K
            const f = Math.exp((-2111 * hck) / T), slip = Math.exp((-21.11 * hck) / T), photon = Math.exp((-9391 * hck) / T);
            return {
              prompt: t`The altimeter's laser crystal, Nd:YAG, sits at ${T} K. Its 1064 nm laser line runs from an upper level 11 502 cm⁻¹ above the ground level down to a lower level just 2111 cm⁻¹ above it (energies in wavenumbers, $E/hc$). Each of these levels holds the same number of states. In thermal equilibrium, what fraction of the ions are in the lower laser level, compared with the ground level — and what does that mean for the laser? ($hc/k = 1.4388$ cm K)`,
              choices: [
                t`About $${tex(f, 2)}$: the lower level is practically empty, so the first ions pumped into the upper level already make an inversion`,
                t`About $${tex(f, 2)}$, but it does not matter: light is amplified only once more than half of all the ions are in the upper level`,
                t`About $${tex(slip, 2)}$: the lower level is nearly as full as the ground level, so most ions must be pumped up before light is amplified`,
                t`About $${tex(photon, 2)}$: the gap to the lower level is the laser photon's own energy, so the level is empty`,
              ],
              answer: 0,
              why: {
                1: t`Inversion is needed only between the two *laser* levels: more ions in the upper laser level than in the lower one. Needing half of all the ions excited is the three-level problem of ruby, whose lower laser level is the ground level itself.`,
                2: t`A wavenumber in cm⁻¹ needs $hc/k$ in cm K: $2111\times1.4388/${T} = ${tex((2111 * hck) / T, 3)}$. The exponent ${tex((21.11 * hck) / T, 3)} comes from treating 2111 cm⁻¹ as 2111 m⁻¹.`,
                3: t`9391 cm⁻¹ is the laser photon's energy — the gap between the two laser levels. The lower level sits only 2111 cm⁻¹ (0.262 eV) above the ground level, so it holds a small but not vanishing population.`,
              },
              hints: [
                t`Boltzmann: with equal numbers of states, $N_\text{lower}/N_\text{ground} = e^{-\Delta E/kT}$.`,
                t`With $\Delta E$ as a wavenumber, $\Delta E/kT = \tilde\nu\,(hc/k)/T = 2111\times1.4388/${T}$.`,
              ],
              teach: 'In a four-level laser the lower laser level lies many kT above the ground level, so Boltzmann leaves it almost empty and a small pump makes an inversion.',
              explain: t`$\Delta E/kT = 2111\times1.4388/${T} = ${tex((2111 * hck) / T, 4)}$, so $N_\text{lower}/N_\text{ground} = e^{-${tex((2111 * hck) / T, 4)}} = ${tex(f, 3)}$. Inversion is between the two laser levels only, and the lower one starts almost empty — and stays so, since ions leave it for the ground level in nanoseconds. That is the four-level scheme: a few watts from 808 nm diodes run a Nd:YAG laser, where ruby's three-level scheme needed a flash lamp to empty more than half its ground level. The level's weak thermal population is why a hot crystal lases less well: at 350 K it is $${tex(Math.exp((-2111 * hck) / 350), 2)}$, about ${tex(Math.exp((-2111 * hck) / 350) / Math.exp((-2111 * hck) / 290), 2)} times its value at 290 K.`,
              visual: ndPic(),
            };
          },
        }),
        multi({
          id: 'r5-honest', skill: 'phys2710.MP13.2', difficulty: 3,
          prompt: t`The mission's draft press release makes six claims about the physics behind its science. Select **every** claim that is established by observation.`,
          choices: [
            'Neutrinos have mass: they change from one flavour to another as they travel, which massless neutrinos could not do.',
            'The microwave background matches a blackbody spectrum at 2.725 K to within about one part in ten thousand.',
            'Galaxies’ rotation, gravitational lensing by clusters and the pattern of the microwave background all need more gravity than visible matter supplies.',
            'The masses of the three neutrinos have been measured, the heaviest at about 0.05 eV.',
            'Dark matter is made of weakly interacting massive particles (WIMPs).',
            'The proton decays, with a lifetime of about 10³⁴ years.',
          ],
          answer: [0, 1, 2],
          why: {
            3: 'Oscillations measure only the differences between the squared masses; they show that at least one neutrino is heavier than about 0.05 eV, but not the masses themselves. KATRIN caps the scale at 0.45 eV; the absolute masses are an open question.',
            4: 'WIMPs are one candidate among several (axions, sterile neutrinos, primordial black holes…). Direct searches have found none so far: what dark matter is made of is open.',
            5: 'No proton decay has ever been seen. Experiments such as Super-Kamiokande set lower limits on the lifetime above 10³⁴ years; the decay is a prediction of some grand unified theories, not an observation.',
          },
          hints: [
            'Ask of each claim: has it been measured, or is it a hypothesis that measurements constrain?',
            'A limit (“less than”, “longer than”) is a measurement of what is not seen yet; a claim that names a cause nobody has detected is a hypothesis.',
          ],
          teach: 'Science reports what is measured, what is inferred and what is open separately — the evidence for dark matter’s gravity is solid, what it is made of is unknown.',
          explain: t`Established: neutrino oscillation (Super-Kamiokande and SNO, Nobel Prize 2015), so neutrinos have mass; the microwave background's blackbody spectrum (COBE's FIRAS, deviations below about 50 parts per million); and the missing gravity, seen independently in rotation curves, lensing and the background's acoustic peaks. Open: the neutrinos' absolute masses (oscillations fix only differences of squared masses; KATRIN gives $m_\nu < 0.45$ eV), what dark matter is made of (WIMPs are one candidate, unfound), and whether protons decay at all (lifetime limits above $10^{34}$ years). The picture shows the oldest of the dark-matter clues, a rotation curve: the measurement is solid; its explanation is still being argued — most physicists favour unseen matter, a minority modified gravity.`,
          visual: rotationPic(),
        }),
      ],
    },
  ],
});
