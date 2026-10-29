// Shared helpers for PHYS 3750 W6–W9 (Fourier analysis, 3D waves, membranes,
// energy): spectra drawn as stems, and a few plain pictures. Number
// formatting comes from _wv.js (tn for TeX, pn for canvas labels).

/** Stems (lollipops) for a spectrum: [{ x, y }] → { curves, points } for a graph. */
export function stems(list, color = 'accent', o = {}) {
  const curves = list.map(({ x, y }) => ({ param: [`${x}`, `${y}*t`], t: [0, 1], color, width: o.width ?? 2, samples: 10 }));
  const points = list.map(({ x, y, label }) => ({ x, y, color, r: o.r ?? 3.5, label, labelDx: -4, labelDy: y >= 0 ? -10 : 14 }));
  return { curves, points };
}

/** A spectrum picture: stems at (x, y), optional extra curves (envelopes). */
export function spectrumPic(list, x, y, caption, more = {}) {
  const s = stems(list, more.color || 'accent', more);
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', xlabel: more.xlabel ?? 'harmonic n', ylabel: more.ylabel ?? '|cₙ|', curves: [...(more.curves || []), ...s.curves], points: [...s.points, ...(more.points || [])], ...(more.params || {}) },
    caption,
  };
}
