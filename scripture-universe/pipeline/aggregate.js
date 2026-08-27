// aggregate.js — stage 6: book↔book rollups (so far zoom never touches verse
// edges), a deterministic force layout for the network view's 1,584 chapter
// nodes, dashboard stats computed from the actual graph (nothing hand-picked),
// and the honest coverage report.

'use strict';
const fs = require('fs');
const path = require('path');
const { BOOKS, CANONS, TYPES } = require('./canon');

const BUILD = path.join(__dirname, 'build');
const CACHE = path.join(__dirname, 'cache');
const jread = f => fs.readFileSync(path.join(BUILD, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse);

// deterministic PRNG (mulberry32)
function rng(seed){ let a = seed >>> 0; return () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function main(){
  const t0 = Date.now();
  const edges = jread('edges.jsonl');
  const meta = JSON.parse(fs.readFileSync(path.join(BUILD,'meta.json'),'utf8'));

  // ---- book pair rollups --------------------------------------------------
  const pairs = new Map();
  for (const e of edges){
    const ba = e.a >> 20, bz = e.z >> 20;
    const key = Math.min(ba,bz) + '_' + Math.max(ba,bz);
    let p = pairs.get(key);
    if (!p) pairs.set(key, p = { a:Math.min(ba,bz), b:Math.max(ba,bz), n:0,
                                 byType:new Array(TYPES.length).fill(0), byConf:[0,0,0,0] });
    p.n++;
    for (let t = 0; t < TYPES.length; t++) if (e.mask & (1<<t)) p.byType[t]++;
    p.byConf[e.conf]++;
  }
  const bookPairs = [...pairs.values()].map(p => ({ ...p,
    internal: BOOKS[p.a].canon === BOOKS[p.b].canon ? 1 : 0 }));

  // ---- chapter graph for the network view ---------------------------------
  const chIndex = new Map();   // "book_ch" -> chapter node index
  const chList = [];
  BOOKS.forEach((bk, bi) => { for (let c = 1; c <= bk.chapters; c++){
    chIndex.set(bi + '_' + c, chList.length); chList.push({ b:bi, c }); } });
  const N = chList.length;
  const chPair = new Map();    // "i_j" -> weight
  const chDeg = new Float64Array(N);
  for (const e of edges){
    const i = chIndex.get((e.a>>20) + '_' + ((e.a>>8)&4095));
    const j = chIndex.get((e.z>>20) + '_' + ((e.z>>8)&4095));
    if (i === undefined || j === undefined || i === j) continue;
    const key = Math.min(i,j) + '_' + Math.max(i,j);
    chPair.set(key, (chPair.get(key) || 0) + 1);
    chDeg[i]++; chDeg[j]++;
  }
  const springs = [...chPair.entries()].map(([k, w]) => {
    const [i, j] = k.split('_').map(Number); return { i, j, w }; });

  // ---- deterministic 3D force layout ---------------------------------------
  // Three dimensions, so the network view can be orbited: the five canons get
  // gravity wells spread over a sphere instead of around a ring, and the graph
  // relaxes into a volume rather than a disc.
  const rand = rng(0x5EED);
  const px = new Float64Array(N), py = new Float64Array(N), pz = new Float64Array(N);
  const cx = new Float64Array(CANONS.length), cy = new Float64Array(CANONS.length),
        cz = new Float64Array(CANONS.length);
  CANONS.forEach((_, ci) => {          // wells on a Fibonacci sphere
    const k = (ci + .5) / CANONS.length;
    const phi = Math.acos(1 - 2*k), th = Math.PI * (1 + Math.sqrt(5)) * ci;
    cx[ci] = Math.cos(th) * Math.sin(phi) * .5;
    cy[ci] = Math.sin(th) * Math.sin(phi) * .5;
    cz[ci] = Math.cos(phi) * .5;
  });
  chList.forEach((ch, i) => {
    const ci = BOOKS[ch.b].canon;
    px[i] = cx[ci] + (rand()-.5)*.4; py[i] = cy[ci] + (rand()-.5)*.4;
    pz[i] = cz[ci] + (rand()-.5)*.4; });

  const ITER = 300, fx = new Float64Array(N), fy = new Float64Array(N), fz = new Float64Array(N);
  for (let it = 0; it < ITER; it++){
    const cool = 1 - it/ITER;
    fx.fill(0); fy.fill(0); fz.fill(0);
    for (let i = 0; i < N; i++)                      // O(N^2) repulsion — fine offline
      for (let j = i+1; j < N; j++){
        let dx = px[i]-px[j], dy = py[i]-py[j], dz = pz[i]-pz[j];
        const d2 = dx*dx + dy*dy + dz*dz + 1e-5;
        const f = .00002 / d2;
        dx *= f; dy *= f; dz *= f;
        fx[i] += dx; fy[i] += dy; fz[i] += dz;
        fx[j] -= dx; fy[j] -= dy; fz[j] -= dz;
      }
    for (const s of springs){                        // weighted attraction
      let dx = px[s.j]-px[s.i], dy = py[s.j]-py[s.i], dz = pz[s.j]-pz[s.i];
      const d = Math.sqrt(dx*dx+dy*dy+dz*dz) + 1e-9;
      const f = Math.min(.05, .004 * Math.log2(1+s.w)) * d;
      dx = dx/d*f; dy = dy/d*f; dz = dz/d*f;
      fx[s.i] += dx; fy[s.i] += dy; fz[s.i] += dz;
      fx[s.j] -= dx; fy[s.j] -= dy; fz[s.j] -= dz;
    }
    for (let i = 0; i < N; i++){                     // canon gravity + integrate
      const ci = BOOKS[chList[i].b].canon;
      fx[i] += (cx[ci]-px[i]) * .02; fy[i] += (cy[ci]-py[i]) * .02;
      fz[i] += (cz[ci]-pz[i]) * .02;
      const cap = .05 * cool + .002;
      px[i] += Math.max(-cap, Math.min(cap, fx[i]));
      py[i] += Math.max(-cap, Math.min(cap, fy[i]));
      pz[i] += Math.max(-cap, Math.min(cap, fz[i]));
    }
  }
  // quantize to u16 on a shared cubic extent, so the cloud is not distorted
  let mn = 1e9, mx = -1e9;
  for (const a of [px, py, pz]) for (let i = 0; i < N; i++){
    mn = Math.min(mn, a[i]); mx = Math.max(mx, a[i]); }
  const q = v => Math.max(0, Math.min(65535, Math.round((v - mn)/(mx - mn)*65535)));
  const layout = new Array(N);
  for (let i = 0; i < N; i++) layout[i] = [ q(px[i]), q(py[i]), q(pz[i]) ];

  fs.writeFileSync(path.join(BUILD,'agg.json'),
    JSON.stringify({ bookPairs, netLayout: layout, netDims: 3 }));

  // ---- dashboard stats (all computed) -------------------------------------
  const byType = new Array(TYPES.length).fill(0), byConf = [0,0,0,0];
  const canonMatrix = CANONS.map(() => new Array(CANONS.length).fill(0));
  const bookDeg = new Float64Array(BOOKS.length);
  const verseDeg = new Map();
  let crossCanon = 0;
  for (const e of edges){
    for (let t = 0; t < TYPES.length; t++) if (e.mask & (1<<t)) byType[t]++;
    byConf[e.conf]++;
    const ca = BOOKS[e.a>>20].canon, cz = BOOKS[e.z>>20].canon;
    canonMatrix[Math.min(ca,cz)][Math.max(ca,cz)]++;
    if (e.cross) crossCanon++;
    bookDeg[e.a>>20]++; bookDeg[e.z>>20]++;
    if (e.a & 255) verseDeg.set(e.a, (verseDeg.get(e.a)||0)+1);
    if (e.z & 255) verseDeg.set(e.z, (verseDeg.get(e.z)||0)+1);
  }
  const topBooks = [...bookDeg.keys()].map(b => ({ b, n: bookDeg[b] }))
    .sort((x,y)=>y.n-x.n).slice(0,20);
  const chDegArr = [...chDeg.keys()].map(i => ({ b:chList[i].b, c:chList[i].c, n:chDeg[i] }))
    .sort((x,y)=>y.n-x.n).slice(0,20);
  const topVerses = [...verseDeg.entries()].map(([v,n]) => ({ v, n }))
    .sort((x,y)=>y.n-x.n).slice(0,20);
  fs.writeFileSync(path.join(BUILD,'stats.json'), JSON.stringify({
    edges: edges.length, crossCanon, byType, byConf, canonMatrix,
    topBooks, topChapters: chDegArr, topVerses }, null, 1));

  // ---- coverage -----------------------------------------------------------
  const pr = JSON.parse(fs.readFileSync(path.join(BUILD,'parse-report.json'),'utf8'));
  const mr = JSON.parse(fs.readFileSync(path.join(BUILD,'match-report.json'),'utf8'));
  const cr = JSON.parse(fs.readFileSync(path.join(BUILD,'classify-report.json'),'utf8'));
  let fetchLog = null;
  try { fetchLog = JSON.parse(fs.readFileSync(path.join(CACHE,'_fetch-log.json'),'utf8')); } catch {}
  fs.writeFileSync(path.join(BUILD,'coverage.json'), JSON.stringify({
    version: 1,
    built: fetchLog ? fetchLog.date : null,
    sources: {
      gospelLibraryFootnotes: {
        what: 'Official footnote cross-references of the Gospel Library edition — reference pairs only; footnote prose, study helps, and chapter headings are not reproduced.',
        chaptersFetched: pr.chaptersParsed, notesCategories: pr.noteCategories,
        crossRefTargets: pr.crossRefTargets, tgTagsAsTopics: pr.tgTags },
      textualAnalysis: {
        what: 'Machine-detected textual parallels between the public-domain texts (never shown as confirmed; the machine cannot know dependency direction).',
        params: mr.params, candidates: mr.seedPairs, kept: mr.kept,
        discarded: { belowThreshold: mr.dropShort, stopPhraseOnly: mr.dropStopOnly,
                     sameChapter: mr.dropSameChapter, frequencyCappedGrams: mr.cappedGrams } },
      curated: {
        what: 'Hand-curated table of famous, well-established relationships, each with a short neutral explanation.',
        rows: cr.curated } },
    skipped: { targetBuckets: pr.targetBuckets, uncategorizedAnchors: pr.uncategorizedAnchors,
               odRefsUnresolved: cr.odRefDropped },
    notIncluded: [
      'OpenBible.info Bible-internal cross-reference dataset (Bible↔Bible official footnotes already cover this layer; possible future merge with CC-BY attribution)',
      'Joseph Smith Translation appendix references',
      'Bible Dictionary and Guide to the Scriptures entries',
      'Topical Guide entries beyond the top-500 by tag count (all tags counted, long tail not shipped)' ],
    totals: { edges: cr.edges, evidenceRecords: cr.withEvidence, topicDerivedTypings: cr.derivedTopic },
  }, null, 1));

  console.log(`bookPairs ${bookPairs.length}, network nodes ${N}, springs ${springs.length}`+
              ` — ${(Date.now()-t0)/1000|0}s`);
}

main();
