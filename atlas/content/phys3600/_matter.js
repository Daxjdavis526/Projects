// Shared helpers for PHYS 3600 modules M7 and M8 (magnetic matter and the
// static Maxwell equations): material numbers with their sources, the
// demagnetizing factors (re-exported from the em3h models, which test them),
// and builders for static pictures on em3h-magnet and em3h-loop. Files whose
// names start with "_" are helpers, not lessons.

export { centreN } from '../../src/viz/model/em3h-magnet.js';
export { spheroidN, MATERIALS, B as loopB } from '../../src/viz/model/em3h-loop.js';

/**
 * Volume susceptibilities χ_m (SI, dimensionless) at room temperature and 1 atm
 * unless noted: Griffiths, Introduction to Electrodynamics (4th ed.), Table 6.1,
 * from the CRC Handbook. Approximate: published values differ in the second figure.
 */
export const CHI = {
  water: { name: 'water', chi: -9.0e-6 },
  copper: { name: 'copper', chi: -9.7e-6 },
  aluminium: { name: 'aluminium', chi: 2.2e-5 },
  lox: { name: 'liquid oxygen (at −200 °C)', chi: 3.9e-3 },
};

/** Saturation polarization μ₀M_s of iron at room temperature, T (Coey 2010). */
export const JS_IRON = 2.15;

/** A static em3h-magnet picture: no controls, readouts or probe, unless overridden. */
export const magPic = (params, caption) => ({ type: 'em3h-magnet', params: { controls: false, readout: false, probe: false, inset: false, ...params }, caption });

/** A static em3h-loop picture: no controls or readouts, unless overridden. */
export const loopPic = (params, caption) => ({ type: 'em3h-loop', params: { controls: false, readout: false, cycle: false, ...params }, caption });
