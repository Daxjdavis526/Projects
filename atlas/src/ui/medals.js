// Achievement medals, drawn as SVG: a faceted disc in the tier's metal with
// the achievement's glyph engraved in the middle and a short ribbon.

const TIERS = {
  bronze: ['#f0b98a', '#b8713f', '#6e3c1c'],
  silver: ['#f4f7fb', '#a9b6c8', '#5d6a7e'],
  gold: ['#fff1b8', '#f2c14e', '#9a6b10'],
  cosmic: ['#d9c7ff', '#7d5cff', '#2b1a6e'],
};

// glyphs drawn inside a 40 × 40 box centred at (0, 0)
const GLYPH = {
  derivative: '<path d="M-13 9 Q-4 -12 13 -6" fill="none" stroke-width="2.2"/><path d="M-13 2 L12 -11" stroke-width="1.6" stroke-dasharray="3 2"/><circle cx="-1" cy="-4.5" r="2.4"/>',
  integral: '<path d="M4 -14 C1 -14 0 -11 0 -8 L0 8 C0 11 -1 14 -4 14" fill="none" stroke-width="2.4"/><path d="M-12 12 L12 12" stroke-width="1.4"/>',
  vector: '<path d="M-11 11 L9 -9" stroke-width="2.4"/><path d="M9 -9 L1 -8 M9 -9 L8 -1" stroke-width="2.4"/><path d="M-11 11 L11 11" stroke-width="1.2" opacity=".6"/>',
  apple: '<path d="M0 -6 C-9 -12 -15 -2 -12 6 C-10 12 -4 14 0 11 C4 14 10 12 12 6 C15 -2 9 -12 0 -6Z" fill="none" stroke-width="2"/><path d="M0 -6 C0 -10 2 -13 5 -14" fill="none" stroke-width="1.8"/>',
  quantum: '<ellipse cx="0" cy="0" rx="14" ry="5.5" fill="none" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="14" ry="5.5" fill="none" stroke-width="1.6" transform="rotate(60)"/><ellipse cx="0" cy="0" rx="14" ry="5.5" fill="none" stroke-width="1.6" transform="rotate(-60)"/><circle r="2.4"/>',
  tensor: '<text x="0" y="5" text-anchor="middle" font-size="15" font-family="Georgia,serif" font-style="italic" stroke="none">T</text><text x="7" y="-4" font-size="8" font-family="Georgia,serif" font-style="italic" stroke="none">μν</text>',
  curvature: '<path d="M-14 6 Q0 -14 14 6" fill="none" stroke-width="2"/><path d="M-14 6 Q0 -2 14 6" fill="none" stroke-width="1.2" opacity=".7"/><path d="M-7 -1 L0 -7 L7 -1" fill="none" stroke-width="1.6"/>',
  blackhole: '<circle r="7"/><ellipse rx="15" ry="4.5" fill="none" stroke-width="1.8" transform="rotate(-12)"/><circle r="10.5" fill="none" stroke-width="1" opacity=".6"/>',
  wave: '<path d="M-15 0 C-11 -12 -7 -12 -3 0 S5 12 9 0 S13 -8 15 -4" fill="none" stroke-width="2.2"/>',
  orbit: '<ellipse rx="14" ry="8" fill="none" stroke-width="1.6"/><circle cx="-5" r="3.2"/><circle cx="13" cy="3" r="1.8"/>',
  flame: '<path d="M0 -14 C6 -6 10 -2 8 6 C6 12 -6 12 -8 6 C-10 -2 -3 -4 0 -14Z" fill="none" stroke-width="2"/><path d="M0 2 C3 5 3 9 0 10 C-3 9 -3 5 0 2Z"/>',
  return: '<path d="M-10 -2 A10 10 0 1 1 -6 8" fill="none" stroke-width="2"/><path d="M-13 -6 L-10 -1 L-5 -4" fill="none" stroke-width="2"/>',
  target: '<circle r="12" fill="none" stroke-width="1.6"/><circle r="6.5" fill="none" stroke-width="1.6"/><circle r="2"/>',
  scale: '<path d="M0 -12 L0 12 M-10 12 L10 12 M-13 -6 L13 -6" stroke-width="1.8"/><path d="M-13 -6 L-17 3 L-9 3 Z M13 -6 L9 3 L17 3 Z" fill="none" stroke-width="1.5"/>',
  bug: '<ellipse rx="6.5" ry="9" fill="none" stroke-width="1.8"/><path d="M-6 -3 L-12 -6 M-6 3 L-12 6 M6 -3 L12 -6 M6 3 L12 6 M-3 -9 L-6 -14 M3 -9 L6 -14" stroke-width="1.6"/><path d="M0 -9 L0 9" stroke-width="1.2"/>',
  flask: '<path d="M-4 -13 L4 -13 M-3 -13 L-3 -4 L-11 10 Q-12 13 -9 13 L9 13 Q12 13 11 10 L3 -4 L3 -13" fill="none" stroke-width="1.8"/><path d="M-8 6 L8 6" stroke-width="1.4"/>',
  bulb: '<path d="M-5 9 L5 9 M-4 13 L4 13 M0 -13 A8.5 8.5 0 0 0 -5 2 C-4 4 -4 6 -4 7 L4 7 C4 6 4 4 5 2 A8.5 8.5 0 0 0 0 -13" fill="none" stroke-width="1.8"/>',
  compass: '<circle r="12.5" fill="none" stroke-width="1.6"/><path d="M5 -5 L2 2 L-5 5 L-2 -2Z"/>',
  star: '<path d="M0 -13 L3.6 -4.5 L12.6 -4 L5.6 1.8 L7.8 10.6 L0 5.8 L-7.8 10.6 L-5.6 1.8 L-12.6 -4 L-3.6 -4.5Z"/>',
  crown: '<path d="M-13 8 L-13 -6 L-6 1 L0 -10 L6 1 L13 -6 L13 8 Z" fill="none" stroke-width="1.8"/><path d="M-13 12 L13 12" stroke-width="1.8"/>',
  sword: '<path d="M-11 11 L8 -8 M8 -8 L11 -11 M3 -9 L9 -3 M-11 11 L-13 13" stroke-width="2"/><path d="M-8 4 L-4 8" stroke-width="2"/>',
  calendar: '<rect x="-12" y="-10" width="24" height="22" rx="3" fill="none" stroke-width="1.7"/><path d="M-12 -3 L12 -3 M-6 -14 L-6 -7 M6 -14 L6 -7" stroke-width="1.7"/><circle cx="-5" cy="4" r="1.6"/><circle cx="1" cy="4" r="1.6"/><circle cx="7" cy="4" r="1.6"/>',
};

export function medalSVG(a, size = 72) {
  const [hi, mid, lo] = TIERS[a.tier] || TIERS.bronze;
  const id = `m${(a.id || 'x').replace(/[^a-z0-9]/gi, '')}${size}`;
  const glyph = GLYPH[a.glyph] || GLYPH.star;
  const facets = Array.from({ length: 12 }, (_, k) => {
    const t = (k / 12) * Math.PI * 2;
    return `${(Math.cos(t) * 31).toFixed(2)},${(Math.sin(t) * 31).toFixed(2)}`;
  }).join(' ');
  return `<svg width="${size}" height="${size * 1.18}" viewBox="-40 -40 80 94" aria-hidden="true">
<defs>
 <radialGradient id="${id}a" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient>
 <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
</defs>
<path d="M-15 22 L-21 52 L-9 45 L-3 54 L1 27 Z" fill="#2c4f93"/><path d="M15 22 L21 52 L9 45 L3 54 L-1 27 Z" fill="#3e6fc7"/>
<polygon points="${facets}" fill="url(#${id}b)"/>
<circle r="27.5" fill="url(#${id}a)"/>
<circle r="22.5" fill="none" stroke="${hi}" stroke-opacity=".55" stroke-width="1"/>
<circle r="27.5" fill="none" stroke="${lo}" stroke-opacity=".5" stroke-width="1"/>
<g fill="${lo}" stroke="${lo}" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${glyph}</g>
<ellipse cx="-9" cy="-14" rx="11" ry="5" fill="#fff" opacity=".18" transform="rotate(-30 -9 -14)"/>
</svg>`;
}
