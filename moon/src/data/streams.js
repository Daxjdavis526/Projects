/* =============================================================================
   STREAMS — real lunar data, fetched while you walk
   -----------------------------------------------------------------------------
   The vendored data resolves about 1.9 km per pixel everywhere and 2 m at
   Tranquility Base. NASA holds far more than that, and NASA Trek serves it with
   permissive CORS headers, so the game can ask for it directly from a static
   page with no server of its own:

     elevation  ArcGIS ImageServer exportImage, float32 GeoTIFF
                LOLA 256 ppd globally (118 m), the polar DEMs down to 5 m,
                and about fifty LROC NAC stereo models at 1.5 to 5 m
     imagery    WMTS tiles: the LROC WAC global mosaic at ~83 m, and the
                Apollo 11 site mosaic at 65 cm
     science    identify queries: USGS geologic units, Diviner temperatures,
                Kaguya mineral maps, GRAIL gravity, LOLA coverage

   Everything here degrades to nothing. If the network is gone, or the user
   turned streaming off, the game runs on the vendored data and the overlay says
   so; nothing waits on a request that may never come back.
   ========================================================================== */

import { STREAM, R_MOON } from '../config.js';
import { readGeoTiff } from './tiff.js';

export const TREK_ORIGIN = 'https://trek.nasa.gov';
const IMAGE_SERVER = '{origin}/moon/{server}/rest/services/{id}/ImageServer';
const WMTS = '{origin}/tiles/Moon/EQ/{id}/1.0.0/default/default028mm/{z}/{row}/{col}.{ext}';
const MAP_SERVER = '{origin}/moon/{server}/rest/services/{id}/MapServer';

export class Streams {
  /**
   * @param {object} registry  data/streams.json
   * @param {object} opts { enabled, cache, origin }
   */
  constructor(registry, opts = {}) {
    this.registry = registry;
    /* Everything is addressed off one origin so a test harness can route the
       requests through a local relay; in the game it is trek.nasa.gov. */
    this.origin = opts.origin || TREK_ORIGIN;
    this.enabled = opts.enabled !== false && STREAM.enabled;
    this.cache = opts.cache || null;
    this.inflight = new Map();
    this.queue = [];
    this.active = 0;
    this.failures = 0;
    this.lastError = null;
    this.stats = { elevation: 0, imagery: 0, science: 0, bytes: 0, failed: 0 };
  }

  /** A small promise pool so a burst of tiles cannot swamp the connection. */
  run(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.pump();
    });
  }

  pump() {
    while (this.active < STREAM.concurrency && this.queue.length) {
      const job = this.queue.shift();
      this.active++;
      job.fn().then(job.resolve, job.reject).finally(() => {
        this.active--;
        this.pump();
      });
    }
  }

  async fetchWithRetry(url, kind = 'blob') {
    let delay = STREAM.retryDelay;
    for (let attempt = 0; attempt <= STREAM.retries; attempt++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), STREAM.timeout);
        const res = await fetch(url, { signal: ctrl.signal, mode: 'cors' });
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (kind === 'json') return res.json();
        const buf = await res.arrayBuffer();
        this.stats.bytes += buf.byteLength;
        return buf;
      } catch (e) {
        this.lastError = e.message || String(e);
        if (attempt === STREAM.retries) {
          this.failures++;
          this.stats.failed++;
          throw e;
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  /* --- elevation --------------------------------------------------------- */

  /** Does a service's bounding box contain the whole requested patch? */
  static contains(bbox, area) {
    const [w, s, e, n] = bbox;
    if (area.latMin < s || area.latMax > n) return false;
    /* Longitudes are stored in [-180, 180]; a patch may be written either side
       of the seam, so try the whole-turn shifts before giving up. */
    for (const shift of [0, 360, -360]) {
      if (area.lonMin + shift >= w && area.lonMax + shift <= e) return true;
    }
    return false;
  }

  /**
   * Services that cover the whole patch, best first.
   *
   * Best is not simply finest. The registry's priority says how much of the
   * advertised box a service actually measured: the stereo site models (0) and
   * the LOLA grids (1) are solid, while the Apollo metric-camera mosaics (3)
   * claim a near-global box but only hold the photographed ground tracks. So
   * trust comes first and resolution breaks the tie, and the caller still works
   * down the list until one of them answers with data.
   */
  candidateElevation(area, limit = 3) {
    const list = this.registry.elevation.filter(s => Streams.contains(s.bbox, area));
    list.sort((a, b) => a.priority - b.priority || a.res_m - b.res_m);
    return list.slice(0, limit);
  }

  /**
   * Ask for a patch of measured elevation.
   *
   * @param {object} area { latMin, lonMin, latMax, lonMax }
   * @param {number} size pixels per side (the server resamples for us)
   * @returns {Promise<{data: Float32Array, width, height, res_m, source, id}|null>}
   */
  async elevation(area, size = 65) {
    if (!this.enabled) return null;
    const candidates = this.candidateElevation(area);
    if (!candidates.length) return null;
    for (const svc of candidates) {
      const r = await this.elevationFrom(svc, area, size);
      if (r && r.failed) return r;          // the network, not the coverage
      if (r && !r.empty) return r;
    }
    return { empty: true };
  }

  /** One request to one service. @returns {Promise<object>} */
  async elevationFrom(svc, area, size) {
    /* Never ask for more pixels than the service actually measured: resampling
       a 118 m dataset up to half a metre costs bytes and invents nothing. */
    const spanM = (area.latMax - area.latMin) * Math.PI / 180 * R_MOON;
    size = Math.max(33, Math.min(size, Math.ceil(spanM / svc.res_m) + 1));
    const res_m = Math.max(svc.res_m, spanM / (size - 1));
    const key = `dem:${svc.id}:${area.latMin.toFixed(5)},${area.lonMin.toFixed(5)},${area.latMax.toFixed(5)},${area.lonMax.toFixed(5)}:${size}`;
    if (this.inflight.has(key)) return this.inflight.get(key);

    const job = (async () => {
      let buf = this.cache ? await this.cache.get(key) : null;
      if (!buf) {
        const base = IMAGE_SERVER.replace('{origin}', this.origin)
          .replace('{server}', svc.server).replace('{id}', svc.id);
        const url = `${base}/exportImage?bbox=${area.lonMin},${area.latMin},${area.lonMax},${area.latMax}` +
          `&bboxSR=104903&imageSR=104903&size=${size},${size}&format=tiff&pixelType=F32` +
          `&interpolation=RSP_BilinearInterpolation&f=image`;
        buf = await this.run(() => this.fetchWithRetry(url));
        if (this.cache) this.cache.put(key, buf);
      }
      const img = readGeoTiff(buf);
      /* Five of the six LOLA polar services hand back the raw stored counts
         rather than metres: the PDS product's scaling factor of half a metre
         per count is never applied. Measured against the global grid over
         thousands of pixels at both poles it is exactly two, so Shackleton
         comes out two and a half kilometres too deep without this. The
         registry carries the factor and the measurement that established it. */
      const dnScale = svc.scale ?? 1;
      if (dnScale !== 1) {
        for (let i = 0; i < img.data.length; i++) img.data[i] *= dnScale;
      }
      /* The services return large negative values where they have no data. */
      let valid = 0;
      for (let i = 0; i < img.data.length; i++) {
        if (img.data[i] < -50000 || img.data[i] > 50000 || !Number.isFinite(img.data[i])) img.data[i] = NaN;
        else valid++;
      }
      if (valid < img.data.length * 0.5) return { empty: true, res_m, source: svc.source, id: svc.id };
      this.stats.elevation++;
      return { data: img.data, width: img.width, height: img.height,
               res_m, native_m: svc.res_m, source: svc.source, id: svc.id };
    })().catch((e) => ({ failed: true, error: e.message || String(e) }))
      .finally(() => this.inflight.delete(key));

    this.inflight.set(key, job);
    return job;
  }

  /* --- imagery ------------------------------------------------------------ */

  /** The finest imagery layer covering a point. */
  bestImagery(lat, lon) {
    let best = null;
    for (const s of this.registry.imagery) {
      const [w, so, e, n] = s.bbox;
      if (lat < so || lat > n || lon < w || lon > e) continue;
      if (!best || s.res_m < best.res_m) best = s;
    }
    return best;
  }

  /**
   * WMTS geometry: level z has 2^(z+1) columns and 2^z rows over the whole
   * sphere, with the top left corner at 180 W, 90 N.
   */
  static wmtsTile(z, lat, lon) {
    const cols = 2 ** (z + 1), rows = 2 ** z;
    const col = Math.min(cols - 1, Math.max(0, Math.floor((lon + 180) / 360 * cols)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor((90 - lat) / 180 * rows)));
    return { col, row, cols, rows };
  }

  static wmtsBounds(z, col, row) {
    const cols = 2 ** (z + 1), rows = 2 ** z;
    return {
      lonMin: -180 + col * 360 / cols, lonMax: -180 + (col + 1) * 360 / cols,
      latMax: 90 - row * 180 / rows, latMin: 90 - (row + 1) * 180 / rows,
    };
  }

  /** Metres per pixel of a 256 px WMTS tile at level z. */
  static wmtsRes(z) {
    return 2 * Math.PI * R_MOON / (2 ** (z + 1) * 256);
  }

  /**
   * Fetch one imagery tile as an ImageBitmap, plus the geographic rectangle it
   * covers so the shader can place it.
   */
  async imageryTile(lat, lon, wantRes) {
    if (!this.enabled || typeof createImageBitmap !== 'function') return null;
    const layer = this.bestImagery(lat, lon);
    if (!layer) return null;
    let z = 0;
    while (z < layer.maxLevel && Streams.wmtsRes(z) > wantRes) z++;
    const { col, row } = Streams.wmtsTile(z, lat, lon);
    const key = `img:${layer.id}:${z}:${row}:${col}`;
    if (this.inflight.has(key)) return this.inflight.get(key);

    const job = (async () => {
      let buf = this.cache ? await this.cache.get(key) : null;
      if (!buf) {
        const url = WMTS.replace('{origin}', this.origin).replace('{id}', layer.id).replace('{z}', z)
          .replace('{row}', row).replace('{col}', col).replace('{ext}', layer.ext);
        buf = await this.run(() => this.fetchWithRetry(url));
        if (this.cache) this.cache.put(key, buf);
      }
      const bitmap = await createImageBitmap(new Blob([buf]));
      this.stats.imagery++;
      return { bitmap, bounds: Streams.wmtsBounds(z, col, row), level: z, key,
               /* `atBest` says this layer has nothing finer here, so the caller
                  can stop asking for a sharper picture that does not exist. */
               atBest: z >= layer.maxLevel,
               res_m: Streams.wmtsRes(z), source: layer.source, id: layer.id };
    })().catch(() => null).finally(() => this.inflight.delete(key));

    this.inflight.set(key, job);
    return job;
  }

  /* --- science ------------------------------------------------------------ */

  /** One pixel value from an image service, e.g. a Diviner temperature. */
  async identifyImage(server, id, lat, lon) {
    if (!this.enabled) return null;
    const base = IMAGE_SERVER.replace('{origin}', this.origin)
      .replace('{server}', server).replace('{id}', id);
    const url = `${base}/identify?geometry=${lon},${lat}&geometryType=esriGeometryPoint&sr=104903&f=json`;
    try {
      const j = await this.run(() => this.fetchWithRetry(url, 'json'));
      const v = Number(j.value);
      return Number.isFinite(v) ? v : null;
    } catch { return null; }
  }

  /** The polygon under a point in a vector service, e.g. a geologic unit. */
  async identifyMap(server, id, lat, lon, layer = 'all') {
    if (!this.enabled) return null;
    const base = MAP_SERVER.replace('{origin}', this.origin)
      .replace('{server}', server).replace('{id}', id);
    const url = `${base}/identify?geometry=${lon},${lat}&geometryType=esriGeometryPoint&sr=104903` +
      `&layers=${layer}&tolerance=1&mapExtent=-180,-90,180,90&imageDisplay=3600,1800,96` +
      `&returnGeometry=false&f=json`;
    try {
      const j = await this.run(() => this.fetchWithRetry(url, 'json'));
      return (j.results && j.results[0] && j.results[0].attributes) || null;
    } catch { return null; }
  }

  /**
   * Everything the science overlay and the scanner want about one point.
   * Each field resolves independently, so a slow or missing service never holds
   * up the others.
   */
  async probe(lat, lon) {
    if (!this.enabled) return {};
    const s = this.registry.science;
    const [geology, tMax, tMin, feO, freeAir, count] = await Promise.all([
      this.identifyMap(s.geology.server, s.geology.map, lat, lon),
      this.identifyImage(s.diviner.server, s.diviner.max, lat, lon),
      this.identifyImage(s.diviner.server, s.diviner.min, lat, lon),
      this.identifyImage(s.minerals.server, s.minerals.FeO, lat, lon),
      this.identifyImage(s.gravity.server, s.gravity.freeair, lat, lon),
      this.identifyImage(s.lolacount.server, s.lolacount.id, lat, lon),
    ]);
    this.stats.science++;
    const f = s.geology.fields;
    return {
      geology: geology ? {
        unit: geology[f.unit], period: geology[f.period], name: geology[f.name],
        source: s.geology.source,
      } : null,
      temperature: (tMax !== null || tMin !== null)
        ? { max: tMax, min: tMin, source: s.diviner.source, res_deg: s.diviner.res_deg } : null,
      minerals: feO !== null ? { FeO: feO, source: s.minerals.source } : null,
      gravity: freeAir !== null ? { freeAir_mGal: freeAir, source: s.gravity.source } : null,
      lolaCount: count,
    };
  }

  /** A short description of the streaming state for the overlay. */
  status() {
    if (!this.enabled) return 'off';
    if (this.failures > 6) return 'unreachable';
    return `${this.stats.elevation} elevation, ${this.stats.imagery} imagery, ` +
           `${(this.stats.bytes / 1e6).toFixed(1)} MB`;
  }
}
