// Every number the film puts on screen, with the source the guide cites for
// it ("General Relativity: A Beginner's Guide", reports/ in this repository).
// Pure. The tests recompute each one they can from src/physics.js, so a
// caption and the physics that animates it cannot quietly disagree.

export const FACTS = {
  // special relativity
  c: { value: 299792458, unit: 'm/s', source: 'NIST (exact by definition)' },
  gamma06: { value: 1.25, source: 'calculation, γ = 1/√(1 − v²/c²)' },
  gamma099: { value: 7.1, source: 'calculation' },
  muonLife: { value: 2.2, unit: 'μs', source: 'PDG 2025' },
  muonTrip: { value: 6.4, unit: 'μs', source: 'Frisch & Smith 1963 (1.9 km at 0.995c)' },
  muonSurviveNaive: { value: 0.05, source: 'calculation, e^(−6.4/2.2)' },
  muonDilation: { value: 8.8, err: 0.8, predicted: 8.4, predictedErr: 2, unit: '×', source: 'Frisch & Smith 1963' },
  muonDrop: { value: 1.9, unit: 'km', source: 'Mount Washington Observatory (summit 6,288 ft)' },
  twin: { distance: 4, beta: 0.8, home: 10, traveller: 6, source: 'calculation' },

  // gravity near Earth
  microscope: { value: 1e-15, source: 'Touboul et al. 2022 (MICROSCOPE)' },
  towerPerMetre: { value: 1.1e-16, source: 'Will 2014; calculation gh/c²' },
  nist2010: { value: 33, unit: 'cm', source: 'Chou et al. 2010' },
  jila2022: { value: 0.001, unit: 'm', source: 'Bothwell et al. 2022' },
  gpsGravity: { value: 45.8, unit: 'μs/day', source: 'Ashby 2003' },
  gpsVelocity: { value: -7.2, unit: 'μs/day', source: 'Ashby 2003' },
  gpsNet: { value: 38.6, unit: 'μs/day', source: 'Ashby 2003' },
  gpsClock: { value: 10.22999999543, unit: 'MHz', source: 'Ashby 2003' },
  gpsOrbitRadius: { value: 26561750, unit: 'm', source: 'Ashby 2003' },
  gpsErrorKm: { value: 11, unit: 'km/day', source: 'Ashby 2003 ("over 11 km")' },

  // curvature
  coupling: { value: 2.1e-43, unit: 'N⁻¹', source: 'calculation, 8πG/c⁴' },
  waterCurvatureAU: { value: 1.5, source: 'calculation, c/√(8πGρ)' },

  // black holes
  rsSunKm: { value: 2.95, source: 'calculation, 2GM/c²' },
  rsEarthMm: { value: 8.9, source: 'calculation' },
  maxNeutronStar: { value: [2.0, 2.3], unit: 'M☉', source: 'Rezzolla et al. 2018' },
  hover3: { value: 82, unit: '%', source: 'calculation, √(1 − r_s/r)' },
  hover11: { value: 30, unit: '%', source: 'calculation' },
  effSchwarzschild: { value: 5.7, unit: '%', source: 'Bambi & Nampalliwar 2020' },
  effKerr: { value: 42, unit: '%', source: 'Bambi & Nampalliwar 2020' },
  effFusion: { value: 0.7, unit: '%', source: 'Bambi & Nampalliwar 2020' },
  ehtM87: { value: 42, err: 3, unit: 'μas', source: 'EHT 2019' },
  ehtSgrA: { value: 51.8, err: 2.3, unit: 'μas', source: 'EHT 2022' },
  hawkingSolar: { value: 6e-8, unit: 'K', source: 'Hawking 1974; calculation' },

  // gravitational waves
  gw150914: { m1: 36, m2: 29, final: 62, radiated: 3, distanceGly: 1.3, f0: 35, f1: 250, duration: 0.2, source: 'LIGO & Virgo 2016' },
  armChange: { value: 4e-18, unit: 'm', source: 'LIGO science summary' },
  gw170817Delay: { value: 1.7, unit: 's', source: 'Abbott et al. 2017' },
  gwSpeed: { value: 1e-15, source: 'Abbott et al. 2017' },
  candidates: { value: 390, source: 'GWTC-5.0 (LVK 2026)' },
  lisaLaunch: { value: 2035, source: 'ESA 2024' },
  hulseTaylor: { value: 0.9983, err: 0.0016, source: 'Weisberg & Huang 2016' },

  // cosmology
  cmb: { value: 2.725, unit: 'K', source: 'Fixsen 2009' },
  age: { value: 13.787, err: 0.020, unit: 'Gyr', source: 'Planck 2018' },
  composition: { ordinary: 5, dark: 26, energy: 69, source: 'Planck 2018 (calculation from fitted densities)' },
  hubbleEarly: { value: 67, unit: 'km/s/Mpc', source: 'Cai & Wang 2026' },
  hubbleLocal: { value: 73, unit: 'km/s/Mpc', source: 'Cai & Wang 2026' },

  // tests
  mercury: { value: 42.98, unit: '″/century', source: 'Will 2014' },
  deflection: { value: 1.75, unit: '″', source: 'Will 2014' },
  cassini: { value: [2.1e-5, 2.3e-5], source: 'Will 2014' },
  gpbFrame: { value: -37.2, err: 7.2, predicted: -39.2, unit: 'mas/yr', source: 'Everitt et al. 2011' },

  weakField: { value: 100000, source: 'Will 2014 (confirmed to 1 part in 10⁵ or better)' },

  // frontiers
  planckLength: { value: 1.6e-35, unit: 'm', source: 'NIST' },
};
