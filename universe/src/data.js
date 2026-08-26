/* ============================================================================
   data.js — embedded catalogs and object facts
   ----------------------------------------------------------------------------
   Real values wherever practical:
     • Planet orbital elements: JPL "approximate positions" J2000 mean elements
       with per-century rates (good to arcminutes over ±centuries — plenty).
     • Star positions: real RA/dec/distance (Hipparcos/Gaia rounded).
     • Local Group galaxies: real galactic coords + published distances.
     • Clusters/superclusters: real sky positions + mean distances (positions
       along the line of sight are as published; shapes are schematic).
   Everything approximate is labelled as such in the info text.
   ========================================================================== */
import { AU, KM, LY, MPC, KPC, radecToXYZ, galToXYZ } from './scale.js';

const DEG = Math.PI / 180;

// ------------------------------------------------------------------- time
export function daysSinceJ2000(date = new Date()) {
  return (date.getTime() - Date.parse('2000-01-01T12:00:00Z')) / 86400000;
}

// ---------------------------------------------------------------- planets
// [a AU, aDot, e, eDot, I°, IDot, L°, LDot, ϖ°, ϖDot, Ω°, ΩDot] per century
export const PLANETS = [
  { id:'mercury', name:'Mercury', radius:2.4397e6, tilt:0.03, day:58.65,
    el:[0.38709927,0.00000037, 0.20563593,0.00001906, 7.00497902,-0.00594749, 252.25032350,149472.67411175, 77.45779628,0.16047689, 48.33076593,-0.12534081],
    cls:'Rocky planet',
    blurb:'The smallest planet and the closest to the Sun. Airless and crater-scarred, it swings from 430 °C in sunlight to −180 °C in darkness — the largest temperature range of any planet.' },
  { id:'venus', name:'Venus', radius:6.0518e6, tilt:177.4, day:-243,
    el:[0.72333566,0.00000390, 0.00677672,-0.00004107, 3.39467605,-0.00078890, 181.97909950,58517.81538729, 131.60246718,0.00268329, 76.67984255,-0.27769418],
    cls:'Rocky planet',
    blurb:'Nearly Earth’s twin in size, wrapped in a crushing CO₂ atmosphere 90× our surface pressure. A runaway greenhouse keeps its surface at ~465 °C — hot enough to melt lead. It rotates backwards, slower than it orbits.' },
  { id:'earth', name:'Earth', radius:6.371e6, tilt:23.44, day:0.9973,
    el:[1.00000261,0.00000562, 0.01671123,-0.00004392, -0.00001531,-0.01294668, 100.46457166,35999.37244981, 102.93768193,0.32327364, 0,0],
    cls:'Rocky planet · home',
    blurb:'The only world known to harbor life. 71% of the surface is ocean; a thin nitrogen–oxygen atmosphere and a magnetic field shelter the biosphere. Everyone you have ever known lived here.' },
  { id:'mars', name:'Mars', radius:3.3895e6, tilt:25.19, day:1.026,
    el:[1.52371034,0.00001847, 0.09339410,0.00007882, 1.84969142,-0.00813131, -4.55343205,19140.30268499, -23.94362959,0.44441088, 49.55953891,-0.29257343],
    cls:'Rocky planet',
    blurb:'A cold desert world with the solar system’s tallest volcano (Olympus Mons, 22 km) and grandest canyon (Valles Marineris). Dry riverbeds and minerals show it was once warmer and wet.' },
  { id:'jupiter', name:'Jupiter', radius:6.9911e7, tilt:3.13, day:0.4135,
    el:[5.20288700,-0.00011607, 0.04838624,-0.00013253, 1.30439695,-0.00183714, 34.39644051,3034.74612775, 14.72847983,0.21252668, 100.47390909,0.20469106],
    cls:'Gas giant',
    blurb:'More massive than all other planets combined. A ball of hydrogen and helium with no solid surface; the Great Red Spot is a storm wider than Earth that has raged for centuries. 95 known moons.' },
  { id:'saturn', name:'Saturn', radius:5.8232e7, tilt:26.73, day:0.444,
    el:[9.53667594,-0.00125060, 0.05386179,-0.00050991, 2.48599187,0.00193609, 49.95424423,1222.49362201, 92.59887831,-0.41897216, 113.66242448,-0.28867794],
    cls:'Gas giant',
    blurb:'The ringed jewel. Its rings span 280,000 km yet average only ~10 m thick — orbiting ice from house-sized blocks down to dust. Less dense than water, with 146 known moons including haze-covered Titan.' },
  { id:'uranus', name:'Uranus', radius:2.5362e7, tilt:97.77, day:-0.718,
    el:[19.18916464,-0.00196176, 0.04725744,-0.00004397, 0.77263783,-0.00242939, 313.23810451,428.48202785, 170.95427630,0.40805281, 74.01692503,0.04240589],
    cls:'Ice giant',
    blurb:'An ice giant tipped on its side — its axis lies nearly in its orbital plane, so each pole gets 42 years of sunlight then 42 of darkness. Methane haze gives it a calm, pale teal face.' },
  { id:'neptune', name:'Neptune', radius:2.4622e7, tilt:28.32, day:0.671,
    el:[30.06992276,0.00026291, 0.00859048,0.00005105, 1.77004347,0.00035372, -55.12002969,218.45945325, 44.96476227,-0.32241464, 131.78422574,-0.00508664],
    cls:'Ice giant',
    blurb:'The outermost planet, a deep-blue ice giant with the fastest winds measured anywhere — up to 2,100 km/h. Found in 1846 by mathematics before telescopes: its gravity had been tugging Uranus off course.' },
  { id:'pluto', name:'Pluto', radius:1.1883e6, tilt:122.5, day:-6.387,
    el:[39.48211675,-0.00031596, 0.24882730,0.00005170, 17.14001206,0.00004818, 238.92903833,145.20780515, 224.06891629,-0.04062942, 110.30393684,-0.01183482],
    cls:'Dwarf planet',
    blurb:'King of the Kuiper Belt. A world of nitrogen-ice plains and water-ice mountains, with a vast heart-shaped glacier (Sputnik Planitia). Its orbit is so eccentric it sometimes comes closer to the Sun than Neptune.' },
];

/** Heliocentric position from JPL mean elements. T = Julian centuries from J2000.
    Returns render-frame [x,y,z] in meters. */
export function planetPos(p, T) {
  const e0 = p.el;
  const a = (e0[0] + e0[1]*T) * AU;
  const e = e0[2] + e0[3]*T;
  const I = (e0[4] + e0[5]*T) * DEG;
  const L = (e0[6] + e0[7]*T) * DEG;
  const w = (e0[8] + e0[9]*T) * DEG;    // longitude of perihelion ϖ
  const O = (e0[10] + e0[11]*T) * DEG;  // ascending node Ω
  const om = w - O;                      // argument of perihelion
  let M = (L - w) % (2*Math.PI);
  // Kepler: E - e sinE = M
  let E = M;
  for (let i = 0; i < 8; i++) E = E - (E - e*Math.sin(E) - M) / (1 - e*Math.cos(E));
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  const cw = Math.cos(om), sw = Math.sin(om);
  const x = (cw*cO - sw*sO*cI)*xp + (-sw*cO - cw*sO*cI)*yp;
  const y = (cw*sO + sw*cO*cI)*xp + (-sw*sO + cw*cO*cI)*yp;
  const z = (sw*sI)*xp + (cw*sI)*yp;
  return [x, z, -y];                     // math-ecliptic -> render frame
}

// Moon: simple inclined precessing ellipse around Earth (documented approx).
export const MOON = { id:'moon', name:'Moon', radius:1.7374e6,
  a:384400*KM, e:0.0549, i:5.145*DEG, period:27.321661,
  cls:'Natural satellite',
  blurb:'Earth’s constant companion, born ~4.5 billion years ago from the debris of a giant impact. Its gravity raises our tides and steadies Earth’s spin. Twelve people have walked on it — so far.' };

export function moonPos(T, earthXYZ) {
  const d = T * 36525;                          // days since J2000
  const M = ((134.963 + 13.064993 * d) % 360) * DEG;   // mean anomaly
  const O = ((125.045 - 0.052954 * d) % 360) * DEG;    // node (precesses 18.6 y)
  const w = ((318.15 + 0.164 * d) % 360) * DEG;        // arg of perigee (~8.85 y)
  let E = M;
  for (let i = 0; i < 6; i++) E = E - (E - MOON.e*Math.sin(E) - M) / (1 - MOON.e*Math.cos(E));
  const xp = MOON.a * (Math.cos(E) - MOON.e);
  const yp = MOON.a * Math.sqrt(1 - MOON.e*MOON.e) * Math.sin(E);
  const cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(MOON.i), sI = Math.sin(MOON.i);
  const cw = Math.cos(w), sw = Math.sin(w);
  const x = (cw*cO - sw*sO*cI)*xp + (-sw*cO - cw*sO*cI)*yp;
  const y = (cw*sO + sw*cO*cI)*xp + (-sw*sO + cw*cO*cI)*yp;
  const z = (sw*sI)*xp + (cw*sI)*yp;
  return [earthXYZ[0] + x, earthXYZ[1] + z, earthXYZ[2] - y];
}

export const SUN = { id:'sun', name:'Sun', radius:6.957e8, cls:'G2V main-sequence star',
  blurb:'Our star: a 4.6-billion-year-old fusion reactor converting 600 million tonnes of hydrogen to helium every second. It holds 99.86% of the solar system’s mass. Light from its surface reaches Earth in 8 min 20 s.' };

// ------------------------------------------------------------------ stars
// [name, RA°, dec°, dist ly, spectral class, note?]
export const STARS = [
  ['Proxima Centauri',217.42895,-62.67948,4.247,'M5.5V','The nearest star to the Sun. A dim red dwarf flare star — and host of Proxima b, an Earth-mass planet in its habitable zone.'],
  ['Alpha Centauri',219.90206,-60.83399,4.367,'G2V','The nearest star system: a tight pair of Sun-like stars (A and B) circled distantly by Proxima. To its planets, our Sun is a bright star in Cassiopeia.'],
  ["Barnard's Star",269.45207,4.66829,5.963,'M4V','The fastest-moving star in our sky, crossing a Moon-width every ~180 years. An ancient, quiet red dwarf.'],
  ['Wolf 359',164.12076,7.01461,7.86,'M6V'],
  ['Lalande 21185',165.83412,35.96988,8.31,'M2V'],
  ['Sirius',101.28716,-16.71612,8.66,'A1V','The brightest star in Earth’s night sky, orbited by Sirius B — the nearest white dwarf, a dead star the size of Earth with the mass of the Sun.'],
  ['Luyten 726-8',24.756,-17.950,8.79,'M5.5V'],
  ['Ross 154',282.45570,-23.83625,9.70,'M3.5V'],
  ['Ross 248',355.47900,44.17722,10.30,'M5.5V'],
  ['Epsilon Eridani',53.23269,-9.45826,10.47,'K2V','A young orange dwarf with a dusty debris disk and at least one gas-giant planet — long a favorite target in searches for life.'],
  ['Lacaille 9352',346.46662,-35.85310,10.72,'M0.5V'],
  ['Ross 128',176.93700,0.79930,11.01,'M4V'],
  ['EZ Aquarii',339.685,-15.290,11.27,'M5V'],
  ['61 Cygni',316.72479,38.74946,11.40,'K5V','In 1838 the first star ever to have its distance measured, by parallax — proving the stars are distant suns.'],
  ['Procyon',114.82550,5.22499,11.46,'F5IV','The eighth-brightest star in our sky, with its own white-dwarf companion.'],
  ['Struve 2398',280.694,59.622,11.49,'M3V'],
  ['Groombridge 34',4.595,44.023,11.62,'M1.5V'],
  ['DX Cancri',126.570,26.900,11.68,'M6.5V'],
  ['Epsilon Indi',330.840,-56.786,11.87,'K5V'],
  ['Tau Ceti',26.017,-15.937,11.91,'G8.5V','The nearest single Sun-like star, with a system of super-Earth candidates. A staple of science fiction for good reason.'],
  ['GJ 1061',53.999,-44.512,11.98,'M5.5V'],
  ['YZ Ceti',18.132,-16.998,12.11,'M4.5V'],
  ["Luyten's Star",111.856,5.226,12.35,'M3.5V'],
  ["Teegarden's Star",43.254,16.881,12.50,'M7V'],
  ["Kapteyn's Star",77.919,-45.018,12.76,'M1V','A halo star plunging through the galactic disk on a retrograde orbit — likely a captured remnant of a dwarf galaxy.'],
  ['Lacaille 8760',319.313,-38.867,12.95,'M0V'],
  ['Kruger 60',337.000,57.700,13.08,'M3V'],
  ['Ross 614',98.700,-2.800,13.35,'M4.5V'],
  ['Wolf 1061',247.575,-12.663,14.05,'M3.5V'],
  ["Van Maanen's Star",12.290,5.390,14.07,'DZ8','The nearest solitary white dwarf: the exposed core of a dead star, slowly cooling forever.'],
  ['Gliese 1',2.020,-37.350,14.17,'M1.5V'],
  ['Wolf 424',188.000,9.020,14.31,'M5.5V'],
  ['TZ Arietis',31.200,13.050,14.58,'M4.5V'],
  ['Gliese 687',264.270,68.340,14.84,'M3V'],
  ['Gliese 674',261.900,-46.900,14.84,'M2.5V'],
  ['GJ 1245',298.500,44.400,14.79,'M5.5V'],
  ['Gliese 876',343.320,-14.260,15.25,'M4V'],
  ['Gliese 832',323.390,-49.010,16.16,'M2V'],
  ['Altair',297.69582,8.86832,16.73,'A7V','A hot young star spinning so fast (once every 9 hours) that it bulges visibly at its equator.'],
  ['70 Ophiuchi',271.364,2.500,16.59,'K0V'],
  ['Sigma Draconis',293.090,69.661,18.77,'G9V'],
  ['36 Ophiuchi',258.800,-26.600,19.50,'K2V'],
  ['Vega',279.23473,38.78369,25.04,'A0V','The historic zero-point of the brightness scale, and Earth’s north star 12,000 years from now as our axis precesses.'],
  ['Fomalhaut',344.41269,-29.62224,25.13,'A3V','Ringed by a vast dusty debris disk — the "Eye of Sauron" in telescope images.'],
  ['Pollux',116.32896,28.02620,33.79,'K0III'],
  ['Arcturus',213.91530,19.18241,36.66,'K1.5III','The brightest star of the northern celestial hemisphere: an old red giant, gently swollen as it burns the last of its core hydrogen.'],
  ['Capella',79.17232,45.99799,42.92,'G3III'],
  ['Aldebaran',68.98016,16.50930,65.3,'K5III','The orange eye of Taurus the Bull — a red giant that our Pioneer 10 probe is drifting toward, arriving in ~2 million years.'],
  ['Regulus',152.09296,11.96721,79.3,'B8IV'],
  ['Achernar',24.42852,-57.23675,139,'B6V'],
  ['Spica',201.29824,-11.16132,250,'B1V'],
  ['Canopus',95.98796,-52.69566,310,'A9II','Second-brightest star in our sky; a yellow-white supergiant used by spacecraft as a navigation beacon.'],
  ['Polaris',37.95456,89.26411,433,'F7Ib','The North Star — parked almost exactly above Earth’s rotation axis, it is a pulsating Cepheid supergiant.'],
  ['Betelgeuse',88.79294,7.40706,548,'M1Ia','A red supergiant ~900× the Sun’s diameter; placed at the Sun it would swallow Jupiter’s orbit. Someday — tomorrow or in 100,000 years — it will explode as a supernova.'],
  ['Antares',247.35192,-26.43200,554,'M1.5Ib','The "rival of Mars": a red supergiant heart of the Scorpion, destined for a supernova.'],
  ['Rigel',78.63447,-8.20164,863,'B8Ia','A blue supergiant ~120,000× the Sun’s luminosity — the brilliant foot of Orion.'],
  ['Deneb',310.35798,45.28034,2615,'A2Ia','One of the most luminous stars visible to the naked eye — ~200,000 Suns, shining across 2,600 light-years.'],
];

export const SPECTRAL_COLORS = {
  O:0x9bb0ff, B:0xaabfff, A:0xcad7ff, F:0xf8f7ff, G:0xfff4ea, K:0xffd2a1, M:0xffb46b, D:0xe8e8ff,
};
export function starColor(spec) {
  return SPECTRAL_COLORS[spec[0]] ?? 0xffffff;
}
export function starXYZ(s) { return radecToXYZ(s[1], s[2], s[3] * LY); }

// ---------------------------------------------------------- Local Group
// [name, l°, b°, dist ly, type, diameter ly, note?]
export const LOCALGROUP = [
  ['Andromeda Galaxy (M31)',121.17,-21.57,2.537e6,'SA(s)b spiral',220e3,'The nearest large galaxy — a trillion stars, on course to merge with the Milky Way in ~4.5 billion years. Visible to the naked eye across 2.5 million light-years.'],
  ['Triangulum Galaxy (M33)',133.61,-31.33,2.73e6,'SA(s)cd spiral',60e3,'The third-largest member of the Local Group, a loose spiral rich in star-forming nebulae.'],
  ['Large Magellanic Cloud',280.47,-32.89,163e3,'SB(s)m',32e3,'The Milky Way’s largest satellite, home of the Tarantula Nebula — the most furious star factory in the Local Group.'],
  ['Small Magellanic Cloud',302.80,-44.30,200e3,'Irregular',18e3,'A disrupted dwarf trailing a bridge of gas toward the LMC.'],
  ['Sagittarius Dwarf',5.6,-14.2,70e3,'dSph',10e3,'Currently being torn apart and absorbed by the Milky Way — its stars wrap the sky in streams.'],
  ['Ursa Minor Dwarf',105.0,44.8,225e3,'dSph',6e3],
  ['Draco Dwarf',86.4,34.7,260e3,'dSph',7e3],
  ['Sculptor Dwarf',287.5,-83.2,290e3,'dSph',8e3],
  ['Sextans Dwarf',243.5,42.3,290e3,'dSph',8e3],
  ['Carina Dwarf',260.1,-22.2,330e3,'dSph',7e3],
  ['Fornax Dwarf',237.1,-65.7,460e3,'dSph',17e3],
  ['Leo II',220.2,67.2,690e3,'dSph',7e3],
  ['Leo I',226.0,49.1,820e3,'dSph',8e3],
  ['Phoenix Dwarf',272.2,-68.9,1.44e6,'dIrr/dSph',6e3],
  ['NGC 6822',25.3,-18.4,1.63e6,'Barred irregular',8e3,'Barnard’s Galaxy — one of the first objects proven (by Hubble, 1925) to lie beyond the Milky Way.'],
  ['IC 10',119.0,-3.3,2.2e6,'Starburst dIrr',5e3],
  ['NGC 185',120.8,-14.5,2.08e6,'dE',8e3],
  ['NGC 147',119.8,-14.3,2.53e6,'dE',10e3],
  ['IC 1613',129.7,-60.6,2.38e6,'dIrr',10e3],
  ['M32',121.15,-21.98,2.49e6,'Compact elliptical',8e3],
  ['M110',121.0,-21.1,2.69e6,'dE',15e3],
  ['WLM',75.9,-73.6,3.04e6,'dIrr',8e3],
  ['Pegasus Dwarf',94.8,-43.5,3.0e6,'dIrr',7e3],
  ['Aquarius Dwarf',34.0,-31.3,3.2e6,'dIrr',5e3],
  ['Tucana Dwarf',322.9,-47.4,3.2e6,'dSph',3e3],
  ['Leo A',196.9,52.4,2.6e6,'dIrr',4e3],
];
export function lgXYZ(g) { return galToXYZ(g[1], g[2], g[3] * LY); }

// ------------------------------------- groups, clusters, superclusters
// [name, RA°, dec°, dist Mpc, kind, radius Mpc, note?]
export const CLUSTERS = [
  ['Virgo Cluster',187.70,12.34,16.5,'Galaxy cluster',2.2,'The heart of our corner of the universe: ~1,500 galaxies whose gravity tugs on the entire Local Group. The giant elliptical M87 at its core hosts the first black hole ever photographed.'],
  ['Fornax Cluster',54.62,-35.45,19.0,'Galaxy cluster',1.8,'The second-nearest cluster — small, dense, and dominated by ellipticals.'],
  ['Ursa Major Groups',176.0,47.0,18.0,'Galaxy groups',2.5],
  ['Eridanus Group',50.0,-22.0,23.0,'Galaxy group',1.5],
  ['Antlia Cluster',157.5,-35.3,40.0,'Galaxy cluster',1.5],
  ['Centaurus Cluster',192.20,-41.31,52.4,'Galaxy cluster',3.0,'A rich cluster falling — like us — toward the Great Attractor.'],
  ['Hydra Cluster',159.17,-27.52,58.3,'Galaxy cluster',2.5],
  ['Norma Cluster',243.89,-60.91,67.8,'Galaxy cluster · Great Attractor',3.5,'The core of the Great Attractor: a vast mass concentration hidden behind the Milky Way’s dust, toward which the entire Laniakea flow converges at ~600 km/s.'],
  ['Perseus Cluster',49.95,41.51,73.6,'Galaxy cluster',3.5,'One of the most massive objects known, glowing in X-rays. Sound waves in its hot gas correspond to a B♭ 57 octaves below middle C.'],
  ['Perseus–Pisces Supercluster',22.0,33.0,70.0,'Supercluster · filament',20,'A great wall of galaxies stretching nearly 300 million light-years — one of the largest structures in our neighborhood.'],
  ['Coma Cluster',194.95,27.98,100.0,'Galaxy cluster',3.0,'Thousands of galaxies in a dense swarm. Fritz Zwicky’s 1933 study of its motions gave the first evidence for dark matter.'],
  ['Leo Supercluster',170.0,25.0,135.0,'Supercluster',15],
  ['Hercules Superclusters',241.0,17.0,150.0,'Superclusters',18],
  ['Ophiuchus Cluster',258.11,-23.37,83.0,'Galaxy cluster',2.5],
  ['Pavo–Indus Supercluster',315.0,-60.0,70.0,'Supercluster',15],
  ['Shapley Supercluster',202.0,-31.5,200.0,'Supercluster',25,'The most massive concentration of galaxies within a billion light-years — over 8,000 galaxies whose combined gravity bends the expansion of space around it.'],
  ['Boötes Void',218.0,26.0,215.0,'Cosmic void',50,'A sphere ~330 million light-years across containing almost nothing — one of the largest known empty regions. If the Milky Way sat at its center, we wouldn’t have known other galaxies existed until the 1960s.'],
  ['Sloan Great Wall',200.0,0.0,310.0,'Galaxy wall',80,'A wall of galaxies 1.37 billion light-years long — for years the largest known structure in the universe.'],
];
export function clusterXYZ(c) { return radecToXYZ(c[1], c[2], c[3] * MPC); }

// ----------------------------------------------------- named non-star stops
export const MILKYWAY = { name:'Milky Way', cls:'Barred spiral galaxy · SBbc',
  radius: 52.85e3 * LY,
  blurb:'Our galaxy: 100–400 billion stars in a disk ~105,000 light-years across, wrapped around a central bar. The Sun rides the Orion Arm, 26,700 light-years out, completing an orbit every ~230 million years. Everything you can see with the naked eye lives here.' };

export const SGRA = { name:'Sagittarius A*', cls:'Supermassive black hole',
  radius: 1.2e10,
  blurb:'The 4.3-million-solar-mass black hole at the Milky Way’s exact center, photographed by the Event Horizon Telescope in 2022. Stars near it whip around at up to 8% of light speed.' };

export const LOCALGROUP_INFO = { name:'Local Group', cls:'Galaxy group',
  radius: 5e6 * LY,
  blurb:'Our home group: two giant spirals (the Milky Way and Andromeda) approaching each other at 110 km/s, the smaller Triangulum, and ~80 dwarf galaxies, all bound in a volume ~10 million light-years across.' };

export const LANIAKEA = { name:'Laniakea Supercluster', cls:'Supercluster · velocity-flow basin',
  radius: 80 * MPC,
  blurb:'"Immeasurable heaven" — the basin of attraction containing 100,000 galaxies including ours, defined in 2014 by mapping which galaxies flow toward the same point: the Great Attractor. Its true boundary is a watershed of motion, not a wall. Shown here as an approximate envelope.' };

export const COSMIC_WEB_INFO = { name:'Cosmic Web', cls:'Large-scale structure',
  blurb:'At the grandest scales, gravity has drawn matter into a foam of filaments and walls surrounding vast voids. Galaxies stream along the filaments and pile up at the nodes where they cross. The pattern here is statistical — a faithful texture of the real universe beyond our mapped neighborhood.' };

export const OBSERVABLE = { name:'Observable Universe', cls:'Cosmological horizon',
  radius: 4.40e26,
  blurb:'Everything we can ever see: a sphere 93 billion light-years across, containing ~2 trillion galaxies, centered on us only because light has had 13.8 billion years to travel. The glowing edge is the cosmic microwave background — the flash of the Big Bang itself, stretched a thousandfold and arriving from every direction, forever.' };

export const HELIOPAUSE_INFO = { name:'Heliopause', cls:'Boundary of the heliosphere',
  radius: 120 * AU,
  blurb:'Where the Sun’s wind of charged particles finally stalls against the interstellar medium, ~120 AU out. Voyager 1 crossed it in 2012 — the first human object to touch interstellar space.' };

export const OORT_INFO = { name:'Oort Cloud', cls:'Comet reservoir (inferred)',
  radius: 1e5 * AU,
  blurb:'A spherical halo of trillions of icy bodies stretching perhaps a light-year from the Sun — the deep-freeze source of long-period comets. Never observed directly; its existence is inferred from comet orbits. Rendered here as a sparse statistical shell.' };

export const KUIPER_INFO = { name:'Kuiper Belt', cls:'Trans-Neptunian belt',
  radius: 50 * AU,
  blurb:'A donut of icy worlds beyond Neptune, 30–50 AU out — home of Pluto, Eris, and the ancient leftovers of planet formation.' };

export const ASTEROIDS_INFO = { name:'Asteroid Belt', cls:'Main belt',
  radius: 3.3 * AU,
  blurb:'Millions of rocky bodies between Mars and Jupiter — yet so sparse that spacecraft fly through without aiming. Total mass: ~4% of the Moon.' };

// ------------------------------------------------------- context ladder
// Nested "where am I" contexts by camera distance (m), innermost first.
export const CONTEXTS = [
  { name:'Earth',              upTo: 5e7 },
  { name:'Earth–Moon system',  upTo: 8e8 },
  { name:'Inner Solar System', upTo: 5e11 },
  { name:'Solar System',       upTo: 1.5e13 },
  { name:'Heliosphere',        upTo: 1.5e14 },
  { name:'Oort Cloud',         upTo: 2e16 },
  { name:'Solar Neighborhood', upTo: 3e17 },
  { name:'Orion Arm',          upTo: 3e19 },
  { name:'Milky Way',          upTo: 3e21 },
  { name:'Local Group',        upTo: 8e22 },
  { name:'Virgo Region',       upTo: 2e24 },
  { name:'Laniakea Scale',     upTo: 2e25 },
  { name:'Cosmic Web',         upTo: 3e26 },
  { name:'Observable Universe',upTo: Infinity },
];
