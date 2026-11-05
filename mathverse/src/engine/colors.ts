// Colormaps for surfaces and fields: perceptually ordered, readable on dark
// and light backgrounds. Values in [0, 1].

import * as THREE from 'three';

export type Colormap = 'turbo' | 'viridis' | 'plasma' | 'coolwarm' | 'ice';

const STOPS: Record<Colormap, string[]> = {
  // a smooth rainbow (after Google's Turbo), good for heights
  turbo: ['#30123b', '#4662d7', '#36aaf9', '#1ae4b6', '#72fe5e', '#c8ef34', '#faba39', '#f66b19', '#ca2a04', '#7a0403'],
  viridis: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
  plasma: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
  // diverging: negative blue, zero white-ish, positive red (curvature, divergence, temperature anomalies)
  coolwarm: ['#3b4cc0', '#6788ee', '#9abbff', '#c9d7f0', '#edd1c2', '#f7a889', '#e26952', '#b40426'],
  ice: ['#04051a', '#1d2b6b', '#2f5fa8', '#3d93c9', '#62c3dc', '#a6e6ec', '#eefcfd'],
};

const cache = new Map<Colormap, THREE.Color[]>();

export function colormap(name: Colormap, t: number): THREE.Color {
  let stops = cache.get(name);
  if (!stops) { stops = STOPS[name].map((s) => new THREE.Color(s)); cache.set(name, stops); }
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0.5)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return stops[i].clone().lerp(stops[i + 1], x - i);
}

export function colormapCss(name: Colormap, t: number): string {
  return `#${colormap(name, t).getHexString()}`;
}

/** A diverging map centred on zero: v in [−m, m]. */
export function diverging(v: number, m: number): THREE.Color {
  return colormap('coolwarm', m > 0 ? 0.5 + 0.5 * Math.max(-1, Math.min(1, v / m)) : 0.5);
}

/** The palette used for series (curves, vectors) — distinct on both themes. */
export const SERIES = ['#6aa9ff', '#f2c14e', '#ef6b73', '#6fcf97', '#b48cff', '#4fd1d9', '#ff9f5a', '#e879c6'];
