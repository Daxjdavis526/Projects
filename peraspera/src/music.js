// The score, composed as data: every note, sound effect and ambience bed as
// an event at an absolute film time. Pure — no audio here; score.js plays it
// and the tests check it.
//
// One theme runs through the whole film, in D major: it first plays under
// the title, breaks into D minor through the summer, comes home at the
// driveway, and ends the film and the post-credits scene. A rising figure —
// A D E F# A — is the sound of looking up.

import { note, hash, clamp } from './kit.js';
import { TIMELINE, SCENES } from './script.js';

// ─── harmony helpers ─────────────────────────────────────────────────────

const PCN = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const QUAL = {
  '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus4: [0, 5, 7], sus2: [0, 2, 7],
  add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], 6: [0, 4, 7, 9], dim: [0, 3, 6], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m7b5: [0, 3, 6, 10],
};
export function chord(sym) {
  const [main, slash] = sym.split('/');
  const m = /^([A-G](?:#|b)?)(.*)$/.exec(main);
  if (!m || QUAL[m[2]] === undefined) throw new Error(`bad chord ${sym}`);
  return { sym, root: PCN[m[1]], ints: QUAL[m[2]], bass: slash ? PCN[slash] : PCN[m[1]] };
}
const up = (pc, low) => low + (((pc - low) % 12) + 12) % 12;
export const voice = (ch, low = 50) => { const b = up(ch.root, low); return ch.ints.map((i) => b + i); };
export const bassOf = (ch, low = 36) => up(ch.bass, low);
const M = (n) => (typeof n === 'number' ? n : note(n));

// ─── the material ────────────────────────────────────────────────────────

export const THEME = [
  ['F#5', 2], ['E5', 1], ['D5', 1],
  ['E5', 3], ['A4', 1],
  ['D5', 2], ['C#5', 1], ['B4', 1],
  ['B4', 3], ['A4', 1],
  ['A4', 1], ['D5', 1], ['E5', 1], ['F#5', 1],
  ['G5', 2], ['F#5', 1], ['E5', 1],
  ['E5', 2], ['D5', 1], ['B4', 1],
  ['A4', 2], ['C#5', 1], ['E5', 1],
  ['D5', 4],
];
export const THEME_CHORDS = [['D', 4], ['A/C#', 4], ['Bm', 4], ['G', 4], ['D/F#', 4], ['G', 4], ['Em7', 4], ['A', 4], ['Dadd9', 4]];
// the same tune, darkened into D minor for the summer
const MINOR = { 'F#5': 'F5', 'F#4': 'F4', 'C#5': 'C5', B4: 'Bb4', B3: 'Bb3' };
export const THEME_MINOR = THEME.map(([n, b], i) => [i === 21 ? n : MINOR[n] || n, b]);
export const THEME_MINOR_CHORDS = [['Dm', 4], ['A/C#', 4], ['Bb', 4], ['Gm', 4], ['Dm/F', 4], ['Gm', 4], ['Em7b5', 4], ['A', 4], ['Dm', 4]];
export const LOOKUP = [['A4', 0.5], ['D5', 0.5], ['E5', 0.5], ['F#5', 0.5], ['A5', 2.5]];

// A slice of the theme by bar (bars are 4 beats), for quoting it.
function bars(mel, from, to) {
  const out = [];
  let beat = 0;
  for (const [n, b] of mel) {
    if (beat >= from * 4 && beat < to * 4) out.push([n, b]);
    beat += b;
  }
  return out;
}

// ─── the event list ──────────────────────────────────────────────────────

const START = Object.fromEntries(TIMELINE.map((s) => [s.id, s.start]));

export function buildScore() {
  const N = [];   // notes: { t, v, m, d, g, ...opts }
  const X = [];   // sound effects: { t, type, d, g, p }
  const B = [];   // ambience beds: { type, a, b, g, f }

  const n = (t, v, m, d, g, o = {}) => N.push({ t, v, m: M(m), d, g, ...o });
  const mel = (t0, bpm, notes, v, g, o = {}) => {
    const b = 60 / bpm; let t = t0;
    for (const [m, beats] of notes) {
      if (m !== null) n(t, v, typeof m === 'number' ? m : M(m) + (o.oct || 0) * 12, beats * b * (o.legato || 0.95), g, o);
      t += beats * b;
    }
    return t;
  };
  const prog = (t0, bpm, list, fn) => {
    const b = 60 / bpm; let t = t0;
    list.forEach(([sym, beats], i) => { fn(chord(sym), t, beats * b, b, i); t += beats * b; });
    return t;
  };
  const pad = (ch, t, d, o = {}) => {
    const g = o.g ?? 0.04;
    for (const m of voice(ch, o.low ?? 50)) n(t, o.v || 'pad', m, d, g, { att: o.att ?? 1.2, rel: o.rel ?? 2, cut: o.cut });
    if (o.bass) n(t, o.bassV || 'bass', bassOf(ch, o.bassLow ?? 36), d, o.bassG ?? 0.08, { att: 0.3, rel: 1.5 });
  };
  const arp = (ch, t, d, b, o = {}) => {
    const notes = voice(ch, o.low ?? 55);
    const pat = o.pat || [0, 1, 2, 1, 3, 1, 2, 1];
    const step = (o.step ?? 0.5) * b;
    const steps = Math.round(d / step);
    for (let i = 0; i < steps; i++) {
      const idx = pat[i % pat.length];
      const m = notes[idx % notes.length] + (idx >= notes.length ? 12 : 0);
      n(t + i * step, o.v || 'piano', m, step * (o.hold ?? 2.2), (o.g ?? 0.07) * (i % 4 === 0 ? 1.15 : 1));
    }
    if (o.bass !== false) n(t, o.bassV || 'piano', bassOf(ch, o.bassLow ?? 38), d * 0.95, (o.bassG ?? 0.1) * 0.75);
  };
  const drums = (t0, t1, bpm, o = {}) => {
    const b = 60 / bpm;
    for (let t = t0, i = 0; t < t1 - 0.01; t += b / 2, i++) {
      const beat = i / 2;
      if (i % 2 === 0 && (o.kickEvery || 1) === 1) n(t, 'kick', 36, 0.4, o.kick ?? 0.3);
      if (i % 2 === 0 && o.kickEvery === 2 && beat % 2 === 0) n(t, 'kick', 36, 0.4, o.kick ?? 0.3);
      if (o.snare && i % 4 === 2) n(t, o.snareV || 'snare', 60, 0.2, o.snare);
      if (o.hat && i % 2 === 1) n(t, 'hat', 90, 0.05, o.hat);
      if (o.hat16) { n(t, 'hat', 90, 0.04, o.hat16 * 0.6); }
    }
  };
  const x = (t, type, g = 1, p = {}) => X.push({ t, type, g, ...p });
  const LU = (t, bpm = 110, g = 0.06, oct = 1) => mel(t, bpm, LOOKUP, 'bell', g, { oct });

  // ── I. the kid ──
  {
    const S = START.sky, B2 = START.bedroom;
    pad(chord('Dadd9'), S + 1, 26, { low: 62, g: 0.028, att: 6, rel: 6, v: 'pad' });
    LU(S + 9.8, 100, 0.05); LU(S + 17.2, 100, 0.05);
    const b = 60 / 72;
    prog(S + 21.7, 72, [['D', 4], ['A/C#', 4]], (ch, t, d, bb) => arp(ch, t, d, bb, { g: 0.055, low: 57, bassG: 0.07 }));
    const T0 = S + 21.7 + 8 * b;
    prog(T0, 72, THEME_CHORDS, (ch, t, d, bb, i) => {
      arp(ch, t, d, bb, { g: 0.06, low: 57, bassG: 0.08 });
      if (i >= 4) pad(ch, t, d, { v: 'strings', low: 55, g: 0.022, att: 1.5, rel: 2 });
    });
    mel(T0, 72, THEME, 'piano', 0.16);
    mel(T0 + 16 * b, 72, bars(THEME, 4, 9), 'bell', 0.035);
    // the turn: somewhere along the way
    const b2 = 1;
    prog(B2 + 18.6, 60, [['Bm', 4], ['G', 4], ['Em', 4], ['F#sus4', 2], ['F#', 2]], (ch, t, d, bb, i) => {
      pad(ch, t, d, { low: 47, g: 0.03, att: 1.5, rel: 2.5 });
      for (const [k, m] of voice(ch, 50).entries()) n(t + k * 0.12, 'piano', m, d, 0.06);
    });
    mel(B2 + 18.6, 60, [['D5', 4], ['B4', 4], ['G4', 4], ['F#4', 4]], 'piano', 0.1);
  }

  // ── II. England ──
  {
    const E = START.england;
    const bpm = 66;
    prog(E + 1.5, bpm, [['G', 4], ['D/F#', 4], ['Em', 4], ['C', 4], ['G', 4], ['D/F#', 4], ['C', 4]], (ch, t, d, b) => arp(ch, t, d, b, { g: 0.05, low: 55, pat: [0, 2, 1, 2, 3, 2, 1, 2], bassG: 0.07 }));
    mel(E + 1.5 + 8 * 60 / bpm, bpm, [['D5', 2], ['B4', 2], ['C5', 2], ['A4', 2], ['B4', 2], ['G4', 2], ['A4', 4], ['B4', 2], ['D5', 2], ['E5', 2], ['D5', 2]], 'piano', 0.12);
    // lockdown
    pad(chord('Em'), E + 26.5, 21, { low: 40, g: 0.03, att: 3, rel: 4 });
    for (const [dt, m] of [[27, 'E4'], [30, 'B3'], [33, 'G4'], [36, 'F#4']]) n(E + dt, 'piano', m, 3, 0.09);
    prog(E + 37, 50, [['C', 4], ['G', 4]], (ch, t, d) => pad(ch, t, d, { v: 'strings', low: 55, g: 0.03, att: 2.5, rel: 3 }));
  }

  // ── III. iron ──
  {
    const Sh = START.shop;
    const bpm = 96, b = 60 / bpm;
    const loop = [['D', 4], ['C', 4], ['G', 4], ['D', 4]];
    let t = Sh + 1;
    for (let r = 0; t < Sh + 23.3; r++) {
      t = prog(t, bpm, loop, (ch, tt, d, bb) => {
        if (tt > Sh + 23.3) return;
        n(tt, 'bass', bassOf(ch, 38), d * 0.9, 0.12);
        if (tt > Sh + 5) arp(ch, tt, d, bb, { v: 'pluck', g: 0.05, low: 62, pat: [0, 2, 1, 3, 2, 1, 0, 2], bass: false, hold: 1.2 });
        if (tt > Sh + 10) pad(ch, tt, d, { low: 55, g: 0.02, att: 0.6, rel: 1 });
      });
    }
    drums(Sh + 1, Sh + 23.3, bpm, { kick: 0.22, hat: 0.025 });
    // the slow motion: everything hangs, then the sparks turn to stars
    x(Sh + 24, 'boom', 0.6);
    pad(chord('Dadd9'), Sh + 24, 12, { low: 50, g: 0.04, att: 2, rel: 3, bass: true, bassG: 0.06 });
    LU(Sh + 25.4, 90, 0.06);
    for (const [dt, m] of [[29, 'A5'], [30.6, 'F#6'], [32.2, 'D6'], [33.5, 'A6']]) n(Sh + dt, 'bell', m, 2, 0.04);
  }

  // ── IV. speed ──
  {
    const Tr = START.track;
    const bpm = 132;
    const loop = [['Bm', 4], ['G', 4], ['D', 4], ['A', 4]];
    let t = Tr + 0.5;
    const end = Tr + 38.2;
    while (t < end - 0.1) {
      t = prog(t, bpm, loop, (ch, tt, d, b) => {
        if (tt >= end - 0.05) return;
        const dd = Math.min(d, end - tt);
        for (let k = 0; k < Math.round(dd / (b / 2)); k++) n(tt + k * b / 2, 'bass', bassOf(ch, 38), b * 0.4, 0.1);
        if (tt > Tr + 3.5) arp(ch, tt, dd, b, { v: 'pluck', g: 0.04, low: 62, step: 0.25, pat: [0, 1, 2, 3, 2, 1], bass: false, hold: 1 });
        if (tt > Tr + 11.5) pad(ch, tt, dd, { v: 'strings', low: 57, g: 0.025, att: 0.3, rel: 0.6 });
      });
    }
    drums(Tr + 0.5, end, bpm, { kick: 0.26, hat: 0.03, snare: 0.1 });
    x(end, 'crash', 0.5);
    pad(chord('D'), end, 6, { v: 'strings', low: 57, g: 0.05, att: 0.2, rel: 3, bass: true });
    mel(end + 0.2, 90, [['A4', 1], ['D5', 1], ['F#5', 2]], 'bell', 0.07);

    const Po = START.podium;
    const b = 60 / 80;
    prog(Po + 0.8, 80, THEME_CHORDS.slice(0, 4), (ch, tt, d, bb) => { arp(ch, tt, d, bb, { g: 0.06, low: 57 }); pad(ch, tt, d, { v: 'strings', low: 55, g: 0.03, att: 0.8 }); });
    mel(Po + 0.8, 80, bars(THEME, 0, 4), 'strings', 0.07);
    mel(Po + 0.8, 80, bars(THEME, 0, 4), 'bell', 0.03);
    prog(Po + 0.8 + 16 * b, 60, [['G', 4], ['D/F#', 4]], (ch, tt, d) => { for (const [k, m] of voice(ch, 55).entries()) n(tt + k * 0.18, 'piano', m, d, 0.06); n(tt, 'piano', bassOf(ch, 38), d, 0.07); });
  }

  // ── V. her ──
  {
    const Me = START.meet;
    const bpm = 66;
    prog(Me + 1, bpm, [['G', 4], ['D/F#', 4], ['Em', 4], ['D', 4], ['G', 4], ['A', 4]], (ch, t, d, b) => arp(ch, t, d, b, { g: 0.05, low: 55, pat: [0, 1, 2, 3, 2, 1, 2, 1], bassG: 0.07 }));
    mel(Me + 1 + 4 * 60 / bpm, bpm, [['B4', 2], ['A4', 1], ['G4', 1], ['F#4', 3], ['D4', 1], ['G4', 2], ['A4', 1], ['B4', 1], ['A4', 4], ['B4', 2], ['D5', 1], ['E5', 1], ['C#5', 4]], 'piano', 0.13);
    pad(chord('Gmaj7'), Me + 14, 9, { v: 'strings', low: 55, g: 0.025, att: 3 });

    const Wd = START.wedding;
    const T0 = Wd + 0.8;
    const wchords = [['D', 4], ['A/C#', 4], ['Bm', 4], ['G', 4], ['Dadd9', 4]];
    prog(T0, bpm, wchords, (ch, t, d, b) => { arp(ch, t, d, b, { g: 0.055, low: 57 }); pad(ch, t, d, { v: 'strings', low: 55, g: 0.03, att: 1.2 }); });
    mel(T0, bpm, [...bars(THEME, 0, 4), ['D5', 4]], 'piano', 0.15);
    mel(T0, bpm, [...bars(THEME, 0, 4), ['D5', 4]], 'strings', 0.04, { oct: 1 });
    for (const [dt, m] of [[20.5, 'A5'], [21.6, 'D6'], [22.8, 'F#6'], [24, 'A6']]) n(Wd + dt, 'bell', m, 2.5, 0.04);
  }

  // ── the brothers' shop ──
  {
    const Br = START.brothers;
    const bpm = 104;
    let t = Br + 1.5;
    for (let r = 0; r < 2; r++) t = prog(t, bpm, [['G', 4], ['C', 4], ['Em', 4], ['D', 4]], (ch, tt, d, b) => { arp(ch, tt, d, b, { v: 'pluck', g: 0.055, low: 59, pat: [0, 2, 1, 2, 3, 2, 1, 2], bass: false, hold: 1.4 }); n(tt, 'bass', bassOf(ch, 38), d * 0.9, 0.1); if (r) pad(ch, tt, d, { low: 55, g: 0.02 }); });
    drums(Br + 1.5, t, bpm, { kickEvery: 2, kick: 0.16, snare: 0.06, snareV: 'clap', hat: 0.02 });
    n(Br + 8.1, 'bell', 'G6', 1.5, 0.05); n(Br + 8.3, 'bell', 'D6', 1.5, 0.04);
  }

  // ── VI. loss ──
  {
    const Fr = START.friend;
    pad(chord('Bm'), Fr + 4, 32, { low: 47, g: 0.022, att: 5, rel: 5 });
    for (const [dt, m] of [[5, 'F#4'], [8.5, 'E4'], [12, 'D4'], [15.5, 'C#4'], [19, 'B3']]) n(Fr + dt, 'piano', m, 3.4, 0.1);
    for (const [dt, m, d] of [[14, 'B2', 8], [22, 'G2', 8], [30, 'F#2', 6]]) n(Fr + dt, 'cello', m, d, 0.07, { att: 1.5, rel: 2.5 });
  }

  // ── VII. the question ──
  {
    const Gy = START.gym;
    n(Gy + 0.5, 'drone', 'E2', 13, 0.03, { att: 2, rel: 1 });
    for (let t = Gy + 0.8; t < Gy + 13.4; t += 1) { n(t, 'kick', 36, 0.3, 0.1); if (Math.round(t - Gy) % 2 === 0) n(t, 'pluck', 'E3', 0.4, 0.03); }
    n(Gy + 19, 'drone', 'E1', 10, 0.02, { att: 3, rel: 3 });
    for (const [dt, m] of [[30, 'A5'], [32.5, 'D6'], [35, 'E6'], [37.5, 'F#6'], [40, 'A6']]) n(Gy + dt, 'bell', m, 3, 0.045);
    pad(chord('Dadd9'), Gy + 31, 15, { low: 57, g: 0.025, att: 5, rel: 4 });

    const Ap = START.apply;
    const b = 60 / 84;
    for (let t = Ap + 2.5, i = 0; t < Ap + 12.9; t += b / 2, i++) n(t, 'piano', i % 2 ? 'A4' : 'D5', b, 0.045);
    pad(chord('Bm'), Ap + 2.5, 5, { low: 47, g: 0.02, att: 2 });
    pad(chord('G'), Ap + 7.5, 5.4, { low: 47, g: 0.02, att: 1.5, rel: 0.4 });
    pad(chord('Dadd9'), Ap + 13.4, 12, { low: 50, g: 0.05, att: 1.2, rel: 3, bass: true, bassG: 0.06 });
    for (const [k, m] of voice(chord('D'), 57).entries()) n(Ap + 13.4 + k * 0.05, 'piano', m, 4, 0.1);
    n(Ap + 13.4, 'bell', 'D6', 3, 0.06);
    mel(Ap + 18.8, 80, LOOKUP, 'bell', 0.05, { oct: 1 });
  }

  // ── VIII. summer ──
  {
    const Lv = START.leaving;
    const bpm = 70, b = 60 / bpm;
    prog(Lv + 0.5, bpm, [['Bm', 4], ['G', 4], ['D', 4], ['A', 4], ['Bm', 4], ['G', 4], ['D', 4], ['A', 4]], (ch, t, d, bb, i) => arp(ch, t, d, bb, { g: i < 4 ? 0.05 : 0.035, low: 55, pat: [0, 2, 1, 2, 3, 2, 1, 2], bassG: 0.07 }));
    mel(Lv + 0.5, bpm, [['D5', 2], ['C#5', 1], ['B4', 1], ['B4', 3], ['A4', 1], ['A4', 2], ['F#4', 1], ['A4', 1], ['E4', 4]], 'piano', 0.12);
    prog(Lv + 11, 45, [['D', 4], ['A', 4]], (ch, t, d) => pad(ch, t, d, { v: 'strings', low: 55, g: 0.035, att: 2.5, rel: 3 }));
    mel(Lv + 0.5 + 16 * b, bpm, [['D5', 4], ['B4', 4], [null, 4], ['A4', 4]], 'piano', 0.08);

    const Do = START.doors;
    n(Do + 0.2, 'drone', 'A2', 9.5, 0.025, { att: 2, rel: 1 });
    n(Do + 0.2, 'drone', 'E3', 9.5, 0.015, { att: 2, rel: 1 });
    for (const dt of [11.6, 14.6, 17.2, 19.5, 20.7, 21.6]) { n(Do + dt, 'piano', 'D2', 1.2, 0.18); n(Do + dt, 'piano', 'D3', 1.2, 0.12); n(Do + dt, 'piano', 'Eb3', 1.2, 0.06); }
    for (const m of ['D2', 'Eb2', 'A2']) n(Do + 22.4, 'drone', m, 9, 0.03, { att: 2, rel: 1 });
    pad(chord('Dm'), Do + 22.4, 8.6, { v: 'strings', low: 50, g: 0.02, att: 3, rel: 0.5 });
    for (const dt of [22.8, 24, 25, 26.1, 27, 28, 29]) n(Do + dt, 'timp', 'D2', 1.5, 0.18);
    // day after day: a machine that will not stop
    for (let t = Do + 31, i = 0; t < Do + 39.8; t += 0.25, i++) n(t, 'pluck', ['D4', 'F4', 'A4', 'F4'][i % 4], 0.2, 0.05);
    drums(Do + 31, Do + 39.8, 120, { kick: 0.18 });
    n(Do + 31, 'bass', 'D2', 8.8, 0.08);

    const Gb = START.goodbyes;
    pad(chord('Dm'), Gb + 1, 28, { low: 50, g: 0.025, att: 3, rel: 3 });
    for (const [dt, m] of [[4.2, 'A4'], [6.4, 'G4'], [8.0, 'F4'], [9.4, 'E4'], [10.8, 'D4']]) n(Gb + dt, 'piano', m, 3, 0.11);
    n(Gb + 19, 'cello', 'D2', 10, 0.07, { att: 2, rel: 3 });

    const Ni = START.nights;
    n(Ni + 1, 'drone', 'D2', 22, 0.02, { att: 4, rel: 2 });
    mel(Ni + 2, 48, bars(THEME_MINOR, 0, 4), 'piano', 0.11);
    prog(Ni + 2, 48, THEME_MINOR_CHORDS.slice(0, 4), (ch, t, d) => { n(t, 'piano', bassOf(ch, 38), d, 0.06); pad(ch, t, d, { low: 50, g: 0.015, att: 2 }); });
    // she comes: the tune warms into F major for a moment
    prog(Ni + 23.6, 60, [['F', 4], ['C/E', 4]], (ch, t, d, b) => { arp(ch, t, d, b, { g: 0.05, low: 57 }); pad(ch, t, d, { v: 'strings', low: 53, g: 0.03, att: 1.5 }); });
    mel(Ni + 23.6, 60, [['A4', 2], ['G4', 1], ['F4', 1], ['G4', 4]], 'piano', 0.13);
    pad(chord('Dm'), Ni + 30.8, 8, { low: 50, g: 0.025, att: 2 });
    for (const [dt, m] of [[31, 'D4'], [33, 'C4'], [35, 'Bb3'], [37, 'A3']]) n(Ni + dt, 'piano', m, 2, 0.08);
    pad(chord('A'), Ni + 38.6, 8, { low: 52, g: 0.035, att: 3, rel: 3, bass: true, bassG: 0.05 });
    n(Ni + 39, 'bell', 'C#6', 3, 0.035);
  }

  // ── IX. home ──
  {
    const Dr = START.driveway;
    const bpm = 70, b = 60 / bpm;
    pad(chord('D'), Dr + 1.5, 4, { low: 57, g: 0.025, att: 3 });
    const T0 = Dr + 4;
    prog(T0, bpm, THEME_CHORDS, (ch, t, d, bb, i) => {
      arp(ch, t, d, bb, { g: 0.06, low: 57, bassG: 0.08 });
      if (t >= Dr + 15) pad(ch, t, d, { v: 'strings', low: 55, g: 0.035, att: 1.2 });
    });
    mel(T0, bpm, THEME, 'piano', 0.16);
    mel(T0 + 16 * b, bpm, bars(THEME, 4, 9), 'bell', 0.045);
    mel(T0 + 16 * b, bpm, bars(THEME, 4, 9), 'strings', 0.04);
    pad(chord('Dadd9'), T0 + 36 * b, 8, { v: 'strings', low: 55, g: 0.035, att: 0.5, rel: 4 });
    LU(T0 + 36 * b + 1, 90, 0.05, 1);
  }

  // ── X. rockets ──
  {
    const Sc = START.school, St = START.study, Ts = START.teststand;
    let t = Sc + 0.5;
    while (t < St + 1) t = prog(t, 100, [['G', 4], ['A/G', 4]], (ch, tt, d, b) => { if (tt < St + 1) arp(ch, tt, d, b, { v: 'pluck', g: 0.045, low: 62, pat: [0, 1, 2, 1, 2, 3, 2, 1], bass: false, hold: 1.2 }); });
    drums(Sc + 0.5, St + 1, 100, { kickEvery: 2, kick: 0.1, hat: 0.018 });
    let s = St + 0.5;
    while (s < St + 24) s = prog(s, 80, [['Bm', 4], ['G', 4], ['D', 4], ['A', 4]], (ch, tt, d, b) => { if (tt < St + 24) { arp(ch, tt, d, b, { g: 0.045, low: 57, step: 0.25, pat: [0, 1, 2, 3, 2, 1, 2, 1], hold: 1.6, bassG: 0.06 }); pad(ch, tt, d, { low: 50, g: 0.018 }); } });
    for (const [dt, m] of [[1, 'A5'], [5.2, 'B5'], [9.4, 'D6'], [13.6, 'E6'], [17.8, 'F#6']]) n(St + dt, 'bell', m, 2, 0.04);

    for (let tt = Ts + 0.6; tt < Ts + 12.4; tt += 60 / 90) n(tt, 'bass', 'A1', 0.3, 0.09);
    pad(chord('Asus4'), Ts + 0.6, 12, { low: 52, g: 0.022, att: 3, rel: 1 });
    x(Ts + 12.4, 'riser', 0.35, { d: 3.6 });
    for (let tt = Ts + 13; tt < Ts + 16; tt += 0.09) n(tt, 'timp', 'A1', 0.5, 0.05 + 0.1 * ((tt - Ts - 13) / 3));
    n(Ts + 16, 'kick', 36, 0.5, 0.45); x(Ts + 16, 'crash', 0.5);
    pad(chord('D'), Ts + 16, 8, { low: 50, g: 0.05, att: 0.1, rel: 3, bass: true, bassG: 0.08 });
    let u = Ts + 16;
    while (u < Ts + 24) u = prog(u, 110, [['D', 4], ['G', 4], ['D', 4], ['A', 4]], (ch, tt, d, b) => { if (tt < Ts + 24) arp(ch, tt, d, b, { g: 0.05, low: 57, step: 0.25, hold: 1.4 }); });
    mel(Ts + 19.5, 300, [['A5', 1], ['B5', 1], ['C#6', 1], ['D6', 1], ['E6', 1], ['F#6', 3]], 'bell', 0.05);
    prog(Ts + 24, 72, THEME_CHORDS.slice(4), (ch, tt, d, b) => { arp(ch, tt, d, b, { g: 0.05, low: 57 }); pad(ch, tt, d, { v: 'strings', low: 55, g: 0.03 }); });
    mel(Ts + 24, 72, bars(THEME, 4, 9), 'piano', 0.15);
  }

  // ── XI. the job ──
  {
    const Cl = START.cleanroom;
    prog(Cl + 0.5, 60, [['Gmaj7', 4], ['Em9', 4], ['Cmaj7', 4], ['D6', 4], ['Gmaj7', 4], ['Em9', 4]], (ch, t, d, b) => {
      pad(ch, t, d, { low: 55, g: 0.025, att: 2 });
      voice(ch, 74).forEach((m, k) => n(t + k * b, 'bell', m, 1.5, 0.025));
    });

    const Ca = START.cad;
    for (let t = Ca + 1, i = 0; t < Ca + 30.4; t += 0.3, i++) n(t, 'pluck', ['B4', 'D5', 'F#5', 'D5'][i % 4], 0.22, 0.04);
    for (let t = Ca + 1; t < Ca + 30.4; t += 2.4) n(t, 'bass', 'B1', 2.2, 0.08);
    n(Ca + 16, 'drone', 'B1', 14.4, 0.03, { att: 6, rel: 0.2 });
    n(Ca + 16, 'drone', 'F#2', 14.4, 0.02, { att: 6, rel: 0.2 });
    n(Ca + 30.6, 'bell', 'E6', 2.5, 0.06);
    pad(chord('Gmaj7'), Ca + 31, 7, { low: 55, g: 0.03, att: 2, rel: 3 });

    const Re = START.research;
    const b = 60 / 84;
    prog(Re + 1, 84, [['D', 4], ['Bm', 4], ['G', 4], ['A', 4], ['D', 4], ['Bm', 4], ['G', 4]], (ch, t, d) => { pad(ch, t, d, { low: 50, g: 0.022, att: 1 }); n(t, 'piano', bassOf(ch, 38), d, 0.07); });
    for (let t = Re + 1, i = 0; t < Re + 21; t += b / 2, i++) n(t, 'piano', 'A4', b * 0.6, 0.035 + 0.01 * (i % 2 === 0));
  }

  // ── XII. the dream ──
  {
    const Co = START.code;
    const bpm = 90;
    let t = Co + 1;
    while (t < Co + 27) t = prog(t, bpm, [['D', 4], ['Bm', 4], ['G', 4], ['A', 4]], (ch, tt, d, b) => {
      if (tt >= Co + 27) return;
      arp(ch, tt, d, b, { v: 'pluck', g: 0.04, low: 62, step: 0.25, pat: [0, 1, 2, 3, 2, 1, 2, 3], bass: false, hold: 1.2 });
      if (tt >= Co + 9) n(tt, 'bass', bassOf(ch, 38), d * 0.9, 0.1);
      if (tt >= Co + 16) pad(ch, tt, d, { low: 55, g: 0.022 });
    });
    drums(Co + 9, Co + 27, bpm, { kick: 0.16, hat: 0.02 });
    for (const [dt, m] of [[18.2, 'F#6'], [20.3, 'A6'], [23.2, 'D6']]) n(Co + dt, 'bell', m, 2, 0.04);
    prog(Co + 27.6, 66, THEME_CHORDS.slice(0, 4), (ch, tt, d, b) => { arp(ch, tt, d, b, { g: 0.05, low: 57 }); pad(ch, tt, d, { v: 'strings', low: 55, g: 0.025, att: 1.5 }); });
    mel(Co + 27.6, 66, bars(THEME, 0, 4), 'piano', 0.14);
    n(Co + 34.2, 'bell', 'D6', 3, 0.05); n(Co + 34.6, 'bell', 'A6', 3, 0.035);

    const Fa = START.farm;
    const fb = 60 / 64;
    prog(Fa + 2, 64, [['D', 4], ['G/D', 4], ['D', 4], ['A/C#', 4], ['Bm', 4], ['G', 4], ['D/A', 4], ['A', 4]], (ch, tt, d, b) => {
      arp(ch, tt, d, b, { g: 0.05, low: 57, pat: [0, 2, 1, 2, 3, 2, 1, 2], bassG: 0.07 });
      pad(ch, tt, d, { v: 'strings', low: 55, g: 0.03, att: 1.5 });
      n(tt, 'cello', bassOf(ch, 38), d, 0.04, { att: 1, rel: 1.5 });
    });
    mel(Fa + 2, 64, [...bars(THEME, 0, 4), ...bars(THEME, 4, 8)], 'piano', 0.14);
    mel(Fa + 2 + 16 * fb, 64, bars(THEME, 4, 8), 'bell', 0.035, { oct: 1 });
    pad(chord('Dadd9'), Fa + 2 + 32 * fb, 9, { v: 'strings', low: 55, g: 0.035, att: 1, rel: 4 });
    LU(Fa + 2 + 32 * fb + 0.5, 90, 0.045, 1);

    const Lu = START.lookup;
    const lb = 60 / 70;
    pad(chord('Dadd9'), Lu + 2, 4, { low: 57, g: 0.025, att: 2.5, rel: 2 });
    const T0 = Lu + 4;
    prog(T0, 70, THEME_CHORDS, (ch, tt, d, b, i) => {
      arp(ch, tt, d, b, { g: 0.06, low: 57, bassG: 0.08 });
      if (tt >= Lu + 12) pad(ch, tt, d, { v: 'strings', low: 55, g: 0.035, att: 1.5 });
      if (tt >= Lu + 20) pad(ch, tt, d, { low: 62, g: 0.02, att: 1 });
    });
    mel(T0, 70, THEME, 'piano', 0.17);
    mel(T0 + 16 * lb, 70, bars(THEME, 4, 9), 'bell', 0.05);
    mel(T0 + 16 * lb, 70, bars(THEME, 4, 9), 'strings', 0.045);
    const end = T0 + 36 * lb;
    pad(chord('Dadd9'), end, 14, { v: 'strings', low: 50, g: 0.04, att: 0.5, rel: 6, bass: true, bassG: 0.05 });
    pad(chord('Dadd9'), end, 14, { low: 62, g: 0.02, att: 1, rel: 6 });
    LU(end + 0.4, 80, 0.06, 1);
  }

  // ── credits ──
  {
    const Cr = START.credits;
    prog(Cr + 3, 60, THEME_CHORDS, (ch, tt, d, b) => { arp(ch, tt, d, b, { g: 0.045, low: 57, pat: [0, 2, 1, 2, 3, 2, 1, 2], bassG: 0.06 }); pad(ch, tt, d, { low: 50, g: 0.015, att: 2 }); });
    mel(Cr + 3, 60, THEME, 'piano', 0.14);
    prog(Cr + 39, 56, THEME_CHORDS.slice(4, 8), (ch, tt, d, b) => arp(ch, tt, d, b, { g: 0.035, low: 57, pat: [0, 2, 1, 2], bassG: 0.05 }));
    mel(Cr + 39, 56, bars(THEME, 4, 8), 'piano', 0.1);

    const Gu = START.guess;
    n(Gu + 1.6, 'bell', 'A5', 3, 0.04);
    n(Gu + 6.1, 'bell', 'D6', 4, 0.05);
    pad(chord('Dsus2'), Gu + 5.5, 7, { low: 62, g: 0.02, att: 3, rel: 2 });
  }

  // ── after the credits ──
  {
    const Fs = START['future-stand'];
    const bpm = 100;
    let t = Fs + 1;
    while (t < Fs + 34.5) t = prog(t, bpm, [['D', 4], ['A', 4], ['Bm', 4], ['G', 4]], (ch, tt, d, b) => {
      if (tt >= Fs + 34.5) return;
      arp(ch, tt, d, b, { v: 'pluck', g: 0.05, low: 62, pat: [0, 2, 1, 2, 3, 2, 1, 2], bass: false, hold: 1.4 });
      n(tt, 'bass', bassOf(ch, 38), d * 0.9, 0.1);
      if (tt > Fs + 8) pad(ch, tt, d, { low: 55, g: 0.02 });
    });
    drums(Fs + 1, Fs + 34.5, bpm, { kickEvery: 2, kick: 0.15, snare: 0.05, snareV: 'clap', hat: 0.02 });
    mel(Fs + 10.6, bpm, [...bars(THEME, 0, 4), ...bars(THEME, 4, 8)], 'piano', 0.12, { legato: 0.8 });

    const Ff = START['future-fire'];
    for (let tt = Ff + 0.5, i = 0; tt < Ff + 12; tt += 0.3, i++) n(tt, 'bass', 'A1', 0.25, 0.05 + 0.08 * (tt - Ff) / 12);
    pad(chord('Asus4'), Ff + 0.5, 11.5, { v: 'strings', low: 52, g: 0.03, att: 6, rel: 0.2 });
    x(Ff + 8, 'riser', 0.4, { d: 4 });
    for (let tt = Ff + 9; tt < Ff + 12; tt += 0.08) n(tt, 'timp', 'A1', 0.5, 0.035 + 0.07 * ((tt - Ff - 9) / 3));
    n(Ff + 12, 'kick', 36, 0.6, 0.4); x(Ff + 12, 'crash', 0.45); x(Ff + 12, 'boom', 0.45);
    prog(Ff + 12, 80, [['D', 4], ['A', 4], ['Bm', 4], ['G', 3.9]], (ch, tt, d, b) => {
      pad(ch, tt, d, { v: 'strings', low: 50, g: 0.034, att: 0.2, rel: 0.4, bass: true, bassG: 0.07 });
      pad(ch, tt, d, { low: 62, g: 0.018, att: 0.2, rel: 0.4 });
      for (let k = 0; k < 4; k++) n(tt + k * b, 'timp', bassOf(ch, 38), 0.8, 0.08);
    });
    drums(Ff + 12, Ff + 19.9, 80, { kick: 0.18, hat: 0.02 });
    const T1 = Ff + 20.4;
    pad(chord('D'), T1, 4, { v: 'strings', low: 55, g: 0.05, att: 0.05, rel: 2, bass: true });
    prog(T1, 72, THEME_CHORDS.slice(4), (ch, tt, d, b) => { arp(ch, tt, d, b, { g: 0.06, low: 57 }); pad(ch, tt, d, { v: 'strings', low: 55, g: 0.035 }); });
    mel(T1, 72, bars(THEME, 4, 9), 'piano', 0.16);
    mel(T1, 72, bars(THEME, 4, 9), 'bell', 0.04, { oct: 1 });

    const Fg = START['future-stage'];
    let g = Fg + 0.5;
    while (g < Fg + 21.5) g = prog(g, 120, [['G', 4], ['D', 4], ['Em', 4], ['C', 4]], (ch, tt, d, b) => {
      if (tt >= Fg + 21.5) return;
      for (let k = 0; k < 8; k++) n(tt + k * b / 2, 'bass', bassOf(ch, 38), b * 0.4, 0.09);
      arp(ch, tt, d, b, { v: 'pluck', g: 0.04, low: 62, step: 0.5, bass: false, hold: 1 });
      pad(ch, tt, d, { low: 55, g: 0.03, att: 0.1, rel: 0.3 });
    });
    drums(Fg + 0.5, Fg + 21.5, 120, { kick: 0.24, snare: 0.1, snareV: 'clap', hat: 0.03 });

    const Fn = START['future-night'];
    const nb = 60 / 66;
    pad(chord('Dadd9'), Fn + 2, 4, { low: 57, g: 0.025, att: 3, rel: 2 });
    const T0 = Fn + 4;
    prog(T0, 66, THEME_CHORDS, (ch, tt, d, b) => {
      arp(ch, tt, d, b, { g: 0.06, low: 57, bassG: 0.08 });
      if (tt >= Fn + 11) pad(ch, tt, d, { v: 'strings', low: 55, g: tt >= Fn + 26 ? 0.045 : 0.03, att: 1.5 });
    });
    mel(T0, 66, THEME, 'piano', 0.16);
    mel(T0 + 16 * nb, 66, bars(THEME, 4, 9), 'bell', 0.05);
    const end = T0 + 36 * nb;
    pad(chord('Dadd9'), end, 16, { v: 'strings', low: 50, g: 0.04, att: 0.5, rel: 7, bass: true, bassG: 0.05 });
    LU(end + 0.3, 80, 0.06, 1);
    mel(Fn + 42.5, 56, [['A4', 2], ['C#5', 1], ['E5', 1], ['D5', 6]], 'piano', 0.12);
    n(Fn + 49, 'bell', 'A6', 5, 0.04);
  }

  // ── sound effects and ambience from the script ──
  for (const s of TIMELINE) {
    for (const [at, type, p = {}] of s.sfx) X.push({ t: s.start + at, type, g: 1, ...p });
    for (const [type, a, b, g, f] of s.beds) expandBed(type, s.start + a, s.start + b, g, f, X, B, s.start);
  }

  N.sort((a, b) => a.t - b.t);
  X.sort((a, b) => a.t - b.t);
  return { notes: N, sfx: X, beds: B };
}

// Beds made of discrete sounds (a cricket, a bird, a heartbeat, a clock)
// become many events; the rest stay continuous.
function expandBed(type, a, b, g, f, X, B, seedBase) {
  const env = (t) => Math.min(1, (t - a) / Math.max(0.01, f), (b - t) / Math.max(0.01, f));
  const seed = Math.floor(a * 13);
  if (type === 'crickets') {
    // several crickets, each chirping at its own rate
    for (let c = 0; c < 4; c++) {
      const period = 0.7 + hash(c, seed) * 0.6, f0 = 4200 + hash(c, seed + 1) * 900;
      for (let t = a + hash(c, seed + 2) * period; t < b; t += period * (0.9 + hash(Math.floor(t * 10), seed + c) * 0.2)) {
        X.push({ t, type: 'chirp', g: g * env(t) * (0.5 + 0.5 * hash(c, seed + 3)), f: f0 });
      }
    }
  } else if (type === 'birds') {
    for (let t = a + 0.5, i = 0; t < b; t += 0.9 + hash(i, seed) * 2.2, i++) X.push({ t, type: 'bird', g: g * env(t), f: 2400 + hash(i, seed + 1) * 2200, n: 1 + Math.floor(hash(i, seed + 2) * 4) });
  } else if (type === 'heart') {
    for (let t = a; t < b; t += 60 / 64) X.push({ t, type: 'heart', g: g * env(t) });
  } else if (type === 'tick') {
    for (let t = a, i = 0; t < b; t += 1, i++) X.push({ t, type: 'tick', g: g * env(t), hi: i % 2 });
  } else {
    B.push({ type, a, b, g, f });
  }
}

export const SCORE = buildScore();
