// Render the whole film to an MP4: the score offline through WebAudio, the
// frames by headless Chromium (page screenshots, so the typeset equations
// are included), encoded with ffmpeg (libx264 + AAC).
//
//   node tools/render.mjs out.mp4 [--fps 30] [--workers 3] [--crf 20] [--from 0] [--to END]
//   node tools/render.mjs --audio-only out.wav [--from 0] [--to END]
//
// Needs Playwright and ffmpeg. Progress goes to stdout.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch {
  playwright = require(join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? Number(args[i + 1]) : d; };
const AUDIO_ONLY = args.includes('--audio-only');
const out = resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && args[i - 1] !== '--audio-only')) || 'worldline.mp4');
const FPS = opt('fps', 30), WORKERS = opt('workers', 3), CRF = opt('crf', 20), SR = 48000;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.css': 'text/css', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://localhost:${server.address().port}`;
const browser = await playwright.chromium.launch({ executablePath: process.env.CHROMIUM || undefined });

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${base}/index.html?still`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  return page;
}

const first = await openPage();
const DURATION = await first.evaluate(() => window.film.duration);
const FROM = opt('from', 0), TO = Math.min(opt('to', DURATION), DURATION);
const work = join(tmpdir(), `worldline-render-${process.pid}`);
await mkdir(work, { recursive: true });

// ─── the soundtrack ──────────────────────────────────────────────────────
// Rendered in chunks with a warm-up before each (so reverb tails and notes
// already ringing carry over) and a half-second crossfade between them.
async function renderAudio(page) {
  const CHUNK = 60, PRE = 6, XF = 0.5;
  const total = Math.ceil((TO - FROM) * SR);
  const mix = new Float32Array(total * 2);
  for (let s = FROM; s < TO; s += CHUNK) {
    const e = Math.min(s + CHUNK, TO);
    const a = Math.max(FROM, s - PRE), b = Math.min(TO, e + XF);
    const b64 = await page.evaluate(async ({ a, b, SR }) => {
      const { renderOffline } = await import('/src/score.js');
      const buf = await renderOffline(a, b, SR);
      const L = buf.getChannelData(0), R = buf.getChannelData(1);
      const pcm = new Int16Array(L.length * 2);
      for (let i = 0; i < L.length; i++) {
        pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767;
        pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
      }
      const bytes = new Uint8Array(pcm.buffer);
      let str = '';
      for (let i = 0; i < bytes.length; i += 0x8000) str += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return btoa(str);
    }, { a, b, SR });
    const pcm = new Int16Array(Buffer.from(b64, 'base64').buffer.slice(0));
    const i0 = Math.round((a - FROM) * SR);
    for (let j = 0; j < pcm.length / 2; j++) {
      const tt = a + j / SR;
      // weight: 0 before s − XF/2, ramps to 1 by s + XF/2, back down around e
      let w = 1;
      if (s > FROM) w = Math.min(w, Math.max(0, Math.min(1, (tt - (s - XF / 2)) / XF)));
      if (e < TO) w = Math.min(w, Math.max(0, Math.min(1, ((e + XF / 2) - tt) / XF)));
      if (w <= 0) continue;
      const k = i0 + j;
      if (k >= total) break;
      mix[2 * k] += (w * pcm[2 * j]) / 32767;
      mix[2 * k + 1] += (w * pcm[2 * j + 1]) / 32767;
    }
    console.log(`audio ${s.toFixed(0)}–${e.toFixed(0)} s`);
  }
  let peak = 0;
  for (let i = 0; i < mix.length; i++) peak = Math.max(peak, Math.abs(mix[i]));
  const data = Buffer.alloc(mix.length * 2);
  for (let i = 0; i < mix.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i])) * 32767), i * 2);
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8);
  hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
  console.log(`audio peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS`);
  return Buffer.concat([hdr, data]);
}

const wav = await renderAudio(first);
const wavPath = AUDIO_ONLY ? out : join(work, 'audio.wav');
await writeFile(wavPath, wav);
if (AUDIO_ONLY) { await browser.close(); server.close(); console.log('wrote', out); process.exit(0); }

// ─── the pictures ────────────────────────────────────────────────────────
const nFrames = Math.round((TO - FROM) * FPS);
const per = Math.ceil(nFrames / WORKERS);
const t0 = Date.now();
let done = 0;

async function renderSegment(k) {
  const page = k === 0 ? first : await openPage();
  const a = k * per, b = Math.min(nFrames, a + per);
  const file = join(work, `seg${k}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-tune', 'animation', '-pix_fmt', 'yuv420p', '-threads', '1', file],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  for (let f = a; f < b; f++) {
    await page.evaluate((T) => window.film.frame(T), FROM + f / FPS);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
    if (++done % 600 === 0) {
      const s = (Date.now() - t0) / 1000;
      console.log(`frames ${done}/${nFrames}  ${(done / s).toFixed(1)} fps  eta ${((nFrames - done) / (done / s) / 60).toFixed(1)} min`);
    }
  }
  ff.stdin.end();
  await closed;
  return file;
}

const segs = await Promise.all(Array.from({ length: WORKERS }, (_, k) => renderSegment(k)));
await writeFile(join(work, 'list.txt'), segs.map((f) => `file '${f}'`).join('\n'));
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${join(work, 'list.txt')}" -i "${wavPath}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${out}"`);
await browser.close();
server.close();
await rm(work, { recursive: true, force: true });
console.log(`wrote ${out} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
