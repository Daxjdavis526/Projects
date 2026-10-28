// Shared picture builders for the PDE course (st-b).

// A still frame of the pde-player: no controls, no animation, no readout unless asked.
export const player = (params, caption, extra = {}) => ({
  type: 'pde-player',
  params: { controls: false, play: false, readout: false, ...params },
  caption, ...extra,
});

// A static graph of the x–t plane (x across, t up).
export const xtPlane = (params, caption) => ({
  type: 'graph',
  params: { aspect: 'wide', xlabel: 'x', ylabel: 't', axesAt: 'edge', ...params },
  caption,
});

// Thermal diffusivities α = k/(ρ c_p) at 300 K, from Incropera et al., Table A.1 (m²/s).
export const MATERIALS = [
  { name: 'aluminium alloy 2024-T6', short: 'aluminium', alpha: 73.0e-6 },
  { name: 'stainless steel 304', short: 'stainless steel', alpha: 3.95e-6 },
  { name: 'pure copper', short: 'copper', alpha: 117e-6 },
  { name: 'titanium', short: 'titanium', alpha: 9.32e-6 },
];
// LI-900 Shuttle tile silica: ρ = 144 kg/m³, k = 0.0476 W/(m K) through the thickness, c = 628 J/(kg K)
// at standard conditions (NASA TPSX): α ≈ 5.26×10⁻⁷ m²/s. Its conductivity rises severalfold when hot.
export const LI900 = { rho: 144, k: 0.0476, c: 628, alpha: 0.0476 / (144 * 628) };

export const SRC = {
  strauss: { label: 'W. A. Strauss, Partial Differential Equations: An Introduction, 2nd ed. (Wiley, 2008)', url: 'https://openlibrary.org/isbn/9780470054567' },
  evans: { label: 'L. C. Evans, Partial Differential Equations, 2nd ed. (AMS GSM 19, 2010), ch. 2', url: 'https://doi.org/10.1090/gsm/019' },
  incropera: { label: 'Incropera, DeWitt, Bergman & Lavine, Fundamentals of Heat and Mass Transfer, Table A.1', url: 'https://openlibrary.org/search?q=fundamentals+of+heat+and+mass+transfer+incropera' },
  tpsx: { label: 'NASA Ames TPSX materials database: LI-900 rigid tile', url: 'https://tpsx.arc.nasa.gov/Material?id=1' },
};
