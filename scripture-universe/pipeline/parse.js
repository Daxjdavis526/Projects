// parse.js — stage 2: turn the raw chapter cache into clean verse text,
// official footnote cross-references, and Topical Guide topic tags.
//
// Emits (all under build/):
//   verses.jsonl    {b, c, v, t}                    one row per verse
//   refs.jsonl      {sb,sc,sv, m, tb,tc,tv, ext, pr} one row per footnote target
//   topics.jsonl    {b, c, v, topic}                 TG tags (tags, never edges)
//   chapters.jsonl  {b, c, summary?, intro?}         synopses + D&C headings
//   meta.json       per-book per-chapter verse counts (derived, then validated)
//   parse-report.json  every skipped bucket, counted — nothing dropped silently
//
// Validation is hard: canon verse totals, PGP book totals, spot checks, and
// the OD paragraph sanity range must all pass or the stage exits 1.

'use strict';
const fs = require('fs');
const path = require('path');
const { BOOKS, CANON_VERSE_TOTALS, OD_PARA_RANGE, CHAPTER_TOTAL,
        SPOT_CHECKS, PGP_BOOK_TOTALS, chapterList } = require('./canon');

const CACHE = path.join(__dirname, 'cache');
const BUILD = path.join(__dirname, 'build');

// ---------- tiny html helpers (the corpus is machine-generated and regular —
// a real parser buys nothing here) ----------------------------------------
const NAMED = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' };
function decodeEnt(s){
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(parseInt(e[1] === 'x' ? e.slice(2) : e.slice(1), e[1] === 'x' ? 16 : 10));
    return NAMED[e] !== undefined ? NAMED[e] : m;
  });
}
function cleanText(html){
  return decodeEnt(html
    .replace(/<span class="verse-number">[\s\S]*?<\/span>/g, '')
    .replace(/<sup class="marker">[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

// book lookup by uri path ("ot/gen", "dc-testament/dc", ...)
const BOOK_BY_URI = new Map(BOOKS.map((b, i) => [b.uri, i]));

// ---------- footnote reference target parser -------------------------------
// Returns {kind:'ref', tb, tc, tv, ext} | {kind:'chapter', tb, tc} | {kind:<bucket>}
function parseTargets(href){
  const h = decodeEnt(href).replace(/^https?:\/\/[^/]+/, '');
  let m = h.match(/^\/study\/scriptures\/tg\/([a-z0-9-]+)/);
  if (m) return [{ kind:'tg', topic:m[1] }];
  m = h.match(/^\/study\/scriptures\/(gs|bd|jst)\//);
  if (m) return [{ kind:m[1] }];
  m = h.match(/^\/study\/scriptures\/(ot|nt|bofm|dc-testament|pgp)\/([a-z0-9-]+)(?:\/(\d+))?(?:\?([^#]*))?/);
  if (!m) return [{ kind:'nonscripture' }];
  const uri = (m[1] === 'dc-testament' ? 'dc-testament' : m[1]) + '/' + m[2];
  const tb = BOOK_BY_URI.get(uri);
  if (tb === undefined) return [{ kind:'other-scripture' }];   // intro pages, facsimiles, title pages
  let tc = m[3] ? +m[3] : 0;
  if (!tc && BOOKS[tb].chapters === 1) tc = 1;                 // "Obad. 1:5"-style hrefs omit /1
  if (!tc) return [{ kind:'book-only' }];
  const q = m[4] || '';
  const idm = q.match(/(?:^|&)id=([^&]*)/);
  if (!idm) return [{ kind:'ref', tb, tc, tv:0, ext:0 }];      // whole chapter
  const out = [];
  for (const tok of decodeURIComponent(idm[1]).split(',')){
    const r = tok.trim().match(/^p(\d+)(?:-p?(\d+))?$/);
    if (!r){ out.push({ kind:'bad-id' }); continue; }
    const v1 = +r[1], v2 = r[2] ? +r[2] : v1;
    out.push({ kind:'ref', tb, tc, tv:v1, ext:Math.max(0, v2 - v1) });
  }
  return out;
}

// ---------- main -----------------------------------------------------------
function main(){
  fs.mkdirSync(BUILD, { recursive: true });
  const chapters = chapterList();
  const missing = chapters.filter(c => !fs.existsSync(path.join(CACHE, c.cacheName)));
  if (missing.length){
    console.error(`missing ${missing.length} cached chapters, e.g. ${missing.slice(0,5).map(c=>c.uri).join(' ')}`);
    process.exit(1);
  }

  const verses = [], refs = [], topics = [], chapMeta = [], odMap = {};
  const report = { noteCategories:{}, targetBuckets:{}, oddNoteKeys:0, uncategorizedAnchors:0,
                   crossRefTargets:0, tgTags:0, chaptersParsed:0 };
  const verseCounts = BOOKS.map(b => new Array(b.chapters).fill(0));

  for (const c of chapters){
    const d = JSON.parse(fs.readFileSync(path.join(CACHE, c.cacheName), 'utf8'));
    let body = d.content.body;
    const bk = BOOKS[c.book];
    const isOD = bk.uri === 'dc-testament/od';

    // chapter metadata from the header, then drop the header
    const meta = { b: c.book, c: c.ch };
    const hdr = body.match(/<header[\s\S]*?<\/header>/);
    if (hdr){
      const sum = hdr[0].match(/<p class="study-summary"[^>]*>([\s\S]*?)<\/p>/);
      const intro = hdr[0].match(/<p class="study-intro"[^>]*>([\s\S]*?)<\/p>/);
      if (sum) meta.summary = cleanText(sum[1]);
      if (intro) meta.intro = cleanText(intro[1]);
      body = body.replace(hdr[0], '');
    }
    chapMeta.push(meta);

    // verses
    if (isOD){
      // prose paragraphs — every <p id="pN"> outside the header becomes a
      // node, renumbered ordinally (original ids can have gaps once the
      // header is stripped); odMap lets refs targeting original ids resolve
      const re = /<p\b[^>]*\bid="p(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
      let m, ord = 0; while ((m = re.exec(body))){
        const t = cleanText(m[2]);
        if (!t) continue;
        verses.push({ b:c.book, c:c.ch, v:++ord, ov:+m[1], t });
        odMap[c.ch + ':' + m[1]] = ord;
        verseCounts[c.book][c.ch-1]++;
      }
    } else {
      const re = /<p\b[^>]*class="verse[" ][^>]*>([\s\S]*?)<\/p>/g;
      let m; while ((m = re.exec(body))){
        const idm = m[0].match(/\bid="p(\d+)"/);
        if (!idm) continue;
        verses.push({ b:c.book, c:c.ch, v:+idm[1], t: cleanText(m[1]) });
        verseCounts[c.book][c.ch-1]++;
      }
    }

    // footnotes
    const fn = d.content.footnotes || {};
    for (const key of Object.keys(fn)){
      const km = key.match(/^note(\d+)_(\w+)$/);
      if (!km){ report.oddNoteKeys++; continue; }
      const sv = +km[1], marker = km[2];
      const text = fn[key].text || '';
      // Category spans are siblings; rather than trusting non-greedy matching
      // across possible nested markup, segment the note at each category-span
      // opening — everything up to the next opening belongs to that category.
      const opens = [...text.matchAll(/<span data-note-category="([^"]+)">/g)];
      const segs = opens.map((o, i) => ({
        cat: o[1],
        html: text.slice(o.index, i + 1 < opens.length ? opens[i+1].index : text.length) }));
      if (opens.length) segs.unshift({ cat:'(uncat)', html: text.slice(0, opens[0].index) });
      else segs.push({ cat:'(uncat)', html: text });
      for (const seg of segs){
        if (seg.cat !== '(uncat)')
          report.noteCategories[seg.cat] = (report.noteCategories[seg.cat] || 0) + 1;
        const aRe = /<a class="scripture-ref" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let am; while ((am = aRe.exec(seg.html))){
          if (seg.cat === '(uncat)') report.uncategorizedAnchors++;
          const printed = cleanText(am[2]);
          for (const t of parseTargets(am[1])){
            if (seg.cat === 'cross-ref' && t.kind === 'ref'){
              refs.push({ sb:c.book, sc:c.ch, sv, m:marker, tb:t.tb, tc:t.tc, tv:t.tv, ext:t.ext, pr:printed });
              report.crossRefTargets++;
            } else if (seg.cat === 'tg' && t.kind === 'tg'){
              topics.push({ b:c.book, c:c.ch, v:sv, topic:t.topic });
              report.tgTags++;
            } else {
              const bucket = `${seg.cat}:${t.kind}`;
              report.targetBuckets[bucket] = (report.targetBuckets[bucket] || 0) + 1;
            }
          }
        }
      }
    }
    report.chaptersParsed++;
  }

  // ---------- validation ---------------------------------------------------
  const errs = [];
  const canonTotals = [0,0,0,0,0];
  const odIdx = BOOKS.findIndex(b => b.uri === 'dc-testament/od');
  BOOKS.forEach((bk, bi) => {
    const n = verseCounts[bi].reduce((a,x)=>a+x,0);
    if (bi !== odIdx) canonTotals[bk.canon] += n;
  });
  const odTotal = verseCounts[odIdx].reduce((a,x)=>a+x,0);
  CANON_VERSE_TOTALS.forEach((want, ci) => {
    if (canonTotals[ci] !== want) errs.push(`canon ${ci} verse total ${canonTotals[ci]} != ${want}`);
  });
  if (odTotal < OD_PARA_RANGE[0] || odTotal > OD_PARA_RANGE[1])
    errs.push(`OD paragraph total ${odTotal} outside ${OD_PARA_RANGE}`);
  for (const [uri, ch, want] of SPOT_CHECKS){
    const bi = BOOK_BY_URI.get(uri);
    const got = verseCounts[bi][ch-1];
    if (got !== want) errs.push(`${uri} ${ch}: ${got} verses != ${want}`);
  }
  for (const [uri, want] of Object.entries(PGP_BOOK_TOTALS)){
    const bi = BOOK_BY_URI.get(uri);
    const got = verseCounts[bi].reduce((a,x)=>a+x,0);
    if (got !== want) errs.push(`${uri} book total ${got} != ${want}`);
  }
  // per-chapter zero check
  verseCounts.forEach((vc, bi) => vc.forEach((n, ci) => {
    if (!n) errs.push(`${BOOKS[bi].uri} ${ci+1}: zero verses parsed`);
  }));

  const jl = rows => rows.map(r => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync(path.join(BUILD,'verses.jsonl'), jl(verses));
  fs.writeFileSync(path.join(BUILD,'refs.jsonl'), jl(refs));
  fs.writeFileSync(path.join(BUILD,'topics.jsonl'), jl(topics));
  fs.writeFileSync(path.join(BUILD,'chapters.jsonl'), jl(chapMeta));
  fs.writeFileSync(path.join(BUILD,'meta.json'), JSON.stringify({ verseCounts, canonTotals, odTotal, odMap }));
  fs.writeFileSync(path.join(BUILD,'parse-report.json'), JSON.stringify(report, null, 1));

  console.log(`verses ${verses.length} | cross-ref targets ${refs.length} | tg tags ${topics.length}`);
  console.log('note categories:', report.noteCategories);
  console.log('skipped buckets:', report.targetBuckets);
  if (errs.length){ console.error('VALIDATION FAILED:\n  ' + errs.join('\n  ')); process.exit(1); }
  console.log(`validation OK — chapters ${report.chaptersParsed}/${CHAPTER_TOTAL}, canon totals ${canonTotals.join(' ')}`+
              ` (+${odTotal} OD paragraphs)`);
}

main();
