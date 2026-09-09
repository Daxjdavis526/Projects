/* =============================================================================
   TIFF — just enough GeoTIFF to read NASA's elevation
   -----------------------------------------------------------------------------
   NASA Trek's ArcGIS image services will hand you real float32 elevation
   through `exportImage?format=tiff&pixelType=F32`, which is the only way to get
   measured lunar topography into a browser at better than the ~2 km the
   vendored data carries. The response is an uncompressed, single-band,
   single-tile GeoTIFF, so a full decoder is not needed: walk the directory,
   find the strip or tile offsets, and read the samples.

   Also handles the classic (non-BigTIFF) header, LZW-free, predictor-free
   files that both Trek and the USGS S3 bucket serve.
   ========================================================================== */

const TAG = {
  WIDTH: 256, HEIGHT: 257, BITS: 258, COMPRESSION: 259, PHOTOMETRIC: 262,
  STRIP_OFFSETS: 273, SAMPLES: 277, ROWS_PER_STRIP: 278, STRIP_BYTES: 279,
  PLANAR: 284, PREDICTOR: 317, TILE_WIDTH: 322, TILE_HEIGHT: 323,
  TILE_OFFSETS: 324, TILE_BYTES: 325, SAMPLE_FORMAT: 339,
  PIXEL_SCALE: 33550, TIEPOINT: 33922, NODATA: 42113,
};

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 16: 8, 17: 8, 18: 8 };

/**
 * @param {ArrayBuffer} buffer
 * @returns {{width, height, data: Float32Array, noData: number|null,
 *            tiePoint: number[], pixelScale: number[]}}
 */
export function readGeoTiff(buffer) {
  const d = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const little = d[0] === 0x49 && d[1] === 0x49;
  const version = view.getUint16(2, little);
  const big = version === 43;

  let ifd, count, entrySize;
  if (big) {
    ifd = Number(view.getBigUint64(8, little));
    count = Number(view.getBigUint64(ifd, little));
    ifd += 8; entrySize = 20;
  } else {
    ifd = view.getUint32(4, little);
    count = view.getUint16(ifd, little);
    ifd += 2; entrySize = 12;
  }

  const tags = new Map();
  for (let i = 0; i < count; i++) {
    const p = ifd + i * entrySize;
    const tag = view.getUint16(p, little);
    const type = view.getUint16(p + 2, little);
    const n = big ? Number(view.getBigUint64(p + 4, little)) : view.getUint32(p + 4, little);
    const valueOffset = p + (big ? 12 : 8);
    const size = (TYPE_SIZE[type] || 1) * n;
    const inline = size <= (big ? 8 : 4);
    tags.set(tag, { type, n, size, offset: inline ? valueOffset
      : (big ? Number(view.getBigUint64(valueOffset, little)) : view.getUint32(valueOffset, little)) });
  }

  const read = (tag, index = 0) => {
    const t = tags.get(tag);
    if (!t) return undefined;
    const o = t.offset + index * (TYPE_SIZE[t.type] || 1);
    switch (t.type) {
      case 1: case 6: case 7: return d[o];
      case 2: return String.fromCharCode(d[o]);
      case 3: case 8: return view.getUint16(o, little);
      case 4: case 9: return view.getUint32(o, little);
      case 11: return view.getFloat32(o, little);
      case 12: return view.getFloat64(o, little);
      case 16: case 17: case 18: return Number(view.getBigUint64(o, little));
      default: return view.getUint32(o, little);
    }
  };
  const readAll = (tag) => {
    const t = tags.get(tag);
    if (!t) return [];
    const out = new Array(t.n);
    for (let i = 0; i < t.n; i++) out[i] = read(tag, i);
    return out;
  };
  const readString = (tag) => {
    const t = tags.get(tag);
    if (!t) return null;
    let s = '';
    for (let i = 0; i < t.n && d[t.offset + i]; i++) s += String.fromCharCode(d[t.offset + i]);
    return s;
  };

  const width = read(TAG.WIDTH), height = read(TAG.HEIGHT);
  const bits = read(TAG.BITS) ?? 32;
  const format = read(TAG.SAMPLE_FORMAT) ?? 1;   // 1 uint, 2 int, 3 float
  const compression = read(TAG.COMPRESSION) ?? 1;
  const samples = read(TAG.SAMPLES) ?? 1;
  if (compression !== 1) throw new Error('tiff: compression ' + compression + ' is not supported');
  if (samples !== 1) throw new Error('tiff: expected a single band, got ' + samples);

  const out = new Float32Array(width * height);
  const bytes = bits / 8;
  const readSample = (o) => {
    if (format === 3) return bits === 64 ? view.getFloat64(o, little) : view.getFloat32(o, little);
    if (format === 2) return bits === 16 ? view.getInt16(o, little) : view.getInt32(o, little);
    return bits === 16 ? view.getUint16(o, little) : view.getUint32(o, little);
  };

  if (tags.has(TAG.TILE_OFFSETS)) {
    const tw = read(TAG.TILE_WIDTH), th = read(TAG.TILE_HEIGHT);
    const offsets = readAll(TAG.TILE_OFFSETS);
    const across = Math.ceil(width / tw);
    for (let t = 0; t < offsets.length; t++) {
      const x0 = (t % across) * tw, y0 = Math.floor(t / across) * th;
      for (let y = 0; y < th; y++) {
        const gy = y0 + y;
        if (gy >= height) break;
        for (let x = 0; x < tw; x++) {
          const gx = x0 + x;
          if (gx >= width) continue;
          out[gy * width + gx] = readSample(offsets[t] + (y * tw + x) * bytes);
        }
      }
    }
  } else {
    const offsets = readAll(TAG.STRIP_OFFSETS);
    const rows = read(TAG.ROWS_PER_STRIP) ?? height;
    for (let s = 0; s < offsets.length; s++) {
      const y0 = s * rows;
      for (let y = 0; y < rows; y++) {
        const gy = y0 + y;
        if (gy >= height) break;
        for (let x = 0; x < width; x++) {
          out[gy * width + gx(x)] = readSample(offsets[s] + (y * width + x) * bytes);
        }
      }
    }
  }
  function gx(x) { return x; }

  const noDataStr = readString(TAG.NODATA);
  return {
    width, height, data: out,
    noData: noDataStr !== null && noDataStr !== '' ? Number(noDataStr) : null,
    pixelScale: readAll(TAG.PIXEL_SCALE),
    tiePoint: readAll(TAG.TIEPOINT),
  };
}
