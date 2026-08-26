// bundle.js — build the single-file offline copy.
//
// Inlines every file under data/ into a window.EMBED object placed ahead of
// the app's own scripts, so dist/scripture-universe.html opens by
// double-click with no server and no network. JSON goes in as parsed values;
// edges.bin goes in as base64 (the app decodes it with atob).
//
//   node bundle.js

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');

function walk(dir, base){
  const out = [];
  for (const f of fs.readdirSync(dir).sort()){
    const p = path.join(dir, f);
    const rel = base ? base + '/' + f : f;
    if (fs.statSync(p).isDirectory()) out.push(...walk(p, rel));
    else out.push([rel, p]);
  }
  return out;
}

function main(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = walk(DATA, '');
  const parts = [];
  let json = 0;
  for (const [rel, abs] of files){
    if (rel === 'edges.bin'){
      parts.push(`${JSON.stringify(rel)}:${JSON.stringify(fs.readFileSync(abs).toString('base64'))}`);
    } else if (rel.endsWith('.json')){
      // reserialize through JSON.parse so a malformed file fails here, loudly
      parts.push(`${JSON.stringify(rel)}:${JSON.stringify(JSON.parse(fs.readFileSync(abs, 'utf8')))}`);
      json++;
    } else {
      console.warn(`skipping unrecognized data file: ${rel}`);
    }
  }
  // any "</" in the data would close the script block early; "<\/" parses
  // identically inside a JS string literal
  const body = parts.join(',\n').replace(/<\//g, '<\\/');
  const embed = `<script>\nwindow.EMBED = {${body}};\n</script>\n`;

  const at = html.indexOf('<script>');
  if (at < 0) throw new Error('no <script> tag found in index.html');
  const out = html.slice(0, at) + embed + html.slice(at);

  fs.mkdirSync(DIST, { recursive: true });
  const dest = path.join(DIST, 'scripture-universe.html');
  fs.writeFileSync(dest, out);
  console.log(`dist/scripture-universe.html — ${(out.length/1048576).toFixed(1)} MB`+
              ` (${json} JSON files + edges.bin embedded)`);
}

main();
