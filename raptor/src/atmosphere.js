// International Standard Atmosphere, layered wind, and turbulence.
import { SIM } from './config.js';

const R = 287.05287;   // J/(kg K), specific gas constant for dry air
const GAMMA = 1.4;
const G = SIM.g0;

// ISA layers: [base geopotential altitude m, base temperature K, lapse rate K/m]
const LAYERS = [
  [0,      288.15,  -0.0065],
  [11000,  216.65,   0.0    ],
  [20000,  216.65,   0.001  ],
  [32000,  228.65,   0.0028 ],
  [47000,  270.65,   0.0    ],
  [51000,  270.65,  -0.0028 ],
  [71000,  214.65,  -0.002  ],
];
const BASE_P = [101325];
for (let i = 1; i < LAYERS.length; i++) {
  const [h0, T0, L] = LAYERS[i - 1];
  const h1 = LAYERS[i][0];
  BASE_P.push(L === 0
    ? BASE_P[i - 1] * Math.exp(-G * (h1 - h0) / (R * T0))
    : BASE_P[i - 1] * Math.pow(1 + L * (h1 - h0) / T0, -G / (R * L)));
}

/** Standard atmosphere at geometric altitude h (m). Returns {T,p,rho,a}. */
export function isa(h) {
  // geometric -> geopotential
  const Re = SIM.earthRadius;
  let hg = Re * h / (Re + h);
  if (hg < -1000) hg = -1000;
  if (hg > 84852) hg = 84852;
  let i = 0;
  while (i < LAYERS.length - 1 && hg >= LAYERS[i + 1][0]) i++;
  const [h0, T0, L] = LAYERS[i];
  const dh = hg - h0;
  const T = T0 + L * dh;
  const p = L === 0
    ? BASE_P[i] * Math.exp(-G * dh / (R * T0))
    : BASE_P[i] * Math.pow(T / T0, -G / (R * L));
  const rho = p / (R * T);
  const a = Math.sqrt(GAMMA * R * T);
  return { T, p, rho, a };
}

export function density(h) { return isa(h).rho; }
export function speedOfSound(h) { return isa(h).a; }

/** Pressure altitude readout for a given geometric altitude and QNH (hPa). */
export function pressureAltitude(h, qnh = 1013.25) {
  const p = isa(h).p;
  return 44330.77 * (1 - Math.pow(p / (qnh * 100), 0.1902632));
}

/** Calibrated airspeed (m/s) from true airspeed and altitude. */
export function cas(tas, h) {
  const { rho } = isa(h);
  return tas * Math.sqrt(rho / 1.225);
}

// ---------------------------------------------------------------------------
// Wind field: a surface layer that shears into a high-altitude jet stream,
// plus band-limited turbulence. Deterministic, so the world is reproducible.
// ---------------------------------------------------------------------------

function hash2(x, y) {
  let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export class Wind {
  constructor() {
    this.surfaceDir = 250 * Math.PI / 180;  // meteorological "from" bearing
    this.surfaceSpeed = 6;                  // m/s
    this.jetDir = 270 * Math.PI / 180;
    this.jetSpeed = 42;                     // m/s at ~10 km
    this.turbulence = 0.25;                 // 0..1, driven by weather
    this.t = 0;
    this._out = { x: 0, y: 0, z: 0 };
  }

  update(dt) { this.t += dt; }

  /**
   * Wind velocity in world axes (x east, y up, z south) at a position.
   * Meteorological direction is "from", so the vector points the other way.
   */
  sample(x, y, z, out = this._out) {
    const h = Math.max(0, y);
    // shear: surface layer -> jet core near 10 km -> weakening above
    const surf = Math.min(1, Math.pow(h / 600, 0.25));
    const jet = Math.exp(-Math.pow((h - 10500) / 6500, 2));
    const dir = this.surfaceDir * (1 - jet) + this.jetDir * jet;
    const spd = this.surfaceSpeed * surf * (1 - 0.4 * jet) + this.jetSpeed * jet;

    let wx = -Math.sin(dir) * spd;
    let wz = -Math.cos(dir) * spd;
    let wy = 0;

    // turbulence: three octaves of drifting noise, stronger low down and in cloud
    const gust = this.turbulence * (2.2 + 7 * Math.exp(-h / 1800));
    if (gust > 0.02) {
      const s = 1 / 900, t = this.t * 0.35;
      for (let o = 0; o < 3; o++) {
        const f = s * (1 << o), amp = gust / (1 << o);
        wx += (vnoise(x * f + t, z * f) - 0.5) * 2 * amp;
        wy += (vnoise(x * f + 31.4, z * f + t) - 0.5) * 2 * amp * 0.7;
        wz += (vnoise(x * f, z * f + 17.3 + t) - 0.5) * 2 * amp;
      }
    }
    out.x = wx; out.y = wy; out.z = wz;
    return out;
  }
}
