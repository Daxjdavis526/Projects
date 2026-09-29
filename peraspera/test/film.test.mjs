// Headless checks on everything in the film that is logic rather than
// picture: the timeline, the words on screen, the score, and the numbers the
// film claims are real.   node peraspera/test/film.test.mjs

import { SCENES, TIMELINE, DURATION, activeAt, chapters, layout, CREDITS } from '../src/script.js';
import { SCORE, THEME, THEME_MINOR, LOOKUP, chord, voice } from '../src/music.js';
import { C6, C6_BURN, thrustC6, impulse, ENGINE, massFlow, G0, pcPredicted, pcMeasured } from '../src/data.js';
import { note, hash, keys, clamp } from '../src/kit.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// ─── the timeline ────────────────────────────────────────────────────────
check('scene ids are unique', new Set(SCENES.map((s) => s.id)).size === SCENES.length);
check('film is long enough to tell the story (> 12 min)', DURATION > 720, `${DURATION.toFixed(0)} s`);
for (let i = 1; i < TIMELINE.length; i++) {
  const a = TIMELINE[i - 1], b = TIMELINE[i];
  check(`${b.id} starts where ${a.id} ends (less any dissolve)`, Math.abs(b.start - (a.end - b.xin)) < 1e-9);
  check(`${b.id} dissolve is shorter than both scenes`, b.xin < Math.min(a.dur, b.dur));
}
for (let T = 0; T < DURATION; T += 0.25) {
  const on = activeAt(T);
  if (on.length < 1 || on.length > 2) { check(`something on screen at ${T}`, false, `${on.length} scenes`); break; }
}
check('every moment has a scene', [0, DURATION / 2, DURATION - 0.01].every((T) => activeAt(T).length >= 1));
check('a clock a hair before zero, past the end, or NaN still finds a scene', [-0.08, DURATION + 3, NaN].every((T) => activeAt(T).length >= 1));
check('chapters are in order', chapters().every((c, i, a) => !i || c.start > a[i - 1].start));
check('layout() is pure', JSON.stringify(layout()) === JSON.stringify(TIMELINE));

// ─── the words ───────────────────────────────────────────────────────────
for (const s of SCENES) {
  const lower = s.captions.filter((c) => c[3] === 'n' || c[3] === 'q').sort((a, b) => a[0] - b[0]);
  for (const [at, dur, text, kind] of s.captions) {
    check(`${s.id}: "${text.slice(0, 24)}" fits inside its scene`, at >= 0 && at + dur <= s.dur + 1e-9, `${at}+${dur} > ${s.dur}`);
    if (kind === 'n' || kind === 'q') {
      // at most ~15 characters a second, and never flashed
      const need = Math.max(2.8, text.length / 15);
      check(`${s.id}: "${text.slice(0, 24)}" is on screen long enough to read`, dur >= need - 0.35, `${dur}s for ${text.length} chars`);
      check(`${s.id}: "${text.slice(0, 24)}" is clear of the fade`, at >= (s.xin ? s.xin * 0.5 : s.fadeIn * 0.4) && at + dur <= s.dur - (s.fadeOut || 0) * 0.3);
    }
    check(`${s.id}: caption kind '${kind}' is known`, ['n', 'q', 'place', 'title', 'card', 'count'].includes(kind));
  }
  for (let i = 1; i < lower.length; i++) check(`${s.id}: lower-third captions don't overlap`, lower[i][0] >= lower[i - 1][0] + lower[i - 1][1] - 1e-9, `${lower[i - 1][2]} / ${lower[i][2]}`);
  for (const c of s.captions) if (c[3] === 'q') check(`${s.id}: dialogue names its speaker`, typeof c[4] === 'string' && c[4].length > 0);
}
const words = SCENES.flatMap((s) => s.captions.map((c) => c[2])).join(' ');
check('the brother’s line is in the film word for word',
  words.includes('For someone who tells people to pursue their dreams so much') && words.includes('you sure aren’t doing it yourself'));
check('the credits end by pointing at the post-credits scene', CREDITS[CREDITS.length - 1][1].includes('one more scene'));

// ─── the score ───────────────────────────────────────────────────────────
const { notes, sfx, beds } = SCORE;
check('the score has notes', notes.length > 2000, `${notes.length}`);
check('notes are sorted', notes.every((n, i) => !i || n.t >= notes[i - 1].t));
check('sound effects are sorted', sfx.every((n, i) => !i || n.t >= sfx[i - 1].t));
check('every note is inside the film', notes.every((n) => n.t >= 0 && n.t < DURATION + 1));
check('every effect is inside the film', sfx.every((n) => n.t >= 0 && n.t < DURATION + 1));
check('notes have sane pitch, length and level', notes.every((n) => Number.isInteger(n.m) && n.m >= 18 && n.m <= 100 && n.d > 0 && n.g > 0 && n.g <= 0.6),
  JSON.stringify(notes.find((n) => !(Number.isInteger(n.m) && n.m >= 18 && n.m <= 100 && n.d > 0 && n.g > 0 && n.g <= 0.6))));
const VOICES = ['piano', 'pad', 'strings', 'cello', 'drone', 'bell', 'pluck', 'bass', 'kick', 'snare', 'clap', 'hat', 'timp'];
check('every note is for an instrument the player has', notes.every((n) => VOICES.includes(n.v)), [...new Set(notes.map((n) => n.v))].join(','));
const EFFECTS = ['chirp', 'bird', 'heart', 'tick', 'shooting', 'page', 'step', 'blinds', 'bus', 'knock', 'door', 'doorclose', 'plane', 'weld', 'grind', 'slowmo', 'boom', 'crash', 'riser', 'race', 'cheer', 'flash', 'clank', 'clap', 'idle', 'rep', 'type', 'click', 'cardoor', 'carstart', 'carleave', 'carstop', 'slam', 'drone', 'phone', 'chalk', 'beep', 'estes', 'whoop', 'hotfire', 'launch'];
check('every effect is one the player can make', sfx.every((x) => EFFECTS.includes(x.type)), [...new Set(sfx.map((x) => x.type))].filter((t) => !EFFECTS.includes(t)).join(','));
check('beds are all known kinds', beds.every((b) => ['rain', 'wind', 'room', 'shop', 'crowd', 'city', 'heat', 'road', 'fluoro'].includes(b.type)));
check('beds fade in and out inside their span', beds.every((b) => b.b > b.a && b.f * 2 <= b.b - b.a + 1e-9), JSON.stringify(beds.find((b) => !(b.b > b.a && b.f * 2 <= b.b - b.a))));
// the theme is in D major, the summer's version in D minor with a raised leading tone
const scale = (root, ints) => new Set(ints.map((i) => (root + i) % 12));
const Dmaj = scale(2, [0, 2, 4, 5, 7, 9, 11]), Dmin = scale(2, [0, 2, 3, 5, 7, 8, 10, 11]);
check('the theme is diatonic to D major', THEME.every(([n]) => Dmaj.has(note(n) % 12)));
check('the minor theme is D minor (harmonic)', THEME_MINOR.every(([n]) => Dmin.has(note(n) % 12)));
check('the theme is nine bars long', THEME.reduce((s, [, b]) => s + b, 0) === 36);
check('the look-up figure rises', LOOKUP.every(([n], i) => !i || note(n) > note(LOOKUP[i - 1][0])));
check('chords parse and voice', voice(chord('A/C#'), 50).join() === '57,61,64' && chord('A/C#').bass === 1 && voice(chord('Dadd9'), 50).join() === '50,54,57,64');
// the film should never go silent by accident: some sound in every 20 s window
for (let T = 0; T < DURATION - 20; T += 10) {
  const any = notes.some((n) => n.t >= T && n.t < T + 20) || sfx.some((x) => x.t >= T && x.t < T + 20) || beds.some((b) => b.a < T + 20 && b.b > T);
  check(`sound somewhere in ${T}..${T + 20}s`, any);
}
// sound effects land in their own scene
for (const s of TIMELINE) for (const [at, type] of s.sfx) check(`${s.id}: ${type} at ${at}s is inside the scene`, at >= 0 && at < s.dur);

// ─── numbers the film says are real ─────────────────────────────────────
check('C6 curve is ordered in time', C6.every((p, i) => !i || p[0] > C6[i - 1][0]));
check('C6 burn time is 1.86 s', Math.abs(C6_BURN - 1.86) < 1e-9 && C6[C6.length - 1][0] === C6_BURN);
check('C6 peak thrust is ~14 N', Math.abs(Math.max(...C6.map((p) => p[1])) - 14.09) < 0.01);
const I = impulse();
check('C6 total impulse is a C-class motor (5–10 N·s)', I > 5 && I <= 10, `${I.toFixed(2)} N·s`);
check('the on-screen label says 8.8 N·s', Math.abs(I - 8.8) < 0.05, I.toFixed(3));
check('thrust is zero outside the burn', thrustC6(-0.1) === 0 && thrustC6(2) === 0 && thrustC6(0.192) > 14);
const mdot = massFlow();
check('engine: F = mdot·Isp·g0 holds', Math.abs(mdot * ENGINE.isp_sl * G0 - ENGINE.thrust_kN * 1000) < 1e-6);
check('engine: ~1000 lbf', Math.abs(ENGINE.thrust_kN * 1000 / 4.448 - 1000) < 20);
check('engine: plausible sea-level Isp for methalox (230–300 s)', ENGINE.isp_sl > 230 && ENGINE.isp_sl < 300);
let worst = 0;
for (let t = 0.5; t < 5.5; t += 0.01) worst = Math.max(worst, Math.abs(pcMeasured(t) - pcPredicted(t)) / pcPredicted(t));
check('post-credits: the "test" really is within the 1.5% the screen claims, at steady state', worst < 0.05, `${(worst * 100).toFixed(1)}%`);
let steady = 0, n = 0;
for (let t = 1.5; t < 5.5; t += 0.01) { steady += (pcMeasured(t) - pcPredicted(t)) / pcPredicted(t); n++; }
check('post-credits: mean error within 1.5%', Math.abs(steady / n) < 0.015, `${(100 * steady / n).toFixed(2)}%`);

// ─── the kit ─────────────────────────────────────────────────────────────
check('hash is deterministic and in [0,1)', hash(5, 3) === hash(5, 3) && [...Array(1000)].every((_, i) => { const h = hash(i, 7); return h >= 0 && h < 1; }));
check('keys interpolates', keys(0.5, [[0, 0], [1, 10]], (k) => k) === 5 && keys(2, [[0, 0], [1, 10]]) === 10);
check('note names', note('A4') === 69 && note('C#5') === 73 && note('Bb3') === 58);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
