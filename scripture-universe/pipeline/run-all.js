// run-all.js — run every pipeline stage in order, stopping on the first
// failure. Each stage is also runnable standalone (node <stage>.js).

'use strict';
const { spawnSync } = require('child_process');
const stages = ['fetch.js','parse.js','match.js','classify.js','aggregate.js','pack.js','validate.js'];
for (const s of stages){
  console.log(`\n=== ${s} ===`);
  const r = spawnSync('node', [require('path').join(__dirname, s)], { stdio: 'inherit' });
  if (r.status !== 0){ console.error(`${s} failed (${r.status})`); process.exit(r.status || 1); }
}
console.log('\npipeline complete');
