// World frame, floating origin, geodetic conversion, airports and cities.
//
// The simulation keeps positions in metres on a local tangent plane centred on
// WORLD.origin*, at true Earth scale — Los Angeles really is 370 km from Las
// Vegas here. Rendering happens relative to a floating origin so that 32-bit
// GPU coordinates never blow up.

import * as THREE from 'three';
import { SIM, WORLD } from './config.js';

export const origin = new THREE.Vector3(0, 0, 0);
const ORIGIN_SNAP = 4096;

/** Move the floating origin near p (snapped). Returns true if it moved. */
export function updateOrigin(p) {
  if (Math.abs(p.x - origin.x) < ORIGIN_SNAP && Math.abs(p.z - origin.z) < ORIGIN_SNAP) return false;
  origin.x = Math.round(p.x / ORIGIN_SNAP) * ORIGIN_SNAP;
  origin.z = Math.round(p.z / ORIGIN_SNAP) * ORIGIN_SNAP;
  return true;
}

/** World metres -> render-space metres. */
export function toRender(v, out = new THREE.Vector3()) {
  return out.set(v.x - origin.x, v.y - origin.y, v.z - origin.z);
}

// --- geodetic <-> local tangent plane (x east, z south) ---
const M_PER_DEG_LAT = Math.PI * SIM.earthRadius / 180;
export function geoToWorld(lat, lon) {
  const x = (lon - WORLD.originLon) * M_PER_DEG_LAT * Math.cos(WORLD.originLat * Math.PI / 180);
  const z = -(lat - WORLD.originLat) * M_PER_DEG_LAT;
  return new THREE.Vector3(x, 0, z);
}
export function worldToGeo(x, z) {
  const lat = WORLD.originLat - z / M_PER_DEG_LAT;
  const lon = WORLD.originLon + x / (M_PER_DEG_LAT * Math.cos(WORLD.originLat * Math.PI / 180));
  return { lat, lon };
}

/** Apparent drop of a distant point below the tangent plane, from curvature. */
export function curvatureDrop(dist) {
  return (dist * dist) / (2 * SIM.earthRadius);
}

// ---------------------------------------------------------------------------
// Airfields. Real positions and runway headings, simplified layouts.
// ---------------------------------------------------------------------------
export const AIRPORTS = [
  { icao: 'KLSV', name: 'Nellis AFB',        lat: 36.2361, lon: -115.0342, elev: 570,  rwyHdg: 30,  rwyLen: 3050, rwyWidth: 45, mil: true },
  { icao: 'KLAS', name: 'Harry Reid Intl',   lat: 36.0840, lon: -115.1537, elev: 665,  rwyHdg: 260, rwyLen: 4420, rwyWidth: 46 },
  { icao: 'KEDW', name: 'Edwards AFB',       lat: 34.9054, lon: -117.8837, elev: 700,  rwyHdg: 40,  rwyLen: 4600, rwyWidth: 90, mil: true },
  { icao: 'KLAX', name: 'Los Angeles Intl',  lat: 33.9416, lon: -118.4085, elev: 38,   rwyHdg: 250, rwyLen: 3685, rwyWidth: 46 },
  { icao: 'KSAN', name: 'San Diego Intl',    lat: 32.7336, lon: -117.1897, elev: 5,    rwyHdg: 270, rwyLen: 2865, rwyWidth: 61 },
  { icao: 'KSFO', name: 'San Francisco Intl',lat: 37.6188, lon: -122.3750, elev: 4,    rwyHdg: 280, rwyLen: 3618, rwyWidth: 61 },
  { icao: 'KPHX', name: 'Phoenix Sky Harbor',lat: 33.4343, lon: -112.0116, elev: 337,  rwyHdg: 260, rwyLen: 3502, rwyWidth: 46 },
  { icao: 'KSLC', name: 'Salt Lake City',    lat: 40.7884, lon: -111.9778, elev: 1288, rwyHdg: 340, rwyLen: 3660, rwyWidth: 46 },
  { icao: 'KGCN', name: 'Grand Canyon',      lat: 35.9524, lon: -112.1470, elev: 2020, rwyHdg: 30,  rwyLen: 2740, rwyWidth: 46 },
  { icao: 'KTNX', name: 'Tonopah Test Range',lat: 37.7988, lon: -116.7809, elev: 1690, rwyHdg: 320, rwyLen: 3660, rwyWidth: 46, mil: true },
  { icao: 'KMHV', name: 'Mojave Air & Space',lat: 35.0594, lon: -118.1518, elev: 848,  rwyHdg: 300, rwyLen: 3810, rwyWidth: 61 },
  { icao: 'KRNO', name: 'Reno-Tahoe Intl',   lat: 39.4991, lon: -119.7681, elev: 1345, rwyHdg: 340, rwyLen: 3353, rwyWidth: 46 },
];
for (const a of AIRPORTS) {
  const p = geoToWorld(a.lat, a.lon);
  a.x = p.x; a.z = p.z;
  a.hdgRad = a.rwyHdg * Math.PI / 180;
  // runway centreline direction in world axes (x east, z south)
  a.dir = new THREE.Vector2(Math.sin(a.hdgRad), -Math.cos(a.hdgRad));
}

// ---------------------------------------------------------------------------
// Cities. Radius drives the procedural building field and the night glow.
// ---------------------------------------------------------------------------
export const CITIES = [
  { name: 'Las Vegas',     lat: 36.171,  lon: -115.139, radius: 22000, density: 1.0, tall: 210 },
  { name: 'Los Angeles',   lat: 34.052,  lon: -118.244, radius: 46000, density: 1.0, tall: 310 },
  { name: 'San Diego',     lat: 32.716,  lon: -117.161, radius: 22000, density: 0.8, tall: 160 },
  { name: 'Phoenix',       lat: 33.448,  lon: -112.074, radius: 34000, density: 0.85, tall: 145 },
  { name: 'San Francisco', lat: 37.775,  lon: -122.419, radius: 20000, density: 1.0, tall: 260 },
  { name: 'Salt Lake City',lat: 40.760,  lon: -111.891, radius: 18000, density: 0.7, tall: 130 },
  { name: 'Bakersfield',   lat: 35.373,  lon: -119.019, radius: 13000, density: 0.55, tall: 70 },
  { name: 'Fresno',        lat: 36.747,  lon: -119.772, radius: 14000, density: 0.6, tall: 80 },
  { name: 'Reno',          lat: 39.530,  lon: -119.814, radius: 12000, density: 0.6, tall: 100 },
  { name: 'Flagstaff',     lat: 35.198,  lon: -111.651, radius: 8000,  density: 0.4, tall: 45 },
  { name: 'St. George',    lat: 37.096,  lon: -113.568, radius: 7000,  density: 0.4, tall: 40 },
  { name: 'Santa Barbara', lat: 34.421,  lon: -119.698, radius: 9000,  density: 0.5, tall: 55 },
];
for (const c of CITIES) { const p = geoToWorld(c.lat, c.lon); c.x = p.x; c.z = p.z; }

export function nearestAirport(x, z) {
  let best = null, bd = Infinity;
  for (const a of AIRPORTS) {
    const d = Math.hypot(a.x - x, a.z - z);
    if (d < bd) { bd = d; best = a; }
  }
  return { airport: best, distance: bd };
}
