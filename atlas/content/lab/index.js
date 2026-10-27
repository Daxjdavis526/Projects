import { mod } from '../_util.js';

export default {
  id: 'lab', track: 'experimental', code: 'PHYS 3870 / 3880', title: 'Intermediate and Advanced Laboratory',
  provenance: 'usu-reconstructed', evidence: 'B', credits: 6,
  catalog: 'PHYS 3870: intermediate laboratory (requires CS 1400 and PHYS 2710); PHYS 3880: advanced laboratory, “student-designed projects”. Both communications-intensive.',
  source: { label: 'USU PHYS 3870 syllabus (Dennison, 2015)', url: 'https://www.physics.usu.edu/dennison/3870-3880/Syllabus%203870%20Fall%202015.pdf' },
  note: 'Both are program “touchstone” courses. A browser can teach uncertainty, analysis and experimental design honestly; it cannot replace bench work, and every simulated experiment here says so.',
  summary: 'The uncertainty spine — measurement, error propagation, least squares, residuals, noise and lock-in detection — and simulated classic experiments with realistic noise, analysed and written up like the real thing.',
  prereqs: ['phys2710', 'prog'],
  boss: { title: 'The Blind Analysis', blurb: 'Fit noisy data from an unknown experiment, propagate the errors, and defend your result.' },
  modules: [
    mod('A0', 'The lab notebook', ['What to record and why']),
    mod('A1', 'Measurement', ['Precision, accuracy and resolution', 'Type A and Type B uncertainty (the GUM)']),
    mod('A2', 'Statistics of repeated measurements', ['Mean, standard deviation and standard error', 'The normal distribution', 'Counting statistics: the Poisson distribution']),
    mod('A3', 'Propagation of uncertainty', ['Sums, products and powers', 'The general formula with partial derivatives', 'Monte Carlo error propagation']),
    mod('A4', 'Comparing results', ['Agreement within uncertainty', 'Hypothesis tests and p-values', 'Weighted means']),
    mod('A5', 'Least-squares fitting', ['Fitting a straight line', 'Weighted least squares', 'Nonlinear fits']),
    mod('A6', 'Goodness of fit', ['χ² and reduced χ²', 'Residual analysis', 'Covariance and correlated errors']),
    mod('A7', 'Calibration', ['Calibration curves and systematic error']),
    mod('A8', 'Noise and signal recovery', ['Noise sources and signal-to-noise', 'Averaging and filtering', 'Lock-in detection']),
    mod('A9', 'Data acquisition', ['Sampling, Nyquist and aliasing', 'ADC resolution and quantization']),
    mod('A10', 'Experimental design', ['Choosing what to vary', 'Linearization and dimensionless groups']),
    mod('A11', 'Scientific communication', ['Figures that tell the truth', 'Writing a lab report and abstract']),
    mod('A12', 'Software traps in data analysis', ['curve_fit, absolute_sigma and other defaults']),
    mod('A13', 'Reproducibility', ['Recording analysis so it can be rerun']),
    mod('E', 'Simulated experiments', ['The charge-to-mass ratio of the electron (e/m)', 'Millikan’s oil drop', 'The photoelectric effect and Planck’s constant', 'Franck–Hertz', 'Michelson interferometry', 'Fabry–Pérot interferometry', 'The Cavendish torsion balance', 'Coupled pendulums', 'The speed of light', 'Blackbody radiation', 'The Zeeman effect', 'Compton scattering', 'Gamma-ray spectroscopy', 'Pulsed NMR', 'The muon lifetime', 'The Hall effect', 'Superconductivity and the critical temperature', 'The chaotic pendulum', 'Single-slit and double-slit diffraction', 'Fibre optics', 'Radioactive decay counting', 'Thermal noise (Johnson noise)', 'Electron diffraction', 'Hydrogen spectrum and the Rydberg constant', 'Speed of sound', 'Rotational inertia and torsion'], { prereqs: ['lab.A6'] }),
  ],
};
