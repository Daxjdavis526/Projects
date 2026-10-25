// The score, as a list of events. Pure — the tests import it, and score.js
// plays it live or renders it offline.
//
// A soft pad in D major moves through four chords per scene, darker for the
// black holes; a rising bell figure (A–D–E–F♯–A) marks each chapter; the
// light clocks and the hovering clocks tick at the rates the pictures show;
// and the gravitational-wave chirp plays as the waveform it is.

import { TIMELINE, DURATION } from './script.js';
import { lightClockTicks, hoverTicks, chirpPlays } from './timing.js';

const CHORDS = {
  I: [38, 45, 50, 54, 57],          // D
  Iadd9: [38, 45, 52, 54, 57],
  IVmaj7: [31, 43, 50, 54, 59],     // Gmaj7
  vi7: [35, 47, 50, 54, 57],        // Bm7
  V: [33, 45, 49, 52, 57],          // A
  ii: [40, 47, 52, 55, 59],         // Em
  vi: [35, 42, 47, 50, 54],         // Bm
  IV: [31, 43, 47, 50, 55],         // G
  bVI: [34, 46, 50, 53, 58],        // B♭ (a shadow, for the singularity)
};

const PROGRESSIONS = {
  default: ['I', 'IVmaj7', 'vi7', 'V'],
  calm: ['Iadd9', 'IVmaj7', 'Iadd9', 'V'],
  dark: ['vi', 'ii', 'vi', 'bVI'],
  wonder: ['IV', 'Iadd9', 'vi7', 'V'],
};
const SCENE_MOOD = {
  title: 'calm', newton: 'default', lightclock: 'default', muons: 'wonder', train: 'default', cones: 'wonder',
  elevator: 'default', clocks: 'calm', geodesics: 'wonder', equations: 'calm', blackhole: 'dark',
  waves: 'wonder', cosmos: 'wonder', evidence: 'default', frontiers: 'dark', path: 'calm', end: 'calm',
};

const CHORD_LEN = 12;                 // seconds per chord
export const BELL = [69, 74, 76, 78, 81];

export function buildScore() {
  const ev = [];
  for (const s of TIMELINE) {
    const prog = PROGRESSIONS[SCENE_MOOD[s.id] || 'default'];
    for (let k = 0, t = s.start; t < s.end - 2; k++, t += CHORD_LEN) {
      const t1 = Math.min(t + CHORD_LEN + 3, s.end + 1.5);
      ev.push({ type: 'pad', t0: t, t1, notes: CHORDS[prog[k % prog.length]], gain: s.id === 'title' || s.id === 'end' ? 0.12 : 0.09 });
    }
    if (s.chapter && s.id !== 'end') BELL.forEach((n, i) => ev.push({ type: 'bell', t: s.start + 0.8 + i * 0.32, note: n, gain: 0.07 }));
    if (s.id === 'lightclock') {
      const { rest, moving } = lightClockTicks(s);
      for (const t of rest) ev.push({ type: 'tick', t: s.start + t, freq: 1760, pan: -0.5, gain: 0.16 });
      for (const t of moving) ev.push({ type: 'tick', t: s.start + t, freq: 1175, pan: 0.5, gain: 0.16 });
    }
    if (s.id === 'blackhole') {
      const pans = [0.6, 0.2, -0.2];
      const freqs = [1568, 1175, 880];
      hoverTicks(s).forEach((list, i) => list.forEach((t) => ev.push({ type: 'tick', t: s.start + t, freq: freqs[i], pan: pans[i], gain: 0.14 })));
    }
    if (s.id === 'waves') for (const t of chirpPlays(s)) ev.push({ type: 'chirp', t: s.start + t, gain: 0.55 });
  }
  return ev.sort((a, b) => (a.t ?? a.t0) - (b.t ?? b.t0));
}

export const SCORE = buildScore();
export const endOf = (e) => (e.type === 'pad' ? e.t1 : e.type === 'chirp' ? e.t + 0.3 : e.type === 'bell' ? e.t + 4 : e.t + 0.1);
export { DURATION };
