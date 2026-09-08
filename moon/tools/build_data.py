#!/usr/bin/env python3
"""Build the vendored data set under moon/data/ from the original NASA/USGS
products.

Sources are downloaded once into a cache directory outside the repository
(default: $SELENE_CACHE or /tmp/selene-moondata) and every raster is
normalised to one convention before it is written:

    column 0  = longitude -180 deg      row 0 = latitude +90 deg
    values    = metres above the 1737.4 km reference sphere (elevation)

Elevation is stored as 16-bit grayscale PNG with value = round(metres) + 32768,
because the browser cannot read 16-bit PNGs through <canvas> and the game
therefore ships its own decoder (src/terrain/png16.js) that runs identically in
Node and in the browser.

    python3 moon/tools/build_data.py            # build everything that is missing
    python3 moon/tools/build_data.py --force    # rebuild
    python3 moon/tools/build_data.py --check    # verify manifest + checks.json
"""
import argparse, gzip, io, json, math, os, struct, subprocess, sys, zipfile

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "..", "data"))
CACHE = os.environ.get("SELENE_CACHE", "/tmp/selene-moondata")

R_MOON = 1737400.0
DEM_BIAS = 32768          # PNG value = metres + DEM_BIAS
TILE = 360                # DEM tile size in pixels

SOURCES = {
    "ldem_16.img": "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img",
    "ldec_16.img": "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldec_16.img",
    "lroc_color_poles_8k.tif": "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_8k.tif",
    "earth_day.jpg": "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg",
    "earth_lights.jpg": "https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg",
    "earth_clouds.jpg": "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg",
    "bsc5.dat.gz": "http://tdc-www.harvard.edu/catalogs/bsc5.dat.gz",
    "ugm_raster.zip": "https://asc-astropedia.s3.us-west-2.amazonaws.com/Moon/Geology/Ancillary/unified_geologic_map_of_the_moon_raster.zip",
    "gggrx_1200a_anom_l180.img": "https://pds-geosciences.wustl.edu/grail/grail-l-lgrs-5-rdr-v1/grail_1001/rsdmap/gggrx_1200a_anom_l180.img",
    "NAC_DTM_APOLLO11.TIF": "https://pds.mcp.nasa.gov/data/store/img/lunar_reconnaissance_orbiter/pds4/lroc/lro-l-lroc-5-rdr/LROLRC_2001/DATA/SDP/NAC_DTM/APOLLO11/NAC_DTM_APOLLO11.TIF",
}
# SLDEM2015 tile 00N-30N / 000-045E, 512 ppd, float32 km: fetch only the rows
# covering 0..2 N as a byte range (row 0 of the tile is +30 N).
SLDEM_URL = "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/sldem2015/tiles/float_img/sldem2015_512_00n_30n_000_045_float.img"
SLDEM_PPD, SLDEM_COLS = 512, 23040
SLDEM_ROW0, SLDEM_ROWS = 28 * 512, 2 * 512   # rows for latitudes 2 N .. 0 N

APOLLO11 = (0.67415, 23.47314)   # Wagner et al. 2012, ME frame


def log(*a):
    print(*a, flush=True)


def fetch(name, url=None, byte_range=None):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    url = url or SOURCES[name]
    cmd = ["curl", "-sS", "-L", "--retry", "3", "-C", "-", "--max-time", "3600", "-o", path, url]
    if byte_range:
        cmd[2:2] = ["-r", byte_range]
    log(f"  downloading {name} ...")
    r = subprocess.run(cmd)
    if r.returncode != 0 or not os.path.exists(path):
        raise SystemExit(f"download failed: {url}")
    return path


# ---------------------------------------------------------------- PNG output
def write_png16(path, arr_metres):
    """16-bit grayscale PNG, value = metres + 32768 (clamped)."""
    v = np.clip(np.round(arr_metres) + DEM_BIAS, 0, 65535).astype(">u2")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(v.astype(np.uint16), mode="I;16").save(path, optimize=True)


def write_png8(path, arr, mode="L"):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr.astype(np.uint8), mode=mode).save(path, optimize=True)


# ---------------------------------------------------------------- LOLA
def load_lola16():
    """ldem_16.img: 5760x2880 int16 LSB, DN*0.5 = metres, longitude 0..360 with
    column 0 at 0 E, row 0 at +90. Returns metres in our convention
    (column 0 at -180 E)."""
    path = fetch("ldem_16.img")
    a = np.fromfile(path, dtype="<i2").reshape(2880, 5760).astype(np.float32) * 0.5
    return np.roll(a, 5760 // 2, axis=1)


def load_ldec16():
    path = fetch("ldec_16.img")
    a = np.fromfile(path, dtype="<i2").reshape(2880, 5760)
    return np.roll(a, 5760 // 2, axis=1)


def build_dem_pyramid(dem, force):
    """z=0: 2 ppd (720x360, 2x1 tiles) ... z=3: 16 ppd (5760x2880, 16x8 tiles)."""
    layers = []
    for z in range(4):
        ppd = 2 << z
        w, h = 360 * ppd, 180 * ppd
        nx, ny = w // TILE, h // TILE
        if (w, h) == dem.shape[::-1]:
            level = dem
        else:
            f = dem.shape[1] // w
            level = dem.reshape(h, f, w, f).mean(axis=(1, 3))
        for ty in range(ny):
            for tx in range(nx):
                p = os.path.join(DATA, "dem", "lola16", str(z), f"{tx}_{ty}.png")
                if force or not os.path.exists(p):
                    write_png16(p, level[ty * TILE:(ty + 1) * TILE, tx * TILE:(tx + 1) * TILE])
        layers.append({"id": f"lola{ppd}", "z": z, "ppd": ppd, "w": w, "h": h, "tile": TILE,
                       "nx": nx, "ny": ny, "path": f"dem/lola16/{z}/{{x}}_{{y}}.png",
                       "bbox": [-180, -90, 180, 90], "res_m": round(math.pi * R_MOON / (180 * ppd), 2),
                       "priority": 1, "kind": "pyramid",
                       "source": "LRO LOLA LDEM 16 ppd (PDS lrolol_1xxx, V3.1) downsampled" if z < 3
                                 else "LRO LOLA LDEM 16 ppd (PDS lrolol_1xxx, V3.1)"})
        log(f"  dem z={z} {ppd} ppd {w}x{h} -> {nx*ny} tiles")
    return layers


def build_measured_mask(force):
    """1 = LOLA actually measured this 16 ppd pixel, 0 = interpolated."""
    p = os.path.join(DATA, "dem", "ldec16.png")
    counts = load_ldec16()
    if force or not os.path.exists(p):
        write_png8(p, (counts > 0).astype(np.uint8) * 255)
    frac = float((counts > 0).mean())
    log(f"  measured mask: {frac*100:.1f}% of 16 ppd pixels have LOLA returns")
    return {"id": "ldec16", "path": "dem/ldec16.png", "ppd": 16, "w": 5760, "h": 2880,
            "measured_fraction": round(frac, 4),
            "source": "LRO LOLA LDEC 16 ppd observation counts (0 = interpolated)"}


# ---------------------------------------------------------------- Apollo 11 windows
def read_geotiff_float(path):
    """Minimal GeoTIFF reader for the uncompressed float32 strips/tiles the
    LROC NAC DTM uses. Returns (array, tiepoint, pixel_scale)."""
    d = open(path, "rb").read()
    E = "<" if d[:2] == b"II" else ">"
    big = struct.unpack(E + "H", d[2:4])[0] == 43
    if big:
        off = struct.unpack(E + "Q", d[8:16])[0]
        n = struct.unpack(E + "Q", d[off:off + 8])[0]
        entries, esz, hdr = off + 8, 20, "HHQQ"
    else:
        off = struct.unpack(E + "I", d[4:8])[0]
        n = struct.unpack(E + "H", d[off:off + 2])[0]
        entries, esz, hdr = off + 2, 12, "HHII"
    tags = {}
    for i in range(n):
        t, typ, cnt, val = struct.unpack(E + hdr, d[entries + i * esz:entries + (i + 1) * esz])
        tags[t] = (typ, cnt, val)

    def arr(tag, fmt, size):
        typ, cnt, val = tag
        if cnt * size <= (8 if big else 4):
            return list(struct.unpack(E + fmt * cnt, struct.pack(E + ("Q" if big else "I"), val)[:cnt * size]))
        return list(struct.unpack(E + fmt * cnt, d[val:val + cnt * size]))

    w, h = tags[256][2], tags[257][2]
    doubles = lambda t: arr(tags[t], "d", 8)
    scale = doubles(33550) if 33550 in tags else [1, 1, 0]
    tie = doubles(33922) if 33922 in tags else [0, 0, 0, 0, 0, 0]
    if 324 in tags:   # tiled
        tw, th = tags[322][2], tags[323][2]
        offs = arr(tags[324], "Q" if big else "I", 8 if big else 4)
        cnts = arr(tags[325], "Q" if big else "I", 8 if big else 4)
        out = np.zeros((h, w), np.float32)
        across = (w + tw - 1) // tw
        for i, (o, c) in enumerate(zip(offs, cnts)):
            t = np.frombuffer(d[o:o + c], dtype=E + "f4").reshape(th, tw)
            y0, x0 = (i // across) * th, (i % across) * tw
            out[y0:y0 + min(th, h - y0), x0:x0 + min(tw, w - x0)] = t[:h - y0, :w - x0]
    else:
        offs = arr(tags[273], "Q" if big else "I", 8 if big else 4)
        cnts = arr(tags[279], "Q" if big else "I", 8 if big else 4)
        rows = tags[278][2] if 278 in tags else h
        out = np.zeros((h, w), np.float32)
        for i, (o, c) in enumerate(zip(offs, cnts)):
            s = np.frombuffer(d[o:o + c], dtype=E + "f4")
            y0 = i * rows
            out[y0:y0 + min(rows, h - y0)] = s.reshape(-1, w)[:h - y0]
    return out, tie, scale


def build_apollo11_nac(force):
    """Crop the 2 m/px NAC DTM to a window around the LM."""
    p = os.path.join(DATA, "dem", "apollo11_nac2m.png")
    meta_path = os.path.join(DATA, "dem", "apollo11_nac2m.json")
    if not force and os.path.exists(p) and os.path.exists(meta_path):
        return json.load(open(meta_path))
    src = fetch("NAC_DTM_APOLLO11.TIF")
    log("  reading NAC_DTM_APOLLO11.TIF (118 MB) ...")
    a, tie, scale = read_geotiff_float(src)
    # Equirectangular metres on the 1737.4 km sphere. The PDS label gives
    # CENTER_LONGITUDE = 180, so projected x is measured from 180 E, not 0.
    CENTER_LON = 180.0
    mx, my = scale[0], scale[1]
    x0, y0 = tie[3], tie[4]
    lat0, lon0 = APOLLO11
    lon2x = lambda lon: math.radians(lon - CENTER_LON) * R_MOON
    x2lon = lambda x: math.degrees(x / R_MOON) + CENTER_LON
    cx, cy = lon2x(lon0), math.radians(lat0) * R_MOON
    half = 1600.0                      # metres each way -> 3.2 km window
    i0 = int((cx - half - x0) / mx); i1 = int((cx + half - x0) / mx)
    j0 = int((y0 - (cy + half)) / my); j1 = int((y0 - (cy - half)) / my)
    i0, i1 = max(0, i0), min(a.shape[1], i1)
    j0, j1 = max(0, j0), min(a.shape[0], j1)
    win = a[j0:j1, i0:i1]
    ok = np.isfinite(win) & (win > -1e5) & (win < 1e5)
    if not ok.any():
        raise SystemExit("Apollo 11 NAC window is empty - check the tiepoint math")
    win = np.where(ok, win, win[ok].mean())              # nodata is -3.4e38
    log(f"  NAC window valid pixels: {100*ok.mean():.1f}%")
    west, east = x2lon(x0 + i0 * mx), x2lon(x0 + i1 * mx)
    north = math.degrees((y0 - j0 * my) / R_MOON)
    south = math.degrees((y0 - j1 * my) / R_MOON)
    write_png16(p, win)
    meta = {"id": "apollo11_nac", "path": "dem/apollo11_nac2m.png", "w": win.shape[1], "h": win.shape[0],
            "bbox": [round(west, 6), round(south, 6), round(east, 6), round(north, 6)],
            "res_m": round(mx, 3), "priority": 0, "kind": "window",
            "min_m": round(float(win.min()), 1), "max_m": round(float(win.max()), 1),
            "source": "LROC NAC DTM NAC_DTM_APOLLO11 v1.9, 2 m/px (stereo pair M150361817/M150368601)"}
    json.dump(meta, open(meta_path, "w"), indent=1)
    log(f"  apollo11 NAC window {win.shape[1]}x{win.shape[0]} px, {meta['min_m']}..{meta['max_m']} m")
    return meta


def build_apollo11_sldem(force):
    """SLDEM2015 512 ppd window around Tranquility Base, via a byte range."""
    p = os.path.join(DATA, "dem", "apollo11_sldem.png")
    meta_path = os.path.join(DATA, "dem", "apollo11_sldem.json")
    if not force and os.path.exists(p) and os.path.exists(meta_path):
        return json.load(open(meta_path))
    b0 = SLDEM_ROW0 * SLDEM_COLS * 4
    b1 = (SLDEM_ROW0 + SLDEM_ROWS) * SLDEM_COLS * 4 - 1
    src = fetch("sldem_rows.f32", SLDEM_URL, byte_range=f"{b0}-{b1}")
    a = np.fromfile(src, dtype="<f4").reshape(SLDEM_ROWS, SLDEM_COLS) * 1000.0   # km -> m
    # tile covers 0..45 E, rows here are 2 N .. 0 N; crop 22.5..24.5 E
    c0 = int(22.5 * SLDEM_PPD); c1 = int(24.5 * SLDEM_PPD)
    win = a[:, c0:c1]
    write_png16(p, win)
    meta = {"id": "apollo11_sldem", "path": "dem/apollo11_sldem.png", "w": win.shape[1], "h": win.shape[0],
            "bbox": [22.5, 0.0, 24.5, 2.0], "res_m": round(math.pi * R_MOON / (180 * SLDEM_PPD), 3),
            "priority": 0, "kind": "window",
            "min_m": round(float(win.min()), 1), "max_m": round(float(win.max()), 1),
            "source": "SLDEM2015 (LOLA + Kaguya TC) 512 ppd, PDS tile 00N-30N/000-045"}
    json.dump(meta, open(meta_path, "w"), indent=1)
    log(f"  apollo11 SLDEM window {win.shape[1]}x{win.shape[0]} px, {meta['min_m']}..{meta['max_m']} m")
    return meta


# ---------------------------------------------------------------- colour, earth, stars
def build_colour(force):
    out = []
    src = None
    for w in (8192, 4096, 1024):
        p = os.path.join(DATA, "color", f"moon_{w}.jpg")
        if force or not os.path.exists(p):
            if src is None:
                log("  reading lroc_color_poles_8k.tif (50 MB) ...")
                src = Image.open(fetch("lroc_color_poles_8k.tif")).convert("RGB")
            img = src if src.width == w else src.resize((w, w // 2), Image.LANCZOS)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            img.save(p, quality=88, optimize=True, progressive=True)
        out.append({"w": w, "path": f"color/moon_{w}.jpg"})
        log(f"  colour {w} -> {os.path.getsize(p)/1e6:.1f} MB")
    return {"tiers": out, "bbox": [-180, -90, 180, 90],
            "source": "NASA SVS CGI Moon Kit, LROC WAC colour (lroc_color_poles_8k.tif)"}


def build_earth(force):
    spec = [("earth_day.jpg", "earth/day_4k.jpg", 4096, 88),
            ("earth_lights.jpg", "earth/night_2k.jpg", 2048, 82),
            ("earth_clouds.jpg", "earth/clouds_2k.jpg", 2048, 82)]
    out = {}
    for name, rel, w, q in spec:
        p = os.path.join(DATA, rel)
        if force or not os.path.exists(p):
            img = Image.open(fetch(name)).convert("RGB").resize((w, w // 2), Image.LANCZOS)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            img.save(p, quality=q, optimize=True, progressive=True)
        out[rel.split("/")[1].split("_")[0]] = rel
        log(f"  earth {rel} -> {os.path.getsize(p)/1e6:.2f} MB")
    out["source"] = "NASA Earth Observatory Blue Marble (Dec 2004), Earth at Night, cloud composite"
    return out


def build_stars(force):
    """Yale Bright Star Catalogue 5 -> float32 (ra_rad, dec_rad, mag, b_v)."""
    p = os.path.join(DATA, "stars.bin")
    if not force and os.path.exists(p):
        return {"path": "stars.bin", "count": os.path.getsize(p) // 16,
                "fields": ["ra_rad", "dec_rad", "vmag", "b_v"],
                "source": "Yale Bright Star Catalogue, 5th revised ed. (Hoffleit & Warren)"}
    raw = gzip.open(fetch("bsc5.dat.gz"), "rb").read().decode("latin-1")
    rows = []
    for line in raw.splitlines():
        if len(line) < 110:
            continue
        try:
            rah, ram, ras = float(line[75:77]), float(line[77:79]), float(line[79:83])
            sign = -1.0 if line[83] == "-" else 1.0
            dd, dm, ds = float(line[84:86]), float(line[86:88]), float(line[88:90])
            vmag = float(line[102:107])
        except ValueError:
            continue
        try:
            bv = float(line[109:114])
        except ValueError:
            bv = 0.0
        ra = math.radians((rah + ram / 60 + ras / 3600) * 15.0)
        dec = math.radians(sign * (dd + dm / 60 + ds / 3600))
        rows.append((ra, dec, vmag, bv))
    a = np.array(rows, dtype="<f4")
    a.tofile(p)
    log(f"  stars: {len(rows)} from BSC5, brightest V={a[:,2].min():.2f}")
    return {"path": "stars.bin", "count": len(rows), "fields": ["ra_rad", "dec_rad", "vmag", "b_v"],
            "source": "Yale Bright Star Catalogue, 5th revised ed. (Hoffleit & Warren)"}


# ---------------------------------------------------------------- geology, gravity
GEOL_PPD = 8


def build_geology(force):
    """The 'numerical' raster of the USGS Unified Geologic Map: pixel value is
    a DN that indexes the unit table (code, name, age, colour). Downsampled by
    nearest neighbour, because averaging categorical data is meaningless."""
    png = os.path.join(DATA, "geology8.png")
    leg = os.path.join(DATA, "geology.json")
    meta = {"path": "geology8.png", "legend": "geology.json", "ppd": GEOL_PPD,
            "w": 360 * GEOL_PPD, "h": 180 * GEOL_PPD, "bbox": [-180, -90, 180, 90],
            "source": "USGS Unified Geologic Map of the Moon 1:5M (Fortezzo, Spudis & Harrel 2020), numerical raster"}
    if not force and os.path.exists(png) and os.path.exists(leg):
        return meta
    z = zipfile.ZipFile(fetch("ugm_raster.zip"))
    base = "Unified_Geologic_Map_of_the_Moon_RASTER/numerical_versions/"
    tif = base + "Unified_Geologic_Map_of_the_Moon_64ppd.tif"
    csv = base + "Dn_GeologicUnit_RGBcolor.csv"
    arr = np.array(Image.open(io.BytesIO(z.read(tif))))
    if arr.ndim == 3:
        arr = arr[..., 0]
    h, w = arr.shape
    ty, tx = 180 * GEOL_PPD, 360 * GEOL_PPD
    yi = (np.arange(ty) * h // ty).clip(0, h - 1)
    xi = (np.arange(tx) * w // tx).clip(0, w - 1)
    small = arr[np.ix_(yi, xi)].astype(np.uint8)
    write_png8(png, small)

    units, rows = {}, z.read(csv).decode("latin-1").splitlines()
    import csv as csvmod
    for r in csvmod.DictReader(rows):
        try:
            dn = int(r["DN"])
        except (KeyError, ValueError):
            continue
        units[dn] = {"code": r["Unit"], "name": r["Unit_Name"], "age": r["Unit_Age"],
                     "rgb": [int(r["Red"]), int(r["Green"]), int(r["Blue"])]}
    present = sorted(int(v) for v in np.unique(small))
    json.dump({"note": "pixel value is the USGS DN; 0 means no unit mapped. Exact unit at a point is confirmed live via the Trek MapServer identify endpoint.",
               "units": {str(k): v for k, v in sorted(units.items())},
               "present_dn": present}, open(leg, "w"), indent=1)
    a11 = small[int((90 - APOLLO11[0]) * GEOL_PPD), int((APOLLO11[1] + 180) * GEOL_PPD)]
    log(f"  geology {GEOL_PPD} ppd: {len(present)} units present, {len(units)} in legend; "
        f"Apollo 11 DN {a11} = {units.get(int(a11), {}).get('code', '?')} "
        f"{units.get(int(a11), {}).get('name', '')}")
    return meta


def build_gravity(force):
    p = os.path.join(DATA, "grail4.png")
    if not force and os.path.exists(p):
        return {"path": "grail4.png", "ppd": 4, "w": 1440, "h": 720, "unit": "mGal", "bias": DEM_BIAS,
                "source": "GRAIL GRGM1200A free-air anomaly to degree 180 (PDS gggrx_1200a_anom_l180)"}
    a = np.fromfile(fetch("gggrx_1200a_anom_l180.img"), dtype="<f4").reshape(2880, 5760)
    a = np.roll(a, 5760 // 2, axis=1)                    # 0..360 -> -180..180
    small = a.reshape(720, 4, 1440, 4).mean(axis=(1, 3))
    write_png16(p, small)                                 # value = mGal + 32768
    log(f"  gravity 4 ppd: {small.min():.0f} .. {small.max():.0f} mGal")
    return {"path": "grail4.png", "ppd": 4, "w": 1440, "h": 720, "unit": "mGal", "bias": DEM_BIAS,
            "min": round(float(small.min()), 1), "max": round(float(small.max()), 1),
            "source": "GRAIL GRGM1200A free-air anomaly to degree 180 (PDS gggrx_1200a_anom_l180)"}


# ---------------------------------------------------------------- checks
def sample_dem(dem, lat, lon):
    """Bilinear sample of the 16 ppd array in our convention."""
    x = (lon + 180.0) * 16.0 - 0.5
    y = (90.0 - lat) * 16.0 - 0.5
    x0, y0 = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - x0, y - y0
    h, w = dem.shape
    g = lambda j, i: float(dem[min(max(j, 0), h - 1), i % w])
    return ((g(y0, x0) * (1 - fx) + g(y0, x0 + 1) * fx) * (1 - fy) +
            (g(y0 + 1, x0) * (1 - fx) + g(y0 + 1, x0 + 1) * fx) * fy)


def build_checks(dem, force):
    pts = {
        "apollo11": (APOLLO11[0], APOLLO11[1]),
        "apollo15": (26.13237, 3.63330),
        "apollo17": (20.19108, 30.77220),
        "tycho_centre": (-43.31014, -11.36192),
        "copernicus_centre": (9.62095, -20.07862),
        "imbrium": (34.72, -14.91),
        "orientale": (-19.87, -94.67),
        "farside_highlands": (-10.0, 165.0),
        "south_pole": (-89.9, 0.0),
        "north_pole": (89.9, 0.0),
    }
    checks = {"note": "elevations in metres above the 1737.4 km sphere, bilinear from the vendored 16 ppd LOLA layer",
              "global_min_m": round(float(dem.min()), 1), "global_max_m": round(float(dem.max()), 1),
              "points": {k: round(sample_dem(dem, *v), 1) for k, v in pts.items()},
              "coords": {k: list(v) for k, v in pts.items()}}
    json.dump(checks, open(os.path.join(DATA, "checks.json"), "w"), indent=1)
    log("  checks: " + ", ".join(f"{k}={v} m" for k, v in list(checks["points"].items())[:4]))
    log(f"  global range {checks['global_min_m']} .. {checks['global_max_m']} m")
    return checks


def do_check():
    man = json.load(open(os.path.join(DATA, "manifest.json")))
    checks = json.load(open(os.path.join(DATA, "checks.json")))
    bad = 0
    for layer in man["dem"]["layers"]:
        for ty in range(layer["ny"]):
            for tx in range(layer["nx"]):
                p = os.path.join(DATA, layer["path"].replace("{x}", str(tx)).replace("{y}", str(ty)))
                if not os.path.exists(p):
                    print("MISSING", p); bad += 1
    for key in ("measured", "colour", "earth", "stars", "geology", "gravity"):
        if key not in man:
            print("manifest missing", key); bad += 1
    a11 = checks["points"]["apollo11"]
    if not (-2000 < a11 < -1800):
        print(f"Apollo 11 elevation {a11} m outside the expected -1900 +/- 100 m"); bad += 1
    for name in ("apollo11_nac", "apollo11_sldem"):
        w = next((x for x in man["dem"]["windows"] if x["id"] == name), None)
        if not w or not os.path.exists(os.path.join(DATA, w["path"])):
            print("missing window", name); bad += 1
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(DATA) for f in fs)
    print(f"data/ = {total/1e6:.1f} MB")
    print("CHECK OK" if bad == 0 else f"CHECK FAILED ({bad} problems)")
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if args.check:
        sys.exit(do_check())

    os.makedirs(DATA, exist_ok=True)
    log("LOLA 16 ppd ...")
    dem = load_lola16()
    layers = build_dem_pyramid(dem, args.force)
    measured = build_measured_mask(args.force)
    log("Apollo 11 windows ...")
    windows = [build_apollo11_nac(args.force), build_apollo11_sldem(args.force)]
    log("colour ...")
    colour = build_colour(args.force)
    log("earth ...")
    earth = build_earth(args.force)
    log("stars ...")
    stars = build_stars(args.force)
    log("geology ...")
    geology = build_geology(args.force)
    log("gravity ...")
    gravity = build_gravity(args.force)
    log("checks ...")
    checks = build_checks(dem, args.force)

    manifest = {
        "generated_by": "moon/tools/build_data.py",
        "frame": "Mean Earth/Polar Axis (ME) of DE421, planetocentric latitude, longitude positive east",
        "datum": {"reference_radius_m": R_MOON, "note": "elevation = radius - reference_radius_m"},
        "convention": {"lon0_deg": -180, "lat0_deg": 90, "png16_bias_m": DEM_BIAS,
                       "note": "16-bit PNG value = round(metres) + bias; column 0 is -180 E, row 0 is +90 N"},
        "dem": {"layers": layers, "windows": windows},
        "measured": measured, "colour": colour, "earth": earth, "stars": stars,
        "geology": geology, "gravity": gravity,
        "checks": {"global_min_m": checks["global_min_m"], "global_max_m": checks["global_max_m"]},
    }
    json.dump(manifest, open(os.path.join(DATA, "manifest.json"), "w"), indent=1)
    log("wrote manifest.json")
    do_check()


if __name__ == "__main__":
    main()
