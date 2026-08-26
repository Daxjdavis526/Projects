// pack.js — stage 7: emit the static data/ files the app ships with.
//
// Node identity on disk is "seq": verses in canonical order (0..V-1), then one
// pseudo-node per chapter, then one per book — everything fits in Uint16. The
// client rebuilds vid<->seq from verses-meta.json verse counts, so no index
// binary is shipped. edges.bin is fixed 12-byte little-endian records sorted
// by (src, dst):
//   u16 src, u16 dst, u16 typeMask,
//   u8 flags (conf(2) | directed<<2 | chapterLevel<<3 | crossCanon<<4 | dirReversed<<5),
//   u8 provMask, u8 weight, u8 extent, u16 evidenceIdx (0xFFFF = none)

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { BOOKS, CANONS, TYPES } = require('./canon');
const { PERSONS } = require('./curated');

const BUILD = path.join(__dirname, 'build');
const DATA = path.join(__dirname, '..', 'data');
const jread = f => fs.readFileSync(path.join(BUILD, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse);

function main(){
  fs.mkdirSync(path.join(DATA, 'text'), { recursive: true });
  fs.mkdirSync(path.join(DATA, 'evidence'), { recursive: true });
  const meta = JSON.parse(fs.readFileSync(path.join(BUILD,'meta.json'),'utf8'));
  const vc = meta.verseCounts;

  // ---- seq assignment -----------------------------------------------------
  const vidToSeq = new Map();
  let seq = 0;
  BOOKS.forEach((bk, bi) => { for (let c = 1; c <= bk.chapters; c++)
    for (let v = 1; v <= vc[bi][c-1]; v++) vidToSeq.set((bi<<20)|(c<<8)|v, seq++); });
  const V = seq;
  BOOKS.forEach((bk, bi) => { for (let c = 1; c <= bk.chapters; c++)
    vidToSeq.set((bi<<20)|(c<<8), seq++); });
  const CH_END = seq;
  BOOKS.forEach((bk, bi) => vidToSeq.set(bi<<20, seq++));
  if (seq > 65535) throw new Error('seq overflow ' + seq);

  // ---- edges.bin + evidence chunks ----------------------------------------
  const edges = jread('edges.jsonl');
  const mapped = edges.map(e => {
    const sa = vidToSeq.get(e.a), sz = vidToSeq.get(e.z);
    if (sa === undefined || sz === undefined) throw new Error('unmapped vid ' + e.a + '/' + e.z);
    const src = Math.min(sa, sz), dst = Math.max(sa, sz);
    let dirRev = 0, directed = 0;
    if (e.dirFrom){ directed = 1; dirRev = vidToSeq.get(e.dirFrom) === dst ? 1 : 0; }
    return { src, dst, e, directed, dirRev };
  }).sort((x, y) => x.src - y.src || x.dst - y.dst);

  const evidence = [];
  const buf = Buffer.alloc(mapped.length * 12);
  mapped.forEach((m, i) => {
    const e = m.e;
    let evIdx = 0xFFFF;
    if (e.ev){ evIdx = evidence.length; evidence.push(e.ev); }
    const flags = e.conf | (m.directed<<2) | (e.chLevel<<3) | (e.cross<<4) | (m.dirRev<<5);
    const o = i * 12;
    buf.writeUInt16LE(m.src, o); buf.writeUInt16LE(m.dst, o+2);
    buf.writeUInt16LE(e.mask, o+4);
    buf.writeUInt8(flags, o+6); buf.writeUInt8(e.prov, o+7);
    buf.writeUInt8(e.w, o+8); buf.writeUInt8(e.ext, o+9);
    buf.writeUInt16LE(evIdx, o+10);
  });
  if (evidence.length >= 0xFFFF) throw new Error('evidence overflow');
  fs.writeFileSync(path.join(DATA,'edges.bin'), buf);
  for (let c = 0; c * 256 < evidence.length; c++)
    fs.writeFileSync(path.join(DATA,'evidence',`ev-${String(c).padStart(3,'0')}.json`),
      JSON.stringify(evidence.slice(c*256, c*256+256)));

  // ---- verses-meta --------------------------------------------------------
  const odIdx = BOOKS.findIndex(b => b.uri === 'dc-testament/od');
  const odNums = [];   // original paragraph numbers per OD chapter, for display
  {
    const byCh = {};
    for (const [k, ord] of Object.entries(meta.odMap)){
      const [ch, orig] = k.split(':').map(Number);
      (byCh[ch] = byCh[ch] || [])[ord-1] = orig;
    }
    for (let c = 1; c <= BOOKS[odIdx].chapters; c++) odNums.push(byCh[c] || []);
  }
  fs.writeFileSync(path.join(DATA,'verses-meta.json'), JSON.stringify({
    canons: CANONS, types: TYPES,
    books: BOOKS.map((b, i) => ({ c: b.canon, s: b.uri.split('/').pop(), n: b.name,
                                  ab: b.abbrevs, vc: vc[i] })),
    odBook: odIdx, odNums }));

  // ---- text chunks --------------------------------------------------------
  const verses = jread('verses.jsonl');
  const textByBook = BOOKS.map(b => Array.from({length:b.chapters}, () => []));
  for (const v of verses) textByBook[v.b][v.c-1][v.v-1] = v.t;
  const chapMeta = jread('chapters.jsonl');
  const headByBook = BOOKS.map(b => Array.from({length:b.chapters}, () => null));
  for (const m of chapMeta)
    if (m.summary || m.intro) headByBook[m.b][m.c-1] = { s: m.summary, i: m.intro };
  BOOKS.forEach((bk, bi) => {
    const f = `${String(bi).padStart(2,'0')}-${bk.uri.split('/').pop()}.json`;
    fs.writeFileSync(path.join(DATA,'text',f),
      JSON.stringify({ b: bi, chapters: textByBook[bi], heads: headByBook[bi] }));
  });

  // ---- topics + persons ---------------------------------------------------
  const tally = new Map();
  for (const t of jread('topics.jsonl')){
    let e = tally.get(t.topic);
    if (!e) tally.set(t.topic, e = []);
    e.push((t.b<<20)|(t.c<<8)|t.v);
  }
  const top = [...tally.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,500);
  const topicsOut = top.map(([slug, posts]) => {
    posts = [...new Set(posts)].sort((a,b)=>a-b);
    const deltas = posts.map((v,i)=> i ? v - posts[i-1] : v);
    return { slug, n: posts.length, p: deltas };
  });
  fs.writeFileSync(path.join(DATA,'topics.json'),
    JSON.stringify({ totalSlugs: tally.size, top: topicsOut }));

  // persons: TG-slug substring matches + verses whose text names them
  const tokCache = verses.map(v => v.t.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/));
  const persons = PERSONS.map(p => {
    const posts = new Set();
    for (const [slug, hits] of tally)
      if (p.tg.some(t => slug.includes(t))) hits.forEach(v => posts.add(v));
    verses.forEach((v, i) => {
      const toks = tokCache[i];
      let hit = p.tokens.some(t => toks.includes(t));
      if (!hit && p.bigrams) hit = p.bigrams.some(([a,b]) => {
        const j = toks.indexOf(a); return j >= 0 && toks[j+1] === b; });
      if (hit) posts.add((v.b<<20)|(v.c<<8)|v.v);
    });
    if (!posts.size) console.warn(`person with empty postings: ${p.name}`);
    const arr = [...posts].sort((a,b)=>a-b);
    return { name: p.name, n: arr.length, p: arr.map((v,i)=> i ? v - arr[i-1] : v) };
  });
  fs.writeFileSync(path.join(DATA,'persons.json'), JSON.stringify(persons));

  // ---- agg / stats / coverage ---------------------------------------------
  for (const f of ['agg.json','stats.json','coverage.json'])
    fs.copyFileSync(path.join(BUILD,f), path.join(DATA,f));

  // ---- manifest -----------------------------------------------------------
  const files = {};
  const walk = dir => { for (const f of fs.readdirSync(dir)){
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()){ walk(p); continue; }
    const rel = path.relative(DATA, p).replace(/\\/g,'/');
    if (rel === 'manifest.json') continue;
    const b = fs.readFileSync(p);
    files[rel] = { bytes: b.length, sha1: crypto.createHash('sha1').update(b).digest('hex').slice(0,12) };
  } };
  walk(DATA);
  const coverage = JSON.parse(fs.readFileSync(path.join(DATA,'coverage.json'),'utf8'));
  fs.writeFileSync(path.join(DATA,'manifest.json'), JSON.stringify({
    version: 1, built: coverage.built,
    counts: { verses: V, chapterNodes: CH_END - V, bookNodes: seq - CH_END,
              edges: mapped.length, evidence: evidence.length },
    files }, null, 1));

  const totalBytes = Object.values(files).reduce((a,f)=>a+f.bytes,0);
  console.log(`packed: ${mapped.length} edges (${(buf.length/1024).toFixed(0)} KB bin),`+
              ` ${evidence.length} evidence records, ${V} verse nodes, data total ${(totalBytes/1048576).toFixed(1)} MB`);
}

main();
