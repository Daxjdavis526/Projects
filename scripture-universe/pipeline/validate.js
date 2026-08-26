// validate.js — stage 8: the accuracy checklist, run against the PACKED data
// (what the app will actually load), not the intermediates. Exits 1 on any
// failure. Finishes by printing the coverage summary.

'use strict';
const fs = require('fs');
const path = require('path');
const { BOOKS, CANON_VERSE_TOTALS, TYPES } = require('./canon');

const DATA = path.join(__dirname, '..', 'data');
const BI = Object.fromEntries(BOOKS.map((b, i) => [b.uri, i]));
const errs = [];
const ok = (cond, msg) => { if (!cond) errs.push(msg); };

function main(){
  const metaJ = JSON.parse(fs.readFileSync(path.join(DATA,'verses-meta.json'),'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA,'manifest.json'),'utf8'));
  const stats = JSON.parse(fs.readFileSync(path.join(DATA,'stats.json'),'utf8'));
  const coverage = JSON.parse(fs.readFileSync(path.join(DATA,'coverage.json'),'utf8'));
  const bin = fs.readFileSync(path.join(DATA,'edges.bin'));

  // ---- rebuild seq mapping exactly as the client will ----------------------
  const vidToSeq = new Map(); let seq = 0;
  metaJ.books.forEach((bk, bi) => { bk.vc.forEach((n, ci) => {
    for (let v = 1; v <= n; v++) vidToSeq.set((bi<<20)|((ci+1)<<8)|v, seq++); }); });
  const V = seq;
  metaJ.books.forEach((bk, bi) => { for (let c = 1; c <= bk.vc.length; c++)
    vidToSeq.set((bi<<20)|(c<<8), seq++); });
  metaJ.books.forEach((bk, bi) => vidToSeq.set(bi<<20, seq++));
  ok(V === manifest.counts.verses, `verse count ${V} != manifest ${manifest.counts.verses}`);

  // canon totals from the packed metadata
  const canonTotals = [0,0,0,0,0];
  metaJ.books.forEach((bk, bi) => {
    if (bi !== metaJ.odBook) canonTotals[bk.c] += bk.vc.reduce((a,x)=>a+x,0); });
  CANON_VERSE_TOTALS.forEach((want, ci) =>
    ok(canonTotals[ci] === want, `canon ${ci} total ${canonTotals[ci]} != ${want}`));

  // ---- decode edges --------------------------------------------------------
  const E = bin.length / 12;
  ok(Number.isInteger(E), 'edges.bin not a multiple of 12 bytes');
  ok(E === manifest.counts.edges, `edge count ${E} != manifest`);
  const src = new Uint16Array(E), dst = new Uint16Array(E), mask = new Uint16Array(E),
        flags = new Uint8Array(E), prov = new Uint8Array(E), ext = new Uint8Array(E),
        evi = new Uint16Array(E);
  for (let i = 0; i < E; i++){
    const o = i*12;
    src[i]=bin.readUInt16LE(o); dst[i]=bin.readUInt16LE(o+2); mask[i]=bin.readUInt16LE(o+4);
    flags[i]=bin.readUInt8(o+6); prov[i]=bin.readUInt8(o+7); ext[i]=bin.readUInt8(o+9);
    evi[i]=bin.readUInt16LE(o+10);
  }
  let prevA=-1, prevZ=-1, maxEv=-1;
  const byType = new Array(TYPES.length).fill(0), byConf=[0,0,0,0];
  const seqCanon = new Uint8Array(seq);
  { let s=0; metaJ.books.forEach(bk => { const n=bk.vc.reduce((a,x)=>a+x,0);
      seqCanon.fill(bk.c, s, s+n); s+=n; });
    metaJ.books.forEach(bk => { seqCanon.fill(bk.c, s, s+bk.vc.length); s+=bk.vc.length; });
    metaJ.books.forEach(bk => { seqCanon[s++]=bk.c; }); }
  let crossCount = 0;
  for (let i = 0; i < E; i++){
    if (src[i] === dst[i]){ errs.push(`self edge at ${i}`); break; }
    if (src[i] > dst[i]){ errs.push(`unordered edge at ${i}`); break; }
    if (mask[i] === 0){ errs.push(`zero typeMask at ${i}`); break; }
    if (src[i] < prevA || (src[i] === prevA && dst[i] < prevZ)){ errs.push(`unsorted at ${i}`); break; }
    prevA=src[i]; prevZ=dst[i];
    const cross = (flags[i]>>4)&1;
    const realCross = seqCanon[src[i]] !== seqCanon[dst[i]] ? 1 : 0;
    if (cross !== realCross){ errs.push(`cross flag wrong at ${i}`); break; }
    crossCount += cross;
    if (evi[i] !== 0xFFFF) maxEv = Math.max(maxEv, evi[i]);
    const conf = flags[i]&3;
    byConf[conf]++;
    for (let t=0;t<TYPES.length;t++) if (mask[i]&(1<<t)) byType[t]++;
    // machine-only edges can never be confirmed
    if (prov[i] === 4 && conf === 0){ errs.push(`ngram-only edge confirmed at ${i}`); break; }
    // ngram-only edges must carry a real run
    if (prov[i] === 4 && ext[i] < 8){ errs.push(`ngram-only edge with extent ${ext[i]} at ${i}`); break; }
  }
  ok(maxEv < manifest.counts.evidence, `evidenceIdx ${maxEv} out of range`);
  if (maxEv >= 0){
    const chunk = JSON.parse(fs.readFileSync(path.join(DATA,'evidence',
      `ev-${String(maxEv>>8).padStart(3,'0')}.json`),'utf8'));
    ok(chunk[maxEv & 255] !== undefined, 'last evidence record unresolvable');
  }
  // stats/coverage honesty
  ok(stats.edges === E, `stats.edges ${stats.edges} != ${E}`);
  ok(stats.crossCanon === crossCount, `stats.crossCanon ${stats.crossCanon} != ${crossCount}`);
  for (let t=0;t<TYPES.length;t++)
    ok(stats.byType[t] === byType[t], `stats.byType[${t}] ${stats.byType[t]} != ${byType[t]}`);
  ok(coverage.totals.edges === E, 'coverage edge total mismatch');

  // ---- known-pair §65 checks ----------------------------------------------
  const pairIdx = new Map();
  for (let i = 0; i < E; i++){
    const k = src[i]*65536 + dst[i];
    pairIdx.set(k, i);
  }
  const S = (uri,c,v) => vidToSeq.get((BI[uri]<<20)|(c<<8)|(v||0));
  function edge(u1,c1,v1,u2,c2,v2){
    const a = S(u1,c1,v1), z = S(u2,c2,v2);
    if (a === undefined || z === undefined) return undefined;
    return pairIdx.get(Math.min(a,z)*65536 + Math.max(a,z));
  }
  const need = (i, label) => ok(i !== undefined, `MISSING known pair: ${label}`);
  let i;
  need(i = edge('ot/isa',53,5,'bofm/mosiah',14,5), 'Isa 53:5 <-> Mosiah 14:5');
  if (i !== undefined){
    ok((prov[i] & 4) !== 0, 'Isa53:5<->Mosiah14:5 lacks ngram evidence');
    ok(ext[i] >= 15, `Isa53:5<->Mosiah14:5 extent ${ext[i]} < 15`);
  }
  need(edge('ot/mal',3,1,'bofm/3-ne',24,1), 'Mal 3:1 <-> 3 Ne 24:1');
  need(edge('ot/gen',1,1,'pgp/moses',2,1), 'Gen 1:1 <-> Moses 2:1');
  need(edge('nt/james',1,5,'pgp/js-h',1,11), 'James 1:5 <-> JS-H 1:11');
  need(edge('nt/matt',5,3,'bofm/3-ne',12,3), 'Matt 5:3 <-> 3 Ne 12:3');
  i = edge('ot/isa',2,2,'bofm/2-ne',12,2);
  need(i, 'Isa 2:2 <-> 2 Ne 12:2');
  if (i !== undefined) ok(ext[i] >= 20, `Isa2:2<->2Ne12:2 extent ${ext[i]} < 20`);
  need(edge('nt/1-cor',15,0,'dc-testament/dc',76,0), '1 Cor 15 <-> D&C 76 (chapter)');
  // Matt 24 <-> JS-M verse-pair count
  { const jsm = BI['pgp/js-m'], mt = BI['nt/matt'];
    let n = 0;
    const inBook = (s, b, c) => { // decode seq back to (book,ch) via linear scan bounds
      return seqBook[s] === b && (c === 0 || seqCh[s] === c); };
    // build seq->book/ch decode tables
    var seqBook = new Uint8Array(seq), seqCh = new Uint16Array(seq);
    { let s=0; metaJ.books.forEach((bk,bi) => { bk.vc.forEach((nv,ci) => {
        for (let v=0;v<nv;v++){ seqBook[s]=bi; seqCh[s]=ci+1; s++; } }); });
      metaJ.books.forEach((bk,bi) => { for(let c=1;c<=bk.vc.length;c++){ seqBook[s]=bi; seqCh[s]=c; s++; } });
      metaJ.books.forEach((bk,bi) => { seqBook[s]=bi; seqCh[s]=0; s++; }); }
    for (let k = 0; k < E; k++){
      const a=src[k], z=dst[k];
      if ((seqBook[a]===mt && seqCh[a]===24 && seqBook[z]===jsm) ||
          (seqBook[z]===mt && seqCh[z]===24 && seqBook[a]===jsm)) n++;
    }
    ok(n >= 20, `Matt 24 <-> JS-M pairs ${n} < 20`);
  }

  // ---- report -------------------------------------------------------------
  if (errs.length){
    console.error('VALIDATION FAILED:\n  ' + errs.join('\n  '));
    process.exit(1);
  }
  console.log('validate: ALL CHECKS PASSED');
  console.log(`edges ${E} (cross-canon ${crossCount}) | verses ${V} | evidence ${manifest.counts.evidence}`);
  console.log('by confidence [confirmed,strong,probable,possible]:', byConf.join(' '));
  console.log('by type:', TYPES.map((t,ti)=>`${t}:${byType[ti]}`).join(' | '));
}

main();
