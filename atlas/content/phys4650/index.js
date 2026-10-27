import { mod } from '../_util.js';

export default {
  id: 'phys4650', track: 'physics', code: 'PHYS 4650 (= ECE 4650)', title: 'Optics I',
  provenance: 'usu-reconstructed', evidence: 'B', credits: 3,
  catalog: 'Mathematics of wave motion, electromagnetic theory of light, light propagation, geometrical optics, and superposition of waves.',
  source: { label: 'USU catalog 2025–26: ECE 4650', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342752' },
  note: 'USU has no PHYS 5650: Optics I is PHYS 4650, cross-listed as ECE 4650 and dual-listed as ECE 6650; Optics II is PHYS 4680. Its description follows Hecht chapters 2–7, so polarization, interference and diffraction (modules O6–O8) probably fall in USU’s Optics II — the Atlas teaches them here anyway.',
  summary: 'Light as an electromagnetic wave: propagation, reflection and refraction, imaging and lens systems, superposition — and beyond USU’s scope, polarization, interference, diffraction, coherence and lasers.',
  prereqs: ['phys2710', 'math2210'],
  boss: { title: 'Einstein Ring Observatory', blurb: 'Design an instrument, trace its rays, and explain a gravitational lens with Fermat’s principle.' },
  modules: [
    mod('O1', 'The mathematics of wave motion', ['Harmonic waves, phase and complex representation', 'Plane and spherical waves']),
    mod('O2', 'Electromagnetic theory of light', ['Light from Maxwell’s equations', 'Energy, irradiance and momentum of light', 'Photons and the quantum view']),
    mod('O3', 'The propagation of light', ['Scattering and the refractive index', 'Fermat’s principle', 'Reflection and refraction from the wave picture', 'Fresnel equations and total internal reflection']),
    mod('O4', 'Geometrical optics', ['Spherical surfaces and thin lenses', 'Thick lenses and lens systems', 'Mirrors', 'Prisms and fibres', 'Optical systems and aberrations']),
    mod('O5', 'Superposition of waves', ['Adding waves of the same frequency', 'Adding waves of different frequency: beats and group velocity', 'Fourier analysis of light']),
    mod('O6', 'Polarization', ['Polarized light and Malus’s law', 'Jones vectors and matrices', 'Birefringence and wave plates']),
    mod('O7', 'Interference', ['Two-beam interference', 'Michelson and Fabry–Pérot interferometers', 'Thin films']),
    mod('O8', 'Diffraction', ['Fraunhofer diffraction from slits and apertures', 'Gratings and resolving power', 'Fresnel diffraction']),
    mod('O9', 'Fourier optics (enrichment)', ['Lenses as Fourier transformers']),
    mod('O10', 'Coherence (enrichment)', ['Temporal and spatial coherence']),
    mod('O11', 'Lasers (enrichment)', ['Stimulated emission and laser cavities']),
  ],
};
