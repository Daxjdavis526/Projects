// Small line icons (24×24, stroke 1.8), drawn here so nothing is fetched.
const P: Record<string, string> = {
  play: 'M7 5l12 7-12 7z', pause: 'M7 5h3v14H7zM14 5h3v14h-3z', rewind: 'M11 6L4 12l7 6zM20 6l-7 6 7 6z', reset: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.3-4.3', sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6', open: 'M3 7h6l2 2h10v10H3z',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01', expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', panel: 'M4 4h16v16H4zM9 4v16',
  cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5', grid: 'M4 4h16v16H4zM4 10h16M4 16h16M10 4v16M16 4v16',
  axes: 'M5 19V5M5 19h14M5 19l9-9', book: 'M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4zM5 16a4 4 0 0 1 4-4h9', spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3', x: 'M6 6l12 12M18 6 6 18', plus: 'M12 5v14M5 12h14', check: 'M5 12l5 5L20 7', warn: 'M12 3 2 20h20zM12 9v5M12 17h.01',
  sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6', cap: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 18l10 5 10-5', compact: 'M15 4h5v16h-5zM4 4h8v16H4z', down: 'M12 4v12M6 11l6 6 6-6M5 20h14', clipboard: 'M9 4h6v3H9zM7 5H5v15h14V5h-2',
  wand: 'M4 20 16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.7 1.3L21 13l-1.3.7L19 15l-.7-1.3L17 13l1.3-.7z',
};
export function Icon({ name, size = 18 }: { name: keyof typeof P | string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[name] ?? ''} /></svg>;
}
