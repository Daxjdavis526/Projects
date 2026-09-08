/* =============================================================================
   PNG16 — a 16-bit grayscale PNG decoder
   -----------------------------------------------------------------------------
   Elevation is stored as 16-bit PNG (value = metres + 32768). Browsers cannot
   give you those samples: drawing a PNG to a canvas truncates it to 8 bits, and
   8 bits of elevation over a 20 km range is a 78 m staircase.

   So the game decodes the file itself. The same ~120 lines run in the browser,
   in the terrain workers and in Node, which means the tests read exactly the
   bytes the renderer reads. Inflate comes from the platform
   (DecompressionStream, present in browsers and in Node 18+), so there is no
   dependency and still no build step.

   Only what the pipeline actually writes is supported: colour type 0
   (grayscale), bit depth 16, non-interlaced.
   ========================================================================== */

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

async function inflate(bytes) {
  const ds = new DecompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const chunks = [];
  let total = 0;
  for await (const c of streamIterator(stream)) { chunks.push(c); total += c.length; }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

/* Node's web streams are async-iterable; the browser's are not, everywhere. */
async function* streamIterator(stream) {
  if (typeof stream[Symbol.asyncIterator] === 'function') {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : (pb <= pc ? b : c);
}

/**
 * Decode a 16-bit grayscale PNG.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {Promise<{width:number, height:number, data:Uint16Array}>} big-endian
 *          samples in reading order (row 0 first).
 */
export async function decodePng16(buffer) {
  const d = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  for (let i = 0; i < 8; i++) {
    if (d[i] !== SIG[i]) throw new Error('not a PNG');
  }
  const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let p = 8, width = 0, height = 0, depth = 0, colour = 0, interlace = 0;
  const idat = [];
  while (p < d.length) {
    const len = view.getUint32(p);
    const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    const body = p + 8;
    if (type === 'IHDR') {
      width = view.getUint32(body);
      height = view.getUint32(body + 4);
      depth = d[body + 8]; colour = d[body + 9]; interlace = d[body + 12];
    } else if (type === 'IDAT') {
      idat.push(d.subarray(body, body + len));
    } else if (type === 'IEND') {
      break;
    }
    p = body + len + 4;
  }
  if (depth !== 16 || colour !== 0) {
    throw new Error(`png16: expected 16-bit grayscale, got depth ${depth} colour type ${colour}`);
  }
  if (interlace) throw new Error('png16: interlaced files are not supported');

  let z;
  if (idat.length === 1) {
    z = idat[0];
  } else {
    let n = 0;
    for (const c of idat) n += c.length;
    z = new Uint8Array(n);
    let o = 0;
    for (const c of idat) { z.set(c, o); o += c.length; }
  }
  const raw = await inflate(z);

  const bpp = 2;                       // bytes per pixel (one 16-bit channel)
  const stride = width * bpp;
  const out = new Uint16Array(width * height);
  const prev = new Uint8Array(stride);
  const line = new Uint8Array(stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    line.set(raw.subarray(src, src + stride));
    src += stride;
    switch (filter) {
      case 0: break;
      case 1:
        for (let i = bpp; i < stride; i++) line[i] = (line[i] + line[i - bpp]) & 0xff;
        break;
      case 2:
        for (let i = 0; i < stride; i++) line[i] = (line[i] + prev[i]) & 0xff;
        break;
      case 3:
        for (let i = 0; i < stride; i++) {
          const a = i >= bpp ? line[i - bpp] : 0;
          line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xff;
        }
        break;
      case 4:
        for (let i = 0; i < stride; i++) {
          const a = i >= bpp ? line[i - bpp] : 0;
          const c = i >= bpp ? prev[i - bpp] : 0;
          line[i] = (line[i] + paeth(a, prev[i], c)) & 0xff;
        }
        break;
      default:
        throw new Error('png16: bad filter ' + filter);
    }
    const row = y * width;
    for (let x = 0; x < width; x++) out[row + x] = (line[x * 2] << 8) | line[x * 2 + 1];
    prev.set(line);
  }
  return { width, height, data: out };
}

/**
 * Decode an elevation tile into metres above the datum.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @param {number} bias  the offset the pipeline added (32768)
 */
export async function decodeElevationPng(buffer, bias = 32768) {
  const { width, height, data } = await decodePng16(buffer);
  const m = new Float32Array(width * height);
  for (let i = 0; i < m.length; i++) m[i] = data[i] - bias;
  return { width, height, data: m };
}

/** Decode an 8-bit grayscale PNG (the measured mask, the geology unit raster). */
export async function decodePng8(buffer) {
  const d = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let p = 8, width = 0, height = 0, depth = 0, colour = 0;
  const idat = [];
  while (p < d.length) {
    const len = view.getUint32(p);
    const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    const body = p + 8;
    if (type === 'IHDR') {
      width = view.getUint32(body); height = view.getUint32(body + 4);
      depth = d[body + 8]; colour = d[body + 9];
    } else if (type === 'IDAT') idat.push(d.subarray(body, body + len));
    else if (type === 'IEND') break;
    p = body + len + 4;
  }
  if (depth !== 8 || colour !== 0) {
    throw new Error(`png8: expected 8-bit grayscale, got depth ${depth} colour type ${colour}`);
  }
  let n = 0;
  for (const c of idat) n += c.length;
  const z = new Uint8Array(n);
  let o = 0;
  for (const c of idat) { z.set(c, o); o += c.length; }
  const raw = await inflate(z);
  const out = new Uint8Array(width * height);
  const prev = new Uint8Array(width);
  const line = new Uint8Array(width);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    line.set(raw.subarray(src, src + width));
    src += width;
    switch (filter) {
      case 0: break;
      case 1: for (let i = 1; i < width; i++) line[i] = (line[i] + line[i - 1]) & 0xff; break;
      case 2: for (let i = 0; i < width; i++) line[i] = (line[i] + prev[i]) & 0xff; break;
      case 3: for (let i = 0; i < width; i++) line[i] = (line[i] + (((i ? line[i - 1] : 0) + prev[i]) >> 1)) & 0xff; break;
      case 4: for (let i = 0; i < width; i++) line[i] = (line[i] + paeth(i ? line[i - 1] : 0, prev[i], i ? prev[i - 1] : 0)) & 0xff; break;
      default: throw new Error('png8: bad filter ' + filter);
    }
    out.set(line, y * width);
    prev.set(line);
  }
  return { width, height, data: out };
}
