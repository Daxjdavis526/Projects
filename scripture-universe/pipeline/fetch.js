// fetch.js — stage 1: pull every chapter of the five standard works from the
// Gospel Library content API into pipeline/cache/, one JSON file per chapter.
//
// Polite by design: sequential, 350 ms between requests (~10 min for the full
// 1,584), three retries with exponential backoff, and fully resumable — a file
// that exists and parses with a content.body is never fetched again, so a
// crashed run just picks up where it left off and a completed run is a no-op.
//
//   node fetch.js            full run
//   node fetch.js --probe    six representative chapters only

'use strict';
const fs = require('fs');
const path = require('path');
const { API, chapterList, CHAPTER_TOTAL } = require('./canon');

const CACHE = path.join(__dirname, 'cache');
const THROTTLE_MS = 350;
const RETRIES = [2000, 8000, 30000];
const UA = 'scripture-universe-pipeline (personal research project)';

const PROBE = new Set(['00-gen-1','39-matt-24','66-1-ne-1','81-dc-76','82-od-1','86-js-h-1']);

const sleep = ms => new Promise(r => setTimeout(r, ms));

function cached(file){
  try {
    const d = JSON.parse(fs.readFileSync(file, 'utf8'));
    return !!(d && d.content && d.content.body);
  } catch { return false; }
}

async function fetchOne(uri, file){
  for (let a = 0; a <= RETRIES.length; a++){
    try {
      const res = await fetch(API + encodeURIComponent(uri).replace(/%2F/g,'/'), {
        headers: { 'user-agent': UA, 'accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (!d || !d.content || !d.content.body) throw new Error('no content.body');
      fs.writeFileSync(file, JSON.stringify(d));
      return true;
    } catch (e){
      if (a === RETRIES.length){ console.error(`FAIL ${uri}: ${e.message}`); return false; }
      await sleep(RETRIES[a]);
    }
  }
}

(async () => {
  fs.mkdirSync(CACHE, { recursive: true });
  const probe = process.argv.includes('--probe');
  let list = chapterList();
  if (list.length !== CHAPTER_TOTAL) throw new Error(`chapter list ${list.length} != ${CHAPTER_TOTAL}`);
  if (probe) list = list.filter(c => PROBE.has(c.cacheName.replace(/\.json$/,'')));

  let hit = 0, got = 0, fail = 0;
  const t0 = Date.now();
  for (const c of list){
    const file = path.join(CACHE, c.cacheName);
    if (cached(file)){ hit++; continue; }
    (await fetchOne(c.uri, file)) ? got++ : fail++;
    await sleep(THROTTLE_MS);
    const done = hit + got + fail;
    if (done % 100 === 0)
      console.log(`  ${done}/${list.length}  (cached ${hit}, fetched ${got}, failed ${fail})  ${((Date.now()-t0)/60000).toFixed(1)} min`);
  }
  console.log(`done: ${list.length} chapters — cached ${hit}, fetched ${got}, failed ${fail}`);
  fs.writeFileSync(path.join(CACHE, '_fetch-log.json'), JSON.stringify({
    date: new Date().toISOString(), total: list.length, cachedBefore: hit, fetched: got, failed: fail }, null, 1));
  if (fail) process.exit(1);
})();
