// match.js — stage 3: machine-detected textual parallels.
//
// Method: normalize every verse to a token stream, index all 5-grams
// (Rabin-Karp style — here a plain joined-token key, which is exact and fast
// enough at this corpus size), pair up verses that share a 5-gram, and grow
// each shared seed along its diagonal into a maximal run. A run's *effective*
// length is its matched-token count minus tokens covered by scriptural stock
// formulae ("and it came to pass" …), so common idiom can contribute to a
// longer quotation but can never create an edge by itself.
//
// The machine cannot know which text depends on which, so matches are typed
// "close textual parallel" (+ "shared phrase" for short ones), never "direct
// quotation", and are capped below "confirmed" confidence.
//
// Emits build/matches.jsonl {a:{b,c,v}, z:{b,c,v}, eff, raw, conf, q}
// and build/match-report.json with parameters + discard counts.

'use strict';
const fs = require('fs');
const path = require('path');
const { BOOKS } = require('./canon');

const BUILD = path.join(__dirname, 'build');
const N = 5;                    // gram size
const FREQ_CAP = 200;           // grams more common than this can't seed
const GAP = 3;                  // tokens of mismatch bridged inside a run
const MIN_EFF_CROSS = 8;        // min effective length, cross-canon
const MIN_EFF_INTRA = 12;       // …intra-canon (synoptics/Chronicles stay sane)

const ARCHAIC = { shew:'show', shewed:'showed', sheweth:'showeth', shewn:'shown',
  sion:'zion', subtil:'subtle', throughly:'thoroughly', holpen:'helped',
  astonied:'astonished', ensample:'example', ensamples:'examples', musick:'music',
  vail:'veil', morter:'mortar', cloke:'cloak', shamefacedness:'shamefastness' };

const STOP_PHRASES = [
  'and it came to pass', 'and now it came to pass', 'and it shall come to pass',
  'for it shall come to pass', 'verily i say unto you', 'verily verily i say unto you',
  'thus saith the lord', 'saith the lord of hosts', 'saith the lord god',
  'and the lord said unto', 'the word of the lord came', 'hearken o ye people',
  'o house of israel', 'the house of israel', 'the children of israel',
  'the kingdom of heaven', 'the kingdom of god', 'in the name of jesus christ',
  'i say unto you', 'the son of man', 'the holy ghost', 'the spirit of the lord',
  'with all your heart', 'unto the ends of the earth', 'signs and wonders',
  'it came to pass that', 'behold i say unto you', 'yea even', 'and they shall',
].map(p => p.split(' '));

function normalize(text){
  const toks = text.toLowerCase().normalize('NFC')
    .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
    .replace(/[—–]/g, ' ')
    .replace(/[^a-z0-9\s']/g, ' ').replace(/'/g, '')
    .split(/\s+/).filter(Boolean);
  return toks.map(t => ARCHAIC[t] || t);
}

function stopMask(toks){
  const mask = new Uint8Array(toks.length);
  for (const ph of STOP_PHRASES){
    outer: for (let i = 0; i + ph.length <= toks.length; i++){
      for (let k = 0; k < ph.length; k++) if (toks[i+k] !== ph[k]) continue outer;
      for (let k = 0; k < ph.length; k++) mask[i+k] = 1;
    }
  }
  return mask;
}

function main(){
  const t0 = Date.now();
  const verses = fs.readFileSync(path.join(BUILD,'verses.jsonl'),'utf8')
    .split('\n').filter(Boolean).map(JSON.parse);
  const toks = verses.map(v => normalize(v.t));
  const masks = toks.map(stopMask);
  const canonOf = vi => BOOKS[verses[vi].b].canon;

  // ---- 5-gram index ----
  const index = new Map();
  for (let vi = 0; vi < toks.length; vi++){
    const t = toks[vi];
    for (let p = 0; p + N <= t.length; p++){
      const key = t[p]+' '+t[p+1]+' '+t[p+2]+' '+t[p+3]+' '+t[p+4];
      let arr = index.get(key);
      if (arr === null) continue;              // frequency-capped
      if (!arr){ index.set(key, arr = []); }
      if (arr.length >= FREQ_CAP){ index.set(key, null); continue; }
      arr.push(vi * 4096 + p);                 // token positions < 4096 everywhere
    }
  }

  // ---- seed pairs bucketed by (verseA, verseB, diagonal) ----
  const report = { params:{ N, FREQ_CAP, GAP, MIN_EFF_CROSS, MIN_EFF_INTRA,
                            stopPhrases: STOP_PHRASES.length, archaicMap: Object.keys(ARCHAIC).length },
                   grams: index.size, cappedGrams: 0, seedPairs: 0,
                   dropSameChapter: 0, dropShort: 0, dropStopOnly: 0, kept: 0 };
  const pairSeeds = new Map();   // "va:vb:diag" -> array of posA
  for (const [, arr] of index){
    if (arr === null){ report.cappedGrams++; continue; }
    if (!arr || arr.length < 2) continue;
    for (let i = 0; i < arr.length; i++){
      const va = arr[i] >> 12, pa = arr[i] & 4095;
      for (let j = i + 1; j < arr.length; j++){
        const vb = arr[j] >> 12, pb = arr[j] & 4095;
        if (va === vb) continue;
        const A = verses[va], B = verses[vb];
        if (A.b === B.b && A.c === B.c){ report.dropSameChapter++; continue; }
        report.seedPairs++;
        const key = va + ':' + vb + ':' + (pa - pb);
        let s = pairSeeds.get(key);
        if (!s) pairSeeds.set(key, s = []);
        s.push(pa);
      }
    }
  }

  // ---- grow seeds into runs, score, keep best run per verse pair ----
  const best = new Map();        // "va:vb" -> {eff, raw, aStart, aEnd, va, vb}
  for (const [key, posList] of pairSeeds){
    const [vaS, vbS] = key.split(':');
    const va = +vaS, vb = +vbS;
    posList.sort((x, y) => x - y);
    // merge seed intervals [p, p+N) with gaps <= GAP into runs
    let runs = [], cs = posList[0], ce = posList[0] + N;
    for (let i = 1; i < posList.length; i++){
      const p = posList[i];
      if (p <= ce + GAP) ce = Math.max(ce, p + N);
      else { runs.push([cs, ce]); cs = p; ce = p + N; }
    }
    runs.push([cs, ce]);
    for (const [s, e] of runs){
      const raw = e - s;
      let stop = 0;
      const mask = masks[va];
      for (let p = s; p < e && p < mask.length; p++) if (mask[p]) stop++;
      const eff = raw - stop;
      const cross = canonOf(va) !== canonOf(vb);
      const min = cross ? MIN_EFF_CROSS : MIN_EFF_INTRA;
      if (eff < min){ (eff <= 0 ? report.dropStopOnly++ : report.dropShort++); continue; }
      const bkey = va + ':' + vb;
      const prev = best.get(bkey);
      if (!prev || eff > prev.eff) best.set(bkey, { va, vb, eff, raw, s, e });
    }
  }

  // ---- emit ----
  const out = [];
  for (const r of best.values()){
    const A = verses[r.va], B = verses[r.vb];
    const conf = r.eff >= 25 ? 1 : r.eff >= 15 ? 2 : 3;   // strong / probable / possible
    const q = toks[r.va].slice(r.s, Math.min(r.e, r.s + 14)).join(' ');
    out.push({ a:{ b:A.b, c:A.c, v:A.v }, z:{ b:B.b, c:B.c, v:B.v },
               eff:r.eff, raw:r.raw, conf, q });
  }
  report.kept = out.length;
  fs.writeFileSync(path.join(BUILD,'matches.jsonl'), out.map(r=>JSON.stringify(r)).join('\n')+'\n');
  fs.writeFileSync(path.join(BUILD,'match-report.json'), JSON.stringify(report, null, 1));
  console.log(`matches kept ${out.length} (seeds ${report.seedPairs}, dropped short ${report.dropShort},`+
              ` stop-only ${report.dropStopOnly}, same-chapter ${report.dropSameChapter})`+
              ` in ${((Date.now()-t0)/1000).toFixed(1)}s`);

  // quick self-checks (informational here; validate.js enforces)
  const find = (b1,c1,v1,b2,c2,v2) => out.find(r =>
    (r.a.b===b1&&r.a.c===c1&&r.a.v===v1&&r.z.b===b2&&r.z.c===c2&&r.z.v===v2) ||
    (r.a.b===b2&&r.a.c===c2&&r.a.v===v2&&r.z.b===b1&&r.z.c===c1&&r.z.v===v1));
  const bi = uri => BOOKS.findIndex(b => b.uri === uri);
  const isaMosiah = find(bi('ot/isa'),53,5, bi('bofm/mosiah'),14,5);
  console.log('Isa 53:5 <-> Mosiah 14:5:', isaMosiah ? `eff ${isaMosiah.eff}` : 'MISSING');
  const jsm = out.filter(r =>
    (r.a.b===bi('nt/matt')&&r.a.c===24&&r.z.b===bi('pgp/js-m')) ||
    (r.z.b===bi('nt/matt')&&r.z.c===24&&r.a.b===bi('pgp/js-m')));
  console.log('Matt 24 <-> JS-M verse pairs:', jsm.length);
}

main();
