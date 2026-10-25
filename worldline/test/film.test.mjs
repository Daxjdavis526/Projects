// Headless checks on everything in the film that is logic rather than
// picture: the timeline, the words on screen, the equations, the score, and
// — the important one — that every number in the narration is either a
// sourced fact from src/data.js or listed below with the reason it is safe.
//   node worldline/test/film.test.mjs

import { SCENES, TIMELINE, DURATION, sceneAt, chapters, layout, holdFor } from '../src/script.js';
import { SCORE, endOf } from '../src/music.js';
import { lightClockTicks, hoverTicks, chirpPlays, HOVER } from '../src/timing.js';
import { SCENE_DRAW } from '../src/scenes/index.js';
import { FACTS } from '../src/data.js';
import { gamma } from '../src/physics.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// ─── the timeline ────────────────────────────────────────────────────────
check('scene ids are unique', new Set(SCENES.map((s) => s.id)).size === SCENES.length);
check('every scene has a draw function', SCENES.every((s) => typeof SCENE_DRAW[s.id] === 'function'), SCENES.filter((s) => !SCENE_DRAW[s.id]).map((s) => s.id).join(' '));
for (let i = 1; i < TIMELINE.length; i++) check(`${TIMELINE[i].id} starts where ${TIMELINE[i - 1].id} ends`, Math.abs(TIMELINE[i].start - TIMELINE[i - 1].end) < 1e-9);
check('film runs 15–25 minutes', DURATION > 900 && DURATION < 1500, `${(DURATION / 60).toFixed(1)} min`);
check('every moment has a scene', [-1, 0, DURATION / 3, DURATION - 0.01, DURATION + 5, NaN].every((T) => !!sceneAt(T)));
check('chapters are in order', chapters().every((c, i, a) => !i || c.start > a[i - 1].start));
check('layout() is pure', JSON.stringify(layout()) === JSON.stringify(TIMELINE));

// ─── the words ───────────────────────────────────────────────────────────
for (const s of TIMELINE) {
  const n = s.captions.filter((c) => c[3] === 'n').sort((a, b) => a[0] - b[0]);
  for (const [at, dur, text] of s.captions) check(`${s.id}: "${text.slice(0, 28)}" fits in its scene`, at >= 0 && at + dur <= s.dur - 0.5 + 1e-9, `${at.toFixed(1)}+${dur.toFixed(1)} vs ${s.dur.toFixed(1)}`);
  for (const [, dur, text] of n) check(`${s.id}: "${text.slice(0, 28)}" is up long enough to read`, dur >= holdFor(text) - 1e-9 && dur >= text.length / 15);
  for (let i = 1; i < n.length; i++) check(`${s.id}: captions ${i - 1} and ${i} don't overlap`, n[i][0] >= n[i - 1][0] + n[i - 1][1]);
  check(`${s.id}: first caption clear of the fade-in`, !n.length || n[0][0] >= Math.min(1.5, s.fadeIn));
  check(`${s.id}: captions are plain text (no stray TeX)`, s.captions.every((c) => !/[\\$_^{}]/.test(c[2])));
}

// ─── the equations ───────────────────────────────────────────────────────
for (const s of TIMELINE) {
  for (const e of s.eqs) {
    check(`${s.id}: equation timed inside the scene`, e.t0 >= 0 && e.t1 > e.t0 && e.t1 <= s.dur + 1e-9, `${e.t0}–${e.t1}`);
    check(`${s.id}: equation placed inside the frame`, e.x > 100 && e.x < 1820 && e.y > 60 && e.y < 860);
    check(`${s.id}: equation braces balance`, [...e.tex].reduce((d, ch) => d + (ch === '{') - (ch === '}'), 0) === 0);
  }
}

// ─── the score ───────────────────────────────────────────────────────────
check('score has pads, bells, ticks and the chirp', ['pad', 'bell', 'tick', 'chirp'].every((k) => SCORE.some((e) => e.type === k)));
check('every event is inside the film', SCORE.every((e) => (e.t ?? e.t0) >= 0 && endOf(e) <= DURATION + 4));
check('pad notes are in a sane range', SCORE.filter((e) => e.type === 'pad').every((e) => e.notes.every((m) => m >= 28 && m <= 84)));
{
  const lc = TIMELINE.find((s) => s.id === 'lightclock');
  const { rest, moving } = lightClockTicks(lc);
  const gap = (l) => (l.length > 1 ? l[1] - l[0] : NaN);
  check('the moving clock ticks γ times slower than the rest clock', Math.abs(gap(moving) / gap(rest) - gamma(lc.params.beta)) < 1e-9);
  const lag = (moving[0] - gap(moving) - (rest[0] - gap(rest))) / gap(rest);
  check('the two light clocks start in step', moving.length > 0 && Math.abs(lag - Math.round(lag)) < 1e-6, String(lag));
  const bh = TIMELINE.find((s) => s.id === 'blackhole');
  const hv = hoverTicks(bh);
  check('hovering clocks tick at their GR rates', hv.every((l, i) => l.length < 2 || Math.abs((l[1] - l[0]) * HOVER[i][1] - 1) < 1e-9));
  check('the 1.1 r_s clock ticks least', hv[2].length < hv[1].length && hv[1].length <= hv[0].length);
  const wv = TIMELINE.find((s) => s.id === 'waves');
  check('the chirp plays inside the waves scene, after its caption', chirpPlays(wv).every((t) => t > wv.at[5] && t < wv.at[6]));
}

// ─── every number in the narration ───────────────────────────────────────
// Sourced numbers come from FACTS. The rest are listed here with the reason
// they need no source: dates and counts the guide states, definitions,
// worked-example inputs, and calculations the physics tests check.
const sourced = new Set(), exponents = new Set(['2', '3', '4']);   // c², c⁴, m/s²
(function walk(v) {
  if (typeof v === 'number') {
    sourced.add(String(v)); sourced.add(String(Math.abs(v)));
    const [m, e] = Math.abs(v).toExponential().split('e');
    if (Math.abs(Number(e)) >= 3) { sourced.add(String(Number(m))); exponents.add(String(Math.abs(Number(e)))); }
  } else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
})(FACTS);
const ALLOWED = {
  years: ['1687', '1905', '1907', '1915', '1916', '1963', '1976', '1998', '2005', '2010', '2015', '2017', '2019', '2022', '2025', '2026', '2035'],
  dates: ['14'],                                       // 14 September 2015
  definitions: ['0', '1', '2', '10', '45', '9.8'],     // r = 0, "one tick", "two rules", powers of ten, light at 45°, standard gravity
  inputs: ['60', '0.6', '99', '99.5', '80', '4', '100', '1.1', '1.5', '3', '8'],   // speeds, distances and radii the film chooses
  calculations: ['25.8', '43', '11.6', '26,600', '10.23', '6', '2.6', '300,000', '16', '36', '29', '62', '13.8', '67', '73', '50', '0.19'],
};
const allowed = new Set([...sourced, ...Object.values(ALLOWED).flat()]);
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
for (const s of TIMELINE) {
  for (const [, , text, kind] of s.captions) {
    if (kind !== 'n' && kind !== 'card') continue;
    const plain = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => '^' + [...m].map((c) => SUP[c]).join(''));
    // numbers not glued to a name (M87*, GW150914)
    for (const tok of plain.match(/\^-?\d+|(?<![A-Za-z\d^.-])\d[\d,]*(\.\d+)?/g) || []) {
      const t = tok.replace(/[.,]$/, '');
      let ok;
      if (t.startsWith('^')) ok = exponents.has(t.replace(/^\^-?/, ''));
      else ok = allowed.has(t) || allowed.has(t.replace(/,/g, '')) || allowed.has(String(Number(t.replace(/,/g, ''))));
      check(`${s.id}: "${t}" is sourced or listed`, ok, text.slice(0, 70));
    }
  }
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
