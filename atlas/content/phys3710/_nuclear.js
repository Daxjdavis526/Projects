// Data and helpers for the PHYS 3710 lessons on nuclei and particles
// (modules N1–N3 and P1). Not a lesson: the leading underscore keeps it out
// of the registry.
//
// Atomic masses are AME2020 (Wang et al., Chinese Physics C 45, 030003,
// 2021), in u; the neutron and the constants are CODATA 2022; half-lives
// are NUBASE2020 (Kondev et al., Chinese Physics C 45, 030001, 2021);
// particle data are the Particle Data Group's (2024).

export { r6, seg, label } from '../phys2710/_diagrams.js';

export const U = 931.49410372;              // MeV per u (CODATA 2022)
export const M_N = 1.00866491606;           // u, the neutron (CODATA 2022)
export const MEC2 = 0.51099895069;          // MeV, the electron
export const MNC2 = 939.56542194;           // MeV, the neutron
export const MPC2 = 938.27208943;           // MeV, the proton
export const MAC2 = 3727.3794118;           // MeV, the alpha particle (CODATA 2022)
export const HBARC = 197.3269804;           // MeV fm
export const KE2 = 1.43996448;              // MeV fm, e²/4πε₀
export const ALPHA = 1 / 137.035999177;     // the fine-structure constant (CODATA 2022)
export const HBAR_EVS = 6.582119569e-16;    // eV s
export const KB_KEV = 8.617333262e-8;       // keV per K
export const NA = 6.02214076e23;            // per mol, exact
export const YEAR = 365.25 * 86400;         // s, Julian year
export const BARN = 1e-28;                  // m²

/** AME2020 atomic masses: name → [Z, mass in u]. */
export const AME = {
  'H-1': [1, 1.0078250319], 'H-2': [1, 2.01410177784], 'H-3': [1, 3.01604928132], 'He-3': [2, 3.01602932197], 'He-4': [2, 4.00260325413],
  'Li-6': [3, 6.0151228874], 'Li-7': [3, 7.016003434], 'Be-7': [4, 7.01692871], 'B-10': [5, 10.012936862], 'B-11': [5, 11.009305167],
  'C-11': [6, 11.0114326], 'C-12': [6, 12], 'C-13': [6, 13.00335483534], 'N-13': [7, 13.00573861], 'N-14': [7, 14.00307400425], 'N-15': [7, 15.0001088983],
  'O-15': [8, 15.0030656], 'O-16': [8, 15.9949146193], 'O-17': [8, 16.999131756], 'O-18': [8, 17.9991596121], 'F-17': [9, 17.00209524], 'F-18': [9, 18.0009373],
  'K-39': [19, 38.963706485], 'K-40': [19, 39.96399817], 'Ar-40': [18, 39.962383122], 'Ca-39': [20, 38.9707108], 'Ca-40': [20, 39.962590851],
  'Ca-41': [20, 40.96227791], 'Sc-41': [21, 40.96925116], 'Fe-56': [26, 55.93493554], 'Fe-57': [26, 56.93539195], 'Co-59': [27, 58.9331935],
  'Co-60': [27, 59.9338155], 'Ni-62': [28, 61.9283448], 'Ni-64': [28, 63.9279662], 'Cu-64': [29, 63.929764], 'Zn-64': [30, 63.9291418],
  'Kr-92': [36, 91.9261731], 'Sr-94': [38, 93.9153556], 'Mo-99': [42, 98.9077073], 'Tc-99': [43, 98.9062497], 'Xe-140': [54, 139.9216458],
  'Ba-141': [56, 140.914404], 'Au-197': [79, 196.9665701], 'Au-198': [79, 197.9682437], 'Pb-204': [82, 203.9730435], 'Pb-206': [82, 205.9744652],
  'Pb-207': [82, 206.9758968], 'Pb-208': [82, 207.976652], 'Pb-209': [82, 208.98109], 'Pb-210': [82, 209.9841884], 'Pb-212': [82, 211.9918959],
  'Pb-214': [82, 213.9998035], 'Po-208': [84, 207.981246], 'Po-210': [84, 209.9828737], 'Po-212': [84, 211.988868], 'Po-214': [84, 213.9952013],
  'Po-216': [84, 216.0019134], 'Po-218': [84, 218.0089712], 'Rn-218': [86, 218.0056011], 'Rn-220': [86, 220.0113924], 'Rn-222': [86, 222.017576],
  'Ra-222': [88, 222.015373], 'Ra-224': [88, 224.0202104], 'Ra-226': [88, 226.0254082], 'Th-228': [90, 228.0287397], 'Th-230': [90, 230.0331323],
  'Th-232': [90, 232.0380536], 'Th-234': [90, 234.0435998], 'U-234': [92, 234.0409503], 'U-235': [92, 235.0439281], 'U-236': [92, 236.0455661],
  'U-238': [92, 238.0507869], 'U-239': [92, 239.054292], 'Pu-239': [94, 239.0521616], 'Pu-240': [94, 240.0538117],
};
export const mass = (name) => (name === 'n' ? M_N : AME[name][1]);
export const Zof = (name) => (name === 'n' ? 0 : AME[name][0]);
export const Aof = (name) => (name === 'n' ? 1 : +name.split('-')[1]);
/** Mass excess (M − A u)c², MeV. */
export const excess = (name) => (mass(name) - Aof(name)) * U;
/** Binding energy (MeV) from the atomic mass: [Z M(¹H) + N mₙ − M]c². */
export const binding = (name) => (Zof(name) * AME['H-1'][1] + (Aof(name) - Zof(name)) * M_N - mass(name)) * U;
/** Q-value (MeV) when the atoms (or neutrons, 'n') in `before` become those in `after`. */
export const Q = (before, after) => (before.reduce((s, x) => s + mass(x), 0) - after.reduce((s, x) => s + mass(x), 0)) * U;
/** Neutron separation energy (MeV) of a nuclide: the energy to pull one neutron out. */
export const Sn = (name) => { const [el, A] = name.split('-'); return Q([`${el}-${A - 1}`, 'n'], [name]); };

/** 'U-235' → ²³⁵U for canvas labels, and → {}^{235}\text{U} in TeX. */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const uni = (name) => { const [el, A] = name.split('-'); return A.replace(/\d/g, (d) => SUP[d]) + el; };
export const tn = (name) => { const [el, A] = name.split('-'); return `{}^{${A}}\\text{${el}}`; };
