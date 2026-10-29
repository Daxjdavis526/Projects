// The PHYS 3710 boss, "The Spacetime Navigator": Gannet, an imagined uncrewed
// interstellar probe built on paper from real physics, flies to Gaia BH1, the
// nearest known black hole. On the pad, its fission reactor's fuel burn from
// the binding-energy curve and the zirconium-95 → niobium-95 clock that dates
// its last run (a parent–daughter chain); the ideal exhaust speed of three
// aneutronic-leaning fusion fuels from their Q-values. Then two engines nobody
// has built: staged rapidities from the relativistic rocket equation, the
// conservation laws an antiproton annihilation must obey, and how many of its
// charged pions decay inside the magnetic nozzle (four-momentum and time
// dilation). In cruise, the speed at which interstellar protons hitting the
// shield could make pions (a threshold from the invariant mass) and the
// Doppler shift of the laser link as a rapidity. Two frames: an interval in
// the −+++ convention and the order of four events read off a Minkowski
// diagram. At Gaia BH1, the companion star's orbit dilated (not Doppler
// shifted) in Gannet's frame, and a static beacon's clock near the horizon.
// Every number a learner reads comes from its generator; the case functions
// are exported so a script can recompute every key another way.
import { boss, mcq, num, order } from '../../src/core/content.js';
import { tex, sig } from '../../src/core/format.js';
import { st, seg, label, r6 } from './_geom.js';
import { AME, binding, tn, uni } from './_nuclear.js';

const t = String.raw;
const NB = '\u00a0';   // a no-break space, between a number and its unit in prose
const LN2 = Math.LN2;
const r4 = (v) => +(+v).toFixed(4);

// ---- constants as the prompts print them, so a key always matches its prompt
const MEV_J = 1.602e-13;      // J per MeV
const YR = 3.156e7;           // s per year
const NA = 6.022e23;          // per mol
const M235 = 235.04;          // g/mol, uranium-235
const UMEV = 931.494;         // MeV per u
const C_KMS = 2.998e5;        // km/s
const C_MS = 2.998e8;         // m/s
const MP = 938.27, MN = 939.57, MPI = 139.57, MPI0 = 134.98;   // MeV (PDG 2024, rounded)
const TAU_PI = 26.03e-9;      // s, the charged pion's mean life
const E_ANN = 1876.5;         // MeV, 2 m_p c²
const T_ZR = 64.03, T_NB = 34.99;   // d, NUBASE2020
const T_ORBIT = 185.6;        // d, Gaia BH1's companion (El-Badry et al. 2023)
const M_BH = 9.62;            // solar masses, Gaia BH1
const RS_SUN = 2.953;         // km of Schwarzschild radius per solar mass
const GM_SUN = 1.32712e20;    // m³/s²

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}

// ── round 1 ──────────────────────────────────────────────────────────────────
const SPLIT = ['U-235', 'Xe-140', 'Sr-94'];
const bpa = (name) => +(binding(name) / +name.split('-')[1]).toFixed(4);

/** Fission fuel burn: the reactor's heat P (kW) and the printed binding energies per nucleon. */
export function fissionCase(r) {
  const P = r.pick([4, 8, 10, 20, 25, 40]);
  const [bU, bXe, bSr] = SPLIT.map(bpa);
  const Q = 140 * bXe + 94 * bSr - 235 * bU;
  const perYear = (q) => ((P * 1e3 * YR) / (q * MEV_J)) * (M235 / NA);
  return { P, bU, bXe, bSr, Q, grams: perYear(Q), perYear };
}

/** A curve of binding energy per nucleon: the liquid drop along the valley of stability, as a graph expression in A = x. */
const ZV = '(x/(1.98 + 0.0155*x^(2/3)))';
const SEMF_BA = `15.75 - 17.8*x^(-1/3) - 0.711*${ZV}*(${ZV} - 1)*x^(-4/3) - 23.7*(x - 2*${ZV})^2/x^2`;
function bindingPic(C) {
  const pts = [['U-235', C.bU, 'warn', -8, 14, 'right'], ['Xe-140', C.bXe, 'accent', 8, 16], ['Sr-94', C.bSr, 'accent', 8, 16]];
  return {
    type: 'graph',
    params: {
      x: [0, 250], y: [7.2, 9.0], aspect: 'wide', axesAt: 'edge', xlabel: 'mass number A', ylabel: 'B/A (MeV per nucleon)', yticks: 4,
      curves: [{ fn: SEMF_BA, domain: [24, 250], color: 'ink3', width: 2 }],
      points: pts.map(([n, b, col, dx, dy, al]) => ({ x: +n.split('-')[1], y: b, r: 5, color: col, label: uni(n), labelDx: dx, labelDy: dy, ...(al ? { labelAlign: al } : {}) })),
      alt: 'Binding energy per nucleon against mass number, with uranium-235 low on the right and the two fission fragments higher in the middle',
    },
    caption: 'Binding energy per nucleon. The grey curve is the liquid-drop formula along the valley of stability (pairing and shell effects ignored); the dots are the AME2020 values the problem prints. The vertical axis starts at 7.2 MeV, which exaggerates the differences.',
  };
}

/** The zirconium-95 → niobium-95 clock: days since shutdown and the activity ratio read on launch day. */
export function clockCase(r) {
  const days = r.pick([25, 40, 55, 70, 90, 110, 130]);
  const l1 = LN2 / T_ZR, l2 = LN2 / T_NB, k = l2 - l1, Req = l2 / k;
  const R = sig(Req * (1 - Math.exp(-k * days)), 4);
  const key = -Math.log(1 - R / Req) / k;
  return { days, l1, l2, k, Req, R, key };
}
function clockPic() {
  return {
    type: 'nuc-chain',
    params: { chain: 'pair', ratio: r6(T_NB / T_ZR), readout: false, controls: false, alt: 'The activities of zirconium-95 and of its daughter niobium-95 after a short burst of fission: the daughter rises from zero, overtakes its parent and then falls with it' },
    caption: 'After a short burst of fission: zirconium-95 (“parent”) and niobium-95 (“daughter”), each activity divided by the zirconium’s at shutdown, with time in zirconium half-lives (64.03 d). From Bateman’s solution; the small amount of niobium-95 made directly by fission is ignored.',
  };
}

const FUELS = [
  { key: 'pb', name: 'proton–boron-11 fusion', react: ['H-1', 'B-11'], prod: ['He-4', 'He-4', 'He-4'], eq: t`p + {}^{11}\text{B} \to 3\,{}^{4}\text{He}`,
    tagR: ['p', '¹¹B'], tagP: ['α', 'α', 'α'],
    note: t`Proton–boron-11 is the favourite of fusion-rocket studies because its main reaction makes no neutrons — but it needs ion temperatures above a billion kelvin, and no machine has come anywhere near getting more energy out of it than it puts in.` },
  { key: 'he3', name: 'helium-3 fusing with itself', react: ['He-3', 'He-3'], prod: ['He-4', 'H-1', 'H-1'], eq: t`{}^{3}\text{He} + {}^{3}\text{He} \to {}^{4}\text{He} + 2p`,
    tagR: ['³He', '³He'], tagP: ['α', 'p', 'p'],
    note: t`Helium-3 fusing with itself makes no neutrons either, but it burns far more slowly than deuterium–tritium at any temperature, and helium-3 is so rare on Earth that proposals look to the Moon’s soil or the atmospheres of the giant planets for it.` },
  { key: 'dli', name: 'deuterium–lithium-6 fusion', react: ['H-2', 'Li-6'], prod: ['He-4', 'He-4'], eq: t`{}^{2}\text{H} + {}^{6}\text{Li} \to 2\,{}^{4}\text{He}`,
    tagR: ['²H', '⁶Li'], tagP: ['α', 'α'],
    note: t`Deuterium–lithium-6 releases the most per kilogram of the three, but its side reactions make neutrons and tritium, and nobody has burned it in a controlled plasma either.` },
];
/** A fusion fuel's ideal exhaust speed: Q from atomic masses, then ½Mv² = Q for the products' rest mass M. */
export function fuelCase(r) {
  const F = FUELS[r.int(0, FUELS.length - 1)];
  const m = (n) => +sig(AME[n][1], 10);
  const mR = F.react.reduce((s, n) => s + m(n), 0), mP = F.prod.reduce((s, n) => s + m(n), 0);
  const Q = (mR - mP) * UMEV, Mc2 = mP * UMEV;
  const beta = Math.sqrt((2 * Q) / Mc2);
  return { F, m, Q, Mc2, beta, v: beta * C_KMS, mAlpha: m('He-4') * UMEV };
}
function fuelPic(F) {
  const nP = F.prod.length, outs = F.tagP.map((s, k) => {
    const y = nP === 1 ? 0 : -1.6 + (3.2 * k) / (nP - 1);
    return { y, s };
  });
  return {
    type: 'graph',
    params: {
      x: [-7.5, 12.5], y: [-2.8, 2.8], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, equal: true,
      shade: [{ fn: 'sqrt(max(0, 1.44 - x^2))', lower: '-sqrt(max(0, 1.44 - x^2))', from: -1.2, to: 1.2, color: 'warn', alpha: 0.35 }],
      curves: [{ fn: '1.4 + 0.18*(x - 1.6)', domain: [1.6, 11.5], color: 'ink3', width: 2.2 }, { fn: '-1.4 - 0.18*(x - 1.6)', domain: [1.6, 11.5], color: 'ink3', width: 2.2 }],
      arrows: [
        { from: [-6, 1.6], to: [-1.3, 0.35], color: 'accent', width: 2.2 }, { from: [-6, -1.6], to: [-1.3, -0.35], color: 'violet', width: 2.2 },
        ...outs.map(({ y }) => ({ from: [1.3, r4(y * 0.25)], to: [10.6, r4(y)], color: 'gold', width: 2.2 })),
      ],
      points: [
        label(-6.2, 1.6, F.tagR[0], 'accent', -6, 0, 'right'), label(-6.2, -1.6, F.tagR[1], 'violet', -6, 0, 'right'),
        ...outs.map(({ y, s }) => label(10.7, y, s, 'gold', 8, 0, 'left')),
        label(0, -1.4, 'burning plasma', 'warn', 0, 16, 'center'), label(6.5, 2.4, 'magnetic nozzle', 'ink3', 0, -14, 'center'),
      ],
      alt: 'Two fuel nuclei meet in a hot plasma and the products stream out through a flared magnetic nozzle',
    },
    caption: 'A fusion stage, schematic and not to scale. The products are drawn leaving straight out of the back at one speed — the ideal the problem assumes; real products fly off in every direction and a magnetic nozzle can only partly turn them.',
  };
}

// ── round 2 ──────────────────────────────────────────────────────────────────
/** Two collinear burns: rapidities from the relativistic rocket equation, then β = tanh φ. */
export function stagesCase(r) {
  const u1 = r.pick([0.03, 0.04]), R1 = r.pick([4, 6, 8, 10]), u2 = r.pick([0.3, 0.35, 0.4]), R2 = r.pick([3, 4, 5]);
  const p1 = u1 * Math.log(R1), p2 = u2 * Math.log(R2), phi = p1 + p2;
  return { u1, R1, u2, R2, p1, p2, phi, beta: Math.tanh(phi) };
}
function rapidityPic() {
  return {
    type: 'graph',
    params: {
      x: [0, 1.4], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'rapidity φ', ylabel: 'speed β = v/c', yticks: 5,
      curves: [
        { fn: 'tanh(x)', domain: [0, 1.4], color: 'accent', width: 2.6, label: 'relativity: β = tanh φ', labelAt: 1.05, labelDx: 4, labelDy: 18 },
        { fn: 'x', domain: [0, 1.22], color: 'warn', width: 2, dash: true, label: 'Newton: β = φ', labelAt: 0.92, labelDx: -14, labelDy: -4, labelAlign: 'right' },
      ],
      hlines: [{ y: 1, label: 'speed of light', color: 'ink3' }],
      alt: 'Speed against rapidity: the relativistic curve tanh φ bends over below the speed of light while the Newtonian straight line crosses it',
    },
    caption: 'Speed against rapidity. Rapidities of boosts along one line add, like distances along the horizontal axis; the speed is then read off the tanh curve, which never reaches 1. Newton’s straight line is what adding speeds would give.',
  };
}

const ALLOWED = [
  { tex: t`$\bar p + p \to \pi^+ + \pi^- + \pi^0$`, why: t`Charge $0 \to 0$, baryon number $-1 + 1 = 0 \to 0$, no leptons, and $1876.5$ MeV is plenty for three pions (about 414 MeV of rest energy).` },
  { tex: t`$\bar p + p \to 2\pi^+ + 2\pi^- + \pi^0$`, why: t`Charge $0 \to 0$, baryon number $0 \to 0$, no leptons, and five pions need only about 700 MeV of the 1876.5 MeV available.` },
  { tex: t`$\pi^+ \to \mu^+ + \nu_\mu$`, why: t`Charge $+1 \to +1$; muon number $0 \to -1 + 1 = 0$ (the $\mu^+$ is an antilepton, the $\nu_\mu$ a lepton). This is how nearly every charged pion decays.` },
  { tex: t`$\mu^+ \to e^+ + \nu_e + \bar\nu_\mu$`, why: t`Charge $+1 \to +1$; muon number $-1 \to -1$ (the $\bar\nu_\mu$); electron number $0 \to -1 + 1 = 0$. This is how every muon from the pions ends.` },
  { tex: t`$\pi^0 \to \gamma + \gamma$`, why: t`Charge $0 \to 0$, and two photons can share zero total momentum in the pion’s rest frame. This is how the neutral pions vanish, almost at once.` },
];
const FORBIDDEN = [
  [{ tex: t`$\bar p + p \to \pi^+ + \pi^0$`, why: t`Charge: $0$ before, $+1$ after. Every interaction conserves electric charge.` }],
  [
    { tex: t`$\pi^+ \to \mu^+ + \bar\nu_\mu$`, why: t`Muon number: $0$ before, $-1 - 1 = -2$ after. A $\mu^+$ must be paired with a $\nu_\mu$, not a $\bar\nu_\mu$.` },
    { tex: t`$\pi^- \to \mu^- + \nu_\mu$`, why: t`Muon number: $0$ before, $+1 + 1 = +2$ after. A $\mu^-$ must be paired with a $\bar\nu_\mu$.` },
    { tex: t`$\mu^+ \to e^+ + \gamma$`, why: t`Muon number goes $-1 \to 0$ and electron number $0 \to -1$: each lepton family is conserved on its own. Experiments have searched for this decay and never seen it, in fewer than one muon decay in $10^{12}$.` },
  ],
  [
    { tex: t`$\bar p \to \pi^- + \gamma$`, why: t`Baryon number: $-1$ before, $0$ after. Charge balances and there is energy to spare, but no antiproton has ever been seen to decay.` },
    { tex: t`$\bar p + p \to \pi^+ + \pi^- + n$`, why: t`Baryon number: $-1 + 1 = 0$ before, $+1$ after (the neutron). Charge and energy would both allow it.` },
  ],
  [{ tex: t`$\bar p + p \to \gamma$`, why: t`Energy and momentum: the pair at rest has zero momentum, but a single photon of energy $E$ carries momentum $E/c$. Annihilation at rest needs at least two photons, flying apart.` }],
];
/** One allowed record and three forbidden ones, each from a different conservation law. */
export function conserveCase(r) {
  const ok = r.pick(ALLOWED);
  const groups = r.shuffle([0, 1, 2, 3]).slice(0, 3).sort((a, b) => a - b);
  const bad = groups.map((g) => r.pick(FORBIDDEN[g]));
  return { ok, bad, groups };
}
function chamberPic(L) {
  const curves = [
    { fn: '0.9 + 0.17*(x - 1.4)', domain: [1.4, 11.2], color: 'ink3', width: 2.2 },
    { fn: '-0.9 - 0.17*(x - 1.4)', domain: [1.4, 11.2], color: 'ink3', width: 2.2 },
    { param: ['t', '0.55*sin(1.9*t)*(1 - exp(-1.5*t))'], t: [0, 11], color: 'warn', width: 2 },
    { param: ['t', '-0.45*sin(1.6*t + 0.4)*(1 - exp(-1.5*t)) - 0.1*t'], t: [0, 10.6], color: 'accent', width: 2 },
    { param: ['-1.8*sin(t)', '1.8*(1 - cos(t))'], t: [0, 1.9], color: 'warn', width: 2 },
    seg(0, 0, -2.6, -2.6, 'gold', 1.6, true), seg(0, 0, -0.6, 3.0, 'gold', 1.6, true),
  ];
  const arrows = [{ from: [-6.4, 0], to: [-0.25, 0], color: 'violet', width: 2.4 }];
  const points = [
    { x: 0, y: 0, r: 5, color: 'ink' }, label(-6.4, 0, 'antiprotons', 'violet', 0, -12, 'left'),
    label(5.4, 2.3, 'magnetic nozzle', 'ink3', 0, -6, 'center'), label(11, 0.6, 'π⁺', 'warn', 8, 0, 'left'), label(10.6, -1.3, 'π⁻', 'accent', 8, 0, 'left'),
    label(-2.6, -2.6, 'γ (from a π⁰)', 'gold', -6, 0, 'right'), label(-1.8, 2.6, 'π⁺', 'warn', -8, 0, 'right'),
  ];
  if (L) {
    arrows.push({ from: [1.4, -3.3], to: [11.2, -3.3], color: 'ink2', width: 1.6 });
    points.push(label(6.3, -3.3, `nozzle, ${L} m`, 'ink2', 0, 14, 'center'));
  }
  return {
    type: 'graph',
    params: { x: [-7.5, 13], y: [-4.1, 3.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves, arrows, points,
      alt: 'An antiproton beam meets a hydrogen target; charged pion tracks spiral away along a flared magnetic nozzle, and photons from neutral pions fly off straight' },
    caption: L === undefined
      ? 'The antimatter stage’s reaction chamber, schematic and not to scale; the dot where the tracks meet is the hydrogen target. Charged particles spiral along the nozzle’s magnetic field; neutral pions decay at once into photons, which no field can steer.'
      : 'The reaction chamber and nozzle, schematic and not to scale (the dot where the tracks meet is the hydrogen target): tracks are drawn as gentle spirals, and the field coils are left out. The neutral pions’ photons fly off in every direction and are lost as thrust.',
  };
}

/** Charged pions from annihilation at rest (five pions sharing 2mₚc² equally): decay fraction in a nozzle of length L, or the length for a fraction f. */
export function pionsCase(r) {
  const mode = r.pick(['frac', 'len']);
  const E = E_ANN / 5, g = E / MPI, bg = Math.sqrt(g * g - 1), ct = C_MS * TAU_PI, ell = bg * ct;
  if (mode === 'frac') {
    const L = r.pick([4, 6, 8, 10, 12, 15]);
    return { mode, L, E, g, bg, ct, ell, key: 100 * (1 - Math.exp(-L / ell)) };
  }
  const f = r.pick([5, 10, 15, 20, 25]);
  return { mode, f, E, g, bg, ct, ell, key: -ell * Math.log(1 - f / 100) };
}

// ── round 3 ──────────────────────────────────────────────────────────────────
const REACTIONS = [
  { tex: t`p + p \to p + n + \pi^+`, masses: [MP, MN, MPI], products: ['p', 'n', 'pi+'], what: 'a neutron and a positive pion' },
  { tex: t`p + p \to p + p + \pi^+ + \pi^-`, masses: [MP, MP, MPI, MPI], products: ['p', 'p', 'pi+', 'pi-'], what: 'a pair of charged pions' },
  { tex: t`p + p \to p + p + \pi^0 + \pi^0`, masses: [MP, MP, MPI0, MPI0], products: ['p', 'p', 'pi0', 'pi0'], what: 'two neutral pions' },
];
/** The pion-production threshold for an interstellar proton hitting a shield proton at rest. */
export function shieldCase(r) {
  const R = r.pick(REACTIONS), ask = r.pick(['beta', 'K']);
  const M = R.masses.reduce((s, x) => s + x, 0);
  const K = (M * M - 4 * MP * MP) / (2 * MP), g = 1 + K / MP, beta = Math.sqrt(1 - 1 / (g * g));
  return { R, ask, M, K, g, beta, key: ask === 'beta' ? beta : K };
}

/** The laser link: uplink (what must be sent so the ship receives λ) or downlink (what Earth receives). */
export function laserCase(r) {
  const phi = r.pick([0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7]), lam = r.pick([1064, 1550]), mode = r.pick(['up', 'down']);
  const D = Math.exp(phi), beta = Math.tanh(phi), g = Math.cosh(phi);
  return { phi, lam, mode, D, beta, g, key: mode === 'up' ? lam / D : lam * D };
}
function laserPic(mode) {
  const up = mode === 'up';
  return {
    type: 'graph',
    params: {
      x: [-1.6, 12.4], y: [-2.1, 2.1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, equal: true,
      shade: [{ fn: 'sqrt(max(0, 0.81 - x^2))', lower: '-sqrt(max(0, 0.81 - x^2))', from: -0.9, to: 0.9, color: 'accent', alpha: 0.45 }],
      curves: [{ fn: '0.42*sin(4.2*(x - 1.2))', domain: [1.2, 9.4], color: 'bad', width: 2 }, seg(9.9, -0.35, 10.9, 0, 'ink2', 2.4), seg(9.9, 0.35, 10.9, 0, 'ink2', 2.4), seg(9.9, -0.35, 9.9, 0.35, 'ink2', 2.4)],
      arrows: [{ from: [10.4, -1.2], to: [12.2, -1.2], color: 'gold', width: 2.4 }, up ? { from: [4.6, 1.3], to: [6.6, 1.3], color: 'bad', width: 1.8 } : { from: [6.6, 1.3], to: [4.6, 1.3], color: 'bad', width: 1.8 }],
      points: [label(0, -0.9, 'mission control', 'accent', 0, 16, 'center'), label(10.4, 0.35, 'Gannet', 'ink2', 0, -14, 'center'), label(11.3, -1.2, 'receding', 'gold', 0, 16, 'center'),
        label(5.6, 1.3, up ? 'uplink' : 'downlink', 'bad', 0, -12, 'center')],
      alt: 'Mission control on the left and the receding ship on the right, joined by a laser beam whose waves are drawn stretching out with distance',
    },
    caption: 'The laser link, schematic: the distance is light-years, and the wave only marks the beam — its wavelength is not to scale, and is different in the two frames. Earth’s own motion around the Sun (about 10⁻⁴ c) is neglected.',
  };
}

// ── round 4 ──────────────────────────────────────────────────────────────────
/** Two events in the Sun's frame, z = 0: the interval −Δt² + Δx² + Δy². */
export function intervalCase(r) {
  for (let k = 0; k < 200; k++) {
    const tP = r.int(1, 4), tQ = tP + r.int(2, 7);
    const xP = r.int(-3, 3), yP = r.intExcept(-3, 3, [0]), xQ = r.int(-6, 6), yQ = r.int(-6, 6);
    const dt = tQ - tP, dx = xQ - xP, dy = yQ - yP;
    const s2 = -dt * dt + dx * dx + dy * dy;
    if (dx === 0 || dy === 0 || Math.abs(s2) < 3) continue;
    if (Math.abs(-tQ * tQ + xQ * xQ + yQ * yQ - s2) < 1) continue;
    return { tP, tQ, xP, yP, xQ, yQ, dt, dx, dy, s2 };
  }
  return { tP: 2, tQ: 7, xP: 1, yP: -2, xQ: 5, yQ: 3, dt: 5, dx: 4, dy: 5, s2: 16 };
}
function mapPic(C) {
  return {
    type: 'graph',
    params: {
      x: [-7, 7], y: [-7, 7], equal: true, aspect: '', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 'y (light-years)', grid: true,
      curves: [seg(C.xP, C.yP, C.xQ, C.yQ, 'ink3', 1.4, true)],
      points: [
        { x: 0, y: 0, r: 6, color: 'gold', label: 'Sun', labelDx: 8, labelDy: 14 },
        { x: C.xP, y: C.yP, r: 5, color: 'accent', label: `P (t = ${C.tP} yr)`, labelDx: 9, labelDy: -9 },
        { x: C.xQ, y: C.yQ, r: 5, color: 'warn', label: `Q (t = ${C.tQ} yr)`, labelDx: 9, labelDy: -9 },
      ],
      alt: 'A map of the plane around the Sun with the places of events P and Q marked and joined by a dashed line',
    },
    caption: 'Where the two events happen, on a map of the Sun’s frame (light-years, z = 0). Times are in the Sun’s frame; a map cannot show them, so they are written beside the events.',
  };
}

/** Four events (t, x) whose order for Gannet (moving at β along +x) differs from the Sun's. */
const NAMES = ['P', 'Q', 'R', 'S'];
export function orderCase(r) {
  const beta = r.pick([0.5, 0.6, 0.75]);
  for (let k = 0; k < 400; k++) {
    const ev = NAMES.map((name) => ({ name, x: r.int(-3, 4), t: r.int(1, 9) / 2 }));
    const w = ev.map((e) => e.t - beta * e.x);
    const ws = [...w].sort((a, b) => a - b), ts = ev.map((e) => e.t).sort((a, b) => a - b);
    if (ws.some((v, i) => i && v - ws[i - 1] < 0.6)) continue;
    if (ts.some((v, i) => i && v - ts[i - 1] < 0.4)) continue;
    const byG = [...ev].sort((a, b) => a.t - beta * a.x - (b.t - beta * b.x)), byS = [...ev].sort((a, b) => a.t - b.t);
    if (byG.every((e, i) => e === byS[i])) continue;
    if (new Set(ev.map((e) => `${e.x},${e.t}`)).size < 4) continue;
    return { beta, ev, byG, byS, g: 1 / Math.sqrt(1 - beta * beta) };
  }
  const ev = [{ name: 'P', x: -2, t: 1 }, { name: 'Q', x: 3, t: 2 }, { name: 'R', x: 0, t: 2.5 }, { name: 'S', x: 4, t: 4 }];
  const byG = [...ev].sort((a, b) => a.t - beta * a.x - (b.t - beta * b.x));
  return { beta, ev, byG, byS: [...ev].sort((a, b) => a.t - b.t), g: 1 / Math.sqrt(1 - beta * beta) };
}

// ── round 5 ──────────────────────────────────────────────────────────────────
/** The companion's orbit in Gannet's frame: dilated by γ (not Doppler shifted). */
export function periodCase(r) {
  const beta = r.pick([0.4, 0.45, 0.5, 0.55, 0.6]);
  const g = 1 / Math.sqrt(1 - beta * beta);
  return { beta, g, key: g * T_ORBIT, seen: T_ORBIT * Math.sqrt((1 - beta) / (1 + beta)) };
}
function periodPic(beta) {
  const x0 = 4.4, tick = [0, 1, 2, 3, 4], hits = tick.map((n) => { const th = (x0 + n) / (1 + beta); return [x0 - beta * th, th]; });
  return st({
    x: [-1.2, 5.2], t: [-0.4, 6.4], numbers: false, aspect: 'square',
    xlabel: 'x (not to scale)', ylabel: 't (orbits of the companion)',
    lines: [
      { pts: [[0, -0.4], [0, 6.4]], color: 'warn', width: 2.6, label: 'companion', at: 0, dx: -8, dy: 50, align: 'right' },
      { pts: [[x0, 0], [x0 - beta * 6.3, 6.3]], color: 'accent', width: 2.6, label: 'Gannet', at: 0, dx: 10, dy: 30 },
    ],
    events: tick.map((n) => [0, n, '', 'warn']),
    extra: { curves: hits.map(([x, tt], n) => seg(0, n, x, tt, 'gold', 1.3, true)) },
    caption: 'The black hole’s frame (c = 1), not to scale: the companion star’s worldline with a dot at each completed orbit, and Gannet coming in from the right. Dashed gold: the light from each dot, which reaches Gannet sooner and sooner because Gannet keeps closing the distance.',
  });
}

/** A static clock near Gaia BH1 ticking at fraction f of a distant clock's rate. */
export function bhCase(r) {
  const f = r.pick([0.5, 0.6, 0.7, 0.8, 0.9]);
  const rs = RS_SUN * M_BH, rr = rs / (1 - f * f), h = rr - rs;
  const acc = (GM_SUN * M_BH) / ((rr * 1e3) ** 2 * f) / 9.81;   // proper acceleration to hover, in g
  return { f, rs, r: rr, h, acc };
}
function bhPic() {
  return {
    type: 'graph',
    params: {
      x: [0, 6], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'r ÷ rₛ (Schwarzschild radial coordinate)', ylabel: 'clock rate dτ/dt', yticks: 5,
      shade: [{ fn: '1.15', lower: '0', from: 0, to: 1, color: 'ink4', alpha: 0.35 }],
      curves: [{ fn: 'sqrt(1 - 1/x)', domain: [1, 6], color: 'accent', width: 2.6, label: 'static clock', labelAt: 4.2, labelDx: 0, labelDy: 18 }],
      vlines: [{ x: 1, label: 'horizon', color: 'bad' }],
      hlines: [{ y: 1, label: 'clock far away', color: 'ink3' }],
      alt: 'The tick rate of a static clock against its radius: zero at the horizon, rising toward the rate of a distant clock',
    },
    caption: 'How fast a clock held static outside a non-rotating black hole ticks, compared with a clock far away: √(1 − rₛ/r). Inside the horizon (grey) nothing can be held static. The black hole is treated as not spinning; Gaia BH1’s spin is not known.',
  };
}

// ── the battle ───────────────────────────────────────────────────────────────
export default boss({
  title: 'The Spacetime Navigator',
  intro: t`*Gannet* is an imagined interstellar probe, built on paper from real physics: a fission reactor of the kind NASA tested in 2018 for power, and for thrust a fusion stage and an antimatter stage — two engines that nobody has built, and that nobody yet knows how to build. Its target is real: **Gaia BH1**, a black hole of about 9.6 solar masses some 1,560 light-years away, the nearest known, with a Sun-like star in orbit around it. At half the speed of light the trip takes over three thousand years by Earth’s clocks, so Gannet flies without a crew, and you are its navigator at mission control, checking the numbers its designers send you: binding energies, decay chains and reactions, then rapidities, four-momenta, intervals and diagrams, and at the end a black hole’s clock. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'On the pad',
      story: t`Before launch, Gannet’s power and fuel are checked. The reactor’s heat comes from splitting uranium, and the binding-energy curve says how much each split gives; the reactor’s own fission products keep a clock of when it last ran; and the fusion stage’s fuel sets how fast its exhaust can possibly leave.`,
      items: [
        num({
          id: 'r1-fission', skill: 'phys3710.N1.1', difficulty: 3,
          gen(r) {
            const C = fissionCase(r);
            const { P, bU, bXe, bSr, Q, grams, perYear } = C;
            const Q1 = bXe + bSr - bU, Q2 = 235 * ((140 * bXe + 94 * bSr) / 234 - bU);
            const nPerYr = (P * 1e3 * YR) / (Q * MEV_J);
            return {
              prompt: t`Gannet’s electricity comes from a small uranium-235 fission reactor, a scaled-up cousin of KRUSTY, the kilowatt-class reactor NASA ran on the ground in Nevada in 2018. A typical split is $$n + ${tn('U-235')} \to ${tn('Xe-140')} + ${tn('Sr-94')} + 2n.$$ Binding energies per nucleon $B/A$, from the 2020 Atomic Mass Evaluation: $${tn('U-235')}$ $${bU}\ \text{MeV}$, $${tn('Xe-140')}$ $${bXe}\ \text{MeV}$, $${tn('Sr-94')}$ $${bSr}\ \text{MeV}$. The reactor makes ${P} kW of heat. Counting only the energy of this split, how many grams of uranium-235 does it fission in a year? ($1\ \text{MeV} = 1.602\times10^{-13}$ J, $1\ \text{yr} = 3.156\times10^{7}$ s, $N_A = 6.022\times10^{23}\ \text{mol}^{-1}$, uranium-235 is 235.04 g/mol.)`,
              answer: grams, units: 'g', tol: { rel: 0.01 },
              errors: apart([
                { value: perYear(Q1), feedback: t`$B/A$ is binding energy *per nucleon*. Each nucleus’s total binding energy is $A$ times it, so $Q = 140(B/A)_{\text{Xe}} + 94(B/A)_{\text{Sr}} - 235(B/A)_{\text{U}}$; the free neutrons have none.` },
                { value: perYear(Q2), feedback: t`Multiplying the average gain per nucleon by 235 counts nucleons the fragments do not have: the two fragments hold 234 nucleons between them, and the uranium 235. Add up each nucleus’s total binding energy instead.` },
              ], grams),
              hints: [
                t`The energy released is the binding energy gained: $Q = B_{\text{after}} - B_{\text{before}}$, with each nucleus’s total $B = A\times(B/A)$, and none for a free neutron.`,
                t`$Q = 140(${bXe}) + 94(${bSr}) - 235(${bU})$ MeV. Then fissions per year $= P\times(1\ \text{yr})/Q$, with $Q$ in joules.`,
                t`Mass $=$ (fissions per year) $\times\ 235.04\ \text{g/mol} \div N_A$.`,
              ],
              teach: 'A fission releases the binding energy its fragments gain over the uranium: about 0.8 MeV for each of 235 nucleons.',
              explain: t`The fragments are more tightly bound than the uranium, and the difference is released: $$Q = 140(${bXe}) + 94(${bSr}) - 235(${bU}) = ${tex(Q, 4)}\ \text{MeV} = ${tex(Q * MEV_J, 4)}\ \text{J}.$$ At ${P} kW the reactor needs $\dfrac{(${P}\times10^{3})(3.156\times10^{7})}{${tex(Q * MEV_J, 4)}} = ${tex(nPerYr, 4)}$ fissions a year, which is $${tex(nPerYr, 4)}\times235.04/(6.022\times10^{23}) = ${tex(grams, 3)}$ g of uranium-235. Over a 3,000-year voyage that would be $${tex((grams * 3000) / 1000, 3)}$ kg, if anything could run that long. A whole fission gives about 200 MeV once the fragments’ later beta decays are counted (some of it carried off by antineutrinos), so a real reactor burns somewhat less than this. Compare chemistry: burning a carbon atom releases about 4 eV, some fifty million times less.`,
              visual: bindingPic(C),
            };
          },
        }),
        num({
          id: 'r1-clock', skill: 'phys3710.N2.1', difficulty: 4,
          gen(r) {
            const C = clockCase(r);
            const { k, Req, R, key, l2 } = C;
            const errs = [
              { value: R / l2, feedback: t`$A_2/A_1 \approx \lambda_2t$ only while the ratio is small. Here it is not: use the full Bateman result, which levels off at $\lambda_2/(\lambda_2 - \lambda_1)$.` },
              { value: -Math.log(1 - R / Req) / l2, feedback: t`The ratio grows as $1 - e^{-(\lambda_2 - \lambda_1)t}$, not $1 - e^{-\lambda_2t}$: the parent is decaying too, so the daughter catches up at the *difference* of the two decay constants.` },
            ];
            if (R < 1) errs.push({ value: -Math.log(1 - R) / l2, feedback: t`$A_2/A_1 = 1 - e^{-\lambda_2t}$ is secular equilibrium’s ingrowth, for a parent that barely decays. Zirconium-95 lives less than twice as long as niobium-95, so the ratio heads for $T_1/(T_1 - T_2) = ${tex(Req, 4)}$, not 1.` });
            return {
              prompt: t`To prove its reactor, Gannet’s team ran it at full power for one day and then shut it down. Fission makes zirconium-95 ($T_{1/2} = 64.03\ \text{d}$), which beta-decays to niobium-95 ($T_{1/2} = 34.99\ \text{d}$); almost no niobium-95 is made directly, so at shutdown its activity was close to zero. On launch day a gamma-ray spectrometer on the reactor reads the activity ratio $A_{\text{Nb}}/A_{\text{Zr}} = ${R}$. Treating the one-day run as an instant, how many days before launch was the reactor shut down?`,
              answer: key, units: 'd', tol: { rel: 0.01 },
              errors: apart(errs, key),
              hints: [
                t`Starting from a pure parent, Bateman’s solution gives $\dfrac{A_2}{A_1} = \dfrac{\lambda_2}{\lambda_2 - \lambda_1}\left(1 - e^{-(\lambda_2 - \lambda_1)t}\right)$, with $\lambda = \ln 2/T_{1/2}$.`,
                t`Here $\dfrac{\lambda_2}{\lambda_2 - \lambda_1} = \dfrac{T_1}{T_1 - T_2} = ${tex(Req, 4)}$ and $\lambda_2 - \lambda_1 = ${tex(k, 4)}\ \text{d}^{-1}$.`,
                t`Solve for $t$: $t = -\dfrac{1}{\lambda_2 - \lambda_1}\ln\left(1 - \dfrac{A_2/A_1}{${tex(Req, 4)}}\right)$.`,
              ],
              teach: 'A daughter’s activity climbs toward a fixed multiple of its parent’s at a known pace, so their ratio is a clock that started when the parent was made.',
              explain: t`With $\lambda_1 = \ln2/64.03$ and $\lambda_2 = \ln2/34.99$ per day, $\lambda_2 - \lambda_1 = ${tex(k, 4)}\ \text{d}^{-1}$ and the ratio heads for $T_1/(T_1 - T_2) = ${tex(Req, 4)}$: in transient equilibrium the niobium is more than twice as active as the zirconium feeding it. Then $$t = -\frac{1}{${tex(k, 4)}}\ln\left(1 - \frac{${R}}{${tex(Req, 4)}}\right) = ${tex(key, 3)}\ \text{days}.$$ Radiochemists date fresh fission debris — fallout from a weapons test or a reactor accident — with parent–daughter clocks like this one. The one-day run makes the real starting ratio a little above zero, which this model ignores; so does the small amount of niobium-95 made directly.`,
              visual: clockPic(),
            };
          },
        }),
        num({
          id: 'r1-fuel', skill: 'phys3710.N3.1', difficulty: 3,
          gen(r) {
            const C = fuelCase(r);
            const { F, m, Q, Mc2, beta, v, mAlpha } = C;
            const names = [...new Set([...F.react, ...F.prod])];
            const list = names.map((n) => t`$${tn(n)}$ $${sig(AME[n][1], 10)}\ \text{u}$`).join(', ');
            return {
              prompt: t`Gannet’s first stage would burn ${F.name}: $$${F.eq}.$$ Atomic masses (AME2020): ${list}. Suppose all the energy released went into the products’ kinetic energy, and every product flew straight out of the back at one common speed — the fuel’s ideal exhaust speed. What is that speed, in km/s? ($1\ \text{u} = 931.494$ MeV/$c^2$, $c = 2.998\times10^{5}$ km/s; it is slow enough for $K = \tfrac12 Mv^2$, with $M$ the products’ mass.)`,
              answer: v, units: 'km/s', tol: { rel: 0.01 },
              errors: apart([
                { value: v / Math.SQRT2, feedback: t`Kinetic energy is $\tfrac12Mv^2$, so $v = c\sqrt{2Q/Mc^2}$ — the factor of 2 belongs under the root.` },
                { value: (Q / Mc2) * C_KMS, feedback: t`$Q/Mc^2$ is the fraction of the mass turned into energy, not the speed. Set it equal to $\tfrac12(v/c)^2$ and solve for $v$.` },
                { value: Math.sqrt((2 * Q) / mAlpha) * C_KMS, feedback: t`That puts all the energy into a single alpha particle. The exhaust is every product together, with mass $M = ${tex(Mc2, 5)}$ MeV$/c^2$.` },
              ], v),
              hints: [
                t`The energy released is the mass lost: $Q = (\text{mass before} - \text{mass after})\times931.494$ MeV per u. Atomic masses work because the electrons balance on both sides.`,
                t`Set $\tfrac12Mv^2 = Q$ with $Mc^2$ the products’ rest energy: $v/c = \sqrt{2Q/Mc^2}$.`,
                t`Here $Q = ${tex(Q, 4)}$ MeV and $Mc^2 = ${tex(Mc2, 5)}$ MeV.`,
              ],
              teach: 'A fuel’s Q-value per unit mass caps its exhaust speed: ½v² can be no more than Q/M.',
              explain: t`The mass lost is $${tex(Q / UMEV, 4)}$ u, so $Q = ${tex(Q, 4)}$ MeV — a fraction $Q/Mc^2 = ${tex(Q / Mc2, 3)}$ of the products’ rest energy, $${tex(Mc2, 5)}$ MeV. Then $$\frac{v}{c} = \sqrt{\frac{2Q}{Mc^2}} = ${tex(beta, 4)},\qquad v = ${tex(v, 4)}\ \text{km/s}.$$ The best chemical rockets manage about 4.5 km/s. ${F.note} A real engine would also lose energy as X-rays and could never point every product backwards, so its exhaust would be slower than this ideal.`,
              visual: fuelPic(F),
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Two engines on paper',
      story: t`Gannet’s fusion stage would push gently for years; then the antimatter stage takes over. Antiprotons from a magnetic trap meet hydrogen and annihilate into pions, and a magnetic nozzle has to steer the charged ones out of the back before they decay. Both engines exist only as design studies: no one has burned these fusion fuels for net energy, and all the antimatter ever made adds up to far less than a millionth of a gram.`,
      items: [
        num({
          id: 'r2-stages', skill: 'phys3710.R0.2', difficulty: 3,
          gen(r) {
            const C = stagesCase(r);
            const { u1, R1, u2, R2, p1, p2, phi, beta } = C;
            return {
              prompt: t`Gannet burns its fusion stage first: effective exhaust speed $u_1 = ${u1}c$, during which the whole ship’s mass falls by a factor $m_0/m_1 = ${R1}$. Then the antimatter stage fires: effective exhaust speed $u_2 = ${u2}c$, mass ratio ${R2}. For each burn the relativistic rocket equation gives the change of rapidity, $$\Delta\varphi = \frac{u}{c}\ln\frac{m_0}{m_1},$$ exact for a steady exhaust speed measured in the ship’s momentary rest frame. Starting from rest in the Sun’s frame, and burning along one straight line, what is Gannet’s final speed, as a fraction of $c$?`,
              answer: beta, tol: { rel: 0.004 },
              errors: apart([
                { value: phi, feedback: t`$\varphi_1 + \varphi_2 = ${tex(phi, 4)}$ is the total *rapidity*. Speed is $\beta = \tanh\varphi$; they agree only while $\varphi \ll 1$.` },
                { value: Math.tanh(p1) + Math.tanh(p2), feedback: t`Speeds do not add in relativity — the second stage starts from a moving frame. Add the rapidities, then take $\tanh$ once.` },
                { value: Math.tanh(u1 * Math.log10(R1) + u2 * Math.log10(R2)), feedback: t`The rocket equation uses the natural logarithm, $\ln$, not $\log_{10}$.` },
              ], beta),
              hints: [
                t`Rapidities of boosts along one line add: $\varphi = \varphi_1 + \varphi_2$.`,
                t`$\varphi_1 = ${u1}\ln ${R1} = ${tex(p1, 4)}$ and $\varphi_2 = ${u2}\ln ${R2} = ${tex(p2, 4)}$.`,
                t`The speed is $\beta = \tanh\varphi$.`,
              ],
              teach: 'Collinear boosts add their rapidities, so a staged rocket’s rapidity is the sum of each stage’s (u/c) ln(m₀/m₁), and its speed is tanh of that.',
              explain: t`Each burn adds rapidity: $\varphi_1 = ${u1}\ln ${R1} = ${tex(p1, 4)}$ and $\varphi_2 = ${u2}\ln ${R2} = ${tex(p2, 4)}$, so $\varphi = ${tex(phi, 4)}$ and $$\beta = \tanh(${tex(phi, 4)}) = ${tex(beta, 4)}.$$ The same answer comes from adding the two stages’ speeds by Einstein’s rule, $(\beta_1 + \beta_2)/(1 + \beta_1\beta_2)$; rapidity just makes it a sum. The fusion stage contributes little: its exhaust is slow, so even a big mass ratio buys only $${tex(p1, 3)}$ of rapidity. To stop at Gaia BH1, Gannet must shed the whole $${tex(phi, 3)}$ again, which squares the mass ratio of the trip. Exhaust speeds of 0.3–0.7c come from design studies of “beamed-core” antimatter rockets, in which charged pions are steered out by a magnetic nozzle.`,
              visual: rapidityPic(),
            };
          },
        }),
        mcq({
          id: 'r2-annihilate', skill: 'phys3710.P1.2', difficulty: 3,
          gen(r) {
            const { ok, bad } = conserveCase(r);
            return {
              prompt: t`In Gannet’s reaction chamber, antiprotons released from a magnetic trap meet hydrogen and annihilate, and the products decay on their way out. The chamber’s event logger flags as a detector fault any record that breaks a conservation law. Exactly one of these records could be real. Which one?`,
              choices: [ok.tex, ...bad.map((b) => b.tex)],
              answer: 0,
              why: { 1: bad[0].why, 2: bad[1].why, 3: bad[2].why },
              hints: [
                t`Check charge, baryon number ($p$: $+1$, $\bar p$ and $\bar n$: $-1$, $n$: $+1$, mesons $0$) and each lepton family number ($\mu^-$, $\nu_\mu$: $L_\mu = +1$; $\mu^+$, $\bar\nu_\mu$: $-1$; likewise for $e$) on both sides.`,
                t`Then energy and momentum: a pair annihilating at rest has zero total momentum, which one photon cannot have.`,
                'Three records each fail exactly one test. The survivor is the one that conserves charge, baryon number, each lepton number, energy and momentum.',
              ],
              teach: 'Charge, baryon number and each lepton family number are conserved in every process ever observed; energy and momentum forbid the rest.',
              explain: t`${ok.tex} is allowed. ${ok.why}

The other three each break one law:

${bad.map((b) => `- ${b.tex}: ${b.why}`).join('\n')}`,
              visual: chamberPic(),
            };
          },
        }),
        num({
          id: 'r2-pions', skill: 'phys3710.R3.1', difficulty: 4,
          gen(r) {
            const C = pionsCase(r);
            const { mode, E, g, bg, ct, ell, key } = C;
            const gK = 1 + E / MPI, ellK = Math.sqrt(gK * gK - 1) * ct;
            const lens = [
              { l: ellK, fb: t`The share is the pion’s *total* energy, $E = \gamma mc^2$, so $\gamma = E/mc^2$. Treating it as kinetic energy adds an extra $mc^2$.` },
              { l: g * ct, fb: t`$\gamma c\tau$ is the decay length only for a pion moving at $c$. The pion covers $\beta c$ per second of lab time, so the mean decay length is $\beta\gamma c\tau$, with $\beta\gamma = p/mc$.` },
              { l: (bg / g) * ct, fb: t`$\beta c\tau$ leaves out time dilation. In Gannet’s frame the pion lives $\gamma\tau$ on average, so it flies $\beta\gamma c\tau$.` },
              { l: ct, fb: t`$c\tau = ${tex(ct, 4)}$ m is how far a pion would go in one lifetime at $c$ if its clock were not dilated. Use $\beta\gamma c\tau$.` },
            ];
            const val = mode === 'frac' ? (l) => 100 * (1 - Math.exp(-C.L / l)) : (l) => -l * Math.log(1 - C.f / 100);
            const errs = lens.map((x) => ({ value: val(x.l), feedback: x.fb }));
            if (mode === 'frac') errs.push({ value: (100 * C.L) / ell, feedback: t`$L/\ell$ is only the first term of $1 - e^{-L/\ell}$: decays thin out the beam as it goes, so the fraction decayed grows more slowly than the length.` });
            else errs.push({ value: (ell * C.f) / 100, feedback: t`$L = f\ell$ assumes the decays are spread evenly. The survivors fall off as $e^{-L/\ell}$, so set $1 - e^{-L/\ell} = f$.` });
            const setup = t`An antiproton annihilating at rest with a proton turns $2m_pc^2 = 1876.5\ \text{MeV}$ into pions — on average five: three charged ($\pi^\pm$: $m_\pi c^2 = 139.57\ \text{MeV}$, mean life $\tau = 26.03\ \text{ns}$) and two neutral. As a model, give each of the five pions an equal share of that energy as its total energy $E$. The charged pions fly straight down Gannet’s magnetic nozzle and must leave it before they decay to muons.`;
            return {
              prompt: mode === 'frac'
                ? t`${setup} The nozzle is ${C.L} m long. What percentage of the charged pions decay inside it? ($c = 2.998\times10^{8}$ m/s)`
                : t`${setup} The designers want no more than ${C.f}% of the charged pions to decay inside the nozzle. What is the longest it can be, in metres? ($c = 2.998\times10^{8}$ m/s)`,
              answer: key, units: mode === 'frac' ? '%' : 'm', tol: { rel: 0.01 },
              errors: apart(errs, key),
              hints: [
                t`Each pion has $E = 1876.5/5$ MeV, so $\gamma = E/m_\pi c^2$ and $\beta\gamma = \sqrt{\gamma^2 - 1}$ (which is $p/m_\pi c$).`,
                t`The mean decay length in the nozzle’s frame is $\ell = \beta\gamma c\tau$: the pion moves at $\beta c$ and its clock runs slow by $\gamma$.`,
                mode === 'frac' ? t`The fraction surviving a length $L$ is $e^{-L/\ell}$; the fraction decayed is $1 - e^{-L/\ell}$.` : t`Solve $1 - e^{-L/\ell} = ${C.f / 100}$: $L = -\ell\ln(1 - ${C.f / 100})$.`,
              ],
              teach: 'A particle’s four-momentum gives βγ = p/mc directly, and its mean decay length is βγcτ — speed and time dilation in one factor.',
              explain: t`Each pion has $E = 375.3$ MeV, so $\gamma = 375.3/139.57 = ${tex(g, 4)}$ and $\beta\gamma = \sqrt{\gamma^2 - 1} = ${tex(bg, 4)}$ (a kinetic energy of $${tex(E - MPI, 3)}$ MeV, close to the average measured for real annihilations). With $c\tau = ${tex(ct, 4)}$ m, the mean decay length is $$\ell = \beta\gamma c\tau = ${tex(ell, 4)}\ \text{m}.$$ ${mode === 'frac' ? t`In ${C.L} m the fraction decayed is $1 - e^{-${C.L}/${tex(ell, 4)}} = ${tex(key / 100, 3)}$, or $${tex(key, 3)}\%$.` : t`For at most ${C.f}% decayed, $L = -${tex(ell, 4)}\ln(1 - ${C.f / 100}) = ${tex(key, 3)}$ m.`} The decays are not a total loss: each charged pion becomes a muon going much the same way, which lives about 84 times longer, and the nozzle can still steer it. The equal-share model is a simplification; real pions share the energy unevenly, so some decay much sooner.`,
              visual: chamberPic(mode === 'frac' ? C.L : null),
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Cruise',
      story: t`The engines fall silent and Gannet coasts. In its own frame, interstellar hydrogen streams onto its forward shield as a particle beam, and every message from home arrives stretched by the Doppler shift of a ship receding at half the speed of light.`,
      items: [
        num({
          id: 'r3-shield', skill: 'phys3710.R3.2', difficulty: 4,
          gen(r) {
            const C = shieldCase(r);
            const { R, ask, M, K, g, beta, key } = C;
            const Kd = M - 2 * MP, gc = M / (2 * MP), Kc = MP * (gc - 1);
            const bOf = (k) => Math.sqrt(1 - 1 / (1 + k / MP) ** 2);
            const fbD = t`$${tex(Kd, 4)}$ MeV is just the rest energy the products add. In Gannet’s frame the total momentum is not zero, so the products cannot be made at rest: some energy must go into their motion. Use the invariant $s$.`;
            const fbC = t`$2\gamma m_pc^2 = \sum m c^2$ is the threshold for two protons meeting head-on with equal speeds. Here the shield proton is at rest, which wastes far more energy: $s = 2m_p^2c^4 + 2m_pc^2E$.`;
            const errs = ask === 'beta'
              ? [{ value: bOf(Kd), feedback: fbD }, { value: bOf(Kc), feedback: fbC }, { value: Math.sqrt((2 * K) / MP), feedback: t`The kinetic energy at threshold is right, but $K = \tfrac12mv^2$ is Newton’s. At these energies use $K = (\gamma - 1)m_pc^2$.` }]
              : [{ value: Kd, feedback: fbD }, { value: Kc, feedback: fbC }];
            const masses = t`$m_pc^2 = 938.27\ \text{MeV}$, $m_nc^2 = 939.57\ \text{MeV}$, $m_{\pi^\pm}c^2 = 139.57\ \text{MeV}$, $m_{\pi^0}c^2 = 134.98\ \text{MeV}$`;
            return {
              prompt: t`Interstellar hydrogen is nearly at rest in the Galaxy, so in Gannet’s frame it streams onto the forward shield at the ship’s own speed: a proton beam striking the protons in the shield’s hydrogen-rich plastic, which are at rest. The radiation team worries about collisions that make ${R.what}, $$${R.tex}.$$ ${ask === 'beta' ? 'Above what cruise speed can this happen? Give the speed as a fraction of $c$, and treat the shield’s protons as free and at rest.' : 'What is the least kinetic energy, in Gannet’s frame, an interstellar proton needs to make it happen, in MeV? Treat the shield’s protons as free and at rest.'} (${masses})`,
              answer: key, ...(ask === 'K' ? { units: 'MeV' } : {}), tol: { rel: ask === 'beta' ? 0.004 : 0.005 },
              errors: apart(errs, key),
              hints: [
                t`At threshold the products are made at rest in the centre-of-momentum frame, so the invariant $s = (\text{total }E)^2 - (\text{total }pc)^2$ equals $(\sum mc^2)^2$.`,
                t`For a beam proton of total energy $E$ on a proton at rest, $s = (E + m_pc^2)^2 - (pc)^2 = 2(m_pc^2)^2 + 2m_pc^2E$.`,
                ask === 'beta' ? t`So $K_{\text{th}} = \dfrac{(\sum mc^2)^2 - (2m_pc^2)^2}{2m_pc^2}$; then $\gamma = 1 + K/m_pc^2$ and $\beta = \sqrt{1 - 1/\gamma^2}$.` : t`So $K_{\text{th}} = E - m_pc^2 = \dfrac{(\sum mc^2)^2 - (2m_pc^2)^2}{2m_pc^2}$.`,
              ],
              teach: 'A threshold comes from the invariant mass: the collision must supply s = (Σm)² in its centre-of-momentum frame, and a target at rest makes that expensive.',
              explain: t`The products’ total rest energy is $\sum mc^2 = ${tex(M, 6)}$ MeV. With the target at rest, $s = 2m_p^2 + 2m_pE$ (with $c = 1$), so $$K_{\text{th}} = \frac{(${tex(M, 6)})^2 - (${tex(2 * MP, 5)})^2}{${tex(2 * MP, 5)}} = ${tex(K, 4)}\ \text{MeV},$$ ${ask === 'beta' ? t`which needs $\gamma = 1 + ${tex(K, 4)}/938.27 = ${tex(g, 5)}$, so $\beta = ${tex(beta, 4)}$.` : t`about $${tex(K / Kd, 3)}$ times the $${tex(Kd, 4)}$ MeV of new rest energy: the rest goes into moving the products along.`} Gannet’s cruise speed of about half the speed of light keeps it below this threshold, but not far below. Real shield protons sit inside carbon nuclei and jiggle about with their Fermi motion, which lets a few pions appear somewhat below the free-proton threshold. At any cruise speed the bigger hazard is interstellar dust: a grain of a microgram at $0.5c$ hits with the energy of a few kilograms of TNT.`,
              visual: { type: 'mp-collide', params: { scenario: 'pion', products: R.products, K: 40, controls: false, readout: false, hide: ['mass'] }, caption: t`An interstellar proton at $0.28c$ ($K = 40\ \text{MeV}$) on a shield proton at rest, in Gannet’s frame, on the energy–momentum diagram. The total (gold) must reach the red hyperbola, the products’ total mass, to make them; at this energy it falls short. Drawn to scale.` },
            };
          },
        }),
        num({
          id: 'r3-laser', skill: 'phys3710.R3.3', difficulty: 3,
          gen(r) {
            const C = laserCase(r);
            const { phi, lam, mode, D, beta, g, key } = C;
            const up = mode === 'up';
            return {
              prompt: up
                ? t`Coasting, Gannet moves straight away from the Sun with rapidity $\varphi = ${phi}$. Its laser receiver is built around detectors for ${lam}${NB}nm light. At what wavelength must mission control’s transmitter shine so that the light arrives at ${lam}${NB}nm in Gannet’s frame, in nm?`
                : t`Coasting, Gannet moves straight away from the Sun with rapidity $\varphi = ${phi}$. Its laser transmitter shines at ${lam}${NB}nm in its own frame. At what wavelength does mission control receive it, in nm?`,
              answer: key, units: 'nm', tol: { rel: 0.005 },
              errors: apart([
                { value: up ? lam * D : lam / D, feedback: up ? t`Light from home arrives *stretched* (redshifted) at a receding ship, so mission control must send a *shorter* wavelength: $\lambda_{\text{sent}} = \lambda_{\text{received}}\,e^{-\varphi}$.` : t`Light from a receding source arrives *stretched*: $\lambda_{\text{received}} = \lambda_{\text{sent}}\,e^{\varphi}$, longer than ${lam}${NB}nm.` },
                { value: up ? lam / g : lam * g, feedback: t`$\gamma = \cosh\varphi$ is only the time-dilation part, the transverse Doppler effect. Along the line of sight the growing distance stretches the waves too: the factor is $\gamma(1 + \beta) = e^{\varphi}$.` },
                { value: up ? lam / (1 + beta) : lam * (1 + beta), feedback: t`$1 + \beta$ is the classical Doppler factor, which leaves out time dilation. The relativistic factor is $\gamma(1 + \beta) = e^{\varphi}$.` },
                { value: up ? lam / (D * D) : lam * D * D, feedback: t`$e^{2\varphi}$ is the factor for a radar echo, which is shifted twice — going out and coming back. A one-way link is shifted once.` },
              ], key),
              hints: [
                t`Along the line of sight the Doppler factor is $\sqrt{\dfrac{1 + \beta}{1 - \beta}}$ for a receding source or receiver.`,
                t`In terms of rapidity, $\sqrt{\dfrac{1 + \beta}{1 - \beta}} = \gamma(1 + \beta) = \cosh\varphi + \sinh\varphi = e^{\varphi}$.`,
                up ? t`Receding stretches wavelengths on arrival: $\lambda_{\text{received}} = e^{\varphi}\lambda_{\text{sent}}$, so $\lambda_{\text{sent}} = e^{-\varphi}\times${lam}$ nm.` : t`Receding stretches wavelengths on arrival: $\lambda_{\text{received}} = e^{\varphi}\times${lam}$ nm.`,
              ],
              teach: t`Along the line of sight the Doppler factor is $e^{\varphi}$: rapidity turns the Doppler shift into an exponential, and successive shifts multiply as rapidities add.`,
              explain: t`The Doppler factor is $e^{\varphi} = e^{${phi}} = ${tex(D, 4)}$ (that is, $\beta = \tanh ${phi} = ${tex(beta, 4)}$ and $\sqrt{(1 + \beta)/(1 - \beta)} = ${tex(D, 4)}$). ${up ? t`Light sent from home is stretched by that factor on arrival, so mission control must send $$\lambda = ${lam}\,e^{-${phi}} = ${tex(key, 4)}\ \text{nm}.$$` : t`Gannet’s light is stretched by that factor on arrival: $$\lambda = ${lam}\,e^{${phi}} = ${tex(key, 4)}\ \text{nm}.$$`} The shift is set by the coasting speed alone; during the burns it grew as the rapidity grew, a factor $e^{\Delta\varphi}$ for each stage. The received power drops too — fewer photons per second, each with less energy — which matters as much as the colour for a link across light-years.`,
              visual: laserPic(mode),
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Two frames',
      story: t`Mission control logs events in the Sun’s frame; Gannet’s computers log the same events in the ship’s frame. They must agree on the interval between any two events — in this course’s convention $\Delta s^2 = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$ with $c = 1$, negative when one event could have caused the other — and they need not agree on the order of events that no signal could join.`,
      items: [
        num({
          id: 'r4-interval', skill: 'phys3710.R1.2', difficulty: 3,
          gen(r) {
            const C = intervalCase(r);
            const { tP, tQ, xP, yP, xQ, yQ, dt, dx, dy, s2 } = C;
            const sq = (v) => (v < 0 ? `(${v})^2` : `${v}^2`);
            const timelike = s2 < 0;
            return {
              prompt: t`Mission control logs two events in the Sun’s frame (years and light-years; both lie in the plane of the map, $z = 0$). $P$: Gannet’s antimatter stage shuts down, at $t = ${tP}$ yr, $(x, y) = (${xP}, ${yP})$ ly. $Q$: a flare erupts on a red dwarf, at $t = ${tQ}$ yr, $(x, y) = (${xQ}, ${yQ})$ ly. In this course’s convention, what is the interval $\Delta s^2$ between them, in ly²?`,
              answer: s2, units: 'ly^2', tol: { rel: 0, abs: 0.01 },
              errors: apart([
                { value: -s2, feedback: t`That is $\Delta t^2 - \Delta x^2 - \Delta y^2$, the $(+,-,-,-)$ convention. This course writes $\Delta s^2 = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$, negative for timelike pairs.` },
                { value: -dt * dt + dx * dx, feedback: t`Every direction of space counts: include $\Delta y^2 = ${dy * dy}$ ly².` },
                { value: dt * dt + dx * dx + dy * dy, feedback: t`Time enters the interval with the opposite sign to space: $-\Delta t^2$. Adding it gives a Euclidean distance in spacetime, which observers do not agree on.` },
                { value: -tQ * tQ + xQ * xQ + yQ * yQ, feedback: t`Use the *differences* between the two events’ coordinates, not $Q$’s coordinates alone.` },
              ], s2, 0.0001, 0.0001),
              hints: [
                t`With $c = 1$, $\Delta s^2 = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$.`,
                t`$\Delta t = ${dt}$ yr, $\Delta x = ${dx}$ ly, $\Delta y = ${dy}$ ly, $\Delta z = 0$.`,
                t`$\Delta s^2 = -${sq(dt)} + ${sq(dx)} + ${sq(dy)}$.`,
              ],
              teach: 'The interval −Δt² + Δx² + Δy² + Δz² is the same in every frame; its sign says whether one event could have caused the other.',
              explain: t`$\Delta s^2 = -${sq(dt)} + ${sq(dx)} + ${sq(dy)} = -${dt * dt} + ${dx * dx + dy * dy} = ${s2}$ ly². ${timelike ? t`It is **negative: timelike**. Light from $P$ covers the $${tex(Math.hypot(dx, dy), 3)}$ ly to $Q$’s place in less than the ${dt} years between them, so a signal could link them, and every observer agrees $P$ came first; the time between them is at least $\sqrt{${-s2}} = ${tex(Math.sqrt(-s2), 3)}$ years in any frame.` : t`It is **positive: spacelike**. The $${tex(Math.hypot(dx, dy), 3)}$ ly between their places is more than light covers in ${dt} years, so nothing Gannet does at $P$ can affect the flare, and observers moving fast enough disagree about which came first. In the frame where they are simultaneous they are $\sqrt{${s2}} = ${tex(Math.sqrt(s2), 3)}$ ly apart.`}`,
              visual: mapPic(C),
            };
          },
        }),
        order({
          id: 'r4-order', skill: 'phys3710.R2.2', difficulty: 3,
          gen(r) {
            const C = orderCase(r);
            const { beta, ev, byG, byS, g } = C;
            const item = (e) => t`$${e.name}$ at $(t, x) = (${e.t}, ${e.x})$`;
            const wv = (e) => e.t - beta * e.x;
            return {
              prompt: t`Gannet coasts along $+x$ at $\beta = ${beta}$ relative to the Sun. The diagram shows four events in the Sun’s frame ($c = 1$; years and light-years), with Gannet’s axes in gold. Put the events in the order Gannet’s clocks give them, earliest first.`,
              items: byG.map(item),
              hints: [
                t`Gannet’s time is $t' = \gamma(t - \beta x)$. Events on a line parallel to the gold $x'$ axis are simultaneous for Gannet.`,
                t`$\gamma$ is positive, so the order of $t'$ is the order of $t - ${beta}x$.`,
                t`Compute $t - ${beta}x$ for each event and sort. In the Sun’s frame the order is ${byS.map((e) => e.name).join(', ')}.`,
              ],
              teach: 'A moving observer’s “now” is a line tilted toward the light cone: t′ = γ(t − βx), so events farther along +x happen earlier for them.',
              explain: t`With $\gamma = ${tex(g, 4)}$, $t' = \gamma(t - ${beta}x)$ gives ${byG.map((e) => t`$t'_${e.name} = ${tex(g * wv(e), 3)}$`).join(', ')} years. So Gannet’s order is ${byG.map((e) => e.name).join(', ')}, while the Sun’s frame has ${byS.map((e) => e.name).join(', ')}. Only pairs separated by a spacelike interval can swap: Gannet’s lines of simultaneity tilt by the same angle as its time axis, toward the light cone, so events far along $+x$ slide earlier.`,
              visual: st({
                x: [-4.4, 5.4], t: [-0.8, 5.4], aspect: 'wide', boosted: { beta, ticks: 0, names: ['Gannet’s t′', 'Gannet’s x′'] }, cones: [[0, 0, 'future']],
                events: ev.map((e) => [e.x, e.t, e.name, 'accent2', 9, -9]),
                caption: t`The Sun’s frame ($c = 1$, years and light-years), its light cone from the origin dashed, and Gannet’s axes for $\beta = ${beta}$ in gold. Gannet’s lines of simultaneity are parallel to its gold $x'$ axis.`,
              }),
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Gaia BH1',
      story: t`More than three thousand years after launch, mission control — staffed by people its builders never met — watches Gannet close on Gaia BH1. A Sun-like star circles the black hole every 185.6 days, and a thought experiment the navigators have always liked asks what a clock would do held just above the horizon.`,
      items: [
        num({
          id: 'r5-period', skill: 'phys3710.R2.3', difficulty: 3,
          gen(r) {
            const C = periodCase(r);
            const { beta, g, key, seen } = C;
            return {
              prompt: t`Gannet coasts straight toward Gaia BH1 at $\beta = ${beta}$, before its braking burn. The companion star completes an orbit every 185.6 days in the black hole’s rest frame. In Gannet’s rest frame — measured by its own clocks and lines of simultaneity, with the light-travel time already allowed for — how many days does one orbit take?`,
              answer: key, units: 'd', tol: { rel: 0.005 },
              errors: apart([
                { value: T_ORBIT / g, feedback: t`Dividing by $\gamma$ shortens the period. But the orbit is a clock *moving* in Gannet’s frame, and moving clocks run slow there: the period is *longer*, $\gamma T_0$.` },
                { value: seen, feedback: t`That is what Gannet’s telescope *sees*: $T_0\sqrt{(1 - \beta)/(1 + \beta)}$, shortened because each orbit’s light has less distance to cover than the last. The question asks for the time in Gannet’s frame once light-travel time is allowed for: that is $\gamma T_0$.` },
                { value: T_ORBIT * Math.sqrt((1 + beta) / (1 - beta)), feedback: t`$\sqrt{(1 + \beta)/(1 - \beta)}$ is the Doppler factor for a *receding* source, and Doppler factors include light-travel time anyway. Allowing for that leaves pure time dilation, $\gamma T_0$.` },
                { value: T_ORBIT, feedback: t`185.6 days is the period in the black hole’s frame, where the orbit’s clock is at rest. In Gannet’s frame that clock moves, and runs slow.` },
              ], key),
              hints: [
                t`The orbiting star is a clock at rest in the black hole’s frame, ticking every $T_0 = 185.6$ days of proper time; in Gannet’s frame it moves at $\beta = ${beta}$.`,
                t`What Gannet *sees* (Doppler) mixes in the changing light-travel time; allowing for that leaves time dilation alone.`,
                t`Dilation: $T' = \gamma T_0$ with $\gamma = 1/\sqrt{1 - \beta^2}$.`,
              ],
              teach: 'Time dilation is what remains after the light-travel time is taken out; the Doppler shift is what a telescope sees, and the two differ.',
              explain: t`$\gamma = 1/\sqrt{1 - ${beta}^2} = ${tex(g, 4)}$, so in Gannet’s frame one orbit takes $$T' = \gamma T_0 = ${tex(g, 4)}\times185.6 = ${tex(key, 4)}\ \text{days}.$$ Gannet’s telescope, though, *sees* an orbit every $T_0\sqrt{(1 - \beta)/(1 + \beta)} = ${tex(seen, 4)}$ days, because Gannet is racing toward the light: each orbit’s light is emitted while the star is $${tex(beta * key, 3)}$ light-days nearer (in Gannet’s frame), and arrives that much sooner. Both statements are true; they answer different questions. As the picture shows, the light from each orbit reaches Gannet after a shorter wait than the last.`,
              visual: periodPic(beta),
            };
          },
        }),
        num({
          id: 'r5-clock', skill: 'gr.S23.i', difficulty: 3,
          gen(r) {
            const C = bhCase(r);
            const { f, rs, r: rr, h, acc } = C;
            const rsT = tex(rs, 4);
            return {
              prompt: t`A thought experiment: lower a beacon toward Gaia BH1 (mass $M = 9.62\,M_\odot$; the Schwarzschild radius $r_s = 2GM/c^2$ is 2.953 km per solar mass) and hold it static where its clock ticks at ${f} of the rate of a clock far away. How far above the horizon is it, measured in the Schwarzschild radial coordinate $r$ (circumference ÷ 2π) — that is, what is $r - r_s$, in km? Treat the black hole as not spinning.`,
              answer: h, units: 'km', tol: { rel: 0.01 },
              errors: apart([
                { value: rr, feedback: t`$${tex(rr, 4)}$ km is the radius $r$ itself, measured from the centre. The horizon is at $r_s = ${rsT}$ km; subtract it.` },
                { value: (rs * f) / (1 - f), feedback: t`The rate is the *square root*: $\sqrt{1 - r_s/r} = ${f}$, so $1 - r_s/r = ${tex(f * f, 3)}$, not ${f}.` },
                { value: h / 2, feedback: t`$r_s = 2GM/c^2$, which is 2.953 km per solar mass — not $GM/c^2$ (1.477 km per solar mass).` },
              ], h),
              hints: [
                t`A static clock at radius $r$ ticks at $d\tau/dt = \sqrt{1 - r_s/r}$ of the rate of a clock far away.`,
                t`$r_s = 9.62\times2.953 = ${rsT}$ km. Set $\sqrt{1 - r_s/r} = ${f}$: $r = r_s/(1 - ${f}^2)$.`,
                t`The horizon is at $r = r_s$, so the height is $r - r_s$.`,
              ],
              teach: 'A static clock at radius r runs at √(1 − rₛ/r) of a distant clock’s rate, so slowing it by a large factor means getting within a few rₛ of the horizon.',
              explain: t`$r_s = 9.62\times2.953 = ${rsT}$ km. From $\sqrt{1 - r_s/r} = ${f}$, $$r = \frac{r_s}{1 - ${f}^2} = \frac{${rsT}}{${tex(1 - f * f, 3)}} = ${tex(rr, 4)}\ \text{km},$$ so the beacon hangs $r - r_s = ${tex(h, 3)}$ km above the horizon in $r$. A tape measure let down from it would read more than that, because space near the horizon is stretched radially. Holding it there is the impossible part: the beacon would need a proper acceleration of about $${tex(acc, 2)}\,g$. ${rr < 1.5 * rs ? t`It is even inside the photon sphere, $1.5\,r_s$, where not even light can circle.` : rr < 3 * rs ? t`It is inside $3\,r_s$, the innermost stable circular orbit, so no probe could simply orbit there either.` : t`A real probe would orbit instead, and an orbiting clock runs slower still, because its motion adds time dilation.`} Gravitational time dilation itself is measured every day, by GPS satellites and atomic clocks a few centimetres apart in height.`,
              visual: bhPic(),
            };
          },
        }),
      ],
    },
  ],
});
