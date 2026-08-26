// classify.js — stage 5: merge footnote refs, machine matches, and curated
// rows into one deduped, typed, confidence-rated edge list.
//
// Verse identity ("vid") everywhere downstream: (book<<20) | (chapter<<8) | verse,
// with book the GLOBAL 0–87 index and verse 0 meaning "the whole chapter".
//
// Confidence: 0 confirmed · 1 strong · 2 probable · 3 possible. Official
// footnotes and curated rows are confirmed (authoritative reference /
// unmistakable quotation); machine matches enter at their match.js tier and
// can never rise above strong.
//
// Emits build/edges.jsonl:
//   { a, z, mask, conf, prov, dirFrom, chLevel, cross, ext, w, ev }
// prov bits: 0 footnote-on-a · 1 footnote-on-z · 2 ngram · 3 curated · 4 topic-derived

'use strict';
const fs = require('fs');
const path = require('path');
const { BOOKS, TYPE_BIT } = require('./canon');
const { rows: curated, isPersonSlug } = require('./curated');

const BUILD = path.join(__dirname, 'build');
const vid = (b, c, v) => (b << 20) | (c << 8) | v;
const jread = f => fs.readFileSync(path.join(BUILD, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse);

function main(){
  const meta = JSON.parse(fs.readFileSync(path.join(BUILD, 'meta.json'), 'utf8'));
  const odIdx = BOOKS.findIndex(b => b.uri === 'dc-testament/od');
  const edges = new Map();   // "a_z" -> record (a < z always)
  const report = { odRefRemapped:0, odRefDropped:0, selfDropped:0, refs:0, matches:0, curated:0,
                   outOfRange:0, extentClamped:0,
                   derivedTopic:0, derivedPerson:0, derivedDoctrine:0 };
  // a target must land on a real verse (some footnotes point at appendix
  // paragraphs past the numbered verses, e.g. the excerpt note after JS—H 1:75)
  const vcOf = (b, c) => (meta.verseCounts[b] || [])[c-1] || 0;

  function get(va, vz){
    const a = Math.min(va, vz), z = Math.max(va, vz);
    if (a === z){ report.selfDropped++; return null; }
    const key = a + '_' + z;
    let e = edges.get(key);
    if (!e) edges.set(key, e = { a, z, mask:0, conf:9, prov:0, dirFrom:0, ext:0,
                                 notes:[], prints:[], q:null });
    return e;
  }

  // ---- official footnote cross-references ---------------------------------
  for (const r of jread('refs.jsonl')){
    let tv = r.tv, ext = r.ext;
    if (r.tb === odIdx && tv > 0){
      const mapped = meta.odMap[r.tc + ':' + tv];
      if (!mapped){ report.odRefDropped++; continue; }
      tv = mapped; report.odRefRemapped++;
    }
    const tcMax = (meta.verseCounts[r.tb] || []).length;
    if (r.tc < 1 || r.tc > tcMax || tv > vcOf(r.tb, r.tc)){ report.outOfRange++; continue; }
    if (tv > 0 && tv + ext > vcOf(r.tb, r.tc)){ ext = vcOf(r.tb, r.tc) - tv; report.extentClamped++; }
    r.ext = ext;
    const src = vid(r.sb, r.sc, r.sv), dst = vid(r.tb, r.tc, tv);
    const e = get(src, dst);
    if (!e) continue;
    e.mask |= 1 << TYPE_BIT.footnote;
    e.conf = Math.min(e.conf, 0);
    e.prov |= (src < dst) ? 1 : 2;            // which side carries the footnote
    e.ext = Math.max(e.ext, r.ext);
    if (r.ext > 0 && e.prints.length < 2) e.prints.push(r.pr);
    report.refs++;
  }

  // ---- machine-detected textual parallels ---------------------------------
  for (const m of jread('matches.jsonl')){
    const e = get(vid(m.a.b, m.a.c, m.a.v), vid(m.z.b, m.z.c, m.z.v));
    if (!e) continue;
    e.mask |= 1 << TYPE_BIT.parallel;
    if (m.eff < 15) e.mask |= 1 << TYPE_BIT.phrase;
    e.conf = Math.min(e.conf, Math.max(1, m.conf));   // never above strong
    e.prov |= 4;
    e.ext = Math.max(e.ext, Math.min(255, m.eff));
    if (!e.q) e.q = { t: m.q, eff: m.eff, raw: m.raw };
    report.matches++;
  }

  // ---- curated famous pairs -----------------------------------------------
  for (const r of curated){
    const src = vid(r.sb, r.sc, r.sv), dst = vid(r.tb, r.tc, r.tv);
    const e = get(src, dst);
    if (!e) continue;
    for (const b of r.bits) e.mask |= 1 << b;
    e.conf = 0;
    e.prov |= 8;
    e.ext = Math.max(e.ext, Math.max(r.extS || 0, r.extT || 0));
    if (r.dir) e.dirFrom = src;               // curated sources are the earlier text
    e.notes.push(r.note);
    report.curated++;
  }

  // ---- derived typing from shared Topical Guide topics --------------------
  const topicByVid = new Map();
  for (const t of jread('topics.jsonl')){
    const v = vid(t.b, t.c, t.v);
    let s = topicByVid.get(v);
    if (!s) topicByVid.set(v, s = new Set());
    s.add(t.topic);
  }
  for (const e of edges.values()){
    if (!(e.prov & 3)) continue;              // only decorate official footnote edges
    const sa = topicByVid.get(e.a), sz = topicByVid.get(e.z);
    if (!sa || !sz) continue;
    let shared = null, person = false;
    for (const t of sa) if (sz.has(t)){ shared = shared || t; if (isPersonSlug(t)) person = true; }
    if (!shared) continue;
    e.mask |= 1 << TYPE_BIT.topic;
    e.mask |= person ? (1 << TYPE_BIT.person) : (1 << TYPE_BIT.doctrine);
    e.prov |= 16;
    report.derivedTopic++;
    person ? report.derivedPerson++ : report.derivedDoctrine++;
  }

  // ---- finalize -----------------------------------------------------------
  const CONF_BONUS = [24, 16, 8, 0];
  const canonOf = b => BOOKS[b].canon;
  const out = [];
  for (const e of edges.values()){
    const provCount = ((e.prov & 3) ? 1 : 0) + ((e.prov >> 2) & 1) + ((e.prov >> 3) & 1);
    const w = Math.min(255, 36 * provCount + 3 * Math.min(e.ext, 60) + CONF_BONUS[e.conf]);
    const bA = e.a >> 20, bZ = e.z >> 20;
    const ev = (e.notes.length || e.q || e.prints.length)
      ? { x: e.notes, q: e.q, pr: e.prints } : null;
    out.push({ a: e.a, z: e.z, mask: e.mask, conf: e.conf, prov: e.prov,
               dirFrom: e.dirFrom, chLevel: (!(e.a & 255) || !(e.z & 255)) ? 1 : 0,
               cross: canonOf(bA) !== canonOf(bZ) ? 1 : 0,
               ext: Math.min(255, e.ext), w, ev });
  }
  out.sort((x, y) => x.a - y.a || x.z - y.z);
  fs.writeFileSync(path.join(BUILD, 'edges.jsonl'), out.map(r => JSON.stringify(r)).join('\n') + '\n');
  const withEv = out.filter(e => e.ev).length;
  report.edges = out.length; report.withEvidence = withEv;
  fs.writeFileSync(path.join(BUILD, 'classify-report.json'), JSON.stringify(report, null, 1));
  console.log(`edges ${out.length} (evidence-bearing ${withEv}) — footnote targets ${report.refs},`+
              ` matches ${report.matches}, curated ${report.curated}, topic-derived ${report.derivedTopic}`);
  if (withEv > 60000){ console.error('evidence count exceeds u16 budget'); process.exit(1); }
}

main();
